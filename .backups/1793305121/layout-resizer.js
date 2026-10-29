/* layout-resizer.js — прозрачный бриллиантовый разделитель sidebar/workspace */
(function () {
  'use strict';
  if (window.__jstResizerLoaded) return;
  window.__jstResizerLoaded = true;

  var MIN_VIEWPORT = 900;
  var MIN_SIDEBAR = 180;
  var MIN_WORKSPACE = 400;
  var STORAGE_KEY = 'jst-sidebar-width';

  function init() {
    var sidebar = document.querySelector('.sidebar');
    var workspace = document.querySelector('.workspace');
    if (!sidebar || !workspace) {
      // Попробуем найти workspace по main
      workspace = document.querySelector('.main .workspace') || document.querySelector('main.workspace');
    }
    if (!sidebar || !workspace) return;

    var parent = sidebar.parentElement;
    if (!parent) return;

    var resizer = document.createElement('div');
    resizer.className = 'jst-resizer';
    resizer.setAttribute('role', 'separator');
    resizer.setAttribute('aria-orientation', 'vertical');
    resizer.setAttribute('aria-label', 'Изменить ширину панели');
    resizer.setAttribute('tabindex', '-1');
    parent.appendChild(resizer);

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
      var sRect = sidebar.getBoundingClientRect();
      resizer.style.left = (sRect.right + (sRect.width ? 0 : 0)) + 'px';
      resizer.style.top = '0px';
      resizer.style.height = '100vh';
    }

    function readSaved() {
      var v = null;
      try { v = localStorage.getItem(STORAGE_KEY); } catch (e) {}
      if (!v) return null;
      var n = parseFloat(v);
      return isFinite(n) && n > 0 ? n : null;
    }

    function applySidebarWidth(px) {
      var totalW = parent.getBoundingClientRect().width;
      if (!isFinite(px)) return;
      if (px < MIN_SIDEBAR) px = MIN_SIDEBAR;
      if (totalW - px < MIN_WORKSPACE) px = totalW - MIN_WORKSPACE;
      sidebar.style.width = px + 'px';
      sidebar.style.flex = '0 0 ' + px + 'px';
      sidebar.style.minWidth = px + 'px';
      sidebar.style.maxWidth = px + 'px';
      try { localStorage.setItem(STORAGE_KEY, String(Math.round(px))); } catch (e) {}
      document.documentElement.style.setProperty('--jst-sidebar-w', px + 'px');
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
      } catch (e) {}
    }

    // Обновление при переключении темы
    new MutationObserver(position).observe(document.documentElement, {
      attributes: true, attributeFilter: ['data-theme']
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
