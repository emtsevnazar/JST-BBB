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
let currentMode = localStorage.getItem("jst-mode") || "core"; window.currentMode = currentMode;
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
  // v1.1.22: экспортируем в window для ui-buttons.js
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
  // v1.1.24 FIX: bindUI ДО await load*() — чтобы кнопки привязались даже
  // если fetch load*() упадёт (500/404/offline). Иначе init() прерывается
  // и ВСЕ кнопки (btn-random, carousel, help-toggle, upload) мертвы.
  try { bindUI(); } catch(e) { console.error("[init] bindUI:", e); }
  // v1.1.24: каждый load* в отдельном try/catch — одно падение не блокирует rest
  try { await loadModels(); console.log("[JST] models loaded:", MODELS.length); }
  catch(e) { console.warn("[init] loadModels failed:", e); MODELS = []; window.MODELS = []; }
  try { await loadVoices(); } catch(e) { console.warn("[init] loadVoices failed:", e); }
  try { await loadPresets(); } catch(e) { console.warn("[init] loadPresets failed:", e); }
  try { await loadMoods(); } catch(e) { console.warn("[init] loadMoods failed:", e); }
  try { rebuildModelCarousel(); } catch(e) { console.error(e); }
  try { updateModelInfo(); } catch(e) { console.error(e); }
  try { renderLanguages(); } catch(e) { console.error(e); }
  try { rebuildCarousel(); } catch(e) { console.error(e); }
  try { rebuildAccents(); } catch(e) { console.error(e); }
  // bindUI уже вызван выше (v1.1.24)
  // v1.1.23: lang restore после bindUI (ui-features/instruction могут менять LANG)
  try {
    const _savedLang = localStorage.getItem("jst-lang");
    if (_savedLang && typeof applyLanguage === "function") {
      applyLanguage(_savedLang);
      if (typeof renderLanguages === "function") renderLanguages();
    }
  } catch(e) { console.warn("[JST] lang restore failed:", e); }
  // v1.1.22: экспорт uploadVoice в window
  if (typeof uploadVoice === "function") window.uploadVoice = uploadVoice;
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
// v1.1.0 FX settings UI IIFE вынесена в modules/fx-settings.js (app.js -56 строк)

// === v1.1.2: restore last audio on reload ===

// === v1.2.0: Shared Web Audio chain — EQ + Width + Mono + Limiter + Fade ===
// v1.2.0 Web Audio chain IIFE вынесена в modules/web-audio-chain.js (app.js -176 строк)

// === v1.6.1: Global error toasts — fetch, JS, WS, heartbeat ===
// v1.6.1 Global error toasts IIFE вынесена в modules/error-toasts.js (app.js -64 строк)


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
