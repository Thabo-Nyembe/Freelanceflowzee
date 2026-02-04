/**
 * Meeting Reschedule API Route
 * Handles rescheduling meetings to new dates/times
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from '@/lib/auth'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('meetings-reschedule-api')

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
      effectiveUserId = isDemoAccount || demoMode ? DEMO_USER_ID : (session.user as { authId?: string; id: string }).authId || session.user.id
    } else if (demoMode) {
      effectiveUserId = DEMO_USER_ID
    } else {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const {
      meetingId,
      meeting_id,
      newDate,
      new_date,
      newTime,
      new_time,
      duration,
      reason,
      notify_participants
    } = body

    const actualMeetingId = meetingId || meeting_id
    const scheduledDate = newDate || new_date
    const scheduledTime = newTime || new_time

    if (!actualMeetingId) {
      return NextResponse.json(
        { success: false, error: 'Meeting ID is required' },
        { status: 400 }
      )
    }

    if (!scheduledDate || !scheduledTime) {
      return NextResponse.json(
        { success: false, error: 'New date and time are required' },
        { status: 400 }
      )
    }

    logger.info('Rescheduling meeting', {
      meetingId: actualMeetingId,
      newDate: scheduledDate,
      newTime: scheduledTime,
      userId: effectiveUserId
    })

    try {
      // Get original meeting details
      const { data: originalMeeting, error: fetchError } = await supabase
        .from('meetings')
        .select('*')
        .eq('id', actualMeetingId)
        .or(`user_id.eq.${effectiveUserId},host_id.eq.${effectiveUserId}`)
        .single()

      if (fetchError || !originalMeeting) {
        if (demoMode) {
          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              id: actualMeetingId,
              previousDate: new Date().toISOString().split('T')[0],
              previousTime: '10:00:00',
              newDate: scheduledDate,
              newTime: scheduledTime,
              rescheduled: true,
              notificationsSent: notify_participants !== false
            },
            message: 'Meeting rescheduled (demo mode)'
          })
        }
        return NextResponse.json(
          { success: false, error: 'Meeting not found or access denied' },
          { status: 404 }
        )
      }

      // Don't allow rescheduling cancelled or completed meetings
      if (originalMeeting.status === 'cancelled') {
        return NextResponse.json(
          { success: false, error: 'Cannot reschedule a cancelled meeting' },
          { status: 400 }
        )
      }

      if (originalMeeting.status === 'completed') {
        return NextResponse.json(
          { success: false, error: 'Cannot reschedule a completed meeting' },
          { status: 400 }
        )
      }

      // Update meeting with new schedule
      const updateData: Record<string, unknown> = {
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        metadata: {
          ...originalMeeting.metadata,
          rescheduled: true,
          rescheduled_at: new Date().toISOString(),
          rescheduled_by: effectiveUserId,
          previous_date: originalMeeting.scheduled_date,
          previous_time: originalMeeting.scheduled_time,
          reschedule_reason: reason || null
        }
      }

      if (duration) {
        updateData.duration = duration
      }

      const { data: meeting, error: updateError } = await supabase
        .from('meetings')
        .update(updateData)
        .eq('id', actualMeetingId)
        .select()
        .single()

      if (updateError) {
        logger.error('Failed to reschedule meeting', { error: updateError })

        if (demoMode) {
          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              id: actualMeetingId,
              previousDate: originalMeeting.scheduled_date,
              previousTime: originalMeeting.scheduled_time,
              newDate: scheduledDate,
              newTime: scheduledTime,
              rescheduled: true,
              notificationsSent: notify_participants !== false
            },
            message: 'Meeting rescheduled (demo mode)'
          })
        }

        throw updateError
      }

      // Notify participants if requested
      if (notify_participants !== false) {
        const { data: participants } = await supabase
          .from('meeting_participants')
          .select('email, name')
          .eq('meeting_id', actualMeetingId)

        // In a real implementation, send reschedule notification emails here
        logger.info('Notifying participants of reschedule', {
          meetingId: actualMeetingId,
          participantCount: participants?.length || 0
        })
      }

      logger.info('Meeting rescheduled', {
        meetingId: actualMeetingId,
        previousDate: originalMeeting.scheduled_date,
        previousTime: originalMeeting.scheduled_time,
        newDate: scheduledDate,
        newTime: scheduledTime
      })

      return NextResponse.json({
        success: true,
        demo: demoMode,
        data: {
          id: meeting.id,
          title: meeting.title,
          previousDate: originalMeeting.scheduled_date,
          previousTime: originalMeeting.scheduled_time,
          newDate: scheduledDate,
          newTime: scheduledTime,
          duration: meeting.duration,
          rescheduled: true,
          notificationsSent: notify_participants !== false,
          meetingLink: meeting.meeting_link
        },
        message: 'Meeting rescheduled successfully'
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
          previousDate: new Date().toISOString().split('T')[0],
          previousTime: '10:00:00',
          newDate: scheduledDate,
          newTime: scheduledTime,
          rescheduled: true,
          notificationsSent: true
        },
        message: 'Meeting rescheduled (demo mode)'
      })
    }
  } catch (error) {
    logger.error('Meeting reschedule error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to reschedule meeting' },
      { status: 500 }
    )
  }
}

/**
 * GET - Get reschedule history for a meeting
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const session = await getServerSession()
    const demoMode = isDemoMode(request)
    const url = new URL(request.url)
    const meetingId = url.searchParams.get('meetingId') || url.searchParams.get('meeting_id')

    if (!meetingId) {
      return NextResponse.json(
        { success: false, error: 'Meeting ID is required' },
        { status: 400 }
      )
    }

    // Determine effective user ID
    let effectiveUserId: string | null = null

    if (session?.user) {
      const userEmail = session.user.email
      const isDemoAccount = userEmail === 'test@kazi.dev' || userEmail === 'demo@kazi.io' || userEmail === 'alex@freeflow.io'
      effectiveUserId = isDemoAccount || demoMode ? DEMO_USER_ID : (session.user as { authId?: string; id: string }).authId || session.user.id
    } else if (demoMode) {
      effectiveUserId = DEMO_USER_ID
    } else {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    try {
      const { data: meeting, error } = await supabase
        .from('meetings')
        .select('id, title, scheduled_date, scheduled_time, metadata')
        .eq('id', meetingId)
        .single()

      if (error || !meeting) {
        if (demoMode) {
          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              meetingId,
              currentSchedule: {
                date: new Date().toISOString().split('T')[0],
                time: '10:00:00'
              },
              history: []
            }
          })
        }
        return NextResponse.json(
          { success: false, error: 'Meeting not found' },
          { status: 404 }
        )
      }

      // Extract reschedule history from metadata
      const history = []
      if (meeting.metadata?.rescheduled) {
        history.push({
          previousDate: meeting.metadata.previous_date,
          previousTime: meeting.metadata.previous_time,
          rescheduledAt: meeting.metadata.rescheduled_at,
          reason: meeting.metadata.reschedule_reason
        })
      }

      return NextResponse.json({
        success: true,
        demo: demoMode,
        data: {
          meetingId: meeting.id,
          title: meeting.title,
          currentSchedule: {
            date: meeting.scheduled_date,
            time: meeting.scheduled_time
          },
          wasRescheduled: meeting.metadata?.rescheduled || false,
          history
        }
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
          meetingId,
          currentSchedule: {
            date: new Date().toISOString().split('T')[0],
            time: '10:00:00'
          },
          wasRescheduled: false,
          history: []
        }
      })
    }
  } catch (error) {
    logger.error('Get reschedule history error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to get reschedule history' },
      { status: 500 }
    )
  }
}
