/* v1.10.63: dropdown в .controls → position: fixed по клику
   (не обрезается overflow, не ломает layout) */
(function () {
  'use strict';

  function positionMenu(dd) {
    if (!dd) return;
    var btn = null;
    for (var i = 0; i < dd.children.length; i++) {
      if (dd.children[i].tagName === 'BUTTON') { btn = dd.children[i]; break; }
    }
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

  function resetMenu(dd) {
    if (!dd) return;
    var menu = dd.querySelector('.dropdown-menu');
    if (!menu) return;
    menu.style.removeProperty('position');
    menu.style.removeProperty('top');
    menu.style.removeProperty('left');
    menu.style.removeProperty('right');
    menu.style.removeProperty('bottom');
    menu.style.removeProperty('z-index');
    menu.style.removeProperty('max-width');
  }

  // CAPTURE phase — срабатывает ДО app.js (bubble)
  document.addEventListener('click', function (e) {
    var dd = e.target.closest('.controls .dropdown');
    if (!dd) return;
    var btn = null;
    for (var i = 0; i < dd.children.length; i++) {
      if (dd.children[i].tagName === 'BUTTON') { btn = dd.children[i]; break; }
    }
    if (!btn || !btn.contains(e.target)) return;
    // Позиционируем ДО того как app.js добавит .open
    positionMenu(dd);
  }, true);

  // При скролле пока dropdown открыт — пересчитать
  window.addEventListener('scroll', function () {
    var opens = document.querySelectorAll('.controls .dropdown.open, .controls .dropdown.active');
    for (var i = 0; i < opens.length; i++) {
      positionMenu(opens[i]);
    }
  }, true);

  // При resize — тоже
  window.addEventListener('resize', function () {
    var opens = document.querySelectorAll('.controls .dropdown.open, .controls .dropdown.active');
    for (var i = 0; i < opens.length; i++) {
      positionMenu(opens[i]);
    }
  });

  // MutationObserver — если app.js открыл кодом (не кликом) — тоже позиционируем
  var obs = new MutationObserver(function (muts) {
    muts.forEach(function (m) {
      var el = m.target;
      if (!el.classList || !el.classList.contains('dropdown')) return;
      if (el.classList.contains('open') || el.classList.contains('active')) {
        positionMenu(el);
      }
    });
  });

  function init() {
    document.querySelectorAll('.controls .dropdown').forEach(function (dd) {
      if (!dd.dataset.obs) {
        dd.dataset.obs = '1';
        obs.observe(dd, { attributes: true, attributeFilter: ['class'] });
      }
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  setTimeout(init, 500);
})();
