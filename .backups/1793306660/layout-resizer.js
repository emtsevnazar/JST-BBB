/* layout-resizer.js v39 — горизонтальный ресайзер между .sidebar и .workspace внутри .main */
(function () {
  'use strict';
  if (window.__jstResizerLoaded) return;
  window.__jstResizerLoaded = true;

  var MIN_VIEWPORT = 900;
  var MIN_SIDEBAR = 180;
  var MIN_WORKSPACE = 400;
  var STORAGE_KEY = 'jst-sidebar-width';

  function init() {
    var main = document.querySelector('.main');
    if (!main) return;

    var sidebar = main.querySelector('.sidebar');
    var workspace = main.querySelector('.workspace');
    if (!sidebar) return;

    // Убедимся, что .main — relative
    var mcs = getComputedStyle(main);
    if (mcs.position === 'static') {
      main.style.position = 'relative';
    }

    // Удаляем старый ресайзер если был
    var old = document.querySelector('.jst-resizer');
    if (old) old.remove();

    var resizer = document.createElement('div');
    resizer.className = 'jst-resizer';
    resizer.setAttribute('role', 'separator');
    resizer.setAttribute('aria-orientation', 'vertical');
    resizer.setAttribute('aria-label', 'Изменить ширину панели');
    main.appendChild(resizer);

    var isResizing = false;
    var startX = 0;
    var startSidebarW = 0;

    function shouldShow() { return window.innerWidth >= MIN_VIEWPORT; }

    function position() {
      if (!shouldShow()) {
        resizer.style.display = 'none';
        return;
      }
      resizer.style.display = '';
      // Позиция — правый край sidebar относительно .main
      var sRect = sidebar.getBoundingClientRect();
      var mRect = main.getBoundingClientRect();
      var left = sRect.right - mRect.left;
      resizer.style.left = left + 'px';
      resizer.style.top = '0px';
      resizer.style.bottom = '0px';
      resizer.style.height = '';
    }

    function readSaved() {
      var v = null;
      try { v = localStorage.getItem(STORAGE_KEY); } catch (e) {}
      if (!v) return null;
      var n = parseFloat(v);
      return isFinite(n) && n > 0 ? n : null;
    }

    function applySidebarWidth(px) {
      var mainW = main.getBoundingClientRect().width;
      if (!isFinite(px)) return;
      if (px < MIN_SIDEBAR) px = MIN_SIDEBAR;
      if (mainW - px < MIN_WORKSPACE) px = mainW - MIN_WORKSPACE;
      sidebar.style.width = px + 'px';
      sidebar.style.flex = '0 0 ' + px + 'px';
      sidebar.style.minWidth = px + 'px';
      sidebar.style.maxWidth = px + 'px';
      try { localStorage.setItem(STORAGE_KEY, String(Math.round(px))); } catch (e) {}
      position();
    }

    var saved = readSaved();
    if (saved) applySidebarWidth(saved);

    function onDown(e) {
      if (e.button !== undefined && e.button !== 0) return;
      isResizing = true;
      resizer.classList.add('jst-resizing');
      startX = (e.touches ? e.touches[0].clientX : e.clientX);
      startSidebarW = sidebar.getBoundingClientRect().width;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      e.preventDefault();
    }

    function onMove(e) {
      if (!isResizing) return;
      var x = (e.touches ? e.touches[0].clientX : e.clientX);
      applySidebarWidth(startSidebarW + (x - startX));
      e.preventDefault();
    }

    function onUp() {
      if (!isResizing) return;
      isResizing = false;
      resizer.classList.remove('jst-resizing');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    resizer.addEventListener('mousedown', onDown);
    resizer.addEventListener('touchstart', onDown, { passive: false });
    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchend', onUp);
    document.addEventListener('touchcancel', onUp);

    window.addEventListener('resize', position);
    position();
    setTimeout(position, 100);
    setTimeout(position, 500);
    setTimeout(position, 1500);

    if (window.ResizeObserver) {
      try {
        new ResizeObserver(function () { if (!isResizing) position(); }).observe(sidebar);
        new ResizeObserver(function () { if (!isResizing) position(); }).observe(main);
      } catch (e) {}
    }

    new MutationObserver(position).observe(document.documentElement, {
      attributes: true, attributeFilter: ['data-theme']
    });

    window.__jstResizerDebug = function() {
      return {
        mainFound: !!main,
        sidebarFound: !!sidebar,
        workspaceFound: !!workspace,
        mainPos: getComputedStyle(main).position,
        mainDisplay: getComputedStyle(main).display,
        mainW: main.getBoundingClientRect().width,
        sidebarW: sidebar.getBoundingClientRect().width,
        resizerLeft: resizer.style.left,
        resizerDisplay: getComputedStyle(resizer).display,
        viewport: window.innerWidth
      };
    };
    try { console.log('[resizer] init', {main, sidebar, workspace}); } catch(e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
