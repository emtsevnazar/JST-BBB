/* v1.10.66: dropdown — стабильное открытие без сдвига controls
   + flip above если снизу мало места
   + max-height с overflow scroll */
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
    var vh = window.innerHeight;
    var vw = window.innerWidth;
    var mw = Math.min(320, vw - 24);
    var ml = Math.max(8, Math.min(r.left, vw - mw - 8));
    var offset = 4;

    // Сбросить
    menu.style.setProperty('position', 'fixed', 'important');
    menu.style.setProperty('left', ml + 'px', 'important');
    menu.style.setProperty('right', 'auto', 'important');
    menu.style.setProperty('z-index', '99999', 'important');
    menu.style.setProperty('max-width', mw + 'px', 'important');
    menu.style.setProperty('max-height', (vh - 40) + 'px', 'important');
    menu.style.setProperty('overflow-y', 'auto', 'important');
    menu.style.setProperty('overflow-x', 'hidden', 'important');

    // Временно показываем, чтобы измерить высоту
    var prevDisplay = menu.style.display;
    menu.style.setProperty('visibility', 'hidden', 'important');
    menu.style.setProperty('display', 'block', 'important');
    var menuH = menu.offsetHeight;
    menu.style.setProperty('display', prevDisplay || 'block', 'important');
    menu.style.setProperty('visibility', 'visible', 'important');

    var spaceBelow = vh - r.bottom - offset;
    var spaceAbove = r.top - offset;

    if (spaceBelow >= menuH || spaceBelow >= spaceAbove) {
      // Открываем снизу
      menu.style.setProperty('top', (r.bottom + offset) + 'px', 'important');
      menu.style.setProperty('bottom', 'auto', 'important');
    } else {
      // Открываем сверху
      menu.style.setProperty('bottom', (vh - r.top + offset) + 'px', 'important');
      menu.style.setProperty('top', 'auto', 'important');
    }
  }

  function resetMenu(dd) {
    var menu = dd.querySelector('.dropdown-menu');
    if (!menu) return;
    menu.style.removeProperty('position');
    menu.style.removeProperty('top');
    menu.style.removeProperty('bottom');
    menu.style.removeProperty('left');
    menu.style.removeProperty('right');
    menu.style.removeProperty('max-width');
    menu.style.removeProperty('max-height');
    menu.style.removeProperty('overflow-y');
    menu.style.removeProperty('overflow-x');
    menu.style.removeProperty('z-index');
    menu.style.removeProperty('visibility');
    menu.style.removeProperty('display');
  }

  // Capture click
  document.addEventListener('click', function (e) {
    var dd = e.target.closest('.controls .dropdown, .toolbar .dropdown');
    if (!dd) return;
    var btn = getBtn(dd);
    if (!btn || !btn.contains(e.target)) return;

    var ctl = dd.closest('.controls');
    var sl = ctl ? ctl.scrollLeft : 0;
    var sy = window.pageYOffset;
    var sx = window.pageXOffset;

    positionMenu(dd);

    var restore = function () {
      if (ctl) ctl.scrollLeft = sl;
      if (window.pageYOffset !== sy || window.pageXOffset !== sx) {
        window.scrollTo({ top: sy, left: sx, behavior: 'instant' });
      }
    };
    restore();
    requestAnimationFrame(restore);
    setTimeout(restore, 0);
    setTimeout(restore, 50);
    setTimeout(restore, 150);
  }, true);

  // focusin — не даём скроллу дёрнуться
  document.addEventListener('focusin', function (e) {
    if (!e.target.closest) return;
    if (e.target.closest('.dropdown-menu')) {
      var ctl = e.target.closest('.controls');
      if (ctl) {
        var sl = ctl.scrollLeft;
        var sy = window.pageYOffset;
        requestAnimationFrame(function () {
          ctl.scrollLeft = sl;
          if (window.pageYOffset !== sy) {
            window.scrollTo({ top: sy, behavior: 'instant' });
          }
        });
      }
    }
  }, true);

  // MutationObserver — на .open пересчитать
  var obs = new MutationObserver(function (muts) {
    for (var i = 0; i < muts.length; i++) {
      var el = muts[i].target;
      if (el.classList && el.classList.contains('dropdown')) {
        if (el.classList.contains('open') || el.classList.contains('active')) {
          positionMenu(el);
        } else {
          resetMenu(el);
        }
      }
    }
  });

  function initObs() {
    document.querySelectorAll('.controls .dropdown, .toolbar .dropdown').forEach(function (dd) {
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
  setTimeout(initObs, 2000);

  // Пересчёт при resize/scroll
  window.addEventListener('resize', function () {
    document.querySelectorAll('.dropdown.open, .dropdown.active').forEach(positionMenu);
  });
  window.addEventListener('scroll', function () {
    document.querySelectorAll('.dropdown.open, .dropdown.active').forEach(positionMenu);
  }, true);
})();
