/* v1.10.41: dropdown работает на touch + fixed position (не обрезается overflow) */
(function(){
  'use strict';
  var openDD = null;

  function closeAll() {
    if (openDD) {
      openDD.classList.remove('open');
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

  function positionMenu(dd) {
    var btn = dd.querySelector(':scope > .btn, :scope > button');
    var menu = dd.querySelector('.dropdown-menu');
    if (!btn || !menu) return;
    var r = btn.getBoundingClientRect();
    var mw = Math.min(300, window.innerWidth - 24);
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

  document.addEventListener('click', function(e){
    var toggleBtn = e.target.closest('.dropdown > .btn, .dropdown > button');
    if (toggleBtn) {
      var dd = toggleBtn.closest('.dropdown');
      if (openDD === dd) {
        closeAll();
      } else {
        openDD_(dd);
      }
      return;
    }
    if (e.target.closest('.dropdown-menu')) {
      // клик по пункту меню — даём обработчику сработать, затем закрываем
      setTimeout(closeAll, 100);
      return;
    }
    closeAll();
  });

  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') closeAll();
  });

  window.addEventListener('resize', function(){
    if (openDD) positionMenu(openDD);
  });
  window.addEventListener('scroll', function(){
    if (openDD) positionMenu(openDD);
  }, true);
})();
