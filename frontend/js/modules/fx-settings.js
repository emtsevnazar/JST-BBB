/* modules/fx-settings.js — вынесено из app.js
   Оригинальный IIFE: app.js строки 396-451.
*/

(function () {
  "use strict";
  const STORE_KEY = "jstp-fx-settings";
  let st = {};
  try { st = JSON.parse(localStorage.getItem(STORE_KEY) || "{}"); } catch (e) { st = {}; }

  const DEFAULTS = {
    eqLow: 0,
    eqMid: 0,
    eqHigh: 0,
    fadeIn: 0,
    fadeOut: 0,
    mono: false,
    width: 1,
    limiter: false,
  };
  for (const k in DEFAULTS) {
    if (st[k] == null) st[k] = DEFAULTS[k];
  }

  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(st)); } catch (e) {}
  }

  function bind(id, key, formatVal, isCheckbox) {
    const el = document.getElementById(id);
    if (!el) return;
    const valEl = document.getElementById(`${id  }-val`);
    if (isCheckbox) {
      el.checked = !!st[key];
    } else {
      el.value = String(st[key]);
      if (valEl && formatVal) valEl.textContent = formatVal(st[key]);
    }
    const ev = isCheckbox ? "change" : "input";
    el.addEventListener(ev, () => {
      st[key] = isCheckbox ? !!el.checked : parseFloat(el.value);
      if (valEl && formatVal) valEl.textContent = formatVal(st[key]);
      save();
      try { window.dispatchEvent(new CustomEvent("jst:fx-settings-changed")); } catch (e) {}
    });
  }

  bind("jstp-opt-eq-low",   "eqLow",   v => String(Math.round(v)));
  bind("jstp-opt-eq-mid",   "eqMid",   v => String(Math.round(v)));
  bind("jstp-opt-eq-high",  "eqHigh",  v => String(Math.round(v)));
  bind("jstp-opt-fade-in",  "fadeIn",  v => Number(v).toFixed(1));
  bind("jstp-opt-fade-out", "fadeOut", v => Number(v).toFixed(1));
  bind("jstp-opt-mono",     "mono",    null, true);
  bind("jstp-opt-width",    "width",   v => Number(v).toFixed(1));
  bind("jstp-opt-limiter",  "limiter", null, true);

  // Экспортируем getter наружу (пригодится в Step D — Web Audio)
  window.JST_FX_SETTINGS = st;
  window.JST_FX_SAVE = save;
})();
