const STATIC_CACHE_NAME = 'static-cache-v1';
const DYNAMIC_CACHE_NAME = 'dynamic-cache-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg',
  // These paths will need to be updated based on the build output
  '/assets/index.js',
  '/assets/index.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // For navigation requests, use a network-first strategy to ensure the user always gets the latest HTML.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // For other requests (images, API calls), use a cache-first strategy.
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        return caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
          // Only cache successful responses and images.
          if (fetchResponse.ok && (fetchResponse.type === 'basic' || fetchResponse.headers.get('content-type')?.startsWith('image/'))) {
            cache.put(event.request.url, fetchResponse.clone());
          }
          return fetchResponse;
        });
      });
    }).catch(() => {
        // If both cache and network fail (e.g., for an image), you can return a fallback image.
        // For now, we'll just let the request fail.
    })
  );
});
