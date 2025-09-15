const CACHE_NAME = 'neko-gallery-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg',
  // Add other assets like CSS, JS, fonts, icons here
  // These will be added automatically by the build process in a real app
];
const IMAGE_CACHE_NAME = 'neko-gallery-images-v1';
const MAX_IMAGES_TO_CACHE = 50;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // For navigation requests, use a network-first strategy
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          return response;
        })
        .catch(() => {
          return caches.match('/index.html');
        })
    );
    return;
  }

  // For image requests, use a cache-first, then network strategy
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          // Cache the new image
          return caches.open(IMAGE_CACHE_NAME).then((cache) => {
            cache.put(request, networkResponse.clone());
            // Limit the number of cached images
            cache.keys().then((keys) => {
              if (keys.length > MAX_IMAGES_TO_CACHE) {
                cache.delete(keys[0]);
              }
            });
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // For other requests (CSS, JS, etc.), use a stale-while-revalidate strategy
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, networkResponse.clone());
        });
        return networkResponse;
      });
      return cachedResponse || fetchPromise;
    })
  );
});
