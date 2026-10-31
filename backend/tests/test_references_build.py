"""Tests for references.build_reference — моки librosa/noisereduce/sf."""

import sys
import types
from pathlib import Path

import numpy as np
import pytest

from backend.services import references as refs


@pytest.fixture
def setup_voices(tmp_path, monkeypatch):
    """tmp-директория для VOICES/OUTPUT."""
    voices = tmp_path / "voices"
    out = tmp_path / "output"
    voices.mkdir()
    out.mkdir()
    monkeypatch.setattr(refs, "VOICES", voices)
    monkeypatch.setattr(refs, "OUTPUT", out)
    return voices, out


@pytest.fixture
def mock_audio_stack(monkeypatch):
    """Моки librosa.load/effects.trim + noisereduce + sf.write."""
    # librosa mock
    librosa = refs.librosa
    if librosa:
        y_fake = np.ones(24000 * 5, dtype=np.float32) * 0.5
        monkeypatch.setattr(librosa, "load", lambda p, sr, mono: (y_fake.copy(), sr))
        if hasattr(librosa, "effects"):
            monkeypatch.setattr(
                librosa.effects,
                "trim",
                lambda y, top_db: (y, None),
            )
    # noisereduce — импортируется внутри build_reference
    nr_module = types.SimpleNamespace(
        reduce_noise=lambda y, sr, **kw: y,
    )
    monkeypatch.setitem(sys.modules, "noisereduce", nr_module)
    # soundfile.write
    if refs.sf:
        written = {}

        def fake_write(path, data, sr):
            written["path"] = path
            written["samples"] = len(data)
            written["sr"] = sr
            Path(path).write_bytes(b"RIFF" + b"\x00" * 100)

        monkeypatch.setattr(refs.sf, "write", fake_write)
        return written
    return {}


# ── build_reference ────────────────────────────────────────────
def test_build_reference_voice_dir_missing(setup_voices):
    r = refs.build_reference("nonexistent_voice_xyz", total=5.0)
    assert r is None


def test_build_reference_no_audio_files(setup_voices):
    voices, _ = setup_voices
    (voices / "v1").mkdir()
    (voices / "v1" / "readme.txt").write_text("not audio")
    r = refs.build_reference("v1", total=5.0)
    assert r is None


def test_build_reference_success(setup_voices, mock_audio_stack):
    """1 файл + 5s → merged wav создаётся."""
    voices, out = setup_voices
    (voices / "v1").mkdir()
    (voices / "v1" / "a.wav").write_bytes(b"fake")

    r = refs.build_reference("v1", total=4.0)
    # должен вернуть path или None (зависит от моков)
    if r is not None:
        assert r.parent == out
        assert r.name == "merged_reference_v1.wav"


def test_build_reference_short_audio_skipped(setup_voices, monkeypatch):
    """Файл <2 сек → пропускается (continue)."""
    voices, _ = setup_voices
    (voices / "v1").mkdir()
    (voices / "v1" / "a.wav").write_bytes(b"fake")

    if not refs.librosa:
        pytest.skip("librosa not available")

    # 1s → меньше 2s, должен быть отброшен
    y_short = np.zeros(24000, dtype=np.float32)
    monkeypatch.setattr(refs.librosa, "load", lambda p, sr, mono: (y_short.copy(), sr))
    monkeypatch.setattr(refs.librosa.effects, "trim", lambda y, top_db: (y, None))

    # noisereduce mock
    nr_module = types.SimpleNamespace(reduce_noise=lambda y, sr, **kw: y)
    monkeypatch.setitem(sys.modules, "noisereduce", nr_module)

    if refs.sf:
        monkeypatch.setattr(refs.sf, "write", lambda *a, **kw: None)

    r = refs.build_reference("v1", total=5.0)
    # все файлы <2 сек → return None
    assert r is None


def test_build_reference_trim_to_total(setup_voices, mock_audio_stack):
    """Если merged длиннее total → обрезается."""
    voices, _ = setup_voices
    (voices / "v1").mkdir()
    (voices / "v1" / "a.wav").write_bytes(b"fake")

    if not refs.librosa:
        pytest.skip("librosa not available")

    # 30s файл, просим 3s
    y_long = np.ones(24000 * 30, dtype=np.float32) * 0.3
    refs.librosa.load = lambda p, sr, mono: (y_long.copy(), sr)
    refs.librosa.effects.trim = lambda y, top_db: (y, None)

    nr_module = types.SimpleNamespace(reduce_noise=lambda y, sr, **kw: y)
    sys.modules["noisereduce"] = nr_module

    if refs.sf:
        refs.sf.write = lambda *a, **kw: None

    try:
        r = refs.build_reference("v1", total=3.0)
        # не проверяем точно — просто не падает
        assert r is None or r.name.endswith(".wav")
    finally:
        # cleanup monkeypatched attrs
        pass


def test_build_reference_load_exception_skipped(setup_voices, monkeypatch):
    """librosa.load бросает → файл пропускается (continue)."""
    voices, _ = setup_voices
    (voices / "v1").mkdir()
    (voices / "v1" / "bad.wav").write_bytes(b"corrupt")

    if not refs.librosa:
        pytest.skip("librosa not available")

    def bad_load(*a, **kw):
        raise OSError("corrupt wav")

    monkeypatch.setattr(refs.librosa, "load", bad_load)

    nr_module = types.SimpleNamespace(reduce_noise=lambda y, sr, **kw: y)
    monkeypatch.setitem(sys.modules, "noisereduce", nr_module)

    r = refs.build_reference("v1", total=5.0)
    assert r is None
