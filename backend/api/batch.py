"""P4.1: Batch synthesis API.

POST   /api/batch              -> {task_id}
GET    /api/batch/{task_id}    -> BatchTask
GET    /api/batch?limit=50     -> {tasks: [...]}
DELETE /api/batch/{task_id}    -> {ok, cancelled}
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

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
