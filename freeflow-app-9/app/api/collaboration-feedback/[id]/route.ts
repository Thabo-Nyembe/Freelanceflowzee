/**
 * Collaboration Feedback API - Single Resource Routes
 *
 * GET - Get single feedback item
 * PUT - Update feedback, toggle starred, mark reply as solution
 * DELETE - Delete feedback, reply
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('collaboration-feedback')
import {
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
  toggleStarred,
  markReplyAsSolution,
  deleteFeedbackReply
} from '@/lib/collaboration-feedback-queries'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await getFeedbackById(id, user.id)
    return NextResponse.json({ data: result.data })
  } catch (error) {
    logger.error('Failed to fetch feedback', { error })
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, action, ...updates } = body

    switch (type) {
      case 'feedback': {
        if (action === 'toggle-starred') {
          const result = await toggleStarred(id, user.id, updates.is_starred)
          return NextResponse.json({ data: result.data })
        }
        const result = await updateFeedback(id, user.id, updates)
        return NextResponse.json({ data: result.data })
      }

      case 'reply': {
        if (action === 'mark-solution') {
          const result = await markReplyAsSolution(id, user.id)
          return NextResponse.json({ data: result.data })
        }
        return NextResponse.json({ error: 'Invalid action for reply' }, { status: 400 })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to update feedback', { error })
    return NextResponse.json(
      { error: 'Failed to update feedback' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'feedback'

    switch (type) {
      case 'feedback': {
        const result = await deleteFeedback(id, user.id)
        return NextResponse.json({ success: result.success })
      }

      case 'reply': {
        const result = await deleteFeedbackReply(id, user.id)
        return NextResponse.json({ success: result.success })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to delete', { error })
    return NextResponse.json(
      { error: 'Failed to delete' },
      { status: 500 }
    )
  }
}
