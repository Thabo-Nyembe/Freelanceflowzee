/**
 * Collaboration Activity Log & Audit Trail Service
 *
 * Comprehensive tracking of all collaborative activities:
 * - Edit history with full attribution
 * - User join/leave events
 * - Comment activity
 * - File operations
 * - Permission changes
 * - Undo/redo tracking per user
 */

import { createFeatureLogger } from '@/lib/logger'
import { createClient } from '@/lib/supabase/server'
import { JsonValue } from '@/lib/types/database'

const logger = createFeatureLogger('ActivityLogService')

// ============================================================================
// Types
// ============================================================================

export type ActivityType =
  // Document events
  | 'document.created'
  | 'document.opened'
  | 'document.closed'
  | 'document.saved'
  | 'document.renamed'
  | 'document.deleted'
  | 'document.restored'
  | 'document.exported'
  | 'document.duplicated'
  // Edit events
  | 'edit.text_insert'
  | 'edit.text_delete'
  | 'edit.text_replace'
  | 'edit.object_add'
  | 'edit.object_remove'
  | 'edit.object_move'
  | 'edit.object_resize'
  | 'edit.object_style'
  | 'edit.undo'
  | 'edit.redo'
  // Selection events
  | 'selection.changed'
  | 'selection.cleared'
  // Collaboration events
  | 'collab.user_joined'
  | 'collab.user_left'
  | 'collab.cursor_moved'
  | 'collab.typing_started'
  | 'collab.typing_stopped'
  | 'collab.conflict_detected'
  | 'collab.conflict_resolved'
  // Comment events
  | 'comment.created'
  | 'comment.replied'
  | 'comment.resolved'
  | 'comment.reopened'
  | 'comment.deleted'
  | 'comment.reaction_added'
  | 'comment.reaction_removed'
  // Permission events
  | 'permission.granted'
  | 'permission.revoked'
  | 'permission.changed'
  // Version events
  | 'version.created'
  | 'version.restored'
  | 'version.named'
  | 'version.deleted'

export type ActivityCategory =
  | 'document'
  | 'edit'
  | 'selection'
  | 'collaboration'
  | 'comment'
  | 'permission'
  | 'version'

export interface ActivityLogEntry {
  id: string
  documentId: string
  sessionId: string

  // Event info
  type: ActivityType
  category: ActivityCategory
  action: string
  description: string

  // User info
  userId: string
  userName: string
  userColor: string
  userAvatar?: string

  // Change details
  changes: ActivityChange[]

  // State info (for undo/redo)
  previousState?: JsonValue
  newState?: JsonValue

  // Affected elements
  affectedElements: string[]

  // Position info (for text edits)
  position?: {
    start: number
    end: number
    line?: number
    column?: number
  }

  // Metadata
  metadata: Record<string, JsonValue>

  // Timestamps
  timestamp: Date
  serverTimestamp?: Date

  // Sync state
  syncedToServer: boolean
  localOnly: boolean
}

export interface ActivityChange {
  path: string[]
  type: 'add' | 'remove' | 'update' | 'move'
  oldValue?: JsonValue
  newValue?: JsonValue
  elementId?: string
}

export interface ActivityFilter {
  documentId?: string
  sessionId?: string
  userId?: string
  types?: ActivityType[]
  categories?: ActivityCategory[]
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}

export interface ActivitySummary {
  documentId: string
  period: 'hour' | 'day' | 'week' | 'month'
  totalActivities: number
  byCategory: Record<ActivityCategory, number>
  byUser: Record<string, { count: number; userName: string }>
  byType: Record<ActivityType, number>
  peakActivityTime: Date
  averageActivityPerHour: number
}

export interface UndoRedoState {
  userId: string
  documentId: string
  undoStack: ActivityLogEntry[]
  redoStack: ActivityLogEntry[]
  canUndo: boolean
  canRedo: boolean
  lastUndoAt?: Date
  lastRedoAt?: Date
}

/** Database row shape for activity log entries */
interface ActivityLogDbRow {
  id: string
  document_id: string
  session_id: string
  activity_type: ActivityType
  category: ActivityCategory
  action: string
  description: string
  user_id: string
  user_name: string
  user_color: string
  user_avatar?: string
  changes?: ActivityChange[]
  previous_state?: JsonValue
  new_state?: JsonValue
  affected_elements?: string[]
  position?: ActivityLogEntry['position']
  metadata?: Record<string, JsonValue>
  timestamp: string
  server_timestamp?: string
}

