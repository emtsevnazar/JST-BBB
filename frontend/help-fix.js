(function(){
  'use strict';
  console.log('[help-fix] v1 loading');

  // CSS safety net — if modal has .visible/.open/.show — force display
  try {
    var st = document.createElement('style');
    st.textContent = '.help-modal.visible, .help-modal.open, .help-modal.show, ' +
      '#help-modal.visible, #help-modal.open, #help-modal.show, ' +
      '.modal.visible, .modal.open, .modal.show { ' +
      'display: flex !important; visibility: visible !important; ' +
      'opacity: 1 !important; pointer-events: auto !important; ' +
      'z-index: 2147483000 !important; }';
    document.head.appendChild(st);
  } catch(e) {}

  function findBtn() {
    var sels = ['#btn-help', '#help-btn', '[data-i18n="title_help"]', 'button[title*="Помощь"]', 'button[title*="Help"]'];
    for (var i = 0; i < sels.length; i++) {
      try { var el = document.querySelector(sels[i]); if (el) return el; } catch(e) {}
    }
    // Text search
    try {
      var btns = document.querySelectorAll('button, .btn, [role="button"]');
      for (var j = 0; j < btns.length; j++) {
        var txt = (btns[j].textContent || '').trim().toLowerCase();
        if (txt === 'помощь' || txt === 'help' || txt === 'инструкция' || txt === 'instruction') return btns[j];
      }
    } catch(e) {}
    return null;
  }

  function findModal() {
    var sels = ['#help-modal', '.help-modal', '#help', '.modal'];
    for (var i = 0; i < sels.length; i++) {
      try { var el = document.querySelector(sels[i]); if (el) return el; } catch(e) {}
    }
    return null;
  }

  function isVisible(el) {
    if (!el) return false;
    try {
      var cs = getComputedStyle(el);
      return cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0.01;
    } catch(e) { return false; }
  }

  function forceShow(el) {
    if (!el) return;
    el.style.setProperty('display', 'flex', 'important');
    el.style.setProperty('visibility', 'visible', 'important');
    el.style.setProperty('opacity', '1', 'important');
    el.style.setProperty('pointer-events', 'auto', 'important');
    el.style.setProperty('z-index', '2147483000', 'important');
    try { el.classList.add('visible', 'open', 'show'); } catch(e) {}
    try { document.body.classList.add('help-open'); } catch(e) {}
  }

  function forceHide(el) {
    if (!el) return;
    el.style.setProperty('display', 'none', 'important');
    try { el.classList.remove('visible', 'open', 'show'); } catch(e) {}
    try { document.body.classList.remove('help-open'); } catch(e) {}
  }

  function checkAndFix() {
    var modal = findModal();
    if (!modal) { console.warn('[help-fix] modal not in DOM'); return; }
    if (!isVisible(modal)) {
      console.log('[help-fix] modal hidden — forcing show');
      forceShow(modal);
      // Trigger existing open code
      var btn = findBtn();
      if (btn) {
        try {
          btn.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}));
        } catch(e) {}
        setTimeout(function(){ if (!isVisible(modal)) forceShow(modal); }, 100);
      }
    } else {
      console.log('[help-fix] modal opened by existing handler');
    }
  }

  function bind() {
    var btn = findBtn();
    if (!btn) { console.warn('[help-fix] help button not found'); return; }
    console.log('[help-fix] button bound:', btn.id || btn.className || btn.tagName);

    // Extra click handler in BUBBLE phase (runs AFTER existing)
    btn.addEventListener('click', function(e){
      setTimeout(checkAndFix, 150);
    });

    // Also capture phase — catches case when existing handler doesn't fire
    document.addEventListener('click', function(e){
      var t = e.target;
      while (t && t !== document.body) {
        if (t === btn) {
          setTimeout(checkAndFix, 200);
          return;
        }
        t = t.parentNode;
      }
    }, true);
  }

  // Close on Escape or backdrop click
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') {
      var m = findModal();
      if (m && isVisible(m)) forceHide(m);
    }
  });
  document.addEventListener('click', function(e){
    var m = findModal();
    if (m && isVisible(m) && e.target === m) forceHide(m);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(bind, 300); });
  } else {
    setTimeout(bind, 300);
  }

  window.__jstHelpFix = { checkAndFix: checkAndFix, findBtn: findBtn, findModal: findModal };
  console.log('[help-fix] ready');
})();


