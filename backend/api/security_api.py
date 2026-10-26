"""Security stats + unblock endpoints."""

from __future__ import annotations

import os
import time

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from ..security.hardening import blocklist, rate_limiter, watchdog

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
