// DECLASSIFIED Intelligence Feed — Service Worker
// Cache version — bump this to force update
const CACHE_VERSION = 'declassified-v1.2';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  'https://fonts.googleapis.com/css2?family=Special+Elite&family=Share+Tech+Mono&family=Oswald:wght@400;700&display=swap'
];

// ── INSTALL ──
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      console.log('[SW] Pre-caching assets');
      // Cache what we can, ignore failures for external resources
      return Promise.allSettled(
        PRECACHE_ASSETS.map(url => cache.add(url).catch(e => console.warn('[SW] Failed to cache:', url)))
      );
    }).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE ──
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// ── FETCH ──
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Never intercept Anthropic API calls — always go to network
  if (url.hostname === 'api.anthropic.com') {
    return; // fall through to network
  }

  // For Google Fonts — cache first, fallback to network
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          const clone = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => cache.put(event.request, clone));
          return response;
        }).catch(() => cached || new Response('', { status: 503 }));
      })
    );
    return;
  }

  // For app shell (HTML, CSS, JS, icons) — cache first, network fallback
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) {
          // Serve from cache but refresh in background
          const networkFetch = fetch(event.request).then(response => {
            caches.open(STATIC_CACHE).then(cache => cache.put(event.request, response.clone()));
            return response;
          }).catch(() => {});
          return cached;
        }
        // Not in cache — try network, cache the result
        return fetch(event.request).then(response => {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then(cache => cache.put(event.request, clone));
          return response;
        }).catch(() => {
          // Offline fallback
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/index.html');
          }
        });
      })
    );
    return;
  }
});

// ── BACKGROUND SYNC (for future use) ──
self.addEventListener('sync', event => {
  console.log('[SW] Background sync:', event.tag);
});

// ── PUSH NOTIFICATIONS (for future use) ──
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'DECLASSIFIED';
  const options = {
    body: data.body || 'New intelligence extracted.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url || '/'));
});
