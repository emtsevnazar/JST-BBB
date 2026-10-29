const VERSION = 'v5.1.0';
const CACHE_STATIC = 'jst-static-' + VERSION;
const CACHE_OFFL = 'jst-offl-' + VERSION;

const PRECACHE = [
  '/error',
  '/offline',
  '/static/style.css',
  '/static/style-clean.css',
  '/static/dots.js',
  '/static/wand.js',
  '/static/img/ph_b2.png',
  '/static/img/icon-192.png'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_OFFL).then(function(c) {
      return Promise.all(PRECACHE.map(function(u) {
        return c.add(u).catch(function(err) {});
      }));
    }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    Promise.all([
      caches.keys().then(function(keys) {
        return Promise.all(keys.filter(function(k){ return k !== CACHE_STATIC && k !== CACHE_OFFL; }).map(function(k){ return caches.delete(k); }));
      }),
      self.clients.claim()
    ])
  );
});

self.addEventListener('fetch', function(e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var u = new URL(req.url);
  if (u.origin !== location.origin) return;
  if (u.pathname.indexOf('/api/') === 0 || u.pathname.indexOf('/ws/') === 0 || u.pathname.indexOf('/output/') === 0 || u.pathname === '/sw.js') return;

  var isNav = req.mode === 'navigate' || req.destination === 'document';
  if (isNav) {
    e.respondWith(
      fetch(req).catch(function() {
        return caches.match('/error').then(function(h){ return h || caches.match('/offline'); }).then(function(h){
          return h || new Response('<!doctype html><html><body style="background:#2a0606;color:#fff;padding:20px"><h1>No Connection</h1><p>Check your network.</p></body></html>', {status:503, headers:{'Content-Type':'text/html'}});
        });
      })
    );
    return;
  }

  if (u.pathname === '/error' || u.pathname === '/offline' || u.pathname.indexOf('/static/') === 0) {
    e.respondWith(
      caches.match(req).then(function(c){
        if (c) return c;
        return fetch(req).then(function(resp){
          if (resp && resp.ok) {
            var clone = resp.clone();
            caches.open(CACHE_OFFL).then(function(cache){ cache.put(req, clone); });
          }
          return resp;
        }).catch(function(){ return caches.match('/offline'); });
      })
    );
    return;
  }
});
