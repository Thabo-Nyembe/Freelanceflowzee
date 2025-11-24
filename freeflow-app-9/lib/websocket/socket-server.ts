/**
 * WebSocket Server Configuration
 * Real-time collaboration infrastructure using Socket.IO
 *
 * Features:
 * - Room management
 * - User presence tracking
 * - Live cursor synchronization
 * - State broadcasting
 * - Chat integration
 * - Typing indicators
 */

import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('WebSocket')

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  color?: string
}

export interface RoomUser extends User {
  socketId: string
  joinedAt: number
  lastActivity: number
}

export interface CursorPosition {
  x: number
  y: number
  userId: string
  userName: string
  color: string
}

export interface StateUpdate {
  type: 'text' | 'canvas' | 'form' | 'selection'
  path: string
  value: any
  userId: string
  timestamp: number
}

export interface ChatMessage {
  id: string
  userId: string
  userName: string
  content: string
  timestamp: number
  type: 'text' | 'system'
}

export interface Room {
  id: string
  name: string
  type: 'project' | 'document' | 'canvas' | 'video'
  users: Map<string, RoomUser>
  cursors: Map<string, CursorPosition>
  state: any
  createdAt: number
  updatedAt: number
}

/**
 * WebSocket Server Manager
 * Handles all real-time collaboration features
 */
