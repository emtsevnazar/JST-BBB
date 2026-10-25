"""P4.2: History API.

GET /api/history?limit=50    -> {ok, tasks: [...]}
GET /api/history/{task_id}   -> {ok, task} | 404
"""

from __future__ import annotations

import json
import os
import tempfile
import zipfile

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask

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
    # v1.3.0: ZIP на диск (не в RAM)
    tmp = tempfile.NamedTemporaryFile(  # noqa: SIM115
        suffix=".zip",
        delete=False,
        dir=str(output_service.OUTPUT),
        prefix=f".jst_hist_{task_id}_",
    )
    tmp.close()
    try:
        with zipfile.ZipFile(tmp.name, "w", zipfile.ZIP_DEFLATED) as zf:
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
    except Exception:
        try:
            os.unlink(tmp.name)
        except OSError:
            pass
        raise
    return FileResponse(
        tmp.name,
        media_type="application/zip",
        filename=f"jst_{task_id}.zip",
        background=BackgroundTask(os.unlink, tmp.name),
    )
