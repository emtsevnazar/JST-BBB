"""Voices API: list/create/upload/upload-blob/rebuild-reference."""
from __future__ import annotations
import logging, shutil, subprocess, time
from pathlib import Path

from fastapi import APIRouter, HTTPException, UploadFile, File, Form

from ..core.paths import VOICES, OUTPUT, SUPPORTED
from ..core.utils import _num
from ..security.safety import validate_voice_name, validate_audio_file, safe_path
from ..services.references import build_reference

log = logging.getLogger("JST")
router = APIRouter()


@router.get("/api/voices")
async def list_voices():
    items = []
    for d in sorted(VOICES.iterdir()):
        if not d.is_dir() or d.name.startswith("."): continue
        files = [f for f in d.iterdir() if f.suffix.lower() in SUPPORTED]
        has_ref = (OUTPUT / f"merged_reference_{d.name}.wav").exists()
        items.append({"name": d.name, "files": len(files), "has_ref": has_ref})
    return {"voices": items}


@router.post("/api/voices/create")
async def create_voice(name: str = Form(...)):
    name = name.strip().replace(" ", "_")
    if not name or not all(c.isalnum() or c in "_-" for c in name):
        raise HTTPException(400, "Name: a-zA-Z0-9_- only")
    (VOICES / name).mkdir(exist_ok=True)
    return {"ok": True, "name": name}


@router.post("/api/voices/{voice}/upload")
async def upload_file(voice: str, file: UploadFile = File(...)):
    try:
        voice = validate_voice_name(voice)
    except ValueError as e:
        raise HTTPException(400, str(e))
    folder = VOICES / voice
    if not folder.is_dir(): raise HTTPException(404)
    contents = await file.read()
    try:
        validate_audio_file(file.filename, contents)
        dst = safe_path(folder, file.filename)
    except ValueError as e:
        raise HTTPException(400, str(e))
    dst.write_bytes(contents)
    return {"ok": True, "file": file.filename}


@router.post("/api/voices/{voice}/upload-blob")
async def upload_blob(voice: str, file: UploadFile = File(...)):
    """Принимает запись из браузера (webm/opus), конвертирует в WAV."""
    try:
        voice = validate_voice_name(voice)
    except ValueError as e:
        raise HTTPException(400, str(e))
    folder = VOICES / voice
    if not folder.is_dir():
        raise HTTPException(404, "Профиль не найден")
    ts = int(time.time())
    ext = (Path(file.filename).suffix or ".webm").lower()
    if ext not in {".webm", ".ogg", ".wav", ".mp3", ".m4a", ".opus"}:
        raise HTTPException(400, f"Unsupported format: {ext}")
    tmp = folder / f"_rec_{ts}{ext}"
    dst = folder / f"rec_{ts}.wav"
    try:
        with open(tmp, "wb") as f:
            shutil.copyfileobj(file.file, f)
        subprocess.run(
            ["ffmpeg", "-y", "-i", str(tmp), "-ar", "24000", "-ac", "1", str(dst)],
            check=True, capture_output=True, timeout=30
        )
        tmp.unlink(missing_ok=True)
        return {"ok": True, "file": dst.name}
    except Exception as e:
        log.exception("upload-blob")
        raise HTTPException(500, f"Не удалось: {e}")


@router.post("/api/voices/{voice}/rebuild-reference")
async def rebuild(voice: str, ref_length: str = Form("15")):
    try:
        voice = validate_voice_name(voice)
    except ValueError as e:
        raise HTTPException(400, str(e))
    out = build_reference(voice, _num(ref_length, 15.0))
    if not out: raise HTTPException(400, "Failed to build")
    return {"ok": True, "file": out.name}
