/**
 * Offline Module Index - FreeFlow A+++ Implementation
 * Central export for all offline functionality
 */

// Sync Store - IndexedDB operations
export {
  FreeFlowOfflineDB,
  getOfflineDB,
  SyncQueueManager,
  getSyncQueueManager,
  EntityCacheManager,
  getEntityCacheManager,
  initializeOfflineDB,
  clearAllOfflineData,
  exportOfflineData,
} from './sync-store';

export type {
  SyncOperation,
  CachedEntity,
  SyncMetadata,
  OfflineConfig,
  ConflictLog,
} from './sync-store';

// Realtime Sync - Supabase integration
export {
  RealtimeSyncManager,
  getRealtimeSyncManager,
  initializeRealtimeSync,
  needsRefresh,
  getCachedOrFetch,
} from './realtime-sync';

export type {
  SyncConfig,
  SyncTableConfig,
  SyncResult,
  SyncStatus,
} from './realtime-sync';

// Re-export hooks for convenience
export {
  useNetworkStatus,
  useOfflineData,
  useServiceWorker,
  useOptimisticMutation,
  useOfflineQueueStatus,
  useSyncOnReconnect,
  usePrefetch,
  useCachedFetch,
} from '../hooks/use-offline-first';

export type {
  OfflineState,
  OfflineOptions,
  UseOfflineDataResult,
  MutationOptions,
} from '../hooks/use-offline-first';
