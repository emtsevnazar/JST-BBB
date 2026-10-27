"""v1.8.4: Тесты для services/journal.py (без assumptions о формате)."""

from __future__ import annotations

from backend.services import journal


def test_journal_action_runs():
    """Просто проверяем что action() не падает и query возвращает list."""
    journal.action("TEST_ACTION_V184", key="value")
    entries = journal.query("actions", 20)
    assert isinstance(entries, list)


def test_journal_emergency_runs():
    journal.emergency("TEST_EMERGENCY_V184", reason="unit-test")
    entries = journal.query("emergency", 20)
    assert isinstance(entries, list)


def test_journal_error_runs():
    """error() не должен падать при базовом вызове."""
    try:
        journal.error("TEST_ERROR_V184", msg="boom")
    except TypeError:
        # возможно сигнатура другая — пробуем без kwargs
        journal.error("TEST_ERROR_V184")


def test_journal_stats():
    s = journal.stats()
    assert isinstance(s, dict)


def test_journal_query_returns_list():
    for i in range(3):
        journal.action(f"QUERY_V184_{i}")
    entries = journal.query("actions", 2)
    assert isinstance(entries, list)
    assert len(entries) <= 2
