/* layout-resizer.js v56 — горизонтальный splitter-h, sidebar 25%-75% */
(function () {
  'use strict';
  if (window.__jstResizerV56) return;
  window.__jstResizerV56 = true;

  const MIN_VIEW = 901;
  const MIN_PCT = 0.25;
  const MAX_PCT = 0.75;
  const KEY = 'jst-sidebar-w';

  function init() {
    const main = document.querySelector('.main');
    if (!main) return;
    const sidebar = main.querySelector('.sidebar');
    const workspace = main.querySelector('.workspace');
    if (!sidebar) return;

    if (getComputedStyle(main).position === 'static') {
      main.style.position = 'relative';
    }

    const old = main.querySelector('.splitter-h');
    if (old) old.remove();

    const rz = document.createElement('div');
    rz.className = 'splitter-h';
    rz.setAttribute('role', 'separator');
    rz.setAttribute('aria-orientation', 'vertical');
    rz.setAttribute('aria-label', 'Изменить ширину панели');
    rz.setAttribute('tabindex', '0');
    main.appendChild(rz);

    function applyW(w) {
      const total = main.getBoundingClientRect().width;
      if (!isFinite(w)) return;
      const minW = total * MIN_PCT;
      const maxW = total * MAX_PCT;
      if (w < minW) w = minW;
      if (w > maxW) w = maxW;
      main.style.setProperty('--jst-sidebar-w', `${w  }px`);
      try { localStorage.setItem(KEY, String(Math.round(w))); } catch (e) {}
    }

    let saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    if (saved) applyW(parseFloat(saved));

    let drag = false;
    let x0 = 0;
    let w0 = 0;

    function down(e) {
      if (e.button !== undefined && e.button !== 0) return;
      drag = true;
      rz.classList.add('dragging');
      x0 = e.touches ? e.touches[0].clientX : e.clientX;
      w0 = sidebar.getBoundingClientRect().width;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      e.preventDefault();
    }
    function move(e) {
      if (!drag) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      applyW(w0 + (x - x0));
      e.preventDefault();
    }
    function up() {
      if (!drag) return;
      drag = false;
      rz.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    rz.addEventListener('mousedown', down);
    rz.addEventListener('touchstart', down, { passive: false });
    document.addEventListener('mousemove', move);
    document.addEventListener('touchmove', move, { passive: false });
    document.addEventListener('mouseup', up);
    document.addEventListener('touchend', up);
    document.addEventListener('touchcancel', up);

    window.__jstResizerDebug = function () {
      return {
        main: !!main,
        sidebar: !!sidebar,
        workspace: !!workspace,
        rz: !!rz,
        mainDisplay: getComputedStyle(main).display,
        mainGridCols: getComputedStyle(main).gridTemplateColumns,
        sidebarW: sidebar.getBoundingClientRect().width,
        rzWidth: rz.getBoundingClientRect().width,
        viewport: window.innerWidth
      };
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
