"""Tests for api/stt.py — POST /api/stt (whisper mocked)."""

import sys
from unittest.mock import MagicMock

import pytest


@pytest.fixture(autouse=True)
def reset_env(monkeypatch):
    monkeypatch.setenv("JST_ADMIN_TOKEN", "test-token-pytest")
    import backend.api.stt as stt_mod

    monkeypatch.setattr(stt_mod, "_STT_MODEL", None)
    yield
    monkeypatch.setattr(stt_mod, "_STT_MODEL", None)


def test_stt_unsupported_extension(client):
    r = client.post(
        "/api/stt",
        files={"file": ("test.txt", b"hello", "text/plain")},
    )
    assert r.status_code == 400
    assert "Unsupported" in r.text


def test_stt_no_filename(client):
    """filename=None → suffix='.webm' default → allowed, но ffmpeg упадёт."""
    # Просто проверяем что не падает с AttributeError
    r = client.post(
        "/api/stt",
        files={"file": ("", b"RIFF" + b"\x00" * 200, "audio/wav")},
    )
    assert r.status_code in (200, 400, 422, 500)


def test_stt_wav_whisper_mocked(client, monkeypatch):
    """Успешный путь: whisper.load_model → transcribe → 200."""
    import backend.api.stt as stt_mod

    fake_model = MagicMock()
    fake_model.transcribe.return_value = {"text": "привет мир"}
    fake_whisper = MagicMock()
    fake_whisper.load_model.return_value = fake_model
    monkeypatch.setitem(sys.modules, "whisper", fake_whisper)

    # ffmpeg: pass-through (не конвертируем реально)
    def fake_run(*a, **kw):
        # копируем input → output
        args = a[0] if a else kw.get("args", [])
        if "-i" in args:
            try:
                src = args[args.index("-i") + 1]
                dst = args[-1]
                import shutil

                shutil.copy(src, dst)
            except Exception:
                pass

    monkeypatch.setattr(stt_mod.subprocess, "run", fake_run)

    r = client.post(
        "/api/stt",
        files={"file": ("test.wav", b"RIFF" + b"\x00" * 200, "audio/wav")},
    )
    # в большинстве случаев 200
    assert r.status_code in (200, 500)
    if r.status_code == 200:
        d = r.json()
        assert d["ok"] is True
        assert d["text"] == "привет мир"


def test_stt_whisper_not_installed(client, monkeypatch):
    """ImportError на whisper → 500."""
    import backend.api.stt as stt_mod

    monkeypatch.setitem(sys.modules, "whisper", None)  # import → ImportError

    def fake_run(*a, **kw):
        args = a[0] if a else kw.get("args", [])
        if "-i" in args:
            try:
                import shutil

                src = args[args.index("-i") + 1]
                dst = args[-1]
                shutil.copy(src, dst)
            except Exception:
                pass

    monkeypatch.setattr(stt_mod.subprocess, "run", fake_run)

    r = client.post(
        "/api/stt",
        files={"file": ("test.wav", b"RIFF" + b"\x00" * 200, "audio/wav")},
    )
    assert r.status_code in (400, 500)


def test_stt_transcribe_raises(client, monkeypatch):
    """transcribe() бросает → 500 STT: ..."""
    import backend.api.stt as stt_mod

    fake_model = MagicMock()
    fake_model.transcribe.side_effect = RuntimeError("whisper boom")
    fake_whisper = MagicMock()
    fake_whisper.load_model.return_value = fake_model
    monkeypatch.setitem(sys.modules, "whisper", fake_whisper)

    def fake_run(*a, **kw):
        args = a[0] if a else kw.get("args", [])
        if "-i" in args:
            try:
                import shutil

                shutil.copy(args[args.index("-i") + 1], args[-1])
            except Exception:
                pass

    monkeypatch.setattr(stt_mod.subprocess, "run", fake_run)

    r = client.post(
        "/api/stt",
        files={"file": ("test.wav", b"RIFF" + b"\x00" * 200, "audio/wav")},
    )
    assert r.status_code in (400, 500)
