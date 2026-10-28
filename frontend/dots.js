(function(){
  'use strict';
  if (window.__jstDotsV6) return;
  window.__jstDotsV6 = true;

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
      showOverlay('Нет подключения', 'Wi-Fi или мобильные данные отключены. Восстановление автоматически.');
      return;
    }
    fetch('/api/error-state?_t=' + Date.now(), {cache:'no-store'})
      .then(function(rr){ return rr.json(); })
      .then(function(d){
        fails = 0;
        if (d && d.healthy === true) { hideOverlay(); return; }
        if (d && d.error) {
          showOverlay(
            (d.error.code || 'Ошибка') + (d.error.message ? ' - ' + d.error.message : ''),
            'Источник: ' + (d.error.source || '?') + ' - Восстановление автоматически'
          );
        }
      })
      .catch(function(){
        fails++;
        if (!navigator.onLine) {
          showOverlay('Нет подключения', 'Wi-Fi отключён. Восстановление автоматически.');
        } else if (fails >= 5) {
          showOverlay('Сервер недоступен', 'Не удалось связаться (' + fails + '). Ждём...');
        }
      });
  }

  window.addEventListener('offline', function(){
    showOverlay('Нет подключения', 'Wi-Fi или мобильные данные отключены.');
  });
  window.addEventListener('online', function(){ fails = 0; checkNow(); });

  var path = location.pathname;
  if (path.indexOf('/error') !== 0 && path.indexOf('/offline') !== 0) {
    var start = function(){ setTimeout(checkNow, 800); setInterval(checkNow, 3000); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
  }
})();
