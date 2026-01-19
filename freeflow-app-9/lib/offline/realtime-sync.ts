/**
 * Realtime Sync Manager - FreeFlow A+++ Implementation
 * Handles bidirectional sync between IndexedDB and Supabase
 * Features: Incremental sync, realtime subscriptions, conflict detection
 */

import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import {
  getEntityCacheManager,
  getSyncQueueManager,
  getOfflineDB,
  SyncMetadata
} from './sync-store';

// ============ Types ============

export interface SyncConfig {
  tables: SyncTableConfig[];
  batchSize: number;
  syncInterval: number; // milliseconds
  enableRealtime: boolean;
}

export interface SyncTableConfig {
  name: string;
  primaryKey: string;
  timestampColumn: string;
  userIdColumn?: string;
  softDelete?: boolean;
  deleteColumn?: string;
}

export interface SyncResult {
  table: string;
  created: number;
  updated: number;
  deleted: number;
  conflicts: number;
  duration: number;
  error?: string;
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncAt: number | null;
  pendingChanges: number;
  tables: Record<string, SyncMetadata>;
}

// ============ Default Configuration ============

const DEFAULT_SYNC_CONFIG: SyncConfig = {
  tables: [
    { name: 'projects', primaryKey: 'id', timestampColumn: 'updated_at', userIdColumn: 'user_id' },
    { name: 'tasks', primaryKey: 'id', timestampColumn: 'updated_at', userIdColumn: 'user_id' },
    { name: 'invoices', primaryKey: 'id', timestampColumn: 'updated_at', userIdColumn: 'user_id' },
    { name: 'clients', primaryKey: 'id', timestampColumn: 'updated_at', userIdColumn: 'user_id' },
    { name: 'files', primaryKey: 'id', timestampColumn: 'updated_at', userIdColumn: 'user_id' },
    { name: 'messages', primaryKey: 'id', timestampColumn: 'created_at', userIdColumn: 'user_id' },
    { name: 'calendar_events', primaryKey: 'id', timestampColumn: 'updated_at', userIdColumn: 'user_id' },
    { name: 'time_entries', primaryKey: 'id', timestampColumn: 'updated_at', userIdColumn: 'user_id' },
    { name: 'transactions', primaryKey: 'id', timestampColumn: 'updated_at', userIdColumn: 'user_id' },
    { name: 'notes', primaryKey: 'id', timestampColumn: 'updated_at', userIdColumn: 'user_id' },
  ],
  batchSize: 100,
  syncInterval: 30000, // 30 seconds
  enableRealtime: true,
};

// ============ Realtime Sync Manager ============

export class RealtimeSyncManager {
  private supabase: SupabaseClient;
  private config: SyncConfig;
  private cacheManager = getEntityCacheManager();
  private syncQueueManager = getSyncQueueManager();
  private db = getOfflineDB();
  private channels: Map<string, RealtimeChannel> = new Map();
  private isSyncing = false;
  private syncIntervalId: NodeJS.Timeout | null = null;
  private userId: string | null = null;
  private eventListeners: Map<string, Set<(event: unknown) => void>> = new Map();

