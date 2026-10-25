"""
Кроссплатформенный супервизор — заменяет launchd (macOS), systemd (Linux),
Task Scheduler (Windows).

Запуск:
  python scripts/supervisor.py [--port 8000] [--rss-limit-gb 8.0] [--sys-free-min 10]

Что делает:
  - запускает uvicorn как дочерний процесс
  - каждые 3 сек проверяет: RSS дочернего, системную память (psutil.virtual_memory)
  - при RSS > лимита ИЛИ free RAM < порога → SIGTERM дочернему → перезапуск через 10 сек
  - при падении (returncode != 0) → перезапуск через 10 сек
  - при SIGTERM/SIGINT супервизору → graceful shutdown дочернего
  - пишет всё в logs/supervisor.log

Кроссплатформенность:
  - psutil.virtual_memory() — Win/Linux/macOS
  - signal.CTRL_BREAK_EVENT — Windows
  - os.setsid() + os.killpg — Linux/macOS
  - subprocess.CREATE_NEW_PROCESS_GROUP — Windows
"""

from __future__ import annotations

import argparse
import logging
import os
import signal
import subprocess
import sys
import time
from pathlib import Path

import psutil

LOG_DIR = Path("logs")
LOG_DIR.mkdir(exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | supervisor | %(message)s",
    handlers=[
        logging.FileHandler(LOG_DIR / "supervisor.log", encoding="utf-8"),
        logging.StreamHandler(),
    ],
)
log = logging.getLogger("supervisor")

IS_WIN = sys.platform == "win32"


def _popen(args: list[str]) -> subprocess.Popen:
    kwargs: dict = {"args": args}
    if IS_WIN:
        kwargs["creationflags"] = subprocess.CREATE_NEW_PROCESS_GROUP
    else:
        kwargs["preexec_fn"] = os.setsid
    return subprocess.Popen(**kwargs)


def _graceful_kill(proc: subprocess.Popen, timeout: float = 10.0) -> None:
    if proc.poll() is not None:
        return
    try:
        if IS_WIN:
            proc.send_signal(signal.CTRL_BREAK_EVENT)
        else:
            os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
    except ProcessLookupError:
        return
    try:
        proc.wait(timeout=timeout)
    except subprocess.TimeoutExpired:
        log.warning("graceful kill timeout — forcing SIGKILL")
        try:
            if IS_WIN:
                proc.kill()
            else:
                os.killpg(os.getpgid(proc.pid), signal.SIGKILL)
        except ProcessLookupError:
            pass


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=8000)
    ap.add_argument("--host", default="127.0.0.1")
    ap.add_argument("--rss-limit-gb", type=float, default=8.0)
    ap.add_argument("--sys-free-min", type=float, default=10.0)
    ap.add_argument("--restart-delay", type=float, default=10.0)
    args = ap.parse_args()

    # Обработка SIGTERM/SIGINT на уровне супервизора
    stop_flag = {"v": False}

    def on_stop(signum, frame):
        log.info("received signal %s → stopping", signum)
        stop_flag["v"] = True

    signal.signal(signal.SIGTERM, on_stop)
    signal.signal(signal.SIGINT, on_stop)

    cmd = [
        sys.executable,
        "-m",
        "uvicorn",
        "backend.main:app",
        "--host",
        args.host,
        "--port",
        str(args.port),
        "--log-level",
        "info",
    ]
    log.info("supervisor started: %s", " ".join(cmd))
    log.info(
        "thresholds: rss_limit=%.1fGB sys_free_min=%.1f%%", args.rss_limit_gb, args.sys_free_min
    )

    proc: subprocess.Popen | None = None

    while not stop_flag["v"]:
        log.info("starting child...")
        proc = _popen(cmd)
        log.info("child pid=%d", proc.pid)
        started = time.time()

        try:
            while True:
                if stop_flag["v"]:
                    log.info("stop requested → killing child")
                    _graceful_kill(proc)
                    return 0

                rc = proc.poll()
                if rc is not None:
                    uptime = time.time() - started
                    if rc == 0:
                        log.info("child exited cleanly after %.1fs", uptime)
                        return 0
                    log.error(
                        "child crashed rc=%d after %.1fs → restart in %.0fs",
                        rc,
                        uptime,
                        args.restart_delay,
                    )
                    break

                # memory check
                try:
                    child_proc = psutil.Process(proc.pid)
                    rss_gb = child_proc.memory_info().rss / (1024**3)
                except psutil.NoSuchProcess:
                    rss_gb = 0.0

                vm = psutil.virtual_memory()
                free_pct = 100.0 - vm.percent

                if rss_gb > args.rss_limit_gb:
                    log.error("RSS %.2fGB > %.1fGB → restart", rss_gb, args.rss_limit_gb)
                    _graceful_kill(proc)
                    break
                if free_pct < args.sys_free_min:
                    log.error("system free %.1f%% < %.1f%% → restart", free_pct, args.sys_free_min)
                    _graceful_kill(proc)
                    break

                time.sleep(3)
        finally:
            if proc and proc.poll() is None:
                _graceful_kill(proc)

        if stop_flag["v"]:
            return 0
        log.info("restarting in %.0fs...", args.restart_delay)
        # ждём, но проверяем stop_flag
        end = time.time() + args.restart_delay
        while time.time() < end and not stop_flag["v"]:
            time.sleep(0.5)

    return 0


if __name__ == "__main__":
    sys.exit(main())
