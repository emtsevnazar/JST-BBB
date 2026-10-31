/* toast.js v57 — универсальные уведомления (красный bg / жёлтый текст для ошибок) */
(function () {
  'use strict';
  if (window.__jstToastV57) return;
  window.__jstToastV57 = true;

  function ensureEl() {
    let el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.className = 'toast';
      document.body.appendChild(el);
    }
    return el;
  }

  function toast(msg, type) {
    const el = ensureEl();
    const isError = (type === 'error' || type === 'warn');
    const prefix = isError ? '⚠ ' : '';
    el.textContent = prefix + msg;
    el.className = `toast${  isError ? ' toast-error' : ''  } show`;
    clearTimeout(window._toastT57);
    window._toastT57 = setTimeout(() => {
      el.classList.remove('show');
    }, isError ? 8000 : 3500);
  }

  /* Перекрываем существующий showToast если он есть — иначе создаём */
  window.__jstToast = toast;
  if (typeof window.showToast !== 'function') {
    window.showToast = toast;
  }
})();
