import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { nanoid } from 'nanoid'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'


const logger = createSimpleLogger('collaboration-comments')

// Types
interface Comment {
  id: string
  documentId: string
  parentId?: string
  authorId: string
  content: string
  position?: CommentPosition
  resolved: boolean
  resolvedBy?: string
  resolvedAt?: string
  createdAt: string
  updatedAt: string
  reactions?: CommentReaction[]
  replies?: Comment[]
}

interface CommentPosition {
  type: 'point' | 'range' | 'element'
  x?: number
  y?: number
  page?: number
  startOffset?: number
  endOffset?: number
  elementId?: string
  anchor?: string
  highlightedText?: string
}

interface CommentReaction {
  emoji: string
  userId: string
  createdAt: string
}

// GET - Fetch comments
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('documentId')
    const threadId = searchParams.get('threadId')
    const resolved = searchParams.get('resolved')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!documentId && !threadId) {
      return NextResponse.json({ error: 'Document ID or thread ID required' }, { status: 400 })
    }

    // Build query
    let query = supabase
      .from('collaboration_comments')
      .select(`
        *,
        author:users!author_id(id, name, avatar_url, email),
        resolver:users!resolved_by(id, name, avatar_url),
        reactions:comment_reactions(*),
        replies:collaboration_comments!parent_id(
          *,
          author:users!author_id(id, name, avatar_url)
        )
      `)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (documentId) {
      query = query.eq('document_id', documentId).is('parent_id', null)
    }

    if (threadId) {
      query = query.eq('parent_id', threadId)
    }

    if (resolved !== null) {
      query = query.eq('resolved', resolved === 'true')
    }

    const { data: comments, error, count } = await query

    if (error) throw error

    // Get total count
    const { count: totalCount } = await supabase
      .from('collaboration_comments')
      .select('*', { count: 'exact', head: true })
      .eq('document_id', documentId || '')
      .is('parent_id', null)

    return NextResponse.json({
      comments: comments || [],
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit)
      }
    })
  } catch (error) {
    logger.error('Comments fetch error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

// POST - Comment actions
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...params } = body

    switch (action) {
      case 'create': {
        const { documentId, content, position, parentId, mentions } = params

        if (!content?.trim()) {
          return NextResponse.json({ error: 'Content required' }, { status: 400 })
        }

        const commentId = nanoid(12)

        // Create comment
        const { data: comment, error } = await supabase
          .from('collaboration_comments')
          .insert({
            id: commentId,
            document_id: documentId,
            parent_id: parentId,
            author_id: user.id,
            content: content.trim(),
            position,
            resolved: false
          })
          .select(`
            *,
            author:users!author_id(id, name, avatar_url, email)
          `)
          .single()

        if (error) throw error

        // Process mentions
        if (mentions?.length > 0) {
          const mentionRecords = mentions.map((userId: string) => ({
            comment_id: commentId,
            user_id: userId,
            mentioned_by: user.id
          }))

          await supabase.from('comment_mentions').insert(mentionRecords)

          // Create notifications for mentioned users
          const notifications = mentions.map((userId: string) => ({
            user_id: userId,
            type: 'comment_mention',
            title: 'You were mentioned in a comment',
            content: `${user.email} mentioned you in a comment`,
            data: {
              commentId,
              documentId,
              mentionedBy: user.id
            }
          }))

          await supabase.from('notifications').insert(notifications)
        }

        // Update thread reply count if this is a reply
        if (parentId) {
          await supabase.rpc('increment_reply_count', { comment_id: parentId })
        }

        // Broadcast new comment event
        await supabase.from('collaboration_events').insert({
          document_id: documentId,
          event_type: 'comment_added',
          user_id: user.id,
          data: { commentId, parentId }
        })

        return NextResponse.json({ success: true, comment })
      }

      case 'update': {
        const { commentId, content } = params

        // Verify ownership
        const { data: existing } = await supabase
          .from('collaboration_comments')
          .select('author_id, document_id')
          .eq('id', commentId)
          .single()

        if (existing?.author_id !== user.id) {
          return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
        }

        const { data: comment, error } = await supabase
          .from('collaboration_comments')
          .update({
            content: content.trim(),
            edited_at: new Date().toISOString()
          })
          .eq('id', commentId)
          .select(`
            *,
            author:users!author_id(id, name, avatar_url)
          `)
          .single()

        if (error) throw error

        // Broadcast update
        await supabase.from('collaboration_events').insert({
          document_id: existing.document_id,
          event_type: 'comment_updated',
          user_id: user.id,
          data: { commentId }
        })

        return NextResponse.json({ success: true, comment })
      }

      case 'delete': {
        const { commentId } = params

        // Verify ownership or document owner
        const { data: comment } = await supabase
          .from('collaboration_comments')
          .select('author_id, document_id')
          .eq('id', commentId)
          .single()

        if (!comment) {
          return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
        }

        // Check if user is author or document owner
        const { data: doc } = await supabase
          .from('collaboration_documents')
          .select('owner_id')
          .eq('id', comment.document_id)
          .single()

        if (comment.author_id !== user.id && doc?.owner_id !== user.id) {
          return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
        }

        // Soft delete (keep for audit)
        await supabase
          .from('collaboration_comments')
          .update({
            deleted_at: new Date().toISOString(),
            deleted_by: user.id
          })
          .eq('id', commentId)

        // Also soft delete replies
        await supabase
          .from('collaboration_comments')
          .update({
            deleted_at: new Date().toISOString(),
            deleted_by: user.id
          })
          .eq('parent_id', commentId)

        // Broadcast deletion
        await supabase.from('collaboration_events').insert({
          document_id: comment.document_id,
          event_type: 'comment_deleted',
          user_id: user.id,
          data: { commentId }
        })

        return NextResponse.json({ success: true })
      }

      case 'resolve': {
        const { commentId } = params

        const { data: comment, error } = await supabase
          .from('collaboration_comments')
          .update({
            resolved: true,
            resolved_by: user.id,
            resolved_at: new Date().toISOString()
          })
          .eq('id', commentId)
          .select('document_id')
          .single()

        if (error) throw error

        // Broadcast resolution
        await supabase.from('collaboration_events').insert({
          document_id: comment.document_id,
          event_type: 'comment_resolved',
          user_id: user.id,
          data: { commentId }
        })

        return NextResponse.json({ success: true })
      }

      case 'unresolve': {
        const { commentId } = params

        const { data: comment, error } = await supabase
          .from('collaboration_comments')
          .update({
            resolved: false,
            resolved_by: null,
            resolved_at: null
          })
          .eq('id', commentId)
          .select('document_id')
          .single()

        if (error) throw error

        // Broadcast unresolve
        await supabase.from('collaboration_events').insert({
          document_id: comment.document_id,
          event_type: 'comment_unresolved',
          user_id: user.id,
          data: { commentId }
        })

        return NextResponse.json({ success: true })
      }

      case 'add-reaction': {
        const { commentId, emoji } = params

        // Check if already reacted with same emoji
        const { data: existing } = await supabase
          .from('comment_reactions')
          .select('id')
          .eq('comment_id', commentId)
          .eq('user_id', user.id)
          .eq('emoji', emoji)
          .single()

        if (existing) {
          return NextResponse.json({ error: 'Already reacted' }, { status: 400 })
        }

        const { error } = await supabase.from('comment_reactions').insert({
          comment_id: commentId,
          user_id: user.id,
          emoji
        })

        if (error) throw error

        // Get updated reactions
        const { data: reactions } = await supabase
          .from('comment_reactions')
          .select('*')
          .eq('comment_id', commentId)

        return NextResponse.json({ success: true, reactions })
      }

      case 'remove-reaction': {
        const { commentId, emoji } = params

        await supabase
          .from('comment_reactions')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id)
          .eq('emoji', emoji)

        // Get updated reactions
        const { data: reactions } = await supabase
          .from('comment_reactions')
          .select('*')
          .eq('comment_id', commentId)

        return NextResponse.json({ success: true, reactions })
      }

      case 'pin': {
        const { commentId, documentId } = params

        // Verify document owner
        const { data: doc } = await supabase
          .from('collaboration_documents')
          .select('owner_id')
          .eq('id', documentId)
          .single()

        if (doc?.owner_id !== user.id) {
          return NextResponse.json({ error: 'Only document owner can pin' }, { status: 403 })
        }

        await supabase
          .from('collaboration_comments')
          .update({
            is_pinned: true,
            pinned_at: new Date().toISOString(),
            pinned_by: user.id
          })
          .eq('id', commentId)

        return NextResponse.json({ success: true })
      }

      case 'unpin': {
        const { commentId, documentId } = params

        const { data: doc } = await supabase
          .from('collaboration_documents')
          .select('owner_id')
          .eq('id', documentId)
          .single()

        if (doc?.owner_id !== user.id) {
          return NextResponse.json({ error: 'Only document owner can unpin' }, { status: 403 })
        }

        await supabase
          .from('collaboration_comments')
          .update({
            is_pinned: false,
            pinned_at: null,
            pinned_by: null
          })
          .eq('id', commentId)

        return NextResponse.json({ success: true })
      }

      case 'update-position': {
        const { commentId, position } = params

        // Verify ownership
        const { data: existing } = await supabase
          .from('collaboration_comments')
          .select('author_id')
          .eq('id', commentId)
          .single()

        if (existing?.author_id !== user.id) {
          return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
        }

        await supabase
          .from('collaboration_comments')
          .update({ position })
          .eq('id', commentId)

        return NextResponse.json({ success: true })
      }

      case 'get-thread': {
        const { threadId } = params

        // Get thread (parent comment and all replies)
        const { data: parent } = await supabase
          .from('collaboration_comments')
          .select(`
            *,
            author:users!author_id(id, name, avatar_url),
            reactions:comment_reactions(*)
          `)
          .eq('id', threadId)
          .single()

        const { data: replies } = await supabase
          .from('collaboration_comments')
          .select(`
            *,
            author:users!author_id(id, name, avatar_url),
            reactions:comment_reactions(*)
          `)
          .eq('parent_id', threadId)
          .is('deleted_at', null)
          .order('created_at', { ascending: true })

        return NextResponse.json({
          thread: {
            ...parent,
            replies: replies || []
          }
        })
      }

      case 'export-comments': {
        const { documentId, format } = params

        const { data: comments } = await supabase
          .from('collaboration_comments')
          .select(`
            *,
            author:users!author_id(id, name, email),
            replies:collaboration_comments!parent_id(
              *,
              author:users!author_id(id, name, email)
            )
          `)
          .eq('document_id', documentId)
          .is('parent_id', null)
          .is('deleted_at', null)
          .order('created_at', { ascending: true })

        if (format === 'json') {
          return NextResponse.json({ comments })
        }

        // CSV format
        const csvLines = ['ID,Author,Content,Position,Created At,Resolved']
        const flattenComment = (c: any, indent = '') => {
          csvLines.push([
            c.id,
            c.author?.name || 'Unknown',
            `"${indent}${c.content.replace(/"/g, '""')}"`,
            c.position ? JSON.stringify(c.position) : '',
            c.created_at,
            c.resolved ? 'Yes' : 'No'
          ].join(','))

          c.replies?.forEach((r: any) => flattenComment(r, '  └ '))
        }

        comments?.forEach(c => flattenComment(c))

        return new NextResponse(csvLines.join('\n'), {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="comments-${documentId}.csv"`
          }
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Comment action error', { error })
    return NextResponse.json(
      { error: 'Failed to perform comment action' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { commentId, ...updates } = body

    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('collaboration_comments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', commentId)
      .eq('author_id', user.id)
      .select()
      .single()

    if (error) throw error

    logger.info('Comment updated', { commentId, userId: user.id })

    return NextResponse.json({ success: true, data })

  } catch (error) {
    logger.error('Comment PATCH error', { error })
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get('commentId')

    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('collaboration_comments')
      .delete()
      .eq('id', commentId)
      .eq('author_id', user.id)

    if (error) throw error

    logger.info('Comment deleted', { commentId, userId: user.id })

    return NextResponse.json({ success: true, message: 'Comment deleted successfully' })

  } catch (error) {
    logger.error('Comment DELETE error', { error })
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 })
  }
}
