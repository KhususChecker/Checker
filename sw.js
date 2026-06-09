const CACHE_NAME = 'tracker-unit-v4';
const assets = [
  './',
  './index.html',
  './manifest.json'
];

// Instalasi Assets Utama ke Dalam Cache Perangkat
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(assets))
  );
});

// Aktivasi & Pembersihan Cache Versi Lama Secara Otomatis
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

// OPTIMALISASI: Penerapan Network First Selektif Hanya untuk Request GET
self.addEventListener('fetch', e => {
  // Cegah intersep request POST (Data Sinkronisasi Google Sheets Agar Tidak Masuk Cache)
  if (e.request.method !== 'GET') {
    return; 
  }
  
  e.respondWith(
    fetch(e.request)
      .then(networkResponse => {
        // Ambil data terbaru dari server jika online, lalu simpan salinannya ke cache
        if (networkResponse && networkResponse.status === 200) {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, cacheCopy));
        }
        return networkResponse;
      })
      .catch(() => {
        // Jika sedang offline (masuk area tanpa sinyal), gunakan cadangan cache lokal
        return caches.match(e.request);
      })
  );
});
