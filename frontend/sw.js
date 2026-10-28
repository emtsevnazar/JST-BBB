// JST Studio Service Worker v2.0.0
// Стратегия:
//   - HTML       → ВСЕГДА network (без кэша) — иначе /error будет закэширован под ключом /
//   - /offline   → кэш при offline (только эта страница)
//   - /static/*  → cache-first
//   - /api/*, /ws/*, /output/* → network-only
const VERSION      = 'v2.0.1';
const CACHE_STATIC = `jst-static-${VERSION}`;
const CACHE_OFFL   = `jst-offl-${VERSION}`;

const PRECACHE_OFFLINE = [
  '/offline',
  '/static/style.css',
  '/static/img/icon-192.png',
  '/static/img/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_OFFL)
      .then((cache) => cache.addAll(PRECACHE_OFFLINE))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_STATIC && k !== CACHE_OFFL)
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

  // API/WS/output/sw.js — напрямую
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/ws/') ||
    url.pathname.startsWith('/output/') ||
    url.pathname === '/sw.js' ||
    url.pathname === '/error'
  ) {
    return;
  }

  // HTML navigation — ВСЕГДА сеть, без кэша
  const isNav = req.mode === 'navigate' || req.destination === 'document';
  if (isNav) {
    event.respondWith(
      fetch(req).catch(() => caches.match('/offline'))
    );
    return;
  }

  // /offline и статика — кэш-first
  if (url.pathname === '/offline' || url.pathname.startsWith('/static/')) {
    event.respondWith(
      caches.match(req).then((c) =>
        c || fetch(req).then((resp) => {
          if (resp && resp.ok) {
            const clone = resp.clone();
            const cacheName = url.pathname === '/offline' ? CACHE_OFFL : CACHE_STATIC;
            caches.open(cacheName).then((cache) => cache.put(req, clone)).catch(() => {});
          }
          return resp;
        })
      )
    );
    return;
  }
});
