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
