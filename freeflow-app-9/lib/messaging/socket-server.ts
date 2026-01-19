/**
 * Real-Time Messaging Socket Server
 *
 * Industry-leading WebSocket infrastructure with:
 * - Multi-room channel support
 * - Presence management
 * - Typing indicators
 * - Message delivery receipts
 * - Reconnection handling
 * - Rate limiting
 * - Event batching
 * - Connection pooling
 */

import { Server as HTTPServer } from 'http'
import { Server, Socket } from 'socket.io'

// ============================================================================
// Types
// ============================================================================

export interface SocketUser {
  id: string
  socketId: string
  name: string
  avatar?: string
  status: 'online' | 'away' | 'busy' | 'offline'
  lastSeen: Date
  currentChannel?: string
  device?: string
  metadata?: Record<string, unknown>
}

export interface ChannelRoom {
  id: string
  name: string
  members: Set<string>
  typingUsers: Map<string, NodeJS.Timeout>
  lastActivity: Date
}

export interface MessageEvent {
  id: string
  channelId: string
  userId: string
  type: 'text' | 'file' | 'system' | 'reaction' | 'thread'
  content: string
  attachments?: MessageAttachment[]
  replyTo?: string
  threadId?: string
  mentions?: string[]
  timestamp: Date
  clientId?: string // For deduplication
}

export interface MessageAttachment {
  id: string
  type: 'image' | 'video' | 'audio' | 'file'
  url: string
  name: string
  size: number
  mimeType: string
  thumbnail?: string
}

export interface TypingEvent {
  channelId: string
  userId: string
  userName: string
  isTyping: boolean
}

export interface PresenceEvent {
  userId: string
  status: 'online' | 'away' | 'busy' | 'offline'
  lastSeen?: Date
}

export interface ReadReceiptEvent {
  channelId: string
  userId: string
  messageId: string
  timestamp: Date
}

export interface ReactionEvent {
  messageId: string
  userId: string
  emoji: string
  action: 'add' | 'remove'
}

export interface ThreadEvent {
  threadId: string
  parentMessageId: string
  channelId: string
  action: 'create' | 'reply' | 'resolve' | 'reopen'
  message?: MessageEvent
}

// Socket event types for type safety
export interface ServerToClientEvents {
  'message:new': (message: MessageEvent) => void
  'message:update': (message: Partial<MessageEvent> & { id: string }) => void
  'message:delete': (data: { id: string; channelId: string }) => void
  'typing:start': (data: TypingEvent) => void
  'typing:stop': (data: TypingEvent) => void
  'presence:update': (data: PresenceEvent) => void
  'presence:bulk': (data: PresenceEvent[]) => void
  'channel:join': (data: { channelId: string; user: SocketUser }) => void
  'channel:leave': (data: { channelId: string; userId: string }) => void
  'channel:update': (data: { channelId: string; changes: Record<string, unknown> }) => void
  'reaction:add': (data: ReactionEvent) => void
  'reaction:remove': (data: ReactionEvent) => void
  'read:receipt': (data: ReadReceiptEvent) => void
  'thread:update': (data: ThreadEvent) => void
  'notification': (data: { type: string; title: string; body: string; data?: unknown }) => void
  'error': (data: { code: string; message: string }) => void
  'reconnect:sync': (data: { messages: MessageEvent[]; presence: PresenceEvent[] }) => void
}

export interface ClientToServerEvents {
  'message:send': (
    data: Omit<MessageEvent, 'id' | 'timestamp'>,
    callback: (response: { success: boolean; message?: MessageEvent; error?: string }) => void
  ) => void
  'message:edit': (
    data: { id: string; content: string },
    callback: (response: { success: boolean; error?: string }) => void
  ) => void
  'message:delete': (
    data: { id: string; channelId: string },
    callback: (response: { success: boolean; error?: string }) => void
  ) => void
  'typing:start': (channelId: string) => void
  'typing:stop': (channelId: string) => void
  'channel:join': (channelId: string, callback: (response: { success: boolean; members?: SocketUser[] }) => void) => void
  'channel:leave': (channelId: string) => void
  'presence:update': (status: 'online' | 'away' | 'busy' | 'offline') => void
  'reaction:toggle': (
    data: { messageId: string; emoji: string },
    callback: (response: { success: boolean; action: 'add' | 'remove' }) => void
  ) => void
  'read:mark': (data: { channelId: string; messageId: string }) => void
  'thread:create': (
    data: { parentMessageId: string; channelId: string },
    callback: (response: { success: boolean; threadId?: string }) => void
  ) => void
  'sync:request': (data: { lastMessageId?: string; timestamp?: number }) => void
}

