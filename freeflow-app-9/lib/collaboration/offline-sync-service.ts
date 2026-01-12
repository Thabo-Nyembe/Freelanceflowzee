/**
 * Offline-First Sync Service
 *
 * Enables seamless collaboration even when offline:
 * - Local-first data storage with IndexedDB
 * - Automatic sync when connection restores
 * - Conflict detection and resolution
 * - Background sync with service workers
 * - Bandwidth-optimized delta compression
 */

import { createFeatureLogger } from '@/lib/logger'
import {
  CRDTOperation,
  VectorClock,
  mergeClock,
  isConcurrent
} from './crdt-service'

const logger = createFeatureLogger('OfflineSyncService')

// ============================================================================
// Types
// ============================================================================

export type ConnectionState = 'online' | 'offline' | 'connecting' | 'syncing'
export type SyncState = 'idle' | 'syncing' | 'error' | 'conflict'
export type ConflictResolution = 'local-wins' | 'remote-wins' | 'merge' | 'manual'

export interface SyncDocument {
  id: string
  type: string
  state: any
  vectorClock: VectorClock
  localVersion: number
  serverVersion: number
  lastSyncedAt: Date | null
  pendingOperations: CRDTOperation[]
  conflictOperations: CRDTOperation[]
  metadata: {
    createdAt: Date
    updatedAt: Date
    createdBy: string
    updatedBy: string
  }
}

export interface SyncOperation {
  id: string
  documentId: string
  operation: CRDTOperation
  timestamp: Date
  syncedAt: Date | null
  retryCount: number
  maxRetries: number
  status: 'pending' | 'syncing' | 'synced' | 'failed' | 'conflict'
}

export interface SyncConflict {
  id: string
  documentId: string
  localOperation: CRDTOperation
  remoteOperation: CRDTOperation
  detectedAt: Date
  resolvedAt: Date | null
  resolution: ConflictResolution | null
  resolvedBy: string | null
}

export interface SyncConfig {
  autoSync: boolean
  syncInterval: number
  maxRetries: number
  batchSize: number
  compressionEnabled: boolean
  conflictResolution: ConflictResolution
  offlineStorageQuota: number // MB
}

export interface SyncStatus {
  connectionState: ConnectionState
  syncState: SyncState
  pendingOperations: number
  failedOperations: number
  conflicts: number
  lastSyncAt: Date | null
  nextSyncAt: Date | null
  bytesUploaded: number
  bytesDownloaded: number
}

export interface DeltaUpdate {
  documentId: string
  baseVersion: number
  targetVersion: number
  operations: CRDTOperation[]
  compressed: boolean
  checksum: string
}

// ============================================================================
// Constants
// ============================================================================

const DB_NAME = 'kazi_offline_sync'
const DB_VERSION = 1
const DOCUMENTS_STORE = 'documents'
const OPERATIONS_STORE = 'operations'
const CONFLICTS_STORE = 'conflicts'
const METADATA_STORE = 'metadata'

const DEFAULT_CONFIG: SyncConfig = {
  autoSync: true,
  syncInterval: 5000,      // 5 seconds
  maxRetries: 3,
  batchSize: 50,
  compressionEnabled: true,
  conflictResolution: 'merge',
  offlineStorageQuota: 100 // 100MB
}

// ============================================================================
// IndexedDB Wrapper
// ============================================================================

class OfflineStorage {
  private db: IDBDatabase | null = null
  private dbPromise: Promise<IDBDatabase> | null = null

