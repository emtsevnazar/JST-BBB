/* v1.10.48: надёжный scroll для .controls через кнопки */
(function () {
  'use strict';

  function scrollControls(btn, dir) {
    var wrap = btn.closest('.controls-wrap');
    if (!wrap) return false;
    var ctl = wrap.querySelector('.controls');
    if (!ctl) return false;
    var step = Math.max(200, ctl.clientWidth * 0.7);
    ctl.scrollBy({ left: dir * step, behavior: 'smooth' });
    return true;
  }

  // Глобальная (для inline onclick)
  window.__jstControlsScroll = function (btn, dir) {
    scrollControls(btn, dir);
  };

  // Fallback: делегирование на click (на случай, если onclick не срабатывает)
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.controls-btn.controls-prev, .controls-btn.controls-next');
    if (!btn) return;
    e.preventDefault();
    var dir = btn.classList.contains('controls-prev') ? -1 : 1;
    scrollControls(btn, dir);
  }, false);
})();

/* v1.10.49: умное позиционирование dropdown (снизу по умолчанию, сверху если места нет) */
(function() {
  'use strict';

  function positionDropdown(dd) {
    var menu = dd.querySelector('.dropdown-menu');
    var btn = dd.querySelector('.btn');
    if (!menu || !btn) return;

    var br = btn.getBoundingClientRect();
    var menuH = menu.offsetHeight || 150;
    var menuW = menu.offsetWidth || 200;
    var vh = window.innerHeight;
    var vw = window.innerWidth;
    var spaceBelow = vh - br.bottom;
    var spaceAbove = br.top;

    // Сброс
    menu.style.position = 'fixed';
    menu.style.zIndex = '9999';
    menu.style.maxWidth = Math.min(320, vw - 24) + 'px';

    // По умолчанию снизу
    var useBelow = spaceBelow >= menuH + 12 || spaceBelow >= spaceAbove;

    if (useBelow) {
      menu.style.top = (br.bottom + 4) + 'px';
      menu.style.bottom = 'auto';
    } else {
      menu.style.top = (br.top - menuH - 4) + 'px';
      menu.style.bottom = 'auto';
    }

    // Горизонталь — не выходить за края
    var left = br.left;
    if (left + menuW > vw - 8) left = vw - menuW - 8;
    if (left < 8) left = 8;
    menu.style.left = left + 'px';
    menu.style.right = 'auto';
  }

  // Следим за .open классом (MutationObserver)
  var observer = new MutationObserver(function(muts) {
    muts.forEach(function(m) {
      if (m.target.classList.contains('dropdown')) {
        if (m.target.classList.contains('open')) {
          positionDropdown(m.target);
        }
      }
    });
  });

  function init() {
    document.querySelectorAll('.controls .dropdown, .toolbar .dropdown').forEach(function(dd) {
      observer.observe(dd, { attributes: true, attributeFilter: ['class'] });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(init, 100); });
  } else {
    setTimeout(init, 100);
  }
  window.addEventListener('resize', function() {
    document.querySelectorAll('.controls .dropdown.open').forEach(positionDropdown);
  });
  window.addEventListener('scroll', function() {
    document.querySelectorAll('.controls .dropdown.open').forEach(positionDropdown);
  }, true);
})();
