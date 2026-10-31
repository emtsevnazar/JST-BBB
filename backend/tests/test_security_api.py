"""Tests for api/security_api.py — diagnostics, housekeeping."""

import pytest


@pytest.fixture(autouse=True)
def reset_env(monkeypatch):
    monkeypatch.setenv("JST_ADMIN_TOKEN", "test-token-pytest")
    yield


def test_security_stats(client):
    r = client.get("/api/security/stats")
    assert r.status_code == 200
    assert isinstance(r.json(), dict)


def test_security_housekeeping(client):
    r = client.get("/api/security/housekeeping")
    assert r.status_code == 200
    assert isinstance(r.json(), dict)


def test_diagnostics_json(client):
    r = client.get("/api/security/diagnostics")
    assert r.status_code == 200
    d = r.json()
    assert isinstance(d, dict)


def test_diagnostics_md_format(client):
    r = client.get("/api/security/diagnostics?format=md")
    assert r.status_code == 200
    ct = r.headers.get("content-type", "")
    assert "markdown" in ct or "text/" in ct


def test_diagnostics_md_path(client):
    r = client.get("/api/security/diagnostics.md")
    assert r.status_code == 200
    ct = r.headers.get("content-type", "")
    assert "markdown" in ct or "text/" in ct


def test_housekeeping_run_requires_token(client):
    """POST /housekeeping/run требует admin token."""
    r = client.post("/api/security/housekeeping/run")
    assert r.status_code in (401, 403, 422)


def test_housekeeping_run_with_token(client):
    r = client.post(
        "/api/security/housekeeping/run",
        headers={"X-Admin-Token": "test-token-pytest"},
    )
    assert r.status_code in (200, 202)
