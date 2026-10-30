/* v77-fix.js — гарантированный фикс STOP + kill yellow + window.ws
   Уникальное имя = не закэширован в SW
*/
(function () {
  'use strict';
  if (window.__jstV77) return;
  window.__jstV77 = true;

  function log(msg) { try { console.log('[v77]', msg); } catch(e) {} }

  /* ─── 1. Привязать STOP handler ──────────────────────────── */
  function attachStop() {
    var b = document.getElementById('btn-stop');
    if (!b) return false;
    if (b.dataset.v77attached === '1') return true;
    b.dataset.v77attached = '1';
    b.addEventListener('click', function(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      log('STOP clicked');
      /* Закрыть WS */
      try {
        if (window.ws) {
          try { window.ws.onclose = null; window.ws.onmessage = null; } catch(e) {}
          try { window.ws.close(); } catch(e) {}
          window.ws = null;
        }
      } catch(e) { console.warn('[v77] ws close error:', e); }
      /* Сброс состояния */
      try {
        window.JST_IS_STREAMING = false;
        window.JST_SYNTH_START = 0;
        if (window._synthTimer) { clearInterval(window._synthTimer); window._synthTimer = null; }
      } catch(e) {}
      /* UI */
      var btnS = document.getElementById('btn-synth');
      if (btnS) { btnS.disabled = false; btnS.classList.remove('is-busy'); }
      var btnT = document.getElementById('btn-stop');
      if (btnT) { btnT.disabled = true; }
      /* Status */
      var stt = document.getElementById('status-text');
      if (stt) stt.textContent = 'Остановлено';
      /* Fallback: если есть stopPlayback — вызвать */
      try {
        if (typeof window.stopPlayback === 'function') window.stopPlayback();
      } catch(e) { console.warn('[v77] stopPlayback error:', e); }
    }, false);
    log('stop handler attached');
    return true;
  }

  /* ─── 2. Перехват WebSocket чтобы сохранять window.ws ──── */
  function wrapWS() {
    if (window.__jstWS77Wrapped) return;
    window.__jstWS77Wrapped = true;
    var _W = window.WebSocket;
    if (!_W) return;
    window.WebSocket = function(url, protocols) {
      var sock = protocols ? new _W(url, protocols) : new _W(url);
      window.ws = sock;
      log('WS created → window.ws');
      return sock;
    };
    window.WebSocket.CONNECTING = _W.CONNECTING;
    window.WebSocket.OPEN = _W.OPEN;
    window.WebSocket.CLOSING = _W.CLOSING;
    window.WebSocket.CLOSED = _W.CLOSED;
    window.WebSocket.prototype = _W.prototype;
  }

  /* ─── 3. Разблокировка STOP если синтез идёт, но disabled ── */
  function unlockStop() {
    setInterval(function() {
      var b = document.getElementById('btn-stop');
      if (b && window.JST_IS_STREAMING && b.disabled) {
        b.disabled = false;
        log('auto-unlocked STOP');
      }
    }, 500);
  }

  /* ─── 4. INIT ─────────────────────────────────────────── */
  function init() {
    wrapWS();
    if (!attachStop()) {
      setTimeout(attachStop, 100);
      setTimeout(attachStop, 500);
      setTimeout(attachStop, 1500);
      setTimeout(attachStop, 3000);
    }
    unlockStop();
    log('initialized');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  setTimeout(init, 2000);
})();
