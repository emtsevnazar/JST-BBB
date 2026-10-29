/* v23 — strip inline colors МГНОВЕННО, только в contrast */
(function(){
  'use strict';
  function active(){ return document.documentElement.getAttribute('data-theme') === 'contrast'; }
  function strip(root){
    var els = (root || document).querySelectorAll('[style]');
    for (var i = 0; i < els.length; i++){
      var el = els[i], st = el.getAttribute('style') || '';
      var cleaned = st
        .replace(/(?:^|;)\s*(?:color|background(?:-color)?|border(?:-[\w-]+)?-color|outline-color|fill|stroke|box-shadow|text-shadow)\s*:\s*[^;]+/gi, '')
        .replace(/^;+/, '').replace(/;+/g, ';').trim();
      if (cleaned) el.setAttribute('style', cleaned);
      else el.removeAttribute('style');
    }
  }
  function start(){
    if (!document.body) return;
    new MutationObserver(function(muts){
      if (!active()) return;
      for (var i = 0; i < muts.length; i++){
        var m = muts[i];
        if (m.type === 'attributes' && m.attributeName === 'style' && m.target.getAttribute('style')) {
          strip(m.target.parentNode || document);
        }
        if (m.type === 'childList' && m.addedNodes.length) strip(document);
      }
    }).observe(document.body, { attributes: true, attributeFilter: ['style'], childList: true, subtree: true });
    new MutationObserver(function(){ if (active()) strip(document); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    if (active()) strip(document);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
