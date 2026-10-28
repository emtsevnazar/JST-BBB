/**
 * wand-cursor.js — волшебная палочка (gold→navy→gold) с активной эмиссией искр.
 */
(function() {
  'use strict';
  if (window.matchMedia && window.matchMedia('(hover: none)').matches) return;
  if (window.__jstWandInit) return;
  window.__jstWandInit = true;

  var wand = document.createElement('div');
  wand.id = 'jst-wand';
  wand.setAttribute('aria-hidden', 'true');
  wand.innerHTML =
    '<svg viewBox="0 0 64 64" class="jst-wand-svg" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
        '<linearGradient id="jst-wand-grad" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">' +
          '<stop offset="0%" stop-color="#F5B800"/>' +
          '<stop offset="35%" stop-color="#F5B800"/>' +
          '<stop offset="50%" stop-color="#1a2a5e"/>' +
          '<stop offset="65%" stop-color="#F5B800"/>' +
          '<stop offset="100%" stop-color="#F5B800"/>' +
        '</linearGradient>' +
        '<radialGradient id="jst-star-grad">' +
          '<stop offset="0%" stop-color="#F5B800"/>' +
          '<stop offset="60%" stop-color="#1a2a5e"/>' +
          '<stop offset="100%" stop-color="#F5B800"/>' +
        '</radialGradient>' +
      '</defs>' +
      '<line x1="10" y1="10" x2="56" y2="56" stroke="rgba(0,0,0,0.45)" stroke-width="4.5" stroke-linecap="round"/>' +
      '<line x1="10" y1="10" x2="56" y2="56" stroke="url(#jst-wand-grad)" stroke-width="2" stroke-linecap="round"/>' +
      '<path class="jst-wand-star" d="M10 2 L11.6 8.4 L18 10 L11.6 11.6 L10 18 L8.4 11.6 L2 10 L8.4 8.4 Z" fill="url(#jst-star-grad)" stroke="#F5B800" stroke-width="0.7"/>' +
    '</svg>' +
    '<div class="jst-sparks-layer"></div>';
  document.body.appendChild(wand);
  document.body.classList.add('jst-wand-active');

  var sparks = wand.querySelector('.jst-sparks-layer');
  var lastX = -200, lastY = -200, lastEmit = 0;

  function move(x, y) {
    wand.style.setProperty('--jst-x', x + 'px');
    wand.style.setProperty('--jst-y', y + 'px');
    lastX = x; lastY = y;
    var now = Date.now();
    if (now - lastEmit > 25) {
      lastEmit = now;
      emit(2, x, y, false);
    }
  }

  function emit(count, cx, cy, burst) {
    for (var i = 0; i < count; i++) {
      var s = document.createElement('span');
      s.className = 'jst-spark' + (burst ? ' jst-spark-burst' : '');
      var angle = Math.random() * Math.PI * 2;
      var dist = burst ? (25 + Math.random() * 65) : (10 + Math.random() * 38);
      s.style.setProperty('--jst-dx', (Math.cos(angle) * dist) + 'px');
      s.style.setProperty('--jst-dy', (Math.sin(angle) * dist) + 'px');
      var size = burst ? (4 + Math.random() * 6) : (2.5 + Math.random() * 3.5);
      s.style.width = size + 'px';
      s.style.height = size + 'px';
      if (Math.random() > 0.5) s.classList.add('jst-spark-blue');
      sparks.appendChild(s);
      (function(el, ttl) {
        setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, ttl);
      })(s, burst ? 1200 : 900);
    }
  }

  // Idle: искры капают даже когда мышь стоит
  setInterval(function() {
    if (lastX < 0) return;
    if (wand.classList.contains('jst-wand-over-input')) return;
    if (wand.style.opacity === '0') return;
    emit(1, lastX, lastY, false);
  }, 110);

  document.addEventListener('mousemove', function(e) {
    move(e.clientX, e.clientY);
  }, { passive: true });

  document.addEventListener('mousedown', function() {
    wand.classList.add('jst-wand-pressed');
    emit(40, lastX, lastY, true);
  });
  document.addEventListener('mouseup', function() {
    wand.classList.remove('jst-wand-pressed');
  });

  document.documentElement.addEventListener('mouseleave', function() {
    wand.style.opacity = '0';
  });
  document.documentElement.addEventListener('mouseenter', function() {
    wand.style.opacity = '1';
  });

  document.addEventListener('mouseover', function(e) {
    var t = e.target;
    while (t && t !== document.body) {
      var tn = t.tagName;
      if (tn === 'INPUT' || tn === 'TEXTAREA' || t.isContentEditable) {
        wand.classList.add('jst-wand-over-input');
        return;
      }
      t = t.parentNode;
    }
    wand.classList.remove('jst-wand-over-input');
  }, { passive: true });

  wand.style.setProperty('--jst-x', '-200px');
  wand.style.setProperty('--jst-y', '-200px');
})();
