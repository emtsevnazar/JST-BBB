# JST Studio — Just Start Transform

Профессиональный TTS/STT-инструмент: синтез речи, клонирование голоса,
настроения (moods), многоязычие, пакетная обработка, история и экспорт.

## Быстрый старт

    cd ~/Documents/AAC/transformation/voice_forge_studio
    ./start.sh

Сервер: http://127.0.0.1:8000. Проверка:

    curl -s http://127.0.0.1:8000/api/health
    # {"ok":true,"checks":{...},"rate_limit_remaining":60,"cached":false}

## Требования

- macOS (Apple Silicon, MPS) или Linux + CUDA
- Python 3.11 (venv: `../../code/bin` или `.venv312/bin`)
- ffmpeg (`brew install ffmpeg`) — для mp3/flac/ogg/m4a/opus
- Модели: `~/Documents/AAC/main/pretrained_models/`

## Конфигурация

`.env` в корне (не в git, `.env.example` — образец):

    HF_TOKEN=
    HF_HOME=
    HOST=127.0.0.1
    PORT=8000
    PYTORCH_ENABLE_MPS_FALLBACK=1
    PYTORCH_MPS_HIGH_WATERMARK_RATIO=0.0
    JST_HISTORY_DB=          # опционально; default: data/jst.db

`start.sh` читает `.env` и запускает uvicorn на `$HOST:$PORT`.
`backend/core/config.py` (pydantic-settings) дублирует `PYTORCH_*` в `os.environ` до `import torch`.

## Возможности

- **Синтез:** HTTP `POST /api/synthesize`-совместимые роутеры + WebSocket `/ws/synthesize`
  (стриминг чанками, прогресс по стадиям).
- **Batch:** очередь `BatchQueue` (FIFO, 1 воркер, `asyncio.to_thread`), 4 HTTP-эндпоинта
  (`POST/GET/LIST/DELETE`), WebSocket `/ws/batch/{task_id}` для live-статуса.
- **История:** SQLite (`data/jst.db`), `GET /api/history?limit=50`, `GET /api/history/{id}`.
- **Экспорт:** `GET /api/history/{id}/export` → ZIP (audio + `settings.json` + `metadata.json`).
- **Голоса:** `/api/voices` (список, создание, загрузка `.txt`), референсы в `voices/`.
- **Модели:** `core`, `multi`, `qwen`, `cosyvoice`, `voxcpm`, `jst_clone` — переключение
  через `settings.mode`.
- **Moods:** `neutral`, `sad`, `whisper`, `asmr`, `podcast`, `audiobook`, `news`, `trailer`
  — параметры подмешиваются автоматически (`auto`) или по явному `settings.mood`.
- **Безопасность:** `RequestSizeLimitMiddleware`, `SecurityHeadersMiddleware`,
  `TrustedHostMiddleware`, rate-limit по IP (HTTP + WS).

## API (сводка)

| Метод | Путь | Назначение |
|---|---|---|
| GET  | `/health` | liveness + observability (version, git_sha, uptime, ws_active) |
| GET  | `/api/health` | расширенный health (checks, rate_limit_remaining) |
| GET  | `/api/models` | список моделей |
| GET  | `/api/languages` | поддерживаемые языки |
| GET  | `/api/moods` | список moods и параметров |
| POST | `/api/synthesize` | синтез (HTTP) |
| GET  | `/api/output` | список файлов в `output/` |
| POST | `/api/stt` | speech-to-text |
| GET  | `/api/voices` | список голосов |
| POST | `/api/voices` | создать/загрузить голос |
| GET  | `/api/system` | системная информация |
| POST | `/api/batch` | создать batch-задачу → `{task_id}` |
| GET  | `/api/batch/{id}` | статус задачи |
| GET  | `/api/batch?limit=50` | последние задачи |
| DELETE | `/api/batch/{id}` | отменить задачу (409 если нельзя) |
| GET  | `/api/history?limit=50` | история из SQLite |
| GET  | `/api/history/{id}` | одна запись |
| GET  | `/api/history/{id}/export` | ZIP (audio + settings + metadata) |
| WS   | `/ws/synthesize` | стриминг синтеза |
| WS   | `/ws/batch/{id}` | live-статус batch-задачи |

