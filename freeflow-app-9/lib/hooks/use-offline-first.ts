/**
 * Offline-First React Hooks - FreeFlow A+++ Implementation
 * Hooks for managing offline data with optimistic updates and sync
 */

'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { toast } from 'sonner';

// ============ Types ============

export interface OfflineState {
  isOnline: boolean;
  isInitialized: boolean;
  pendingChanges: number;
  lastSyncAt: number | null;
  isSyncing: boolean;
}

export interface OfflineOptions<T> {
  table: string;
  initialData?: T[];
  fetchFn?: () => Promise<T[]>;
  staleTime?: number; // milliseconds
  enableRealtime?: boolean;
  onSync?: (results: T[]) => void;
  onError?: (error: Error) => void;
  onOffline?: () => void;
  onOnline?: () => void;
}

export interface UseOfflineDataResult<T> {
  data: T[];
  isLoading: boolean;
  isStale: boolean;
  error: Error | null;
  create: (item: Partial<T>) => Promise<T>;
  update: (id: string, updates: Partial<T>) => Promise<T>;
  remove: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  sync: () => Promise<void>;
}

export interface MutationOptions<T> {
  optimistic?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

// ============ Network Status Hook ============

export function useNetworkStatus(): OfflineState {
  const [state, setState] = useState<OfflineState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isInitialized: false,
    pendingChanges: 0,
    lastSyncAt: null,
    isSyncing: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setState((prev) => ({ ...prev, isOnline: true }));
      toast.success('Back online! Syncing changes...');
    };

    const handleOffline = () => {
      setState((prev) => ({ ...prev, isOnline: false }));
      toast.warning('You are offline. Changes will sync when connected.');
    };

    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_SUCCESS') {
        setState((prev) => ({
          ...prev,
          pendingChanges: Math.max(0, prev.pendingChanges - 1),
        }));
      } else if (event.data?.type === 'SYNC_FAILED') {
        toast.error(`Failed to sync: ${event.data.payload?.error}`);
      } else if (event.data?.type === 'PERIODIC_SYNC') {
        setState((prev) => ({ ...prev, lastSyncAt: Date.now() }));
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage);

    setState((prev) => ({ ...prev, isInitialized: true }));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      navigator.serviceWorker?.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, []);

  return state;
}

// ============ Offline Data Hook ============

