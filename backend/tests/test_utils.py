"""Unit-тесты для core/utils.py (_num, _int)."""

import math

from backend.core.utils import _int, _num


def test_num_float_and_int():
    assert _num(1.5) == 1.5
    assert _num(2) == 2.0


def test_num_string():
    assert _num("2.5") == 2.5


def test_num_bad_and_none():
    assert _num("bad", default=3.0) == 3.0
    assert _num(None, default=1.0) == 1.0
    assert _num(math.nan, default=4.0) == 4.0
    assert _num(math.inf, default=5.0) == 5.0


def test_int_int_string_float():
    assert _int(42) == 42
    assert _int("42") == 42
    assert _int(3.7) == 3


def test_int_bad_and_none():
    assert _int(None, default=7) == 7
    assert _int("bad", default=8) == 8
