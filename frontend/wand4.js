/**
 * wand4.js — волшебная палочка с 7-конечной звездой.
 * День: тело+звезда синие, ночь: тело+звезда жёлтые.
 * Окантовка и свечение всегда жёлтые.
 */
(function() {
  'use strict';
  if (window.matchMedia && window.matchMedia('(hover: none)').matches) return;
  if (window.__jstWandV4) return;
  window.__jstWandV4 = true;

  var wand = document.createElement('div');
  wand.id = 'jst-wand-v4';
  wand.innerHTML =
    '<svg viewBox="0 0 44 44" class="jst-wand-svg">' +
      '<line x1="14" y1="14" x2="42" y2="42" stroke="rgba(0,0,0,0.5)" stroke-width="3.5" stroke-linecap="round"/>' +
      '<line x1="14" y1="14" x2="42" y2="42" class="jst-wand-outline" stroke="#F5B800" stroke-width="2.5" stroke-linecap="round"/>' +
      '<line x1="14" y1="14" x2="42" y2="42" class="jst-wand-body" stroke-width="1.2" stroke-linecap="round"/>' +
      '<path class="jst-wand-star" d="M 10.00 3.50 L 11.39 7.12 L 15.08 5.95 L 13.12 9.29 L 16.34 11.45 L 12.50 12.00 L 12.82 15.86 L 10.00 13.20 L 7.18 15.86 L 7.50 12.00 L 3.66 11.45 L 6.88 9.29 L 4.92 5.95 L 8.61 7.12 Z" stroke="#F5B800" stroke-width="1.2" stroke-linejoin="round"/>' +
    '</svg>' +
    '<div class="jst-sparks-v4"></div>';
  document.body.appendChild(wand);
  document.body.classList.add('jst-wand-active');

  var sparkLayer = wand.querySelector('.jst-sparks-v4');
  var lastX = -200, lastY = -200, lastEmit = 0;

  function emit(cx, cy, count, burst) {
    for (var i = 0; i < count; i++) {
      var s = document.createElement('span');
      s.className = 'jst-spark-v4' + (burst ? ' jst-spark-burst-v4' : '');
      var a = Math.random() * Math.PI * 2;
      var d = burst ? (25 + Math.random() * 70) : (10 + Math.random() * 35);
      s.style.setProperty('--dx', (Math.cos(a) * d) + 'px');
      s.style.setProperty('--dy', (Math.sin(a) * d) + 'px');
      var sz = burst ? (4 + Math.random() * 6) : (2 + Math.random() * 3);
      s.style.width = sz + 'px';
      s.style.height = sz + 'px';
      if (Math.random() > 0.55) s.classList.add('jst-spark-blue-v4');
      sparkLayer.appendChild(s);
      (function(el, ttl) {
        setTimeout(function(){ if (el.parentNode) el.parentNode.removeChild(el); }, ttl);
      })(s, burst ? 1300 : 850);
    }
  }

  function move(x, y) {
    wand.style.setProperty('--x', (x - 10) + 'px');
    wand.style.setProperty('--y', (y - 10) + 'px');
    lastX = x; lastY = y;
    var now = Date.now();
    if (now - lastEmit > 22) {
      lastEmit = now;
      emit(x, y, 3, false);
    }
  }

  document.addEventListener('mousemove', function(e){ move(e.clientX, e.clientY); }, {passive:true});

  document.addEventListener('mousedown', function() {
    wand.classList.add('jst-wand-pressed');
    emit(lastX, lastY, 50, true);
  });
  document.addEventListener('mouseup', function() {
    wand.classList.remove('jst-wand-pressed');
  });

  setInterval(function() {
    if (lastX < 0) return;
    if (wand.style.opacity === '0') return;
    emit(lastX, lastY, 2, false);
  }, 80);

  document.documentElement.addEventListener('mouseleave', function(){ wand.style.opacity = '0'; });
  document.documentElement.addEventListener('mouseenter', function(){ wand.style.opacity = '1'; });

  document.addEventListener('mouseover', function(e) {
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
  }, {passive:true});

  wand.style.setProperty('--x', '-200px');
  wand.style.setProperty('--y', '-200px');
})();
