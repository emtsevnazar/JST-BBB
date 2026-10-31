"""Tests for api/health.py — healthz, readyz, metrics, _output_stats."""

import pytest

from backend.api import health as h


@pytest.fixture(autouse=True)
def reset_env(monkeypatch):
    monkeypatch.setenv("JST_ADMIN_TOKEN", "test-token-pytest")
    yield


def test_healthz_200(client):
    r = client.get("/healthz")
    assert r.status_code == 200
    d = r.json()
    assert "status" in d
    assert d["status"] in ("ok", "degraded")
    assert "engine" in d
    assert "output_mb" in d
    assert "output_files" in d
    assert "ws_active" in d


def test_readyz_200(client):
    r = client.get("/readyz")
    assert r.status_code == 200
    d = r.json()
    assert "ready" in d


def test_api_metrics_forbidden_for_testclient(client):
    """TestClient ip = 'testclient', не в whitelist localhost → 403."""
    r = client.get("/api/metrics")
    assert r.status_code == 403
    assert r.json().get("error") == "forbidden"


def test_output_stats_returns_dict(tmp_path, monkeypatch):
    monkeypatch.setattr(h, "OUTPUT", tmp_path)
    (tmp_path / "a.wav").write_bytes(b"x" * 1000)
    (tmp_path / "b.wav").write_bytes(b"x" * 2000)
    (tmp_path / "c.txt").write_bytes(b"x")  # не wav
    s = h._output_stats()
    assert s["files"] == 2
    assert s["mb"] >= 0


def test_output_stats_empty(tmp_path, monkeypatch):
    monkeypatch.setattr(h, "OUTPUT", tmp_path)
    s = h._output_stats()
    assert s["files"] == 0
    assert s["mb"] == 0.0


def test_output_stats_error_returns_zero(monkeypatch):
    # не-Path объект → except → zero
    monkeypatch.setattr(h, "OUTPUT", "not_a_path")
    s = h._output_stats()
    assert s["files"] == 0
    assert s["mb"] == 0.0
