/**
 * Video Comments API - FreeFlow A+++ Implementation
 * Frame.io-style frame-accurate video comments
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createFeatureLogger } from '@/lib/logger';

const logger = createFeatureLogger('video-comments');

// GET - Get video comments with filters
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const videoId = searchParams.get('video_id');
    const parentId = searchParams.get('parent_id');
    const status = searchParams.get('status');
    const timeRangeStart = searchParams.get('time_start');
    const timeRangeEnd = searchParams.get('time_end');
    const userId = searchParams.get('user_id');
    const priority = searchParams.get('priority');
    const includeReplies = searchParams.get('include_replies') === 'true';
    const sort = searchParams.get('sort') || 'timestamp'; // timestamp, created, priority
    const order = searchParams.get('order') || 'asc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!videoId) {
      return NextResponse.json({ error: 'video_id is required' }, { status: 400 });
    }

    // Build query
    let query = supabase
      .from('video_comments')
      .select(`
        *,
        user:users!video_comments_user_id_fkey (
          id,
          name,
          avatar_url
        ),
        assigned_user:users!video_comments_assigned_to_fkey (
          id,
          name,
          avatar_url
        ),
        resolved_user:users!video_comments_resolved_by_fkey (
          id,
          name
        ),
        reactions:video_comment_reactions (
          id,
          emoji,
          user_id
        )
      `)
      .eq('video_id', videoId);

    // Filter by parent (null for root comments)
    if (parentId === 'null') {
      query = query.is('parent_id', null);
    } else if (parentId) {
      query = query.eq('parent_id', parentId);
    }

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (timeRangeStart) {
      query = query.gte('timestamp_ms', parseInt(timeRangeStart));
    }
    if (timeRangeEnd) {
      query = query.lte('timestamp_ms', parseInt(timeRangeEnd));
    }
    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (priority) {
      query = query.eq('priority', parseInt(priority));
    }

    // Sorting
    const sortColumn =
      sort === 'timestamp' ? 'timestamp_ms' : sort === 'priority' ? 'priority' : 'created_at';
    query = query.order(sortColumn, { ascending: order === 'asc' });

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: comments, error, count } = await query;

    if (error) {
      if (error.code === '42P01') {
        return NextResponse.json({ comments: [], total: 0, page, limit });
      }
      throw error;
    }

    // If include replies, fetch all replies for each root comment
    let commentsWithReplies = comments;
    if (includeReplies && comments) {
      const rootCommentIds = comments.filter((c) => !c.parent_id).map((c) => c.id);

      if (rootCommentIds.length > 0) {
        const { data: replies } = await supabase
          .from('video_comments')
          .select(`
            *,
            user:users!video_comments_user_id_fkey (
              id,
              name,
              avatar_url
            ),
            reactions:video_comment_reactions (
              id,
              emoji,
              user_id
            )
          `)
          .in('parent_id', rootCommentIds)
          .order('created_at', { ascending: true });

        // Group replies by parent
        const repliesByParent = new Map<string, typeof replies>();
        for (const reply of replies || []) {
          const existing = repliesByParent.get(reply.parent_id) || [];
          existing.push(reply);
          repliesByParent.set(reply.parent_id, existing);
        }

        // Attach replies to root comments
        commentsWithReplies = comments.map((comment) => ({
          ...comment,
          replies: repliesByParent.get(comment.id) || [],
        }));
      }
    }

    // Aggregate reaction counts
    const processedComments = commentsWithReplies?.map((comment) => {
      const reactionCounts: Record<string, number> = {};
      for (const reaction of comment.reactions || []) {
        reactionCounts[reaction.emoji] = (reactionCounts[reaction.emoji] || 0) + 1;
      }
      return {
        ...comment,
        reactionCounts,
      };
    });

    return NextResponse.json({
      comments: processedComments || [],
      total: count || processedComments?.length || 0,
      page,
      limit,
    });
  } catch (error) {
    logger.error('Video comments GET error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new comment
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
      parent_id,
      timestamp_ms,
      end_timestamp_ms,
      content,
      comment_type = 'point',
      annotation,
      drawing_data,
      audio_url,
      audio_duration_ms,
      mentioned_users = [],
      assigned_to,
      priority = 0,
      category,
      tags = [],
    } = body;

    // Validate required fields
    if (!video_id || timestamp_ms === undefined || !content) {
      return NextResponse.json(
        { error: 'video_id, timestamp_ms, and content are required' },
        { status: 400 }
      );
    }

    // Verify video exists and user has access
    const { data: video, error: videoError } = await supabase
      .from('video_assets')
      .select('id, user_id, allow_comments, is_public')
      .eq('id', video_id)
      .single();

    if (videoError || !video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    if (!video.allow_comments) {
      return NextResponse.json({ error: 'Comments are disabled for this video' }, { status: 403 });
    }

    // Create comment
    const { data: comment, error } = await supabase
      .from('video_comments')
      .insert({
        video_id,
        user_id: user.id,
        parent_id,
        timestamp_ms,
        end_timestamp_ms,
        content,
        comment_type,
        annotation,
        drawing_data,
        audio_url,
        audio_duration_ms,
        mentioned_users,
        assigned_to,
        priority,
        category,
        tags,
      })
      .select(`
        *,
        user:users!video_comments_user_id_fkey (
          id,
          name,
          avatar_url
        )
      `)
      .single();

    if (error) throw error;

    // Send notifications to mentioned users
    if (mentioned_users.length > 0) {
      const notifications = mentioned_users.map((mentionedUserId: string) => ({
        user_id: mentionedUserId,
        type: 'video_mention',
        title: 'You were mentioned in a video comment',
        message: content.substring(0, 100),
        data: {
          video_id,
          comment_id: comment.id,
          timestamp_ms,
        },
      }));

      await supabase.from('notifications').insert(notifications);
    }

    // Notify assigned user
    if (assigned_to && assigned_to !== user.id) {
      await supabase.from('notifications').insert({
        user_id: assigned_to,
        type: 'video_comment_assigned',
        title: 'You were assigned a video comment',
        message: content.substring(0, 100),
        data: {
          video_id,
          comment_id: comment.id,
          timestamp_ms,
        },
      });
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    logger.error('Video comment POST error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update a comment
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
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }

    // Check ownership or video ownership
    const { data: existing, error: fetchError } = await supabase
      .from('video_comments')
      .select(`
        *,
        video:video_assets!video_comments_video_id_fkey (
          user_id
        )
      `)
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Users can update their own comments, video owners can resolve/update any comment
    const isOwner = existing.user_id === user.id;
    const isVideoOwner = existing.video?.user_id === user.id;

    if (!isOwner && !isVideoOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Build update object
    const updateData: Record<string, unknown> = {};

    // Content updates (only by comment owner)
    if (isOwner && updates.content !== undefined) {
      updateData.content = updates.content;
      updateData.edited_at = new Date().toISOString();
    }

    // Annotation updates (only by comment owner)
    if (isOwner && updates.annotation !== undefined) {
      updateData.annotation = updates.annotation;
    }
    if (isOwner && updates.drawing_data !== undefined) {
      updateData.drawing_data = updates.drawing_data;
    }

    // Status updates (by video owner or comment owner)
    if (updates.status !== undefined) {
      updateData.status = updates.status;
      if (updates.status === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
        updateData.resolved_by = user.id;
        updateData.resolution_notes = updates.resolution_notes || null;
      } else if (updates.status === 'active') {
        updateData.resolved_at = null;
        updateData.resolved_by = null;
        updateData.resolution_notes = null;
      }
    }

    // Metadata updates
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.assigned_to !== undefined) updateData.assigned_to = updates.assigned_to;

    const { data: comment, error } = await supabase
      .from('video_comments')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        user:users!video_comments_user_id_fkey (
          id,
          name,
          avatar_url
        )
      `)
      .single();

    if (error) throw error;

    return NextResponse.json(comment);
  } catch (error) {
    logger.error('Video comment PATCH error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a comment
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
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }

    // Check ownership
    const { data: existing, error: fetchError } = await supabase
      .from('video_comments')
      .select(`
        user_id,
        video:video_assets!video_comments_video_id_fkey (
          user_id
        )
      `)
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Only comment owner or video owner can delete
    if (existing.user_id !== user.id && existing.video?.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase.from('video_comments').delete().eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Video comment DELETE error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
