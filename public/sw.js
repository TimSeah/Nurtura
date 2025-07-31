// Service Worker for Offline Support and Caching
// Provides offline functionality and background sync

const CACHE_NAME = 'nurtura-v1';
const STATIC_CACHE_NAME = 'nurtura-static-v1';
const DYNAMIC_CACHE_NAME = 'nurtura-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/images/icons/icon-192x192.png',
  '/images/icons/icon-512x512.png',
  '/offline.html'
];

// API endpoints to cache with network-first strategy
const API_CACHE_PATTERNS = [
  '/api/care-recipients',
  '/api/alerts',
  '/api/events',
  '/api/users/profile'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Failed to cache static assets', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME && 
                cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activation completed');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Handle other requests with cache-first strategy
  event.respondWith(handleStaticRequest(request));
});

// Network-first strategy for API requests
async function handleApiRequest(request) {
  const cacheName = DYNAMIC_CACHE_NAME;
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache', request.url);
    
    // Fall back to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for specific endpoints
    return createOfflineApiResponse(request);
  }
}

// Cache-first strategy for static assets
async function handleStaticRequest(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Try network and cache the response
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Request failed', request.url);
    
    // Return fallback for images
    if (request.destination === 'image') {
      return new Response(
        '<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#f0f0f0"/><text x="100" y="100" text-anchor="middle" dy=".3em" fill="#ccc">Image unavailable</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    
    throw error;
  }
}

// Navigation request handler
async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Navigation failed, serving offline page');
    
    const offlineResponse = await caches.match('/offline.html');
    return offlineResponse || new Response('App is offline', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Create offline API responses
function createOfflineApiResponse(request) {
  const url = new URL(request.url);
  
  // Return appropriate offline responses based on endpoint
  if (url.pathname.includes('/care-recipients')) {
    return new Response(JSON.stringify({
      isSuccess: false,
      error: 'Network unavailable. Please check your connection.',
      offline: true
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (url.pathname.includes('/alerts')) {
    return new Response(JSON.stringify({
      isSuccess: false,
      error: 'Unable to fetch alerts offline.',
      offline: true
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({
    isSuccess: false,
    error: 'Service unavailable offline.',
    offline: true
  }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'sync-care-data') {
    event.waitUntil(syncCareData());
  }
  
  if (event.tag === 'sync-alerts') {
    event.waitUntil(syncAlerts());
  }
});

// Sync care recipient data when back online
async function syncCareData() {
  try {
    console.log('Service Worker: Syncing care data');
    
    // Get pending sync data from IndexedDB
    const pendingData = await getPendingSyncData('care-data');
    
    for (const data of pendingData) {
      try {
        const response = await fetch(data.url, {
          method: data.method,
          headers: data.headers,
          body: data.body
        });
        
        if (response.ok) {
          // Remove from pending sync
          await removePendingSyncData('care-data', data.id);
          console.log('Service Worker: Synced care data successfully', data.id);
        }
      } catch (error) {
        console.error('Service Worker: Failed to sync care data', data.id, error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Background sync failed', error);
  }
}

// Sync alerts when back online
async function syncAlerts() {
  try {
    console.log('Service Worker: Syncing alerts');
    
    const pendingAlerts = await getPendingSyncData('alerts');
    
    for (const alert of pendingAlerts) {
      try {
        const response = await fetch('/api/alerts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...alert.headers
          },
          body: JSON.stringify(alert.data)
        });
        
        if (response.ok) {
          await removePendingSyncData('alerts', alert.id);
          console.log('Service Worker: Synced alert successfully', alert.id);
        }
      } catch (error) {
        console.error('Service Worker: Failed to sync alert', alert.id, error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Alert sync failed', error);
  }
}

// Helper functions for IndexedDB operations
async function getPendingSyncData(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('nurtura-sync-db', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => resolve(getAllRequest.result || []);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id' });
      }
    };
  });
}

async function removePendingSyncData(storeName, id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('nurtura-sync-db', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  let data = {};
  if (event.data) {
    data = event.data.json();
  }
  
  const options = {
    body: data.body || 'New notification from Nurtura',
    icon: '/images/icons/icon-192x192.png',
    badge: '/images/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/images/icons/view-icon.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/images/icons/close-icon.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Nurtura', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'view') {
    // Open the app and navigate to relevant page
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
  
  // Default action - open the app
  if (!event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
