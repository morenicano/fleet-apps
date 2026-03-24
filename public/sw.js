const CACHE_NAME = 'api-hub-v1';
const ASSETS = [
  '/',
  '/manifest.json',
  'https://unpkg.com/swagger-ui-dist@5/swagger-ui.css',
  'https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
