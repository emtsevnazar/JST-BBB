"""v1.8.3: Smoke-тесты для новых модулей после рефакторинга."""

from __future__ import annotations

from backend import bootstrap, middleware_extra, routes_meta
from backend.core import security as core_security


def test_bootstrap_has_init_admin_token():
    assert hasattr(bootstrap, "_init_admin_token")
    assert callable(bootstrap._init_admin_token)


def test_middleware_extra_has_register():
    assert hasattr(middleware_extra, "register_extra_middleware")
    assert callable(middleware_extra.register_extra_middleware)
    assert hasattr(middleware_extra, "jst_rate_limit")
    assert hasattr(middleware_extra, "jst_audit_middleware")
    assert hasattr(middleware_extra, "static_cache_control")


def test_routes_meta_has_register():
    assert hasattr(routes_meta, "register_meta_routes")
    assert callable(routes_meta.register_meta_routes)
    for fn in ("dashboard", "api_journal", "serve_manifest", "serve_sw", "index"):
        assert hasattr(routes_meta, fn), f"missing {fn}"


def test_security_has_middleware_and_dependency():
    assert hasattr(core_security, "api_key_middleware")
    assert hasattr(core_security, "require_api_key")
    assert callable(core_security.api_key_middleware)


def test_security_public_paths():
    # key публичные пути должны быть в whitelist
    for path in ("/healthz", "/readyz", "/dashboard", "/api/security/stats"):
        assert core_security._is_public(path), f"{path} должен быть публичным"
    # публичный: GET /api/voices (frontend loads list without key)
    assert core_security._is_public("/api/voices")
    # непубличный: POST /api/voices/create (mutating)
    assert not core_security._is_public("/api/voices/create")
