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

## Phase 5d — barrel aggregators (DONE, tag phase5d-barrel)

**Проблема**: два типа скриптов (module vs classic) не видят друг друга.
**Решение**: два barrel-файла.

- **index.js** — barrel для `import { X } from './js/index.js'` (ES6 modules)
- **bridge.js** — barrel для `window.__jst.*` (classic scripts)
  - `window.__jst.t(key, lang)` — шорткат для переводов
  - `window.__jst.helpers.*` — fmt, _translateStatus
  - `window.__jst.helpContent` — HELP_HTML
  - `window.__jst.pwa.*` — PWA-функции (после async-загрузки)
  - `window.__jst.ready()` — диагностика `{ok, missing}`

**Порядок script в index.html** (проверено):
1. `<script type="module" src="/static/js/pwa.js">` (async)
2. `<script type="module" src="/static/js/help-content.js">` (async)
3. `<script src="/static/js/i18n-data.js">` (sync)
4. `<script src="/static/js/ui-helpers.js">` (sync)
5. `<script src="/static/js/bridge.js">` (sync, читает 1-4)
6. `<script src="/static/app.js">` (sync, читает bridge)

**Проверено в Node**:
- `__jst.t('batch_title','ru')` → "Пакетный синтез" ✓
- `__jst.helpers.fmt(90)` → "1:30.0" ✓
- `ready()` показывает "pending" для async-модулей (это правильно)

**app.js не тронут** — делегаты `window.__jstI18n`/`__jstHelpers`/`__jstPwa`/`__jstHelpContent` работают как раньше.


---

## Phase 11 — API extraction (DONE, tag phase11-api / phase11-final)

### Итоговая статистика
- `app.js`: 173 675 → **119 336 b** (−31.3%)
- ES6-модулей: **16** (`state`, `api`, `dom`, `format`, `index`, `pwa`, `help-content`, `i18n-data`, `ui-helpers`, `ui-synth`, `ui-render`, `ui-buttons`, `ui-api`, `ws-manager`, `bridge`, `index`)
- Функций вынесено: **~30** через `window.__jstSynth`, `__jstRender`, `__jstHelpers`, `__jstApi`, `__jstUI`, `__jstPwa`, `__jstI18n`, `__jstHelpContent`
- Тестов: **78 passed**, coverage 61.83%
- Тегов: **40** (checkpoint-before-refactor → phase11-final)

### Что вынесено (полный список)
- **i18n-data.js**: I18N словари, JST_TOAST_I18N
- **ui-helpers.js**: t, ti, fmt, _translateStatus, showToast, setStatus, __jstContrast
- **ui-synth.js**: synthesize, stopPlayback, finishStreaming, resetPlayback, handleAudioChunk, updateProgress, initSTT, initRecordButton, drawWaveform
- **ui-render.js**: rebuildPresetsSelect, rebuildCarousel, applyCard, rebuildAccents, renderMoods, updateModelInfo, applyLanguage, renderLanguages, rebuildModelCarousel
- **ui-buttons.js**: bindUI
- **ui-api.js**: getSettings, applyPreset, normalizeSynthPrefs, saveSynthPrefs, applySynthLangToText
- **pwa.js**: _pwaIsStandalone, _pwaIsIOS, _pwaShowBtn, _pwaHideBtn, _pwaAttach

### Что осталось в app.js (осознанно)
- **27 делегатов** (~3.5 KB) — тонкие обёртки для обратной совместимости
- **18 IIFEs** (~110 KB) — feature code: PWA SW registration, batch UI, wand, dots, splitter, layout-resizer, controls-scroll, dropdown-stable, model-grid-fix, batch-table-adaptive, hidePitchRow, showPlayerInitially, help-table labels, theme observer, и т.д.
- **1 `init`** (7 строк) + `window.addEventListener("load", init)`

### Что НЕ вынесено (и почему)
- **IIFEs** — это feature code, не core-логика. Каждый IIFE запускается при загрузке страницы, зависит от порядка загрузки. Их вынос — **отдельный рефакторинг** (feature-модуляризация), требует отдельной браузерной проверки каждого плагина.

### Известные баги исправлены в этой сессии
- `__JST_FORCE_AUTO` в `theme-mode.js` (сбрасывал тему в auto при каждом reload) — удалён в `phase11-theme-fix`
- `handleAudioChunk` + `updateProgress` отсутствовали (удалены в коммите 92fa064) — восстановлены в `phase9b-restore-chunk`
- `_translateStatus` `ReferenceError: I18N` — фикс в `phase9c-fixes`
- `/api/mode` не в IGNORE error-guard — фикс в `phase9c-fixes`

### Следующая цель (Phase 12+, опционально)
- IIFEs → отдельные feature-модули в `ui-features/` (batch.js, wand.js, dots.js, splitter.js, ...)
- Удаление 27 делегатов из `app.js` (прямые вызовы `window.__jst*` в HTML/event handlers)
- **Требует браузерной проверки после каждого шага** — feature code ломается молча
