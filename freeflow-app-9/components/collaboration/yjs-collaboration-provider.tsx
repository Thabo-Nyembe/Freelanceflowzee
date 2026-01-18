'use client'

/**
 * Yjs Collaboration Provider Component
 *
 * World-class real-time collaboration provider using Yjs CRDT
 * with Supabase sync and offline persistence.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
  useMemo
} from 'react'
import * as Y from 'yjs'
import {
  useYjsCollaboration,
  UseYjsCollaborationOptions,
  UseYjsCollaborationReturn
} from '@/hooks/use-yjs-collaboration'
import { UserAwarenessState } from '@/lib/collaboration/yjs-provider'
import { toast } from 'sonner'

// ============================================================================
// Context Types
// ============================================================================

interface YjsCollaborationContextValue extends UseYjsCollaborationReturn {
  // Additional context-specific values
  currentUser: {
    id: string
    name: string
    email?: string
    avatar?: string
    color?: string
  }
  otherUsers: UserAwarenessState[]
  registerBlockRef: (blockId: string, element: HTMLElement) => void
  unregisterBlockRef: (blockId: string) => void
}

const YjsCollaborationContext = createContext<YjsCollaborationContextValue | null>(null)

// ============================================================================
// Provider Props
// ============================================================================

interface YjsCollaborationProviderProps {
  documentId: string
  documentType: 'document' | 'canvas' | 'spreadsheet' | 'code' | 'project'
  currentUser: {
    id: string
    name: string
    email?: string
    avatar?: string
  }
  tableName?: string
  columnName?: string
  enableOffline?: boolean
  enableAwareness?: boolean
  showCursors?: boolean
  showSelections?: boolean
  showPresence?: boolean
  showNotifications?: boolean
  children: ReactNode
}

// ============================================================================
// Cursor Component
// ============================================================================

interface CursorProps {
  user: UserAwarenessState
}

function RemoteCursor({ user }: CursorProps) {
  if (!user.cursor) return null

  return (
    <div
      className="pointer-events-none fixed z-50 transition-all duration-75"
      style={{
        left: user.cursor.anchor,
        top: user.cursor.head,
        transform: 'translate(-2px, -2px)'
      }}
    >
      {/* Cursor pointer */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        style={{ color: user.user.color }}
      >
        <path
          d="M5.65376 12.4563L4.06714 6.2818C3.55219 4.13583 5.72266 2.31212 7.72806 3.16613L19.7937 8.51556C21.8228 9.38012 21.6712 12.3547 19.5442 12.9879L13.7538 14.7026C13.3902 14.8104 13.0776 15.0456 12.8731 15.3659L9.75475 20.2756C8.54729 22.1663 5.6224 21.4439 5.47406 19.2165L5.65376 12.4563Z"
          fill="currentColor"
        />
      </svg>

      {/* User name label */}
      <div
        className="absolute left-4 top-4 px-2 py-0.5 rounded text-xs text-white whitespace-nowrap shadow-sm"
        style={{ backgroundColor: user.user.color }}
      >
        {user.user.name}
        {user.isTyping && (
          <span className="ml-1 animate-pulse">typing...</span>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Selection Component
// ============================================================================

interface SelectionProps {
  user: UserAwarenessState
  blockElement?: HTMLElement | null
}

function RemoteSelection({ user, blockElement }: SelectionProps) {
  if (!user.selection || !blockElement) return null

  const { start, end } = user.selection

  // Create a highlight overlay
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        backgroundColor: `${user.user.color}30`,
        borderLeft: `2px solid ${user.user.color}`,
        borderRight: `2px solid ${user.user.color}`
      }}
    >
      {/* Selection highlight would need text range calculation */}
    </div>
  )
}

// ============================================================================
// Presence Component
// ============================================================================

interface PresenceProps {
  users: UserAwarenessState[]
  currentUserId: string
}

