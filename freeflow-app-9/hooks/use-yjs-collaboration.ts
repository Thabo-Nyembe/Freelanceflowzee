'use client'

/**
 * React Hook for Yjs Collaboration
 *
 * Provides reactive state and methods for real-time collaboration
 * using Yjs CRDT with Supabase sync and offline persistence.
 */

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import * as Y from 'yjs'
import {
  YjsCollaborationProvider,
  YjsCollaborationConfig,
  UserAwarenessState,
  CollaborationProviderState,
  createYjsProvider
} from '@/lib/collaboration/yjs-provider'

// ============================================================================
// Types
// ============================================================================

export interface UseYjsCollaborationOptions {
  documentId: string
  documentType: 'document' | 'canvas' | 'spreadsheet' | 'code' | 'project'
  user: {
    id: string
    name: string
    email?: string
    avatar?: string
  }
  tableName?: string
  columnName?: string
  enableOffline?: boolean
  enableAwareness?: boolean
  onConnect?: () => void
  onDisconnect?: () => void
  onSync?: (synced: boolean) => void
  onError?: (error: Error) => void
}

export interface UseYjsCollaborationReturn {
  // State
  isConnected: boolean
  isSynced: boolean
  isOffline: boolean
  connectedUsers: UserAwarenessState[]
  documentVersion: number

  // Document access
  doc: Y.Doc | null
  getText: (name?: string) => Y.Text | null
  getMap: <T = any>(name?: string) => Y.Map<T> | null
  getArray: <T = any>(name?: string) => Y.Array<T> | null
  getXmlFragment: (name?: string) => Y.XmlFragment | null

  // Undo/Redo
  createUndoManager: (scope: Y.AbstractType<any> | Y.AbstractType<any>[]) => Y.UndoManager | null

  // Awareness actions
  updateCursor: (anchor: number, head: number, blockId?: string) => void
  updateSelection: (start: number, end: number, blockId?: string) => void
  setTyping: (isTyping: boolean) => void

  // Connection
  reconnect: () => void
  disconnect: () => void

