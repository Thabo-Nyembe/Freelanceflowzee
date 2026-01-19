/**
 * Custom Service Worker Extensions - FreeFlow A+++ Implementation
 * This file extends the next-pwa generated service worker with custom functionality
 * for background sync, push notifications, and offline capabilities
 */

/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

// ============ Background Sync Queue ============

interface QueuedRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string | null;
  timestamp: number;
  retries: number;
}

const SYNC_QUEUE_NAME = 'freeflow-sync-queue';
const MAX_RETRIES = 3;

// Store for queued requests
const syncQueue: Map<string, QueuedRequest> = new Map();

/**
 * Add a request to the sync queue
 */
async function addToSyncQueue(request: Request): Promise<void> {
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const body = request.method !== 'GET' ? await request.text() : null;

  syncQueue.set(id, {
    url: request.url,
    method: request.method,
    headers,
    body,
    timestamp: Date.now(),
    retries: 0,
  });

  // Trigger background sync if supported
  if ('sync' in self.registration) {
    await self.registration.sync.register(SYNC_QUEUE_NAME);
  }
}

/**
 * Process the sync queue
 */
async function processSyncQueue(): Promise<void> {
  for (const [id, queuedRequest] of syncQueue.entries()) {
    try {
      const response = await fetch(queuedRequest.url, {
        method: queuedRequest.method,
        headers: queuedRequest.headers,
        body: queuedRequest.body,
      });

      if (response.ok) {
        syncQueue.delete(id);
        notifyClients('SYNC_SUCCESS', { id, url: queuedRequest.url });
      } else if (response.status >= 500) {
        // Server error - retry later
        queuedRequest.retries++;
        if (queuedRequest.retries >= MAX_RETRIES) {
          syncQueue.delete(id);
          notifyClients('SYNC_FAILED', { id, url: queuedRequest.url, error: 'Max retries exceeded' });
        }
      } else {
        // Client error - don't retry
        syncQueue.delete(id);
        notifyClients('SYNC_FAILED', { id, url: queuedRequest.url, error: `HTTP ${response.status}` });
      }
    } catch (error) {
      queuedRequest.retries++;
      if (queuedRequest.retries >= MAX_RETRIES) {
        syncQueue.delete(id);
        notifyClients('SYNC_FAILED', { id, url: queuedRequest.url, error: String(error) });
      }
    }
  }
}

// ============ Background Sync Event ============

self.addEventListener('sync', (event: SyncEvent) => {
  if (event.tag === SYNC_QUEUE_NAME) {
    event.waitUntil(processSyncQueue());
  }
});

// ============ Push Notifications ============

self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return;

  let data: {
    title?: string;
    body?: string;
    icon?: string;
    badge?: string;
    tag?: string;
    url?: string;
    actions?: { action: string; title: string }[];
    requireInteraction?: boolean;
    data?: Record<string, unknown>;
  };

  try {
    data = event.data.json();
  } catch {
    data = { body: event.data.text() };
  }

  const options: NotificationOptions = {
    body: data.body || 'You have a new notification',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/badge-72x72.png',
    tag: data.tag || 'freeflow-notification',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      ...data.data,
    },
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'FreeFlow', options)
  );
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if a window is already open
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      return self.clients.openWindow(urlToOpen);
    })
  );
});

// ============ Periodic Sync ============

self.addEventListener('periodicsync', (event: PeriodicSyncEvent) => {
  if (event.tag === 'freeflow-periodic-sync') {
    event.waitUntil(performPeriodicSync());
  }
});

async function performPeriodicSync(): Promise<void> {
  // Process any pending sync queue items
  await processSyncQueue();

  // Notify clients to perform data refresh
  notifyClients('PERIODIC_SYNC', { timestamp: Date.now() });
}

// ============ Client Communication ============

async function notifyClients(type: string, payload: unknown): Promise<void> {
  const clients = await self.clients.matchAll({ includeUncontrolled: true });
  clients.forEach((client) => {
    client.postMessage({ type, payload });
  });
}

// ============ Message Handler ============

self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (!event.data) return;

  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'QUEUE_SYNC':
      if (event.data.request) {
        const { url, method, headers, body } = event.data.request;
        const request = new Request(url, { method, headers, body });
        event.waitUntil(addToSyncQueue(request));
      }
      break;

    case 'GET_SYNC_STATUS':
      event.ports?.[0]?.postMessage({
        queueSize: syncQueue.size,
        items: Array.from(syncQueue.entries()),
      });
      break;

    case 'CLEAR_SYNC_QUEUE':
      syncQueue.clear();
      break;

    case 'CACHE_URLS':
      if (event.data.urls && Array.isArray(event.data.urls)) {
        event.waitUntil(cacheUrls(event.data.urls));
      }
      break;

    case 'DELETE_CACHE':
      if (event.data.cacheName) {
        event.waitUntil(caches.delete(event.data.cacheName));
      }
      break;
  }
});

async function cacheUrls(urls: string[]): Promise<void> {
  const cache = await caches.open('freeflow-dynamic-v1');
  await cache.addAll(urls);
}

// ============ Fetch Handler for Offline Mutations ============

self.addEventListener('fetch', (event: FetchEvent) => {
  // Only handle API POST/PUT/DELETE/PATCH requests when offline
  if (
    event.request.url.includes('/api/') &&
    ['POST', 'PUT', 'DELETE', 'PATCH'].includes(event.request.method)
  ) {
    event.respondWith(handleMutation(event.request));
  }
});

async function handleMutation(request: Request): Promise<Response> {
  try {
    // Try online first
    const response = await fetch(request.clone());
    return response;
  } catch (error) {
    // If offline, queue for sync
    await addToSyncQueue(request.clone());

    // Return optimistic response
    return new Response(
      JSON.stringify({
        success: true,
        offline: true,
        message: 'Request queued for sync when online',
      }),
      {
        status: 202,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// ============ Types ============

interface SyncEvent extends ExtendableEvent {
  tag: string;
}

interface PeriodicSyncEvent extends ExtendableEvent {
  tag: string;
}

export {};