  async init(): Promise<void> {
    if (typeof indexedDB === 'undefined') {
      logger.warn('IndexedDB not available')
      return
    }

    if (this.db) return

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        logger.error('Failed to open IndexedDB', { error: request.error })
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Documents store
        if (!db.objectStoreNames.contains(DOCUMENTS_STORE)) {
          const docStore = db.createObjectStore(DOCUMENTS_STORE, { keyPath: 'id' })
          docStore.createIndex('type', 'type', { unique: false })
          docStore.createIndex('updatedAt', 'metadata.updatedAt', { unique: false })
        }

        // Operations store
        if (!db.objectStoreNames.contains(OPERATIONS_STORE)) {
          const opStore = db.createObjectStore(OPERATIONS_STORE, { keyPath: 'id' })
          opStore.createIndex('documentId', 'documentId', { unique: false })
          opStore.createIndex('status', 'status', { unique: false })
          opStore.createIndex('timestamp', 'timestamp', { unique: false })
        }

        // Conflicts store
        if (!db.objectStoreNames.contains(CONFLICTS_STORE)) {
          const conflictStore = db.createObjectStore(CONFLICTS_STORE, { keyPath: 'id' })
          conflictStore.createIndex('documentId', 'documentId', { unique: false })
          conflictStore.createIndex('resolvedAt', 'resolvedAt', { unique: false })
        }

        // Metadata store
        if (!db.objectStoreNames.contains(METADATA_STORE)) {
          db.createObjectStore(METADATA_STORE, { keyPath: 'key' })
        }
      }
    })

    await this.dbPromise
  }

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db
    if (this.dbPromise) return this.dbPromise
    await this.init()
    return this.db!
  }

  // Document operations
  async saveDocument(doc: SyncDocument): Promise<void> {
    const db = await this.getDB()
    const tx = db.transaction(DOCUMENTS_STORE, 'readwrite')
    const store = tx.objectStore(DOCUMENTS_STORE)
    await this.promisifyRequest(store.put(doc))
  }

  async getDocument(id: string): Promise<SyncDocument | null> {
    const db = await this.getDB()
    const tx = db.transaction(DOCUMENTS_STORE, 'readonly')
    const store = tx.objectStore(DOCUMENTS_STORE)
    return this.promisifyRequest(store.get(id))
  }

  async getAllDocuments(): Promise<SyncDocument[]> {
    const db = await this.getDB()
    const tx = db.transaction(DOCUMENTS_STORE, 'readonly')
    const store = tx.objectStore(DOCUMENTS_STORE)
    return this.promisifyRequest(store.getAll())
  }

  async deleteDocument(id: string): Promise<void> {
    const db = await this.getDB()
    const tx = db.transaction(DOCUMENTS_STORE, 'readwrite')
    const store = tx.objectStore(DOCUMENTS_STORE)
    await this.promisifyRequest(store.delete(id))
  }

  // Operation operations
  async saveOperation(op: SyncOperation): Promise<void> {
    const db = await this.getDB()
    const tx = db.transaction(OPERATIONS_STORE, 'readwrite')
    const store = tx.objectStore(OPERATIONS_STORE)
    await this.promisifyRequest(store.put(op))
  }

  async getPendingOperations(documentId?: string): Promise<SyncOperation[]> {
    const db = await this.getDB()
    const tx = db.transaction(OPERATIONS_STORE, 'readonly')
    const store = tx.objectStore(OPERATIONS_STORE)

    if (documentId) {
      const index = store.index('documentId')
      const all = await this.promisifyRequest(index.getAll(documentId))
      return all.filter(op => op.status === 'pending')
    }

    const index = store.index('status')
    return this.promisifyRequest(index.getAll('pending'))
  }

  async markOperationSynced(id: string): Promise<void> {
    const db = await this.getDB()
    const tx = db.transaction(OPERATIONS_STORE, 'readwrite')
    const store = tx.objectStore(OPERATIONS_STORE)
    const op: SyncOperation = await this.promisifyRequest(store.get(id))
    if (op) {
      op.status = 'synced'
      op.syncedAt = new Date()
      await this.promisifyRequest(store.put(op))
    }
  }

  async clearSyncedOperations(): Promise<void> {
    const db = await this.getDB()
    const tx = db.transaction(OPERATIONS_STORE, 'readwrite')
    const store = tx.objectStore(OPERATIONS_STORE)
    const index = store.index('status')
    const cursor = index.openCursor(IDBKeyRange.only('synced'))

    await new Promise<void>((resolve, reject) => {
      cursor.onsuccess = (event) => {
        const cur = (event.target as IDBRequest<IDBCursorWithValue>).result
        if (cur) {
          cur.delete()
          cur.continue()
        } else {
          resolve()
        }
      }
      cursor.onerror = () => reject(cursor.error)
    })
  }

  // Conflict operations
  async saveConflict(conflict: SyncConflict): Promise<void> {
    const db = await this.getDB()
    const tx = db.transaction(CONFLICTS_STORE, 'readwrite')
    const store = tx.objectStore(CONFLICTS_STORE)
    await this.promisifyRequest(store.put(conflict))
  }

  async getUnresolvedConflicts(documentId?: string): Promise<SyncConflict[]> {
    const db = await this.getDB()
    const tx = db.transaction(CONFLICTS_STORE, 'readonly')
    const store = tx.objectStore(CONFLICTS_STORE)

    let all: SyncConflict[]
    if (documentId) {
      const index = store.index('documentId')
      all = await this.promisifyRequest(index.getAll(documentId))
    } else {
      all = await this.promisifyRequest(store.getAll())
    }

    return all.filter(c => c.resolvedAt === null)
  }

  async resolveConflict(id: string, resolution: ConflictResolution, resolvedBy: string): Promise<void> {
    const db = await this.getDB()
    const tx = db.transaction(CONFLICTS_STORE, 'readwrite')
    const store = tx.objectStore(CONFLICTS_STORE)
    const conflict: SyncConflict = await this.promisifyRequest(store.get(id))
    if (conflict) {
      conflict.resolvedAt = new Date()
      conflict.resolution = resolution
      conflict.resolvedBy = resolvedBy
      await this.promisifyRequest(store.put(conflict))
    }
  }

  // Metadata operations
  async getMetadata(key: string): Promise<any> {
    const db = await this.getDB()
    const tx = db.transaction(METADATA_STORE, 'readonly')
    const store = tx.objectStore(METADATA_STORE)
    const result = await this.promisifyRequest(store.get(key))
    return result?.value
  }

  async setMetadata(key: string, value: any): Promise<void> {
    const db = await this.getDB()
    const tx = db.transaction(METADATA_STORE, 'readwrite')
    const store = tx.objectStore(METADATA_STORE)
    await this.promisifyRequest(store.put({ key, value }))
  }

  // Storage size
  async getStorageSize(): Promise<number> {
    if (typeof navigator !== 'undefined' && 'storage' in navigator) {
      const estimate = await navigator.storage.estimate()
      return estimate.usage || 0
    }
    return 0
  }

  private promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }
}