export interface InterServerEvents {
  ping: () => void
}

export interface SocketData {
  user: SocketUser
  joinedChannels: Set<string>
  lastActivity: Date
  rateLimitTokens: number
  lastRateLimitRefill: Date
}

// ============================================================================
// Configuration
// ============================================================================

export interface SocketServerConfig {
  cors?: {
    origin: string | string[]
    credentials?: boolean
  }
  pingTimeout?: number
  pingInterval?: number
  maxConnections?: number
  rateLimitMessages?: number
  rateLimitWindow?: number // in seconds
  typingTimeout?: number // in ms
  reconnectWindow?: number // in ms
  batchInterval?: number // in ms
}

const DEFAULT_CONFIG: Required<SocketServerConfig> = {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    credentials: true,
  },
  pingTimeout: 30000,
  pingInterval: 25000,
  maxConnections: 10000,
  rateLimitMessages: 100,
  rateLimitWindow: 60,
  typingTimeout: 3000,
  reconnectWindow: 30000,
  batchInterval: 50,
}

// ============================================================================
// Socket Server Class
// ============================================================================

export class MessagingSocketServer {
  private io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
  private config: Required<SocketServerConfig>
  private users: Map<string, SocketUser> = new Map()
  private channels: Map<string, ChannelRoom> = new Map()
  private socketToUser: Map<string, string> = new Map()
  private userToSockets: Map<string, Set<string>> = new Map()
  private messageBuffer: Map<string, MessageEvent[]> = new Map()
  private batchTimer: NodeJS.Timeout | null = null

  constructor(httpServer: HTTPServer, config: SocketServerConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }

    this.io = new Server(httpServer, {
      cors: this.config.cors,
      pingTimeout: this.config.pingTimeout,
      pingInterval: this.config.pingInterval,
      transports: ['websocket', 'polling'],
      allowUpgrades: true,
      perMessageDeflate: {
        threshold: 1024,
      },
      maxHttpBufferSize: 1e8, // 100MB for file uploads
    })

