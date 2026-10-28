"""Глобальное состояние ошибки. Один объект на процесс.
Использование:
    from backend.core.error_state import error_state
    await error_state.set("MODEL_LOAD_FAILED", "..." , source="startup")
    await error_state.clear()
"""
import asyncio
import logging
import time

log = logging.getLogger("JST.ErrorState")


class ErrorState:
    def __init__(self):
        self._current = None
        self._version = 0
        self._lock = asyncio.Lock()

    async def set(self, code: str, message: str, *, source: str = "unknown"):
        async with self._lock:
            self._version += 1
            self._current = {
                "code": code,
                "message": message,
                "source": source,
                "ts": time.time(),
                "version": self._version,
            }
            log.warning("[error-state] set code=%s source=%s: %s", code, source, message)

    async def clear(self):
        async with self._lock:
            if self._current is not None:
                log.info("[error-state] cleared (was %s)", self._current["code"])
            self._current = None
            self._version += 1

    def snapshot(self) -> dict:
        if self._current is None:
            return {"healthy": True, "version": self._version}
        return {
            "healthy": False,
            "version": self._current["version"],
            "error": {
                "code": self._current["code"],
                "message": self._current["message"],
                "source": self._current["source"],
                "ts": self._current["ts"],
            },
        }


error_state = ErrorState()
