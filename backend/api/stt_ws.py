"""WebSocket STT endpoint: /ws/stt
Протокол (JSON):
  ← {"type":"ready","model":"base","sr":16000}
  → {"type":"start","lang":"ru","model":"base"}
  → {"type":"audio","data":"<base64 pcm_s16le_16k_mono>"} (много раз)
  → {"type":"stop"}
  ← {"type":"partial","text":"...","duration":N}
  ← {"type":"final","text":"...","lang":"ru","duration":N,"elapsed":N}
  ← {"type":"error","code":"...","message":"..."}
Опционально: → {"type":"reset"} — сбросить буфер, начать новый utterance.

Inference (whisper.transcribe) выполняется в run_in_executor,
один за раз (asyncio.Semaphore(1)), чтобы не блокировать event loop.
Rate-limit + blocklist + max 3 WS per IP — как у /ws/synthesize.
"""
from __future__ import annotations

import asyncio
import base64
import json
import logging
import time

try:
    from faster_whisper import WhisperModel as _FWModel  # JST_FASTER_WHISPER
    _HAS_FW = True
except ImportError:
    _FWModel = None
    _HAS_FW = False
from collections import defaultdict

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from ..security.hardening import blocklist as _blocklist
from ..security.hardening import rate_limiter as _rate_limiter

log = logging.getLogger("JST")
router = APIRouter(tags=["STT"])

# --- Ограничения ---
MAX_WS_PER_IP      = 3
MAX_AUDIO_BYTES    = 60 * 1024 * 1024   # 60 MB PCM = ~30 мин 16k mono int16
MAX_DURATION_SEC   = 300                # 5 мин
SAMPLE_RATE        = 16000
ALLOWED_MODELS     = {"tiny", "base", "small", "medium"}  # large — слишком медленно на CPU

# --- Общее состояние ---
_ws_active: dict[str, int] = defaultdict(int)
_ws_lock = asyncio.Lock()
_inference_sem = asyncio.Semaphore(1)
_whisper_models: dict[str, object] = {}   # openai-whisper (fallback)
_fw_models: dict[str, object] = {}         # faster-whisper (primary)
_whisper_lock = asyncio.Lock()


def _try_register_ip(ip: str) -> bool:
    if _ws_active[ip] >= MAX_WS_PER_IP:
        return False
    _ws_active[ip] += 1
    return True


def _unregister_ip(ip: str) -> None:
    if _ws_active.get(ip):
        _ws_active[ip] -= 1
        if _ws_active[ip] <= 0:
            _ws_active.pop(ip, None)


MAX_CACHED_MODELS = 2

def _load_whisper(model_name: str):
    """Загружает whisper-модель (блокирующе). Кэширует до MAX_CACHED_MODELS штук."""
    import whisper
    if model_name in _whisper_models:
        return _whisper_models[model_name]
    log.info("[stt_ws] загрузка whisper model=%s", model_name)
    m = whisper.load_model(model_name)
    _whisper_models[model_name] = m
    # LRU: если больше MAX — выкидываем самую старую (не по времени, а по порядку вставки)
    if len(_whisper_models) > MAX_CACHED_MODELS:
        oldest = next(iter(_whisper_models))
        if oldest != model_name:
            log.info("[stt_ws] выгружаю whisper model=%s (cache full)", oldest)
            _whisper_models.pop(oldest, None)
    return m


async def _transcribe_pcm(pcm_bytes: bytes, lang: str, model_name: str) -> str:
    """PCM s16le 16k mono → text. Выполняется в executor."""
    loop = asyncio.get_running_loop()
    async with _whisper_lock:
        model = await loop.run_in_executor(None, _load_whisper, model_name)

    # PCM int16 → numpy float32 / 32768
    import numpy as np
    audio = np.frombuffer(pcm_bytes, dtype=np.int16).astype(np.float32) / 32768.0

    def _do():
        # language=None → auto-detect; openai-whisper принимает None
        kw = {"fp16": False}
        if lang and lang != "auto":
            kw["language"] = lang
        else:
            # auto на коротких фразах врёт. Если <15s — используем язык
            # по доминирующему алфавиту невозможно (это PCM), поэтому default ru,
            # клиент должен сам передать lang. Но если всё же auto — Whisper сам решит.
            pass
        return model.transcribe(audio, **kw)

    async with _inference_sem:
        result = await loop.run_in_executor(None, _do)
    return (result.get("text") or "").strip()