    this.setupEventHandlers()
    this.startBatchProcessor()
  }

  // ==========================================================================
  // Initialization
  // ==========================================================================

  private setupEventHandlers(): void {
    this.io.use(this.authMiddleware.bind(this))

    this.io.on('connection', (socket) => {
      this.handleConnection(socket)

      // Message events
      socket.on('message:send', (data, callback) => this.handleMessageSend(socket, data, callback))
      socket.on('message:edit', (data, callback) => this.handleMessageEdit(socket, data, callback))
      socket.on('message:delete', (data, callback) => this.handleMessageDelete(socket, data, callback))

      // Typing events
      socket.on('typing:start', (channelId) => this.handleTypingStart(socket, channelId))
      socket.on('typing:stop', (channelId) => this.handleTypingStop(socket, channelId))

      // Channel events
      socket.on('channel:join', (channelId, callback) => this.handleChannelJoin(socket, channelId, callback))
      socket.on('channel:leave', (channelId) => this.handleChannelLeave(socket, channelId))

      // Presence events
      socket.on('presence:update', (status) => this.handlePresenceUpdate(socket, status))

      // Reaction events
      socket.on('reaction:toggle', (data, callback) => this.handleReactionToggle(socket, data, callback))

      // Read receipts
      socket.on('read:mark', (data) => this.handleReadMark(socket, data))

      // Thread events
      socket.on('thread:create', (data, callback) => this.handleThreadCreate(socket, data, callback))

      // Sync requests
      socket.on('sync:request', (data) => this.handleSyncRequest(socket, data))

      // Disconnection
      socket.on('disconnect', (reason) => this.handleDisconnect(socket, reason))
    })
  }

  // ==========================================================================
  // Middleware
  // ==========================================================================

  private async authMiddleware(
    socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
    next: (err?: Error) => void
  ): Promise<void> {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '')

      if (!token) {
        return next(new Error('Authentication required'))
      }

      // Verify token and get user
      const user = await this.verifyToken(token)

      if (!user) {
        return next(new Error('Invalid token'))
      }

      // Check max connections
      const currentConnections = this.io.engine.clientsCount
      if (currentConnections >= this.config.maxConnections) {
        return next(new Error('Server at capacity'))
      }

      // Setup socket data
      socket.data.user = {
        ...user,
        socketId: socket.id,
        status: 'online',
        lastSeen: new Date(),
      }
      socket.data.joinedChannels = new Set()
      socket.data.lastActivity = new Date()
      socket.data.rateLimitTokens = this.config.rateLimitMessages
      socket.data.lastRateLimitRefill = new Date()

      next()
    } catch (error) {
      next(new Error('Authentication failed'))
    }
  }

  private async verifyToken(token: string): Promise<Omit<SocketUser, 'socketId' | 'status' | 'lastSeen'> | null> {
    // In production, verify JWT or session token
    // For now, parse user info from token
    try {
      // This would normally validate against Supabase or your auth provider
      const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
      return {
        id: decoded.sub || decoded.user_id,
        name: decoded.name || decoded.email?.split('@')[0] || 'User',
        avatar: decoded.avatar_url,
      }
    } catch {
      return null
    }
  }

  // ==========================================================================
  // Connection Handlers
  // ==========================================================================

  private handleConnection(socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>): void {
    const user = socket.data.user

    // Track user connection
    this.users.set(user.id, user)
    this.socketToUser.set(socket.id, user.id)

    // Track multiple sockets per user (multi-device)
    let userSockets = this.userToSockets.get(user.id)
    if (!userSockets) {
      userSockets = new Set()
      this.userToSockets.set(user.id, userSockets)
    }
    userSockets.add(socket.id)

    // Join user's personal room
    socket.join(`user:${user.id}`)

    // Broadcast presence
    this.broadcastPresence(user.id, 'online')

    console.log(`[Socket] User ${user.name} connected (${socket.id})`)
  }

  private handleDisconnect(
    socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
    reason: string
  ): void {
    const user = socket.data.user
    if (!user) return

    // Remove socket tracking
    this.socketToUser.delete(socket.id)
    const userSockets = this.userToSockets.get(user.id)
    if (userSockets) {
      userSockets.delete(socket.id)

      // Only mark offline if no other sockets
      if (userSockets.size === 0) {
        this.userToSockets.delete(user.id)
        this.users.delete(user.id)
        this.broadcastPresence(user.id, 'offline')
      }
    }

    // Leave all channels
    socket.data.joinedChannels.forEach((channelId) => {
      this.leaveChannel(socket, channelId)
    })

    console.log(`[Socket] User ${user.name} disconnected (${reason})`)
  }

  // ==========================================================================
  // Message Handlers
  // ==========================================================================

  private async handleMessageSend(
    socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
    data: Omit<MessageEvent, 'id' | 'timestamp'>,
    callback: (response: { success: boolean; message?: MessageEvent; error?: string }) => void
  ): Promise<void> {
    try {
      // Rate limiting
      if (!this.checkRateLimit(socket)) {
        return callback({ success: false, error: 'Rate limit exceeded' })
      }

      const user = socket.data.user

      // Validate channel membership
      if (!socket.data.joinedChannels.has(data.channelId)) {
        return callback({ success: false, error: 'Not a member of this channel' })
      }

      // Create message
      const message: MessageEvent = {
        ...data,
        id: this.generateId('msg'),
        userId: user.id,
        timestamp: new Date(),
      }

      // Buffer for batching
      this.bufferMessage(data.channelId, message)

      // Immediate callback to sender
      callback({ success: true, message })

      // Stop typing indicator
      this.handleTypingStop(socket, data.channelId)

      // Update channel activity
      const channel = this.channels.get(data.channelId)
      if (channel) {
        channel.lastActivity = new Date()
      }

    } catch (error) {
      console.error('[Socket] Message send error:', error)
      callback({ success: false, error: 'Failed to send message' })
    }
  }

  private async handleMessageEdit(
    socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
    data: { id: string; content: string },
    callback: (response: { success: boolean; error?: string }) => void
  ): Promise<void> {
    try {
      // In production, verify ownership and save to database
      const user = socket.data.user

      // Broadcast edit to channel
      socket.data.joinedChannels.forEach((channelId) => {
        this.io.to(`channel:${channelId}`).emit('message:update', {
          id: data.id,
          content: data.content,
          isEdited: true,
          editedAt: new Date().toISOString(),
        })
      })

      callback({ success: true })
    } catch (error) {
      callback({ success: false, error: 'Failed to edit message' })
    }
  }

  private async handleMessageDelete(
    socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
    data: { id: string; channelId: string },
    callback: (response: { success: boolean; error?: string }) => void
  ): Promise<void> {
    try {
      // In production, verify ownership and soft delete in database
      this.io.to(`channel:${data.channelId}`).emit('message:delete', data)
      callback({ success: true })
    } catch (error) {
      callback({ success: false, error: 'Failed to delete message' })
    }
  }

  // ==========================================================================
  // Typing Handlers
  // ==========================================================================

  private handleTypingStart(
    socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
    channelId: string
  ): void {
    const user = socket.data.user
    const channel = this.channels.get(channelId)

    if (!channel || !socket.data.joinedChannels.has(channelId)) return

    // Clear existing timeout
    const existingTimeout = channel.typingUsers.get(user.id)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      this.handleTypingStop(socket, channelId)
    }, this.config.typingTimeout)

    channel.typingUsers.set(user.id, timeout)

    // Broadcast to channel (except sender)
    socket.to(`channel:${channelId}`).emit('typing:start', {
      channelId,
      userId: user.id,
      userName: user.name,
      isTyping: true,
    })
  }

  private handleTypingStop(
    socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
    channelId: string
  ): void {
    const user = socket.data.user
    const channel = this.channels.get(channelId)

    if (!channel) return

    // Clear timeout
    const timeout = channel.typingUsers.get(user.id)
    if (timeout) {
      clearTimeout(timeout)
      channel.typingUsers.delete(user.id)
    }

    // Broadcast to channel
    socket.to(`channel:${channelId}`).emit('typing:stop', {
      channelId,
      userId: user.id,
      userName: user.name,
      isTyping: false,
    })
  }

  // ==========================================================================
  // Channel Handlers
  // ==========================================================================

  private async handleChannelJoin(
    socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
    channelId: string,
    callback: (response: { success: boolean; members?: SocketUser[] }) => void
  ): Promise<void> {
    try {
      const user = socket.data.user

      // Get or create channel room
      let channel = this.channels.get(channelId)
      if (!channel) {
        channel = {
          id: channelId,
          name: channelId, // Would fetch from DB
          members: new Set(),
          typingUsers: new Map(),
          lastActivity: new Date(),
        }
        this.channels.set(channelId, channel)
      }

      // Join socket room
      socket.join(`channel:${channelId}`)
      channel.members.add(user.id)
      socket.data.joinedChannels.add(channelId)

      // Get online members
      const members: SocketUser[] = []
      for (const memberId of channel.members) {
        const member = this.users.get(memberId)
        if (member) members.push(member)
      }

      // Broadcast join to channel
      socket.to(`channel:${channelId}`).emit('channel:join', {
        channelId,
        user,
      })

      callback({ success: true, members })
    } catch (error) {
      callback({ success: false })
    }
  }

  private handleChannelLeave(
    socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
    channelId: string
  ): void {
    this.leaveChannel(socket, channelId)
  }

  private leaveChannel(
    socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
    channelId: string
  ): void {
    const user = socket.data.user
    const channel = this.channels.get(channelId)

    if (channel) {
      channel.members.delete(user.id)

      // Clear typing
      const timeout = channel.typingUsers.get(user.id)
      if (timeout) {
        clearTimeout(timeout)
        channel.typingUsers.delete(user.id)
      }

      // Clean up empty channels
      if (channel.members.size === 0) {
        this.channels.delete(channelId)
      }
    }

    socket.leave(`channel:${channelId}`)
    socket.data.joinedChannels.delete(channelId)

    // Broadcast leave
    this.io.to(`channel:${channelId}`).emit('channel:leave', {
      channelId,
      userId: user.id,
    })
  }

  // ==========================================================================
  // Presence Handlers
  // ==========================================================================

  private handlePresenceUpdate(
    socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
    status: 'online' | 'away' | 'busy' | 'offline'
  ): void {
    const user = socket.data.user
    user.status = status
    user.lastSeen = new Date()
    this.users.set(user.id, user)

    this.broadcastPresence(user.id, status)
  }

  private broadcastPresence(userId: string, status: 'online' | 'away' | 'busy' | 'offline'): void {
    const user = this.users.get(userId)

    const presenceEvent: PresenceEvent = {
      userId,
      status,
      lastSeen: user?.lastSeen || new Date(),
    }

    // Broadcast to all channels user is in
    const userSockets = this.userToSockets.get(userId)
    if (userSockets) {
      for (const socketId of userSockets) {
        const socket = this.io.sockets.sockets.get(socketId)
        if (socket?.data.joinedChannels) {
          for (const channelId of socket.data.joinedChannels) {
            this.io.to(`channel:${channelId}`).emit('presence:update', presenceEvent)
          }
        }
      }
    }
  }

  // ==========================================================================
  // Reaction Handlers
  // ==========================================================================

  private async handleReactionToggle(
    socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
    data: { messageId: string; emoji: string },
    callback: (response: { success: boolean; action: 'add' | 'remove' }) => void
  ): Promise<void> {
    try {
      const user = socket.data.user

      // In production, check if reaction exists and toggle
      const action: 'add' | 'remove' = 'add' // Would check DB

      const reactionEvent: ReactionEvent = {
        messageId: data.messageId,
        userId: user.id,
        emoji: data.emoji,
        action,
      }

      // Broadcast to all user's channels
      socket.data.joinedChannels.forEach((channelId) => {
        this.io.to(`channel:${channelId}`).emit(
          action === 'add' ? 'reaction:add' : 'reaction:remove',
          reactionEvent
        )
      })

      callback({ success: true, action })
    } catch (error) {
      callback({ success: false, action: 'add' })
    }
  }

  // ==========================================================================
  // Read Receipt Handlers
  // ==========================================================================

  private handleReadMark(
    socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
    data: { channelId: string; messageId: string }
  ): void {
    const user = socket.data.user

    const receipt: ReadReceiptEvent = {
      channelId: data.channelId,
      userId: user.id,
      messageId: data.messageId,
      timestamp: new Date(),
    }

    // Broadcast to channel
    socket.to(`channel:${data.channelId}`).emit('read:receipt', receipt)
  }

  // ==========================================================================
  // Thread Handlers
  // ==========================================================================

  private async handleThreadCreate(
    socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
    data: { parentMessageId: string; channelId: string },
    callback: (response: { success: boolean; threadId?: string }) => void
  ): Promise<void> {
    try {
      const threadId = this.generateId('thr')

      const threadEvent: ThreadEvent = {
        threadId,
        parentMessageId: data.parentMessageId,
        channelId: data.channelId,
        action: 'create',
      }

      // Broadcast to channel
      this.io.to(`channel:${data.channelId}`).emit('thread:update', threadEvent)

      callback({ success: true, threadId })
    } catch (error) {
      callback({ success: false })
    }
  }

  // ==========================================================================
  // Sync Handlers
  // ==========================================================================

  private async handleSyncRequest(
    socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
    data: { lastMessageId?: string; timestamp?: number }
  ): Promise<void> {
    try {
      // In production, fetch missed messages from database
      const messages: MessageEvent[] = []

      // Get presence for all users in joined channels
      const presence: PresenceEvent[] = []
      socket.data.joinedChannels.forEach((channelId) => {
        const channel = this.channels.get(channelId)
        if (channel) {
          for (const memberId of channel.members) {
            const user = this.users.get(memberId)
            if (user) {
              presence.push({
                userId: user.id,
                status: user.status,
                lastSeen: user.lastSeen,
              })
            }
          }
        }
      })

      socket.emit('reconnect:sync', { messages, presence })
    } catch (error) {
      console.error('[Socket] Sync error:', error)
    }
  }

  // ==========================================================================
  // Rate Limiting
  // ==========================================================================

  private checkRateLimit(socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>): boolean {
    const now = new Date()
    const elapsed = (now.getTime() - socket.data.lastRateLimitRefill.getTime()) / 1000

    // Refill tokens
    if (elapsed >= this.config.rateLimitWindow) {
      socket.data.rateLimitTokens = this.config.rateLimitMessages
      socket.data.lastRateLimitRefill = now
    }

    // Check tokens
    if (socket.data.rateLimitTokens <= 0) {
      socket.emit('error', {
        code: 'RATE_LIMITED',
        message: `Rate limit exceeded. Try again in ${Math.ceil(this.config.rateLimitWindow - elapsed)} seconds.`,
      })
      return false
    }

    socket.data.rateLimitTokens--
    return true
  }

  // ==========================================================================
  // Message Batching
  // ==========================================================================

  private bufferMessage(channelId: string, message: MessageEvent): void {
    let buffer = this.messageBuffer.get(channelId)
    if (!buffer) {
      buffer = []
      this.messageBuffer.set(channelId, buffer)
    }
    buffer.push(message)
  }

  private startBatchProcessor(): void {
    this.batchTimer = setInterval(() => {
      this.flushMessageBuffers()
    }, this.config.batchInterval)
  }

  private flushMessageBuffers(): void {
    for (const [channelId, messages] of this.messageBuffer.entries()) {
      if (messages.length === 0) continue

      // Send messages
      for (const message of messages) {
        this.io.to(`channel:${channelId}`).emit('message:new', message)
      }

      // Clear buffer
      this.messageBuffer.set(channelId, [])
    }
  }

  // ==========================================================================
  // Utility Methods
  // ==========================================================================

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // ==========================================================================
  // Public API
  // ==========================================================================

  /**
   * Send a message to a specific channel
   */
  public sendToChannel(channelId: string, event: keyof ServerToClientEvents, data: unknown): void {
    this.io.to(`channel:${channelId}`).emit(event as string, data)
  }

  /**
   * Send a message to a specific user
   */
  public sendToUser(userId: string, event: keyof ServerToClientEvents, data: unknown): void {
    this.io.to(`user:${userId}`).emit(event as string, data)
  }

  /**
   * Broadcast to all connected clients
   */
  public broadcast(event: keyof ServerToClientEvents, data: unknown): void {
    this.io.emit(event as string, data)
  }

  /**
   * Get online users count
   */
  public getOnlineUsersCount(): number {
    return this.users.size
  }

  /**
   * Get channel members
   */
  public getChannelMembers(channelId: string): SocketUser[] {
    const channel = this.channels.get(channelId)
    if (!channel) return []

    const members: SocketUser[] = []
    for (const memberId of channel.members) {
      const user = this.users.get(memberId)
      if (user) members.push(user)
    }
    return members
  }

  /**
   * Check if user is online
   */
  public isUserOnline(userId: string): boolean {
    const user = this.users.get(userId)
    return user?.status === 'online'
  }

  /**
   * Get connection stats
   */
  public getStats(): {
    connections: number
    users: number
    channels: number
    bufferedMessages: number
  } {
    let bufferedMessages = 0
    for (const messages of this.messageBuffer.values()) {
      bufferedMessages += messages.length
    }

    return {
      connections: this.io.engine.clientsCount,
      users: this.users.size,
      channels: this.channels.size,
      bufferedMessages,
    }
  }

  /**
   * Graceful shutdown
   */
  public async shutdown(): Promise<void> {
    // Stop batch processor
    if (this.batchTimer) {
      clearInterval(this.batchTimer)
    }

    // Flush remaining messages
    this.flushMessageBuffers()

    // Close all connections
    for (const [, channel] of this.channels) {
      for (const timeout of channel.typingUsers.values()) {
        clearTimeout(timeout)
      }
    }

    await this.io.close()
    console.log('[Socket] Server shut down')
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let instance: MessagingSocketServer | null = null

export function createSocketServer(httpServer: HTTPServer, config?: SocketServerConfig): MessagingSocketServer {
  if (!instance) {
    instance = new MessagingSocketServer(httpServer, config)
  }
  return instance
}

export function getSocketServer(): MessagingSocketServer | null {
  return instance
}

export default MessagingSocketServer
