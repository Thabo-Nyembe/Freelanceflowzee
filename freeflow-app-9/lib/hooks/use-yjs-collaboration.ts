'use client'

/**
 * useYjsCollaboration - React hook for real-time collaborative editing
 *
 * Integrates:
 * - Yjs CRDT for conflict-free editing
 * - Supabase Realtime for synchronization
 * - IndexedDB for offline persistence
 * - Awareness protocol for presence
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import * as Y from 'yjs'
import { IndexeddbPersistence } from 'y-indexeddb'
import { Awareness } from 'y-protocols/awareness'
import { createClient } from '@/lib/supabase/client'
import { useCurrentUser } from './use-current-user'

// ============================================================================
// Types
// ============================================================================

export type DocumentType = 'document' | 'canvas' | 'spreadsheet' | 'code' | 'project' | 'whiteboard'

export interface CollaboratorState {
  userId: string
  userName: string
  userAvatar?: string
  userColor: string
  cursor?: {
    x: number
    y: number
    anchor?: number
    head?: number
  }
  selection?: {
    start: number
    end: number
    elementIds?: string[]
  }
  isTyping: boolean
  lastActive: number
}

export interface CollaborationConfig {
  documentId: string
  documentType: DocumentType
  enableOffline?: boolean
  enableAwareness?: boolean
  enableVersionHistory?: boolean
  autoSave?: boolean
  autoSaveInterval?: number
  onSync?: (synced: boolean) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onCollaboratorJoin?: (collaborator: CollaboratorState) => void
  onCollaboratorLeave?: (userId: string) => void
  onConflict?: (conflict: ConflictInfo) => void
}

export interface ConflictInfo {
  id: string
  documentId: string
  type: 'concurrent-edit' | 'version-mismatch' | 'sync-error'
  localState: any
  remoteState: any
  timestamp: Date
}

export interface CollaborationState {
  isConnected: boolean
  isSynced: boolean
  isOffline: boolean
  documentVersion: number
  pendingChanges: number
  lastSyncedAt: Date | null
}

export interface UseYjsCollaborationReturn {
  // Document access
  ydoc: Y.Doc | null
  provider: SupabaseYjsProvider | null
  awareness: Awareness | null

  // State
  state: CollaborationState
  collaborators: CollaboratorState[]

  // Document operations
  getText: (name?: string) => Y.Text | null
  getMap: (name?: string) => Y.Map<any> | null
  getArray: (name?: string) => Y.Array<any> | null
  getXmlFragment: (name?: string) => Y.XmlFragment | null

  // Collaboration operations
  updateCursor: (cursor: { x: number; y: number; anchor?: number; head?: number }) => void
  updateSelection: (selection: { start: number; end: number; elementIds?: string[] }) => void
  setTypingState: (isTyping: boolean) => void

  // Sync operations
  forceSync: () => Promise<void>
  getVersionHistory: () => Promise<VersionInfo[]>
  restoreVersion: (versionId: string) => Promise<void>

  // Undo/Redo
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean

  // Cleanup
  disconnect: () => void
}

export interface VersionInfo {
  id: string
  version: number
  createdAt: Date
  createdBy: string
  snapshot: Uint8Array
  changes: number
}

// ============================================================================
// Color Generation
// ============================================================================

const COLLABORATION_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#F8B500', '#00CED1',
  '#FF7F50', '#87CEEB', '#DEB887', '#BC8F8F'
]

function generateUserColor(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i)
    hash = hash & hash
  }
  return COLLABORATION_COLORS[Math.abs(hash) % COLLABORATION_COLORS.length]
}

// ============================================================================
// Supabase Yjs Provider
// ============================================================================

class SupabaseYjsProvider {
  private ydoc: Y.Doc
  private awareness: Awareness
  private supabase: ReturnType<typeof createClient>
  private channel: ReturnType<ReturnType<typeof createClient>['channel']> | null = null
  private documentId: string
  private documentType: DocumentType
  private idbPersistence: IndexeddbPersistence | null = null
  private isConnected = false
  private isSynced = false
  private version = 0
  private pendingUpdates: Uint8Array[] = []
  private syncInterval: ReturnType<typeof setInterval> | null = null

  private onSyncCallback?: (synced: boolean) => void
  private onConnectCallback?: () => void
  private onDisconnectCallback?: () => void

  constructor(
    ydoc: Y.Doc,
    config: CollaborationConfig,
    user: { id: string; name: string; avatar?: string }
  ) {
    this.ydoc = ydoc
    this.documentId = config.documentId
    this.documentType = config.documentType
    this.supabase = createClient()
    this.awareness = new Awareness(ydoc)

    this.onSyncCallback = config.onSync
    this.onConnectCallback = config.onConnect
    this.onDisconnectCallback = config.onDisconnect

    // Set local awareness state
    this.awareness.setLocalState({
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        color: generateUserColor(user.id)
      },
      cursor: null,
      selection: null,
      isTyping: false,
      lastActive: Date.now()
    })

    // Setup IndexedDB persistence for offline
    if (config.enableOffline !== false) {
      this.idbPersistence = new IndexeddbPersistence(
        `kazi-${config.documentType}-${config.documentId}`,
        ydoc
      )
      this.idbPersistence.on('synced', () => {
        console.log('[Yjs] IndexedDB synced')
      })
    }

    // Listen to document updates
    this.ydoc.on('update', (update: Uint8Array, origin: any) => {
      if (origin !== 'remote') {
        this.pendingUpdates.push(update)
        this.broadcastUpdate(update)
      }
    })

    // Connect to Supabase channel
    this.connect()
  }

  private async connect() {
    try {
      // Create realtime channel
      this.channel = this.supabase.channel(`collaboration:${this.documentId}`, {
        config: {
          broadcast: { self: false },
          presence: { key: this.awareness.clientID.toString() }
        }
      })

      // Handle document updates from other clients
      this.channel.on('broadcast', { event: 'yjs-update' }, ({ payload }) => {
        if (payload.clientId !== this.awareness.clientID) {
          const update = this.base64ToUint8Array(payload.update)
          Y.applyUpdate(this.ydoc, update, 'remote')
          this.version = Math.max(this.version, payload.version || 0)
        }
      })

      // Handle awareness updates
      this.channel.on('broadcast', { event: 'awareness-update' }, ({ payload }) => {
        if (payload.clientId !== this.awareness.clientID) {
          // Update awareness from other clients
          const states = new Map(this.awareness.getStates())
          states.set(payload.clientId, payload.state)
        }
      })

      // Handle presence
      this.channel.on('presence', { event: 'sync' }, () => {
        console.log('[Yjs] Presence synced')
      })

      this.channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('[Yjs] User joined:', key)
      })

      this.channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('[Yjs] User left:', key)
        this.awareness.setLocalStateField('lastActive', Date.now())
      })

      // Subscribe to channel
      await this.channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          this.isConnected = true
          this.onConnectCallback?.()

          // Track presence
          await this.channel?.track({
            clientId: this.awareness.clientID,
            userId: this.awareness.getLocalState()?.user?.id,
            joinedAt: Date.now()
          })

          // Initial sync from server
          await this.initialSync()
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          this.isConnected = false
          this.onDisconnectCallback?.()
        }
      })

      // Periodic sync
      this.syncInterval = setInterval(() => {
        this.syncToServer()
      }, 5000)

    } catch (error) {
      console.error('[Yjs] Connection error:', error)
      this.isConnected = false
    }
  }

  private async initialSync() {
    try {
      const { data, error } = await this.supabase
        .from('collaboration_documents')
        .select('state, version')
        .eq('id', this.documentId)
        .single()

      if (data?.state) {
        const remoteState = this.base64ToUint8Array(data.state)
        Y.applyUpdate(this.ydoc, remoteState, 'remote')
        this.version = data.version || 0
      }

      this.isSynced = true
      this.onSyncCallback?.(true)
    } catch (error) {
      console.error('[Yjs] Initial sync error:', error)
      // Offline mode - use local state
      this.isSynced = true
      this.onSyncCallback?.(true)
    }
  }

  private async syncToServer() {
    if (!this.isConnected || this.pendingUpdates.length === 0) return

    try {
      const state = Y.encodeStateAsUpdate(this.ydoc)
      const stateBase64 = this.uint8ArrayToBase64(state)

      await this.supabase
        .from('collaboration_documents')
        .upsert({
          id: this.documentId,
          document_type: this.documentType,
          state: stateBase64,
          version: ++this.version,
          updated_at: new Date().toISOString()
        })

      this.pendingUpdates = []
    } catch (error) {
      console.error('[Yjs] Sync to server error:', error)
    }
  }

  private broadcastUpdate(update: Uint8Array) {
    if (!this.channel || !this.isConnected) return

    this.channel.send({
      type: 'broadcast',
      event: 'yjs-update',
      payload: {
        clientId: this.awareness.clientID,
        update: this.uint8ArrayToBase64(update),
        version: this.version
      }
    })
  }

  broadcastAwareness() {
    if (!this.channel || !this.isConnected) return

    this.channel.send({
      type: 'broadcast',
      event: 'awareness-update',
      payload: {
        clientId: this.awareness.clientID,
        state: this.awareness.getLocalState()
      }
    })
  }

  getState(): CollaborationState {
    return {
      isConnected: this.isConnected,
      isSynced: this.isSynced,
      isOffline: !this.isConnected,
      documentVersion: this.version,
      pendingChanges: this.pendingUpdates.length,
      lastSyncedAt: this.isSynced ? new Date() : null
    }
  }

  async forceSync() {
    await this.syncToServer()
  }

  disconnect() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }
    this.channel?.unsubscribe()
    this.idbPersistence?.destroy()
    this.awareness.destroy()
  }

  private uint8ArrayToBase64(uint8Array: Uint8Array): string {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(uint8Array).toString('base64')
    }
    let binary = ''
    const len = uint8Array.byteLength
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(uint8Array[i])
    }
    return btoa(binary)
  }

  private base64ToUint8Array(base64: string): Uint8Array {
    if (typeof Buffer !== 'undefined') {
      return new Uint8Array(Buffer.from(base64, 'base64'))
    }
    const binary = atob(base64)
    const len = binary.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes
  }

  getAwareness(): Awareness {
    return this.awareness
  }
}

// ============================================================================
// React Hook
// ============================================================================

export function useYjsCollaboration(config: CollaborationConfig): UseYjsCollaborationReturn {
  const { user } = useCurrentUser()
  const ydocRef = useRef<Y.Doc | null>(null)
  const providerRef = useRef<SupabaseYjsProvider | null>(null)
  const undoManagerRef = useRef<Y.UndoManager | null>(null)

  const [state, setState] = useState<CollaborationState>({
    isConnected: false,
    isSynced: false,
    isOffline: true,
    documentVersion: 0,
    pendingChanges: 0,
    lastSyncedAt: null
  })

  const [collaborators, setCollaborators] = useState<CollaboratorState[]>([])
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  // Initialize Yjs document and provider
  useEffect(() => {
    if (!config.documentId || !user) return

    const ydoc = new Y.Doc()
    ydocRef.current = ydoc

    const provider = new SupabaseYjsProvider(ydoc, config, {
      id: user.id,
      name: user.name || user.email || 'Anonymous',
      avatar: user.avatar_url
    })
    providerRef.current = provider

    // Setup undo manager
    const text = ydoc.getText('content')
    undoManagerRef.current = new Y.UndoManager(text)

    undoManagerRef.current.on('stack-item-added', () => {
      setCanUndo(undoManagerRef.current?.canUndo() ?? false)
      setCanRedo(undoManagerRef.current?.canRedo() ?? false)
    })

    // Listen to awareness changes
    const awareness = provider.getAwareness()
    awareness.on('change', () => {
      const states = awareness.getStates()
      const collabs: CollaboratorState[] = []

      states.forEach((state, clientId) => {
        if (state.user && clientId !== awareness.clientID) {
          collabs.push({
            userId: state.user.id,
            userName: state.user.name,
            userAvatar: state.user.avatar,
            userColor: state.user.color,
            cursor: state.cursor,
            selection: state.selection,
            isTyping: state.isTyping || false,
            lastActive: state.lastActive || Date.now()
          })
        }
      })

      setCollaborators(collabs)
    })

    // Update state periodically
    const stateInterval = setInterval(() => {
      setState(provider.getState())
    }, 1000)

    return () => {
      clearInterval(stateInterval)
      provider.disconnect()
      ydoc.destroy()
    }
  }, [config.documentId, user])

  // Document access methods
  const getText = useCallback((name = 'content') => {
    return ydocRef.current?.getText(name) ?? null
  }, [])

  const getMap = useCallback((name = 'data') => {
    return ydocRef.current?.getMap(name) ?? null
  }, [])

  const getArray = useCallback((name = 'items') => {
    return ydocRef.current?.getArray(name) ?? null
  }, [])

  const getXmlFragment = useCallback((name = 'prosemirror') => {
    return ydocRef.current?.getXmlFragment(name) ?? null
  }, [])

  // Collaboration operations
  const updateCursor = useCallback((cursor: { x: number; y: number; anchor?: number; head?: number }) => {
    const awareness = providerRef.current?.getAwareness()
    if (awareness) {
      awareness.setLocalStateField('cursor', cursor)
      awareness.setLocalStateField('lastActive', Date.now())
      providerRef.current?.broadcastAwareness()
    }
  }, [])

  const updateSelection = useCallback((selection: { start: number; end: number; elementIds?: string[] }) => {
    const awareness = providerRef.current?.getAwareness()
    if (awareness) {
      awareness.setLocalStateField('selection', selection)
      awareness.setLocalStateField('lastActive', Date.now())
      providerRef.current?.broadcastAwareness()
    }
  }, [])

  const setTypingState = useCallback((isTyping: boolean) => {
    const awareness = providerRef.current?.getAwareness()
    if (awareness) {
      awareness.setLocalStateField('isTyping', isTyping)
      awareness.setLocalStateField('lastActive', Date.now())
      providerRef.current?.broadcastAwareness()
    }
  }, [])

  // Sync operations
  const forceSync = useCallback(async () => {
    await providerRef.current?.forceSync()
  }, [])

  const getVersionHistory = useCallback(async (): Promise<VersionInfo[]> => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('collaboration_versions')
      .select('*')
      .eq('document_id', config.documentId)
      .order('version', { ascending: false })
      .limit(50)

    if (error) {
      console.error('[Yjs] Error fetching version history:', error)
      return []
    }

    return (data || []).map(v => ({
      id: v.id,
      version: v.version,
      createdAt: new Date(v.created_at),
      createdBy: v.created_by,
      snapshot: v.snapshot,
      changes: v.changes || 0
    }))
  }, [config.documentId])

  const restoreVersion = useCallback(async (versionId: string) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('collaboration_versions')
      .select('snapshot')
      .eq('id', versionId)
      .single()

    if (error || !data?.snapshot) {
      throw new Error('Failed to restore version')
    }

    if (ydocRef.current) {
      const snapshot = typeof data.snapshot === 'string'
        ? new Uint8Array(Buffer.from(data.snapshot, 'base64'))
        : data.snapshot
      Y.applyUpdate(ydocRef.current, snapshot, 'restore')
    }
  }, [])

  // Undo/Redo
  const undo = useCallback(() => {
    undoManagerRef.current?.undo()
  }, [])

  const redo = useCallback(() => {
    undoManagerRef.current?.redo()
  }, [])

  // Disconnect
  const disconnect = useCallback(() => {
    providerRef.current?.disconnect()
  }, [])

  return {
    ydoc: ydocRef.current,
    provider: providerRef.current,
    awareness: providerRef.current?.getAwareness() ?? null,
    state,
    collaborators,
    getText,
    getMap,
    getArray,
    getXmlFragment,
    updateCursor,
    updateSelection,
    setTypingState,
    forceSync,
    getVersionHistory,
    restoreVersion,
    undo,
    redo,
    canUndo,
    canRedo,
    disconnect
  }
}

export default useYjsCollaboration
