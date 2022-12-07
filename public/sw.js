self.addEventListener('install', (e) => {
  console.log('[SW] Installing event');
});

self.addEventListener('activate', (e) => {
  console.log('[SW] Activating event');
  return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  console.log('[SW] Fetching event', e);
  e.respondWith(fetch(e.request));
});
