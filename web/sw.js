const CACHE_NAME = 'findr-shell-v9';
const CORE = [
  '/', '/index.html', '/listings.html', '/map.html',
  '/config.js', '/js/filters.js', '/js/ai-guard.js', '/js/ai-demo.js',
  '/data/listings.json', '/listings.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(CORE)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);
  // Cache-first for the app shell; network-first for data
  if (CORE.includes(url.pathname)) {
    e.respondWith(caches.match(request).then(res => res || fetch(request)));
  } else if (url.pathname.endsWith('/data/listings.json') || url.pathname.endsWith('/listings.json')) {
    e.respondWith(
      fetch(request).then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(request, clone));
        return res;
      }).catch(() => caches.match(request))
    );
  }
});