// ============================================================================
// Activity Log Manager
// ============================================================================

export class ActivityLogManager {
  private documentId: string
  private sessionId: string
  private userId: string
  private userName: string
  private userColor: string
  private userAvatar?: string

  private localLog: ActivityLogEntry[] = []
  private undoStacks: Map<string, ActivityLogEntry[]> = new Map()
  private redoStacks: Map<string, ActivityLogEntry[]> = new Map()

  private onActivityCallback?: (entry: ActivityLogEntry) => void
  private syncCallback?: (entries: ActivityLogEntry[]) => void

  private maxLocalEntries = 1000
  private syncBatchSize = 50
  private syncInterval?: NodeJS.Timeout

  constructor(
    documentId: string,
    sessionId: string,
    userId: string,
    userName: string,
    userColor: string,
    userAvatar?: string
  ) {
    this.documentId = documentId
    this.sessionId = sessionId
    this.userId = userId
    this.userName = userName
    this.userColor = userColor
    this.userAvatar = userAvatar

    // Initialize undo/redo stacks for this user
    this.undoStacks.set(userId, [])
    this.redoStacks.set(userId, [])

    this.startPeriodicSync()
  }

  // ============================================================================
  // Logging Methods
  // ============================================================================

  log(
    type: ActivityType,
    description: string,
    options: {
      changes?: ActivityChange[]
      previousState?: JsonValue
      newState?: JsonValue
      affectedElements?: string[]
      position?: ActivityLogEntry['position']
      metadata?: Record<string, JsonValue>
      undoable?: boolean
    } = {}
  ): ActivityLogEntry {
    const entry: ActivityLogEntry = {
      id: this.generateId(),
      documentId: this.documentId,
      sessionId: this.sessionId,
      type,
      category: this.getCategoryFromType(type),
      action: type.split('.')[1],
      description,
      userId: this.userId,
      userName: this.userName,
      userColor: this.userColor,
      userAvatar: this.userAvatar,
      changes: options.changes || [],
      previousState: options.previousState,
      newState: options.newState,
      affectedElements: options.affectedElements || [],
      position: options.position,
      metadata: options.metadata || {},
      timestamp: new Date(),
      syncedToServer: false,
      localOnly: false
    }

    this.addToLocalLog(entry)

    // Add to undo stack if undoable
    if (options.undoable !== false && this.isUndoableType(type)) {
      this.addToUndoStack(entry)
    }

    // Notify listeners
    this.onActivityCallback?.(entry)

    return entry
  }

  // Convenience methods for common activities
  logTextInsert(
    text: string,
    position: { start: number; end: number; line?: number; column?: number },
    previousState?: JsonValue
  ): ActivityLogEntry {
    return this.log('edit.text_insert', `Inserted "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`, {
      changes: [{ path: ['content'], type: 'add', newValue: text }],
      position,
      previousState,
      newState: text,
      undoable: true
    })
  }

  logTextDelete(
    deletedText: string,
    position: { start: number; end: number; line?: number; column?: number },
    previousState?: JsonValue
  ): ActivityLogEntry {
    return this.log('edit.text_delete', `Deleted "${deletedText.substring(0, 50)}${deletedText.length > 50 ? '...' : ''}"`, {
      changes: [{ path: ['content'], type: 'remove', oldValue: deletedText }],
      position,
      previousState,
      undoable: true
    })
  }

  logObjectAdd(
    elementId: string,
    elementType: string,
    elementData: JsonValue
  ): ActivityLogEntry {
    return this.log('edit.object_add', `Added ${elementType}`, {
      changes: [{ path: ['elements', elementId], type: 'add', newValue: elementData, elementId }],
      affectedElements: [elementId],
      newState: elementData,
      undoable: true
    })
  }

  logObjectRemove(
    elementId: string,
    elementType: string,
    elementData: JsonValue
  ): ActivityLogEntry {
    return this.log('edit.object_remove', `Removed ${elementType}`, {
      changes: [{ path: ['elements', elementId], type: 'remove', oldValue: elementData, elementId }],
      affectedElements: [elementId],
      previousState: elementData,
      undoable: true
    })
  }

