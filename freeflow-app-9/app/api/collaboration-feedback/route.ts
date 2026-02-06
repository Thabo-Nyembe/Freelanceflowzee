/**
 * Collaboration Feedback API Routes
 *
 * REST endpoints for Collaboration Feedback:
 * GET - Feedback items, replies, votes, stats
 * POST - Create feedback, replies, votes
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('collaboration-feedback')

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
  getFeedback,
  createFeedback,
  getFeedbackReplies,
  addFeedbackReply,
  voteFeedback,
  getUserVote,
  getFeedbackStats,
  getFeedbackReplyCount
} from '@/lib/collaboration-feedback-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'feedback'
    const feedbackId = searchParams.get('feedback_id')
    const category = searchParams.get('category') as string | null
    const priority = searchParams.get('priority') as string | null
    const status = searchParams.get('status') as string | null
    const isStarred = searchParams.get('is_starred')
    const assignedTo = searchParams.get('assigned_to')
    const search = searchParams.get('search')

    switch (type) {
      case 'feedback': {
        const filters: any = {}
        if (category) filters.category = category
        if (priority) filters.priority = priority
        if (status) filters.status = status
        if (isStarred !== null) filters.is_starred = isStarred === 'true'
        if (assignedTo) filters.assigned_to = assignedTo
        if (search) filters.search = search
        const result = await getFeedback(user.id, filters)
        return NextResponse.json({ data: result.data })
      }

      case 'replies': {
        if (!feedbackId) {
          return NextResponse.json({ error: 'feedback_id required' }, { status: 400 })
        }
        const result = await getFeedbackReplies(feedbackId)
        return NextResponse.json({ data: result.data })
      }

      case 'reply-count': {
        if (!feedbackId) {
          return NextResponse.json({ error: 'feedback_id required' }, { status: 400 })
        }
        const result = await getFeedbackReplyCount(feedbackId)
        return NextResponse.json({ data: { count: result.count } })
      }

      case 'user-vote': {
        if (!feedbackId) {
          return NextResponse.json({ error: 'feedback_id required' }, { status: 400 })
        }
        const result = await getUserVote(feedbackId, user.id)
        return NextResponse.json({ data: result.data })
      }

      case 'stats': {
        const result = await getFeedbackStats(user.id)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to fetch Collaboration Feedback data', { error })
    return NextResponse.json(
      { error: 'Failed to fetch Collaboration Feedback data' },
      { status: 500 }
    )
  }

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...payload } = body

    switch (action) {
      case 'create-feedback': {
        const result = await createFeedback(user.id, payload)
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'add-reply': {
        const result = await addFeedbackReply(
          payload.feedback_id,
          user.id,
          payload.reply_text,
          payload.is_solution
        )
        return NextResponse.json({ data: result.data }, { status: 201 })
      }

      case 'vote': {
        const result = await voteFeedback(payload.feedback_id, user.id, payload.vote_type)
        return NextResponse.json({ data: result.data })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Failed to process Collaboration Feedback request', { error })
    return NextResponse.json(
      { error: 'Failed to process Collaboration Feedback request' },
      { status: 500 }
    )
  }
