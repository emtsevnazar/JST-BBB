/* ui-features.js — Phase 12a: 4 small IIFEs extracted from app.js.
   Загружается после ui-api.js, перед bridge.js / app.js.
*/
/* [1/4] Last audio restore (jstp-last-audio) */
(function () {
  "use strict";
  if (window.__jstpLastAudioRestore) return;
  window.__jstpLastAudioRestore = true;
  window.addEventListener("DOMContentLoaded", function () {
    if (window.__jstApi && window.__jstApi.applySynthLangToText) window.__jstApi.applySynthLangToText();
    try {
      var raw = localStorage.getItem("jstp-last-audio");
      if (!raw) return;
      var obj = JSON.parse(raw);
      var url = obj && obj.url, text = obj && obj.text;
      if (!url) return;
      setTimeout(function () {
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
      var p = document.getElementById('jst-player');
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
    var b = document.getElementById('btn-stop');
    if (!b || b.dataset.v76attached === '1') return;
    b.dataset.v76attached = '1';
    b.addEventListener('click', function (ev) {
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
  setInterval(function () {
    try {
      var b = document.getElementById('btn-stop');
      if (!b) return;
      if (window.JST_IS_STREAMING && b.disabled) b.disabled = false;
    } catch (e) {}
  }, 300);
})();

/* [5/6] Help-shutters: прозрачная модалка help + blur, без затемнения.
   Skipped в contrast (data-theme="contrast"). */
(function () {
  var STYLE_ID = "help-shutters-style";
  function injectStyle() {
    if (document.documentElement.getAttribute("data-theme") === "contrast") return;
    var old = document.getElementById(STYLE_ID);
    if (old) old.remove();
    var s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent = [
      "html body .help-modal.open::before,",
      "html body .help-modal.open::after {",
      "  content: none !important;",
      "  display: none !important;",
      "  background: none !important;",
      "  backdrop-filter: none !important;",
      "  -webkit-backdrop-filter: none !important;",
      "  mask-image: none !important;",
      "  -webkit-mask-image: none !important;",
      "}",
      "html body .help-modal.open {",
      "  background: transparent !important;",
      "  backdrop-filter: blur(35px) saturate(1.3) !important;",
      "  -webkit-backdrop-filter: blur(35px) saturate(1.3) !important;",
      "}",
      "html body #help-header-fixed {",
      "  backdrop-filter: blur(20px) saturate(1.2) !important;",
      "  -webkit-backdrop-filter: blur(20px) saturate(1.2) !important;",
      "  background: rgba(255, 255, 255, 0.15) !important;",
      "  border: none !important;",
      "  box-shadow: none !important;",
      "  padding: 10px 28px !important;",
      "  border-radius: 16px !important;",
      "}",
      "html[data-theme='night'] body #help-header-fixed {",
      "  background: rgba(245, 184, 0, 0.06) !important;",
      "}",
      "html body #help-header-fixed .help-title,",
      "html body .help-title {",
      "  background: transparent !important;",
      "  border: none !important;",
      "  box-shadow: none !important;",
      "  backdrop-filter: none !important;",
      "  -webkit-backdrop-filter: none !important;",
      "}"
    ].join("\n");
    document.head.appendChild(s);
  }
  function apply() {
    if (document.documentElement.getAttribute("data-theme") === "contrast") return;
    var modal = document.getElementById("help-modal");
    if (!modal || !modal.classList.contains("open")) return;
    injectStyle();
    modal.style.setProperty("background", "transparent", "important");
    modal.style.setProperty("backdrop-filter", "blur(35px) saturate(1.3)", "important");
    modal.style.setProperty("-webkit-backdrop-filter", "blur(35px) saturate(1.3)", "important");
  }
  function init() {
    var modal = document.getElementById("help-modal");
    if (!modal) return;
    apply();
    new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        if (m.attributeName === "class") {
          setTimeout(apply, 50);
          setTimeout(apply, 200);
        }
      });
    }).observe(modal, { attributes: true, attributeFilter: ["class"] });
    var ht = document.getElementById("help-toggle");
    if (ht) ht.addEventListener("click", function () {
      setTimeout(apply, 80);
      setTimeout(apply, 250);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else setTimeout(init, 80);
})();

/* [6/6] FADE_ZONE: плавное затухание карточек help-sections у краёв viewport. */
(function () {
  var FADE_ZONE = 130, MAX_BLUR = 5, MIN_OP = 0.12;
  function applyEdgeFade() {
    var modal = document.getElementById("help-modal");
    if (!modal || !modal.classList.contains("open")) return;
    var modalRect = modal.getBoundingClientRect();
    var modalTop = modalRect.top, modalH = modalRect.height;
    if (modalH <= 0) return;
    var cards = modal.querySelectorAll(".help-section");
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var r = card.getBoundingClientRect();
      var cy = (r.top + r.bottom) / 2 - modalTop;
      var fTop = Math.min(1, Math.max(0, cy / FADE_ZONE));
      var fBot = Math.min(1, Math.max(0, (modalH - cy) / FADE_ZONE));
      var fade = Math.min(fTop, fBot);
      if (fade < 0.999) {
        var blurPx = (1 - fade) * MAX_BLUR;
        var op = MIN_OP + fade * (1 - MIN_OP);
        card.style.setProperty("opacity", op.toFixed(3), "important");
        card.style.setProperty("filter", "blur(" + blurPx.toFixed(2) + "px)", "important");
      } else {
        card.style.removeProperty("opacity");
        card.style.removeProperty("filter");
      }
    }
  }
  var rafId = null;
  function onScroll() {
    if (rafId) return;
    rafId = requestAnimationFrame(function () { rafId = null; applyEdgeFade(); });
  }
  function init() {
    var modal = document.getElementById("help-modal");
    if (!modal) return;
    modal.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        if (m.attributeName === "class") {
          setTimeout(applyEdgeFade, 100);
          setTimeout(applyEdgeFade, 300);
          setTimeout(applyEdgeFade, 600);
        }
      });
    }).observe(modal, { attributes: true, attributeFilter: ["class"] });
    var ht = document.getElementById("help-toggle");
    if (ht) ht.addEventListener("click", function () {
      setTimeout(applyEdgeFade, 150);
      setTimeout(applyEdgeFade, 400);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else setTimeout(init, 80);
})();
