"""v1.7.11: Housekeeping — pycache, plain logs, tmp, tts cache.

НЕ трогает:
- app.log / error.log / audit.log — уже ротируются logging_setup.py + audit.py
- output/*.wav — уже чистит output_cleanup.py (TTL + size)

Трогает:
- backend/**/__pycache__ — при PYTHONDONTWRITEBYTECODE=1 не создаются
- logs/launchd.err.log, launchd.out.log, memory.log — plain text, не ротируются
- /tmp/jst-* — safety-net (не должно быть, но чистим)
- output/_tts_cache/*.wav — не покрыт output_cleanup (тот смотрит только корень output/)
"""

from __future__ import annotations

import logging
import shutil
import time
from pathlib import Path

log = logging.getLogger("JST.Housekeeping")

ROOT = Path(__file__).resolve().parent.parent
PROJECT_ROOT = ROOT.parent

_state = {
    "last_run": 0.0,
    "freed_bytes_total": 0,
    "deleted": {},
    "last_results": {},
    "interval_sec": 3600.0,
}


def _freed(p: Path) -> int:
    try:
        return p.stat().st_size
    except Exception:
        return 0


def cleanup_pycache() -> dict:
    count = 0
    freed = 0
    for d in ROOT.rglob("__pycache__"):
        if not d.is_dir():
            continue
        for f in d.iterdir():
            if f.is_file():
                freed += _freed(f)
        shutil.rmtree(d, ignore_errors=True)
        count += 1
    return {"deleted": count, "freed_kb": round(freed / 1024, 1)}


def rotate_plain_logs(logs_dir: Path, max_mb: float = 10.0, keep: int = 2) -> dict:
    skip = {"app.log", "error.log", "audit.log"}
    if not logs_dir.exists():
        return {"rotated": 0}
    max_bytes = int(max_mb * 1024 * 1024)
    rotated = []
    for f in logs_dir.iterdir():
        if not f.is_file() or f.name in skip:
            continue
        if not (f.name.endswith(".log") or ".log." in f.name):
            continue
        try:
            if f.stat().st_size < max_bytes:
                continue
            for i in range(keep - 1, 0, -1):
                src = f.with_suffix(f.suffix + f".{i}")
                dst = f.with_suffix(f.suffix + f".{i + 1}")
                if src.exists():
                    if dst.exists():
                        dst.unlink()
                    src.rename(dst)
            backup = f.with_suffix(f.suffix + ".1")
            if backup.exists():
                backup.unlink()
            f.rename(backup)
            f.touch()
            rotated.append(f.name)
        except Exception as e:
            log.warning("rotate_plain_logs %s: %s", f.name, e)
    for f in logs_dir.iterdir():
        if f.name in skip:
            continue
        parts = f.name.rsplit(".", 1)
        if len(parts) == 2 and parts[1].isdigit() and int(parts[1]) > keep:
            try:
                f.unlink()
            except Exception:
                pass
    return {"rotated": len(rotated), "files": rotated}


def cleanup_tmp_jst(max_age_hours: float = 24.0) -> dict:
    tmp = Path("/tmp")  # nosec B108 — only reads /tmp/jst-* orphans
    if not tmp.exists():
        return {"deleted": 0, "freed_kb": 0.0}
    cutoff = time.time() - max_age_hours * 3600
    count = 0
    freed = 0
    for p in tmp.glob("jst-*"):
        try:
            if p.stat().st_mtime < cutoff:
                if p.is_dir():
                    for f in p.rglob("*"):
                        if f.is_file():
                            freed += _freed(f)
                    shutil.rmtree(p, ignore_errors=True)
                else:
                    freed += _freed(p)
                    p.unlink()
                count += 1
        except Exception:
            pass
    return {"deleted": count, "freed_kb": round(freed / 1024, 1)}


def cleanup_tts_cache(max_age_days: int = 7) -> dict:
    cache = PROJECT_ROOT / "output" / "_tts_cache"
    if not cache.exists():
        return {"deleted": 0, "freed_kb": 0.0}
    cutoff = time.time() - max_age_days * 86400
    count = 0
    freed = 0
    for f in cache.glob("*.wav"):
        try:
            st = f.stat()
            if st.st_mtime < cutoff:
                freed += st.st_size
                f.unlink()
                count += 1
        except Exception:
            pass
    return {"deleted": count, "freed_kb": round(freed / 1024, 1)}


def housekeeping_run() -> dict:
    t0 = time.time()
    results = {
        "pycache": cleanup_pycache(),
        "plain_logs": rotate_plain_logs(PROJECT_ROOT / "logs"),
        "tmp_jst": cleanup_tmp_jst(),
        "tts_cache": cleanup_tts_cache(),
    }
    freed_total = sum(r.get("freed_kb", 0) for r in results.values())
    deleted_total = sum(r.get("deleted", 0) + r.get("rotated", 0) for r in results.values())
    _state["last_run"] = time.time()
    _state["freed_bytes_total"] += int(freed_total * 1024)
    _state["deleted"] = {k: v for k, v in results.items()}
    _state["last_results"] = results
    log.info(
        "housekeeping: %.2fs, freed=%.1fKB, deleted=%d",
        time.time() - t0,
        freed_total,
        deleted_total,
    )
    return results


async def housekeeping_loop(interval_sec: float = 3600.0) -> None:
    import asyncio as _a

    _state["interval_sec"] = interval_sec
    while True:
        await _a.sleep(interval_sec)
        try:
            housekeeping_run()
        except Exception:
            log.exception("housekeeping loop error")


def stats() -> dict:
    return {
        "last_run": _state["last_run"],
        "interval_sec": _state["interval_sec"],
        "freed_mb_total": round(_state["freed_bytes_total"] / 1024 / 1024, 2),
        "deleted": _state["deleted"],
        "last_results": _state["last_results"],
    }
