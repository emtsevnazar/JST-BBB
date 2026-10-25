"""v1.3.1: smoke-тесты guard + cleanup."""

from __future__ import annotations

import asyncio
import os
import time


def test_system_mem_returns_expected_keys():
    from scripts.guard import _system_mem

    m = _system_mem()
    assert {"free_mb", "total_mb", "free_pct"} <= set(m.keys())
    assert 0 <= m["free_pct"] <= 100
    assert m["total_mb"] > 0
    assert m["free_mb"] >= 0


def test_cleanup_removes_orphan_zips(tmp_path, monkeypatch):
    from backend import output_cleanup

    monkeypatch.setattr(output_cleanup, "_get_output_dir", lambda: tmp_path)
    orphan = tmp_path / ".jst_all_abc.zip"
    orphan.write_bytes(b"fake")
    old = time.time() - 20 * 60
    os.utime(orphan, (old, old))

    fresh = tmp_path / ".jst_all_fresh.zip"
    fresh.write_bytes(b"fake")

    asyncio.run(output_cleanup.cleanup_once(ttl_days=0, max_mb=0))

    assert not orphan.exists()
    assert fresh.exists()


def test_cleanup_removes_old_concat_list(tmp_path, monkeypatch):
    from backend import output_cleanup

    monkeypatch.setattr(output_cleanup, "_get_output_dir", lambda: tmp_path)
    concat = tmp_path / ".concat_list.txt"
    concat.write_text("file x.wav")
    old = time.time() - 20 * 60
    os.utime(concat, (old, old))

    asyncio.run(output_cleanup.cleanup_once(ttl_days=0, max_mb=0))

    assert not concat.exists()


def test_cleanup_removes_old_merged(tmp_path, monkeypatch):
    from backend import output_cleanup

    monkeypatch.setattr(output_cleanup, "_get_output_dir", lambda: tmp_path)
    merged = tmp_path / "ALL_MERGED.wav"
    merged.write_bytes(b"fake")
    old = time.time() - 20 * 60
    os.utime(merged, (old, old))

    asyncio.run(output_cleanup.cleanup_once(ttl_days=0, max_mb=0))

    assert not merged.exists()
