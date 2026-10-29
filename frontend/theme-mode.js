(function () {
  "use strict";
  var KEY = "jst-theme-mode";
  var ORDER = ["day", "night", "auto", "scheduled", "contrast"];
  var LABELS = { day: "Day", night: "Night", auto: "Auto", scheduled: "Sched", contrast: "B&W" };
  /* badge inherits color from button */
  var SVG = {
    day: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="18" height="18"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>',
    night: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" width="18" height="18"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    auto: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="18" height="18"><path d="M12 3a9 9 0 1 0 9 9"/><path d="M12 3v3M12 3h3M21 12h-3M21 12v-3"/></svg>',
    scheduled: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="18" height="18"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    contrast: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18Z" fill="currentColor"/></svg>'
  };
  var TITLES = {
    day: { ru: "Светлая", en: "Light" },
    night: { ru: "Тёмная", en: "Dark" },
    auto: { ru: "Авто", en: "Auto" },
    scheduled: { ru: "По расписанию", en: "Schedule" },
    contrast: { ru: "Ч/Б контраст", en: "B&W" }
  };

  var _applying = false;

  function _lang() {
    try { return localStorage.getItem("jst-lang") || "ru"; } catch (e) { return "ru"; }
  }
  function getMode() {
    try {
      var m = localStorage.getItem(KEY);
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
    if (mode === "scheduled") {
      var h = new Date().getHours();
      return (h >= 6 && h < 18) ? "day" : "night";
    }
    if (mode === "contrast") return "contrast";
    return mode;
  }
  function apply() {
    _applying = true;
    var mode = getMode();
    var actual = _actual(mode);
    if (document.documentElement.getAttribute("data-theme") !== actual) {
      document.documentElement.setAttribute("data-theme", actual);
    }
    document.documentElement.setAttribute("data-mode", mode);
    try { localStorage.setItem("jst-theme", actual); } catch (e) {}
    _applying = false;
    updateBadgeColor(actual);
  }
  function updateBadgeColor() {
    var badge = document.getElementById("theme-mode-badge");
    if (!badge) return;
    badge.style.removeProperty("color");
    badge.style.removeProperty("-webkit-text-fill-color");
    badge.style.removeProperty("background");
    badge.style.removeProperty("background-color");
    badge.style.removeProperty("background-image");
  }
  function render() {
    var mode = getMode();
    var actual = document.documentElement.getAttribute("data-theme") || _actual(mode);
    var icon = document.getElementById("theme-icon");
    if (icon) icon.innerHTML = SVG[mode] || SVG.auto;
    var btn = document.getElementById("theme-toggle");
    if (btn) {
      var t = TITLES[mode] || {};
      btn.setAttribute("title", (t[_lang()] || t.ru || mode) + " (click to switch)");
      btn.setAttribute("aria-label", t[_lang()] || t.ru || mode);
      btn.setAttribute("data-current-mode", mode);
    }
    var badge = document.getElementById("theme-mode-badge");
    if (!badge) {
      var btn2 = document.getElementById("theme-toggle");
      if (btn2) {
        badge = document.createElement("span");
        badge.id = "theme-mode-badge";
        badge.className = "theme-mode-badge";
        btn2.appendChild(badge);
      }
    }
    if (badge) badge.textContent = LABELS[mode] || mode;
    updateBadgeColor(actual);
  }
  function nextMode() {
    var cur = getMode();
    var idx = ORDER.indexOf(cur);
    if (idx === -1) idx = 0;
    setMode(ORDER[(idx + 1) % ORDER.length]);
  }
  function _intercept(e) {
    var t = e.target;
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
    document.addEventListener("click", _intercept, true);

    /* Catch any external data-theme reset (app.js, another script) and restore */
    try {
      new MutationObserver(function(mutations) {
        if (_applying) return;
        for (var i = 0; i < mutations.length; i++) {
          if (mutations[i].attributeName === "data-theme") {
            var expected = _actual(getMode());
            var current = document.documentElement.getAttribute("data-theme");
            if (current !== expected) {
              try { console.warn("[theme-mode] external reset detected:", current, "→ restoring:", expected); } catch(e) {}
              _applying = true;
              document.documentElement.setAttribute("data-theme", expected);
              _applying = false;
              updateBadgeColor(expected);
            } else {
              updateBadgeColor(current);
            }
          }
        }
      }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    } catch (e) {}

    if (window.matchMedia) {
      try {
        var mq = window.matchMedia("(prefers-color-scheme: dark)");
        var h = function () { if (getMode() === "auto") apply(); };
        if (mq.addEventListener) mq.addEventListener("change", h);
        else if (mq.addListener) mq.addListener(h);
      } catch (e) {}
    }

    setInterval(function () { if (getMode() === "scheduled") apply(); }, 60000);
    apply();
    render();
    try { console.log("[theme-mode] ready. ORDER:", ORDER.join("→"), "mode:", getMode(), "actual:", document.documentElement.getAttribute("data-theme")); } catch (e) {}
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.__jstThemeLoaded = true;
  window.__jstThemeDebug = function() {
    var btn = document.getElementById("theme-toggle");
    var badge = document.querySelector(".theme-mode-badge");
    return {
      dataTheme: document.documentElement.getAttribute("data-theme"),
      dataMode: document.documentElement.getAttribute("data-mode"),
      storageMode: localStorage.getItem("jst-theme-mode"),
      storageTheme: localStorage.getItem("jst-theme"),
      badge: badge ? badge.textContent : null,
      badgeColor: badge ? getComputedStyle(badge).color : null,
      buttonBg: btn ? getComputedStyle(btn).backgroundColor : null,
      buttonColor: btn ? getComputedStyle(btn).color : null,
      applyThemeType: typeof window.applyTheme
    };
  };
})();