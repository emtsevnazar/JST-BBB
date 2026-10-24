"""P4.2: SQLite history для batch-синтезов.

HistoryDB — тонкая обёртка над sqlite3. Соединение открывается на каждую
операцию (sqlite3 без check_same_thread=False не потокобезопасен, а
save_task вызывается из asyncio.to_thread).
"""

from __future__ import annotations

import json
import logging
import os
import sqlite3
from pathlib import Path
from typing import Any

log = logging.getLogger("JST.History")

DB_PATH = Path(
    os.getenv(
        "JST_HISTORY_DB",
        str(Path(__file__).resolve().parents[2] / "data" / "jst.db"),
    )
)

_db: HistoryDB | None = None


class HistoryDB:
    def __init__(self, path: Path | str) -> None:
        self.path = Path(path)

    def init(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with self._connect() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS history (
                    id TEXT PRIMARY KEY,
                    text TEXT NOT NULL,
                    voice TEXT NOT NULL,
                    settings_json TEXT NOT NULL,
                    status TEXT NOT NULL,
                    result_file TEXT,
                    error TEXT,
                    created_at REAL NOT NULL,
                    started_at REAL,
                    finished_at REAL NOT NULL
                )
                """
            )
            conn.execute(
                "CREATE INDEX IF NOT EXISTS idx_history_finished ON history(finished_at DESC)"
            )
            conn.commit()
        log.info("history: db ready at %s", self.path)

    def _connect(self) -> sqlite3.Connection:
        return sqlite3.connect(self.path, timeout=5.0)

    def save_task(self, task: dict[str, Any]) -> None:
        with self._connect() as conn:
            conn.execute(
                """
                INSERT OR REPLACE INTO history
                    (id, text, voice, settings_json, status, result_file,
                     error, created_at, started_at, finished_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    task["id"],
                    task["text"],
                    task.get("voice", ""),
                    json.dumps(task.get("settings", {}), ensure_ascii=False),
                    task["status"],
                    task.get("result_file"),
                    task.get("error"),
                    task.get("created_at", 0.0),
                    task.get("started_at"),
                    task.get("finished_at", 0.0),
                ),
            )
            conn.commit()

    def get_task(self, task_id: str) -> dict[str, Any] | None:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT id, text, voice, settings_json, status, result_file, "
                "error, created_at, started_at, finished_at "
                "FROM history WHERE id = ?",
                (task_id,),
            ).fetchone()
        return self._row_to_dict(row) if row else None

    def list_tasks(self, limit: int = 50) -> list[dict[str, Any]]:
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT id, text, voice, settings_json, status, result_file, "
                "error, created_at, started_at, finished_at "
                "FROM history ORDER BY finished_at DESC LIMIT ?",
                (limit,),
            ).fetchall()
        return [self._row_to_dict(r) for r in rows]

    @staticmethod
    def _row_to_dict(row: tuple) -> dict[str, Any]:
        return {
            "id": row[0],
            "text": row[1],
            "voice": row[2],
            "settings": json.loads(row[3]),
            "status": row[4],
            "result_file": row[5],
            "error": row[6],
            "created_at": row[7],
            "started_at": row[8],
            "finished_at": row[9],
        }

    def close(self) -> None:
        # Соединение открывается на каждую операцию — закрывать нечего.
        pass


def get_history() -> HistoryDB | None:
    return _db


def set_history(db: HistoryDB | None) -> None:
    global _db
    _db = db
