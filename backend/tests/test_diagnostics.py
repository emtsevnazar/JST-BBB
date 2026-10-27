"""v1.10.0: тесты diagnostics + alerts."""

from __future__ import annotations

from backend import alerts
from backend.diagnostics import build_report, to_markdown


def test_build_report_has_required_sections():
    r = build_report()
    for key in (
        "project",
        "tests",
        "runtime",
        "security",
        "housekeeping",
        "health",
        "deps",
        "hygiene",
    ):
        assert key in r


def test_to_markdown_non_empty():
    md = to_markdown(build_report())
    assert len(md) > 100
    assert "JST Studio" in md


def test_alerts_stats_default():
    s = alerts.stats()
    assert "requests" in s and "errors_5xx" in s
    assert s["webhook_configured"] is False  # dev


def test_alerts_record_request_no_error():
    alerts.record_request(200)
    alerts.record_request(204)
    s = alerts.stats()
    assert s["errors_5xx"] == 0


def test_alerts_record_request_5xx():
    before = alerts.stats()["errors_5xx"]
    alerts.record_request(500)
    assert alerts.stats()["errors_5xx"] >= before + 1
