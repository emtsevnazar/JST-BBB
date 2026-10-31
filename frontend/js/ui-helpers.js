/* ui-helpers.js — pure helpers (Phase 5c, extracted from app.js)
   Classic script for sync load, window.__jstHelpers bridge. */
(function () {
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
  window.__jstHelpers = { fmt: typeof fmt !== 'undefined' ? fmt : null, _translateStatus: typeof _translateStatus !== 'undefined' ? _translateStatus : null };
  console.log("[JST ui-helpers] exports:", Object.keys(window.__jstHelpers));
})();
