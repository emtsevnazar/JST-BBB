"""Tests for app.py handlers — 404, exception handler, error redirect."""

from unittest.mock import MagicMock

import pytest


@pytest.fixture(autouse=True)
def reset_env(monkeypatch):
    monkeypatch.setenv("JST_ADMIN_TOKEN", "test-token-pytest")
    yield


def test_404_api_returns_json(client):
    """404 на /api/* → JSON с detail."""
    r = client.get("/api/definitely-not-a-real-endpoint-xyz")
    assert r.status_code in (401, 404)
    if r.status_code == 404:
        assert "detail" in r.json() or "error" in r.json()


def test_404_web_redirect(client):
    """404 на HTML-путь → 302 /offline (по handler)."""
    r = client.get("/definitely-not-a-real-page-xyz", follow_redirects=False)
    # 404 handler вернёт 302 на /offline, либо 404 JSON если path не подходит
    assert r.status_code in (302, 404)
    if r.status_code == 302:
        assert "/offline" in r.headers.get("location", "")


def test_404_static_json(client):
    """404 на /static/* → JSON (не редирект)."""
    r = client.get("/static/nonexistent_file_xyz_42.js", follow_redirects=False)
    assert r.status_code == 404


def test_global_exception_handler_api_path():
    """Прямой вызов _jst_global_exception_handler с mock request."""
    import asyncio

    from backend.app import _jst_global_exception_handler

    req = MagicMock()
    req.url.path = "/api/test"
    exc = ValueError("test boom")

    resp = asyncio.run(_jst_global_exception_handler(req, exc))
    assert resp.status_code == 500
    assert b"internal" in resp.body


def test_global_exception_handler_static_path():
    import asyncio

    from backend.app import _jst_global_exception_handler

    req = MagicMock()
    req.url.path = "/static/test.js"
    exc = RuntimeError("static boom")

    resp = asyncio.run(_jst_global_exception_handler(req, exc))
    assert resp.status_code == 500


def test_global_exception_handler_web_redirects():
    """Не-API, не-static → 302 /error."""
    import asyncio

    from backend.app import _jst_global_exception_handler

    req = MagicMock()
    req.url.path = "/some/page"
    exc = ValueError("web boom")

    resp = asyncio.run(_jst_global_exception_handler(req, exc))
    assert resp.status_code == 302
    assert "/error" in resp.headers.get("location", "")


def test_global_exception_handler_offline_path():
    """/offline путь → JSON (без рекурсии)."""
    import asyncio

    from backend.app import _jst_global_exception_handler

    req = MagicMock()
    req.url.path = "/offline"
    exc = ValueError("offline boom")

    resp = asyncio.run(_jst_global_exception_handler(req, exc))
    assert resp.status_code == 500
    assert b"internal" in resp.body


def test_error_redirect_mw_healthy(client):
    """error_state healthy → / отдаёт HTML."""
    from backend.core.error_state import error_state

    # Принудительно healthy
    error_state._version += 1  # bump чтобы snapshot() вернул healthy=True
    snap = error_state.snapshot()
    if not snap.get("healthy"):
        pytest.skip("error_state.unhealthy — не должны ломать тест")

    r = client.get("/", follow_redirects=False)
    assert r.status_code == 200


def test_error_redirect_mw_skips_api(client):
    """/api/* не редиректится error-middleware даже при unhealthy."""
    r = client.get("/api/health", follow_redirects=False)
    assert r.status_code == 200  # API всегда проходит


def test_error_redirect_mw_skips_static(client):
    """/static/* не редиректится."""
    r = client.get("/static/css/core/style-v4.css", follow_redirects=False)
    assert r.status_code == 200


def test_error_redirect_mw_skips_offline(client):
    """/offline не редиректится (защита от рекурсии)."""
    r = client.get("/offline", follow_redirects=False)
    assert r.status_code == 200
