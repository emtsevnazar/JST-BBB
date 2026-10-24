"""System API: presets, formats, languages."""
from fastapi import APIRouter, Form, HTTPException

from ..core.constants import DEFAULT_PRESETS
from ..core.state import get_engine

router = APIRouter()


@router.get("/api/presets")
async def presets(): return {"presets": DEFAULT_PRESETS}


@router.get("/api/formats")
async def formats():
    return {"formats": ["wav","mp3","flac","ogg","m4a","opus"],
            "sample_rates": [8000,11025,16000,22050,24000,32000,44100,48000,88200,96000],
            "bit_depths": [8,16,24,32]}


@router.get("/api/languages")
async def list_languages():
    # Всегда отдаём весь список. Блокировка — на фронте по модели.
    return {"languages": [{"code": c, "available": True} for c in ("ru", "en")]}


@router.post("/api/mode")
async def set_mode(mode: str = Form(...)):
    ENGINE = get_engine()
    m = (mode or "core").lower()
    if m == "zeroshot": m = "core"
    if m not in ("core", "multi", "jst_clone", "voxcpm", "qwen", "cosyvoice"):
        raise HTTPException(400, "mode: core|multi|jst_clone|voxcpm|qwen|cosyvoice")
    ENGINE.set_mode(m)
    return {"ok": True, "mode": ENGINE.current_mode}
