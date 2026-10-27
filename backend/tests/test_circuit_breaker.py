"""v1.10.0: тесты CircuitBreaker + AuthBruteForce."""

from __future__ import annotations

import time

from backend.security.hardening import AuthBruteForce, CircuitBreaker


def test_breaker_opens_after_threshold():
    cb = CircuitBreaker(threshold=2, timeout=10.0)
    cb.record_failure("m1")
    assert not cb.is_open("m1")
    cb.record_failure("m1")
    assert cb.is_open("m1")


def test_breaker_autoclose():
    cb = CircuitBreaker(threshold=1, timeout=0.1)
    cb.record_failure("m2")
    assert cb.is_open("m2")
    time.sleep(0.15)
    assert not cb.is_open("m2")


def test_breaker_success_resets():
    cb = CircuitBreaker(threshold=3, timeout=10.0)
    cb.record_failure("m3")
    cb.record_failure("m3")
    cb.record_success("m3")
    cb.record_failure("m3")
    assert not cb.is_open("m3")


def test_auth_bruteforce_triggers():
    bf = AuthBruteForce(threshold=2, window=60.0)
    assert bf.record_fail("ip1") is False
    assert bf.record_fail("ip1") is True
    assert bf.record_fail("ip2") is False


def test_auth_bruteforce_success_resets():
    bf = AuthBruteForce(threshold=2, window=60.0)
    bf.record_fail("ip3")
    bf.record_success("ip3")
    assert bf.record_fail("ip3") is False
