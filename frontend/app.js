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
(function () {
  "use strict";

  const isNight = () => document.documentElement.getAttribute("data-theme") === "night";
  const COLOR = {
    day:      { idle: "#1a2a5e",              playing: "#F5B800", playhead: "#1a2a5e" },
    night:    { idle: "rgba(245,184,0,0.55)", playing: "#FFD700", playhead: "#F5B800" },
    contrast: { idle: "#000000",              playing: "#000000", playhead: "#000000" },
  };
  let isPlayingState = false;

  let audio, player, canvas, ctx, progressEl, wrap;
  let curEl, totEl, playBtn, iconPlay, iconPause;
  let back5, fwd5, restart, vol, rate;
  let peakData = null, peakSrc = null, isDragging = false, dpr = 1;

  // === v0.9.1-fix: performance caches ===
  let _ptsCache = null;
  let _ptsKey = "";
  let _gradCache = null;
  let _gradKey = "";
  let _drawScheduled = false;

  function _buildPtsKey() {
    if (!peakData) return "";
    const w = canvas ? canvas.width : 0;
    const h = canvas ? canvas.height : 0;
    return `${peakSrc || ""  }|${  w  }|${  h  }|${  PLAYER_SETTINGS.scale || 1}`;
  }
  function _ensurePts() {
    const key = _buildPtsKey();
    if (_ptsKey === key && _ptsCache) return;
    _ptsKey = key;
    if (!peakData) { _ptsCache = null; return; }
    const peaks = peakData.data;
    const n = peaks.length;
    const w = canvas.width, h = canvas.height;
    const mid = h / 2;
    const amp = h * 0.42 * (PLAYER_SETTINGS.scale || 1.0);
    const arr = new Float32Array(n * 2);
    for (let i = 0; i < n; i++) {
      arr[i * 2] = (i / Math.max(1, n - 1)) * w;
      arr[i * 2 + 1] = mid - peaks[i] * amp;
    }
    _ptsCache = arr;
  }
  function _buildPath(target) {
    const p = _ptsCache;
    if (!p) return;
    const n = p.length / 2;
    target.beginPath();
    target.moveTo(p[0], p[1]);
    for (let i = 1; i < n - 1; i++) {
      const x = p[i * 2], y = p[i * 2 + 1];
      const x2 = p[(i + 1) * 2], y2 = p[(i + 1) * 2 + 1];
      target.quadraticCurveTo(x, y, (x + x2) / 2, (y + y2) / 2);
    }
    target.lineTo(p[(n - 1) * 2], p[(n - 1) * 2 + 1]);
  }
  function _makeGradient(ratio) {
    const rounded = Math.round(ratio * 200) / 200;
    const key = `${rounded  }|${  isNight() ? "n" : "d"}`;
    if (_gradCache && _gradKey === key) return _gradCache;
    const w = canvas.width;
    const c = isNight() ? COLOR.night : COLOR.day;
    const g = ctx.createLinearGradient(0, 0, w, 0);
    if (ratio <= 0.0001) { g.addColorStop(0, c.idle); g.addColorStop(1, c.idle); }
    else if (ratio >= 0.9999) { g.addColorStop(0, c.playing); g.addColorStop(1, c.playing); }
    else {
      const p1 = Math.max(0, ratio - 0.003);
      const p2 = Math.min(1, ratio + 0.003);
      g.addColorStop(0, c.playing);
      g.addColorStop(p1, c.playing);
      g.addColorStop(p2, c.idle);
      g.addColorStop(1, c.idle);
    }
    _gradCache = g;
    _gradKey = key;
    return g;
  }
  function scheduleDraw() {
    if (_drawScheduled) return;
    _drawScheduled = true;
    requestAnimationFrame(() => {
      _drawScheduled = false;
      drawWave(audio.currentTime || 0);
    });
  }

  // === v0.9.2: плавный playhead через rAF loop ===
  let _animFrameId = null;
  function _startAnimLoop() {
    if (_animFrameId) return;
    const tick = () => {
      if (!audio || audio.paused || audio.ended) {
        _animFrameId = null;
        return;
      }
      const _d = audio.duration || 0;
      const _c = audio.currentTime || 0;
      if (progressEl && _d > 0) {
        progressEl.style.width = `${(_c / _d * 100).toFixed(2)  }%`;
      }
      if (curEl) curEl.textContent = fmt(_c);
      try { drawWave(_c); } catch (e) { /* */ }
      _animFrameId = requestAnimationFrame(tick);
    };
    _animFrameId = requestAnimationFrame(tick);
  }
  function _stopAnimLoop() {
    if (_animFrameId) {
      cancelAnimationFrame(_animFrameId);
      _animFrameId = null;
    }
  }
  function invalidateWaveCache() {
    _ptsKey = "";
    _gradKey = "";
  }

  const PLAYER_SETTINGS = {
    style: "neon",
    thickness: 2,
    grid: true,
    scale: 1.0,
    opacity: 1.0,
    fill: false,
    glow: 14,
  };

  function loadPlayerSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem("jstp-settings") || "{}");
      Object.assign(PLAYER_SETTINGS, saved);
    } catch (e) { /* ignore */ }
  }
  function savePlayerSettings() {
    try {
      localStorage.setItem("jstp-settings", JSON.stringify(PLAYER_SETTINGS));
    } catch (e) { /* ignore */ }
  }
  loadPlayerSettings();

  function fmt(sec) {
    if (!isFinite(sec) || sec < 0) sec = 0;
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m  }:${  s < 10 ? "0" : ""  }${s}`;
  }

  function ensure() {
    audio = document.getElementById("preview-player");
    player = document.getElementById("jst-player");
    canvas = document.getElementById("waveform");
    curEl = document.getElementById("jstp-cur");
    totEl = document.getElementById("jstp-tot");
    playBtn = document.getElementById("jstp-play");
    iconPlay = document.getElementById("jstp-icon-play");
    iconPause = document.getElementById("jstp-icon-pause");
    back5 = document.getElementById("jstp-back5");
    fwd5 = document.getElementById("jstp-fwd5");
    restart = document.getElementById("jstp-restart");
    vol = document.getElementById("jstp-vol");
    rate = document.getElementById("jstp-rate");
    progressEl = document.getElementById("jstp-progress");
    wrap = document.getElementById("jstp-wave-wrap");
    if (canvas && !ctx) ctx = canvas.getContext("2d");
    return audio && player && canvas && wrap;
  }

  function resizeCanvas() {
    if (!canvas || !wrap) return;
    dpr = window.devicePixelRatio || 1;
    const rect = wrap.getBoundingClientRect();
    const w = Math.max(100, Math.floor(rect.width * dpr));
    const h = Math.max(60, Math.floor(rect.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }

  async function buildPeaks() {
    if (!audio || !audio.src) return;
    if (peakSrc === audio.src && peakData) return;
    peakSrc = audio.src;
    peakData = null;
    try {
      const resp = await fetch(audio.src);
      const ab = await resp.arrayBuffer();
      // v1.6.5-player: закрываем временный AudioContext после decode
      const actx = new (window.AudioContext || window.webkitAudioContext)();
      let buf;
      try {
        buf = await actx.decodeAudioData(ab);
      } finally {
        try { await actx.close(); } catch (e) {}
      }
      const ch = buf.getChannelData(0);
      const nBars = Math.min(1600, Math.max(200, Math.floor(ch.length / 200)));
      const block = Math.floor(ch.length / nBars) || 1;
      const peaks = new Float32Array(nBars);
      for (let i = 0; i < nBars; i++) {
        let mx = 0;
        const s = i * block;
        const e = Math.min(s + block, ch.length);
        for (let j = s; j < e; j += 8) {
          const v = Math.abs(ch[j]);
          if (v > mx) mx = v;
        }
        peaks[i] = mx;
      }
      let pmax = 0.001;
      for (let i = 0; i < nBars; i++) if (peaks[i] > pmax) pmax = peaks[i];
      for (let i = 0; i < nBars; i++) peaks[i] /= pmax;
      peakData = { data: peaks };
      resizeCanvas();
      drawWave(audio.currentTime || 0);
    } catch (e) {
      // silent
    }
  }

  function drawWave(currentTime) {
    if (!canvas || !ctx) return;
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    if (!peakData) return;

    const night = isNight();
    const c = night ? COLOR.night : COLOR.day;
    const idleColor = c.idle;
    const playedColor = c.playing;
    const headColor = c.playhead;

    const peaks = peakData.data;
    const n = peaks.length;
    const dur = audio && isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0;
    const ratio = dur > 0 ? Math.max(0, Math.min(1, currentTime / dur)) : 0;
    const progressX = w * ratio;
    const mid = h / 2;
    const amp = h * 0.42 * (PLAYER_SETTINGS.scale || 1.0);
    const alpha = PLAYER_SETTINGS.opacity || 1.0;
    const thickness = Math.max(1, PLAYER_SETTINGS.thickness || 2);
    const glow = Math.max(0, PLAYER_SETTINGS.glow != null ? PLAYER_SETTINGS.glow : 14);
    const style = PLAYER_SETTINGS.style || "neon";

    // === Сетка ===
    if (PLAYER_SETTINGS.grid) {
      ctx.save();
      ctx.strokeStyle = __jstContrast() ? "rgba(0,0,0,0.05)" : (night ? "rgba(245,184,0,0.05)" : "rgba(26,42,94,0.05)");
      ctx.lineWidth = 1;
      const cols = 12, rows = 4;
      for (let gi = 1; gi < cols; gi++) {
        const gx = (w / cols) * gi;
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
      }
      for (let gj = 1; gj < rows; gj++) {
        const gy = (h / rows) * gj;
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
      }
      ctx.restore();
    }

    // === Геометрия волны ===
    const pts = [];
    for (let i = 0; i < n; i++) {
      const x = (i / Math.max(1, n - 1)) * w;
      const y = mid - peaks[i] * amp;
      pts.push({ x, y });
    }

    // === Градиент: слева playedColor, справа idleColor, граница на progressX ===
    function makeGradient() {
      const g = ctx.createLinearGradient(0, 0, w, 0);
      if (ratio <= 0.0001) {
        g.addColorStop(0, idleColor);
        g.addColorStop(1, idleColor);
      } else if (ratio >= 0.9999) {
        g.addColorStop(0, playedColor);
        g.addColorStop(1, playedColor);
      } else {
        const p1 = Math.max(0, ratio - 0.003);
        const p2 = Math.min(1, ratio + 0.003);
        g.addColorStop(0, playedColor);
        g.addColorStop(p1, playedColor);
        g.addColorStop(p2, idleColor);
        g.addColorStop(1, idleColor);
      }
      return g;
    }

    function buildPath(target) {
      if (pts.length < 2) return;
      target.beginPath();
      target.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length - 1; i++) {
        const xc = (pts[i].x + pts[i + 1].x) / 2;
        const yc = (pts[i].y + pts[i + 1].y) / 2;
        target.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
      }
      target.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    }

    const grad = makeGradient();

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    // ============================================
    // BARS — столбики, цвет по X-позиции
    // ============================================
    if (style === "bars") {
      ctx.shadowColor = "#FFF6C0";
      ctx.shadowBlur = glow * 0.5;
      const barW = w / n;
      for (let i = 0; i < n; i++) {
        const px = i * barW;
        const v = peaks[i] * mid * 0.92;
        ctx.fillStyle = (px < progressX) ? playedColor : idleColor;
        ctx.fillRect(px, mid - v, Math.max(1, barW * 0.7), v * 2);
      }
    }
    // ============================================
    // DOTS — точки
    // ============================================
    else if (style === "dots") {
      ctx.shadowColor = "#FFF6C0";
      ctx.shadowBlur = glow * 0.6;
      const step = Math.max(1, Math.floor(n / 180));
      for (let i = 0; i < n; i += step) {
        const x = (i / Math.max(1, n - 1)) * w;
        const y = mid - peaks[i] * amp;
        const y2 = mid + peaks[i] * amp;
        ctx.fillStyle = (x < progressX) ? playedColor : idleColor;
        ctx.beginPath(); ctx.arc(x, y, Math.max(1.2, thickness - 0.5), 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x, y2, Math.max(1.2, thickness - 0.5), 0, Math.PI * 2); ctx.fill();
      }
    }
    // ============================================
    // RIBBON — закрашенная лента (fill тоже с градиентом)
    // ============================================
    else if (style === "ribbon") {
      ctx.shadowColor = "#FFF6C0";
      ctx.shadowBlur = glow * 0.5;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length - 1; i++) {
        const xc = (pts[i].x + pts[i + 1].x) / 2;
        const yc = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
      }
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      ctx.lineTo(pts[pts.length - 1].x, h - pts[pts.length - 1].y);
      for (let i = pts.length - 2; i > 0; i--) {
        const xc = (pts[i].x + pts[i - 1].x) / 2;
        const yc = ((h - pts[i].y) + (h - pts[i - 1].y)) / 2;
        ctx.quadraticCurveTo(pts[i].x, h - pts[i].y, xc, yc);
      }
      ctx.lineTo(pts[0].x, h - pts[0].y);
      ctx.closePath();
      ctx.globalAlpha = alpha * 0.4;
      ctx.fillStyle = grad;
      ctx.fill();
    }
    // ============================================
    // STEP — ступеньки (stroke с градиентом)
    // ============================================
    else if (style === "step") {
      ctx.shadowColor = "#FFF6C0";
      ctx.shadowBlur = Math.max(0, glow / 2);
      ctx.lineWidth = thickness;
      ctx.strokeStyle = grad;
      const stepSize = 8;
      ctx.beginPath();
      let py = mid - (peaks[0] || 0) * amp;
      ctx.moveTo(0, py);
      for (let sx = stepSize; sx <= w; sx += stepSize) {
        const idx = Math.min(n - 1, Math.floor((sx / w) * n));
        py = mid - (peaks[idx] || 0) * amp;
        ctx.lineTo(sx, py);
      }
      ctx.stroke();
      ctx.beginPath();
      py = mid + (peaks[0] || 0) * amp;
      ctx.moveTo(0, py);
      for (let sx = stepSize; sx <= w; sx += stepSize) {
        const idx = Math.min(n - 1, Math.floor((sx / w) * n));
        py = mid + (peaks[idx] || 0) * amp;
        ctx.lineTo(sx, py);
      }
      ctx.stroke();
    }
    // ============================================
    // LINE / MIRROR / NEON — плавная кривая с градиентом
    // ============================================
    else {
      ctx.shadowColor = "#FFF6C0";
      ctx.shadowBlur = glow;
      ctx.strokeStyle = grad;
      ctx.lineWidth = thickness;
      buildPath(ctx); ctx.stroke();

      if (style !== "mirror") {
        // Зеркальная нижняя половина
        ctx.save();
        ctx.translate(0, h);
        ctx.scale(1, -1);
        buildPath(ctx); ctx.stroke();
        ctx.restore();
      }

      if (style === "neon") {
        // Светлая сердцевина (тоже с градиентом, но светлее)
        function makeCoreGradient() {
          const g = ctx.createLinearGradient(0, 0, w, 0);
          const lightPlayed = "#FFF6C0";
        const lightIdle = "#FFF6C0";
          if (ratio <= 0.0001) {
            g.addColorStop(0, lightIdle);
            g.addColorStop(1, lightIdle);
          } else if (ratio >= 0.9999) {
            g.addColorStop(0, lightPlayed);
            g.addColorStop(1, lightPlayed);
          } else {
            const p1 = Math.max(0, ratio - 0.003);
            const p2 = Math.min(1, ratio + 0.003);
            g.addColorStop(0, lightPlayed);
            g.addColorStop(p1, lightPlayed);
            g.addColorStop(p2, lightIdle);
            g.addColorStop(1, lightIdle);
          }
          return g;
        }
        ctx.shadowBlur = Math.max(2, glow / 2);
        ctx.strokeStyle = makeCoreGradient();
        ctx.lineWidth = Math.max(1, thickness - 0.8);
        buildPath(ctx); ctx.stroke();
        ctx.save();
        ctx.translate(0, h);
        ctx.scale(1, -1);
        buildPath(ctx); ctx.stroke();
        ctx.restore();
      }
    }
    ctx.restore();

    // === Ось по центру ===
    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.strokeStyle = idleColor;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(w, mid); ctx.stroke();
    ctx.restore();

    // === Playhead ===
    if (dur > 0) {
      ctx.save();
      ctx.strokeStyle = headColor;
      ctx.lineWidth = Math.max(1.5, w / 800);
      ctx.globalAlpha = 0.9;
      ctx.shadowColor = "#FFF6C0";
      ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.moveTo(progressX, 0); ctx.lineTo(progressX, h); ctx.stroke();

      const r = Math.max(5, w / 220);
      ctx.shadowBlur = 14;
      ctx.fillStyle = headColor;
      ctx.beginPath(); ctx.arc(progressX, h / 2, r, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = night ? "#0d1a3f" : "#ffffff";
      ctx.beginPath(); ctx.arc(progressX, h / 2, r * 0.45, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }

  function setPlayingUI(playing) {
    if (!iconPlay || !iconPause) return;
    iconPlay.style.display = playing ? "none" : "";
    iconPause.style.display = playing ? "" : "none";
  }

  function seekFromEvent(ev) {
    if (!audio || !audio.duration) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = (ev.touches && ev.touches[0]) ? ev.touches[0].clientX : ev.clientX;
    const x = clientX - rect.left;
    const frac = Math.max(0, Math.min(1, x / rect.width));
    audio.currentTime = frac * audio.duration;
    drawWave(audio.currentTime);
  }

  function showPlayer() {
    if (player) {
      player.classList.add("visible");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          try {
            resizeCanvas();
            drawWave(audio.currentTime || 0);
          } catch (e) { /* */ }
        });
      });
    }
  }
  function hidePlayer() {
    if (player) player.classList.remove("visible");
  }

  function loadAudioFromUrl(url, text) {
    if (!url) return;
    try { localStorage.setItem("jstp-last-audio", JSON.stringify({ url, text: text || "" })); } catch (e) {}
    audio.src = url;
    audio.load();
    const fnEl = document.getElementById("jstp-filename");
    if (fnEl) {
      const name = url.split("/").pop() || "";
      fnEl.textContent = name;
      fnEl.title = name;
    }
    if (typeof text === "string" && text) {
      const ta = document.getElementById("text");
      if (ta) ta.value = text;
    }
    showPlayer();
    // waveform сброшен — новый src, дождёмся canplay/loadedmetadata
    peakSrc = null;
    peakData = null;
  }

  function bind() {
    if (!ensure()) return;

    playBtn.addEventListener("click", () => {
      if (audio.paused) audio.play().catch(() => {});
      else audio.pause();
    });
    back5.addEventListener("click", () => { audio.currentTime = Math.max(0, audio.currentTime - 5); });
    fwd5.addEventListener("click", () => { audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 5); });
    restart.addEventListener("click", () => { audio.currentTime = 0; });

    vol.addEventListener("input", () => { audio.volume = parseFloat(vol.value); });
    rate.addEventListener("change", () => { audio.playbackRate = parseFloat(rate.value); });

    // v1.6.5-player: pointer events — один seek на клик
    let _seekDownX = null;
    canvas.addEventListener("pointerdown", (ev) => {
      isDragging = true;
      _seekDownX = ev.clientX;
      try { canvas.setPointerCapture(ev.pointerId); } catch (e) {}
      seekFromEvent(ev);
    });
    canvas.addEventListener("pointermove", (ev) => {
      if (!isDragging) return;
      if (_seekDownX !== null && Math.abs(ev.clientX - _seekDownX) < 2) return;
      seekFromEvent(ev);
    });
    canvas.addEventListener("pointerup", (ev) => {
      isDragging = false;
      _seekDownX = null;
      try { canvas.releasePointerCapture(ev.pointerId); } catch (e) {}
    });
    canvas.addEventListener("pointercancel", () => {
      isDragging = false;
      _seekDownX = null;
    });
    window.addEventListener("mousemove", (ev) => { if (isDragging) seekFromEvent(ev); });
    window.addEventListener("mouseup", () => { isDragging = false; });

    audio.addEventListener("loadedmetadata", () => {
      showPlayer();
      totEl.textContent = fmt(audio.duration);
      curEl.textContent = "0:00";
      progressEl.style.width = "0%";
      resizeCanvas();
      buildPeaks();
    });

    audio.addEventListener("play", () => {
      isPlayingState = true;
      setPlayingUI(true);
      buildPeaks();
      _startAnimLoop();
    });
    audio.addEventListener("pause", () => {
      isPlayingState = false;
      setPlayingUI(false);
      _stopAnimLoop();
      drawWave(audio.currentTime || 0);
    });
    audio.addEventListener("ended", () => {
      isPlayingState = false;
      setPlayingUI(false);
      _stopAnimLoop();
      drawWave(audio.duration || 0);
    });
    audio.addEventListener("volumechange", () => { vol.value = audio.volume; });

    audio.addEventListener("seeked", () => {
      const cur = audio.currentTime || 0;
      const dur = audio.duration || 0;
      if (dur > 0 && progressEl) {
        progressEl.style.width = `${(cur / dur * 100).toFixed(2)  }%`;
      }
      if (curEl) curEl.textContent = fmt(cur);
      if (audio.paused) drawWave(cur);
    });

    audio.addEventListener("timeupdate", () => {
      const dur = audio.duration || 0;
      const cur = audio.currentTime || 0;
      if (totEl && dur > 0) totEl.textContent = fmt(dur);
      // При play progressEl и curEl обновляются в _startAnimLoop (60fps).
      // Здесь — только fallback для paused (после seek например).
      if (audio.paused) {
        if (curEl) curEl.textContent = fmt(cur);
        if (progressEl && dur > 0) progressEl.style.width = `${(cur / dur * 100).toFixed(2)  }%`;
      }
    });

    window.addEventListener("resize", () => {
      resizeCanvas();
      if (peakData) drawWave(audio.currentTime || 0);
    });

    // Hook на историю — клик по записи открывает её в плеере
    const hist = document.getElementById("history");
    if (hist) {
      hist.addEventListener("click", (ev) => {
        const row = ev.target.closest("[data-file], [data-output]");
        if (!row) return;
        const file = row.getAttribute("data-file") || row.getAttribute("data-output");
        const text = row.getAttribute("data-text") || "";
        if (!file) return;
        const url = file.startsWith("/") || file.startsWith("http")
          ? file
          : `/output/${  file}`;
        loadAudioFromUrl(url, text);
        ev.preventDefault();
      });
    }

    // Кастомный event для внешних вызовов (например, после синтеза)
    // === Loop ===
    const loopBtn = document.getElementById("jstp-loop");
    if (loopBtn) {
      loopBtn.addEventListener("click", () => {
        audio.loop = !audio.loop;
        loopBtn.classList.toggle("active", audio.loop);
      });
    }

    // === Boost (Web Audio, +2.5x) — shared chain с EQ ===
    let boostOn = false;
    const boostBtn = document.getElementById("jstp-boost");
    if (boostBtn) {
      boostBtn.addEventListener("click", async () => {
        try {
          const ensure = window.JST_ENSURE_CHAIN;
          if (typeof ensure !== "function") throw new Error("chain API not ready");
          const chain = await ensure();
          if (chain.ctx.state === "suspended") chain.ctx.resume();
          boostOn = !boostOn;
          chain.boostGain.gain.value = boostOn ? 2.5 : 1.0;
          boostBtn.classList.toggle("active", boostOn);
        } catch (e) {
          console.warn("Boost недоступен:", e);
        }
      });
    }

    // === Filename ===
    const filenameEl = document.getElementById("jstp-filename");

    // === Preserve pitch ===
    const preserveBtn = document.getElementById("jstp-preserve");
    if (preserveBtn) {
      const getP = () => {
        if ("preservesPitch" in audio) return audio.preservesPitch;
        if ("mozPreservesPitch" in audio) return audio.mozPreservesPitch;
        if ("webkitPreservesPitch" in audio) return audio.webkitPreservesPitch;
        return true;
      };
      const setP = (v) => {
        if ("preservesPitch" in audio) audio.preservesPitch = v;
        if ("mozPreservesPitch" in audio) audio.mozPreservesPitch = v;
        if ("webkitPreservesPitch" in audio) audio.webkitPreservesPitch = v;
      };
      setP(true);
      preserveBtn.classList.add("active");
      preserveBtn.addEventListener("click", () => {
        const next = !getP();
        setP(next);
        preserveBtn.classList.toggle("active", next);
        preserveBtn.title = next ? t("pitch_kept") : t("pitch_changes");
      });
    }

    // === Download from player ===
    const dlBtn = document.getElementById("jstp-download");
    if (dlBtn) {
      dlBtn.addEventListener("click", () => {
        if (!audio || !audio.src) return;
        const a = document.createElement("a");
        a.href = audio.src;
        a.download = audio.src.split("/").pop() || "audio.wav";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
    }

    // === Keyboard shortcuts ===
    document.addEventListener("keydown", (ev) => {
      const tag = (ev.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      if (!player || !player.classList.contains("visible")) return;
      if (ev.code === "Space") {
        ev.preventDefault();
        if (audio.paused) audio.play().catch(() => {});
        else audio.pause();
      } else if (ev.code === "ArrowLeft") {
        ev.preventDefault();
        audio.currentTime = Math.max(0, audio.currentTime - 5);
      } else if (ev.code === "ArrowRight") {
        ev.preventDefault();
        audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 5);
      } else if (ev.code === "ArrowUp") {
        ev.preventDefault();
        audio.volume = Math.min(1, audio.volume + 0.1);
        if (vol) vol.value = audio.volume;
      } else if (ev.code === "ArrowDown") {
        ev.preventDefault();
        audio.volume = Math.max(0, audio.volume - 0.1);
        if (vol) vol.value = audio.volume;
      }
    });

    // === Player settings panel (всегда видимая) ===
    const optStyle = document.getElementById("jstp-opt-style");
    const optThickness = document.getElementById("jstp-opt-thickness");
    const optGrid = document.getElementById("jstp-opt-grid");
    const optScale = document.getElementById("jstp-opt-scale");
    const optScaleVal = document.getElementById("jstp-opt-scale-val");
    const optOpacity = document.getElementById("jstp-opt-opacity");
    const optOpacityVal = document.getElementById("jstp-opt-opacity-val");

    function syncSettingsUI() {
      if (optStyle) optStyle.value = PLAYER_SETTINGS.style;
      if (optThickness) optThickness.value = String(PLAYER_SETTINGS.thickness);
      {const _tv = document.getElementById("jstp-opt-thickness-val"); if (_tv) _tv.textContent = String(PLAYER_SETTINGS.thickness);}
      if (optGrid) optGrid.checked = !!PLAYER_SETTINGS.grid;
      if (optScale) optScale.value = String(PLAYER_SETTINGS.scale);
      if (optScaleVal) optScaleVal.textContent = `${Number(PLAYER_SETTINGS.scale).toFixed(1)  }×`;
      if (optOpacity) optOpacity.value = String(PLAYER_SETTINGS.opacity);
      if (optOpacityVal) optOpacityVal.textContent = `${Math.round(PLAYER_SETTINGS.opacity * 100)  }%`;
    }
    syncSettingsUI();

    function redraw() {
      invalidateWaveCache();
      savePlayerSettings();
      try { drawWave(audio.currentTime || 0); } catch (e) { /* */ }
    }

    if (optStyle) optStyle.addEventListener("change", () => {
      PLAYER_SETTINGS.style = optStyle.value; redraw();
    });
    const optThicknessVal = document.getElementById("jstp-opt-thickness-val");
    if (optThicknessVal) optThicknessVal.textContent = String(PLAYER_SETTINGS.thickness);
    if (optThickness) optThickness.addEventListener("input", () => {
      PLAYER_SETTINGS.thickness = parseInt(optThickness.value, 10) || 2;
      if (optThicknessVal) optThicknessVal.textContent = String(PLAYER_SETTINGS.thickness);
      redraw();
    });
    if (optGrid) optGrid.addEventListener("change", () => {
      PLAYER_SETTINGS.grid = optGrid.checked; redraw();
    });
    if (optScale) optScale.addEventListener("input", () => {
      PLAYER_SETTINGS.scale = parseFloat(optScale.value) || 1;
      if (optScaleVal) optScaleVal.textContent = `${PLAYER_SETTINGS.scale.toFixed(1)  }×`;
      redraw();
    });
        const optGlow = document.getElementById("jstp-opt-glow");
    const optGlowVal = document.getElementById("jstp-opt-glow-val");
    if (optGlow) {
      if (optGlowVal) optGlowVal.textContent = String(PLAYER_SETTINGS.glow);
      optGlow.value = String(PLAYER_SETTINGS.glow);
      optGlow.addEventListener("input", () => {
        PLAYER_SETTINGS.glow = parseInt(optGlow.value, 10) || 0;
        if (optGlowVal) optGlowVal.textContent = String(PLAYER_SETTINGS.glow);
        redraw();
      });
    }
if (optOpacity) optOpacity.addEventListener("input", () => {
      PLAYER_SETTINGS.opacity = parseFloat(optOpacity.value) || 1;
      if (optOpacityVal) optOpacityVal.textContent = `${Math.round(PLAYER_SETTINGS.opacity * 100)  }%`;
      redraw();
    });

    // === Шестерёнка: toggle #jstp-settings ===
    const settingsToggle = document.getElementById("jstp-settings-toggle");
    const settingsPanel = document.getElementById("jstp-settings");
    if (settingsToggle && settingsPanel) {
      settingsToggle.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const vis = settingsPanel.classList.toggle("visible");
        settingsToggle.classList.toggle("active", vis);
      });
      document.addEventListener("click", (ev) => {
        if (!settingsPanel.classList.contains("visible")) return;
        if (settingsPanel.contains(ev.target)) return;
        if (settingsToggle.contains(ev.target)) return;
        settingsPanel.classList.remove("visible");
        settingsToggle.classList.remove("active");
      });
    }

    window.addEventListener("jst:load-audio", (ev) => {
      const { url, text } = ev.detail || {};
      loadAudioFromUrl(url, text);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }

  // === P6.14-fix8: Player i18n ===
  const PLAYER_I18N = {
    ru: {
      restart: "В начало", back5: "-5 сек", play: "Play/Pause", fwd5: "+5 сек",
      loop: "Зациклить", boost: "Усилить ×2.5", preserve: "Питч сохраняется",
      download: "Скачать файл", filename: "Текущий файл",
      style: "Стиль", thickness: "Толщина", grid: "Сетка",
      scale: "Масштаб", opacity: "Прозрачность", glow: "Свечение",
      s_neon: "Неон", s_line: "Линия", s_mirror: "Только верх",
      s_bars: "Бары", s_dots: "Точки", s_step: "Ступеньки", s_ribbon: "Лента",
    },
    en: {
      restart: "Restart", back5: "-5s", play: "Play/Pause", fwd5: "+5s",
      loop: "Loop", boost: "Boost ×2.5", preserve: "Preserve pitch",
      download: "Download", filename: "Current file",
      style: "Style", thickness: "Thickness", grid: "Grid",
      scale: "Scale", opacity: "Opacity", glow: "Glow",
      s_neon: "Neon", s_line: "Line", s_mirror: "Top only",
      s_bars: "Bars", s_dots: "Dots", s_step: "Step", s_ribbon: "Ribbon",
    },
  };

  function detectPlayerLang() {
    const l = (document.documentElement.getAttribute("lang") ||
               document.documentElement.getAttribute("data-lang") ||
               localStorage.getItem("lang") ||
               localStorage.getItem("i18n-lang") ||
               "ru").slice(0, 2).toLowerCase();
    return l === "en" ? "en" : "ru";
  }

  function applyPlayerLang() {
    const dict = PLAYER_I18N[detectPlayerLang()];
    const setTitle = (id, key) => {
      const el = document.getElementById(id);
      if (!el || !dict[key]) return;
      el.title = dict[key];
      el.setAttribute("aria-label", dict[key]);
    };
    setTitle("jstp-restart", "restart");
    setTitle("jstp-back5", "back5");
    setTitle("jstp-play", "play");
    setTitle("jstp-fwd5", "fwd5");
    setTitle("jstp-loop", "loop");
    setTitle("jstp-boost", "boost");
    setTitle("jstp-preserve", "preserve");
    setTitle("jstp-download", "download");

    const setLabel = (inputId, key) => {
      const input = document.getElementById(inputId);
      if (!input || !dict[key]) return;
      const item = input.closest(".jstp-set-item");
      if (!item) return;
      const lbl = item.querySelector(".jstp-set-label");
      if (!lbl) return;
      const em = lbl.querySelector("em");
      if (em) {
        for (const node of lbl.childNodes) {
          if (node.nodeType === 3) {
            node.textContent = `${dict[key]  } `;
            break;
          }
        }
      } else {
        lbl.textContent = dict[key];
      }
    };
    setLabel("jstp-opt-style", "style");
    setLabel("jstp-opt-thickness", "thickness");
    setLabel("jstp-opt-grid", "grid");
    setLabel("jstp-opt-scale", "scale");
    setLabel("jstp-opt-opacity", "opacity");
    setLabel("jstp-opt-glow", "glow");

    const setOpt = (sel, key) => {
      if (!dict[key]) return;
      document.querySelectorAll(sel).forEach(o => { o.textContent = dict[key]; });
    };
    // v1.10.70: явные setLabel для 6 меток (могут отсутствовать)
    setLabel("jstp-style", "style");
    setLabel("jstp-thickness", "thickness");
    setLabel("jstp-grid", "grid");
    setLabel("jstp-scale", "scale");
    setLabel("jstp-opacity", "opacity");
    setLabel("jstp-glow", "glow");
    setOpt('option[value="neon"]', "s_neon");
    setOpt('option[value="line"]', "s_line");
    setOpt('option[value="mirror"]', "s_mirror");
    setOpt('option[value="bars"]', "s_bars");
    setOpt('option[value="dots"]', "s_dots");
    setOpt('option[value="step"]', "s_step");
    setOpt('option[value="ribbon"]', "s_ribbon");
  }

  setTimeout(applyPlayerLang, 100);
  setTimeout(applyPlayerLang, 800);
  try {
    const langObs = new MutationObserver(() => applyPlayerLang());
    langObs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang", "data-lang"],
    });
  } catch (e) { /* ignore */ }


  // === v0.9.0: freeze play button base colors ===
  function freezePlayButton() {
    const p = document.getElementById("jstp-play");
    if (!p) return;

    const capture = () => {
      if (p.matches(":hover") || p.matches(":active") || p.matches(":focus")) return false;
      // force reflow while not hovered
      void p.offsetHeight;
      const cs = window.getComputedStyle(p);
      document.documentElement.style.setProperty("--jstp-play-bg", cs.backgroundColor);
      document.documentElement.style.setProperty("--jstp-play-fg", cs.color);
      document.documentElement.style.setProperty("--jstp-play-bd", cs.borderTopColor);
      document.body.classList.add("jstp-play-frozen");
      return true;
    };

    if (!capture()) {
      p.addEventListener("mouseleave", capture, { once: true });
      p.addEventListener("blur", capture, { once: true });
      p.addEventListener("touchend", capture, { once: true });
    }

    // Re-capture on theme switch
    const themeObs = new MutationObserver(() => setTimeout(capture, 60));
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  }

  setTimeout(freezePlayButton, 300);
})();

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
