const CACHE_NAME = "noum-list-shell-v1";
const APP_SHELL = ["/", "/offline.html", "/manifest.webmanifest", "/icon.png", "/favicon.png"];

const isSameOrigin = (url) => new URL(url, self.location.origin).origin === self.location.origin;

async function cacheAppShell() {
  const cache = await caches.open(CACHE_NAME);
  const response = await fetch("/", { cache: "reload" });
  if (response.ok) {
    await cache.put("/", response.clone());
    const html = await response.text();
    const assets = [...html.matchAll(/(?:src|href)="([^"?#]+(?:\?[^"#]*)?)"/g)]
      .map((match) => match[1])
      .filter((asset) => isSameOrigin(asset));
    await Promise.allSettled([...new Set([...APP_SHELL, ...assets])].map(async (asset) => {
      const request = new Request(asset, { cache: "reload" });
      const assetResponse = await fetch(request);
      if (assetResponse.ok) await cache.put(request, assetResponse.clone());
    }));
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(cacheAppShell());
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys
    .filter((key) => key.startsWith("noum-list-") && key !== CACHE_NAME)
    .map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).then(async (response) => {
      const cache = await caches.open(CACHE_NAME);
      await cache.put("/", response.clone());
      return response;
    }).catch(async () => (await caches.match("/")) || (await caches.match("/offline.html"))));
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then(async (response) => {
      if (response.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
      }
      return response;
    })));
  }
});
