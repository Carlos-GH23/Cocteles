const CACHE_NAME = 'cocktail-pwa-v3';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/main.js',
  '/scripts/app.js',
  '/images/icons/192.png',
  '/images/icons/512.png'
];

// Instalar: precache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// Activar: limpiar caché viejo
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch con estrategia "Network First, Cache Fallback"
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
