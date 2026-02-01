'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import * as Y from 'yjs'
import { createYjsProvider, ConnectionStatus, YjsProviderInstance } from './yjs-provider'
import { getClientSession } from '@/lib/demo-session'

// Types
export interface CollaboratorInfo {
  id: string
  name: string
  avatar?: string
  color: string
  cursor?: { x: number; y: number }
  selection?: { start: number; end: number }
  isActive: boolean
}

export interface CollaborationState {
  documentId: string | null
  sessionId: string | null
  status: ConnectionStatus
  isConnected: boolean
  isSynced: boolean
  collaborators: CollaboratorInfo[]
  localUser: CollaboratorInfo | null
  doc: Y.Doc | null
}

export interface CollaborationActions {
  connect: (documentId: string, sessionId: string) => void
  disconnect: () => void
  updateCursor: (cursor: { x: number; y: number }) => void
  updateSelection: (selection: { start: number; end: number }) => void
  broadcastEvent: (eventType: string, data: any) => void
  setUserInfo: (info: Partial<CollaboratorInfo>) => void
}

export interface CollaborationContextValue extends CollaborationState, CollaborationActions {}

// Colors for collaborators
const COLLABORATOR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8B500', '#00CED1', '#FF69B4', '#32CD32', '#FF4500'
]

// Context
const CollaborationContext = createContext<CollaborationContextValue | null>(null)

// Provider
export function CollaborationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CollaborationState>({
    documentId: null,
    sessionId: null,
    status: 'disconnected',
    isConnected: false,
    isSynced: false,
    collaborators: [],
    localUser: null,
    doc: null
  })

  const yjsRef = useRef<YjsProviderInstance | null>(null)
  const colorIndex = useRef(Math.floor(Math.random() * COLLABORATOR_COLORS.length))

  // Generate user color
  const getUserColor = useCallback((userId: string) => {
    const hash = userId.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc)
    }, 0)
    return COLLABORATOR_COLORS[Math.abs(hash) % COLLABORATOR_COLORS.length]
  }, [])

  // Connect to collaboration session
  const connect = useCallback(async (documentId: string, sessionId: string) => {
    // Disconnect existing connection
    if (yjsRef.current) {
      yjsRef.current.destroy()
    }

    // Get user info (supports demo mode)
    const userData = await getClientSession()
    const userId = userData?.user?.id || `anon-${Math.random().toString(36).slice(2, 9)}`

    const localUser: CollaboratorInfo = {
      id: userId,
      name: userData?.user?.name || 'Anonymous',
      avatar: userData?.user?.image || userData?.user?.avatar_url,
      color: getUserColor(userId),
      isActive: true
    }

    setState(prev => ({
      ...prev,
      documentId,
      sessionId,
      localUser,
      status: 'connecting'
    }))

    // Create Yjs provider
    const yjs = createYjsProvider({
      documentId,
      roomId: `session-${sessionId}`,
      awareness: true,
      persistence: true,
      onSync: () => {
        setState(prev => ({ ...prev, isSynced: true, status: 'synced' }))
      },
      onStatusChange: (status) => {
        setState(prev => ({
          ...prev,
          status,
          isConnected: status === 'connected' || status === 'synced'
        }))
      },
      onError: (error) => {
        console.error('[Collaboration] Error:', error)
      }
    })

    yjsRef.current = yjs
    yjs.connect()

    // Setup awareness
    if (yjs.provider?.awareness) {
      const awareness = yjs.provider.awareness

      // Set local state
      awareness.setLocalStateField('user', localUser)

      // Listen to awareness changes
      awareness.on('change', () => {
        const states = awareness.getStates()
        const collaborators: CollaboratorInfo[] = []

        states.forEach((state, clientId) => {
          if (state.user && clientId !== awareness.clientID) {
            collaborators.push({
              ...state.user,
              cursor: state.cursor,
              selection: state.selection
            })
          }
        })

        setState(prev => ({ ...prev, collaborators }))
      })
    }

    setState(prev => ({ ...prev, doc: yjs.doc }))

    // Join session via API
    await fetch('/api/collaboration/presence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'join',
        sessionId,
        documentId
      })
    })
  }, [getUserColor])

  // Disconnect
  const disconnect = useCallback(async () => {
    if (yjsRef.current) {
      // Leave session via API
      if (state.sessionId) {
        await fetch('/api/collaboration/presence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'leave',
            sessionId: state.sessionId,
            documentId: state.documentId
          })
        })
      }

      yjsRef.current.destroy()
      yjsRef.current = null
    }

    setState({
      documentId: null,
      sessionId: null,
      status: 'disconnected',
      isConnected: false,
      isSynced: false,
      collaborators: [],
      localUser: null,
      doc: null
    })
  }, [state.sessionId, state.documentId])

  // Update cursor position
  const updateCursor = useCallback((cursor: { x: number; y: number }) => {
    const awareness = yjsRef.current?.provider?.awareness
    if (awareness) {
      awareness.setLocalStateField('cursor', cursor)
    }

    // Also update via API for non-Yjs clients
    if (state.sessionId) {
      fetch('/api/collaboration/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-cursor',
          sessionId: state.sessionId,
          cursor
        })
      }).catch(console.error)
    }
  }, [state.sessionId])

  // Update selection
  const updateSelection = useCallback((selection: { start: number; end: number }) => {
    const awareness = yjsRef.current?.provider?.awareness
    if (awareness) {
      awareness.setLocalStateField('selection', selection)
    }
  }, [])

  // Broadcast custom event
  const broadcastEvent = useCallback((eventType: string, data: any) => {
    if (state.sessionId) {
      fetch('/api/collaboration/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'broadcast',
          sessionId: state.sessionId,
          eventType,
          data
        })
      }).catch(console.error)
    }
  }, [state.sessionId])

  // Set user info
  const setUserInfo = useCallback((info: Partial<CollaboratorInfo>) => {
    const awareness = yjsRef.current?.provider?.awareness
    if (awareness && state.localUser) {
      const updatedUser = { ...state.localUser, ...info }
      awareness.setLocalStateField('user', updatedUser)
      setState(prev => ({ ...prev, localUser: updatedUser }))
    }
  }, [state.localUser])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (yjsRef.current) {
        yjsRef.current.destroy()
      }
    }
  }, [])

  // Heartbeat to maintain presence
  useEffect(() => {
    if (!state.isConnected || !state.sessionId) return

    const interval = setInterval(() => {
      fetch('/api/collaboration/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'heartbeat',
          sessionId: state.sessionId,
          documentId: state.documentId
        })
      }).catch(console.error)
    }, 30000) // Every 30 seconds

    return () => clearInterval(interval)
  }, [state.isConnected, state.sessionId, state.documentId])

  const value: CollaborationContextValue = {
    ...state,
    connect,
    disconnect,
    updateCursor,
    updateSelection,
    broadcastEvent,
    setUserInfo
  }

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  )
}

