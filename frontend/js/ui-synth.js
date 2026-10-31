/* ui-synth.js — Phase 6a: drawWaveform (canvas) */
(function () {
  const $ = function (id) { return document.getElementById(id); };
  const __jstContrast = (window.__jstHelpers && window.__jstHelpers.__jstContrast) || function () { return false; };
  const t = (window.__jstHelpers && window.__jstHelpers.t) || function (k) { return k; };
  const setStatus = (window.__jstHelpers && window.__jstHelpers.setStatus) || function () {};
  const fmt = (window.__jstHelpers && window.__jstHelpers.fmt) || function (sec) { return `${((sec || 0)).toFixed(1)  }s`; };
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

function resetPlayback() {
  (window.activeSources || []).forEach(s => { try { s.stop(); } catch(e) {} });
  window.__jstSetActiveSources([]);
  if (window.ws) { try { window.ws.close(); } catch(e) {} if (window.__jstSetWs) window.__jstSetWs(null); else window.ws = null; }
  window.__jstSetNextStartTime(0);
  window.__jstSetTotalSamples(0);
  window.__jstSetAllChunks([]);
  window.JST_IS_STREAMING = false;
  const prog = $("progress"), pt = $("player-time"), ptt = $("player-total");
  if (prog) prog.style.width = "0%";
  if (pt) pt.textContent = "0:00.0";
  if (ptt) ptt.textContent = "0:00.0";
  drawWaveform([]);
}

function stopPlayback() {
  (window.activeSources || []).forEach(s => { try { s.stop(); } catch(e) {} });
  if (window.__jstSetActiveSources) window.__jstSetActiveSources([]);
  if (window.ws) { try { window.ws.close(); } catch(e) {} if (window.__jstSetWs) window.__jstSetWs(null); }
  if (window.__jstSetStreaming) window.__jstSetStreaming(false);
  window.JST_IS_STREAMING = false;
  const btnS = $("btn-synth"), btnT = $("btn-stop");
  if (btnS) { btnS.disabled = false; btnS.classList.remove("is-busy"); window.JST_SYNTH_START = 0; }
  if (btnT) btnT.disabled = true;
  setStatus(t("status_stop"), "");
  if (window.animFrame) cancelAnimationFrame(window.animFrame);
  const pv = $("preview-player"); if (pv) pv.pause();
}

function finishStreaming(file) {
  if (window.__jstSetStreaming) window.__jstSetStreaming(false);
  window.JST_IS_STREAMING = false;
  if (window._synthTimer) { clearInterval(window._synthTimer); window._synthTimer = null; }
  if (window.wsTimeoutTimer) {
    clearTimeout(window.wsTimeoutTimer);
    if (window.__jstSetWsTimeoutTimer) window.__jstSetWsTimeoutTimer(null);
    else window.wsTimeoutTimer = null;
  }
  const btnS = $("btn-synth"); if (btnS) { btnS.disabled = false; btnS.classList.remove("is-busy"); window.JST_SYNTH_START = 0; }
  if (file) {
    const dl = $("btn-download"), pv = $("preview-player");
    if (dl) { dl.href = `/output/${  file}`; dl.download = file; }
    if (pv) {
      pv.onerror = () => {
        console.error(`[JST] preview-player load error for ${  file}`);
        setStatus(`${t("status_err")  }: audio load failed`, "error");
      };
      pv.style.display = "block";
      pv.src = `/output/${  file}`;
      pv.load();
    }
    try {
      const ta = document.getElementById("text");
      window.dispatchEvent(new CustomEvent("jst:load-audio", {
        detail: { url: `/output/${  file}`, text: ta ? ta.value : "" }
      }));
    } catch (e) { console.warn("jst:load-audio dispatch failed", e); }
    if (window.__jstRefreshHistory) window.__jstRefreshHistory();
  }
  if ((window.activeSources || []).length === 0) { const b = $("btn-stop"); if (b) b.disabled = true; }
}

function initSTT() {
  const btn = $("btn-stt"); if (!btn) return;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { btn.title = t("stt_not_supported"); btn.disabled = true; btn.style.opacity = "0.3"; return; }
  btn.addEventListener("click", () => {
    if (window.sttActive) return;
    const recognition = new SR();
    recognition.lang = (window.currentLang === "ru") ? "ru-RU" : "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;
    const textEl = $("text");
    let base = textEl ? textEl.value : "";
    recognition.onstart = function () {
      if (window.__jstSetSttActive) window.__jstSetSttActive(true); else window.sttActive = true;
      btn.style.background = "var(--red)";
      setStatus(t("status_listening"), "busy");
    };
    recognition.onresult = function (ev) {
      let interim = "", final = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const tx = ev.results[i][0].transcript;
        if (ev.results[i].isFinal) final += tx; else interim += tx;
      }
      if (textEl) {
        if (final) { base = (base ? `${base  } ` : "") + final; textEl.value = base; }
        else if (interim) textEl.value = base + (base ? " " : "") + interim;
      }
    };
    recognition.onerror = function (ev) { setStatus(`${t("status_err")  }: ${  ev.error}`, "error"); };
    recognition.onend = function () {
      if (window.__jstSetSttActive) window.__jstSetSttActive(false); else window.sttActive = false;
      btn.style.background = "";
      setStatus(t("status_ready"), "");
    };
    try { recognition.start(); } catch(e) { setStatus(`${t("status_stt_fail")  }: ${  e.message}`, "error"); }
  });
}

function initRecordButton() {
  const btn = $("btn-record"); if (!btn) return;
  btn.addEventListener("click", async () => {
    if (window.mediaRecorder && window.mediaRecorder.state === "recording") { window.mediaRecorder.stop(); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      if (window.__jstSetMediaRecorder) window.__jstSetMediaRecorder(mr); else window.mediaRecorder = mr;
      const chunks = [];
      if (window.__jstSetRecordedChunks) window.__jstSetRecordedChunks(chunks); else window.recordedChunks = chunks;
      mr.ondataavailable = function (e) { if (e.data.size > 0) chunks.push(e.data); };
      mr.onstop = async function () {
        stream.getTracks().forEach((tr) => { tr.stop(); });
        clearInterval(window.recordTimer);
        btn.style.background = ""; btn.style.color = "";
        const blob = new Blob(window.recordedChunks || chunks, { type: "audio/webm" });
        const dur = ((Date.now() - window.recordStartTime) / 1000).toFixed(1);
        setStatus(`${t("status_rec_loading")  } (${  dur  }s)...`, "busy");
        const nv = $("new-voice");
        let name = nv ? nv.value.trim() : "";
        if (!name) { name = `recorded_${  Date.now()}`; if (nv) nv.value = name; }
        try {
          const fd = new FormData(); fd.append("name", name);
          await fetch("/api/voices/create", { method: "POST", body: fd });
          const ffd = new FormData(); ffd.append("file", blob, "recording.webm");
          const r = await fetch(`/api/voices/${  encodeURIComponent(name)  }/upload-blob`, { method: "POST", body: ffd });
          if (!r.ok) throw new Error(await r.text());
          const fd2 = new FormData(); fd2.append("ref_length", ($("ref_length") || {}).value || "15");
          await fetch(`/api/voices/${  encodeURIComponent(name)  }/rebuild-reference`, { method: "POST", body: fd2 });
          if (window.__jstLoadVoices) await window.__jstLoadVoices();
          const v = $("voice"); if (v) v.value = name;
          setStatus(`${t("status_rec_saved")  }: ${  name}`, "");
        } catch(e) { setStatus(`${t("status_err")  }: ${  e.message}`, "error"); }
      };
      mr.start();
      if (window.__jstSetRecordStartTime) window.__jstSetRecordStartTime(Date.now()); else window.recordStartTime = Date.now();
      btn.style.background = "var(--red)"; btn.style.color = "#fff";
      let sec = 0;
      const timer = setInterval(() => { sec++; setStatus(`${t("status_rec_timer")  }: ${  sec  }s. ${  t("status_rec_timer_hint")}`, "busy"); }, 1000);
      if (window.__jstSetRecordTimer) window.__jstSetRecordTimer(timer); else window.recordTimer = timer;
    } catch(e) { setStatus(`${t("status_mic_error")  }: ${  e.message}`, "error"); }
  });
}

  function handleAudioChunk(buf) {
    const floats = new Float32Array(buf);
    if (window.allChunks) window.allChunks.push(floats);
    else window.allChunks = [floats];
    if (window.__jstSetTotalSamples) window.__jstSetTotalSamples((window.totalSamples || 0) + floats.length);
    if (!window.audioCtx) return;
    const ab = window.audioCtx.createBuffer(1, floats.length, window.currentSR || 24000);
    ab.copyToChannel(floats, 0);
    const src = window.audioCtx.createBufferSource();
    src.buffer = ab; src.connect(window.audioCtx.destination);
    const now = window.audioCtx.currentTime;
    let ns = window.nextStartTime || 0;
    if (ns < now) ns = now + 0.03;
    src.start(ns);
    if (window.__jstSetNextStartTime) window.__jstSetNextStartTime(ns + ab.duration);
    if (window.activeSources) window.activeSources.push(src);
    else window.activeSources = [src];
    src.onended = function () {
      const filtered = (window.activeSources || []).filter((s) => { return s !== src; });
      if (window.__jstSetActiveSources) window.__jstSetActiveSources(filtered);
      else window.activeSources = filtered;
      if (filtered.length === 0 && !window.isStreaming) { const b = $("btn-stop"); if (b) b.disabled = true; }
    };
    updateProgress();
  }

  function updateProgress() {
    if (!window.audioCtx || !window.isStreaming) {
      if (window.animFrame) cancelAnimationFrame(window.animFrame);
      return;
    }
    const totalDur = (window.totalSamples || 0) / (window.currentSR || 24000);
    const played = Math.max(0, window.audioCtx.currentTime - ((window.nextStartTime || 0) - totalDur));
    const r = Math.min(1, played / totalDur);
    const prog = $("progress"), pt = $("player-time"), ptt = $("player-total");
    if (prog) prog.style.width = `${r * 100  }%`;
    if (pt) pt.textContent = fmt(played);
    if (ptt) ptt.textContent = fmt(totalDur);
    drawWaveform(window.allChunks || []);
    if (r < 1) window.animFrame = requestAnimationFrame(updateProgress);
  }

  function synthesize() {
    if (window.JST_IS_STREAMING === false || window.JST_IS_STREAMING === undefined) {
      try {
        const _b = document.getElementById('btn-synth');
        if (_b && _b.classList.contains('is-busy')) {
          _b.classList.remove('is-busy');
          window.JST_SYNTH_START = 0;
          console.warn('[JST v65] Reset stale is-busy (streaming=false)');
        }
      } catch(e) {}
    }
    const btnS = $("btn-synth"), btnT = $("btn-stop");
    if (btnS && btnS.classList.contains("is-busy")) {
      const _wsDead = !window.ws || window.ws.readyState === 2 || window.ws.readyState === 3;
      const _notStreaming = !window.JST_IS_STREAMING && !window.isStreaming;
      if (_wsDead || _notStreaming) {
        try { btnS.classList.remove("is-busy"); } catch(e) {}
        window.JST_SYNTH_START = 0;
        if (window.__jstSetStreaming) window.__jstSetStreaming(false); else window.isStreaming = false;
        window.JST_IS_STREAMING = false;
        console.warn('[JST v73] Reset stale is-busy (ws dead or not streaming)');
      }
    }
    if (btnS && btnS.classList.contains("is-busy")) {
      const _elapsed = Date.now() - (window.JST_SYNTH_START || 0);
      if (_elapsed > 60000) {
        try { btnS.classList.remove("is-busy"); } catch(e) {}
        try {
          if (window.ws) {
            window.ws.close();
            if (window.__jstSetWs) window.__jstSetWs(null); else window.ws = null;
          }
        } catch(e) {}
        if (window.__jstSetStreaming) window.__jstSetStreaming(false); else window.isStreaming = false;
        window.JST_IS_STREAMING = false;
        if (window._synthTimer) { clearInterval(window._synthTimer); window._synthTimer = null; }
        if (typeof showToast === "function") showToast(`Сброшен зависший синтез (${  Math.round(_elapsed/1000)  }с)`);
      } else {
        if (typeof showToast === "function") showToast(t("synth_wait") || "Идёт синтез — подождите");
        return;
      }
    }
    if (window.isStreaming) return;
    const textEl = $("text"), voiceEl = $("voice");
    if (!textEl || !voiceEl) return;
    const text = textEl.value.trim();
    const voice = voiceEl.value;
    if (!text) { setStatus(t("text_ph") || "Введите текст", "error"); textEl.focus(); return; }
    if (!voice) { setStatus(t("status_voice_select"), "error"); return; }
    window.JST_SYNTH_START = Date.now();
    if (btnS) { btnS.disabled = true; btnS.classList.add("is-busy"); }
    if (btnT) btnT.disabled = false;
    if (!window.audioCtx) window.audioCtx = new AudioContext();
    if (window.audioCtx.state === "suspended") window.audioCtx.resume();
    if (window.__jstSynth && window.__jstSynth.resetPlayback) window.__jstSynth.resetPlayback();
    if (window.__jstSetStreaming) window.__jstSetStreaming(true); else window.isStreaming = true;
    window.JST_IS_STREAMING = true;
    const pv = $("preview-player");
    if (pv) pv.style.display = "none";
    setStatus(`${t("status_synth")  }...`, "busy");
    const _synthStart = Date.now();
    if (window._synthTimer) clearInterval(window._synthTimer);
    window._synthTimer = setInterval(() => {
      const sec = ((Date.now() - _synthStart) / 1000).toFixed(1);
      const stt = document.getElementById("status-text");
      if (stt && stt.textContent) {
        if (stt.textContent.indexOf("...") >= 0 || stt.textContent.indexOf(t("status_synth")) >= 0) {
          stt.textContent = `${t("status_synth")  }... ${  sec  }s`;
          window.JST_LAST_STATUS = stt.textContent;
          window.JST_LAST_STATUS_LANG = window.LANG;
        }
      }
    }, 1000);
    const proto = location.protocol === "https:" ? "wss:" : "ws:";
    const _ws = new WebSocket(`${proto  }//${  location.host  }/ws/synthesize`);
    if (window.__jstSetWs) window.__jstSetWs(_ws); else window.ws = _ws;
    _ws.binaryType = "arraybuffer";
    _ws.onopen = function() {
      _ws.send(JSON.stringify({ type: "synthesize", text: text, voice: voice, settings: (window.__jstGetSettings ? window.__jstGetSettings() : {}) }));
      const _timer = setTimeout(() => {
        console.warn("[JST] WS timeout — 600s без ответа, закрываю");
        setStatus(`${t("status_err")  }: timeout`, "error");
        try { _ws.close(); } catch (e) {}
        if (window.__jstSynth && window.__jstSynth.finishStreaming) window.__jstSynth.finishStreaming(null);
      }, 600000);
      if (window.__jstSetWsTimeoutTimer) window.__jstSetWsTimeoutTimer(_timer); else window.wsTimeoutTimer = _timer;
    };
    _ws.onmessage = function(ev) {
      if (typeof ev.data === "string") {
        const m = JSON.parse(ev.data);
        if (m.type === "start") {
          window.currentSR = m.sr;
          setStatus(`${t("status_plan")  }: ${  m.sentences  } ${  t("status_phrases")}`, "busy");
        } else if (m.type === "stage") {
          const stageKey = { prepare: "status_stage_prepare", synth: "status_stage_synth", post: "status_stage_post" }[m.stage];
          setStatus(stageKey ? t(stageKey) : (m.detail || ""), "busy");
        } else if (m.type === "done") {
          setStatus(`${t("status_done")  } · ${  m.file}`, "");
          if (window.__jstSynth && window.__jstSynth.finishStreaming) window.__jstSynth.finishStreaming(m.file);
        } else if (m.type === "error") {
          const _errCode = m.code || "unknown";
          const _errKey = `err_${  _errCode}`;
          let _errText = t(_errKey);
          if (_errText === _errKey) _errText = m.message || m.code || "unknown";
          setStatus(`${t("status_err")  }: ${  _errText}`, "error");
          if (window.__jstSynth && window.__jstSynth.finishStreaming) window.__jstSynth.finishStreaming(null);
        }
      } else {
        if (window.__jstSynth && window.__jstSynth.handleAudioChunk) window.__jstSynth.handleAudioChunk(ev.data);
      }
    };
    _ws.onerror = function() {
      if (typeof showToast === "function") showToast(ti("ws_error"), "error");
      setStatus(t("status_err"), "error");
      if (window.__jstSynth && window.__jstSynth.finishStreaming) window.__jstSynth.finishStreaming(null);
    };
    // Note: original had duplicate ws.onclose (v74 + v73); v73 was effective — preserved below.
    _ws.onclose = function(ev) {
      if (window.wsTimeoutTimer) { clearTimeout(window.wsTimeoutTimer); if (window.__jstSetWsTimeoutTimer) window.__jstSetWsTimeoutTimer(null); else window.wsTimeoutTimer = null; }
      if (window.isStreaming || window.JST_IS_STREAMING) {
        console.warn(`[JST v73] WS closed mid-stream: code=${  ev.code  } reason=${  ev.reason || "no reason"}`);
        try { if (window.__jstSynth && window.__jstSynth.finishStreaming) window.__jstSynth.finishStreaming(null); } catch(e) { console.error("finishStreaming failed:", e); }
        if (typeof showToast === "function" && ev.code !== 1000 && ev.code !== 1001 && ev.code !== 1005) {
          showToast(`${ti("aborted")  } (code ${  ev.code  })`, "error");
        }
      }
      if (window.__jstSetWs) window.__jstSetWs(null); else window.ws = null;
    };
  }

  window.__jstSynth = { drawWaveform: typeof drawWaveform !== "undefined" ? drawWaveform : null };
  if (typeof resetPlayback !== 'undefined') window.__jstSynth.resetPlayback = resetPlayback;
  if (typeof stopPlayback !== 'undefined') window.__jstSynth.stopPlayback = stopPlayback;
  if (typeof finishStreaming !== 'undefined') window.__jstSynth.finishStreaming = finishStreaming;
  if (typeof initSTT !== 'undefined') window.__jstSynth.initSTT = initSTT;
  if (typeof initRecordButton !== 'undefined') window.__jstSynth.initRecordButton = initRecordButton;
  if (typeof handleAudioChunk !== 'undefined') window.__jstSynth.handleAudioChunk = handleAudioChunk;
  if (typeof updateProgress !== 'undefined') window.__jstSynth.updateProgress = updateProgress;
  if (typeof synthesize !== 'undefined') window.__jstSynth.synthesize = synthesize;
  console.log("[JST ui-synth] exports:", Object.keys(window.__jstSynth));
})();
