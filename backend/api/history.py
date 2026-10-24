"""P4.2: History API.

GET /api/history?limit=50    -> {ok, tasks: [...]}
GET /api/history/{task_id}   -> {ok, task} | 404
"""

from __future__ import annotations

import io
import json
import zipfile

from fastapi import APIRouter, HTTPException, Request, Response

from ..services import output_service

router = APIRouter(tags=["History"])


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


@router.get("/api/history/{task_id}/export")
async def export_history(task_id: str, request: Request):
    """P4.5: ZIP (audio + settings.json + metadata.json)."""
    h = _db(request)
    task = h.get_task(task_id)
    if task is None:
        raise HTTPException(404, "task not found")
    if task["status"] != "done" or not task.get("result_file"):
        raise HTTPException(409, "task not completed")
    audio_path = output_service.OUTPUT / task["result_file"]
    if not audio_path.exists():
        raise HTTPException(410, "audio file missing")
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.write(audio_path, arcname="audio" + audio_path.suffix)
        zf.writestr(
            "settings.json",
            json.dumps(task.get("settings", {}), indent=2, ensure_ascii=False),
        )
        meta = {
            k: task.get(k)
            for k in (
                "id",
                "text",
                "voice",
                "status",
                "result_file",
                "created_at",
                "started_at",
                "finished_at",
            )
        }
        zf.writestr("metadata.json", json.dumps(meta, indent=2, ensure_ascii=False))
    return Response(
        content=buf.getvalue(),
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="jst_{task_id}.zip"'},
    )
