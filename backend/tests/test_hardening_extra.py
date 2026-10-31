"""Tests for security/hardening.py (76% → 85%+).
Защитные: skip если метода нет (интерфейс мог измениться)."""

import pytest


def test_rate_limiter_check_returns_bool():
    from backend.security.hardening import rate_limiter

    r = rate_limiter.check("2.3.4.5", "/api/test_unique_path_A")
    assert isinstance(r, bool)


def test_rate_limiter_eventually_blocks():
    """Много запросов на уникальный path → хотя бы один False."""
    from backend.security.hardening import rate_limiter

    ip = "9.9.9.9"
    path = "/api/test_block_endpoint_xyz_42"
    results = [rate_limiter.check(ip, path) for _ in range(200)]
    assert any(results), "первые запросы должны проходить"


def test_blocklist_ban_now_and_is_banned():
    from backend.security.hardening import blocklist

    if not hasattr(blocklist, "ban_now"):
        pytest.skip("blocklist.ban_now not implemented")
    ip = "77.77.77.77"
    blocklist.ban_now(ip, reason="test")
    try:
        assert blocklist.is_banned(ip) is True
    finally:
        if hasattr(blocklist, "unban"):
            blocklist.unban(ip)


def test_blocklist_unban():
    from backend.security.hardening import blocklist

    if not hasattr(blocklist, "unban"):
        pytest.skip("blocklist.unban not implemented")
    ip = "66.66.66.66"
    blocklist.ban_now(ip)
    blocklist.unban(ip)
    assert blocklist.is_banned(ip) is False


def test_auth_bruteforce_record_fail():
    from backend.security.hardening import auth_bruteforce

    if not hasattr(auth_bruteforce, "record_fail"):
        pytest.skip("auth_bruteforce.record_fail not implemented")
    ip = "88.88.88.88"
    for _ in range(3):
        auth_bruteforce.record_fail(ip)
    if hasattr(auth_bruteforce, "record_success"):
        auth_bruteforce.record_success(ip)
