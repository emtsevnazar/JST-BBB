/* contrast-inline-strip.js v41 */
(function () {
  'use strict';
  if (window.__jstInlineStripV41) return;
  window.__jstInlineStripV41 = true;

  var SELECTORS = [
    '.jst-dot', '#lang-toggle', '#help-header-fixed', '.help-arrow',
    '.model-card', '.lang-card', '.accent-card', '.card', '.btn',
    '#theme-mode-badge', '.theme-mode-badge', '#theme-toggle',
    '#help-toggle', '.help-toggle',
    '.controls .btn', '.controls button', '.controls .btn-primary',
    '.btn.btn-primary', 'button.btn-primary', '.btn-primary',
    '#btn-random', '#btn-clear-history', '#history-dropdown', '#dl-dropdown'
  ].join(', ');

  var KEEP_VAR = ['var(--panel-border', 'var(--gold', 'var(--red',
    'var(--yellow', 'var(--accent', 'var(--error)', 'var(--danger',
    'var(--warning', 'var(--text', 'var(--border'];

  var COLOR_PROPS = [
    'background', 'background-color', 'background-image', 'color',
    'border', 'border-color', 'border-top-color', 'border-right-color',
    'border-bottom-color', 'border-left-color',
    'box-shadow', 'outline', 'outline-color'
  ];

  function isVar(v) {
    for (var i = 0; i < KEEP_VAR.length; i++) if (v.indexOf(KEEP_VAR[i]) === 0) return true;
    return false;
  }

  function stripInline() {
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
          if (isVar(val)) continue;
          el.style.removeProperty(prop);
        } catch (e) {}
      }
      if (!el.getAttribute('style') || /^[;\s]*$/.test(el.getAttribute('style'))) {
        el.removeAttribute('style');
      }
    }
    // Также удаляем inline background на #help-header-fixed (даже если не !important)
    var hh = document.getElementById('help-header-fixed');
    if (hh && hh.style) {
      hh.style.removeProperty('background');
      hh.style.removeProperty('background-color');
      hh.style.removeProperty('background-image');
      if (hh.getAttribute('style') && /^[;\s]*$/.test(hh.getAttribute('style'))) {
        hh.removeAttribute('style');
      }
    }
  }

  function stripInjectStyle() {
    if (document.documentElement.getAttribute('data-theme') !== 'contrast') return;
    var styles = document.querySelectorAll('head style');
    for (var i = 0; i < styles.length; i++) {
      var txt = styles[i].textContent || '';
      // Ищем injectStyle от app.js (help-header-fixed + прозрачный/жёлтый)
      if (txt.indexOf('#help-header-fixed') !== -1 &&
          (txt.indexOf('rgba(255, 255, 255, 0.15)') !== -1 ||
           txt.indexOf('rgba(245, 184, 0, 0.06)') !== -1 ||
           txt.indexOf('backdrop-filter: blur(20px)') !== -1)) {
        try {
          styles[i].setAttribute('data-jst-disabled', '1');
          styles[i].disabled = true;
          styles[i].remove();
        } catch (e) {}
      }
    }
  }

  function tick() {
    stripInjectStyle();
    stripInline();
    setTimeout(function(){ stripInjectStyle(); stripInline(); }, 100);
    setTimeout(function(){ stripInjectStyle(); stripInline(); }, 300);
    setTimeout(function(){ stripInjectStyle(); stripInline(); }, 800);
    setTimeout(function(){ stripInjectStyle(); stripInline(); }, 1500);
    setTimeout(function(){ stripInjectStyle(); stripInline(); }, 3000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tick);
  else tick();

  new MutationObserver(function () {
    if (document.documentElement.getAttribute('data-theme') === 'contrast') tick();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  new MutationObserver(function (muts) {
    if (document.documentElement.getAttribute('data-theme') !== 'contrast') return;
    clearTimeout(window.__jstStripTimer);
    window.__jstStripTimer = setTimeout(function(){ stripInjectStyle(); stripInline(); }, 30);
  }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });

  // Наблюдение за head — при добавлении injectStyle
  try {
    new MutationObserver(function () {
      if (document.documentElement.getAttribute('data-theme') === 'contrast') {
        setTimeout(stripInjectStyle, 10);
      }
    }).observe(document.head || document.documentElement, { childList: true, subtree: true });
  } catch (e) {}

  // Периодически
  setInterval(function () {
    if (document.documentElement.getAttribute('data-theme') === 'contrast') {
      stripInjectStyle();
      stripInline();
    }
  }, 800);
})();
