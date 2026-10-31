/* ui-synth.js — Phase 6a: drawWaveform (canvas) */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var __jstContrast = (window.__jstHelpers && window.__jstHelpers.__jstContrast) || function () { return false; };
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

  window.__jstSynth = { drawWaveform: typeof drawWaveform !== "undefined" ? drawWaveform : null };
  console.log("[JST ui-synth] exports:", Object.keys(window.__jstSynth));
})();
