/* app-modern.js — запускает ES6 bridge (обратная совместимость) */
(function () {
  'use strict';
  if (window.JST_MODERN_LOADED) return;
  window.JST_MODERN_LOADED = true;

  /* Динамический импорт bridge.js */
  try {
    var s = document.createElement('script');
    s.type = 'module';
    s.src = '/static/es6/bridge.js?v=79';
    document.head.appendChild(s);
  } catch (e) {
    console.warn('[JST] bridge load failed:', e);
  }

  /* Fallback — если браузер не поддерживает modules */
  setTimeout(function () {
    if (!window.JST || !window.JST.bridgeReady) {
      console.warn('[JST] ES6 modules not loaded — fallback to global API');
      window.JST = window.JST || {};
      window.JST.version = '2.0.0-fallback';
      window.JST.bridgeReady = false;
    }
  }, 2000);
})();