function PresenceIndicator({ users, currentUserId }: PresenceProps) {
  const otherUsers = users.filter(u => u.user.id !== currentUserId)

  if (otherUsers.length === 0) return null

  return (
    <div className="flex items-center -space-x-2">
      {otherUsers.slice(0, 5).map((user) => (
        <div
          key={user.user.id}
          className="relative"
          title={`${user.user.name}${user.isTyping ? ' (typing...)' : ''}`}
        >
          {user.user.avatar ? (
            <img
              src={user.user.avatar}
              alt={user.user.name}
              className="w-8 h-8 rounded-full border-2 border-white"
              style={{ borderColor: user.user.color }}
            />
          ) : (
            <div
              className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-medium"
              style={{ backgroundColor: user.user.color }}
            >
              {user.user.name.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Online indicator */}
          <span
            className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white"
            style={{
              backgroundColor: user.isTyping ? '#F59E0B' : '#10B981'
            }}
          />
        </div>
      ))}

      {otherUsers.length > 5 && (
        <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-600 font-medium">
          +{otherUsers.length - 5}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Connection Status Component
// ============================================================================

interface ConnectionStatusProps {
  isConnected: boolean
  isSynced: boolean
  isOffline: boolean
}

function ConnectionStatus({ isConnected, isSynced, isOffline }: ConnectionStatusProps) {
  if (isOffline) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-xs">
        <span className="w-2 h-2 rounded-full bg-amber-500" />
        Offline - Changes saved locally
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-800 rounded-full text-xs">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        Reconnecting...
      </div>
    )
  }

  if (!isSynced) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-xs">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        Syncing...
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-xs">
      <span className="w-2 h-2 rounded-full bg-green-500" />
      All changes saved
    </div>
  )
}

// ============================================================================
// Main Provider Component
// ============================================================================

export function YjsCollaborationProvider({
  documentId,
  documentType,
  currentUser,
  tableName,
  columnName,
  enableOffline = true,
  enableAwareness = true,
  showCursors = true,
  showSelections = true,
  showPresence = true,
  showNotifications = true,
  children
}: YjsCollaborationProviderProps) {
  // Block refs for selection tracking
  const blockRefs = useRef<{ [key: string]: HTMLElement }>({})

  // Initialize Yjs collaboration
  const collaboration = useYjsCollaboration({
    documentId,
    documentType,
    user: currentUser,
    tableName,
    columnName,
    enableOffline,
    enableAwareness,
    onConnect: () => {
      if (showNotifications) {
        toast.success('Connected to collaboration server')
      }
    },
    onDisconnect: () => {
      if (showNotifications) {
        toast.warning('Disconnected from collaboration server')
      }
    },
    onSync: (synced) => {
      if (synced && showNotifications) {
        toast.success('Document synced')
      }
    },
    onError: (error) => {
      if (showNotifications) {
        toast.error(`Collaboration error: ${error.message}`)
      }
    }
  })

  // Track mouse movement for cursor updates
  useEffect(() => {
    if (!enableAwareness) return

    const handleMouseMove = (e: MouseEvent) => {
      collaboration.updateCursor(e.clientX, e.clientY)
    }

    const handleSelectionChange = () => {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return

      const range = selection.getRangeAt(0)
      const blockId = Object.entries(blockRefs.current).find(([_, element]) =>
        element.contains(range.commonAncestorContainer)
      )?.[0]

      if (blockId) {
        collaboration.updateSelection(range.startOffset, range.endOffset, blockId)
      }
    }

    // Throttle mouse move
    let throttleTimer: NodeJS.Timeout | null = null
    const throttledMouseMove = (e: MouseEvent) => {
      if (throttleTimer) return
      throttleTimer = setTimeout(() => {
        handleMouseMove(e)
        throttleTimer = null
      }, 50)
    }

    document.addEventListener('mousemove', throttledMouseMove)
    document.addEventListener('selectionchange', handleSelectionChange)

    return () => {
      document.removeEventListener('mousemove', throttledMouseMove)
      document.removeEventListener('selectionchange', handleSelectionChange)
      if (throttleTimer) clearTimeout(throttleTimer)
    }
  }, [enableAwareness, collaboration])

  // Notify on user join/leave
  const previousUsers = useRef<string[]>([])
  useEffect(() => {
    if (!showNotifications) return

    const currentUserIds = collaboration.connectedUsers.map(u => u.user.id)
    const prevUserIds = previousUsers.current

    // Find new users
    const newUsers = collaboration.connectedUsers.filter(
      u => !prevUserIds.includes(u.user.id) && u.user.id !== currentUser.id
    )
    newUsers.forEach(u => {
      toast.info(`${u.user.name} joined`)
    })

    // Find left users
    const leftUserIds = prevUserIds.filter(
      id => !currentUserIds.includes(id) && id !== currentUser.id
    )
    // Note: We don't have user names for left users anymore

    previousUsers.current = currentUserIds
  }, [collaboration.connectedUsers, currentUser.id, showNotifications])

  // Block ref registration
  const registerBlockRef = (blockId: string, element: HTMLElement) => {
    blockRefs.current[blockId] = element
  }

  const unregisterBlockRef = (blockId: string) => {
    delete blockRefs.current[blockId]
  }

  // Filter other users (exclude current user)
  const otherUsers = useMemo(() => {
    return collaboration.connectedUsers.filter(u => u.user.id !== currentUser.id)
  }, [collaboration.connectedUsers, currentUser.id])

  // Context value
  const contextValue: YjsCollaborationContextValue = {
    ...collaboration,
    currentUser,
    otherUsers,
    registerBlockRef,
    unregisterBlockRef
  }

  return (
    <YjsCollaborationContext.Provider value={contextValue}>
      {/* Remote Cursors */}
      {showCursors && otherUsers.map(user => (
        <RemoteCursor key={user.user.id} user={user} />
      ))}

      {/* Remote Selections */}
      {showSelections && otherUsers
        .filter(user => user.selection?.blockId)
        .map(user => (
          <RemoteSelection
            key={user.user.id}
            user={user}
            blockElement={blockRefs.current[user.selection!.blockId!]}
          />
        ))}

      {children}
    </YjsCollaborationContext.Provider>
  )
}

// ============================================================================
// Hook to use collaboration context
// ============================================================================

export function useYjsCollaborationContext(): YjsCollaborationContextValue {
  const context = useContext(YjsCollaborationContext)
  if (!context) {
    throw new Error('useYjsCollaborationContext must be used within a YjsCollaborationProvider')
  }
  return context
}

// ============================================================================
// Collaboration Status Bar Component
// ============================================================================

export function CollaborationStatusBar() {
  const { isConnected, isSynced, isOffline, otherUsers, currentUser } = useYjsCollaborationContext()

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b">
      <ConnectionStatus
        isConnected={isConnected}
        isSynced={isSynced}
        isOffline={isOffline}
      />

      <PresenceIndicator
        users={[
          { user: { ...currentUser, color: '#3B82F6' }, lastActive: Date.now() },
          ...otherUsers
        ]}
        currentUserId={currentUser.id}
      />
    </div>
  )
}

// ============================================================================
// HOC for wrapping components with collaboration
// ============================================================================

export function withYjsCollaboration<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P & Omit<YjsCollaborationProviderProps, 'children'>> {
  return function WrappedComponent({
    documentId,
    documentType,
    currentUser,
    tableName,
    columnName,
    enableOffline,
    enableAwareness,
    showCursors,
    showSelections,
    showPresence,
    showNotifications,
    ...props
  }: P & Omit<YjsCollaborationProviderProps, 'children'>) {
    return (
      <YjsCollaborationProvider
        documentId={documentId}
        documentType={documentType}
        currentUser={currentUser}
        tableName={tableName}
        columnName={columnName}
        enableOffline={enableOffline}
        enableAwareness={enableAwareness}
        showCursors={showCursors}
        showSelections={showSelections}
        showPresence={showPresence}
        showNotifications={showNotifications}
      >
        <Component {...(props as P)} />
      </YjsCollaborationProvider>
    )
  }
}

export default YjsCollaborationProvider
