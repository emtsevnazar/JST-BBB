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


/* JST_ALL_ERRORS_REDIRECT (Phase 4f)
   Redirect to /error on ANY error: fetch !ok (4xx/5xx except listed),
   uncaught exception, unhandled rejection. Photo is shown by error.html.
*/
(function () {
  if (location.pathname === '/error' || location.pathname.indexOf('/error') === 0) return;
  if (location.pathname === '/offline' || location.pathname === '/offline/') return;

  var IGNORE = [
    '/api/error-state', '/error', '/offline', '/healthz', '/readyz',
    '/api/security/', '/static/', '/favicon', '/manifest.json', '/sw.js'
  ];
  var redirected = false;

  function shouldIgnore(url) {
    try {
      var path = (url.indexOf('://') >= 0 ? new URL(url).pathname : url) || '';
      for (var i = 0; i < IGNORE.length; i++) {
        if (path.indexOf(IGNORE[i]) === 0) return true;
      }
      return false;
    } catch (e) { return false; }
  }

  function go(code, msg) {
    if (redirected) return;
    redirected = true;
    try {
      sessionStorage.setItem('jst_err_guard', '1');
      sessionStorage.setItem('jst_error_state', JSON.stringify({ code: code, msg: msg }));
    } catch (e) {}
    var qs = '?reason=' + encodeURIComponent(String(code || 'error'));
    if (msg) qs += '&msg=' + encodeURIComponent(String(msg).slice(0, 120));
    setTimeout(function () { location.replace('/error' + qs); }, 200);
  }

  // 1. fetch hook — any non-2xx/3xx except ignored
  if (!window.__jstFetchHooked) {
    var _fetch = window.fetch;
    window.fetch = function () {
      var args = arguments;
      var url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url) || '';
      return _fetch.apply(this, args).then(function (resp) {
        if (!resp.ok && !shouldIgnore(url)) {
          if (resp.status >= 400) go('http_' + resp.status, resp.statusText || '');
        }
        return resp;
      }).catch(function (err) {
        if (!shouldIgnore(url)) go('network', err && err.message ? err.message : 'fetch failed');
        throw err;
      });
    };
    window.__jstFetchHooked = true;
  }

  // 2. window.onerror — uncaught exceptions
  window.addEventListener('error', function (e) {
    if (e && e.message) go('uncaught', e.message.slice(0, 120));
  }, true);

  // 3. window.onunhandledrejection
  window.addEventListener('unhandledrejection', function (e) {
    var m = e && e.reason ? String(e.reason).slice(0, 120) : 'unhandled rejection';
    go('promise', m);
  });

  console.log('[JST error-guard] Phase 4f: ALL_ERRORS_REDIRECT active');
})();
