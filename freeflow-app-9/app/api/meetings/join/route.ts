/**
 * Meeting Join API Route
 * Handles joining a meeting with passcode verification
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from '@/lib/auth'
import { createFeatureLogger } from '@/lib/logger'
import { randomBytes } from 'crypto'

const logger = createFeatureLogger('meetings-join-api')

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

    // Determine effective user ID and name
    let effectiveUserId: string | null = null
    let userName = 'Guest'

    if (session?.user) {
      const userEmail = session.user.email
      const isDemoAccount = userEmail === 'test@kazi.dev' || userEmail === 'demo@kazi.io' || userEmail === 'alex@freeflow.io'
      effectiveUserId = isDemoAccount || demoMode ? DEMO_USER_ID : (session.user as any).authId || session.user.id
      userName = session.user.name || 'User'
    } else if (demoMode) {
      effectiveUserId = DEMO_USER_ID
      userName = 'Demo User'
    } else {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const { meetingId, meeting_id, passcode, name, email } = body

    const actualMeetingId = meetingId || meeting_id
    const participantName = name || userName

    if (!actualMeetingId) {
      return NextResponse.json(
        { success: false, error: 'Meeting ID is required' },
        { status: 400 }
      )
    }

    logger.info('Joining meeting', { meetingId: actualMeetingId, userId: effectiveUserId })

    try {
      // Verify meeting exists and check status
      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .select('id, passcode, meeting_link, status, title, max_participants')
        .eq('id', actualMeetingId)
        .single()

      if (meetingError || !meeting) {
        if (demoMode) {
          const accessToken = randomBytes(32).toString('hex')
          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              meetingId: actualMeetingId,
              joinUrl: `https://meet.kazi.app/${actualMeetingId}`,
              accessToken,
              joined: true,
              joinedAt: new Date().toISOString()
            },
            message: 'Joined meeting (demo mode)'
          })
        }
        return NextResponse.json(
          { success: false, error: 'Meeting not found' },
          { status: 404 }
        )
      }

      // Check if meeting is joinable
      if (meeting.status === 'cancelled') {
        return NextResponse.json(
          { success: false, error: 'This meeting has been cancelled' },
          { status: 400 }
        )
      }

      if (meeting.status === 'completed') {
        return NextResponse.json(
          { success: false, error: 'This meeting has ended' },
          { status: 400 }
        )
      }

      // Verify passcode if required
      if (meeting.passcode && passcode !== meeting.passcode && !demoMode) {
        return NextResponse.json(
          { success: false, error: 'Invalid passcode' },
          { status: 403 }
        )
      }

      // Check participant limit
      const { count: participantCount } = await supabase
        .from('meeting_participants')
        .select('id', { count: 'exact' })
        .eq('meeting_id', actualMeetingId)
        .not('left_at', 'is', null)

      if (participantCount && meeting.max_participants && participantCount >= meeting.max_participants) {
        return NextResponse.json(
          { success: false, error: 'Meeting has reached maximum participants' },
          { status: 400 }
        )
      }

      // Check if user is already a participant
      const { data: existingParticipant } = await supabase
        .from('meeting_participants')
        .select('id')
        .eq('meeting_id', actualMeetingId)
        .eq('user_id', effectiveUserId)
        .single()

      const joinedAt = new Date().toISOString()

      if (existingParticipant) {
        // Update existing participant record
        await supabase
          .from('meeting_participants')
          .update({ joined_at: joinedAt, left_at: null })
          .eq('id', existingParticipant.id)
      } else {
        // Create new participant record
        await supabase.from('meeting_participants').insert({
          meeting_id: actualMeetingId,
          user_id: effectiveUserId,
          name: participantName,
          email: email || 'participant@kazi.app',
          role: 'participant',
          is_host: false,
          joined_at: joinedAt
        })
      }

      // Generate access token for meeting
      const accessToken = randomBytes(32).toString('hex')

      logger.info('User joined meeting', { meetingId: actualMeetingId, userId: effectiveUserId })

      return NextResponse.json({
        success: true,
        demo: demoMode,
        data: {
          meetingId: meeting.id,
          title: meeting.title,
          joinUrl: meeting.meeting_link || `https://meet.kazi.app/${actualMeetingId}`,
          accessToken,
          joined: true,
          joinedAt,
          status: meeting.status
        },
        message: 'Joined meeting successfully'
      })
    } catch (dbError) {
      logger.warn('Database error, using demo fallback', { error: dbError })

      if (!demoMode) {
        throw dbError
      }

      const accessToken = randomBytes(32).toString('hex')
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          meetingId: actualMeetingId,
          joinUrl: `https://meet.kazi.app/${actualMeetingId}`,
          accessToken,
          joined: true,
          joinedAt: new Date().toISOString()
        },
        message: 'Joined meeting (demo mode)'
      })
    }
  } catch (error) {
    logger.error('Meeting join error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to join meeting' },
      { status: 500 }
    )
  }
}
