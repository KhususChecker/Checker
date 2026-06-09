const CACHE_NAME = 'tracker-unit-v4'; // Jika nanti update tampilan besar, cukup ganti ini ke 'v5'
const assets = [
  './',
  './index.html',
  './manifest.json'
];

// Instalasi
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(assets))
  );
});

// Aktivasi & Hapus Cache Lama
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
});

// STRATEGI: Network First (Cek ke server dulu, baru ke cache)
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(networkResponse => {
        // Jika internet ada, update cache dengan file terbaru
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(e.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // Jika offline, ambil dari cache
        return caches.match(e.request);
      })
  );
});
