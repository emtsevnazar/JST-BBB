const VERSION = 'v86.0.0';
const CACHE_STATIC = `jst-static-${  VERSION}`;
const CACHE_OFFL = `jst-offl-${  VERSION}`;

const PRECACHE = [
  '/error',
  '/offline',
  '/static/css/style.css',
  '/static/css/style-clean.css',
  
  '/static/js/help-fix.js',
  '/static/js/dots.js',
  '/static/js/wand.js',
  '/static/img/ph_b2.png',
  '/static/img/icon-192.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_OFFL).then((c) => {
      return Promise.all(PRECACHE.map((u) => {
        return c.add(u).catch((err) => {});
      }));
    }).then(() =>{ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    Promise.all([
      caches.keys().then((keys) => {
        return Promise.all(keys.filter((k) =>{ return k !== CACHE_STATIC && k !== CACHE_OFFL; }).map((k) =>{ return caches.delete(k); }));
      }),
      self.clients.claim()
    ])
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const u = new URL(req.url);
  if (u.origin !== location.origin) return;
  if (u.pathname.indexOf('/api/') === 0 || u.pathname.indexOf('/ws/') === 0 || u.pathname.indexOf('/output/') === 0 || u.pathname === '/sw.js') return;

  const isNav = req.mode === 'navigate' || req.destination === 'document';
  if (isNav) {
    e.respondWith(
      fetch(req).catch(() => {
        return caches.match('/error').then((h) =>{ return h || caches.match('/offline'); }).then((h) =>{
          return h || new Response('<!doctype html><html><body style="background:#2a0606;color:#fff;padding:20px"><h1>No Connection</h1><p>Check your network.</p></body></html>', {status:503, headers:{'Content-Type':'text/html'}});
        });
      })
    );
    return;
  }

  if (u.pathname === '/error' || u.pathname === '/offline' || u.pathname.indexOf('/static/') === 0) {
    e.respondWith(
      caches.match(req).then((c) =>{
        if (c) return c;
        return fetch(req).then((resp) =>{
          if (resp && resp.ok) {
            const clone = resp.clone();
            caches.open(CACHE_OFFL).then((cache) =>{ cache.put(req, clone); });
          }
          return resp;
        }).catch(() =>{ return caches.match('/offline'); });
      })
    );
    return;
  }
});

/* v77: форсированное удаление старых кэшей */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => { return k.indexOf('jst-') !== 0 || k.indexOf('v77') === -1; })
            .map((k) => { return caches.delete(k); })
      );
    }).then(() => { return self.clients.claim(); })
  );
});

/* v77: при получении сообщения от клиента — очистить всё */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_ALL') {
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => { return caches.delete(k); }));
    });
  }
});
