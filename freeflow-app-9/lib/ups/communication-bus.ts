import { EventEmitter } from 'events'

export interface UPSMessage {
  id: string
  type: string
  source: string
  target?: string
  data: any
  timestamp: Date
  priority: 'low' | 'medium' | 'high' | 'urgent'
  persistent?: boolean
}

export interface UPSChannel {
  name: string
  description: string
  persistent: boolean
  maxHistory: number
  subscribers: Set<string>
}

export interface MessageHandler {
  id: string
  pattern: string | RegExp
  handler: (message: UPSMessage) => void | Promise<void>
  options: {
    once?: boolean
    priority?: number
    filter?: (message: UPSMessage) => boolean
  }
}

export interface UPSEvent {
  type: 'comment.created' | 'comment.updated' | 'comment.deleted' | 'comment.resolved' |
        'user.joined' | 'user.left' | 'user.presence' |
        'drawing.created' | 'drawing.updated' |
        'ai.analysis.complete' | 'ai.suggestion.generated' |
        'export.started' | 'export.complete' | 'export.failed' |
        'notification.created' | 'notification.read' |
        'filter.applied' | 'search.performed' |
        'system.error' | 'system.warning' | 'system.info' |
        'collaboration.cursor' | 'collaboration.typing' |
        'integration.connected' | 'integration.disconnected'
  payload: any
  source: string
  timestamp: Date
  metadata?: Record<string, any>
}

class UPSCommunicationBus extends EventEmitter {
  private channels: Map<string, UPSChannel> = new Map()
  private messageHistory: Map<string, UPSMessage[]> = new Map()
  private handlers: Map<string, MessageHandler> = new Map()
  private subscriptions: Map<string, Set<string>> = new Map()
  private performance: Map<string, { count: number; totalTime: number; errors: number }> = new Map()
  private isInitialized = false

  constructor() {
    super()
    this.setMaxListeners(100) // Increase limit for many components
  }

  initialize(): void {
    if (this.isInitialized) return

    // Create default channels
    this.createChannel('global', 'Global system messages', true, 1000)
    this.createChannel('comments', 'Comment-related messages', true, 500)
    this.createChannel('users', 'User presence and actions', false, 100)
    this.createChannel('ai', 'AI analysis and suggestions', true, 200)
    this.createChannel('collaboration', 'Real-time collaboration', false, 50)
    this.createChannel('export', 'Export operations', true, 100)
    this.createChannel('notifications', 'System notifications', true, 200)
    this.createChannel('errors', 'Error reporting', true, 100)

    // Set up error handling
    this.on('error', (error) => {
      console.error('UPS Communication Bus Error:', error)
      this.emit('system.error', { error: error.message, stack: error.stack })
    })

    this.isInitialized = true
    this.emit('system.info', { message: 'UPS Communication Bus initialized' })
  }

  // Channel Management
  createChannel(name: string, description: string, persistent: boolean = false, maxHistory: number = 100): UPSChannel {
    const channel: UPSChannel = {
      name,
      description,
      persistent,
      maxHistory,
      subscribers: new Set()
    }

    this.channels.set(name, channel)
    this.messageHistory.set(name, [])

    this.emit('channel.created', { channel: name, description })
    return channel
  }

  removeChannel(name: string): boolean {
    if (!this.channels.has(name)) return false

    const channel = this.channels.get(name)!

    // Unsubscribe all subscribers
    channel.subscribers.forEach(subscriberId => {
      this.unsubscribe(subscriberId, name)
    })

    this.channels.delete(name)
    this.messageHistory.delete(name)

    this.emit('channel.removed', { channel: name })
    return true
  }

  getChannel(name: string): UPSChannel | undefined {
    return this.channels.get(name)
  }

  listChannels(): UPSChannel[] {
    return Array.from(this.channels.values())
  }

