"""v1.8.2: Extra middleware — rate limit, audit log, static cache.

Вынесено из app.py. Регистрируются через register_extra_middleware(app)
в правильном порядке (LIFO: последний → самый внешний).
"""

from __future__ import annotations

import time as _t

from fastapi import FastAPI
from starlette.responses import JSONResponse as _JSONResponse

from .audit import log_event as _log_event
from .core.security import api_key_middleware as _api_key_mw
from .security.hardening import blocklist as _blocklist
from .security.hardening import rate_limiter as _rate_limiter


async def jst_rate_limit(request, call_next):
    ip = request.client.host if request.client else "unknown"
    path = request.url.path
    # Phase 4e LOOPBACK_NO_WS_LIMIT: local dev — no WS rate limit.
    # SYNTH+STOP cycles re-create WS many times; 20/60s was killing localhost UX.
    if ip in ("127.0.0.1", "::1", "::ffff:127.0.0.1", "localhost") and path.startswith("/ws/"):
        return await call_next(request)
    # v1.7.10-fix: /api/security/* доступен даже забаненным IP
    # (иначе нельзя разбанить себя; stats нужен для видимости состояния)
    if not path.startswith("/api/security/") and _blocklist.is_banned(ip):
        return _JSONResponse(
            {"error": "ip_blocked", "detail": "IP temporarily blocked"},
            status_code=403,
        )
    # v1.9.2: check + rate-limit headers (IETF standard)
    limit_info = _rate_limiter.get_limit(path)
    if limit_info:
        limit, window = limit_info
        remaining_before = _rate_limiter.remaining(ip, path)
        ok = _rate_limiter.check(ip, path)
        if not ok:
            reset = _rate_limiter.reset_seconds(ip, path)
            return _JSONResponse(
                {"error": "rate_limit_exceeded", "detail": "Слишком много запросов"},
                status_code=429,
                headers={
                    "X-RateLimit-Limit": str(limit),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(int(window)),
                    "Retry-After": str(max(1, int(reset))),
                },
            )
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(max(0, remaining_before - 1))
        response.headers["X-RateLimit-Reset"] = str(int(window))
        return response

    # paths без rate-limit (public / healthz)
    return await call_next(request)


async def jst_audit_middleware(request, call_next):
    t0 = _t.time()
    status = 500
    try:
        response = await call_next(request)
        status = response.status_code
        return response
    finally:
        dur = (_t.time() - t0) * 1000
        try:
            _log_event(
                ip=request.client.host if request.client else "unknown",
                method=request.method,
                path=request.url.path,
                status=status,
                duration_ms=dur,
                user_agent=request.headers.get("user-agent", ""),
                request_id=getattr(request.state, "request_id", "-"),
            )
            # v1.9.5: error rate alerting
            try:
                from .alerts import record_request as _ar

                _ar(status)
            except Exception:
                pass
        except Exception:
            pass


async def static_cache_control(request, call_next):
    response = await call_next(request)
    if request.url.path.startswith("/static/"):
        response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
    return response


def register_extra_middleware(app: FastAPI) -> None:
    """Регистрирует 3 middleware. Вызывается после базовых add_middleware.

    Итоговый execution order (outer → inner):
        static_cache_control → jst_audit → jst_rate_limit → GZip → ... → SecurityHeaders
    """
    app.middleware("http")(jst_rate_limit)
    app.middleware("http")(jst_audit_middleware)
    app.middleware("http")(static_cache_control)
    app.middleware("http")(_api_key_mw)
    # v1.9.1: RequestID — самый внешний (генерирует ДО всех остальных)
    from .security.middleware import RequestIDMiddleware

    app.add_middleware(RequestIDMiddleware)
