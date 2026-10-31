"""Tests for api/emergency.py (32% → 80%+)."""

import pytest

from backend.api import emergency


@pytest.fixture(autouse=True)
def reset_emergency_state(monkeypatch):
    """Сброс _state + force JST_ADMIN_TOKEN + no-op blocklist record_*.
    Env мог быть перезаписан bootstrap.py из .env.local — принудительно
    ставим test-token-pytest, чтобы admin_headers совпадал."""
    monkeypatch.setenv("JST_ADMIN_TOKEN", "test-token-pytest")
    emergency._state["stopped"] = False
    emergency._state["reason"] = ""
    emergency._state["ts"] = 0.0
    monkeypatch.setattr(emergency._blocklist, "record_fail", lambda *a, **kw: None)
    monkeypatch.setattr(emergency._blocklist, "record_success", lambda *a, **kw: None)
    yield
    emergency._state["stopped"] = False
    emergency._state["reason"] = ""
    emergency._state["ts"] = 0.0


@pytest.fixture
def admin_headers():
    return {"X-Admin-Token": "test-token-pytest"}


def test_is_stopped_initial():
    assert emergency.is_stopped() is False


def test_admin_token_reads_env(monkeypatch):
    monkeypatch.setenv("JST_ADMIN_TOKEN", "custom-xyz")
    assert emergency._admin_token() == "custom-xyz"


def test_admin_token_strips_whitespace(monkeypatch):
    monkeypatch.setenv("JST_ADMIN_TOKEN", "  spaced  ")
    assert emergency._admin_token() == "spaced"


def test_check_token_no_token(monkeypatch):
    from fastapi import HTTPException

    monkeypatch.setenv("JST_ADMIN_TOKEN", "")
    with pytest.raises(HTTPException) as exc:
        emergency._check_token("any")
    assert exc.value.status_code == 503


def test_check_token_wrong():
    from fastapi import HTTPException

    with pytest.raises(HTTPException) as exc:
        emergency._check_token("wrong-token", "")
    assert exc.value.status_code == 401


def test_check_token_ok():
    emergency._check_token("test-token-pytest", "")  # no raise


def test_stop_requires_token(client):
    r = client.post("/api/emergency/stop")
    assert r.status_code == 401


def test_stop_success(client, admin_headers):
    r = client.post("/api/emergency/stop?reason=test", headers=admin_headers)
    assert r.status_code == 200
    d = r.json()
    assert d["ok"] is True
    assert d["stopped"] is True
    assert d["reason"] == "test"
    assert emergency.is_stopped() is True


def test_stop_then_resume(client, admin_headers):
    client.post("/api/emergency/stop", headers=admin_headers)
    assert emergency.is_stopped() is True
    r = client.post("/api/emergency/resume", headers=admin_headers)
    assert r.status_code == 200
    d = r.json()
    assert d["ok"] is True
    assert d["stopped"] is False
    assert emergency.is_stopped() is False


def test_resume_when_not_stopped(client, admin_headers):
    r = client.post("/api/emergency/resume", headers=admin_headers)
    assert r.status_code == 200
    assert r.json()["stopped"] is False


def test_status_ok(client):
    r = client.get("/api/emergency/status")
    assert r.status_code == 200
    d = r.json()
    assert "stopped" in d
    assert "reason" in d
    assert "journal" in d


def test_restart_mocked(client, admin_headers, monkeypatch):
    calls = {"n": 0}

    def fake_popen(*a, **kw):
        calls["n"] += 1
        return None

    monkeypatch.setattr(emergency.subprocess, "Popen", fake_popen)
    r = client.post("/api/emergency/restart", headers=admin_headers)
    assert r.status_code == 200
    assert r.json()["ok"] is True
    assert calls["n"] == 1


def test_restart_error_returns_500(client, admin_headers, monkeypatch):
    def fail_popen(*a, **kw):
        raise RuntimeError("launchctl boom")

    monkeypatch.setattr(emergency.subprocess, "Popen", fail_popen)
    r = client.post("/api/emergency/restart", headers=admin_headers)
    assert r.status_code == 500


def test_stop_banned_ip(client, admin_headers, monkeypatch):
    monkeypatch.setattr(emergency._blocklist, "is_banned", lambda ip: True)
    r = client.post("/api/emergency/stop", headers=admin_headers)
    assert r.status_code == 403


def test_resume_banned_ip(client, admin_headers, monkeypatch):
    monkeypatch.setattr(emergency._blocklist, "is_banned", lambda ip: True)
    r = client.post("/api/emergency/resume", headers=admin_headers)
    assert r.status_code == 403
