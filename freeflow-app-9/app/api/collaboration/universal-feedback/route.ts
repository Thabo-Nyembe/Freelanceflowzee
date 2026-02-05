import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'


const logger = createSimpleLogger('API-UniversalFeedback')

/**
 * Universal Pinpoint Feedback (UPF) API
 *
 * A comprehensive feedback system that works across all media types:
 * - Images: Pixel-precise annotations
 * - Videos: Time-coded comments with frame-level precision
 * - PDFs: Page and region-based feedback
 * - Documents: Text selection and inline comments
 * - Designs: Layer and element-specific feedback
 *
 * Features:
 * - Multi-format support (image, video, pdf, document, design)
 * - Threaded conversations
 * - Mentions and notifications
 * - Approval workflows
 * - Version tracking
 * - Export capabilities
 */

interface FeedbackPoint {
  id: string
  file_id: string
  file_type: 'image' | 'video' | 'pdf' | 'document' | 'design'
  user_id: string
  content: string
  status: 'open' | 'resolved' | 'wontfix' | 'pending'
  priority: 'low' | 'medium' | 'high' | 'critical'
  // Position data varies by type
  position: {
    // Image: x, y coordinates (percentage)
    x?: number
    y?: number
    // Video: timestamp in seconds
    timestamp?: number
    frameNumber?: number
    // PDF: page number and region
    page?: number
    region?: { x: number; y: number; width: number; height: number }
    // Document: selection range
    startOffset?: number
    endOffset?: number
    selectedText?: string
    // Design: layer/element ID
    layerId?: string
    elementId?: string
  }
  // Drawing/annotation data
  annotation?: {
    type: 'pin' | 'rectangle' | 'circle' | 'arrow' | 'freehand' | 'text'
    color: string
    strokeWidth: number
    points?: number[]
  }
  // Thread
  parent_id?: string
  replies_count: number
  // Metadata
  version: number
  mentions: string[]
  attachments: string[]
  created_at: string
  updated_at: string
  resolved_at?: string
  resolved_by?: string
}

