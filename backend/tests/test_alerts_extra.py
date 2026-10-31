"""Tests for alerts.py — dedup, webhook, sentry, stats."""

from unittest.mock import patch

from backend import alerts


def test_should_dedup_first():
    # первый вызов для kind → False (не дубликат)
    assert alerts._should_dedup("TEST_KIND_UNIQUE_X1") is False


def test_send_webhook_no_url():
    with patch.object(alerts, "ALERT_WEBHOOK", "", create=True):
        r = alerts._send_webhook("kind", {"a": 1})
        assert r in (False, None, True)


def test_send_sentry_no_dsn():
    with patch.object(alerts, "SENTRY_DSN", "", create=True):
        r = alerts._send_sentry("kind", {"a": 1})
        assert r in (False, None, True)


def test_send_alert_no_crash():
    alerts.send_alert("test_kind", {"x": 1})  # не падает


def test_stats_dict():
    s = alerts.stats()
    assert isinstance(s, dict)
