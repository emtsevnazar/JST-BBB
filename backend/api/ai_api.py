# JST_AI_ENHANCE_TIMEOUT_V1
"""v1.10.0: AI preprocessing endpoints."""

from __future__ import annotations

import os

from fastapi import APIRouter

from ..ai import client, preprocess

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.get("/status")
async def ai_status():
    return {
        "enabled": os.getenv("JST_AI_ENABLED", "1") == "1",
        "ollama_available": client.is_available(),
        "model": client.OLLAMA_MODEL,
    }


@router.post("/enhance")
async def ai_enhance(req: dict):
    text = (req.get("text") or "").strip()
    if not text:
        return {"normalized": "", "mood": None, "error": "empty text"}
    return {"normalized": preprocess.normalize_text(text), "mood": preprocess.detect_mood(text)}
