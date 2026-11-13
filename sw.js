// Python Quiz V3: non-destructive update. Never touch localStorage.
const VERSION = 'v3-20261113-safe-recovery';
const CACHE = 'python-quiz-iphone-' + VERSION;
const BASE = self.registration.scope;
const CORE = ['./index.html','./app.js','./styles.css','./questions.json'];
const EXTRA = ['./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png'];
const ABS = path => new URL(path, BASE).href;

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache=await caches.open(CACHE);
    // Require an intact offline core before switching workers; old data and caches remain available if install fails.
    for(const path of CORE){
      const response=await fetch(ABS(path),{cache:'no-store'});
      if(!response.ok) throw new Error('Unable to precache '+path+': '+response.status);
      await cache.put(ABS(path),response);
    }
    await Promise.allSettled(EXTRA.map(async path => {
      const response=await fetch(ABS(path),{cache:'no-store'});
      if(response.ok)await cache.put(ABS(path),response);
    }));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async()=>{
    // Delete ONLY old program caches. This does not clear localStorage or user progress.
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith('python-quiz-iphone-') && k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
    // Old V1 pages lack a controllerchange listener. Navigate them once to let the newly
    // activated worker serve the fresh app shell. Saved sessions survive in localStorage.
    const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    await Promise.allSettled(windows.map(async client=>{
      const url=new URL(client.url);
      if(!url.href.startsWith(BASE) || url.searchParams.get('_pq_up')===VERSION)return;
      url.searchParams.set('_pq_up',VERSION);
      try{await client.navigate(url.href);}catch(err){/* If unsupported, next app open uses new worker. */}
    }));
  })());
});
self.addEventListener('message', event => {
  if(event.data?.type==='ACTIVATE_UPDATE')self.skipWaiting();
});
self.addEventListener('fetch', event => {
  const request=event.request;
  if(request.method!=='GET' || new URL(request.url).origin!==self.location.origin)return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    try{
      const response=await fetch(request);
      if(response.ok){
        event.waitUntil(cache.put(request,response.clone()));
      }
      return response;
    }catch(err){
      const cached=await cache.match(request,{ignoreSearch:request.mode==='navigate'});
      if(cached)return cached;
      if(request.mode==='navigate'){
        const shell=await cache.match(ABS('./index.html'));
        if(shell)return shell;
      }
      return Response.error();
    }
  })());
});
