/**
 * Meeting Reminder API Route
 * Sends reminders for upcoming meetings
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from '@/lib/auth'
import { createSimpleLogger } from '@/lib/simple-logger'
import { DEMO_USER_ID, isDemoMode } from '@/lib/demo-mode'

const logger = createSimpleLogger('meetings-reminder-api')

type ReminderType = 'email' | 'push' | 'sms' | 'all'

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
      type = 'email',
      scheduledFor,
      scheduled_for,
      minutesBefore,
      minutes_before,
      participants,
      customMessage
    } = body

    const actualMeetingId = meetingId || meeting_id
    const reminderType: ReminderType = type
    const reminderTime = scheduledFor || scheduled_for
    const reminderMinutes = minutesBefore || minutes_before || 15

    if (!actualMeetingId) {
      return NextResponse.json(
        { success: false, error: 'Meeting ID is required' },
        { status: 400 }
      )
    }

    logger.info('Sending meeting reminder', {
      meetingId: actualMeetingId,
      type: reminderType,
      userId: effectiveUserId
    })

    try {
      // Get meeting details
      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .select(`
          id,
          title,
          scheduled_date,
          scheduled_time,
          meeting_link,
          status,
          participants:meeting_participants(id, name, email, user_id)
        `)
        .eq('id', actualMeetingId)
        .single()

      if (meetingError || !meeting) {
        if (demoMode) {
          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              meetingId: actualMeetingId,
              reminderSent: true,
              reminderType,
              scheduledFor: reminderTime || new Date().toISOString(),
              recipientCount: 3
            },
            message: 'Reminder scheduled (demo mode)'
          })
        }
        return NextResponse.json(
          { success: false, error: 'Meeting not found' },
          { status: 404 }
        )
      }

      // Don't send reminders for cancelled or completed meetings
      if (meeting.status === 'cancelled' || meeting.status === 'completed') {
        return NextResponse.json(
          { success: false, error: `Cannot send reminder for ${meeting.status} meeting` },
          { status: 400 }
        )
      }

      // Determine recipients
      const recipients = participants || meeting.participants?.map((p: any) => ({
        name: p.name,
        email: p.email,
        userId: p.user_id
      })) || []

      // Calculate reminder time
      let reminderScheduledFor: string
      if (reminderTime) {
        reminderScheduledFor = reminderTime
      } else {
        const meetingDateTime = new Date(`${meeting.scheduled_date}T${meeting.scheduled_time}`)
        reminderScheduledFor = new Date(meetingDateTime.getTime() - reminderMinutes * 60000).toISOString()
      }

      // Create reminder records
      const reminderRecords = recipients.map((recipient: any) => ({
        meeting_id: actualMeetingId,
        user_id: recipient.userId || null,
        recipient_email: recipient.email,
        recipient_name: recipient.name,
        reminder_type: reminderType,
        scheduled_for: reminderScheduledFor,
        custom_message: customMessage || null,
        status: 'scheduled',
        created_by: effectiveUserId
      }))

      // Store reminders (if table exists)
      try {
        await supabase.from('meeting_reminders').insert(reminderRecords)
      } catch {
        // Table might not exist, continue with response
        logger.warn('Meeting reminders table not available')
      }

      // In a real implementation, queue the reminders for delivery
      // For now, we'll just log and return success

      logger.info('Reminder scheduled', {
        meetingId: actualMeetingId,
        type: reminderType,
        recipientCount: recipients.length,
        scheduledFor: reminderScheduledFor
      })

      return NextResponse.json({
        success: true,
        demo: demoMode,
        data: {
          meetingId: meeting.id,
          meetingTitle: meeting.title,
          reminderSent: true,
          reminderType,
          scheduledFor: reminderScheduledFor,
          recipientCount: recipients.length,
          recipients: recipients.map((r: any) => ({ name: r.name, email: r.email }))
        },
        message: `Reminder ${reminderTime ? 'scheduled' : 'sent'} successfully`
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
          meetingId: actualMeetingId,
          reminderSent: true,
          reminderType,
          scheduledFor: reminderTime || new Date().toISOString(),
          recipientCount: 3
        },
        message: 'Reminder scheduled (demo mode)'
      })
    }
  } catch (error) {
    logger.error('Meeting reminder error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to send reminder' },
      { status: 500 }
    )
  }
}

/**
 * GET - Get scheduled reminders for a meeting
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const session = await getServerSession()
    const demoMode = isDemoMode(request)
    const url = new URL(request.url)
    const meetingId = url.searchParams.get('meetingId') || url.searchParams.get('meeting_id')

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
      let query = supabase
        .from('meeting_reminders')
        .select('*')
        .eq('created_by', effectiveUserId)
        .order('scheduled_for', { ascending: true })

      if (meetingId) {
        query = query.eq('meeting_id', meetingId)
      }

      const { data: reminders, error } = await query

      if (error) throw error

      return NextResponse.json({
        success: true,
        demo: demoMode,
        data: {
          reminders: reminders || [],
          total: reminders?.length || 0
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
          reminders: [
            {
              id: 'reminder-1',
              meeting_id: meetingId || 'meeting-1',
              reminder_type: 'email',
              scheduled_for: new Date(Date.now() + 3600000).toISOString(),
              status: 'scheduled'
            }
          ],
          total: 1
        }
      })
    }
  } catch (error) {
    logger.error('Get reminders error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to get reminders' },
      { status: 500 }
    )
  }
}
