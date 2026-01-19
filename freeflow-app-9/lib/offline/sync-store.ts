/**
 * Offline Sync Store - FreeFlow A+++ Implementation
 * Advanced IndexedDB sync store using Dexie.js
 * Features: Optimistic updates, conflict resolution, queue management
 */

import Dexie, { Table } from 'dexie';

// ============ Types ============

export interface SyncOperation {
  id?: number;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: Record<string, unknown>;
  timestamp: number;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
  error?: string;
  userId?: string;
  entityId?: string;
  conflictResolution?: 'client-wins' | 'server-wins' | 'manual';
  version?: number;
}

export interface CachedEntity {
  id: string;
  table: string;
  data: Record<string, unknown>;
  lastSynced: number;
  version: number;
  isLocal: boolean;
  expiresAt?: number;
}

export interface SyncMetadata {
  id?: number;
  table: string;
  lastSyncedAt: number;
  syncCursor?: string;
  totalRecords: number;
}

export interface OfflineConfig {
  id?: number;
  key: string;
  value: unknown;
  updatedAt: number;
}

export interface ConflictLog {
  id?: number;
  table: string;
  entityId: string;
  localData: Record<string, unknown>;
  serverData: Record<string, unknown>;
  resolution?: 'local' | 'server' | 'merged';
  resolvedAt?: number;
  createdAt: number;
}

// ============ Database Class ============

export class FreeFlowOfflineDB extends Dexie {
  syncQueue!: Table<SyncOperation>;
  cachedEntities!: Table<CachedEntity>;
  syncMetadata!: Table<SyncMetadata>;
  offlineConfig!: Table<OfflineConfig>;
  conflictLog!: Table<ConflictLog>;

  // Entity-specific tables
  projects!: Table<CachedEntity>;
  tasks!: Table<CachedEntity>;
  invoices!: Table<CachedEntity>;
  clients!: Table<CachedEntity>;
  files!: Table<CachedEntity>;
  messages!: Table<CachedEntity>;
  events!: Table<CachedEntity>;
  notes!: Table<CachedEntity>;
  transactions!: Table<CachedEntity>;
  timeEntries!: Table<CachedEntity>;

  constructor() {
    super('FreeFlowOfflineDB');

    this.version(1).stores({
      syncQueue: '++id, type, table, status, timestamp, userId, entityId',
      cachedEntities: 'id, table, lastSynced, isLocal, [table+id]',
      syncMetadata: '++id, table, lastSyncedAt',
      offlineConfig: '++id, key, updatedAt',
      conflictLog: '++id, table, entityId, createdAt, resolution',
      projects: 'id, table, lastSynced, isLocal',
      tasks: 'id, table, lastSynced, isLocal, [data.projectId], [data.status]',
      invoices: 'id, table, lastSynced, isLocal, [data.status], [data.clientId]',
      clients: 'id, table, lastSynced, isLocal',
      files: 'id, table, lastSynced, isLocal, [data.projectId]',
      messages: 'id, table, lastSynced, isLocal, [data.conversationId]',
      events: 'id, table, lastSynced, isLocal, [data.startDate]',
      notes: 'id, table, lastSynced, isLocal, [data.projectId]',
      transactions: 'id, table, lastSynced, isLocal, [data.date]',
      timeEntries: 'id, table, lastSynced, isLocal, [data.projectId], [data.date]',
    });
  }
}

// ============ Singleton Instance ============

let dbInstance: FreeFlowOfflineDB | null = null;

export function getOfflineDB(): FreeFlowOfflineDB {
  if (typeof window === 'undefined') {
    throw new Error('IndexedDB is only available in the browser');
  }

  if (!dbInstance) {
    dbInstance = new FreeFlowOfflineDB();
  }

  return dbInstance;
}

// ============ Sync Queue Manager ============

export class SyncQueueManager {
  private db: FreeFlowOfflineDB;
  private isProcessing = false;
  private maxRetries = 3;

  constructor() {
    this.db = getOfflineDB();
  }

