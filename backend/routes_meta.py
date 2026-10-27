"""v1.8.1: Meta-routes — dashboard, journal, PWA, index.

Вынесено из app.py для чистоты. Все эндпоинты регистрируются
через register_meta_routes(app).
"""

from __future__ import annotations

import logging
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.responses import HTMLResponse as _HTMLResponse

from .core.paths import FRONTEND
from .services import journal

log = logging.getLogger("JST.RoutesMeta")

_DASHBOARD_PATH = Path(__file__).resolve().parent.parent / "frontend" / "dashboard.html"


async def dashboard():
    if _DASHBOARD_PATH.exists():
        return _DASHBOARD_PATH.read_text(encoding="utf-8")
    return _HTMLResponse(
        content="<h1>Dashboard not found</h1><p>frontend/dashboard.html missing</p>",
        status_code=404,
    )


async def api_journal(category: str = "actions", limit: int = 50, level: str = ""):
    return {
        "category": category,
        "entries": journal.query(category, min(limit, 500), level or None),
        "stats": journal.stats(),
    }


async def serve_manifest():
    return FileResponse(
        FRONTEND / "manifest.json",
        media_type="application/manifest+json",
        headers={"Cache-Control": "public, max-age=3600"},
    )


async def serve_sw():
    return FileResponse(
        FRONTEND / "sw.js",
        media_type="application/javascript",
        headers={
            "Service-Worker-Allowed": "/",
            "Cache-Control": "no-cache, no-store, must-revalidate",
        },
    )


async def index():
    return FileResponse(FRONTEND / "index.html")


def register_meta_routes(app: FastAPI) -> None:

    @app.get("/offline")
    async def offline_page():
        return FileResponse(FRONTEND / "offline.html")

    """Регистрирует мета-эндпоинты на app."""
    app.add_api_route("/dashboard", dashboard, methods=["GET"], response_class=_HTMLResponse)
    app.add_api_route("/api/journal", api_journal, methods=["GET"])
    app.add_api_route("/manifest.json", serve_manifest, methods=["GET", "HEAD"])
    app.add_api_route("/sw.js", serve_sw, methods=["GET", "HEAD"])
    app.add_api_route("/", index, methods=["GET"])
