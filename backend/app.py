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
from fastapi.responses import FileResponse
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


def _init_admin_token() -> None:
    """v1.7.10: загрузить JST_ADMIN_TOKEN из .env.local (если есть) или сгенерировать.

    Логика:
    1. Если JST_ADMIN_TOKEN уже в os.environ — используем его.
    2. Иначе читаем .env.local: если там есть токен — загружаем в environ.
    3. Иначе генерируем новый, ПЕРЕЗАПИСЫВАЕМ .env.local (не append!),
       chmod 600, выводим в log.warning (shown once).
    """
    import secrets as _secrets
    import time as _time
    from pathlib import Path as _Path

    if os.getenv("JST_ADMIN_TOKEN", "").strip():
        log.info("[security] JST_ADMIN_TOKEN already in env")
        return

    env_local = _Path(__file__).resolve().parent.parent / ".env.local"

    # Шаг 1: попытаться прочитать из .env.local
    existing_token = None
    if env_local.exists():
        try:
            for line in env_local.read_text(encoding="utf-8").splitlines():
                line = line.strip()
                if line.startswith("JST_ADMIN_TOKEN="):
                    existing_token = line.split("=", 1)[1].strip()
        except Exception as e:
            log.warning("[security] failed to read .env.local: %s", e)

    if existing_token:
        os.environ["JST_ADMIN_TOKEN"] = existing_token
        log.info("[security] JST_ADMIN_TOKEN loaded from .env.local")
        return

    # Шаг 2: сгенерировать новый
    token = _secrets.token_urlsafe(32)
    os.environ["JST_ADMIN_TOKEN"] = token
    log.warning("[security] JST_ADMIN_TOKEN auto-generated. Shown ONCE below:")
    log.warning("[security]   JST_ADMIN_TOKEN=%s", token)
    try:
        # ПЕРЕЗАПИСЫВАЕМ (не append!) — гарантирует один токен в файле
        with env_local.open("w", encoding="utf-8") as f:
            f.write("# v1.7.10: auto-generated secrets — DO NOT COMMIT\n")
            f.write(f"# {_time.strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"JST_ADMIN_TOKEN={token}\n")
        try:
            os.chmod(env_local, 0o600)
        except Exception:
            pass
        log.info("[security] token saved to %s (chmod 600)", env_local)
    except Exception as e:
        log.error("[security] failed to save token: %s", e)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup/shutdown: инициализация Engine + graceful shutdown (P3.5)."""
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


app = FastAPI(title="JST Studio", lifespan=lifespan)

app.include_router(moods_router)
app.include_router(system_router)
app.include_router(health_router)
app.include_router(voices_router)
app.include_router(output_router)
app.include_router(stt_router)
app.include_router(ws_router)
app.include_router(batch_router)
app.include_router(emergency_router)
app.include_router(history_router)

# v1.7.10: security stats + unblock
from .api.security_api import router as security_router

app.include_router(security_router)


# v1.7.12: Dashboard — HTML + live metrics (blocklist/rate/watchdog/housekeeping)
from fastapi.responses import HTMLResponse as _HTMLResponse

_DASHBOARD_PATH = Path(__file__).resolve().parent.parent / "frontend" / "dashboard.html"


@app.get("/dashboard", response_class=_HTMLResponse)
async def dashboard():
    if _DASHBOARD_PATH.exists():
        return _DASHBOARD_PATH.read_text(encoding="utf-8")
    return _HTMLResponse(
        content="<h1>Dashboard not found</h1><p>frontend/dashboard.html missing</p>",
        status_code=404,
    )


@app.get("/api/journal")
async def api_journal(category: str = "actions", limit: int = 50, level: str = ""):
    return {
        "category": category,
        "entries": journal.query(category, min(limit, 500), level or None),
        "stats": journal.stats(),
    }


# === SECURITY MIDDLEWARE ===

# Кэш /api/health: startup_check дорогой, вызывается на каждый GET


app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestSizeLimitMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:8000",
        "http://localhost:8000",
        # Tauri 2 origins (macOS/Linux)
        "tauri://localhost",
        # Tauri 2 origins (Windows)
        "https://tauri.localhost",
    ],
    allow_credentials=False,
    allow_origin_regex=r"http://(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?",
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"],  # v1.7.3: dev mode — accept any host,
)
app.add_middleware(GZipMiddleware, minimum_size=500)


# === v0.9.1-fix: Audit + rate limit ===
import time as _t

from starlette.responses import JSONResponse as _JSONResponse

from .audit import log_event as _log_event

# v1.7.10: RateLimiterV2 (per-prefix) + IPBlocklist — см. security/hardening.py
from .security.hardening import blocklist as _blocklist
from .security.hardening import rate_limiter as _rate_limiter


@app.middleware("http")
async def jst_rate_limit(request, call_next):
    ip = request.client.host if request.client else "unknown"
    path = request.url.path
    # v1.7.10-fix: /api/security/* доступен даже забаненным IP
    # (иначе нельзя разбанить себя; stats нужен для видимости состояния)
    if not path.startswith("/api/security/") and _blocklist.is_banned(ip):
        return _JSONResponse(
            {"error": "ip_blocked", "detail": "IP temporarily blocked"},
            status_code=403,
        )
    if not _rate_limiter.check(ip, path):
        return _JSONResponse(
            {"error": "rate_limit_exceeded", "detail": "Слишком много запросов"},
            status_code=429,
        )
    return await call_next(request)


@app.middleware("http")
async def jst_audit_middleware(request, call_next):
    t0 = _t.time()
    status = 500
    try:
        response = await call_next(request)
        status = response.status_code
        return response
    finally:
        dur = (_t.time() - t0) * 1000
        try:
            _log_event(
                ip=request.client.host if request.client else "unknown",
                method=request.method,
                path=request.url.path,
                status=status,
                duration_ms=dur,
                user_agent=request.headers.get("user-agent", ""),
            )
        except Exception:
            pass


# === v1.4.0: PWA endpoints (root-level for proper SW scope) ===
@app.api_route("/manifest.json", methods=["GET", "HEAD"])
async def serve_manifest():
    return FileResponse(
        FRONTEND / "manifest.json",
        media_type="application/manifest+json",
        headers={"Cache-Control": "public, max-age=3600"},
    )


@app.api_route("/sw.js", methods=["GET", "HEAD"])
async def serve_sw():
    return FileResponse(
        FRONTEND / "sw.js",
        media_type="application/javascript",
        headers={
            "Service-Worker-Allowed": "/",
            "Cache-Control": "no-cache, no-store, must-revalidate",
        },
    )


app.mount("/static", StaticFiles(directory=str(FRONTEND)), name="static")


@app.get("/")
async def index():
    return FileResponse(FRONTEND / "index.html")


# === МОДЕЛИ И ЯЗЫКИ ===
# === SECURITY HEADERS (Stage 2) ===
@app.middleware("http")
async def static_cache_control(request, call_next):
    response = await call_next(request)
    if request.url.path.startswith("/static/"):
        response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
    return response


# === ГОЛОСА ===


# === OUTPUT ===


# === STT (Speech-to-Text) для микрофона ===


# === SAVE ===


# === WEBSOCKET SYNTH ===
# WebSocket: не более MAX_WS_PER_IP одновременных соединений с одного IP


# ============================================================
# WS rate limit wrapper (A2)
# ============================================================