  logObjectMove(
    elementId: string,
    elementType: string,
    fromPosition: { x: number; y: number },
    toPosition: { x: number; y: number }
  ): ActivityLogEntry {
    return this.log('edit.object_move', `Moved ${elementType}`, {
      changes: [{ path: ['elements', elementId, 'position'], type: 'move', oldValue: fromPosition, newValue: toPosition, elementId }],
      affectedElements: [elementId],
      previousState: fromPosition,
      newState: toPosition,
      undoable: true
    })
  }

  logUserJoined(user: { userId: string; userName: string }): ActivityLogEntry {
    return this.log('collab.user_joined', `${user.userName} joined`, {
      metadata: { joinedUser: user },
      undoable: false
    })
  }

  logUserLeft(user: { userId: string; userName: string }): ActivityLogEntry {
    return this.log('collab.user_left', `${user.userName} left`, {
      metadata: { leftUser: user },
      undoable: false
    })
  }

  logCommentCreated(
    commentId: string,
    commentText: string,
    position?: { elementId?: string; x?: number; y?: number }
  ): ActivityLogEntry {
    return this.log('comment.created', `Added a comment: "${commentText.substring(0, 50)}${commentText.length > 50 ? '...' : ''}"`, {
      metadata: { commentId, commentText, position },
      undoable: false
    })
  }

  logVersionCreated(versionId: string, versionName?: string): ActivityLogEntry {
    return this.log('version.created', versionName ? `Created version: ${versionName}` : 'Created a new version', {
      metadata: { versionId, versionName },
      undoable: false
    })
  }

  // ============================================================================
  // Undo/Redo
  // ============================================================================

  private addToUndoStack(entry: ActivityLogEntry): void {
    const stack = this.undoStacks.get(this.userId) || []
    stack.push(entry)

    // Limit stack size
    if (stack.length > 100) {
      stack.shift()
    }

    this.undoStacks.set(this.userId, stack)

    // Clear redo stack when new action is performed
    this.redoStacks.set(this.userId, [])
  }

  undo(): ActivityLogEntry | null {
    const undoStack = this.undoStacks.get(this.userId) || []
    if (undoStack.length === 0) return null

    const entry = undoStack.pop()!
    this.undoStacks.set(this.userId, undoStack)

    // Add to redo stack
    const redoStack = this.redoStacks.get(this.userId) || []
    redoStack.push(entry)
    this.redoStacks.set(this.userId, redoStack)

    // Log undo action
    this.log('edit.undo', `Undid: ${entry.description}`, {
      metadata: { undoneEntry: entry.id },
      previousState: entry.newState,
      newState: entry.previousState,
      undoable: false
    })

    return entry
  }

  redo(): ActivityLogEntry | null {
    const redoStack = this.redoStacks.get(this.userId) || []
    if (redoStack.length === 0) return null

    const entry = redoStack.pop()!
    this.redoStacks.set(this.userId, redoStack)

    // Add back to undo stack
    const undoStack = this.undoStacks.get(this.userId) || []
    undoStack.push(entry)
    this.undoStacks.set(this.userId, undoStack)

    // Log redo action
    this.log('edit.redo', `Redid: ${entry.description}`, {
      metadata: { redoneEntry: entry.id },
      previousState: entry.previousState,
      newState: entry.newState,
      undoable: false
    })

    return entry
  }

  getUndoRedoState(): UndoRedoState {
    const undoStack = this.undoStacks.get(this.userId) || []
    const redoStack = this.redoStacks.get(this.userId) || []

    return {
      userId: this.userId,
      documentId: this.documentId,
      undoStack: [...undoStack],
      redoStack: [...redoStack],
      canUndo: undoStack.length > 0,
      canRedo: redoStack.length > 0,
      lastUndoAt: undoStack.length > 0 ? undoStack[undoStack.length - 1].timestamp : undefined,
      lastRedoAt: redoStack.length > 0 ? redoStack[redoStack.length - 1].timestamp : undefined
    }
  }

  // ============================================================================
  // Query Methods
  // ============================================================================

