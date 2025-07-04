import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface CommentRequest {
  content: string;
  timestamp_seconds?: number;
  parent_comment_id?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get comments with user info and replies
    const { data: comments, error } = await supabase
      .from('video_comments')
      .select(`
        *,
        user:user_id (
          id,
          display_name,
          avatar_url
        ),
        replies:video_comments!parent_comment_id (
          *,
          user:user_id (
            id,
            display_name,
            avatar_url
          )
        )
      `)
      .eq('video_id', id)
      .is('parent_comment_id', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      );
    }

    return NextResponse.json({ comments: comments || [] });
  } catch (error) {
    console.error('Error in comments GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: CommentRequest = await request.json();

    if (!body.content?.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Verify video exists and user has access
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('id, user_id, is_public')
      .eq('id', id)
      .single();

    if (videoError || !video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    // Check if user can comment (video owner or public video)
    if (!video.is_public && video.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to comment on this video' },
        { status: 403 }
      );
    }

    // Create comment
    const { data: comment, error: commentError } = await supabase
      .from('video_comments')
      .insert({
        video_id: id,
        user_id: user.id,
        content: body.content.trim(),
        timestamp_seconds: body.timestamp_seconds,
        parent_comment_id: body.parent_comment_id
      })
      .select(`
        *,
        user:user_id (
          id,
          display_name,
          avatar_url
        )
      `)
      .single();

    if (commentError) {
      console.error('Error creating comment:', commentError);
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      );
    }

    // Update comment count on video
    await supabase
      .from('videos')
      .update({ 
        comment_count: supabase.sql`comment_count + 1`,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('Error in comments POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
