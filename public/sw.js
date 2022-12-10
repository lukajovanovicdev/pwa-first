let CACHE_STATIC_NAME = 'static-v4';
let CACHE_DYNAMIC_NAME = 'dynamic-v1';

self.addEventListener('install', (e) => {
  console.log('[SW] Installing event');
  e.waitUntil(
    caches.open(CACHE_STATIC_NAME).then((cache) => {
      console.log('[SW] Pre-caching');
      cache.addAll([
        '/',
        '/index.html',
        '/offline.html',
        '/src/js/app.js',
        '/src/js/feed.js',
        '/src/js/material.min.js',
        'src/css/app.css',
        'src/css/feed.css',
        'src/images/main-image.jpg',
        'https://fonts.googleapis.com/css?family=Roboto:400,700',
        'https://fonts.googleapis.com/icon?family=Material+Icons',
        'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css',
      ]);
    })
  );
});

self.addEventListener('activate', (e) => {
  console.log('[SW] Activating event');
  e.waitUntil(
    caches.keys().then((keysList) =>
      Promise.all(
        keysList.map((key) => {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log('[SW] Removing old cache');
            return caches.delete(key);
          }
        })
      )
    )
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      if (response) {
        return response;
      } else {
        return fetch(e.request)
          .then((res) => {
            caches.open(CACHE_DYNAMIC_NAME).then((cache) => {
              cache.put(e.request.url, res.clone());
              return res;
            });
          })
          .catch((error) => {
            return caches.open(CACHE_STATIC_NAME).then((cache) => cache.match('/offline.html'));
          });
      }
    })
  );
});
