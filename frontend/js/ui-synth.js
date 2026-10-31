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

  window.__jstSynth = { drawWaveform: typeof drawWaveform !== "undefined" ? drawWaveform : null };
  if (typeof resetPlayback !== 'undefined') window.__jstSynth.resetPlayback = resetPlayback;
  if (typeof stopPlayback !== 'undefined') window.__jstSynth.stopPlayback = stopPlayback;
  if (typeof finishStreaming !== 'undefined') window.__jstSynth.finishStreaming = finishStreaming;
  console.log("[JST ui-synth] exports:", Object.keys(window.__jstSynth));
})();
