// public/service-worker.js

// Cache names
const CACHE_NAME = 'deliveryno-cache-v1';
const STATIC_CACHE = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic`;
const API_CACHE = `${CACHE_NAME}-api`;

// Assets to cache initially
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/vendors~main.chunk.js',
  '/static/js/bundle.js',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// Flag to prevent multiple installs and activations
let isInstalling = false;
let isActivating = false;

// Install service worker and cache static assets
self.addEventListener('install', (event) => {
  if (isInstalling) return;
  isInstalling = true;
  
  console.log('[Service Worker] Installing Service Worker...', event);
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[Service Worker] Precaching App Shell');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        isInstalling = false;
        console.log('[Service Worker] Installation complete');
      })
      .catch(error => {
        isInstalling = false;
        console.error('[Service Worker] Installation failed:', error);
      })
  );
});

// Activate service worker and clean up old caches
self.addEventListener('activate', (event) => {
  if (isActivating) return;
  isActivating = true;
  
  console.log('[Service Worker] Activating Service Worker...', event);
  
  event.waitUntil(
    caches.keys()
      .then(keyList => {
        return Promise.all(keyList.map(key => {
          if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE && key !== API_CACHE) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
          return Promise.resolve();
        }));
      })
      .then(() => {
        isActivating = false;
        console.log('[Service Worker] Activation complete');
        return self.clients.claim();
      })
      .catch(error => {
        isActivating = false;
        console.error('[Service Worker] Activation failed:', error);
      })
  );
});

// Helper function to determine if a request is for an API call
const isApiRequest = (url) => {
  return url.includes('/api/');
};

// Helper function to determine if a request is for a static asset
const isStaticAsset = (url) => {
  return STATIC_ASSETS.some(asset => url.endsWith(asset));
};

// Helper function for network-first strategy
const networkFirst = async (request) => {
  try {
    const networkResponse = await fetch(request);
    // Only cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || Promise.reject('No network or cache response');
  }
};

// Helper function for cache-first strategy
const cacheFirst = async (request) => {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    return Promise.reject('No network or cache response');
  }
};

// Handle fetch events - with error handling
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  try {
    const url = new URL(event.request.url);
    
    // Skip cross-origin requests
    if (url.origin !== self.location.origin) {
      return;
    }
    
    // API requests - Network first
    if (isApiRequest(url.pathname)) {
      event.respondWith(networkFirst(event.request).catch(() => {
        // Fallback for network request failures
        return caches.match('/offline.html') || new Response('Network request failed');
      }));
      return;
    }
    
    // Static assets - Cache first
    if (isStaticAsset(url.pathname)) {
      event.respondWith(cacheFirst(event.request).catch(() => {
        // Fallback for cache/network failures
        return new Response('Static asset fetch failed');
      }));
      return;
    }
    
    // Default strategy - Cache first then network
    event.respondWith(cacheFirst(event.request).catch(() => {
      // Fallback
      return new Response('Resource not available');
    }));
  } catch (error) {
    console.error('[Service Worker] Fetch error:', error);
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  try {
    console.log('[Service Worker] Push Notification received', event);
    
    let data = { title: 'New Notification', body: 'Something new happened!' };
    
    if (event.data) {
      data = JSON.parse(event.data.text());
    }
    
    const options = {
      body: data.body,
      icon: '/logo192.png',
      badge: '/favicon.ico',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/'
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } catch (error) {
    console.error('[Service Worker] Push notification error:', error);
  }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  try {
    const notification = event.notification;
    const action = event.action;
    const url = notification.data?.url || '/';
    
    notification.close();
    
    event.waitUntil(
      clients.matchAll()
        .then(activeClients => {
          // If we have an active window, focus it
          if (activeClients.length > 0) {
            activeClients[0].navigate(url);
            activeClients[0].focus();
          } else {
            // Otherwise open a new window
            clients.openWindow(url);
          }
        })
    );
  } catch (error) {
    console.error('[Service Worker] Notification click error:', error);
  }
});