(function(){
  'use strict';
  try {
    var logoSels = ['.logo-text', '.logo', '#logo', '.brand', '.logo-img', '.brand-text'];
    function findLogos() {
      var els = [];
      logoSels.forEach(function(sel){
        try {
          document.querySelectorAll(sel).forEach(function(el){ if (els.indexOf(el) === -1) els.push(el); });
        } catch(e){}
      });
      return els;
    }

    function blockThemeReset(e) {
      var target = e.target;
      while (target && target !== document.body) {
        if (target.matches && (target.matches('.logo-text, .logo, #logo, .brand, .logo-img, .brand-text'))) {
          // Stop propagation — не дать обработчикам выше сбросить тему
          e.stopPropagation();
          if (e.cancelable) e.preventDefault();

          // Сохраняем текущую тему
          var theme = document.documentElement.getAttribute('data-theme');
          var mode = null;
          try { mode = localStorage.getItem('jst-theme-mode'); } catch(err) {}

          // Перепроверить через 50ms — если тема сбросилась, восстановить
          setTimeout(function(){
            var now = document.documentElement.getAttribute('data-theme');
            if (now !== theme) {
              document.documentElement.setAttribute('data-theme', theme);
              if (mode) try { localStorage.setItem('jst-theme-mode', mode); } catch(err) {}
            }
          }, 50);

          setTimeout(function(){
            var now2 = document.documentElement.getAttribute('data-theme');
            if (now2 !== theme) {
              document.documentElement.setAttribute('data-theme', theme);
            }
          }, 200);
          return;
        }
        target = target.parentNode;
      }
    }

    // Capture phase — перехватываем ДО обработчиков app.js
    document.addEventListener('click', blockThemeReset, true);

    // На mousedown тоже — для страховки
    document.addEventListener('mousedown', blockThemeReset, true);

    console.log('[logo-fix] active');
  } catch(e) {
    console.warn('[logo-fix]', e);
  }
})();

/* === PERSIST CONTRAST THEME — robust across page reloads === */
(function(){
  'use strict';
  var KEY = 'jst-theme-mode';
  var BACKUP = 'jst-theme-mode-backup';
  var THEME_ATTR = 'data-theme';

  function getStored(){
    try { return localStorage.getItem(KEY); } catch(e){ return null; }
  }
  function getBackup(){
    try { return sessionStorage.getItem(BACKUP); } catch(e){ return null; }
  }
  function getCurrent(){
    return document.documentElement.getAttribute(THEME_ATTR);
  }
  function applyContrast(){
    document.documentElement.setAttribute(THEME_ATTR, 'contrast');
  }

  // 1. Backup current theme-mode to sessionStorage (survives localStorage reset)
  function backup(){
    var m = getStored();
    if (m) try { sessionStorage.setItem(BACKUP, m); } catch(e){}
  }

  // 2. Restore contrast if localStorage was reset
  function restore(){
    var stored = getStored();
    var backupMode = getBackup();
    var current = getCurrent();

    // If localStorage lost 'contrast' but sessionStorage still has it → restore
    if (backupMode === 'contrast' && stored !== 'contrast') {
      try { localStorage.setItem(KEY, 'contrast'); } catch(e){}
      applyContrast();
      console.log('[persist] restored contrast from sessionStorage');
      return;
    }

    // If localStorage says contrast but page shows different theme → force
    if (stored === 'contrast' && current !== 'contrast') {
      applyContrast();
      console.log('[persist] forced contrast (was ' + current + ')');
    }
  }

  // Backup on every change
  setInterval(backup, 500);
  backup();

  // Restore immediately
  restore();

  // Re-check after scripts run
  setTimeout(restore, 100);
  setTimeout(restore, 300);
  setTimeout(restore, 1000);

  // Watch for theme attr changes — if changed away from contrast while backup says contrast → restore
  var observer = new MutationObserver(function(mutations){
    for (var i = 0; i < mutations.length; i++) {
      var m = mutations[i];
      if (m.attributeName === THEME_ATTR) {
        var now = getCurrent();
        var backupMode = getBackup();
        // Only fight if backup says contrast and page changed away
        if (backupMode === 'contrast' && now !== 'contrast') {
          // Delay slightly to let intentional changes through
          setTimeout(function(){
            var b = getBackup();
            var s = getStored();
            if (b === 'contrast' && s === 'contrast' && getCurrent() !== 'contrast') {
              applyContrast();
            }
          }, 200);
        }
      }
    }
  });
  try {
    observer.observe(document.documentElement, { attributes: true, attributeFilter: [THEME_ATTR] });
  } catch(e){}

  // Block logo click from clearing localStorage
  document.addEventListener('click', function(e){
    var t = e.target;
    while (t && t !== document.body) {
      if (t.matches && t.matches('.logo, .logo-text, .logo-img, .brand, .brand-text, #logo')) {
        // Save current state right before navigation
        backup();
        return;
      }
      t = t.parentNode;
    }
  }, true);

  console.log('[persist] active, stored=' + getStored() + ' backup=' + getBackup() + ' current=' + getCurrent());
})();

