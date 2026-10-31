/* modules/instruction.js — вынесено из app.js (Phase C1)
   Оригинальный IIFE: app.js строки 376-612 (1-based) до выноса.
   Загружается из index.html как defer-скрипт после app.js.
*/

(function() {
  function getOrCreate(id, parent) {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("div");
      el.id = id;
      (parent || document.body).appendChild(el);
    }
    return el;
  }

  function applyStyles() {
    const modal = document.getElementById("help-modal");
    if (!modal || !modal.classList.contains("open")) return;

    const isNight = document.documentElement.getAttribute("data-theme") === "night";
    const lang = (document.documentElement.lang || "ru").toLowerCase();
    const inputBg = isNight ? "rgba(13, 26, 63, 0.55)" : "rgba(255, 255, 255, 0.55)";
    const textColor = __jstContrast() ? "#000" : (isNight ? "#F5B800" : "#1a2a5e");

    // ---- 1. Модалка ----
    const ms = modal.style;
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
    const maskV = "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 60px, rgba(0,0,0,1) 140px, rgba(0,0,0,1) calc(100% - 140px), rgba(0,0,0,0.4) calc(100% - 60px), transparent 100%)";
    ms.setProperty("mask-image", "none", "important");
    ms.setProperty("-webkit-mask-image", "none", "important");

    // ---- 3. Общий blur фона через #help-blur ----
    const blur = getOrCreate("help-blur", modal);
    if (blur.parentElement !== modal) modal.insertBefore(blur, modal.firstChild);
    const bs = blur.style;
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
    ].forEach((el) => {
      if (!el) return;
      const s = el.style;
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

    const doc = document.querySelector(".help-doc");
    if (doc) {
      doc.style.setProperty("padding", "130px 60px 130px", "important");
      doc.style.setProperty("-webkit-mask-image", "none", "important");
      doc.style.setProperty("mask-image", "none", "important");
    }

    // ---- 5. Вынос заголовка и крестика в body (вне маски) ----
    const header = getOrCreate("help-header-fixed", document.body);
    if (header.parentElement !== document.body) document.body.appendChild(header);
    const hs = header.style;
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
    const title = document.querySelector(".help-title");
    if (title && title.parentElement !== header) {
      header.appendChild(title);
    }
    if (title) {
      const ts = title.style;
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
      const ru = title.querySelector(".help-ru");
      const en = title.querySelector(".help-en");
      if (ru) ru.style.setProperty("display", lang.indexOf("ru") === 0 ? "inline" : "none", "important");
      if (en) en.style.setProperty("display", lang.indexOf("en") === 0 ? "inline" : "none", "important");
    }

    // Перенос крестика
    const close = document.getElementById("help-close");
    if (close && close.parentElement !== header) {
      header.appendChild(close);
    }
    if (close) {
      const cs = close.style;
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
    document.querySelectorAll(".help-section").forEach((sec) => {
      const sc = sec.style;
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
      sec.querySelectorAll(".help-content, .help-header").forEach((child) => {
        child.style.setProperty("background", "transparent", "important");
      });
    });
  }

  function hideAll() {
    const modal = document.getElementById("help-modal");
    if (modal) modal.style.setProperty("display", "none", "important");
    const header = document.getElementById("help-header-fixed");
    if (header) header.style.setProperty("display", "none", "important");
  }

  function showHeader() {
    const header = document.getElementById("help-header-fixed");
    if (header) header.style.setProperty("display", "inline-flex", "important");
  }

  function init() {
    const modal = document.getElementById("help-modal");
    if (!modal) return;

    if (!modal.classList.contains("open")) hideAll();

    const obs = new MutationObserver((muts) => {
      muts.forEach((m) => {
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

    const ht = document.getElementById("help-toggle");
    if (ht) {
      ht.addEventListener("click", () => {
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
