/**
 * Yjs Collaboration Provider for Kazi Platform
 *
 * World-class real-time collaboration using:
 * - Yjs CRDT for conflict-free editing
 * - Supabase Realtime channels for sync
 * - IndexedDB for offline persistence
 * - Awareness protocol for presence
 */

import * as Y from 'yjs'
import { IndexeddbPersistence } from 'y-indexeddb'
import { Awareness, encodeAwarenessUpdate, applyAwarenessUpdate } from 'y-protocols/awareness'

// ============================================================================
// Types
// ============================================================================

export interface YjsCollaborationConfig {
  documentId: string
  documentType: 'document' | 'canvas' | 'spreadsheet' | 'code' | 'project'
  tableName?: string
  columnName?: string
  enableOffline?: boolean
  enableAwareness?: boolean
  resyncInterval?: number | false
  onSync?: (synced: boolean) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Error) => void
  onAwarenessChange?: (states: Map<number, UserAwarenessState>) => void
}

export interface UserAwarenessState {
  user: {
    id: string
    name: string
    email?: string
    avatar?: string
    color: string
  }
  cursor?: {
    anchor: number
    head: number
    blockId?: string
  }
  selection?: {
    start: number
    end: number
    blockId?: string
  }
  isTyping?: boolean
  lastActive: number
}

export interface CollaborationProviderState {
  isConnected: boolean
  isSynced: boolean
  isOffline: boolean
  connectedUsers: UserAwarenessState[]
  documentVersion: number
}

// ============================================================================
// Color Generation for Users
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
// Utility Functions
// ============================================================================

