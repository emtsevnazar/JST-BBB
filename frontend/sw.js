// JST Studio Service Worker v1.4.0
// Стратегия:
//   - HTML      → network-first (обновления)
//   - /static/* → cache-first (быстро, офлайн)
//   - /api/*, /ws/*, /output/* → network-only (никогда не кешируем)
const VERSION      = 'v1.4.29';
const CACHE_STATIC = `jst-static-${VERSION}`;
const CACHE_HTML   = `jst-html-${VERSION}`;

const PRECACHE = [
  '/offline',
  '/',
  '/manifest.json',
  '/static/style.css',
  '/static/app.js',
  '/static/test_phrases.js',
  '/static/img/poster_b.png',
  '/static/img/icon-192.png',
  '/static/img/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_STATIC && k !== CACHE_HTML)
            .map((k) => caches.delete(k))
        )
      ),
      self.clients.claim(),
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // Никогда не кешируем динамику
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/ws/')  ||
    url.pathname.startsWith('/output/') ||
    url.pathname === '/sw.js'
  ) {
    return; // пусть идёт напрямую в сеть
  }

  // HTML — network-first (обновления видны сразу; кеш как fallback)
  const isNav = req.mode === 'navigate' ||
                url.pathname === '/' ||
                url.pathname === '/index.html';
  if (isNav) {
    event.respondWith(
      fetch(req)
        .then((resp) => {
          const clone = resp.clone();
          caches.open(CACHE_HTML).then((c) => c.put(req, clone)).catch(() => {});
          return resp;
        })
        .catch(() =>
          caches.match(req).then((cached) => cached || caches.match('/'))
        )
    );
    return;
  }

  // Статика — cache-first
  if (url.pathname.startsWith('/static/') || url.pathname === '/manifest.json') {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((resp) => {
          if (resp && resp.ok) {
            const clone = resp.clone();
            caches.open(CACHE_STATIC).then((c) => c.put(req, clone)).catch(() => {});
          }
          return resp;
        });
      })
    );
    return;
  }
});
