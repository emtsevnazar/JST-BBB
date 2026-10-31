/* modules/btn-hover.js — вынесено из app.js (Phase C3)
   Оригинальный IIFE: app.js строки 383-537 (1-based).
*/

(function() {
    const TARGET_WORDS    = ["случайный", "очистить", "скачать", "история", "историю", "истории"];
    const YELLOW          = __jstContrast() ? "#000" : "#F5B800";
    const GLOW            = __jstContrast() ? "none" : "0 0 14px rgba(245, 184, 0, 0.45)";
    const BASE_BORDER     = "var(--panel-border, rgba(26, 42, 94, 0.12))";
    const BORDER_WIDTH    = "1.5px";
    const BORDER_STYLE    = "solid";

    function norm(s) { return (s || "").replace(/\s+/g, " ").trim().toLowerCase(); }

    function matches(text) {
        text = norm(text);
        if (!text) return false;
        for (let i = 0; i < TARGET_WORDS.length; i++) {
            if (text.indexOf(TARGET_WORDS[i]) !== -1) return true;
        }
        return false;
    }

    function isRealButton(el) {
        if (!el) return false;
        const tag = el.tagName;
        if (tag === "BUTTON" || tag === "A") return true;
        const role = el.getAttribute && el.getAttribute("role");
        return role === "button";
    }

    function isInsideDropdownMenu(el) {
        let p = el;
        while (p && p !== document.body) {
            if (p.classList && p.classList.contains("dropdown-menu")) return true;
            p = p.parentElement;
        }
        return false;
    }

    function findButtons() {
        const found = new Set();
        document.querySelectorAll("button, a, [role='button']").forEach((el) => {
            if (!isRealButton(el)) return;
            if (isInsideDropdownMenu(el)) return; // <- пункты меню обрабатываем отдельно
            const txt = el.textContent || el.value || "";
            const aria = el.getAttribute && (el.getAttribute("aria-label") || el.getAttribute("title") || "");
            if (matches(txt) || matches(aria)) found.add(el);
        });
        return Array.from(found);
    }

    function cleanup() {
        document.querySelectorAll(".btn-yellow-hover, .btn-yellow-hover-parent").forEach((el) => {
            if (!isRealButton(el)) {
                el.classList.remove("btn-yellow-hover");
                el.classList.remove("btn-yellow-hover-parent");
            }
        });
    }

    function setBase(el) {
        el.style.setProperty("border-width", BORDER_WIDTH, "important");
        el.style.setProperty("border-style", BORDER_STYLE, "important");
        el.style.setProperty("border-color", BASE_BORDER, "important");
        el.style.setProperty("border-top-color", BASE_BORDER, "important");
        el.style.setProperty("border-right-color", BASE_BORDER, "important");
        el.style.setProperty("border-bottom-color", BASE_BORDER, "important");
        el.style.setProperty("border-left-color", BASE_BORDER, "important");
        el.style.setProperty("box-shadow", "none", "important");
        el.style.setProperty("transition", "border-color 0.15s ease, box-shadow 0.15s ease", "important");
    }

    function setHover(el) {
        el.style.setProperty("border-color", YELLOW, "important");
        el.style.setProperty("border-top-color", YELLOW, "important");
        el.style.setProperty("border-right-color", YELLOW, "important");
        el.style.setProperty("border-bottom-color", YELLOW, "important");
        el.style.setProperty("border-left-color", YELLOW, "important");
        el.style.setProperty("box-shadow", GLOW, "important");
    }

    function paint(el) {
        setBase(el);
        if (el.__yh === true) return;
        el.__yh = true;
        el.addEventListener("mouseenter", () => { setHover(el); });
        el.addEventListener("mouseleave", () => { setBase(el); });
        el.addEventListener("focus",      () => { setHover(el); });
        el.addEventListener("blur",       () => { setBase(el); });
    }

    // ------------------------------------------------------------
    // Пункты выпадающего меню «Скачать ...» — БЕЗ рамки вообще
    // ------------------------------------------------------------
    function stripDropdownBorders() {
        let removed = 0;
        document.querySelectorAll(".dropdown-menu a, .dropdown-menu button, .dropdown-menu > *").forEach((el) => {
            const txt = norm(el.textContent || "");
            if (txt.indexOf("скачать") === -1) return;
            // Убираем классы hover, если они случайно попали
            el.classList.remove("btn-yellow-hover");
            el.classList.remove("btn-yellow-hover-parent");
            // Снимаем рамку inline !important — это перебьёт любой CSS
            el.style.setProperty("border", "none", "important");
            el.style.setProperty("border-width", "0", "important");
            el.style.setProperty("border-top-width", "0", "important");
            el.style.setProperty("border-right-width", "0", "important");
            el.style.setProperty("border-bottom-width", "0", "important");
            el.style.setProperty("border-left-width", "0", "important");
            el.style.setProperty("border-style", "none", "important");
            el.style.setProperty("border-color", "transparent", "important");
            el.style.setProperty("box-shadow", "none", "important");
            el.style.setProperty("outline", "none", "important");
            // Снимаем возможные обработчики через флаг (не отвязываем — просто не даём hover-стилям включиться)
            el.__yh = true; // помечаем, чтобы paint() больше не вешал обработчики
            removed++;
        });
        return removed;
    }

    function apply() {
        cleanup();
        const btns = findButtons();
        btns.forEach(paint);
        const stripped = stripDropdownBorders();

        if (btns.length === 0) {
            console.warn("[btn-yellow-hover-v6] кнопки не найдены");
        } else {
            console.log(`[btn-yellow-hover-v6] найдено кнопок: ${  btns.length}`);
            btns.forEach((el, i) => {
                console.log(`  #${  i + 1 
                    } <${  el.tagName.toLowerCase()  }>` +
                    ` id=${  el.id || "-" 
                    } text=${  JSON.stringify((el.textContent || "").trim().slice(0, 30))}`);
            });
        }
        console.log(`[btn-yellow-hover-v6] очищено пунктов меню от рамки: ${  stripped}`);
    }

    function init() {
        apply();
        setTimeout(apply, 300);
        setTimeout(apply, 1000);
        setTimeout(apply, 2500);
        let t = null;
        new MutationObserver(() => {
            if (t) return;
            t = setTimeout(() => { t = null; apply(); }, 200);
        }).observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        setTimeout(init, 80);
    }
})();
