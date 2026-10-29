/* contrast-inline-strip.js v39 — удаляет inline !important цвета в contrast */
(function () {
  'use strict';
  if (window.__jstInlineStripLoaded) return;
  window.__jstInlineStripLoaded = true;

  var SELECTORS = [
    '.jst-dot', '#lang-toggle', '#help-header-fixed', '.help-arrow',
    '.model-card', '.lang-card', '.accent-card', '.card', '.btn',
    '#theme-mode-badge', '.theme-mode-badge',
    '.controls .btn', '.controls button', '.controls .btn-primary',
    '.btn.btn-primary', 'button.btn-primary', '.btn-primary',
    '#btn-random', '#btn-clear-history', '#history-dropdown', '#dl-dropdown'
  ].join(', ');

  var KEEP_VAR_PREFIXES = ['var(--panel-border', 'var(--gold', 'var(--red',
    'var(--yellow', 'var(--accent', 'var(--error', 'var(--danger',
    'var(--warning', 'var(--text', 'var(--border'];

  var COLOR_PROPS = [
    'background', 'background-color', 'background-image',
    'color', 'border', 'border-color',
    'border-top-color', 'border-right-color',
    'border-bottom-color', 'border-left-color',
    'box-shadow', 'outline', 'outline-color'
  ];

  function isVarValue(v) {
    for (var i = 0; i < KEEP_VAR_PREFIXES.length; i++) {
      if (v.indexOf(KEEP_VAR_PREFIXES[i]) === 0) return true;
    }
    return false;
  }

  function strip() {
    if (document.documentElement.getAttribute('data-theme') !== 'contrast') return;
    var nodes = document.querySelectorAll(SELECTORS);
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (!el.getAttribute('style')) continue;
      for (var j = 0; j < COLOR_PROPS.length; j++) {
        var prop = COLOR_PROPS[j];
        try {
          var val = el.style.getPropertyValue(prop);
          if (!val) continue;
          if (el.style.getPropertyPriority(prop) !== 'important') continue;
          if (isVarValue(val)) continue;
          el.style.removeProperty(prop);
        } catch (e) {}
      }
      if (!el.getAttribute('style') || /^[;\s]*$/.test(el.getAttribute('style'))) {
        el.removeAttribute('style');
      }
    }
  }

  function tick() {
    strip();
    setTimeout(strip, 100);
    setTimeout(strip, 500);
    setTimeout(strip, 1500);
    setTimeout(strip, 3000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tick);
  else tick();

  new MutationObserver(function () {
    if (document.documentElement.getAttribute('data-theme') === 'contrast') tick();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  new MutationObserver(function () {
    if (document.documentElement.getAttribute('data-theme') === 'contrast') {
      clearTimeout(window.__jstStripTimer);
      window.__jstStripTimer = setTimeout(strip, 50);
    }
  }).observe(document.body || document.documentElement, { childList: true, subtree: true, attributeFilter: ['style'] });
})();