// ============================================================================
// Offline Sync Manager
// ============================================================================

export class OfflineSyncManager {
  private storage: OfflineStorage
  private config: SyncConfig
  private connectionState: ConnectionState = 'online'
  private syncState: SyncState = 'idle'
  private syncInterval?: NodeJS.Timeout
  private isInitialized = false

  // Stats
  private bytesUploaded = 0
  private bytesDownloaded = 0
  private lastSyncAt: Date | null = null

  // Callbacks
  private onConnectionChange?: (state: ConnectionState) => void
  private onSyncStateChange?: (state: SyncState) => void
  private onConflictDetected?: (conflict: SyncConflict) => void
  private onSyncComplete?: (stats: { uploaded: number; downloaded: number }) => void
  private serverSyncCallback?: (operations: CRDTOperation[]) => Promise<CRDTOperation[]>

  constructor(config: Partial<SyncConfig> = {}) {
    this.storage = new OfflineStorage()
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  async init(): Promise<void> {
    if (this.isInitialized) return

    await this.storage.init()

    // Monitor connection state
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnline())
      window.addEventListener('offline', () => this.handleOffline())

      // Initial state
      this.connectionState = navigator.onLine ? 'online' : 'offline'
    }

    // Start auto-sync if enabled
    if (this.config.autoSync && this.connectionState === 'online') {
      this.startAutoSync()
    }

