"""P4.1: In-memory batch-очередь синтеза.

BatchTask — одна задача, BatchQueue — FIFO с одним воркером.
Синтез идёт в asyncio.to_thread (не блокирует event loop).
"""

from __future__ import annotations

import asyncio
import logging
import time
import uuid
from dataclasses import asdict, dataclass, field
from typing import Any

from ..core.state import get_engine
from ..engine import SynthSettings
from .output_service import save_output

log = logging.getLogger("JST.Batch")


@dataclass
class BatchTask:
    id: str
    text: str
    voice: str
    settings: dict
    status: str = "queued"  # queued|running|done|error|cancelled
    result_file: str | None = None
    error: str | None = None
    created_at: float = field(default_factory=time.time)
    started_at: float | None = None
    finished_at: float | None = None
    _task: asyncio.Task | None = None

    def to_dict(self) -> dict[str, Any]:
        d = asdict(self)
        d.pop("_task", None)
        return d


class BatchQueue:
    """FIFO-очередь с одним воркером. Хранит последние N задач."""

    MAX_HISTORY = 200

    def __init__(self) -> None:
        self._queue: asyncio.Queue[str] = asyncio.Queue()
        self._tasks: dict[str, BatchTask] = {}
        self._order: list[str] = []
        self._worker: asyncio.Task | None = None
        self._running = False

    async def start(self) -> None:
        if self._running:
            return
        self._running = True
        self._worker = asyncio.create_task(self._run(), name="batch-worker")
        log.info("batch: worker started")

    async def stop(self) -> None:
        self._running = False
        if self._worker is not None:
            self._worker.cancel()
            try:
                await self._worker
            except asyncio.CancelledError:
                pass
            self._worker = None
        log.info("batch: worker stopped")

    def submit(self, text: str, voice: str, settings: dict | None = None) -> str:
        task_id = uuid.uuid4().hex[:12]
        task = BatchTask(
            id=task_id,
            text=text,
            voice=voice or "",
            settings=settings or {},
        )
        self._tasks[task_id] = task
        self._order.append(task_id)
        self._trim_history()
        self._queue.put_nowait(task_id)
        log.info("batch: submit %s (queue=%d)", task_id, self._queue.qsize())
        return task_id

    def get(self, task_id: str) -> BatchTask | None:
        return self._tasks.get(task_id)

    def list(self, limit: int = 50) -> list[BatchTask]:
        ids = self._order[-limit:][::-1]  # новые сверху
        return [self._tasks[i] for i in ids if i in self._tasks]

    async def cancel(self, task_id: str) -> bool:
        task = self._tasks.get(task_id)
        if task is None or task.status not in ("queued", "running"):
            return False
        task.status = "cancelled"
        task.finished_at = time.time()
        if task._task is not None and not task._task.done():
            task._task.cancel()
        return True

    def _trim_history(self) -> None:
        while len(self._order) > self.MAX_HISTORY:
            old = self._order.pop(0)
            self._tasks.pop(old, None)

    async def _run(self) -> None:
        while self._running:
            try:
                task_id = await asyncio.wait_for(self._queue.get(), timeout=1.0)
            except TimeoutError:
                continue
            task = self._tasks.get(task_id)
            if task is None or task.status == "cancelled":
                continue
            task._task = asyncio.current_task()
            await self._execute(task)

    async def _execute(self, task: BatchTask) -> None:
        task.status = "running"
        task.started_at = time.time()
        try:
            engine = get_engine()
            if engine is None:
                raise RuntimeError("engine not ready")
            s = SynthSettings.from_dict(task.settings)
            t0 = time.time()
            audio = await asyncio.to_thread(engine.synth_one, task.text, s)
            dt = time.time() - t0
            base = f"batch_{task.id}"
            filename = await asyncio.to_thread(save_output, audio, engine.sr, s, base)
            task.result_file = filename
            task.status = "done"
            log.info("batch: %s done in %.1fs -> %s", task.id, dt, filename)
        except asyncio.CancelledError:
            task.status = "cancelled"
            raise
        except Exception as e:
            task.status = "error"
            task.error = f"{type(e).__name__}: {e}"
            log.warning("batch: %s error: %s", task.id, task.error)
        finally:
            task.finished_at = time.time()
            task._task = None
