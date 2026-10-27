"""Ollama client — no-op если сервер недоступен."""

from __future__ import annotations

import json
import os
import urllib.request

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:3b")
CACHE: dict = {}


def is_available(timeout: float = 1.0) -> bool:
    try:
        req = urllib.request.Request(OLLAMA_URL + "/api/tags")
        with urllib.request.urlopen(req, timeout=timeout) as r:  # nosec B310
            return r.status == 200
    except Exception:
        return False


def generate(prompt: str, system: str = "", timeout: float = 30.0):
    if not is_available():
        return None
    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "system": system,
        "stream": False,
        "options": {"temperature": 0.1, "num_predict": 256},
    }
    try:
        req = urllib.request.Request(
            OLLAMA_URL + "/api/generate",
            data=json.dumps(payload).encode(),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=timeout) as r:  # nosec B310
            return json.loads(r.read()).get("response", "").strip()
    except Exception:
        return None
