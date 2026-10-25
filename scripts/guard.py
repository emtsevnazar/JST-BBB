"""
Memory Guard — автоматический watchdog памяти.
Запускается внутри uvicorn через FastAPI lifespan.

Логика:
- каждые CHECK_INTERVAL сек читает RSS процесса через psutil
- читает системную память через psutil.virtual_memory() (кросс-платформенно)
- если RSS > RSS_LIMIT_GB ИЛИ system_free < SYS_FREE_MIN_PCT → os.kill(SIGTERM)
- при SIGTERM uvicorn делает graceful shutdown, launchd перезапускает

Пороги конфигурируются через env:
  JST_RSS_LIMIT_GB=8.0
  JST_SYS_FREE_MIN_PCT=10
  JST_GUARD_INTERVAL=3
"""

from __future__ import annotations

import asyncio
import logging
import os
import signal
import time
from pathlib import Path

import psutil

logger = logging.getLogger("jst.guard")

CHECK_INTERVAL = float(os.getenv("JST_GUARD_INTERVAL", "3"))
RSS_LIMIT_GB = float(os.getenv("JST_RSS_LIMIT_GB", "8.0"))
SYS_FREE_MIN = float(os.getenv("JST_SYS_FREE_MIN_PCT", "10"))

MEMORY_LOG = Path("logs/memory.log")
MEMORY_LOG.parent.mkdir(exist_ok=True)


def _system_mem() -> dict:
    """Кроссплатформенно: free/total MB и free_pct через psutil."""
    vm = psutil.virtual_memory()
    total_mb = vm.total / 1_048_576
    free_mb = vm.available / 1_048_576
    free_pct = 100.0 * vm.available / vm.total if vm.total else 0.0
    return {"free_mb": free_mb, "total_mb": total_mb, "free_pct": free_pct}


def _log_mem(rss_gb: float, mem: dict, action: str = "ok") -> None:
    ts = time.strftime("%Y-%m-%d %H:%M:%S")
    with MEMORY_LOG.open("a") as f:
        f.write(
            f"{ts} rss={rss_gb:.2f}GB free={mem['free_pct']:.1f}% "
            f"({mem['free_mb']:.0f}MB/{mem['total_mb']:.0f}MB) action={action}\n"
        )


async def memory_guard_loop() -> None:
    """Фоновая корутина. Отменяется из lifespan teardown."""
    proc = psutil.Process(os.getpid())
    logger.info(
        "[guard] started: rss_limit=%.1fGB sys_free_min=%.1f%% interval=%.1fs",
        RSS_LIMIT_GB,
        SYS_FREE_MIN,
        CHECK_INTERVAL,
    )
    while True:
        try:
            rss_gb = proc.memory_info().rss / (1024**3)
            mem = _system_mem()
            action = "ok"

            if rss_gb > RSS_LIMIT_GB:
                action = f"rss_exceeded({rss_gb:.2f}>{RSS_LIMIT_GB})"
                logger.error("[guard] %s → SIGTERM", action)
                _log_mem(rss_gb, mem, action)
                os.kill(os.getpid(), signal.SIGTERM)
                return

            if mem["free_pct"] < SYS_FREE_MIN:
                action = f"sys_free_low({mem['free_pct']:.1f}<{SYS_FREE_MIN})"
                logger.error("[guard] %s → SIGTERM", action)
                _log_mem(rss_gb, mem, action)
                os.kill(os.getpid(), signal.SIGTERM)
                return

            _log_mem(rss_gb, mem, action)
        except asyncio.CancelledError:
            logger.info("[guard] cancelled")
            raise
        except Exception as exc:
            logger.exception("[guard] loop error: %s", exc)
        await asyncio.sleep(CHECK_INTERVAL)
