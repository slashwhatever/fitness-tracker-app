// Service Worker for offline caching and PWA functionality
const CACHE_NAME = "fitness-app-v1";
const STATIC_CACHE = "static-v1";
const DYNAMIC_CACHE = "dynamic-v1";

// Assets to cache immediately
const STATIC_ASSETS = [
  "/",
  "/library",
  "/settings",
  "/analytics",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/android-chrome-192x192.png",
  "/android-chrome-512x512.png",
];

// API endpoints to cache with network-first strategy
const API_CACHE_PATTERNS = [
  /\/api\/workouts/,
  /\/api\/movements/,
  /\/api\/sets/,
  /\/api\/user-profile/,
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("Service Worker: Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log("Service Worker: Static assets cached");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("Service Worker: Failed to cache static assets", error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log("Service Worker: Deleting old cache", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("Service Worker: Activated");
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // Handle different types of requests
  if (isStaticAsset(request)) {
    // Static assets: Cache first, fallback to network
    event.respondWith(cacheFirst(request));
  } else if (isApiRequest(request)) {
    // API requests: Network first, fallback to cache
    event.respondWith(networkFirst(request));
  } else if (isPageRequest(request)) {
    // Page requests: Network first, fallback to cache
    event.respondWith(networkFirst(request));
  } else {
    // Other requests: Network only
    event.respondWith(fetch(request));
  }
});

// Cache first strategy (for static assets)
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error("Cache first strategy failed:", error);
    return new Response("Offline", { status: 503 });
  }
}

// Network first strategy (for dynamic content)
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log("Network failed, trying cache:", request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // For page requests, return a basic offline page
    if (isPageRequest(request)) {
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Offline - Fitness App</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { 
                font-family: system-ui; 
                text-align: center; 
                padding: 2rem;
                background: #1a1a1a;
                color: white;
              }
              .offline-icon { font-size: 4rem; margin-bottom: 1rem; }
            </style>
          </head>
          <body>
            <div class="offline-icon">📱</div>
            <h1>You're offline</h1>
            <p>Some features may not be available. Check your connection and try again.</p>
            <button onclick="window.location.reload()">Retry</button>
          </body>
        </html>
        `,
        {
          headers: { "Content-Type": "text/html" },
          status: 200,
        }
      );
    }

    return new Response("Offline", { status: 503 });
  }
}

// Helper functions
function isStaticAsset(request) {
  const url = new URL(request.url);
  return (
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".webmanifest")
  );
}

function isApiRequest(request) {
  const url = new URL(request.url);
  return API_CACHE_PATTERNS.some((pattern) => pattern.test(url.pathname));
}

function isPageRequest(request) {
  const url = new URL(request.url);
  return (
    request.headers.get("accept")?.includes("text/html") ||
    url.pathname === "/" ||
    url.pathname.startsWith("/workout/") ||
    url.pathname.startsWith("/library/") ||
    url.pathname.startsWith("/settings") ||
    url.pathname.startsWith("/analytics")
  );
}

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    console.log("Service Worker: Background sync triggered");
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // This would sync any offline actions when connection is restored
  console.log("Service Worker: Performing background sync");
  // Implementation would depend on specific offline actions needed
}

// Push notifications (for future PWA features)
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: "/android-chrome-192x192.png",
      badge: "/android-chrome-192x192.png",
      tag: "fitness-app",
      requireInteraction: true,
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(clients.openWindow("/"));
});
