"""v1.9.0: Self-diagnostics — сборщик отчёта о работе проекта для разработчиков.

Собирает:
- project: git sha/branch, LOC, files, tests
- tests: покрытие из .coverage, последние failed из .pytest_cache
- runtime: 24h audit — total requests, errors 5xx, топ-5 медленных endpoints
- security: blocklist / rate_limiter / watchdog
- housekeeping: last_run, freed_mb, deleted
- health: engine, output, ffmpeg, voices
- deps: python/fastapi/pytest versions
- hygiene: TODO/FIXME count, битые refs

Не светит: токены, .env.local, пути к моделям, IP клиентов.
"""

from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import sys
import time
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
AUDIT_LOG = ROOT / "logs" / "audit.log"
COVERAGE_FILE = ROOT / ".coverage"
PYTEST_FAILED = ROOT / ".pytest_cache" / "v" / "cache" / "lastfailed"

_DIAG_VERSION = "1.9.0"


# ============================================================
# 1. PROJECT
# ============================================================
def _git(args: list[str], timeout: float = 2.0) -> str | None:
    try:
        out = subprocess.run(
            ["git", *args],
            cwd=ROOT,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        return out.stdout.strip() if out.returncode == 0 else None
    except Exception:
        return None


def _project_metrics() -> dict:
    py_files = [p for p in (ROOT / "backend").rglob("*.py") if "__pycache__" not in p.parts]
    loc = 0
    for p in py_files:
        try:
            loc += sum(1 for _ in p.open("rb"))
        except Exception:
            pass

    fe_files = [
        p
        for p in (ROOT / "frontend").rglob("*")
        if p.is_file() and p.suffix in (".js", ".css", ".html")
    ]
    fe_loc = 0
    for p in fe_files:
        try:
            fe_loc += sum(1 for _ in p.open("rb"))
        except Exception:
            pass

    test_files = [p for p in (ROOT / "backend" / "tests").glob("test_*.py")]

    # broken refs (git for-each-ref warning) — грубая оценка
    try:
        refs = subprocess.run(
            ["git", "for-each-ref"],
            cwd=ROOT,
            capture_output=True,
            text=True,
            timeout=3.0,
        )
        broken = refs.stderr.count("broken name") if refs.stderr else 0
    except Exception:
        broken = 0

    return {
        "git_sha": (_git(["rev-parse", "--short", "HEAD"]) or "unknown"),
        "git_branch": (_git(["rev-parse", "--abbrev-ref", "HEAD"]) or "unknown"),
        "git_uncommitted": len(
            [_ for _ in (_git(["status", "--porcelain"]) or "").split("\n") if _]
        ),
        "git_broken_refs": broken,
        "backend_py_files": len(py_files),
        "backend_loc": loc,
        "frontend_files": len(fe_files),
        "frontend_loc": fe_loc,
        "test_files": len(test_files),
        "python_version": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
    }


# ============================================================
# 2. TESTS
# ============================================================
def _tests_metrics() -> dict:
    # coverage % — заглушаем stdout, чтобы не загрязнять HTTP-ответ
    cov_pct = None
    if COVERAGE_FILE.exists():
        try:
            import io
            from contextlib import redirect_stdout

            import coverage

            cov = coverage.Coverage(data_file=str(COVERAGE_FILE))
            cov.load()
            data = cov.get_data()
            measured = data.measured_files()
            if measured:
                buf = io.StringIO()
                with redirect_stdout(buf):
                    cov_pct = round(cov.report(show_missing=False) or 0, 1)
        except Exception:
            cov_pct = None

    # последние failed (если pytest запускался с -p cacheprovider)
    failed_files: list[str] = []
    if PYTEST_FAILED.exists():
        try:
            data = json.loads(PYTEST_FAILED.read_text())
            failed_files = sorted(set(k.split("::")[0] for k in data))
        except Exception:
            pass

    return {
        "coverage_pct": cov_pct,
        "failed_files_last_run": failed_files,
        "failed_count": len(failed_files),
    }


# ============================================================
# 3. RUNTIME (audit.log — 24h)
# ============================================================
def _is_testclient(ip: str) -> bool:
    """v1.9.1: pytest TestClient пишет в audit.log с ip=testclient.

    Не считаем это в runtime metrics — иначе error_rate показывает
    шум от тестов (например, 34×500 в download-all-merged error-case тестах).
    """
    return ip in ("testclient", "testclient-internal")


def _runtime_metrics() -> dict:
    if not AUDIT_LOG.exists():
        return {"audit_log": "missing"}

    cutoff = time.time() - 86400  # 24h
    total = 0
    errors_5xx = 0
    auth_fails = 0
    durations: list[tuple[float, str, str, int]] = []  # (dur, method, path, status)
    by_status = defaultdict(int)
    by_path_errors = defaultdict(int)

    try:
        with AUDIT_LOG.open("r", encoding="utf-8", errors="replace") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    e = json.loads(line)
                except json.JSONDecodeError:
                    continue
                ts_str = e.get("ts", "")
                # парсим ts как isoformat или оставляем как есть
                try:
                    from datetime import datetime as _dt

                    ts = _dt.fromisoformat(ts_str).timestamp() if "T" in ts_str else float(ts_str)
                except Exception:
                    continue
                if ts < cutoff:
                    continue
                if _is_testclient(str(e.get("ip", ""))):
                    continue
                total += 1
                status = int(e.get("status", 0) or 0)
                by_status[status] += 1
                if 500 <= status < 600:
                    errors_5xx += 1
                    path = e.get("path", "")
                    by_path_errors[path] += 1
                if status == 401:
                    auth_fails += 1
                dur = e.get("duration_ms", 0.0)
                if dur:
                    durations.append(
                        (
                            float(dur),
                            e.get("method", ""),
                            e.get("path", ""),
                            status,
                            e.get("request_id", "-"),
                            e.get("ts", ""),
                        )
                    )
    except Exception as e:
        return {"audit_log": f"error: {e}"}

    # топ-5 медленных (уникальные по (method, path))
    slow_by_endpoint: dict[tuple[str, str], tuple[float, str, str]] = {}
    for dur, method, path, _status, req_id, ts in durations:
        key = (method, path)
        if dur > slow_by_endpoint.get(key, (0.0, "", ""))[0]:
            slow_by_endpoint[key] = (dur, req_id, ts)
    top_slow = sorted(
        [
            {
                "method": k[0],
                "path": k[1],
                "max_duration_ms": round(v[0], 1),
                "request_id": v[1],
                "timestamp": v[2],
            }
            for k, v in slow_by_endpoint.items()
        ],
        key=lambda x: -x["max_duration_ms"],
    )[:5]

    # v1.9.2: recent slow (>1s) с request_id для трассировки через emergency.sh trace
    recent_slow = sorted(
        [
            {
                "ts": ts,
                "method": method,
                "path": path,
                "duration_ms": round(dur, 1),
                "status": status,
                "request_id": req_id,
            }
            for dur, method, path, status, req_id, ts in durations
            if dur >= 1000.0 and req_id != "-"
        ],
        key=lambda x: -x["duration_ms"],
    )[:10]

    avg_dur = sum(d[0] for d in durations) / len(durations) if durations else 0.0
    p95_idx = int(len(durations) * 0.95)
    p95 = (
        sorted(d[0] for d in durations)[p95_idx]
        if durations and p95_idx < len(durations)
        else avg_dur
    )

    return {
        "window": "24h",
        "total_requests": total,
        "errors_5xx": errors_5xx,
        "error_rate_pct": round((errors_5xx / total) * 100, 2) if total else 0.0,
        "auth_fails_401": auth_fails,
        "by_status": dict(sorted(by_status.items())),
        "avg_duration_ms": round(avg_dur, 1),
        "p95_duration_ms": round(p95, 1),
        "top_slow_endpoints": top_slow,
        "recent_slow_with_reqid": recent_slow,
        "top_error_endpoints": sorted(
            [{"path": p, "errors": c} for p, c in by_path_errors.items()],
            key=lambda x: -x["errors"],
        )[:5],
    }


# ============================================================
# 4. SECURITY
# ============================================================
def _security_metrics() -> dict:
    try:
        from .security.hardening import blocklist, rate_limiter, watchdog

        return {
            "blocklist": blocklist.stats(),
            "rate_limiter": rate_limiter.stats(),
            "watchdog": watchdog.stats(),
        }
    except Exception as e:
        return {"error": str(e)}


# ============================================================
# 5. HOUSEKEEPING
# ============================================================
def _housekeeping_metrics() -> dict:
    try:
        from .security.housekeeping import stats

        return stats()
    except Exception as e:
        return {"error": str(e)}


# ============================================================
# 6. HEALTH
# ============================================================
def _health_metrics() -> dict:
    out = ROOT / "output"
    voices = ROOT / "voices"

    engine_loaded = False
    try:
        from .core.state import get_engine

        engine_loaded = get_engine() is not None
    except Exception:
        pass

    try:
        output_files = len(list(out.glob("*.wav")))
    except Exception:
        output_files = 0

    try:
        voices_count = len(list(voices.glob("*")))
    except Exception:
        voices_count = 0

    return {
        "engine_loaded": engine_loaded,
        "output_dir_exists": out.exists(),
        "output_writable": out.exists() and os.access(str(out), os.W_OK),
        "output_files": output_files,
        "voices_count": voices_count,
        "ffmpeg_available": shutil.which("ffmpeg") is not None,
    }


# ============================================================
# 7. DEPS
# ============================================================
def _deps_metrics() -> dict:
    out = {}
    for mod in ("fastapi", "pydantic", "pytest", "starlette", "uvicorn"):
        try:
            m = __import__(mod)
            out[mod] = getattr(m, "__version__", "unknown")
        except Exception:
            out[mod] = "missing"
    return out


# ============================================================
# 8. HYGIENE
# ============================================================
def _hygiene_metrics() -> dict:
    todo = 0
    todo_paths: list[str] = []
    for p in (ROOT / "backend").rglob("*.py"):
        if "__pycache__" in p.parts:
            continue
        try:
            for i, line in enumerate(p.open("rb"), 1):
                if re.search(rb"\b(TODO|FIXME|XXX|HACK)\b", line):
                    todo += 1
                    if len(todo_paths) < 10:
                        todo_paths.append(f"{p.relative_to(ROOT)}:{i}")
        except Exception:
            pass
    return {"todo_fixme_count": todo, "sample": todo_paths}


# ============================================================
# 9. AGGREGATE
# ============================================================
def build_report() -> dict:
    """Полный отчёт. Не содержит секретов и IP-адресов."""
    t0 = time.time()
    report = {
        "diagnostics_version": _DIAG_VERSION,
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "generation_time_ms": 0,
        "env": {
            "JST_ENV": os.getenv("JST_ENV", "dev"),
            "JST_TRUSTED_HOSTS": bool(os.getenv("JST_TRUSTED_HOSTS")),
            "JST_SENTRY_DSN": bool(os.getenv("JST_SENTRY_DSN")),
            "JST_API_KEY": bool(os.getenv("JST_API_KEY")),
        },
        "project": _project_metrics(),
        "tests": _tests_metrics(),
        "runtime": _runtime_metrics(),
        "security": _security_metrics(),
        "housekeeping": _housekeeping_metrics(),
        "health": _health_metrics(),
        "deps": _deps_metrics(),
        "hygiene": _hygiene_metrics(),
    }
    report["generation_time_ms"] = round((time.time() - t0) * 1000, 1)
    return report


# ============================================================
# 10. MARKDOWN (для GitHub Issue / README)
# ============================================================
def to_markdown(r: dict) -> str:
    p = r["project"]
    t = r["tests"]
    rt = r.get("runtime", {})
    s = r.get("security", {})
    hk = r.get("housekeeping", {})
    h = r.get("health", {})
    d = r.get("deps", {})
    hy = r.get("hygiene", {})

    lines = [
        "# JST Studio — Diagnostics Report",
        "",
        f"Generated: `{r['generated_at']}` ({r['generation_time_ms']} ms)",
        f"Version: `v{r['diagnostics_version']}`",
        "",
        "## Project",
        f"- Git: `{p['git_sha']}` ({p['git_branch']}), uncommitted: **{p['git_uncommitted']}**",
        f"- Backend: {p['backend_py_files']} files, **{p['backend_loc']} LOC**",
        f"- Frontend: {p['frontend_files']} files, {p['frontend_loc']} LOC",
        f"- Tests: {p['test_files']} files",
        f"- Python: {p['python_version']}",
        "",
        "## Tests",
        f"- Coverage: **{t.get('coverage_pct') or 'N/A'}%**",
        f"- Failed (last run): **{t.get('failed_count', 0)}**",
    ]
    if t.get("failed_files_last_run"):
        for f in t["failed_files_last_run"][:5]:
            lines.append(f"  - `{f}`")

    if isinstance(rt, dict) and rt.get("total_requests"):
        lines += [
            "",
            "## Runtime (last 24h)",
            f"- Requests: **{rt['total_requests']}**",
            f"- Errors 5xx: **{rt['errors_5xx']}** ({rt['error_rate_pct']}%)",
            f"- Auth fails (401): {rt.get('auth_fails_401', 0)}",
            f"- Avg duration: **{rt.get('avg_duration_ms')} ms**, P95: **{rt.get('p95_duration_ms')} ms**",
        ]
        if rt.get("top_slow_endpoints"):
            lines.append("")
            lines.append("### Top-5 slow endpoints")
            lines.append("| Method | Path | Max (ms) |")
            lines.append("|---|---|---|")
            for e in rt["top_slow_endpoints"]:
                lines.append(f"| {e['method']} | `{e['path']}` | {e['max_duration_ms']} |")
        if rt.get("top_error_endpoints"):
            lines.append("")
            lines.append("### Top error endpoints")
            for e in rt["top_error_endpoints"]:
                lines.append(f"- `{e['path']}` — {e['errors']} errors")

    if isinstance(s, dict) and "blocklist" in s:
        bl = s.get("blocklist", {})
        rl = s.get("rate_limiter", {})
        wd = s.get("watchdog", {})
        lines += [
            "",
            "## Security",
            f"- Blocklist: {bl.get('active_bans', 0)} active, {bl.get('bans_total', 0)} total bans",
            f"- Rate limiter: {rl.get('hits', 0)} hits, {rl.get('exceeded', 0)} exceeded",
            f"- Watchdog: {wd.get('last_status', '?')}, kicks={wd.get('kicks', 0)}",
        ]

    if isinstance(hk, dict) and "last_run" in hk:
        lines += [
            "",
            "## Housekeeping",
            f"- Last run: {time.strftime('%Y-%m-%d %H:%M', time.localtime(hk['last_run'])) if hk.get('last_run') else 'never'}",
            f"- Freed total: {hk.get('freed_mb_total', 0)} MB",
        ]

    lines += [
        "",
        "## Health",
        f"- Engine: {'✓' if h.get('engine_loaded') else '✗'}",
        f"- Output writable: {'✓' if h.get('output_writable') else '✗'}",
        f"- FFmpeg: {'✓' if h.get('ffmpeg_available') else '✗'}",
        f"- Voices: {h.get('voices_count', 0)}, Output files: {h.get('output_files', 0)}",
        "",
        "## Deps",
    ]
    for k, v in d.items():
        lines.append(f"- {k}: `{v}`")

    lines += [
        "",
        "## Hygiene",
        f"- TODO/FIXME: **{hy.get('todo_fixme_count', 0)}**",
        f"- Broken refs: {p.get('git_broken_refs', 0)}",
    ]

    return "\n".join(lines)
