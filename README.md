# JST Studio — Just Start Transform

Профессиональный TTS/STT-инструмент: клонирование голоса, настроения, многоязычие.

## Быстрый старт

    cd ~/Documents/AAC/transformation/voice_forge_studio
    ./start.sh

Сервер: http://127.0.0.1:8000. Проверка:

    curl -s http://127.0.0.1:8000/api/health
    # {"ok":true,"checks":{...},"rate_limit_remaining":60,"cached":false}

## Требования

- macOS (Apple Silicon, MPS)
- Python 3.11 (venv: ../../code/bin или .venv312/bin)
- ffmpeg (brew install ffmpeg)
- Модели: ~/Documents/AAC/main/pretrained_models/

## Конфигурация

.env в корне (не в git, .env.example — образец):

    HF_TOKEN=
    HF_HOME=
    HOST=127.0.0.1
    PORT=8000
    PYTORCH_ENABLE_MPS_FALLBACK=1
    PYTORCH_MPS_HIGH_WATERMARK_RATIO=0.0

start.sh читает .env и запускает uvicorn на $HOST:$PORT.
backend/core/config.py (pydantic-settings) дублирует PYTORCH_* в os.environ до import torch.

## Архитектура

    backend/
    ├── main.py                    # 39 символов: from .app import app
    ├── app.py                     # FastAPI + middleware + 7 routers + lifespan
    ├── engine.py                  # ядро: VoxCPM2/CosyVoice/Chatterbox + clone
    ├── api/                       # 7 роутеров
    │   ├── moods.py / system.py / health.py
    │   ├── voices.py / output.py / stt.py / ws.py
    ├── core/                      # config, constants, paths, state, naming, utils
    ├── services/                  # jst_moods, clone_engine, references, output_service
    ├── security/                  # safety, middleware
    └── tests/                     # 20 pytest-тестов

## API endpoints (22)

| Метод | Путь | Файл |
|---|---|---|
| GET | / | app.py |
| GET | /health /api/health /api/models | api/health.py |
| GET | /api/moods | api/moods.py |
| GET | /api/presets /api/formats /api/languages | api/system.py |
| POST | /api/mode | api/system.py |
| GET | /api/voices | api/voices.py |
| POST | /api/voices/create, /{voice}/upload, /{voice}/upload-blob, /{voice}/rebuild-reference | api/voices.py |
| GET | /api/output, /output/{filename} | api/output.py |
| POST | /api/clear-history | api/output.py |
| GET | /api/download-all-zip, /api/download-all-merged | api/output.py |
| POST | /api/stt | api/stt.py |
| WS | /ws/synthesize | api/ws.py |

## WebSocket /ws/synthesize

Клиент → сервер:

    {"type":"synthesize","text":"...","voice":"...","settings":{...}}

Сервер → клиент: start → stage → binary PCM chunks → done или error.
Rate limit: MAX_WS_PER_IP = 3.

## Тесты

    cd backend
    python3 -m pytest tests/ -v
    # 20 passed, 3 warnings in ~3.5s

FakeEngine в conftest.py — без загрузки моделей.

## Стек

FastAPI + Uvicorn, VoxCPM2/CosyVoice/Chatterbox, Resemblyzer + OpenVoice, whisper, Vanilla JS, ffmpeg, pydantic-settings, pytest.

## Безопасность

- CSP, X-Frame-Options: DENY, TrustedHost, CORS, GZip, RequestSizeLimit 100MB
- Валидация текста/файлов, path traversal, rate limiter 60/min, circuit breaker
- Перед публикацией: HTTPS + JWT + rate limit на все API

## Ограничения

- Загрузка моделей ~30 с при старте
- HF Hub без HF_TOKEN — низкий rate limit
- MPS (Apple Silicon) — авто-выбор через Engine(device="auto")
