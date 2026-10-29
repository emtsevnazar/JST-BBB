/* v1.10.1: theme-mode — cycle day/night/auto/scheduled + SVG outline.
 * НЕ трогает app.js. Перехватывает click в capture phase, отменяет app.js handler.
 */
(function () {
  "use strict";
  var KEY = "jst-theme-mode";
  var ORDER = ["day", "night", "auto", "scheduled", "contrast"];
  var SVG = {
    day: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="18" height="18"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>',
    night: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" width="18" height="18"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    auto: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="18" height="18"><path d="M12 3a9 9 0 1 0 9 9"/><path d="M12 3v3M12 3h3M21 12h-3M21 12v-3"/></svg>',
    scheduled: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="18" height="18"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>', 
    contrast: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18Z" fill="currentColor"/></svg>'
  };
  var TITLES = {
    day: { ru: "Светлая (клик: тёмная)", en: "Light (click: dark)" },
    night: { ru: "Тёмная (клик: авто)", en: "Dark (click: auto)" },
    auto: { ru: "Авто (клик: по расписанию)", en: "Auto (click: scheduled)" },
    scheduled: { ru: "По расписанию (клик: светлая)", en: "Scheduled (click: light)" },
      contrast: { ru: "Ч/Б контраст (клик: светлая)", en: "B&W Contrast (click: light)" }
  };

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
    return mode;
  }
  function apply() {
    var theme = _actual(getMode());
    if (typeof window.applyTheme === "function") {
      try { window.applyTheme(theme); return; } catch (e) {}
    }
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("jst-theme", theme); } catch (e) {}
  }
  function render() {
    var mode = getMode();
    var icon = document.getElementById("theme-icon");
    if (icon) icon.innerHTML = SVG[mode] || SVG.auto;
    var btn = document.getElementById("theme-toggle");
    if (btn) {
      var t = TITLES[mode] || {};
      btn.setAttribute("title", t[_lang()] || t.ru || mode);
      btn.setAttribute("aria-label", t[_lang()] || t.ru || mode);
    }
  }
  function nextMode() {
    var cur = getMode();
    var idx = ORDER.indexOf(cur);
    setMode(ORDER[(idx + 1) % ORDER.length]);
  }
  function _intercept(e) {
    var t = e.target;
    while (t && t !== document) {
      if (t.id === "theme-toggle") {
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
    if (window.matchMedia) {
      try {
        var mq = window.matchMedia("(prefers-color-scheme: dark)");
        var h = function () { if (getMode() === "auto") apply(); };
        if (mq.addEventListener) mq.addEventListener("change", h);
        else if (mq.addListener) mq.addListener(h);
      } catch (e) {}
    }
    /* JST_SCHEDULED_PRECISE_TIMER — точное переключение в 06:00 и 18:00 */
    var _schedTimer = null;
    function _scheduleNextSwitch() {
      if (_schedTimer) { clearTimeout(_schedTimer); _schedTimer = null; }
      if (getMode() !== "scheduled") return;
      var now = new Date();
      var h = now.getHours();
      var next;
      if (h >= 6 && h < 18) {
        // сейчас день → следующая граница 18:00
        next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0, 2);
      } else {
        // сейчас ночь → следующая граница 06:00 (завтра если h>=18)
        next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 2);
        if (next.getTime() <= now.getTime()) {
          next.setDate(next.getDate() + 1);
        }
      }
      var delay = Math.max(1000, next.getTime() - now.getTime());
      _schedTimer = setTimeout(function() {
        if (getMode() === "scheduled") {
          apply();
          _scheduleNextSwitch();
        }
      }, delay);
    }
    // Fallback: раз в 60с — на случай sleep/wake компьютера
    setInterval(function () { if (getMode() === "scheduled") { apply(); _scheduleNextSwitch(); } }, 60000);
    // Запустить при init и при смене режима
    _scheduleNextSwitch();
    var _origSetMode = setMode;
    setMode = function(m) { _origSetMode(m); _scheduleNextSwitch(); };
    apply();
    render();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
