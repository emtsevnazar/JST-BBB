"""Tests for core/naming.py — NamingScheme."""

from backend.core.naming import NamingScheme


def test_century_map():
    ns = NamingScheme.__new__(NamingScheme)
    assert ns._c(2025) == "P"  # 21-й век → P
    assert ns._c(1905) == "O"  # 20-й → O
    assert ns._c(2100) == "P"  # (2100-1)//100+1 = 21 → P
    assert ns._c(2101) == "Q"  # 22-й → Q


def test_year_letters():
    ns = NamingScheme.__new__(NamingScheme)
    # 25 → "CF" (2=C, 5=F по LETTER)
    assert ns._y(2025) == "CF"


def test_number_letters():
    ns = NamingScheme.__new__(NamingScheme)
    # 007 → "AAH" (0=A, 0=A, 7=H)
    assert ns._n(7) == "AAH"


def test_next_name_increments(tmp_path):
    ns = NamingScheme(tmp_path)
    n1 = ns.next_name()
    n2 = ns.next_name()
    assert n1 != n2
    # counter-файл создан
    assert any(tmp_path.glob(".counter_*"))


def test_next_name_recovers_from_corrupt_counter(tmp_path):
    ns = NamingScheme(tmp_path)
    ns.next_name()  # создаст counter
    cf = list(tmp_path.glob(".counter_*"))[0]
    cf.write_text("garbage")
    n = ns.next_name()  # не падает
    assert isinstance(n, str) and n
