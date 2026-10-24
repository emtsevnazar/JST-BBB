"""Unit-тесты для core/utils.py (_num, _int, _str, _bool)."""

from backend.core.utils import _bool, _int, _num, _str


def test_num():
    assert _num(1.5) == 1.5
    assert _num("2.5") == 2.5
    assert _num(None, default=1.0) == 1.0
    assert _num("bad", default=3.0) == 3.0


def test_int():
    assert _int(42) == 42
    assert _int("42") == 42
    assert _int(None, default=7) == 7
    assert _int("bad", default=8) == 8


def test_str():
    assert _str("abc") == "abc"
    assert _str(None, default="x") == "x"
    assert _str(123) == "123"


def test_bool():
    assert _bool(True) is True
    assert _bool(False) is False
    assert _bool(1) is True
    assert _bool(0) is False
    assert _bool(None, default=True) is True
