(function(){
  'use strict';
  var GOLD = '#F5B800', NAVY = '#1a2a5e', STAR = 'M 8.00 3.00 L 9.00 5.93 L 11.91 4.88 L 10.24 7.49 L 12.87 9.11 L 9.80 9.43 L 10.17 12.50 L 8.00 10.30 L 5.83 12.50 L 6.20 9.43 L 3.13 9.11 L 5.76 7.49 L 4.09 4.88 L 7.00 5.93 Z';
  function L(){ try{ console.log.apply(console, ['[wand]'].concat([].slice.call(arguments))); }catch(e){} }
  function W(){ try{ console.warn.apply(console, ['[wand]'].concat([].slice.call(arguments))); }catch(e){} }
  function theme(){ try{ return document.documentElement.getAttribute('data-theme') || 'day'; }catch(e){ return 'day'; } }
  function bodyColor(){ var t=theme(); if(t==='contrast') return '#000000'; return t === 'night' ? GOLD : NAVY; }

  function init(){
    try {
      if (window.__jstWandV8) { L('already init'); return; }
      window.__jstWandV8 = true;
      L('v8 init start');
      if (!document.body) { document.addEventListener('DOMContentLoaded', init); return; }

      var old = document.getElementById('jst-wand');
      if (old) old.remove();

      var wand = document.createElement('div');
      wand.id = 'jst-wand';
      wand.setAttribute('aria-hidden', 'true');
      wand.style.cssText = 'position:fixed!important;left:0!important;top:0!important;width:24px!important;height:24px!important;min-width:24px!important;min-height:24px!important;pointer-events:none!important;z-index:2147483647!important;opacity:1!important;visibility:visible!important;display:block!important;transform:translate(-300px,-300px)!important;will-change:transform!important;margin:0!important;padding:0!important;border:none!important;background:none!important;';

      var bc = bodyColor();
      wand.innerHTML = [
        '<svg viewBox="0 0 32 32" width="24" height="24" style="width:24px!important;height:24px!important;display:block!important;overflow:visible!important">',
        '<line x1="10" y1="10" x2="30" y2="30" stroke="black" stroke-width="3" stroke-linecap="round" opacity="0.5"/>',
        '<line x1="10" y1="10" x2="30" y2="30" stroke="' + GOLD + '" stroke-width="2" stroke-linecap="round"/>',
        '<line x1="10" y1="10" x2="30" y2="30" stroke="' + bc + '" stroke-width="1" stroke-linecap="round" class="jst-wand-body"/>',
        '<path class="jst-wand-star" d="' + STAR + '" fill="' + bc + '" stroke="' + GOLD + '" stroke-width="1" stroke-linejoin="round"/>',
        '</svg>',
        '<div class="jst-wand-sparks" style="position:absolute;left:8px;top:8px;width:0;height:0;pointer-events:none"></div>'
      ].join('');

      document.body.appendChild(wand);
      L('appended');

      requestAnimationFrame(function(){
        try {
          var r = wand.getBoundingClientRect();
          var cs = getComputedStyle(wand);
          L('render: rect=' + r.width + 'x' + r.height + ' display=' + cs.display + ' opacity=' + cs.opacity);
          if (r.width > 0 && cs.display !== 'none' && cs.visibility === 'visible') {
            var st = document.createElement('style');
            st.textContent = 'body.cursor-none,body.cursor-none *{cursor:none!important}body.cursor-none input,body.cursor-none textarea,body.cursor-none [contenteditable="true"]{cursor:text!important}';
            document.head.appendChild(st);
            document.body.classList.add('cursor-none');
            L('OK cursor hidden');
          } else {
            W('NOT rendering — cursor kept');
          }
        } catch(e) { W('render check', e); }
      });

      try {
        new MutationObserver(function(){
          var b = wand.querySelector('.jst-wand-body'), s = wand.querySelector('.jst-wand-star');
          var n = bodyColor();
          if (b) b.setAttribute('stroke', n);
          if (s) s.setAttribute('fill', n);
        }).observe(document.documentElement, {attributes: true, attributeFilter: ['data-theme']});
      } catch(e){}

      var sparks = wand.querySelector('.jst-wand-sparks');
      var lastX = -300, lastY = -300, lastMove = 0;

      function emit(cx, cy, n, burst){
        for (var i = 0; i < n; i++) {
          try {
            var s = document.createElement('span');
            var a = Math.random() * Math.PI * 2;
            var d = burst ? (22 + Math.random() * 55) : (8 + Math.random() * 28);
            var sz = burst ? (3 + Math.random() * 5) : (1.8 + Math.random() * 2.5);
            var isContrast = theme() === 'contrast';
            var isGold = isContrast ? (Math.random() > 0.5) : (Math.random() > 0.4);
            var sparkColor = isContrast ? (isGold ? '#ffffff' : '#000000') : (isGold ? GOLD : NAVY);
            s.style.cssText = 'position:absolute;border-radius:50%;pointer-events:none;width:' + sz + 'px;height:' + sz + 'px;background:' + sparkColor + ';box-shadow:0 0 ' + (burst ? 6 : 4) + 'px ' + sparkColor + ';transform:translate(-50%,-50%);will-change:transform,opacity;';
            sparks.appendChild(s);
            var dx = Math.cos(a) * d, dy = Math.sin(a) * d, dur = burst ? 1200 : 800;
            if (s.animate) {
              s.animate([
                { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
                { opacity: 0.9, offset: 0.5 },
                { transform: 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px)) scale(0.15)', opacity: 0 }
              ], { duration: dur, easing: 'cubic-bezier(0.15,0.8,0.4,1)' });
            }
            (function(el){ setTimeout(function(){ if (el && el.parentNode) el.parentNode.removeChild(el); }, dur); })(s);
          } catch(e){}
        }
      }

      function move(x, y){
        wand.style.setProperty('transform', 'translate(' + (x - 8) + 'px,' + (y - 8) + 'px)', 'important');
        lastX = x; lastY = y;
        var now = Date.now();
        if (now - lastMove > 22) { lastMove = now; emit(x, y, 3, false); }
      }

      document.addEventListener('mousemove', function(e){ move(e.clientX, e.clientY); }, {passive: true});
      document.addEventListener('mousedown', function(){
        wand.style.setProperty('transform', 'translate(' + (lastX - 8) + 'px,' + (lastY - 8) + 'px) scale(1.25)', 'important');
        emit(lastX, lastY, 50, true);
      });
      document.addEventListener('mouseup', function(){
        wand.style.setProperty('transform', 'translate(' + (lastX - 8) + 'px,' + (lastY - 8) + 'px)', 'important');
      });
      setInterval(function(){
        if (lastX < 0 || wand.style.opacity === '0') return;
        emit(lastX, lastY, 2, false);
      }, 80);
      document.addEventListener('mouseleave', function(){ wand.style.opacity = '0'; });
      document.addEventListener('mouseenter', function(){ wand.style.opacity = '1'; });
      document.addEventListener('mouseover', function(e){
        var t = e.target;
        while (t && t !== document.body) {
          var n = t.tagName;
          if (n === 'INPUT' || n === 'TEXTAREA' || t.isContentEditable) { wand.style.opacity = '0'; return; }
          t = t.parentNode;
        }
        wand.style.opacity = '1';
      }, {passive: true});
      L('fully init');
    } catch(e) {
      W('INIT FAILED:', e);
      window.__lastWandError = String(e);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
