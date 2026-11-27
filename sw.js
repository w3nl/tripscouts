// Service worker: maakt het spel installeerbaar en offline speelbaar.
// Verhoog CACHE bij elke wijziging, zodat telefoons de nieuwe versie krijgen, en houd GAME_VERSION in js/app.js
// hetzelfde getal (tests/pwa.spec.js controleert dat). De pagina toont dat getal en biedt herladen aan bij een nieuwere versie.
const CACHE = 'cabinweek-v100';
const CORE = [
  './',
  './index.html',
  './privacy.html',
  './manifest.webmanifest',
  './icons/favicon-32.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './css/game.css',
  './fonts/fredoka-latin.woff2',
  './fonts/fredoka-latin-ext.woff2',
  './fonts/nunito-latin.woff2',
  './fonts/nunito-latin-ext.woff2',
  './js/i18n.js',
  './js/data.js',
  './js/levels.js',
  './js/levelgen.js',
  './js/region-pole.js',
  './js/region-tirol.js',
  './js/region-norway.js',
  './js/region-netherlands.js',
  './js/region-dalmatia.js',
  './js/region-smaland.js',
  './js/region-scotland.js',
  './js/region-ardeche.js',
  './js/region-veneto.js',
  './js/regions.js',
  './js/core.js',
  './js/canvas.js',
  './js/sprites.js',
  './js/game.js',
  './js/world.js',
  './js/screens.js',
  './js/hero.js',
  './js/transfer.js',
  './js/voice.js',
  './js/ambience.js',
  './js/gamepad.js',
  './js/app.js'
];

self.addEventListener('install', event => {
  // cache: 'reload' slaat de HTTP-cache van de browser over, zodat de offline kopie de nieuwe versie is
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  // Alleen onze eigen oude caches: andere spellen op dezelfde github.io-origin (Pippi, Hello IT, Sinterklaas) houden de hunne
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('cabinweek-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
    .then(() => self.clients.matchAll({ type: 'window' })).then(pages => pages.forEach(p => p.postMessage({ type: 'version', cache: CACHE }))));
});

// Een open pagina vraagt welke versie deze service worker serveert.
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'version?' && event.source) event.source.postMessage({ type: 'version', cache: CACHE });
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // De pagina: eerst het netwerk (no-cache: GitHub Pages laat browsers bestanden 10 minuten hergebruiken), offline de kopie.
  // Alleen voor het spel zelf: andere pagina's (de privacypagina, /android/) mogen de offline kopie niet overschrijven.
  const game = new URL('./', location).pathname;
  if (req.mode === 'navigate' && (url.pathname === game || url.pathname === game + 'index.html')) {
    event.respondWith(fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); return res; })
      .catch(() => caches.match('./index.html')));
    return;
  }

  // De eigen bestanden: eerst het netwerk, zodat een update in één keer binnenkomt; offline uit de cache.
  if (url.origin === location.origin) {
    event.respondWith(fetch(req, { cache: 'no-cache' }).then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; })
      .catch(() => caches.match(req)));
    return;
  }
});
