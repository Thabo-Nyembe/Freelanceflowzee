/**
 * Video Review Sessions API - FreeFlow A+++ Implementation
 * Frame.io-style review workflow management
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createFeatureLogger } from '@/lib/logger';
import { getEmailService } from '@/lib/email/email-service';

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}

const logger = createFeatureLogger('video-reviews');

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
    logger.error('Video review sessions GET error', { error });
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

        // Send email for external participants (those with email but no user_id)
        if (participant.email && !participant.user_id) {
          try {
            const emailService = getEmailService();
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            const reviewUrl = `${baseUrl}/review/${session.id}${password ? `?token=${encodeURIComponent(password)}` : ''}`;

            // Get inviter name
            const { data: inviterData } = await supabase
              .from('users')
              .select('raw_user_meta_data')
              .eq('id', user.id)
              .single();
            const inviterName = inviterData?.raw_user_meta_data?.name || inviterData?.raw_user_meta_data?.full_name || 'Someone';

            await emailService.send({
              to: participant.email,
              subject: `You're invited to review "${title || 'a video'}"`,
              text: `${inviterName} has invited you to review a video.\n\nProject: ${title || 'Video Review'}\n${description ? `Description: ${description}\n` : ''}${due_date ? `Due Date: ${new Date(due_date).toLocaleDateString()}\n` : ''}\nReview at: ${reviewUrl}`,
              html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Video Review Invitation</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Video Review Invitation</h1>
  </div>
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="color: #4b5563;">Hi there,</p>
    <p style="color: #4b5563;"><strong>${inviterName}</strong> has invited you to review a video.</p>

    <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="margin: 0 0 10px 0; color: #1f2937;">${title || 'Video Review'}</h3>
      ${description ? `<p style="color: #6b7280; margin: 5px 0;">${description}</p>` : ''}
      ${due_date ? `<p style="color: #6b7280; margin: 5px 0;"><strong>Due:</strong> ${new Date(due_date).toLocaleDateString()}</p>` : ''}
      <p style="color: #6b7280; margin: 5px 0;"><strong>Your Role:</strong> ${participant.role || 'Reviewer'}</p>
    </div>

    <p style="margin-top: 25px; text-align: center;">
      <a href="${reviewUrl}" style="background-color: #4F46E5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
        Start Review
      </a>
    </p>

    <p style="color: #9ca3af; font-size: 12px; margin-top: 20px; text-align: center;">
      If you have any questions, please contact the person who invited you.
    </p>
  </div>
</body>
</html>
              `,
              tags: ['video-review', 'invite', 'external'],
              metadata: {
                sessionId: session.id,
                videoId: video_id,
                participantEmail: participant.email,
              },
            });
            logger.info('External participant video review invite sent', {
              email: participant.email,
              sessionId: session.id,
            });
          } catch (emailError) {
            // Log error but don't fail the session creation
            logger.error('Failed to send external participant invite email', {
              error: emailError,
              email: participant.email,
              sessionId: session.id,
            });
          }
        }
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
    logger.error('Video review session POST error', { error });
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
    logger.error('Video review session PATCH error', { error });
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
    logger.error('Video review session DELETE error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
