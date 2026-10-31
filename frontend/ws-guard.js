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


/* JST_WS_RETRY_NOTICE (Phase 4e)
   If WS fails repeatedly in <30s, show a toast so user knows it's rate limit.
*/
(function () {
  var fails = 0;
  var lastFail = 0;
  var notified = false;
  function onFail() {
    var now = Date.now();
    if (now - lastFail > 30000) { fails = 0; notified = false; }
    lastFail = now;
    fails++;
    if (fails >= 3 && !notified) {
      notified = true;
      if (window.showToast) {
        try { window.showToast("Слишком часто — подождите 60 секунд", "error"); }
        catch (e) {}
      }
      try { console.warn("[JST ws-guard] repeated WS failures — likely rate limit"); } catch (e) {}
    }
  }
  // Hook original WebSocket
  var _Orig = window.WebSocket;
  if (_Orig && !_Orig._jstHooked) {
    window.WebSocket = function (url, protocols) {
      var ws = protocols ? new _Orig(url, protocols) : new _Orig(url);
      var origOnError = null;
      var origOnClose = null;
      Object.defineProperty(ws, "onerror", {
        configurable: true,
        get: function () { return origOnError; },
        set: function (fn) {
          origOnError = fn;
          ws.addEventListener("error", function () { onFail(); });
        },
      });
      Object.defineProperty(ws, "onclose", {
        configurable: true,
        get: function () { return origOnClose; },
        set: function (fn) {
          origOnClose = fn;
          ws.addEventListener("close", function (ev) {
            if (ev.code === 1006 || ev.code === 1008 || ev.code === 1011) onFail();
          });
        },
      });
      return ws;
    };
    window.WebSocket._jstHooked = true;
    console.log("[JST ws-guard] Phase 4e: WebSocket retry-notice installed");
  }
})();
