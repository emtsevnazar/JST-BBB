/* ui-features/player-controls.js — IIFE #1-4 (split из ui-features.js v1.1.31)
   last audio restore, show player, btn-stop v76, btn-stop watchdog */

/* ui-features.js — Phase 12a: 4 small IIFEs extracted from app.js.
   Загружается после ui-api.js, перед bridge.js / app.js.
*/
/* [1/4] Last audio restore (jstp-last-audio) */
(function () {
  "use strict";
  if (window.__jstpLastAudioRestore) return;
  window.__jstpLastAudioRestore = true;
  window.addEventListener("DOMContentLoaded", () => {
    if (window.__jstApi && window.__jstApi.applySynthLangToText) window.__jstApi.applySynthLangToText();
    try {
      const raw = localStorage.getItem("jstp-last-audio");
      if (!raw) return;
      const obj = JSON.parse(raw);
      const url = obj && obj.url, text = obj && obj.text;
      if (!url) return;
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("jst:load-audio", {
          detail: { url: url, text: text || "" }
        }));
      }, 500);
    } catch (e) { /* ignore */ }
  });
})();

/* [2/4] Show player initially */
(function showPlayerInitially() {
  function go() {
    try {
      let p = document.getElementById('jst-player');
      if (!p) p = document.querySelector('.jst-player');
      if (p) {
        p.style.display = '';
        p.style.visibility = '';
        p.style.opacity = '';
        p.classList.add('visible');
        p.setAttribute('data-has-audio', 'true');
      }
    } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);
  else go();
  setTimeout(go, 500);
  setTimeout(go, 1500);
})();

/* [3/4] v76 btn-stop handler */
(function () {
  if (window.__jstV76StopHandler) return;
  window.__jstV76StopHandler = true;
  function attach() {
    const b = document.getElementById('btn-stop');
    if (!b || b.dataset.v76attached === '1') return;
    b.dataset.v76attached = '1';
    b.addEventListener('click', (ev) => {
      if (window.__jstSynth && window.__jstSynth.stopPlayback) {
        ev.preventDefault();
        ev.stopPropagation();
        try {
          window.__jstSynth.stopPlayback();
        } catch (e) {
          console.error('[v76] stopPlayback failed:', e);
          if (window.__jstForceResetSynth) window.__jstForceResetSynth('stopPlayback error');
        }
      }
    }, false);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attach);
  else attach();
  setTimeout(attach, 500);
  setTimeout(attach, 2000);
})();

/* [4/4] btn-stop watchdog — при streaming держать кнопку enabled */
(function () {
  setInterval(() => {
    try {
      const b = document.getElementById('btn-stop');
      if (!b) return;
      if (window.JST_IS_STREAMING && b.disabled) b.disabled = false;
    } catch (e) {}
  }, 300);
})();
