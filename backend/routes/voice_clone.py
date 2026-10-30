"""POST /api/voice-clone (auth) — клонирование через Seed-VC worker.
GET  /api/voice-clone/health (public).
Лимиты: 20 MB/файл, audio/* MIME, 3 запроса/60s на IP,
1 одновременный inference (semaphore)."""

import asyncio
import logging
import time
from collections import defaultdict

from fastapi import APIRouter, File, HTTPException, Request, UploadFile
from fastapi.responses import Response

from backend.services.voice_clone_seedvc import VoiceCloneError, clone_voice, worker_health

log = logging.getLogger("JST.VoiceClone.Routes")
router = APIRouter()

MAX_FILE_BYTES = 20 * 1024 * 1024
ALLOWED_MIME = {
    "audio/wav",
    "audio/wave",
    "audio/x-wav",
    "audio/mpeg",
    "audio/mp4",
    "audio/ogg",
    "audio/flac",
    "audio/x-m4a",
    "application/octet-stream",
}

_RL: dict[str, list[float]] = defaultdict(list)
_RL_LOCK = asyncio.Lock()
_RL_WINDOW = 60.0
_RL_LIMIT = 3

# Семафор: один Seed-VC = один inference за раз
_INFERENCE_SEM = asyncio.Semaphore(1)
_INFERENCE_BUSY = {"n": 0}


async def _rate_limit(ip: str) -> None:
    now = time.monotonic()
    async with _RL_LOCK:
        bucket = [t for t in _RL[ip] if now - t < _RL_WINDOW]
        if len(bucket) >= _RL_LIMIT:
            raise HTTPException(
                429, f"rate limit: max {_RL_LIMIT} clone requests per {int(_RL_WINDOW)}s"
            )
        bucket.append(now)
        _RL[ip] = bucket


async def _validate_file(up: UploadFile, name: str) -> bytes:
    ct = (up.content_type or "").lower()
    if ct and ct not in ALLOWED_MIME:
        raise HTTPException(415, f"{name}: unsupported content-type {ct!r}")
    data = await up.read()
    if len(data) < 1000:
        raise HTTPException(400, f"{name}: too small ({len(data)} bytes)")
    if len(data) > MAX_FILE_BYTES:
        raise HTTPException(413, f"{name}: too large ({len(data)} bytes > {MAX_FILE_BYTES})")
    return data


@router.get("/api/voice-clone/health", include_in_schema=False)
async def health():
    return await worker_health()


@router.post("/api/voice-clone", include_in_schema=False)
async def voice_clone(
    request: Request,
    source: UploadFile = File(..., description="source voice to clone"),
    target: UploadFile = File(..., description="reference voice sample"),
):
    ip = request.client.host if request.client else "unknown"
    await _rate_limit(ip)

    if _INFERENCE_BUSY["n"] > 0:
        raise HTTPException(429, "another clone is in progress; retry in a few seconds")

    src_bytes = await _validate_file(source, "source")
    tgt_bytes = await _validate_file(target, "target")

    _INFERENCE_BUSY["n"] += 1
    try:
        async with _INFERENCE_SEM:
            wav = await clone_voice(
                src_bytes,
                tgt_bytes,
                source_name=source.filename or "source.wav",
                target_name=target.filename or "target.wav",
            )
    except VoiceCloneError as e:
        log.warning("voice-clone failed (ip=%s): %s", ip, e)
        raise HTTPException(status_code=503, detail=str(e))
    finally:
        _INFERENCE_BUSY["n"] -= 1

    return Response(
        content=wav,
        media_type="audio/wav",
        headers={
            "Content-Disposition": 'attachment; filename="clone.wav"',
            "X-Clone-Size": str(len(wav)),
        },
    )
