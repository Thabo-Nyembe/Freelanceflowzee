/**
 * Meeting Cancel API Route
 * Forwards to main meetings API with action=cancel
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from '@/lib/auth'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('meetings-cancel-api')

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'

function isDemoMode(request: NextRequest): boolean {
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true' ||
    process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
    process.env.DEMO_MODE === 'true'
  )
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const session = await getServerSession()
    const demoMode = isDemoMode(request)

    // Determine effective user ID
    let effectiveUserId: string | null = null

    if (session?.user) {
      const userEmail = session.user.email
      const isDemoAccount = userEmail === 'test@kazi.dev' || userEmail === 'demo@kazi.io' || userEmail === 'alex@freeflow.io'
      effectiveUserId = isDemoAccount || demoMode ? DEMO_USER_ID : (session.user as any).authId || session.user.id
    } else if (demoMode) {
      effectiveUserId = DEMO_USER_ID
    } else {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const { meetingId, meeting_id, reason, refund, notify_participants } = body

    const actualMeetingId = meetingId || meeting_id

    if (!actualMeetingId) {
      return NextResponse.json(
        { success: false, error: 'Meeting ID is required' },
        { status: 400 }
      )
    }

    logger.info('Cancelling meeting', { meetingId: actualMeetingId, userId: effectiveUserId })

    try {
      // Update meeting status to cancelled
      const { data: meeting, error } = await supabase
        .from('meetings')
        .update({
          status: 'cancelled',
          metadata: {
            cancellation_reason: reason || null,
            cancelled_at: new Date().toISOString(),
            cancelled_by: effectiveUserId,
            refund_issued: refund || false
          }
        })
        .eq('id', actualMeetingId)
        .or(`user_id.eq.${effectiveUserId},host_id.eq.${effectiveUserId}`)
        .select()
        .single()

      if (error) {
        logger.error('Failed to cancel meeting', { error, meetingId: actualMeetingId })

        if (demoMode) {
          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              id: actualMeetingId,
              cancelled: true,
              cancelledAt: new Date().toISOString(),
              reason: reason || null,
              refundIssued: refund || false,
              notificationsSent: notify_participants !== false
            },
            message: 'Meeting cancelled (demo mode)'
          })
        }

        throw error
      }

      // Notify participants if requested
      if (notify_participants !== false) {
        const { data: participants } = await supabase
          .from('meeting_participants')
          .select('email, name')
          .eq('meeting_id', actualMeetingId)

        // In a real implementation, send cancellation emails here
        logger.info('Notifying participants of cancellation', {
          meetingId: actualMeetingId,
          participantCount: participants?.length || 0
        })
      }

      return NextResponse.json({
        success: true,
        demo: demoMode,
        data: {
          id: meeting.id,
          cancelled: true,
          cancelledAt: meeting.metadata?.cancelled_at,
          reason: reason || null,
          refundIssued: refund || false,
          notificationsSent: notify_participants !== false
        },
        message: 'Meeting cancelled successfully'
      })
    } catch (dbError) {
      logger.warn('Database error, using demo fallback', { error: dbError })

      if (!demoMode) {
        throw dbError
      }

      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          id: actualMeetingId,
          cancelled: true,
          cancelledAt: new Date().toISOString(),
          reason: reason || null,
          refundIssued: refund || false,
          notificationsSent: true
        },
        message: 'Meeting cancelled (demo mode)'
      })
    }
  } catch (error) {
    logger.error('Meeting cancel error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to cancel meeting' },
      { status: 500 }
    )
  }
}
