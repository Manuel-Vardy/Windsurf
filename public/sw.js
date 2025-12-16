const CACHE_NAME = "scm-cache-v1";

const CORE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/placeholder.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(CORE_ASSETS);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  event.respondWith(
    (async () => {
      const url = new URL(request.url);

      // Navigation requests: serve cached shell then network update.
      if (request.mode === "navigate") {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match("/index.html");
        try {
          const fresh = await fetch(request);
          cache.put("/index.html", fresh.clone());
          return fresh;
        } catch {
          return cached || Response.error();
        }
      }

      // Same-origin asset requests: cache-first.
      if (url.origin === self.location.origin) {
        const cached = await caches.match(request);
        if (cached) return cached;

        try {
          const fresh = await fetch(request);
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, fresh.clone());
          return fresh;
        } catch {
          return Response.error();
        }
      }

      // Cross-origin: network only.
      return fetch(request);
    })()
  );
});
