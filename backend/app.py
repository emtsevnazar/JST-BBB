"""JST Studio FastAPI app: middleware, routers, startup, static, index.

Точка сборки приложения. main.py реэкспортирует `app` из этого модуля.
"""

from __future__ import annotations

import asyncio
import logging
import os
import time
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.trustedhost import TrustedHostMiddleware

from backend.logging_setup import setup_logging

from .api.batch import router as batch_router
from .api.emergency import router as emergency_router
from .api.health import router as health_router
from .api.history import router as history_router
from .api.moods import router as moods_router
from .api.output import router as output_router
from .api.stt import router as stt_router
from .api.stt_ws import router as stt_ws_router  # JST_STT_WS_PATCH
from .api.system import router as system_router
from .api.voices import router as voices_router
from .api.ws import router as ws_router
from .api.ws import ws_active_count
from .engine import Engine
from .security.middleware import (
    RequestSizeLimitMiddleware,
    SecurityHeadersMiddleware,
)
from .services import journal

setup_logging()
log = logging.getLogger("JST.API")

from .core.paths import (
    FRONTEND,
    REFERENCE,
)
from .core.state import set_engine
from .services import history as history_mod
from .services.batch import BatchQueue

WS_SHUTDOWN_MAX_WAIT = 5.0

# Все известные языки

# Что каждая модель МОЖЕТ поддерживать (независимо от загрузки весов)


