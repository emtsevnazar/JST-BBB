/* jst-force.js v82 — inline !important с ОЧИСТКОЙ при смене темы
   Ключевые изменения vs v81:
   - WeakMap отслеживает поставленные inline properties
   - При смене темы СНАЧАЛА очистка, потом применение (только для BW)
   - CSS-переменные inline на documentElement → проникают в ::before/::after
   - Агрессивный white text: color + fill + stroke + -webkit-text-fill-color на ВСЕХ потомках
*/
(function () {
  'use strict';
  if (window.__jstForce82) return;
  window.__jstForce82 = true;

  /* WeakMap: element -> Set of property names that we set inline */
  var forced = new WeakMap();
  /* Root CSS variables we set inline */
  var rootVars = new Set();

  function isBW()    { return document.documentElement.getAttribute('data-theme') === 'contrast'; }
  function isDay()   { return document.documentElement.getAttribute('data-theme') === 'day'; }
  function isNight() { return document.documentElement.getAttribute('data-theme') === 'night'; }
  function isOther() { return !isBW(); }

  /* Set inline !important and remember */
  function I(el, prop, val) {
    if (!el || !el.style) return;
    try {
      el.style.setProperty(prop, val, 'important');
      var set = forced.get(el);
      if (!set) { set = new Set(); forced.set(el, set); }
      set.add(prop);
    } catch (e) {}
  }

  /* Set CSS variable on documentElement and remember */
  function V(name, val) {
    try {
      document.documentElement.style.setProperty(name, val, 'important');
      rootVars.add(name);
    } catch (e) {}
  }

  /* Clean ALL inline props we set on an element */
  function clean(el) {
    var set = forced.get(el);
    if (!set) return;
    set.forEach(function (p) {
      try { el.style.removeProperty(p); } catch (e) {}
    });
    forced.delete(el);
    /* If element has no inline styles left — remove style attribute */
    if (el.getAttribute && el.getAttribute('style') === '') {
      el.removeAttribute('style');
    }
  }

  /* Clean ALL elements we touched */
  function cleanAll() {
    /* Can't iterate WeakMap, so we track via data attribute marker */
    var marked = document.querySelectorAll('[data-jst-f82="1"]');
    marked.forEach(function (el) {
      clean(el);
      el.removeAttribute('data-jst-f82');
    });
    /* Clean root vars */
    rootVars.forEach(function (name) {
      try { document.documentElement.style.removeProperty(name); } catch (e) {}
    });
    rootVars.clear();
  }

  /* Mark element as touched */
  function mark(el) {
    if (el && el.setAttribute) el.setAttribute('data-jst-f82', '1');
  }

  /* Set all descendants to color */
  function setChildrenColor(el, color, important) {
    if (!el || !el.querySelectorAll) return;
    var all = el.querySelectorAll('*');
    for (var i = 0; i < all.length; i++) {
      var c = all[i];
      I(c, 'color', color);
      I(c, '-webkit-text-fill-color', color);
      I(c, 'fill', color);
      I(c, 'stroke', color);
      mark(c);
    }
  }

  /* ═══════════════════════════════════════════════════════════
     BW-ONLY STYLES (применяются только когда isBW())
     ═══════════════════════════════════════════════════════════ */
  function applyBW() {
    if (!isBW()) return;

    /* ─── Root CSS vars — проникают в ::before/::after ─── */
    V('--jst-dot-color', '#000');
    V('--gold', '#000');
    V('--gold-light', '#000');
    V('--gold-dark', '#000');
    V('--gold-rgb', '0,0,0');
    V('--navy', '#000');
    V('--navy-light', '#000');
    V('--yellow', '#000');
    V('--yellow-light', '#000');
    V('--red', '#000');
    V('--red-light', '#000');
    V('--error', '#000');
    V('--danger', '#000');
    V('--warning', '#000');
    V('--success', '#000');
    V('--accent', '#000');
    V('--panel-border', '#000');
    V('--border', '#000');
    V('--border-color', '#000');
    V('--divider', '#000');
    V('--input-border', '#000');

    /* ─── 1. help-section — без чёрной рамки ─── */
    document.querySelectorAll('.help-section').forEach(function (el) {
      I(el, 'border', 'none');
      I(el, 'border-width', '0');
      I(el, 'box-shadow', 'none');
      I(el, 'background', 'transparent');
      I(el, 'background-color', 'transparent');
      mark(el);
    });

    /* ─── 2. help-header-fixed — белый bg ─── */
    var hh = document.getElementById('help-header-fixed');
    if (hh) {
      I(hh, 'background', 'rgb(255, 255, 255)');
      I(hh, 'background-color', 'rgb(255, 255, 255)');
      I(hh, 'background-image', 'none');
      I(hh, 'color', '#000');
      I(hh, '-webkit-text-fill-color', '#000');
      I(hh, 'border', '2px solid #000');
      I(hh, 'border-color', '#000');
      I(hh, 'border-radius', '22px');
      I(hh, 'box-shadow', 'none');
      I(hh, 'backdrop-filter', 'none');
      I(hh, '-webkit-backdrop-filter', 'none');
      setChildrenColor(hh, '#000');
      mark(hh);
    }

    /* ─── 3. help-header — белый bg ─── */
    document.querySelectorAll('.help-header, summary.help-header, details.help-header').forEach(function (el) {
      I(el, 'background', '#fff');
      I(el, 'background-color', '#fff');
      I(el, 'background-image', 'none');
      I(el, 'color', '#000');
      I(el, '-webkit-text-fill-color', '#000');
      I(el, 'border', '2px solid #000');
      I(el, 'border-color', '#000');
      I(el, 'box-shadow', 'none');
      setChildrenColor(el, '#000');
      mark(el);
    });

    /* ─── 4. help-table — белый bg для всех ячеек ─── */
    document.querySelectorAll('.help-table, .help-table th, .help-table thead, .help-table tbody, .help-table tr, .help-table td').forEach(function (el) {
      I(el, 'background', '#fff');
      I(el, 'background-color', '#fff');
      I(el, 'color', '#000');
      I(el, '-webkit-text-fill-color', '#000');
      I(el, 'border-color', '#000');
      mark(el);
    });
    document.querySelectorAll('.help-table th *, .help-table td *').forEach(function (el) {
      I(el, 'color', '#000');
      I(el, '-webkit-text-fill-color', '#000');
      I(el, 'background', 'transparent');
      mark(el);
    });

    /* ─── 5. carousel — чёрный текст на белом ─── */
    document.querySelectorAll('#carousel > *, #carousel .card, #carousel .model-card, #carousel .lang-card, #carousel .accent-card, #carousel button, #carousel [role="button"], .carousel-btn').forEach(function (el) {
      I(el, 'background', '#fff');
      I(el, 'background-color', '#fff');
      I(el, 'background-image', 'none');
      I(el, 'color', '#000');
      I(el, '-webkit-text-fill-color', '#000');
      I(el, 'border', '2px solid #000');
      I(el, 'border-color', '#000');
      I(el, 'box-shadow', 'none');
      setChildrenColor(el, '#000');
      mark(el);
    });

    /* ─── 6. controls active — ЧЁРНЫЙ bg / БЕЛЫЙ текст ─── */
    document.querySelectorAll(
      '.controls button.active, .controls button[aria-pressed="true"], .controls button.is-busy, ' +
      '.controls .btn.active, .controls .btn[aria-pressed="true"], .controls .btn.is-busy, ' +
      '.controls #btn-synth.is-busy, .controls #btn-random.active, .controls #btn-clear-history.active, ' +
      '.controls #btn-batch.active'
    ).forEach(function (el) {
      I(el, 'background', '#000');
      I(el, 'background-color', '#000');
      I(el, 'background-image', 'none');
      I(el, 'color', '#fff');
      I(el, '-webkit-text-fill-color', '#fff');
      I(el, 'border', '2px solid #000');
      I(el, 'border-color', '#000');
      I(el, 'box-shadow', 'none');
      /* AGGRESSIVE white text on ALL descendants */
      setChildrenColor(el, '#fff');
      mark(el);
    });

    /* ─── 7. carousel disabled — пунктир ─── */
    document.querySelectorAll(
      '#carousel > *[disabled], #carousel > *.disabled, #carousel > *.unavailable, ' +
      '#carousel > *[aria-disabled="true"], #carousel button[disabled], #carousel button.disabled, ' +
      '#carousel .card[disabled], #carousel .card.unavailable, #carousel .card.disabled, ' +
      '#carousel .lang-card.unavailable, #carousel .model-card.unavailable, ' +
      '#carousel .accent-card.unavailable, .carousel-btn[disabled], .carousel-btn.disabled'
    ).forEach(function (el) {
      I(el, 'background', '#fff');
      I(el, 'background-color', '#fff');
      I(el, 'color', '#000');
      I(el, '-webkit-text-fill-color', '#000');
      I(el, 'border', '2px dashed #000');
      I(el, 'border-style', 'dashed');
      I(el, 'border-color', '#000');
      I(el, 'box-shadow', 'none');
      I(el, 'opacity', '1');
      mark(el);
    });

    /* ─── 8. STOP в BW: disabled white/black, enabled black/white ─── */
    var stop = document.getElementById('btn-stop');
    if (stop) {
      if (stop.disabled) {
        I(stop, 'background', '#fff');
        I(stop, 'background-color', '#fff');
        I(stop, 'color', '#000');
        I(stop, '-webkit-text-fill-color', '#000');
        I(stop, 'border', '2px solid #000');
        I(stop, 'border-color', '#000');
        I(stop, 'box-shadow', 'none');
        I(stop, 'opacity', '1');
        setChildrenColor(stop, '#000');
      } else {
        I(stop, 'background', '#000');
        I(stop, 'background-color', '#000');
        I(stop, 'color', '#fff');
        I(stop, '-webkit-text-fill-color', '#fff');
        I(stop, 'border', '2px solid #000');
        I(stop, 'border-color', '#000');
        I(stop, 'box-shadow', 'none');
        setChildrenColor(stop, '#fff');
      }
      mark(stop);
    }

    /* ─── 9. Глобально: убрать жёлтый с .jst-dot ─── */
    document.querySelectorAll('.jst-dot').forEach(function (el) {
      I(el, 'border-color', '#000');
      I(el, 'background', '#000');
      I(el, 'background-color', '#000');
      I(el, 'box-shadow', 'none');
      mark(el);
    });

    /* ─── 10. SVG везде в BW — currentColor ─── */
    document.querySelectorAll('svg [fill]:not([fill="none"]):not([fill^="url"])').forEach(function (el) {
      I(el, 'fill', 'currentColor');
      mark(el);
    });
    document.querySelectorAll('svg [stroke]:not([stroke="none"]):not([stroke^="url"])').forEach(function (el) {
      I(el, 'stroke', 'currentColor');
      mark(el);
    });

    /* ─── 11. accent-grid — 135×38 ─── */
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
      mark(el);
    });
  
    applyKillGradient();
    applyPanelButtons();
}


  /* ─── v83: kill gradient у btn-primary / btn-synth ─── */
  function applyKillGradient() {
    if (!isBW()) return;
    var btns = document.querySelectorAll('button.btn.btn-primary, .btn.btn-primary, #btn-synth');
    for (var i = 0; i < btns.length; i++) {
      var el = btns[i];
      var isActive = el.classList.contains('is-busy') || el.classList.contains('active') || el.getAttribute('aria-pressed') === 'true';
      if (isActive) {
        I(el, 'background', '#000');
        I(el, 'background-color', '#000');
        I(el, 'background-image', 'none');
        I(el, 'color', '#fff');
        I(el, '-webkit-text-fill-color', '#fff');
        I(el, 'border', '2px solid #000');
        I(el, 'box-shadow', 'none');
        setChildrenColor(el, '#fff');
      } else {
        I(el, 'background', '#fff');
        I(el, 'background-color', '#fff');
        I(el, 'background-image', 'none');
        I(el, 'color', '#000');
        I(el, '-webkit-text-fill-color', '#000');
        I(el, 'border', '2px solid #000');
        I(el, 'box-shadow', 'none');
        setChildrenColor(el, '#000');
      }
      mark(el);
    }
  }

  /* ─── v83: .panel кнопки при active — чёрный/белый + все дети белые ─── */
  function applyPanelButtons() {
    if (!isBW()) return;
    document.querySelectorAll('.panel button, .panel .btn, .panel [role="button"]').forEach(function (el) {
      var isActive = el.classList.contains('active')
                  || el.classList.contains('selected')
                  || el.classList.contains('pressed')
                  || el.classList.contains('is-busy')
                  || el.getAttribute('aria-pressed') === 'true'
                  || el.getAttribute('aria-selected') === 'true';
      if (isActive) {
        I(el, 'background', '#000');
        I(el, 'background-color', '#000');
        I(el, 'background-image', 'none');
        I(el, 'color', '#fff');
        I(el, '-webkit-text-fill-color', '#fff');
        I(el, 'border', '2px solid #000');
        I(el, 'border-color', '#000');
        I(el, 'box-shadow', 'none');
        setChildrenColor(el, '#fff');
      } else if (!el.disabled) {
        I(el, 'background', '#fff');
        I(el, 'background-color', '#fff');
        I(el, 'background-image', 'none');
        I(el, 'color', '#000');
        I(el, '-webkit-text-fill-color', '#000');
        I(el, 'border', '2px solid #000');
        I(el, 'border-color', '#000');
        setChildrenColor(el, '#000');
      }
      mark(el);
    });
  }

  /* ═══════════════════════════════════════════════════════════
     DAY / NIGHT STYLES (без inline — только для STOP и accent-grid)
     Всё остальное делает CSS в theme-day/night.css
     ═══════════════════════════════════════════════════════════ */

  /* ─── v84: state machine синтеза (disabled/enabled) ──── */
  function applySynthState() {
    var synth = document.getElementById('btn-synth');
    var stop = document.getElementById('btn-stop');
    if (!synth || !stop) return;

    var isStreaming = window.JST_IS_STREAMING === true
                   || synth.classList.contains('is-busy')
                   || synth.classList.contains('active');

    if (isStreaming) {
      /* SYNTH заблокирована, STOP активна */
      if (!synth.disabled) { synth.disabled = true; mark(synth); }
      if (stop.disabled) { stop.disabled = false; mark(stop); }
    } else {
      /* SYNTH активна, STOP заблокирована */
      if (synth.disabled) { synth.disabled = false; mark(synth); }
      if (!stop.disabled) { stop.disabled = true; mark(stop); }
    }
  }

  /* ─── v84: model-card / lang-card / accent-card / card active ──── */
  function applyCardActive() {
    if (!isBW()) return;

    var selector = '.panel .model-card.active, .panel .lang-card.active, .panel .accent-card.active, .panel .card.active, '
                 + '.controls .model-card.active, .controls .lang-card.active, .controls .accent-card.active, .controls .card.active, '
                 + '.model-card.active, .lang-card.active, .accent-card.active, .card.active';

    document.querySelectorAll(selector).forEach(function (el) {
      I(el, 'background', '#000');
      I(el, 'background-color', '#000');
      I(el, 'background-image', 'none');
      I(el, 'color', '#fff');
      I(el, '-webkit-text-fill-color', '#fff');
      I(el, 'border', '2px solid #000');
      I(el, 'border-color', '#000');
      I(el, 'box-shadow', 'none');
      setChildrenColor(el, '#fff');
      mark(el);
    });

    /* Неактивные карточки — белый/чёрный */
    var inactiveSel = '.panel .model-card:not(.active), .panel .lang-card:not(.active), .panel .accent-card:not(.active), '
                    + '.panel .card:not(.active), .model-card:not(.active):not(.unavailable):not(.disabled), '
                    + '.lang-card:not(.active):not(.unavailable):not(.disabled), '
                    + '.accent-card:not(.active):not(.unavailable):not(.disabled)';
    document.querySelectorAll(inactiveSel).forEach(function (el) {
      I(el, 'background', '#fff');
      I(el, 'background-color', '#fff');
      I(el, 'background-image', 'none');
      I(el, 'color', '#000');
      I(el, '-webkit-text-fill-color', '#000');
      I(el, 'border', '2px solid #000');
      I(el, 'border-color', '#000');
      setChildrenColor(el, '#000');
      mark(el);
    });
  }

  function applyDayNight() {
    if (!isDay() && !isNight()) return;

    /* STOP — inline, чтобы точно перебить style-v4 */
    var stop = document.getElementById('btn-stop');
    if (stop) {
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
        I(stop, 'opacity', '1');
        setChildrenColor(stop, '#e63946');
      } else {
        I(stop, 'background', '#e63946');
        I(stop, 'background-color', '#e63946');
        I(stop, 'color', '#fff');
        I(stop, '-webkit-text-fill-color', '#fff');
        I(stop, 'border', '3px solid #e63946');
        I(stop, 'border-color', '#e63946');
        I(stop, 'outline', 'none');
        I(stop, 'box-shadow', 'none');
        setChildrenColor(stop, '#fff');
      }
      mark(stop);
    }

    /* accent-grid 135×38 */
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
      mark(el);
    });
  }

  /* ═══════════════════════════════════════════════════════════
     MAIN: при смене темы — СНАЧАЛА cleanAll, потом apply
     ═══════════════════════════════════════════════════════════ */
  function applyAll() {
    /* ШАГ 1: очистить ВСЁ что мы ставили */
    cleanAll();

    /* ШАГ 2: applySynthState — ВСЕГДА (независимо от темы) */
    applySynthState();

    /* ШАГ 3: применить заново для текущей темы */
    if (isBW()) {
      applyBW();
      applyCardActive();
    } else if (isDay() || isNight()) {
      applyDayNight();
    }
    /* auto/time — не трогаем, работает CSS */
  }

  /* ─── INIT ─── */
  var timer = null;
  function schedule() {
    if (timer) return;
    timer = setTimeout(function () { timer = null; applyAll(); }, 50);
  }

  function start() {
    applyAll();

    /* При смене темы — schedule (не apply сразу, чтобы не было рекурсии) */
    new MutationObserver(schedule).observe(document.documentElement, {
      attributes: true, attributeFilter: ['data-theme']
    });

    /* При изменении DOM (новые элементы) — schedule */
    try {
      new MutationObserver(schedule).observe(document.body || document.documentElement, {
        childList: true, subtree: true
      });
    } catch (e) {}

    /* Periodic re-apply — на случай если disabled/enabled изменилось через app.js */
    setInterval(function () {
      /* Без полного cleanAll — только для STOP и accent-grid */
      if (isBW()) {
        var stop = document.getElementById('btn-stop');
        if (stop) {
          /* Проверяем актуальное disabled */
          if (stop.disabled) {
            I(stop, 'background', '#fff');
            I(stop, 'color', '#000');
            I(stop, '-webkit-text-fill-color', '#000');
            setChildrenColor(stop, '#000');
          } else {
            I(stop, 'background', '#000');
            I(stop, 'color', '#fff');
            I(stop, '-webkit-text-fill-color', '#fff');
            setChildrenColor(stop, '#fff');
          }
          mark(stop);
        }
      } else if (isDay() || isNight()) {
        var stop = document.getElementById('btn-stop');
        if (stop) {
          if (stop.disabled) {
            I(stop, 'background', 'transparent');
            I(stop, 'color', '#e63946');
            I(stop, '-webkit-text-fill-color', '#e63946');
            setChildrenColor(stop, '#e63946');
          } else {
            I(stop, 'background', '#e63946');
            I(stop, 'color', '#fff');
            I(stop, '-webkit-text-fill-color', '#fff');
            setChildrenColor(stop, '#fff');
          }
          mark(stop);
        }
      }
    }, 800);

    
    /* v84: watchdogs для state machine */
    setInterval(function () {
      applySynthState();
      if (isBW()) applyCardActive();
    }, 500);

    /* v84: watchdog — если synth.disabled но isStreaming=false > 3 сек — разблокировать */
    var _disabledSince = 0;
    setInterval(function () {
      var synth = document.getElementById('btn-synth');
      if (!synth) return;
      var isStreaming = window.JST_IS_STREAMING === true || synth.classList.contains('is-busy');
      if (synth.disabled && !isStreaming) {
        if (!_disabledSince) _disabledSince = Date.now();
        else if (Date.now() - _disabledSince > 3000) {
          synth.disabled = false;
          _disabledSince = 0;
          console.warn('[JST v84] Unlocked synth after stale disabled');
        }
      } else {
        _disabledSince = 0;
      }
    }, 1000);

    console.log('[JST force v84] initialized');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