  // Provider access (for advanced use)
  provider: YjsCollaborationProvider | null
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useYjsCollaboration(
  options: UseYjsCollaborationOptions
): UseYjsCollaborationReturn {
  const {
    documentId,
    documentType,
    user,
    tableName,
    columnName,
    enableOffline = true,
    enableAwareness = true,
    onConnect,
    onDisconnect,
    onSync,
    onError
  } = options

  // Provider ref to persist across renders
  const providerRef = useRef<YjsCollaborationProvider | null>(null)

  // Reactive state
  const [state, setState] = useState<CollaborationProviderState>({
    isConnected: false,
    isSynced: false,
    isOffline: false,
    connectedUsers: [],
    documentVersion: 0
  })

  // Track if mounted
  const isMountedRef = useRef(true)

  // Initialize provider
  useEffect(() => {
    isMountedRef.current = true

    // Create provider config
    const config: YjsCollaborationConfig = {
      documentId,
      documentType,
      tableName,
      columnName,
      enableOffline,
      enableAwareness,
      onConnect: () => {
        if (!isMountedRef.current) return
        setState(prev => ({ ...prev, isConnected: true }))
        onConnect?.()
      },
      onDisconnect: () => {
        if (!isMountedRef.current) return
        setState(prev => ({ ...prev, isConnected: false }))
        onDisconnect?.()
      },
      onSync: (synced) => {
        if (!isMountedRef.current) return
        setState(prev => ({ ...prev, isSynced: synced }))
        onSync?.(synced)
      },
      onError: (error) => {
        if (!isMountedRef.current) return
        onError?.(error)
      },
      onAwarenessChange: (states) => {
        if (!isMountedRef.current) return
        setState(prev => ({
          ...prev,
          connectedUsers: Array.from(states.values())
        }))
      }
    }

    // Create provider
    const provider = createYjsProvider(config)
    providerRef.current = provider

    // Set local user
    provider.setLocalUser(user)

    // Cleanup
    return () => {
      isMountedRef.current = false
      provider.destroy()
      providerRef.current = null
    }
  }, [documentId, documentType]) // Only recreate on document change

  // Update user when it changes
  useEffect(() => {
    if (providerRef.current) {
      providerRef.current.setLocalUser(user)
    }
  }, [user.id, user.name, user.email, user.avatar])

  // Document access methods
  const doc = useMemo(() => {
    return providerRef.current?.getDoc() ?? null
  }, [state.isConnected])

  const getText = useCallback((name: string = 'content') => {
    return providerRef.current?.getText(name) ?? null
  }, [])

  const getMap = useCallback(<T = any>(name: string = 'data') => {
    return providerRef.current?.getMap<T>(name) ?? null
  }, [])

  const getArray = useCallback(<T = any>(name: string = 'items') => {
    return providerRef.current?.getArray<T>(name) ?? null
  }, [])

  const getXmlFragment = useCallback((name: string = 'document') => {
    return providerRef.current?.getXmlFragment(name) ?? null
  }, [])

  const createUndoManager = useCallback((
    scope: Y.AbstractType<any> | Y.AbstractType<any>[]
  ) => {
    return providerRef.current?.createUndoManager(scope) ?? null
  }, [])

  // Awareness methods
  const updateCursor = useCallback((
    anchor: number,
    head: number,
    blockId?: string
  ) => {
    providerRef.current?.updateCursor(anchor, head, blockId)
  }, [])

  const updateSelection = useCallback((
    start: number,
    end: number,
    blockId?: string
  ) => {
    providerRef.current?.updateSelection(start, end, blockId)
  }, [])

  const setTyping = useCallback((isTyping: boolean) => {
    providerRef.current?.setTyping(isTyping)
  }, [])

  // Connection methods
  const reconnect = useCallback(() => {
    // Destroy and recreate provider
    if (providerRef.current) {
      providerRef.current.destroy()
    }

    const config: YjsCollaborationConfig = {
      documentId,
      documentType,
      tableName,
      columnName,
      enableOffline,
      enableAwareness,
      onConnect: () => {
        if (!isMountedRef.current) return
        setState(prev => ({ ...prev, isConnected: true }))
        onConnect?.()
      },
      onDisconnect: () => {
        if (!isMountedRef.current) return
        setState(prev => ({ ...prev, isConnected: false }))
        onDisconnect?.()
      },
      onSync: (synced) => {
        if (!isMountedRef.current) return
        setState(prev => ({ ...prev, isSynced: synced }))
        onSync?.(synced)
      },
      onError: (error) => {
        if (!isMountedRef.current) return
        onError?.(error)
      },
      onAwarenessChange: (states) => {
        if (!isMountedRef.current) return
        setState(prev => ({
          ...prev,
          connectedUsers: Array.from(states.values())
        }))
      }
    }

    const provider = createYjsProvider(config)
    providerRef.current = provider
    provider.setLocalUser(user)
  }, [documentId, documentType, user])

  const disconnect = useCallback(() => {
    providerRef.current?.destroy()
    setState({
      isConnected: false,
      isSynced: false,
      isOffline: false,
      connectedUsers: [],
      documentVersion: 0
    })
  }, [])

  return {
    // State
    isConnected: state.isConnected,
    isSynced: state.isSynced,
    isOffline: state.isOffline,
    connectedUsers: state.connectedUsers,
    documentVersion: state.documentVersion,

    // Document access
    doc,
    getText,
    getMap,
    getArray,
    getXmlFragment,

    // Undo/Redo
    createUndoManager,

    // Awareness
    updateCursor,
    updateSelection,
    setTyping,

    // Connection
    reconnect,
    disconnect,

    // Provider
    provider: providerRef.current
  }
}

// ============================================================================
// Specialized Hooks
// ============================================================================

/**
 * Hook for collaborative text editing
 */
export function useYjsText(
  options: UseYjsCollaborationOptions,
  textName: string = 'content'
) {
  const collaboration = useYjsCollaboration(options)
  const [text, setText] = useState('')
  const textRef = useRef<Y.Text | null>(null)

  useEffect(() => {
    if (!collaboration.isConnected) return

    const yText = collaboration.getText(textName)
    if (!yText) return

    textRef.current = yText
    setText(yText.toString())

    const observer = () => {
      setText(yText.toString())
    }

    yText.observe(observer)

    return () => {
      yText.unobserve(observer)
    }
  }, [collaboration.isConnected, textName])

  const insert = useCallback((index: number, content: string) => {
    textRef.current?.insert(index, content)
  }, [])

  const deleteText = useCallback((index: number, length: number) => {
    textRef.current?.delete(index, length)
  }, [])

  const applyDelta = useCallback((delta: any[]) => {
    textRef.current?.applyDelta(delta)
  }, [])

  return {
    ...collaboration,
    text,
    yText: textRef.current,
    insert,
    delete: deleteText,
    applyDelta
  }
}

/**
 * Hook for collaborative map/object data
 */
export function useYjsMap<T = any>(
  options: UseYjsCollaborationOptions,
  mapName: string = 'data'
) {
  const collaboration = useYjsCollaboration(options)
  const [data, setData] = useState<Record<string, T>>({})
  const mapRef = useRef<Y.Map<T> | null>(null)

  useEffect(() => {
    if (!collaboration.isConnected) return

    const yMap = collaboration.getMap<T>(mapName)
    if (!yMap) return

    mapRef.current = yMap
    setData(yMap.toJSON())

    const observer = () => {
      setData(yMap.toJSON())
    }

    yMap.observe(observer)

    return () => {
      yMap.unobserve(observer)
    }
  }, [collaboration.isConnected, mapName])

  const set = useCallback((key: string, value: T) => {
    mapRef.current?.set(key, value)
  }, [])

  const remove = useCallback((key: string) => {
    mapRef.current?.delete(key)
  }, [])

  const get = useCallback((key: string): T | undefined => {
    return mapRef.current?.get(key)
  }, [])

  return {
    ...collaboration,
    data,
    yMap: mapRef.current,
    set,
    remove,
    get
  }
}

/**
 * Hook for collaborative array/list data
 */
export function useYjsArray<T = any>(
  options: UseYjsCollaborationOptions,
  arrayName: string = 'items'
) {
  const collaboration = useYjsCollaboration(options)
  const [items, setItems] = useState<T[]>([])
  const arrayRef = useRef<Y.Array<T> | null>(null)

  useEffect(() => {
    if (!collaboration.isConnected) return

    const yArray = collaboration.getArray<T>(arrayName)
    if (!yArray) return

    arrayRef.current = yArray
    setItems(yArray.toArray())

    const observer = () => {
      setItems(yArray.toArray())
    }

    yArray.observe(observer)

    return () => {
      yArray.unobserve(observer)
    }
  }, [collaboration.isConnected, arrayName])

  const push = useCallback((items: T[]) => {
    arrayRef.current?.push(items)
  }, [])

  const insert = useCallback((index: number, items: T[]) => {
    arrayRef.current?.insert(index, items)
  }, [])

  const remove = useCallback((index: number, length: number = 1) => {
    arrayRef.current?.delete(index, length)
  }, [])

  const move = useCallback((fromIndex: number, toIndex: number) => {
    if (!arrayRef.current) return
    const item = arrayRef.current.get(fromIndex)
    arrayRef.current.delete(fromIndex, 1)
    arrayRef.current.insert(toIndex, [item])
  }, [])

  return {
    ...collaboration,
    items,
    yArray: arrayRef.current,
    push,
    insert,
    remove,
    move
  }
}

export default useYjsCollaboration
