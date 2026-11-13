// Python Quiz V6 service worker. Cache updates never touch localStorage.
const VERSION = 'v6-20261113-layout-font-refinement';
const CACHE = 'python-quiz-iphone-' + VERSION;
const BASE = new URL(self.registration.scope);
const CORE = ['index.html','app.js','styles.css','questions.json','version.json','manifest.webmanifest'];
const EXTRA = ['icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png'];
const abs = path => new URL(path, BASE).href;

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
    await Promise.all(keys.filter(key => key.startsWith('python-quiz-iphone-') && key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
    // The current V5 page listens for controllerchange and reloads itself.
    // Do not clear localStorage: learning records remain under pythonQuizIphone.v1.
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type === 'ACTIVATE_UPDATE') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || !url.pathname.startsWith(BASE.pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const response = await fetch(request, { cache: 'no-store' });
      if (response.ok) {
        event.waitUntil(cache.put(request, response.clone()));
        if (url.search) event.waitUntil(cache.put(new Request(url.origin + url.pathname), response.clone()));
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
