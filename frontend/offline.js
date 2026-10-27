/* v1.10.0: Global offline/error handler — redirect to /offline on network/critical errors. */
(function() {
  "use strict";
  var _last = 0;
  function _go(reason, code) {
    if (location.pathname === "/offline") return;
    var now = Date.now();
    if (now - _last < 2000) return;
    _last = now;
    var url = "/offline?reason=" + encodeURIComponent(reason || "unknown");
    if (code) url += "&code=" + code;
    try { location.href = url; } catch (e) {}
  }
  try {
    window.addEventListener("offline", function() { _go("navigator_offline"); });
    window.addEventListener("error", function(ev) {
      try {
        var m = String((ev && ev.message) || "");
        if (m.indexOf("SyntaxError") !== -1 || m.indexOf("Failed to fetch") !== -1) _go("js_critical");
      } catch (e) {}
    });
    window.addEventListener("unhandledrejection", function(ev) {
      try {
        var r = String((ev && ev.reason) || "");
        if (r.indexOf("Failed to fetch") !== -1 || r.indexOf("NetworkError") !== -1) _go("network_rejection");
      } catch (e) {}
    });
    if (typeof window.fetch === "function" && !window._jstFetchWrapped) {
      var _orig = window.fetch;
      window.fetch = function() {
        return _orig.apply(this, arguments).catch(function(err) {
          try { if (String(err || "").indexOf("Failed to fetch") !== -1) _go("fetch_fail"); } catch (x) {}
          throw err;
        });
      };
      window._jstFetchWrapped = true;
    }
  } catch (e) { console.warn("[offline.js] init:", e); }
})();