function uint8ArrayToBase64(uint8Array: Uint8Array): string {
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

function base64ToUint8Array(base64: string): Uint8Array {
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

// ============================================================================
// Yjs Collaboration Provider Class
// ============================================================================

export class YjsCollaborationProvider {
  private doc: Y.Doc
  private channel: any = null
  private supabase: any = null
  private indexeddbProvider: IndexeddbPersistence | null = null
  private awareness: Awareness | null = null
  private config: YjsCollaborationConfig
  private state: CollaborationProviderState
  private listeners: Map<string, Set<(...args: any[]) => void>> = new Map()
  private updateHandler: ((update: Uint8Array, origin: any) => void) | null = null
  private resyncIntervalId: ReturnType<typeof setInterval> | null = null

  constructor(config: YjsCollaborationConfig) {
    this.config = {
      tableName: 'collaboration_documents',
      columnName: 'content',
      enableOffline: true,
      enableAwareness: true,
      resyncInterval: 5000,
      ...config
    }

    this.doc = new Y.Doc()
    this.state = {
      isConnected: false,
      isSynced: false,
      isOffline: false,
      connectedUsers: [],
      documentVersion: 0
    }

    this.initialize()
  }

  private async initialize(): Promise<void> {
    // Setup offline persistence first
    if (this.config.enableOffline) {
      await this.setupOfflinePersistence()
    }

    // Setup Supabase Realtime sync
    await this.setupSupabaseRealtimeSync()

    // Setup awareness if enabled
    if (this.config.enableAwareness) {
      this.setupAwareness()
    }
  }

  private async setupOfflinePersistence(): Promise<void> {
    try {
      const dbName = `kazi-collab-${this.config.documentType}-${this.config.documentId}`
      this.indexeddbProvider = new IndexeddbPersistence(dbName, this.doc)

      this.indexeddbProvider.whenSynced.then(() => {
        this.state.isOffline = false
        this.emit('offline-sync', true)
      })
    } catch (error) {
      console.warn('IndexedDB persistence not available:', error)
    }
  }

  private async setupSupabaseRealtimeSync(): Promise<void> {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase credentials not configured')
      }

      // Dynamic import to avoid SSR issues
      const { createClient } = await import('@supabase/supabase-js')
      this.supabase = createClient(supabaseUrl, supabaseKey)

      // Create a realtime channel for this document
      const channelName = `yjs:${this.config.documentId}`
      this.channel = this.supabase.channel(channelName, {
        config: {
          broadcast: { self: false }
        }
      })

      // Handle document updates from other clients
      this.channel.on('broadcast', { event: 'yjs-update' }, (payload: { payload: { update: string } }) => {
        try {
          const update = base64ToUint8Array(payload.payload.update)
          Y.applyUpdate(this.doc, update, 'remote')
        } catch (error) {
          console.error('Error applying remote update:', error)
        }
      })

      // Handle awareness updates
      this.channel.on('broadcast', { event: 'awareness-update' }, (payload: { payload: { update: string } }) => {
        try {
          if (this.awareness) {
            const update = base64ToUint8Array(payload.payload.update)
            applyAwarenessUpdate(this.awareness, update, 'remote')
          }
        } catch (error) {
          console.error('Error applying awareness update:', error)
        }
      })

      // Handle sync requests
      this.channel.on('broadcast', { event: 'sync-request' }, () => {
        this.broadcastFullState()
      })

      // Handle full state broadcasts
      this.channel.on('broadcast', { event: 'sync-state' }, (payload: { payload: { state: string } }) => {
        try {
          const state = base64ToUint8Array(payload.payload.state)
          Y.applyUpdate(this.doc, state, 'remote')
          this.state.isSynced = true
          this.emit('sync', true)
          this.config.onSync?.(true)
        } catch (error) {
          console.error('Error applying sync state:', error)
        }
      })

      // Subscribe to the channel
      this.channel.subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          this.state.isConnected = true
          this.emit('connect')
          this.config.onConnect?.()

          // Request sync from other clients
          this.channel.send({
            type: 'broadcast',
            event: 'sync-request',
            payload: {}
          })

          // Broadcast our current state
          setTimeout(() => this.broadcastFullState(), 500)
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          this.state.isConnected = false
          this.emit('disconnect')
          this.config.onDisconnect?.()
        }
      })

      // Listen for local document updates and broadcast them
      this.updateHandler = (update: Uint8Array, origin: any) => {
        if (origin !== 'remote' && this.state.isConnected && this.channel) {
          this.channel.send({
            type: 'broadcast',
            event: 'yjs-update',
            payload: { update: uint8ArrayToBase64(update) }
          })
        }
      }
      this.doc.on('update', this.updateHandler)

      // Setup periodic resync if configured
      if (this.config.resyncInterval) {
        this.resyncIntervalId = setInterval(() => {
          if (this.state.isConnected) {
            this.broadcastFullState()
          }
        }, this.config.resyncInterval)
      }

    } catch (error) {
      console.error('Failed to setup Supabase Realtime sync:', error)
      this.state.isOffline = true
      this.config.onError?.(error as Error)
    }
  }

  private broadcastFullState(): void {
    if (!this.channel || !this.state.isConnected) return

    const state = Y.encodeStateAsUpdate(this.doc)
    this.channel.send({
      type: 'broadcast',
      event: 'sync-state',
      payload: { state: uint8ArrayToBase64(state) }
    })
  }

  private setupAwareness(): void {
    this.awareness = new Awareness(this.doc)

    // Broadcast awareness updates
    this.awareness.on('update', ({ added, updated, removed }: { added: number[], updated: number[], removed: number[] }) => {
      const changedClients = added.concat(updated).concat(removed)

      // Broadcast awareness to other clients
      if (this.channel && this.state.isConnected && changedClients.length > 0) {
        const update = encodeAwarenessUpdate(this.awareness!, changedClients)
        this.channel.send({
          type: 'broadcast',
          event: 'awareness-update',
          payload: { update: uint8ArrayToBase64(update) }
        })
      }

      // Update local state
      const states = new Map<number, UserAwarenessState>()
      this.awareness!.getStates().forEach((state, clientId) => {
        if (state.user) {
          states.set(clientId, state as UserAwarenessState)
        }
      })

      this.state.connectedUsers = Array.from(states.values())
      this.emit('awareness-change', states)
      this.config.onAwarenessChange?.(states)
    })
  }

  // ==========================================================================
  // Public API - Document Operations
  // ==========================================================================

  /**
   * Get the Yjs document
   */
  getDoc(): Y.Doc {
    return this.doc
  }

  /**
   * Get a shared text type
   */
  getText(name: string = 'content'): Y.Text {
    return this.doc.getText(name)
  }

  /**
   * Get a shared map type
   */
  getMap<T = any>(name: string = 'data'): Y.Map<T> {
    return this.doc.getMap<T>(name)
  }

  /**
   * Get a shared array type
   */
  getArray<T = any>(name: string = 'items'): Y.Array<T> {
    return this.doc.getArray<T>(name)
  }

  /**
   * Get a shared XML fragment (for rich text editors)
   */
  getXmlFragment(name: string = 'document'): Y.XmlFragment {
    return this.doc.getXmlFragment(name)
  }

  /**
   * Create an undo manager for specific shared types
   */
  createUndoManager(scope: Y.AbstractType<any> | Y.AbstractType<any>[], options?: {
    captureTimeout?: number
    trackedOrigins?: Set<any>
  }): Y.UndoManager {
    return new Y.UndoManager(scope, {
      captureTimeout: options?.captureTimeout ?? 500,
      trackedOrigins: options?.trackedOrigins ?? new Set([null, 'user-input'])
    })
  }

  // ==========================================================================
  // Public API - Awareness Operations
  // ==========================================================================

  /**
   * Set the local user's awareness state
   */
  setLocalUser(user: {
    id: string
    name: string
    email?: string
    avatar?: string
  }): void {
    if (!this.awareness) return

    const color = generateUserColor(user.id)

    this.awareness.setLocalState({
      user: {
        ...user,
        color
      },
      lastActive: Date.now()
    })
  }

  /**
   * Update cursor position
   */
  updateCursor(anchor: number, head: number, blockId?: string): void {
    if (!this.awareness) return

    const currentState = this.awareness.getLocalState() || {}
    this.awareness.setLocalState({
      ...currentState,
      cursor: { anchor, head, blockId },
      lastActive: Date.now()
    })
  }

  /**
   * Update selection
   */
  updateSelection(start: number, end: number, blockId?: string): void {
    if (!this.awareness) return

    const currentState = this.awareness.getLocalState() || {}
    this.awareness.setLocalState({
      ...currentState,
      selection: { start, end, blockId },
      lastActive: Date.now()
    })
  }

  /**
   * Set typing indicator
   */
  setTyping(isTyping: boolean): void {
    if (!this.awareness) return

    const currentState = this.awareness.getLocalState() || {}
    this.awareness.setLocalState({
      ...currentState,
      isTyping,
      lastActive: Date.now()
    })
  }

  /**
   * Clear local user state
   */
  clearLocalState(): void {
    this.awareness?.setLocalState(null)
  }

  /**
   * Get all connected users
   */
  getConnectedUsers(): UserAwarenessState[] {
    return this.state.connectedUsers
  }

  /**
   * Get awareness instance
   */
  getAwareness(): Awareness | null {
    return this.awareness
  }

  // ==========================================================================
  // Public API - State & Events
  // ==========================================================================

  /**
   * Get current connection state
   */
  getState(): CollaborationProviderState {
    return { ...this.state }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.state.isConnected
  }

  /**
   * Check if synced
   */
  isSynced(): boolean {
    return this.state.isSynced
  }

  /**
   * Subscribe to events
   */
  on(event: string, callback: (...args: any[]) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)

    return () => {
      this.listeners.get(event)?.delete(callback)
    }
  }

  /**
   * Unsubscribe from events
   */
  off(event: string, callback: (...args: any[]) => void): void {
    this.listeners.get(event)?.delete(callback)
  }

  private emit(event: string, ...args: any[]): void {
    this.listeners.get(event)?.forEach(callback => {
      try {
        callback(...args)
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error)
      }
    })
  }

  // ==========================================================================
  // Cleanup
  // ==========================================================================

  /**
   * Destroy the provider and clean up resources
   */
  destroy(): void {
    this.clearLocalState()

    // Clear resync interval
    if (this.resyncIntervalId) {
      clearInterval(this.resyncIntervalId)
      this.resyncIntervalId = null
    }

    // Remove document update handler
    if (this.updateHandler) {
      this.doc.off('update', this.updateHandler)
      this.updateHandler = null
    }

    // Unsubscribe from channel
    if (this.channel) {
      this.channel.unsubscribe()
      this.channel = null
    }

    if (this.indexeddbProvider) {
      this.indexeddbProvider.destroy()
      this.indexeddbProvider = null
    }

    if (this.awareness) {
      this.awareness.destroy()
      this.awareness = null
    }

    this.doc.destroy()
    this.listeners.clear()
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createYjsProvider(config: YjsCollaborationConfig): YjsCollaborationProvider {
  return new YjsCollaborationProvider(config)
}

export default YjsCollaborationProvider
