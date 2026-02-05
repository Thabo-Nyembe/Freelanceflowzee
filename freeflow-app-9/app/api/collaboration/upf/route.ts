import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('upf')

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

/**
 * Universal Project Feedback (UPF) API
 *
 * Provides a unified feedback system across all project types:
 * - Design feedback (images, mockups)
 * - Video feedback (timecode-based)
 * - Document feedback (text selections)
 * - Code feedback (line-based)
 * - General project feedback
 */

const FeedbackSchema = z.object({
  projectId: z.string().uuid(),
  type: z.enum(['design', 'video', 'document', 'code', 'general']),
  content: z.string().min(1).max(5000),
  position: z.object({
    x: z.number().optional(),
    y: z.number().optional(),
    timecode: z.number().optional(),
    startLine: z.number().optional(),
    endLine: z.number().optional(),
    textStart: z.number().optional(),
    textEnd: z.number().optional(),
    page: z.number().optional(),
  }).optional(),
  fileId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  tags: z.array(z.string()).optional(),
  assignees: z.array(z.string().uuid()).optional(),
  status: z.enum(['open', 'in_progress', 'resolved', 'wont_fix']).optional(),
})

const UpdateFeedbackSchema = z.object({
  feedbackId: z.string().uuid(),
  content: z.string().min(1).max(5000).optional(),
  status: z.enum(['open', 'in_progress', 'resolved', 'wont_fix']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  tags: z.array(z.string()).optional(),
  assignees: z.array(z.string().uuid()).optional(),
  resolution: z.string().optional(),
})

const ReactionSchema = z.object({
  feedbackId: z.string().uuid(),
  emoji: z.string().max(10),
})

// Demo feedback data
const demoFeedback = [
  {
    id: 'fb-001',
    project_id: 'proj-001',
    user_id: 'user-001',
    type: 'design',
    content: 'The color contrast here might be too low for accessibility. Consider using a darker shade.',
    position: { x: 245, y: 180 },
    file_id: 'file-001',
    priority: 'medium',
    status: 'open',
    tags: ['accessibility', 'color'],
    assignees: ['user-002'],
    created_at: '2026-01-28T10:30:00Z',
    updated_at: '2026-01-28T10:30:00Z',
    user: { name: 'Alex Johnson', avatar: '/avatars/alex.jpg' },
    replies_count: 2,
    reactions: { '👍': 3, '💡': 1 },
  },
  {
    id: 'fb-002',
    project_id: 'proj-001',
    user_id: 'user-002',
    type: 'video',
    content: 'The transition at this point feels a bit abrupt. Could we add a 0.5s fade?',
    position: { timecode: 45.5 },
    file_id: 'file-002',
    priority: 'low',
    status: 'resolved',
    tags: ['transition', 'timing'],
    resolution: 'Added crossfade transition',
    created_at: '2026-01-27T14:20:00Z',
    updated_at: '2026-01-28T09:15:00Z',
    user: { name: 'Sarah Chen', avatar: '/avatars/sarah.jpg' },
    replies_count: 4,
    reactions: { '✅': 2 },
  },
  {
    id: 'fb-003',
    project_id: 'proj-002',
    user_id: 'user-003',
    type: 'code',
    content: 'This function could benefit from error handling for edge cases.',
    position: { startLine: 42, endLine: 58 },
    file_id: 'file-003',
    priority: 'high',
    status: 'in_progress',
    tags: ['error-handling', 'code-quality'],
    assignees: ['user-001'],
    created_at: '2026-01-26T16:45:00Z',
    updated_at: '2026-01-28T11:00:00Z',
    user: { name: 'Mike Williams', avatar: '/avatars/mike.jpg' },
    replies_count: 1,
    reactions: { '🔥': 2, '👀': 1 },
  },
  {
    id: 'fb-004',
    project_id: 'proj-002',
    user_id: 'user-001',
    type: 'document',
    content: 'The terminology here should be consistent with our style guide.',
    position: { page: 3, textStart: 156, textEnd: 234 },
    file_id: 'file-004',
    priority: 'medium',
    status: 'open',
    tags: ['documentation', 'style'],
    created_at: '2026-01-29T08:00:00Z',
    updated_at: '2026-01-29T08:00:00Z',
    user: { name: 'Alex Johnson', avatar: '/avatars/alex.jpg' },
    replies_count: 0,
    reactions: {},
  },
]

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const fileId = searchParams.get('fileId')
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const assignee = searchParams.get('assignee')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Demo mode
    if (!user) {
      let filtered = [...demoFeedback]

      if (projectId) {
        filtered = filtered.filter(f => f.project_id === projectId)
      }
      if (fileId) {
        filtered = filtered.filter(f => f.file_id === fileId)
      }
      if (type) {
        filtered = filtered.filter(f => f.type === type)
      }
      if (status) {
        filtered = filtered.filter(f => f.status === status)
      }
      if (priority) {
        filtered = filtered.filter(f => f.priority === priority)
      }

      return NextResponse.json({
        success: true,
        demo: true,
        data: filtered.slice(offset, offset + limit),
        pagination: {
          total: filtered.length,
          limit,
          offset,
          hasMore: offset + limit < filtered.length,
        },
      })
    }

    // Build query
    let query = supabase
      .from('project_feedback')
      .select(`
        *,
        user:profiles!user_id(id, full_name, avatar_url),
        replies:project_feedback_replies(count),
        reactions:project_feedback_reactions(emoji)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (projectId) {
      query = query.eq('project_id', projectId)
    }
    if (fileId) {
      query = query.eq('file_id', fileId)
    }
    if (type) {
      query = query.eq('type', type)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (priority) {
      query = query.eq('priority', priority)
    }
    if (assignee) {
      query = query.contains('assignees', [assignee])
    }

    const { data: feedback, error, count } = await query

    if (error) throw error

    // Aggregate reactions
    const formattedFeedback = feedback?.map(f => {
      const reactionCounts: Record<string, number> = {}
      f.reactions?.forEach((r: { emoji: string }) => {
        reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1
      })
      return {
        ...f,
        replies_count: f.replies?.[0]?.count || 0,
        reactions: reactionCounts,
      }
    })

    return NextResponse.json({
      success: true,
      data: formattedFeedback,
      pagination: {
        total: count || formattedFeedback?.length || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    })
  } catch (error) {
    logger.error('UPF GET error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()
    const { action = 'create', ...data } = body

    // Demo mode
    if (!user) {
      switch (action) {
        case 'create':
          return NextResponse.json({
            success: true,
            demo: true,
            message: 'Feedback created (demo mode)',
            data: {
              id: `fb-demo-${Date.now()}`,
              ...data,
              user_id: 'demo-user',
              status: 'open',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          })
        case 'update':
          return NextResponse.json({
            success: true,
            demo: true,
            message: 'Feedback updated (demo mode)',
            data: { ...data, updated_at: new Date().toISOString() },
          })
        case 'react':
          return NextResponse.json({
            success: true,
            demo: true,
            message: 'Reaction added (demo mode)',
          })
        case 'reply':
          return NextResponse.json({
            success: true,
            demo: true,
            message: 'Reply added (demo mode)',
            data: {
              id: `reply-demo-${Date.now()}`,
              content: data.content,
              created_at: new Date().toISOString(),
            },
          })
        default:
          return NextResponse.json({
            success: false,
            demo: true,
            error: 'Unknown action',
          }, { status: 400 })
      }
    }

    switch (action) {
      case 'create': {
        const validated = FeedbackSchema.parse(data)

        // Verify project access
        const { data: project } = await supabase
          .from('projects')
          .select('id, owner_id')
          .eq('id', validated.projectId)
          .single()

        if (!project) {
          return NextResponse.json(
            { success: false, error: 'Project not found' },
            { status: 404 }
          )
        }

        const { data: feedback, error } = await supabase
          .from('project_feedback')
          .insert({
            project_id: validated.projectId,
            user_id: user.id,
            type: validated.type,
            content: validated.content,
            position: validated.position,
            file_id: validated.fileId,
            parent_id: validated.parentId,
            priority: validated.priority || 'medium',
            tags: validated.tags || [],
            assignees: validated.assignees || [],
            status: 'open',
          })
          .select()
          .single()

        if (error) throw error

        // Create notifications for assignees
        if (validated.assignees?.length) {
          await supabase.from('notifications').insert(
            validated.assignees.map(assigneeId => ({
              user_id: assigneeId,
              type: 'feedback_assigned',
              title: 'New feedback assigned',
              message: `You've been assigned feedback on a project`,
              data: { feedbackId: feedback.id, projectId: validated.projectId },
            }))
          )
        }

        return NextResponse.json({
          success: true,
          message: 'Feedback created successfully',
          data: feedback,
        })
      }

      case 'update': {
        const validated = UpdateFeedbackSchema.parse(data)

        const { data: existing } = await supabase
          .from('project_feedback')
          .select('user_id, project_id')
          .eq('id', validated.feedbackId)
          .single()

        if (!existing) {
          return NextResponse.json(
            { success: false, error: 'Feedback not found' },
            { status: 404 }
          )
        }

        const updateData: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        }

        if (validated.content) updateData.content = validated.content
        if (validated.status) updateData.status = validated.status
        if (validated.priority) updateData.priority = validated.priority
        if (validated.tags) updateData.tags = validated.tags
        if (validated.assignees) updateData.assignees = validated.assignees
        if (validated.resolution) updateData.resolution = validated.resolution

        const { data: feedback, error } = await supabase
          .from('project_feedback')
          .update(updateData)
          .eq('id', validated.feedbackId)
          .select()
          .single()

        if (error) throw error

        return NextResponse.json({
          success: true,
          message: 'Feedback updated successfully',
          data: feedback,
        })
      }

      case 'react': {
        const validated = ReactionSchema.parse(data)

        // Check if reaction exists
        const { data: existing } = await supabase
          .from('project_feedback_reactions')
          .select('id')
          .eq('feedback_id', validated.feedbackId)
          .eq('user_id', user.id)
          .eq('emoji', validated.emoji)
          .single()

        if (existing) {
          // Remove reaction
          await supabase
            .from('project_feedback_reactions')
            .delete()
            .eq('id', existing.id)

          return NextResponse.json({
            success: true,
            message: 'Reaction removed',
          })
        } else {
          // Add reaction
          await supabase
            .from('project_feedback_reactions')
            .insert({
              feedback_id: validated.feedbackId,
              user_id: user.id,
              emoji: validated.emoji,
            })

          return NextResponse.json({
            success: true,
            message: 'Reaction added',
          })
        }
      }

      case 'reply': {
        const { feedbackId, content } = data

        if (!feedbackId || !content) {
          return NextResponse.json(
            { success: false, error: 'Missing feedbackId or content' },
            { status: 400 }
          )
        }

        const { data: reply, error } = await supabase
          .from('project_feedback_replies')
          .insert({
            feedback_id: feedbackId,
            user_id: user.id,
            content,
          })
          .select(`
            *,
            user:profiles!user_id(id, full_name, avatar_url)
          `)
          .single()

        if (error) throw error

        // Notify original feedback author
        const { data: feedback } = await supabase
          .from('project_feedback')
          .select('user_id')
          .eq('id', feedbackId)
          .single()

        if (feedback && feedback.user_id !== user.id) {
          await supabase.from('notifications').insert({
            user_id: feedback.user_id,
            type: 'feedback_reply',
            title: 'New reply on your feedback',
            message: content.substring(0, 100),
            data: { feedbackId, replyId: reply.id },
          })
        }

        return NextResponse.json({
          success: true,
          message: 'Reply added successfully',
          data: reply,
        })
      }

      case 'delete': {
        const { feedbackId } = data

        const { data: feedback } = await supabase
          .from('project_feedback')
          .select('user_id')
          .eq('id', feedbackId)
          .single()

        if (!feedback) {
          return NextResponse.json(
            { success: false, error: 'Feedback not found' },
            { status: 404 }
          )
        }

        if (feedback.user_id !== user.id) {
          return NextResponse.json(
            { success: false, error: 'Unauthorized' },
            { status: 403 }
          )
        }

        await supabase
          .from('project_feedback')
          .delete()
          .eq('id', feedbackId)

        return NextResponse.json({
          success: true,
          message: 'Feedback deleted successfully',
        })
      }

      case 'bulk_update': {
        const { feedbackIds, status, assignees, priority } = data

        if (!feedbackIds?.length) {
          return NextResponse.json(
            { success: false, error: 'No feedback IDs provided' },
            { status: 400 }
          )
        }

        const updateData: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        }
        if (status) updateData.status = status
        if (assignees) updateData.assignees = assignees
        if (priority) updateData.priority = priority

        const { error } = await supabase
          .from('project_feedback')
          .update(updateData)
          .in('id', feedbackIds)

        if (error) throw error

        return NextResponse.json({
          success: true,
          message: `${feedbackIds.length} feedback items updated`,
        })
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    logger.error('UPF POST error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to process feedback' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  // PATCH - Update feedback
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { feedbackId, ...updates } = body

    if (!feedbackId) {
      return NextResponse.json({ error: 'Feedback ID required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('project_feedback')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', feedbackId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })

  } catch (error) {
    logger.error('UPF PATCH error', { error })
    return NextResponse.json({ error: 'Failed to update feedback' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  // DELETE - Remove feedback
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const feedbackId = searchParams.get('feedbackId')

    if (!feedbackId) {
      return NextResponse.json({ error: 'Feedback ID required' }, { status: 400 })
    }

    // Verify ownership
    const { data: feedback } = await supabase
      .from('project_feedback')
      .select('user_id')
      .eq('id', feedbackId)
      .single()

    if (!feedback || feedback.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { error } = await supabase
      .from('project_feedback')
      .delete()
      .eq('id', feedbackId)

    if (error) throw error

    return NextResponse.json({ success: true, message: 'Feedback deleted successfully' })

  } catch (error) {
    logger.error('UPF DELETE error', { error })
    return NextResponse.json({ error: 'Failed to delete feedback' }, { status: 500 })
  }
}
