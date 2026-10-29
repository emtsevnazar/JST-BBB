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
