const CACHE_NAME = "polly-word-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./manifest.webmanifest",
  "./icons/icon-app.svg",
  "./icons/icon-maskable.svg",
  "./src/app.js",
  "./src/config.js",
  "./src/words-data.js",
  "./src/state-model.js",
  "./src/storage.js",
  "./src/tutor-service.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          (networkResponse.type === "basic" || event.request.mode === "navigate")
        ) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }

        return networkResponse;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);

        if (cachedResponse) {
          return cachedResponse;
        }

        if (event.request.mode === "navigate") {
          return caches.match("./index.html");
        }

        return new Response("Offline", { status: 503, statusText: "Offline" });
      }),
  );
});