# v1.8.1: вынесено в bootstrap.py
from .bootstrap import _init_admin_token  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup/shutdown: инициализация Engine + graceful shutdown (P3.5)."""
    # v1.8.5: Sentry (no-op если JST_SENTRY_DSN не задан)
    from .observability import init_observability

    init_observability()

    # === v1.7.10: SECURITY INIT ===
    _init_admin_token()
    try:
        from .security.hardening import watchdog as _wd

        _wd.start()
        log.info("[security] watchdog started")
    except Exception as _we:
        log.error("[security] watchdog start failed: %s", _we)
    # === END SECURITY INIT ===

    # v1.3.0: memory guard — watchdog RSS + системной памяти
    from scripts.guard import memory_guard_loop

    guard_task: asyncio.Task | None = None
    try:
        guard_task = asyncio.create_task(memory_guard_loop())
        log.info("guard: memory watchdog task started")
    except Exception as _ge:
        log.warning("guard: task не запущен: %s", _ge)

    t_startup = time.time()
    log.info("Инициализация Engine…")
    engine = Engine(device="auto", reference_wav=str(REFERENCE))
    set_engine(engine)
    log.info("Engine готов за %.1f с", time.time() - t_startup)

    history_db = history_mod.HistoryDB(history_mod.DB_PATH)
    history_db.init()
    history_mod.set_history(history_db)
    app.state.history_db = history_db

    batch_queue = BatchQueue()
    await batch_queue.start()
    app.state.batch_queue = batch_queue

    # P7.2: cleanup output/ — один раз при старте + фон раз в час
    from .output_cleanup import cleanup_loop, cleanup_once

    cleanup_task: asyncio.Task | None = None
    try:
        _cleanup_res = await cleanup_once()
        log.info(
            "cleanup: старт — удалено %s (TTL) + %s (size), осталось %s MB",
            _cleanup_res["deleted_by_ttl"],
            _cleanup_res["deleted_by_size"],
            _cleanup_res["total_mb"],
        )
    except Exception as _ce:
        log.warning("cleanup на старте: %s", _ce)
    try:
        cleanup_task = asyncio.create_task(cleanup_loop())
        log.info("cleanup: фоновый worker запущен (раз в час)")
        try:
            journal.action("SERVER_START", port=8000)
            log.info("journal: SERVER_START logged")
        except Exception as _je:
            log.warning("journal init: %s", _je)
    except Exception as _ce2:
        log.warning("cleanup worker не запущен: %s", _ce2)

    # v1.7.11: housekeeping — pycache, plain logs, tmp, tts cache
    from .security.housekeeping import (
        housekeeping_loop as _hk_loop,
    )
    from .security.housekeeping import (
        housekeeping_run as _hk_run,
    )

    hk_task: asyncio.Task | None = None
    try:
        _hk_run()
        log.info("[housekeeping] one-time run at startup: OK")
        hk_task = asyncio.create_task(_hk_loop())
        log.info("[housekeeping] loop task started (interval=3600s)")
    except Exception as _hke:
        log.warning("[housekeeping] startup failed: %s", _hke)

    try:
        yield
    finally:
        # v1.3.0: остановка memory guard ДО остальных teardown-ов
        if guard_task is not None:
            try:
                guard_task.cancel()
                try:
                    await guard_task
                except asyncio.CancelledError:
                    pass
                log.info("guard: task cancelled")
            except Exception as _ge2:
                log.warning("guard: shutdown: %s", _ge2)

        # P3.5: graceful shutdown — дождаться активных WS, освободить Engine
        t_shutdown = time.time()

        # P7.2: остановка cleanup worker
        if cleanup_task is not None:
            try:
                cleanup_task.cancel()
                try:
                    await cleanup_task
                except asyncio.CancelledError:
                    pass
                log.info("cleanup: worker остановлен")
            except Exception as _se:
                log.warning("cleanup shutdown: %s", _se)

        if hk_task is not None:
            try:
                hk_task.cancel()
                try:
                    await hk_task
                except asyncio.CancelledError:
                    pass
                log.info("housekeeping: worker остановлен")
            except Exception as _hse:
                log.warning("housekeeping shutdown: %s", _hse)

        await batch_queue.stop()
        history_mod.set_history(None)
        history_db.close()
        active = ws_active_count()
        log.info("Shutdown: %d активных WS, ожидание до %.0f с…", active, WS_SHUTDOWN_MAX_WAIT)
        deadline = time.time() + WS_SHUTDOWN_MAX_WAIT
        while ws_active_count() > 0 and time.time() < deadline:
            await asyncio.sleep(0.1)
        remaining = ws_active_count()
        if remaining > 0:
            log.warning(
                "Shutdown: %d WS не закрылись за %.0f с, продолжаем",
                remaining,
                WS_SHUTDOWN_MAX_WAIT,
            )

        cleanup = getattr(engine, "cleanup", None)
        if cleanup is not None:
            try:
                result = cleanup()
                if asyncio.iscoroutine(result):
                    await asyncio.wait_for(result, timeout=2.0)
            except Exception as e:
                log.warning("engine.cleanup: %s", e)

        set_engine(None)
        try:
            import gc

            gc.collect()
        except Exception:
            pass
        log.info("Shutdown завершён за %.1f с", time.time() - t_shutdown)


# v1.8.0: API-key auth для непубличных путей


app = FastAPI(title="JST Studio", lifespan=lifespan)

app.include_router(moods_router)
app.include_router(system_router)
app.include_router(health_router)
app.include_router(voices_router)
app.include_router(output_router)
app.include_router(stt_router)
app.include_router(ws_router)
app.include_router(stt_ws_router)


app.include_router(batch_router)
app.include_router(emergency_router)
app.include_router(history_router)

# v1.7.10: security stats + unblock
from .api.security_api import router as security_router

app.include_router(security_router)

from .api.ai_api import router as ai_router

app.include_router(ai_router)

# v1.8.1: meta-routes (dashboard, journal, PWA, index)
from .routes_meta import register_meta_routes as _reg_meta

_reg_meta(app)


# v1.7.12: Dashboard — HTML + live metrics (blocklist/rate/watchdog/housekeeping)

_DASHBOARD_PATH = Path(__file__).resolve().parent.parent / "frontend" / "dashboard.html"


# === SECURITY MIDDLEWARE ===

# Кэш /api/health: startup_check дорогой, вызывается на каждый GET


app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestSizeLimitMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=(
        os.getenv("JST_ALLOWED_ORIGINS", "").split(",")
        if os.getenv("JST_ALLOWED_ORIGINS")
        else [
            "http://127.0.0.1:8000",
            "http://localhost:8000",
            "tauri://localhost",
            "https://tauri.localhost",
        ]
    ),
    allow_credentials=False,
    allow_origin_regex=r"http://(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?",
    allow_methods=["*"],
    allow_headers=["*"],
)
# v1.8.3: env-driven TrustedHost (dev: ["*"], prod: ["yourdomain.com"])
_allowed_hosts_env = os.getenv("JST_TRUSTED_HOSTS", "").strip()
_allowed_hosts = (
    [h.strip() for h in _allowed_hosts_env.split(",") if h.strip()] if _allowed_hosts_env else ["*"]
)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=_allowed_hosts)
app.add_middleware(GZipMiddleware, minimum_size=500)

# v1.8.2: extra middleware (rate-limit, audit, static-cache) extracted
from .middleware_extra import register_extra_middleware as _reg_extra_mw

_reg_extra_mw(app)


# v1.10.0: HTML 404/500 → redirect на /offline (кроме /api, /static, /ws)
from starlette.exceptions import HTTPException as _StarletteHTTPException


@app.exception_handler(_StarletteHTTPException)
async def _html_404_500_handler(request, exc):
    """v1.10.2: HTML 404/500 → /offline?reason=&status= ; API/static/ws/output → JSON.

    Accept-фильтр убран: curl, боты, fetch также получают 302 (кроме API).
    /offline защищён от рекурсии.
    """
    path = request.url.path
    if path.startswith(("/api/", "/static/", "/ws/", "/output/", "/offline")):
        from starlette.responses import JSONResponse as _JR  # noqa: N814

        return _JR({"detail": exc.detail}, status_code=exc.status_code)
    if exc.status_code in (404, 500):
        from fastapi.responses import RedirectResponse as _RR  # noqa: N814

        reason = "notfound" if exc.status_code == 404 else "server"
        return _RR(f"/offline?reason={reason}&status={exc.status_code}", status_code=302)
    from starlette.responses import JSONResponse as _JR  # noqa: N814

    return _JR({"detail": exc.detail}, status_code=exc.status_code)


# === v0.9.1-fix: Audit + rate limit ===


# v1.7.10: RateLimiterV2 (per-prefix) + IPBlocklist — см. security/hardening.py


# === v1.4.0: PWA endpoints (root-level for proper SW scope) ===


app.mount("/static", StaticFiles(directory=str(FRONTEND)), name="static")


# === МОДЕЛИ И ЯЗЫКИ ===
# === SECURITY HEADERS (Stage 2) ===


# === ГОЛОСА ===


# === OUTPUT ===


# === STT (Speech-to-Text) для микрофона ===


# === SAVE ===


# === WEBSOCKET SYNTH ===
# WebSocket: не более MAX_WS_PER_IP одновременных соединений с одного IP


# ============================================================
# WS rate limit wrapper (A2)
# ============================================================

# === JST_ERROR_PATCH ===
from backend.core.error_state import error_state as _jst_err_state
from backend.routes import error as _jst_err_routes

app.include_router(_jst_err_routes.router)


@app.middleware("http")
async def _jst_error_redirect_mw(request, call_next):
    from fastapi.responses import RedirectResponse

    path = request.url.path
    if (
        path == "/error"
        or path.startswith("/api/")
        or path.startswith("/static/")
        or path
        in (
            "/healthz",
            "/readyz",
            "/favicon.ico",
            "/manifest.json",
            "/sw.js",
            "/offline",
            "/offline/",
        )
    ):
        return await call_next(request)
    if path in ("/", "", "/index.html") and not _jst_err_state.snapshot()["healthy"]:
        return RedirectResponse(url="/error", status_code=302)
    return await call_next(request)


# === /JST_ERROR_PATCH ===

# === JST_VOICECLONE_PATCH ===
from backend.routes import voice_clone as _jst_vc_routes

app.include_router(_jst_vc_routes.router)
# === /JST_VOICECLONE_PATCH ===
