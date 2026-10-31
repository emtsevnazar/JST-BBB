/* JST Studio v5.0 — clean rebuild */

const I18N = (typeof window !== "undefined" && window.__jstI18n && window.__jstI18n.I18N) || { ru: {}, en: {} }; /* Phase 5b: see js/i18n-data.js */

const LANG_NAMES = {
  ru:"Русский", en:"English", de:"Deutsch", fr:"Français", es:"Español",
  it:"Italiano", pl:"Polski", tr:"Türkçe", zh:"中文", ja:"日本語",
  ar:"العربية", da:"Dansk", el:"Ελληνικά", fi:"Suomi", he:"עברית",
  hi:"हिन्दी", ko:"한국어", ms:"Melayu", nl:"Nederlands", no:"Norsk",
  pt:"Português", sv:"Svenska", sw:"Kiswahili"
};

const CARDS = [
  { id:"pause", action:"insert", value:" {p:0.5} " },
  { id:"emph", action:"wrap", value:"*" },
  { id:"whisper", action:"wrap", value:"~" },
  { id:"soft", action:"wrap", value:"_" },
  { id:"loud", action:"wrap", value:["<v:1.5>","</v>"] },
  { id:"slow", action:"wrap", value:["<s:0.7>","</s>"] },
  { id:"fast", action:"wrap", value:["<s:1.3>","</s>"] },
  { id:"up", action:"wrap", value:["<p:+3>","</p>"] },
  { id:"down", action:"wrap", value:["<p:-3>","</p>"] },
  { id:"stress", action:"wrap", value:"*" },
  { id:"lang", action:"insert", value:" [ru] " },
  { id:"brk", action:"insert", value:" // " }
];

const ACCENTS = [
  { code:"neutral", ru:"Нейтральный", en:"Neutral", ru_d:"Без изменений", en_d:"No change" },
  { code:"soft", ru:"Мягкий", en:"Soft", ru_d:"Тише и ниже", en_d:"Softer, lower" },
  { code:"energetic", ru:"Энергичный", en:"Energetic", ru_d:"Живее", en_d:"Livelier" },
  { code:"dramatic", ru:"Драматичный", en:"Dramatic", ru_d:"Глубже", en_d:"Deeper" },
  { code:"calm", ru:"Спокойный", en:"Calm", ru_d:"Ровно", en_d:"Calm" },
  { code:"bright", ru:"Яркий", en:"Bright", ru_d:"Выше", en_d:"Brighter" }
];

let LANG = localStorage.getItem("jst-lang") || "en"; window.LANG = LANG;

// v1.6.5: мини-словарь переводов для тостов/статусов (не трогает TRANSLATIONS)
const JST_TOAST_I18N = {
  en: {
    ws_error: "WebSocket: server is not responding",
    aborted: "Synthesis interrupted",
    network: "Network",
    no_conn: "no connection",
    server_down: "Server is not responding",
    server_crashed: "Server crashed",
    model_not_loaded: "Model not loaded",
    soon: "Soon: ",
    cleared: "Text cleared"
  },
  ru: {
    ws_error: "WebSocket: сервер не отвечает",
    aborted: "Синтез прерван",
    network: "Сеть",
    no_conn: "нет соединения",
    server_down: "Сервер не отвечает",
    server_crashed: "Сервер упал",
    model_not_loaded: "Модель не загружена",
    soon: "Скоро: ",
    cleared: "Текст очищен"
  }
};
window.JST_TOAST_I18N = JST_TOAST_I18N;
function ti(key) { return (window.__jstHelpers && window.__jstHelpers.ti) ? window.__jstHelpers.ti(key) : key; }
let MODELS = []; window.MODELS = [];
let PRESETS = {};
let currentMode = localStorage.getItem("jst-mode") || "core";
let currentLang = localStorage.getItem("jst-synth-lang") || "";

function saveSynthPrefs() { if (window.__jstApi && window.__jstApi.saveSynthPrefs) return window.__jstApi.saveSynthPrefs(); }

function applySynthLangToText() { if (window.__jstApi && window.__jstApi.applySynthLangToText) return window.__jstApi.applySynthLangToText(); }

