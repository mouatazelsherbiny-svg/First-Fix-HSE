// Minimal service worker for the First Fix HSE PWA.
// Goal: let the app install like a native app and stay usable for a
// moment if the connection drops — never serve stale data to a signed-in
// user while online.

const CACHE_NAME = "ffhse-cache-v1";
const OFFLINE_FALLBACK_URL = "/dashboard";

const PRECACHE_URLS = [
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/apple-touch-icon.png",
  "/logo-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle same-origin GET requests. Everything else — API calls,
  // POST/PUT, and cross-origin requests (Supabase, etc.) — goes straight
  // to the network untouched.
  if (request.method !== "GET") return;
  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }
  if (url.origin !== self.location.origin) return;

  // Page navigations: network-first, so a signed-in user always sees
  // fresh content while online. Only fall back to a cached page when the
  // network request itself fails (offline).
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(
        () =>
          caches.match(request).then((cached) => cached) ||
          caches.match(OFFLINE_FALLBACK_URL)
      )
    );
    return;
  }

  // Static assets (icons, images, fonts, hashed JS/CSS chunks):
  // cache-first, filling the cache in the background for next time.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);
    })
  );
});
