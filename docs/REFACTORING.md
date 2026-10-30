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
