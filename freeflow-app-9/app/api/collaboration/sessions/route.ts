// =====================================================
// KAZI Real-Time Collaboration Sessions API
// Full collaboration with CRDT support
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { collaborationService } from '@/lib/collaboration/collaboration-service';

// =====================================================
// GET - List sessions, get session details, participants
// =====================================================
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const sessionId = searchParams.get('sessionId');

    // Demo mode for unauthenticated users
    if (!user) {
      return handleDemoGet(action, sessionId);
    }

    switch (action) {
      case 'get': {
        if (!sessionId) {
          return NextResponse.json(
            { success: false, error: 'Session ID required' },
            { status: 400 }
          );
        }
        const session = await collaborationService.getSession(sessionId);
        if (!session) {
          return NextResponse.json(
            { success: false, error: 'Session not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, session });
      }

      case 'participants': {
        if (!sessionId) {
          return NextResponse.json(
            { success: false, error: 'Session ID required' },
            { status: 400 }
          );
        }
        const activeOnly = searchParams.get('activeOnly') === 'true';
        const participants = await collaborationService.getParticipants(sessionId, activeOnly);
        return NextResponse.json({ success: true, participants });
      }

      case 'comments': {
        const documentId = searchParams.get('documentId');
        if (!sessionId && !documentId) {
          return NextResponse.json(
            { success: false, error: 'Session ID or Document ID required' },
            { status: 400 }
          );
        }
        const comments = await collaborationService.getComments(
          sessionId || undefined,
          documentId || undefined
        );
        return NextResponse.json({ success: true, comments });
      }

      case 'versions': {
        const documentId = searchParams.get('documentId');
        if (!documentId) {
          return NextResponse.json(
            { success: false, error: 'Document ID required' },
            { status: 400 }
          );
        }
        const limit = parseInt(searchParams.get('limit') || '20');
        const versions = await collaborationService.getVersionHistory(documentId, limit);
        return NextResponse.json({ success: true, versions });
      }

      case 'stats': {
        if (!sessionId) {
          return NextResponse.json(
            { success: false, error: 'Session ID required' },
            { status: 400 }
          );
        }
        const stats = await collaborationService.getSessionStats(sessionId);
        return NextResponse.json({ success: true, stats });
      }

      case 'document-sessions': {
        const documentId = searchParams.get('documentId');
        if (!documentId) {
          return NextResponse.json(
            { success: false, error: 'Document ID required' },
            { status: 400 }
          );
        }
        const sessions = await collaborationService.getDocumentSessions(documentId);
        return NextResponse.json({ success: true, sessions });
      }

      case 'service-status': {
        return NextResponse.json({
          success: true,
          service: 'Collaboration Service',
          version: '2.0.0',
          status: 'operational',
          capabilities: [
            'real_time_sync',
            'crdt_operations',
            'awareness_protocol',
            'cursor_tracking',
            'version_history',
            'timestamped_comments',
            'session_management',
            'conflict_resolution'
          ]
        });
      }

      default: {
        // List user's sessions
        const status = searchParams.get('status') as any;
        const documentType = searchParams.get('documentType') as any;
        const sessions = await collaborationService.getUserSessions(user.id, status, documentType);
        return NextResponse.json({
          success: true,
          sessions,
          total: sessions.length
        });
      }
    }
  } catch (error: any) {
    console.error('Collaboration GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch collaboration data' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - Create sessions, join, comments, versions
// =====================================================
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { action, ...data } = body;

    // Demo mode for unauthenticated users
    if (!user) {
      return handleDemoPost(action, data);
    }

    switch (action) {
      case 'create-session': {
        if (!data.documentId || !data.documentType) {
          return NextResponse.json(
            { success: false, error: 'Document ID and type required' },
            { status: 400 }
          );
        }

        const session = await collaborationService.createSession(
          data.documentId,
          data.documentType,
          user.id,
          {
            name: data.name,
            maxParticipants: data.maxParticipants,
            allowAnonymous: data.allowAnonymous,
            requireApproval: data.requireApproval,
            autoSaveInterval: data.autoSaveInterval,
            syncFrequency: data.syncFrequency,
            expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
          }
        );

        return NextResponse.json({
          success: true,
          action: 'create-session',
          session,
          message: 'Collaboration session created'
        }, { status: 201 });
      }

      case 'join-session': {
        if (!data.sessionId) {
          return NextResponse.json(
            { success: false, error: 'Session ID required' },
            { status: 400 }
          );
        }

        const participant = await collaborationService.joinSession(
          data.sessionId,
          user.id,
          data.displayName || user.email?.split('@')[0] || 'Anonymous',
          data.avatarUrl,
          {
            connectionId: data.connectionId,
            deviceType: data.deviceType,
            browser: data.browser,
          }
        );

        // Get CRDT manager for sync
        const crdtManager = collaborationService.getCRDTManager(data.sessionId);
        const initialState = crdtManager?.exportState();

        return NextResponse.json({
          success: true,
          action: 'join-session',
          participant,
          crdtState: initialState ? Buffer.from(initialState).toString('base64') : null,
          message: 'Joined session successfully'
        });
      }

      case 'leave-session': {
        if (!data.sessionId) {
          return NextResponse.json(
            { success: false, error: 'Session ID required' },
            { status: 400 }
          );
        }

        await collaborationService.leaveSession(data.sessionId, user.id);
        return NextResponse.json({
          success: true,
          action: 'leave-session',
          message: 'Left session successfully'
        });
      }

      case 'end-session': {
        if (!data.sessionId) {
          return NextResponse.json(
            { success: false, error: 'Session ID required' },
            { status: 400 }
          );
        }

        await collaborationService.endSession(data.sessionId, user.id);
        return NextResponse.json({
          success: true,
          action: 'end-session',
          message: 'Session ended'
        });
      }

      case 'sync-crdt': {
        if (!data.sessionId || !data.operation) {
          return NextResponse.json(
            { success: false, error: 'Session ID and operation required' },
            { status: 400 }
          );
        }

        await collaborationService.applyCRDTOperation(
          data.sessionId,
          user.id,
          data.operation
        );

        return NextResponse.json({
          success: true,
          action: 'sync-crdt',
          message: 'CRDT operation applied'
        });
      }

      case 'update-awareness': {
        if (!data.sessionId || !data.update) {
          return NextResponse.json(
            { success: false, error: 'Session ID and update required' },
            { status: 400 }
          );
        }

        await collaborationService.broadcastAwarenessUpdate(
          data.sessionId,
          user.id,
          data.update
        );

        return NextResponse.json({
          success: true,
          action: 'update-awareness',
          message: 'Awareness update broadcast'
        });
      }

      case 'add-comment': {
        if (!data.documentId || !data.content) {
          return NextResponse.json(
            { success: false, error: 'Document ID and content required' },
            { status: 400 }
          );
        }

        const comment = await collaborationService.addComment(
          data.sessionId || null,
          data.documentId,
          user.id,
          data.content,
          data.position,
          data.parentCommentId
        );

        return NextResponse.json({
          success: true,
          action: 'add-comment',
          comment,
          message: 'Comment added'
        });
      }

      case 'resolve-comment': {
        if (!data.commentId) {
          return NextResponse.json(
            { success: false, error: 'Comment ID required' },
            { status: 400 }
          );
        }

        const comment = await collaborationService.resolveComment(data.commentId, user.id);
        return NextResponse.json({
          success: true,
          action: 'resolve-comment',
          comment,
          message: 'Comment resolved'
        });
      }

      case 'save-version': {
        if (!data.documentId || !data.contentSnapshot) {
          return NextResponse.json(
            { success: false, error: 'Document ID and content snapshot required' },
            { status: 400 }
          );
        }

        const version = await collaborationService.saveVersion(
          data.documentId,
          user.id,
          data.contentSnapshot,
          data.label,
          data.sessionId
        );

        return NextResponse.json({
          success: true,
          action: 'save-version',
          version,
          message: 'Version saved'
        });
      }

      case 'restore-version': {
        if (!data.versionId) {
          return NextResponse.json(
            { success: false, error: 'Version ID required' },
            { status: 400 }
          );
        }

        const version = await collaborationService.restoreVersion(data.versionId, user.id);
        return NextResponse.json({
          success: true,
          action: 'restore-version',
          version,
          message: 'Version restored'
        });
      }

      case 'send-invite': {
        if (!data.sessionId) {
          return NextResponse.json(
            { success: false, error: 'Session ID required' },
            { status: 400 }
          );
        }

        const invite = await collaborationService.sendInvite(
          data.sessionId,
          user.id,
          data.invitedUserId,
          data.invitedEmail,
          data.role,
          data.message
        );

        return NextResponse.json({
          success: true,
          action: 'send-invite',
          invite,
          message: 'Invitation sent'
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Collaboration POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Operation failed' },
      { status: 500 }
    );
  }
}

// =====================================================
// PUT - Update session, participant, comment
// =====================================================
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, participantId, commentId, ...updates } = body;

    if (sessionId && updates.settings) {
      // Update session settings
      const session = await collaborationService.updateSessionSettings(sessionId, updates.settings);
      return NextResponse.json({
        success: true,
        session,
        message: 'Session updated'
      });
    }

    if (participantId) {
      // Update participant role/permissions
      const participant = await collaborationService.updateParticipant(
        participantId,
        updates
      );
      return NextResponse.json({
        success: true,
        participant,
        message: 'Participant updated'
      });
    }

    if (commentId) {
      // Update comment
      const comment = await collaborationService.updateComment(commentId, user.id, updates.content);
      return NextResponse.json({
        success: true,
        comment,
        message: 'Comment updated'
      });
    }

    return NextResponse.json(
      { success: false, error: 'ID required for update' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Collaboration PUT error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update' },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE - Remove participant, comment, version
// =====================================================
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const participantId = searchParams.get('participantId');
    const commentId = searchParams.get('commentId');

    if (sessionId && participantId) {
      // Remove participant from session
      await collaborationService.removeParticipant(sessionId, participantId, user.id);
      return NextResponse.json({
        success: true,
        message: 'Participant removed'
      });
    }

    if (commentId) {
      await collaborationService.deleteComment(commentId, user.id);
      return NextResponse.json({
        success: true,
        message: 'Comment deleted'
      });
    }

    return NextResponse.json(
      { success: false, error: 'ID required for deletion' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Collaboration DELETE error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete' },
      { status: 500 }
    );
  }
}

// =====================================================
// DEMO MODE HANDLERS
// =====================================================
function handleDemoGet(action: string | null, sessionId: string | null): NextResponse {
  const mockSession = {
    id: 'demo-session-1',
    documentId: 'demo-doc-1',
    documentType: 'document',
    status: 'active',
    participantCount: 3,
    createdAt: new Date().toISOString(),
    participants: [
      { id: '1', displayName: 'Alice', status: 'connected', color: '#FF6B6B' },
      { id: '2', displayName: 'Bob', status: 'connected', color: '#4ECDC4' },
      { id: '3', displayName: 'Charlie', status: 'idle', color: '#45B7D1' },
    ]
  };

  switch (action) {
    case 'get':
      return NextResponse.json({
        success: true,
        session: mockSession,
        message: 'Demo session loaded'
      });
    case 'participants':
      return NextResponse.json({
        success: true,
        participants: mockSession.participants,
        message: 'Demo participants'
      });
    case 'stats':
      return NextResponse.json({
        success: true,
        stats: {
          totalParticipants: 3,
          activeParticipants: 2,
          totalEdits: 156,
          sessionDuration: 3600,
          averageActiveTime: 1800
        },
        message: 'Demo stats'
      });
    default:
      return NextResponse.json({
        success: true,
        sessions: [mockSession],
        total: 1,
        message: 'Demo sessions loaded'
      });
  }
}

function handleDemoPost(action: string, data: any): NextResponse {
  switch (action) {
    case 'create-session':
      return NextResponse.json({
        success: true,
        action: 'create-session',
        session: {
          id: 'demo-new-session',
          documentId: data.documentId,
          documentType: data.documentType,
          status: 'active',
          inviteCode: 'DEMO1234',
          createdAt: new Date().toISOString(),
        },
        message: 'Demo session created'
      });
    case 'join-session':
      return NextResponse.json({
        success: true,
        action: 'join-session',
        participant: {
          id: 'demo-participant',
          displayName: 'Demo User',
          status: 'connected',
          color: '#9B59B6',
        },
        message: 'Joined demo session'
      });
    case 'add-comment':
      return NextResponse.json({
        success: true,
        action: 'add-comment',
        comment: {
          id: 'demo-comment',
          content: data.content,
          createdAt: new Date().toISOString(),
        },
        message: 'Demo comment added'
      });
    default:
      return NextResponse.json({
        success: false,
        error: 'Please log in to use this feature'
      }, { status: 401 });
  }
}
