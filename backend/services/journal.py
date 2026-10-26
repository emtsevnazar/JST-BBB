"""Structured journal: actions / errors / emergencies."""

from __future__ import annotations

import json
import threading
from datetime import datetime
from pathlib import Path

JOURNAL_DIR = Path(__file__).resolve().parents[2] / "journal"
JOURNAL_DIR.mkdir(exist_ok=True)

MAX_MB = 10
KEEP = 5
_lock = threading.Lock()


def _write(category, level, msg, **extra):
    entry = {
        "ts": datetime.now().isoformat(timespec="seconds"),
        "level": level,
        "msg": msg,
        **extra,
    }
    path = JOURNAL_DIR / f"{category}.log"
    with _lock:
        with open(path, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
        _rotate(path)


def _rotate(path):
    try:
        if path.exists() and path.stat().st_size > MAX_MB * 1024 * 1024:
            for i in range(KEEP - 1, 0, -1):
                old = path.parent / f"{path.stem}.{i}.log"
                new = path.parent / f"{path.stem}.{i + 1}.log"
                if old.exists():
                    if new.exists():
                        new.unlink()
                    old.rename(new)
            path.rename(path.parent / f"{path.stem}.1.log")
    except Exception:
        pass


def action(msg, **extra):
    _write("actions", "INFO", msg, **extra)


def error(msg, **extra):
    _write("errors", "ERROR", msg, **extra)


def emergency(msg, **extra):
    _write("emergencies", "CRITICAL", msg, **extra)


def query(category="actions", limit=100, level=None):
    path = JOURNAL_DIR / f"{category}.log"
    if not path.exists():
        return []
    out = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            try:
                e = json.loads(line)
                if level and e.get("level") != level:
                    continue
                out.append(e)
            except json.JSONDecodeError:
                pass
    return out[-limit:]


def stats():
    result = {}
    for cat in ("actions", "errors", "emergencies"):
        path = JOURNAL_DIR / f"{cat}.log"
        if not path.exists():
            result[cat] = {"count": 0, "size_kb": 0}
            continue
        with open(path, encoding="utf-8") as f:
            count = sum(1 for _ in f)
        result[cat] = {"count": count, "size_kb": round(path.stat().st_size / 1024, 1)}
    return result
