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

from fastapi import APIRouter, Header, HTTPException

from ..services import journal

router = APIRouter(prefix="/api/emergency", tags=["emergency"])

_state = {"stopped": False, "reason": "", "ts": 0.0}
ADMIN_TOKEN = os.getenv("JST_ADMIN_TOKEN", "").strip()


def is_stopped() -> bool:
    return _state["stopped"]


def _check_token(x_admin_token: str | None):
    if not ADMIN_TOKEN:
        return  # dev mode, no auth
    if x_admin_token != ADMIN_TOKEN:
        raise HTTPException(401, "invalid X-Admin-Token")


@router.post("/stop")
async def emergency_stop(reason: str = "manual", x_admin_token: str | None = Header(None)):
    _check_token(x_admin_token)
    _state["stopped"] = True
    _state["reason"] = reason
    _state["ts"] = time.time()
    journal.emergency("STOP", reason=reason)
    return {"ok": True, **_state}


@router.post("/resume")
async def emergency_resume(x_admin_token: str | None = Header(None)):
    _check_token(x_admin_token)
    _state["stopped"] = False
    _state["reason"] = ""
    _state["ts"] = 0.0
    journal.action("RESUME")
    return {"ok": True, **_state}


@router.post("/restart")
async def emergency_restart(x_admin_token: str | None = Header(None)):
    _check_token(x_admin_token)
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
