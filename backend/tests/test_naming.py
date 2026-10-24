"""Unit-тесты для core/naming.py (NAMER)."""

from backend.core.naming import NAMER


def test_namer_returns_unique():
    a = NAMER.next_name()
    b = NAMER.next_name()
    assert isinstance(a, str) and a
    assert isinstance(b, str) and b
    assert a != b


def test_namer_format():
    name = NAMER.next_name()
    # формат: <PREFIX><N>AAA, например PCG436AAA
    assert len(name) >= 6
    assert name[-3:].isalpha() or name.isalnum()
