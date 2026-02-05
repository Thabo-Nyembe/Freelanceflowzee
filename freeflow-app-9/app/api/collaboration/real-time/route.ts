/**
 * Real-Time Collaboration API
 *
 * REST endpoints for managing real-time collaboration sessions.
 * The actual real-time communication uses Supabase Realtime channels,
 * but this API provides session management and REST fallbacks.
 *
 * GET - Get active collaboration sessions
 * POST - Create or join a collaboration session
 * PUT - Update session state (cursors, selections, etc.)
 * DELETE - Leave or end a collaboration session
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import logger from '@/lib/logger';
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const sessionId = searchParams.get('session_id');

    // Get specific session
    if (sessionId) {
      const { data: session, error } = await supabase
        .from('collaboration_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) {
        logger.error('Failed to get collaboration session', { error });
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        session,
        message: 'Session retrieved successfully'
      });
    }

    // Get sessions for a project
    if (projectId) {
      const { data: sessions, error } = await supabase
        .from('collaboration_sessions')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Failed to get collaboration sessions', { error });
        return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        sessions: sessions || [],
        count: sessions?.length || 0
      });
    }

    // Get all active sessions for the user
    const { data: userSessions, error } = await supabase
      .from('collaboration_sessions')
      .select('*')
      .contains('participants', [{ user_id: user.id }])
      .eq('is_active', true)
      .order('last_activity_at', { ascending: false })
      .limit(50);

    return NextResponse.json({
      success: true,
      sessions: userSessions || [],
      userId: user.id,
      message: 'Real-time collaboration API operational'
    });

  } catch (error) {
    logger.error('Real-time collaboration API error', { error });
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, projectId, sessionId, data } = body;

    switch (action) {
      case 'create': {
        // Create a new collaboration session
        const { data: session, error } = await supabase
          .from('collaboration_sessions')
          .insert({
            project_id: projectId,
            host_id: user.id,
            participants: [{ user_id: user.id, joined_at: new Date().toISOString() }],
            is_active: true,
            created_at: new Date().toISOString(),
            last_activity_at: new Date().toISOString(),
            settings: data?.settings || {},
          })
          .select()
          .single();

        if (error) {
          logger.error('Failed to create collaboration session', { error });
          return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
        }

        logger.info('Collaboration session created', { sessionId: session.id, projectId });

        return NextResponse.json({
          success: true,
          session,
          message: 'Session created successfully'
        }, { status: 201 });
      }

      case 'join': {
        // Join an existing session
        const { data: existingSession, error: fetchError } = await supabase
          .from('collaboration_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        if (fetchError || !existingSession) {
          return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        const participants = existingSession.participants || [];
        const alreadyJoined = participants.some((p: any) => p.user_id === user.id);

        if (!alreadyJoined) {
          participants.push({ user_id: user.id, joined_at: new Date().toISOString() });
        }

        const { data: updatedSession, error: updateError } = await supabase
          .from('collaboration_sessions')
          .update({
            participants,
            last_activity_at: new Date().toISOString()
          })
          .eq('id', sessionId)
          .select()
          .single();

        if (updateError) {
          logger.error('Failed to join collaboration session', { error: updateError });
          return NextResponse.json({ error: 'Failed to join session' }, { status: 500 });
        }

        logger.info('User joined collaboration session', { sessionId, userId: user.id });

        return NextResponse.json({
          success: true,
          session: updatedSession,
          message: alreadyJoined ? 'Already in session' : 'Joined session successfully'
        });
      }

      case 'update_cursor': {
        // Update user cursor position (REST fallback for Supabase Realtime)
        const { cursor } = data;

        const { error } = await supabase
          .from('collaboration_sessions')
          .update({
            [`user_cursors->${user.id}`]: cursor,
            last_activity_at: new Date().toISOString()
          })
          .eq('id', sessionId);

        if (error) {
          logger.error('Failed to update cursor', { error });
          return NextResponse.json({ error: 'Failed to update cursor' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Cursor updated' });
      }

      case 'add_comment': {
        // Add a comment to the session
        const { comment } = data;

        const { data: newComment, error } = await supabase
          .from('collaboration_comments')
          .insert({
            session_id: sessionId,
            user_id: user.id,
            content: comment.content,
            block_id: comment.blockId,
            position: comment.position,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          logger.error('Failed to add comment', { error });
          return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          comment: newComment,
          message: 'Comment added successfully'
        }, { status: 201 });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action', validActions: ['create', 'join', 'update_cursor', 'add_comment'] },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('Real-time collaboration API error', { error });
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  // PATCH is an alias for PUT - both support partial updates
  return PUT(request)
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, settings, isActive } = body;

    const updateData: any = {
      last_activity_at: new Date().toISOString()
    };

    if (settings) updateData.settings = settings;
    if (typeof isActive === 'boolean') updateData.is_active = isActive;

    const { data: session, error } = await supabase
      .from('collaboration_sessions')
      .update(updateData)
      .eq('id', sessionId)
      .eq('host_id', user.id) // Only host can update
      .select()
      .single();

    if (error) {
      logger.error('Failed to update collaboration session', { error });
      return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      session,
      message: 'Session updated successfully'
    });

  } catch (error) {
    logger.error('Real-time collaboration API error', { error });
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    const action = searchParams.get('action') || 'leave';

    if (!sessionId) {
      return NextResponse.json({ error: 'session_id is required' }, { status: 400 });
    }

    // Get the session
    const { data: session, error: fetchError } = await supabase
      .from('collaboration_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (fetchError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (action === 'end' && session.host_id === user.id) {
      // Host can end the session
      const { error } = await supabase
        .from('collaboration_sessions')
        .update({ is_active: false, ended_at: new Date().toISOString() })
        .eq('id', sessionId);

      if (error) {
        logger.error('Failed to end collaboration session', { error });
        return NextResponse.json({ error: 'Failed to end session' }, { status: 500 });
      }

      logger.info('Collaboration session ended', { sessionId, userId: user.id });

      return NextResponse.json({
        success: true,
        message: 'Session ended successfully'
      });
    }

    // Leave the session
    const participants = (session.participants || []).filter(
      (p: any) => p.user_id !== user.id
    );

    const { error } = await supabase
      .from('collaboration_sessions')
      .update({
        participants,
        last_activity_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (error) {
      logger.error('Failed to leave collaboration session', { error });
      return NextResponse.json({ error: 'Failed to leave session' }, { status: 500 });
    }

    logger.info('User left collaboration session', { sessionId, userId: user.id });

    return NextResponse.json({
      success: true,
      message: 'Left session successfully'
    });

  } catch (error) {
    logger.error('Real-time collaboration API error', { error });
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
