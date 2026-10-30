"""GET /error — HTML-страница ошибки (RU/EN).
GET /api/error-state — JSON для polling (public).
POST/DELETE /api/admin/error-state — требуют X-Admin-Token = JST_ADMIN_TOKEN."""

import os
from pathlib import Path

from fastapi import APIRouter, Header, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel

from backend.core.error_state import error_state

router = APIRouter()
STATIC = Path(__file__).resolve().parent.parent / "static"


def _check_admin(token: str | None) -> None:
    expected = os.getenv("JST_ADMIN_TOKEN", "").strip()
    if not expected:
        raise HTTPException(503, "JST_ADMIN_TOKEN not configured on server")
    if not token or token != expected:
        raise HTTPException(401, "invalid or missing X-Admin-Token")


@router.get("/error", response_class=HTMLResponse, include_in_schema=False)
async def error_page():
    p = STATIC / "error.html"
    if not p.exists():
        return HTMLResponse("<h1>error.html missing</h1>", status_code=500)
    return HTMLResponse(p.read_text(encoding="utf-8"))


@router.get("/api/error-state", include_in_schema=False)
async def get_state():
    return JSONResponse(error_state.snapshot())


class ErrorPayload(BaseModel):
    code: str = "MANUAL"
    message: str = "Manually set"
    source: str = "admin"


@router.post("/api/admin/error-state", include_in_schema=False)
async def set_state(
    payload: ErrorPayload,
    x_admin_token: str | None = Header(default=None),
):
    _check_admin(x_admin_token)
    await error_state.set(payload.code, payload.message, source=payload.source)
    return {"ok": True, "state": error_state.snapshot()}


@router.delete("/api/admin/error-state", include_in_schema=False)
async def clear_state(x_admin_token: str | None = Header(default=None)):
    _check_admin(x_admin_token)
    await error_state.clear()
    return {"ok": True, "state": error_state.snapshot()}
