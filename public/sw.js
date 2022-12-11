const CACHE_STATIC_NAME = 'static-v1';
const CACHE_DYNAMIC_NAME = 'dynamic-v2';
const STATIC_FILES = [
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
];

self.addEventListener('install', (e) => {
  console.log('[SW] Installing event');
  e.waitUntil(
    caches.open(CACHE_STATIC_NAME).then((cache) => {
      console.log('[SW] Pre-caching');
      cache.addAll(STATIC_FILES);
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

// Cache then Network & dynamic caching with offline support
self.addEventListener('fetch', (e) => {
  const url = 'https://httpbin.org/get';

  if (e.request.url.indexOf(url) > -1) {
    e.respondWith(
      caches.open(CACHE_DYNAMIC_NAME).then((cache) =>
        fetch(e.request).then((res) => {
          cache.put(e.request, res.clone());
          return res;
        })
      )
    );
  } else if (new RegExp('\\b' + STATIC_FILES.join('\\b|\\b') + '\\b').test(e.request.url)) {
    e.respondWith(caches.match(e.request));
  } else {
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
              return caches.open(CACHE_STATIC_NAME).then((cache) => {
                if (e.request.url.indexOf('/help')) {
                  return cache.match('/offline.html');
                }
              });
            });
        }
      })
    );
  }
});

// Cache first then network
// self.addEventListener('fetch', (e) => {
//   e.respondWith(
//     caches.match(e.request).then((response) => {
//       if (response) {
//         return response;
//       } else {
//         return fetch(e.request)
//           .then((res) => {
//             caches.open(CACHE_DYNAMIC_NAME).then((cache) => {
//               cache.put(e.request.url, res.clone());
//               return res;
//             });
//           })
//           .catch((error) => {
//             return caches.open(CACHE_STATIC_NAME).then((cache) => cache.match('/offline.html'));
//           });
//       }
//     })
//   );
// });

// Cache only
// self.addEventListener('fetch', (e) => {
//   e.respondWith(caches.match(e.request));
// });

// Network only
// self.addEventListener('fetch', (e) => {
//   e.respondWith(fetch(e.request));
// });

// Network with Cache fallback
// self.addEventListener('fetch', (e) => {
//   e.respondWith(
//     fetch(e.request)
//       .then((res) =>
//         caches.open(CACHE_DYNAMIC_NAME).then((cache) => {
//           cache.put(e.request.url, res.clone());
//           return res;
//         })
//       )
//       .catch((err) => caches.match(e.request))
//   );
// });
