/* v23 — strip inline colors МГНОВЕННО, только в contrast */
(function(){
  'use strict';
  function active(){ return document.documentElement.getAttribute('data-theme') === 'contrast'; }
  function strip(root){
    const els = (root || document).querySelectorAll('[style]');
    for (let i = 0; i < els.length; i++){
      const el = els[i], st = el.getAttribute('style') || '';
      const cleaned = st
        .replace(/(?:^|;)\s*(?:color|background(?:-color)?|border(?:-[\w-]+)?-color|outline-color|fill|stroke|box-shadow|text-shadow)\s*:\s*[^;]+/gi, '')
        .replace(/^;+/, '').replace(/;+/g, ';').trim();
      if (cleaned) el.setAttribute('style', cleaned);
      else el.removeAttribute('style');
    }
  }
  function start(){
    if (!document.body) return;
    new MutationObserver((muts) =>{
      if (!active()) return;
      for (let i = 0; i < muts.length; i++){
        const m = muts[i];
        if (m.type === 'attributes' && m.attributeName === 'style' && m.target.getAttribute('style')) {
          strip(m.target.parentNode || document);
        }
        if (m.type === 'childList' && m.addedNodes.length) strip(document);
      }
    }).observe(document.body, { attributes: true, attributeFilter: ['style'], childList: true, subtree: true });
    new MutationObserver(() =>{ if (active()) strip(document); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    if (active()) strip(document);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
