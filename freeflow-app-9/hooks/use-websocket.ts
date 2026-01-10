/**
 * WebSocket Client Hook
 * React hook for real-time collaboration features
 *
 * Usage:
 * const { socket, joinRoom, sendCursorPosition, sendStateUpdate } = useWebSocket()
 */

'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { toast } from 'sonner'
import { createFeatureLogger } from '@/lib/logger'
import type {
  User,
  RoomUser,
  CursorPosition,
  StateUpdate,
  ChatMessage
} from '@/lib/websocket/socket-server'

const logger = createFeatureLogger('WebSocketClient')

export interface UseWebSocketOptions {
  user?: User
  autoConnect?: boolean
  reconnect?: boolean
}

export interface RoomState {
  id: string
  name: string
  type: string
  userCount: number
  users: RoomUser[]
  cursors: Map<string, CursorPosition>
  state: any
}

/**
 * WebSocket client hook for real-time collaboration
 */
export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { user, autoConnect = true, reconnect = true } = options

  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentRoom, setCurrentRoom] = useState<RoomState | null>(null)
  const [remoteCursors, setRemoteCursors] = useState<Map<string, CursorPosition>>(new Map())
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())

  const socketRef = useRef<Socket | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  // ============================================================================
  // CONNECTION MANAGEMENT
  // ============================================================================

  useEffect(() => {
    if (!autoConnect) return

    const socketUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000'

    const newSocket = io(socketUrl, {
      reconnection: reconnect,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    })

    socketRef.current = newSocket
    setSocket(newSocket)

    // Connection events
    newSocket.on('connect', () => {
      logger.info('Connected to WebSocket server', {
        socketId: newSocket.id
      })
      setIsConnected(true)
      toast.success('Connected to collaboration server')

      // Auto-authenticate if user is provided
      if (user) {
        authenticate(newSocket, user)
      }
    })

    newSocket.on('disconnect', (reason) => {
      logger.warn('Disconnected from WebSocket server', { reason })
      setIsConnected(false)
      setIsAuthenticated(false)
      toast.error('Disconnected from collaboration server')
    })

    newSocket.on('connect_error', (error) => {
      logger.error('Connection error', { error: error.message })
      toast.error('Failed to connect to collaboration server')
    })

    newSocket.on('reconnect', (attemptNumber) => {
      logger.info('Reconnected', { attemptNumber })
      toast.success('Reconnected to collaboration server')
    })

    newSocket.on('reconnect_failed', () => {
      logger.error('Reconnection failed')
      toast.error('Could not reconnect to collaboration server')
    })

    // Authentication
    newSocket.on('authenticated', ({ success }) => {
      if (success) {
        setIsAuthenticated(true)
        logger.info('Authenticated successfully')
      }
    })

    // Error handling
    newSocket.on('error', ({ message }) => {
      logger.error('Socket error', { message })
      toast.error(message || 'An error occurred')
    })

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      // Remove all event listeners before closing to prevent accumulation
      newSocket.off('connect')
      newSocket.off('disconnect')
      newSocket.off('connect_error')
      newSocket.off('reconnect')
      newSocket.off('reconnect_failed')
      newSocket.off('authenticated')
      newSocket.off('error')
      newSocket.close()
    }
  }, [autoConnect, reconnect, user])

  // ============================================================================
  // AUTHENTICATION
  // ============================================================================

  const authenticate = useCallback((socketInstance: Socket, userData: User) => {
    socketInstance.emit('authenticate', userData)
    logger.info('Authentication request sent', { userId: userData.id })
  }, [])

  // ============================================================================
  // ROOM MANAGEMENT
  // ============================================================================

  const joinRoom = useCallback((
    roomId: string,
    roomName?: string,
    roomType?: 'project' | 'document' | 'canvas' | 'video'
  ) => {
    if (!socket || !isAuthenticated) {
      toast.error('Not connected or authenticated')
      return
    }

    socket.emit('join-room', { roomId, roomName, roomType })

    // Listen for room events
    socket.once('room-joined', ({ room, users, state }) => {
      logger.info('Joined room', { roomId, userCount: users.length })

      setCurrentRoom({
        ...room,
        users,
        cursors: new Map(),
        state
      })

      toast.success(`Joined ${room.name}`)
    })

    socket.on('user-joined', ({ user: joinedUser, userCount }) => {
      logger.info('User joined room', {
        userId: joinedUser.id,
        userName: joinedUser.name,
        userCount
      })

      setCurrentRoom(prev => {
        if (!prev) return prev
        return {
          ...prev,
          users: [...prev.users, joinedUser],
          userCount
        }
      })

      toast.info(`${joinedUser.name} joined the room`)
    })

    socket.on('user-left', ({ userId, userName, userCount }) => {
      logger.info('User left room', { userId, userName, userCount })

      setCurrentRoom(prev => {
        if (!prev) return prev
        return {
          ...prev,
          users: prev.users.filter(u => u.id !== userId),
          userCount
        }
      })

      setRemoteCursors(prev => {
        const next = new Map(prev)
        next.delete(userId)
        return next
      })

      toast.info(`${userName} left the room`)
    })
  }, [socket, isAuthenticated])

  const leaveRoom = useCallback((roomId?: string) => {
    if (!socket) return

    socket.emit('leave-room', roomId)
    setCurrentRoom(null)
    setRemoteCursors(new Map())
    setMessages([])

    logger.info('Left room', { roomId })
  }, [socket])

  // ============================================================================
  // CURSOR SYNCHRONIZATION
  // ============================================================================

  const sendCursorPosition = useCallback((x: number, y: number, roomId: string) => {
    if (!socket || !isAuthenticated) return

    socket.emit('cursor-move', { x, y, roomId })
  }, [socket, isAuthenticated])

  const sendCursorLeave = useCallback((roomId: string) => {
    if (!socket) return

    socket.emit('cursor-leave', { roomId })
  }, [socket])

  // Listen for cursor updates
  useEffect(() => {
    if (!socket) return

    const handleCursorUpdate = (cursor: CursorPosition) => {
      setRemoteCursors(prev => {
        const next = new Map(prev)
        next.set(cursor.userId, cursor)
        return next
      })
    }

    const handleCursorRemoved = ({ userId }: { userId: string }) => {
      setRemoteCursors(prev => {
        const next = new Map(prev)
        next.delete(userId)
        return next
      })
    }

    socket.on('cursor-update', handleCursorUpdate)
    socket.on('cursor-removed', handleCursorRemoved)

    return () => {
      socket.off('cursor-update', handleCursorUpdate)
      socket.off('cursor-removed', handleCursorRemoved)
    }
  }, [socket])

  // ============================================================================
  // STATE SYNCHRONIZATION
  // ============================================================================

  const sendStateUpdate = useCallback((
    roomId: string,
    update: Omit<StateUpdate, 'userId' | 'timestamp'>
  ) => {
    if (!socket || !isAuthenticated || !user) return

    const fullUpdate: StateUpdate = {
      ...update,
      userId: user.id,
      timestamp: Date.now()
    }

    socket.emit('state-update', { roomId, update: fullUpdate })
  }, [socket, isAuthenticated, user])

  const replaceState = useCallback((roomId: string, state: any) => {
    if (!socket || !isAuthenticated) return

    socket.emit('state-replace', { roomId, state })
  }, [socket, isAuthenticated])

  // Listen for state updates
  useEffect(() => {
    if (!socket) return

    const handleStateSync = ({ update }: { update: StateUpdate }) => {
      logger.debug('State synced', {
        type: update.type,
        path: update.path,
        userId: update.userId
      })

      // Trigger custom event for state updates
      const event = new CustomEvent('collaboration-state-update', {
        detail: update
      })
      window.dispatchEvent(event)
    }

    const handleStateReplaced = ({ state }: { state: any }) => {
      logger.info('State replaced')

      const event = new CustomEvent('collaboration-state-replaced', {
        detail: state
      })
      window.dispatchEvent(event)
    }

    socket.on('state-sync', handleStateSync)
    socket.on('state-replaced', handleStateReplaced)

    return () => {
      socket.off('state-sync', handleStateSync)
      socket.off('state-replaced', handleStateReplaced)
    }
  }, [socket])

  // ============================================================================
  // CHAT & MESSAGING
  // ============================================================================

  const sendMessage = useCallback((roomId: string, content: string) => {
    if (!socket || !isAuthenticated) return

    socket.emit('chat-message', { roomId, content })
  }, [socket, isAuthenticated])

  const startTyping = useCallback((roomId: string) => {
    if (!socket || !isAuthenticated) return

    socket.emit('typing-start', { roomId })

    // Auto-stop typing after 3 seconds
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(roomId)
    }, 3000)
  }, [socket, isAuthenticated])

  const stopTyping = useCallback((roomId: string) => {
    if (!socket || !isAuthenticated) return

    socket.emit('typing-stop', { roomId })

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }, [socket, isAuthenticated])

  // Listen for chat events
  useEffect(() => {
    if (!socket) return

    const handleChatMessage = (message: ChatMessage) => {
      setMessages(prev => [...prev, message])
    }

    const handleUserTyping = ({ userId, userName }: { userId: string; userName: string }) => {
      setTypingUsers(prev => new Set(prev).add(userId))
    }

    const handleUserStoppedTyping = ({ userId }: { userId: string }) => {
      setTypingUsers(prev => {
        const next = new Set(prev)
        next.delete(userId)
        return next
      })
    }

    socket.on('chat-message', handleChatMessage)
    socket.on('user-typing', handleUserTyping)
    socket.on('user-stopped-typing', handleUserStoppedTyping)

    return () => {
      socket.off('chat-message', handleChatMessage)
      socket.off('user-typing', handleUserTyping)
      socket.off('user-stopped-typing', handleUserStoppedTyping)
    }
  }, [socket])

  // ============================================================================
  // PRESENCE & ACTIVITY
  // ============================================================================

  const sendActivity = useCallback((
    roomId: string,
    type: 'active' | 'idle' | 'away'
  ) => {
    if (!socket) return

    socket.emit('activity', { roomId, type })
  }, [socket])

  // ============================================================================
  // RETURN API
  // ============================================================================

  return {
    // Connection state
    socket,
    isConnected,
    isAuthenticated,

    // Room management
    currentRoom,
    joinRoom,
    leaveRoom,

    // Cursor sync
    remoteCursors: Array.from(remoteCursors.values()),
    sendCursorPosition,
    sendCursorLeave,

    // State sync
    sendStateUpdate,
    replaceState,

    // Chat
    messages,
    typingUsers: Array.from(typingUsers),
    sendMessage,
    startTyping,
    stopTyping,

    // Presence
    sendActivity
  }
}