function normalizeSynthPrefs() { if (window.__jstApi && window.__jstApi.normalizeSynthPrefs) return window.__jstApi.normalizeSynthPrefs(); }
window.__jstNormalizeSynthPrefs = normalizeSynthPrefs;
let currentAccent = "neutral";
let isStreaming = false; window.isStreaming = false;

/* v86: публичный сброс модульной isStreaming */
window.__jstResetStreaming = function(reason) {
  isStreaming = false; window.isStreaming = false;
  window.JST_IS_STREAMING = false;
  if (typeof ws !== "undefined" && ws) {
    try { ws.onclose = null; ws.onmessage = null; } catch(e) {}
    try { ws.close(); } catch(e) {}
    ws = null; window.ws = null;
  }
  window.ws = null;
  console.warn("[JST v86] isStreaming reset:", reason || "manual");
};

const audioCtx = null; window.audioCtx = null;
let ws = null; window.ws = null;
let wsTimeoutTimer = null; window.wsTimeoutTimer = null;
const currentSR = 24000; window.currentSR = 24000;
let nextStartTime = 0; window.nextStartTime = 0;
let totalSamples = 0; window.totalSamples = 0;
let allChunks = []; window.allChunks = [];
const animFrame = null; window.animFrame = null;
let activeSources = []; window.activeSources = [];
window.__jstSetActiveSources = function(v) { activeSources = v; window.activeSources = v; };
window.__jstSetNextStartTime = function(v) { nextStartTime = v; window.nextStartTime = v; };
window.__jstSetTotalSamples = function(v) { totalSamples = v; window.totalSamples = v; };
window.__jstSetAllChunks = function(v) { allChunks = v; window.allChunks = v; };
window.__jstSetWs = function(v) { ws = v; window.ws = v; };
window.__jstSetStreaming = function(v) { isStreaming = v; window.isStreaming = v; };
window.__jstSetWsTimeoutTimer = function(v) { wsTimeoutTimer = v; window.wsTimeoutTimer = v; };
window.CARDS = CARDS;
window.ACCENTS = ACCENTS;
window.PRESETS = PRESETS;
window.currentAccent = currentAccent;
window.__jstSetCurrentAccent = function(v) { currentAccent = v; window.currentAccent = v; };
window.__jstSetPresets = function(v) { PRESETS = v; window.PRESETS = v; };
window.__jstSetModels = function(v) { MODELS = v; window.MODELS = v; };
window.__jstSetMediaRecorder = function(v) { mediaRecorder = v; window.mediaRecorder = v; };
window.__jstSetRecordedChunks = function(v) { recordedChunks = v; window.recordedChunks = v; };
window.__jstGetSettings = getSettings;
window.__jstLoadVoices = loadVoices;
window.__jstSetSttActive = function(v) { sttActive = v; window.sttActive = v; };
window.__jstSetRecordTimer = function(v) { recordTimer = v; window.recordTimer = v; };
window.__jstSetRecordStartTime = function(v) { recordStartTime = v; window.recordStartTime = v; };
window.__jstSetCurrentMode = function(v) { currentMode = v; window.currentMode = v; };
window.__jstSetCurrentLang = function(v) { currentLang = v; window.currentLang = v; };
window.LANG_NAMES = LANG_NAMES;
window.__jstSaveSynthPrefs = saveSynthPrefs;
window.__jstApplySynthLangToText = applySynthLangToText;
window.__jstRebuildModelCarousel = rebuildModelCarousel;
let recordTimer = null; window.recordTimer = null;
let mediaRecorder = null; window.mediaRecorder = null;
let recordedChunks = []; window.recordedChunks = [];
let recordStartTime = 0; window.recordStartTime = 0;
let sttActive = false; window.sttActive = false;

function t(k) { return (window.__jstHelpers && window.__jstHelpers.t) ? window.__jstHelpers.t(k) : k; }
const tPreset = (k) => I18N[LANG].presets[k] || k;
const tCard = (k) => I18N[LANG].cards[k] || k;
const tDesc = (k) => I18N[LANG].desc[k] || "";
const $ = (id) => document.getElementById(id);
/* __jstContrast moved to ui-helpers.js (Phase 5e) */
window.__jstContrast = (window.__jstHelpers && window.__jstHelpers.__jstContrast) || function() { console.warn('[__jstContrast] stub'); };


