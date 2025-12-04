/**
 * KAZI AI CREATE - REAL-TIME COLLABORATION
 * World-first collaborative AI content generation system
 *
 * Features:
 * - Real-time presence and cursors
 * - Collaborative prompt editing
 * - Shared generation history
 * - Live comments and annotations
 * - Version control and branching
 */

import { createFeatureLogger } from './logger'

const logger = createFeatureLogger('AICollaboration')

// ============================================================================
// TYPES
// ============================================================================

export interface Collaborator {
  id: string
  name: string
  avatar?: string
  color: string // For cursor and highlights
  role: 'owner' | 'editor' | 'viewer'
  status: 'active' | 'idle' | 'typing' | 'generating'
  lastActivity: number
  permissions: CollaboratorPermissions
}

export interface CollaboratorPermissions {
  canEdit: boolean
  canGenerate: boolean
  canComment: boolean
  canExport: boolean
  canInvite: boolean
}

export interface PresenceData {
  collaboratorId: string
  cursor?: { x: number; y: number }
  selection?: { start: number; end: number }
  currentlyViewing?: string // element ID
  activity: CollaboratorActivity
}

export type CollaboratorActivity =
  | { type: 'idle' }
  | { type: 'typing'; field: string }
  | { type: 'generating'; prompt: string }
  | { type: 'viewing'; assetId: string }
  | { type: 'commenting'; text: string }

export interface CollaborativeComment {
  id: string
  collaboratorId: string
  text: string
  timestamp: number
  position?: { x: number; y: number } // For positioned comments
  targetId?: string // Reference to specific generation or asset
  replies: CollaborativeComment[]
  reactions: Record<string, string[]> // emoji -> collaboratorIds
}

export interface CollaborativeEdit {
  id: string
  collaboratorId: string
  timestamp: number
  type: 'prompt' | 'parameters' | 'file-upload' | 'generation'
  before: any
  after: any
  description: string
}

export interface CollaborativeSession {
  id: string
  name: string
  createdAt: number
  createdBy: string
  collaborators: Map<string, Collaborator>
  presence: Map<string, PresenceData>
  sharedState: {
    prompt: string
    parameters: Record<string, any>
    referenceFiles: string[]
    currentGeneration?: string
    history: string[]
  }
  comments: CollaborativeComment[]
  editHistory: CollaborativeEdit[]
  permissions: SessionPermissions
}

export interface SessionPermissions {
  public: boolean
  allowInvites: boolean
  requireApproval: boolean
  maxCollaborators: number
}

// ============================================================================
// COLLABORATION MANAGER
// ============================================================================

export class CollaborationManager {
  private sessions: Map<string, CollaborativeSession> = new Map()
  private eventListeners: Map<string, Set<CollaborationEventListener>> = new Map()

