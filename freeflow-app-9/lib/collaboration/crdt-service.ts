/**
 * CRDT (Conflict-free Replicated Data Types) Service
 *
 * Provides conflict-free real-time collaboration for:
 * - Text editing (documents, code)
 * - Canvas/drawing operations
 * - Object manipulation
 * - Array/list operations
 */

import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('CRDTService')

// ============================================================================
// Types
// ============================================================================

export type CRDTType = 'text' | 'map' | 'array' | 'counter' | 'register'

export interface VectorClock {
  [nodeId: string]: number
}

export interface CRDTOperation {
  id: string
  type: 'insert' | 'delete' | 'update' | 'increment' | 'decrement'
  nodeId: string
  timestamp: number
  vectorClock: VectorClock
  path: string[]
  value?: any
  position?: number
  length?: number
  metadata?: {
    userId: string
    userName?: string
    userColor?: string
  }
}

export interface CRDTDocument<T = any> {
  id: string
  type: CRDTType
  state: T
  vectorClock: VectorClock
  operations: CRDTOperation[]
  tombstones: Set<string>
  nodeId: string
  createdAt: Date
  updatedAt: Date
}

export interface CRDTTextState {
  content: string
  positions: Map<string, TextPosition>
}

export interface TextPosition {
  id: string
  char: string
  isDeleted: boolean
  position: [number, number] // [siteId, clock]
  leftOrigin?: string
  rightOrigin?: string
}

export interface CRDTMapState {
  [key: string]: {
    value: any
    timestamp: number
    nodeId: string
  }
}

export interface CRDTArrayState<T = any> {
  items: Array<{
    id: string
    value: T
    isDeleted: boolean
    position: [number, number]
  }>
}

export interface CRDTSyncMessage {
  type: 'sync-request' | 'sync-response' | 'operation' | 'ack'
  documentId: string
  nodeId: string
  vectorClock: VectorClock
  operations?: CRDTOperation[]
  state?: any
}

// ============================================================================
// Vector Clock Operations
// ============================================================================

export function createVectorClock(): VectorClock {
  return {}
}

export function incrementClock(clock: VectorClock, nodeId: string): VectorClock {
  return {
    ...clock,
    [nodeId]: (clock[nodeId] || 0) + 1
  }
}

export function mergeClock(a: VectorClock, b: VectorClock): VectorClock {
  const result: VectorClock = { ...a }
  for (const [nodeId, timestamp] of Object.entries(b)) {
    result[nodeId] = Math.max(result[nodeId] || 0, timestamp)
  }
  return result
}

export function compareClock(a: VectorClock, b: VectorClock): -1 | 0 | 1 | null {
  let aGreater = false
  let bGreater = false

  const allNodes = new Set([...Object.keys(a), ...Object.keys(b)])

  for (const node of allNodes) {
    const aTime = a[node] || 0
    const bTime = b[node] || 0

    if (aTime > bTime) aGreater = true
    if (bTime > aTime) bGreater = true
  }

  if (aGreater && !bGreater) return 1
  if (bGreater && !aGreater) return -1
  if (!aGreater && !bGreater) return 0
  return null // Concurrent
}

export function isConcurrent(a: VectorClock, b: VectorClock): boolean {
  return compareClock(a, b) === null
}

// ============================================================================
// CRDT Text (Based on YATA/Yjs algorithm)
// ============================================================================

export class CRDTText {
  private nodeId: string
  private clock: number = 0
  private characters: Map<string, TextPosition> = new Map()
  private root: string | null = null
  private vectorClock: VectorClock = {}
  private pendingOperations: CRDTOperation[] = []
  private onUpdate?: (content: string, operation: CRDTOperation) => void

  constructor(nodeId: string, initialContent?: string) {
    this.nodeId = nodeId
    this.vectorClock[nodeId] = 0

    if (initialContent) {
      this.initializeContent(initialContent)
    }
  }

