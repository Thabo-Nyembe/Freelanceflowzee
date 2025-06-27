// FreeflowZee Service Worker - PWA Features
const CACHE_NAME = &apos;freeflowzee-v1&apos;
const OFFLINE_CACHE = &apos;freeflowzee-offline-v1&apos;

// Core app files to cache for offline functionality
const STATIC_ASSETS = [
  &apos;/','
  &apos;/dashboard&apos;,
  &apos;/projects&apos;,
  &apos;/payment&apos;,
  &apos;/offline&apos;,
  &apos;/manifest.json&apos;,
  &apos;/_next/static/css/app/layout.css&apos;,
  // Add critical static assets here
]

// API routes that should be cached
const API_CACHE_PATTERNS = [
  &apos;/api/projects&apos;,
  &apos;/api/payments/create-intent-enhanced&apos;,
  &apos;/api/storage&apos;,
]

// Install event - cache core assets
self.addEventListener(&apos;install&apos;, (event) => {
  console.log(&apos;🔧 Service Worker installing...&apos;)
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log(&apos;📦 Caching core assets&apos;)
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log(&apos;✅ Service Worker installed successfully&apos;)
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error(&apos;❌ Service Worker install failed:&apos;, error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener(&apos;activate&apos;, (event) => {
  console.log(&apos;🚀 Service Worker activating...&apos;)
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== OFFLINE_CACHE) {
              console.log(&apos;🗑️ Deleting old cache:&apos;, cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log(&apos;✅ Service Worker activated successfully&apos;)
        return self.clients.claim()
      })
  )
})

// Fetch event - implement caching strategies
self.addEventListener(&apos;fetch&apos;, (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-HTTP requests
  if (!request.url.startsWith(&apos;http&apos;)) {
    return
  }

  // Handle different types of requests
  if (request.method === &apos;GET&apos;) {
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
  else if (request.method === &apos;POST&apos;) {
    event.respondWith(networkOnlyWithFallback(request))
  }
})

// Background sync for offline form submissions
self.addEventListener(&apos;sync&apos;, (event) => {
  console.log(&apos;🔄 Background sync triggered:&apos;, event.tag)
  
  if (event.tag === &apos;payment-submission&apos;) {
    event.waitUntil(syncPaymentSubmissions())
  } else if (event.tag === &apos;project-update&apos;) {
    event.waitUntil(syncProjectUpdates())
  } else if (event.tag === &apos;file-upload&apos;) {
    event.waitUntil(syncFileUploads())
  }
})

// Push notification handling
self.addEventListener(&apos;push&apos;, (event) => {
  console.log(&apos;📱 Push notification received&apos;)
  
  let notificationData = {}
  
  if (event.data) {
    try {
      notificationData = event.data.json()
    } catch (error) {
      notificationData = { title: &apos;FreeflowZee&apos;, body: event.data.text() }
    }
  }

  const options = {
    title: notificationData.title || &apos;FreeflowZee&apos;,
    body: notificationData.body || &apos;You have a new notification&apos;,
    icon: &apos;/icons/icon-192x192.png&apos;,
    badge: &apos;/icons/badge-72x72.png&apos;,
    tag: notificationData.tag || &apos;general&apos;,
    data: notificationData,
    actions: [
      {
        action: &apos;view&apos;,
        title: &apos;View&apos;,
        icon: &apos;/icons/view-icon.png&apos;
      },
      {
        action: &apos;dismiss&apos;,
        title: &apos;Dismiss&apos;
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
self.addEventListener(&apos;notificationclick&apos;, (event) => {
  console.log(&apos;🔔 Notification clicked:&apos;, event.action)
  
  event.notification.close()

  if (event.action === &apos;view&apos;) {
    const url = event.notification.data?.url || &apos;/dashboard&apos;
    event.waitUntil(
      clients.openWindow(url)
    )
  } else if (event.action === &apos;dismiss&apos;) {
    // Just close the notification
    return
  } else {
    // Default action - open app
    event.waitUntil(
      clients.openWindow(&apos;/dashboard&apos;)
    )
  }
})

// Message handling for communication with main thread
self.addEventListener(&apos;message&apos;, (event) => {
  console.log(&apos;💬 Message received:&apos;, event.data)
  
  if (event.data.type === &apos;CACHE_CLEAR&apos;) {
    event.waitUntil(clearAllCaches())
  } else if (event.data.type === &apos;CACHE_UPDATE&apos;) {
    event.waitUntil(updateCache(event.data.urls))
  } else if (event.data.type === &apos;SKIP_WAITING&apos;) {
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
    console.log(&apos;Cache first strategy failed:&apos;, error)
    return new Response(&apos;Offline - Asset not available&apos;, { status: 503 })
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
    console.log(&apos;Network failed, trying cache:&apos;, error)
    
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline page for navigation requests
    if (request.mode === &apos;navigate&apos;) {
      return caches.match(&apos;/offline&apos;)
    }
    
    return new Response(&apos;Offline - Content not available&apos;, { 
      status: 503,
      headers: { &apos;Content-Type&apos;: &apos;text/plain&apos; }
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
    console.log(&apos;Background fetch failed:&apos;, error)
  })

  // Return cached version immediately, or wait for network if no cache
  return cachedResponse || fetchPromise
}

async function networkOnlyWithFallback(request) {
  try {
    return await fetch(request)
  } catch (error) {
    console.log(&apos;Network request failed, storing for sync:&apos;, error)
    
    // Store for background sync
    if (request.url.includes(&apos;/api/payments/&apos;)) {
      await storePaymentForSync(request)
    } else if (request.url.includes(&apos;/api/projects/&apos;)) {
      await storeProjectUpdateForSync(request)
    }
    
    return new Response(JSON.stringify({
      success: false,
      error: &apos;Request stored for background sync&apos;,
      queued: true
    }), {
      status: 202,
      headers: { &apos;Content-Type&apos;: &apos;application/json&apos; }
    })
  }
}

// Helper Functions
function isStaticAsset(url) {
  return url.pathname.includes(&apos;/_next/static/&apos;) ||
         url.pathname.includes(&apos;/icons/&apos;) ||
         url.pathname.includes(&apos;/images/&apos;) ||
         url.pathname.endsWith(&apos;.css&apos;) ||
         url.pathname.endsWith(&apos;.js&apos;) ||
         url.pathname.endsWith(&apos;.png&apos;) ||
         url.pathname.endsWith(&apos;.jpg&apos;) ||
         url.pathname.endsWith(&apos;.svg&apos;)
}

function isAPICall(url) {
  return url.pathname.startsWith(&apos;/api/&apos;)
}

function isPageRequest(url) {
  return url.pathname === &apos;/' ||'
         url.pathname.startsWith(&apos;/dashboard&apos;) ||
         url.pathname.startsWith(&apos;/projects&apos;) ||
         url.pathname.startsWith(&apos;/payment&apos;)
}

// Background Sync Functions
async function syncPaymentSubmissions() {
  console.log(&apos;🔄 Syncing payment submissions...&apos;)
  
  try {
    const db = await openIndexedDB()
    const payments = await getStoredPayments(db)
    
    for (const payment of payments) {
      try {
        const response = await fetch(payment.url, payment.request)
        if (response.ok) {
          await removeStoredPayment(db, payment.id)
          console.log(&apos;✅ Payment synced successfully&apos;)
        }
      } catch (error) {
        console.log(&apos;❌ Payment sync failed:&apos;, error)
      }
    }
  } catch (error) {
    console.log(&apos;❌ Payment sync error:&apos;, error)
  }
}

async function syncProjectUpdates() {
  console.log(&apos;🔄 Syncing project updates...&apos;)
  // Similar implementation for project updates
}

async function syncFileUploads() {
  console.log(&apos;🔄 Syncing file uploads...&apos;)
  // Similar implementation for file uploads
}

async function storePaymentForSync(request) {
  const db = await openIndexedDB()
  const transaction = db.transaction([&apos;payments&apos;], &apos;readwrite&apos;)
  const store = transaction.objectStore(&apos;payments&apos;)
  
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
    const request = indexedDB.open(&apos;FreeflowZeeDB&apos;, 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      
      if (!db.objectStoreNames.contains(&apos;payments&apos;)) {
        db.createObjectStore(&apos;payments&apos;, { keyPath: &apos;id&apos; })
      }
      
      if (!db.objectStoreNames.contains(&apos;projects&apos;)) {
        db.createObjectStore(&apos;projects&apos;, { keyPath: &apos;id&apos; })
      }
      
      if (!db.objectStoreNames.contains(&apos;files&apos;)) {
        db.createObjectStore(&apos;files&apos;, { keyPath: &apos;id&apos; })
      }
    }
  })
}

async function getStoredPayments(db) {
  const transaction = db.transaction([&apos;payments&apos;], &apos;readonly&apos;)
  const store = transaction.objectStore(&apos;payments&apos;)
  return new Promise((resolve, reject) => {
    const request = store.getAll()
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

async function removeStoredPayment(db, id) {
  const transaction = db.transaction([&apos;payments&apos;], &apos;readwrite&apos;)
  const store = transaction.objectStore(&apos;payments&apos;)
  return new Promise((resolve, reject) => {
    const request = store.delete(id)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

async function clearAllCaches() {
  const cacheNames = await caches.keys()
  await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)))
  console.log(&apos;🗑️ All caches cleared&apos;)
}

async function updateCache(urls) {
  const cache = await caches.open(CACHE_NAME)
  await Promise.all(urls.map(url => cache.add(url)))
  console.log(&apos;📦 Cache updated with new URLs&apos;)
}

console.log(&apos;🚀 FreeflowZee Service Worker loaded successfully&apos;) 