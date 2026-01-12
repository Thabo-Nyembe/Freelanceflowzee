import { EventEmitter } from 'events'
import { CommunicationEvent, CommunicationMessage, CommunicationUser } from './unified-communication-service'

// WebSocket Message Types
export interface WebSocketMessage {
  id: string
  type: 'ping' | 'pong' | 'auth' | 'subscribe' | 'unsubscribe' | 'message' | 'event' | 'error'
  payload: any
  timestamp: number
  userId?: string
  channelId?: string
}

export interface SubscriptionConfig {
  channels: string[]
  events: string[]
  userId: string
  filters?: Record<string, any>
}

export interface ConnectionConfig {
  url: string
  token?: string
  userId: string
  reconnectAttempts: number
  reconnectDelay: number
  heartbeatInterval: number
  connectionTimeout: number
  debug: boolean
}

export interface MessageQueueItem {
  message: WebSocketMessage
  timestamp: number
  attempts: number
  maxAttempts: number
}

export interface ConnectionStats {
  connectedAt?: Date
  lastPing?: Date
  lastPong?: Date
  messagesSent: number
  messagesReceived: number
  reconnectAttempts: number
  uptime: number
  latency: number
}

// Real-time Messaging Service
export class RealTimeMessagingService extends EventEmitter {
  private ws: WebSocket | null = null
  private config: ConnectionConfig
  private subscriptions: Set<string> = new Set()
  private messageQueue: MessageQueueItem[] = []
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected'
  private heartbeatTimer: NodeJS.Timeout | null = null
  private reconnectTimer: NodeJS.Timeout | null = null
  private connectionTimer: NodeJS.Timeout | null = null
  private stats: ConnectionStats = {
    messagesSent: 0,
    messagesReceived: 0,
    reconnectAttempts: 0,
    uptime: 0,
    latency: 0
  }

  constructor(config: Partial<ConnectionConfig> = {}) {
    super()
    this.config = {
      url: '/api/ws',
      reconnectAttempts: 5,
      reconnectDelay: 1000,
      heartbeatInterval: 30000,
      connectionTimeout: 10000,
      debug: false,
      ...config
    } as ConnectionConfig

    this.setMaxListeners(100)
  }

  // Connection Management
  async connect(): Promise<void> {
    if (this.connectionStatus === 'connected' || this.connectionStatus === 'connecting') {
      return
    }

    this.connectionStatus = 'connecting'
    this.emit('statusChanged', 'connecting')

    try {
      await this.establishConnection()
    } catch (error) {
      this.handleConnectionError(error)
      throw error
    }
  }

  private async establishConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = this.buildWebSocketUrl()
        this.ws = new WebSocket(wsUrl)

        this.connectionTimer = setTimeout(() => {
          this.ws?.close()
          reject(new Error('Connection timeout'))
        }, this.config.connectionTimeout)

