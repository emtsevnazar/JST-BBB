/* v1.10.67: splitter для sidebar/workspace (только ≤900px) */
(function () {
  'use strict';

  var STORAGE_KEY = 'jst_sidebar_h';
  var MIN_PCT = 20;
  var MAX_PCT = 75;
  var DEFAULT_PCT = 40;

  function getMain() {
    return document.querySelector('.main');
  }

  function getSidebar() {
    return document.querySelector('.main > .sidebar');
  }

  function getWorkspace() {
    return document.querySelector('.main > .workspace');
  }

  function getOrCreateSplitter() {
    var main = getMain();
    if (!main) return null;
    var sidebar = getSidebar();
    if (!sidebar) return null;

    var existing = main.querySelector(':scope > .splitter');
    if (existing) return existing;

    var splitter = document.createElement('div');
    splitter.className = 'splitter';
    splitter.setAttribute('role', 'separator');
    splitter.setAttribute('aria-orientation', 'horizontal');
    splitter.setAttribute('aria-label', 'Resize sidebar and workspace');
    splitter.setAttribute('tabindex', '0');

    // Вставить после sidebar
    if (sidebar.nextSibling) {
      main.insertBefore(splitter, sidebar.nextSibling);
    } else {
      main.appendChild(splitter);
    }
    return splitter;
  }

  function applyHeight(pct) {
    var main = getMain();
    if (!main) return;
    pct = Math.max(MIN_PCT, Math.min(MAX_PCT, pct));
    main.style.setProperty('--sidebar-h', pct + '%', 'important');
    try {
      localStorage.setItem(STORAGE_KEY, String(pct));
    } catch (e) {}
  }

  function restoreHeight() {
    var main = getMain();
    if (!main) return;
    var stored = null;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    var pct = stored !== null ? parseFloat(stored) : DEFAULT_PCT;
    if (isNaN(pct)) pct = DEFAULT_PCT;
    applyHeight(pct);
  }

  function attachDrag(splitter) {
    var main = getMain();
    if (!main || !splitter || splitter.dataset.dragAttached) return;
    splitter.dataset.dragAttached = '1';

    var startY = 0;
    var startPct = DEFAULT_PCT;
    var mainH = 0;
    var dragging = false;

    function getMainRect() {
      return main.getBoundingClientRect();
    }

    function getCurrentPct() {
      var sidebar = getSidebar();
      if (!sidebar) return DEFAULT_PCT;
      var mainH = getMainRect().height;
      if (mainH <= 0) return DEFAULT_PCT;
      var sidebarH = sidebar.getBoundingClientRect().height;
      return (sidebarH / mainH) * 100;
    }

    function onDown(e) {
      if (window.innerWidth > 900) return;
      dragging = true;
      startY = (e.touches ? e.touches[0].clientY : e.clientY);
      startPct = getCurrentPct();
      mainH = getMainRect().height;
      splitter.classList.add('dragging');
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();

      document.addEventListener('pointermove', onMove, { passive: false });
      document.addEventListener('pointerup', onUp);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onUp);
    }

    function onMove(e) {
      if (!dragging) return;
      var clientY = (e.touches ? e.touches[0].clientY : e.clientY);
      var deltaY = clientY - startY;
      var deltaPct = (deltaY / mainH) * 100;
      var newPct = startPct + deltaPct;
      // Ползунок ВНИЗ (deltaY > 0) → sidebar больше → pct больше
      // Ползунок ВВЕРХ (deltaY < 0) → sidebar меньше → pct меньше
      applyHeight(newPct);
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
    }

    function onUp() {
      if (!dragging) return;
      dragging = false;
      splitter.classList.remove('dragging');
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
    }

    splitter.addEventListener('pointerdown', onDown);
    splitter.addEventListener('touchstart', onDown, { passive: false });

    // Клавиатура: стрелки вверх/вниз
    splitter.addEventListener('keydown', function (e) {
      if (window.innerWidth > 900) return;
      var cur = getCurrentPct();
      if (e.key === 'ArrowDown') {
        applyHeight(cur + 5);
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        applyHeight(cur - 5);
        e.preventDefault();
      }
    });
  }

  function init() {
    var splitter = getOrCreateSplitter();
    if (!splitter) return;
    attachDrag(splitter);
    restoreHeight();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  // Повторная инициализация если .main перерисовали
  setTimeout(init, 500);
  setTimeout(init, 2000);

  // При переходе на мобилку — применить сохранённое
  window.addEventListener('resize', function () {
    if (window.innerWidth <= 900) {
      restoreHeight();
    }
  });
})();