// === THEME (owned by theme-mode.js) ===
// Legacy stub: theme-mode.js is the SINGLE owner of data-theme/data-mode.
// Do not call setAttribute here — it will conflict with theme-mode.js.

// === i18n UI ===
// v1.7.7: smart translate статуса (сохраняет "5.2s", "· file.wav")
/* _translateStatus moved to ui-helpers.js (Phase 5c) */
window._translateStatus = (window.__jstHelpers && window.__jstHelpers._translateStatus) || function() { console.warn('[_translateStatus] stub'); return ''; };

function applyLanguage() { if (window.__jstRender && window.__jstRender.applyLanguage) return window.__jstRender.applyLanguage(); }

// === TOAST ===
/* showToast moved to ui-helpers.js (Phase 5e) */
window.showToast = (window.__jstHelpers && window.__jstHelpers.showToast) || function() { console.warn('[showToast] stub'); };

// === STATUS ===
/* setStatus moved to ui-helpers.js (Phase 5e) */
window.setStatus = (window.__jstHelpers && window.__jstHelpers.setStatus) || function() { console.warn('[setStatus] stub'); };

// === PRESETS ===
function rebuildPresetsSelect() { if (window.__jstRender && window.__jstRender.rebuildPresetsSelect) return window.__jstRender.rebuildPresetsSelect(); }

function applyPreset(p) { if (window.__jstApi && window.__jstApi.applyPreset) return window.__jstApi.applyPreset(p); }

// === CAROUSEL (text helpers) ===
function rebuildCarousel() { if (window.__jstRender && window.__jstRender.rebuildCarousel) return window.__jstRender.rebuildCarousel(); }

function applyCard(card) { if (window.__jstRender && window.__jstRender.applyCard) return window.__jstRender.applyCard(card); }

// === ACCENTS ===
function rebuildAccents() { if (window.__jstRender && window.__jstRender.rebuildAccents) return window.__jstRender.rebuildAccents(); }

// === MODELS ===
function rebuildModelCarousel() { if (window.__jstRender && window.__jstRender.rebuildModelCarousel) return window.__jstRender.rebuildModelCarousel(); }

function updateModelInfo() { if (window.__jstRender && window.__jstRender.updateModelInfo) return window.__jstRender.updateModelInfo(); }

// === LANGUAGES ===
function renderLanguages() { if (window.__jstRender && window.__jstRender.renderLanguages) return window.__jstRender.renderLanguages(); }

// === SETTINGS ===
function getSettings() { if (window.__jstApi && window.__jstApi.getSettings) return window.__jstApi.getSettings(); }

// === SYNTHESIS ===
function handleAudioChunk(buf) { if (window.__jstSynth && window.__jstSynth.handleAudioChunk) return window.__jstSynth.handleAudioChunk(buf); }
function updateProgress() { if (window.__jstSynth && window.__jstSynth.updateProgress) return window.__jstSynth.updateProgress(); }
function synthesize() { if (window.__jstSynth && window.__jstSynth.synthesize) return window.__jstSynth.synthesize(); }

function finishStreaming(file) { if (window.__jstSynth && window.__jstSynth.finishStreaming) return window.__jstSynth.finishStreaming(file); }

function stopPlayback() { if (window.__jstSynth && window.__jstSynth.stopPlayback) return window.__jstSynth.stopPlayback(); }

function resetPlayback() { if (window.__jstSynth && window.__jstSynth.resetPlayback) return window.__jstSynth.resetPlayback(); }

function drawWaveform(chunks) { if (window.__jstSynth) return window.__jstSynth.drawWaveform(chunks); }

async function refreshHistory() {
  const h = $("history"); if (!h) return;
  try {
    const r = await fetch("/api/output"); const d = await r.json();
    h.innerHTML = "";
    if (!d.files.length) { h.innerHTML = '<div style="padding:8px">—</div>'; return; }
    d.files.forEach(f => {
      const it = document.createElement("div");
      const dt = new Date(f.mtime * 1000);
      it.innerHTML = `<a href="/output/${  f.name  }" download>${  f.name  }</a>` +
        `<span class="date">${  dt.toLocaleString("ru-RU")  }</span>`;
      h.appendChild(it);
    });
  } catch(e) {}
}
window.__jstRefreshHistory = refreshHistory;

