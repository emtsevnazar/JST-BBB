/* pwa.js — JST Studio PWA (Phase 3b: семантика синхронизирована с app.js)
   Использует #pwa-install (как app.js), _deferred через beforeinstallprompt.
   window.__jstPwa — точка входа для будущей замены кода в app.js (Phase 3c).
   ⚠ Пока НЕ активирует DOMContentLoaded-обработчик — app.js делает это сам.
*/

let _deferred = null;
let _btn = null;

export function _pwaIsStandalone() {
  return (
    (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
    window.navigator.standalone === true
  );
}

export function _pwaIsIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

export function _pwaShowBtn() {
  if (_btn) _btn.style.display = "inline-flex";
}

export function _pwaHideBtn() {
  if (_btn) _btn.style.display = "none";
}

export function _pwaAttach() {
  _btn = document.getElementById("pwa-install");
  if (!_btn) return;

  if (localStorage.getItem("jst-pwa-dismissed") === "1") return;
  if (_pwaIsStandalone()) return;

  _btn.addEventListener("click", async () => {
    if (_deferred) {
      _deferred.prompt();
      try {
        const choice = await _deferred.userChoice;
        if (choice && choice.outcome === "accepted") {
          _pwaHideBtn();
        }
      } catch (e) {}
      _deferred = null;
      window.__jstPwaDeferred = null;
    } else if (_pwaIsIOS()) {
      const isEn = (typeof window.LANG !== "undefined" && window.LANG === "en");
      const msg = isEn
        ? "iOS: Share → Add to Home Screen"
        : "iOS: Поделиться → На экран «Домой»";
      try { alert(msg); } catch (e) {}
    } else {
      _pwaHideBtn();
    }
  });

  if (_pwaIsIOS() && !_pwaIsStandalone()) _pwaShowBtn();
}

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  _deferred = e;
  window.__jstPwaDeferred = e;
  _pwaShowBtn();
});

window.addEventListener("appinstalled", () => {
  _deferred = null;
  window.__jstPwaDeferred = null;
  _pwaHideBtn();
  try { localStorage.setItem("jst-pwa-dismissed", "1"); } catch (e) {}
});

window.__jstPwa = {
  _pwaIsStandalone,
  _pwaIsIOS,
  _pwaShowBtn,
  _pwaHideBtn,
  _pwaAttach,
  isAttached: () => _btn !== null,
  getDeferred: () => _deferred,
};

console.log("[JST pwa.js] module loaded, window.__jstPwa ready (not auto-attached)");

// Phase 3c: app.js no longer calls _pwaAttach — pwa.js self-activates
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", _pwaAttach);
} else {
  _pwaAttach();
}
