"""Security stats + unblock endpoints."""

from __future__ import annotations

import os
import time

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from ..security.hardening import (
    auth_bruteforce,
    blocklist,
    circuit_breaker,
    rate_limiter,
    watchdog,
)

router = APIRouter(prefix="/api/security", tags=["security"])

_START_TS = time.time()


class UnblockReq(BaseModel):
    ip: str


def _admin_token() -> str:
    return os.getenv("JST_ADMIN_TOKEN", "").strip()


def _require_admin(request: Request):
    token = _admin_token()
    if not token:
        raise HTTPException(503, "JST_ADMIN_TOKEN not configured")
    if request.headers.get("x-admin-token", "") != token:
        raise HTTPException(401, "invalid X-Admin-Token")


@router.get("/stats")
async def security_stats():
    return {
        "uptime_sec": round(time.time() - _START_TS, 1),
        "blocklist": blocklist.stats(),
        "rate_limiter": rate_limiter.stats(),
        "watchdog": watchdog.stats(),
        "auth_bruteforce": auth_bruteforce.stats(),
        "circuit_breaker": circuit_breaker.stats(),
        "alerts": __import__("backend.alerts", fromlist=["stats"]).stats(),
    }


@router.post("/unblock")
async def security_unblock(req: UnblockReq, request: Request):
    _require_admin(request)
    was = blocklist.unblock(req.ip)
    return {"ok": True, "ip": req.ip, "was_banned": was}


@router.get("/housekeeping")
async def security_housekeeping():
    from ..security.housekeeping import stats as _hk_stats

    return _hk_stats()


@router.post("/housekeeping/run")
async def security_housekeeping_run(request: Request):
    _require_admin(request)
    from ..security.housekeeping import housekeeping_run

    return housekeeping_run()


@router.get("/diagnostics")
async def diagnostics_json(format: str = "json"):
    """v1.9.0/1.9.2: Полный отчёт для разработчиков.

    ?format=json (default) — JSON со всеми секциями
    ?format=md             — Markdown для GitHub Issue
    """
    from ..diagnostics import build_report, to_markdown

    if format.lower() == "md":
        from starlette.responses import Response

        return Response(
            content=to_markdown(build_report()),
            headers={"content-type": "text/markdown; charset=utf-8"},
        )

    return build_report()


@router.get("/diagnostics.md")
async def diagnostics_markdown():
    """v1.9.0: Markdown-отчёт для GitHub Issue / README."""
    from starlette.responses import Response

    from ..diagnostics import build_report, to_markdown

    # v1.9.1: только headers, без media_type (избегаем конфликт в BaseHTTPMiddleware)
    return Response(
        content=to_markdown(build_report()),
        headers={"content-type": "text/markdown; charset=utf-8"},
    )
