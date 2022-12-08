self.addEventListener('install', (e) => {
  console.log('[SW] Installing event');
  e.waitUntil(
    caches.open('static').then((cache) => {
      console.log('[SW] Pre-caching');
      cache.addAll([
        '/',
        '/index.html',
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
            caches.open('dynamic').then((cache) => {
              cache.put(e.request.url, res.clone());
              return res;
            });
          })
          .catch((error) => {});
      }
    })
  );
});
