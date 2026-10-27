"""v1.8.4: Тесты для security/housekeeping.py."""

from __future__ import annotations

from backend.security.housekeeping import (
    cleanup_pycache,
    cleanup_tts_cache,
    rotate_plain_logs,
    stats,
)


def test_cleanup_pycache():
    r = cleanup_pycache()
    assert "deleted" in r and "freed_kb" in r


def test_rotate_plain_logs_no_dir(tmp_path):
    r = rotate_plain_logs(tmp_path / "nonexistent")
    assert r == {"rotated": 0}


def test_rotate_plain_logs_small(tmp_path):
    (tmp_path / "app.log").write_text("small")
    r = rotate_plain_logs(tmp_path, max_mb=10.0)
    assert r["rotated"] == 0


def test_rotate_plain_logs_skips_app(tmp_path):
    big = "x" * (11 * 1024 * 1024)
    (tmp_path / "app.log").write_text(big)
    r = rotate_plain_logs(tmp_path, max_mb=10.0)
    assert r["rotated"] == 0


def test_cleanup_tts_cache():
    r = cleanup_tts_cache(max_age_days=0)
    assert "deleted" in r and "freed_kb" in r


def test_stats_dict():
    s = stats()
    assert isinstance(s, dict)
    for k in ("last_run", "interval_sec", "freed_mb_total"):
        assert k in s
