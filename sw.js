/* LiveRadio — يجعل الموقع قابلاً للتثبيت كتطبيق، ويفتح واجهته حتى مع اتصال ضعيف.
   الصفحات والبيانات: من الشبكة أولاً (لتبقى محدّثة)، والنسخة المحفوظة فقط إن انقطع الاتصال.
   الصور والأيقونات: من المحفوظ أولاً. ولا نلمس البثّ ولا طلبات المواقع الأخرى. */
const V = 'lr-v1';
const SHELL = ['/', '/articles.html', '/manifest.json', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || r.headers.has('range')) return;
  const img = /\.(png|jpe?g|webp|gif|svg|ico)$/i.test(u.pathname);
  if (img) {
    e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => {
      if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); }
      return res;
    })));
    return;
  }
  e.respondWith(fetch(r).then(res => {
    if (res.ok && (r.mode === 'navigate' || /\.(json|js|css|html)$/i.test(u.pathname))) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); }
    return res;
  }).catch(() => caches.match(r).then(hit => hit || (r.mode === 'navigate' ? caches.match('/') : Response.error()))));
});
