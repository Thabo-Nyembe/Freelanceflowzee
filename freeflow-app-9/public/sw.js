// FreeflowZee Service Worker - PWA Features
const CACHE_NAME = 'freeflowzee-v1'
const OFFLINE_CACHE = 'freeflowzee-offline-v1'

// Core app files to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/projects',
  '/payment',
  '/offline',
  '/manifest.json',
  '/_next/static/css/app/layout.css',
  // Add critical static assets here
]

// API routes that should be cached
const API_CACHE_PATTERNS = [
  '/api/projects',
  '/api/payments/create-intent-enhanced',
  '/api/storage',
]

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...')
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching core assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('✅ Service Worker installed successfully')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('❌ Service Worker install failed:', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== OFFLINE_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('✅ Service Worker activated successfully')
        return self.clients.claim()
      })
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) {
    return
  }

  // Handle different types of requests
  if (request.method === 'GET') {
    // Static assets - Cache First strategy
    if (isStaticAsset(url)) {
      event.respondWith(cacheFirstStrategy(request))
    }
    // API calls - Network First strategy
    else if (isAPICall(url)) {
      event.respondWith(networkFirstStrategy(request))
    }
    // Pages - Stale While Revalidate strategy
    else if (isPageRequest(url)) {
      event.respondWith(staleWhileRevalidateStrategy(request))
    }
    // Default - Network First
    else {
      event.respondWith(networkFirstStrategy(request))
    }
  }
  // POST requests - Network only with offline fallback
  else if (request.method === 'POST') {
    event.respondWith(networkOnlyWithFallback(request))
  }
})

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag)
  
  if (event.tag === 'payment-submission') {
    event.waitUntil(syncPaymentSubmissions())
  } else if (event.tag === 'project-update') {
    event.waitUntil(syncProjectUpdates())
  } else if (event.tag === 'file-upload') {
    event.waitUntil(syncFileUploads())
  }
})

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('📱 Push notification received')
  
  let notificationData = {}
  
  if (event.data) {
    try {
      notificationData = event.data.json()
    } catch (error) {
      notificationData = { title: 'FreeflowZee', body: event.data.text() }
    }
  }

  const options = {
    title: notificationData.title || 'FreeflowZee',
    body: notificationData.body || 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: notificationData.tag || 'general',
    data: notificationData,
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icons/view-icon.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    vibrate: [200, 100, 200],
    requireInteraction: true
  }

  event.waitUntil(
    self.registration.showNotification(options.title, options)
  )
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.action)
  
  event.notification.close()

  if (event.action === 'view') {
    const url = event.notification.data?.url || '/dashboard'
    event.waitUntil(
      clients.openWindow(url)
    )
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return
  } else {
    // Default action - open app
    event.waitUntil(
      clients.openWindow('/dashboard')
    )
  }
})

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  console.log('💬 Message received:', event.data)
  
  if (event.data.type === 'CACHE_CLEAR') {
    event.waitUntil(clearAllCaches())
  } else if (event.data.type === 'CACHE_UPDATE') {
    event.waitUntil(updateCache(event.data.urls))
  } else if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Caching Strategies
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    const networkResponse = await fetch(request)
    if (networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Cache first strategy failed:', error)
    return new Response('Offline - Asset not available', { status: 503 })
  }
}

async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Network failed, trying cache:', error)
    
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline')
    }
    
    return new Response('Offline - Content not available', { 
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    })
  }
}

async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(CACHE_NAME)
  const cachedResponse = await cache.match(request)
  
  // Fetch new version in background
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  }).catch((error) => {
    console.log('Background fetch failed:', error)
  })

  // Return cached version immediately, or wait for network if no cache
  return cachedResponse || fetchPromise
}

async function networkOnlyWithFallback(request) {
  try {
    return await fetch(request)
  } catch (error) {
    console.log('Network request failed, storing for sync:', error)
    
    // Store for background sync
    if (request.url.includes('/api/payments/')) {
      await storePaymentForSync(request)
    } else if (request.url.includes('/api/projects/')) {
      await storeProjectUpdateForSync(request)
    }
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Request stored for background sync',
      queued: true
    }), {
      status: 202,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Helper Functions
function isStaticAsset(url) {
  return url.pathname.includes('/_next/static/') ||
         url.pathname.includes('/icons/') ||
         url.pathname.includes('/images/') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.png') ||
         url.pathname.endsWith('.jpg') ||
         url.pathname.endsWith('.svg')
}

function isAPICall(url) {
  return url.pathname.startsWith('/api/')
}

function isPageRequest(url) {
  return url.pathname === '/' ||
         url.pathname.startsWith('/dashboard') ||
         url.pathname.startsWith('/projects') ||
         url.pathname.startsWith('/payment')
}

// Background Sync Functions
async function syncPaymentSubmissions() {
  console.log('🔄 Syncing payment submissions...')
  
  try {
    const db = await openIndexedDB()
    const payments = await getStoredPayments(db)
    
    for (const payment of payments) {
      try {
        const response = await fetch(payment.url, payment.request)
        if (response.ok) {
          await removeStoredPayment(db, payment.id)
          console.log('✅ Payment synced successfully')
        }
      } catch (error) {
        console.log('❌ Payment sync failed:', error)
      }
    }
  } catch (error) {
    console.log('❌ Payment sync error:', error)
  }
}

async function syncProjectUpdates() {
  console.log('🔄 Syncing project updates...')
  // Similar implementation for project updates
}

async function syncFileUploads() {
  console.log('🔄 Syncing file uploads...')
  // Similar implementation for file uploads
}

async function storePaymentForSync(request) {
  const db = await openIndexedDB()
  const transaction = db.transaction(['payments'], 'readwrite')
  const store = transaction.objectStore('payments')
  
  const paymentData = {
    id: Date.now(),
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: await request.text(),
    timestamp: new Date().toISOString()
  }
  
  await store.add(paymentData)
}

async function storeProjectUpdateForSync(request) {
  // Similar implementation for project updates
}

async function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FreeflowZeeDB', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      
      if (!db.objectStoreNames.contains('payments')) {
        db.createObjectStore('payments', { keyPath: 'id' })
      }
      
      if (!db.objectStoreNames.contains('projects')) {
        db.createObjectStore('projects', { keyPath: 'id' })
      }
      
      if (!db.objectStoreNames.contains('files')) {
        db.createObjectStore('files', { keyPath: 'id' })
      }
    }
  })
}

async function getStoredPayments(db) {
  const transaction = db.transaction(['payments'], 'readonly')
  const store = transaction.objectStore('payments')
  return new Promise((resolve, reject) => {
    const request = store.getAll()
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

async function removeStoredPayment(db, id) {
  const transaction = db.transaction(['payments'], 'readwrite')
  const store = transaction.objectStore('payments')
  return new Promise((resolve, reject) => {
    const request = store.delete(id)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

async function clearAllCaches() {
  const cacheNames = await caches.keys()
  await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)))
  console.log('🗑️ All caches cleared')
}

async function updateCache(urls) {
  const cache = await caches.open(CACHE_NAME)
  await Promise.all(urls.map(url => cache.add(url)))
  console.log('📦 Cache updated with new URLs')
}

console.log('🚀 FreeflowZee Service Worker loaded successfully') 