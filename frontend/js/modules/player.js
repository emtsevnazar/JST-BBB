/* modules/player.js — вынесено из app.js (Phase C5)
   Оригинальный IIFE: app.js строки 393-1359 (1-based).
   Загружается как defer-скрипт после app.js.
*/

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