  /**
   * Add operation to sync queue
   */
  async addToQueue(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'status' | 'retryCount'>): Promise<number> {
    const op: SyncOperation = {
      ...operation,
      timestamp: Date.now(),
      status: 'pending',
      retryCount: 0,
    };

    const id = await this.db.syncQueue.add(op);

    // Trigger background sync if online
    if (navigator.onLine) {
      this.processQueue();
    }

    return id as number;
  }

  /**
   * Process pending operations in queue
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const pendingOps = await this.db.syncQueue
        .where('status')
        .equals('pending')
        .sortBy('timestamp');

      for (const op of pendingOps) {
        if (!navigator.onLine) break;

        await this.processOperation(op);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single sync operation
   */
  private async processOperation(op: SyncOperation): Promise<void> {
    try {
      await this.db.syncQueue.update(op.id!, { status: 'syncing' });

      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: op.type,
          table: op.table,
          data: op.data,
          entityId: op.entityId,
          version: op.version,
        }),
      });

      if (!response.ok) {
        const error = await response.json();

        // Handle conflict
        if (response.status === 409) {
          await this.handleConflict(op, error.serverData);
          return;
        }

        throw new Error(error.message || 'Sync failed');
      }

      const result = await response.json();

      // Update local cache with server response
      if (result.data) {
        await this.updateLocalCache(op.table, result.data);
      }

      // Mark operation as synced
      await this.db.syncQueue.update(op.id!, { status: 'synced' });

      // Clean up old synced operations
      await this.cleanupSyncedOperations();

    } catch (error) {
      const err = error as Error;
      const newRetryCount = op.retryCount + 1;

      if (newRetryCount >= this.maxRetries) {
        await this.db.syncQueue.update(op.id!, {
          status: 'failed',
          error: err.message,
          retryCount: newRetryCount,
        });
      } else {
        await this.db.syncQueue.update(op.id!, {
          status: 'pending',
          error: err.message,
          retryCount: newRetryCount,
        });
      }
    }
  }

  /**
   * Handle sync conflicts
   */
  private async handleConflict(op: SyncOperation, serverData: Record<string, unknown>): Promise<void> {
    // Log the conflict
    await this.db.conflictLog.add({
      table: op.table,
      entityId: op.entityId || '',
      localData: op.data,
      serverData,
      createdAt: Date.now(),
    });

    const resolution = op.conflictResolution || 'server-wins';

    if (resolution === 'server-wins') {
      // Accept server version
      await this.updateLocalCache(op.table, serverData);
      await this.db.syncQueue.update(op.id!, { status: 'synced' });
    } else if (resolution === 'client-wins') {
      // Retry with force flag
      await this.db.syncQueue.update(op.id!, {
        data: { ...op.data, _forceOverwrite: true },
        status: 'pending',
      });
    } else {
      // Mark for manual resolution
      await this.db.syncQueue.update(op.id!, {
        status: 'failed',
        error: 'Conflict requires manual resolution',
      });
    }
  }

  /**
   * Update local cache after successful sync
   */
  private async updateLocalCache(table: string, data: Record<string, unknown>): Promise<void> {
    const tableRef = this.getTable(table);
    if (!tableRef) return;

    const cachedEntity: CachedEntity = {
      id: data.id as string,
      table,
      data,
      lastSynced: Date.now(),
      version: (data.version as number) || 1,
      isLocal: false,
    };

    await tableRef.put(cachedEntity);
  }

  /**
   * Get table reference by name
   */
  private getTable(name: string): Table<CachedEntity> | null {
    const tables: Record<string, Table<CachedEntity>> = {
      projects: this.db.projects,
      tasks: this.db.tasks,
      invoices: this.db.invoices,
      clients: this.db.clients,
      files: this.db.files,
      messages: this.db.messages,
      events: this.db.events,
      notes: this.db.notes,
      transactions: this.db.transactions,
      timeEntries: this.db.timeEntries,
    };
    return tables[name] || null;
  }

  /**
   * Clean up old synced operations
   */
  private async cleanupSyncedOperations(): Promise<void> {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

    await this.db.syncQueue
      .where('status')
      .equals('synced')
      .and(op => op.timestamp < oneDayAgo)
      .delete();
  }

  /**
   * Get failed operations for retry
   */
  async getFailedOperations(): Promise<SyncOperation[]> {
    return this.db.syncQueue
      .where('status')
      .equals('failed')
      .toArray();
  }

  /**
   * Retry a failed operation
   */
  async retryOperation(id: number): Promise<void> {
    await this.db.syncQueue.update(id, {
      status: 'pending',
      retryCount: 0,
      error: undefined,
    });

    if (navigator.onLine) {
      this.processQueue();
    }
  }

  /**
   * Get sync queue status
   */
  async getQueueStatus(): Promise<{
    pending: number;
    syncing: number;
    synced: number;
    failed: number;
  }> {
    const [pending, syncing, synced, failed] = await Promise.all([
      this.db.syncQueue.where('status').equals('pending').count(),
      this.db.syncQueue.where('status').equals('syncing').count(),
      this.db.syncQueue.where('status').equals('synced').count(),
      this.db.syncQueue.where('status').equals('failed').count(),
    ]);

    return { pending, syncing, synced, failed };
  }
}

