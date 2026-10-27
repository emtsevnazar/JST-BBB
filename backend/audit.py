"""P7.5: Structured audit log with rotation."""

import json
import logging
import os
import time
from logging.handlers import RotatingFileHandler
from pathlib import Path

AUDIT_LOG_PATH = Path(os.getenv("JST_AUDIT_LOG", "logs/audit.log"))
AUDIT_MAX_BYTES = int(os.getenv("JST_AUDIT_MAX_BYTES", str(10 * 1024 * 1024)))
AUDIT_BACKUPS = int(os.getenv("JST_AUDIT_BACKUPS", "5"))

AUDIT_LOG_PATH.parent.mkdir(parents=True, exist_ok=True)

_audit_logger = logging.getLogger("JST.Audit")
_audit_logger.setLevel(logging.INFO)
_audit_logger.propagate = False

if not _audit_logger.handlers:
    _handler = RotatingFileHandler(
        AUDIT_LOG_PATH,
        maxBytes=AUDIT_MAX_BYTES,
        backupCount=AUDIT_BACKUPS,
        encoding="utf-8",
    )
    _handler.setFormatter(logging.Formatter("%(message)s"))
    _audit_logger.addHandler(_handler)


def _classify(method: str, path: str) -> str:
    if path.startswith("/ws/synthesize"):
        return "synthesize"
    if path.startswith("/api/mode"):
        return "mode_change"
    if path.startswith("/api/output"):
        return "list_output"
    if path.startswith("/output/"):
        return "download_audio" if method == "GET" else "output_op"
    if path.startswith("/api/history"):
        return "history"
    if path.startswith("/api/batch"):
        return "batch"
    if path.startswith("/api/audit"):
        return "audit_view"
    if path.startswith("/api/"):
        return "api"
    return "web"


def _describe(method: str, path: str, status: int, duration_ms: float) -> str:
    action = _classify(method, path)
    ru = {
        "synthesize": "Синтез речи (WebSocket)",
        "mode_change": "Смена режима движка",
        "list_output": "Запрос списка аудиофайлов",
        "download_audio": "Скачивание аудио",
        "output_op": "Операция с аудио",
        "history": "Запрос истории",
        "batch": "Пакетная операция",
        "audit_view": "Просмотр журнала аудита",
        "api": "API запрос",
        "web": "Веб-страница",
    }
    base = ru.get(action, action)
    if status >= 500:
        return f"{base} — ОШИБКА {status} за {duration_ms:.0f} мс"
    if status >= 400:
        return f"{base} — отказ {status} за {duration_ms:.0f} мс"
    return f"{base} — успех за {duration_ms:.0f} мс"


def log_event(
    *,
    ip: str,
    method: str,
    path: str,
    status: int,
    duration_ms: float,
    user_agent: str = "",
    request_id: str | None = None,
    extra: dict | None = None,
) -> None:
    record = {
        "ts": time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime()),
        "ip": ip,
        "method": method,
        "path": path,
        "status": status,
        "request_id": request_id or "-",
        "duration_ms": round(duration_ms, 2),
        "ua": (user_agent or "")[:120],
        "action": _classify(method, path),
        "desc": _describe(method, path, status, duration_ms),
    }
    if extra:
        record.update(extra)
    _audit_logger.info(json.dumps(record, ensure_ascii=False))


def read_last(n: int = 100) -> list[dict]:
    """Read the last N audit records (newest first)."""
    if not AUDIT_LOG_PATH.exists():
        return []
    rows: list[dict] = []
    try:
        with AUDIT_LOG_PATH.open("r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    rows.append(json.loads(line))
                except json.JSONDecodeError:
                    continue
    except Exception:
        return []
    return rows[-n:][::-1]
