/* modules/error-toasts.js — вынесено из app.js
   Оригинальный IIFE: app.js строки 579-642.
   Обёртка fetch/JS/WS/heartbeat — активна сразу, зависимостей от других модулей нет.
*/

(function () {
  "use strict";
  if (window.__jstErrorToasts) return;
  window.__jstErrorToasts = true;

  // 3a. Fetch wrapper — ловит HTTP 4xx/5xx и сетевые ошибки
  const _origFetch = window.fetch.bind(window);
  window.fetch = async function (...args) {
    const url = typeof args[0] === "string" ? args[0] : (args[0] && args[0].url) || "";
    const silent = url.includes("/healthz");   // heartbeat сам покажет
    try {
      const resp = await _origFetch.apply(this, args);
      if (resp.status >= 400 && resp.status !== 401 && resp.status !== 403 && !silent) {
        if (typeof showToast === "function") {
          showToast(`HTTP ${  resp.status  } ${  resp.statusText || ""  } — ${  url.replace(/^https?:\/\/[^/]+/, "")}`, "error");
        }
      }
      return resp;
    } catch (err) {
      if (typeof showToast === "function") {
        showToast(`${ti("network")  }: ${  err.message || ti("no_conn")  } — ${  url.replace(/^https?:\/\/[^/]+/, "")}`, "error");
      }
      throw err;
    }
  };

  // 3b. Global JS errors
  window.addEventListener("error", (e) => {
    if (typeof showToast !== "function") return;
    const msg = e.message || (e.error && e.error.message) || "JS error";
    showToast(`JS: ${  msg}`, "error");
  });

  // 3c. Unhandled promise rejections
  window.addEventListener("unhandledrejection", (e) => {
    if (typeof showToast !== "function") return;
    const r = e.reason;
    const msg = (r && r.message) ? r.message : String(r || "unknown");
    showToast(`Promise: ${  msg}`, "error");
  });

  // 3d. Heartbeat — раз в 60 сек проверяет /healthz, не чаще 1 toast/мин
  let _lastHealthToast = 0;
  setInterval(async () => {
    try {
      const r = await _origFetch("/healthz", { cache: "no-store" });
      if (!r.ok) {
        const now = Date.now();
        if (now - _lastHealthToast > 60000 && typeof showToast === "function") {
          showToast(`${ti("server_down")  } (healthz ${  r.status  })`, "error");
          _lastHealthToast = now;
        }
      }
    } catch (e) {
      const now = Date.now();
      if (now - _lastHealthToast > 60000 && typeof showToast === "function") {
        showToast(`${ti("server_crashed")  }: ${  e.message || "offline"}`, "error");
        _lastHealthToast = now;
      }
    }
  }, 60000);

  console.log("[JST] v1.6.1: error toasts active (fetch, JS, WS, heartbeat)");
})();
