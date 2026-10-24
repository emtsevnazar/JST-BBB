"""P4.1: Batch synthesis API.

POST   /api/batch              -> {task_id}
GET    /api/batch/{task_id}    -> BatchTask
GET    /api/batch?limit=50     -> {tasks: [...]}
DELETE /api/batch/{task_id}    -> {ok, cancelled}
"""

from __future__ import annotations

import asyncio

from fastapi import APIRouter, HTTPException, Request, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, Field

from . import ws as ws_mod

router = APIRouter()


class BatchRequest(BaseModel):
    text: str = Field(min_length=1, max_length=10000)
    voice: str = ""
    settings: dict = Field(default_factory=dict)


def _queue(request: Request):
    q = getattr(request.app.state, "batch_queue", None)
    if q is None:
        raise HTTPException(503, "batch queue not initialized")
    return q


@router.post("/api/batch")
async def submit_batch(payload: BatchRequest, request: Request):
    q = _queue(request)
    task_id = q.submit(payload.text, payload.voice, payload.settings)
    return {"ok": True, "task_id": task_id}


@router.get("/api/batch/{task_id}")
async def get_batch(task_id: str, request: Request):
    q = _queue(request)
    task = q.get(task_id)
    if task is None:
        raise HTTPException(404, "task not found")
    return {"ok": True, "task": task.to_dict()}


@router.get("/api/batch")
async def list_batch(request: Request, limit: int = 50):
    q = _queue(request)
    return {"ok": True, "tasks": [t.to_dict() for t in q.list(limit)]}


@router.delete("/api/batch/{task_id}")
async def cancel_batch(task_id: str, request: Request):
    q = _queue(request)
    ok = q.cancel(task_id)
    if not ok:
        raise HTTPException(409, "task not cancellable")
    return {"ok": True, "cancelled": task_id}


@router.websocket("/ws/batch/{task_id}")
async def batch_status_ws(ws: WebSocket, task_id: str):
    """Push-статус BatchTask: initial state → updates → close на терминале."""
    ip = ws.client.host if ws.client else "unknown"
    if not ws_mod._try_register_ip(ip):
        await ws.close(code=1008, reason="Too many WS connections")
        return
    try:
        queue = getattr(ws.app.state, "batch_queue", None)
        task = queue.get(task_id) if queue is not None else None
        await ws.accept()
        if queue is None or task is None:
            await ws.close(code=4404, reason="task not found")
            return
        sub = queue.subscribe(task_id)
        try:
            await ws.send_json({"type": "status", "task": task.to_dict()})
            if task.status in ("done", "error", "cancelled"):
                await ws.close(code=1000, reason="terminal")
                return
            while True:
                try:
                    snap = await asyncio.wait_for(sub.get(), timeout=30.0)
                except TimeoutError:
                    await ws.send_json({"type": "ping"})
                    continue
                await ws.send_json({"type": "status", "task": snap})
                if snap["status"] in ("done", "error", "cancelled"):
                    await ws.close(code=1000, reason="terminal")
                    return
        except WebSocketDisconnect:
            pass
        finally:
            queue.unsubscribe(task_id, sub)
    finally:
        ws_mod._unregister_ip(ip)
