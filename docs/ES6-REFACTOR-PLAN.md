# ES6 Рефакторинг app.js — ПЛАН

## Почему нельзя за один заход

`app.js` = 200KB, 21+ глобальных переменных (`ws`, `isStreaming`, `audioCtx`,
`activeSources`, `nextStartTime`, `totalSamples`, `allChunks`, `LANG`,
`VOICES`, `MODELS`, `PRESETS`, `MOODS`, `SETTINGS`, `THEME` и др.).

Все переплетены, DOM-события навешиваются в `init()`. Полный рефакторинг = сломать 80%.

## Стратегия — 6 фаз

| Фаза | Что | Время | Риск |
|---|---|---|---|
| **1** ✅ | Вынести независимые утилиты (toast, ws-guard, layout-resizer, theme-mode, contrast-inline-strip) | Сделано | Нет |
| **2** | pure-функции (utils, dom-utils, format helpers) | 2-3ч | Низкий |
| **3** | API-слой (все fetch в api.js) | 3-4ч | Средний |
| **4** | audio-engine + synth-client (AudioContext + WS) | 6-8ч | **Высокий** |
| **5** | state-менеджмент (глобалы → export/import) | 4-5ч | **Высокий** |
| **6** | UI-слой (15-20 файлов) | 8+ч | **Высокий** |

**Итого:** ~30-40 часов, нельзя за один сеанс.

## Что создано сейчас (не подключено)

- `frontend/js/utils.js` — formatTime, escapeHtml, sleep, debounce
- `frontend/js/dom-utils.js` — $, $$, getOrCreate, createEl
- `docs/ES6-REFACTOR-PLAN.md` — этот файл

## Что нужно от тебя

Подтверждение на **Фазу 3** (API-слой) — безопасная, риск средний.
Или полный рефакторинг **в отдельный день** (2-3 дня работы).