/* fmt moved to ui-helpers.js (Phase 5c) */
window.fmt = (window.__jstHelpers && window.__jstHelpers.fmt) || function() { console.warn('[fmt] stub'); return ''; };

// === STT (голосовой ввод) ===
function initSTT() { if (window.__jstSynth && window.__jstSynth.initSTT) return window.__jstSynth.initSTT(); }

// === Запись голоса ===
function initRecordButton() { if (window.__jstSynth && window.__jstSynth.initRecordButton) return window.__jstSynth.initRecordButton(); }

// === LOAD DATA ===
async function loadModels() {
  try { const r = await fetch("/api/models"); const d = await r.json(); if (window.__jstSetModels) window.__jstSetModels(d.models || []); else MODELS = d.models || []; }
  catch(e) { console.error("models:", e); }
}

async function loadVoices() {
  try {
    const r = await fetch("/api/voices"); const d = await r.json();
    const v = $("voice"); if (!v) return;
    const cur = v.value;
    v.innerHTML = "";
    d.voices.forEach(vo => {
      const o = document.createElement("option");
      o.value = vo.name; o.textContent = `${vo.name  } (${  vo.files  })`;
      v.appendChild(o);
    });
    if (cur) v.value = cur;
  } catch(e) { console.error("voices:", e); }
}

async function loadMoods() {
  try {
    const r = await fetch("/api/moods");
    const d = await r.json();
    window.__moodsData = d.moods || {};
    renderMoods();
  } catch(e) { console.error("moods:", e); }
}

const MOOD_NAME_EN = {
    "Тёплый": "Warm",
    "Уверенный": "Confident",
    "Рассказчик": "Storyteller",
    "Вдохновляющий": "Motivational",
    "Загадочный": "Mysterious",
    "Дружелюбный": "Friendly",
    "Торжественный": "Solemn",
    "Задумчивый": "Thoughtful",
    "Потерянный": "Lost",
    "Грустный": "Sad",
    "Уставший": "Tired",
    "Бодрый": "Cheerful",
    "Нейтрально": "Neutral",
    "Весело": "Happy",
    "Грустно": "Sad",
    "Злость": "Angry",
    "Восторг": "Excited",
    "Шёпот": "Whisper",
    "Деловой": "Professional",
    "Подкаст": "Podcast",
    "Аудиокнига": "Audiobook",
    "Диктор": "Announcer",
    "Трейлер": "Trailer"
};
window.MOOD_NAME_EN = MOOD_NAME_EN;

function renderMoods() { if (window.__jstRender && window.__jstRender.renderMoods) return window.__jstRender.renderMoods(); }

if (!window.__moodsLangObserver) {
  window.__moodsLangObserver = new MutationObserver((muts) => {
    muts.forEach((m) => {
      if (m.attributeName === "lang") renderMoods();
    });
  });
  window.__moodsLangObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
}

async function loadPresets() {
  try {
    const r = await fetch("/api/presets"); const d = await r.json();
    if (window.__jstSetPresets) window.__jstSetPresets(d.presets); else PRESETS = d.presets;
    rebuildPresetsSelect();
    const p = $("preset");
    if (p) {
      p.onchange = () => applyPreset(PRESETS[p.value]);
      const first = Object.keys(PRESETS)[0];
      if (first) applyPreset(PRESETS[first]);
    }
  } catch(e) { console.error("presets:", e); }
}

// === BIND UI ===
function bindUI() { if (window.__jstUI && window.__jstUI.bindUI) return window.__jstUI.bindUI(); }

