/* modules/batch-ui.js — вынесено из app.js (Phase C4)
   Оригинальный IIFE: app.js строки 389-761 (1-based).
*/

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
      document.querySelectorAll(".sidebar .panel").forEach((p) => {
        if (src) return;
        if (p.querySelector(`[data-i18n="${  key  }"]`)) src = p;
      });
      return src;
    }
    function clonePanel(src) {
      const c = src.cloneNode(true);
      c.querySelectorAll("[id]").forEach((el) => { el.id = `m-${  el.id}`; });
      c.querySelectorAll("label[for]").forEach((el) => {
        el.setAttribute("for", `m-${  el.getAttribute("for")}`);
      });
      return c;
    }

    // Пресет + Настроение — в 2 колонки (как model+voice)
    const twoCol = document.createElement("div");
    twoCol.className = "batch-row-2";
    ["preset", "mood"].forEach((key) => {
      const src = findSrc(key);
      if (src) twoCol.appendChild(clonePanel(src));
    });
    target.appendChild(twoCol);

    // Остальные — столбиком
    ["settings", "extra", "save"].forEach((key) => {
      const src = findSrc(key);
      if (src) target.appendChild(clonePanel(src));
    });

    // input → output sync
    Object.keys(OUT_MAP).forEach((sliderId) => {
      const inp = modal.querySelector(`#m-${  sliderId}`);
      const outp = modal.querySelector(`#m-${  OUT_MAP[sliderId]}`);
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
    ids.forEach((id) => {
      const mainEl = document.getElementById(id);
      const modalEl = modal.querySelector(`#m-${  id}`);
      if (mainEl && modalEl) {
        modalEl.value = mainEl.value;
        const outId = OUT_MAP[id];
        if (outId) {
          const outp = modal.querySelector(`#m-${  outId}`);
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
    if (modelEl) modelEl.addEventListener("change", () => { loadLangs(); });
    return modal;
  }

  function openModal() {
    ensureModal();
    syncMainToModal();
    cloneSettingsPanels();
    
    applyLangTo(modal);
    modal.style.display = "flex";
    loadModels().then(() => { loadLangs(); });
    loadVoices();
    setTimeout(() => textareaEl && textareaEl.focus(), 50);
  }
  function closeModal() { if (modal) modal.style.display = "none"; }

  function applyLangTo(root) {
    const lang = (document.documentElement.lang === "en") ? "en" : "ru";
    if (typeof I18N === "undefined") return;
    root.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const val = I18N[lang] && I18N[lang][key];
      if (val) el.textContent = val;
    });
    root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
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
    Object.keys(names).forEach((code) => {
      if (!supported.has(code)) return;
      if (!firstAvailable) firstAvailable = code;
      const opt = document.createElement("option");
      opt.value = code;
      opt.textContent = `${code.toUpperCase()  } · ${  names[code]}`;
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
      const el = main ? document.getElementById(id) : modal.querySelector(`#m-${  id}`);
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
      if (!r.ok) throw new Error(`HTTP ${  r.status}`);
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
    const short = text.length > 60 ? `${text.slice(0, 60)  }…` : text;
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
      r.fileEl.href = `/api/history/${  encodeURIComponent(taskId)  }/export`;
      r.fileEl.style.display = "inline-block";
      r.fileEl.title = task.result_file;
    }
    if (st === "error" && task.error) r.statusEl.title = String(task.error);
  }

  function watch(taskId) {
    const proto = location.protocol === "https:" ? "wss:" : "ws:";
    let ws;
    try { ws = new WebSocket(`${proto  }//${  location.host  }/ws/batch/${  encodeURIComponent(taskId)}`); }
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

  window.addEventListener("jst:lang-changed", () => {
    if (!modal) return;
    cloneSettingsPanels();
    applyLangTo(modal);
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