  getLocalLog(filter?: Partial<ActivityFilter>): ActivityLogEntry[] {
    let entries = [...this.localLog]

    if (filter?.userId) {
      entries = entries.filter(e => e.userId === filter.userId)
    }
    if (filter?.types) {
      entries = entries.filter(e => filter.types!.includes(e.type))
    }
    if (filter?.categories) {
      entries = entries.filter(e => filter.categories!.includes(e.category))
    }
    if (filter?.startDate) {
      entries = entries.filter(e => e.timestamp >= filter.startDate!)
    }
    if (filter?.endDate) {
      entries = entries.filter(e => e.timestamp <= filter.endDate!)
    }

    // Sort by timestamp descending
    entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    if (filter?.offset) {
      entries = entries.slice(filter.offset)
    }
    if (filter?.limit) {
      entries = entries.slice(0, filter.limit)
    }

    return entries
  }

  getEntriesForUser(userId: string, limit?: number): ActivityLogEntry[] {
    return this.getLocalLog({ userId, limit })
  }

  getEntriesByType(type: ActivityType, limit?: number): ActivityLogEntry[] {
    return this.getLocalLog({ types: [type], limit })
  }

  getRecentActivity(limit: number = 50): ActivityLogEntry[] {
    return this.getLocalLog({ limit })
  }

  // ============================================================================
  // Analytics
  // ============================================================================

  getSummary(period: 'hour' | 'day' | 'week' | 'month' = 'day'): ActivitySummary {
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'hour':
        startDate = new Date(now.getTime() - 60 * 60 * 1000)
        break
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
    }

    const entries = this.getLocalLog({ startDate })

    const byCategory: Record<ActivityCategory, number> = {
      document: 0,
      edit: 0,
      selection: 0,
      collaboration: 0,
      comment: 0,
      permission: 0,
      version: 0
    }

    const byUser: Record<string, { count: number; userName: string }> = {}
    const byType: Record<string, number> = {}
    const activityByHour: Record<number, number> = {}

    for (const entry of entries) {
      byCategory[entry.category]++

      if (!byUser[entry.userId]) {
        byUser[entry.userId] = { count: 0, userName: entry.userName }
      }
      byUser[entry.userId].count++

      byType[entry.type] = (byType[entry.type] || 0) + 1

      const hour = entry.timestamp.getHours()
      activityByHour[hour] = (activityByHour[hour] || 0) + 1
    }

    // Find peak activity time
    let peakHour = 0
    let peakCount = 0
    for (const [hour, count] of Object.entries(activityByHour)) {
      if (count > peakCount) {
        peakCount = count
        peakHour = parseInt(hour)
      }
    }
    const peakActivityTime = new Date()
    peakActivityTime.setHours(peakHour, 0, 0, 0)

    // Calculate hours in period
    const hoursInPeriod = (now.getTime() - startDate.getTime()) / (60 * 60 * 1000)

