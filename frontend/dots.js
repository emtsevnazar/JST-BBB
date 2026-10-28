(function(){
  'use strict';
  if (window.__jstDotsV8) return;
  window.__jstDotsV8 = true;

  function addDots() {
    ['#btn-download-toggle', '#history-dropdown > .btn', '#dl-dropdown > .btn'].forEach(function(sel){
      try {
        document.querySelectorAll(sel).forEach(function(btn){
          if (btn.querySelector('.jst-dot')) return;
          btn.classList.add('jst-btn-with-dot');
          var d = document.createElement('span');
          d.className = 'jst-dot';
          d.setAttribute('aria-hidden', 'true');
          btn.appendChild(d);
        });
      } catch(e){}
    });
  }
  addDots();
  if (document.body) new MutationObserver(addDots).observe(document.body, {childList: true, subtree: true});
  window.addEventListener('load', addDots);

  var ERRORS = {
    offline: { t: "No Connection", m: "Wi-Fi or mobile data is disabled. Reconnecting automatically." },
    no_internet: { t: "No Internet", m: "Your device is not connected to the internet." },
    weak_internet: { t: "Weak Connection", m: "Internet is slow or unstable. Retrying..." },
    dns_error: { t: "DNS Error", m: "Cannot resolve server address. Check your network." },
    ssl_error: { t: "Security Error", m: "SSL certificate problem. Try a different network." },
    vpn_unstable: { t: "Unstable VPN", m: "VPN connection is unstable. Try disabling it." },
    service_error: { t: "Service Error", m: "A required service is temporarily unavailable." },
    server_error: { t: "Server Error", m: "The server returned an error. Retrying..." },
    bad_gateway: { t: "Bad Gateway", m: "Gateway error. Server is not responding properly." },
    overload: { t: "Server Overloaded", m: "Too many requests. Please wait a moment." },
    rate_limited: { t: "Too Many Requests", m: "Slow down. Try again in a minute." },
    auth_failed: { t: "Authentication Failed", m: "Your API key is missing or invalid." },
    database_error: { t: "Database Error", m: "Cannot access data. Try again later." },
    clear_cache: { t: "Clear Cache Required", m: "Please clear your browser cache and reload." },
    maintenance: { t: "Under Maintenance", m: "Service is under maintenance. We will be back soon." },
    not_found: { t: "Page Not Found", m: "The requested page does not exist. Error 404." },
    timeout: { t: "Request Timeout", m: "The server took too long to respond." },
    unknown: { t: "Something Went Wrong", m: "An unexpected error occurred. Please try again." },
  };
  function classifyFetchError(err) {
    if (!navigator.onLine) return 'offline';
    var m = String((err && err.message) || err || '').toLowerCase();
    var n = String((err && err.name) || '').toLowerCase();
    if (n === 'aborterror' || m.indexOf('timeout') !== -1 || m.indexOf('timed out') !== -1) return 'timeout';
    if (m.indexOf('dns') !== -1 || m.indexOf('getaddrinfo') !== -1) return 'dns_error';
    if (m.indexOf('ssl') !== -1 || m.indexOf('certificate') !== -1 || m.indexOf('tls') !== -1) return 'ssl_error';
    if (n === 'typeerror') return 'no_internet';
    return 'unknown';
  }
  function classifyStatus(s) {
    if (s === 401 || s === 403) return 'auth_failed';
    if (s === 404) return 'not_found';
    if (s === 429) return 'rate_limited';
    if (s === 500) return 'server_error';
    if (s === 502) return 'bad_gateway';
    if (s === 503) return 'overload';
    if (s === 504) return 'timeout';
    if (s >= 500) return 'server_error';
    return 'unknown';
  }
  function getMsg(code) {
    if (!code) return ERRORS.unknown;
    var k = String(code).toLowerCase().replace(/[^a-z0-9_]/g, '_');
    if (ERRORS[k]) return ERRORS[k];
    if (k.indexOf('offline') !== -1 || k.indexOf('connect') !== -1) return ERRORS.offline;
    if (k.indexOf('internet') !== -1) return ERRORS.no_internet;
    if (k.indexOf('weak') !== -1 || k.indexOf('slow') !== -1) return ERRORS.weak_internet;
    if (k.indexOf('dns') !== -1) return ERRORS.dns_error;
    if (k.indexOf('ssl') !== -1 || k.indexOf('cert') !== -1) return ERRORS.ssl_error;
    if (k.indexOf('vpn') !== -1) return ERRORS.vpn_unstable;
    if (k.indexOf('cache') !== -1) return ERRORS.clear_cache;
    if (k.indexOf('maint') !== -1) return ERRORS.maintenance;
    if (k.indexOf('404') !== -1 || k.indexOf('not_found') !== -1) return ERRORS.not_found;
    if (k.indexOf('timeout') !== -1) return ERRORS.timeout;
    if (k.indexOf('rate') !== -1) return ERRORS.rate_limited;
    if (k.indexOf('auth') !== -1) return ERRORS.auth_failed;
    if (k.indexOf('gateway') !== -1) return ERRORS.bad_gateway;
    if (k.indexOf('overload') !== -1) return ERRORS.overload;
    if (k.indexOf('db') !== -1) return ERRORS.database_error;
    if (k.indexOf('service') !== -1) return ERRORS.service_error;
    if (k.indexOf('server') !== -1) return ERRORS.server_error;
    return ERRORS.unknown;
  }

  var overlay = null, fails = 0;

  function show(title, msg){
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'jst-err-overlay';
      overlay.innerHTML = '<div class="jst-err-toast">' +
        '<div class="jst-err-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>' +
        '<div class="jst-err-body"><div class="jst-err-title"></div><div class="jst-err-msg"></div></div>' +
        '<button class="jst-err-btn" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg></button>' +
        '</div>';
      document.body.appendChild(overlay);
      overlay.querySelector('.jst-err-btn').addEventListener('click', function(){ fails=0; check(); });
    }
    var t = overlay.querySelector('.jst-err-title');
    var m = overlay.querySelector('.jst-err-msg');
    if (t) t.textContent = title;
    if (m) m.textContent = msg;
  }

  function hide(){ if (overlay) { overlay.remove(); overlay = null; } }
  function showCode(code){ var e = getMsg(code); show(e.t, e.m); }

  function check(){
    if (!navigator.onLine) { showCode('offline'); return; }
    var ctl = null, toId = null;
    if (window.AbortController) { ctl = new AbortController(); toId = setTimeout(function(){ try{ ctl.abort(); }catch(e){} }, 10000); }
    var o = {cache: 'no-store'};
    if (ctl) o.signal = ctl.signal;
    fetch('/api/error-state?_t=' + Date.now(), o)
      .then(function(r){
        if (toId) clearTimeout(toId);
        if (!r.ok) { showCode(classifyStatus(r.status)); return null; }
        return r.json();
      })
      .then(function(d){
        if (d === null) return;
        fails = 0;
        if (d && d.healthy === true) hide();
        else if (d && d.error) showCode(d.error.code);
      })
      .catch(function(err){
        if (toId) clearTimeout(toId);
        fails++;
        if (!navigator.onLine) showCode('offline');
        else if (err && err.name === 'AbortError') showCode('timeout');
        else if (fails >= 5) showCode('server_error');
        else showCode(classifyFetchError(err));
      });
  }

  window.addEventListener('offline', function(){ showCode('offline'); });
  window.addEventListener('online', function(){ fails=0; check(); });

  var path = location.pathname;
  if (path.indexOf('/error') !== 0 && path.indexOf('/offline') !== 0) {
    var start = function(){ setTimeout(check, 800); setInterval(check, 3000); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
  }
})();
