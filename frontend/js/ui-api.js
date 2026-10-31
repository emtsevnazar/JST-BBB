/* ui-api.js — Phase 11: settings/prefs/presets (getSettings, applyPreset, normalize, save, applySynthLang). */
(function () {
  'use strict';
  const $ = function (id) { return document.getElementById(id); };
  function saveSynthPrefs() {
    window.currentMode = (window.currentMode !== undefined ? window.currentMode : window.currentMode);
    try {
      localStorage.setItem("jst-mode", window.currentMode || "core");
      localStorage.setItem("jst-synth-lang", window.currentLang || "ru");
    } catch (e) {}
  }

  function applySynthLangToText() {
    const ta = document.getElementById("text");
    if (ta && window.currentLang) ta.setAttribute("lang", window.currentLang);
  }

  function normalizeSynthPrefs() {
    let modelsList = [];
    try {
      if (window.MODELS && Array.isArray(window.MODELS)) modelsList = window.MODELS;
    } catch (e) {}
    if (!modelsList.length) {
      if (!window.currentLang) { if (window.__jstSetCurrentLang) window.__jstSetCurrentLang("en"); }
      saveSynthPrefs();
      return;
    }
    if (!modelsList.find((m) => { return m.code === window.currentMode; })) {
      if (window.__jstSetCurrentMode) window.__jstSetCurrentMode("core");
    }
    const m = modelsList.find((x) => { return x.code === window.currentMode; });
    const supported = (m && Array.isArray(m.languages) && m.languages.length) ? m.languages : ["en"];
    if (!window.currentLang || supported.indexOf(window.currentLang) === -1) {
      const _v = supported.indexOf("en") !== -1 ? "en" : supported[0];
      if (window.__jstSetCurrentLang) window.__jstSetCurrentLang(_v); else window.currentLang = _v;
    }
    saveSynthPrefs();
    applySynthLangToText();
  }

  function applyPreset(p) {
    if (!p) return;
    const sliderIds = { exaggeration:["o-exag",2], cfg_weight:["o-cfg",2], temperature:["o-temp",2],
      repetition_penalty:["o-rep",2], speed:["o-speed",2], pitch_shift:["o-pitch",0], volume:["o-vol",2] };
    Object.entries(sliderIds).forEach((entry) => {
      const key = entry[0], outId = entry[1][0], dec = entry[1][1];
      if (key in p && p[key] != null) {
        const el = $(key); const out = $(outId);
        if (el) el.value = p[key];
        if (out) out.textContent = Number(p[key]).toFixed(dec);
      }
    });
    if (p.ref_length) { const elr = $("ref_length"); if (elr) elr.value = p.ref_length; }
    if (p.pause_between) { const elp = $("pause_between"); if (elp) elp.value = p.pause_between; }
    if (p.sentence_split) { const els = $("sentence_split"); if (els) els.value = p.sentence_split; }
  }

  function getSettings() {
    const sliderIds = ["exaggeration","cfg_weight","temperature","repetition_penalty","speed","pitch_shift","volume"];
    const s = {};
    sliderIds.forEach((key) => {
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
    s.mode = window.currentMode;
    s.language = window.currentLang;
    s.accent = window.currentAccent;
    s.ref_length = rl ? (parseInt(rl.value) || 12) : 12;
    s.pause_between = pb ? (parseFloat(pb.value) || 0.20) : 0.20;
    s.sentence_split = ss ? ss.value : "medium";
    s.mood = (document.querySelector("#mood") || {}).value || "auto";
    return s;
  }

  window.__jstApi = {
    saveSynthPrefs: saveSynthPrefs,
    applySynthLangToText: applySynthLangToText,
    normalizeSynthPrefs: normalizeSynthPrefs,
    applyPreset: applyPreset,
    getSettings: getSettings,
  };
  if (typeof console !== 'undefined') console.log('[JST ui-api] exports:', Object.keys(window.__jstApi));
})();