@router.websocket("/ws/stt")
async def ws_stt(ws: WebSocket):
    ip = ws.client.host if ws.client else "unknown"

    if _blocklist.is_banned(ip):
        await ws.close(code=1008, reason="IP blocked")
        return
    if not _rate_limiter.check(ip, "/ws/stt"):
        await ws.close(code=1008, reason="rate limit")
        return
    if not _try_register_ip(ip):
        await ws.close(code=1008, reason="Too many WS connections")
        return

    await ws.accept()
    lang = "ru"
    model_name = "small"
    buf = bytearray()

    try:
        await ws.send_text(json.dumps({
            "type": "ready",
            "sr": SAMPLE_RATE,
            "format": "pcm_s16le_mono",
            "model_default": "small",
            "max_seconds": MAX_DURATION_SEC,
        }))

        async def send(obj):
            try:
                await ws.send_text(json.dumps(obj, ensure_ascii=False))
            except Exception:
                pass

        while True:
            raw = await ws.receive_text()
            try:
                msg = json.loads(raw)
            except Exception:
                await send({"type": "error", "code": "bad_json", "message": "invalid JSON"})
                continue

            mtype = (msg.get("type") or "").strip()

            if mtype == "start":
                lng = (msg.get("lang") or "ru").lower()
                m = (msg.get("model") or "small").lower()
                if m not in ALLOWED_MODELS:
                    await send({"type": "error", "code": "bad_model", "message": f"model must be one of {sorted(ALLOWED_MODELS)}"})
                    continue
                lang, model_name = lng, m
                buf.clear()
                await send({"type": "started", "lang": lang, "model": model_name})

            elif mtype == "audio":
                data = msg.get("data") or ""
                try:
                    chunk = base64.b64decode(data, validate=True)
                except Exception:
                    await send({"type": "error", "code": "bad_base64", "message": "invalid base64"})
                    continue
                if len(buf) + len(chunk) > MAX_AUDIO_BYTES:
                    await send({"type": "error", "code": "too_long", "message": f"> {MAX_AUDIO_BYTES} bytes"})
                    continue
                buf.extend(chunk)

            elif mtype == "reset":
                buf.clear()
                await send({"type": "reset_ok"})

            elif mtype == "stop":
                n_samples = len(buf) // 2
                duration = n_samples / SAMPLE_RATE
                if duration < 0.2:
                    await send({"type": "final", "text": "", "lang": lang, "duration": duration, "elapsed": 0})
                    buf.clear()
                    continue
                t0 = time.time()
                try:
                    text = await _transcribe_pcm(bytes(buf), lang, model_name)
                except Exception as e:
                    log.exception("stt_ws transcribe")
                    await send({"type": "error", "code": "transcribe_failed", "message": str(e)[:300]})
                    buf.clear()
                    continue
                await send({
                    "type": "final",
                    "text": text,
                    "lang": lang,
                    "duration": round(duration, 2),
                    "elapsed": round(time.time() - t0, 2),
                    "model": model_name,
                })
                buf.clear()

            else:
                await send({"type": "error", "code": "bad_type", "message": f"unknown type {mtype!r}"})

    except WebSocketDisconnect:
        pass
    except Exception as e:
        log.exception("ws_stt error")
        try:
            await ws.send_text(json.dumps({"type": "error", "code": "unknown", "message": str(e)[:300]}))
        except Exception:
            pass
    finally:
        _unregister_ip(ip)


def ws_stt_active_count() -> int:
    return sum(_ws_active.values())
