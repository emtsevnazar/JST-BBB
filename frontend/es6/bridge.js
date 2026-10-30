/* ES6 bridge — современная архитектура с обратной совместимостью */
import * as api from './api.js';
import * as dom from './dom.js';
import * as format from './format.js';
import * as state from './state.js';

/* Экспортируем в window для старого кода */
window.JSTApi = api;
window.JSTDom = dom;
window.JSTFormat = format;
window.JSTState = state;

/* Метаданные */
window.JST = window.JST || {};
window.JST.version = '2.0.0-es6';
window.JST.modules = { api, dom, format, state };
window.JST.bridgeReady = true;

console.log('[JST ES6] Modules ready:', Object.keys(window.JST.modules).join(', '));
