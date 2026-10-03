const CACHE_NAME = 'spppt-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/css/styles.css',
  // icons (adjust if you use different names)
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png'
];

// On install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// On activate: cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first for API (firebase), cache-first for static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Serve static assets from cache
  if (STATIC_ASSETS.includes(url.pathname) || url.origin !== location.origin) {
    event.respondWith(
      caches.match(event.request).then(cached => cached || fetch(event.request))
    );
    return;
  }

  // For navigation (index.html)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Default - network first fallback to cache
  event.respondWith(
    fetch(event.request)
      .then(resp => {
        // Optionally update cache for same-origin resources
        if (event.request.method === 'GET' && event.request.url.startsWith(self.location.origin)) {
          const responseClone = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        }
        return resp;
      })
      .catch(() => caches.match(event.request))
  );
});