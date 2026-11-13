// Python Quiz V4 service worker.
// It updates only Cache Storage. It NEVER reads, clears, or modifies localStorage.
const VERSION = 'v4-20261113-github-updater';
const CACHE = 'python-quiz-iphone-' + VERSION;
const BASE_URL = new URL(self.registration.scope);
const CORE = ['index.html','app.js','styles.css','questions.json','version.json','manifest.webmanifest'];
const EXTRA = ['icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png'];
const abs = path => new URL(path, BASE_URL).href;

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    for (const path of CORE) {
      const response = await fetch(abs(path), { cache: 'no-store' });
      if (!response.ok) throw new Error(`Precache failed: ${path} (${response.status})`);
      await cache.put(abs(path), response.clone());
    }
    await Promise.allSettled(EXTRA.map(async path => {
      const response = await fetch(abs(path), { cache: 'no-store' });
      if (response.ok) await cache.put(abs(path), response.clone());
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => key.startsWith('python-quiz-iphone-') && key !== CACHE)
      .map(key => caches.delete(key)));
    await self.clients.claim();
    // Old V1 app had no controllerchange handler. Navigate in-scope clients once so
    // the old cache-first shell is replaced by the new network-first app shell.
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    await Promise.allSettled(clients.map(async client => {
      const url = new URL(client.url);
      if (url.origin !== BASE_URL.origin || !url.pathname.startsWith(BASE_URL.pathname)) return;
      if (url.searchParams.get('_pq_v') === VERSION) return;
      url.searchParams.set('_pq_v', VERSION);
      await client.navigate(url.href);
    }));
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type === 'ACTIVATE_UPDATE') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith(BASE_URL.pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      // Network-first means the installed app sees GitHub Pages changes as soon as online.
      const response = await fetch(request, { cache: 'no-store' });
      if (response.ok) {
        await cache.put(request, response.clone());
        // Also refresh the canonical path for cache fallback when a navigation has a query.
        if (url.search) await cache.put(new Request(url.origin + url.pathname), response.clone());
      }
      return response;
    } catch (error) {
      const cached = await cache.match(request) || await cache.match(url.origin + url.pathname);
      if (cached) return cached;
      if (request.mode === 'navigate') {
        const shell = await cache.match(abs('index.html'));
        if (shell) return shell;
      }
      return Response.error();
    }
  })());
});
