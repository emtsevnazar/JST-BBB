(function(){
  'use strict';
  if (window.matchMedia && window.matchMedia('(hover: none)').matches) return;
  if (window.__jstWandV7) return;
  window.__jstWandV7 = true;

  var wand = document.createElement('div');
  wand.id = 'jst-wand';
  wand.setAttribute('aria-hidden', 'true');
  wand.innerHTML =
    '<svg viewBox="0 0 32 32" class="jst-wand-svg">' +
      '<line x1="10" y1="10" x2="30" y2="30" stroke="rgba(0,0,0,0.5)" stroke-width="2.8" stroke-linecap="round"/>' +
      '<line x1="10" y1="10" x2="30" y2="30" class="jst-wand-outline" stroke="#F5B800" stroke-width="2" stroke-linecap="round"/>' +
      '<line x1="10" y1="10" x2="30" y2="30" class="jst-wand-body" stroke-width="1" stroke-linecap="round"/>' +
      '<path class="jst-wand-star" d="M 8.00 3.00 L 9.00 5.93 L 11.91 4.88 L 10.24 7.49 L 12.87 9.11 L 9.80 9.43 L 10.17 12.50 L 8.00 10.30 L 5.83 12.50 L 6.20 9.43 L 3.13 9.11 L 5.76 7.49 L 4.09 4.88 L 7.00 5.93 Z" stroke="#F5B800" stroke-width="0.9" stroke-linejoin="round"/>' +
    '</svg>' +
    '<div class="jst-wand-sparks"></div>';
  document.body.appendChild(wand);
  document.body.classList.add('jst-wand-active');

  var sparks = wand.querySelector('.jst-wand-sparks');
  var lastX = -300, lastY = -300, lastMove = 0;

  function emit(cx, cy, count, burst) {
    for (var i = 0; i < count; i++) {
      var s = document.createElement('span');
      s.className = 'jst-wand-spark' + (burst ? ' jst-wand-spark-burst' : '');
      var a = Math.random() * Math.PI * 2;
      var d = burst ? (22 + Math.random() * 55) : (8 + Math.random() * 28);
      s.style.setProperty('--dx', (Math.cos(a) * d) + 'px');
      s.style.setProperty('--dy', (Math.sin(a) * d) + 'px');
      var sz = burst ? (3 + Math.random() * 5) : (1.8 + Math.random() * 2.5);
      s.style.width = sz + 'px';
      s.style.height = sz + 'px';
      if (Math.random() > 0.55) s.classList.add('jst-wand-spark-blue');
      sparks.appendChild(s);
      (function(el, ttl) {
        setTimeout(function(){ if (el.parentNode) el.parentNode.removeChild(el); }, ttl);
      })(s, burst ? 1200 : 800);
    }
  }

  function move(x, y) {
    wand.style.setProperty('--x', (x - 8) + 'px');
    wand.style.setProperty('--y', (y - 8) + 'px');
    lastX = x; lastY = y;
    var now = Date.now();
    if (now - lastMove > 22) {
      lastMove = now;
      emit(x, y, 3, false);
    }
  }

  document.addEventListener('mousemove', function(e){ move(e.clientX, e.clientY); }, {passive: true});
  document.addEventListener('mousedown', function(){
    wand.classList.add('jst-wand-pressed');
    emit(lastX, lastY, 50, true);
  });
  document.addEventListener('mouseup', function(){
    wand.classList.remove('jst-wand-pressed');
  });

  setInterval(function(){
    if (lastX < 0) return;
    if (wand.style.opacity === '0') return;
    emit(lastX, lastY, 2, false);
  }, 80);

  document.documentElement.addEventListener('mouseleave', function(){ wand.style.opacity = '0'; });
  document.documentElement.addEventListener('mouseenter', function(){ wand.style.opacity = '1'; });

  document.addEventListener('mouseover', function(e){
    var t = e.target;
    while (t && t !== document.body) {
      var n = t.tagName;
      if (n === 'INPUT' || n === 'TEXTAREA' || t.isContentEditable) {
        wand.style.opacity = '0';
        return;
      }
      t = t.parentNode;
    }
    wand.style.opacity = '1';
  }, {passive: true});

  wand.style.setProperty('--x', '-300px');
  wand.style.setProperty('--y', '-300px');
})();
