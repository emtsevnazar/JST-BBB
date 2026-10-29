/* JST Studio v5.0 — clean rebuild */

const I18N = {
  ru: {
    mood:"Настроение",
    batch:"Пакет", batch_lang:"Язык", text_ph:"Введите текст…", synth_wait:"Идёт синтез — подождите", batch_title:"Пакетный синтез", batch_text:"Текст",
    batch_voice:"Голос", batch_model:"Модель", batch_settings:"Настройки",
    batch_adv:"Дополнительно", batch_submit:"В очередь", batch_download:"ZIP",
    batch_empty:"Задач пока нет", batch_in_queue:"в очереди", batch_running:"синтез…",
    batch_done:"готово", batch_error:"ошибка", batch_cancelled:"отменено",
    batch_send_err:"Ошибка отправки: ", batch_need_text:"Введите текст",
    batch_from_main:"Брать настройки из главного экрана", batch_models_loading:"(загрузка…)",
    batch_no_voices:"(нет голосов — загрузите в основном UI)",
    batch_no_models:"(модели не загружены)",
    tagline:"Just Start Transform", org:"Justice Solidarity Tolerance",
    voice:"Голос", model:"Модель", language:"Язык синтеза", accent:"Акцент / Стиль",
    preset:"Пресет", settings:"Настройки", extra:"Дополнительно", save:"Сохранение",
    addvoice:"Добавить голос", text:"Текст",
    s_exag:"Выразительность", s_cfg:"Близость", s_temp:"Температура",
    s_rep:"Штраф", s_speed:"Скорость", s_pitch:"Высота", s_vol:"Громкость",
    ref:"Референс", pause:"Пауза", split:"Дробление",
    split_short:"Короткие", split_medium:"Средние", split_long:"Длинные",
    format:"Формат", freq:"Частота", bits:"Битность", fadein:"Fade in", fadeout:"Fade out",
    profile_ph:"Имя профиля (a-z, 0-9, _)", drop_hint:"Перетащите аудио или нажмите",
    drop_sub:".wav .mp3 .m4a .opus .flac .ogg", upload_btn:"Загрузить",
    speak:"Озвучить", stop:"Стоп", download:"Скачать", random_text:"Случайный",
    clear_history:"История",
    btn_clear_history: "Очистить",
    dl_current:"Скачать текущий", dl_zip:"Скачать всё (ZIP)", dl_merged:"Скачать всё одним файлом",
    history:"История", status_ready:"Готов к работе", status_synth:"Синтез",
    status_stream:"Стриминг", status_done:"Готово", status_stop:"Остановлено",
    status_err:"Ошибка",
    title_current_file:"Текущий файл", title_restart:"В начало",
    title_back5:"-5 сек", title_play_pause:"Играть/Пауза",
    title_fwd5:"+5 сек", title_volume:"Громкость", title_speed:"Скорость",
    title_loop:"Зациклить", title_boost:"Усилить ×2.5",
    title_record:"Записать голос", title_stt:"Голосовой ввод", title_help:"Помощь",
    no_models:"Нет моделей", stt_not_supported:"Голосовой ввод не поддерживается",
    pitch_kept:"Питч сохраняется", pitch_changes:"Питч меняется со скоростью", help_title:"Инструкция",
    err_timeout:"Превышено время ожидания", err_model_not_loaded:"Модель не загружена",
    err_empty_text:"Пустой текст", err_no_ref:"Референс не найден",
    err_synth_failed:"Ошибка синтеза", err_cancelled:"Отменено",
    err_unknown:"Неизвестная ошибка",
    status_plan:"Планирование", status_phrases:"фраз",
    status_stage_prepare:"Подготовка", status_stage_synth:"Синтез",
    status_stage_post:"Постобработка", status_voice_select:"Выберите голос",
    status_listening:"Слушаю...", status_stt_fail:"Не удалось",
    status_rec_loading:"Загружаю запись", status_rec_saved:"Голос записан",
    status_rec_timer:"Запись", status_rec_timer_hint:"Нажмите для остановки",
    status_mic_error:"Микрофон", status_upload_required:"Имя и файлы обязательны",
    status_uploading:"Загрузка", status_ref_building:"Сборка референса...",
    status_uploaded:"Готово",
    footer:"© 2026 · JST (Justice Solidarity Tolerance) · Director: Emtsev Nazar · EU (France)",
    toast_not_loaded:"Модель не загружена, fallback на Core",
    toast_lang_unavailable:"Модель не поддерживает этот язык",
    toast_switched:"Переключено на",
    presets:{
      clone_max:"Клон (макс. сходство)",
      sad:"Грустно", neutral:"Нейтрально",
      podcast:"Подкаст", audiobook:"Аудиокнига", ad:"Реклама", news:"Диктор",
      whisper:"Шёпот", emotional:"Эмоционально", child:"Ребёнок", elder:"Пожилой",
      narration:"Нарратив", interview:"Интервью", trailer:"Трейлер", asmr:"ASMR"
    },
    cards:{ pause:"Пауза", emph:"Эмфаза", whisper:"Шёпот", soft:"Тише", loud:"Громче",
            slow:"Медленнее", fast:"Быстрее", up:"Восходящее", down:"Нисходящее",
            stress:"Ударение", lang:"Язык", brk:"Разрыв" },
    desc:{
      core:"Базовая Chatterbox. Стабильна. Английский.",
      multi:"Мультиязычная Chatterbox (23 языка). Требует t3_mtl23ls_v2 + ve.pt.",
      jst_clone:"Собственный JST pipeline: чистка референса, синтез, постобработка.",
      voxcpm:"VoxCPM2. SOTA-клонирование. Apache 2.0.",
      qwen:"Qwen3-TTS. Точное клонирование. Apache 2.0.",
      cosyvoice:"CosyVoice3. Быстрое клонирование. Apache 2.0.",
      lora:"LoRA. Обученный тембр (fallback на Core).",
      pro:"Pro. Эмоциональный LoRA (fallback на Core)."
    }
  },
  en: {
    mood:"Mood",
    batch:"Batch", batch_lang:"Language", text_ph:"Enter text…", synth_wait:"Synthesis in progress — please wait", batch_title:"Batch synthesis", batch_text:"Text",
    batch_voice:"Voice", batch_model:"Model", batch_settings:"Settings",
    batch_adv:"Extra", batch_submit:"Queue", batch_download:"ZIP",
    batch_empty:"No tasks yet", batch_in_queue:"queued", batch_running:"synthesizing…",
    batch_done:"done", batch_error:"error", batch_cancelled:"cancelled",
    batch_send_err:"Send error: ", batch_need_text:"Enter text",
    batch_from_main:"Use settings from main screen", batch_models_loading:"(loading…)",
    batch_no_voices:"(no voices — upload in main UI)",
    batch_no_models:"(models not loaded)",
    tagline:"Just Start Transform", org:"Justice Solidarity Tolerance",
    voice:"Voice", model:"Model", language:"Synthesis language", accent:"Accent / Style",
    preset:"Preset", settings:"Settings", extra:"Extra", save:"Save",
    addvoice:"Add voice", text:"Text",
    s_exag:"Exaggeration", s_cfg:"Closeness", s_temp:"Temperature",
    s_rep:"Penalty", s_speed:"Speed", s_pitch:"Pitch", s_vol:"Volume",
    ref:"Reference", pause:"Pause", split:"Split",
    split_short:"Short", split_medium:"Medium", split_long:"Long",
    format:"Format", freq:"Sample rate", bits:"Bit depth", fadein:"Fade in", fadeout:"Fade out",
    profile_ph:"Profile name (a-z, 0-9, _)", drop_hint:"Drop audio or click",
    drop_sub:".wav .mp3 .m4a .opus .flac .ogg", upload_btn:"Upload",
    speak:"Speak", stop:"Stop", download:"Download", random_text:"Random",
    clear_history:"History",
    btn_clear_history: "Clear",
    dl_current:"Download current", dl_zip:"Download all (ZIP)", dl_merged:"Download all as one",
    history:"History", status_ready:"Ready", status_synth:"Synthesizing",
    status_stream:"Streaming", status_done:"Done", status_stop:"Stopped",
    status_err:"Error",
    no_models:"No models", stt_not_supported:"Voice input not supported",
    pitch_kept:"Pitch preserved", pitch_changes:"Pitch changes with speed", help_title:"Help",
    err_timeout:"Request timed out", err_model_not_loaded:"Model not loaded",
    err_empty_text:"Empty text", err_no_ref:"Reference audio not found",
    err_synth_failed:"Synthesis failed", err_cancelled:"Cancelled",
    err_unknown:"Unknown error",
    status_plan:"Planning", status_phrases:"phrases",
    status_stage_prepare:"Preparing", status_stage_synth:"Synthesizing",
    status_stage_post:"Post-processing", status_voice_select:"Select a voice",
    status_listening:"Listening...", status_stt_fail:"Failed",
    status_rec_loading:"Loading recording", status_rec_saved:"Voice recorded",
    status_rec_timer:"Recording", status_rec_timer_hint:"Click to stop",
    status_mic_error:"Microphone", status_upload_required:"Name and files required",
    status_uploading:"Uploading", status_ref_building:"Building reference...",
    status_uploaded:"Done",
    footer:"© 2026 · JST (Justice Solidarity Tolerance) · Director: Emtsev Nazar · EU (France)",
    toast_not_loaded:"Model not loaded, using Core fallback",
    toast_lang_unavailable:"Model doesn't support this language",
    toast_switched:"Switched to",
    presets:{
      clone_max:"Clone (max similarity)",
      sad:"Sad", neutral:"Neutral",
      podcast:"Podcast", audiobook:"Audiobook", ad:"Ad", news:"News",
      whisper:"Whisper", emotional:"Emotional", child:"Child", elder:"Elder",
      narration:"Narration", interview:"Interview", trailer:"Trailer", asmr:"ASMR"
    },
    cards:{ pause:"Pause", emph:"Emphasis", whisper:"Whisper", soft:"Softer", loud:"Louder",
            slow:"Slower", fast:"Faster", up:"Rising", down:"Falling",
            stress:"Stress", lang:"Language", brk:"Break" },
    desc:{
      core:"Base Chatterbox. Stable. English.",
      multi:"Multilingual Chatterbox (23 langs). Needs t3_mtl23ls_v2 + ve.pt.",
      jst_clone:"Custom JST pipeline: reference cleaning, synthesis, post-processing.",
      voxcpm:"VoxCPM2. SOTA cloning. Apache 2.0.",
      qwen:"Qwen3-TTS. Precise cloning. Apache 2.0.",
      cosyvoice:"CosyVoice3. Fast cloning. Apache 2.0.",
      lora:"LoRA. Trained voice (fallback to Core).",
      pro:"Pro. Emotional LoRA (fallback to Core)."
    }
  }
};

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

let LANG = localStorage.getItem("jst-lang") || "en";

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
function ti(key) {
  const d = JST_TOAST_I18N[LANG];
  return (d && d[key]) || key;
}
let MODELS = [];
let PRESETS = {};
let currentMode = localStorage.getItem("jst-mode") || "core";
let currentLang = localStorage.getItem("jst-synth-lang") || "";

function saveSynthPrefs() {
  try {
    localStorage.setItem("jst-mode", currentMode);
    localStorage.setItem("jst-synth-lang", currentLang);
  } catch (e) {}
}

function applySynthLangToText() {
  // v1.5.0: textarea должен иметь lang = язык синтеза, а не UI-язык
  var ta = document.getElementById("text");
  if (ta && currentLang) ta.setAttribute("lang", currentLang);
}

function normalizeSynthPrefs() {
  var modelsList = [];
  try {
    if (typeof MODELS !== "undefined" && Array.isArray(MODELS)) modelsList = MODELS;
  } catch (e) { /* TDZ */ }
  if (!modelsList.length) {
    if (!currentLang) currentLang = "en";
    saveSynthPrefs();
    return;
  }
  if (!modelsList.find(function (m) { return m.code === currentMode; })) currentMode = "core";
  var m = modelsList.find(function (x) { return x.code === currentMode; });
  var supported = (m && Array.isArray(m.languages) && m.languages.length) ? m.languages : ["en"];
  if (!currentLang || supported.indexOf(currentLang) === -1) {
    currentLang = supported.indexOf("en") !== -1 ? "en" : supported[0];
  }
  saveSynthPrefs();
  applySynthLangToText();
}
let currentAccent = "neutral";
let isStreaming = false;
let audioCtx = null;
let ws = null;
let wsTimeoutTimer = null;
let currentSR = 24000;
let nextStartTime = 0;
let totalSamples = 0;
let allChunks = [];
let animFrame = null;
let activeSources = [];
let recordTimer = null;
let mediaRecorder = null;
let recordedChunks = [];
let recordStartTime = 0;
let sttActive = false;

const t = (k) => (I18N[LANG] && I18N[LANG][k]) || k;
const tPreset = (k) => I18N[LANG].presets[k] || k;
const tCard = (k) => I18N[LANG].cards[k] || k;
const tDesc = (k) => I18N[LANG].desc[k] || "";
const $ = (id) => document.getElementById(id);
function __jstContrast() {
  return document.documentElement.getAttribute("data-theme") === "contrast";
}


// === THEME (owned by theme-mode.js) ===
// Legacy stub: theme-mode.js is the SINGLE owner of data-theme/data-mode.
// Do not call setAttribute here — it will conflict with theme-mode.js.
function applyTheme(th) { /* no-op - see theme-mode.js */ }

// === i18n UI ===
// v1.7.7: smart translate статуса (сохраняет "5.2s", "· file.wav")
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

