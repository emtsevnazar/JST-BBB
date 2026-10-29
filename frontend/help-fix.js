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
(function(){
  'use strict';
  var CONTRAST_HEXES = [
    /#F5B800/gi, /#FFC72C/gi, /#FFD859/gi, /#FFD966/gi,
    /#FFE082/gi, /#FFEB3B/gi, /#FFD700/gi, /#FFC107/gi,
    /#FFB300/gi, /#FFA000/gi, /#FFCA28/gi, /#FFD54F/gi,
    /#f5b300/gi, /#f0c040/gi,
    /rgba\(\s*245\s*,\s*184\s*,\s*0[^)]*\)/gi,
    /rgba\(\s*255\s*,\s*(?:199|215|235|216)\s*,\s*(?:44|0|59|89)[^)]*\)/gi
  ];
  function isContrast() {
    return document.documentElement.getAttribute('data-theme') === 'contrast';
  }
  function isSkipped(el) {
    if (!el || !el.id) return false;
    if (el.id === 'jst-err-overlay' || el.id === 'jst-wand') return true;
    var p = el.parentNode;
    while (p && p !== document.body) {
      if (p.id === 'jst-err-overlay' || p.id === 'jst-wand') return true;
      p = p.parentNode;
    }
    return false;
  }
  function fixInline(el) {
    if (!el || el.nodeType !== 1) return;
    if (isSkipped(el)) return;
    var style = el.getAttribute('style');
    if (!style) return;
    var newStyle = style;
    var changed = false;
    CONTRAST_HEXES.forEach(function(re) {
      if (re.test(newStyle)) {
        newStyle = newStyle.replace(re, '#000000');
        changed = true;
      }
    });
    // Убить rgba серых/полупрозрачных фонов
    if (/background[^:]*:\s*rgba\(/.test(newStyle)) {
      newStyle = newStyle.replace(/background(-color)?\s*:\s*rgba\([^)]+\)/g, 'background$1: transparent');
      changed = true;
    }
    if (changed) {
      try { el.setAttribute('style', newStyle); } catch(e) {}
    }
  }
  function walkAll() {
    if (!isContrast()) return;
    var all = document.querySelectorAll('[style]');
    for (var i = 0; i < all.length; i++) fixInline(all[i]);
  }
  function schedule() {
    if (!isContrast()) return;
    setTimeout(walkAll, 30);
    setTimeout(walkAll, 200);
    setTimeout(walkAll, 500);
    setTimeout(walkAll, 1000);
    setTimeout(walkAll, 2000);
  }
  try {
    new MutationObserver(function(mutations) {
      for (var i = 0; i < mutations.length; i++) {
        if (mutations[i].attributeName === 'data-theme') schedule();
      }
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  } catch (e) {}
  if (document.body) {
    try {
      new MutationObserver(function(mutations) {
        if (!isContrast()) return;
        for (var i = 0; i < mutations.length; i++) {
          if (mutations[i].addedNodes && mutations[i].addedNodes.length) {
            schedule();
            return;
          }
        }
      }).observe(document.body, { childList: true, subtree: true });
    } catch (e) {}
  }
  if (isContrast()) setTimeout(walkAll, 500);
  window.__jstContrastEnforce = walkAll;
})();
(function(){
  'use strict';
  var CONTRAST_HEXES = [
    /#F5B800/gi, /#FFC72C/gi, /#FFD859/gi, /#FFD966/gi,
    /#FFE082/gi, /#FFEB3B/gi, /#FFD700/gi, /#FFC107/gi,
    /#FFB300/gi, /#FFA000/gi, /#FFCA28/gi, /#FFD54F/gi,
    /#f5b300/gi, /#f0c040/gi,
    /rgba\(\s*245\s*,\s*184\s*,\s*0[^)]*\)/gi,
    /rgba\(\s*255\s*,\s*(?:199|215|235|216)\s*,\s*(?:44|0|59|89)[^)]*\)/gi
  ];
  function isContrast() {
    return document.documentElement.getAttribute('data-theme') === 'contrast';
  }
  function isSkipped(el) {
    if (!el || !el.id) return false;
    if (el.id === 'jst-err-overlay' || el.id === 'jst-wand') return true;
    var p = el.parentNode;
    while (p && p !== document.body) {
      if (p.id === 'jst-err-overlay' || p.id === 'jst-wand') return true;
      p = p.parentNode;
    }
    return false;
  }
  function fixInline(el) {
    if (!el || el.nodeType !== 1) return;
    if (isSkipped(el)) return;
    var style = el.getAttribute('style');
    if (!style) return;
    var newStyle = style;
    var changed = false;
    // Kill hex yellows
    CONTRAST_HEXES.forEach(function(re) {
      if (re.test(newStyle)) {
        newStyle = newStyle.replace(re, '#000000');
        changed = true;
      }
    });
    // Replace rgba(0,0,0,x) backgrounds → transparent
    if (/background[^:]*:\s*rgba\(\s*0\s*,\s*0\s*,\s*0/.test(newStyle)) {
      newStyle = newStyle.replace(
        /background(-color)?\s*:\s*rgba\(\s*0\s*,\s*0\s*,\s*0\s*,[^)]+\)/gi,
        'background$1: transparent'
      );
      changed = true;
    }
    // rgba(255,255,255,x) backgrounds → transparent
    if (/background[^:]*:\s*rgba\(\s*255\s*,\s*255\s*,\s*255/.test(newStyle)) {
      newStyle = newStyle.replace(
        /background(-color)?\s*:\s*rgba\(\s*255\s*,\s*255\s*,\s*255\s*,[^)]+\)/gi,
        'background$1: transparent'
      );
      changed = true;
    }
    // box-shadow → none
    if (/box-shadow\s*:/.test(newStyle)) {
      newStyle = newStyle.replace(/box-shadow\s*:[^;]+;?/gi, 'box-shadow: none !important;');
      changed = true;
    }
    // color: rgba(0,0,0,x) → black
    if (/color\s*:\s*rgba\(\s*0\s*,\s*0\s*,\s*0/.test(newStyle)) {
      newStyle = newStyle.replace(
        /(?:^|;)\s*color\s*:\s*rgba\(\s*0\s*,\s*0\s*,\s*0\s*,[^)]+\)/gi,
        ';color: #000000 !important'
      );
      changed = true;
    }
    // border-color: rgba(0,0,0,x) → black
    if (/border[^:]*:\s*rgba\(\s*0\s*,\s*0\s*,\s*0/.test(newStyle)) {
      newStyle = newStyle.replace(
        /border(?:-color)?\s*:\s*rgba\(\s*0\s*,\s*0\s*,\s*0\s*,[^)]+\)/gi,
        'border-color: #000000 !important'
      );
      changed = true;
    }
    if (changed) {
      try { el.setAttribute('style', newStyle); } catch(e) {}
    }
  }
  function walkAll() {
    if (!isContrast()) return;
    var all = document.querySelectorAll('[style]');
    for (var i = 0; i < all.length; i++) fixInline(all[i]);
  }
  var scheduled = false;
  function schedule() {
    if (!isContrast() || scheduled) return;
    scheduled = true;
    setTimeout(function() {
      scheduled = false;
      walkAll();
    }, 50);
  }
  // Theme change observer
  try {
    new MutationObserver(function(mutations) {
      for (var i = 0; i < mutations.length; i++) {
        if (mutations[i].attributeName === 'data-theme') schedule();
      }
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  } catch (e) {}
  // Body attribute observer (для inline style изменений)
  if (document.body) {
    try {
      new MutationObserver(function(mutations) {
        if (!isContrast()) return;
        for (var i = 0; i < mutations.length; i++) {
          if (mutations[i].type === 'attributes' && mutations[i].attributeName === 'style') {
            schedule();
            return;
          }
          if (mutations[i].addedNodes && mutations[i].addedNodes.length) {
            schedule();
            return;
          }
        }
      }).observe(document.body, {
        attributes: true,
        attributeFilter: ['style'],
        childList: true,
        subtree: true
      });
    } catch (e) {}
  }
  // Periodic enforcer (catch missed changes)
  setInterval(function() {
    if (isContrast()) walkAll();
  }, 1000);
  if (isContrast()) setTimeout(walkAll, 500);
  window.__jstContrastEnforce = walkAll;
})();
(function(){
  "use strict";
  function isContrast() {
    return document.documentElement.getAttribute("data-theme") === "contrast";
  }
  function isSkipped(el) {
    if (!el) return true;
    if (el.id === "jst-err-overlay" || el.id === "jst-wand") return true;
    var p = el.parentNode;
    while (p && p !== document.body) {
      if (p.id === "jst-err-overlay" || p.id === "jst-wand") return true;
      p = p.parentNode;
    }
    return false;
  }
  var INLINE_REPLACERS = [
    [/#F5B800/gi, "#000000"],
    [/#f5b800/gi, "#000000"],
    [/#FFC72C/gi, "#000000"],
    [/#FFD859/gi, "#000000"],
    [/#FFD700/gi, "#000000"],
    [/#FFC107/gi, "#000000"],
    [/#FFB300/gi, "#000000"],
    [/#FFA000/gi, "#000000"],
    [/background(-color)?\s*:\s*rgba\(\s*245\s*,\s*184\s*,\s*0\s*,[^)]+\)/gi, "background$1: #ffffff"],
    [/background(-color)?\s*:\s*rgba\(\s*255\s*,\s*(199|215|235|216)\s*,[^)]+\)/gi, "background$1: #ffffff"],
    [/border(-color)?\s*:\s*rgba\(\s*245\s*,\s*184\s*,\s*0\s*,[^)]+\)/gi, "border$1: #000000"],
    [/border(-color)?\s*:\s*2px\s+solid\s+#F5B800/gi, "border$1: 2px solid #000000"],
    [/box-shadow\s*:\s*[^;]*rgba\(\s*245\s*,\s*184\s*,\s*0[^)]*\)[^;]*/gi, "box-shadow: none"],
  ];
  function cleanInline(el) {
    if (!el || el.nodeType !== 1 || isSkipped(el)) return;
    var style = el.getAttribute("style");
    if (!style) return;
    var newStyle = style;
    var changed = false;
    for (var i = 0; i < INLINE_REPLACERS.length; i++) {
      var re = INLINE_REPLACERS[i][0];
      var rep = INLINE_REPLACERS[i][1];
      if (re.test(newStyle)) {
        newStyle = newStyle.replace(re, rep);
        changed = true;
      }
    }
    if (changed) {
      try { el.setAttribute("style", newStyle); } catch(e) {}
    }
  }
  function walkAll() {
    if (!isContrast()) return;
    var all = document.querySelectorAll("[style]");
    for (var i = 0; i < all.length; i++) cleanInline(all[i]);
  }
  var scheduled = false;
  function schedule() {
    if (!isContrast() || scheduled) return;
    scheduled = true;
    setTimeout(function() { scheduled = false; walkAll(); }, 100);
  }
  try {
    new MutationObserver(function(m) {
      for (var i = 0; i < m.length; i++) {
        if (m[i].attributeName === "data-theme") schedule();
      }
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  } catch (e) {}
  if (document.body) {
    try {
      new MutationObserver(function(m) {
        if (!isContrast()) return;
        for (var i = 0; i < m.length; i++) {
          if (m[i].type === "attributes" && m[i].attributeName === "style") {
            cleanInline(m[i].target);
          }
          if (m[i].addedNodes && m[i].addedNodes.length) schedule();
        }
      }).observe(document.body, { attributes: true, attributeFilter: ["style"], childList: true, subtree: true });
    } catch (e) {}
  }
  setInterval(function() { if (isContrast()) walkAll(); }, 500);
  if (isContrast()) setTimeout(walkAll, 300);
  window.__jstContrastEnforce = walkAll;
})();
/* === CONTRAST ENFORCER === */
(function(){
  "use strict";
  function isContrast() {
    return document.documentElement.getAttribute("data-theme") === "contrast";
  }
  function isSkipped(el) {
    if (!el) return true;
    if (el.id === "jst-err-overlay" || el.id === "jst-wand") return true;
    var p = el.parentNode;
    while (p && p !== document.body) {
      if (p.id === "jst-err-overlay" || p.id === "jst-wand") return true;
      p = p.parentNode;
    }
    return false;
  }
  var RULES = [
    [/#F5B800/gi, "#000000"], [/#f5b800/gi, "#000000"],
    [/#FFC72C/gi, "#000000"], [/#FFD859/gi, "#000000"],
    [/#FFD700/gi, "#000000"], [/#FFC107/gi, "#000000"],
    [/#FFB300/gi, "#000000"], [/#FFA000/gi, "#000000"],
    [/background(-color)?\s*:\s*rgba\(\s*245\s*,\s*184\s*,\s*0\s*,[^)]+\)/gi, "background$1: #ffffff"],
    [/background(-color)?\s*:\s*rgba\(\s*255\s*,\s*(199|215|235|216)\s*,[^)]+\)/gi, "background$1: #ffffff"],
    [/border(-color)?\s*:\s*rgba\(\s*245\s*,\s*184\s*,\s*0\s*,[^)]+\)/gi, "border$1: #000000"],
    [/border\s*:\s*2px\s+solid\s+#F5B800/gi, "border: 2px solid #000000"],
    [/box-shadow\s*:\s*[^;]*rgba\(\s*245\s*,\s*184\s*,\s*0[^)]*\)[^;]*/gi, "box-shadow: none"],
  ];
  function fix(el) {
    if (!el || el.nodeType !== 1 || isSkipped(el)) return;
    var style = el.getAttribute("style");
    if (!style) return;
    var ns = style, ch = false;
    for (var i = 0; i < RULES.length; i++) {
      if (RULES[i][0].test(ns)) {
        ns = ns.replace(RULES[i][0], RULES[i][1]);
        ch = true;
      }
    }
    if (ch) try { el.setAttribute("style", ns); } catch(e) {}
  }
  function walkAll() {
    if (!isContrast()) return;
    document.querySelectorAll("[style]").forEach(fix);
  }
  var sched = false;
  function schedule() {
    if (!isContrast() || sched) return;
    sched = true;
    setTimeout(function() { sched = false; walkAll(); }, 100);
  }
  try {
    new MutationObserver(function(m) {
      for (var i = 0; i < m.length; i++) {
        if (m[i].attributeName === "data-theme") schedule();
      }
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  } catch (e) {}
  if (document.body) {
    try {
      new MutationObserver(function(m) {
        if (!isContrast()) return;
        for (var i = 0; i < m.length; i++) {
          if (m[i].type === "attributes" && m[i].attributeName === "style") fix(m[i].target);
          if (m[i].addedNodes && m[i].addedNodes.length) schedule();
        }
      }).observe(document.body, { attributes: true, attributeFilter: ["style"], childList: true, subtree: true });
    } catch (e) {}
  }
  setInterval(function() { if (isContrast()) walkAll(); }, 500);
  if (isContrast()) setTimeout(walkAll, 300);
  window.__jstContrastEnforce = walkAll;
})();