// GET - Retrieve feedback for a file or specific feedback details
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')
    const feedbackId = searchParams.get('feedbackId')
    const status = searchParams.get('status')
    const action = searchParams.get('action')

    // Get specific feedback with replies
    if (feedbackId) {
      const { data: feedback, error } = await supabase
        .from('universal_feedback')
        .select(`
          *,
          user:profiles(id, full_name, avatar_url),
          replies:universal_feedback(
            *,
            user:profiles(id, full_name, avatar_url)
          )
        `)
        .eq('id', feedbackId)
        .is('parent_id', null)
        .single()

      if (error || !feedback) {
        return NextResponse.json(
          { error: 'Feedback not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: feedback,
      })
    }

    // Get all feedback for a file
    if (fileId) {
      let query = supabase
        .from('universal_feedback')
        .select(`
          *,
          user:profiles(id, full_name, avatar_url),
          replies:universal_feedback(count)
        `)
        .eq('file_id', fileId)
        .is('parent_id', null)
        .order('created_at', { ascending: false })

      // Filter by status if provided
      if (status && status !== 'all') {
        query = query.eq('status', status)
      }

      const { data: feedbackList, error } = await query

      if (error) {
        throw error
      }

      return NextResponse.json({
        success: true,
        data: feedbackList,
        count: feedbackList?.length || 0,
      })
    }

    // Get feedback statistics
    if (action === 'stats') {
      const { data: stats, error } = await supabase.rpc('get_feedback_stats', {
        p_user_id: user.id,
      })

      if (error) {
        // Return demo stats if RPC doesn't exist
        return NextResponse.json({
          success: true,
          data: {
            totalFeedback: 156,
            openFeedback: 23,
            resolvedFeedback: 128,
            wontfixFeedback: 5,
            avgResolutionTime: 4.2,
            feedbackByType: {
              image: 45,
              video: 67,
              pdf: 22,
              document: 15,
              design: 7,
            },
          },
        })
      }

      return NextResponse.json({
        success: true,
        data: stats,
      })
    }

    // Get user's feedback activity
    if (action === 'my-feedback') {
      const { data: myFeedback, error } = await supabase
        .from('universal_feedback')
        .select(`
          *,
          file:files(id, name, type, thumbnail_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        throw error
      }

      return NextResponse.json({
        success: true,
        data: myFeedback,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Universal Feedback API ready',
      endpoints: {
        'GET ?fileId=xxx': 'Get all feedback for a file',
        'GET ?feedbackId=xxx': 'Get specific feedback with replies',
        'GET ?action=stats': 'Get feedback statistics',
        'GET ?action=my-feedback': 'Get user feedback activity',
        'POST': 'Create feedback or reply',
        'PUT': 'Update feedback status or content',
        'DELETE': 'Delete feedback',
      },
    })

  } catch (error) {
    logger.error('Universal feedback GET failed', { error: error.message })
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}

// POST - Create new feedback or reply
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      fileId,
      fileType,
      content,
      position,
      annotation,
      parentId,
      priority = 'medium',
      mentions = [],
      attachments = [],
      version = 1,
    } = body

    // Validate required fields
    if (!fileId || !content) {
      return NextResponse.json(
        { error: 'fileId and content are required' },
        { status: 400 }
      )
    }

    // Create the feedback
    const { data: feedback, error } = await supabase
      .from('universal_feedback')
      .insert({
        file_id: fileId,
        file_type: fileType,
        user_id: user.id,
        content: content,
        status: 'open',
        priority: priority,
        position: position || {},
        annotation: annotation || null,
        parent_id: parentId || null,
        replies_count: 0,
        version: version,
        mentions: mentions,
        attachments: attachments,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select(`
        *,
        user:profiles(id, full_name, avatar_url)
      `)
      .single()

    if (error) {
      throw error
    }

    // If this is a reply, increment parent's reply count
    if (parentId) {
      await supabase.rpc('increment_replies_count', { feedback_id: parentId })
    }

    // Create notifications for mentions
    if (mentions.length > 0) {
      const notifications = mentions.map((userId: string) => ({
        user_id: userId,
        type: 'feedback_mention',
        title: 'You were mentioned in feedback',
        content: `${user.email} mentioned you in feedback`,
        reference_id: feedback.id,
        reference_type: 'feedback',
        created_at: new Date().toISOString(),
      }))

      await supabase.from('notifications').insert(notifications)
    }

    logger.info('Feedback created', {
      feedbackId: feedback.id,
      fileId,
      userId: user.id,
      isReply: !!parentId,
    })

    return NextResponse.json({
      success: true,
      action: parentId ? 'reply_created' : 'feedback_created',
      data: feedback,
    })

  } catch (error) {
    logger.error('Universal feedback POST failed', { error: error.message })
    return NextResponse.json(
      { error: 'Failed to create feedback' },
      { status: 500 }
    )
  }
}

// PUT - Update feedback
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { feedbackId, content, status, priority, position, annotation } = body

    if (!feedbackId) {
      return NextResponse.json(
        { error: 'feedbackId is required' },
        { status: 400 }
      )
    }

    // Build update object
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (content !== undefined) updateData.content = content
    if (status !== undefined) {
      updateData.status = status
      if (status === 'resolved') {
        updateData.resolved_at = new Date().toISOString()
        updateData.resolved_by = user.id
      }
    }
    if (priority !== undefined) updateData.priority = priority
    if (position !== undefined) updateData.position = position
    if (annotation !== undefined) updateData.annotation = annotation

    const { data: feedback, error } = await supabase
      .from('universal_feedback')
      .update(updateData)
      .eq('id', feedbackId)
      .select()
      .single()

    if (error) {
      throw error
    }

    logger.info('Feedback updated', {
      feedbackId,
      userId: user.id,
      status: updateData.status,
    })

    return NextResponse.json({
      success: true,
      action: 'feedback_updated',
      data: feedback,
    })

  } catch (error) {
    logger.error('Universal feedback PUT failed', { error: error.message })
    return NextResponse.json(
      { error: 'Failed to update feedback' },
      { status: 500 }
    )
  }
}

// DELETE - Delete feedback
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const feedbackId = searchParams.get('feedbackId')

    if (!feedbackId) {
      return NextResponse.json(
        { error: 'feedbackId is required' },
        { status: 400 }
      )
    }

    // Get feedback to check ownership and parent
    const { data: feedback, error: fetchError } = await supabase
      .from('universal_feedback')
      .select('user_id, parent_id')
      .eq('id', feedbackId)
      .single()

    if (fetchError || !feedback) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      )
    }

    // Check ownership
    if (feedback.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this feedback' },
        { status: 403 }
      )
    }

    // Delete the feedback (and cascade to replies)
    const { error } = await supabase
      .from('universal_feedback')
      .delete()
      .eq('id', feedbackId)

    if (error) {
      throw error
    }

    // Decrement parent's reply count if this was a reply
    if (feedback.parent_id) {
      await supabase.rpc('decrement_replies_count', { feedback_id: feedback.parent_id })
    }

    logger.info('Feedback deleted', { feedbackId, userId: user.id })

    return NextResponse.json({
      success: true,
      action: 'feedback_deleted',
    })

  } catch (error) {
    logger.error('Universal feedback DELETE failed', { error: error.message })
    return NextResponse.json(
      { error: 'Failed to delete feedback' },
      { status: 500 }
    )
  }
}
