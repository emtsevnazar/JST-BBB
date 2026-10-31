"""Tests for services/journal.py — action/error/query/stats."""

from backend.services import journal


def test_action_writes():
    journal.action("TEST_ACTION", extra="x")
    r = journal.query("actions", limit=10)
    assert any(e.get("msg") == "TEST_ACTION" for e in r)


def test_error_writes():
    journal.error("TEST_ERROR")
    r = journal.query("errors", limit=10)
    assert any(e.get("msg") == "TEST_ERROR" for e in r)


def test_emergency_writes():
    journal.emergency("TEST_EMERG")
    r = journal.query("emergencies", limit=10)
    assert any(e.get("msg") == "TEST_EMERG" for e in r)


def test_query_limit():
    for i in range(5):
        journal.action(f"Q{i}")
    r = journal.query("actions", limit=2)
    assert len(r) <= 2


def test_query_level_filter():
    journal.error("L_ERR")
    r = journal.query("errors", limit=20, level="ERROR")
    assert isinstance(r, list)


def test_stats_returns_dict():
    s = journal.stats()
    assert isinstance(s, dict)
