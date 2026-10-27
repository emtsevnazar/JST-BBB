# v1.8.6: Multi-stage Dockerfile for JST Studio
# Build: docker build -t jst-studio .
# Run:   docker run -p 8000:8000 -e JST_API_KEY=xxx jst-studio

# ============================================================
# Stage 1: builder — compile deps into venv
# ============================================================
FROM python:3.11-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    ffmpeg \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build
COPY requirements.txt .
RUN python -m venv /opt/venv && \
    /opt/venv/bin/pip install --upgrade pip && \
    /opt/venv/bin/pip install -r requirements.txt

# ============================================================
# Stage 2: runtime — slim image
# ============================================================
FROM python:3.11-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH" \
    JST_ENV=production

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libsndfile1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Non-root user
RUN groupadd -g 10001 jst && \
    useradd -u 10001 -g jst -m -s /bin/bash jst

WORKDIR /app

COPY --from=builder /opt/venv /opt/venv
COPY --chown=jst:jst backend/ ./backend/
COPY --chown=jst:jst frontend/ ./frontend/
COPY --chown=jst:jst scripts/ ./scripts/

RUN mkdir -p /app/output /app/logs /app/voices && \
    chown -R jst:jst /app

USER jst

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
    CMD curl -fsS http://127.0.0.1:8000/readyz || exit 1

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
