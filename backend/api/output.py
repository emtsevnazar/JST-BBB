"""Output API: list/get/clear/download-all-zip/download-all-merged."""

from __future__ import annotations

import logging
import os
import subprocess
import tempfile
import zipfile

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask

from ..core.paths import OUTPUT

log = logging.getLogger("JST")
router = APIRouter(tags=["Output"])


@router.get("/api/output")
async def list_output():
    exts = {".wav", ".mp3", ".flac", ".ogg", ".m4a", ".opus"}
    files = sorted(OUTPUT.glob("*.*"), key=lambda p: p.stat().st_mtime, reverse=True)
    files = [f for f in files if f.suffix.lower() in exts]
    return {
        "files": [
            {"name": p.name, "size": p.stat().st_size, "mtime": int(p.stat().st_mtime)}
            for p in files[:50]
        ]
    }


@router.get("/output/{filename}")
async def get_output(filename: str):
    p = OUTPUT / filename
    if not p.exists() or not str(p.resolve()).startswith(str(OUTPUT.resolve())):
        raise HTTPException(404)
    return FileResponse(p)


@router.post("/api/clear-history")
async def clear_history():
    exts = {".wav", ".mp3", ".flac", ".ogg", ".m4a", ".opus"}
    removed = 0
    for f in OUTPUT.iterdir():
        if f.suffix.lower() in exts or f.name == ".concat_list.txt":
            try:
                f.unlink()
                removed += 1
            except Exception as e:
                log.warning("clear: %s", e)
    return {"ok": True, "removed": removed}


@router.get("/api/download-all-zip")
async def download_all_zip():
    exts = {".wav", ".mp3", ".flac", ".ogg", ".m4a", ".opus"}
    files = [f for f in OUTPUT.iterdir() if f.suffix.lower() in exts]
    if not files:
        raise HTTPException(404, "No files")
    # v1.3.0: ZIP на диск (не в RAM) — избегаем OOM при больших output/
    tmp = tempfile.NamedTemporaryFile(  # noqa: SIM115
        suffix=".zip", delete=False, dir=str(OUTPUT), prefix=".jst_all_"
    )
    tmp.close()
    try:
        with zipfile.ZipFile(tmp.name, "w", zipfile.ZIP_DEFLATED) as z:
            for f in files:
                z.write(str(f), arcname=f.name)
    except Exception:
        try:
            os.unlink(tmp.name)
        except OSError:
            pass
        raise
    return FileResponse(
        tmp.name,
        media_type="application/zip",
        filename="jst_all.zip",
        background=BackgroundTask(os.unlink, tmp.name),
    )


@router.get("/api/download-all-merged")
async def download_all_merged():
    files = sorted(OUTPUT.glob("*.wav"), key=lambda p: p.stat().st_mtime)
    if not files:
        raise HTTPException(404, "No wav files")
    list_file = OUTPUT / ".concat_list.txt"
    list_file.write_text("\n".join([f"file '{f.name}'" for f in files]))
    out = OUTPUT / "ALL_MERGED.wav"

    def _cleanup_merged():
        for p in (out, list_file):
            try:
                if p.exists():
                    p.unlink()
            except OSError:
                pass

    try:
        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-f",
                "concat",
                "-safe",
                "0",
                "-i",
                str(list_file),
                "-c",
                "copy",
                str(out),
            ],
            check=True,
            capture_output=True,
            cwd=str(OUTPUT),
        )
        return FileResponse(
            out,
            media_type="audio/wav",
            filename="ALL_MERGED.wav",
            background=BackgroundTask(_cleanup_merged),
        )
    except Exception as e:
        log.warning("merge error: %s", e)
        _cleanup_merged()
        raise HTTPException(500, "Merge failed (install ffmpeg)")