        this.ws.onopen = () => {
          if (this.connectionTimer) {
            clearTimeout(this.connectionTimer)
            this.connectionTimer = null
          }

          this.connectionStatus = 'connected'
          this.stats.connectedAt = new Date()
          this.stats.reconnectAttempts = 0

          this.emit('statusChanged', 'connected')
          this.emit('connected')

          // Send authentication
          this.authenticate()

          // Start heartbeat
          this.startHeartbeat()

          // Process queued messages
          this.processMessageQueue()

          this.log('Connected to WebSocket server')
          resolve()
        }

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data)
        }

        this.ws.onerror = (error) => {
          this.log('WebSocket error:', error)
          this.handleConnectionError(error)
          reject(error)
        }

        this.ws.onclose = (event) => {
          this.handleConnectionClose(event)
        }

      } catch (error) {
        reject(error)
      }
    })
  }

  private buildWebSocketUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    let url = `${protocol}//${host}${this.config.url}`

    if (this.config.token) {
      url += `?token=${encodeURIComponent(this.config.token)}`
    }

    return url
  }

  private authenticate(): void {
    if (!this.config.token || !this.config.userId) return

    this.sendMessage({
      type: 'auth',
      payload: {
        token: this.config.token,
        userId: this.config.userId
      }
    })
  }

  disconnect(): void {
    this.connectionStatus = 'disconnected'

    // Clear timers
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer)
      this.connectionTimer = null
    }

    // Close WebSocket
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }

    this.emit('statusChanged', 'disconnected')
    this.emit('disconnected')
    this.log('Disconnected from WebSocket server')
  }

  // Message Handling
  private handleMessage(data: string): void {
    try {
      const message: WebSocketMessage = JSON.parse(data)
      this.stats.messagesReceived++

      this.log('Received message:', message.type)

      switch (message.type) {
        case 'pong':
          this.handlePong(message)
          break
        case 'auth':
          this.handleAuth(message)
          break
        case 'message':
          this.handleChatMessage(message)
          break
        case 'event':
          this.handleEvent(message)
          break
        case 'error':
          this.handleError(message)
          break
        default:
          this.log('Unknown message type:', message.type)
      }

      this.emit('messageReceived', message)
    } catch (error) {
      this.log('Error parsing message:', error)
    }
  }

  private handlePong(message: WebSocketMessage): void {
    this.stats.lastPong = new Date()
    if (this.stats.lastPing) {
      this.stats.latency = Date.now() - this.stats.lastPing.getTime()
    }
    this.emit('pong', this.stats.latency)
  }

  private handleAuth(message: WebSocketMessage): void {
    if (message.payload.success) {
      this.log('Authentication successful')
      this.emit('authenticated')

      // Subscribe to channels
      this.resubscribeToChannels()
    } else {
      this.log('Authentication failed:', message.payload.error)
      this.emit('authenticationFailed', message.payload.error)
    }
  }

  private handleChatMessage(message: WebSocketMessage): void {
    this.emit('chatMessage', message.payload)
  }

  private handleEvent(message: WebSocketMessage): void {
    const event: CommunicationEvent = message.payload
    this.emit('communicationEvent', event)
    this.emit(`event:${event.type}`, event)
  }

  private handleError(message: WebSocketMessage): void {
    this.log('Server error:', message.payload)
    this.emit('serverError', message.payload)
  }

  // Connection Error Handling
  private handleConnectionError(error: any): void {
    this.connectionStatus = 'error'
    this.emit('statusChanged', 'error')
    this.emit('error', error)

    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer)
      this.connectionTimer = null
    }

    this.scheduleReconnect()
  }

  private handleConnectionClose(event: CloseEvent): void {
    this.log('WebSocket closed:', event.code, event.reason)

    this.connectionStatus = 'disconnected'
    this.emit('statusChanged', 'disconnected')

    // Clear timers
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }

    // Schedule reconnect if not intentional disconnect
    if (event.code !== 1000) {
      this.scheduleReconnect()
    }

    this.emit('connectionClosed', event)
  }

  private scheduleReconnect(): void {
    if (this.stats.reconnectAttempts >= this.config.reconnectAttempts) {
      this.log('Max reconnect attempts reached')
      this.emit('maxReconnectAttemptsReached')
      return
    }

    const delay = this.config.reconnectDelay * Math.pow(2, this.stats.reconnectAttempts)
    this.stats.reconnectAttempts++

    this.log(`Scheduling reconnect attempt ${this.stats.reconnectAttempts} in ${delay}ms`)

    this.reconnectTimer = setTimeout(() => {
      this.log('Attempting to reconnect...')
      this.connect().catch((error) => {
        this.log('Reconnect failed:', error)
      })
    }, delay)

    this.emit('reconnectScheduled', { attempt: this.stats.reconnectAttempts, delay })
  }

  // Heartbeat
  private startHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
    }

    this.heartbeatTimer = setInterval(() => {
      this.ping()
    }, this.config.heartbeatInterval)
  }

  private ping(): void {
    if (this.connectionStatus !== 'connected') return

    this.stats.lastPing = new Date()
    this.sendMessage({
      type: 'ping',
      payload: { timestamp: Date.now() }
    })
  }

  // Message Queue
  private processMessageQueue(): void {
    const currentTime = Date.now()

    this.messageQueue = this.messageQueue.filter(item => {
      if (item.attempts >= item.maxAttempts) {
        this.emit('messageDropped', item.message)
        return false
      }

      if (this.connectionStatus === 'connected') {
        this.sendMessageDirect(item.message)
        return false
      }

      return true
    })
  }

  private queueMessage(message: WebSocketMessage, maxAttempts = 3): void {
    this.messageQueue.push({
      message,
      timestamp: Date.now(),
      attempts: 0,
      maxAttempts
    })

    // Limit queue size
    if (this.messageQueue.length > 1000) {
      this.messageQueue.shift()
    }
  }

  // Message Sending
  sendMessage(message: Omit<WebSocketMessage, 'id' | 'timestamp'>): boolean {
    const fullMessage: WebSocketMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      userId: this.config.userId
    }

    if (this.connectionStatus === 'connected') {
      return this.sendMessageDirect(fullMessage)
    } else {
      this.queueMessage(fullMessage)
      return false
    }
  }

  private sendMessageDirect(message: WebSocketMessage): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return false
    }

    try {
      this.ws.send(JSON.stringify(message))
      this.stats.messagesSent++
      this.log('Sent message:', message.type)
      this.emit('messageSent', message)
      return true
    } catch (error) {
      this.log('Error sending message:', error)
      this.emit('sendError', { message, error })
      return false
    }
  }

  // Chat Operations
  sendChatMessage(message: CommunicationMessage): boolean {
    return this.sendMessage({
      type: 'message',
      payload: message,
      channelId: message.channelId
    })
  }

  broadcastEvent(event: CommunicationEvent): boolean {
    return this.sendMessage({
      type: 'event',
      payload: event,
      channelId: event.channelId
    })
  }

  // Subscriptions
  subscribeToChannel(channelId: string): boolean {
    if (this.subscriptions.has(channelId)) {
      return true
    }

    const success = this.sendMessage({
      type: 'subscribe',
      payload: { channelId }
    })

    if (success) {
      this.subscriptions.add(channelId)
    }

    return success
  }

  unsubscribeFromChannel(channelId: string): boolean {
    if (!this.subscriptions.has(channelId)) {
      return true
    }

    const success = this.sendMessage({
      type: 'unsubscribe',
      payload: { channelId }
    })

    if (success) {
      this.subscriptions.delete(channelId)
    }

    return success
  }

  private resubscribeToChannels(): void {
    this.subscriptions.forEach(channelId => {
      this.sendMessage({
        type: 'subscribe',
        payload: { channelId }
      })
    })
  }

  // User Presence
  updatePresence(status: CommunicationUser['status'], activity?: string): boolean {
    return this.sendMessage({
      type: 'event',
      payload: {
        type: 'user.presence_updated',
        payload: { status, activity, lastSeen: new Date() },
        userId: this.config.userId,
        timestamp: new Date()
      }
    })
  }

  sendTypingIndicator(channelId: string, isTyping: boolean): boolean {
    return this.sendMessage({
      type: 'event',
      payload: {
        type: isTyping ? 'user.typing_start' : 'user.typing_stop',
        payload: { channelId },
        userId: this.config.userId,
        channelId,
        timestamp: new Date()
      }
    })
  }

  // Call Signaling
  sendCallSignal(callId: string, signal: any): boolean {
    return this.sendMessage({
      type: 'event',
      payload: {
        type: 'call.signal',
        payload: { callId, signal },
        userId: this.config.userId,
        timestamp: new Date()
      }
    })
  }

  // Utility Methods
  getConnectionStatus(): string {
    return this.connectionStatus
  }

  getStats(): ConnectionStats {
    return {
      ...this.stats,
      uptime: this.stats.connectedAt ? Date.now() - this.stats.connectedAt.getTime() : 0
    }
  }

  isConnected(): boolean {
    return this.connectionStatus === 'connected'
  }

  getSubscriptions(): string[] {
    return Array.from(this.subscriptions)
  }

  getQueueSize(): number {
    return this.messageQueue.length
  }

  // Configuration
  updateConfig(updates: Partial<ConnectionConfig>): void {
    this.config = { ...this.config, ...updates }
  }

  // Logging
  private log(...args: any[]): void {
    if (this.config.debug) {
      console.log('[RealTimeMessaging]', ...args)
    }
  }

  // Cleanup
  destroy(): void {
    this.disconnect()
    this.removeAllListeners()
    this.messageQueue = []
    this.subscriptions.clear()
  }
}

