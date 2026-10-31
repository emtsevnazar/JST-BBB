/* ui-synth.js — Phase 6a: drawWaveform (canvas) */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var __jstContrast = (window.__jstHelpers && window.__jstHelpers.__jstContrast) || function () { return false; };
  var t = (window.__jstHelpers && window.__jstHelpers.t) || function (k) { return k; };
  var setStatus = (window.__jstHelpers && window.__jstHelpers.setStatus) || function () {};
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
    try {
      const ta = document.getElementById("text");
      window.dispatchEvent(new CustomEvent("jst:load-audio", {
        detail: { url: "/output/" + file, text: ta ? ta.value : "" }
      }));
    } catch (e) { console.warn("jst:load-audio dispatch failed", e); }
    if (window.__jstRefreshHistory) window.__jstRefreshHistory();
  }
  if ((window.activeSources || []).length === 0) { const b = $("btn-stop"); if (b) b.disabled = true; }
}

function initSTT() {
  var btn = $("btn-stt"); if (!btn) return;
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { btn.title = t("stt_not_supported"); btn.disabled = true; btn.style.opacity = "0.3"; return; }
  btn.addEventListener("click", function () {
    if (window.sttActive) return;
    var recognition = new SR();
    recognition.lang = (window.currentLang === "ru") ? "ru-RU" : "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;
    var textEl = $("text");
    var base = textEl ? textEl.value : "";
    recognition.onstart = function () {
      if (window.__jstSetSttActive) window.__jstSetSttActive(true); else window.sttActive = true;
      btn.style.background = "var(--red)";
      setStatus(t("status_listening"), "busy");
    };
    recognition.onresult = function (ev) {
      var interim = "", final = "";
      for (var i = ev.resultIndex; i < ev.results.length; i++) {
        var tx = ev.results[i][0].transcript;
        if (ev.results[i].isFinal) final += tx; else interim += tx;
      }
      if (textEl) {
        if (final) { base = (base ? base + " " : "") + final; textEl.value = base; }
        else if (interim) textEl.value = base + (base ? " " : "") + interim;
      }
    };
    recognition.onerror = function (ev) { setStatus(t("status_err") + ": " + ev.error, "error"); };
    recognition.onend = function () {
      if (window.__jstSetSttActive) window.__jstSetSttActive(false); else window.sttActive = false;
      btn.style.background = "";
      setStatus(t("status_ready"), "");
    };
    try { recognition.start(); } catch(e) { setStatus(t("status_stt_fail") + ": " + e.message, "error"); }
  });
}

function initRecordButton() {
  var btn = $("btn-record"); if (!btn) return;
  btn.addEventListener("click", async function () {
    if (window.mediaRecorder && window.mediaRecorder.state === "recording") { window.mediaRecorder.stop(); return; }
    try {
      var stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      var mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      if (window.__jstSetMediaRecorder) window.__jstSetMediaRecorder(mr); else window.mediaRecorder = mr;
      var chunks = [];
      if (window.__jstSetRecordedChunks) window.__jstSetRecordedChunks(chunks); else window.recordedChunks = chunks;
      mr.ondataavailable = function (e) { if (e.data.size > 0) chunks.push(e.data); };
      mr.onstop = async function () {
        stream.getTracks().forEach(function (tr) { tr.stop(); });
        clearInterval(window.recordTimer);
        btn.style.background = ""; btn.style.color = "";
        var blob = new Blob(window.recordedChunks || chunks, { type: "audio/webm" });
        var dur = ((Date.now() - window.recordStartTime) / 1000).toFixed(1);
        setStatus(t("status_rec_loading") + " (" + dur + "s)...", "busy");
        var nv = $("new-voice");
        var name = nv ? nv.value.trim() : "";
        if (!name) { name = "recorded_" + Date.now(); if (nv) nv.value = name; }
        try {
          var fd = new FormData(); fd.append("name", name);
          await fetch("/api/voices/create", { method: "POST", body: fd });
          var ffd = new FormData(); ffd.append("file", blob, "recording.webm");
          var r = await fetch("/api/voices/" + encodeURIComponent(name) + "/upload-blob", { method: "POST", body: ffd });
          if (!r.ok) throw new Error(await r.text());
          var fd2 = new FormData(); fd2.append("ref_length", ($("ref_length") || {}).value || "15");
          await fetch("/api/voices/" + encodeURIComponent(name) + "/rebuild-reference", { method: "POST", body: fd2 });
          if (window.__jstLoadVoices) await window.__jstLoadVoices();
          var v = $("voice"); if (v) v.value = name;
          setStatus(t("status_rec_saved") + ": " + name, "");
        } catch(e) { setStatus(t("status_err") + ": " + e.message, "error"); }
      };
      mr.start();
      if (window.__jstSetRecordStartTime) window.__jstSetRecordStartTime(Date.now()); else window.recordStartTime = Date.now();
      btn.style.background = "var(--red)"; btn.style.color = "#fff";
      var sec = 0;
      var timer = setInterval(function () { sec++; setStatus(t("status_rec_timer") + ": " + sec + "s. " + t("status_rec_timer_hint"), "busy"); }, 1000);
      if (window.__jstSetRecordTimer) window.__jstSetRecordTimer(timer); else window.recordTimer = timer;
    } catch(e) { setStatus(t("status_mic_error") + ": " + e.message, "error"); }
  });
}

  window.__jstSynth = { drawWaveform: typeof drawWaveform !== "undefined" ? drawWaveform : null };
  if (typeof resetPlayback !== 'undefined') window.__jstSynth.resetPlayback = resetPlayback;
  if (typeof stopPlayback !== 'undefined') window.__jstSynth.stopPlayback = stopPlayback;
  if (typeof finishStreaming !== 'undefined') window.__jstSynth.finishStreaming = finishStreaming;
  if (typeof initSTT !== 'undefined') window.__jstSynth.initSTT = initSTT;
  if (typeof initRecordButton !== 'undefined') window.__jstSynth.initRecordButton = initRecordButton;
  console.log("[JST ui-synth] exports:", Object.keys(window.__jstSynth));
})();
