"""Tests for ai/preprocess.py — чистые функции."""

from backend.ai import preprocess as pp


def test_cache_key_deterministic():
    assert pp._cache_key("mood", "Привет") == pp._cache_key("mood", "Привет")


def test_cache_key_differs_by_kind():
    assert pp._cache_key("a", "x") != pp._cache_key("b", "x")


def test_normalize_text_empty():
    assert pp.normalize_text("") == ""


def test_normalize_text_trim():
    r = pp.normalize_text("  hello   world  ")
    assert "hello" in r and "world" in r


def test_normalize_text_cyrillic():
    r = pp.normalize_text("Привет,  мир!")
    assert "Привет" in r


def test_detect_mood_returns_dict():
    m = pp.detect_mood("Сегодня отличный день")
    assert isinstance(m, dict)


def test_detect_mood_empty():
    m = pp.detect_mood("")
    assert isinstance(m, dict)