export function useOfflineData<T extends { id: string }>(
  options: OfflineOptions<T>
): UseOfflineDataResult<T> {
  const {
    table,
    initialData = [],
    fetchFn,
    staleTime = 5 * 60 * 1000, // 5 minutes default
    onSync,
    onError,
    onOffline,
    onOnline,
  } = options;

  const [data, setData] = useState<T[]>(initialData);
  const [isLoading, setIsLoading] = useState(!initialData.length);
  const [isStale, setIsStale] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const networkStatus = useNetworkStatus();
  const lastFetchRef = useRef<number>(0);
  const cacheManagerRef = useRef<unknown>(null);
  const syncManagerRef = useRef<unknown>(null);

  // Initialize cache and sync managers
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initManagers = async () => {
      try {
        const { getEntityCacheManager, getSyncQueueManager } = await import('../offline/sync-store');
        cacheManagerRef.current = getEntityCacheManager();
        syncManagerRef.current = getSyncQueueManager();

        // Load from cache first
        const cacheManager = cacheManagerRef.current as {
          getAll: <U>(table: string) => Promise<U[]>;
          isDataStale: (table: string, staleTime: number) => Promise<boolean>;
        };
        const cachedData = await cacheManager.getAll<T>(table);
        if (cachedData.length > 0) {
          setData(cachedData);
          setIsLoading(false);
        }

        // Check if data is stale
        const stale = await cacheManager.isDataStale(table, staleTime);
        setIsStale(stale);

        // Fetch fresh data if online and stale
        if (networkStatus.isOnline && stale && fetchFn) {
          await refresh();
        }
      } catch (err) {
        console.error('Failed to initialize offline managers:', err);
        // Fall back to fetch if cache fails
        if (fetchFn && networkStatus.isOnline) {
          await refresh();
        }
      }
    };

    initManagers();
  }, [table, networkStatus.isOnline]);

  // Handle online/offline transitions
  useEffect(() => {
    if (networkStatus.isOnline) {
      onOnline?.();
      // Sync pending changes when coming online
      sync();
    } else {
      onOffline?.();
    }
  }, [networkStatus.isOnline]);

  // Refresh data from server
  const refresh = useCallback(async (): Promise<void> => {
    if (!fetchFn) return;

    setIsLoading(true);
    setError(null);

    try {
      const freshData = await fetchFn();
      setData(freshData);
      lastFetchRef.current = Date.now();
      setIsStale(false);

      // Save to cache
      if (cacheManagerRef.current) {
        const cacheManager = cacheManagerRef.current as {
          bulkSave: <U>(table: string, items: U[], sync: boolean) => Promise<void>;
        };
        await cacheManager.bulkSave(table, freshData, false);
      }

      onSync?.(freshData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);

      // Load from cache on error
      if (cacheManagerRef.current) {
        const cacheManager = cacheManagerRef.current as {
          getAll: <U>(table: string) => Promise<U[]>;
        };
        const cachedData = await cacheManager.getAll<T>(table);
        if (cachedData.length > 0) {
          setData(cachedData);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, table, onSync, onError]);

  // Create new item (optimistic update)
  const create = useCallback(
    async (item: Partial<T>): Promise<T> => {
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newItem = { ...item, id: tempId } as T;

      // Optimistic update
      setData((prev) => [...prev, newItem]);

      try {
        if (cacheManagerRef.current) {
          const cacheManager = cacheManagerRef.current as {
            save: <U>(table: string, data: U, options?: { sync?: boolean; type?: string }) => Promise<U>;
          };
          const savedItem = await cacheManager.save(table, newItem, { sync: true, type: 'create' });

          // Update with real ID if available
          setData((prev) =>
            prev.map((i) => (i.id === tempId ? savedItem : i))
          );

          toast.success('Item created');
          return savedItem;
        }

        return newItem;
      } catch (err) {
        // Rollback on error
        setData((prev) => prev.filter((i) => i.id !== tempId));
        const error = err instanceof Error ? err : new Error(String(err));
        toast.error(`Failed to create: ${error.message}`);
        throw error;
      }
    },
    [table]
  );

  // Update existing item (optimistic update)
  const update = useCallback(
    async (id: string, updates: Partial<T>): Promise<T> => {
      // Store previous value for rollback
      const previousData = data.find((i) => i.id === id);
      if (!previousData) {
        throw new Error(`Item with id ${id} not found`);
      }

      const updatedItem = { ...previousData, ...updates } as T;

      // Optimistic update
      setData((prev) =>
        prev.map((i) => (i.id === id ? updatedItem : i))
      );

      try {
        if (cacheManagerRef.current) {
          const cacheManager = cacheManagerRef.current as {
            save: <U>(table: string, data: U, options?: { sync?: boolean; type?: string }) => Promise<U>;
          };
          await cacheManager.save(table, updatedItem, { sync: true, type: 'update' });
        }

        toast.success('Item updated');
        return updatedItem;
      } catch (err) {
        // Rollback on error
        setData((prev) =>
          prev.map((i) => (i.id === id ? previousData : i))
        );
        const error = err instanceof Error ? err : new Error(String(err));
        toast.error(`Failed to update: ${error.message}`);
        throw error;
      }
    },
    [table, data]
  );

  // Remove item (optimistic update)
  const remove = useCallback(
    async (id: string): Promise<void> => {
      // Store for rollback
      const previousItem = data.find((i) => i.id === id);
      if (!previousItem) return;

      // Optimistic update
      setData((prev) => prev.filter((i) => i.id !== id));

      try {
        if (cacheManagerRef.current) {
          const cacheManager = cacheManagerRef.current as {
            delete: (table: string, id: string, sync?: boolean) => Promise<void>;
          };
          await cacheManager.delete(table, id, true);
        }

        toast.success('Item deleted');
      } catch (err) {
        // Rollback on error
        setData((prev) => [...prev, previousItem]);
        const error = err instanceof Error ? err : new Error(String(err));
        toast.error(`Failed to delete: ${error.message}`);
        throw error;
      }
    },
    [table, data]
  );

  // Manual sync
  const sync = useCallback(async (): Promise<void> => {
    if (!networkStatus.isOnline) {
      toast.info('Cannot sync while offline');
      return;
    }

    try {
      if (syncManagerRef.current) {
        const syncManager = syncManagerRef.current as {
          processQueue: () => Promise<void>;
        };
        await syncManager.processQueue();
      }
      await refresh();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      onError?.(error);
    }
  }, [networkStatus.isOnline, refresh, onError]);

  return {
    data,
    isLoading,
    isStale,
    error,
    create,
    update,
    remove,
    refresh,
    sync,
  };
}

// ============ Service Worker Communication Hook ============

export function useServiceWorker() {
  const [isReady, setIsReady] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const checkServiceWorker = async () => {
      const registration = await navigator.serviceWorker.ready;
      setIsReady(true);

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
              toast.info('A new version is available!', {
                action: {
                  label: 'Update',
                  onClick: () => {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  },
                },
              });
            }
          });
        }
      });
    };

    checkServiceWorker();
  }, []);

  const postMessage = useCallback((type: string, payload?: unknown) => {
    navigator.serviceWorker.controller?.postMessage({ type, payload });
  }, []);

  const skipWaiting = useCallback(() => {
    postMessage('SKIP_WAITING');
    window.location.reload();
  }, [postMessage]);

  const cacheUrls = useCallback((urls: string[]) => {
    postMessage('CACHE_URLS', { urls });
  }, [postMessage]);

  return {
    isReady,
    updateAvailable,
    postMessage,
    skipWaiting,
    cacheUrls,
  };
}

