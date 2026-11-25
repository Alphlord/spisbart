/* Enkel offline-støtte: appskallet lagres, data hentes alltid fra nett. */
var CACHE = 'ikmat-v13';
var SHELL = ['./', 'index.html', 'app.js', 'data.js', 'icon.svg', '../fonts/fonts.css', '../fonts/barlow-latin-400-normal.woff2', '../fonts/barlow-latin-600-normal.woff2', '../fonts/barlow-condensed-latin-800-normal.woff2'];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return; // Supabase og CDN går rett til nett
  // nett først, så hurtigbuffer
  e.respondWith(fetch(req, { cache: 'no-cache' }).then(function (res) {
    var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); return res;
  }).catch(function () { return caches.match(req).then(function (m) { return m || caches.match('index.html'); }); }));
});
