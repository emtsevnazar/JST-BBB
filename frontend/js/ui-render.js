/* ui-render.js — Phase 7a: pure DOM render functions (extracted from app.js) */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var t = (window.__jstHelpers && window.__jstHelpers.t) || function (k) { return k; };
  var ti = (window.__jstHelpers && window.__jstHelpers.ti) || function (k) { return k; };
  var setStatus = (window.__jstHelpers && window.__jstHelpers.setStatus) || function () {};
  var showToast = (window.__jstHelpers && window.__jstHelpers.showToast) || function () {};
  var _translateStatus = (window.__jstHelpers && window.__jstHelpers._translateStatus) || function (txt) { return txt; };
  var I18N = (window.__jstI18n && window.__jstI18n.I18N) || { ru: {}, en: {} };
  var LANG = (window.LANG || 'en');
  var tPreset = function (k) { return ((I18N[window.LANG] && I18N[window.LANG].presets) || {})[k] || k; };
  var tCard = function (k) { return ((I18N[window.LANG] && I18N[window.LANG].cards) || {})[k] || k; };

  function rebuildPresetsSelect() {
    var el = $('preset'); if (!el) return;
    var cur = el.value;
    el.innerHTML = '';
    Object.keys(window.PRESETS || {}).forEach(function (k) {
      var o = document.createElement('option');
      o.value = k; o.textContent = tPreset(k);
      el.appendChild(o);
    });
    if (cur) el.value = cur;
  }

  function rebuildCarousel() {
    var grid = $('carousel'); if (!grid) return;
    grid.innerHTML = '';
    (window.CARDS || []).forEach(function (card) {
      var c = document.createElement('div');
      c.className = 'card';
      c.textContent = tCard(card.id);
      c.onclick = function () { applyCard(card); };
      grid.appendChild(c);
    });
  }

  function applyCard(card) {
    var text = $('text'); if (!text) return;
    var s = text.selectionStart, e = text.selectionEnd;
    var sel = text.value.slice(s, e);
    if (card.action === 'insert') {
      text.value = text.value.slice(0, s) + card.value + text.value.slice(e);
      text.focus(); text.setSelectionRange(s + card.value.length, s + card.value.length);
    } else if (card.action === 'wrap') {
      var inner;
      if (Array.isArray(card.value)) {
        var o = card.value[0], c = card.value[1];
        inner = sel || ((window.LANG === 'ru') ? 'слово' : 'word');
        text.value = text.value.slice(0, s) + o + inner + c + text.value.slice(e);
        text.focus(); text.setSelectionRange(s + o.length, s + o.length + inner.length);
      } else {
        var w = card.value;
        inner = sel || ((window.LANG === 'ru') ? 'слово' : 'word');
        text.value = text.value.slice(0, s) + w + inner + w + text.value.slice(e);
        text.focus(); text.setSelectionRange(s + w.length, s + w.length + inner.length);
      }
    }
  }

  function rebuildAccents() {
    var grid = $('accent-grid'); if (!grid) return;
    grid.innerHTML = '';
    (window.ACCENTS || []).forEach(function (a) {
      var c = document.createElement('div');
      c.className = 'accent-card' + (a.code === window.currentAccent ? ' active' : '');
      c.innerHTML = '<div class="accent-name">' + (window.LANG === 'ru' ? a.ru : a.en) + '</div>' +
                    '<div class="accent-desc">' + (window.LANG === 'ru' ? a.ru_d : a.en_d) + '</div>';
      c.onclick = function () {
        document.querySelectorAll('.accent-card').forEach(function (x) { x.classList.remove('active'); });
        c.classList.add('active');
        if (window.__jstSetCurrentAccent) window.__jstSetCurrentAccent(a.code);
        else window.currentAccent = a.code;
      };
      grid.appendChild(c);
    });
  }

  function renderMoods() {
    var sel = document.querySelector('#mood');
    if (!sel || !window.__moodsData) return;
    var lang = (document.documentElement.getAttribute('lang') || 'ru').toLowerCase();
    var current = sel.value;
    sel.innerHTML = '<option value="auto">JST Auto Spirits</option>';
    Object.entries(window.__moodsData).forEach(function (entry) {
      var code = entry[0], m = entry[1];
      var ruName = m.name || code;
      var MOOD_NAME_EN = window.MOOD_NAME_EN || {};
      var enName = m.name_en || MOOD_NAME_EN[ruName] || ruName;
      var o = document.createElement('option');
      o.value = code;
      o.textContent = (lang === 'en') ? enName : ruName;
      sel.appendChild(o);
    });
    if (current) sel.value = current;
  }


  function updateModelInfo() {
    if (window.__jstNormalizeSynthPrefs) window.__jstNormalizeSynthPrefs();
    var info = $("model-info"); if (!info) return;
    var m = (window.MODELS || []).find(function (x) { return x.code === window.currentMode; });
    if (!m) { info.innerHTML = ""; return; }
    var tDesc = function (k) { return ((I18N[window.LANG] && I18N[window.LANG].desc) || {})[k] || ""; };
    var langs = (m.languages || []).map(function (l) { return l.toUpperCase(); }).join(" · ") || "—";
    var status = m.loaded ? "" : " <span style=\"color:var(--red)\">(не загружена)</span>";
    info.innerHTML = "<div class=\"mi-langs\">" + langs + "</div>" + "<div class=\"mi-desc\">" + tDesc(m.code) + status + "</div>";
  }