    this.isInitialized = true
    logger.info('OfflineSyncManager initialized')
  }

  // ============================================================================
  // Document Management
  // ============================================================================

  async saveDocument(doc: SyncDocument): Promise<void> {
    await this.storage.saveDocument(doc)
  }

  async getDocument(id: string): Promise<SyncDocument | null> {
    return this.storage.getDocument(id)
  }

  async createDocument(
    id: string,
    type: string,
    initialState: any,
    userId: string
  ): Promise<SyncDocument> {
    const now = new Date()
    const doc: SyncDocument = {
      id,
      type,
      state: initialState,
      vectorClock: {},
      localVersion: 0,
      serverVersion: 0,
      lastSyncedAt: null,
      pendingOperations: [],
      conflictOperations: [],
      metadata: {
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
        updatedBy: userId
      }
    }

    await this.storage.saveDocument(doc)
    return doc
  }

  // ============================================================================
  // Operation Queue
  // ============================================================================

  async queueOperation(documentId: string, operation: CRDTOperation): Promise<void> {
    const syncOp: SyncOperation = {
      id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      documentId,
      operation,
      timestamp: new Date(),
      syncedAt: null,
      retryCount: 0,
      maxRetries: this.config.maxRetries,
      status: 'pending'
    }

    await this.storage.saveOperation(syncOp)

    // Update local document
    const doc = await this.storage.getDocument(documentId)
    if (doc) {
      doc.pendingOperations.push(operation)
      doc.localVersion++
      doc.metadata.updatedAt = new Date()
      await this.storage.saveDocument(doc)
    }

    // Trigger sync if online
    if (this.connectionState === 'online' && this.config.autoSync) {
      this.triggerSync()
    }
  }

  // ============================================================================
  // Sync Logic
  // ============================================================================

  async sync(): Promise<void> {
    if (this.connectionState !== 'online') {
      logger.info('Skipping sync - offline')
      return
    }

    if (this.syncState === 'syncing') {
      logger.info('Sync already in progress')
      return
    }

    this.setSyncState('syncing')

    try {
      const pendingOps = await this.storage.getPendingOperations()

      if (pendingOps.length === 0) {
        this.setSyncState('idle')
        return
      }

      // Group by document
      const byDocument = new Map<string, SyncOperation[]>()
      for (const op of pendingOps) {
        const existing = byDocument.get(op.documentId) || []
        existing.push(op)
        byDocument.set(op.documentId, existing)
      }

      // Sync each document
      for (const [documentId, ops] of byDocument) {
        await this.syncDocument(documentId, ops)
      }

      // Cleanup synced operations
      await this.storage.clearSyncedOperations()

      this.lastSyncAt = new Date()
      this.setSyncState('idle')
      this.onSyncComplete?.({ uploaded: this.bytesUploaded, downloaded: this.bytesDownloaded })

    } catch (error) {
      logger.error('Sync failed', { error: error instanceof Error ? error.message : 'Unknown' })
      this.setSyncState('error')
    }
  }

  private async syncDocument(documentId: string, operations: SyncOperation[]): Promise<void> {
    const doc = await this.storage.getDocument(documentId)
    if (!doc) return

    // Send operations to server
    const crdtOps = operations.map(op => op.operation)

    if (this.serverSyncCallback) {
      const remoteOps = await this.serverSyncCallback(crdtOps)

      // Check for conflicts
      for (const remoteOp of remoteOps) {
        const conflicts = this.detectConflicts(crdtOps, remoteOp)
        for (const conflict of conflicts) {
          await this.handleConflict(documentId, conflict.local, conflict.remote)
        }
      }

      // Apply remote operations
      for (const remoteOp of remoteOps) {
        const alreadyHave = crdtOps.some(op => op.id === remoteOp.id)
        if (!alreadyHave) {
          // Apply to local state
          doc.vectorClock = mergeClock(doc.vectorClock, remoteOp.vectorClock)
        }
      }

      // Track bytes
      const uploadSize = JSON.stringify(crdtOps).length
      const downloadSize = JSON.stringify(remoteOps).length
      this.bytesUploaded += uploadSize
      this.bytesDownloaded += downloadSize
    }

    // Mark operations as synced
    for (const op of operations) {
      await this.storage.markOperationSynced(op.id)
    }

    // Update document
    doc.pendingOperations = []
    doc.serverVersion = doc.localVersion
    doc.lastSyncedAt = new Date()
    await this.storage.saveDocument(doc)
  }

  private detectConflicts(
    localOps: CRDTOperation[],
    remoteOp: CRDTOperation
  ): Array<{ local: CRDTOperation; remote: CRDTOperation }> {
    const conflicts: Array<{ local: CRDTOperation; remote: CRDTOperation }> = []

    for (const localOp of localOps) {
      // Check if operations are concurrent and affect same location
      if (isConcurrent(localOp.vectorClock, remoteOp.vectorClock)) {
        // Check if they affect the same path
        const pathsOverlap = this.doPathsOverlap(localOp.path, remoteOp.path)
        const positionsOverlap = this.doPositionsOverlap(localOp, remoteOp)

        if (pathsOverlap || positionsOverlap) {
          conflicts.push({ local: localOp, remote: remoteOp })
        }
      }
    }

    return conflicts
  }

  private doPathsOverlap(path1: string[], path2: string[]): boolean {
    const minLength = Math.min(path1.length, path2.length)
    for (let i = 0; i < minLength; i++) {
      if (path1[i] !== path2[i]) return false
    }
    return true
  }

  private doPositionsOverlap(op1: CRDTOperation, op2: CRDTOperation): boolean {
    if (op1.position === undefined || op2.position === undefined) return false
    if (op1.length === undefined || op2.length === undefined) return false

    const start1 = op1.position
    const end1 = start1 + op1.length
    const start2 = op2.position
    const end2 = start2 + op2.length

    return start1 < end2 && start2 < end1
  }

  private async handleConflict(
    documentId: string,
    localOp: CRDTOperation,
    remoteOp: CRDTOperation
  ): Promise<void> {
    const conflict: SyncConflict = {
      id: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      documentId,
      localOperation: localOp,
      remoteOperation: remoteOp,
      detectedAt: new Date(),
      resolvedAt: null,
      resolution: null,
      resolvedBy: null
    }

    await this.storage.saveConflict(conflict)
    this.setSyncState('conflict')
    this.onConflictDetected?.(conflict)

    // Auto-resolve based on config
    if (this.config.conflictResolution !== 'manual') {
      await this.resolveConflict(conflict.id, this.config.conflictResolution, 'system')
    }
  }

  async resolveConflict(
    conflictId: string,
    resolution: ConflictResolution,
    resolvedBy: string
  ): Promise<void> {
    await this.storage.resolveConflict(conflictId, resolution, resolvedBy)

    // Check if any conflicts remain
    const remaining = await this.storage.getUnresolvedConflicts()
    if (remaining.length === 0) {
      this.setSyncState('idle')
    }
  }

  // ============================================================================
  // Connection Management
  // ============================================================================

  private handleOnline(): void {
    logger.info('Connection restored')
    this.setConnectionState('online')

    // Resume auto-sync
    if (this.config.autoSync) {
      this.startAutoSync()
      this.triggerSync()
    }
  }

  private handleOffline(): void {
    logger.info('Connection lost')
    this.setConnectionState('offline')
    this.stopAutoSync()
  }

  private startAutoSync(): void {
    if (this.syncInterval) return

    this.syncInterval = setInterval(() => {
      this.sync()
    }, this.config.syncInterval)
  }

  private stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = undefined
    }
  }

  private triggerSync(): void {
    // Debounced sync trigger
    setTimeout(() => this.sync(), 100)
  }

  // ============================================================================
  // Delta Compression
  // ============================================================================

  compressDelta(operations: CRDTOperation[]): DeltaUpdate | null {
    if (!this.config.compressionEnabled || operations.length === 0) {
      return null
    }

    // Simple compression: combine consecutive text operations
    const compressed: CRDTOperation[] = []
    let current: CRDTOperation | null = null

    for (const op of operations) {
      if (op.type === 'insert' && current?.type === 'insert') {
        // Combine consecutive inserts
        if (current.position !== undefined && op.position === current.position + (current.value?.length || 1)) {
          current = {
            ...current,
            value: (current.value || '') + (op.value || ''),
            vectorClock: mergeClock(current.vectorClock, op.vectorClock),
            timestamp: op.timestamp
          }
          continue
        }
      }

      if (current) {
        compressed.push(current)
      }
      current = op
    }

    if (current) {
      compressed.push(current)
    }

    // Calculate checksum
    const checksum = this.calculateChecksum(compressed)

    return {
      documentId: operations[0].nodeId,
      baseVersion: 0,
      targetVersion: operations.length,
      operations: compressed,
      compressed: compressed.length < operations.length,
      checksum
    }
  }

  private calculateChecksum(operations: CRDTOperation[]): string {
    const str = JSON.stringify(operations)
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16)
  }

  // ============================================================================
  // State Management
  // ============================================================================

  private setConnectionState(state: ConnectionState): void {
    this.connectionState = state
    this.onConnectionChange?.(state)
  }

  private setSyncState(state: SyncState): void {
    this.syncState = state
    this.onSyncStateChange?.(state)
  }

  // ============================================================================
  // Getters & Status
  // ============================================================================

  async getStatus(): Promise<SyncStatus> {
    const pending = await this.storage.getPendingOperations()
    const conflicts = await this.storage.getUnresolvedConflicts()
    const failed = pending.filter(op => op.status === 'failed')

    return {
      connectionState: this.connectionState,
      syncState: this.syncState,
      pendingOperations: pending.length,
      failedOperations: failed.length,
      conflicts: conflicts.length,
      lastSyncAt: this.lastSyncAt,
      nextSyncAt: this.syncInterval
        ? new Date(Date.now() + this.config.syncInterval)
        : null,
      bytesUploaded: this.bytesUploaded,
      bytesDownloaded: this.bytesDownloaded
    }
  }

  getConnectionState(): ConnectionState {
    return this.connectionState
  }

  getSyncState(): SyncState {
    return this.syncState
  }

  // ============================================================================
  // Callbacks
  // ============================================================================

  setOnConnectionChange(callback: (state: ConnectionState) => void): void {
    this.onConnectionChange = callback
  }

  setOnSyncStateChange(callback: (state: SyncState) => void): void {
    this.onSyncStateChange = callback
  }

  setOnConflictDetected(callback: (conflict: SyncConflict) => void): void {
    this.onConflictDetected = callback
  }

  setOnSyncComplete(callback: (stats: { uploaded: number; downloaded: number }) => void): void {
    this.onSyncComplete = callback
  }

  setServerSyncCallback(callback: (operations: CRDTOperation[]) => Promise<CRDTOperation[]>): void {
    this.serverSyncCallback = callback
  }

  // ============================================================================
  // Cleanup
  // ============================================================================

  async destroy(): Promise<void> {
    this.stopAutoSync()

    if (typeof window !== 'undefined') {
      window.removeEventListener('online', () => this.handleOnline())
      window.removeEventListener('offline', () => this.handleOffline())
    }

    // Final sync attempt
    if (this.connectionState === 'online') {
      await this.sync()
    }
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createOfflineSyncManager(config?: Partial<SyncConfig>): OfflineSyncManager {
  return new OfflineSyncManager(config)
}

export default {
  OfflineSyncManager,
  createOfflineSyncManager,
  DEFAULT_CONFIG
}
