# ES6-рефакторинг — журнал и правила

## Правила
1. **Один шаг = один коммит.** Откат: `git reset --hard <tag>`.
2. **Каждый шаг** проходит `node --check` + `pytest backend/tests/`.
3. **Не удаляем `window.*`** без явной замены — `app.js` использует 125 глобалов.
4. **Не смешиваем** `<script>` и `<script type="module">` для одного кода: модули scoped, их нельзя звать из классического скрипта.
5. **Теги** после успешного шага: `phase{N}-{scope}`.

## Журнал

### Phase 1 (завершено)
- Создан `state.js`, `ws-manager.js` (не подключены). Тесты зелёные, coverage 62%.

### Phase 2 (эта сессия)
- `state.js` — добавлен `resetStreaming` + событие `jst:reset-streaming` (сохранены `setState`/`getState`/`resetState`).
- `ws-manager.js` — импорт теперь резолвится.
- `docs/ARCHITECTURE.md`, `docs/REFACTORING.md`.
- **В HTML не подключено** — нулевой риск.

### Phase 3 (следующая сессия)
- Вынести `ui-theme` (Day/Night/BW) → `ui-theme.js`, тег `phase3-ui-theme`.
- Вынести `ui-help` → `ui-help.js`, тег `phase3-ui-help`.

### Phase 4 (финал)
- Подключить `state.js` через `<script type="module">` параллельно с `app.js`.
- Мигрировать `isStreaming`/`ws` из `app.js` в `state.js` (событие `jst:reset-streaming` уже готово).
- Финальный сценарий: SYNTH→STOP→SYNTH×10, Day↔Night↔BW во время синтеза.

## Дубли в js/ — план
Удалить `dom-utils.js` и `utils.js` (дубли `dom.js`/`format.js`) одним коммитом в Phase 3.

## Почему не «большая переделка за раз»
`app.js` — 3860 строк, 125 `window.*`, `const I18N` на script-scope, IIFE инициализации, `isStreaming` мутируется в десятках мест. Full-rewrite = многодневная работа с высоким риском регрессий. Инкрементальная миграция с тегом после каждого шага — единственный безопасный путь.

---

## Phase 4a — Backend hardening (DONE, tag phase4a-docs-off)
- docs_url/redoc_url/openapi_url → None в production (JST_ENV=production)
- CORS whitelist (уже был, подтверждён)
- engine.synth_one → loop.run_in_executor (уже был)
- whisper.transcribe → run_in_executor (уже был)
- bandit -ll: 0 findings
- pip-audit: 0 CVE

## Phase 4b — Documentation (DONE, tag phase4b-docs)
- docs/API.md — 45+ HTTP + 4 WS эндпоинта
- docs/SECURITY.md — auth, middleware, rate-limit, prod checklist
- docs/ARCHITECTURE.md — обновлён

## Итоговое состояние (на дату phase4b)
- Тесты: 78 passed, coverage 62.12%
- app.js: 164820 → 173675 байт (после pre-commit), PWA вынесен в pwa.js
- ES6-модули: api.js, dom.js, format.js, index.js, pwa.js, state.js, ws-manager.js (7)
- Отключены в prod: /docs, /redoc, /openapi.json
- Удалены: dom-utils.js, utils.js (дубли)

## Что НЕ сделано (честно)
- isStreaming, ws, wsTimeoutTimer — всё ещё в app.js (Phase 4 план)
- ui-theme, ui-help, ui-synth, history, stt — не тронуты
- ~39 глобальных функций в app.js, 124 window.*
- PWA-кнопка в браузере не проверена (только node --check + grep)
- BOLA (owner check) — приемлемо для 127.0.0.1, нужно для prod

## Следующие шаги (приоритет)
1. Проверить в браузере: SYNTH→STOP→SYNTH, PWA-кнопка, Day/Night/BW
2. Если ОК: ui-help (SVG, help-header) — следующий безопасный JS-шаг
3. Если проблемы: git reset --hard phase3b-cleanup (до PWA-миграции)
4. Phase 4c+: isStreaming миграция (требует особой осторожности)

## Точки отката
- checkpoint-before-refactor — до всех правок
- checkpoint-tests-green — 62%, зелёные
- phase2-modules-ready — state.js
- phase3a-pwa-ready — pwa.js создан
- phase3b-cleanup — дубли удалены
- phase3c-pwa-migrated — app.js → pwa.js делегаты
- phase4a-docs-off — /docs отключены в prod
- phase4b-docs — документация

## Phase 5a — help HTML extraction (DONE, tag phase5a-help-extracted)

- frontend/js/help-content.js (298 строк, 18.5KB) — HTML бывшего hb.innerHTML
- app.js: 15.9KB inline -> 374 байта delegate (экономия 18161 байт: 173675 -> 155514)
- index.html: <script type="module" src="/static/js/help-content.js"> перед app.js
- Fallback: если модуль не загрузился — stub с сообщением hard-refresh
- 78 тестов, coverage 61.76%
- jst-force.js + theme-bw.css продолжают применять help-стили (не тронуты)

### Следующая цель (Phase 5b)
- __jstContrast / applyTheme -> ui-theme.js (сейчас в app.js строки 285-295)
- Либо isStreaming миграция — только после браузерной проверки PWA + help
