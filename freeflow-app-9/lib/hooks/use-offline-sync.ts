'use client'

/**
 * useOfflineSync - React hook for offline-first data synchronization
 *
 * Features:
 * - IndexedDB local storage
 * - Automatic sync when connection restores
 * - Conflict detection and resolution
 * - Pending changes queue
 * - Background sync support
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useCurrentUser } from './use-current-user'

// ============================================================================
// Types
// ============================================================================

export type ConnectionState = 'online' | 'offline' | 'connecting' | 'syncing'
export type SyncState = 'idle' | 'syncing' | 'error' | 'conflict'
export type ConflictResolution = 'local-wins' | 'remote-wins' | 'merge' | 'manual'

export interface PendingChange<T = any> {
  id: string
  table: string
  action: 'insert' | 'update' | 'delete'
  data: T
  timestamp: Date
  retryCount: number
  maxRetries: number
  status: 'pending' | 'syncing' | 'failed' | 'conflict'
  conflictData?: T
}

export interface SyncConflict<T = any> {
  id: string
  changeId: string
  table: string
  localData: T
  remoteData: T
  detectedAt: Date
  resolvedAt?: Date
  resolution?: ConflictResolution
}

export interface SyncStatus {
  connectionState: ConnectionState
  syncState: SyncState
  pendingChanges: number
  failedChanges: number
  conflicts: number
  lastSyncAt: Date | null
  nextSyncAt: Date | null
  isOnline: boolean
}

export interface OfflineSyncConfig {
  tables: string[] // Tables to sync
  syncInterval?: number // ms between sync attempts (default: 5000)
  maxRetries?: number // Max retries per change (default: 3)
  conflictResolution?: ConflictResolution // Default resolution strategy
  enableBackgroundSync?: boolean
  onConflict?: (conflict: SyncConflict) => Promise<ConflictResolution>
  onSyncComplete?: (results: SyncResult[]) => void
  onSyncError?: (error: Error) => void
  onConnectionChange?: (isOnline: boolean) => void
}

export interface SyncResult {
  changeId: string
  success: boolean
  error?: string
  conflictResolved?: boolean
}

export interface UseOfflineSyncReturn<T = any> {
  // Status
  status: SyncStatus

  // Operations
  addPendingChange: (change: Omit<PendingChange<T>, 'id' | 'timestamp' | 'retryCount' | 'status'>) => Promise<string>
  removePendingChange: (changeId: string) => void
  getPendingChanges: (table?: string) => PendingChange<T>[]

  // Conflict resolution
  conflicts: SyncConflict<T>[]
  resolveConflict: (conflictId: string, resolution: ConflictResolution, mergedData?: T) => Promise<void>

  // Sync control
  forceSync: () => Promise<SyncResult[]>
  pauseSync: () => void
  resumeSync: () => void

  // Local data
  getLocalData: <D = T>(table: string, id: string) => Promise<D | null>
  setLocalData: <D = T>(table: string, id: string, data: D) => Promise<void>
  deleteLocalData: (table: string, id: string) => Promise<void>
  clearLocalData: (table?: string) => Promise<void>
}

// ============================================================================
// IndexedDB Helper
// ============================================================================

class IndexedDBStore {
  private dbName: string
  private db: IDBDatabase | null = null
  private dbVersion = 1

  constructor(dbName: string) {
    this.dbName = dbName
  }

  async init(): Promise<void> {
    if (this.db) return

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Pending changes store
        if (!db.objectStoreNames.contains('pending_changes')) {
          const changeStore = db.createObjectStore('pending_changes', { keyPath: 'id' })
          changeStore.createIndex('table', 'table', { unique: false })
          changeStore.createIndex('status', 'status', { unique: false })
          changeStore.createIndex('timestamp', 'timestamp', { unique: false })
        }

        // Conflicts store
        if (!db.objectStoreNames.contains('conflicts')) {
          const conflictStore = db.createObjectStore('conflicts', { keyPath: 'id' })
          conflictStore.createIndex('changeId', 'changeId', { unique: false })
          conflictStore.createIndex('table', 'table', { unique: false })
        }

        // Local data store (for offline cache)
        if (!db.objectStoreNames.contains('local_data')) {
          const dataStore = db.createObjectStore('local_data', { keyPath: 'key' })
          dataStore.createIndex('table', 'table', { unique: false })
        }
      }
    })
  }

  async get<T>(storeName: string, key: string): Promise<T | null> {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.get(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || null)
    })
  }

  async getAll<T>(storeName: string, indexName?: string, indexValue?: any): Promise<T[]> {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)

      let request: IDBRequest
      if (indexName && indexValue !== undefined) {
        const index = store.index(indexName)
        request = index.getAll(indexValue)
      } else {
        request = store.getAll()
      }

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || [])
    })
  }

  async put<T>(storeName: string, data: T): Promise<void> {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.put(data)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async delete(storeName: string, key: string): Promise<void> {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.delete(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async clear(storeName: string): Promise<void> {
    await this.init()
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.clear()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }
}

// ============================================================================
// React Hook
// ============================================================================

export function useOfflineSync<T = any>(config: OfflineSyncConfig): UseOfflineSyncReturn<T> {
  const { user } = useCurrentUser()
  const supabaseRef = useRef(createClient())
  const dbRef = useRef<IndexedDBStore | null>(null)

  const [status, setStatus] = useState<SyncStatus>({
    connectionState: 'connecting',
    syncState: 'idle',
    pendingChanges: 0,
    failedChanges: 0,
    conflicts: 0,
    lastSyncAt: null,
    nextSyncAt: null,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true
  })

  const [conflicts, setConflicts] = useState<SyncConflict<T>[]>([])
  const [isPaused, setIsPaused] = useState(false)

  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Initialize IndexedDB
  useEffect(() => {
    if (!user) return

    const dbName = `kazi-offline-${user.id}`
    dbRef.current = new IndexedDBStore(dbName)

    dbRef.current.init().then(() => {
      updateStatus()
    }).catch(console.error)
  }, [user])

  // Online/Offline detection
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true, connectionState: 'online' }))
      config.onConnectionChange?.(true)
      if (!isPaused) syncNow()
    }

    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOnline: false, connectionState: 'offline' }))
      config.onConnectionChange?.(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Initial check
    setStatus(prev => ({
      ...prev,
      isOnline: navigator.onLine,
      connectionState: navigator.onLine ? 'online' : 'offline'
    }))

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [isPaused])

  // Periodic sync
  useEffect(() => {
    if (isPaused) return

    const interval = config.syncInterval ?? 5000

    syncIntervalRef.current = setInterval(() => {
      if (status.isOnline && status.syncState === 'idle' && status.pendingChanges > 0) {
        syncNow()
      }
    }, interval)

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
      }
    }
  }, [isPaused, status.isOnline, status.syncState, status.pendingChanges])

  const updateStatus = useCallback(async () => {
    if (!dbRef.current) return

    const pending = await dbRef.current.getAll<PendingChange<T>>('pending_changes')
    const conflictList = await dbRef.current.getAll<SyncConflict<T>>('conflicts')

    const pendingCount = pending.filter(p => p.status === 'pending').length
    const failedCount = pending.filter(p => p.status === 'failed').length

    setStatus(prev => ({
      ...prev,
      pendingChanges: pendingCount,
      failedChanges: failedCount,
      conflicts: conflictList.length
    }))

    setConflicts(conflictList)
  }, [])

  const syncNow = useCallback(async (): Promise<SyncResult[]> => {
    if (!dbRef.current || !status.isOnline) return []

    setStatus(prev => ({ ...prev, syncState: 'syncing' }))

    const pending = await dbRef.current.getAll<PendingChange<T>>('pending_changes', 'status', 'pending')
    const results: SyncResult[] = []

    for (const change of pending) {
      try {
        // Mark as syncing
        await dbRef.current.put('pending_changes', { ...change, status: 'syncing' })

        const supabase = supabaseRef.current
        let result

        switch (change.action) {
          case 'insert':
            result = await supabase.from(change.table).insert(change.data).select().single()
            break
          case 'update':
            result = await supabase.from(change.table).update(change.data).eq('id', (change.data as Record<string, unknown>).id).select().single()
            break
          case 'delete':
            result = await supabase.from(change.table).delete().eq('id', (change.data as Record<string, unknown>).id)
            break
        }

        if (result?.error) {
          throw result.error
        }

        // Success - remove pending change
        await dbRef.current.delete('pending_changes', change.id)
        results.push({ changeId: change.id, success: true })

      } catch (error) {
        // Check if it's a conflict (record was modified)
        if (error.code === '23505' || error.code === '40001') {
          // Conflict detected
          const conflictId = `conflict-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

          // Fetch remote data
          const { data: remoteData } = await supabaseRef.current
            .from(change.table)
            .select('*')
            .eq('id', (change.data as Record<string, unknown>).id)
            .single()

          const conflict: SyncConflict<T> = {
            id: conflictId,
            changeId: change.id,
            table: change.table,
            localData: change.data,
            remoteData: remoteData as T,
            detectedAt: new Date()
          }

          await dbRef.current.put('conflicts', conflict)
          await dbRef.current.put('pending_changes', { ...change, status: 'conflict', conflictData: remoteData })

          // Auto-resolve if configured
          if (config.conflictResolution && config.conflictResolution !== 'manual') {
            await resolveConflictInternal(conflict, config.conflictResolution)
            results.push({ changeId: change.id, success: true, conflictResolved: true })
          } else if (config.onConflict) {
            const resolution = await config.onConflict(conflict)
            await resolveConflictInternal(conflict, resolution)
            results.push({ changeId: change.id, success: true, conflictResolved: true })
          } else {
            results.push({ changeId: change.id, success: false, error: 'Conflict requires manual resolution' })
          }

        } else {
          // Other error - retry later
          const newRetryCount = change.retryCount + 1
          const maxRetries = config.maxRetries ?? 3

          if (newRetryCount >= maxRetries) {
            await dbRef.current.put('pending_changes', { ...change, status: 'failed', retryCount: newRetryCount })
            results.push({ changeId: change.id, success: false, error: error.message })
          } else {
            await dbRef.current.put('pending_changes', { ...change, status: 'pending', retryCount: newRetryCount })
            results.push({ changeId: change.id, success: false, error: `Retry ${newRetryCount}/${maxRetries}` })
          }
        }
      }
    }

    setStatus(prev => ({
      ...prev,
      syncState: 'idle',
      lastSyncAt: new Date()
    }))

    await updateStatus()
    config.onSyncComplete?.(results)

    return results
  }, [status.isOnline, config])

  const resolveConflictInternal = useCallback(async (conflict: SyncConflict<T>, resolution: ConflictResolution, mergedData?: T) => {
    if (!dbRef.current) return

    const pendingChange = await dbRef.current.get<PendingChange<T>>('pending_changes', conflict.changeId)
    if (!pendingChange) return

    let dataToSync: T

    switch (resolution) {
      case 'local-wins':
        dataToSync = conflict.localData
        break
      case 'remote-wins':
        // Just remove the pending change, remote data is already in DB
        await dbRef.current.delete('pending_changes', conflict.changeId)
        await dbRef.current.delete('conflicts', conflict.id)
        await updateStatus()
        return
      case 'merge':
        if (!mergedData) throw new Error('Merged data required for merge resolution')
        dataToSync = mergedData
        break
      default:
        throw new Error(`Unknown resolution: ${resolution}`)
    }

    // Update with resolved data
    const supabase = supabaseRef.current
    await supabase.from(conflict.table).upsert(dataToSync)

    // Clean up
    await dbRef.current.delete('pending_changes', conflict.changeId)
    await dbRef.current.put('conflicts', {
      ...conflict,
      resolvedAt: new Date(),
      resolution
    })

    await updateStatus()
  }, [updateStatus])

  // Public API
  const addPendingChange = useCallback(async (change: Omit<PendingChange<T>, 'id' | 'timestamp' | 'retryCount' | 'status'>): Promise<string> => {
    if (!dbRef.current) throw new Error('Database not initialized')

    const id = `change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const pendingChange: PendingChange<T> = {
      ...change,
      id,
      timestamp: new Date(),
      retryCount: 0,
      status: 'pending'
    }

    await dbRef.current.put('pending_changes', pendingChange)
    await updateStatus()

    // Trigger sync if online
    if (status.isOnline && !isPaused) {
      syncNow()
    }

    return id
  }, [status.isOnline, isPaused, syncNow, updateStatus])

  const removePendingChange = useCallback(async (changeId: string) => {
    if (!dbRef.current) return
    await dbRef.current.delete('pending_changes', changeId)
    await updateStatus()
  }, [updateStatus])

  const getPendingChanges = useCallback((table?: string): PendingChange<T>[] => {
    // This is synchronous for React rendering - use state instead
    return []
  }, [])

  const resolveConflict = useCallback(async (conflictId: string, resolution: ConflictResolution, mergedData?: T) => {
    const conflict = conflicts.find(c => c.id === conflictId)
    if (!conflict) throw new Error('Conflict not found')
    await resolveConflictInternal(conflict, resolution, mergedData)
  }, [conflicts, resolveConflictInternal])

  const forceSync = useCallback(async (): Promise<SyncResult[]> => {
    return syncNow()
  }, [syncNow])

  const pauseSync = useCallback(() => {
    setIsPaused(true)
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current)
    }
  }, [])

  const resumeSync = useCallback(() => {
    setIsPaused(false)
  }, [])

  const getLocalData = useCallback(async <D = T>(table: string, id: string): Promise<D | null> => {
    if (!dbRef.current) return null
    const key = `${table}:${id}`
    const record = await dbRef.current.get<{ key: string; table: string; data: D }>('local_data', key)
    return record?.data ?? null
  }, [])

  const setLocalData = useCallback(async <D = T>(table: string, id: string, data: D) => {
    if (!dbRef.current) return
    const key = `${table}:${id}`
    await dbRef.current.put('local_data', { key, table, data })
  }, [])

  const deleteLocalData = useCallback(async (table: string, id: string) => {
    if (!dbRef.current) return
    const key = `${table}:${id}`
    await dbRef.current.delete('local_data', key)
  }, [])

  const clearLocalData = useCallback(async (table?: string) => {
    if (!dbRef.current) return
    if (table) {
      const records = await dbRef.current.getAll<{ key: string; table: string }>('local_data', 'table', table)
      for (const record of records) {
        await dbRef.current.delete('local_data', record.key)
      }
    } else {
      await dbRef.current.clear('local_data')
    }
  }, [])

  return {
    status,
    addPendingChange,
    removePendingChange,
    getPendingChanges,
    conflicts,
    resolveConflict,
    forceSync,
    pauseSync,
    resumeSync,
    getLocalData,
    setLocalData,
    deleteLocalData,
    clearLocalData
  }
}

export default useOfflineSync
