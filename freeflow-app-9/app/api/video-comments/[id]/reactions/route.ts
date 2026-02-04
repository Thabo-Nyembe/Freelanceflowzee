/**
 * Video Comment Reactions API - FreeFlow A+++ Implementation
 * Emoji reactions for video comments
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createSimpleLogger } from '@/lib/simple-logger';

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

const logger = createSimpleLogger('video-comment-reactions');

// GET - Get reactions for a comment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: commentId } = await params;
    const supabase = await createClient();

    const { data: reactions, error } = await supabase
      .from('video_comment_reactions')
      .select(`
        *,
        user:users!video_comment_reactions_user_id_fkey (
          id,
          name,
          avatar_url
        )
      `)
      .eq('comment_id', commentId);

    if (error) {
      if (error.code === '42P01') {
        return NextResponse.json({ reactions: [], counts: {} });
      }
      throw error;
    }

    // Aggregate by emoji
    const counts: Record<string, number> = {};
    const usersByEmoji: Record<string, typeof reactions> = {};

    for (const reaction of reactions || []) {
      counts[reaction.emoji] = (counts[reaction.emoji] || 0) + 1;
      if (!usersByEmoji[reaction.emoji]) {
        usersByEmoji[reaction.emoji] = [];
      }
      usersByEmoji[reaction.emoji].push(reaction);
    }

    return NextResponse.json({
      reactions: reactions || [],
      counts,
      usersByEmoji,
    });
  } catch (error) {
    logger.error('Video comment reactions GET error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Add a reaction
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: commentId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { emoji } = await request.json();

    if (!emoji) {
      return NextResponse.json({ error: 'Emoji is required' }, { status: 400 });
    }

    // Check if reaction already exists (toggle behavior)
    const { data: existing } = await supabase
      .from('video_comment_reactions')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', user.id)
      .eq('emoji', emoji)
      .single();

    if (existing) {
      // Remove existing reaction
      await supabase
        .from('video_comment_reactions')
        .delete()
        .eq('id', existing.id);

      return NextResponse.json({ removed: true, emoji });
    }

    // Add new reaction
    const { data: reaction, error } = await supabase
      .from('video_comment_reactions')
      .insert({
        comment_id: commentId,
        user_id: user.id,
        emoji,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        // Already exists (race condition)
        return NextResponse.json({ error: 'Reaction already exists' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ added: true, reaction }, { status: 201 });
  } catch (error) {
    logger.error('Video comment reaction POST error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove a reaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: commentId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const emoji = searchParams.get('emoji');

    if (!emoji) {
      return NextResponse.json({ error: 'Emoji is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('video_comment_reactions')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', user.id)
      .eq('emoji', emoji);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Video comment reaction DELETE error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