async function uploadVoice() {
  const nv = $("new-voice"), vf = $("voice-files"), bu = $("btn-upload");
  if (!nv || !vf || !bu) return;
  const name = nv.value.trim();
  const files = vf.files;
  if (!name || !files.length) { setStatus(t("status_upload_required"), "error"); return; }
  bu.disabled = true;
  try {
    const fd = new FormData(); fd.append("name", name);
    await fetch("/api/voices/create", { method: "POST", body: fd });
    for (let i = 0; i < files.length; i++) {
      setStatus(`${t("status_uploading")  } ${  i+1  }/${  files.length}`, "busy");
      const ffd = new FormData(); ffd.append("file", files[i]);
      await fetch(`/api/voices/${  encodeURIComponent(name)  }/upload`, { method: "POST", body: ffd });
    }
    setStatus(t("status_ref_building"), "busy");
    const fd2 = new FormData(); fd2.append("ref_length", ($("ref_length")||{}).value || "15");
    await fetch(`/api/voices/${  encodeURIComponent(name)  }/rebuild-reference`, { method: "POST", body: fd2 });
    await loadVoices();
    const v = $("voice"); if (v) v.value = name;
    nv.value = ""; vf.value = "";
    setStatus(`${t("status_uploaded")  }: ${  name}`, "");
  } catch(e) { setStatus(`${t("status_err")  }: ${  e.message}`, "error"); }
  finally { bu.disabled = false; }
}

// === INIT ===
async function init() {
  console.log("[JST] init start");
  applyLanguage();
  await loadModels();
  console.log("[JST] models loaded:", MODELS.length);
  await loadVoices();
  await loadPresets();
    await loadMoods();
  try { rebuildModelCarousel(); } catch(e) { console.error(e); }
  try { updateModelInfo(); } catch(e) { console.error(e); }
  try { renderLanguages(); } catch(e) { console.error(e); }
  try { rebuildCarousel(); } catch(e) { console.error(e); }
  try { rebuildAccents(); } catch(e) { console.error(e); }
  try { bindUI(); } catch(e) { console.error(e); }
  try { initSTT(); } catch(e) { console.error(e); }
  try { initRecordButton(); } catch(e) { console.error(e); }
  try { refreshHistory(); } catch(e) { console.error(e); }
  try { drawWaveform([]); } catch(e) { console.error(e); }
  setStatus(t("status_ready"), "");
  const lt = $("lang-toggle");
  if (lt) lt.addEventListener("click", () => {
    LANG = LANG === "ru" ? "en" : "ru"; window.LANG = LANG;
      try { window.dispatchEvent(new CustomEvent("jst:lang-changed")); } catch (e) {}
    localStorage.setItem("jst-lang", LANG);
    document.documentElement.lang = LANG;
    document.documentElement.lang = LANG;
    applyLanguage();
  });
  console.log("[JST] init done");
}

window.addEventListener("load", init);

// dropdown-blur: после клика по пункту меню — снимаем фокус с кнопки

// JST dropdown click-toggle: открыть/закрыть + blur после клика (точка гаснет)

// === Инструкция: финальная версия — вынос заголовка в body, маска на viewport ===
// Instruction IIFE вынесена в modules/instruction.js (Phase C1, app.js -237 строк)

// === Инструкция: шторки + туман без тёмной полосы ===

// === Help cards edge fade (JS): карточки затухают и блюрятся у краёв ===

// === Yellow border on button hover v6: dropdown-items без рамки ===
// Yellow border button hover IIFE вынесена в modules/btn-hover.js (Phase C3, app.js -155 строк)

// === Sidebar shutters v3: лёгкий градиентный blur, только по области блоков ===
// Sidebar shutters IIFE вынесена в modules/sidebar.js (Phase C2, app.js -182 строк)

/* === P6.2: Batch UI (full) === */
// P6.2 Batch UI IIFE вынесена в modules/batch-ui.js (Phase C4, app.js -373 строк)


/* === P6.14: JST player (SVG) + waveform 2-layer + история === */
// P6.14 JST Player IIFE вынесена в modules/player.js (Phase C5, app.js -967 строк)

// === v1.1.0: FX settings UI bindings (только UI + localStorage) ===
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

// === v1.1.2: restore last audio on reload ===