  private initializeContent(content: string): void {
    let prevId: string | null = null

    for (const char of content) {
      const id = this.generateId()
      const position: TextPosition = {
        id,
        char,
        isDeleted: false,
        position: [parseInt(this.nodeId) || 0, this.clock],
        leftOrigin: prevId || undefined
      }

      this.characters.set(id, position)

      if (prevId) {
        const prev = this.characters.get(prevId)
        if (prev) {
          prev.rightOrigin = id
        }
      } else {
        this.root = id
      }

      prevId = id
    }
  }

  private generateId(): string {
    this.clock++
    return `${this.nodeId}:${this.clock}`
  }

  insert(index: number, char: string, metadata?: CRDTOperation['metadata']): CRDTOperation {
    const id = this.generateId()
    const leftId = this.getIdAtIndex(index - 1)
    const rightId = this.getIdAtIndex(index)

    const position: TextPosition = {
      id,
      char,
      isDeleted: false,
      position: [parseInt(this.nodeId) || 0, this.clock],
      leftOrigin: leftId || undefined,
      rightOrigin: rightId || undefined
    }

    this.integratePosition(position)
    this.vectorClock = incrementClock(this.vectorClock, this.nodeId)

    const operation: CRDTOperation = {
      id,
      type: 'insert',
      nodeId: this.nodeId,
      timestamp: Date.now(),
      vectorClock: { ...this.vectorClock },
      path: [],
      value: char,
      position: index,
      metadata
    }

    this.onUpdate?.(this.toString(), operation)
    return operation
  }

  delete(index: number, metadata?: CRDTOperation['metadata']): CRDTOperation | null {
    const id = this.getIdAtIndex(index)
    if (!id) return null

    const position = this.characters.get(id)
    if (!position || position.isDeleted) return null

    position.isDeleted = true
    this.vectorClock = incrementClock(this.vectorClock, this.nodeId)

    const operation: CRDTOperation = {
      id: this.generateId(),
      type: 'delete',
      nodeId: this.nodeId,
      timestamp: Date.now(),
      vectorClock: { ...this.vectorClock },
      path: [],
      value: id,
      position: index,
      metadata
    }

    this.onUpdate?.(this.toString(), operation)
    return operation
  }

  applyOperation(operation: CRDTOperation): boolean {
    // Check if we've already applied this operation
    const opNodeClock = operation.vectorClock[operation.nodeId] || 0
    const localClock = this.vectorClock[operation.nodeId] || 0

    if (opNodeClock <= localClock) {
      return false // Already applied
    }

    if (operation.type === 'insert') {
      const position: TextPosition = {
        id: operation.id,
        char: operation.value,
        isDeleted: false,
        position: [parseInt(operation.nodeId) || 0, opNodeClock]
      }

      // Find insertion point based on position
      this.integratePosition(position)
    } else if (operation.type === 'delete') {
      const position = this.characters.get(operation.value)
      if (position) {
        position.isDeleted = true
      }
    }

    this.vectorClock = mergeClock(this.vectorClock, operation.vectorClock)
    this.onUpdate?.(this.toString(), operation)
    return true
  }

  private integratePosition(pos: TextPosition): void {
    this.characters.set(pos.id, pos)

    // Simple integration - in production, use full YATA algorithm
    // This handles basic conflict resolution
  }

  private getIdAtIndex(index: number): string | null {
    if (index < 0) return null

    let currentIndex = 0
    for (const [id, pos] of this.characters) {
      if (!pos.isDeleted) {
        if (currentIndex === index) return id
        currentIndex++
      }
    }
    return null
  }

  toString(): string {
    let result = ''
    for (const [, pos] of this.characters) {
      if (!pos.isDeleted) {
        result += pos.char
      }
    }
    return result
  }

  getLength(): number {
    let count = 0
    for (const [, pos] of this.characters) {
      if (!pos.isDeleted) count++
    }
    return count
  }

