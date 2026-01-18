/**
 * Yjs Collaboration Provider for Kazi Platform
 *
 * World-class real-time collaboration using:
 * - Yjs CRDT for conflict-free editing
 * - Supabase Realtime for sync
 * - IndexedDB for offline persistence
 * - Awareness protocol for presence
 */

import * as Y from 'yjs'
import { IndexeddbPersistence } from 'y-indexeddb'
import { SupabaseProvider } from 'y-supabase'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Awareness } from 'y-protocols/awareness'

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
// Yjs Collaboration Provider Class
// ============================================================================

export class YjsCollaborationProvider {
  private doc: Y.Doc
  private supabaseProvider: SupabaseProvider | null = null
  private indexeddbProvider: IndexeddbPersistence | null = null
  private awareness: Awareness | null = null
  private config: YjsCollaborationConfig
  private state: CollaborationProviderState
  private listeners: Map<string, Set<(...args: any[]) => void>> = new Map()

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

    // Setup Supabase sync
    await this.setupSupabaseSync()

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

  private async setupSupabaseSync(): Promise<void> {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase credentials not configured')
      }

      const supabase = createSupabaseClient(supabaseUrl, supabaseKey)

      this.supabaseProvider = new SupabaseProvider(this.doc, supabase, {
        channel: this.config.documentId,
        id: this.config.documentId,
        tableName: this.config.tableName!,
        columnName: this.config.columnName!,
        resyncInterval: this.config.resyncInterval
      })

      // Event handlers
      this.supabaseProvider.on('connect', () => {
        this.state.isConnected = true
        this.emit('connect')
        this.config.onConnect?.()
      })

      this.supabaseProvider.on('disconnect', () => {
        this.state.isConnected = false
        this.emit('disconnect')
        this.config.onDisconnect?.()
      })

      this.supabaseProvider.on('synced', (synced: boolean) => {
        this.state.isSynced = synced
        this.emit('sync', synced)
        this.config.onSync?.(synced)
      })

      this.supabaseProvider.on('error', (error: Error) => {
        this.emit('error', error)
        this.config.onError?.(error)
      })

      this.supabaseProvider.on('save', (version: number) => {
        this.state.documentVersion = version
        this.emit('save', version)
      })

      // Get awareness from provider if available
      if ((this.supabaseProvider as any).awareness) {
        this.awareness = (this.supabaseProvider as any).awareness
      }

    } catch (error) {
      console.error('Failed to setup Supabase sync:', error)
      this.config.onError?.(error as Error)
    }
  }

  private setupAwareness(): void {
    if (!this.awareness) {
      this.awareness = new Awareness(this.doc)
    }

    this.awareness.on('change', ({ added, updated, removed }: {
      added: number[]
      updated: number[]
      removed: number[]
    }) => {
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

    if (this.supabaseProvider) {
      this.supabaseProvider.destroy()
      this.supabaseProvider = null
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
