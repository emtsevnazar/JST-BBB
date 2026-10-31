/* pwa.js — JST Studio PWA helpers (iOS standalone detection, install button)
   Phase 3a: extracted from app.js. Attaches to window.__jstPwa so that
   the classic <script>app.js</script> can call it during transition.
*/

export function _pwaIsStandalone() {
  if (window.navigator.standalone === true) return true;
  return window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
}

export function _pwaIsIOS() {
  const ua = window.navigator.userAgent || '';
  return /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
}

export function _pwaShowBtn() {
  const btn = document.getElementById('pwa-install-btn');
  if (btn) btn.style.display = '';
}

export function _pwaHideBtn() {
  const btn = document.getElementById('pwa-install-btn');
  if (btn) btn.style.display = 'none';
}

export function _pwaAttach() {
  try {
    if (_pwaIsStandalone()) { _pwaHideBtn(); return; }
    const btn = document.getElementById('pwa-install-btn');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      if (e && e.preventDefault) e.preventDefault();
      if (window.deferredPwaPrompt) {
        window.deferredPwaPrompt.prompt();
        window.deferredPwaPrompt = null;
        _pwaHideBtn();
      } else {
        alert('Установка недоступна. Откройте меню браузера и выберите "Добавить на главный экран".');
      }
    }, false);
    if (_pwaIsIOS()) _pwaShowBtn();
  } catch (e) { /* noop */ }
}

window.__jstPwa = {
  _pwaIsStandalone, _pwaIsIOS, _pwaShowBtn, _pwaHideBtn, _pwaAttach
};
console.log('[JST pwa] module loaded, window.__jstPwa ready');
