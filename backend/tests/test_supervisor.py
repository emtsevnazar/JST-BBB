"""v1.4.1: smoke-тесты supervisor.py (без запуска uvicorn)."""

from __future__ import annotations

import os
import signal
import subprocess
import sys
import time
from pathlib import Path

SUP = Path("scripts/supervisor.py")


def test_supervisor_starts_and_stops_child(tmp_path):
    """Запускает supervisor с фейковой командой, проверяет старт + SIGTERM."""
    log = tmp_path / "sup.log"
    env = os.environ.copy()
    # Фейковый процесс: живёт 60 сек, пишет маркер
    env["JST_SUPERVISOR_TEST_CMD"] = (
        f"{sys.executable} -c 'import time,sys; print(\"fake-up\", flush=True); time.sleep(60)'"
    )

    with open(log, "w") as f:
        p = subprocess.Popen(
            [sys.executable, str(SUP), "--port", "0"],
            cwd=str(Path.cwd()),
            stdout=f,
            stderr=subprocess.STDOUT,
            env=env,
        )

    try:
        # Ждём пока supervisor запустит дочернего
        deadline = time.time() + 10
        while time.time() < deadline:
            if log.exists() and "child pid=" in log.read_text():
                break
            time.sleep(0.2)
        assert "child pid=" in log.read_text(), f"no child start in log:\n{log.read_text()}"

        # Шлём SIGTERM супервизору — он должен graceful kill дочернего и выйти
        p.send_signal(signal.SIGTERM)
        rc = p.wait(timeout=15)

        log_text = log.read_text()
        assert rc == 0, f"supervisor exit code {rc} (want 0)\n{log_text}"
        assert "stop requested" in log_text or "received signal" in log_text, log_text
    finally:
        if p.poll() is None:
            p.kill()
            p.wait()


def test_supervisor_restarts_on_crash(tmp_path):
    """Фейковый процесс падает с rc=1 → supervisor перезапускает."""
    log = tmp_path / "sup.log"
    env = os.environ.copy()
    # Фейковый процесс падает сразу
    env["JST_SUPERVISOR_TEST_CMD"] = f"{sys.executable} -c 'import sys; sys.exit(1)'"

    with open(log, "w") as f:
        p = subprocess.Popen(
            [sys.executable, str(SUP), "--port", "0", "--restart-delay", "0.5"],
            cwd=str(Path.cwd()),
            stdout=f,
            stderr=subprocess.STDOUT,
            env=env,
        )

    try:
        # Ждём 2 перезапуска
        deadline = time.time() + 10
        restart_count = 0
        while time.time() < deadline:
            txt = log.read_text()
            restart_count = txt.count("child crashed")
            if restart_count >= 2:
                break
            time.sleep(0.3)

        assert restart_count >= 2, f"want >=2 restarts, got {restart_count}:\n{log.read_text()}"
        p.send_signal(signal.SIGTERM)
        p.wait(timeout=15)
    finally:
        if p.poll() is None:
            p.kill()
            p.wait()
