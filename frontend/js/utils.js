/* utils.js — pure-функции (безопасно подключать) */
export function formatTime(sec) {
  if (!isFinite(sec)) return '0:00';
  var m = Math.floor(sec / 60), s = Math.floor(sec % 60);
  return m + ':' + (s < 10 ? '0' : '') + s;
}
export function escapeHtml(s) {
  var d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}
export function sleep(ms) { return new Promise(function(r){ setTimeout(r, ms); }); }
export function debounce(fn, wait) {
  var t;
  return function() {
    var ctx = this, args = arguments;
    clearTimeout(t);
    t = setTimeout(function(){ fn.apply(ctx, args); }, wait);
  };
}
