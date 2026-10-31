"""Tests for diagnostics.py — build_report/to_markdown/_is_testclient."""

from backend import diagnostics as d


def test_is_testclient_true():
    assert d._is_testclient("testclient") is True


def test_is_testclient_false():
    assert d._is_testclient("127.0.0.1") is False


def test_git_returns_none_or_str():
    r = d._git(["--version"])
    assert r is None or isinstance(r, str)


def test_build_report_returns_dict():
    r = d.build_report()
    assert isinstance(r, dict)


def test_to_markdown_returns_str():
    r = d.build_report()
    md = d.to_markdown(r)
    assert isinstance(md, str) and len(md) > 50
