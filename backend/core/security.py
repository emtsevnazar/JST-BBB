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
    "/api/security/housekeeping",  # публичный статус очистки
    "/api/journal",  # журнал (read-only)
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
    if not provided or not secrets.compare_digest(provided, expected):
        from fastapi.responses import JSONResponse

        return JSONResponse(
            {"detail": f"Invalid or missing {API_KEY_HEADER}"},
            status_code=401,
        )
    return await call_next(request)