function applyLanguage() {
  document.documentElement.lang = LANG;
  // v1.6.5: во время синтеза статус не трогаем — таймер сам переведёт через 1 сек
  // v1.7.8: переводим статус ВСЕГДА (даже при streaming) через _translateStatus
  try {
    var _st = document.getElementById("status-text");
    if (_st && window.JST_LAST_STATUS_LANG && window.JST_LAST_STATUS_LANG !== LANG) {
      const _old = _st.textContent || "";
      const _new = _translateStatus(_old, window.JST_LAST_STATUS_LANG, LANG);
      if (_new !== _old) {
        _st.textContent = _new;
        window.JST_LAST_STATUS = _new;
      }
      window.JST_LAST_STATUS_LANG = LANG;
    }
  } catch (e) {}
  const lt = $("lang-toggle");
  if (lt) lt.textContent = LANG.toUpperCase();
  document.querySelectorAll("[data-i18n]").forEach(function(el) {
    // v1.6.5c: статус управляется через setStatus(), не через data-i18n
    if (el.id === "status-text") return;
    const k = el.dataset.i18n; const v = t(k); if (v) el.textContent = v;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(function(el) {
    const k = el.dataset.i18nPlaceholder; const v = t(k); if (v) el.placeholder = v;
  });
  // v1.7.6: ВСЕГДА перерисовываем — все функции локальные (без API)
  try { rebuildPresetsSelect(); } catch(e){}
  try { rebuildCarousel(); } catch(e){}
  try { rebuildAccents(); } catch(e){}
  try { rebuildModelCarousel(); } catch(e){}
  try { updateModelInfo(); } catch(e){}
  try { renderLanguages(); } catch(e){}
  try { renderMoods(); } catch(e){}
  // v1.7.6: title / aria-label
  document.querySelectorAll("[data-i18n-title]").forEach(el => {
    const k = el.getAttribute("data-i18n-title"); const v = t(k); if (v) el.title = v;
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach(el => {
    const k = el.getAttribute("data-i18n-aria-label"); const v = t(k); if (v) el.setAttribute("aria-label", v);
  });
}

// === TOAST ===
function showToast(msg, type) {
  let el = $("toast");
  if (!el) { el = document.createElement("div"); el.id = "toast"; el.className = "toast"; document.body.appendChild(el); }
  const isError = (type === "error");
  el.textContent = (isError ? "⚠ " : "") + msg;
  el.className = "toast" + (isError ? " toast-error" : "") + " show";
  clearTimeout(window._toastT);
  window._toastT = setTimeout(() => el.classList.remove("show"), isError ? 8000 : 3500);
}

// === STATUS ===
function setStatus(text, type) {
  const st = $("status"); const stt = $("status-text");
  if (!stt) return;
  stt.textContent = text;
  window.JST_LAST_STATUS = text;   // v1.6.3: для перерисовки при switch
  window.JST_LAST_STATUS_LANG = LANG;   // v1.6.5: язык статуса
  if (st) st.className = "status" + (type ? " " + type : "");
}

// === PRESETS ===
function rebuildPresetsSelect() {
  const el = $("preset"); if (!el) return;
  const cur = el.value;
  el.innerHTML = "";
  Object.keys(PRESETS).forEach(k => {
    const o = document.createElement("option");
    o.value = k; o.textContent = tPreset(k);
    el.appendChild(o);
  });
  if (cur) el.value = cur;
}

function applyPreset(p) {
  if (!p) return;
  const sliderIds = { exaggeration:["o-exag",2], cfg_weight:["o-cfg",2], temperature:["o-temp",2],
    repetition_penalty:["o-rep",2], speed:["o-speed",2], pitch_shift:["o-pitch",0], volume:["o-vol",2] };
  Object.entries(sliderIds).forEach(([key, [outId, dec]]) => {
    if (key in p && p[key] != null) {
      const el = $(key); const out = $(outId);
      if (el) el.value = p[key];
      if (out) out.textContent = Number(p[key]).toFixed(dec);
    }
  });
  if (p.ref_length) { const el = $("ref_length"); if (el) el.value = p.ref_length; }
  if (p.pause_between) { const el = $("pause_between"); if (el) el.value = p.pause_between; }
  if (p.sentence_split) { const el = $("sentence_split"); if (el) el.value = p.sentence_split; }
}

// === CAROUSEL (text helpers) ===
function rebuildCarousel() {
  const grid = $("carousel"); if (!grid) return;
  grid.innerHTML = "";
  CARDS.forEach(card => {
    const c = document.createElement("div");
    c.className = "card";
    c.textContent = tCard(card.id);
    c.onclick = () => applyCard(card);
    grid.appendChild(c);
  });
}

function applyCard(card) {
  const text = $("text"); if (!text) return;
  const s = text.selectionStart, e = text.selectionEnd;
  const sel = text.value.slice(s, e);
  if (card.action === "insert") {
    text.value = text.value.slice(0, s) + card.value + text.value.slice(e);
    text.focus(); text.setSelectionRange(s + card.value.length, s + card.value.length);
  } else if (card.action === "wrap") {
    if (Array.isArray(card.value)) {
      const [o, c] = card.value;
      const inner = sel || (LANG === "ru" ? "слово" : "word");
      text.value = text.value.slice(0, s) + o + inner + c + text.value.slice(e);
      text.focus(); text.setSelectionRange(s + o.length, s + o.length + inner.length);
    } else {
      const w = card.value;
      const inner = sel || (LANG === "ru" ? "слово" : "word");
      text.value = text.value.slice(0, s) + w + inner + w + text.value.slice(e);
      text.focus(); text.setSelectionRange(s + w.length, s + w.length + inner.length);
    }
  }
}

// === ACCENTS ===
function rebuildAccents() {
  const grid = $("accent-grid"); if (!grid) return;
  grid.innerHTML = "";
  ACCENTS.forEach(a => {
    const c = document.createElement("div");
    c.className = "accent-card" + (a.code === currentAccent ? " active" : "");
    c.innerHTML = '<div class="accent-name">' + (LANG === "ru" ? a.ru : a.en) + '</div>' +
                  '<div class="accent-desc">' + (LANG === "ru" ? a.ru_d : a.en_d) + '</div>';
    c.onclick = () => {
      document.querySelectorAll(".accent-card").forEach(x => x.classList.remove("active"));
      c.classList.add("active");
      currentAccent = a.code;
    };
    grid.appendChild(c);
  });
}

// === MODELS ===
function rebuildModelCarousel() {
  const grid = $("model-grid"); if (!grid) return;
  grid.innerHTML = "";
  if (!MODELS || !MODELS.length) {
    grid.innerHTML = '<div style="padding:12px;color:var(--text-dim)">' + t("no_models") + '</div>';
    return;
  }
  MODELS.forEach(m => {
    const c = document.createElement("div");

        c.className = "model-card" + (m.code === currentMode ? " active" : "") + (!m.loaded ? " unavailable" : "");
    c.setAttribute("data-code", m.code);
    const warn = "";
    c.innerHTML = '<div class="model-name">' + m.name + warn + '</div>';
    c.onclick = () => {
      if (!m.loaded) {
        showToast(ti("model_not_loaded") + ": " + m.name);
        return;
      }
      currentMode = m.code;
      if (m.languages && m.languages.length && !m.languages.includes(currentLang)) {
        currentLang = m.languages.includes("en") ? "en" : m.languages[0];
        showToast(t("toast_switched") + " " + currentLang.toUpperCase());
      }
      document.querySelectorAll(".model-card").forEach(x => x.classList.remove("active"));
      c.classList.add("active");
      updateModelInfo();
      renderLanguages();
      if (!m.loaded && m.code !== "core") {
        showToast(t("toast_not_loaded") + " (" + m.name + ")");
      }
      saveSynthPrefs();
      const fd = new FormData(); fd.append("mode", m.code);
      fetch("/api/mode", { method: "POST", body: fd }).catch(() => {});
    };
    grid.appendChild(c);
  });
}

function updateModelInfo() {
  normalizeSynthPrefs();
  const info = $("model-info"); if (!info) return;
  const m = MODELS.find(x => x.code === currentMode);
  if (!m) { info.innerHTML = ""; return; }
  const langs = (m.languages || []).map(l => l.toUpperCase()).join(" · ") || "—";
  const status = m.loaded ? "" : ' <span style="color:var(--red)">(не загружена)</span>';
  info.innerHTML = '<div class="mi-langs">' + langs + '</div>' +
                   '<div class="mi-desc">' + tDesc(m.code) + status + '</div>';
}

// === LANGUAGES ===
function renderLanguages() {
  normalizeSynthPrefs();
  const grid = $("lang-grid"); if (!grid) return;
  const m = MODELS.find(x => x.code === currentMode);
  const supported = new Set(m ? (m.languages || []) : ["en"]);
  grid.innerHTML = "";
  Object.keys(LANG_NAMES).forEach(code => {
    const c = document.createElement("div");
    c.className = "lang-card";
    c.setAttribute("data-code", code);
    c.innerHTML = '<div class="lang-code">' + code.toUpperCase() + '</div>' +
                  '<div class="lang-name">' + LANG_NAMES[code] + '</div>';
    const isSupported = supported.has(code);
    if (!isSupported) {
      c.classList.add("unavailable");
      c.onclick = () => showToast(ti("soon") + LANG_NAMES[code]);
    } else {
      c.onclick = () => {
        document.querySelectorAll(".lang-card").forEach(x => x.classList.remove("active"));
        c.classList.add("active");
        currentLang = code;
        saveSynthPrefs();
        applySynthLangToText();
      };
    }
    if (code === currentLang && isSupported) c.classList.add("active");
    grid.appendChild(c);
  });
}

// === SETTINGS ===
function getSettings() {
  const sliderIds = ["exaggeration","cfg_weight","temperature","repetition_penalty","speed","pitch_shift","volume"];
  const s = {};
  sliderIds.forEach(key => {
    const el = $(key);
    s[key] = el ? (parseFloat(el.value) || 0) : 0;
  });
  const of = $("output_format"), osr = $("output_sr"), bd = $("bit_depth");
  const fi = $("fade_in_sec"), fo = $("fade_out_sec");
  const rl = $("ref_length"), pb = $("pause_between"), ss = $("sentence_split");
  s.output_format = of ? of.value : "wav";
  s.output_sr = osr ? (parseInt(osr.value) || 44100) : 44100;
  s.bit_depth = bd ? (parseInt(bd.value) || 16) : 16;
  s.fade_in_sec = fi ? (parseFloat(fi.value) || 0) : 0;
  s.fade_out_sec = fo ? (parseFloat(fo.value) || 0) : 0;
  s.mode = currentMode;
  s.language = currentLang;
  s.accent = currentAccent;
  s.ref_length = rl ? (parseInt(rl.value) || 12) : 12;
  s.pause_between = pb ? (parseFloat(pb.value) || 0.20) : 0.20;
  s.sentence_split = ss ? ss.value : "medium";
  s.mood = (document.querySelector("#mood") || {}).value || "auto";
  return s;
}

// === SYNTHESIS ===
function synthesize() {
  const btnS = $("btn-synth"), btnT = $("btn-stop");

  // 1. Guard: если уже идёт — toast, выходим
  if (btnS && btnS.classList.contains("is-busy")) {
    if (typeof showToast === "function") showToast(t("synth_wait") || "Идёт синтез — подождите");
    return;
  }
  if (isStreaming) return;

  // 2. Проверки данных — ДО блокировки
  const textEl = $("text"), voiceEl = $("voice");
  if (!textEl || !voiceEl) return;
  const text = textEl.value.trim();
  const voice = voiceEl.value;
  if (!text) { setStatus(t("text_ph") || "Введите текст", "error"); textEl.focus(); return; }
  if (!voice) { setStatus(t("status_voice_select"), "error"); return; }

  // 3. Все проверки пройдены — блокируем
  if (btnS) { btnS.disabled = false; btnS.classList.add("is-busy"); }
  if (btnT) btnT.disabled = false;

  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") audioCtx.resume();

  resetPlayback();
  isStreaming = true;
  window.JST_IS_STREAMING = true;   // v1.6.5a: глобальный флаг
  const pv = $("preview-player");
  if (pv) pv.style.display = "none";
  setStatus(t("status_synth") + "...", "busy");
  // v1.6.3: elapsed time в статусе
  const _synthStart = Date.now();
  if (window._synthTimer) clearInterval(window._synthTimer);
  window._synthTimer = setInterval(() => {
    const sec = ((Date.now() - _synthStart) / 1000).toFixed(1);
    const stt = document.getElementById("status-text");
    if (stt) {
      // v1.7.8: не сбрасываем phase-статус, только добавляем таймер к "..."
      if (stt.textContent && (stt.textContent.includes("...") || stt.textContent.includes(t("status_synth")))) {
        stt.textContent = t("status_synth") + "... " + sec + "s";
        window.JST_LAST_STATUS = stt.textContent;
        window.JST_LAST_STATUS_LANG = LANG;
      }
    }
  }, 1000);

  const proto = location.protocol === "https:" ? "wss:" : "ws:";
  ws = new WebSocket(proto + "//" + location.host + "/ws/synthesize");
  ws.binaryType = "arraybuffer";
  ws.onopen = () => {
    ws.send(JSON.stringify({ type: "synthesize", text, voice, settings: getSettings() }));
    // v1.5.3: таймаут на WS — если сервер не ответил за 10 мин — принудительно закрыть
    wsTimeoutTimer = setTimeout(() => {
      console.warn("[JST] WS timeout — 600s без ответа, закрываю");
      setStatus(t("status_err") + ": timeout", "error");
      try { ws.close(); } catch (e) {}
      finishStreaming(null);
    }, 600000);
  };
  ws.onmessage = (ev) => {
    if (typeof ev.data === "string") {
      const m = JSON.parse(ev.data);
      if (m.type === "start") { currentSR = m.sr; setStatus(t("status_plan") + ": " + m.sentences + " " + t("status_phrases"), "busy"); }
      else if (m.type === "stage") {
        // v1.6.5b: только ключ, без backend m.detail (там русский)
        const stageKey = { prepare: "status_stage_prepare", synth: "status_stage_synth", post: "status_stage_post" }[m.stage];
        setStatus(stageKey ? t(stageKey) : (m.detail || ""), "busy");
      }
      else if (m.type === "done") { setStatus(t("status_done") + " · " + m.file, ""); finishStreaming(m.file); }
      else if (m.type === "error") {
        var _errCode = m.code || "unknown";
        var _errKey = "err_" + _errCode;
        var _errText = t(_errKey);
        if (_errText === _errKey) _errText = m.message || m.code || "unknown";
        setStatus(t("status_err") + ": " + _errText, "error");
        finishStreaming(null);
      }
    } else handleAudioChunk(ev.data);
  };
  ws.onerror = () => { if (typeof showToast === "function") showToast(ti("ws_error"), "error"); setStatus(t("status_err"), "error"); finishStreaming(null); };
  ws.onclose = (ev) => {
    if (wsTimeoutTimer) { clearTimeout(wsTimeoutTimer); wsTimeoutTimer = null; }
    if (isStreaming) {
      console.warn("[JST] WS closed mid-stream: code=" + ev.code + " reason=" + (ev.reason || "no reason"));
      if (typeof showToast === "function" && ev.code !== 1000) {
        showToast(ti("aborted") + " (code " + ev.code + ")", "error");
      }
      finishStreaming(null);
    }
  };
}

function finishStreaming(file) {
  isStreaming = false;
  window.JST_IS_STREAMING = false;   // v1.6.5a
  if (window._synthTimer) { clearInterval(window._synthTimer); window._synthTimer = null; }
  if (typeof wsTimeoutTimer !== "undefined" && wsTimeoutTimer) {
    clearTimeout(wsTimeoutTimer);
    wsTimeoutTimer = null;
  }
  const btnS = $("btn-synth"); if (btnS) { btnS.disabled = false; btnS.classList.remove("is-busy"); btnS.classList.remove("is-busy"); }
  if (file) {
    const dl = $("btn-download"), pv = $("preview-player");
    if (dl) { dl.href = "/output/" + file; dl.download = file; }
    if (pv) {
      pv.onerror = () => {
        console.error("[JST] preview-player load error for " + file);
        setStatus(t("status_err") + ": audio load failed", "error");
      };
      pv.style.display = "block";
      pv.src = "/output/" + file;
      pv.load();
    }
    // P6.14-fix: сообщить новому SVG-плееру
    try {
      const ta = document.getElementById("text");
      window.dispatchEvent(new CustomEvent("jst:load-audio", {
        detail: { url: "/output/" + file, text: ta ? ta.value : "" }
      }));
    } catch (e) { console.warn("jst:load-audio dispatch failed", e); }
    refreshHistory();
  }
  if (activeSources.length === 0) { const b = $("btn-stop"); if (b) b.disabled = true; }
}

function stopPlayback() {
  activeSources.forEach(s => { try { s.stop(); } catch(e) {} });
  activeSources = [];
  if (ws) { try { ws.close(); } catch(e) {} ws = null; }
  isStreaming = false;
  window.JST_IS_STREAMING = false;   // v1.6.5a
  const btnS = $("btn-synth"), btnT = $("btn-stop");
  if (btnS) { btnS.disabled = false; btnS.classList.remove("is-busy"); btnS.classList.remove("is-busy"); }
  if (btnT) btnT.disabled = true;
  setStatus(t("status_stop"), "");
  if (animFrame) cancelAnimationFrame(animFrame);
  const pv = $("preview-player"); if (pv) pv.pause();
}

function resetPlayback() {
  activeSources.forEach(s => { try { s.stop(); } catch(e) {} });
  activeSources = [];
  if (ws) { try { ws.close(); } catch(e) {} ws = null; }
  nextStartTime = 0; totalSamples = 0; allChunks = [];
  window.JST_IS_STREAMING = false;   // v1.6.5a
  const prog = $("progress"), pt = $("player-time"), ptt = $("player-total");
  if (prog) prog.style.width = "0%";
  if (pt) pt.textContent = "0:00.0";
  if (ptt) ptt.textContent = "0:00.0";
  drawWaveform([]);
}

function drawWaveform(chunks) {
  const c = $("waveform"); if (!c) return;
  const ctx = c.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const w = c.width = c.clientWidth * dpr;
  const h = c.height = c.clientHeight * dpr;
  ctx.clearRect(0, 0, w, h);
  const maxP = 800, samples = [];
  if (chunks.length) {
    const total = chunks.reduce((a, ch) => a + ch.length, 0);
    const step = Math.max(1, Math.floor(total / maxP));
    let cnt = 0;
    for (const ch of chunks) {
      for (let i = 0; i < ch.length; i += step) {
        if (cnt++ >= maxP) break;
        samples.push(ch[i]);
      }
      if (cnt >= maxP) break;
    }
  }
  const isNight = document.documentElement.getAttribute("data-theme") === "night";
  ctx.strokeStyle = __jstContrast() ? "#000" : (isNight ? "#F5B800" : "#1a2a5e");
  ctx.lineWidth = 2 * dpr; ctx.beginPath();
  const mid = h / 2;
  for (let i = 0; i < samples.length; i++) {
    const x = (i / (maxP - 1)) * w, y = mid - samples[i] * mid * 0.85;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

async function refreshHistory() {
  const h = $("history"); if (!h) return;
  try {
    const r = await fetch("/api/output"); const d = await r.json();
    h.innerHTML = "";
    if (!d.files.length) { h.innerHTML = '<div style="padding:8px">—</div>'; return; }
    d.files.forEach(f => {
      const it = document.createElement("div");
      const dt = new Date(f.mtime * 1000);
      it.innerHTML = '<a href="/output/' + f.name + '" download>' + f.name + '</a>' +
        '<span class="date">' + dt.toLocaleString("ru-RU") + '</span>';
      h.appendChild(it);
    });
  } catch(e) {}
}

function fmt(sec) {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60), s = (sec % 60).toFixed(1).padStart(4, "0");
  return m + ":" + s;
}

// === STT (голосовой ввод) ===
function initSTT() {
  const btn = $("btn-stt"); if (!btn) return;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { btn.title = t("stt_not_supported"); btn.disabled = true; btn.style.opacity = "0.3"; return; }
  btn.addEventListener("click", () => {
    if (sttActive) return;
    const recognition = new SR();
    recognition.lang = currentLang === "ru" ? "ru-RU" : "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;
    const textEl = $("text");
    let base = textEl ? textEl.value : "";
    recognition.onstart = () => { sttActive = true; btn.style.background = "var(--red)"; setStatus(t("status_listening"), "busy"); };
    recognition.onresult = (ev) => {
      let interim = "", final = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const tx = ev.results[i][0].transcript;
        if (ev.results[i].isFinal) final += tx; else interim += tx;
      }
      if (textEl) {
        if (final) { base = (base ? base + " " : "") + final; textEl.value = base; }
        else if (interim) textEl.value = base + (base ? " " : "") + interim;
      }
    };
    recognition.onerror = (ev) => setStatus(t("status_err") + ": " + ev.error, "error");
    recognition.onend = () => { sttActive = false; btn.style.background = ""; setStatus(t("status_ready"), ""); };
    try { recognition.start(); } catch(e) { setStatus(t("status_stt_fail") + ": " + e.message, "error"); }
  });
}

// === Запись голоса ===
function initRecordButton() {
  const btn = $("btn-record"); if (!btn) return;
  btn.addEventListener("click", async () => {
    if (mediaRecorder && mediaRecorder.state === "recording") { mediaRecorder.stop(); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      recordedChunks = [];
      mediaRecorder.ondataavailable = e => { if (e.data.size > 0) recordedChunks.push(e.data); };
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        clearInterval(recordTimer);
        btn.style.background = ""; btn.style.color = "";
        const blob = new Blob(recordedChunks, { type: "audio/webm" });
        const dur = ((Date.now() - recordStartTime) / 1000).toFixed(1);
        setStatus(t("status_rec_loading") + " (" + dur + "s)...", "busy");
        const nv = $("new-voice");
        let name = nv ? nv.value.trim() : "";
        if (!name) { name = "recorded_" + Date.now(); if (nv) nv.value = name; }
        try {
          const fd = new FormData(); fd.append("name", name);
          await fetch("/api/voices/create", { method: "POST", body: fd });
          const ffd = new FormData(); ffd.append("file", blob, "recording.webm");
          const r = await fetch("/api/voices/" + encodeURIComponent(name) + "/upload-blob", { method: "POST", body: ffd });
          if (!r.ok) throw new Error(await r.text());
          const fd2 = new FormData(); fd2.append("ref_length", ($("ref_length")||{}).value || "15");
          await fetch("/api/voices/" + encodeURIComponent(name) + "/rebuild-reference", { method: "POST", body: fd2 });
          await loadVoices();
          const v = $("voice"); if (v) v.value = name;
          setStatus(t("status_rec_saved") + ": " + name, "");
        } catch(e) { setStatus(t("status_err") + ": " + e.message, "error"); }
      };
      mediaRecorder.start();
      recordStartTime = Date.now();
      btn.style.background = "var(--red)"; btn.style.color = "#fff";
      let sec = 0;
      recordTimer = setInterval(() => { sec++; setStatus(t("status_rec_timer") + ": " + sec + "s. " + t("status_rec_timer_hint"), "busy"); }, 1000);
    } catch(e) { setStatus(t("status_mic_error") + ": " + e.message, "error"); }
  });
}

// === LOAD DATA ===
async function loadModels() {
  try { const r = await fetch("/api/models"); const d = await r.json(); MODELS = d.models || []; }
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
      o.value = vo.name; o.textContent = vo.name + " (" + vo.files + ")";
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

function renderMoods() {
  const sel = document.querySelector("#mood");
  if (!sel || !window.__moodsData) return;
  const lang = (document.documentElement.getAttribute("lang") || "ru").toLowerCase();
  const current = sel.value;
  sel.innerHTML = '<option value="auto">JST Auto Spirits</option>';
  Object.entries(window.__moodsData).forEach(function(entry) {
    const code = entry[0], m = entry[1];
    const ruName = m.name || code;
    const enName = m.name_en || MOOD_NAME_EN[ruName] || ruName;
    const o = document.createElement("option");
    o.value = code;
    o.textContent = (lang === "en") ? enName : ruName;
    sel.appendChild(o);
  });
  if (current) sel.value = current;
}

if (!window.__moodsLangObserver) {
  window.__moodsLangObserver = new MutationObserver(function(muts) {
    muts.forEach(function(m) {
      if (m.attributeName === "lang") renderMoods();
    });
  });
  window.__moodsLangObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
}

async function loadPresets() {
  try {
    const r = await fetch("/api/presets"); const d = await r.json();
    PRESETS = d.presets;
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
function bindUI() {
  const sliderIds = ["exaggeration","cfg_weight","temperature","repetition_penalty","speed","pitch_shift","volume"];
  const outputIds = { exaggeration:["o-exag",2], cfg_weight:["o-cfg",2], temperature:["o-temp",2],
    repetition_penalty:["o-rep",2], speed:["o-speed",2], pitch_shift:["o-pitch",0], volume:["o-vol",2] };
  sliderIds.forEach(key => {
    const el = $(key); if (!el) return;
    const [outId, dec] = outputIds[key];
    el.addEventListener("input", () => {
      const out = $(outId); if (out) out.textContent = Number(el.value).toFixed(dec);
    });
  });

  const textEl = $("text");
  if (textEl) textEl.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") synthesize();
  });

  // Random text
  const btnR = $("btn-random");
  const _btnSynth = $("btn-synth"); if (_btnSynth) _btnSynth.addEventListener("click", synthesize);
  const _btnStop = $("btn-stop"); if (_btnStop) _btnStop.addEventListener("click", stopPlayback);
  if (btnR) btnR.addEventListener("click", () => {
    const lang = (currentLang || LANG || "ru").toLowerCase();  // v1.5.2: currentLang → LANG → "ru"
    const bank = (window.JST_TEST_PHRASES && window.JST_TEST_PHRASES[lang]) || [];
    if (!bank.length) {
      console.warn("[JST] JST_TEST_PHRASES пуст для lang=", lang);
      return;
    }
    const phrase = bank[Math.floor(Math.random() * bank.length)];
    const ta = $("text");
    if (ta) {
      ta.value = phrase;
      ta.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });

  // Clear — очищает textarea
  const btnC = $("btn-clear-history");
  if (btnC) btnC.addEventListener("click", () => {
    if (textEl) { textEl.value = ""; textEl.focus(); }
    setStatus(ti("cleared"), "");
  });

  // Download all
  const dz = $("btn-download-zip"); if (dz) dz.addEventListener("click", e => { e.preventDefault(); window.location.href = "/api/download-all-zip"; });
  const dm = $("btn-download-merged"); if (dm) dm.addEventListener("click", e => { e.preventDefault(); window.location.href = "/api/download-all-merged"; });

  // Help
  const hb = document.querySelector("#help-body");
  if (hb && !hb.dataset.filled) { hb.innerHTML = '<div class="help-doc">\n  <h2 class="help-title">\n    <span class="help-ru">Инструкция</span>\n    <span class="help-en">User Guide</span>\n  </h2>\n\n  <details class="help-section">\n    <summary class="help-header">\n      <span class="help-pill help-ru">Быстрый старт</span>\n      <span class="help-pill help-en">Quick Start</span>\n      <span class="help-arrow">&#9679;</span>\n    </summary>\n    <div class="help-content">\n      <div class="help-ru">\n        <ol>\n          <li><b>Голос</b> — выберите профиль или загрузите свой аудиофайл (5–30 сек чистой речи).</li>\n          <li><b>Модель</b> — Multi для русского, JST Clone для клонирования, VoxCPM2 для максимального качества.</li>\n          <li><b>Язык</b> — ru или en. Остальные появятся позже, помечены «скоро».</li>\n          <li><b>Пресет</b> — базовый тембр (подкаст, диктор, шёпот).</li>\n          <li><b>Настроение</b> — эмоциональная окраска (включая JST Spirits).</li>\n          <li><b>Текст</b> → <b>Озвучить</b>.</li>\n        </ol>\n      </div>\n      <div class="help-en">\n        <ol>\n          <li><b>Voice</b> — pick a profile or upload your own audio (5–30 seconds of clean speech).</li>\n          <li><b>Model</b> — Multi for Russian, JST Clone for cloning, VoxCPM2 for maximum quality.</li>\n          <li><b>Language</b> — ru or en. Others coming later, marked "soon".</li>\n          <li><b>Preset</b> — base timbre (podcast, announcer, whisper).</li>\n          <li><b>Mood</b> — emotional colour (including JST Spirits).</li>\n          <li><b>Text</b> → <b>Speak</b>.</li>\n        </ol>\n      </div>\n    </div>\n  </details>\n\n  <details class="help-section">\n    <summary class="help-header">\n      <span class="help-pill help-ru">Модели</span>\n      <span class="help-pill help-en">Models</span>\n      <span class="help-arrow">&#9679;</span>\n    </summary>\n    <div class="help-content">\n      <div class="help-ru">\n        <table class="help-table">\n          <tr><th>Модель</th><th>Языки</th><th>Назначение</th><th>Качество</th></tr>\n          <tr><td>Core</td><td>EN</td><td>Базовая, быстрая</td><td>2/5</td></tr>\n          <tr><td>Multi</td><td>RU+EN</td><td>Русский через неё, стабильно</td><td>3/5</td></tr>\n          <tr><td>JST Clone</td><td>RU+EN</td><td>Свой pipeline: чистка + синтез + пост</td><td>4/5</td></tr>\n          <tr><td>VoxCPM2</td><td>RU+EN</td><td>SOTA 48 кГц, лучшее клонирование</td><td>5/5</td></tr>\n          <tr><td>Qwen3</td><td>RU+EN</td><td>Альтернатива (отдельный venv)</td><td>4/5</td></tr>\n          <tr><td>CosyVoice</td><td>RU+EN</td><td>Резервный движок</td><td>3/5</td></tr>\n        </table>\n        <p><b>Правило выбора:</b> русский язык — Multi или VoxCPM2; максимальное качество — VoxCPM2; быстро — Core или Multi; эмоции — Multi или JST Clone.</p>\n        <p>Все модели Apache 2.0 — коммерческое использование разрешено.</p>\n      </div>\n      <div class="help-en">\n        <table class="help-table">\n          <tr><th>Model</th><th>Languages</th><th>Purpose</th><th>Quality</th></tr>\n          <tr><td>Core</td><td>EN</td><td>Base, fast</td><td>2/5</td></tr>\n          <tr><td>Multi</td><td>RU+EN</td><td>Russian through it, stable</td><td>3/5</td></tr>\n          <tr><td>JST Clone</td><td>RU+EN</td><td>Own pipeline: cleanup + synth + post</td><td>4/5</td></tr>\n          <tr><td>VoxCPM2</td><td>RU+EN</td><td>SOTA 48 kHz, best cloning</td><td>5/5</td></tr>\n          <tr><td>Qwen3</td><td>RU+EN</td><td>Alternative (separate venv)</td><td>4/5</td></tr>\n          <tr><td>CosyVoice</td><td>RU+EN</td><td>Backup engine</td><td>3/5</td></tr>\n        </table>\n        <p><b>Selection rule:</b> Russian — Multi or VoxCPM2; maximum quality — VoxCPM2; fast — Core or Multi; emotions — Multi or JST Clone.</p>\n        <p>All models are Apache 2.0 — commercial use allowed.</p>\n      </div>\n    </div>\n  </details>\n\n  <details class="help-section">\n    <summary class="help-header">\n      <span class="help-pill help-ru">Параметры</span>\n      <span class="help-pill help-en">Parameters</span>\n      <span class="help-arrow">&#9679;</span>\n    </summary>\n    <div class="help-content">\n      <div class="help-ru">\n        <ul>\n          <li><b>Выразительность</b> (0.0–1.5): 0.30 — диктор, 0.50 — норма, 0.70 — живо, 0.85+ — эмоционально.</li>\n          <li><b>Близость к референсу</b> (0.0–1.0): 0.30 — свобода, 0.50 — баланс, 0.70 — максимум сходства.</li>\n          <li><b>Температура</b> (0.5–1.2): 0.70 — стабильно, 0.80 — баланс, 1.00 — живо.</li>\n          <li><b>Штраф повторов</b> (1.0–1.5): 1.20 — стандарт, 1.35 — если модель повторяет.</li>\n          <li><b>Скорость</b> (0.5–2.0): 0.90 — медленно, 1.00 — норма, 1.10 — живо.</li>\n          <li><b>Высота</b> (-12…+12): -2 — серьёзнее, 0 — норма, +2 — женственнее, +4 — детский.</li>\n          <li><b>Громкость</b> (0.5–1.5): 0.6 — тихо, 1.0 — норма, 1.1 — громче.</li>\n          <li><b>Референс</b> (6–30 сек): 10 — быстро, 15 — стандарт, 20–30 — максимум сходства.</li>\n          <li><b>Пауза</b> (0.10–1.00 сек): 0.10 — новости, 0.20 — нейтрально, 0.30 — аудиокнига, 0.50+ — ASMR.</li>\n          <li><b>Дробление:</b> short — контроль каждой фразы, medium — по предложению, long — по абзацу.</li>\n        </ul>\n      </div>\n      <div class="help-en">\n        <ul>\n          <li><b>Exaggeration</b> (0.0–1.5): 0.30 — announcer, 0.50 — normal, 0.70 — lively, 0.85+ — emotional.</li>\n          <li><b>Closeness</b> (0.0–1.0): 0.30 — freedom, 0.50 — balance, 0.70 — maximum similarity.</li>\n          <li><b>Temperature</b> (0.5–1.2): 0.70 — stable, 0.80 — balance, 1.00 — lively.</li>\n          <li><b>Repetition penalty</b> (1.0–1.5): 1.20 — standard, 1.35 — if the model repeats.</li>\n          <li><b>Speed</b> (0.5–2.0): 0.90 — slow, 1.00 — normal, 1.10 — lively.</li>\n          <li><b>Pitch</b> (-12…+12): -2 — deeper, 0 — normal, +2 — feminine, +4 — child.</li>\n          <li><b>Volume</b> (0.5–1.5): 0.6 — quiet, 1.0 — normal, 1.1 — louder.</li>\n          <li><b>Reference</b> (6–30 sec): 10 — fast, 15 — standard, 20–30 — maximum similarity.</li>\n          <li><b>Pause</b> (0.10–1.00 sec): 0.10 — news, 0.20 — neutral, 0.30 — audiobook, 0.50+ — ASMR.</li>\n          <li><b>Splitting:</b> short — control each phrase, medium — per sentence, long — per paragraph.</li>\n        </ul>\n      </div>\n    </div>\n  </details>\n\n  <details class="help-section">\n    <summary class="help-header">\n      <span class="help-pill help-ru">Готовые комбинации</span>\n      <span class="help-pill help-en">Ready Presets</span>\n      <span class="help-arrow">&#9679;</span>\n    </summary>\n    <div class="help-content">\n      <div class="help-ru">\n        <ul>\n          <li><b>Диктор:</b> выразительность 0.50, близость 0.50, температура 0.80, скорость 1.00, референс 10, пауза 0.15.</li>\n          <li><b>Подкаст:</b> выразительность 0.60, близость 0.45, температура 0.85, скорость 1.05, референс 15, пауза 0.25.</li>\n          <li><b>Аудиокнига:</b> выразительность 0.55, близость 0.50, температура 0.78, скорость 1.00, референс 15, пауза 0.30.</li>\n          <li><b>ASMR:</b> выразительность 0.30, близость 0.60, температура 0.70, скорость 0.80, референс 20, пауза 0.40.</li>\n          <li><b>Трейлер:</b> выразительность 0.75, близость 0.35, температура 0.85, скорость 0.95, референс 15.</li>\n        </ul>\n      </div>\n      <div class="help-en">\n        <ul>\n          <li><b>Announcer:</b> exaggeration 0.50, closeness 0.50, temperature 0.80, speed 1.00, reference 10, pause 0.15.</li>\n          <li><b>Podcast:</b> exaggeration 0.60, closeness 0.45, temperature 0.85, speed 1.05, reference 15, pause 0.25.</li>\n          <li><b>Audiobook:</b> exaggeration 0.55, closeness 0.50, temperature 0.78, speed 1.00, reference 15, pause 0.30.</li>\n          <li><b>ASMR:</b> exaggeration 0.30, closeness 0.60, temperature 0.70, speed 0.80, reference 20, pause 0.40.</li>\n          <li><b>Trailer:</b> exaggeration 0.75, closeness 0.35, temperature 0.85, speed 0.95, reference 15.</li>\n        </ul>\n      </div>\n    </div>\n  </details>\n\n  <details class="help-section">\n    <summary class="help-header">\n      <span class="help-pill help-ru">JST Spirits — авторские настроения</span>\n      <span class="help-pill help-en">JST Spirits — signature moods</span>\n      <span class="help-arrow">&#9679;</span>\n    </summary>\n    <div class="help-content">\n      <div class="help-ru">\n        <ul>\n          <li><b>Тёплый</b> — доверительный, дружелюбный (реклама, презентация).</li>\n          <li><b>Уверенный</b> — авторитетный, чёткий (деловые звонки).</li>\n          <li><b>JST Рассказчик</b> — повествовательный, плавный (аудиокнига).</li>\n          <li><b>JST Вдохновляющий</b> — энергичный, мотивирующий (промо, обучение).</li>\n          <li><b>JST Загадочный</b> — низкий, таинственный (документалка, триллер).</li>\n          <li><b>JST Дружелюбный</b> — лёгкий, улыбчивый (видеоблог, соцсети).</li>\n        </ul>\n        <p>Режим <b>JST Auto Spirits</b> автоматически определяет настроение по тексту: восклицания → восторг, «груст» → грусть, «шёпот» → шёпот, «доклад» → деловой.</p>\n      </div>\n      <div class="help-en">\n        <ul>\n          <li><b>JST Warm</b> — trustworthy, friendly (ads, presentations).</li>\n          <li><b>JST Confident</b> — authoritative, crisp (business calls).</li>\n          <li><b>JST Storyteller</b> — narrative, smooth (audiobook).</li>\n          <li><b>JST Motivational</b> — energetic, inspiring (promo, learning).</li>\n          <li><b>JST Mysterious</b> — low, enigmatic (documentary, thriller).</li>\n          <li><b>JST Friendly</b> — light, smiling (vlog, social media).</li>\n        </ul>\n        <p><b>JST Auto Spirits</b> auto-detects mood from the text: exclamations → excited, "sad" → sad, "whisper" → whisper, "report" → professional.</p>\n      </div>\n    </div>\n  </details>\n\n  <details class="help-section">\n    <summary class="help-header">\n      <span class="help-pill help-ru">Разметка текста</span>\n      <span class="help-pill help-en">Text Markup</span>\n      <span class="help-arrow">&#9679;</span>\n    </summary>\n    <div class="help-content">\n      <div class="help-ru">\n        <ul>\n          <li><code>[pause=0.5]</code> — пауза 0.5 сек.</li>\n          <li><code>[emph]слово[/emph]</code> — выделить (громче, чётче).</li>\n          <li><code>[whisper]текст[/whisper]</code> — шёпот.</li>\n          <li><code>[soft]текст[/soft]</code> — тише.</li>\n          <li><code>[loud]текст[/loud]</code> — громче.</li>\n          <li><code>[slow]текст[/slow]</code> — медленнее.</li>\n          <li><code>[fast]текст[/fast]</code> — быстрее.</li>\n        </ul>\n        <p>Пример: <code>[whisper]Слушай...[/whisper] [pause=0.8] Сегодня я расскажу [emph]главное[/emph].</code></p>\n      </div>\n      <div class="help-en">\n        <ul>\n          <li><code>[pause=0.5]</code> — 0.5 second pause.</li>\n          <li><code>[emph]word[/emph]</code> — emphasise (louder, clearer).</li>\n          <li><code>[whisper]text[/whisper]</code> — whisper.</li>\n          <li><code>[soft]text[/soft]</code> — softer.</li>\n          <li><code>[loud]text[/loud]</code> — louder.</li>\n          <li><code>[slow]text[/slow]</code> — slower.</li>\n          <li><code>[fast]text[/fast]</code> — faster.</li>\n        </ul>\n        <p>Example: <code>[whisper]Listen...[/whisper] [pause=0.8] Today I will tell you [emph]the main thing[/emph].</code></p>\n      </div>\n    </div>\n  </details>\n\n  <details class="help-section">\n    <summary class="help-header">\n      <span class="help-pill help-ru">Голоса — загрузка</span>\n      <span class="help-pill help-en">Voices — upload</span>\n      <span class="help-arrow">&#9679;</span>\n    </summary>\n    <div class="help-content">\n      <div class="help-ru">\n        <ol>\n          <li>Нажмите «Добавить голос».</li>\n          <li>Имя: только a–z, 0–9, _ (до 64 символов).</li>\n          <li>Перетащите 1–5 файлов (.wav .mp3 .m4a .opus .flac .ogg).</li>\n          <li>5–30 секунд чистой речи, один язык, без шума.</li>\n          <li>Нажмите «Загрузить».</li>\n        </ol>\n        <p>Качество клонирования зависит от: чистоты записи, эмоциональной нейтральности, громкости, одного голоса на записи.</p>\n      </div>\n      <div class="help-en">\n        <ol>\n          <li>Click "Add voice".</li>\n          <li>Name: only a–z, 0–9, _ (up to 64 characters).</li>\n          <li>Drop 1–5 files (.wav .mp3 .m4a .opus .flac .ogg).</li>\n          <li>5–30 seconds of clean speech, one language, no noise.</li>\n          <li>Click "Upload".</li>\n        </ol>\n        <p>Cloning quality depends on: clean recording, emotional neutrality, loudness, single voice in the file.</p>\n      </div>\n    </div>\n  </details>\n\n  <details class="help-section">\n    <summary class="help-header">\n      <span class="help-pill help-ru">Безопасность</span>\n      <span class="help-pill help-en">Security</span>\n      <span class="help-arrow">&#9679;</span>\n    </summary>\n    <div class="help-content">\n      <div class="help-ru">\n        <ul>\n          <li>Валидация текста: 1–5000 символов, контрольные символы вырезаются.</li>\n          <li>Rate limit: 60 запросов в минуту.</li>\n          <li>Path traversal: защита от запросов вида <code>../../etc/passwd</code>.</li>\n          <li>Fallback: VoxCPM2 → Multi → Core при падении модели.</li>\n          <li>Логи: <code>/tmp/jst_run.log</code>.</li>\n        </ul>\n      </div>\n      <div class="help-en">\n        <ul>\n          <li>Text validation: 1–5000 characters, control characters stripped.</li>\n          <li>Rate limit: 60 requests per minute.</li>\n          <li>Path traversal: protection against <code>../../etc/passwd</code>-style requests.</li>\n          <li>Fallback: VoxCPM2 → Multi → Core when a model fails.</li>\n          <li>Logs: <code>/tmp/jst_run.log</code>.</li>\n        </ul>\n      </div>\n    </div>\n  </details>\n\n  <details class="help-section">\n    <summary class="help-header">\n      <span class="help-pill help-ru">Если что-то не работает</span>\n      <span class="help-pill help-en">Troubleshooting</span>\n      <span class="help-arrow">&#9679;</span>\n    </summary>\n    <div class="help-content">\n      <div class="help-ru">\n        <ul>\n          <li><b>Непонятный язык</b> — Multi упал в fallback на Core. Проверьте: <code>grep "Core (fallback)" /tmp/jst_run.log</code>. Убедитесь, что в <code>pretrained_models/</code> есть s3gen.pt, t3_mtl23ls_v2.safetensors, Cangjie5_TC.json.</li>\n          <li><b>Модалка пустая</b> — Cmd+Shift+R в браузере.</li>\n          <li><b>Модель не загружена</b> — подождите 30–40 секунд после запуска сервера.</li>\n          <li><b>Reference not found</b> — профиль голоса не сгенерирован, загрузите аудио.</li>\n          <li><b>Сервер не отвечает</b> — перезапуск: <code>lsof -ti:8000 | xargs kill -9; nohup ./start.sh &gt; /tmp/jst_run.log 2&gt;&amp;1 &amp;</code></li>\n        </ul>\n      </div>\n      <div class="help-en">\n        <ul>\n          <li><b>Wrong language</b> — Multi fell back to Core. Check: <code>grep "Core (fallback)" /tmp/jst_run.log</code>. Ensure that <code>pretrained_models/</code> contains s3gen.pt, t3_mtl23ls_v2.safetensors, Cangjie5_TC.json.</li>\n          <li><b>Empty modal</b> — Cmd+Shift+R in the browser.</li>\n          <li><b>Model not loaded</b> — wait 30–40 seconds after starting the server.</li>\n          <li><b>Reference not found</b> — voice profile is not generated, upload audio.</li>\n          <li><b>Server not responding</b> — restart: <code>lsof -ti:8000 | xargs kill -9; nohup ./start.sh &gt; /tmp/jst_run.log 2&gt;&amp;1 &amp;</code></li>\n        </ul>\n      </div>\n    </div>\n  </details>\n\n</div>'; hb.dataset.filled = "1";
// === JST_HELPTABLE_LABELS_V1 ===
(function(){
  var root = document.getElementById("help-body") || document.body;
  root.querySelectorAll("table.help-table").forEach(function(tbl){
    var headers = Array.prototype.slice.call(tbl.querySelectorAll("tr:first-child th")).map(function(th){ return th.textContent.trim(); });
    if (!headers.length) return;
    tbl.querySelectorAll("tr").forEach(function(tr, trIdx){
      if (trIdx === 0) return;
      var tds = tr.querySelectorAll("td");
      Array.prototype.forEach.call(tds, function(td, i){
        if (i < headers.length && !td.hasAttribute("data-label")) {
          td.setAttribute("data-label", headers[i]);
        }
      });
    });
  });
})();
; }
  const ht = $("help-toggle"); if (ht) ht.addEventListener("click", () => { const m = $("help-modal"); if (m) m.classList.add("open"); });
  const hc = $("help-close"); if (hc) hc.addEventListener("click", () => { const m = $("help-modal"); if (m) m.classList.remove("open"); });
  const hm = $("help-modal"); if (hm) hm.addEventListener("click", e => { if (e.target === hm) hm.classList.remove("open"); });

  // Upload
  const dz2 = $("dropzone"), vf = $("voice-files"), bu = $("btn-upload");
  if (dz2 && vf) {
    dz2.addEventListener("click", () => vf.click());
    vf.addEventListener("change", () => {
      const n = vf.files.length;
      const p = dz2.querySelector("p"); if (p) p.textContent = n ? (n + " файл(ов)") : t("drop_hint");
    });
  }
  if (bu) bu.addEventListener("click", uploadVoice);

  // Carousel arrows
  const bind = (prev, next, grid) => {
    const p = $(prev), n = $(next), g = $(grid);
    if (p && g) p.addEventListener("click", () => g.scrollLeft -= 180);
    if (n && g) n.addEventListener("click", () => g.scrollLeft += 180);
  };
  bind("carousel-prev", "carousel-next", "carousel");
  bind("lang-prev", "lang-next", "lang-grid");
  bind("model-prev", "model-next", "model-grid");
  bind("accent-prev", "accent-next", "accent-grid");
}

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
      setStatus(t("status_uploading") + " " + (i+1) + "/" + files.length, "busy");
      const ffd = new FormData(); ffd.append("file", files[i]);
      await fetch("/api/voices/" + encodeURIComponent(name) + "/upload", { method: "POST", body: ffd });
    }
    setStatus(t("status_ref_building"), "busy");
    const fd2 = new FormData(); fd2.append("ref_length", ($("ref_length")||{}).value || "15");
    await fetch("/api/voices/" + encodeURIComponent(name) + "/rebuild-reference", { method: "POST", body: fd2 });
    await loadVoices();
    const v = $("voice"); if (v) v.value = name;
    nv.value = ""; vf.value = "";
    setStatus(t("status_uploaded") + ": " + name, "");
  } catch(e) { setStatus(t("status_err") + ": " + e.message, "error"); }
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
    LANG = LANG === "ru" ? "en" : "ru";
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
(function() {
  document.addEventListener("click", function(e) {
    var a = e.target.closest(".dropdown-menu a, .history-menu .history-list > div");
    if (a) {
      var dd = a.closest(".dropdown");
      if (dd) {
        var btn = dd.querySelector(":scope > .btn");
        if (btn) setTimeout(function(){ btn.blur(); }, 30);
      }
    }
    // Клик вне dropdown — снять фокус со всех кнопок
    if (!e.target.closest(".dropdown")) {
      document.querySelectorAll(".dropdown > .btn").forEach(function(b){ b.blur(); });
    }
  }, true);

  // После клика на toggle — toggle открытие через класс .open (для мобильных)
  document.querySelectorAll(".dropdown > .btn").forEach(function(btn) {
    btn.addEventListener("click", function(e) {
      var dd = btn.parentElement;
      if (!dd) return;
      // На тач-устройствах — toggle .open
      if (matchMedia("(hover: none)").matches) {
        document.querySelectorAll(".dropdown.open").forEach(function(other){
          if (other !== dd) other.classList.remove("open");
        });
        dd.classList.toggle("open");
      }
    });
  });
})();

// JST dropdown click-toggle: открыть/закрыть + blur после клика (точка гаснет)
(function() {
  function closeAll(except) {
    document.querySelectorAll(".dropdown.open").forEach(function(d) {
      if (d !== except) d.classList.remove("open");
    });
  }
  document.querySelectorAll(".dropdown > .btn").forEach(function(btn) {
    btn.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      var dd = btn.closest(".dropdown");
      if (!dd) return;
      closeAll(dd);
      dd.classList.toggle("open");
      btn.blur();            // ← точка гаснет после клика
    });
  });
  document.querySelectorAll(".dropdown-menu a").forEach(function(a) {
    a.addEventListener("click", function() {
      var dd = a.closest(".dropdown");
      if (dd) {
        dd.classList.remove("open");
        var b = dd.querySelector(":scope > .btn");
        if (b) b.blur();
      }
    });
  });
  document.addEventListener("click", function(e) {
    if (!e.target.closest(".dropdown")) closeAll(null);
  });
})();

// === Инструкция: финальная версия — вынос заголовка в body, маска на viewport ===
(function() {
  function getOrCreate(id, parent) {
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement("div");
      el.id = id;
      (parent || document.body).appendChild(el);
    }
    return el;
  }

  function applyStyles() {
    var modal = document.getElementById("help-modal");
    if (!modal || !modal.classList.contains("open")) return;

    var isNight = document.documentElement.getAttribute("data-theme") === "night";
    var lang = (document.documentElement.lang || "ru").toLowerCase();
    var inputBg = isNight ? "rgba(13, 26, 63, 0.55)" : "rgba(255, 255, 255, 0.55)";
    var textColor = __jstContrast() ? "#000" : (isNight ? "#F5B800" : "#1a2a5e");

    // ---- 1. Модалка ----
    var ms = modal.style;
    ms.setProperty("position", "fixed", "important");
    ms.setProperty("inset", "0", "important");
    ms.setProperty("z-index", "9999", "important");
    ms.setProperty("background", "transparent", "important");
    ms.setProperty("backdrop-filter", "blur(35px) saturate(1.3)", "important");
    ms.setProperty("-webkit-backdrop-filter", "blur(35px) saturate(1.3)", "important");
    ms.setProperty("overflow-y", "auto", "important");
    ms.setProperty("overflow-x", "hidden", "important");
    ms.setProperty("display", "block", "important");
    ms.setProperty("padding", "0", "important");
    ms.setProperty("margin", "0", "important");

    // ---- 2. Маска на VIEWPORT: затухание у верха и низа экрана ----
    var maskV = "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 60px, rgba(0,0,0,1) 140px, rgba(0,0,0,1) calc(100% - 140px), rgba(0,0,0,0.4) calc(100% - 60px), transparent 100%)";
    ms.setProperty("mask-image", "none", "important");
    ms.setProperty("-webkit-mask-image", "none", "important");

    // ---- 3. Общий blur фона через #help-blur ----
    var blur = getOrCreate("help-blur", modal);
    if (blur.parentElement !== modal) modal.insertBefore(blur, modal.firstChild);
    var bs = blur.style;
    bs.setProperty("position", "fixed", "important");
    bs.setProperty("inset", "0", "important");
    bs.setProperty("z-index", "1", "important");
    bs.setProperty("pointer-events", "none", "important");
    bs.setProperty("backdrop-filter", "blur(20px) saturate(1.1)", "important");
    bs.setProperty("-webkit-backdrop-filter", "blur(20px) saturate(1.1)", "important");

    // ---- 4. Контейнеры прозрачные ----
    [
      document.querySelector(".help-modal-content"),
      document.getElementById("help-body"),
      document.querySelector(".help-doc")
    ].forEach(function(el) {
      if (!el) return;
      var s = el.style;
      s.setProperty("background", "transparent", "important");
      s.setProperty("background-color", "transparent", "important");
      s.setProperty("border", "none", "important");
      s.setProperty("box-shadow", "none", "important");
      s.setProperty("border-radius", "0", "important");
      s.setProperty("backdrop-filter", "none", "important");
      s.setProperty("-webkit-backdrop-filter", "none", "important");
      s.setProperty("margin", "0", "important");
      s.setProperty("max-width", "100%", "important");
      s.setProperty("width", "100%", "important");
      s.setProperty("max-height", "none", "important");
      s.setProperty("overflow", "visible", "important");
      s.setProperty("transform", "none", "important");
      s.setProperty("position", "relative", "important");
      s.setProperty("z-index", "10", "important");
    });

    var doc = document.querySelector(".help-doc");
    if (doc) {
      doc.style.setProperty("padding", "130px 60px 130px", "important");
      doc.style.setProperty("-webkit-mask-image", "none", "important");
      doc.style.setProperty("mask-image", "none", "important");
    }

    // ---- 5. Вынос заголовка и крестика в body (вне маски) ----
    var header = getOrCreate("help-header-fixed", document.body);
    if (header.parentElement !== document.body) document.body.appendChild(header);
    var hs = header.style;
    hs.setProperty("position", "fixed", "important");
    hs.setProperty("top", "24px", "important");
    hs.setProperty("left", "50%", "important");
    hs.setProperty("transform", "translateX(-50%)", "important");
    hs.setProperty("z-index", "2147483640", "important");
    hs.setProperty("display", "inline-flex", "important");
    hs.setProperty("align-items", "center", "important");
    hs.setProperty("justify-content", "center", "important");
    hs.setProperty("padding", "10px 28px", "important");
    hs.setProperty("background", __jstContrast() ? "#000" : (isNight ? "rgba(245,184,0,0.20)" : "rgba(255,255,255,0.92)"), "important");
    hs.setProperty("border", __jstContrast() ? "2px solid #000000" : "2px solid #F5B800", "important");
    hs.setProperty("border-radius", "22px", "important");
    hs.setProperty("box-shadow", __jstContrast() ? "none" : "0 4px 24px rgba(245,184,0,0.40), 0 2px 10px rgba(0,0,0,0.30)", "important");
    hs.setProperty("color", textColor, "important");
    hs.setProperty("font-size", "20px", "important");
    hs.setProperty("font-weight", "700", "important");
    hs.setProperty("letter-spacing", "1.5px", "important");
    hs.setProperty("white-space", "nowrap", "important");

    // Перенос заголовка
    var title = document.querySelector(".help-title");
    if (title && title.parentElement !== header) {
      header.appendChild(title);
    }
    if (title) {
      var ts = title.style;
      ts.setProperty("position", "static", "important");
      ts.setProperty("margin", "0", "important");
      ts.setProperty("padding", "0", "important");
      ts.setProperty("display", "inline", "important");
      ts.setProperty("background", "transparent", "important");
      ts.setProperty("border", "none", "important");
      ts.setProperty("font-size", "inherit", "important");
      ts.setProperty("font-weight", "inherit", "important");
      ts.setProperty("letter-spacing", "inherit", "important");
      ts.setProperty("color", textColor, "important");
      // Язык
      var ru = title.querySelector(".help-ru");
      var en = title.querySelector(".help-en");
      if (ru) ru.style.setProperty("display", lang.indexOf("ru") === 0 ? "inline" : "none", "important");
      if (en) en.style.setProperty("display", lang.indexOf("en") === 0 ? "inline" : "none", "important");
    }

    // Перенос крестика
    var close = document.getElementById("help-close");
    if (close && close.parentElement !== header) {
      header.appendChild(close);
    }
    if (close) {
      var cs = close.style;
      cs.setProperty("position", "absolute", "important");
      cs.setProperty("top", "-12px", "important");
      cs.setProperty("right", "-12px", "important");
      cs.setProperty("left", "auto", "important");
      cs.setProperty("width", "24px", "important");
      cs.setProperty("height", "24px", "important");
      cs.setProperty("min-width", "24px", "important");
      cs.setProperty("min-height", "24px", "important");
      cs.setProperty("padding", "0", "important");
      cs.setProperty("margin", "0", "important");
      cs.setProperty("display", "flex", "important");
      cs.setProperty("align-items", "center", "important");
      cs.setProperty("justify-content", "center", "important");
      cs.setProperty("border-radius", "50%", "important");
      cs.setProperty("font-size", "13px", "important");
      cs.setProperty("font-weight", "700", "important");
      cs.setProperty("line-height", "1", "important");
      cs.setProperty("z-index", "110", "important");
      cs.setProperty("cursor", "pointer", "important");
      cs.setProperty("transform", "none", "important");
      cs.setProperty("filter", "none", "important");
      cs.setProperty("backdrop-filter", "none", "important");
      cs.setProperty("-webkit-backdrop-filter", "none", "important");
      cs.setProperty("isolation", "isolate", "important");
      cs.setProperty("background", isNight ? "rgba(13,26,63,0.95)" : "rgba(255,255,255,0.95)", "important");
      cs.setProperty("border", __jstContrast() ? "1.5px solid #000000" : (isNight ? "1.5px solid #F5B800" : "1.5px solid #1a2a5e"), "important");
      cs.setProperty("color", __jstContrast() ? "#000" : (isNight ? "#F5B800" : "#1a2a5e"), "important");
      cs.setProperty("box-shadow", "0 2px 8px rgba(0,0,0,0.45)", "important");
    }

    // ---- 6. 9 блоков: фон как у Паузы + backdrop blur ----
    document.querySelectorAll(".help-section").forEach(function(sec) {
      var sc = sec.style;
      sc.setProperty("display", "block", "important");
      sc.setProperty("background", inputBg, "important");
      sc.setProperty("background-color", inputBg, "important");
      sc.setProperty("backdrop-filter", "blur(20px) saturate(1.2)", "important");
      sc.setProperty("-webkit-backdrop-filter", "blur(20px) saturate(1.2)", "important");
      sc.setProperty("border", __jstContrast() ? "1.5px solid #000000" : (isNight ? "1.5px solid rgba(245,184,0,0.30)" : "1.5px solid rgba(26,42,94,0.12)"), "important");
      sc.setProperty("border-radius", "18px", "important");
      sc.setProperty("box-shadow", "0 4px 20px rgba(0,0,0,0.12)", "important");
      sc.setProperty("margin", "0 auto 14px", "important");
      sc.setProperty("padding", "0", "important");
      sc.setProperty("max-width", "900px", "important");
      sc.setProperty("width", "100%", "important");
      sc.setProperty("color", textColor, "important");
      // Содержимое — прозрачное (наследует фон родителя)
      sec.querySelectorAll(".help-content, .help-header").forEach(function(child) {
        child.style.setProperty("background", "transparent", "important");
      });
    });
  }

  function hideAll() {
    var modal = document.getElementById("help-modal");
    if (modal) modal.style.setProperty("display", "none", "important");
    var header = document.getElementById("help-header-fixed");
    if (header) header.style.setProperty("display", "none", "important");
  }

  function showHeader() {
    var header = document.getElementById("help-header-fixed");
    if (header) header.style.setProperty("display", "inline-flex", "important");
  }

  function init() {
    var modal = document.getElementById("help-modal");
    if (!modal) return;

    if (!modal.classList.contains("open")) hideAll();

    var obs = new MutationObserver(function(muts) {
      muts.forEach(function(m) {
        if (m.attributeName === "class") {
          if (modal.classList.contains("open")) {
            showHeader();
            setTimeout(applyStyles, 30);
            setTimeout(applyStyles, 120);
          } else {
            hideAll();
          }
        }
      });
    });
    obs.observe(modal, { attributes: true, attributeFilter: ["class"] });

    var ht = document.getElementById("help-toggle");
    if (ht) {
      ht.addEventListener("click", function() {
        showHeader();
        setTimeout(applyStyles, 50);
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    setTimeout(init, 50);
  }
})();

// === Инструкция: шторки + туман без тёмной полосы ===
(function() {
    var STYLE_ID = "help-shutters-style";

    function injectStyle() {
        var old = document.getElementById(STYLE_ID);
        if (old) old.remove();
        var s = document.createElement("style");
        s.id = STYLE_ID;
        s.textContent = [
            /* 1. Убиваем псевдоэлементы — они дают тёмную полосу слева в Safari */
            "html body .help-modal.open::before,",
            "html body .help-modal.open::after {",
            "  content: none !important;",
            "  display: none !important;",
            "  background: none !important;",
            "  backdrop-filter: none !important;",
            "  -webkit-backdrop-filter: none !important;",
            "  mask-image: none !important;",
            "  -webkit-mask-image: none !important;",
            "}",
            /* 2. Модалка: только blur, без затемнения. mask-image оставляем — он даёт шторки */
            "html body .help-modal.open {",
            "  background: transparent !important;",
            "  backdrop-filter: blur(35px) saturate(1.3) !important;",
            "  -webkit-backdrop-filter: blur(35px) saturate(1.3) !important;",
            "}",
            /* 3. Блок с заголовком — полупрозрачный + blur, без рамки */
            "html body #help-header-fixed {",
            "  backdrop-filter: blur(20px) saturate(1.2) !important;",
            "  -webkit-backdrop-filter: blur(20px) saturate(1.2) !important;",
            "  background: rgba(255, 255, 255, 0.15) !important;",
            "  border: none !important;",
            "  box-shadow: none !important;",
            "  padding: 10px 28px !important;",
            "  border-radius: 16px !important;",
            "}",
            "html[data-theme='night'] body #help-header-fixed {",
            "  background: rgba(245, 184, 0, 0.06) !important;",
            "}",
            /* 4. Само слово «Инструкция» — без рамки и без своего blur */
            "html body #help-header-fixed .help-title,",
            "html body .help-title {",
            "  background: transparent !important;",
            "  border: none !important;",
            "  box-shadow: none !important;",
            "  backdrop-filter: none !important;",
            "  -webkit-backdrop-filter: none !important;",
            "}"
        ].join("\n");
        document.head.appendChild(s);
    }

    function apply() {
        var modal = document.getElementById("help-modal");
        if (!modal || !modal.classList.contains("open")) return;
        injectStyle();
        /* Inline !important — перебивает любые CSS-правила */
        modal.style.setProperty("background", "transparent", "important");
        modal.style.setProperty("backdrop-filter", "blur(35px) saturate(1.3)", "important");
        modal.style.setProperty("-webkit-backdrop-filter", "blur(35px) saturate(1.3)", "important");
    }

    function init() {
        var modal = document.getElementById("help-modal");
        if (!modal) return;
        apply();
        new MutationObserver(function(muts) {
            muts.forEach(function(m) {
                if (m.attributeName === "class") {
                    setTimeout(apply, 50);
                    setTimeout(apply, 200);
                }
            });
        }).observe(modal, { attributes: true, attributeFilter: ["class"] });
        var ht = document.getElementById("help-toggle");
        if (ht) ht.addEventListener("click", function() {
            setTimeout(apply, 80);
            setTimeout(apply, 250);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        setTimeout(init, 80);
    }
})();

// === Help cards edge fade (JS): карточки затухают и блюрятся у краёв ===
(function() {
    var FADE_ZONE = 130;     // зона затухания, px
    var MAX_BLUR  = 5;       // максимальный blur у самого края, px
    var MIN_OP    = 0.12;    // минимальная opacity у самого края

    function applyEdgeFade() {
        var modal = document.getElementById("help-modal");
        if (!modal || !modal.classList.contains("open")) return;

        var modalRect = modal.getBoundingClientRect();
        var modalTop = modalRect.top;
        var modalH   = modalRect.height;
        if (modalH <= 0) return;

        var cards = modal.querySelectorAll(".help-section");
        for (var i = 0; i < cards.length; i++) {
            var card = cards[i];
            var r = card.getBoundingClientRect();
            // Центр карточки относительно верхней границы видимой области
            var cy = (r.top + r.bottom) / 2 - modalTop;

            var dTop = cy;
            var dBot = modalH - cy;

            var fTop = Math.min(1, Math.max(0, dTop / FADE_ZONE));
            var fBot = Math.min(1, Math.max(0, dBot / FADE_ZONE));
            var fade = Math.min(fTop, fBot);

            if (fade < 0.999) {
                var blurPx = (1 - fade) * MAX_BLUR;
                var op     = MIN_OP + fade * (1 - MIN_OP);
                card.style.setProperty("opacity", op.toFixed(3), "important");
                card.style.setProperty("filter", "blur(" + blurPx.toFixed(2) + "px)", "important");
            } else {
                card.style.removeProperty("opacity");
                card.style.removeProperty("filter");
            }
        }
    }

    var rafId = null;
    function onScroll() {
        if (rafId) return;
        rafId = requestAnimationFrame(function() {
            rafId = null;
            applyEdgeFade();
        });
    }

    function init() {
        var modal = document.getElementById("help-modal");
        if (!modal) return;

        modal.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll, { passive: true });

        new MutationObserver(function(muts) {
            muts.forEach(function(m) {
                if (m.attributeName === "class") {
                    setTimeout(applyEdgeFade, 100);
                    setTimeout(applyEdgeFade, 300);
                    setTimeout(applyEdgeFade, 600);
                }
            });
        }).observe(modal, { attributes: true, attributeFilter: ["class"] });

        var ht = document.getElementById("help-toggle");
        if (ht) {
            ht.addEventListener("click", function() {
                setTimeout(applyEdgeFade, 150);
                setTimeout(applyEdgeFade, 400);
            });
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        setTimeout(init, 80);
    }
})();

// === Yellow border on button hover v6: dropdown-items без рамки ===
(function() {
    var TARGET_WORDS    = ["случайный", "очистить", "скачать", "история", "историю", "истории"];
    var YELLOW          = __jstContrast() ? "#000" : "#F5B800";
    var GLOW            = __jstContrast() ? "none" : "0 0 14px rgba(245, 184, 0, 0.45)";
    var BASE_BORDER     = "var(--panel-border, rgba(26, 42, 94, 0.12))";
    var BORDER_WIDTH    = "1.5px";
    var BORDER_STYLE    = "solid";

    function norm(s) { return (s || "").replace(/\s+/g, " ").trim().toLowerCase(); }

    function matches(text) {
        text = norm(text);
        if (!text) return false;
        for (var i = 0; i < TARGET_WORDS.length; i++) {
            if (text.indexOf(TARGET_WORDS[i]) !== -1) return true;
        }
        return false;
    }

    function isRealButton(el) {
        if (!el) return false;
        var tag = el.tagName;
        if (tag === "BUTTON" || tag === "A") return true;
        var role = el.getAttribute && el.getAttribute("role");
        return role === "button";
    }

    function isInsideDropdownMenu(el) {
        var p = el;
        while (p && p !== document.body) {
            if (p.classList && p.classList.contains("dropdown-menu")) return true;
            p = p.parentElement;
        }
        return false;
    }

    function findButtons() {
        var found = new Set();
        document.querySelectorAll("button, a, [role='button']").forEach(function(el) {
            if (!isRealButton(el)) return;
            if (isInsideDropdownMenu(el)) return; // <- пункты меню обрабатываем отдельно
            var txt = el.textContent || el.value || "";
            var aria = el.getAttribute && (el.getAttribute("aria-label") || el.getAttribute("title") || "");
            if (matches(txt) || matches(aria)) found.add(el);
        });
        return Array.from(found);
    }

    function cleanup() {
        document.querySelectorAll(".btn-yellow-hover, .btn-yellow-hover-parent").forEach(function(el) {
            if (!isRealButton(el)) {
                el.classList.remove("btn-yellow-hover");
                el.classList.remove("btn-yellow-hover-parent");
            }
        });
    }

    function setBase(el) {
        el.style.setProperty("border-width", BORDER_WIDTH, "important");
        el.style.setProperty("border-style", BORDER_STYLE, "important");
        el.style.setProperty("border-color", BASE_BORDER, "important");
        el.style.setProperty("border-top-color", BASE_BORDER, "important");
        el.style.setProperty("border-right-color", BASE_BORDER, "important");
        el.style.setProperty("border-bottom-color", BASE_BORDER, "important");
        el.style.setProperty("border-left-color", BASE_BORDER, "important");
        el.style.setProperty("box-shadow", "none", "important");
        el.style.setProperty("transition", "border-color 0.15s ease, box-shadow 0.15s ease", "important");
    }

    function setHover(el) {
        el.style.setProperty("border-color", YELLOW, "important");
        el.style.setProperty("border-top-color", YELLOW, "important");
        el.style.setProperty("border-right-color", YELLOW, "important");
        el.style.setProperty("border-bottom-color", YELLOW, "important");
        el.style.setProperty("border-left-color", YELLOW, "important");
        el.style.setProperty("box-shadow", GLOW, "important");
    }

    function paint(el) {
        setBase(el);
        if (el.__yh === true) return;
        el.__yh = true;
        el.addEventListener("mouseenter", function() { setHover(el); });
        el.addEventListener("mouseleave", function() { setBase(el); });
        el.addEventListener("focus",      function() { setHover(el); });
        el.addEventListener("blur",       function() { setBase(el); });
    }

    // ------------------------------------------------------------
    // Пункты выпадающего меню «Скачать ...» — БЕЗ рамки вообще
    // ------------------------------------------------------------
    function stripDropdownBorders() {
        var removed = 0;
        document.querySelectorAll(".dropdown-menu a, .dropdown-menu button, .dropdown-menu > *").forEach(function(el) {
            var txt = norm(el.textContent || "");
            if (txt.indexOf("скачать") === -1) return;
            // Убираем классы hover, если они случайно попали
            el.classList.remove("btn-yellow-hover");
            el.classList.remove("btn-yellow-hover-parent");
            // Снимаем рамку inline !important — это перебьёт любой CSS
            el.style.setProperty("border", "none", "important");
            el.style.setProperty("border-width", "0", "important");
            el.style.setProperty("border-top-width", "0", "important");
            el.style.setProperty("border-right-width", "0", "important");
            el.style.setProperty("border-bottom-width", "0", "important");
            el.style.setProperty("border-left-width", "0", "important");
            el.style.setProperty("border-style", "none", "important");
            el.style.setProperty("border-color", "transparent", "important");
            el.style.setProperty("box-shadow", "none", "important");
            el.style.setProperty("outline", "none", "important");
            // Снимаем возможные обработчики через флаг (не отвязываем — просто не даём hover-стилям включиться)
            el.__yh = true; // помечаем, чтобы paint() больше не вешал обработчики
            removed++;
        });
        return removed;
    }

    function apply() {
        cleanup();
        var btns = findButtons();
        btns.forEach(paint);
        var stripped = stripDropdownBorders();

        if (btns.length === 0) {
            console.warn("[btn-yellow-hover-v6] кнопки не найдены");
        } else {
            console.log("[btn-yellow-hover-v6] найдено кнопок: " + btns.length);
            btns.forEach(function(el, i) {
                console.log("  #" + (i + 1) +
                    " <" + el.tagName.toLowerCase() + ">" +
                    " id=" + (el.id || "-") +
                    " text=" + JSON.stringify((el.textContent || "").trim().slice(0, 30)));
            });
        }
        console.log("[btn-yellow-hover-v6] очищено пунктов меню от рамки: " + stripped);
    }

    function init() {
        apply();
        setTimeout(apply, 300);
        setTimeout(apply, 1000);
        setTimeout(apply, 2500);
        var t = null;
        new MutationObserver(function() {
            if (t) return;
            t = setTimeout(function() { t = null; apply(); }, 200);
        }).observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        setTimeout(init, 80);
    }
})();

// === Sidebar shutters v3: лёгкий градиентный blur, только по области блоков ===
(function() {
    var TOP_H    = 130;
    var BOT_H    = 65;
    var BLUR_PX  = 10;
    var STYLE_ID = "sidebar-shutters-style";

    function injectStyle() {
        if (document.getElementById(STYLE_ID)) return;
        var s = document.createElement("style");
        s.id = STYLE_ID;
        // 7 точек, ease-out — плавное затухание
        var stops = [
            "rgba(0,0,0,1) 0%",
            "rgba(0,0,0,0.92) 15%",
            "rgba(0,0,0,0.75) 32%",
            "rgba(0,0,0,0.55) 50%",
            "rgba(0,0,0,0.32) 68%",
            "rgba(0,0,0,0.14) 85%",
            "rgba(0,0,0,0) 100%"
        ].join(",");
        s.textContent = [
            ".sidebar-shutter{",
            "  position:fixed;",
            "  pointer-events:none;",
            "  z-index:900;",
            "  display:none;",
            "  backdrop-filter:blur(" + BLUR_PX + "px) saturate(1.15);",
            "  -webkit-backdrop-filter:blur(" + BLUR_PX + "px) saturate(1.15);",
            "  will-change:backdrop-filter;",
            "}",
            ".sidebar-shutter-top{",
            "  -webkit-mask-image:linear-gradient(to bottom," + stops + ");",
            "  mask-image:linear-gradient(to bottom," + stops + ");",
            "}",
            ".sidebar-shutter-bottom{",
            "  -webkit-mask-image:linear-gradient(to top," + stops + ");",
            "  mask-image:linear-gradient(to top," + stops + ");",
            "}"
        ].join("");
        document.head.appendChild(s);
    }

    function makeShutters() {
        var top = document.getElementById("sidebar-shutter-top");
        if (!top) {
            top = document.createElement("div");
            top.id = "sidebar-shutter-top";
            top.className = "sidebar-shutter sidebar-shutter-top";
            document.body.appendChild(top);
        }
        var bot = document.getElementById("sidebar-shutter-bottom");
        if (!bot) {
            bot = document.createElement("div");
            bot.id = "sidebar-shutter-bottom";
            bot.className = "sidebar-shutter sidebar-shutter-bottom";
            document.body.appendChild(bot);
        }
        return { top: top, bot: bot };
    }

    // Границы контента sidebar (объединение bbox всех видимых детей)
    function getContentBox(sidebar, sRect) {
        var minX = Infinity, maxX = -Infinity;
        var n = sidebar.children.length;
        for (var i = 0; i < n; i++) {
            var c = sidebar.children[i];
            // пропускаем наши шторки, если они вдруг внутри
            if (c.id && c.id.indexOf("sidebar-shutter") === 0) continue;
            var cs = getComputedStyle(c);
            if (cs.display === "none" || cs.visibility === "hidden") continue;
            if (c.offsetWidth === 0 && c.offsetHeight === 0) continue;
            var cr = c.getBoundingClientRect();
            if (cr.bottom < sRect.top || cr.top > sRect.bottom) continue;
            if (cr.left < minX) minX = cr.left;
            if (cr.right > maxX) maxX = cr.right;
        }
        if (minX === Infinity || maxX === -Infinity) {
            return { left: sRect.left, right: sRect.right };
        }
        return { left: minX, right: maxX };
    }

    function positionShutters(sidebar, shutters) {
        if (!sidebar) return;
        var r = sidebar.getBoundingClientRect();

        if (r.bottom < 0 || r.top > window.innerHeight || r.height <= 0 || r.width <= 0) {
            shutters.top.style.display = "none";
            shutters.bot.style.display = "none";
            return;
        }

        var box = getContentBox(sidebar, r);
        var left  = Math.max(0, box.left);
        var right = Math.min(window.innerWidth, box.right);
        var width = Math.max(0, right - left);
        if (width <= 0) {
            shutters.top.style.display = "none";
            shutters.bot.style.display = "none";
            return;
        }

        // Верхняя
        var topTop = Math.max(0, r.top);
        var topBottom = Math.min(window.innerHeight, r.top + TOP_H);
        var topH = topBottom - topTop;
        if (topH > 0) {
            shutters.top.style.display = "block";
            shutters.top.style.top = topTop + "px";
            shutters.top.style.left = left + "px";
            shutters.top.style.width = width + "px";
            shutters.top.style.height = topH + "px";
        } else {
            shutters.top.style.display = "none";
        }

        // Нижняя
        var botBottom = Math.min(window.innerHeight, r.bottom);
        var botTop = Math.max(0, r.bottom - BOT_H);
        var botH = botBottom - botTop;
        if (botH > 0) {
            shutters.bot.style.display = "block";
            shutters.bot.style.top = botTop + "px";
            shutters.bot.style.left = left + "px";
            shutters.bot.style.width = width + "px";
            shutters.bot.style.height = botH + "px";
        } else {
            shutters.bot.style.display = "none";
        }
    }

    function init() {
        var sidebar = document.querySelector(".sidebar");
        if (!sidebar) {
            console.warn("[sidebar-shutters] .sidebar не найден");
            return;
        }
        console.log("[sidebar-shutters] .sidebar найден");
        injectStyle();
        var shutters = makeShutters();

        var rafId = null;
        function update() {
            if (rafId) return;
            rafId = requestAnimationFrame(function() {
                rafId = null;
                positionShutters(sidebar, shutters);
            });
        }

        window.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update, { passive: true });
        sidebar.addEventListener("scroll", update, { passive: true });

        if (window.ResizeObserver) {
            new ResizeObserver(update).observe(sidebar);
        }
        var t = null;
        new MutationObserver(function() {
            if (t) return;
            t = setTimeout(function() { t = null; update(); }, 150);
        }).observe(sidebar, { childList: true, subtree: false });

        setTimeout(update, 100);
        setTimeout(update, 500);
        setTimeout(update, 1500);

        setInterval(function() {
            var s = document.querySelector(".sidebar");
            if (s && s !== sidebar) {
                sidebar = s;
                update();
            }
        }, 2500);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        setTimeout(init, 120);
    }
})();

/* === P6.2: Batch UI (full) === */
(function () {
  "use strict";

  const STATUS_LABEL_KEYS = {
    queued: "batch_in_queue",
    running: "batch_running",
    done: "batch_done",
    error: "batch_error",
    cancelled: "batch_cancelled",
  };
  const STATUS_COLOR = {
    queued: "#888",
    running: "#1a73e8",
    done: "#1a8f3a",
    error: "#c62828",
    cancelled: "#b8860b",
  };

  let modal = null;
  let listEl, textareaEl, voiceEl, modelEl, langEl, submitBtn, useMainChk;
  const rows = new Map();

  function t(key) {
    const lang = (typeof LANG !== "undefined" && LANG === "en") ? "en" : "ru";
    return (window.I18N && I18N[lang] && I18N[lang][key]) || key;
  }

  const OUT_MAP = {
    exaggeration: "o-exag",
    cfg_weight: "o-cfg",
    temperature: "o-temp",
    repetition_penalty: "o-rep",
    speed: "o-speed",
    pitch_shift: "o-pitch",
    volume: "o-vol",
  };

  function cloneSettingsPanels() {
    if (!modal) return;
    const target = modal.querySelector(".batch-cloned");
    if (!target) return;
    target.innerHTML = "";

    function findSrc(key) {
      let src = null;
      document.querySelectorAll(".sidebar .panel").forEach(function (p) {
        if (src) return;
        if (p.querySelector('[data-i18n="' + key + '"]')) src = p;
      });
      return src;
    }
    function clonePanel(src) {
      const c = src.cloneNode(true);
      c.querySelectorAll("[id]").forEach(function (el) { el.id = "m-" + el.id; });
      c.querySelectorAll("label[for]").forEach(function (el) {
        el.setAttribute("for", "m-" + el.getAttribute("for"));
      });
      return c;
    }

    // Пресет + Настроение — в 2 колонки (как model+voice)
    const twoCol = document.createElement("div");
    twoCol.className = "batch-row-2";
    ["preset", "mood"].forEach(function (key) {
      const src = findSrc(key);
      if (src) twoCol.appendChild(clonePanel(src));
    });
    target.appendChild(twoCol);

    // Остальные — столбиком
    ["settings", "extra", "save"].forEach(function (key) {
      const src = findSrc(key);
      if (src) target.appendChild(clonePanel(src));
    });

    // input → output sync
    Object.keys(OUT_MAP).forEach(function (sliderId) {
      const inp = modal.querySelector("#m-" + sliderId);
      const outp = modal.querySelector("#m-" + OUT_MAP[sliderId]);
      if (inp && outp) {
        const sync = function () { outp.textContent = inp.value; };
        inp.addEventListener("input", sync);
        sync();
      }
    });
  }

  function syncMainToModal() {
    if (!modal) return;
    const ids = [
      "exaggeration", "cfg_weight", "temperature", "repetition_penalty",
      "speed", "pitch_shift", "volume", "ref_length", "pause_between",
      "sentence_split", "output_format", "output_sr", "bit_depth",
      "fade_in_sec", "fade_out_sec",
    ];
    ids.forEach(function (id) {
      const mainEl = document.getElementById(id);
      const modalEl = modal.querySelector("#m-" + id);
      if (mainEl && modalEl) {
        modalEl.value = mainEl.value;
        const outId = OUT_MAP[id];
        if (outId) {
          const outp = modal.querySelector("#m-" + outId);
          if (outp) outp.textContent = modalEl.value;
        }
      }
    });
  }

  function ensureModal() {
    if (modal) return modal;
    modal = document.createElement("div");
    modal.id = "batch-modal";
    modal.className = "batch-modal";
    modal.innerHTML = `
      <div class="batch-backdrop"></div>
      <div class="batch-dialog" role="dialog" aria-modal="true">
        <div class="batch-header">
          <h2 data-i18n="batch_title">Пакетный синтез</h2>
          <button class="help-modal-close" title="×">×</button>
        </div>
        <div class="batch-body">
          <div class="batch-row-3">
            <label class="batch-label"><span data-i18n="batch_model">Модель</span>
              <div class="select-wrap"><select class="select batch-model"></select></div>
            </label>
            <label class="batch-label"><span data-i18n="batch_voice">Голос</span>
              <div class="select-wrap"><select class="select batch-voice"></select></div>
            </label>
            <label class="batch-label"><span data-i18n="batch_lang">Язык</span>
              <div class="select-wrap"><select class="select batch-lang"></select></div>
            </label>
          </div>
          <label class="batch-label"><span data-i18n="batch_text">Текст</span>
            <textarea class="batch-textarea" rows="3" placeholder="Введите текст…" data-i18n-placeholder="text_ph"></textarea>
          </label>
          <label class="batch-check">
            <input type="checkbox" class="batch-use-main" checked>
            <span data-i18n="batch_from_main">Брать настройки из главного экрана</span>
          </label>
          <details class="batch-adv">
            <summary data-i18n="batch_adv">Дополнительно</summary>
            <div class="batch-cloned"></div>
          </details>
          <button class="batch-submit" type="button" data-i18n="batch_submit">В очередь</button>
        </div>
        <div class="batch-list" aria-live="polite"></div>
      </div>`;
    document.body.appendChild(modal);
    modelEl = modal.querySelector(".batch-model");
    voiceEl = modal.querySelector(".batch-voice");
    langEl = modal.querySelector(".batch-lang");
    textareaEl = modal.querySelector(".batch-textarea");
    submitBtn = modal.querySelector(".batch-submit");
    useMainChk = modal.querySelector(".batch-use-main");
    listEl = modal.querySelector(".batch-list");

    modal.querySelector(".batch-backdrop").addEventListener("click", closeModal);
    modal.querySelector(".help-modal-close").addEventListener("click", closeModal);
    submitBtn.addEventListener("click", onSubmit);
    if (modelEl) modelEl.addEventListener("change", function() { loadLangs(); });
    return modal;
  }

  function openModal() {
    ensureModal();
    syncMainToModal();
    cloneSettingsPanels();
    
    applyLangTo(modal);
    modal.style.display = "flex";
    loadModels().then(function() { loadLangs(); });
    loadVoices();
    setTimeout(() => textareaEl && textareaEl.focus(), 50);
  }
  function closeModal() { if (modal) modal.style.display = "none"; }

  function applyLangTo(root) {
    const lang = (document.documentElement.lang === "en") ? "en" : "ru";
    if (typeof I18N === "undefined") return;
    root.querySelectorAll("[data-i18n]").forEach(function (el) {
      const key = el.getAttribute("data-i18n");
      const val = I18N[lang] && I18N[lang][key];
      if (val) el.textContent = val;
    });
    root.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      const key = el.getAttribute("data-i18n-placeholder");
      const val = I18N[lang] && I18N[lang][key];
      if (val) el.placeholder = val;
    });
  }

  async function loadModels() {
    if (modelEl.dataset.loaded === "1") return;
    try {
      const r = await fetch("/api/models");
      const d = await r.json();
      const models = (d.models || []).filter(m => m.loaded !== false);
      if (!models.length) {
        modelEl.innerHTML = `<option value="core">core</option>`;
      } else {
        const cur = (typeof currentMode !== "undefined" && currentMode) || "core";
        modelEl.innerHTML = models.map(m =>
          `<option value="${escapeAttr(m.code)}"${m.code === cur ? " selected" : ""}>${escapeHtml(m.code)}</option>`
        ).join("");
      }
      modelEl.dataset.loaded = "1";
    } catch (e) {
      modelEl.innerHTML = `<option value="core">core</option>`;
    }
  }

  function loadLangs() {
    if (!langEl) return;
    const m = (typeof MODELS !== "undefined" ? MODELS : []).find(x => x.code === (modelEl && modelEl.value));
    const supported = new Set(m ? (m.languages || []) : ["en"]);
    const names = (typeof LANG_NAMES !== "undefined") ? LANG_NAMES : {};
    const current = langEl.value || (typeof currentLang !== "undefined" ? currentLang : "ru");
    langEl.innerHTML = "";
    let firstAvailable = null;
    Object.keys(names).forEach(function (code) {
      if (!supported.has(code)) return;
      if (!firstAvailable) firstAvailable = code;
      const opt = document.createElement("option");
      opt.value = code;
      opt.textContent = code.toUpperCase() + " · " + names[code];
      if (code === current) opt.selected = true;
      langEl.appendChild(opt);
    });
    const hasCurrent = Array.from(langEl.options).some(o => o.value === current);
    if (!hasCurrent && firstAvailable) langEl.value = firstAvailable;
  }

  async function loadVoices() {
    if (voiceEl.dataset.loaded === "1") return;
    try {
      const r = await fetch("/api/voices");
      const d = await r.json();
      const vs = (d.voices || d.profiles || []).map(v => v.name || v.id || v);
      voiceEl.innerHTML = vs.length
        ? vs.map(n => `<option value="${escapeAttr(n)}">${escapeHtml(n)}</option>`).join("")
        : `<option value="">${t("batch_no_voices")}</option>`;
      voiceEl.dataset.loaded = "1";
    } catch (e) {
      voiceEl.innerHTML = `<option value="">(error)</option>`;
    }
  }

  function collectSettings() {
    const main = useMainChk.checked;
    const fromMain = function (id, def) {
      const el = main ? document.getElementById(id) : modal.querySelector("#m-" + id);
      return el ? el.value : def;
    };
    return {
      mode: modelEl.value || "core",
      language: (langEl && langEl.value) || (typeof currentLang !== "undefined" ? currentLang : "ru"),
      preset: fromMain("preset", ""),
      mood: fromMain("mood", "auto"),
      exaggeration: parseFloat(fromMain("exaggeration", 0.5)),
      cfg_weight: parseFloat(fromMain("cfg_weight", 0.5)),
      temperature: parseFloat(fromMain("temperature", 0.8)),
      repetition_penalty: parseFloat(fromMain("repetition_penalty", 1.2)),
      speed: parseFloat(fromMain("speed", 1.0)),
      pitch_shift: parseFloat(fromMain("pitch_shift", 0)),
      volume: parseFloat(fromMain("volume", 1.0)),
      ref_length: parseInt(fromMain("ref_length", 15), 10),
      pause_between: parseFloat(fromMain("pause_between", 0.2)),
      sentence_split: fromMain("sentence_split", "medium"),
      output_format: fromMain("output_format", "wav"),
      output_sr: parseInt(fromMain("output_sr", 44100), 10),
      bit_depth: parseInt(fromMain("bit_depth", 16), 10),
      fade_in_sec: parseFloat(fromMain("fade_in_sec", 0)),
      fade_out_sec: parseFloat(fromMain("fade_out_sec", 0)),
    };
  }

  async function onSubmit() {
    const text = textareaEl.value.trim();
    if (!text) { textareaEl.focus(); return; }
    submitBtn.disabled = true;
    try {
      const r = await fetch("/api/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: voiceEl.value || "", settings: collectSettings() }),
      });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const d = await r.json();
      if (!d.ok || !d.task_id) throw new Error("no task_id");
      addRow(d.task_id, text, modelEl.value);
      watch(d.task_id);
      textareaEl.value = "";
    } catch (e) {
      alert(t("batch_send_err") + e.message);
    } finally {
      submitBtn.disabled = false;
    }
  }

  function addRow(taskId, text, mode) {
    const row = document.createElement("div");
    row.className = "batch-task";
    const short = text.length > 60 ? text.slice(0, 60) + "…" : text;
    row.innerHTML = `
      <div class="batch-task-main">
        <div class="batch-task-text" title="${escapeAttr(text)}">${escapeHtml(short)}</div>
        <div class="batch-task-meta">
          <span class="batch-mode">[${escapeHtml(mode)}]</span>
          <span class="batch-status">—</span>
          <span class="batch-id">#${escapeHtml(taskId.slice(0, 8))}</span>
        </div>
      </div>
      <a class="batch-download" style="display:none" target="_blank" rel="noopener"
         data-i18n="batch_download">ZIP</a>`;
    listEl.prepend(row);
    rows.set(taskId, {
      row,
      statusEl: row.querySelector(".batch-status"),
      fileEl: row.querySelector(".batch-download"),
    });
    applyLangTo(row);
    updateRow(taskId, { id: taskId, status: "queued", result_file: null });
  }

  function updateRow(taskId, task) {
    const r = rows.get(taskId);
    if (!r) return;
    const st = task.status || "queued";
    r.statusEl.textContent = t(STATUS_LABEL_KEYS[st] || st);
    r.statusEl.style.color = STATUS_COLOR[st] || "#888";
    if (st === "done" && task.result_file) {
      r.fileEl.href = "/api/history/" + encodeURIComponent(taskId) + "/export";
      r.fileEl.style.display = "inline-block";
      r.fileEl.title = task.result_file;
    }
    if (st === "error" && task.error) r.statusEl.title = String(task.error);
  }

  function watch(taskId) {
    const proto = location.protocol === "https:" ? "wss:" : "ws:";
    let ws;
    try { ws = new WebSocket(proto + "//" + location.host + "/ws/batch/" + encodeURIComponent(taskId)); }
    catch (e) { return; }
    ws.addEventListener("message", ev => {
      try {
        const m = JSON.parse(ev.data);
        if (m.type === "status" && m.task) updateRow(taskId, m.task);
      } catch (e) { /* ignore */ }
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
  }
  function escapeAttr(s) { return escapeHtml(s); }

  function init() {
    const btn = document.getElementById("btn-batch");
    if (!btn) return;
    btn.addEventListener("click", openModal);
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
  }

  window.addEventListener("jst:lang-changed", function () {
    if (!modal) return;
    cloneSettingsPanels();
    applyLangTo(modal);
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();


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
    return (peakSrc || "") + "|" + w + "|" + h + "|" + (PLAYER_SETTINGS.scale || 1);
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
    const key = rounded + "|" + (isNight() ? "n" : "d");
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
        progressEl.style.width = (_c / _d * 100).toFixed(2) + "%";
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
    return m + ":" + (s < 10 ? "0" : "") + s;
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
        progressEl.style.width = (cur / dur * 100).toFixed(2) + "%";
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
        if (progressEl && dur > 0) progressEl.style.width = (cur / dur * 100).toFixed(2) + "%";
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
          : "/output/" + file;
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
      if (optScaleVal) optScaleVal.textContent = Number(PLAYER_SETTINGS.scale).toFixed(1) + "×";
      if (optOpacity) optOpacity.value = String(PLAYER_SETTINGS.opacity);
      if (optOpacityVal) optOpacityVal.textContent = Math.round(PLAYER_SETTINGS.opacity * 100) + "%";
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
      if (optScaleVal) optScaleVal.textContent = PLAYER_SETTINGS.scale.toFixed(1) + "×";
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
      if (optOpacityVal) optOpacityVal.textContent = Math.round(PLAYER_SETTINGS.opacity * 100) + "%";
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
            node.textContent = dict[key] + " ";
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
    const valEl = document.getElementById(id + "-val");
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
(function () {
  "use strict";
  if (window.__jstpLastAudioRestore) return;
  window.__jstpLastAudioRestore = true;
  window.addEventListener("DOMContentLoaded", () => {
    applySynthLangToText();

    try {
      const raw = localStorage.getItem("jstp-last-audio");
      if (!raw) return;
      const { url, text } = JSON.parse(raw);
      if (!url) return;
      // Дадим другим IIFE зарегистрировать слушателя jst:load-audio
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("jst:load-audio", {
          detail: { url, text: text || "" }
        }));
      }, 500);
    } catch (e) { /* ignore */ }
  });
})();

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
    pv.addEventListener("play", async function () {
      try { await ensureChain(); applyFxNow(); scheduleFade(); }
      catch (e) { console.warn("[FX] chain on play:", e); }
    });
    pv.addEventListener("seeked", function () {
      resetFade();
      if (!pv.paused) scheduleFade();
    });
    pv.addEventListener("pause", function () {
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
          showToast("HTTP " + resp.status + " " + (resp.statusText || "") + " — " + url.replace(/^https?:\/\/[^/]+/, ""), "error");
        }
      }
      return resp;
    } catch (err) {
      if (typeof showToast === "function") {
        showToast(ti("network") + ": " + (err.message || ti("no_conn")) + " — " + url.replace(/^https?:\/\/[^/]+/, ""), "error");
      }
      throw err;
    }
  };

  // 3b. Global JS errors
  window.addEventListener("error", (e) => {
    if (typeof showToast !== "function") return;
    const msg = e.message || (e.error && e.error.message) || "JS error";
    showToast("JS: " + msg, "error");
  });

  // 3c. Unhandled promise rejections
  window.addEventListener("unhandledrejection", (e) => {
    if (typeof showToast !== "function") return;
    const r = e.reason;
    const msg = (r && r.message) ? r.message : String(r || "unknown");
    showToast("Promise: " + msg, "error");
  });

  // 3d. Heartbeat — раз в 60 сек проверяет /healthz, не чаще 1 toast/мин
  let _lastHealthToast = 0;
  setInterval(async () => {
    try {
      const r = await _origFetch("/healthz", { cache: "no-store" });
      if (!r.ok) {
        const now = Date.now();
        if (now - _lastHealthToast > 60000 && typeof showToast === "function") {
          showToast(ti("server_down") + " (healthz " + r.status + ")", "error");
          _lastHealthToast = now;
        }
      }
    } catch (e) {
      const now = Date.now();
      if (now - _lastHealthToast > 60000 && typeof showToast === "function") {
        showToast(ti("server_crashed") + ": " + (e.message || "offline"), "error");
        _lastHealthToast = now;
      }
    }
  }, 60000);

  console.log("[JST] v1.6.1: error toasts active (fetch, JS, WS, heartbeat)");
})();


