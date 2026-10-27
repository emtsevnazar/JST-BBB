"""Middleware: security headers + request size limit."""

from __future__ import annotations

import logging
import uuid

from fastapi import Request as _Req
from fastapi.responses import Response as _Resp
from starlette.middleware.base import BaseHTTPMiddleware

log = logging.getLogger("JST.Middleware")


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: _Req, call_next):
        try:
            response: _Resp = await call_next(request)
        except Exception:
            log.exception("middleware error")
            return _Resp(
                content=b'{"error":"internal"}', status_code=500, media_type="application/json"
            )
        # v1.9.1: force content-type для .md (BaseHTTPMiddleware теряет media_type)
        if request.url.path.endswith(".md"):
            response.headers["content-type"] = "text/markdown; charset=utf-8"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(self), camera=()"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "img-src 'self' data: blob:; "
            "media-src 'self' blob:; "
            # v1.7.14: ws:/wss: scheme (валидные источники) вместо wildcards в октетах IP
            # (192.168.*, 10.*, 172.16.* — невалидный CSP синтаксис, браузер игнорирует)
            "connect-src 'self' ws: wss: https://fonts.googleapis.com https://fonts.gstatic.com; "
            "font-src 'self' data: https://fonts.gstatic.com; "
            "frame-ancestors 'none'; "
            "base-uri 'self'; "
            "form-action 'self'; "
            "object-src 'none'"
        )
        return response


class RequestSizeLimitMiddleware(BaseHTTPMiddleware):
    MAX_BODY = 100 * 1024 * 1024  # 100 MB

    async def dispatch(self, request: _Req, call_next):
        cl = request.headers.get("content-length")
        if cl:
            try:
                if int(cl) > self.MAX_BODY:
                    return _Resp(
                        content=b'{"error":"payload too large"}',
                        status_code=413,
                        media_type="application/json",
                    )
            except ValueError:
                return _Resp(
                    content=b'{"error":"bad content-length"}',
                    status_code=400,
                    media_type="application/json",
                )
        return await call_next(request)


class RequestIDMiddleware(BaseHTTPMiddleware):
    """v1.9.1: генерирует X-Request-ID для трассировки.

    Приоритет: переданный клиентом X-Request-ID, иначе UUID4 hex[:12].
    Доступен в request.state.request_id для логов.
    """

    async def dispatch(self, request: _Req, call_next):
        req_id = request.headers.get("X-Request-ID") or uuid.uuid4().hex[:12]
        request.state.request_id = req_id
        response: _Resp = await call_next(request)
        response.headers["X-Request-ID"] = req_id
        return response
