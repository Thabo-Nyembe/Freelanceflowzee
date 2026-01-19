/**
 * Video Review Sessions API - FreeFlow A+++ Implementation
 * Frame.io-style review workflow management
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Get review sessions
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('video_id');
    const status = searchParams.get('status');
    const role = searchParams.get('role'); // 'creator' | 'participant'
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = supabase
      .from('video_review_sessions')
      .select(
        `
        *,
        video:video_assets!video_review_sessions_video_id_fkey (
          id,
          title,
          thumbnail_url,
          duration_ms
        ),
        creator:users!video_review_sessions_created_by_fkey (
          id,
          name,
          avatar_url
        ),
        participants:video_review_participants (
          id,
          user_id,
          email,
          role,
          status,
          user:users (
            id,
            name,
            avatar_url
          )
        )
      `,
        { count: 'exact' }
      );

    // Filter by video
    if (videoId) {
      query = query.eq('video_id', videoId);
    }

    // Filter by role
    if (role === 'creator') {
      query = query.eq('created_by', user.id);
    } else if (role === 'participant') {
      // Get sessions where user is a participant
      const { data: participations } = await supabase
        .from('video_review_participants')
        .select('session_id')
        .eq('user_id', user.id);

      const sessionIds = participations?.map((p) => p.session_id) || [];
      if (sessionIds.length === 0) {
        return NextResponse.json({ sessions: [], total: 0, page, limit });
      }
      query = query.in('id', sessionIds);
    } else {
      // Get both created and participating
      const { data: participations } = await supabase
        .from('video_review_participants')
        .select('session_id')
        .eq('user_id', user.id);

      const sessionIds = participations?.map((p) => p.session_id) || [];
      query = query.or(`created_by.eq.${user.id},id.in.(${sessionIds.join(',')})`);
    }

    // Filter by status
    if (status) {
      query = query.eq('status', status);
    }

    // Sorting and pagination
    query = query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    const { data: sessions, error, count } = await query;

    if (error) {
      if (error.code === '42P01') {
        return NextResponse.json({ sessions: [], total: 0, page, limit });
      }
      throw error;
    }

    return NextResponse.json({
      sessions: sessions || [],
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error('Video review sessions GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new review session
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      video_id,
      title,
      description,
      due_date,
      required_approvers = 1,
      is_public = false,
      password,
      participants = [],
    } = body;

    // Validate required fields
    if (!video_id) {
      return NextResponse.json({ error: 'video_id is required' }, { status: 400 });
    }

    // Verify video ownership
    const { data: video, error: videoError } = await supabase
      .from('video_assets')
      .select('id, user_id')
      .eq('id', video_id)
      .single();

    if (videoError || !video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    if (video.user_id !== user.id) {
      return NextResponse.json({ error: 'Only video owner can create review sessions' }, { status: 403 });
    }

    // Hash password if provided
    let passwordHash = null;
    if (password) {
      // In production, use bcrypt
      passwordHash = Buffer.from(password).toString('base64');
    }

    // Create session
    const { data: session, error } = await supabase
      .from('video_review_sessions')
      .insert({
        video_id,
        created_by: user.id,
        title: title || 'Review Session',
        description,
        due_date,
        required_approvers,
        is_public,
        password_hash: passwordHash,
      })
      .select()
      .single();

    if (error) throw error;

    // Add participants
    if (participants.length > 0) {
      const participantRecords = participants.map((p: { user_id?: string; email?: string; role?: string }) => ({
        session_id: session.id,
        user_id: p.user_id,
        email: p.email,
        role: p.role || 'reviewer',
      }));

      await supabase.from('video_review_participants').insert(participantRecords);

      // Send invitation notifications
      for (const participant of participants) {
        if (participant.user_id) {
          await supabase.from('notifications').insert({
            user_id: participant.user_id,
            type: 'video_review_invite',
            title: `You're invited to review "${title || 'a video'}"`,
            message: description?.substring(0, 100) || 'Please review this video',
            data: {
              session_id: session.id,
              video_id,
            },
          });
        }
        // TODO: Send email for external participants
      }
    }

    // Fetch complete session with participants
    const { data: completeSession } = await supabase
      .from('video_review_sessions')
      .select(
        `
        *,
        video:video_assets (
          id,
          title,
          thumbnail_url
        ),
        participants:video_review_participants (
          id,
          user_id,
          email,
          role,
          status,
          user:users (
            id,
            name,
            avatar_url
          )
        )
      `
      )
      .eq('id', session.id)
      .single();

    return NextResponse.json(completeSession, { status: 201 });
  } catch (error) {
    console.error('Video review session POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update a review session
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Check ownership
    const { data: existing, error: fetchError } = await supabase
      .from('video_review_sessions')
      .select('created_by')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (existing.created_by !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Filter allowed update fields
    const allowedFields = ['title', 'description', 'status', 'due_date', 'required_approvers', 'is_public'];
    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    }

    // Handle status changes
    if (updates.status === 'approved' || updates.status === 'rejected') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data: session, error } = await supabase
      .from('video_review_sessions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(session);
  } catch (error) {
    console.error('Video review session PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a review session
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Check ownership
    const { data: existing, error: fetchError } = await supabase
      .from('video_review_sessions')
      .select('created_by')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (existing.created_by !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase.from('video_review_sessions').delete().eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Video review session DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