export class WebSocketServer {
  private io: SocketIOServer
  private rooms: Map<string, Room> = new Map()
  private userSockets: Map<string, Set<string>> = new Map() // userId -> Set of socketIds

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000
    })

    this.setupEventHandlers()
    logger.info('WebSocket server initialized')
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      logger.info('Client connected', { socketId: socket.id })

      // ========================================
      // AUTHENTICATION
      // ========================================
      socket.on('authenticate', (user: User) => {
        socket.data.user = user

        // Track user's sockets
        if (!this.userSockets.has(user.id)) {
          this.userSockets.set(user.id, new Set())
        }
        this.userSockets.get(user.id)!.add(socket.id)

        logger.info('User authenticated', {
          userId: user.id,
          userName: user.name,
          socketId: socket.id
        })

        socket.emit('authenticated', { success: true })
      })

      // ========================================
      // ROOM MANAGEMENT
      // ========================================
      socket.on('join-room', ({ roomId, roomName, roomType }: {
        roomId: string
        roomName?: string
        roomType?: Room['type']
      }) => {
        const user = socket.data.user as User
        if (!user) {
          socket.emit('error', { message: 'Not authenticated' })
          return
        }

        // Create room if doesn't exist
        if (!this.rooms.has(roomId)) {
          this.rooms.set(roomId, {
            id: roomId,
            name: roomName || roomId,
            type: roomType || 'document',
            users: new Map(),
            cursors: new Map(),
            state: {},
            createdAt: Date.now(),
            updatedAt: Date.now()
          })
          logger.info('Room created', { roomId, roomName, roomType })
        }

        const room = this.rooms.get(roomId)!

        // Add user to room
        const roomUser: RoomUser = {
          ...user,
          socketId: socket.id,
          joinedAt: Date.now(),
          lastActivity: Date.now()
        }

        room.users.set(user.id, roomUser)
        room.updatedAt = Date.now()

        socket.join(roomId)
        socket.data.roomId = roomId

        logger.info('User joined room', {
          userId: user.id,
          userName: user.name,
          roomId,
          userCount: room.users.size
        })

        // Notify user of current room state
        socket.emit('room-joined', {
          roomId,
          room: this.serializeRoom(room),
          users: Array.from(room.users.values()),
          state: room.state
        })

        // Notify other users in room
        socket.to(roomId).emit('user-joined', {
          user: roomUser,
          userCount: room.users.size
        })
      })

      socket.on('leave-room', (roomId?: string) => {
        const targetRoomId = roomId || socket.data.roomId
        if (!targetRoomId) return

        this.handleUserLeaveRoom(socket, targetRoomId)
      })

      // ========================================
      // CURSOR SYNCHRONIZATION
      // ========================================
      socket.on('cursor-move', ({ x, y, roomId }: {
        x: number
        y: number
        roomId: string
      }) => {
        const user = socket.data.user as User
        if (!user) return

        const room = this.rooms.get(roomId)
        if (!room) return

        const cursorPosition: CursorPosition = {
          x,
          y,
          userId: user.id,
          userName: user.name,
          color: user.color || this.getUserColor(user.id)
        }

        room.cursors.set(user.id, cursorPosition)
        room.updatedAt = Date.now()

        // Broadcast to other users in room
        socket.to(roomId).emit('cursor-update', cursorPosition)

        // Update last activity
        const roomUser = room.users.get(user.id)
        if (roomUser) {
          roomUser.lastActivity = Date.now()
        }
      })

      socket.on('cursor-leave', ({ roomId }: { roomId: string }) => {
        const user = socket.data.user as User
        if (!user) return

        const room = this.rooms.get(roomId)
        if (!room) return

        room.cursors.delete(user.id)
        socket.to(roomId).emit('cursor-removed', { userId: user.id })
      })

      // ========================================
      // STATE SYNCHRONIZATION
      // ========================================
      socket.on('state-update', ({ roomId, update }: {
        roomId: string
        update: StateUpdate
      }) => {
        const user = socket.data.user as User
        if (!user) return

        const room = this.rooms.get(roomId)
        if (!room) return

        // Apply state update
        this.applyStateUpdate(room, update)

        logger.debug('State updated', {
          roomId,
          type: update.type,
          path: update.path,
          userId: user.id
        })

        // Broadcast to other users
        socket.to(roomId).emit('state-sync', {
          update,
          timestamp: Date.now()
        })
      })

      socket.on('state-replace', ({ roomId, state }: {
        roomId: string
        state: any
      }) => {
        const user = socket.data.user as User
        if (!user) return

        const room = this.rooms.get(roomId)
        if (!room) return

        room.state = state
        room.updatedAt = Date.now()

        logger.info('State replaced', {
          roomId,
          userId: user.id
        })

        socket.to(roomId).emit('state-replaced', {
          state,
          timestamp: Date.now()
        })
      })

      // ========================================
      // CHAT & MESSAGING
      // ========================================
      socket.on('chat-message', ({ roomId, content }: {
        roomId: string
        content: string
      }) => {
        const user = socket.data.user as User
        if (!user) return

        const message: ChatMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          userId: user.id,
          userName: user.name,
          content,
          timestamp: Date.now(),
          type: 'text'
        }

        logger.info('Chat message', {
          roomId,
          userId: user.id,
          messageId: message.id
        })

        // Broadcast to all users in room (including sender)
        this.io.to(roomId).emit('chat-message', message)
      })

      socket.on('typing-start', ({ roomId }: { roomId: string }) => {
        const user = socket.data.user as User
        if (!user) return

        socket.to(roomId).emit('user-typing', {
          userId: user.id,
          userName: user.name
        })
      })

      socket.on('typing-stop', ({ roomId }: { roomId: string }) => {
        const user = socket.data.user as User
        if (!user) return

        socket.to(roomId).emit('user-stopped-typing', {
          userId: user.id
        })
      })

      // ========================================
      // PRESENCE & ACTIVITY
      // ========================================
      socket.on('activity', ({ roomId, type }: {
        roomId: string
        type: 'active' | 'idle' | 'away'
      }) => {
        const user = socket.data.user as User
        if (!user) return

        const room = this.rooms.get(roomId)
        if (!room) return

        const roomUser = room.users.get(user.id)
        if (roomUser) {
          roomUser.lastActivity = Date.now()
        }

        socket.to(roomId).emit('user-activity', {
          userId: user.id,
          type
        })
      })

      // ========================================
      // DISCONNECTION
      // ========================================
      socket.on('disconnect', () => {
        const user = socket.data.user as User
        const roomId = socket.data.roomId

        logger.info('Client disconnected', {
          socketId: socket.id,
          userId: user?.id,
          roomId
        })

        if (user) {
          // Remove socket from user's socket set
          const userSocketSet = this.userSockets.get(user.id)
          if (userSocketSet) {
            userSocketSet.delete(socket.id)
            if (userSocketSet.size === 0) {
              this.userSockets.delete(user.id)
            }
          }
        }

        if (roomId) {
          this.handleUserLeaveRoom(socket, roomId)
        }
      })

      // ========================================
      // ERROR HANDLING
      // ========================================
      socket.on('error', (error) => {
        logger.error('Socket error', {
          socketId: socket.id,
          error: error.message
        })
      })
    })
  }

  /**
   * Handle user leaving a room
   */
  private handleUserLeaveRoom(socket: any, roomId: string) {
    const user = socket.data.user as User
    if (!user) return

    const room = this.rooms.get(roomId)
    if (!room) return

    room.users.delete(user.id)
    room.cursors.delete(user.id)
    room.updatedAt = Date.now()

    socket.leave(roomId)

    logger.info('User left room', {
      userId: user.id,
      roomId,
      remainingUsers: room.users.size
    })

    // Notify other users
    socket.to(roomId).emit('user-left', {
      userId: user.id,
      userName: user.name,
      userCount: room.users.size
    })

    // Clean up empty rooms
    if (room.users.size === 0) {
      this.rooms.delete(roomId)
      logger.info('Room cleaned up (empty)', { roomId })
    }
  }

  /**
   * Apply state update to room
   */
  private applyStateUpdate(room: Room, update: StateUpdate) {
    const pathParts = update.path.split('.')
    let current = room.state

    // Navigate to the target location
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i]
      if (!current[part]) {
        current[part] = {}
      }
      current = current[part]
    }

    // Apply the update
    const lastPart = pathParts[pathParts.length - 1]
    current[lastPart] = update.value

    room.updatedAt = Date.now()
  }

  /**
   * Get consistent color for user
   */
  private getUserColor(userId: string): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
      '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
      '#F8B739', '#52B788', '#E07A5F', '#81B29A'
    ]

    // Generate consistent color based on userId
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i)
      hash = hash & hash
    }

    return colors[Math.abs(hash) % colors.length]
  }

  /**
   * Serialize room for transmission
   */
  private serializeRoom(room: Room) {
    return {
      id: room.id,
      name: room.name,
      type: room.type,
      userCount: room.users.size,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt
    }
  }

  /**
   * Get server statistics
   */
  public getStats() {
    return {
      connectedClients: this.io.engine.clientsCount,
      activeRooms: this.rooms.size,
      totalUsers: this.userSockets.size,
      rooms: Array.from(this.rooms.values()).map(room => ({
        id: room.id,
        name: room.name,
        type: room.type,
        users: room.users.size,
        cursors: room.cursors.size
      }))
    }
  }

  /**
   * Broadcast message to all connected clients
   */
  public broadcast(event: string, data: any) {
    this.io.emit(event, data)
    logger.info('Broadcast sent', { event, dataKeys: Object.keys(data) })
  }

  /**
   * Get IO instance for advanced usage
   */
  public getIO(): SocketIOServer {
    return this.io
  }
}

// Singleton instance
let wsServer: WebSocketServer | null = null

/**
 * Initialize WebSocket server
 */
export function initializeWebSocketServer(httpServer: HTTPServer): WebSocketServer {
  if (!wsServer) {
    wsServer = new WebSocketServer(httpServer)
  }
  return wsServer
}

/**
 * Get existing WebSocket server instance
 */
export function getWebSocketServer(): WebSocketServer | null {
  return wsServer
}
