"""Output API: list/get/clear/download-all-zip/download-all-merged."""

from __future__ import annotations

import io
import logging
import subprocess
import zipfile

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, StreamingResponse

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
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        for f in files:
            z.write(str(f), arcname=f.name)
    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=jst_all.zip"},
    )


@router.get("/api/download-all-merged")
async def download_all_merged():
    files = sorted(OUTPUT.glob("*.wav"), key=lambda p: p.stat().st_mtime)
    if not files:
        raise HTTPException(404, "No wav files")
    list_file = OUTPUT / ".concat_list.txt"
    list_file.write_text("\n".join([f"file '{f.name}'" for f in files]))
    out = OUTPUT / "ALL_MERGED.wav"
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
        return FileResponse(out, media_type="audio/wav", filename="ALL_MERGED.wav")
    except Exception as e:
        log.warning("merge error: %s", e)
        raise HTTPException(500, "Merge failed (install ffmpeg)")
