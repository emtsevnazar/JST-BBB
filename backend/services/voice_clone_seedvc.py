"""HTTP-клиент к Seed-VC worker (порт 8100). Отдельный процесс, отдельный venv.
Обёртка не импортирует Seed-VC — только HTTP."""

import logging
import os

import httpx

log = logging.getLogger("JST.VoiceClone")
SEEDVC_URL = os.getenv("SEEDVC_URL", "http://127.0.0.1:8100")


class VoiceCloneError(Exception):
    pass


async def clone_voice(
    source_bytes: bytes,
    target_bytes: bytes,
    source_name: str = "source.wav",
    target_name: str = "target.wav",
    timeout: float = 600.0,
) -> bytes:
    if len(source_bytes) < 1000:
        raise VoiceCloneError(f"source too small ({len(source_bytes)} bytes)")
    if len(target_bytes) < 1000:
        raise VoiceCloneError(f"target too small ({len(target_bytes)} bytes)")

    url = f"{SEEDVC_URL}/clone"
    files = {
        "source": (source_name, source_bytes, "audio/wav"),
        "target": (target_name, target_bytes, "audio/wav"),
    }
    try:
        async with httpx.AsyncClient(timeout=timeout) as c:
            r = await c.post(url, files=files)
    except httpx.ConnectError as e:
        raise VoiceCloneError(f"Seed-VC worker unreachable at {SEEDVC_URL}: {e}")
    except httpx.TimeoutException:
        raise VoiceCloneError(f"Seed-VC timeout ({timeout}s) at {SEEDVC_URL}")
    except Exception as e:
        raise VoiceCloneError(f"Seed-VC request failed: {type(e).__name__}: {e}")

    if r.status_code != 200:
        body = (r.text or "")[:600]
        raise VoiceCloneError(f"Seed-VC HTTP {r.status_code}: {body}")
    if len(r.content) < 100 or not r.content.startswith(b"RIFF"):
        raise VoiceCloneError(f"Seed-VC returned non-WAV ({len(r.content)} bytes)")

    log.info(
        "clone ok: %d bytes (source=%d target=%d)",
        len(r.content),
        len(source_bytes),
        len(target_bytes),
    )
    return r.content


async def worker_health() -> dict:
    try:
        async with httpx.AsyncClient(timeout=3.0) as c:
            r = await c.get(f"{SEEDVC_URL}/healthz")
        if r.status_code == 200:
            return {"ok": True, "url": SEEDVC_URL, "worker": r.json()}
        return {"ok": False, "url": SEEDVC_URL, "status": r.status_code}
    except Exception as e:
        return {"ok": False, "url": SEEDVC_URL, "error": f"{type(e).__name__}: {e}"}
