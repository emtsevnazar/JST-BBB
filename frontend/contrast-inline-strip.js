/* contrast-inline-strip.js v65 — убирает инжект :not(#p1) + правильные цвета */
(function () {
  'use strict';
  if (window.__jstStrip65) return;
  window.__jstStrip65 = true;

  var HH_PROPS_TO_REMOVE = [
    'background', 'background-color', 'background-image',
    'border', 'border-color', 'border-width', 'border-style', 'border-top',
    'border-right', 'border-bottom', 'border-left', 'border-radius',
    'box-shadow', 'outline', 'outline-color', 'outline-width',
    'backdrop-filter', '-webkit-backdrop-filter',
    'color', '-webkit-text-fill-color', 'position', 'top', 'left',
    'transform', 'z-index', 'display', 'align-items', 'justify-content',
    'padding', 'font-size', 'font-weight', 'letter-spacing', 'white-space'
  ];

  /* УБИРАЕМ инжект :not(#p1) с 24px shadow */
  function removeInjectedShadows() {
    var styles = document.querySelectorAll('head style');
    for (var i = 0; i < styles.length; i++) {
      var txt = styles[i].textContent || '';
      /* Паттерн :not(#p1) — auto-generated */
      if (/:not\(#p[0-9]/i.test(txt) ||
          /0 0 24px rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\.65/i.test(txt) ||
          /0 0 18px rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\.55/i.test(txt)) {
        try { styles[i].remove(); } catch (e) {}
      }
    }
  }

  /* #btn-stop :disabled — убрать var(--input-bg) */
  function fixBtnStopDisabled() {
    var b = document.getElementById('btn-stop');
    if (!b) return;
    if (b.disabled) {
      try {
        b.style.removeProperty('background-color');
        b.style.removeProperty('background');
        b.style.removeProperty('border');
        b.style.removeProperty('border-color');
        b.style.removeProperty('color');
        b.style.setProperty('background', '#fff', 'important');
        b.style.setProperty('border', '2px solid #000', 'important');
        b.style.setProperty('color', '#000', 'important');
      } catch(e) {}
    }
  }

  function fixHelpHeader() {
    if (document.documentElement.getAttribute('data-theme') !== 'contrast') return;
    var hh = document.getElementById('help-header-fixed');
    if (!hh) return;
    HH_PROPS_TO_REMOVE.forEach(function(p) {
      try { hh.style.removeProperty(p); } catch(e) {}
    });
    try {
      hh.style.setProperty('background', '#fff', 'important');
      hh.style.setProperty('background-color', '#fff', 'important');
      hh.style.setProperty('background-image', 'none', 'important');
      hh.style.setProperty('color', '#000', 'important');
      hh.style.setProperty('-webkit-text-fill-color', '#000', 'important');
      hh.style.setProperty('border', '2px solid #000', 'important');
      hh.style.setProperty('border-radius', '22px', 'important');
      hh.style.setProperty('box-shadow', 'none', 'important');
      hh.style.setProperty('backdrop-filter', 'none', 'important');
      hh.style.setProperty('-webkit-backdrop-filter', 'none', 'important');
      hh.style.setProperty('position', 'fixed', 'important');
      hh.style.setProperty('top', '24px', 'important');
      hh.style.setProperty('left', '50%', 'important');
      hh.style.setProperty('transform', 'translateX(-50%)', 'important');
      hh.style.setProperty('z-index', '2147483640', 'important');
      hh.style.setProperty('display', 'inline-flex', 'important');
      hh.style.setProperty('align-items', 'center', 'important');
      hh.style.setProperty('justify-content', 'center', 'important');
      hh.style.setProperty('padding', '10px 28px', 'important');
      hh.style.setProperty('font-size', '20px', 'important');
      hh.style.setProperty('font-weight', '700', 'important');
      hh.style.setProperty('letter-spacing', '1.5px', 'important');
      hh.style.setProperty('white-space', 'nowrap', 'important');
    } catch(e) {}
  }

  function tick() {
    removeInjectedShadows();
    fixBtnStopDisabled();
    if (document.documentElement.getAttribute('data-theme') === 'contrast') {
      fixHelpHeader();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tick);
  else tick();

  new MutationObserver(tick).observe(document.documentElement, {
    attributes: true, attributeFilter: ['data-theme']
  });

  try {
    new MutationObserver(tick).observe(document.documentElement, {
      childList: true, subtree: true, attributes: true, attributeFilter: ['style']
    });
  } catch(e) {}

  try {
    new MutationObserver(tick).observe(document.head || document.documentElement, { childList: true });
  } catch(e) {}

  setInterval(tick, 500);
})();
