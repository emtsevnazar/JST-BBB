/* ui-helpers.js — pure helpers (Phase 5c, extracted from app.js)
   Classic script for sync load, window.__jstHelpers bridge. */
(function () {
  var $ = function (id) { return document.getElementById(id); };  /* Phase 5e hotfix: local $ shim */
function fmt(sec) {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60), s = (sec % 60).toFixed(1).padStart(4, "0");
  return m + ":" + s;
}
function _translateStatus(text, fromLang, toLang) {
  if (!text || fromLang === toLang) return text;
  const s = I18N[fromLang] || {};
  const d = I18N[toLang] || {};
  // 1. Exact match (e.g. "Готов к работе" → "Ready")
  for (const k in s) {
    if (s[k] === text && d[k] && typeof d[k] === "string") return d[k];
  }
  // 2. Word-by-word (v1.7.9c): переводим составные статусы
  // "Планирование: 1 фраз" → "Planning: 1 phrases"
  const tokens = text.match(/[А-Яа-яЁёA-Za-z]+|[^А-Яа-яЁёA-Za-z]+/g) || [];
  let wordChanged = false;
  const translated = tokens.map(tok => {
    if (!/[А-Яа-яЁёA-Za-z]/.test(tok)) return tok;
    for (const k in s) {
      if (s[k] === tok && d[k] && typeof d[k] === "string") { wordChanged = true; return d[k]; }
    }
    return tok;
  }).join("");
  if (wordChanged) return translated;
  // 3. Prefix match (fallback для суффиксов типа "· file.wav", "5.2s")
  const keys = Object.keys(s).filter(k => typeof s[k] === "string" && s[k].length > 2);
  keys.sort((a, b) => (s[b] || "").length - (s[a] || "").length);
  for (const k of keys) {
    const v = s[k];
    if (!text.startsWith(v) || !d[k]) continue;
    const tail = text.slice(v.length);
    if (tail && /[А-Яа-яЁёA-Za-z]/.test(tail[0])) continue;
    return d[k] + tail;
  }
  return text;
}
  

// ─── Phase 5e: DOM helpers ───
function __jstContrast() {
  return document.documentElement.getAttribute("data-theme") === "contrast";
}

function showToast(msg, type) {
  let el = $("toast");
  if (!el) { el = document.createElement("div"); el.id = "toast"; el.className = "toast"; document.body.appendChild(el); }
  /* v59: ВСЕ toast — красные с ⚠️ (через CSS). JS только ставит текст. */
  var cleanMsg = String(msg || "").replace(/^⚠\s*/, "");
  el.textContent = cleanMsg;
  el.className = "toast toast-error show";
  clearTimeout(window._toastT);
  window._toastT = setTimeout(function() { el.classList.remove("show"); }, 8000);
}

function setStatus(text, type) {
  const st = $("status"); const stt = $("status-text");
  if (!stt) return;
  stt.textContent = text;
  window.JST_LAST_STATUS = text;   // v1.6.3: для перерисовки при switch
  window.JST_LAST_STATUS_LANG = (window.LANG || 'ru');  /* Phase 5e hotfix */   // v1.6.5: язык статуса
  if (st) st.className = "status" + (type ? " " + type : "");
}

function ti(key) { var d = (window.JST_TOAST_I18N || {})[(window.LANG || "ru")]; return (d && d[key]) || key; }
var t = function (k) { var I = (window.__jstI18n && window.__jstI18n.I18N) || {}; var L2 = window.LANG || "ru"; return (I[L2] && I[L2][k]) || k; };
window.__jstHelpers = { fmt: typeof fmt !== 'undefined' ? fmt : null, _translateStatus: typeof _translateStatus !== 'undefined' ? _translateStatus : null, __jstContrast: typeof __jstContrast !== 'undefined' ? __jstContrast : null, showToast: typeof showToast !== 'undefined' ? showToast : null, setStatus: typeof setStatus !== 'undefined' ? setStatus : null, ti: typeof ti !== 'undefined' ? ti : null, t: typeof t !== 'undefined' ? t : null };
  console.log("[JST ui-helpers] exports:", Object.keys(window.__jstHelpers));
})();
