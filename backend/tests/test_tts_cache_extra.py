"""Extra tests for tts_cache.py — LRU/stats/cleanup/key."""

import os

import pytest


@pytest.fixture
def iso(tmp_path, monkeypatch):
    from backend.services import tts_cache as tc

    cache = tmp_path / "cache"
    cache.mkdir()
    monkeypatch.setattr(tc, "CACHE_DIR", cache)
    monkeypatch.setattr(tc, "_stats", {"hits": 0, "misses": 0, "puts": 0})
    return tc, cache


def test_key_deterministic(iso):
    tc, _ = iso
    k1 = tc._key("text", "voice", {"speed": 1.0})
    k2 = tc._key("text", "voice", {"speed": 1.0})
    assert k1 == k2 and len(k1) == 64


def test_key_settings_order_independent(iso):
    tc, _ = iso
    assert tc._key("t", "v", {"a": 1, "b": 2}) == tc._key("t", "v", {"b": 2, "a": 1})


def test_key_differs_by_text(iso):
    tc, _ = iso
    assert tc._key("a", "v", {}) != tc._key("b", "v", {})


def test_get_miss(iso):
    tc, _ = iso
    assert tc.get("missing", "v", {}) is None
    assert tc._stats["misses"] == 1


def test_put_then_get(iso, tmp_path):
    tc, cache = iso
    src = tmp_path / "src.wav"
    src.write_bytes(b"RIFF" + b"\x00" * 200)
    tc.put("hello", "v", {"x": 1}, str(src))
    assert tc._stats["puts"] == 1
    hit = tc.get("hello", "v", {"x": 1})
    assert hit is not None and hit.exists() and hit.parent == cache
    assert tc._stats["hits"] == 1


def test_put_bad_source(iso):
    tc, _ = iso
    tc.put("x", "v", {}, "/nonexistent/file.wav")
    assert tc._stats["puts"] == 0


def test_stats_empty(iso):
    tc, _ = iso
    s = tc.stats()
    assert s["files"] == 0 and s["total_mb"] == 0.0


def test_stats_with_files(iso):
    tc, cache = iso
    # 200KB + 400KB → ~0.57 MB, гарантированно > round(2 decimals) 0
    (cache / "a.wav").write_bytes(b"x" * (200 * 1024))
    (cache / "b.wav").write_bytes(b"y" * (400 * 1024))
    s = tc.stats()
    assert s["files"] == 2
    assert 0.5 <= s["total_mb"] <= 0.7


def test_cleanup_old_files(iso, monkeypatch):
    tc, cache = iso
    monkeypatch.setattr(tc, "MAX_AGE_SEC", 0)
    old = cache / "old.wav"
    old.write_bytes(b"x")
    os.utime(old, (0, 0))
    tc._cleanup()
    assert not old.exists()


def test_cleanup_keeps_recent(iso):
    tc, cache = iso
    new = cache / "new.wav"
    new.write_bytes(b"x")
    tc._cleanup()
    assert new.exists()


def test_cleanup_lru_overflow(iso, monkeypatch):
    """MAX_MB маленький → старые файлы удаляются до target_free."""
    tc, cache = iso
    monkeypatch.setattr(tc, "MAX_MB", 0.001)  # 1 KB — крошечный лимит
    # 3 файла по 500 байт = 1.5 KB > 1 KB → LRU удалит самые старые
    for i, name in enumerate(["a.wav", "b.wav", "c.wav"]):
        (cache / name).write_bytes(b"x" * 500)
        # разные mtime — сначала старые
        import os

        os.utime(cache / name, (1000 + i, 1000 + i))
    tc._cleanup()
    # target_free = total_mb - MAX_MB*0.8 = 0.0015 - 0.0008 ≈ 0.0007 MB ≈ 730 байт
    # удаляет самые старые, пока не освободит ~730 байт → удалит a и b (1000 байт) → freed=1000 >= 730
    remaining = list(cache.glob("*.wav"))
    assert len(remaining) <= 2  # хотя бы 1-2 удалены