  // Color palette for collaborators
  private readonly COLLABORATOR_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B500', '#6C5CE7'
  ]
  private usedColors: Set<string> = new Set()

  /**
   * Create a new collaborative session
   */
  createSession(
    name: string,
    creatorId: string,
    creatorName: string,
    permissions?: Partial<SessionPermissions>
  ): CollaborativeSession {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const creator: Collaborator = {
      id: creatorId,
      name: creatorName,
      color: this.assignColor(),
      role: 'owner',
      status: 'active',
      lastActivity: Date.now(),
      permissions: {
        canEdit: true,
        canGenerate: true,
        canComment: true,
        canExport: true,
        canInvite: true
      }
    }

    const session: CollaborativeSession = {
      id: sessionId,
      name,
      createdAt: Date.now(),
      createdBy: creatorId,
      collaborators: new Map([[creatorId, creator]]),
      presence: new Map(),
      sharedState: {
        prompt: '',
        parameters: {},
        referenceFiles: [],
        history: []
      },
      comments: [],
      editHistory: [],
      permissions: {
        public: false,
        allowInvites: true,
        requireApproval: false,
        maxCollaborators: 10,
        ...permissions
      }
    }

    this.sessions.set(sessionId, session)

    logger.info('Collaborative session created', {
      sessionId,
      createdBy: creatorName,
      permissions: session.permissions
    })

    return session
  }

  /**
   * Join existing session
   */
  joinSession(
    sessionId: string,
    collaboratorId: string,
    collaboratorName: string,
    avatar?: string
  ): Collaborator | null {
    const session = this.sessions.get(sessionId)

    if (!session) {
      logger.error('Session not found', { sessionId })
      return null
    }

    // Check if already in session
    if (session.collaborators.has(collaboratorId)) {
      const existing = session.collaborators.get(collaboratorId)!
      existing.status = 'active'
      existing.lastActivity = Date.now()
      return existing
    }

    // Check max collaborators
    if (session.collaborators.size >= session.permissions.maxCollaborators) {
      logger.warn('Session full', { sessionId, maxCollaborators: session.permissions.maxCollaborators })
      return null
    }

    // Create new collaborator
    const collaborator: Collaborator = {
      id: collaboratorId,
      name: collaboratorName,
      avatar,
      color: this.assignColor(),
      role: 'editor',
      status: 'active',
      lastActivity: Date.now(),
      permissions: {
        canEdit: true,
        canGenerate: true,
        canComment: true,
        canExport: false,
        canInvite: false
      }
    }

    session.collaborators.set(collaboratorId, collaborator)

    // Notify other collaborators
    this.emitEvent(sessionId, {
      type: 'collaborator-joined',
      collaborator,
      timestamp: Date.now()
    })

    logger.info('Collaborator joined session', {
      sessionId,
      collaboratorId,
      collaboratorName,
      totalCollaborators: session.collaborators.size
    })

    return collaborator
  }

  /**
   * Update collaborator presence
   */
  updatePresence(sessionId: string, presenceData: PresenceData): void {
    const session = this.sessions.get(sessionId)
    if (!session) return

    const collaborator = session.collaborators.get(presenceData.collaboratorId)
    if (!collaborator) return

    // Update presence
    session.presence.set(presenceData.collaboratorId, presenceData)

    // Update status based on activity
    if (presenceData.activity.type === 'typing') {
      collaborator.status = 'typing'
    } else if (presenceData.activity.type === 'generating') {
      collaborator.status = 'generating'
    } else {
      collaborator.status = 'active'
    }

    collaborator.lastActivity = Date.now()

    // Broadcast presence update
    this.emitEvent(sessionId, {
      type: 'presence-updated',
      presence: presenceData,
      timestamp: Date.now()
    })
  }

  /**
   * Update shared prompt
   */
  updatePrompt(
    sessionId: string,
    collaboratorId: string,
    newPrompt: string
  ): void {
    const session = this.sessions.get(sessionId)
    if (!session) return

    const collaborator = session.collaborators.get(collaboratorId)
    if (!collaborator || !collaborator.permissions.canEdit) return

    const oldPrompt = session.sharedState.prompt

    // Record edit
    const edit: CollaborativeEdit = {
      id: `edit_${Date.now()}`,
      collaboratorId,
      timestamp: Date.now(),
      type: 'prompt',
      before: oldPrompt,
      after: newPrompt,
      description: `${collaborator.name} updated the prompt`
    }

    session.editHistory.push(edit)
    session.sharedState.prompt = newPrompt

    // Broadcast change
    this.emitEvent(sessionId, {
      type: 'prompt-updated',
      collaboratorId,
      collaboratorName: collaborator.name,
      oldPrompt,
      newPrompt,
      timestamp: Date.now()
    })

    logger.debug('Prompt updated in session', {
      sessionId,
      collaboratorId,
      promptLength: newPrompt.length
    })
  }

  /**
   * Add comment
   */
  addComment(
    sessionId: string,
    collaboratorId: string,
    text: string,
    position?: { x: number; y: number },
    targetId?: string
  ): CollaborativeComment | null {
    const session = this.sessions.get(sessionId)
    if (!session) return null

    const collaborator = session.collaborators.get(collaboratorId)
    if (!collaborator || !collaborator.permissions.canComment) return null

    const comment: CollaborativeComment = {
      id: `comment_${Date.now()}`,
      collaboratorId,
      text,
      timestamp: Date.now(),
      position,
      targetId,
      replies: [],
      reactions: {}
    }

    session.comments.push(comment)

    // Broadcast comment
    this.emitEvent(sessionId, {
      type: 'comment-added',
      comment,
      collaboratorName: collaborator.name,
      timestamp: Date.now()
    })

    logger.info('Comment added', {
      sessionId,
      collaboratorId,
      commentLength: text.length
    })

    return comment
  }

  /**
   * Add reaction to comment
   */
  addReaction(
    sessionId: string,
    commentId: string,
    collaboratorId: string,
    emoji: string
  ): void {
    const session = this.sessions.get(sessionId)
    if (!session) return

    const comment = session.comments.find(c => c.id === commentId)
    if (!comment) return

    if (!comment.reactions[emoji]) {
      comment.reactions[emoji] = []
    }

    if (!comment.reactions[emoji].includes(collaboratorId)) {
      comment.reactions[emoji].push(collaboratorId)

      this.emitEvent(sessionId, {
        type: 'reaction-added',
        commentId,
        collaboratorId,
        emoji,
        timestamp: Date.now()
      })
    }
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): CollaborativeSession | null {
    return this.sessions.get(sessionId) || null
  }

  /**
   * Get active collaborators in session
   */
  getActiveCollaborators(sessionId: string): Collaborator[] {
    const session = this.sessions.get(sessionId)
    if (!session) return []

    const now = Date.now()
    const IDLE_THRESHOLD = 60000 // 1 minute

    return Array.from(session.collaborators.values()).map(collaborator => {
      if (now - collaborator.lastActivity > IDLE_THRESHOLD) {
        collaborator.status = 'idle'
      }
      return collaborator
    })
  }

  /**
   * Leave session
   */
  leaveSession(sessionId: string, collaboratorId: string): void {
    const session = this.sessions.get(sessionId)
    if (!session) return

    const collaborator = session.collaborators.get(collaboratorId)
    if (!collaborator) return

    session.collaborators.delete(collaboratorId)
    session.presence.delete(collaboratorId)
    this.releaseColor(collaborator.color)

    this.emitEvent(sessionId, {
      type: 'collaborator-left',
      collaboratorId,
      collaboratorName: collaborator.name,
      timestamp: Date.now()
    })

    logger.info('Collaborator left session', {
      sessionId,
      collaboratorId,
      remainingCollaborators: session.collaborators.size
    })

    // Clean up empty sessions
    if (session.collaborators.size === 0) {
      this.sessions.delete(sessionId)
      logger.info('Session closed (no collaborators)', { sessionId })
    }
  }

  /**
   * Subscribe to session events
   */
  subscribe(sessionId: string, listener: CollaborationEventListener): () => void {
    if (!this.eventListeners.has(sessionId)) {
      this.eventListeners.set(sessionId, new Set())
    }

    this.eventListeners.get(sessionId)!.add(listener)

    // Return unsubscribe function
    return () => {
      this.eventListeners.get(sessionId)?.delete(listener)
    }
  }

  private emitEvent(sessionId: string, event: CollaborationEvent): void {
    const listeners = this.eventListeners.get(sessionId)
    if (!listeners) return

    listeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        logger.error('Event listener error', { error, eventType: event.type })
      }
    })
  }

  private assignColor(): string {
    for (const color of this.COLLABORATOR_COLORS) {
      if (!this.usedColors.has(color)) {
        this.usedColors.add(color)
        return color
      }
    }
    // If all colors used, return a random one
    return this.COLLABORATOR_COLORS[Math.floor(Math.random() * this.COLLABORATOR_COLORS.length)]
  }

  private releaseColor(color: string): void {
    this.usedColors.delete(color)
  }
}

// ============================================================================
// EVENT TYPES
// ============================================================================

export type CollaborationEvent =
  | { type: 'collaborator-joined'; collaborator: Collaborator; timestamp: number }
  | { type: 'collaborator-left'; collaboratorId: string; collaboratorName: string; timestamp: number }
  | { type: 'presence-updated'; presence: PresenceData; timestamp: number }
  | { type: 'prompt-updated'; collaboratorId: string; collaboratorName: string; oldPrompt: string; newPrompt: string; timestamp: number }
  | { type: 'comment-added'; comment: CollaborativeComment; collaboratorName: string; timestamp: number }
  | { type: 'reaction-added'; commentId: string; collaboratorId: string; emoji: string; timestamp: number }
  | { type: 'generation-started'; collaboratorId: string; collaboratorName: string; timestamp: number }
  | { type: 'generation-completed'; generationId: string; timestamp: number }

export type CollaborationEventListener = (event: CollaborationEvent) => void

// Singleton instance
export const collaborationManager = new CollaborationManager()
