/**
 * KAZI Real-Time Collaboration Service
 *
 * Comprehensive collaboration service that integrates:
 * - CRDT for conflict-free editing
 * - Awareness protocol for presence
 * - Socket.IO for real-time communication
 * - Database persistence for sessions and history
 * - Activity logging and analytics
 *
 * World-class backend infrastructure for production deployment
 */

import { createClient } from '@/lib/supabase/server';
import { CRDTDocumentManager, CRDTText, CRDTMap, CRDTSyncMessage, generateNodeId } from './crdt-service';
import { AwarenessManager, UserAwareness, AwarenessUpdate } from './awareness-service';

// ============================================================================
// Types
// ============================================================================

export interface CollaborationSession {
  id: string;
  document_id: string;
  document_type: 'project' | 'video' | 'document' | 'canvas' | 'design';
  created_by: string;
  status: 'active' | 'paused' | 'ended';
  settings: SessionSettings;
  participants: SessionParticipant[];
  created_at: string;
  updated_at: string;
  ended_at?: string;
  metadata: Record<string, any>;
}

export interface SessionSettings {
  maxParticipants: number;
  allowAnonymous: boolean;
  requireApproval: boolean;
  allowComments: boolean;
  allowEditing: boolean;
  allowDownload: boolean;
  autoSaveInterval: number; // in seconds
  conflictResolution: 'crdt' | 'last-write-wins' | 'manual';
  notifyOnJoin: boolean;
  notifyOnLeave: boolean;
  recordHistory: boolean;
}

export interface SessionParticipant {
  id: string;
  session_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'commenter' | 'viewer';
  status: 'active' | 'idle' | 'away' | 'offline';
  permissions: ParticipantPermissions;
  joined_at: string;
  left_at?: string;
  last_active_at: string;
  connection_info: ConnectionInfo;
  metadata: Record<string, any>;
}

export interface ParticipantPermissions {
  canEdit: boolean;
  canComment: boolean;
  canInvite: boolean;
  canRemove: boolean;
  canChangeSettings: boolean;
  canEndSession: boolean;
}

export interface ConnectionInfo {
  socketId?: string;
  deviceType: string;
  browser: string;
  ipAddress?: string;
  location?: {
    country?: string;
    city?: string;
  };
}

export interface CollaborationEvent {
  id: string;
  session_id: string;
  user_id: string;
  event_type: EventType;
  event_data: Record<string, any>;
  created_at: string;
}

export type EventType =
  | 'session_created'
  | 'session_ended'
  | 'user_joined'
  | 'user_left'
  | 'document_edited'
  | 'cursor_moved'
  | 'selection_changed'
  | 'comment_added'
  | 'comment_resolved'
  | 'version_saved'
  | 'conflict_resolved'
  | 'permission_changed';

export interface CollaborationComment {
  id: string;
  session_id: string;
  document_id: string;
  user_id: string;
  parent_id?: string;
  content: string;
  position?: {
    type: 'point' | 'range' | 'element';
    x?: number;
    y?: number;
    startOffset?: number;
    endOffset?: number;
    elementId?: string;
  };
  status: 'open' | 'resolved' | 'deleted';
  reactions: CommentReaction[];
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

export interface CommentReaction {
  userId: string;
  emoji: string;
  createdAt: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  session_id?: string;
  version_number: number;
  created_by: string;
  label?: string;
  content_snapshot: any;
  changes_summary: string;
  created_at: string;
  metadata: Record<string, any>;
}

export interface CollaborationStats {
  sessionId: string;
  duration: number; // in seconds
  participantCount: number;
  editCount: number;
  commentCount: number;
  versionCount: number;
  conflictCount: number;
  peakConcurrentUsers: number;
}

// ============================================================================
// Collaboration Service
// ============================================================================

class CollaborationService {
  private static instance: CollaborationService;
  private activeSessions: Map<string, {
    session: CollaborationSession;
    crdtManager: CRDTDocumentManager;
    awarenessManagers: Map<string, AwarenessManager>;
  }> = new Map();

  private constructor() {}

  public static getInstance(): CollaborationService {
    if (!CollaborationService.instance) {
      CollaborationService.instance = new CollaborationService();
    }
    return CollaborationService.instance;
  }

  private async getSupabase() {
    return await createClient();
  }

  // ==========================================================================
  // Session Management
  // ==========================================================================