  constructor(supabaseUrl: string, supabaseKey: string, config?: Partial<SyncConfig>) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.config = { ...DEFAULT_SYNC_CONFIG, ...config };
  }

  /**
   * Initialize sync manager
   */
  async initialize(userId: string): Promise<void> {
    this.userId = userId;

    // Set up online/offline listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }

    // Start periodic sync
    this.startPeriodicSync();

    // Set up realtime subscriptions
    if (this.config.enableRealtime) {
      await this.setupRealtimeSubscriptions();
    }

    // Initial sync
    if (navigator.onLine) {
      await this.fullSync();
    }
  }

  /**
   * Clean up resources
   */
  async destroy(): Promise<void> {
    this.stopPeriodicSync();

    // Unsubscribe from all channels
    for (const [, channel] of this.channels) {
      await channel.unsubscribe();
    }
    this.channels.clear();

    // Remove event listeners
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
  }

  /**
   * Full sync - sync all tables
   */
  async fullSync(): Promise<SyncResult[]> {
    if (this.isSyncing || !navigator.onLine) return [];

    this.isSyncing = true;
    this.emit('syncStart', { tables: this.config.tables.map(t => t.name) });

    const results: SyncResult[] = [];

    try {
      // First, push local changes
      await this.syncQueueManager.processQueue();

      // Then, pull remote changes for each table
      for (const tableConfig of this.config.tables) {
        const result = await this.syncTable(tableConfig);
        results.push(result);
      }

      this.emit('syncComplete', { results });
    } catch (error) {
      this.emit('syncError', { error });
    } finally {
      this.isSyncing = false;
    }

    return results;
  }

  /**
   * Sync a single table
   */
  async syncTable(tableConfig: SyncTableConfig): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      table: tableConfig.name,
      created: 0,
      updated: 0,
      deleted: 0,
      conflicts: 0,
      duration: 0,
    };

    try {
      // Get last sync timestamp
      const metadata = await this.cacheManager.getSyncMetadata(tableConfig.name);
      const lastSyncedAt = metadata?.lastSyncedAt || 0;

      // Build query
      let query = this.supabase
        .from(tableConfig.name)
        .select('*')
        .order(tableConfig.timestampColumn, { ascending: true })
        .limit(this.config.batchSize);

      // Filter by user if applicable
      if (tableConfig.userIdColumn && this.userId) {
        query = query.eq(tableConfig.userIdColumn, this.userId);
      }

      // Incremental sync - only get records updated since last sync
      if (lastSyncedAt > 0) {
        const lastSyncDate = new Date(lastSyncedAt).toISOString();
        query = query.gt(tableConfig.timestampColumn, lastSyncDate);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        // Process each record
        for (const record of data) {
          const existingEntity = await this.cacheManager.get(tableConfig.name, record[tableConfig.primaryKey]);

          if (existingEntity) {
            // Check for conflicts
            const localVersion = (existingEntity as Record<string, unknown>).version as number || 0;
            const serverVersion = record.version || 0;

            if (localVersion > serverVersion) {
              result.conflicts++;
              continue;
            }

            result.updated++;
          } else {
            result.created++;
          }

          // Save to local cache
          await this.cacheManager.save(tableConfig.name, record, { sync: false });
        }

        // Update sync metadata
        await this.db.syncMetadata.put({
          table: tableConfig.name,
          lastSyncedAt: Date.now(),
          totalRecords: data.length,
        });
      }

    } catch (error) {
      const err = error as Error;
      result.error = err.message;
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  /**
   * Set up realtime subscriptions
   */
  private async setupRealtimeSubscriptions(): Promise<void> {
    for (const tableConfig of this.config.tables) {
      await this.subscribeToTable(tableConfig);
    }
  }

  /**
   * Subscribe to a table for realtime updates
   */
  private async subscribeToTable(tableConfig: SyncTableConfig): Promise<void> {
    const channel = this.supabase
      .channel(`${tableConfig.name}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableConfig.name,
          filter: tableConfig.userIdColumn && this.userId
            ? `${tableConfig.userIdColumn}=eq.${this.userId}`
            : undefined,
        },
        async (payload) => {
          await this.handleRealtimeChange(tableConfig.name, payload);
        }
      )
      .subscribe();

    this.channels.set(tableConfig.name, channel);
  }

  /**
   * Handle realtime change event
   */
  private async handleRealtimeChange(
    table: string,
    payload: { eventType: string; new: Record<string, unknown>; old: Record<string, unknown> }
  ): Promise<void> {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    switch (eventType) {
      case 'INSERT':
        await this.cacheManager.save(table, newRecord, { sync: false, type: 'create' });
        this.emit('recordCreated', { table, record: newRecord });
        break;

      case 'UPDATE':
        await this.cacheManager.save(table, newRecord, { sync: false, type: 'update' });
        this.emit('recordUpdated', { table, record: newRecord, previous: oldRecord });
        break;

      case 'DELETE':
        const id = oldRecord.id as string;
        await this.cacheManager.delete(table, id, false);
        this.emit('recordDeleted', { table, id });
        break;
    }
  }

  /**
   * Start periodic sync
   */
  private startPeriodicSync(): void {
    if (this.syncIntervalId) return;

    this.syncIntervalId = setInterval(async () => {
      if (navigator.onLine && !this.isSyncing) {
        await this.fullSync();
      }
    }, this.config.syncInterval);
  }

  /**
   * Stop periodic sync
   */
  private stopPeriodicSync(): void {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }
  }

  /**
   * Handle coming online
   */
  private handleOnline = async (): Promise<void> => {
    this.emit('online', {});
    await this.fullSync();
  };

  /**
   * Handle going offline
   */
  private handleOffline = (): void => {
    this.emit('offline', {});
  };

  /**
   * Get current sync status
   */
  async getStatus(): Promise<SyncStatus> {
    const pendingChanges = await this.cacheManager.getPendingChangesCount();
    const tables: Record<string, SyncMetadata> = {};

    for (const tableConfig of this.config.tables) {
      const metadata = await this.cacheManager.getSyncMetadata(tableConfig.name);
      if (metadata) {
        tables[tableConfig.name] = metadata;
      }
    }

    const allMetadata = Object.values(tables);
    const lastSyncAt = allMetadata.length > 0
      ? Math.max(...allMetadata.map(m => m.lastSyncedAt))
      : null;

    return {
      isOnline: navigator.onLine,
      isSyncing: this.isSyncing,
      lastSyncAt,
      pendingChanges,
      tables,
    };
  }

  /**
   * Force sync now
   */
  async syncNow(): Promise<SyncResult[]> {
    return this.fullSync();
  }

  /**
   * Subscribe to sync events
   */
  on(event: string, callback: (data: unknown) => void): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.eventListeners.get(event)?.delete(callback);
    };
  }

  /**
   * Emit sync event
   */
  private emit(event: string, data: unknown): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      for (const callback of listeners) {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in sync event listener for ${event}:`, error);
        }
      }
    }
  }
}