  // Message Publishing
  publish(channel: string, type: string, data: any, options: {
    source: string
    target?: string
    priority?: UPSMessage['priority']
    persistent?: boolean
  }): string {
    const messageId = this.generateMessageId()
    const message: UPSMessage = {
      id: messageId,
      type,
      source: options.source,
      target: options.target,
      data,
      timestamp: new Date(),
      priority: options.priority || 'medium',
      persistent: options.persistent
    }

    // Validate channel exists
    if (!this.channels.has(channel)) {
      throw new Error(`Channel '${channel}' does not exist`)
    }

    const startTime = performance.now()

    try {
      // Store message in history if channel is persistent
      const channelConfig = this.channels.get(channel)!
      if (channelConfig.persistent || message.persistent) {
        this.addToHistory(channel, message)
      }

      // Emit to subscribers
      this.emit(`message:${channel}`, message)
      this.emit('message', { channel, message })

      // Update performance metrics
      this.updatePerformanceMetrics(type, performance.now() - startTime, false)

      // Log for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log(`[UPS Bus] Published to '${channel}':`, { type, source: options.source, target: options.target })
      }

      return messageId
    } catch (error) {
      this.updatePerformanceMetrics(type, performance.now() - startTime, true)
      this.emit('error', error)
      throw error
    }
  }

  // Event Publishing (high-level interface)
  publishEvent(event: UPSEvent): string {
    const channel = this.getChannelForEventType(event.type)
    return this.publish(channel, event.type, event.payload, {
      source: event.source,
      priority: this.getPriorityForEventType(event.type)
    })
  }

  // Subscription Management
  subscribe(subscriberId: string, channel: string, handler: (message: UPSMessage) => void | Promise<void>, options: {
    pattern?: string | RegExp
    filter?: (message: UPSMessage) => boolean
    once?: boolean
    priority?: number
  } = {}): () => void {
    if (!this.channels.has(channel)) {
      throw new Error(`Channel '${channel}' does not exist`)
    }

    const handlerId = this.generateHandlerId()
    const messageHandler: MessageHandler = {
      id: handlerId,
      pattern: options.pattern || '.*',
      handler,
      options: {
        once: options.once,
        priority: options.priority || 0,
        filter: options.filter
      }
    }

    this.handlers.set(handlerId, messageHandler)

    // Add to subscriptions
    if (!this.subscriptions.has(subscriberId)) {
      this.subscriptions.set(subscriberId, new Set())
    }
    this.subscriptions.get(subscriberId)!.add(handlerId)

    // Add to channel subscribers
    this.channels.get(channel)!.subscribers.add(subscriberId)

    // Set up event listener
    const eventHandler = (message: UPSMessage) => {
      this.handleMessage(handlerId, message)
    }

    this.on(`message:${channel}`, eventHandler)

    // Send historical messages if channel is persistent
    const channelConfig = this.channels.get(channel)!
    if (channelConfig.persistent) {
      const history = this.messageHistory.get(channel) || []
      // Send last 10 messages to new subscriber
      history.slice(-10).forEach(historicalMessage => {
        setTimeout(() => {
          this.handleMessage(handlerId, historicalMessage)
        }, 0)
      })
    }

    this.emit('subscription.created', { subscriberId, channel, handlerId })

    // Return unsubscribe function
    return () => this.unsubscribe(subscriberId, channel, handlerId)
  }

  // High-level event subscription
  subscribeToEvent<T = any>(
    subscriberId: string,
    eventType: UPSEvent['type'] | UPSEvent['type'][],
    handler: (event: T) => void | Promise<void>,
    options: {
      filter?: (event: T) => boolean
      once?: boolean
    } = {}
  ): () => void {
    const eventTypes = Array.isArray(eventType) ? eventType : [eventType]
    const unsubscribeFunctions: (() => void)[] = []

    eventTypes.forEach(type => {
      const channel = this.getChannelForEventType(type)
      const unsubscribe = this.subscribe(
        subscriberId,
        channel,
        (message) => {
          if (message.type === type) {
            if (!options.filter || options.filter(message.data)) {
              handler(message.data)
            }
          }
        },
        {
          pattern: type,
          once: options.once
        }
      )
      unsubscribeFunctions.push(unsubscribe)
    })

    return () => {
      unsubscribeFunctions.forEach(fn => fn())
    }
  }

  unsubscribe(subscriberId: string, channel?: string, handlerId?: string): boolean {
    let removed = false

    if (handlerId) {
      // Remove specific handler
      if (this.handlers.has(handlerId)) {
        this.handlers.delete(handlerId)
        removed = true
      }
    } else if (channel) {
      // Remove all handlers for subscriber in specific channel
      const subscriberHandlers = this.subscriptions.get(subscriberId)
      if (subscriberHandlers) {
        subscriberHandlers.forEach(hId => {
          const handler = this.handlers.get(hId)
          if (handler) {
            this.handlers.delete(hId)
            removed = true
          }
        })
        subscriberHandlers.clear()
      }

      // Remove from channel subscribers
      const channelConfig = this.channels.get(channel)
      if (channelConfig) {
        channelConfig.subscribers.delete(subscriberId)
      }
    } else {
      // Remove all handlers for subscriber
      const subscriberHandlers = this.subscriptions.get(subscriberId)
      if (subscriberHandlers) {
        subscriberHandlers.forEach(hId => {
          this.handlers.delete(hId)
          removed = true
        })
        this.subscriptions.delete(subscriberId)
      }

      // Remove from all channel subscribers
      this.channels.forEach(channelConfig => {
        channelConfig.subscribers.delete(subscriberId)
      })
    }

    if (removed) {
      this.emit('subscription.removed', { subscriberId, channel, handlerId })
    }

    return removed
  }

  // Message Handling
  private async handleMessage(handlerId: string, message: UPSMessage): Promise<void> {
    const handler = this.handlers.get(handlerId)
    if (!handler) return

    try {
      // Check pattern matching
      if (handler.pattern instanceof RegExp) {
        if (!handler.pattern.test(message.type)) return
      } else if (typeof handler.pattern === 'string') {
        const regex = new RegExp(handler.pattern)
        if (!regex.test(message.type)) return
      }

      // Apply filter if provided
      if (handler.options.filter && !handler.options.filter(message)) {
        return
      }

      // Execute handler
      const result = handler.handler(message)
      if (result instanceof Promise) {
        await result
      }

      // Remove handler if it's a one-time subscription
      if (handler.options.once) {
        this.handlers.delete(handlerId)
      }
    } catch (error) {
      this.emit('error', error)
      console.error(`Error in message handler ${handlerId}:`, error)
    }
  }

  // History Management
  private addToHistory(channel: string, message: UPSMessage): void {
    const channelConfig = this.channels.get(channel)
    if (!channelConfig) return

    let history = this.messageHistory.get(channel) || []
    history.push(message)

    // Trim history if it exceeds max length
    if (history.length > channelConfig.maxHistory) {
      history = history.slice(-channelConfig.maxHistory)
    }

    this.messageHistory.set(channel, history)
  }

  getMessageHistory(channel: string, limit?: number): UPSMessage[] {
    const history = this.messageHistory.get(channel) || []
    return limit ? history.slice(-limit) : history
  }

  clearHistory(channel: string): void {
    this.messageHistory.set(channel, [])
    this.emit('history.cleared', { channel })
  }

  // Broadcasting
  broadcast(type: string, data: any, options: {
    source: string
    exclude?: string[]
    priority?: UPSMessage['priority']
    channels?: string[]
  }): string[] {
    const channels = options.channels || ['global']
    const messageIds: string[] = []

    channels.forEach(channel => {
      try {
        const messageId = this.publish(channel, type, data, {
          source: options.source,
          priority: options.priority
        })
        messageIds.push(messageId)
      } catch (error) {
        console.error(`Failed to broadcast to channel '${channel}':`, error)
      }
    })

    return messageIds
  }

  // Performance & Monitoring
  private updatePerformanceMetrics(type: string, duration: number, isError: boolean): void {
    if (!this.performance.has(type)) {
      this.performance.set(type, { count: 0, totalTime: 0, errors: 0 })
    }

    const metrics = this.performance.get(type)!
    metrics.count++
    metrics.totalTime += duration
    if (isError) metrics.errors++
  }

  getPerformanceMetrics(): Record<string, { count: number; averageTime: number; errors: number }> {
    const result: Record<string, { count: number; averageTime: number; errors: number }> = {}

    this.performance.forEach((metrics, type) => {
      result[type] = {
        count: metrics.count,
        averageTime: metrics.count > 0 ? metrics.totalTime / metrics.count : 0,
        errors: metrics.errors
      }
    })

    return result
  }

  // Health Check
  getHealthStatus(): {
    isHealthy: boolean
    channels: number
    activeSubscriptions: number
    messagesSent: number
    errors: number
    uptime: number
  } {
    const totalMessages = Array.from(this.performance.values()).reduce((sum, m) => sum + m.count, 0)
    const totalErrors = Array.from(this.performance.values()).reduce((sum, m) => sum + m.errors, 0)

    return {
      isHealthy: totalErrors < totalMessages * 0.1, // Less than 10% error rate
      channels: this.channels.size,
      activeSubscriptions: this.handlers.size,
      messagesSent: totalMessages,
      errors: totalErrors,
      uptime: process.uptime()
    }
  }

  // Utility Methods
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateHandlerId(): string {
    return `handler_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getChannelForEventType(eventType: UPSEvent['type']): string {
    if (eventType.startsWith('comment.')) return 'comments'
    if (eventType.startsWith('user.')) return 'users'
    if (eventType.startsWith('ai.')) return 'ai'
    if (eventType.startsWith('collaboration.')) return 'collaboration'
    if (eventType.startsWith('export.')) return 'export'
    if (eventType.startsWith('notification.')) return 'notifications'
    if (eventType.startsWith('system.')) return 'errors'
    return 'global'
  }

  private getPriorityForEventType(eventType: UPSEvent['type']): UPSMessage['priority'] {
    if (eventType.includes('error')) return 'urgent'
    if (eventType.includes('warning')) return 'high'
    if (eventType.startsWith('system.')) return 'high'
    if (eventType.startsWith('notification.')) return 'medium'
    if (eventType.startsWith('collaboration.')) return 'low'
    return 'medium'
  }

  // Cleanup
  destroy(): void {
    // Clear all handlers and subscriptions
    this.handlers.clear()
    this.subscriptions.clear()

    // Clear all channels
    this.channels.clear()
    this.messageHistory.clear()

    // Clear performance data
    this.performance.clear()

    // Remove all listeners
    this.removeAllListeners()

    this.isInitialized = false
    console.log('UPS Communication Bus destroyed')
  }
}

// Singleton instance
export const upsCommunicationBus = new UPSCommunicationBus()

// Initialize immediately
upsCommunicationBus.initialize()

// React hook for easy integration
export function useUPSCommunication(subscriberId: string) {
  const [isConnected, setIsConnected] = React.useState(true)

  React.useEffect(() => {
    const handleError = () => setIsConnected(false)
    const handleReconnect = () => setIsConnected(true)

    upsCommunicationBus.on('error', handleError)
    upsCommunicationBus.on('system.info', handleReconnect)

    return () => {
      upsCommunicationBus.off('error', handleError)
      upsCommunicationBus.off('system.info', handleReconnect)
      upsCommunicationBus.unsubscribe(subscriberId)
    }
  }, [subscriberId])

  return {
    bus: upsCommunicationBus,
    isConnected,
    subscribe: (channel: string, handler: (message: UPSMessage) => void, options?: any) =>
      upsCommunicationBus.subscribe(subscriberId, channel, handler, options),
    subscribeToEvent: <T = any>(
      eventType: UPSEvent['type'] | UPSEvent['type'][],
      handler: (event: T) => void,
      options?: any
    ) => upsCommunicationBus.subscribeToEvent(subscriberId, eventType, handler, options),
    publish: (channel: string, type: string, data: any, options: any) =>
      upsCommunicationBus.publish(channel, type, data, { ...options, source: subscriberId }),
    publishEvent: (event: Omit<UPSEvent, 'source' | 'timestamp'>) =>
      upsCommunicationBus.publishEvent({ ...event, source: subscriberId, timestamp: new Date() }),
    broadcast: (type: string, data: any, options?: any) =>
      upsCommunicationBus.broadcast(type, data, { ...options, source: subscriberId })
  }
}

export default upsCommunicationBus