  /**
   * Create a new collaboration session
   */
  async createSession(
    documentId: string,
    documentType: CollaborationSession['document_type'],
    createdBy: string,
    settings?: Partial<SessionSettings>
  ): Promise<CollaborationSession> {
    const supabase = await this.getSupabase();

    const defaultSettings: SessionSettings = {
      maxParticipants: 50,
      allowAnonymous: false,
      requireApproval: false,
      allowComments: true,
      allowEditing: true,
      allowDownload: true,
      autoSaveInterval: 30,
      conflictResolution: 'crdt',
      notifyOnJoin: true,
      notifyOnLeave: false,
      recordHistory: true,
    };

    const sessionData = {
      document_id: documentId,
      document_type: documentType,
      created_by: createdBy,
      status: 'active' as const,
      settings: { ...defaultSettings, ...settings },
      participants: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: {},
    };

    const { data, error } = await supabase
      .from('collaboration_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (error) throw new Error(`Failed to create session: ${error.message}`);

    const session = data as CollaborationSession;

    // Initialize CRDT manager for this session
    const nodeId = generateNodeId();
    const crdtManager = new CRDTDocumentManager(nodeId);

    this.activeSessions.set(session.id, {
      session,
      crdtManager,
      awarenessManagers: new Map(),
    });

    // Log session creation
    await this.logEvent(session.id, createdBy, 'session_created', {
      documentId,
      documentType,
      settings: session.settings,
    });

    return session;
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<CollaborationSession | null> {
    // Check cache first
    const cached = this.activeSessions.get(sessionId);
    if (cached) {
      return cached.session;
    }

    const supabase = await this.getSupabase();

    const { data, error } = await supabase
      .from('collaboration_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) return null;
    return data as CollaborationSession;
  }

  /**
   * Get active session for a document
   */
  async getActiveSessionForDocument(documentId: string): Promise<CollaborationSession | null> {
    const supabase = await this.getSupabase();

    const { data, error } = await supabase
      .from('collaboration_sessions')
      .select('*')
      .eq('document_id', documentId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) return null;
    return data as CollaborationSession;
  }

  /**
   * End a collaboration session
   */
  async endSession(sessionId: string, endedBy: string): Promise<void> {
    const supabase = await this.getSupabase();

    // Update session status
    const { error } = await supabase
      .from('collaboration_sessions')
      .update({
        status: 'ended',
        ended_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    if (error) throw new Error(`Failed to end session: ${error.message}`);

    // Mark all participants as offline
    await supabase
      .from('session_participants')
      .update({
        status: 'offline',
        left_at: new Date().toISOString(),
      })
      .eq('session_id', sessionId)
      .is('left_at', null);

    // Clean up in-memory state
    const activeSession = this.activeSessions.get(sessionId);
    if (activeSession) {
      // Destroy awareness managers
      for (const awareness of activeSession.awarenessManagers.values()) {
        awareness.destroy();
      }
      this.activeSessions.delete(sessionId);
    }

    // Log event
    await this.logEvent(sessionId, endedBy, 'session_ended', {});
  }

  /**
   * Update session settings
   */
  async updateSessionSettings(
    sessionId: string,
    settings: Partial<SessionSettings>,
    updatedBy: string
  ): Promise<CollaborationSession> {
    const supabase = await this.getSupabase();

    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const newSettings = { ...session.settings, ...settings };

    const { data, error } = await supabase
      .from('collaboration_sessions')
      .update({
        settings: newSettings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update settings: ${error.message}`);

    // Update cache
    const cached = this.activeSessions.get(sessionId);
    if (cached) {
      cached.session = data as CollaborationSession;
    }

    return data as CollaborationSession;
  }

  // ==========================================================================
  // Participant Management
  // ==========================================================================

  /**
   * Join a collaboration session
   */
  async joinSession(
    sessionId: string,
    userId: string,
    userName: string,
    userAvatar?: string,
    connectionInfo?: Partial<ConnectionInfo>
  ): Promise<SessionParticipant> {
    const supabase = await this.getSupabase();

    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.status !== 'active') {
      throw new Error('Session is not active');
    }

    // Check if user is already a participant
    const { data: existingParticipant } = await supabase
      .from('session_participants')
      .select('*')
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .is('left_at', null)
      .single();

    if (existingParticipant) {
      // Update existing participant
      const { data, error } = await supabase
        .from('session_participants')
        .update({
          status: 'active',
          last_active_at: new Date().toISOString(),
          connection_info: {
            ...existingParticipant.connection_info,
            ...connectionInfo,
          },
        })
        .eq('id', existingParticipant.id)
        .select()
        .single();

      if (error) throw new Error(`Failed to rejoin session: ${error.message}`);
      return data as SessionParticipant;
    }

    // Determine role based on session creator
    const role = session.created_by === userId ? 'owner' : 'editor';

    // Default permissions based on role
    const permissions: ParticipantPermissions = {
      canEdit: role !== 'viewer' && session.settings.allowEditing,
      canComment: role !== 'viewer' && session.settings.allowComments,
      canInvite: role === 'owner' || role === 'editor',
      canRemove: role === 'owner',
      canChangeSettings: role === 'owner',
      canEndSession: role === 'owner',
    };

    const participantData = {
      session_id: sessionId,
      user_id: userId,
      role,
      status: 'active' as const,
      permissions,
      joined_at: new Date().toISOString(),
      last_active_at: new Date().toISOString(),
      connection_info: {
        deviceType: connectionInfo?.deviceType || 'unknown',
        browser: connectionInfo?.browser || 'unknown',
        ...connectionInfo,
      },
      metadata: {
        userName,
        userAvatar,
      },
    };

    const { data, error } = await supabase
      .from('session_participants')
      .insert(participantData)
      .select()
      .single();

    if (error) throw new Error(`Failed to join session: ${error.message}`);

    const participant = data as SessionParticipant;

    // Initialize awareness manager for this user
    const cached = this.activeSessions.get(sessionId);
    if (cached) {
      const awareness = new AwarenessManager(sessionId, userId, userName, userAvatar);
      cached.awarenessManagers.set(userId, awareness);
    }

    // Log event
    await this.logEvent(sessionId, userId, 'user_joined', {
      role,
      userName,
    });

    return participant;
  }

  /**
   * Leave a collaboration session
   */
  async leaveSession(sessionId: string, userId: string): Promise<void> {
    const supabase = await this.getSupabase();

    const { error } = await supabase
      .from('session_participants')
      .update({
        status: 'offline',
        left_at: new Date().toISOString(),
      })
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .is('left_at', null);

    if (error) throw new Error(`Failed to leave session: ${error.message}`);

    // Clean up awareness manager
    const cached = this.activeSessions.get(sessionId);
    if (cached) {
      const awareness = cached.awarenessManagers.get(userId);
      if (awareness) {
        awareness.destroy();
        cached.awarenessManagers.delete(userId);
      }
    }

    // Log event
    await this.logEvent(sessionId, userId, 'user_left', {});
  }

  /**
   * Get session participants
   */
  async getParticipants(sessionId: string, activeOnly = true): Promise<SessionParticipant[]> {
    const supabase = await this.getSupabase();

    let query = supabase
      .from('session_participants')
      .select('*')
      .eq('session_id', sessionId);

    if (activeOnly) {
      query = query.is('left_at', null);
    }

    const { data, error } = await query.order('joined_at', { ascending: true });

    if (error) throw new Error(`Failed to get participants: ${error.message}`);
    return (data || []) as SessionParticipant[];
  }

  /**
   * Update participant status
   */
  async updateParticipantStatus(
    sessionId: string,
    userId: string,
    status: SessionParticipant['status']
  ): Promise<void> {
    const supabase = await this.getSupabase();

    await supabase
      .from('session_participants')
      .update({
        status,
        last_active_at: new Date().toISOString(),
      })
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .is('left_at', null);
  }

  /**
   * Update participant permissions
   */
  async updateParticipantPermissions(
    sessionId: string,
    userId: string,
    permissions: Partial<ParticipantPermissions>,
    updatedBy: string
  ): Promise<SessionParticipant> {
    const supabase = await this.getSupabase();

    // Get current participant
    const { data: current, error: fetchError } = await supabase
      .from('session_participants')
      .select('*')
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !current) {
      throw new Error('Participant not found');
    }

    const newPermissions = { ...current.permissions, ...permissions };

    const { data, error } = await supabase
      .from('session_participants')
      .update({ permissions: newPermissions })
      .eq('id', current.id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update permissions: ${error.message}`);

    // Log event
    await this.logEvent(sessionId, updatedBy, 'permission_changed', {
      targetUserId: userId,
      permissions: newPermissions,
    });

    return data as SessionParticipant;
  }

  /**
   * Remove participant from session
   */
  async removeParticipant(
    sessionId: string,
    userId: string,
    removedBy: string
  ): Promise<void> {
    await this.leaveSession(sessionId, userId);

    // Log event
    await this.logEvent(sessionId, removedBy, 'user_left', {
      removedBy,
      forced: true,
    });
  }

  // ==========================================================================
  // CRDT Operations
  // ==========================================================================

  /**
   * Get CRDT manager for session
   */
  getCRDTManager(sessionId: string): CRDTDocumentManager | null {
    const cached = this.activeSessions.get(sessionId);
    return cached?.crdtManager || null;
  }

  /**
   * Apply CRDT operation
   */
  async applyCRDTOperation(
    sessionId: string,
    userId: string,
    message: CRDTSyncMessage
  ): Promise<void> {
    const cached = this.activeSessions.get(sessionId);
    if (!cached) {
      throw new Error('Session not found');
    }

    cached.crdtManager.handleSyncMessage(message);

    // Log edit event
    if (message.type === 'operation' && message.operations?.length) {
      await this.logEvent(sessionId, userId, 'document_edited', {
        operationCount: message.operations.length,
        documentId: message.documentId,
      });
    }
  }

  /**
   * Get document state
   */
  getDocumentState(sessionId: string, documentId: string): any {
    const cached = this.activeSessions.get(sessionId);
    if (!cached) return null;

    const doc = cached.crdtManager.getDocument(documentId);
    if (!doc) return null;

    if (doc instanceof CRDTText) {
      return { type: 'text', content: doc.toString() };
    } else if (doc instanceof CRDTMap) {
      return { type: 'map', content: doc.toObject() };
    }

    return null;
  }

  // ==========================================================================
  // Awareness Operations
  // ==========================================================================

  /**
   * Get awareness manager for user
   */
  getAwarenessManager(sessionId: string, userId: string): AwarenessManager | null {
    const cached = this.activeSessions.get(sessionId);
    return cached?.awarenessManagers.get(userId) || null;
  }

  /**
   * Broadcast awareness update
   */
  async broadcastAwarenessUpdate(
    sessionId: string,
    userId: string,
    update: AwarenessUpdate
  ): Promise<void> {
    const cached = this.activeSessions.get(sessionId);
    if (!cached) return;

    // Broadcast to all other awareness managers
    for (const [participantId, awareness] of cached.awarenessManagers) {
      if (participantId !== userId) {
        awareness.handleRemoteUpdate(update);
      }
    }

    // Log cursor/selection events (sampled to avoid spam)
    if (update.type === 'cursor' && Math.random() < 0.01) {
      await this.logEvent(sessionId, userId, 'cursor_moved', {});
    } else if (update.type === 'selection') {
      await this.logEvent(sessionId, userId, 'selection_changed', {});
    }
  }

  /**
   * Get all user awareness states
   */
  getAllAwarenessStates(sessionId: string): Map<string, UserAwareness> {
    const cached = this.activeSessions.get(sessionId);
    if (!cached) return new Map();

    const states = new Map<string, UserAwareness>();
    for (const [userId, awareness] of cached.awarenessManagers) {
      states.set(userId, awareness.getLocalUser());
    }
    return states;
  }

  // ==========================================================================
  // Comments
  // ==========================================================================

  /**
   * Add a comment
   */
  async addComment(
    sessionId: string,
    documentId: string,
    userId: string,
    content: string,
    position?: CollaborationComment['position'],
    parentId?: string
  ): Promise<CollaborationComment> {
    const supabase = await this.getSupabase();

    const commentData = {
      session_id: sessionId,
      document_id: documentId,
      user_id: userId,
      parent_id: parentId,
      content,
      position,
      status: 'open' as const,
      reactions: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('collaboration_comments')
      .insert(commentData)
      .select()
      .single();

    if (error) throw new Error(`Failed to add comment: ${error.message}`);

    // Log event
    await this.logEvent(sessionId, userId, 'comment_added', {
      commentId: data.id,
      hasPosition: !!position,
      isReply: !!parentId,
    });

    return data as CollaborationComment;
  }

  /**
   * Get comments for document
   */
  async getComments(
    sessionId: string,
    documentId: string,
    includeResolved = false
  ): Promise<CollaborationComment[]> {
    const supabase = await this.getSupabase();

    let query = supabase
      .from('collaboration_comments')
      .select('*')
      .eq('session_id', sessionId)
      .eq('document_id', documentId)
      .neq('status', 'deleted');

    if (!includeResolved) {
      query = query.eq('status', 'open');
    }

    const { data, error } = await query.order('created_at', { ascending: true });

    if (error) throw new Error(`Failed to get comments: ${error.message}`);
    return (data || []) as CollaborationComment[];
  }

  /**
   * Resolve a comment
   */
  async resolveComment(
    commentId: string,
    resolvedBy: string
  ): Promise<CollaborationComment> {
    const supabase = await this.getSupabase();

    const { data, error } = await supabase
      .from('collaboration_comments')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        resolved_by: resolvedBy,
        updated_at: new Date().toISOString(),
      })
      .eq('id', commentId)
      .select()
      .single();

    if (error) throw new Error(`Failed to resolve comment: ${error.message}`);

    // Log event
    await this.logEvent(data.session_id, resolvedBy, 'comment_resolved', {
      commentId,
    });

    return data as CollaborationComment;
  }

  /**
   * Add reaction to comment
   */
  async addReaction(
    commentId: string,
    userId: string,
    emoji: string
  ): Promise<CollaborationComment> {
    const supabase = await this.getSupabase();

    // Get current comment
    const { data: comment, error: fetchError } = await supabase
      .from('collaboration_comments')
      .select('*')
      .eq('id', commentId)
      .single();

    if (fetchError || !comment) {
      throw new Error('Comment not found');
    }

    // Add reaction
    const reactions = [...(comment.reactions || [])];
    const existingIndex = reactions.findIndex(
      r => r.userId === userId && r.emoji === emoji
    );

    if (existingIndex >= 0) {
      // Remove if already exists
      reactions.splice(existingIndex, 1);
    } else {
      // Add new reaction
      reactions.push({
        userId,
        emoji,
        createdAt: new Date().toISOString(),
      });
    }

    const { data, error } = await supabase
      .from('collaboration_comments')
      .update({
        reactions,
        updated_at: new Date().toISOString(),
      })
      .eq('id', commentId)
      .select()
      .single();

    if (error) throw new Error(`Failed to add reaction: ${error.message}`);
    return data as CollaborationComment;
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string, deletedBy: string): Promise<void> {
    const supabase = await this.getSupabase();

    const { error } = await supabase
      .from('collaboration_comments')
      .update({
        status: 'deleted',
        content: '[Deleted]',
        updated_at: new Date().toISOString(),
      })
      .eq('id', commentId);

    if (error) throw new Error(`Failed to delete comment: ${error.message}`);
  }

  // ==========================================================================
  // Version History
  // ==========================================================================

  /**
   * Save a version snapshot
   */
  async saveVersion(
    documentId: string,
    createdBy: string,
    contentSnapshot: any,
    label?: string,
    sessionId?: string
  ): Promise<DocumentVersion> {
    const supabase = await this.getSupabase();

    // Get the next version number
    const { data: lastVersion } = await supabase
      .from('document_versions')
      .select('version_number')
      .eq('document_id', documentId)
      .order('version_number', { ascending: false })
      .limit(1)
      .single();

    const versionNumber = (lastVersion?.version_number || 0) + 1;

    const versionData = {
      document_id: documentId,
      session_id: sessionId,
      version_number: versionNumber,
      created_by: createdBy,
      label: label || `Version ${versionNumber}`,
      content_snapshot: contentSnapshot,
      changes_summary: this.generateChangesSummary(contentSnapshot),
      created_at: new Date().toISOString(),
      metadata: {},
    };

    const { data, error } = await supabase
      .from('document_versions')
      .insert(versionData)
      .select()
      .single();

    if (error) throw new Error(`Failed to save version: ${error.message}`);

    // Log event if in session
    if (sessionId) {
      await this.logEvent(sessionId, createdBy, 'version_saved', {
        versionId: data.id,
        versionNumber,
        label,
      });
    }

    return data as DocumentVersion;
  }

  /**
   * Get version history for document
   */
  async getVersionHistory(
    documentId: string,
    limit = 50
  ): Promise<DocumentVersion[]> {
    const supabase = await this.getSupabase();

    const { data, error } = await supabase
      .from('document_versions')
      .select('*')
      .eq('document_id', documentId)
      .order('version_number', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to get version history: ${error.message}`);
    return (data || []) as DocumentVersion[];
  }

  /**
   * Get specific version
   */
  async getVersion(versionId: string): Promise<DocumentVersion | null> {
    const supabase = await this.getSupabase();

    const { data, error } = await supabase
      .from('document_versions')
      .select('*')
      .eq('id', versionId)
      .single();

    if (error) return null;
    return data as DocumentVersion;
  }

  /**
   * Restore to a previous version
   */
  async restoreVersion(
    versionId: string,
    restoredBy: string
  ): Promise<DocumentVersion> {
    const version = await this.getVersion(versionId);
    if (!version) {
      throw new Error('Version not found');
    }

    // Create a new version as the restored version
    return this.saveVersion(
      version.document_id,
      restoredBy,
      version.content_snapshot,
      `Restored from Version ${version.version_number}`
    );
  }

  private generateChangesSummary(snapshot: any): string {
    // Generate a brief summary of the content
    if (typeof snapshot === 'string') {
      return `Text content (${snapshot.length} characters)`;
    }
    if (typeof snapshot === 'object') {
      return `Object with ${Object.keys(snapshot).length} keys`;
    }
    return 'Content snapshot';
  }

  // ==========================================================================
  // Event Logging
  // ==========================================================================

  /**
   * Log a collaboration event
   */
  private async logEvent(
    sessionId: string,
    userId: string,
    eventType: EventType,
    eventData: Record<string, any>
  ): Promise<void> {
    try {
      const supabase = await this.getSupabase();

      await supabase.from('collaboration_events').insert({
        session_id: sessionId,
        user_id: userId,
        event_type: eventType,
        event_data: eventData,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to log collaboration event:', error);
    }
  }

  /**
   * Get session events
   */
  async getSessionEvents(
    sessionId: string,
    eventTypes?: EventType[],
    limit = 100
  ): Promise<CollaborationEvent[]> {
    const supabase = await this.getSupabase();

    let query = supabase
      .from('collaboration_events')
      .select('*')
      .eq('session_id', sessionId);

    if (eventTypes?.length) {
      query = query.in('event_type', eventTypes);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to get events: ${error.message}`);
    return (data || []) as CollaborationEvent[];
  }

  // ==========================================================================
  // Statistics
  // ==========================================================================

  /**
   * Get session statistics
   */
  async getSessionStats(sessionId: string): Promise<CollaborationStats> {
    const supabase = await this.getSupabase();

    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Get event counts
    const [participants, events, versions] = await Promise.all([
      this.getParticipants(sessionId, false),
      this.getSessionEvents(sessionId),
      this.getVersionHistory(session.document_id),
    ]);

    const editEvents = events.filter(e => e.event_type === 'document_edited');
    const commentEvents = events.filter(e => e.event_type === 'comment_added');
    const conflictEvents = events.filter(e => e.event_type === 'conflict_resolved');

    // Calculate duration
    const startTime = new Date(session.created_at).getTime();
    const endTime = session.ended_at
      ? new Date(session.ended_at).getTime()
      : Date.now();
    const duration = Math.floor((endTime - startTime) / 1000);

    return {
      sessionId,
      duration,
      participantCount: participants.length,
      editCount: editEvents.length,
      commentCount: commentEvents.length,
      versionCount: versions.length,
      conflictCount: conflictEvents.length,
      peakConcurrentUsers: this.calculatePeakConcurrentUsers(events),
    };
  }

  private calculatePeakConcurrentUsers(events: CollaborationEvent[]): number {
    // Simple calculation based on join/leave events
    let current = 0;
    let peak = 0;

    const sortedEvents = [...events]
      .filter(e => e.event_type === 'user_joined' || e.event_type === 'user_left')
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    for (const event of sortedEvents) {
      if (event.event_type === 'user_joined') {
        current++;
        peak = Math.max(peak, current);
      } else {
        current = Math.max(0, current - 1);
      }
    }

    return peak;
  }

  /**
   * Get user collaboration history
   */
  async getUserCollaborationHistory(
    userId: string,
    limit = 50
  ): Promise<CollaborationSession[]> {
    const supabase = await this.getSupabase();

    const { data: participations } = await supabase
      .from('session_participants')
      .select('session_id')
      .eq('user_id', userId)
      .order('joined_at', { ascending: false })
      .limit(limit);

    if (!participations?.length) return [];

    const sessionIds = participations.map(p => p.session_id);

    const { data: sessions, error } = await supabase
      .from('collaboration_sessions')
      .select('*')
      .in('id', sessionIds)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to get collaboration history: ${error.message}`);
    return (sessions || []) as CollaborationSession[];
  }
}

// Export singleton instance
export const collaborationService = CollaborationService.getInstance();

// Also export the class for testing
export { CollaborationService };
