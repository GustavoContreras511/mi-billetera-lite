const CACHE = 'billetera-v3';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/app.js',
  './js/categories.js',
  './js/format.js',
  './js/store.js',
  './js/toast.js',
  './js/view.js',
  './fonts/plex-sans-400.woff2',
  './fonts/plex-sans-500.woff2',
  './fonts/plex-sans-600.woff2',
  './fonts/plex-mono-400.woff2',
  './fonts/plex-mono-500.woff2',
  './icons/favicon.svg',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-192.png',
  './icons/maskable-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request)
      .then(cached => cached ?? fetch(request))
      .catch(() => request.mode === 'navigate' ? caches.match('./index.html') : Response.error())
  );
});
