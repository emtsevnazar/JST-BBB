/**
 * error-guard.js — клиентский сторож. Работает даже если SW кэширует HTML.
 * На главной: проверяет /api/error-state раз в 2s; если !healthy → /error.
 * На /error и /offline — ничего не делает (там свой polling).
 */
(function() {
  'use strict';
  var PATH = location.pathname;
  if (PATH === '/error' || PATH.indexOf('/error') === 0) return;
  if (PATH === '/offline' || PATH === '/offline.html') return;

  var redirecting = false;
  function check() {
    if (redirecting) return;
    fetch('/api/error-state?_t=' + Date.now(), {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
    })
    .then(function(r) { return r.ok ? r.json() : null; })
    .then(function(d) {
      if (d && d.healthy === false && !redirecting) {
        redirecting = true;
        location.replace('/error?_t=' + Date.now());
      }
    })
    .catch(function() { /* сеть — не редиректим */ });
  }
  // Первая проверка — через 1.5s после load (не мешаем рендеру)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(check, 1500);
      setInterval(check, 2000);
    });
  } else {
    setTimeout(check, 1500);
    setInterval(check, 2000);
  }
  // Проверка при возврате на вкладку
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible' && !redirecting) check();
  });
})();
