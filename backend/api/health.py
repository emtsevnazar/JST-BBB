"""Health API endpoint.

/health, /api/health, /api/models — все требуют get_engine() из core.state.
"""
from __future__ import annotations
import time
from pathlib import Path

from fastapi import APIRouter

from ..core.state import get_engine
from ..core.constants import MODEL_LANGS
from ..security.safety import startup_check, limiter

ROOT = Path(__file__).resolve().parents[2]

router = APIRouter()


_health_cache: dict = {"data": None, "ts": 0.0}
HEALTH_TTL = 60.0


@router.get("/api/health")
async def api_health():
    """Статус моделей и окружения (кэш 60 сек)."""
    now = time.time()
    cached = _health_cache["data"] is not None and (now - _health_cache["ts"]) < HEALTH_TTL
    if not cached:
        _health_cache["data"] = startup_check(ROOT)
        _health_cache["ts"] = now
    return {
        "ok": True,
        "checks": _health_cache["data"],
        "rate_limit_remaining": limiter.remaining(),
        "cached": cached
    }


@router.get("/health")
async def health():
    ENGINE = get_engine()
    return {"ok": True, "engine_ready": ENGINE is not None,
            "sr": ENGINE.sr if ENGINE else None,
            "device": ENGINE.device if ENGINE else None,
            "mode": ENGINE.current_mode if ENGINE else None}


@router.get("/api/models")
async def list_models():
    ENGINE = get_engine()
    lora_ok = False
    mtl_ok  = bool(ENGINE and getattr(ENGINE, "mtl_engine", None) is not None)
    qwen_ok = bool(ENGINE and getattr(ENGINE, "qwen_tts", None) is not None)
    cosy_ok = bool(ENGINE and getattr(ENGINE, "cosyvoice", None) is not None)
    return {"models": [
        {"code":"core",      "name":"Core",      "loaded": True,    "languages": MODEL_LANGS["core"]},
        {"code":"multi",     "name":"Multi",     "loaded": mtl_ok,  "languages": MODEL_LANGS["multi"]},
        {"code":"jst_clone", "name":"JST Clone", "loaded": bool(ENGINE and getattr(ENGINE, "clone_engine", None) is not None), "languages": ["ru","en","de","fr","es","it","pt","pl","tr","nl","sv","da","no","fi","el","he","ar","hi","sw","ms","zh","ja","ko"]},
        {"code":"voxcpm",    "name":"VoxCPM2",   "loaded": bool(ENGINE and getattr(ENGINE, "voxcpm", None) is not None), "languages": ["ru","en","zh","ja","ko","de","fr","es","it","pt","pl","tr","nl","sv","da","no","fi","el","he","ar","hi","sw","ms"]},
        {"code":"qwen",      "name":"Qwen3",     "loaded": qwen_ok, "languages": MODEL_LANGS["qwen"]},
        {"code":"cosyvoice", "name":"CosyVoice", "loaded": cosy_ok, "languages": MODEL_LANGS["cosyvoice"]}
    ]}
