"""Unit-тесты для services/output_service.py (save_output).

Сигнатура: save_output(samples, sr_in, s, base) -> str (имя файла).
s — объект с атрибутами output_sr, fade_in_sec, fade_out_sec,
bit_depth, output_format.
"""

from types import SimpleNamespace

import numpy as np
import pytest
import soundfile as sf

from backend.services import output_service as out


@pytest.fixture()
def tmp_output(monkeypatch, tmp_path):
    """Подменить OUTPUT на временную папку + задать sr=1 чтобы не грузить librosa."""
    monkeypatch.setattr(out, "OUTPUT", tmp_path)
    return tmp_path


def _settings(**over):
    defaults = dict(
        output_sr=24000,
        fade_in_sec=0.0,
        fade_out_sec=0.0,
        bit_depth=16,
        output_format="wav",
    )
    defaults.update(over)
    return SimpleNamespace(**defaults)


def test_save_output_wav(tmp_output):
    samples = np.zeros(24000, dtype=np.float32)
    name = out.save_output(samples, 24000, _settings(), base="unit_test")
    assert name == "unit_test.wav"
    p = tmp_output / name
    assert p.exists()
    data, sr = sf.read(str(p))
    assert sr == 24000
    assert len(data) == 24000


def test_save_output_with_fade(tmp_output):
    samples = np.ones(24000, dtype=np.float32)
    name = out.save_output(
        samples.copy(), 24000, _settings(fade_in_sec=0.5, fade_out_sec=0.5), base="fade"
    )
    assert name == "fade.wav"
    assert (tmp_output / name).exists()


def test_save_output_bit_depth_8(tmp_output):
    samples = np.zeros(8000, dtype=np.float32)
    name = out.save_output(samples, 8000, _settings(output_sr=8000, bit_depth=8), base="pcm8")
    assert name.endswith(".wav")
    assert (tmp_output / name).exists()


def test_save_output_mp3_fallback_to_wav(tmp_output, monkeypatch):
    """Если ffmpeg отсутствует — save_output возвращает wav-имя (fallback)."""
    samples = np.zeros(1000, dtype=np.float32)

    def fake_run(*a, **kw):
        raise RuntimeError("no ffmpeg")

    monkeypatch.setattr(out.subprocess, "run", fake_run)
    name = out.save_output(
        samples, 1000, _settings(output_sr=1000, output_format="mp3"), base="fall"
    )
    assert name.endswith(".wav")  # fallback
    assert (tmp_output / name).exists()
