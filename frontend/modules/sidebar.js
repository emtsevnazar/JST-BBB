/* modules/sidebar.js — вынесено из app.js (Phase C2)
   Оригинальный IIFE: app.js строки 540-721 (1-based) до выноса.
   Загружается из index.html как defer-скрипт после app.js.
*/

(function() {
    const TOP_H    = 130;
    const BOT_H    = 65;
    const BLUR_PX  = 10;
    const STYLE_ID = "sidebar-shutters-style";

    function injectStyle() {
        if (document.getElementById(STYLE_ID)) return;
        const s = document.createElement("style");
        s.id = STYLE_ID;
        // 7 точек, ease-out — плавное затухание
        const stops = [
            "rgba(0,0,0,1) 0%",
            "rgba(0,0,0,0.92) 15%",
            "rgba(0,0,0,0.75) 32%",
            "rgba(0,0,0,0.55) 50%",
            "rgba(0,0,0,0.32) 68%",
            "rgba(0,0,0,0.14) 85%",
            "rgba(0,0,0,0) 100%"
        ].join(",");
        s.textContent = [
            ".sidebar-shutter{",
            "  position:fixed;",
            "  pointer-events:none;",
            "  z-index:900;",
            "  display:none;",
            `  backdrop-filter:blur(${  BLUR_PX  }px) saturate(1.15);`,
            `  -webkit-backdrop-filter:blur(${  BLUR_PX  }px) saturate(1.15);`,
            "  will-change:backdrop-filter;",
            "}",
            ".sidebar-shutter-top{",
            `  -webkit-mask-image:linear-gradient(to bottom,${  stops  });`,
            `  mask-image:linear-gradient(to bottom,${  stops  });`,
            "}",
            ".sidebar-shutter-bottom{",
            `  -webkit-mask-image:linear-gradient(to top,${  stops  });`,
            `  mask-image:linear-gradient(to top,${  stops  });`,
            "}"
        ].join("");
        document.head.appendChild(s);
    }

    function makeShutters() {
        let top = document.getElementById("sidebar-shutter-top");
        if (!top) {
            top = document.createElement("div");
            top.id = "sidebar-shutter-top";
            top.className = "sidebar-shutter sidebar-shutter-top";
            document.body.appendChild(top);
        }
        let bot = document.getElementById("sidebar-shutter-bottom");
        if (!bot) {
            bot = document.createElement("div");
            bot.id = "sidebar-shutter-bottom";
            bot.className = "sidebar-shutter sidebar-shutter-bottom";
            document.body.appendChild(bot);
        }
        return { top: top, bot: bot };
    }

    // Границы контента sidebar (объединение bbox всех видимых детей)
    function getContentBox(sidebar, sRect) {
        let minX = Infinity, maxX = -Infinity;
        const n = sidebar.children.length;
        for (let i = 0; i < n; i++) {
            const c = sidebar.children[i];
            // пропускаем наши шторки, если они вдруг внутри
            if (c.id && c.id.indexOf("sidebar-shutter") === 0) continue;
            const cs = getComputedStyle(c);
            if (cs.display === "none" || cs.visibility === "hidden") continue;
            if (c.offsetWidth === 0 && c.offsetHeight === 0) continue;
            const cr = c.getBoundingClientRect();
            if (cr.bottom < sRect.top || cr.top > sRect.bottom) continue;
            if (cr.left < minX) minX = cr.left;
            if (cr.right > maxX) maxX = cr.right;
        }
        if (minX === Infinity || maxX === -Infinity) {
            return { left: sRect.left, right: sRect.right };
        }
        return { left: minX, right: maxX };
    }

    function positionShutters(sidebar, shutters) {
        if (!sidebar) return;
        const r = sidebar.getBoundingClientRect();

        if (r.bottom < 0 || r.top > window.innerHeight || r.height <= 0 || r.width <= 0) {
            shutters.top.style.display = "none";
            shutters.bot.style.display = "none";
            return;
        }

        const box = getContentBox(sidebar, r);
        const left  = Math.max(0, box.left);
        const right = Math.min(window.innerWidth, box.right);
        const width = Math.max(0, right - left);
        if (width <= 0) {
            shutters.top.style.display = "none";
            shutters.bot.style.display = "none";
            return;
        }

        // Верхняя
        const topTop = Math.max(0, r.top);
        const topBottom = Math.min(window.innerHeight, r.top + TOP_H);
        const topH = topBottom - topTop;
        if (topH > 0) {
            shutters.top.style.display = "block";
            shutters.top.style.top = `${topTop  }px`;
            shutters.top.style.left = `${left  }px`;
            shutters.top.style.width = `${width  }px`;
            shutters.top.style.height = `${topH  }px`;
        } else {
            shutters.top.style.display = "none";
        }

        // Нижняя
        const botBottom = Math.min(window.innerHeight, r.bottom);
        const botTop = Math.max(0, r.bottom - BOT_H);
        const botH = botBottom - botTop;
        if (botH > 0) {
            shutters.bot.style.display = "block";
            shutters.bot.style.top = `${botTop  }px`;
            shutters.bot.style.left = `${left  }px`;
            shutters.bot.style.width = `${width  }px`;
            shutters.bot.style.height = `${botH  }px`;
        } else {
            shutters.bot.style.display = "none";
        }
    }

    function init() {
        let sidebar = document.querySelector(".sidebar");
        if (!sidebar) {
            console.warn("[sidebar-shutters] .sidebar не найден");
            return;
        }
        console.log("[sidebar-shutters] .sidebar найден");
        injectStyle();
        const shutters = makeShutters();

        let rafId = null;
        function update() {
            if (rafId) return;
            rafId = requestAnimationFrame(() => {
                rafId = null;
                positionShutters(sidebar, shutters);
            });
        }

        window.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update, { passive: true });
        sidebar.addEventListener("scroll", update, { passive: true });

        if (window.ResizeObserver) {
            new ResizeObserver(update).observe(sidebar);
        }
        let t = null;
        new MutationObserver(() => {
            if (t) return;
            t = setTimeout(() => { t = null; update(); }, 150);
        }).observe(sidebar, { childList: true, subtree: false });

        setTimeout(update, 100);
        setTimeout(update, 500);
        setTimeout(update, 1500);

        setInterval(() => {
            const s = document.querySelector(".sidebar");
            if (s && s !== sidebar) {
                sidebar = s;
                update();
            }
        }, 2500);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        setTimeout(init, 120);
    }
})();
