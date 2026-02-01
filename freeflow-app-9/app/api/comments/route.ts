/**
 * KAZI Platform - World-Class Comments & Feedback API
 *
 * Comprehensive commenting system supporting:
 * - Project comments with threading
 * - Task comments with mentions
 * - File annotations with pinpoint feedback
 * - Real-time updates via Supabase
 * - Rich text with markdown support
 * - Reactions and emoji support
 * - Comment resolution workflow
 * - Activity notifications
 *
 * @module app/api/comments/route
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from '@/lib/auth'
import { checkPermission } from '@/lib/rbac/rbac-service'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('comments-api')

// ============================================================================
// TYPES
// ============================================================================

type CommentEntityType = 'project' | 'task' | 'file' | 'document' | 'deliverable' | 'invoice' | 'milestone'
type CommentStatus = 'active' | 'resolved' | 'archived' | 'deleted'
type CommentVisibility = 'public' | 'team' | 'private' | 'client'
type ReactionType = 'like' | 'love' | 'celebrate' | 'insightful' | 'curious' | 'support' | 'custom'

interface Comment {
  id: string
  entity_type: CommentEntityType
  entity_id: string
  user_id: string
  parent_id: string | null
  content: string
  content_html: string | null
  status: CommentStatus
  visibility: CommentVisibility
  is_pinned: boolean
  is_internal: boolean
  resolved_at: string | null
  resolved_by: string | null
  resolution_note: string | null
  position: AnnotationPosition | null
  mentions: string[]
  attachments: CommentAttachment[]
  metadata: Record<string, unknown>
  reaction_counts: Record<string, number>
  reply_count: number
  created_at: string
  updated_at: string
  edited_at: string | null
}

interface AnnotationPosition {
  type: 'point' | 'area' | 'text_range' | 'timecode'
  x?: number
  y?: number
  width?: number
  height?: number
  page?: number
  start_offset?: number
  end_offset?: number
  start_time?: number
  end_time?: number
  selector?: string
}

interface CommentAttachment {
  id: string
  name: string
  url: string
  type: string
  size: number
}

interface Mention {
  id: string
  comment_id: string
  user_id: string
  mentioned_at: number
  notified: boolean
}

interface Reaction {
  id: string
  comment_id: string
  user_id: string
  reaction_type: ReactionType
  emoji?: string
  created_at: string
}

interface CommentThread {
  root: Comment
  replies: Comment[]
  total_replies: number
  participants: string[]
}

// ============================================================================
// GET - List Comments / Get Single Comment / Get Thread
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const session = await getServerSession()
    const { searchParams } = new URL(request.url)

    // Get query parameters
    const commentId = searchParams.get('id')
    const entityType = searchParams.get('entity_type') as CommentEntityType
    const entityId = searchParams.get('entity_id')
    const parentId = searchParams.get('parent_id')
    const status = searchParams.get('status') || 'active'
    const visibility = searchParams.get('visibility')
    const includeReplies = searchParams.get('include_replies') === 'true'
    const includeReactions = searchParams.get('include_reactions') === 'true'
    const resolvedOnly = searchParams.get('resolved') === 'true'
    const unresolvedOnly = searchParams.get('unresolved') === 'true'
    const pinnedOnly = searchParams.get('pinned') === 'true'
    const sortBy = searchParams.get('sort_by') || 'created_at'
    const sortOrder = searchParams.get('sort_order') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Demo mode for unauthenticated users
    if (!session?.user) {
      return NextResponse.json({
        success: true,
        demo: true,
        comments: getDemoComments(entityType, entityId),
        stats: getDemoStats(),
        pagination: { page: 1, limit: 50, total: 5, totalPages: 1 }
      })
    }

    const userId = (session.user as { authId?: string; id: string }).authId || session.user.id

    // Single comment fetch with thread
    if (commentId) {
      const { data: comment, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:users!comments_user_id_fkey(id, name, email, avatar_url),
          resolved_by_user:users!comments_resolved_by_fkey(id, name, avatar_url)
        `)
        .eq('id', commentId)
        .single()

      if (error || !comment) {
        return NextResponse.json(
          { error: 'Comment not found' },
          { status: 404 }
        )
      }

      let replies: Comment[] = []
      let reactions: Reaction[] = []

      if (includeReplies) {
        const { data: replyData } = await supabase
          .from('comments')
          .select(`
            *,
            user:users!comments_user_id_fkey(id, name, avatar_url)
          `)
          .eq('parent_id', commentId)
          .eq('status', 'active')
          .order('created_at', { ascending: true })

        replies = replyData || []
      }

      if (includeReactions) {
        const { data: reactionData } = await supabase
          .from('comment_reactions')
          .select(`
            *,
            user:users(id, name, avatar_url)
          `)
          .eq('comment_id', commentId)

        reactions = reactionData || []
      }

      return NextResponse.json({
        success: true,
        comment: {
          ...comment,
          replies,
          reactions
        }
      })
    }

    // Entity comments list (must have entity_type and entity_id)
    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: 'entity_type and entity_id are required' },
        { status: 400 }
      )
    }

    // Build query
    let query = supabase
      .from('comments')
      .select(`
        *,
        user:users!comments_user_id_fkey(id, name, email, avatar_url)
      `, { count: 'exact' })
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .eq('status', status)

    // Root comments only (not replies) unless parent_id specified
    if (parentId) {
      query = query.eq('parent_id', parentId)
    } else if (!searchParams.get('include_all')) {
      query = query.is('parent_id', null)
    }

    // Apply filters
    if (visibility) {
      query = query.eq('visibility', visibility)
    }

    if (resolvedOnly) {
      query = query.not('resolved_at', 'is', null)
    }

    if (unresolvedOnly) {
      query = query.is('resolved_at', null)
    }

    if (pinnedOnly) {
      query = query.eq('is_pinned', true)
    }

    // Apply sorting - pinned first, then by sortBy
    query = query
      .order('is_pinned', { ascending: false })
      .order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data: comments, error, count } = await query

    if (error) {
      logger.error('Comments query error', { error })
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      )
    }

    // Get reply counts for root comments
    const commentsWithReplyCounts = await Promise.all(
      (comments || []).map(async (comment) => {
        const { count: replyCount } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('parent_id', comment.id)
          .eq('status', 'active')

        return {
          ...comment,
          reply_count: replyCount || 0
        }
      })
    )

    // Get stats
    const stats = await getCommentStats(supabase, entityType, entityId)

    return NextResponse.json({
      success: true,
      comments: commentsWithReplyCounts,
      stats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    logger.error('Comments GET error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST - Create Comment / Handle Actions
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const supabase = await createClient()
    const userId = (session.user as { authId?: string; id: string }).authId || session.user.id
    const body = await request.json()
    const { action = 'create' } = body

    // Handle different actions
    switch (action) {
      case 'create':
        return handleCreateComment(supabase, userId, body)

      case 'reply':
        return handleReplyToComment(supabase, userId, body)

      case 'react':
        return handleReaction(supabase, userId, body)

      case 'resolve':
        return handleResolveComment(supabase, userId, body)

      case 'reopen':
        return handleReopenComment(supabase, userId, body)

      case 'pin':
        return handlePinComment(supabase, userId, body)

      case 'mention':
        return handleMentions(supabase, userId, body)

      case 'annotate':
        return handleAnnotation(supabase, userId, body)

      case 'bulk_resolve':
        return handleBulkResolve(supabase, userId, body)

      case 'export':
        return handleExportComments(supabase, userId, body)

      default:
        return handleCreateComment(supabase, userId, body)
    }
  } catch (error) {
    logger.error('Comments POST error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// PUT - Update Comment
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const supabase = await createClient()
    const userId = (session.user as { authId?: string; id: string }).authId || session.user.id
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      )
    }

    // Verify ownership or permission
    const { data: existingComment } = await supabase
      .from('comments')
      .select('user_id, entity_type, entity_id')
      .eq('id', id)
      .single()

    if (!existingComment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // Only owner can edit, unless admin
    const isOwner = existingComment.user_id === userId
    const canModerate = await checkPermission(userId, 'comments', 'moderate')

    if (!isOwner && !canModerate) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    // Prepare update data
    const allowedFields = ['content', 'content_html', 'visibility', 'is_internal', 'metadata']
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      edited_at: new Date().toISOString()
    }

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field]
      }
    }

    // Extract mentions from content
    if (updates.content) {
      const mentions = extractMentions(updates.content)
      updateData.mentions = mentions
    }

    const { data: comment, error } = await supabase
      .from('comments')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        user:users!comments_user_id_fkey(id, name, avatar_url)
      `)
      .single()

    if (error) {
      logger.error('Comment update error', { error })
      return NextResponse.json(
        { error: 'Failed to update comment' },
        { status: 500 }
      )
    }

    // Log activity
    await logCommentActivity(supabase, id, userId, 'edited', {
      entity_type: existingComment.entity_type,
      entity_id: existingComment.entity_id
    })

    return NextResponse.json({
      success: true,
      comment,
      message: 'Comment updated successfully'
    })
  } catch (error) {
    logger.error('Comments PUT error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE - Delete Comment
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const supabase = await createClient()
    const userId = (session.user as { authId?: string; id: string }).authId || session.user.id
    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get('id')
    const permanent = searchParams.get('permanent') === 'true'

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      )
    }

    // Verify ownership or permission
    const { data: existingComment } = await supabase
      .from('comments')
      .select('user_id, entity_type, entity_id')
      .eq('id', commentId)
      .single()

    if (!existingComment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    const isOwner = existingComment.user_id === userId
    const canDelete = await checkPermission(userId, 'comments', 'delete')

    if (!isOwner && !canDelete) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    if (permanent) {
      // Delete replies first
      await supabase
        .from('comments')
        .delete()
        .eq('parent_id', commentId)

      // Delete reactions
      await supabase
        .from('comment_reactions')
        .delete()
        .eq('comment_id', commentId)

      // Delete comment
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

      if (error) {
        throw error
      }
    } else {
      // Soft delete
      const { error } = await supabase
        .from('comments')
        .update({
          status: 'deleted',
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)

      if (error) {
        throw error
      }
    }

    // Log activity
    await logCommentActivity(supabase, commentId, userId, 'deleted', {
      permanent,
      entity_type: existingComment.entity_type,
      entity_id: existingComment.entity_id
    })

    return NextResponse.json({
      success: true,
      message: permanent ? 'Comment deleted permanently' : 'Comment deleted'
    })
  } catch (error) {
    logger.error('Comments DELETE error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// ACTION HANDLERS
// ============================================================================

async function handleCreateComment(
  supabase: any,
  userId: string,
  body: Record<string, unknown>
) {
  const {
    entity_type,
    entity_id,
    content,
    content_html,
    visibility = 'team',
    is_internal = false,
    position,
    attachments = [],
    metadata = {}
  } = body

  // Validation
  if (!entity_type || !entity_id) {
    return NextResponse.json(
      { error: 'entity_type and entity_id are required' },
      { status: 400 }
    )
  }

  if (!content || (typeof content === 'string' && content.trim().length === 0)) {
    return NextResponse.json(
      { error: 'Comment content is required' },
      { status: 400 }
    )
  }

  // Extract mentions from content
  const mentions = extractMentions(content as string)

  // Create comment
  const commentData = {
    entity_type,
    entity_id,
    user_id: userId,
    parent_id: null,
    content: typeof content === 'string' ? content.trim() : content,
    content_html: content_html || null,
    status: 'active',
    visibility,
    is_pinned: false,
    is_internal,
    resolved_at: null,
    resolved_by: null,
    position: position || null,
    mentions,
    attachments: attachments || [],
    metadata: metadata || {},
    reaction_counts: {},
    reply_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    edited_at: null
  }

  const { data: comment, error } = await supabase
    .from('comments')
    .insert(commentData)
    .select(`
      *,
      user:users!comments_user_id_fkey(id, name, email, avatar_url)
    `)
    .single()

  if (error) {
    logger.error('Comment creation error', { error })
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }

  // Process mentions and create notifications
  if (mentions.length > 0) {
    await processMentions(supabase, comment.id, userId, mentions, entity_type as string, entity_id as string)
  }

  // Log activity
  await logCommentActivity(supabase, comment.id, userId, 'created', {
    entity_type,
    entity_id,
    has_position: !!position
  })

  return NextResponse.json({
    success: true,
    comment,
    message: 'Comment created successfully'
  }, { status: 201 })
}

async function handleReplyToComment(
  supabase: any,
  userId: string,
  body: Record<string, unknown>
) {
  const { parent_id, content, content_html, attachments = [] } = body

  if (!parent_id) {
    return NextResponse.json(
      { error: 'parent_id is required for replies' },
      { status: 400 }
    )
  }

  if (!content || (typeof content === 'string' && content.trim().length === 0)) {
    return NextResponse.json(
      { error: 'Reply content is required' },
      { status: 400 }
    )
  }

  // Get parent comment
  const { data: parentComment } = await supabase
    .from('comments')
    .select('entity_type, entity_id, visibility, is_internal, user_id')
    .eq('id', parent_id)
    .single()

  if (!parentComment) {
    return NextResponse.json(
      { error: 'Parent comment not found' },
      { status: 404 }
    )
  }

  const mentions = extractMentions(content as string)

  const replyData = {
    entity_type: parentComment.entity_type,
    entity_id: parentComment.entity_id,
    user_id: userId,
    parent_id,
    content: typeof content === 'string' ? content.trim() : content,
    content_html: content_html || null,
    status: 'active',
    visibility: parentComment.visibility,
    is_pinned: false,
    is_internal: parentComment.is_internal,
    resolved_at: null,
    resolved_by: null,
    position: null,
    mentions,
    attachments: attachments || [],
    metadata: {},
    reaction_counts: {},
    reply_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    edited_at: null
  }

  const { data: reply, error } = await supabase
    .from('comments')
    .insert(replyData)
    .select(`
      *,
      user:users!comments_user_id_fkey(id, name, avatar_url)
    `)
    .single()

  if (error) {
    logger.error('Reply creation error', { error })
    return NextResponse.json(
      { error: 'Failed to create reply' },
      { status: 500 }
    )
  }

  // Update parent reply count
  await supabase.rpc('increment_reply_count', { comment_id: parent_id }).catch(() => {
    // Fallback: manually update
    supabase
      .from('comments')
      .update({ reply_count: parentComment.reply_count + 1 })
      .eq('id', parent_id)
  })

  // Notify parent comment author
  if (parentComment.user_id !== userId) {
    await createNotification(supabase, parentComment.user_id, {
      type: 'comment_reply',
      title: 'New reply to your comment',
      message: `Someone replied to your comment`,
      entity_type: parentComment.entity_type,
      entity_id: parentComment.entity_id,
      comment_id: reply.id,
      actor_id: userId
    })
  }

  // Process mentions
  if (mentions.length > 0) {
    await processMentions(supabase, reply.id, userId, mentions, parentComment.entity_type, parentComment.entity_id)
  }

  return NextResponse.json({
    success: true,
    reply,
    message: 'Reply added successfully'
  }, { status: 201 })
}

async function handleReaction(
  supabase: any,
  userId: string,
  body: Record<string, unknown>
) {
  const { comment_id, reaction_type, emoji, remove = false } = body

  if (!comment_id || !reaction_type) {
    return NextResponse.json(
      { error: 'comment_id and reaction_type are required' },
      { status: 400 }
    )
  }

  if (remove) {
    // Remove reaction
    const { error } = await supabase
      .from('comment_reactions')
      .delete()
      .eq('comment_id', comment_id)
      .eq('user_id', userId)
      .eq('reaction_type', reaction_type)

    if (error) {
      throw error
    }

    // Update reaction counts
    await updateReactionCounts(supabase, comment_id as string)

    return NextResponse.json({
      success: true,
      action: 'removed',
      message: 'Reaction removed'
    })
  }

  // Check if already reacted with this type
  const { data: existing } = await supabase
    .from('comment_reactions')
    .select('id')
    .eq('comment_id', comment_id)
    .eq('user_id', userId)
    .eq('reaction_type', reaction_type)
    .single()

  if (existing) {
    return NextResponse.json({
      success: true,
      action: 'exists',
      message: 'Reaction already exists'
    })
  }

  // Add reaction
  const { data: reaction, error } = await supabase
    .from('comment_reactions')
    .insert({
      comment_id,
      user_id: userId,
      reaction_type,
      emoji: emoji || null,
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    logger.error('Reaction error', { error })
    return NextResponse.json(
      { error: 'Failed to add reaction' },
      { status: 500 }
    )
  }

  // Update reaction counts
  await updateReactionCounts(supabase, comment_id as string)

  return NextResponse.json({
    success: true,
    action: 'added',
    reaction,
    message: 'Reaction added'
  })
}

async function handleResolveComment(
  supabase: any,
  userId: string,
  body: Record<string, unknown>
) {
  const { comment_id, resolution_note } = body

  if (!comment_id) {
    return NextResponse.json(
      { error: 'comment_id is required' },
      { status: 400 }
    )
  }

  const { data: comment, error } = await supabase
    .from('comments')
    .update({
      resolved_at: new Date().toISOString(),
      resolved_by: userId,
      resolution_note: resolution_note || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', comment_id)
    .select(`
      *,
      user:users!comments_user_id_fkey(id, name, avatar_url),
      resolved_by_user:users!comments_resolved_by_fkey(id, name, avatar_url)
    `)
    .single()

  if (error) {
    logger.error('Resolve error', { error })
    return NextResponse.json(
      { error: 'Failed to resolve comment' },
      { status: 500 }
    )
  }

  // Log activity
  await logCommentActivity(supabase, comment_id as string, userId, 'resolved', {
    resolution_note
  })

  return NextResponse.json({
    success: true,
    comment,
    message: 'Comment resolved'
  })
}

async function handleReopenComment(
  supabase: any,
  userId: string,
  body: Record<string, unknown>
) {
  const { comment_id } = body

  if (!comment_id) {
    return NextResponse.json(
      { error: 'comment_id is required' },
      { status: 400 }
    )
  }

  const { data: comment, error } = await supabase
    .from('comments')
    .update({
      resolved_at: null,
      resolved_by: null,
      resolution_note: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', comment_id)
    .select(`
      *,
      user:users!comments_user_id_fkey(id, name, avatar_url)
    `)
    .single()

  if (error) {
    logger.error('Reopen error', { error })
    return NextResponse.json(
      { error: 'Failed to reopen comment' },
      { status: 500 }
    )
  }

  await logCommentActivity(supabase, comment_id as string, userId, 'reopened', {})

  return NextResponse.json({
    success: true,
    comment,
    message: 'Comment reopened'
  })
}

async function handlePinComment(
  supabase: any,
  userId: string,
  body: Record<string, unknown>
) {
  const { comment_id, pinned = true } = body

  if (!comment_id) {
    return NextResponse.json(
      { error: 'comment_id is required' },
      { status: 400 }
    )
  }

  const { data: comment, error } = await supabase
    .from('comments')
    .update({
      is_pinned: pinned,
      updated_at: new Date().toISOString()
    })
    .eq('id', comment_id)
    .select()
    .single()

  if (error) {
    logger.error('Pin error', { error })
    return NextResponse.json(
      { error: 'Failed to pin comment' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    comment,
    message: pinned ? 'Comment pinned' : 'Comment unpinned'
  })
}

async function handleMentions(
  supabase: any,
  userId: string,
  body: Record<string, unknown>
) {
  const { comment_id, mentions } = body

  if (!comment_id || !mentions) {
    return NextResponse.json(
      { error: 'comment_id and mentions are required' },
      { status: 400 }
    )
  }

  // Get comment
  const { data: comment } = await supabase
    .from('comments')
    .select('entity_type, entity_id')
    .eq('id', comment_id)
    .single()

  if (!comment) {
    return NextResponse.json(
      { error: 'Comment not found' },
      { status: 404 }
    )
  }

  await processMentions(
    supabase,
    comment_id as string,
    userId,
    mentions as string[],
    comment.entity_type,
    comment.entity_id
  )

  return NextResponse.json({
    success: true,
    message: `${(mentions as string[]).length} mentions processed`
  })
}

async function handleAnnotation(
  supabase: any,
  userId: string,
  body: Record<string, unknown>
) {
  const { entity_type, entity_id, content, position, attachments = [] } = body

  if (!entity_type || !entity_id || !position) {
    return NextResponse.json(
      { error: 'entity_type, entity_id, and position are required for annotations' },
      { status: 400 }
    )
  }

  const mentions = content ? extractMentions(content as string) : []

  const annotationData = {
    entity_type,
    entity_id,
    user_id: userId,
    parent_id: null,
    content: content || '',
    content_html: null,
    status: 'active',
    visibility: 'team',
    is_pinned: false,
    is_internal: false,
    resolved_at: null,
    resolved_by: null,
    position,
    mentions,
    attachments,
    metadata: { is_annotation: true },
    reaction_counts: {},
    reply_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    edited_at: null
  }

  const { data: annotation, error } = await supabase
    .from('comments')
    .insert(annotationData)
    .select(`
      *,
      user:users!comments_user_id_fkey(id, name, avatar_url)
    `)
    .single()

  if (error) {
    logger.error('Annotation error', { error })
    return NextResponse.json(
      { error: 'Failed to create annotation' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    annotation,
    message: 'Annotation created'
  }, { status: 201 })
}

async function handleBulkResolve(
  supabase: any,
  userId: string,
  body: Record<string, unknown>
) {
  const { comment_ids, resolution_note } = body

  if (!Array.isArray(comment_ids) || comment_ids.length === 0) {
    return NextResponse.json(
      { error: 'comment_ids array is required' },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from('comments')
    .update({
      resolved_at: new Date().toISOString(),
      resolved_by: userId,
      resolution_note: resolution_note || 'Bulk resolved',
      updated_at: new Date().toISOString()
    })
    .in('id', comment_ids)

  if (error) {
    logger.error('Bulk resolve error', { error })
    return NextResponse.json(
      { error: 'Failed to resolve comments' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    resolved_count: comment_ids.length,
    message: `${comment_ids.length} comments resolved`
  })
}

async function handleExportComments(
  supabase: any,
  userId: string,
  body: Record<string, unknown>
) {
  const { entity_type, entity_id, format = 'json', include_resolved = true } = body

  if (!entity_type || !entity_id) {
    return NextResponse.json(
      { error: 'entity_type and entity_id are required' },
      { status: 400 }
    )
  }

  let query = supabase
    .from('comments')
    .select(`
      *,
      user:users!comments_user_id_fkey(id, name, email),
      resolved_by_user:users!comments_resolved_by_fkey(id, name)
    `)
    .eq('entity_type', entity_type)
    .eq('entity_id', entity_id)
    .eq('status', 'active')
    .order('created_at', { ascending: true })

  if (!include_resolved) {
    query = query.is('resolved_at', null)
  }

  const { data: comments, error } = await query

  if (error) {
    throw error
  }

  // Format based on request
  if (format === 'csv') {
    const csvRows = ['ID,Author,Content,Created At,Resolved,Resolved By']
    comments?.forEach(c => {
      csvRows.push(`"${c.id}","${c.user?.name}","${c.content.replace(/"/g, '""')}","${c.created_at}","${c.resolved_at ? 'Yes' : 'No'}","${c.resolved_by_user?.name || ''}"`)
    })

    return NextResponse.json({
      success: true,
      format: 'csv',
      data: csvRows.join('\n'),
      filename: `comments-${entity_type}-${entity_id}.csv`
    })
  }

  return NextResponse.json({
    success: true,
    format: 'json',
    data: comments,
    count: comments?.length || 0
  })
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function extractMentions(content: string): string[] {
  const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g
  const mentions: string[] = []
  let match

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[2]) // User ID
  }

  return mentions
}

async function processMentions(
  supabase: any,
  commentId: string,
  actorId: string,
  userIds: string[],
  entityType: string,
  entityId: string
) {
  for (const userId of userIds) {
    if (userId === actorId) continue // Don't notify self

    await createNotification(supabase, userId, {
      type: 'mention',
      title: 'You were mentioned',
      message: 'Someone mentioned you in a comment',
      entity_type: entityType,
      entity_id: entityId,
      comment_id: commentId,
      actor_id: actorId
    })
  }
}

async function createNotification(
  supabase: any,
  userId: string,
  data: Record<string, unknown>
) {
  try {
    await supabase.from('notifications').insert({
      user_id: userId,
      type: data.type,
      title: data.title,
      message: data.message,
      data: {
        entity_type: data.entity_type,
        entity_id: data.entity_id,
        comment_id: data.comment_id,
        actor_id: data.actor_id
      },
      read: false,
      created_at: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Notification error', { error })
  }
}

async function updateReactionCounts(
  supabase: any,
  commentId: string
) {
  const { data: reactions } = await supabase
    .from('comment_reactions')
    .select('reaction_type')
    .eq('comment_id', commentId)

  const counts: Record<string, number> = {}
  reactions?.forEach(r => {
    counts[r.reaction_type] = (counts[r.reaction_type] || 0) + 1
  })

  await supabase
    .from('comments')
    .update({ reaction_counts: counts })
    .eq('id', commentId)
}

async function getCommentStats(
  supabase: any,
  entityType: string,
  entityId: string
) {
  const { count: total } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .eq('status', 'active')

  const { count: resolved } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .eq('status', 'active')
    .not('resolved_at', 'is', null)

  const { count: unresolved } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .eq('status', 'active')
    .is('resolved_at', null)
    .is('parent_id', null)

  const { count: pinned } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .eq('is_pinned', true)

  return {
    total: total || 0,
    resolved: resolved || 0,
    unresolved: unresolved || 0,
    pinned: pinned || 0,
    resolution_rate: total ? Math.round((resolved || 0) / total * 100) : 0
  }
}

async function logCommentActivity(
  supabase: any,
  commentId: string,
  userId: string,
  action: string,
  details: Record<string, unknown>
) {
  try {
    await supabase.from('activity_log').insert({
      entity_type: 'comment',
      entity_id: commentId,
      user_id: userId,
      action,
      details,
      created_at: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Activity log error', { error })
  }
}

// ============================================================================
// DEMO DATA
// ============================================================================

function getDemoComments(entityType?: string | null, entityId?: string | null): Partial<Comment>[] {
  return [
    {
      id: 'demo-comment-1',
      entity_type: entityType || 'project',
      entity_id: entityId || 'demo-project',
      content: 'Great progress on the design! The color palette works really well.',
      status: 'active',
      visibility: 'team',
      is_pinned: true,
      resolved_at: null,
      mentions: [],
      reaction_counts: { like: 3, celebrate: 1 },
      reply_count: 2,
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'demo-comment-2',
      entity_type: entityType || 'project',
      entity_id: entityId || 'demo-project',
      content: 'Can we adjust the spacing on the hero section? It feels a bit cramped.',
      status: 'active',
      visibility: 'team',
      is_pinned: false,
      resolved_at: new Date(Date.now() - 43200000).toISOString(),
      resolution_note: 'Fixed in latest revision',
      mentions: [],
      reaction_counts: { like: 1 },
      reply_count: 1,
      created_at: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 'demo-comment-3',
      entity_type: entityType || 'project',
      entity_id: entityId || 'demo-project',
      content: '@alice Please review the final mockups when you get a chance.',
      status: 'active',
      visibility: 'team',
      is_pinned: false,
      resolved_at: null,
      mentions: ['user-alice'],
      reaction_counts: {},
      reply_count: 0,
      created_at: new Date(Date.now() - 3600000).toISOString()
    }
  ]
}

function getDemoStats() {
  return {
    total: 5,
    resolved: 2,
    unresolved: 3,
    pinned: 1,
    resolution_rate: 40
  }
}