/* === CONTRAST ENFORCER — force B&W inline styles, kill inline yellow === */
(function(){
  'use strict';
  var SKIP = ['jst-err-overlay', 'jst-wand', 'jst-wand-sparks', 'jst-wand-spark'];
  function isSkipped(el) {
    if (!el || !el.id) return false;
    if (SKIP.indexOf(el.id) !== -1) return true;
    // Родитель — overlay или wand
    var p = el.parentNode;
    while (p && p !== document.body) {
      if (p.id && SKIP.indexOf(p.id) !== -1) return true;
      p = p.parentNode;
    }
    return false;
  }
  function isContrast() {
    return document.documentElement.getAttribute('data-theme') === 'contrast';
  }
  function forceBW(el) {
    if (!el || el.nodeType !== 1) return;
    if (isSkipped(el)) return;
    try {
      var cs = getComputedStyle(el);
      // Text → black
      if (cs.color && cs.color !== 'rgb(0, 0, 0)' && cs.color !== 'rgba(0, 0, 0, 0)') {
        el.style.setProperty('color', '#000000', 'important');
        el.style.setProperty('-webkit-text-fill-color', '#000000', 'important');
      }
      // Background → white (if opaque colored)
      var bg = cs.backgroundColor;
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent' &&
          bg !== 'rgb(255, 255, 255)' && bg !== 'rgb(0, 0, 0)') {
        el.style.setProperty('background-color', '#ffffff', 'important');
      }
      // Background-image → none (kills gradients/yellow)
      if (cs.backgroundImage && cs.backgroundImage !== 'none') {
        el.style.setProperty('background-image', 'none', 'important');
      }
      // Box shadow → none
      if (cs.boxShadow && cs.boxShadow !== 'none') {
        el.style.setProperty('box-shadow', 'none', 'important');
      }
      // Text shadow → none
      if (cs.textShadow && cs.textShadow !== 'none') {
        el.style.setProperty('text-shadow', 'none', 'important');
      }
      // Border color → black (if visible)
      if (cs.borderTopWidth && cs.borderTopWidth !== '0px' &&
          cs.borderTopColor && cs.borderTopColor !== 'rgb(0, 0, 0)') {
        el.style.setProperty('border-color', '#000000', 'important');
      }
    } catch(e){}
  }
  function walkAndForce(root) {
    if (!root) return;
    forceBW(root);
    var all = root.querySelectorAll('*');
    for (var i = 0; i < all.length; i++) forceBW(all[i]);
  }
  function enforceAll() {
    if (!isContrast()) return;
    // Walk whole body (excluding overlay/wand)
    walkAndForce(document.body);
    // Logo grayscale
    document.querySelectorAll('.logo, .logo-img, .logo img, img.logo-img, a.logo, a.logo img').forEach(function(el){
      if (el.tagName === 'IMG' || el.tagName === 'SVG' || el.tagName.toLowerCase() === 'img') {
        el.style.setProperty('filter', 'grayscale(1) contrast(1.15) brightness(1.02)', 'important');
        el.style.setProperty('-webkit-filter', 'grayscale(1) contrast(1.15) brightness(1.02)', 'important');
      } else {
        el.style.setProperty('filter', 'grayscale(1) contrast(1.15) brightness(1.02)', 'important');
      }
    });
  }

  // Trigger on help open + on every theme change
  var helpBtn = null;
  function findHelpBtn() {
    var sels = ['#btn-help', '#help-btn', '[data-i18n="title_help"]'];
    for (var i = 0; i < sels.length; i++) {
      try { var el = document.querySelector(sels[i]); if (el) return el; } catch(e){}
    }
    var btns = document.querySelectorAll('button');
    for (var j = 0; j < btns.length; j++) {
      var txt = (btns[j].textContent || '').trim().toLowerCase();
      if (txt === 'помощь' || txt === 'help') return btns[j];
    }
    return null;
  }

  function scheduleEnforce() {
    if (!isContrast()) return;
    setTimeout(enforceAll, 30);
    setTimeout(enforceAll, 150);
    setTimeout(enforceAll, 400);
    setTimeout(enforceAll, 900);
  }

  // Click on help → enforce after modal renders
  document.addEventListener('click', function(e){
    var t = e.target;
    while (t && t !== document.body) {
      var txt = (t.textContent || '').trim().toLowerCase();
      if (txt === 'помощь' || txt === 'help' || txt === 'инструкция') {
        scheduleEnforce();
        return;
      }
      t = t.parentNode;
    }
  }, false);

  // Watch theme changes
  new MutationObserver(function(){
    if (isContrast()) scheduleEnforce();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // Watch help modal appearing
  var helpModalObs = new MutationObserver(function(mutations){
    if (!isContrast()) return;
    for (var i = 0; i < mutations.length; i++) {
      var m = mutations[i];
      if (m.addedNodes && m.addedNodes.length) {
        for (var j = 0; j < m.addedNodes.length; j++) {
          var n = m.addedNodes[j];
          if (n.nodeType === 1 && n.classList) {
            if (n.classList.contains('help-modal') || n.id === 'help-modal' ||
                n.querySelector && n.querySelector('.help-modal')) {
              scheduleEnforce();
              return;
            }
          }
        }
      }
    }
  });
  if (document.body) helpModalObs.observe(document.body, { childList: true, subtree: true });

  // Initial
  if (isContrast()) setTimeout(enforceAll, 500);
  setTimeout(enforceAll, 1500);

  window.__jstContrastEnforce = enforceAll;
  console.log('[contrast-enforcer] ready');
})();
