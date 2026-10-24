# CLAUDE.md — для AI-ассистентов

## Куда смотреть

| Хочу | Файл |
|---|---|
| Запустить | start.sh → uvicorn backend.main:app |
| Endpoint | backend/api/*.py + app.include_router |
| Middleware | backend/security/middleware.py |
| Валидация | backend/security/safety.py |
| Конфиг | backend/core/config.py (settings) |
| Пути | backend/core/paths.py |
| ENGINE | backend/core/state.py (set_engine/get_engine) |
| Константы | backend/core/constants.py |
| TTS-ядро | backend/engine.py (не трогать без тестов) |
| Тесты | backend/tests/ (20 штук) |

## Соглашения при переносах

1. AST, не regex. ast.parse, node.lineno, node.end_lineno, simple_range.
2. PROTECTED = {"set_mode"}. Проверять пересечение с диапазоном удаления до записи.
3. ENGINE = get_engine() первой строкой функции, не переписывать 20+ ENGINE.xxx.
4. Бэкапы *.stepN_bak рядом с оригиналом. Откат — cp file.stepX_bak file.
5. dir(builtins) для сканера, ast.arguments для lambda/def, ast.ExceptHandler.name для except.

## Что НЕ трогать

- backend/main.py — 39-символьный реэкспорт from .app import app (точка входа uvicorn).
- backend/engine.py — ROOT-зависимости (строки 154, 155, 190: ROOT / "output"). Robust FINETUNING (8-18) — можно, ROOT — нет.
- Порядок импортов в app.py: from .core.config import settings до from .engine import (строка 17 vs 18). Иначе PYTORCH_* не установятся до import torch.
- backend/core/paths.py — ROOT = parents[2]. При переносе в другую глубину — пересчитать.

## Как тестировать

    cd backend
    python3 -m pytest tests/ -v

    bash /tmp/restart.sh
    sleep 75
    curl -s http://127.0.0.1:8000/health

## Известные долги

- frontend/*.before_*, *.pre-compress.bak — исторические, не в .gitignore.
- git не инициализирован (fatal: not a git repository).
- app.py:86 — на момент 3.11 всё ещё @app.on_event("startup"); lifespan в app.py.step310_bak. Если pytest = 3 warnings — миграция прошла; 5 — откат.

## Прогресс

- P2.2 (модуляризация) — закрыт. main.py 30000+ → 39.
- P2.3 (pytest) — 20 тестов, ~3.5 сек.
- P2.4 — в работе:
  - 3.9a/b (config + .env + start.sh) — ok
  - 3.10 (lifespan) — ok
  - 3.11 (docs) — сейчас
  - 3.12 (GitHub Actions)
  - 3.13 (Docker)

## Docker/Podman (3.13) — статус на 2026-10-24

Образ `localhost/jst-studio:local` собирается (2.36 GB, Podman 6.1.4, aarch64,
CPU-only torch/torchaudio). `podman run` стартует, но Engine падает на
`ChatterboxTTS = None` — приватный пакет `~/Documents/AAC/main/src/chatterbox_`
требует всё новые зависимости из своего окружения (по одной: perth → omegaconf → ...).
Хвост длинный, в публичный requirements.txt его тащить нецелесообразно.

### Что работает
- Локальный uvicorn на MPS: Engine готов за ~36 сек, `engine_ready: true`.
- CI: `syntax` + `pytest` зелёные (GitHub Actions, 2m47s).
- 20 pytest-тестов зелёные.

### Что делать с Docker
- Для деплоя: собирать образ на Linux-сервере, где `src/chatterbox_` и его
  полное окружение (`perf, vocos, omegaconf, ...`) уже установлены рядом.
- Либо `docker save` с машины, где контейнер работает.
- Локально для разработки контейнер не нужен — CPU в 5–10 раз медленнее MPS.

Dockerfile, .dockerignore, docker-compose.yml — закоммичены, готовы к использованию
на Linux-инфраструктуре.
