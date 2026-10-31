/* modules/web-audio-chain.js — вынесено из app.js
   Оригинальный IIFE: app.js строки 401-576.
   Shared Web Audio chain: EQ + Width + Mono + Limiter + Fade.
   ВАЖНО: должен загружаться ДО modules/player.js.
*/

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
