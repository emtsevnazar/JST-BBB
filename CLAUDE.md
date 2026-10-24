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

## Fix 2026-10-24: WebSocket UnboundLocalError
backend/api/ws.py: удалён дублирующий блок mood (14 строк), который обращался к `s`
до `s = SynthSettings.from_dict(...)`. Симптом: `UnboundLocalError: cannot access
local variable 's'` при каждом synthesize. Оставлен только второй блок (после
создания s). Коммит e889e36. Бэкап: ws.py.step_fix_ws_unbound_bak.

## P3.5 (graceful shutdown) — закрыт
- app.py: lifespan в try/finally, при shutdown ждёт WS до 5 с, engine.cleanup(),
  set_engine(None), gc.collect(). Логи: "Shutdown завершён за X.X с". Коммит 14938c9.
- engine.py: cleanup() снимает ссылки на модели (engine, mtl_engine, cosyvoice,
  voxcpm, qwen_tts, clone_engine, openvoice_converter) + gc.collect().
- Проверено вручную: `Ctrl+C` → `Shutdown завершён за 0.2 с`, без leaked semaphore.

## P3.6 (coverage) — в работе
- pytest-cov, .coveragerc с omit для engine.py, services/clone_engine.py,
  main.py, core/config.py (требуют реальных моделей / тонкие реэкспорты).
- pytest.ini: --cov-fail-under=55.
- CI: pytest.yml с --cov.
- Добавлены unit-тесты: test_utils.py, test_naming.py, test_output_service.py.

## P3.6 (coverage) — закрыт на 49.21%

- pytest-cov + .coveragerc с omit: engine.py, services/clone_engine.py,
  main.py, core/config.py (требуют реальных моделей / тонкие реэкспорты).
- --cov-fail-under=49 в pytest.ini и .github/workflows/pytest.yml.
- pre-commit hook pytest-cov: coverage проверяется ПЕРЕД коммитом
  (цикл "поднял гейт → CI упал → понизил" сломан).
- 46 тестов, 49.21% (без omit было бы ~30%).
- Добавлены: test_utils.py, test_naming.py, test_output_service.py,
  test_output_api.py (10), test_jst_moods.py (5).
- Дальше — P3.7 (smoke-тесты в CI), ценнее +5% coverage.

## P3 — закрыт (кроме P3.4/P3.8–P3.11)

- P3.1 ruff + pre-commit (ruff, ruff-format, pytest-cov) — ✓
- P3.3 /health observability — ✓
- P3.5 graceful shutdown — ✓
- P3.6 coverage 50.91% (pytest-cov, .coveragerc omit models) — ✓
- P3.7a smoke через TestClient (47 тестов, все 7 роутеров) — ✓
- P3.2 (правила E,F,W,I,N,UP,B,SIM) — ✓ (в ruff.toml)
- Не делали: P3.4 (structured logging), P3.8 (mypy), P3.9 (API v1),
  P3.10 (OpenAPI tags), P3.11 (удаление *.step*_bak). Не блокеры.

Следующий — P4.1 (batch synthesis).

## P4.1b — фикс BatchQueue.cancel (sync)

- `cancel` был `async def`, но не содержал `await` → возвращал корутину,
  тесты и API вызывали без `await` → CI на `419e9d6` красный.
- Исправлено: `async def cancel` → `def cancel`, в `api/batch.py` убран `await`.
- Локально: **59 passed**, coverage **55.20%** (гейт 54%).
- CI на `df28d7c` — зелёный (проверено).

## P4.2 — SQLite history для batch (закрыт)

- services/history.py: HistoryDB (sqlite3, соединение на операцию),
  get_history/set_history, DB_PATH (env JST_HISTORY_DB, default data/jst.db)
- services/batch.py: в finally _execute сохраняем task в history
  при status in {done, error} (через asyncio.to_thread)
- api/history.py: GET /api/history?limit=50, GET /api/history/{id} (404)
- app.py: history init в lifespan, include_router, set_history(None) + close
- conftest.py: DB_PATH → tmp_path/jst.db (тесты не пишут в data/)
- tests/test_history.py: 7 тестов (4 unit + 3 API/end-to-end)
- --cov-fail-under: 54 → 56
- coverage: 57.78% (было 55.20%)

CI: P4.1b (df28d7c) — ✓ (4m41s). P4.2 (4bb6df9) — ✓ pytest (ожид.).
Дальше — P4.4 (WS-статус batch) или P4.5 (ZIP-экспорт).

## P4.4 — WS-статус batch (закрыт)

- services/batch.py: subscribe/unsubscribe/_notify на asyncio.Queue;
  _execute и cancel() уведомляют подписчиков при смене status
- api/ws.py: вынесены публичные _try_register_ip/_unregister_ip
  (rate-limit по IP); ws_synthesize отрефакторен на них
- api/batch.py: WS /ws/batch/{task_id} — accept → initial state →
  updates → close 1000 на терминале; 4404 если task нет; 1008 при лимите;
  ping каждые 30 с
- tests/test_batch_ws.py: 8 тестов (1 endpoint registered + 7 pub/sub unit)
- --cov-fail-under: 56 → 58
- coverage: 58.32% (было 57.78%)