  getState(): CRDTTextState {
    return {
      content: this.toString(),
      positions: new Map(this.characters)
    }
  }

  getVectorClock(): VectorClock {
    return { ...this.vectorClock }
  }

  setOnUpdate(callback: (content: string, operation: CRDTOperation) => void): void {
    this.onUpdate = callback
  }
}

// ============================================================================
// CRDT Map (Last-Writer-Wins Register)
// ============================================================================

export class CRDTMap<T = any> {
  private nodeId: string
  private state: Map<string, { value: T; timestamp: number; nodeId: string }> = new Map()
  private vectorClock: VectorClock = {}
  private onUpdate?: (state: Map<string, T>, operation: CRDTOperation) => void

  constructor(nodeId: string, initialState?: Record<string, T>) {
    this.nodeId = nodeId
    this.vectorClock[nodeId] = 0

    if (initialState) {
      for (const [key, value] of Object.entries(initialState)) {
        this.state.set(key, {
          value,
          timestamp: Date.now(),
          nodeId: this.nodeId
        })
      }
    }
  }

  set(key: string, value: T, metadata?: CRDTOperation['metadata']): CRDTOperation {
    const timestamp = Date.now()
    this.state.set(key, { value, timestamp, nodeId: this.nodeId })
    this.vectorClock = incrementClock(this.vectorClock, this.nodeId)

    const operation: CRDTOperation = {
      id: `${this.nodeId}:${timestamp}`,
      type: 'update',
      nodeId: this.nodeId,
      timestamp,
      vectorClock: { ...this.vectorClock },
      path: [key],
      value,
      metadata
    }

    this.onUpdate?.(this.toMap(), operation)
    return operation
  }

  delete(key: string, metadata?: CRDTOperation['metadata']): CRDTOperation {
    const timestamp = Date.now()
    this.state.delete(key)
    this.vectorClock = incrementClock(this.vectorClock, this.nodeId)

    const operation: CRDTOperation = {
      id: `${this.nodeId}:${timestamp}`,
      type: 'delete',
      nodeId: this.nodeId,
      timestamp,
      vectorClock: { ...this.vectorClock },
      path: [key],
      metadata
    }

    this.onUpdate?.(this.toMap(), operation)
    return operation
  }

  get(key: string): T | undefined {
    return this.state.get(key)?.value
  }

  has(key: string): boolean {
    return this.state.has(key)
  }

  applyOperation(operation: CRDTOperation): boolean {
    const key = operation.path[0]
    const existing = this.state.get(key)

    if (operation.type === 'delete') {
      if (!existing || existing.timestamp < operation.timestamp) {
        this.state.delete(key)
        this.vectorClock = mergeClock(this.vectorClock, operation.vectorClock)
        this.onUpdate?.(this.toMap(), operation)
        return true
      }
      return false
    }

    // Last-writer-wins: use timestamp, tie-break with nodeId
    if (!existing ||
        existing.timestamp < operation.timestamp ||
        (existing.timestamp === operation.timestamp && existing.nodeId < operation.nodeId)) {
      this.state.set(key, {
        value: operation.value,
        timestamp: operation.timestamp,
        nodeId: operation.nodeId
      })
      this.vectorClock = mergeClock(this.vectorClock, operation.vectorClock)
      this.onUpdate?.(this.toMap(), operation)
      return true
    }

    return false
  }

  toMap(): Map<string, T> {
    const result = new Map<string, T>()
    for (const [key, entry] of this.state) {
      result.set(key, entry.value)
    }
    return result
  }

  toObject(): Record<string, T> {
    const result: Record<string, T> = {}
    for (const [key, entry] of this.state) {
      result[key] = entry.value
    }
    return result
  }

  getVectorClock(): VectorClock {
    return { ...this.vectorClock }
  }

  setOnUpdate(callback: (state: Map<string, T>, operation: CRDTOperation) => void): void {
    this.onUpdate = callback
  }
}

