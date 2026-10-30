/* ws-guard.js v57 — watchdog: сбрасывает зависший is-busy через 90 секунд */
(function () {
  'use strict';
  if (window.__jstWsGuardV57) return;
  window.__jstWsGuardV57 = true;

  setInterval(function () {
    try {
      var b = document.getElementById('btn-synth');
      if (!b || !b.classList.contains('is-busy')) return;
      var elapsed = Date.now() - (window.JST_SYNTH_START || 0);
      // 90 секунд — если синтез висит, принудительно сбрасываем
      if (elapsed > 90000) {
        try { b.classList.remove('is-busy'); } catch (e) {}
        try { if (window.ws) { window.ws.close(); window.ws = null; } } catch (e) {}
        window.JST_IS_STREAMING = false;
        if (window._synthTimer) { clearInterval(window._synthTimer); window._synthTimer = null; }
        if (window.__jstToast) {
          window.__jstToast('⚠ Синтез завис >90с — сброшен', 'error');
        }
      }
    } catch (e) {}
  }, 5000);
})();
