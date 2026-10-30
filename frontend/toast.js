/* toast.js v57 — универсальные уведомления (красный bg / жёлтый текст для ошибок) */
(function () {
  'use strict';
  if (window.__jstToastV57) return;
  window.__jstToastV57 = true;

  function ensureEl() {
    var el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.className = 'toast';
      document.body.appendChild(el);
    }
    return el;
  }

  function toast(msg, type) {
    var el = ensureEl();
    var isError = (type === 'error' || type === 'warn');
    var prefix = isError ? '⚠ ' : '';
    el.textContent = prefix + msg;
    el.className = 'toast' + (isError ? ' toast-error' : '') + ' show';
    clearTimeout(window._toastT57);
    window._toastT57 = setTimeout(function () {
      el.classList.remove('show');
    }, isError ? 8000 : 3500);
  }

  /* Перекрываем существующий showToast если он есть — иначе создаём */
  window.__jstToast = toast;
  if (typeof window.showToast !== 'function') {
    window.showToast = toast;
  }
})();
