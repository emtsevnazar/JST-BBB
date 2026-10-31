/* splitter.js v1.1.35 - resizable sidebar/workspace (range 15-85%)
   Desktop (>900px): .splitter-h (col-resize, --sidebar-w)
   Mobile (<=900px): .splitter   (row-resize, --sidebar-h)
*/
(function () {
  'use strict';
  const MIN_PCT = 15;
  const MAX_PCT = 85;
  const DEFAULT_PCT_H = 40;
  const DEFAULT_PCT_W = 25;
  const STORE_H = 'jst_sidebar_h';
  const STORE_W = 'jst_sidebar_w';
  const BP = 900;

  function getMain() { return document.querySelector('.main'); }
  function getSidebar() { return document.querySelector('.main > .sidebar'); }
  function clamp(p) { return Math.max(MIN_PCT, Math.min(MAX_PCT, p)); }

  function applyHeight(pct) {
    const main = getMain(); if (!main) return;
    const v = clamp(pct);
    main.style.setProperty('--sidebar-h', v + '%', 'important');
    try { localStorage.setItem(STORE_H, String(v)); } catch (e) {}
  }
  function applyWidth(pct) {
    const main = getMain(); if (!main) return;
    const v = clamp(pct);
    main.style.setProperty('--sidebar-w', v + '%', 'important');
    try { localStorage.setItem(STORE_W, String(v)); } catch (e) {}
  }

  function getOrCreate(cls, ariaOrient) {
    const main = getMain(); const sb = getSidebar();
    if (!main || !sb) return null;
    const sel = ':scope > .' + cls;
    const existing = main.querySelector(sel);
    if (existing) return existing;
    const sp = document.createElement('div');
    sp.className = cls;
    sp.setAttribute('role', 'separator');
    sp.setAttribute('aria-orientation', ariaOrient);
    sp.setAttribute('aria-label', 'Resize sidebar and workspace');
    sp.setAttribute('tabindex', '0');
    if (sb.nextSibling) main.insertBefore(sp, sb.nextSibling);
    else main.appendChild(sp);
    return sp;
  }

  function getCurrentPct(isHoriz) {
    const sb = getSidebar(); const main = getMain();
    if (!sb || !main) return isHoriz ? DEFAULT_PCT_W : DEFAULT_PCT_H;
    const mr = main.getBoundingClientRect();
    const sr = sb.getBoundingClientRect();
    if (isHoriz) return mr.width > 0 ? (sr.width / mr.width) * 100 : DEFAULT_PCT_W;
    return mr.height > 0 ? (sr.height / mr.height) * 100 : DEFAULT_PCT_H;
  }

  function restoreAll() {
    let h = null, w = null;
    try { h = localStorage.getItem(STORE_H); w = localStorage.getItem(STORE_W); } catch (e) {}
    let pH = h !== null ? parseFloat(h) : DEFAULT_PCT_H;
    let pW = w !== null ? parseFloat(w) : DEFAULT_PCT_W;
    if (isNaN(pH)) pH = DEFAULT_PCT_H;
    if (isNaN(pW)) pW = DEFAULT_PCT_W;
    applyHeight(pH); applyWidth(pW);
  }

  function attach(splitter, isHoriz) {
    if (!splitter || splitter.dataset.dragAttached) return;
    splitter.dataset.dragAttached = '1';
    let startPos = 0, startPct = 0, mainSize = 0, dragging = false;

    function onDown(e) {
      const main = getMain(); if (!main) return;
      const rect = main.getBoundingClientRect();
      mainSize = isHoriz ? rect.width : rect.height;
      if (mainSize <= 0) return;
      dragging = true;
      startPos = e.touches ? (isHoriz ? e.touches[0].clientX : e.touches[0].clientY)
                          : (isHoriz ? e.clientX : e.clientY);
      startPct = getCurrentPct(isHoriz);
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
      const pos = e.touches ? (isHoriz ? e.touches[0].clientX : e.touches[0].clientY)
                            : (isHoriz ? e.clientX : e.clientY);
      const deltaPct = ((pos - startPos) / mainSize) * 100;
      if (isHoriz) applyWidth(startPct + deltaPct);
      else applyHeight(startPct + deltaPct);
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
    splitter.addEventListener('keydown', (e) => {
      const cur = getCurrentPct(isHoriz);
      const step = 5;
      let handled = true;
      if (isHoriz) {
        if (e.key === 'ArrowRight') applyWidth(cur + step);
        else if (e.key === 'ArrowLeft') applyWidth(cur - step);
        else handled = false;
      } else {
        if (e.key === 'ArrowDown') applyHeight(cur + step);
        else if (e.key === 'ArrowUp') applyHeight(cur - step);
        else handled = false;
      }
      if (handled) e.preventDefault();
    });
  }

  function init() {
    const isDesktop = window.innerWidth > BP;
    if (isDesktop) {
      const sp = getOrCreate('splitter-h', 'vertical');
      if (sp) { attach(sp, true); sp.style.display = ''; }
      const oldV = document.querySelector('.main > .splitter');
      if (oldV) oldV.style.display = 'none';
    } else {
      const sp = getOrCreate('splitter', 'horizontal');
      if (sp) { attach(sp, false); sp.style.display = ''; }
      const oldH = document.querySelector('.main > .splitter-h');
      if (oldH) oldH.style.display = 'none';
    }
    restoreAll();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  setTimeout(init, 500);
  setTimeout(init, 2000);

  let t = null;
  window.addEventListener('resize', () => {
    if (t) clearTimeout(t);
    t = setTimeout(init, 120);
  });
})();
