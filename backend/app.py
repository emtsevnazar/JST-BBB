"""JST Studio FastAPI app: middleware, routers, startup, static, index.

Точка сборки приложения. main.py реэкспортирует `app` из этого модуля.
"""

from __future__ import annotations

import asyncio
import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.trustedhost import TrustedHostMiddleware

from .api.batch import router as batch_router
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

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
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


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup/shutdown: инициализация Engine + graceful shutdown (P3.5)."""
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
    try:
        yield
    finally:
        # P3.5: graceful shutdown — дождаться активных WS, освободить Engine
        t_shutdown = time.time()
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
app.include_router(history_router)

# === SECURITY MIDDLEWARE ===

# Кэш /api/health: startup_check дорогой, вызывается на каждый GET


app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestSizeLimitMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:8000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["127.0.0.1", "localhost", "127.0.0.1:8000", "localhost:8000"],
)
app.add_middleware(GZipMiddleware, minimum_size=500)


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
