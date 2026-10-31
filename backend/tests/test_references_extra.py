"""Extra tests for references.py — build/resolve paths."""

from unittest.mock import MagicMock


def test_build_reference_no_voice_dir(tmp_path, monkeypatch):
    from backend.services import references as refs

    monkeypatch.setattr(refs, "VOICES", tmp_path / "voices")
    monkeypatch.setattr(refs, "OUTPUT", tmp_path / "output")
    (tmp_path / "output").mkdir()
    assert refs.build_reference("missing_voice") is None


def test_build_reference_empty_dir(tmp_path, monkeypatch):
    from backend.services import references as refs

    voices = tmp_path / "voices" / "empty_voice"
    voices.mkdir(parents=True)
    (tmp_path / "output").mkdir()
    monkeypatch.setattr(refs, "VOICES", tmp_path / "voices")
    monkeypatch.setattr(refs, "OUTPUT", tmp_path / "output")
    assert refs.build_reference("empty_voice") is None


def test_resolve_reference_no_output(tmp_path, monkeypatch):
    from backend.services import references as refs

    out = tmp_path / "output"
    out.mkdir()
    monkeypatch.setattr(refs, "OUTPUT", out)
    monkeypatch.setattr(refs, "build_reference", lambda v, n: None)
    assert refs.resolve_reference("voice_x", 10) is None


def test_resolve_reference_en_fallback(tmp_path, monkeypatch):
    from backend.services import references as refs

    out = tmp_path / "output"
    out.mkdir()
    monkeypatch.setattr(refs, "OUTPUT", out)
    monkeypatch.setattr(refs, "build_reference", lambda v, n: None)
    assert refs.resolve_reference("v", 10, language="en") is None


def test_resolve_reference_en_exists(tmp_path, monkeypatch):
    from backend.services import references as refs

    out = tmp_path / "output"
    out.mkdir()
    en_file = out / "merged_reference_en.wav"
    en_file.write_bytes(b"RIFF")
    monkeypatch.setattr(refs, "OUTPUT", out)
    result = refs.resolve_reference("v", 10, language="en")
    assert result == en_file


def test_resolve_reference_per_voice_ok(tmp_path, monkeypatch):
    from backend.services import references as refs

    out = tmp_path / "output"
    out.mkdir()
    f = out / "merged_reference_voice1.wav"
    f.write_bytes(b"RIFF")
    monkeypatch.setattr(refs, "OUTPUT", out)
    if refs.sf:
        mock_info = MagicMock(frames=240000, samplerate=24000)  # 10s
        monkeypatch.setattr(refs.sf, "info", lambda p: mock_info)
    result = refs.resolve_reference("voice1", 10)
    assert result == f


def test_resolve_reference_per_voice_empty_file(tmp_path, monkeypatch):
    """per-voice файл есть, но битый → sf.info raises → return per (не fallback)."""
    from backend.services import references as refs

    out = tmp_path / "output"
    out.mkdir()
    f = out / "merged_reference_v.wav"
    f.write_bytes(b"")  # невалидный WAV
    monkeypatch.setattr(refs, "OUTPUT", out)
    if refs.sf:

        def _raise(p):
            raise OSError("corrupt or empty")

        monkeypatch.setattr(refs.sf, "info", _raise)
    result = refs.resolve_reference("v", 10)
    assert result == f  # код возвращает per при исключении, не None


def test_resolve_reference_per_voice_duration_mismatch(tmp_path, monkeypatch):
    """sf.info говорит duration != ref_length → пересобирает."""
    from backend.services import references as refs

    out = tmp_path / "output"
    out.mkdir()
    f = out / "merged_reference_v.wav"
    f.write_bytes(b"RIFF")
    monkeypatch.setattr(refs, "OUTPUT", out)
    rebuilt = out / "rebuilt.wav"
    rebuilt.write_bytes(b"RIFF")
    monkeypatch.setattr(refs, "build_reference", lambda v, n: rebuilt)
    if refs.sf:
        from unittest.mock import MagicMock

        mock_info = MagicMock(frames=240000, samplerate=24000)  # 10s
        monkeypatch.setattr(refs.sf, "info", lambda p: mock_info)
    result = refs.resolve_reference("v", 50)  # ref_length=50, duration=10 → mismatch
    assert result == rebuilt


def test_resolve_reference_sf_info_raises(tmp_path, monkeypatch):
    """sf.info бросает exception → возвращает сам файл (per-voice)."""
    from backend.services import references as refs

    out = tmp_path / "output"
    out.mkdir()
    f = out / "merged_reference_v.wav"
    f.write_bytes(b"RIFF")
    monkeypatch.setattr(refs, "OUTPUT", out)
    if refs.sf:

        def _raise(p):
            raise OSError("corrupt")

        monkeypatch.setattr(refs.sf, "info", _raise)
    result = refs.resolve_reference("v", 10)
    assert result == f


def test_build_reference_with_mocked_audio(tmp_path, monkeypatch):
    """build_reference с моками librosa/noisereduce/sf — покрывает строки 44-78."""
    import sys
    import types

    import numpy as np

    from backend.services import references as refs

    # 1. Mock noisereduce (импортируется внутри build_reference)
    mock_nr = types.SimpleNamespace(reduce_noise=lambda y, sr, **kw: y)
    sys.modules["noisereduce"] = mock_nr

    # 2. Mock librosa.load + librosa.effects.trim
    voices = tmp_path / "voices" / "v1"
    voices.mkdir(parents=True)
    fake_wav = voices / "a.wav"
    fake_wav.write_bytes(b"fake")
    out = tmp_path / "output"
    out.mkdir()
    monkeypatch.setattr(refs, "VOICES", tmp_path / "voices")
    monkeypatch.setattr(refs, "OUTPUT", out)

    # librosa уже импортирован в refs, патчим через refs.librosa
    if refs.librosa:
        y_fake = np.zeros(24000 * 10, dtype=np.float32)  # 10s @ 24000
        monkeypatch.setattr(refs.librosa, "load", lambda p, sr, mono: (y_fake, sr))
        # effects.trim → (y_trimmed, index)
        type("Trim", (), {"__call__": lambda self, y, top_db: (y, None)})()
        if hasattr(refs.librosa, "effects"):
            monkeypatch.setattr(refs.librosa.effects, "trim", lambda y, top_db: (y, None))

    # sf.write — mock
    if refs.sf:
        from pathlib import Path as _Path

        written = {}

        def _write(path, data, sr):
            written["path"] = path
            written["samples"] = len(data)
            written["sr"] = sr
            _Path(path).write_bytes(b"WAV" * 100)

        monkeypatch.setattr(refs.sf, "write", _write)

    result = refs.build_reference("v1", total=8.0)
    # если всё замокано корректно — result указывает на .wav в OUTPUT
    assert result is not None
    assert result.parent == out
    assert result.name == "merged_reference_v1.wav"


def test_build_reference_no_files(tmp_path, monkeypatch):
    """voice-папка есть, но без supported-файлов → None."""
    from backend.services import references as refs

    voices = tmp_path / "voices" / "empty"
    voices.mkdir(parents=True)
    (voices / "readme.txt").write_text("not audio")
    (tmp_path / "output").mkdir()
    monkeypatch.setattr(refs, "VOICES", tmp_path / "voices")
    monkeypatch.setattr(refs, "OUTPUT", tmp_path / "output")
    assert refs.build_reference("empty") is None
