/**
 * WebSocket Server utilities for real-time communication
 * Note: In Next.js API routes, WebSockets work differently.
 * This module provides utilities for WebSocket-like patterns.
 */

export interface WebSocketMessage {
  type: string
  data: unknown
  timestamp: number
  userId?: string
  roomId?: string
}

export interface WebSocketRoom {
  id: string
  clients: Set<string>
  createdAt: Date
}

// In-memory state for development
const rooms = new Map<string, WebSocketRoom>()
const messageQueues = new Map<string, WebSocketMessage[]>()

/**
 * WebSocket Server class for managing connections
 */
export class WebSocketServer {
  private static instance: WebSocketServer

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): WebSocketServer {
    if (!WebSocketServer.instance) {
      WebSocketServer.instance = new WebSocketServer()
    }
    return WebSocketServer.instance
  }

  /**
   * Creates or joins a room
   */
  joinRoom(roomId: string, clientId: string): void {
    let room = rooms.get(roomId)

    if (!room) {
      room = {
        id: roomId,
        clients: new Set(),
        createdAt: new Date()
      }
      rooms.set(roomId, room)
    }

    room.clients.add(clientId)
  }

  /**
   * Leaves a room
   */
  leaveRoom(roomId: string, clientId: string): void {
    const room = rooms.get(roomId)

    if (room) {
      room.clients.delete(clientId)

      if (room.clients.size === 0) {
        rooms.delete(roomId)
      }
    }
  }

  /**
   * Broadcasts a message to all clients in a room
   */
  broadcast(roomId: string, message: Omit<WebSocketMessage, 'timestamp'>): void {
    const room = rooms.get(roomId)

    if (!room) return

    const fullMessage: WebSocketMessage = {
      ...message,
      timestamp: Date.now(),
      roomId
    }

    // Queue message for each client
    room.clients.forEach(clientId => {
      const queue = messageQueues.get(clientId) || []
      queue.push(fullMessage)
      messageQueues.set(clientId, queue)

      // Limit queue size
      if (queue.length > 100) {
        queue.splice(0, queue.length - 100)
      }
    })
  }

  /**
   * Sends a message to a specific client
   */
  send(clientId: string, message: Omit<WebSocketMessage, 'timestamp'>): void {
    const queue = messageQueues.get(clientId) || []

    queue.push({
      ...message,
      timestamp: Date.now()
    })

    messageQueues.set(clientId, queue)

    // Limit queue size
    if (queue.length > 100) {
      queue.splice(0, queue.length - 100)
    }
  }

  /**
   * Gets pending messages for a client
   */
  getMessages(clientId: string): WebSocketMessage[] {
    const messages = messageQueues.get(clientId) || []
    messageQueues.set(clientId, [])
    return messages
  }

  /**
   * Gets room info
   */
  getRoom(roomId: string): WebSocketRoom | undefined {
    return rooms.get(roomId)
  }

  /**
   * Gets all rooms
   */
  getRooms(): WebSocketRoom[] {
    return Array.from(rooms.values())
  }

  /**
   * Gets client count in a room
   */
  getClientCount(roomId: string): number {
    const room = rooms.get(roomId)
    return room ? room.clients.size : 0
  }

  /**
   * Clears all rooms and messages (for testing)
   */
  clear(): void {
    rooms.clear()
    messageQueues.clear()
  }
}

// Export singleton instance
export const wsServer = WebSocketServer.getInstance()

// Export helper functions
export function createWebSocketRoom(roomId: string): WebSocketRoom {
  const room: WebSocketRoom = {
    id: roomId,
    clients: new Set(),
    createdAt: new Date()
  }
  rooms.set(roomId, room)
  return room
}

export function broadcastToRoom(
  roomId: string,
  type: string,
  data: unknown
): void {
  wsServer.broadcast(roomId, { type, data })
}

export function sendToClient(
  clientId: string,
  type: string,
  data: unknown
): void {
  wsServer.send(clientId, { type, data })
}
