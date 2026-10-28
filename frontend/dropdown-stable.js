/* v1.10.64: dropdown НЕ сдвигает .controls buttons при открытии */
(function () {
  'use strict';

  function getBtn(dd) {
    for (var i = 0; i < dd.children.length; i++) {
      if (dd.children[i].tagName === 'BUTTON') return dd.children[i];
    }
    return null;
  }

  function positionMenu(dd) {
    var btn = getBtn(dd);
    var menu = dd.querySelector('.dropdown-menu');
    if (!btn || !menu) return;
    var r = btn.getBoundingClientRect();
    var mw = Math.min(320, window.innerWidth - 24);
    var ml = Math.max(8, Math.min(r.left, window.innerWidth - mw - 8));
    menu.style.setProperty('position', 'fixed', 'important');
    menu.style.setProperty('top', (r.bottom + 4) + 'px', 'important');
    menu.style.setProperty('left', ml + 'px', 'important');
    menu.style.setProperty('right', 'auto', 'important');
    menu.style.setProperty('bottom', 'auto', 'important');
    menu.style.setProperty('z-index', '99999', 'important');
    menu.style.setProperty('max-width', mw + 'px', 'important');
  }

  // Capture click — ДО app.js. Сохраняем scrollLeft/scrollTop и возвращаем.
  document.addEventListener('click', function (e) {
    var dd = e.target.closest('.controls .dropdown');
    if (!dd) return;
    var btn = getBtn(dd);
    if (!btn || !btn.contains(e.target)) return;

    var ctl = dd.closest('.controls');
    if (!ctl) return;
    var sl = ctl.scrollLeft;
    var sy = window.pageYOffset;
    var sx = window.pageXOffset;

    // Позиционируем ДО открытия
    positionMenu(dd);

    // Восстанавливаем scroll (2 раза — сразу + после layout)
    var restore = function () {
      ctl.scrollLeft = sl;
      window.scrollTo({ top: sy, left: sx, behavior: 'instant' });
    };
    restore();
    requestAnimationFrame(restore);
    setTimeout(restore, 0);
    setTimeout(restore, 50);
    setTimeout(restore, 150);
  }, true);

  // Prevent focus scroll на menu items
  document.addEventListener('focusin', function (e) {
    if (!e.target.closest) return;
    if (e.target.closest('.controls .dropdown-menu')) {
      var ctl = e.target.closest('.controls');
      if (ctl) {
        var sl = ctl.scrollLeft;
        var sy = window.pageYOffset;
        requestAnimationFrame(function () {
          ctl.scrollLeft = sl;
          window.scrollTo({ top: sy, behavior: 'instant' });
        });
      }
    }
  }, true);

  // MutationObserver — на class change тоже позиционируем
  var obs = new MutationObserver(function (muts) {
    for (var i = 0; i < muts.length; i++) {
      var el = muts[i].target;
      if (el.classList && el.classList.contains('dropdown') &&
          (el.classList.contains('open') || el.classList.contains('active'))) {
        positionMenu(el);
      }
    }
  });

  function initObs() {
    document.querySelectorAll('.controls .dropdown').forEach(function (dd) {
      if (dd.dataset.stb) return;
      dd.dataset.stb = '1';
      obs.observe(dd, { attributes: true, attributeFilter: ['class'] });
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initObs);
  } else {
    initObs();
  }
  setTimeout(initObs, 500);
})();
