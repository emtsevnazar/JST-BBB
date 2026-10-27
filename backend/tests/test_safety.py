"""v1.8.4: Тесты для security/safety.py."""

from __future__ import annotations

import pytest

from backend.security.safety import (
    safe_path,
    validate_audio_file,
    validate_language,
    validate_mode,
    validate_text,
    validate_voice_name,
)


def test_validate_text_ok():
    assert validate_text("hello") == "hello"
    assert validate_text("  hello  ") == "hello"


def test_validate_text_empty():
    with pytest.raises(ValueError, match="Текст пустой"):
        validate_text("")


def test_validate_text_control_chars():
    assert validate_text("he\x00llo\x01") == "hello"


def test_validate_text_too_long():
    with pytest.raises(ValueError, match="слишком длинный"):
        validate_text("x" * 6000, max_len=5000)


def test_validate_text_not_string():
    with pytest.raises(ValueError, match="должен быть строкой"):
        validate_text(123)  # type: ignore


def test_validate_voice_name_ok():
    assert validate_voice_name("my_voice-1") == "my_voice-1"


def test_validate_voice_name_bad():
    with pytest.raises(ValueError, match="только a-z"):
        validate_voice_name("my voice!")


def test_validate_voice_name_long():
    with pytest.raises(ValueError, match="слишком длинное"):
        validate_voice_name("a" * 100)


def test_validate_voice_name_empty():
    with pytest.raises(ValueError):
        validate_voice_name("")


def test_validate_mode_ok():
    for m in ("core", "multi", "jst_clone"):
        assert validate_mode(m) == m


def test_validate_mode_bad():
    with pytest.raises(ValueError, match="Недопустимый режим"):
        validate_mode("hacker")


def test_validate_language_ok():
    assert validate_language("ru") == "ru"
    assert validate_language("en") == "en"


def test_validate_language_bad():
    with pytest.raises(ValueError, match="не поддерживается"):
        validate_language("fr")


def test_safe_path_ok(tmp_path):
    (tmp_path / "test.wav").write_bytes(b"x" * 100)
    assert safe_path(tmp_path, "test.wav") == (tmp_path / "test.wav").resolve()


def test_safe_path_traversal(tmp_path):
    with pytest.raises(ValueError, match="Path traversal"):
        safe_path(tmp_path, "../../etc/passwd")


def test_validate_audio_ok():
    content = b"RIFF" + b"\x00" * 200
    assert validate_audio_file("test.wav", content) == "wav"


def test_validate_audio_bad_ext():
    with pytest.raises(ValueError, match="Недопустимое расширение"):
        validate_audio_file("test.exe", b"x" * 200)


def test_validate_audio_small():
    with pytest.raises(ValueError, match="слишком маленький"):
        validate_audio_file("test.wav", b"RIFF")


def test_validate_audio_big():
    with pytest.raises(ValueError, match="слишком большой"):
        validate_audio_file("test.wav", b"x" * (60 * 1024 * 1024))
