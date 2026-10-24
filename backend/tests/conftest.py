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

    def synth_one(self, text, reference, settings, **kwargs):
        # Сигнатура как у реального Engine: (text, ref, settings, **kwargs).
        # Любой вызов с неправильным числом позиционных аргументов → TypeError.
        return np.zeros(self.sr // 2, dtype=np.float32)

    def synth_jst_clone(self, text, reference, settings, **kw):
        return np.zeros(self.sr // 2, dtype=np.float32)

    def synth_qwen(self, text, reference, settings, **kw):
        return np.zeros(self.sr // 2, dtype=np.float32)

    def synth_voxcpm(self, text, reference, settings, **kw):
        return np.zeros(self.sr // 2, dtype=np.float32)

    def synth_cosyvoice(self, text, reference, settings, **kw):
        return np.zeros(self.sr // 2, dtype=np.float32)


@pytest.fixture
def client(monkeypatch, tmp_path):
    """TestClient с FakeEngine — startup не загружает реальную модель.

    base_url=http://127.0.0.1 — чтобы TrustedHostMiddleware пропускал запросы
    (по умолчанию TestClient шлёт Host: testserver, а его нет в allowed_hosts).
    """
    import backend.app as app_mod
    from backend.core import state as state_mod
    from backend.services import history as history_mod

    monkeypatch.setattr(app_mod, "Engine", FakeEngine)
    monkeypatch.setattr(state_mod, "_engine", None)
    monkeypatch.setattr(history_mod, "DB_PATH", tmp_path / "jst.db")

    with TestClient(app_mod.app, base_url="http://127.0.0.1") as c:
        yield c


@pytest.fixture
def real_client(monkeypatch, tmp_path):
    """TestClient с НАСТОЯЩИМ Engine — для P5.4 real-engine smoke.

    Используется только в тестах с @pytest.mark.real_engine (skipif
    JST_REAL_ENGINE не выставлен). Подменяет только DB_PATH, чтобы не
    трогать data/jst.db.
    """
    import backend.app as app_mod
    from backend.services import history as history_mod

    monkeypatch.setattr(history_mod, "DB_PATH", tmp_path / "jst.db")

    with TestClient(app_mod.app, base_url="http://127.0.0.1") as c:
        yield c


@pytest.fixture
def fake_ref_path(tmp_path, monkeypatch):
    """1-сек валидный WAV + патч resolve_reference в synth_helpers.

    Нужен для batch-тестов, чтобы не зависеть от реального
    output/merged_reference.wav на диске.
    """
    import soundfile as sf

    ref = tmp_path / "merged_reference.wav"
    sf.write(str(ref), np.zeros(24000, dtype=np.float32), 24000)

    from backend.services import synth_helpers

    monkeypatch.setattr(synth_helpers, "resolve_reference", lambda voice, n: ref)
    return ref
