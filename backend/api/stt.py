"""STT API: speech-to-text через openai-whisper (модель кэшируется в модуле)."""

from __future__ import annotations

import logging
import shutil
import subprocess
import time
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from ..core.paths import OUTPUT

log = logging.getLogger("JST")
router = APIRouter(tags=["STT"])

_STT_MODEL = None


@router.post("/api/stt")
async def speech_to_text(file: UploadFile = File(...)):
    """Принимает WAV/WEBM, возвращает текст через openai-whisper."""
    _ext = (Path(file.filename).suffix or ".webm").lower()
    if _ext not in {".webm", ".ogg", ".wav", ".mp3", ".m4a", ".opus"}:
        raise HTTPException(400, f"Unsupported format: {_ext}")
    tmp_in = OUTPUT / f"_stt_in_{int(time.time())}{_ext}"
    tmp_wav = OUTPUT / f"_stt_{int(time.time())}.wav"
    try:
        with open(tmp_in, "wb") as f:
            shutil.copyfileobj(file.file, f)
        # Конвертируем в WAV 16kHz mono через ffmpeg
        try:
            subprocess.run(
                ["ffmpeg", "-y", "-i", str(tmp_in), "-ar", "16000", "-ac", "1", str(tmp_wav)],
                check=True,
                capture_output=True,
                timeout=30,
            )
        except Exception as e:
            log.warning("stt ffmpeg: %s", e)
            if tmp_in.suffix == ".wav":
                shutil.copy(str(tmp_in), str(tmp_wav))
            else:
                raise HTTPException(400, "Не удалось конвертировать аудио")
        # Whisper
        try:
            import whisper

            model = _STT_MODEL
            if model is None:
                model = whisper.load_model("base")
                globals()["_STT_MODEL"] = model
            result = model.transcribe(str(tmp_wav), language="ru")
            text = (result.get("text") or "").strip()
            return {"ok": True, "text": text}
        except ImportError:
            raise HTTPException(500, "openai-whisper не установлен")
        except Exception as e:
            log.exception("stt error")
            raise HTTPException(500, f"STT: {e}")
    finally:
        try:
            tmp_in.unlink(missing_ok=True)
        except Exception:
            pass
        try:
            tmp_wav.unlink(missing_ok=True)
        except Exception:
            pass
