
const CACHE='roe-v1';
self.addEventListener('install',e=>{
 e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','index.html','icon-512.png','manifest.json'])));
});
self.addEventListener('fetch',e=>{
 e.respondWith(caches.match(e.request).then(r=>r || fetch(e.request)));
});