function renderLanguages() {
  if (window.__jstNormalizeSynthPrefs) window.__jstNormalizeSynthPrefs();
  var grid = $("lang-grid"); if (!grid) return;
  var m = (window.MODELS || []).find(function (x) { return x.code === window.currentMode; });
  var supported = new Set(m ? (m.languages || []) : ["en"]);
  grid.innerHTML = "";
  Object.keys(window.LANG_NAMES || {}).forEach(function (code) {
    var c = document.createElement("div");
    c.className = "lang-card";
    c.setAttribute("data-code", code);
    c.innerHTML = '<div class="lang-code">' + code.toUpperCase() + '</div>' +
                  '<div class="lang-name">' + (window.LANG_NAMES || {})[code] + '</div>';
    var isSupported = supported.has(code);
    if (!isSupported) {
      c.classList.add("unavailable");
      c.onclick = function () { showToast(ti("soon") + (window.LANG_NAMES || {})[code]); };
    } else {
      c.onclick = function () {
        document.querySelectorAll(".lang-card").forEach(function (x) { x.classList.remove("active"); });
        c.classList.add("active");
        if (window.__jstSetCurrentLang) window.__jstSetCurrentLang(code); else window.currentLang = code;
        if (window.__jstSaveSynthPrefs) window.__jstSaveSynthPrefs();
        if (window.__jstApplySynthLangToText) window.__jstApplySynthLangToText();
      };
    }
    if (code === window.currentLang && isSupported) c.classList.add("active");
    grid.appendChild(c);
  });
}

function applyLanguage() {
  document.documentElement.lang = window.LANG;
  try {
    var _st = document.getElementById("status-text");
    if (_st && window.JST_LAST_STATUS_LANG && window.JST_LAST_STATUS_LANG !== window.LANG) {
      var _old = _st.textContent || "";
      var _new = _translateStatus(_old, window.JST_LAST_STATUS_LANG, window.LANG);
      if (_new !== _old) {
        _st.textContent = _new;
        window.JST_LAST_STATUS = _new;
      }
      window.JST_LAST_STATUS_LANG = window.LANG;
    }
  } catch (e) {}
  var lt = $("lang-toggle");
  if (lt) lt.textContent = window.LANG.toUpperCase();
  document.querySelectorAll("[data-i18n]").forEach(function (el) {
    if (el.id === "status-text") return;
    var k = el.dataset.i18n; var v = t(k); if (v) el.textContent = v;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
    var k = el.dataset.i18nPlaceholder; var v = t(k); if (v) el.placeholder = v;
  });
  try { if (window.__jstRender && window.__jstRender.rebuildPresetsSelect) window.__jstRender.rebuildPresetsSelect(); } catch(e){}
  try { if (window.__jstRender && window.__jstRender.rebuildCarousel) window.__jstRender.rebuildCarousel(); } catch(e){}
  try { if (window.__jstRender && window.__jstRender.rebuildAccents) window.__jstRender.rebuildAccents(); } catch(e){}
  try { if (window.__jstRebuildModelCarousel) window.__jstRebuildModelCarousel(); } catch(e){}
  try { if (window.__jstRender && window.__jstRender.updateModelInfo) window.__jstRender.updateModelInfo(); } catch(e){}
  try { renderLanguages(); } catch(e){}
  try { if (window.__jstRender && window.__jstRender.renderMoods) window.__jstRender.renderMoods(); } catch(e){}
  document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
    var k = el.getAttribute("data-i18n-title"); var v = t(k); if (v) el.title = v;
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach(function (el) {
    var k = el.getAttribute("data-i18n-aria-label"); var v = t(k); if (v) el.setAttribute("aria-label", v);
  });
}

  window.__jstRender = {
    rebuildPresetsSelect: rebuildPresetsSelect,
    rebuildCarousel: rebuildCarousel,
    applyCard: applyCard,
    rebuildAccents: rebuildAccents,
    renderMoods: renderMoods,
    updateModelInfo: updateModelInfo,
    applyLanguage: applyLanguage,
    renderLanguages: renderLanguages,
  };
  if (typeof console !== 'undefined') {
    console.log('[JST ui-render] exports:', Object.keys(window.__jstRender));
  }
})();
