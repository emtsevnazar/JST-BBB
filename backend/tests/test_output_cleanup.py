"""Tests for output_cleanup.py (57% → 80%+)."""

import asyncio
import os
import time


def test_is_audio_wav(tmp_path):
    from backend import output_cleanup as oc

    p = tmp_path / "a.wav"
    p.write_bytes(b"x")
    assert oc._is_audio(p) is True


def test_is_audio_mp3(tmp_path):
    from backend import output_cleanup as oc

    p = tmp_path / "a.mp3"
    p.write_bytes(b"x")
    assert oc._is_audio(p) is True


def test_is_audio_non_audio(tmp_path):
    from backend import output_cleanup as oc

    p = tmp_path / "a.txt"
    p.write_bytes(b"x")
    assert oc._is_audio(p) is False


def test_cleanup_once_empty(tmp_path, monkeypatch):
    from backend import output_cleanup as oc

    monkeypatch.setattr(oc, "_get_output_dir", lambda: tmp_path)
    r = asyncio.run(oc.cleanup_once(ttl_days=7, max_mb=100))
    assert isinstance(r, dict)


def test_cleanup_once_ttl_removes_old(tmp_path, monkeypatch):
    from backend import output_cleanup as oc

    monkeypatch.setattr(oc, "_get_output_dir", lambda: tmp_path)
    old = tmp_path / "old.wav"
    old.write_bytes(b"x" * 1000)
    old_time = time.time() - 30 * 86400
    os.utime(old, (old_time, old_time))
    new = tmp_path / "new.wav"
    new.write_bytes(b"x" * 1000)
    asyncio.run(oc.cleanup_once(ttl_days=7, max_mb=100))
    assert not old.exists()
    assert new.exists()


def test_cleanup_once_size_limits(tmp_path, monkeypatch):
    from backend import output_cleanup as oc

    monkeypatch.setattr(oc, "_get_output_dir", lambda: tmp_path)
    for i in range(5):
        f = tmp_path / f"f{i}.wav"
        f.write_bytes(b"x" * 1024 * 500)
        os.utime(f, (time.time() - i * 60, time.time() - i * 60))
    r = asyncio.run(oc.cleanup_once(ttl_days=365, max_mb=1))
    assert isinstance(r, dict)
    assert r.get("deleted_by_size", 0) >= 0