// Hook
export function useCollaboration() {
  const context = useContext(CollaborationContext)
  if (!context) {
    throw new Error('useCollaboration must be used within CollaborationProvider')
  }
  return context
}

// Hook to get shared Yjs types
export function useSharedContent<T = any>(name: string, defaultValue?: T) {
  const { doc, isSynced } = useCollaboration()
  const [content, setContent] = useState<T | undefined>(defaultValue)

  useEffect(() => {
    if (!doc) return

    const sharedMap = doc.getMap(name)

    // Initial value
    if (sharedMap.size > 0) {
      setContent(sharedMap.toJSON() as T)
    }

    // Listen to changes
    const observer = () => {
      setContent(sharedMap.toJSON() as T)
    }

    sharedMap.observe(observer)

    return () => {
      sharedMap.unobserve(observer)
    }
  }, [doc, name])

  const updateContent = useCallback((updater: (current: T | undefined) => T) => {
    if (!doc) return

    const sharedMap = doc.getMap(name)
    const newValue = updater(content)

    doc.transact(() => {
      Object.entries(newValue as Record<string, unknown>).forEach(([key, value]) => {
        sharedMap.set(key, value)
      })
    })
  }, [doc, name, content])

  return [content, updateContent, isSynced] as const
}

// Hook to get shared text (for editors)
export function useSharedText(name: string = 'content') {
  const { doc, isSynced } = useCollaboration()
  const [text, setText] = useState('')

  useEffect(() => {
    if (!doc) return

    const sharedText = doc.getText(name)

    // Initial value
    setText(sharedText.toString())

    // Listen to changes
    const observer = () => {
      setText(sharedText.toString())
    }

    sharedText.observe(observer)

    return () => {
      sharedText.unobserve(observer)
    }
  }, [doc, name])

  return { text, yText: doc?.getText(name), isSynced }
}
