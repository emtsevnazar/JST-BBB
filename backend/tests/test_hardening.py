"""v1.8.4: Тесты для security/hardening.py."""

from __future__ import annotations

from backend.security.hardening import IPBlocklist, RateLimiterV2, SelfHealingWatchdog


def test_ipblocklist_ban_after_5_fails():
    bl = IPBlocklist(threshold=5, fail_window=60.0, ban_duration=900.0)
    for _ in range(4):
        assert bl.record_fail("1.1.1.1") is False
    assert bl.is_banned("1.1.1.1") is False
    assert bl.record_fail("1.1.1.1") is True
    assert bl.is_banned("1.1.1.1") is True


def test_ipblocklist_unban():
    bl = IPBlocklist(threshold=2, fail_window=60.0, ban_duration=900.0)
    bl.record_fail("2.2.2.2")
    bl.record_fail("2.2.2.2")
    assert bl.is_banned("2.2.2.2") is True
    assert bl.unblock("2.2.2.2") is True
    assert bl.is_banned("2.2.2.2") is False
    assert bl.unblock("2.2.2.2") is False


def test_ipblocklist_stats():
    bl = IPBlocklist(threshold=1, fail_window=60.0, ban_duration=900.0)
    bl.record_fail("3.3.3.3")
    s = bl.stats()
    assert s["bans_total"] == 1
    assert s["active_bans"] == 1


def test_ipblocklist_record_success_resets():
    bl = IPBlocklist(threshold=3, fail_window=60.0, ban_duration=900.0)
    bl.record_fail("4.4.4.4")
    bl.record_fail("4.4.4.4")
    bl.record_success("4.4.4.4")
    assert bl.is_banned("4.4.4.4") is False


def test_ipblocklist_max_ips_eviction():
    bl = IPBlocklist(threshold=1, fail_window=60.0, ban_duration=900.0, max_ips=3)
    for i in range(5):
        bl.record_fail(f"9.9.9.{i}")
    assert bl.stats()["active_bans"] <= 3


def test_ratelimiter_per_prefix():
    rl = RateLimiterV2({"/api/": (2, 60.0), "/api/emergency/": (1, 60.0)})
    assert rl.check("ip1", "/api/moods") is True
    assert rl.check("ip1", "/api/moods") is True
    assert rl.check("ip1", "/api/moods") is False
    assert rl.check("ip1", "/api/emergency/stop") is True
    assert rl.check("ip1", "/api/emergency/stop") is False


def test_ratelimiter_longest_prefix_wins():
    rl = RateLimiterV2({"/api/": (100, 60.0), "/api/emergency/": (1, 60.0)})
    assert rl.check("ip2", "/api/emergency/stop") is True
    assert rl.check("ip2", "/api/emergency/stop") is False


def test_ratelimiter_remaining():
    rl = RateLimiterV2({"/api/": (5, 60.0)})
    assert rl.remaining("ip3", "/api/x") == 5
    rl.check("ip3", "/api/x")
    assert rl.remaining("ip3", "/api/x") == 4


def test_ratelimiter_no_match_allows():
    rl = RateLimiterV2({"/api/": (1, 60.0)})
    assert rl.check("ip4", "/static/app.js") is True
    assert rl.check("ip4", "/static/app.js") is True


def test_watchdog_stats_initial():
    wd = SelfHealingWatchdog(url="http://127.0.0.1:1/never", interval=60.0, threshold=99)
    s = wd.stats()
    assert s["fails"] == 0
    assert s["kicks"] == 0
    assert s["threshold"] == 99
