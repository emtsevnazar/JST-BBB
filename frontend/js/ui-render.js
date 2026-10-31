/* ui-render.js — Phase 7a: pure DOM render functions (extracted from app.js) */
(function () {
  'use strict';
  const $ = function (id) { return document.getElementById(id); };
  const t = (window.__jstHelpers && window.__jstHelpers.t) || function (k) { return k; };
  const ti = (window.__jstHelpers && window.__jstHelpers.ti) || function (k) { return k; };
  const setStatus = (window.__jstHelpers && window.__jstHelpers.setStatus) || function () {};
  const showToast = (window.__jstHelpers && window.__jstHelpers.showToast) || function () {};
  const _translateStatus = (window.__jstHelpers && window.__jstHelpers._translateStatus) || function (txt) { return txt; };
  const I18N = (window.__jstI18n && window.__jstI18n.I18N) || { ru: {}, en: {} };
  const LANG = (window.LANG || 'en');
  const tPreset = function (k) { return ((I18N[window.LANG] && I18N[window.LANG].presets) || {})[k] || k; };
  const tCard = function (k) { return ((I18N[window.LANG] && I18N[window.LANG].cards) || {})[k] || k; };

  function rebuildPresetsSelect() {
    const el = $('preset'); if (!el) return;
    const cur = el.value;
    el.innerHTML = '';
    Object.keys(window.PRESETS || {}).forEach((k) => {
      const o = document.createElement('option');
      o.value = k; o.textContent = tPreset(k);
      el.appendChild(o);
    });
    if (cur) el.value = cur;
  }

  function rebuildCarousel() {
    const grid = $('carousel'); if (!grid) return;
    grid.innerHTML = '';
    (window.CARDS || []).forEach((card) => {
      const c = document.createElement('div');
      c.className = 'card';
      c.textContent = tCard(card.id);
      c.onclick = function () { applyCard(card); };
      grid.appendChild(c);
    });
  }

  function applyCard(card) {
    const text = $('text'); if (!text) return;
    const s = text.selectionStart, e = text.selectionEnd;
    const sel = text.value.slice(s, e);
    if (card.action === 'insert') {
      text.value = text.value.slice(0, s) + card.value + text.value.slice(e);
      text.focus(); text.setSelectionRange(s + card.value.length, s + card.value.length);
    } else if (card.action === 'wrap') {
      let inner;
      if (Array.isArray(card.value)) {
        const o = card.value[0], c = card.value[1];
        inner = sel || ((window.LANG === 'ru') ? 'слово' : 'word');
        text.value = text.value.slice(0, s) + o + inner + c + text.value.slice(e);
        text.focus(); text.setSelectionRange(s + o.length, s + o.length + inner.length);
      } else {
        const w = card.value;
        inner = sel || ((window.LANG === 'ru') ? 'слово' : 'word');
        text.value = text.value.slice(0, s) + w + inner + w + text.value.slice(e);
        text.focus(); text.setSelectionRange(s + w.length, s + w.length + inner.length);
      }
    }
  }

  function rebuildAccents() {
    const grid = $('accent-grid'); if (!grid) return;
    grid.innerHTML = '';
    (window.ACCENTS || []).forEach((a) => {
      const c = document.createElement('div');
      c.className = `accent-card${  a.code === window.currentAccent ? ' active' : ''}`;
      c.innerHTML = `<div class="accent-name">${  window.LANG === 'ru' ? a.ru : a.en  }</div>` +
                    `<div class="accent-desc">${  window.LANG === 'ru' ? a.ru_d : a.en_d  }</div>`;
      c.onclick = function () {
        document.querySelectorAll('.accent-card').forEach((x) => { x.classList.remove('active'); });
        c.classList.add('active');
        if (window.__jstSetCurrentAccent) window.__jstSetCurrentAccent(a.code);
        else window.currentAccent = a.code;
      };
      grid.appendChild(c);
    });
  }

  function renderMoods() {
    const sel = document.querySelector('#mood');
    if (!sel || !window.__moodsData) return;
    const lang = (document.documentElement.getAttribute('lang') || 'ru').toLowerCase();
    const current = sel.value;
    sel.innerHTML = '<option value="auto">JST Auto Spirits</option>';
    Object.entries(window.__moodsData).forEach((entry) => {
      const code = entry[0], m = entry[1];
      const ruName = m.name || code;
      const MOOD_NAME_EN = window.MOOD_NAME_EN || {};
      const enName = m.name_en || MOOD_NAME_EN[ruName] || ruName;
      const o = document.createElement('option');
      o.value = code;
      o.textContent = (lang === 'en') ? enName : ruName;
      sel.appendChild(o);
    });
    if (current) sel.value = current;
  }


  function updateModelInfo() {
    if (window.__jstNormalizeSynthPrefs) window.__jstNormalizeSynthPrefs();
    const info = $("model-info"); if (!info) return;
    const m = (window.MODELS || []).find((x) => { return x.code === window.currentMode; });
    if (!m) { info.innerHTML = ""; return; }
    const tDesc = function (k) { return ((I18N[window.LANG] && I18N[window.LANG].desc) || {})[k] || ""; };
    const langs = (m.languages || []).map((l) => { return l.toUpperCase(); }).join(" · ") || "—";
    const status = m.loaded ? "" : " <span style=\"color:var(--red)\">(не загружена)</span>";
    info.innerHTML = `<div class="mi-langs">${  langs  }</div>` + `<div class="mi-desc">${  tDesc(m.code)  }${status  }</div>`;
  }

function renderLanguages() {
  if (window.__jstNormalizeSynthPrefs) window.__jstNormalizeSynthPrefs();
  const grid = $("lang-grid"); if (!grid) return;
  const m = (window.MODELS || []).find((x) => { return x.code === window.currentMode; });
  const supported = new Set(m ? (m.languages || []) : ["en"]);
  grid.innerHTML = "";
  Object.keys(window.LANG_NAMES || {}).forEach((code) => {
    const c = document.createElement("div");
    c.className = "lang-card";
    c.setAttribute("data-code", code);
    c.innerHTML = `<div class="lang-code">${  code.toUpperCase()  }</div>` +
                  `<div class="lang-name">${  (window.LANG_NAMES || {})[code]  }</div>`;
    const isSupported = supported.has(code);
    if (!isSupported) {
      c.classList.add("unavailable");
      c.onclick = function () { showToast(ti("soon") + (window.LANG_NAMES || {})[code]); };
    } else {
      c.onclick = function () {
        document.querySelectorAll(".lang-card").forEach((x) => { x.classList.remove("active"); });
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
    const _st = document.getElementById("status-text");
    if (_st && window.JST_LAST_STATUS_LANG && window.JST_LAST_STATUS_LANG !== window.LANG) {
      const _old = _st.textContent || "";
      const _new = _translateStatus(_old, window.JST_LAST_STATUS_LANG, window.LANG);
      if (_new !== _old) {
        _st.textContent = _new;
        window.JST_LAST_STATUS = _new;
      }
      window.JST_LAST_STATUS_LANG = window.LANG;
    }
  } catch (e) {}
  const lt = $("lang-toggle");
  if (lt) lt.textContent = window.LANG.toUpperCase();
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    if (el.id === "status-text") return;
    const k = el.dataset.i18n; const v = t(k); if (v) el.textContent = v;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const k = el.dataset.i18nPlaceholder; const v = t(k); if (v) el.placeholder = v;
  });
  try { if (window.__jstRender && window.__jstRender.rebuildPresetsSelect) window.__jstRender.rebuildPresetsSelect(); } catch(e){}
  try { if (window.__jstRender && window.__jstRender.rebuildCarousel) window.__jstRender.rebuildCarousel(); } catch(e){}
  try { if (window.__jstRender && window.__jstRender.rebuildAccents) window.__jstRender.rebuildAccents(); } catch(e){}
  try { if (window.__jstRebuildModelCarousel) window.__jstRebuildModelCarousel(); } catch(e){}
  try { if (window.__jstRender && window.__jstRender.updateModelInfo) window.__jstRender.updateModelInfo(); } catch(e){}
  try { renderLanguages(); } catch(e){}
  try { if (window.__jstRender && window.__jstRender.renderMoods) window.__jstRender.renderMoods(); } catch(e){}
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const k = el.getAttribute("data-i18n-title"); const v = t(k); if (v) el.title = v;
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
    const k = el.getAttribute("data-i18n-aria-label"); const v = t(k); if (v) el.setAttribute("aria-label", v);
  });
}

  function rebuildModelCarousel() {
    const grid = $("model-grid"); if (!grid) return;
    grid.innerHTML = "";
    if (!window.MODELS || !window.MODELS.length) {
      grid.innerHTML = `<div style="padding:12px;color:var(--text-dim)">${  t("no_models")  }</div>`;
      return;
    }
    window.MODELS.forEach((m) => {
      const c = document.createElement("div");
      c.className = `model-card${  m.code === window.currentMode ? " active" : ""  }${!m.loaded ? " unavailable" : ""}`;
      c.setAttribute("data-code", m.code);
      c.innerHTML = `<div class="model-name">${  m.name  }</div>`;
      c.onclick = function () {
        if (!m.loaded) {
          showToast(`${ti("model_not_loaded")  }: ${  m.name}`);
          return;
        }
        if (window.__jstSetCurrentMode) window.__jstSetCurrentMode(m.code); else window.currentMode = m.code;
        if (m.languages && m.languages.length && m.languages.indexOf(window.currentLang) === -1) {
          const _v = m.languages.indexOf("en") !== -1 ? "en" : m.languages[0];
          if (window.__jstSetCurrentLang) window.__jstSetCurrentLang(_v); else window.currentLang = _v;
          showToast(`${t("toast_switched")  } ${  (window.currentLang || "").toUpperCase()}`);
        }
        document.querySelectorAll(".model-card").forEach((x) => { x.classList.remove("active"); });
        c.classList.add("active");
        if (typeof updateModelInfo === "function") updateModelInfo();
        if (typeof renderLanguages === "function") renderLanguages();
        if (!m.loaded && m.code !== "core") {
          showToast(`${t("toast_not_loaded")  } (${  m.name  })`);
        }
        if (window.__jstSaveSynthPrefs) window.__jstSaveSynthPrefs();
        const fd = new FormData(); fd.append("mode", m.code);
        fetch("/api/mode", { method: "POST", body: fd }).catch(() => {});
      };
      grid.appendChild(c);
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
    rebuildModelCarousel: rebuildModelCarousel,
  };
  if (typeof console !== 'undefined') {
    console.log('[JST ui-render] exports:', Object.keys(window.__jstRender));
  }
})();
