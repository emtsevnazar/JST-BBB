"""Extra tests for ai/preprocess.py — normalize_text, detect_mood, cache."""

import pytest

from backend.ai import client as ai_client
from backend.ai import preprocess as pp


@pytest.fixture(autouse=True)
def clear_cache():
    ai_client.CACHE.clear()
    yield
    ai_client.CACHE.clear()


def test_normalize_text_empty():
    assert pp.normalize_text("") == ""


def test_normalize_text_generate_fails(monkeypatch):
    monkeypatch.setattr(pp.client, "generate", lambda *a, **kw: None)
    assert pp.normalize_text("hello") == "hello"


def test_normalize_text_generate_success(monkeypatch):
    monkeypatch.setattr(pp.client, "generate", lambda *a, **kw: "HELLO")
    assert pp.normalize_text("hello") == "HELLO"


def test_normalize_text_cached(monkeypatch):
    calls = {"n": 0}

    def fake_gen(*a, **kw):
        calls["n"] += 1
        return "CACHED_RESULT"

    monkeypatch.setattr(pp.client, "generate", fake_gen)
    r1 = pp.normalize_text("unique_text_xyz")
    r2 = pp.normalize_text("unique_text_xyz")
    assert r1 == r2 == "CACHED_RESULT"
    assert calls["n"] == 1  # второй раз из cache


def test_detect_mood_empty():
    r = pp.detect_mood("")
    assert r["mood"] == "neutral"
    assert r["fallback"] is True


def test_detect_mood_generate_fails(monkeypatch):
    monkeypatch.setattr(pp.client, "generate", lambda *a, **kw: None)
    r = pp.detect_mood("some text")
    assert r["mood"] == "neutral"
    assert r["fallback"] is True


def test_detect_mood_valid_json(monkeypatch):
    monkeypatch.setattr(
        pp.client, "generate", lambda *a, **kw: '{"mood": "sad", "confidence": 0.9}'
    )
    r = pp.detect_mood("sad text unique 42")
    assert r["mood"] == "sad"
    assert r["confidence"] == 0.9


def test_detect_mood_invalid_json(monkeypatch):
    monkeypatch.setattr(pp.client, "generate", lambda *a, **kw: "not a json")
    r = pp.detect_mood("text")
    assert r["fallback"] is True


def test_detect_mood_cached(monkeypatch):
    calls = {"n": 0}

    def fake_gen(*a, **kw):
        calls["n"] += 1
        return '{"mood": "happy", "confidence": 0.8}'

    monkeypatch.setattr(pp.client, "generate", fake_gen)
    r1 = pp.detect_mood("happy text unique 99")
    r2 = pp.detect_mood("happy text unique 99")
    assert r1 == r2
    assert calls["n"] == 1


def test_cache_key_deterministic():
    assert pp._cache_key("mood", "x") == pp._cache_key("mood", "x")


def test_cache_key_differs_by_kind():
    assert pp._cache_key("a", "x") != pp._cache_key("b", "x")
