"""Tests for diagnostics.py — _deps_metrics, _hygiene_metrics, _git."""

from backend import diagnostics as d


def test_git_version_returns_str():
    r = d._git(["--version"])
    assert r is None or isinstance(r, str)


def test_git_bad_command_returns_none():
    r = d._git(["nonexistent_command_xyz_42"])
    assert r is None


def test_is_testclient_true():
    assert d._is_testclient("testclient") is True


def test_is_testclient_false():
    assert d._is_testclient("127.0.0.1") is False


def test_project_metrics_dict():
    r = d._project_metrics()
    assert isinstance(r, dict)


def test_deps_metrics_dict():
    r = d._deps_metrics()
    assert isinstance(r, dict)


def test_hygiene_metrics_dict():
    r = d._hygiene_metrics()
    assert isinstance(r, dict)


def test_tests_metrics_dict():
    r = d._tests_metrics()
    assert isinstance(r, dict)


def test_runtime_metrics_dict():
    r = d._runtime_metrics()
    assert isinstance(r, dict)


def test_security_metrics_dict():
    r = d._security_metrics()
    assert isinstance(r, dict)


def test_housekeeping_metrics_dict():
    r = d._housekeeping_metrics()
    assert isinstance(r, dict)


def test_health_metrics_dict():
    r = d._health_metrics()
    assert isinstance(r, dict)


def test_build_report_all_sections():
    r = d.build_report()
    assert isinstance(r, dict)
    # хотя бы 3 секции есть
    assert len(r) >= 3


def test_to_markdown_no_crash():
    md = d.to_markdown(d.build_report())
    assert isinstance(md, str)
    assert len(md) > 100
