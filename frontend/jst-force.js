/* jst-force.js — гарантированное применение inline !important
   Inline !important невозможно перебить никаким CSS-правилом.
   Применяется при смене темы и при изменении DOM.
*/
(function () {
  'use strict';
  if (window.__jstForce) return;
  window.__jstForce = true;

  function isBW()    { return document.documentElement.getAttribute('data-theme') === 'contrast'; }
  function isDay()   { return document.documentElement.getAttribute('data-theme') === 'day'; }
  function isNight() { return document.documentElement.getAttribute('data-theme') === 'night'; }

  function I(el, prop, val) {
    if (!el || !el.style) return;
    try { el.style.setProperty(prop, val, 'important'); } catch (e) {}
  }

  /* ─── STOP кнопка ───────────────────────────────────────── */
  function applyStop() {
    var stop = document.getElementById('btn-stop');
    if (!stop) return;

    if (isBW()) {
      if (stop.disabled) {
        I(stop, 'background', '#fff');
        I(stop, 'background-color', '#fff');
        I(stop, 'color', '#000');
        I(stop, '-webkit-text-fill-color', '#000');
        I(stop, 'border', '2px solid #000');
        I(stop, 'border-color', '#000');
        I(stop, 'box-shadow', 'none');
        I(stop, 'opacity', '1');
      } else {
        I(stop, 'background', '#000');
        I(stop, 'background-color', '#000');
        I(stop, 'color', '#fff');
        I(stop, '-webkit-text-fill-color', '#fff');
        I(stop, 'border', '2px solid #000');
        I(stop, 'border-color', '#000');
        I(stop, 'box-shadow', 'none');
      }
      stop.querySelectorAll('*').forEach(function (c) {
        I(c, 'color', stop.disabled ? '#000' : '#fff');
        I(c, '-webkit-text-fill-color', stop.disabled ? '#000' : '#fff');
      });
    } else if (isDay() || isNight()) {
      if (stop.disabled) {
        I(stop, 'background', 'transparent');
        I(stop, 'background-color', 'transparent');
        I(stop, 'color', '#e63946');
        I(stop, '-webkit-text-fill-color', '#e63946');
        I(stop, 'border', '3px solid #e63946');
        I(stop, 'border-color', '#e63946');
        I(stop, 'outline', '1px solid #e63946');
        I(stop, 'outline-offset', '1px');
        I(stop, 'box-shadow', 'none');
      } else {
        I(stop, 'background', '#e63946');
        I(stop, 'background-color', '#e63946');
        I(stop, 'color', '#fff');
        I(stop, '-webkit-text-fill-color', '#fff');
        I(stop, 'border', '3px solid #e63946');
        I(stop, 'border-color', '#e63946');
        I(stop, 'box-shadow', 'none');
      }
      stop.querySelectorAll('*').forEach(function (c) {
        I(c, 'color', stop.disabled ? '#e63946' : '#fff');
        I(c, '-webkit-text-fill-color', stop.disabled ? '#e63946' : '#fff');
      });
    }
  }

  /* ─── accent-grid 135×38 ────────────────────────────────── */
  function applyAccentGrid() {
    document.querySelectorAll('#accent-grid > *, #accent-grid .accent-card, #accent-grid button, #accent-grid [role="button"]').forEach(function (el) {
      I(el, 'width', '135px');
      I(el, 'min-width', '135px');
      I(el, 'max-width', '135px');
      I(el, 'height', '38px');
      I(el, 'min-height', '38px');
      I(el, 'max-height', '38px');
      I(el, 'padding', '4px 8px');
      I(el, 'font-size', '12px');
      I(el, 'box-sizing', 'border-box');
      I(el, 'display', 'inline-flex');
      I(el, 'align-items', 'center');
      I(el, 'justify-content', 'center');
    });
  }

  /* ─── Ч/Б фиксы ─────────────────────────────────────────── */
  function applyBW() {
    if (!isBW()) return;

    /* 1. help-section — без рамки */
    document.querySelectorAll('.help-section').forEach(function (el) {
      I(el, 'border', 'none');
      I(el, 'border-width', '0');
      I(el, 'box-shadow', 'none');
      I(el, 'background', 'transparent');
      I(el, 'background-color', 'transparent');
    });

    /* 2. #help-header-fixed — белый bg */
    var hh = document.getElementById('help-header-fixed');
    if (hh) {
      I(hh, 'background', 'rgb(255, 255, 255)');
      I(hh, 'background-color', 'rgb(255, 255, 255)');
      I(hh, 'color', '#000');
      I(hh, 'border', '2px solid #000');
      I(hh, 'border-color', '#000');
      I(hh, 'border-radius', '22px');
      I(hh, 'box-shadow', 'none');
      I(hh, 'backdrop-filter', 'none');
      I(hh, '-webkit-backdrop-filter', 'none');
      hh.querySelectorAll('*').forEach(function (c) {
        I(c, 'background', 'transparent');
        I(c, 'color', '#000');
        I(c, '-webkit-text-fill-color', '#000');
      });
    }

    /* 3. .help-header — белый bg */
    document.querySelectorAll('.help-header').forEach(function (el) {
      I(el, 'background', '#fff');
      I(el, 'background-color', '#fff');
      I(el, 'color', '#000');
      I(el, 'border', '2px solid #000');
      I(el, 'border-color', '#000');
      I(el, 'box-shadow', 'none');
      el.querySelectorAll('*').forEach(function (c) {
        I(c, 'background', 'transparent');
        I(c, 'color', '#000');
        I(c, '-webkit-text-fill-color', '#000');
      });
    });

    /* 4. .help-table — белый bg */
    document.querySelectorAll('.help-table, .help-table th, .help-table thead, .help-table tbody, .help-table tr, .help-table td').forEach(function (el) {
      I(el, 'background', '#fff');
      I(el, 'background-color', '#fff');
      I(el, 'color', '#000');
      I(el, 'border-color', '#000');
    });
    document.querySelectorAll('.help-table th, .help-table td, .help-table th *, .help-table td *').forEach(function (el) {
      I(el, 'color', '#000');
      I(el, '-webkit-text-fill-color', '#000');
      I(el, 'background', 'transparent');
    });

    /* 5. #carousel — текст чёрный */
    document.querySelectorAll('#carousel > *, #carousel .card, #carousel .model-card, #carousel .lang-card, #carousel .accent-card, #carousel button, #carousel [role="button"], .carousel-btn').forEach(function (el) {
      I(el, 'background', '#fff');
      I(el, 'background-color', '#fff');
      I(el, 'color', '#000');
      I(el, 'border', '2px solid #000');
      I(el, 'box-shadow', 'none');
      el.querySelectorAll('*').forEach(function (c) {
        I(c, 'color', '#000');
        I(c, '-webkit-text-fill-color', '#000');
        I(c, 'fill', '#000');
        I(c, 'stroke', '#000');
      });
    });

    /* 6. .controls active — чёрный */
    document.querySelectorAll('.controls button.active, .controls button[aria-pressed="true"], .controls button.is-busy, .controls .btn.active, .controls .btn[aria-pressed="true"], .controls .btn.is-busy, .controls #btn-synth.is-busy').forEach(function (el) {
      I(el, 'background', '#000');
      I(el, 'background-color', '#000');
      I(el, 'color', '#fff');
      I(el, '-webkit-text-fill-color', '#fff');
      I(el, 'border', '2px solid #000');
      I(el, 'box-shadow', 'none');
      el.querySelectorAll('*').forEach(function (c) {
        I(c, 'color', '#fff');
        I(c, '-webkit-text-fill-color', '#fff');
        I(c, 'fill', '#fff');
        I(c, 'stroke', '#fff');
      });
    });

    /* 7. #carousel disabled — пунктир */
    document.querySelectorAll('#carousel > *[disabled], #carousel > *.disabled, #carousel > *.unavailable, #carousel button[disabled], #carousel .card.unavailable, #carousel .card.disabled, #carousel .lang-card.unavailable, #carousel .model-card.unavailable, #carousel .accent-card.unavailable, .carousel-btn[disabled]').forEach(function (el) {
      I(el, 'background', '#fff');
      I(el, 'color', '#000');
      I(el, 'border', '2px dashed #000');
      I(el, 'border-color', '#000');
      I(el, 'box-shadow', 'none');
      I(el, 'opacity', '1');
    });

    /* Убить жёлтый glow .jst-dot */
    document.querySelectorAll('.jst-dot, .jst-dot::before, .jst-dot::after').forEach(function (el) {
      I(el, 'box-shadow', 'none');
      I(el, 'border-color', '#000');
      I(el, 'background', '#000');
    });
  }

  /* ─── APPLY ─────────────────────────────────────────────── */
  function apply() {
    applyStop();
    applyAccentGrid();
    applyBW();
  }

  /* ─── INIT ──────────────────────────────────────────────── */
  var timer = null;
  function schedule() {
    if (timer) return;
    timer = setTimeout(function () { timer = null; apply(); }, 30);
  }

  function start() {
    apply();

    /* Theme change */
    new MutationObserver(apply).observe(document.documentElement, {
      attributes: true, attributeFilter: ['data-theme']
    });

    /* DOM changes (dynamic elements) */
    try {
      new MutationObserver(schedule).observe(document.body || document.documentElement, {
        childList: true, subtree: true
      });
    } catch (e) {}

    /* Periodic re-apply (для disabled/enabled изменений) */
    setInterval(apply, 1000);

    /* Hover на .controls — inline 3px border */
    document.addEventListener('mouseover', function (e) {
      if (!isBW()) return;
      var btn = e.target.closest('.controls > button, .controls > .btn');
      if (!btn || btn.disabled || btn.classList.contains('is-busy')) return;
      I(btn, 'border', '3px solid #000');
      I(btn, 'box-shadow', 'none');
    }, true);
    document.addEventListener('mouseout', function (e) {
      if (!isBW()) return;
      var btn = e.target.closest('.controls > button, .controls > .btn');
      if (!btn) return;
      var isActive = btn.classList.contains('active') || btn.classList.contains('is-busy') || btn.getAttribute('aria-pressed') === 'true';
      if (isActive) {
        I(btn, 'border', '2px solid #000');
      } else {
        I(btn, 'border', '2px solid #000');
      }
    }, true);

    console.log('[JST force] initialized');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