// ============ Optimistic Mutation Hook ============

export function useOptimisticMutation<T, R = T>(
  mutationFn: (data: T) => Promise<R>,
  options?: {
    onMutate?: (data: T) => void;
    onSuccess?: (result: R, data: T) => void;
    onError?: (error: Error, data: T) => void;
    onSettled?: () => void;
  }
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (data: T): Promise<R> => {
      setIsLoading(true);
      setError(null);

      options?.onMutate?.(data);

      try {
        const result = await mutationFn(data);
        options?.onSuccess?.(result, data);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        options?.onError?.(error, data);
        throw error;
      } finally {
        setIsLoading(false);
        options?.onSettled?.();
      }
    },
    [mutationFn, options]
  );

  return { mutate, isLoading, error };
}

// ============ Offline Queue Status Hook ============

export function useOfflineQueueStatus() {
  const [status, setStatus] = useState({
    pending: 0,
    syncing: 0,
    failed: 0,
    synced: 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateStatus = async () => {
      try {
        const { getSyncQueueManager } = await import('../offline/sync-store');
        const manager = getSyncQueueManager();
        const queueStatus = await manager.getQueueStatus();
        setStatus(queueStatus);
      } catch (err) {
        console.error('Failed to get queue status:', err);
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  return status;
}

// ============ Sync On Reconnect Hook ============

export function useSyncOnReconnect(syncFn: () => Promise<void>) {
  const networkStatus = useNetworkStatus();
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    if (!networkStatus.isOnline) {
      wasOfflineRef.current = true;
      return;
    }

    if (wasOfflineRef.current && networkStatus.isOnline) {
      wasOfflineRef.current = false;
      syncFn().catch(console.error);
    }
  }, [networkStatus.isOnline, syncFn]);
}

// ============ Prefetch Hook ============

export function usePrefetch() {
  const { cacheUrls } = useServiceWorker();

  const prefetch = useCallback(
    (urls: string[]) => {
      // Prefetch using service worker
      cacheUrls(urls);

      // Also prefetch using link tags for immediate use
      urls.forEach((url) => {
        if (typeof document !== 'undefined') {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = url;
          document.head.appendChild(link);
        }
      });
    },
    [cacheUrls]
  );

  return prefetch;
}

// ============ Cached Fetch Hook ============

export function useCachedFetch<T>(
  url: string,
  options?: {
    staleTime?: number;
    cacheKey?: string;
    enabled?: boolean;
  }
) {
  const {
    staleTime = 5 * 60 * 1000,
    cacheKey = url,
    enabled = true,
  } = options || {};

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const networkStatus = useNetworkStatus();

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      // Try cache first
      const cache = await caches.open('freeflow-api-v1');
      const cachedResponse = await cache.match(url);

      if (cachedResponse) {
        const cachedData = await cachedResponse.json();
        const cacheTime = cachedResponse.headers.get('x-cache-time');
        const isStale = cacheTime
          ? Date.now() - parseInt(cacheTime) > staleTime
          : true;

        setData(cachedData);

        if (!isStale || !networkStatus.isOnline) {
          setIsLoading(false);
          return;
        }
      }

      if (!networkStatus.isOnline) {
        setIsLoading(false);
        return;
      }

      // Fetch fresh data
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const freshData = await response.json();
      setData(freshData);

      // Cache the response
      const responseToCache = new Response(JSON.stringify(freshData), {
        headers: {
          'Content-Type': 'application/json',
          'x-cache-time': Date.now().toString(),
        },
      });
      await cache.put(url, responseToCache);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [url, staleTime, enabled, networkStatus.isOnline]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