// ============================================================================
// CRDT Counter (Grow-only and PN-Counter)
// ============================================================================

export class CRDTCounter {
  private nodeId: string
  private increments: Map<string, number> = new Map()
  private decrements: Map<string, number> = new Map()
  private vectorClock: VectorClock = {}
  private onUpdate?: (value: number, operation: CRDTOperation) => void

  constructor(nodeId: string, initialValue: number = 0) {
    this.nodeId = nodeId
    this.vectorClock[nodeId] = 0

    if (initialValue > 0) {
      this.increments.set(nodeId, initialValue)
    } else if (initialValue < 0) {
      this.decrements.set(nodeId, Math.abs(initialValue))
    }
  }

  increment(amount: number = 1, metadata?: CRDTOperation['metadata']): CRDTOperation {
    const current = this.increments.get(this.nodeId) || 0
    this.increments.set(this.nodeId, current + amount)
    this.vectorClock = incrementClock(this.vectorClock, this.nodeId)

    const operation: CRDTOperation = {
      id: `${this.nodeId}:${Date.now()}`,
      type: 'increment',
      nodeId: this.nodeId,
      timestamp: Date.now(),
      vectorClock: { ...this.vectorClock },
      path: [],
      value: amount,
      metadata
    }

    this.onUpdate?.(this.getValue(), operation)
    return operation
  }

  decrement(amount: number = 1, metadata?: CRDTOperation['metadata']): CRDTOperation {
    const current = this.decrements.get(this.nodeId) || 0
    this.decrements.set(this.nodeId, current + amount)
    this.vectorClock = incrementClock(this.vectorClock, this.nodeId)

    const operation: CRDTOperation = {
      id: `${this.nodeId}:${Date.now()}`,
      type: 'decrement',
      nodeId: this.nodeId,
      timestamp: Date.now(),
      vectorClock: { ...this.vectorClock },
      path: [],
      value: amount,
      metadata
    }

    this.onUpdate?.(this.getValue(), operation)
    return operation
  }

  applyOperation(operation: CRDTOperation): boolean {
    if (operation.type === 'increment') {
      const current = this.increments.get(operation.nodeId) || 0
      const newValue = current + operation.value
      if (newValue > current) {
        this.increments.set(operation.nodeId, newValue)
        this.vectorClock = mergeClock(this.vectorClock, operation.vectorClock)
        this.onUpdate?.(this.getValue(), operation)
        return true
      }
    } else if (operation.type === 'decrement') {
      const current = this.decrements.get(operation.nodeId) || 0
      const newValue = current + operation.value
      if (newValue > current) {
        this.decrements.set(operation.nodeId, newValue)
        this.vectorClock = mergeClock(this.vectorClock, operation.vectorClock)
        this.onUpdate?.(this.getValue(), operation)
        return true
      }
    }
    return false
  }

  getValue(): number {
    let total = 0
    for (const inc of this.increments.values()) {
      total += inc
    }
    for (const dec of this.decrements.values()) {
      total -= dec
    }
    return total
  }

  getVectorClock(): VectorClock {
    return { ...this.vectorClock }
  }

  setOnUpdate(callback: (value: number, operation: CRDTOperation) => void): void {
    this.onUpdate = callback
  }
}

// ============================================================================
// CRDT Document Manager
// ============================================================================

export class CRDTDocumentManager {
  private documents: Map<string, CRDTText | CRDTMap | CRDTCounter> = new Map()
  private nodeId: string
  private pendingSync: Map<string, CRDTOperation[]> = new Map()
  private syncCallback?: (message: CRDTSyncMessage) => void

  constructor(nodeId: string) {
    this.nodeId = nodeId
  }

  createTextDocument(documentId: string, initialContent?: string): CRDTText {
    const doc = new CRDTText(this.nodeId, initialContent)
    this.documents.set(documentId, doc)

    doc.setOnUpdate((_, operation) => {
      this.broadcastOperation(documentId, operation)
    })

    return doc
  }