// ============ Entity Cache Manager ============

export class EntityCacheManager {
  private db: FreeFlowOfflineDB;
  private syncManager: SyncQueueManager;

  constructor() {
    this.db = getOfflineDB();
    this.syncManager = new SyncQueueManager();
  }

  /**
   * Get entity from cache
   */
  async get<T extends Record<string, unknown>>(table: string, id: string): Promise<T | null> {
    const tableRef = this.getTable(table);
    if (!tableRef) return null;

    const entity = await tableRef.get(id);
    return entity?.data as T | null;
  }

  /**
   * Get all entities from cache with optional filters
   */
  async getAll<T extends Record<string, unknown>>(
    table: string,
    filter?: (entity: CachedEntity) => boolean
  ): Promise<T[]> {
    const tableRef = this.getTable(table);
    if (!tableRef) return [];

    let query = tableRef.where('table').equals(table);

    if (filter) {
      const entities = await query.filter(filter).toArray();
      return entities.map(e => e.data as T);
    }

    const entities = await query.toArray();
    return entities.map(e => e.data as T);
  }

  /**
   * Save entity to cache (optimistic update)
   */
  async save<T extends Record<string, unknown>>(
    table: string,
    data: T,
    options: {
      sync?: boolean;
      type?: 'create' | 'update';
    } = { sync: true, type: 'update' }
  ): Promise<T> {
    const tableRef = this.getTable(table);
    if (!tableRef) throw new Error(`Unknown table: ${table}`);

    const id = data.id as string || crypto.randomUUID();
    const existingEntity = await tableRef.get(id);

    const cachedEntity: CachedEntity = {
      id,
      table,
      data: { ...data, id },
      lastSynced: existingEntity?.lastSynced || 0,
      version: (existingEntity?.version || 0) + 1,
      isLocal: true,
    };

    await tableRef.put(cachedEntity);

    // Queue for sync if online
    if (options.sync !== false) {
      await this.syncManager.addToQueue({
        type: options.type || (existingEntity ? 'update' : 'create'),
        table,
        data: cachedEntity.data,
        entityId: id,
        version: cachedEntity.version,
      });
    }

    return { ...data, id } as T;
  }

  /**
   * Delete entity from cache
   */
  async delete(table: string, id: string, sync = true): Promise<void> {
    const tableRef = this.getTable(table);
    if (!tableRef) return;

    await tableRef.delete(id);

    if (sync) {
      await this.syncManager.addToQueue({
        type: 'delete',
        table,
        data: { id },
        entityId: id,
      });
    }
  }

