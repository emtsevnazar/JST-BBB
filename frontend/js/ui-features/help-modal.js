/* ui-features/help-modal.js — IIFE #5-6 (split из ui-features.js v1.1.31)
   help-shutters (прозрачная модалка + blur), FADE_ZONE карточек у краёв */


/* [5/6] Help-shutters: прозрачная модалка help + blur, без затемнения.
   Skipped в contrast (data-theme="contrast"). */
(function () {
  const STYLE_ID = "help-shutters-style";
  function injectStyle() {
    if (document.documentElement.getAttribute("data-theme") === "contrast") return;
    const old = document.getElementById(STYLE_ID);
    if (old) old.remove();
    const s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent = [
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
      "html body .help-modal.open {",
      "  background: transparent !important;",
      "  backdrop-filter: blur(35px) saturate(1.3) !important;",
      "  -webkit-backdrop-filter: blur(35px) saturate(1.3) !important;",
      "}",
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
    if (document.documentElement.getAttribute("data-theme") === "contrast") return;
    const modal = document.getElementById("help-modal");
    if (!modal || !modal.classList.contains("open")) return;
    injectStyle();
    modal.style.setProperty("background", "transparent", "important");
    modal.style.setProperty("backdrop-filter", "blur(35px) saturate(1.3)", "important");
    modal.style.setProperty("-webkit-backdrop-filter", "blur(35px) saturate(1.3)", "important");
  }
  function init() {
    const modal = document.getElementById("help-modal");
    if (!modal) return;
    apply();
    new MutationObserver((muts) => {
      muts.forEach((m) => {
        if (m.attributeName === "class") {
          setTimeout(apply, 50);
          setTimeout(apply, 200);
        }
      });
    }).observe(modal, { attributes: true, attributeFilter: ["class"] });
    const ht = document.getElementById("help-toggle");
    if (ht) ht.addEventListener("click", () => {
      setTimeout(apply, 80);
      setTimeout(apply, 250);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else setTimeout(init, 80);
})();

/* [6/6] FADE_ZONE: плавное затухание карточек help-sections у краёв viewport. */
(function () {
  const FADE_ZONE = 130, MAX_BLUR = 5, MIN_OP = 0.12;
  function applyEdgeFade() {
    const modal = document.getElementById("help-modal");
    if (!modal || !modal.classList.contains("open")) return;
    const modalRect = modal.getBoundingClientRect();
    const modalTop = modalRect.top, modalH = modalRect.height;
    if (modalH <= 0) return;
    const cards = modal.querySelectorAll(".help-section");
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const r = card.getBoundingClientRect();
      const cy = (r.top + r.bottom) / 2 - modalTop;
      const fTop = Math.min(1, Math.max(0, cy / FADE_ZONE));
      const fBot = Math.min(1, Math.max(0, (modalH - cy) / FADE_ZONE));
      const fade = Math.min(fTop, fBot);
      if (fade < 0.999) {
        const blurPx = (1 - fade) * MAX_BLUR;
        const op = MIN_OP + fade * (1 - MIN_OP);
        card.style.setProperty("opacity", op.toFixed(3), "important");
        card.style.setProperty("filter", `blur(${  blurPx.toFixed(2)  }px)`, "important");
      } else {
        card.style.removeProperty("opacity");
        card.style.removeProperty("filter");
      }
    }
  }
  let rafId = null;
  function onScroll() {
    if (rafId) return;
    rafId = requestAnimationFrame(() => { rafId = null; applyEdgeFade(); });
  }
  function init() {
    const modal = document.getElementById("help-modal");
    if (!modal) return;
    modal.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    new MutationObserver((muts) => {
      muts.forEach((m) => {
        if (m.attributeName === "class") {
          setTimeout(applyEdgeFade, 100);
          setTimeout(applyEdgeFade, 300);
          setTimeout(applyEdgeFade, 600);
        }
      });
    }).observe(modal, { attributes: true, attributeFilter: ["class"] });
    const ht = document.getElementById("help-toggle");
    if (ht) ht.addEventListener("click", () => {
      setTimeout(applyEdgeFade, 150);
      setTimeout(applyEdgeFade, 400);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else setTimeout(init, 80);
})();
