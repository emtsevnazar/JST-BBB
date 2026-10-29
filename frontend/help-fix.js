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


/* === LOGO CLICK FIX — prevent theme reset on .logo-text click === */
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
