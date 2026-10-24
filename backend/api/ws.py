"""WebSocket synthesis endpoint (rate-limited by IP)."""

from __future__ import annotations

import asyncio
import json
import logging
import time

import numpy as np
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from ..core.naming import NAMER
from ..core.state import get_engine
from ..core.utils import _int, _num
from ..engine import SynthSettings
from ..services.output_service import save_output
from ..services.references import resolve_reference

log = logging.getLogger("JST")
router = APIRouter()


MAX_WS_PER_IP = 3

_ws_active: dict[str, int] = {}


def _try_register_ip(ip: str) -> bool:
    """True, если под IP ещё есть слот (атомарно инкрементит)."""
    if _ws_active.get(ip, 0) >= MAX_WS_PER_IP:
        return False
    _ws_active[ip] = _ws_active.get(ip, 0) + 1
    return True


def _unregister_ip(ip: str) -> None:
    _ws_active[ip] = max(0, _ws_active.get(ip, 0) - 1)


async def _ws_orig(ws: WebSocket):
    ENGINE = get_engine()
    await ws.accept()
    loop = asyncio.get_event_loop()
    try:
        while True:
            data = json.loads(await ws.receive_text())
            if data.get("type") != "synthesize":
                continue
            text = data.get("text", "") or ""
            try:
                from ..security.safety import validate_text as _vt

                text = _vt(text)
            except Exception as _e:
                await ws.send_text(json.dumps({"type": "error", "message": str(_e)}))
                continue
            voice = data.get("voice", "") or ""
            s = SynthSettings.from_dict(data.get("settings", {}))

            # Применяем mood через параметры (не префиксом в текст)
            _mood = getattr(s, "mood", "auto") or "auto"
            try:
                from ..services.jst_moods import detect_mood as _dm

                if _mood == "auto":
                    _mood = _dm(text)
                _MOOD_PARAMS = {
                    "neutral": {
                        "exaggeration": 0.50,
                        "cfg_weight": 0.50,
                        "temperature": 0.80,
                        "speed": 1.00,
                    },
                    "sad": {
                        "exaggeration": 0.40,
                        "cfg_weight": 0.55,
                        "temperature": 0.75,
                        "speed": 0.90,
                    },
                    "whisper": {
                        "exaggeration": 0.30,
                        "cfg_weight": 0.60,
                        "temperature": 0.70,
                        "speed": 0.85,
                    },
                    "asmr": {
                        "exaggeration": 0.25,
                        "cfg_weight": 0.65,
                        "temperature": 0.70,
                        "speed": 0.80,
                    },
                    "podcast": {
                        "exaggeration": 0.60,
                        "cfg_weight": 0.45,
                        "temperature": 0.85,
                        "speed": 1.05,
                    },
                    "audiobook": {
                        "exaggeration": 0.55,
                        "cfg_weight": 0.50,
                        "temperature": 0.78,
                        "speed": 1.00,
                    },
                    "news": {
                        "exaggeration": 0.45,
                        "cfg_weight": 0.55,
                        "temperature": 0.78,
                        "speed": 1.00,
                    },
                    "trailer": {
                        "exaggeration": 0.75,
                        "cfg_weight": 0.35,
                        "temperature": 0.85,
                        "speed": 0.95,
                    },
                }
                _mp = _MOOD_PARAMS.get(_mood)
                if _mp:
                    s.exaggeration = _mp["exaggeration"]
                    s.cfg_weight = _mp["cfg_weight"]
                    s.temperature = _mp["temperature"]
                    s.speed = _mp["speed"]
                    log.info("[mood] %s -> exag=%.2f speed=%.2f", _mood, s.exaggeration, s.speed)
            except Exception as _e:
                log.warning("mood apply failed: %s", _e)
            try:
                ENGINE.set_mode(s.mode)
            except Exception as e:
                log.warning("set_mode: %s", e)
            ref = resolve_reference(voice, _int(s.ref_length, 15))
            if not ref or not ref.exists():
                await ws.send_text(
                    json.dumps({"type": "error", "message": f"No reference for '{voice}'"})
                )
                continue
            if not text.strip():
                await ws.send_text(json.dumps({"type": "error", "message": "Empty text"}))
                continue
            parsed = ENGINE.parse_markup(text)
            default_pause = _num(s.pause_between, 0.20)
            plan = []
            for seg in parsed:
                sp = _num(seg.get("pause"), 0.0)
                if not seg.get("text"):
                    plan.append(
                        {
                            "text": "",
                            "pause": sp if sp > 0 else default_pause,
                            "emph": False,
                            "volume": 1.0,
                            "whisper": False,
                            "speed": 1.0,
                        }
                    )
                    continue
                for ph in ENGINE.split_into_sentences(seg["text"], s.sentence_split or "medium"):
                    plan.append(
                        {
                            "text": ph,
                            "pause": default_pause,
                            "emph": bool(seg.get("emphasize")),
                            "volume": _num(seg.get("volume"), 1.0),
                            "whisper": bool(seg.get("whisper")),
                            "speed": _num(seg.get("speed"), 1.0),
                        }
                    )
            log.info(
                "Plan: %d phrases, mode=%s, ref=%ds",
                len(plan),
                ENGINE.current_mode,
                _int(s.ref_length, 15),
            )
            await ws.send_text(
                json.dumps(
                    {
                        "type": "start",
                        "sr": ENGINE.sr,
                        "sentences": len(plan),
                        "mode": ENGINE.current_mode,
                    }
                )
            )
            queue: asyncio.Queue = asyncio.Queue()

            def send_stage(stage, detail=""):
                msg = {"type": "stage", "stage": stage, "detail": detail, "total": len(plan)}
                asyncio.run_coroutine_threadsafe(ws.send_text(json.dumps(msg)), loop)

            def producer():
                t_all = time.time()
                try:
                    send_stage("prepare", "Готовлю референс")
                    chunks = []
                    for i, item in enumerate(plan):
                        if not item["text"]:
                            p = _num(item["pause"], default_pause)
                            if p > 0:
                                chunks.append(ENGINE.silence(p))
                            continue
                        t0 = time.time()
                        # Выбор метода синтеза
                        if (
                            s.mode == "jst_clone"
                            and getattr(ENGINE, "clone_engine", None) is not None
                        ):
                            c = ENGINE.synth_jst_clone(item["text"], str(ref), s, voice_name=voice)
                        elif s.mode == "voxcpm" and getattr(ENGINE, "voxcpm", None) is not None:
                            c = ENGINE.synth_voxcpm(item["text"], str(ref), s, prompt_text="")
                        elif s.mode == "qwen" and getattr(ENGINE, "qwen_tts", None) is not None:
                            c = ENGINE.synth_qwen(item["text"], str(ref), s, prompt_text="")
                        elif (
                            s.mode == "cosyvoice" and getattr(ENGINE, "cosyvoice", None) is not None
                        ):
                            c = ENGINE.synth_cosyvoice(item["text"], str(ref), s, prompt_text="")
                        else:
                            c = ENGINE.synth_one(
                                item["text"],
                                str(ref),
                                s,
                                emphasize=item["emph"],
                                volume_mul=_num(item["volume"], 1.0),
                                whisper=item["whisper"],
                                speed_mul=_num(item["speed"], 1.0),
                            )
                        chunks.append(c)
                        p = _num(item["pause"], default_pause)
                        if p > 0:
                            chunks.append(ENGINE.silence(p))
                        asyncio.run_coroutine_threadsafe(queue.put(("chunk", (i, c))), loop)
                        log.info(
                            "  [%d/%d] %.1fs synth, %.2fs audio",
                            i + 1,
                            len(plan),
                            time.time() - t0,
                            len(c) / ENGINE.sr,
                        )
                    send_stage("post", "Постобработка и сохранение")
                    full = np.concatenate(chunks) if chunks else np.zeros(1, np.float32)
                    base = NAMER.next_name()
                    fname = save_output(full, ENGINE.sr, s, base)
                    asyncio.run_coroutine_threadsafe(queue.put(("done", fname)), loop)
                    log.info(
                        "OK %.1fs -> %s (%.2fs audio)",
                        time.time() - t_all,
                        fname,
                        len(full) / ENGINE.sr,
                    )
                except Exception as e:
                    log.exception("synth error")
                    asyncio.run_coroutine_threadsafe(queue.put(("error", str(e))), loop)

            loop.run_in_executor(None, producer)
            while True:
                kind, payload = await queue.get()
                if kind == "chunk":
                    await ws.send_bytes(payload[1].astype(np.float32).tobytes())
                elif kind == "done":
                    await ws.send_text(json.dumps({"type": "done", "file": payload}))
                    break
                elif kind == "error":
                    await ws.send_text(json.dumps({"type": "error", "message": payload}))
                    break
    except WebSocketDisconnect:
        pass
    except Exception as e:
        log.exception("WS error")
        try:
            await ws.send_text(json.dumps({"type": "error", "message": str(e)}))
        except Exception:
            pass


@router.websocket("/ws/synthesize")
async def ws_synthesize(ws: WebSocket):
    """Обёртка: ограничивает кол-во WS-соединений с одного IP."""
    ip = ws.client.host if ws.client else "unknown"
    if not _try_register_ip(ip):
        await ws.close(code=1008, reason="Too many WS connections")
        return
    try:
        await _ws_orig(ws)
    finally:
        _unregister_ip(ip)


def ws_active_count() -> int:
    """Суммарное число активных WS-подключений (для /health)."""
    return sum(_ws_active.values()) if _ws_active else 0
