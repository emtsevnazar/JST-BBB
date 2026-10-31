"""Edge tests for diagnostics.py — _tests_metrics, _deps_metrics, _hygiene."""

import subprocess
from unittest.mock import MagicMock


def test_git_timeout_returns_none(monkeypatch):
    """_git при TimeoutExpired → None."""
    from backend import diagnostics as d

    def fake_run(*a, **kw):
        raise subprocess.TimeoutExpired("git", timeout=1)

    monkeypatch.setattr(d.subprocess, "run", fake_run)
    assert d._git(["--version"]) is None


def test_git_file_not_found_returns_none(monkeypatch):
    from backend import diagnostics as d

    def fake_run(*a, **kw):
        raise FileNotFoundError("git not found")

    monkeypatch.setattr(d.subprocess, "run", fake_run)
    assert d._git(["--version"]) is None


def test_tests_metrics_returns_dict(monkeypatch):
    """_tests_metrics не должен запускать реальный pytest — мок."""
    from backend import diagnostics as d

    fake = MagicMock()
    fake.returncode = 0
    fake.stdout = "100 passed\n"
    fake.stderr = ""
    monkeypatch.setattr(d.subprocess, "run", lambda *a, **kw: fake)
    r = d._tests_metrics()
    assert isinstance(r, dict)


def test_deps_metrics_versions():
    """_deps_metrics возвращает dict с версиями хотя бы fastapi/python."""
    from backend import diagnostics as d

    r = d._deps_metrics()
    assert isinstance(r, dict)
    # должно быть хоть что-то
    assert len(r) >= 1


def test_hygiene_metrics_dict():
    from backend import diagnostics as d

    r = d._hygiene_metrics()
    assert isinstance(r, dict)


def test_runtime_metrics_dict():
    from backend import diagnostics as d

    r = d._runtime_metrics()
    assert isinstance(r, dict)


def test_project_metrics_dict():
    from backend import diagnostics as d

    r = d._project_metrics()
    assert isinstance(r, dict)


def test_build_report_has_sections():
    from backend import diagnostics as d

    r = d.build_report()
    assert isinstance(r, dict)
    # хотя бы 3 секции
    assert len(r) >= 3


def test_to_markdown_returns_str():
    from backend import diagnostics as d

    md = d.to_markdown(d.build_report())
    assert isinstance(md, str)
    assert len(md) > 100
