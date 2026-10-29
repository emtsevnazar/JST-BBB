/* JST-THEME-AWARE-LOADER v20 — enforcer запускается только в contrast */
(function(){
  'use strict';
  function isContrast(){ return document.documentElement.getAttribute('data-theme') === 'contrast'; }
  function loadImpl(){
    var s = document.createElement('script');
    s.src = '/help-fix-impl.js?v=' + Date.now();
    s.async = false;
    document.head.appendChild(s);
  }
  function clearInlineImportant(){
    document.querySelectorAll('[style]').forEach(function(el){
      var st = el.getAttribute('style') || '';
      if (/!important/i.test(st)) el.removeAttribute('style');
    });
    document.querySelectorAll('[data-jst-enf]').forEach(function(el){
      el.removeAttribute('data-jst-enf');
    });
  }
  var was = false, t = null;
  function check(){
    if (t) clearTimeout(t);
    t = setTimeout(function(){
      var c = isContrast();
      if (c && !was) loadImpl();
      if (!c && was) clearInlineImportant();
      was = c;
    }, 25);
  }
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', check);
  else check();
  new MutationObserver(check).observe(document.documentElement,
    { attributes: true, attributeFilter: ['data-theme'] });
})();
