# JST Studio — Архитектура

## Общая картина


## Backend

- **`backend/app.py`** — сборка: middleware (CORS, SecurityHeaders, RequestSizeLimit, TrustedHost, auth), 9 роутеров, lifespan (Engine + BatchQueue + HistoryDB).
- **`backend/core/security.py`** — `_is_public()`, `_api_key()`, `require_api_key`, `api_key_middleware`. Все непубличные эндпоинты требуют `X-API-Key = JST_API_KEY`. В dev (`JST_API_KEY` пуст) — всё открыто.
- **`backend/engine.py`** — ML-движок (исключён из coverage CI, тесты — `tests/test_real_engine.py` при `JST_REAL_ENGINE=1`).
- **`backend/services/batch.py`** — FIFO-очередь, 1 worker, `asyncio.to_thread`.
- **`backend/services/history.py`** — SQLite, соединение на операцию.

## Frontend — текущее состояние

`frontend/app.js` — **3860 строк, классический `<script>`** (не модуль). Содержит:
- `const I18N` — словари RU/EN
- ~40 глобальных функций: `synthesize()`, `finishStreaming()`, `bindUI()`, `initSTT()`, …
- 125 обращений к `window.*`
- IIFE в конце (init, watchdog)
- модульная `let isStreaming` (стр. 250) и `let ws` (стр. 266)

**Корневой баг v86**: `__jstForceResetSynth` сбрасывал `window.JST_IS_STREAMING`, но не модульную `isStreaming` → «мёртвая» кнопка SYNTH. Исправлено через `window.__jstResetStreaming` (v86).

## ES6-модули (готовы, не подключены)

| Модуль | Назначение | Статус |
|---|---|---|
| `js/state.js` | Единое состояние + `resetStreaming` | ✅ Phase 2 |
| `js/ws-manager.js` | WebSocket watchdog (700 ms) | ✅ импорт резолвится |
| `js/api.js` | fetch-обёртки | ✅ |
| `js/dom.js` | DOM-хелперы ($, $$, createEl) | ✅ |
| `js/dom-utils.js` | дубль `dom.js` | ⚠ к удалению |
| `js/format.js` | formatTime, escapeHtml | ✅ |
| `js/utils.js` | дубль `format.js` + sleep/debounce | ⚠ к удалению |
| `js/index.js` | barrel-экспорт | ✅ |

## Roadmap

- **Phase 3**: вынести `ui-theme` (Day/Night/BW) и `ui-help` из `app.js`
- **Phase 4**: подключить модули через `<script type="module">`, мигрировать `isStreaming`/`ws` в `state.js`

## Тестирование

- `pytest backend/tests/ -q --cov=backend` → 62% (порог 59%)
- `node --check frontend/js/*.js` — синтаксис
- Ручной сценарий: SYNTH → STOP → SYNTH ×10, Day↔Night↔BW во время синтеза

## Точки отката

- `checkpoint-before-refactor` — до всех правок
- `checkpoint-tests-green` — 62%, все тесты зелёные
- `phase2-modules-ready` — после Phase 2 (эта сессия)
- `.backup-YYYYMMDD-HHMMSS/` — файловые бэкапы
