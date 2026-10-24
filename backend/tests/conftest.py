"""Pytest fixtures: TestClient + FakeEngine (не грузит реальную модель)."""

from __future__ import annotations

import numpy as np
import pytest
from fastapi.testclient import TestClient


class FakeEngine:
    """Минимальный Engine для быстрых тестов."""

    sr = 24000
    device = "cpu"
    current_mode = "core"
    mtl_engine = None
    qwen_tts = None
    cosyvoice = None
    voxcpm = None
    clone_engine = None

    def __init__(self, device="cpu", reference_wav=None, **kw):
        pass

    def set_mode(self, m):
        self.current_mode = m

    def parse_markup(self, text):
        return [
            {
                "text": text,
                "emphasize": False,
                "volume": 1.0,
                "whisper": False,
                "speed": 1.0,
                "pause": 0.0,
            }
        ]

    def split_into_sentences(self, text, mode="medium"):
        return [text]

    def silence(self, sec):
        return np.zeros(int(sec * self.sr), dtype=np.float32)

    def synth_one(self, *a, **kw):
        return np.zeros(self.sr // 2, dtype=np.float32)


@pytest.fixture
def client(monkeypatch):
    """TestClient с FakeEngine — startup не загружает реальную модель.

    base_url=http://127.0.0.1 — чтобы TrustedHostMiddleware пропускал запросы
    (по умолчанию TestClient шлёт Host: testserver, а его нет в allowed_hosts).
    """
    import backend.app as app_mod
    from backend.core import state as state_mod

    monkeypatch.setattr(app_mod, "Engine", FakeEngine)
    monkeypatch.setattr(state_mod, "_engine", None)

    with TestClient(app_mod.app, base_url="http://127.0.0.1") as c:
        yield c
