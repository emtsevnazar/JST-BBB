/* layout-resizer.js v41 — horizontal splitter-h между sidebar и workspace */
(function () {
  'use strict';
  if (window.__jstResizerV41) return;
  window.__jstResizerV41 = true;

  var MIN_VIEW = 900;
  var MIN_SIDEBAR = 180;
  var MIN_WS = 400;
  var KEY = 'jst-sidebar-width';

  function init() {
    var main = document.querySelector('.main');
    if (!main) { try { console.warn('[resizer] .main not found'); } catch(e){} return; }

    var sidebar = main.querySelector('.sidebar');
    var workspace = main.querySelector('.workspace');
    if (!sidebar) { try { console.warn('[resizer] .sidebar not found'); } catch(e){} return; }
    if (!workspace) { try { console.warn('[resizer] .workspace not found'); } catch(e){} return; }

    if (getComputedStyle(main).position === 'static') {
      main.style.position = 'relative';
    }

    var old = document.querySelector('.jst-resizer, .splitter-h');
    if (old) old.remove();

    var rz = document.createElement('div');
    rz.className = 'splitter-h';
    rz.setAttribute('role', 'separator');
    rz.setAttribute('aria-orientation', 'vertical');
    rz.setAttribute('aria-label', 'Изменить ширину панели');
    rz.setAttribute('tabindex', '0');
    main.appendChild(rz);

    var drag = false;
    var x0 = 0;
    var w0 = 0;

    function show() {
      if (window.innerWidth < MIN_VIEW) {
        rz.style.display = 'none';
        return;
      }
      rz.style.display = '';
      var sR = sidebar.getBoundingClientRect();
      var mR = main.getBoundingClientRect();
      rz.style.left = (sR.right - mR.left) + 'px';
      rz.style.top = '0';
      rz.style.bottom = '0';
      rz.style.height = '';
    }

    function save(v) { try { localStorage.setItem(KEY, String(Math.round(v))); } catch(e) {} }
    function load() {
      try { var v = localStorage.getItem(KEY); return v ? parseFloat(v) : null; } catch(e) { return null; }
    }

    function applyW(px) {
      var total = main.getBoundingClientRect().width;
      if (!isFinite(px)) return;
      if (px < MIN_SIDEBAR) px = MIN_SIDEBAR;
      if (total - px < MIN_WS) px = total - MIN_WS;
      var d = getComputedStyle(main).display;
      if (d === 'grid') {
        main.style.gridTemplateColumns = px + 'px 1fr';
      } else {
        sidebar.style.width = px + 'px';
        sidebar.style.flex = '0 0 ' + px + 'px';
        sidebar.style.minWidth = px + 'px';
        sidebar.style.maxWidth = px + 'px';
      }
      save(px);
      show();
    }

    var saved = load();
    if (saved) applyW(saved);

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
      var x = e.touches ? e.touches[0].clientX : e.clientX;
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

    window.addEventListener('resize', show);
    show();
    [100, 300, 800, 1500, 3000].forEach(function(t){ setTimeout(show, t); });

    if (window.ResizeObserver) {
      try { new ResizeObserver(function(){ if (!drag) show(); }).observe(sidebar); } catch(e){}
    }

    new MutationObserver(show).observe(document.documentElement, {
      attributes: true, attributeFilter: ['data-theme']
    });

    window.__jstResizerDebug = function () {
      return {
        main: !!main, sidebar: !!sidebar, workspace: !!workspace,
        mainDisplay: getComputedStyle(main).display,
        mainPos: getComputedStyle(main).position,
        sidebarW: sidebar.getBoundingClientRect().width,
        rzDisplay: getComputedStyle(rz).display,
        rzLeft: rz.style.left,
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
