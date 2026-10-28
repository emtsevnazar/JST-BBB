(function(){
  'use strict';
  if (window.__jstDotsV7) return;
  window.__jstDotsV7 = true;

  // ===== DOTS =====
  function addDots() {
    var sels = ['#btn-download-toggle', '#history-dropdown > .btn', '#dl-dropdown > .btn'];
    sels.forEach(function(sel){
      try {
        document.querySelectorAll(sel).forEach(function(btn){
          if (btn.querySelector('.jst-dot')) return;
          btn.classList.add('jst-btn-with-dot');
          var d = document.createElement('span');
          d.className = 'jst-dot';
          d.setAttribute('aria-hidden', 'true');
          btn.appendChild(d);
        });
      } catch(e) {}
    });
  }
  addDots();
  if (document.body) new MutationObserver(addDots).observe(document.body, {childList: true, subtree: true});
  window.addEventListener('load', addDots);

  // ===== ERROR MESSAGES (English) =====
  var ERRORS = {
    offline:      { t: 'No Connection',        m: 'Wi-Fi or mobile data is disabled. Reconnecting automatically.' },
    no_internet:  { t: 'No Internet',          m: 'Your device is not connected to the internet.' },
    weak_internet:{ t: 'Weak Connection',      m: 'Your internet is slow or unstable. Retrying...' },
    vpn_unstable: { t: 'Unstable VPN',         m: 'VPN connection is unstable. Try disabling it or reconnecting.' },
    service_error:{ t: 'Service Error',        m: 'A required service is temporarily unavailable.' },
    server_error: { t: 'Server Error',         m: 'The server returned an error. Retrying...' },
    clear_cache:  { t: 'Clear Cache Required', m: 'Please clear your browser cache and reload the page.' },
    maintenance:  { t: 'Under Maintenance',    m: 'The service is under maintenance. We will be back soon.' },
    not_found:    { t: 'Page Not Found',       m: 'The page you requested does not exist. Error 404.' },
    timeout:      { t: 'Request Timeout',      m: 'The server took too long to respond.' },
    unknown:      { t: 'Something Went Wrong', m: 'An unexpected error occurred. Please try again.' }
  };

  function getMsg(code) {
    if (!code) return ERRORS.unknown;
    var k = String(code).toLowerCase().replace(/[^a-z0-9_]/g, '_');
    if (ERRORS[k]) return ERRORS[k];
    if (k.indexOf('offline') !== -1 || k.indexOf('connect') !== -1) return ERRORS.offline;
    if (k.indexOf('internet') !== -1) return ERRORS.no_internet;
    if (k.indexOf('weak') !== -1 || k.indexOf('slow') !== -1) return ERRORS.weak_internet;
    if (k.indexOf('vpn') !== -1) return ERRORS.vpn_unstable;
    if (k.indexOf('cache') !== -1) return ERRORS.clear_cache;
    if (k.indexOf('maint') !== -1) return ERRORS.maintenance;
    if (k.indexOf('404') !== -1 || k.indexOf('not_found') !== -1) return ERRORS.not_found;
    if (k.indexOf('timeout') !== -1) return ERRORS.timeout;
    if (k.indexOf('service') !== -1) return ERRORS.service_error;
    if (k.indexOf('server') !== -1) return ERRORS.server_error;
    return ERRORS.unknown;
  }

  // ===== OVERLAY =====
  var overlay = null;
  var fails = 0;

  function showOverlay(title, msg) {
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'jst-err-overlay';
      overlay.innerHTML = '<div class="jst-err-toast">' +
        '<div class="jst-err-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>' +
        '<div class="jst-err-body"><div class="jst-err-title"></div><div class="jst-err-msg"></div></div>' +
        '<button class="jst-err-btn" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg></button>' +
        '</div>';
      document.body.appendChild(overlay);
      overlay.querySelector('.jst-err-btn').addEventListener('click', function(){ fails = 0; checkNow(); });
    }
    var t = overlay.querySelector('.jst-err-title');
    var m = overlay.querySelector('.jst-err-msg');
    if (t) t.textContent = title;
    if (m) m.textContent = msg;
  }

  function hideOverlay() {
    if (overlay) { overlay.remove(); overlay = null; }
  }

  function checkNow() {
    if (!navigator.onLine) {
      showOverlay(ERRORS.offline.t, ERRORS.offline.m);
      return;
    }
    fetch('/api/error-state?_t=' + Date.now(), {cache: 'no-store'})
      .then(function(rr){ return rr.json(); })
      .then(function(d){
        fails = 0;
        if (d && d.healthy === true) { hideOverlay(); return; }
        if (d && d.error) {
          var e = getMsg(d.error.code);
          showOverlay(e.t, e.m);
        }
      })
      .catch(function(){
        fails++;
        if (!navigator.onLine) {
          showOverlay(ERRORS.offline.t, ERRORS.offline.m);
        } else if (fails >= 5) {
          showOverlay(ERRORS.server_error.t, ERRORS.server_error.m);
        }
      });
  }

  window.addEventListener('offline', function(){
    showOverlay(ERRORS.offline.t, ERRORS.offline.m);
  });
  window.addEventListener('online', function(){ fails = 0; checkNow(); });

  var path = location.pathname;
  if (path.indexOf('/error') !== 0 && path.indexOf('/offline') !== 0) {
    var start = function(){ setTimeout(checkNow, 800); setInterval(checkNow, 3000); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
  }
})();
