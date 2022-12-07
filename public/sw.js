self.addEventListener('install', (e) => {
  console.log('[SW] Installing event');
});

self.addEventListener('activate', (e) => {
  console.log('[SW] Activating event');
  return self.clients.claim();
});