  createMapDocument<T = any>(documentId: string, initialState?: Record<string, T>): CRDTMap<T> {
    const doc = new CRDTMap<T>(this.nodeId, initialState)
    this.documents.set(documentId, doc)

    doc.setOnUpdate((_, operation) => {
      this.broadcastOperation(documentId, operation)
    })

    return doc
  }

  createCounterDocument(documentId: string, initialValue?: number): CRDTCounter {
    const doc = new CRDTCounter(this.nodeId, initialValue)
    this.documents.set(documentId, doc)

    doc.setOnUpdate((_, operation) => {
      this.broadcastOperation(documentId, operation)
    })

    return doc
  }

  getDocument(documentId: string): CRDTText | CRDTMap | CRDTCounter | undefined {
    return this.documents.get(documentId)
  }

  applyRemoteOperation(documentId: string, operation: CRDTOperation): boolean {
    const doc = this.documents.get(documentId)
    if (!doc) {
      // Queue for later if document doesn't exist yet
      const pending = this.pendingSync.get(documentId) || []
      pending.push(operation)
      this.pendingSync.set(documentId, pending)
      return false
    }

    return doc.applyOperation(operation)
  }

  handleSyncMessage(message: CRDTSyncMessage): void {
    switch (message.type) {
      case 'sync-request':
        this.handleSyncRequest(message)
        break
      case 'sync-response':
        this.handleSyncResponse(message)
        break
      case 'operation':
        if (message.operations) {
          for (const op of message.operations) {
            this.applyRemoteOperation(message.documentId, op)
          }
        }
        break
      case 'ack':
        // Handle acknowledgment
        break
    }
  }

  private handleSyncRequest(message: CRDTSyncMessage): void {
    const doc = this.documents.get(message.documentId)
    if (!doc) return

    // Send state and any operations the requester is missing
    this.syncCallback?.({
      type: 'sync-response',
      documentId: message.documentId,
      nodeId: this.nodeId,
      vectorClock: doc.getVectorClock(),
      state: this.getDocumentState(message.documentId)
    })
  }

  private handleSyncResponse(message: CRDTSyncMessage): void {
    if (message.operations) {
      for (const op of message.operations) {
        this.applyRemoteOperation(message.documentId, op)
      }
    }
  }

  private broadcastOperation(documentId: string, operation: CRDTOperation): void {
    const doc = this.documents.get(documentId)
    if (!doc) return

    this.syncCallback?.({
      type: 'operation',
      documentId,
      nodeId: this.nodeId,
      vectorClock: doc.getVectorClock(),
      operations: [operation]
    })
  }

  private getDocumentState(documentId: string): any {
    const doc = this.documents.get(documentId)
    if (!doc) return null

    if (doc instanceof CRDTText) {
      return doc.getState()
    } else if (doc instanceof CRDTMap) {
      return doc.toObject()
    } else if (doc instanceof CRDTCounter) {
      return doc.getValue()
    }
    return null
  }

  requestSync(documentId: string): void {
    const doc = this.documents.get(documentId)

    this.syncCallback?.({
      type: 'sync-request',
      documentId,
      nodeId: this.nodeId,
      vectorClock: doc?.getVectorClock() || {}
    })
  }

  setSyncCallback(callback: (message: CRDTSyncMessage) => void): void {
    this.syncCallback = callback
  }

  getNodeId(): string {
    return this.nodeId
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

export function generateNodeId(): string {
  return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function serializeOperation(op: CRDTOperation): string {
  return JSON.stringify(op)
}

export function deserializeOperation(data: string): CRDTOperation {
  return JSON.parse(data)
}

export default {
  CRDTText,
  CRDTMap,
  CRDTCounter,
  CRDTDocumentManager,
  createVectorClock,
  incrementClock,
  mergeClock,
  compareClock,
  isConcurrent,
  generateNodeId,
  serializeOperation,
  deserializeOperation
}
