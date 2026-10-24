"""JST Studio FastAPI app: middleware, routers, startup, static, index.

Точка сборки приложения. main.py реэкспортирует `app` из этого модуля.
"""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.trustedhost import TrustedHostMiddleware

from .api.health import router as health_router
from .api.moods import router as moods_router
from .api.output import router as output_router
from .api.stt import router as stt_router
from .api.system import router as system_router
from .api.voices import router as voices_router
from .api.ws import router as ws_router
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

# Все известные языки

# Что каждая модель МОЖЕТ поддерживать (независимо от загрузки весов)







@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup/shutdown: инициализация Engine."""
    log.info("Инициализация Engine…")
    set_engine(Engine(device="auto", reference_wav=str(REFERENCE)))
    log.info("Engine готов")
    yield


app = FastAPI(title="JST Studio", lifespan=lifespan)

app.include_router(moods_router)
app.include_router(system_router)
app.include_router(health_router)
app.include_router(voices_router)
app.include_router(output_router)
app.include_router(stt_router)
app.include_router(ws_router)

# === SECURITY MIDDLEWARE ===

# Кэш /api/health: startup_check дорогой, вызывается на каждый GET


app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestSizeLimitMiddleware)

app.add_middleware(CORSMiddleware, allow_origins=["http://127.0.0.1:8000", "http://localhost:8000"], allow_credentials=True,
                   allow_methods=["*"], allow_headers=["*"])
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["127.0.0.1", "localhost", "127.0.0.1:8000", "localhost:8000"])
app.add_middleware(GZipMiddleware, minimum_size=500)


app.mount("/static", StaticFiles(directory=str(FRONTEND)), name="static")

@app.get("/")
async def index(): return FileResponse(FRONTEND / "index.html")



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
