"""v1.8.4: Тесты для services/journal.py."""

from __future__ import annotations

from backend.services import journal


def test_journal_action():
    journal.action("TEST_ACTION_V184", key="value")
    entries = journal.query("actions", 20)
    assert any(e.get("action") == "TEST_ACTION_V184" for e in entries)


def test_journal_emergency():
    journal.emergency("TEST_EMERGENCY_V184", reason="unit-test")
    entries = journal.query("emergency", 20)
    assert any(e.get("action") == "TEST_EMERGENCY_V184" for e in entries)


def test_journal_error():
    journal.error("TEST_ERROR_V184", msg="boom")
    entries = journal.query("errors", 20)
    assert len(entries) > 0


def test_journal_stats():
    s = journal.stats()
    assert isinstance(s, dict)


def test_journal_query_limit():
    for i in range(5):
        journal.action(f"LIMIT_V184_{i}")
    entries = journal.query("actions", 2)
    assert len(entries) <= 2