// === v1.2.0: Shared Web Audio chain — EQ + Width + Mono + Limiter + Fade ===
(function () {
  "use strict";
  if (window.__jstV120Chain) return;
  window.__jstV120Chain = true;

  // v1.2.0: hide Pitch row (use synthesis settings)
  (function hidePitchRow() {
    const inp = document.getElementById("jstp-opt-pitch");
    if (!inp) return;
    let el = inp;
    for (let i = 0; i < 4 && el.parentElement; i++) {
      el = el.parentElement;
      if (el.querySelector && el.querySelector("#jstp-opt-pitch-val")) {
        el.style.display = "none";
        return;
      }
    }
    inp.style.display = "none";
  })();

  let chainPromise = null;
  let fadeOutTimer = null;

  function getSettings() { return window.JST_FX_SETTINGS || {}; }

  function applyFxNow() {
    const chain = window.JST_AUDIO_CHAIN;
    const st = getSettings();
    if (!chain) return;
    chain.eq.low.gain.value  = Number(st.eqLow)  || 0;
    chain.eq.mid.gain.value  = Number(st.eqMid)  || 0;
    chain.eq.high.gain.value = Number(st.eqHigh) || 0;
    const w = st.mono ? 0 : (typeof st.width === "number" ? st.width : 1);
    chain.width.sW.gain.value = w;
    const lim = !!st.limiter;
    chain.limiter.threshold.value = lim ? -6 : 0;
    chain.limiter.ratio.value     = lim ? 20 : 1;
  }

  async function ensureChain() {
    if (window.JST_AUDIO_CHAIN) return window.JST_AUDIO_CHAIN;
    if (chainPromise) return chainPromise;
    chainPromise = (async () => {
      const audio = document.getElementById("preview-player");
      if (!audio) throw new Error("preview-player not found");
      const AC = window.AudioContext || window.webkitAudioContext;
      const ctx = new AC();
      const src = ctx.createMediaElementSource(audio);

      const low  = ctx.createBiquadFilter(); low.type  = "lowshelf";  low.frequency.value  = 200;
      const mid  = ctx.createBiquadFilter(); mid.type  = "peaking";   mid.frequency.value  = 1000; mid.Q.value = 1;
      const high = ctx.createBiquadFilter(); high.type = "highshelf"; high.frequency.value = 4000;

      const splitter = ctx.createChannelSplitter(2);
      const rNeg     = ctx.createGain(); rNeg.gain.value = -1;
      const mSum     = ctx.createGain(); mSum.gain.value = 0.5;
      const sSum     = ctx.createGain(); sSum.gain.value = 0.5;
      const sW       = ctx.createGain(); sW.gain.value = 1;
      const sNeg     = ctx.createGain(); sNeg.gain.value = -1;
      const lOut     = ctx.createGain(); lOut.gain.value = 1;
      const rOut     = ctx.createGain(); rOut.gain.value = 1;
      const merger   = ctx.createChannelMerger(2);

      const limiter = ctx.createDynamicsCompressor();
      limiter.threshold.value = 0;
      limiter.knee.value = 0;
      limiter.ratio.value = 1;
      limiter.attack.value = 0.003;
      limiter.release.value = 0.25;

      const boostGain = ctx.createGain(); boostGain.gain.value = 1.0;
      const fadeGain  = ctx.createGain(); fadeGain.gain.value  = 1.0;

      src.connect(low);
      low.connect(mid);
      mid.connect(high);
      high.connect(splitter);

      splitter.connect(mSum, 0); splitter.connect(mSum, 1);
      splitter.connect(sSum, 0); splitter.connect(rNeg, 1);
      rNeg.connect(sSum);

      sSum.connect(sW);
      mSum.connect(lOut); mSum.connect(rOut);
      sW.connect(lOut);   sW.connect(sNeg);   sNeg.connect(rOut);

      lOut.connect(merger, 0, 0);
      rOut.connect(merger, 0, 1);

      merger.connect(limiter);
      limiter.connect(boostGain);
      boostGain.connect(fadeGain);
      fadeGain.connect(ctx.destination);

      if (ctx.state === "suspended") { try { await ctx.resume(); } catch (e) {} }

      window.JST_AUDIO_CHAIN = {
        ctx: ctx, src: src,
        eq: { low: low, mid: mid, high: high },
        width: { mSum: mSum, sSum: sSum, sW: sW, sNeg: sNeg, lOut: lOut, rOut: rOut },
        limiter: limiter,
        boostGain: boostGain,
        fadeGain: fadeGain
      };
      applyFxNow();
      return window.JST_AUDIO_CHAIN;
    })();
    return chainPromise;
  }

  window.JST_ENSURE_CHAIN = ensureChain;
  window.JST_APPLY_FX = applyFxNow;

  function scheduleFade() {
    const chain = window.JST_AUDIO_CHAIN;
    const audio = document.getElementById("preview-player");
    const st = getSettings();
    if (!chain || !audio) return;
    const ctx = chain.ctx;
    const g = chain.fadeGain.gain;
    const now = ctx.currentTime;

    if (fadeOutTimer) { clearTimeout(fadeOutTimer); fadeOutTimer = null; }
    g.cancelScheduledValues(now);
    g.setValueAtTime(1.0, now);

    const fadeIn  = Number(st.fadeIn)  || 0;
    const fadeOut = Number(st.fadeOut) || 0;

    if (fadeIn > 0) {
      g.setValueAtTime(0, now);
      g.linearRampToValueAtTime(1, now + fadeIn);
    }

    if (fadeOut > 0 && isFinite(audio.duration) && audio.duration > audio.currentTime) {
      const remaining = audio.duration - audio.currentTime;
      if (remaining > fadeOut + 0.05) {
        fadeOutTimer = setTimeout(() => {
          if (!chain) return;
          const t = chain.ctx.currentTime;
          const cg = chain.fadeGain.gain;
          cg.cancelScheduledValues(t);
          cg.setValueAtTime(cg.value, t);
          cg.linearRampToValueAtTime(0, t + fadeOut);
        }, (remaining - fadeOut) * 1000);
      }
    }
  }

  function resetFade() {
    const chain = window.JST_AUDIO_CHAIN;
    if (fadeOutTimer) { clearTimeout(fadeOutTimer); fadeOutTimer = null; }
    if (!chain) return;
    const g = chain.fadeGain.gain;
    g.cancelScheduledValues(chain.ctx.currentTime);
    g.setValueAtTime(1.0, chain.ctx.currentTime);
  }

  window.addEventListener("jst:fx-settings-changed", applyFxNow);

  const pv = document.getElementById("preview-player");
  if (pv) {
    pv.addEventListener("play", async () => {
      try { await ensureChain(); applyFxNow(); scheduleFade(); }
      catch (e) { console.warn("[FX] chain on play:", e); }
    });
    pv.addEventListener("seeked", () => {
      resetFade();
      if (!pv.paused) scheduleFade();
    });
    pv.addEventListener("pause", () => {
      if (fadeOutTimer) { clearTimeout(fadeOutTimer); fadeOutTimer = null; }
    });
    pv.addEventListener("ended", resetFade);
  }
})();