### Пример: batch → история → экспорт

    # 1) поставить задачу
    curl -s -X POST http://127.0.0.1:8000/api/batch \
      -H 'Content-Type: application/json' \
      -d '{"text":"Привет, мир","voice":"","settings":{}}'
    # {"ok":true,"task_id":"a1b2c3d4e5f6"}

    # 2) следить за прогрессом через WS (или поллингом)
    # wscat -c ws://127.0.0.1:8000/ws/batch/a1b2c3d4e5f6
    # или:
    curl -s http://127.0.0.1:8000/api/batch/a1b2c3d4e5f6

    # 3) после done — история и ZIP-экспорт
    curl -s http://127.0.0.1:8000/api/history/a1b2c3d4e5f6
    curl -s -o task.zip http://127.0.0.1:8000/api/history/a1b2c3d4e5f6/export

## Архитектура

    backend/
    ├── main.py                    # 39 символов: from .app import app
    ├── app.py                     # FastAPI + middleware + 9 routers + lifespan
    │                              # (Engine, BatchQueue, HistoryDB init/shutdown)
    ├── engine.py                  # Engine: ML-модели, synth_one, synth_jst_clone, ...
    ├── security/
    │   ├── middleware.py          # RequestSizeLimit / SecurityHeaders
    │   └── safety.py              # validate_text
    ├── core/
    │   ├── paths.py               # ROOT, FRONTEND, VOICES, OUTPUT, REFERENCE
    │   ├── state.py               # get_engine/set_engine
    │   ├── config.py              # pydantic-settings + PYTORCH_* дубли
    │   ├── naming.py              # NAMER.next_name()
    │   └── utils.py               # _int, _num
    ├── services/
    │   ├── output_service.py      # save_output (WAV + ffmpeg-конвертации)
    │   ├── references.py          # resolve_reference
    │   ├── jst_moods.py           # detect_mood, MOOD_PARAMS
    │   ├── batch.py               # BatchTask + BatchQueue (pub/sub, FIFO)
    │   └── history.py             # HistoryDB (sqlite3, соединение на операцию)
    ├── api/
    │   ├── health.py, moods.py, output.py, stt.py, system.py, voices.py
    │   ├── ws.py                  # /ws/synthesize + _try_register_ip / ws_active_count
    │   ├── batch.py               # 4 HTTP + WS /ws/batch/{id}
    │   └── history.py             # list / get / export (ZIP)
    └── tests/                     # 78 тестов, FakeEngine (без ML)

## Тестирование

    # один раз: поставить dev-зависимости
    pip install -r requirements-dev.txt

    # прогон
    cd backend
    /Users/nazar/Documents/AAC/code/bin/python3 -m pytest tests/ -q

    # с покрытием (гейт 59%)
    /Users/nazar/Documents/AAC/code/bin/python3 -m pytest tests/ -q --no-header

Текущее состояние: **78 passed**, coverage **59.50%** (при `--cov-fail-under=59`).
`.coveragerc` исключает `engine.py`, `services/clone_engine.py`, `main.py`,
`core/config.py` — там реальные модели/тонкие реэкспорты, не тестируются в CI.

Pre-commit (`.pre-commit-config.yaml`): `ruff check --fix`, `ruff format --check`,
локальный hook `pytest-cov` (coverage проверяется **до** коммита).

## CI

GitHub Actions (`.github/workflows/pytest.yml`):
- `syntax` — `ruff check` + `ruff format --check`
- `pytest` — полный прогон с `--cov-fail-under=59`

Оба должны быть зелёными на `main`. История этапов — в `CLAUDE.md`.

## Roadmap

- P0–P2 — движок, синтез, голоса, moods, WS, security — закрыты.
- P3 — инженерное качество (ruff, pre-commit, health, graceful shutdown,
  pytest-cov, smoke) — закрыт.
- P4 — batch synthesis (queue + 4 HTTP + WS-статус + SQLite-история + ZIP-экспорт) — закрыт.
- P5 — гигиена репо, README, OpenAPI tags, real-engine smoke — в процессе.