// Singleton instance
let messagingServiceInstance: RealTimeMessagingService | null = null

export function getRealTimeMessagingService(config?: Partial<ConnectionConfig>): RealTimeMessagingService {
  if (!messagingServiceInstance) {
    messagingServiceInstance = new RealTimeMessagingService(config)
  } else if (config) {
    messagingServiceInstance.updateConfig(config)
  }
  return messagingServiceInstance
}

// React hook for real-time messaging
export function useRealTimeMessaging(config?: Partial<ConnectionConfig>) {
  const [service] = React.useState(() => getRealTimeMessagingService(config))
  const [connectionStatus, setConnectionStatus] = React.useState(service.getConnectionStatus())
  const [stats, setStats] = React.useState(service.getStats())

  React.useEffect(() => {
    const handleStatusChange = (status: string) => setConnectionStatus(status)
    const updateStats = () => setStats(service.getStats())

    service.on('statusChanged', handleStatusChange)
    service.on('messageSent', updateStats)
    service.on('messageReceived', updateStats)

    // Update stats periodically
    const statsInterval = setInterval(updateStats, 1000)

    return () => {
      service.off('statusChanged', handleStatusChange)
      service.off('messageSent', updateStats)
      service.off('messageReceived', updateStats)
      clearInterval(statsInterval)
    }
  }, [service])

  const connect = React.useCallback(() => {
    return service.connect()
  }, [service])

  const disconnect = React.useCallback(() => {
    service.disconnect()
  }, [service])

  const sendMessage = React.useCallback((message: Omit<WebSocketMessage, 'id' | 'timestamp'>) => {
    return service.sendMessage(message)
  }, [service])

  const subscribeToChannel = React.useCallback((channelId: string) => {
    return service.subscribeToChannel(channelId)
  }, [service])

  const unsubscribeFromChannel = React.useCallback((channelId: string) => {
    return service.unsubscribeFromChannel(channelId)
  }, [service])

  return {
    service,
    connectionStatus,
    stats,
    isConnected: connectionStatus === 'connected',
    connect,
    disconnect,
    sendMessage,
    subscribeToChannel,
    unsubscribeFromChannel
  }
}

export default RealTimeMessagingService