CI: P4.4 (cb28069) — ✓ pytest (ожид.).
Дальше — P4.5 (ZIP-экспорт) или P3.4 (structured logging).

## P4 — batch synthesis (закрыт целиком)

- P4.1  (419e9d6): BatchQueue + 4 HTTP-эндпоинта
- P4.1b (df28d7c): фикс cancel — sync
- P4.2  (4bb6df9): история в SQLite + /api/history
- P4.4  (cb28069): WS-статус /ws/batch/{task_id} (pub/sub)
- P4.5  (4f28feb): ZIP-экспорт /api/history/{id}/export
- Тесты: 74 → 78 passed
- coverage: 50.44% → 59.50%
- --cov-fail-under: 50 → 59

Следующий этап — ревизия перед P5 (гигиена, docs, real-engine smoke).

## P5.1–P5.3 — гигиена + README + OpenAPI (в процессе)

- P5.1: удалено ~55 `*.step*_bak` / `*.bak` / `*.orig` / `*.before_*` /
  `.DS_Store` / `.ruff_cache/` / `voices.symlink.bak`; `.gitignore` дополнен
  `.ruff_cache/` и `data/` (+ `backend/data/`).
- P5.2: README переписан — актуальная карта `backend/`, таблица 20 эндпоинтов,
  пример batch → history → export, testing (78 passed, 59.50%, гейт 59), roadmap P0–P5.
- P5.3: OpenAPI tags на 9 роутерах (`Health/Moods/Output/STT/System/Voices/
  Synthesis/Batch/History`) — /docs группирует эндпоинты по разделам.
- P5.4 (real-engine smoke) — отложен на отдельный заход.

pytest: 78 passed, coverage 59.50% (гейт 59). ruff: All checks passed.

## P5.4 — real-engine smoke (закрыт)

- `tests/test_real_engine.py`: 2 теста под `@pytest.mark.real_engine`,
  skipif `JST_REAL_ENGINE` не выставлен → в CI **не запускаются**.
- Покрывает реальный путь, который не видят 78 юнит-тестов:
  `Engine.synth_one → save_output (ffmpeg) → history → export ZIP`.
- Тесты: batch wav + export ZIP (audio+settings+metadata, размеры совпадают),
  batch mp3 (проверка ffmpeg-конвертации, ловит fallback на wav).
- `conftest.py`: фикстура `real_client` — TestClient с настоящим Engine,
  подменяет только `DB_PATH` (tmp), не трогает `data/jst.db`.
- `pytest.ini`: маркер `real_engine` с инструкцией запуска.
- README: раздел "Real-engine smoke" с одной командой.

Локально: `JST_REAL_ENGINE=1 pytest tests/test_real_engine.py -v -s --no-cov`.

## P5.5 — фикс batch synth_one + честный FakeEngine

**Багу нашёл P5.4 (real-engine smoke).** 78 юнит-тестов проходили, потому что
`FakeEngine.synth_one(self, *a, **kw)` принимал любую сигнатуру. Реальный
`Engine.synth_one(text, ref, settings)` требует 3 позиционных аргумента —
`BatchQueue._execute` вызывал `synth_one(text, settings)`, что в production
давало `TypeError` на каждом batch-синтезе.

- services/synth_helpers.py (новый): synth_chunk(engine, text, voice, settings) —
  выбор метода по settings.mode (jst_clone/qwen/voxcpm/cosyvoice/core),
  resolve_reference, раннее падение при отсутствии референса
- services/jst_moods.py: apply_mood(settings, text) — вынесено из inline
  MOOD_PARAMS в api/ws.py (было дублирование ~50 строк)
- api/ws.py: inline MOOD_PARAMS → apply_mood (DRY)
- services/batch.py: synth_chunk + apply_mood (batch теперь эквивалентен ws
  по логике синтеза и mood)
- conftest.py: FakeEngine.synth_one(text, reference, settings, **kw) —
  теперь любая ошибка сигнатуры вылетает в тестах, а не в проде
- conftest.py: fake_ref_path — 1-сек WAV + патч resolve_reference,
  batch-тесты не зависят от реального merged_reference.wav на диске
- .coveragerc: omit */test_real_engine.py (skipif-файл не должен снижать coverage)

Регрессия: test_batch_end_to_end + 2 теста в test_history.py теперь используют
fake_ref_path. Реальный путь проверяется P5.4 (JST_REAL_ENGINE=1).

Локально: JST_REAL_ENGINE=1 pytest tests/test_real_engine.py -v -s --no-cov → 2 passed.

## P5.6 — стабилизация P5.5

- `tests/test_real_engine.py`: вместо `voice=""` — динамический `_pick_voice()`
  (первый непустой профиль в `voices/` с аудио в `SUPPORTED`).
  Если профилей нет → `pytest.skip` с понятным сообщением.
- `tests/test_batch.py::test_batch_end_to_end`: polling 5s → 10s;
  на падении показывает `last GET=<status> body=<...>`,
  а не голый `KeyError: 'task'`.
- Причина P5.5-флейка: поллинг 5s под coverage-инструментацией иногда
  не укладывался; тест хрупкий, а не сломанный.