// ============================================================
// v1.7.13: PWA install prompt
// ============================================================
let _pwaDeferred = null;
let _pwaBtn = null;

function _pwaIsStandalone() {
  return (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches)
    || window.navigator.standalone === true;
}

function _pwaIsIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function _pwaShowBtn() {
  if (_pwaBtn) { _pwaBtn.style.display = "inline-flex"; }
}

function _pwaHideBtn() {
  if (_pwaBtn) { _pwaBtn.style.display = "none"; }
}

function _pwaAttach() {
  _pwaBtn = document.getElementById("pwa-install");
  if (!_pwaBtn) return;

  if (localStorage.getItem("jst-pwa-dismissed") === "1") return;
  if (_pwaIsStandalone()) return;

  _pwaBtn.addEventListener("click", async () => {
    if (_pwaDeferred) {
      // Chrome / Edge / Android
      _pwaDeferred.prompt();
      try {
        const choice = await _pwaDeferred.userChoice;
        if (choice && choice.outcome === "accepted") {
          _pwaHideBtn();
          try { if (window.setStatus) setStatus(t("status_ready"), ""); } catch (e) {}
        }
      } catch (e) {}
      _pwaDeferred = null;
    } else if (_pwaIsIOS()) {
      // iOS Safari: нет beforeinstallprompt — инструкция
      const msg = LANG === "en"
        ? "iOS: Share → Add to Home Screen"
        : "iOS: Поделиться → На экран «Домой»";
      try { alert(msg); } catch (e) {}
    } else {
      // Fallback — уже установлено или не поддерживается
      _pwaHideBtn();
    }
  });

  // iOS: показываем сразу с инструкцией
  if (_pwaIsIOS() && !_pwaIsStandalone()) {
    _pwaShowBtn();
  }
}

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  _pwaDeferred = e;
  _pwaShowBtn();
});

window.addEventListener("appinstalled", () => {
  _pwaDeferred = null;
  _pwaHideBtn();
  try { localStorage.setItem("jst-pwa-dismissed", "1"); } catch (e) {}
});

document.addEventListener("DOMContentLoaded", _pwaAttach);

