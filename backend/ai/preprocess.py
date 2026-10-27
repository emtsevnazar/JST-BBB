"""Text normalization + mood detection через Ollama."""

from __future__ import annotations

import hashlib
import json
import time

from . import client

_PROMPTS = {
    "normalize": "Нормализуй текст для TTS. Расшифруй цифры, даты, аббревиатуры по-русски. Не меняй смысл. Верни ТОЛЬКО нормализованный текст.\nТекст: {text}",
    "mood": 'Определи настроение текста. Верни JSON: {{"mood": "neutral|sad|angry|happy|whisper", "confidence": 0.0-1.0}}\nТекст: {text}',
}


def _cache_key(kind: str, text: str) -> str:
    return hashlib.sha256((kind + ":" + text).encode()).hexdigest()[:16]


def normalize_text(text: str) -> str:
    if not text:
        return text
    key = _cache_key("norm", text)
    if key in client.CACHE:
        return client.CACHE[key].get("result", text)
    result = client.generate(_PROMPTS["normalize"].format(text=text))
    if result:
        client.CACHE[key] = {"result": result, "ts": time.time()}
        return result
    return text


def detect_mood(text: str) -> dict:
    if not text:
        return {"mood": "neutral", "confidence": 0.0, "fallback": True}
    key = _cache_key("mood", text)
    if key in client.CACHE:
        return client.CACHE[key]
    raw = client.generate(_PROMPTS["mood"].format(text=text))
    if raw:
        try:
            data = json.loads(raw)
            client.CACHE[key] = data
            return data
        except Exception:
            pass
    return {"mood": "neutral", "confidence": 0.0, "fallback": True}
