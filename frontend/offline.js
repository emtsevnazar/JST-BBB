/**
 * offline.js — DEPRECATED. Заменён серверным /error + /api/error-state.
 * Оставлен как no-op: если старая кэшированная HTML-версия его подгрузит —
 * ничего не произойдёт, редиректа на /offline не будет.
 */
(function(){
  'use strict';
  try { sessionStorage.removeItem('jst_err_guard'); } catch(e) {}
  // No-op. Серверный middleware делает редирект на /error при реальной ошибке.
})();
