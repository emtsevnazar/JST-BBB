/* index.js — единая точка импорта ES6-модулей (barrel)
   ⚠ Используй `import { X } from './js/index.js'` в новых модулях.

   Barrel паттерн. Импортирует ВСЁ, что видно модулям. Не подключай этот файл
   в <script type="module"> — он нужен только для `import`.

   Classic-скрипты (app.js, i18n-data.js, ui-helpers.js) НЕ видят export'ы —
   для них используй bridge.js (window.__jst.*).
*/

// ─── State ───
export { state, resetStreaming, setState, getState, resetState } from './state.js';

// ─── API ───
export { fetchJSON, fetchText, fetchPostJSON, fetchPostForm, API } from './api.js';

// ─── DOM ───
export {
  $, $$, getOrCreate, createEl,
  show, hide, toggleClass, addClass, removeClass, hasClass,
} from './dom.js';

// ─── Format ───
export { formatTime, formatDate, escapeHtml, formatBytes } from './format.js';

// ─── WebSocket ───
export { startWatchdog } from './ws-manager.js';

// ─── PWA ───
export {
  _pwaIsStandalone, _pwaIsIOS, _pwaShowBtn, _pwaHideBtn, _pwaAttach,
} from './pwa.js';

// ─── Help content (data) ───
export { HELP_HTML } from './help-content.js';

// ⚠ i18n-data.js и ui-helpers.js — классические скрипты, не module.
// Их экспорт — через window.__jstI18n / window.__jstHelpers (см. bridge.js)
