"""Health API endpoint.

/health, /api/health, /api/models — все требуют get_engine() из core.state.
"""

from __future__ import annotations

import time
from pathlib import Path

from fastapi import APIRouter, Request

from .. import __version__
from ..core.constants import MODEL_LANGS
from ..core.state import GIT_SHA, get_engine, uptime_sec
from ..security.safety import limiter, startup_check
from .ws import ws_active_count

ROOT = Path(__file__).resolve().parents[2]

router = APIRouter(tags=["Health"])


_health_cache: dict = {"data": None, "ts": 0.0}
HEALTH_TTL = 60.0


@router.get("/api/health")
async def api_health():
    """Статус моделей и окружения (кэш 60 сек)."""
    now = time.time()
    cached = _health_cache["data"] is not None and (now - _health_cache["ts"]) < HEALTH_TTL
    if not cached:
        _health_cache["data"] = startup_check(ROOT)
        _health_cache["ts"] = now
    return {
        "ok": True,
        "checks": _health_cache["data"],
        "rate_limit_remaining": limiter.remaining(),
        "cached": cached,
    }


@router.get("/health")
async def health():
    ENGINE = get_engine()
    return {
        "ok": True,
        "version": __version__,
        "git_sha": GIT_SHA,
        "uptime_sec": uptime_sec(),
        "engine_ready": ENGINE is not None,
        "sr": ENGINE.sr if ENGINE else None,
        "device": ENGINE.device if ENGINE else None,
        "mode": ENGINE.current_mode if ENGINE else None,
        "ws_active": ws_active_count(),
    }


@router.get("/api/models")
async def list_models():
    ENGINE = get_engine()
    mtl_ok = bool(ENGINE and getattr(ENGINE, "mtl_engine", None) is not None)
    return {
        "models": [
            {"code": "core", "name": "Core", "loaded": True, "languages": MODEL_LANGS["core"]},
            {"code": "multi", "name": "Multi", "loaded": mtl_ok, "languages": MODEL_LANGS["multi"]},
            {
                "code": "jst_clone",
                "name": "JST Clone",
                "loaded": bool(ENGINE and getattr(ENGINE, "clone_engine", None) is not None),
                "languages": [
                    "ru",
                    "en",
                    "de",
                    "fr",
                    "es",
                    "it",
                    "pt",
                    "pl",
                    "tr",
                    "nl",
                    "sv",
                    "da",
                    "no",
                    "fi",
                    "el",
                    "he",
                    "ar",
                    "hi",
                    "sw",
                    "ms",
                    "zh",
                    "ja",
                    "ko",
                ],
            },
        ]
    }


# === P7.6: healthz + metrics ===
from pathlib import Path

from ..core.paths import OUTPUT


def _output_stats() -> dict:
    """Возвращает размер и количество файлов в output/."""
    try:
        files = list(OUTPUT.glob("*.wav"))
        total = sum(f.stat().st_size for f in files)
        return {
            "files": len(files),
            "mb": round(total / 1024 / 1024, 2),
        }
    except Exception:
        return {"files": 0, "mb": 0.0}


@router.get("/healthz")
async def healthz():
    """Простой healthcheck для docker-compose / мониторинга."""
    engine_ok = get_engine() is not None
    stats = _output_stats()
    return {
        "status": "ok" if engine_ok else "degraded",
        "engine": engine_ok,
        "output_mb": stats["mb"],
        "output_files": stats["files"],
        "ws_active": ws_active_count(),
    }


@router.get("/api/metrics")
async def metrics(request: Request):
    """Расширенные метрики (только localhost)."""
    from starlette.responses import JSONResponse

    ip = request.client.host if request.client else "unknown"
    if ip not in ("127.0.0.1", "::1", "localhost"):
        return JSONResponse({"error": "forbidden"}, status_code=403)

    engine_ok = get_engine() is not None
    stats = _output_stats()

    total_syntheses = 0
    try:
        from .. import history as _hist_mod

        db = getattr(_hist_mod, "_db", None)
        if db is None and hasattr(_hist_mod, "get_history"):
            db = _hist_mod.get_history()
        if db is not None and hasattr(db, "list"):
            total_syntheses = len(db.list(limit=100000))
    except Exception:
        total_syntheses = 0

    return {
        "engine": engine_ok,
        "syntheses_total": total_syntheses,
        "output_files": stats["files"],
        "output_mb": stats["mb"],
        "ws_active": ws_active_count(),
    }
