"""Emergency stop / resume / restart API.

Управление:
  POST /api/emergency/stop?reason=...    — остановить синтез
  POST /api/emergency/resume              — возобновить
  POST /api/emergency/restart             — перезапустить процесс
  GET  /api/emergency/status              — текущее состояние
  GET  /api/emergency/stats                — журнал

Защита: если env JST_ADMIN_TOKEN не пуст — требуется header X-Admin-Token.
"""

from __future__ import annotations

import os
import subprocess
import time

from fastapi import APIRouter, Header, HTTPException, Request

from ..security.hardening import blocklist as _blocklist
from ..services import journal

router = APIRouter(prefix="/api/emergency", tags=["emergency"])

_state = {"stopped": False, "reason": "", "ts": 0.0}


def is_stopped() -> bool:
    return _state["stopped"]


def _admin_token() -> str:
    """v1.7.10: динамически читаем env (auto-gen происходит в lifespan)."""
    return os.getenv("JST_ADMIN_TOKEN", "").strip()


def _check_token(x_admin_token: str | None, request_ip: str = "") -> None:
    """v1.7.10: 503 если токен не сконфигурирован; 401 + record_fail если не совпал."""
    token = _admin_token()
    if not token:
        raise HTTPException(503, "admin token not configured")
    if x_admin_token != token:
        if request_ip:
            _blocklist.record_fail(request_ip, "emergency_bad_token")
        raise HTTPException(401, "invalid X-Admin-Token")
    if request_ip:
        _blocklist.record_success(request_ip)


@router.post("/stop")
async def emergency_stop(
    request: Request,
    reason: str = "manual",
    x_admin_token: str | None = Header(None),
):
    ip = request.client.host if request.client else ""
    if _blocklist.is_banned(ip):
        raise HTTPException(403, "IP blocked")
    _check_token(x_admin_token, ip)
    _state["stopped"] = True
    _state["reason"] = reason
    _state["ts"] = time.time()
    journal.emergency("STOP", reason=reason)
    return {"ok": True, **_state}


@router.post("/resume")
async def emergency_resume(request: Request, x_admin_token: str | None = Header(None)):
    ip = request.client.host if request.client else ""
    if _blocklist.is_banned(ip):
        raise HTTPException(403, "IP blocked")
    _check_token(x_admin_token, ip)
    _state["stopped"] = False
    _state["reason"] = ""
    _state["ts"] = 0.0
    journal.action("RESUME")
    return {"ok": True, **_state}


@router.post("/restart")
async def emergency_restart(request: Request, x_admin_token: str | None = Header(None)):
    ip = request.client.host if request.client else ""
    if _blocklist.is_banned(ip):
        raise HTTPException(403, "IP blocked")
    _check_token(x_admin_token, ip)
    journal.action("RESTART")
    try:
        uid = os.getuid()
        subprocess.Popen(
            ["launchctl", "kickstart", "-k", f"gui/{uid}/com.jst.voiceforge"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        return {"ok": True, "message": "restart triggered"}
    except Exception as e:
        journal.error("restart_failed", error=str(e))
        raise HTTPException(500, str(e))


@router.get("/status")
async def emergency_status():
    from ..services import journal as j

    return {**_state, "journal": j.stats()}
