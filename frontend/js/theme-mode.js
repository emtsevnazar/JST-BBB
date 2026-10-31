(function () {
  "use strict";
  const KEY = "jst-theme-mode";
  const ORDER = ["day", "night", "auto", "time", "contrast"];
  const LABELS_EN = { day: "Day", night: "Night", auto: "Auto", time: "Time", contrast: "B&W" };
  const LABELS_RU = { day: "День", night: "Ночь", auto: "Авто", time: "Время", contrast: "Ч/Б" };
  function _labels() {
    const lang = (document.documentElement.lang || "en").toLowerCase();
    return lang.indexOf("ru") === 0 ? LABELS_RU : LABELS_EN;
  }
  const SVG = {
    day: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="18" height="18"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>',
    night: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" width="18" height="18"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    auto: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="18" height="18"><path d="M12 3a9 9 0 1 0 9 9"/><path d="M12 3v3M12 3h3M21 12h-3M21 12v-3"/></svg>',
    time: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="18" height="18"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    contrast: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18Z" fill="currentColor"/></svg>'
  };
  const TITLES = {
    day: "Light", night: "Dark", auto: "Auto", time: "Time", contrast: "B&W"
  };

  let _applying = false;

  function getMode() {
    try {
      const m = localStorage.getItem(KEY);
      return ORDER.indexOf(m) !== -1 ? m : "auto";
    } catch (e) { return "auto"; }
  }
  function setMode(mode) {
    if (ORDER.indexOf(mode) === -1) return;
    try { localStorage.setItem(KEY, mode); } catch (e) {}
    apply();
    render();
  }
  function _actual(mode) {
    if (mode === "auto") {
      return (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "night" : "day";
    }
    if (mode === "time") {
      const h = new Date().getHours();
      return (h >= 6 && h < 18) ? "day" : "night";
    }
    if (mode === "contrast") return "contrast";
    return mode;
  }
  function apply() {
    _applying = true;
    const mode = getMode();
    const actual = _actual(mode);
    document.documentElement.setAttribute("data-theme", actual);
    document.documentElement.setAttribute("data-mode", mode);
    try { localStorage.setItem("jst-theme", actual); } catch (e) {}
    _applying = false;
  }
  function render() {
    const mode = getMode();
    const actual = document.documentElement.getAttribute("data-theme") || _actual(mode);
    const icon = document.getElementById("theme-icon");
    if (icon) icon.innerHTML = SVG[mode] || SVG.auto;
    const btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.setAttribute("title", `${TITLES[mode] || mode  } (click to switch)`);
      btn.setAttribute("aria-label", TITLES[mode] || mode);
      btn.setAttribute("data-current-mode", mode);
    }
    let badge = document.getElementById("theme-mode-badge");
    if (!badge) {
      const btn2 = document.getElementById("theme-toggle");
      if (btn2) {
        badge = document.createElement("span");
        badge.id = "theme-mode-badge";
        badge.className = "theme-mode-badge";
        btn2.appendChild(badge);
      }
    }
    if (badge) badge.textContent = _labels()[mode] || mode;
  }
  function nextMode() {
    const cur = getMode();
    let idx = ORDER.indexOf(cur);
    if (idx === -1) idx = 0;
    setMode(ORDER[(idx + 1) % ORDER.length]);
  }
  function _intercept(e) {
    let t = e.target;
    while (t && t !== document) {
      if (t.id === "theme-toggle" || (t.closest && t.closest("#theme-toggle"))) {
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        nextMode();
        return;
      }
      t = t.parentNode;
    }
  }
  function init() {
    /* Phase 11: __JST_FORCE_AUTO removed — theme now persists across reloads */
    document.addEventListener("click", _intercept, true);

    try {
      new MutationObserver((mutations) => {
        if (_applying) return;
        for (let i = 0; i < mutations.length; i++) {
          if (mutations[i].attributeName === "data-theme") {
            const expected = _actual(getMode());
            const current = document.documentElement.getAttribute("data-theme");
            if (current !== expected) {
              try { console.warn(`[theme-mode] reset detected: ${  current  } → ${  expected}`); } catch(e) {}
              _applying = true;
              document.documentElement.setAttribute("data-theme", expected);
              _applying = false;
            }
          }
        }
      }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    } catch (e) {}

    if (window.matchMedia) {
      try {
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const h = function () { if (getMode() === "auto") apply(); };
        if (mq.addEventListener) mq.addEventListener("change", h);
        else if (mq.addListener) mq.addListener(h);
      } catch (e) {}
    }

    setInterval(() => { if (getMode() === "time") apply(); }, 60000);
    /* __JST_LANG_OBS: обновление badge при смене языка */
    try {
      new MutationObserver(() =>{ render(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    } catch(e) {}
    apply();
    render();
    setTimeout(render, 100);
    setTimeout(render, 500);

    window.__jstThemeLoaded = true;
    window.__jstThemeDebug = function() {
      const btn = document.getElementById("theme-toggle");
      const badge = document.querySelector(".theme-mode-badge");
      return {
        dataTheme: document.documentElement.getAttribute("data-theme"),
        dataMode: document.documentElement.getAttribute("data-mode"),
        storageMode: localStorage.getItem("jst-theme-mode"),
        storageTheme: localStorage.getItem("jst-theme"),
        badge: badge ? badge.textContent : null,
        hasApplyTheme: typeof window.applyTheme
      };
    };
    try { console.log(`[theme-mode] ready. mode: ${  getMode()  }, actual: ${  document.documentElement.getAttribute("data-theme")}`); } catch (e) {}
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