// === v1.6.1: Global error toasts — fetch, JS, WS, heartbeat ===
(function () {
  "use strict";
  if (window.__jstErrorToasts) return;
  window.__jstErrorToasts = true;

  // 3a. Fetch wrapper — ловит HTTP 4xx/5xx и сетевые ошибки
  const _origFetch = window.fetch.bind(window);
  window.fetch = async function (...args) {
    const url = typeof args[0] === "string" ? args[0] : (args[0] && args[0].url) || "";
    const silent = url.includes("/healthz");   // heartbeat сам покажет
    try {
      const resp = await _origFetch.apply(this, args);
      if (resp.status >= 400 && resp.status !== 401 && resp.status !== 403 && !silent) {
        if (typeof showToast === "function") {
          showToast(`HTTP ${  resp.status  } ${  resp.statusText || ""  } — ${  url.replace(/^https?:\/\/[^/]+/, "")}`, "error");
        }
      }
      return resp;
    } catch (err) {
      if (typeof showToast === "function") {
        showToast(`${ti("network")  }: ${  err.message || ti("no_conn")  } — ${  url.replace(/^https?:\/\/[^/]+/, "")}`, "error");
      }
      throw err;
    }
  };

  // 3b. Global JS errors
  window.addEventListener("error", (e) => {
    if (typeof showToast !== "function") return;
    const msg = e.message || (e.error && e.error.message) || "JS error";
    showToast(`JS: ${  msg}`, "error");
  });

  // 3c. Unhandled promise rejections
  window.addEventListener("unhandledrejection", (e) => {
    if (typeof showToast !== "function") return;
    const r = e.reason;
    const msg = (r && r.message) ? r.message : String(r || "unknown");
    showToast(`Promise: ${  msg}`, "error");
  });

  // 3d. Heartbeat — раз в 60 сек проверяет /healthz, не чаще 1 toast/мин
  let _lastHealthToast = 0;
  setInterval(async () => {
    try {
      const r = await _origFetch("/healthz", { cache: "no-store" });
      if (!r.ok) {
        const now = Date.now();
        if (now - _lastHealthToast > 60000 && typeof showToast === "function") {
          showToast(`${ti("server_down")  } (healthz ${  r.status  })`, "error");
          _lastHealthToast = now;
        }
      }
    } catch (e) {
      const now = Date.now();
      if (now - _lastHealthToast > 60000 && typeof showToast === "function") {
        showToast(`${ti("server_crashed")  }: ${  e.message || "offline"}`, "error");
        _lastHealthToast = now;
      }
    }
  }, 60000);

  console.log("[JST] v1.6.1: error toasts active (fetch, JS, WS, heartbeat)");
})();