    return {
      documentId: this.documentId,
      period,
      totalActivities: entries.length,
      byCategory,
      byUser,
      byType: byType as Record<ActivityType, number>,
      peakActivityTime,
      averageActivityPerHour: entries.length / Math.max(1, hoursInPeriod)
    }
  }

  // ============================================================================
  // Sync
  // ============================================================================

  private addToLocalLog(entry: ActivityLogEntry): void {
    this.localLog.push(entry)

    // Trim if exceeds max
    if (this.localLog.length > this.maxLocalEntries) {
      this.localLog = this.localLog.slice(-this.maxLocalEntries)
    }
  }

  private startPeriodicSync(): void {
    this.syncInterval = setInterval(() => {
      this.syncToServer()
    }, 30000) // Sync every 30 seconds
  }

  async syncToServer(): Promise<void> {
    const unsyncedEntries = this.localLog.filter(e => !e.syncedToServer && !e.localOnly)

    if (unsyncedEntries.length === 0) return

    // Batch sync
    const batches: ActivityLogEntry[][] = []
    for (let i = 0; i < unsyncedEntries.length; i += this.syncBatchSize) {
      batches.push(unsyncedEntries.slice(i, i + this.syncBatchSize))
    }

    for (const batch of batches) {
      this.syncCallback?.(batch)

      // Mark as synced
      for (const entry of batch) {
        entry.syncedToServer = true
        entry.serverTimestamp = new Date()
      }
    }
  }

  setSyncCallback(callback: (entries: ActivityLogEntry[]) => void): void {
    this.syncCallback = callback
  }

  // ============================================================================
  // Helpers
  // ============================================================================

  private generateId(): string {
    return `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getCategoryFromType(type: ActivityType): ActivityCategory {
    return type.split('.')[0] as ActivityCategory
  }

  private isUndoableType(type: ActivityType): boolean {
    const undoableTypes: ActivityType[] = [
      'edit.text_insert',
      'edit.text_delete',
      'edit.text_replace',
      'edit.object_add',
      'edit.object_remove',
      'edit.object_move',
      'edit.object_resize',
      'edit.object_style'
    ]
    return undoableTypes.includes(type)
  }

  // ============================================================================
  // Callbacks
  // ============================================================================

  setOnActivity(callback: (entry: ActivityLogEntry) => void): void {
    this.onActivityCallback = callback
  }

  // ============================================================================
  // Cleanup
  // ============================================================================

  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }

    // Final sync
    this.syncToServer()
  }
}

// ============================================================================
// Database Persistence Functions
// ============================================================================

export async function saveActivityBatch(entries: ActivityLogEntry[]): Promise<void> {
  const supabase = await createClient()

  const dbEntries = entries.map(entry => ({
    id: entry.id,
    document_id: entry.documentId,
    session_id: entry.sessionId,
    activity_type: entry.type,
    category: entry.category,
    action: entry.action,
    description: entry.description,
    user_id: entry.userId,
    user_name: entry.userName,
    user_color: entry.userColor,
    user_avatar: entry.userAvatar,
    changes: entry.changes,
    previous_state: entry.previousState,
    new_state: entry.newState,
    affected_elements: entry.affectedElements,
    position: entry.position,
    metadata: entry.metadata,
    timestamp: entry.timestamp.toISOString()
  }))

  const { error } = await supabase
    .from('collaboration_activity_log')
    .insert(dbEntries)

  if (error) {
    logger.error('Failed to save activity batch', { error: error.message })
    throw new Error(`Failed to save activities: ${error.message}`)
  }
}

export async function getActivityLog(filter: ActivityFilter): Promise<ActivityLogEntry[]> {
  const supabase = await createClient()

  let query = supabase
    .from('collaboration_activity_log')
    .select('*')

  if (filter.documentId) {
    query = query.eq('document_id', filter.documentId)
  }
  if (filter.sessionId) {
    query = query.eq('session_id', filter.sessionId)
  }
  if (filter.userId) {
    query = query.eq('user_id', filter.userId)
  }
  if (filter.types && filter.types.length > 0) {
    query = query.in('activity_type', filter.types)
  }
  if (filter.categories && filter.categories.length > 0) {
    query = query.in('category', filter.categories)
  }
  if (filter.startDate) {
    query = query.gte('timestamp', filter.startDate.toISOString())
  }
  if (filter.endDate) {
    query = query.lte('timestamp', filter.endDate.toISOString())
  }

  query = query.order('timestamp', { ascending: false })

  if (filter.limit) {
    query = query.limit(filter.limit)
  }
  if (filter.offset) {
    query = query.range(filter.offset, filter.offset + (filter.limit || 50) - 1)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to get activity log: ${error.message}`)
  }

  return (data || []).map(mapDbToActivityEntry)
}

function mapDbToActivityEntry(row: ActivityLogDbRow): ActivityLogEntry {
  return {
    id: row.id,
    documentId: row.document_id,
    sessionId: row.session_id,
    type: row.activity_type,
    category: row.category,
    action: row.action,
    description: row.description,
    userId: row.user_id,
    userName: row.user_name,
    userColor: row.user_color,
    userAvatar: row.user_avatar,
    changes: row.changes || [],
    previousState: row.previous_state,
    newState: row.new_state,
    affectedElements: row.affected_elements || [],
    position: row.position,
    metadata: row.metadata || {},
    timestamp: new Date(row.timestamp),
    serverTimestamp: row.server_timestamp ? new Date(row.server_timestamp) : undefined,
    syncedToServer: true,
    localOnly: false
  }
}

export default {
  ActivityLogManager,
  saveActivityBatch,
  getActivityLog
}
