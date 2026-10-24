"""P4.2: History API.

GET /api/history?limit=50    -> {ok, tasks: [...]}
GET /api/history/{task_id}   -> {ok, task} | 404
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request

router = APIRouter()


def _db(request: Request):
    h = getattr(request.app.state, "history_db", None)
    if h is None:
        raise HTTPException(503, "history not initialized")
    return h


@router.get("/api/history")
async def list_history(request: Request, limit: int = 50):
    h = _db(request)
    return {"ok": True, "tasks": h.list_tasks(limit)}


@router.get("/api/history/{task_id}")
async def get_history(task_id: str, request: Request):
    h = _db(request)
    task = h.get_task(task_id)
    if task is None:
        raise HTTPException(404, "task not found")
    return {"ok": True, "task": task}
