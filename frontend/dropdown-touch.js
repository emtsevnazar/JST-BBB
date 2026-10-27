/* v1.10.43: click-toggle для dropdown без closest('>') */
(function () {
  'use strict';
  var openDD = null;

  function closeAll() {
    if (openDD) {
      openDD.classList.remove('open', 'active');
      var menu = openDD.querySelector('.dropdown-menu');
      if (menu) {
        menu.style.position = '';
        menu.style.top = '';
        menu.style.left = '';
        menu.style.right = '';
        menu.style.zIndex = '';
      }
      openDD = null;
    }
  }

  function getToggle(dd) {
    var kids = dd.children;
    for (var i = 0; i < kids.length; i++) {
      var k = kids[i];
      if (k.tagName === 'BUTTON') return k;
      if (k.tagName === 'A' && k.classList.contains('btn')) return k;
    }
    return null;
  }

  function positionMenu(dd) {
    var btn = getToggle(dd);
    var menu = dd.querySelector('.dropdown-menu');
    if (!btn || !menu) return;
    var r = btn.getBoundingClientRect();
    var mw = Math.min(320, window.innerWidth - 24);
    var ml = Math.max(8, Math.min(r.left, window.innerWidth - mw - 8));
    menu.style.position = 'fixed';
    menu.style.top = (r.bottom + 4) + 'px';
    menu.style.left = ml + 'px';
    menu.style.right = 'auto';
    menu.style.maxWidth = mw + 'px';
    menu.style.zIndex = '9999';
  }

  function openDD_(dd) {
    closeAll();
    dd.classList.add('open');
    positionMenu(dd);
    openDD = dd;
  }

  document.addEventListener('click', function (e) {
    // 1. Клик по пункту меню — обработать, закрыть через 100ms
    if (e.target.closest('.dropdown-menu')) {
      setTimeout(closeAll, 100);
      return;
    }

    // 2. Клик на триггер (кнопку внутри .dropdown)
    var dd = e.target.closest('.dropdown');
    if (dd) {
      var btn = getToggle(dd);
      if (btn && (btn === e.target || btn.contains(e.target))) {
        if (openDD === dd) {
          closeAll();
        } else {
          openDD_(dd);
        }
        e.preventDefault();
        return;
      }
    }

    // 3. Клик вне — закрыть
    closeAll();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll();
  });

  window.addEventListener('resize', function () {
    if (openDD) positionMenu(openDD);
  });
  window.addEventListener('scroll', function () {
    if (openDD) positionMenu(openDD);
  }, true);
})();
