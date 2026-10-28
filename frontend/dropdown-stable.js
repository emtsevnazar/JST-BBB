/* v1.10.67: dropdown — flip above/below + max-height по доступному месту
   + сохранение scrollLeft (нет сдвига controls) */
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
    var GAP = 4;
    var EDGE = 8;

    // Горизонтальное положение
    var mw = Math.min(360, vw - 2 * EDGE);
    var ml = Math.max(EDGE, Math.min(r.left, vw - mw - EDGE));

    // Сначала выставим горизонталь + базовые стили
    menu.style.setProperty('position', 'fixed', 'important');
    menu.style.setProperty('left', ml + 'px', 'important');
    menu.style.setProperty('right', 'auto', 'important');
    menu.style.setProperty('width', 'auto', 'important');
    menu.style.setProperty('min-width', Math.min(220, vw - 2 * EDGE) + 'px', 'important');
    menu.style.setProperty('max-width', mw + 'px', 'important');
    menu.style.setProperty('z-index', '99999', 'important');
    menu.style.setProperty('overflow-y', 'auto', 'important');
    menu.style.setProperty('overflow-x', 'hidden', 'important');
    menu.style.setProperty('-webkit-overflow-scrolling', 'touch', 'important');

    // Измеряем высоту (temporarily display block)
    menu.style.setProperty('display', 'block', 'important');
    menu.style.setProperty('visibility', 'hidden', 'important');
    var naturalH = menu.scrollHeight;

    // Доступное место
    var spaceBelow = vh - r.bottom - GAP - EDGE;
    var spaceAbove = r.top - GAP - EDGE;

    var fitsBelow = naturalH <= spaceBelow;
    var fitsAbove = naturalH <= spaceAbove;

    var useBelow;
    var finalH;

    if (fitsBelow) {
      useBelow = true;
      finalH = naturalH;
    } else if (fitsAbove) {
      useBelow = false;
      finalH = naturalH;
    } else {
      // Не влезает целиком — выбираем сторону с большим местом
      if (spaceBelow >= spaceAbove) {
        useBelow = true;
        finalH = spaceBelow;
      } else {
        useBelow = false;
        finalH = spaceAbove;
      }
    }

    // Применяем max-height = finalH (не меньше 100)
    finalH = Math.max(100, finalH);
    menu.style.setProperty('max-height', finalH + 'px', 'important');

    if (useBelow) {
      menu.style.setProperty('top', (r.bottom + GAP) + 'px', 'important');
      menu.style.setProperty('bottom', 'auto', 'important');
    } else {
      menu.style.setProperty('bottom', (vh - r.top + GAP) + 'px', 'important');
      menu.style.setProperty('top', 'auto', 'important');
    }

    menu.style.setProperty('visibility', 'visible', 'important');
  }

  function resetMenu(dd) {
    var menu = dd.querySelector('.dropdown-menu');
    if (!menu) return;
    ['position', 'top', 'bottom', 'left', 'right',
     'width', 'min-width', 'max-width', 'max-height',
     'overflow-y', 'overflow-x', '-webkit-overflow-scrolling',
     'z-index', 'visibility', 'display'
    ].forEach(function (p) {
      menu.style.removeProperty(p);
    });
  }

  // Capture click на toggle
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
      if (ctl && ctl.scrollLeft !== sl) ctl.scrollLeft = sl;
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
          if (ctl.scrollLeft !== sl) ctl.scrollLeft = sl;
          if (window.pageYOffset !== sy) {
            window.scrollTo({ top: sy, behavior: 'instant' });
          }
        });
      }
    }
  }, true);

  // MutationObserver — при .open/.active
  var obs = new MutationObserver(function (muts) {
    for (var i = 0; i < muts.length; i++) {
      var el = muts[i].target;
      if (!el.classList || !el.classList.contains('dropdown')) continue;
      if (el.classList.contains('open') || el.classList.contains('active')) {
        positionMenu(el);
      } else {
        resetMenu(el);
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

  // resize/scroll — пересчёт
  window.addEventListener('resize', function () {
    document.querySelectorAll('.dropdown.open, .dropdown.active').forEach(positionMenu);
  });
  window.addEventListener('scroll', function () {
    document.querySelectorAll('.dropdown.open, .dropdown.active').forEach(positionMenu);
  }, true);
})();
