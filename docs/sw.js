const C='gaarak-v2',A=['./','index.html','style.css','app.js','logo.svg','manifest.json'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(A))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x))))));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.pathname.includes('/api/'))return;
 e.respondWith(fetch(e.request).then(r=>{if(u.origin===location.origin||u.host==='unpkg.com'||u.host.endsWith('openstreetmap.org')){const x=r.clone();caches.open(C).then(c=>c.put(e.request,x))}return r}).catch(()=>caches.match(e.request)))});
