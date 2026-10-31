"""v1.8.0: API-key authentication + public paths whitelist."""

from __future__ import annotations

import os
import secrets

from fastapi import HTTPException, Request, status

API_KEY_HEADER = "X-API-Key"

# Публичные пути — не требуют API-ключа
PUBLIC_PATHS = {
    "/",
    "/healthz",
    "/readyz",
    "/dashboard",
    "/manifest.json",
    "/sw.js",
    "/api/security/stats",  # публичный мониторинг
    "/api/security/housekeeping",
    "/api/security/diagnostics",
    "/api/security/diagnostics.md",  # публичный статус очистки
    "/api/journal",  # журнал (read-only)
    # v1.10.73: read-only GET endpoints (frontend загружает без ключа)
    "/api/models",
    "/api/presets",
    "/api/moods",
    "/api/output",
    "/api/voices",  # v1.11: GET list (frontend loads without key)
    "/api/formats",
    "/api/languages",
    "/api/history",
    "/api/health",
    "/api/ai/status",
    "/offline",
    "/offline/",
    "/favicon.ico",
    "/error",
    "/api/error-state",
    "/api/admin/error-state",
    "/api/voice-clone/health",
}

# Публичные префиксы (статика, docs)
PUBLIC_PREFIXES = ("/static/", "/docs", "/openapi.json", "/redoc", "/output/")


def _api_key() -> str:
    return os.getenv("JST_API_KEY", "").strip()


def _is_public(path: str) -> bool:
    if path in PUBLIC_PATHS:
        return True
    return any(path.startswith(p) for p in PUBLIC_PREFIXES)


async def require_api_key(request: Request) -> None:
    """Dependency: проверяет X-API-Key для непубличных путей.

    Если JST_API_KEY не задан — dev-режим (все открыто), с WARNING в лог.
    В prod (JST_ENV=production) — пустой ключ = 503.
    """
    if _is_public(request.url.path):
        return

    expected = _api_key()
    if not expected:
        if os.getenv("JST_ENV", "dev").lower() == "production":
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="JST_API_KEY not configured",
            )
        return  # dev mode

    provided = request.headers.get(API_KEY_HEADER, "")
    if not provided or not secrets.compare_digest(provided, expected):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or missing {API_KEY_HEADER}",
        )


async def api_key_middleware(request, call_next):
    """v1.8.3: HTTP middleware версия (WS-safe).

    В отличие от require_api_key (FastAPI dependency),
    работает на уровне HTTP middleware — не падает на WebSocket.
    """
    if _is_public(request.url.path):
        return await call_next(request)

    expected = _api_key()
    if not expected:
        if os.getenv("JST_ENV", "dev").lower() == "production":
            from fastapi.responses import JSONResponse

            return JSONResponse(
                {"detail": "JST_API_KEY not configured"},
                status_code=503,
            )
        return await call_next(request)  # dev mode

    provided = request.headers.get(API_KEY_HEADER, "")
    ip = request.client.host if request.client else "unknown"

    if not provided or not secrets.compare_digest(provided, expected):
        req_id = getattr(request.state, "request_id", "-")
        # v1.9.1: audit log auth failure
        try:
            from .audit import log_event

            log_event(
                ip=ip,
                method=request.method,
                path=request.url.path,
                status=401,
                duration_ms=0.0,
                user_agent=request.headers.get("user-agent", ""),
                action="auth_fail",
                desc=f"Invalid or missing API key (req={req_id})",
            )
        except Exception:
            pass
        # v1.9.1: brute-force → force-ban
        try:
            from .security.hardening import auth_bruteforce, blocklist

            if auth_bruteforce.record_fail(ip):
                blocklist.ban_now(ip, reason="auth_bruteforce")
        except Exception:
            pass
        from fastapi.responses import JSONResponse

        return JSONResponse(
            {"detail": f"Invalid or missing {API_KEY_HEADER}"},
            status_code=401,
        )

    # Успех — сброс счётчика
    try:
        from .security.hardening import auth_bruteforce

        auth_bruteforce.record_success(ip)
    except Exception:
        pass

    return await call_next(request)
