"""Синглтон ENGINE — доступен из main.startup и из api/*.py."""

from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from ..engine import Engine

_engine: Engine | None = None


def set_engine(e: Engine) -> None:
    global _engine
    _engine = e


def get_engine() -> Engine | None:
    return _engine


# P3.3 — observability (git_sha, uptime_sec)
import subprocess as _subprocess
import time as _time
from pathlib import Path as _Path

_PROCESS_START = _time.time()


def _read_git_sha() -> str:
    try:
        return (
            _subprocess.check_output(
                ["git", "rev-parse", "--short", "HEAD"],
                cwd=_Path(__file__).resolve().parents[2],
                stderr=_subprocess.DEVNULL,
                timeout=1,
                text=True,
            ).strip()
            or "unknown"
        )
    except Exception:
        return "unknown"


GIT_SHA = _read_git_sha()


def uptime_sec() -> int:
    """Секунды с момента импорта core/state.py (≈ старт процесса)."""
    return int(_time.time() - _PROCESS_START)