// ============================================================
// Phase 3c: PWA moved to frontend/js/pwa.js (window.__jstPwa)
// Delegates kept for backward compat — will be removed in Phase 4.
// ============================================================
function _pwaIsStandalone() { return window.__jstPwa ? window.__jstPwa._pwaIsStandalone() : false; }
function _pwaIsIOS() { return window.__jstPwa ? window.__jstPwa._pwaIsIOS() : false; }
function _pwaShowBtn() { if (window.__jstPwa) window.__jstPwa._pwaShowBtn(); }
function _pwaHideBtn() { if (window.__jstPwa) window.__jstPwa._pwaHideBtn(); }
function _pwaAttach() { if (window.__jstPwa) window.__jstPwa._pwaAttach(); }

/* JST_SHOW_PLAYER_65: показать плеер изначально */

/* ═══════════════════════════════════════════════════════════════════
   JST v66: __jstForceResetSynth() — ПОЛНЫЙ сброс состояния синтеза
   Используется для принудительного сброса зависшего is-busy / isStreaming
   ═══════════════════════════════════════════════════════════════════ */
window.__jstForceResetSynth = function(reason) {
  try {
    const b = document.getElementById('btn-synth');
    const s = document.getElementById('btn-stop');
    if (b) {
      b.classList.remove('is-busy', 'active', 'pressed');
      b.disabled = false;
    }
    if (s) {
      s.disabled = true;
    }
    // Закрываем WS
    if (window.ws) {
      try { window.ws.onclose = null; window.ws.close(); } catch(e) {}
      window.ws = null;
    }
    // Сбрасываем флаги
    window.JST_IS_STREAMING = false;
    if (typeof window.__jstResetStreaming === "function") window.__jstResetStreaming("force-reset");
    window.JST_SYNTH_START = 0;
    if (window._synthTimer) {
      clearInterval(window._synthTimer);
      window._synthTimer = null;
    }
    console.warn('[JST v66] Force reset:', reason || 'manual');
    return true;
  } catch(e) {
    console.error('[JST v66] Reset failed:', e);
    return false;
  }
};

/* Автосброс при закрытии WS без finishStreaming */
(function() {
  const _origWS = window.WebSocket;
  if (_origWS && !_origWS.__jstWrapped) {
    window.WebSocket = function(url, protocols) {
      const ws = protocols ? new _origWS(url, protocols) : new _origWS(url);
      window.ws = ws;  /* v74: глобальная ссылка для reset */
      ws.addEventListener('close', (ev) => {
        // Если WS закрыт, но streaming всё ещё true — сбрасываем через 500ms
        if (window.JST_IS_STREAMING) {
          setTimeout(() => {
            if (window.JST_IS_STREAMING && window.__jstForceResetSynth) {
              window.__jstForceResetSynth(`WS closed without finishStreaming (code ${  ev.code  })`);
            }
          }, 500);
        }
      });
      return ws;
    };
    window.WebSocket.__jstWrapped = true;
    window.WebSocket.CONNECTING = _origWS.CONNECTING;
    window.WebSocket.OPEN = _origWS.OPEN;
    window.WebSocket.CLOSING = _origWS.CLOSING;
    window.WebSocket.CLOSED = _origWS.CLOSED;
  }
})();

/* ═══════════════════════════════════════════════════════════════════
   v76: ГАРАНТИРОВАННЫЙ handler для #btn-stop
   ═══════════════════════════════════════════════════════════════════ */

/* v76: если идёт синтез — btn-stop ОБЯЗАТЕЛЬНО enabled */
