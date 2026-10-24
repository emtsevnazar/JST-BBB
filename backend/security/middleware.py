"""Middleware: security headers + request size limit."""

from __future__ import annotations

import logging

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
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(self), camera=()"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: blob:; "
            "media-src 'self' blob:; "
            "connect-src 'self' ws://127.0.0.1:8000 ws://localhost:8000; "
            "font-src 'self' data:; "
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