  /**
   * Bulk save entities
   */
  async bulkSave<T extends Record<string, unknown>>(
    table: string,
    items: T[],
    sync = false
  ): Promise<void> {
    const tableRef = this.getTable(table);
    if (!tableRef) return;

    const entities: CachedEntity[] = items.map(data => ({
      id: data.id as string || crypto.randomUUID(),
      table,
      data,
      lastSynced: Date.now(),
      version: 1,
      isLocal: false,
    }));

    await tableRef.bulkPut(entities);

    // Update sync metadata
    await this.db.syncMetadata.put({
      table,
      lastSyncedAt: Date.now(),
      totalRecords: await tableRef.count(),
    });
  }

  /**
   * Clear all data for a table
   */
  async clearTable(table: string): Promise<void> {
    const tableRef = this.getTable(table);
    if (tableRef) {
      await tableRef.clear();
    }
  }

  /**
   * Get sync metadata for a table
   */
  async getSyncMetadata(table: string): Promise<SyncMetadata | undefined> {
    return this.db.syncMetadata.where('table').equals(table).first();
  }

  /**
   * Check if data is stale
   */
  async isDataStale(table: string, maxAge = 5 * 60 * 1000): Promise<boolean> {
    const metadata = await this.getSyncMetadata(table);
    if (!metadata) return true;
    return Date.now() - metadata.lastSyncedAt > maxAge;
  }

  /**
   * Get pending changes count
   */
  async getPendingChangesCount(): Promise<number> {
    const status = await this.syncManager.getQueueStatus();
    return status.pending + status.failed;
  }

  /**
   * Get table reference by name
   */
  private getTable(name: string): Table<CachedEntity> | null {
    const tables: Record<string, Table<CachedEntity>> = {
      projects: this.db.projects,
      tasks: this.db.tasks,
      invoices: this.db.invoices,
      clients: this.db.clients,
      files: this.db.files,
      messages: this.db.messages,
      events: this.db.events,
      notes: this.db.notes,
      transactions: this.db.transactions,
      timeEntries: this.db.timeEntries,
    };
    return tables[name] || null;
  }
}

// ============ Export Singleton Instances ============

let syncQueueManagerInstance: SyncQueueManager | null = null;
let entityCacheManagerInstance: EntityCacheManager | null = null;

export function getSyncQueueManager(): SyncQueueManager {
  if (typeof window === 'undefined') {
    throw new Error('SyncQueueManager is only available in the browser');
  }

  if (!syncQueueManagerInstance) {
    syncQueueManagerInstance = new SyncQueueManager();
  }

  return syncQueueManagerInstance;
}

export function getEntityCacheManager(): EntityCacheManager {
  if (typeof window === 'undefined') {
    throw new Error('EntityCacheManager is only available in the browser');
  }

  if (!entityCacheManagerInstance) {
    entityCacheManagerInstance = new EntityCacheManager();
  }

  return entityCacheManagerInstance;
}

// ============ Utility Functions ============

export async function initializeOfflineDB(): Promise<void> {
  const db = getOfflineDB();
  await db.open();

  // Set up online/offline event listeners
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      getSyncQueueManager().processQueue();
    });
  }
}

export async function clearAllOfflineData(): Promise<void> {
  const db = getOfflineDB();

  await Promise.all([
    db.syncQueue.clear(),
    db.cachedEntities.clear(),
    db.syncMetadata.clear(),
    db.conflictLog.clear(),
    db.projects.clear(),
    db.tasks.clear(),
    db.invoices.clear(),
    db.clients.clear(),
    db.files.clear(),
    db.messages.clear(),
    db.events.clear(),
    db.notes.clear(),
    db.transactions.clear(),
    db.timeEntries.clear(),
  ]);
}

export async function exportOfflineData(): Promise<string> {
  const db = getOfflineDB();

  const data = {
    syncQueue: await db.syncQueue.toArray(),
    projects: await db.projects.toArray(),
    tasks: await db.tasks.toArray(),
    invoices: await db.invoices.toArray(),
    clients: await db.clients.toArray(),
    files: await db.files.toArray(),
    messages: await db.messages.toArray(),
    events: await db.events.toArray(),
    notes: await db.notes.toArray(),
    transactions: await db.transactions.toArray(),
    timeEntries: await db.timeEntries.toArray(),
  };

  return JSON.stringify(data, null, 2);
}