// ============ Singleton Instance ============

let realtimeSyncManagerInstance: RealtimeSyncManager | null = null;

export function getRealtimeSyncManager(): RealtimeSyncManager {
  if (typeof window === 'undefined') {
    throw new Error('RealtimeSyncManager is only available in the browser');
  }

  if (!realtimeSyncManagerInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }

    realtimeSyncManagerInstance = new RealtimeSyncManager(supabaseUrl, supabaseKey);
  }

  return realtimeSyncManagerInstance;
}

export function initializeRealtimeSync(supabaseUrl: string, supabaseKey: string, config?: Partial<SyncConfig>): RealtimeSyncManager {
  realtimeSyncManagerInstance = new RealtimeSyncManager(supabaseUrl, supabaseKey, config);
  return realtimeSyncManagerInstance;
}

// ============ Utility Functions ============

/**
 * Check if data needs refresh
 */
export async function needsRefresh(table: string, maxAge = 5 * 60 * 1000): Promise<boolean> {
  const cacheManager = getEntityCacheManager();
  return cacheManager.isDataStale(table, maxAge);
}

/**
 * Get cached data or fetch from server
 */
export async function getCachedOrFetch<T extends Record<string, unknown>>(
  table: string,
  fetchFn: () => Promise<T[]>,
  maxAge = 5 * 60 * 1000
): Promise<T[]> {
  const cacheManager = getEntityCacheManager();
  const isStale = await cacheManager.isDataStale(table, maxAge);

  if (!isStale) {
    const cached = await cacheManager.getAll<T>(table);
    if (cached.length > 0) {
      return cached;
    }
  }

  if (!navigator.onLine) {
    // Return whatever we have in cache
    return cacheManager.getAll<T>(table);
  }

  // Fetch fresh data
  const data = await fetchFn();
  await cacheManager.bulkSave(table, data, false);
  return data;
}
