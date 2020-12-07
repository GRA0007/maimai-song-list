const cacheName = 'maimai-song-list-v1';
const staticAssets = [
  './',
  './index.html',
  './script.js',
  './style.css',
	'./でらっくま.png',
];

const networkFirst = async req => {
  const cache = await caches.open(cacheName);
  try {
    const fresh = await fetch(req);
    cache.put(req, fresh.clone());
    return fresh;
  } catch (e) {
    const cachedResponse = await cache.match(req);
    return cachedResponse;
  }
}

self.addEventListener('install', async event => {
	const cache = await caches.open(cacheName);
	await cache.addAll(staticAssets);
});

self.addEventListener('fetch', async event => {
	const req = event.request;
  event.respondWith(networkFirst(req));
});
