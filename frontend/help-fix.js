(function(){
  'use strict';
  console.log('[help-fix] minimal, no enforcer');

  function findModal() {
    return document.querySelector('#help-modal, .help-modal') ||
           Array.from(document.querySelectorAll('.modal')).find(function(el){
             return el.querySelector('.help-doc, .help-content');
           });
  }
  function isVisible(el) {
    if (!el) return false;
    var cs = getComputedStyle(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0.01;
  }
  function forceShow(el) {
    if (!el) return;
    el.style.setProperty('display', 'flex', 'important');
    el.style.setProperty('visibility', 'visible', 'important');
    el.style.setProperty('opacity', '1', 'important');
    el.style.setProperty('pointer-events', 'auto', 'important');
    el.style.setProperty('z-index', '2147483000', 'important');
    try { el.classList.add('visible', 'open', 'show'); } catch(e){}
    try { document.body.classList.add('help-open'); } catch(e){}
  }
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') {
      var m = findModal();
      if (m && isVisible(m)) {
        m.style.setProperty('display', 'none', 'important');
        m.classList.remove('visible', 'open', 'show');
      }
    }
  });
  window.__jstHelpFix = {
    checkAndFix: function() {
      var m = findModal();
      if (m && !isVisible(m)) forceShow(m);
      return { found: !!m, visible: isVisible(m) };
    }
  };
})();
/* === CONTRAST HELP ENFORCER === */
(function(){
  'use strict';
  function isContrast() {
    return document.documentElement.getAttribute('data-theme') === 'contrast';
  }
  function fix(el) {
    if (!el || el.nodeType !== 1) return;
    var style = el.getAttribute('style') || '';
    if (!style) return;
    var needs = false;
    var newStyle = style;
    // Fix yellow in inline styles
    var patterns = [
      [/245\s*,\s*184\s*,\s*0/g, '0, 0, 0'],
      [/255\s*,\s*199\s*,\s*44/g, '0, 0, 0'],
      [/255\s*,\s*215\s*,\s*0/g, '0, 0, 0'],
      [/#F5B800/gi, '#000000'],
      [/#FFC72C/gi, '#000000'],
      [/#FFD859/gi, '#000000'],
      [/#FFD700/gi, '#000000']
    ];
    for (var i = 0; i < patterns.length; i++) {
      if (patterns[i][0].test(style)) {
        newStyle = newStyle.replace(patterns[i][0], patterns[i][1]);
        needs = true;
      }
    }
    if (needs) {
      try { el.setAttribute('style', newStyle); } catch (e) {}
    }
  }
  function enforceHelpModal() {
    if (!isContrast()) return;
    var modals = document.querySelectorAll('.help-modal, #help-modal, .help-doc, #help-body, #help-blur, .help-content');
    modals.forEach(function(m) {
      fix(m);
      var all = m.querySelectorAll('*');
      for (var i = 0; i < all.length; i++) fix(all[i]);
    });
  }
  function schedule() {
    if (!isContrast()) return;
    setTimeout(enforceHelpModal, 50);
    setTimeout(enforceHelpModal, 200);
    setTimeout(enforceHelpModal, 500);
    setTimeout(enforceHelpModal, 1000);
  }
  // Theme change
  try {
    new MutationObserver(function(mutations) {
      for (var i = 0; i < mutations.length; i++) {
        if (mutations[i].attributeName === 'data-theme') schedule();
      }
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  } catch (e) {}
  // Help modal open
  if (document.body) {
    try {
      new MutationObserver(function(mutations) {
        if (!isContrast()) return;
        for (var i = 0; i < mutations.length; i++) {
          var nodes = mutations[i].addedNodes;
          if (nodes && nodes.length) {
            for (var j = 0; j < nodes.length; j++) {
              var n = nodes[j];
              if (n.nodeType === 1 && (
                n.classList && (n.classList.contains('help-modal') || n.id === 'help-modal' || n.id === 'help-body')
              )) {
                schedule();
                return;
              }
            }
            // Any node added — schedule check (may be help content)
            schedule();
            return;
          }
        }
      }).observe(document.body, { childList: true, subtree: true });
    } catch (e) {}
  }
  // Initial
  if (isContrast()) setTimeout(enforceHelpModal, 500);
  window.__jstContrastHelpEnforce = enforceHelpModal;
})();
