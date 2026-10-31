"""Tests for audit.py — _classify/_describe/log_event/read_last."""

from backend import audit


def test_classify_api():
    assert audit._classify("GET", "/api/models") == "api"


def test_classify_web():
    assert audit._classify("GET", "/") == "web"


def test_classify_static_falls_to_web():
    # _classify не различает /static/ → всё не-API = web
    assert audit._classify("GET", "/static/js/app.js") == "web"


def test_describe_ok():
    d = audit._describe("GET", "/api/models", 200, 5.0)
    assert isinstance(d, str) and d


def test_describe_error():
    d = audit._describe("POST", "/api/synth", 500, 100.0)
    assert isinstance(d, str) and d


def test_log_event_writes():
    audit.log_event(
        ip="127.0.0.1",
        method="GET",
        path="/api/test",
        status=200,
        request_id="r1",
        duration_ms=1.0,
        user_agent="test",
    )
    r = audit.read_last(10)
    assert isinstance(r, list) and len(r) > 0
