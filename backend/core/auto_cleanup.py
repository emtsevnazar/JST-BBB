"""Автоочистка: старые output/, STT temp, БД vacuum, логи."""

import logging
import sqlite3
import time
from pathlib import Path

log = logging.getLogger("JST.Cleanup")
OUTPUT_MAX_AGE_DAYS = 7
STT_TEMP_AGE_HOURS = 1
OUTPUT_MAX_FILES = 500
LOG_MAX_AGE_DAYS = 3


def cleanup_outputs(output_dir):
    if not output_dir.exists():
        return 0, 0
    now = time.time()
    ttl = OUTPUT_MAX_AGE_DAYS * 86400
    deleted = 0
    total = 0
    files = []
    for f in output_dir.rglob("*"):
        if not f.is_file():
            continue
        total += 1
        if f.name.startswith("_"):
            continue
        files.append(f)
    for f in files:
        try:
            if now - f.stat().st_mtime > ttl:
                f.unlink()
                deleted += 1
        except Exception:
            pass
    if len(files) > OUTPUT_MAX_FILES:
        fs = sorted([f for f in files if f.exists()], key=lambda x: x.stat().st_mtime)
        for f in fs[: len(fs) - OUTPUT_MAX_FILES]:
            try:
                f.unlink()
                deleted += 1
            except Exception:
                pass
    return deleted, total


def cleanup_stt_temp(output_dir):
    if not output_dir.exists():
        return 0
    now = time.time()
    ttl = STT_TEMP_AGE_HOURS * 3600
    deleted = 0
    for f in output_dir.glob("_stt_*"):
        try:
            if now - f.stat().st_mtime > ttl:
                f.unlink()
                deleted += 1
        except Exception:
            pass
    return deleted


def vacuum_db(db_path):
    if not db_path.exists():
        return 0
    try:
        conn = sqlite3.connect(str(db_path))
        cur = conn.cursor()
        cur.execute("PRAGMA page_count")
        before = cur.fetchone()[0]
        conn.execute("VACUUM")
        cur.execute("PRAGMA page_count")
        after = cur.fetchone()[0]
        conn.close()
        return before - after
    except Exception as e:
        log.warning("vacuum: %s", e)
        return 0


def cleanup_logs(log_dir):
    if not log_dir.exists():
        return 0
    now = time.time()
    ttl = LOG_MAX_AGE_DAYS * 86400
    deleted = 0
    for f in log_dir.glob("*.log*"):
        try:
            if now - f.stat().st_mtime > ttl:
                f.unlink()
                deleted += 1
        except Exception:
            pass
    return deleted


def run_full_cleanup():
    root = Path(__file__).resolve().parent.parent
    out_dir = root / "output"
    log_dir = root / "logs"
    db = root / "data" / "jst.db"
    d1, t1 = cleanup_outputs(out_dir)
    d2 = cleanup_stt_temp(out_dir)
    d3 = vacuum_db(db)
    d4 = cleanup_logs(log_dir)
    log.info(
        "cleanup: outputs -%d (было %d), stt_temp -%d, db -%d pages, logs -%d", d1, t1, d2, d3, d4
    )
    return {
        "outputs_deleted": d1,
        "outputs_total": t1,
        "stt_temp_deleted": d2,
        "db_pages_freed": d3,
        "logs_deleted": d4,
    }


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    print(run_full_cleanup())
