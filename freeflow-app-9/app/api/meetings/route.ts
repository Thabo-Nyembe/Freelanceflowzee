/**
 * Meetings API Route
 * Comprehensive meeting management with video conferencing support
 * Full database implementation with demo mode fallback
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServerSession } from '@/lib/auth'
import { createFeatureLogger } from '@/lib/logger'
import { randomBytes } from 'crypto'

const logger = createFeatureLogger('meetings-api')

// Demo mode support
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'

function isDemoMode(request: NextRequest): boolean {
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

// Type definitions matching database schema
type MeetingType = 'video' | 'voice' | 'screen-share'
type MeetingStatus = 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
type ParticipantRole = 'host' | 'co-host' | 'participant' | 'guest'
type MeetingRecurrence = 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly'

interface MeetingParticipant {
  name: string
  email: string
  role?: ParticipantRole
}

// Mock data for demo/fallback
const mockMeetings = [
  {
    id: 'meeting-1',
    title: 'Project Kickoff',
    description: 'Initial project planning and team alignment',
    scheduled_date: new Date().toISOString().split('T')[0],
    scheduled_time: '10:00:00',
    duration: 60,
    type: 'video' as MeetingType,
    status: 'scheduled' as MeetingStatus,
    host_name: 'Alex Morgan',
    max_participants: 25,
    meeting_link: 'https://meet.kazi.app/project-kickoff',
    recurrence: 'none' as MeetingRecurrence,
    participants: [
      { name: 'John Smith', email: 'john@example.com', role: 'participant' },
      { name: 'Sarah Wilson', email: 'sarah@example.com', role: 'participant' },
    ]
  },
  {
    id: 'meeting-2',
    title: 'Design Review',
    description: 'Review latest design mockups and gather feedback',
    scheduled_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    scheduled_time: '14:00:00',
    duration: 45,
    type: 'screen-share' as MeetingType,
    status: 'scheduled' as MeetingStatus,
    host_name: 'Alex Morgan',
    max_participants: 10,
    meeting_link: 'https://meet.kazi.app/design-review',
    recurrence: 'none' as MeetingRecurrence,
    participants: [
      { name: 'Mike Brown', email: 'mike@example.com', role: 'participant' },
      { name: 'Lisa Chen', email: 'lisa@example.com', role: 'co-host' },
    ]
  },
  {
    id: 'meeting-3',
    title: 'Weekly Standup',
    description: 'Weekly team sync and progress updates',
    scheduled_date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    scheduled_time: '09:00:00',
    duration: 30,
    type: 'video' as MeetingType,
    status: 'scheduled' as MeetingStatus,
    host_name: 'Alex Morgan',
    max_participants: 25,
    meeting_link: 'https://meet.kazi.app/weekly-standup',
    recurrence: 'weekly' as MeetingRecurrence,
    participants: [
      { name: 'Team', email: 'team@example.com', role: 'participant' },
    ]
  },
]

const mockStats = {
  totalMeetings: 15,
  upcomingThisWeek: 5,
  completedThisMonth: 10,
  totalHours: 12,
  averageDuration: 45,
  totalRecordings: 8,
  byType: { video: 8, voice: 4, 'screen-share': 3 },
  byStatus: { scheduled: 5, ongoing: 0, completed: 10, cancelled: 0 }
}

// ========================================================================
// GET - Fetch meetings and statistics
// ========================================================================
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const session = await getServerSession()
    const demoMode = isDemoMode(request)
    const url = new URL(request.url)
    const meetingId = url.searchParams.get('id')

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

    // Fetch single meeting by ID
    if (meetingId) {
      const { data: meeting, error } = await supabase
        .from('meetings')
        .select(`
          *,
          participants:meeting_participants(*)
        `)
        .eq('id', meetingId)
        .single()

      if (error || !meeting) {
        logger.warn('Meeting not found', { meetingId, error })
        return NextResponse.json(
          { success: false, error: 'Meeting not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        demo: demoMode,
        data: meeting
      })
    }

    // Fetch all meetings for user
    const { data: meetings, error: meetingsError } = await supabase
      .from('meetings')
      .select(`
        *,
        participants:meeting_participants(id, name, email, role, is_host)
      `)
      .eq('user_id', effectiveUserId)
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true })
      .limit(100)

    if (meetingsError) {
      logger.error('Failed to fetch meetings', { error: meetingsError })
      // Fall back to mock data
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          meetings: mockMeetings,
          stats: mockStats
        }
      })
    }

    // Calculate statistics
    const now = new Date()
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const stats = {
      totalMeetings: meetings?.length || 0,
      upcomingThisWeek: meetings?.filter(m => {
        const meetingDate = new Date(m.scheduled_date)
        return m.status === 'scheduled' && meetingDate >= now && meetingDate <= weekFromNow
      }).length || 0,
      completedThisMonth: meetings?.filter(m => {
        const meetingDate = new Date(m.scheduled_date)
        return m.status === 'completed' && meetingDate >= startOfMonth
      }).length || 0,
      totalHours: Math.round((meetings?.reduce((acc, m) => acc + (m.duration || 0), 0) || 0) / 60 * 10) / 10,
      averageDuration: Math.round((meetings?.reduce((acc, m) => acc + (m.duration || 0), 0) || 0) / (meetings?.length || 1)),
      totalRecordings: meetings?.filter(m => m.recording_url).length || 0,
      byType: {
        video: meetings?.filter(m => m.type === 'video').length || 0,
        voice: meetings?.filter(m => m.type === 'voice').length || 0,
        'screen-share': meetings?.filter(m => m.type === 'screen-share').length || 0
      },
      byStatus: {
        scheduled: meetings?.filter(m => m.status === 'scheduled').length || 0,
        ongoing: meetings?.filter(m => m.status === 'ongoing').length || 0,
        completed: meetings?.filter(m => m.status === 'completed').length || 0,
        cancelled: meetings?.filter(m => m.status === 'cancelled').length || 0
      }
    }

    return NextResponse.json({
      success: true,
      demo: demoMode,
      data: {
        meetings: meetings || [],
        stats
      }
    })
  } catch (error) {
    logger.error('Meetings GET error', { error })
    return NextResponse.json({
      success: true,
      demo: true,
      data: {
        meetings: mockMeetings,
        stats: mockStats
      }
    })
  }
}

// ========================================================================
// POST - Create meeting or perform meeting actions
// ========================================================================
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const session = await getServerSession()
    const demoMode = isDemoMode(request)

    // Determine effective user ID
    let effectiveUserId: string | null = null
    let userName = 'Demo User'

    if (session?.user) {
      const userEmail = session.user.email
      const isDemoAccount = userEmail === 'test@kazi.dev' || userEmail === 'demo@kazi.io' || userEmail === 'alex@freeflow.io'
      effectiveUserId = isDemoAccount || demoMode ? DEMO_USER_ID : (session.user as { authId?: string; id: string }).authId || session.user.id
      userName = session.user.name || 'User'
    } else if (demoMode) {
      effectiveUserId = DEMO_USER_ID
      userName = 'Alex Morgan'
    } else {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const { action, ...data } = body

    logger.info('Meeting action received', { action, userId: effectiveUserId, demoMode })

    switch (action) {
      case 'create':
        return handleCreateMeeting(supabase, effectiveUserId, userName, data, demoMode)

      case 'update':
        return handleUpdateMeeting(supabase, effectiveUserId, data, demoMode)

      case 'cancel':
        return handleCancelMeeting(supabase, effectiveUserId, data, demoMode)

      case 'start':
        return handleStartMeeting(supabase, effectiveUserId, data, demoMode)

      case 'end':
        return handleEndMeeting(supabase, effectiveUserId, data, demoMode)

      case 'add-participant':
        return handleAddParticipant(supabase, effectiveUserId, data, demoMode)

      case 'remove-participant':
        return handleRemoveParticipant(supabase, effectiveUserId, data, demoMode)

      case 'start-recording':
        return handleStartRecording(supabase, effectiveUserId, data, demoMode)

      case 'stop-recording':
        return handleStopRecording(supabase, effectiveUserId, data, demoMode)

      case 'join':
        return handleJoinMeeting(supabase, effectiveUserId, userName, data, demoMode)

      case 'leave':
        return handleLeaveMeeting(supabase, effectiveUserId, data, demoMode)

      case 'send-chat':
        return handleSendChatMessage(supabase, effectiveUserId, data, demoMode)

      case 'create-poll':
        return handleCreatePoll(supabase, effectiveUserId, data, demoMode)

      case 'schedule-recurring':
        return handleScheduleRecurring(supabase, effectiveUserId, userName, data, demoMode)

      default:
        // Default behavior - create meeting
        return handleCreateMeeting(supabase, effectiveUserId, userName, data, demoMode)
    }
  } catch (error) {
    logger.error('Meetings POST error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to process meeting request' },
      { status: 500 }
    )
  }
}

// ========================================================================
// Meeting Action Handlers
// ========================================================================

async function handleCreateMeeting(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  userName: string,
  data: {
    title: string
    description?: string
    scheduledDate: string
    scheduledTime: string
    duration?: number
    type?: MeetingType
    maxParticipants?: number
    recurrence?: MeetingRecurrence
    timezone?: string
    reminders?: number[]
    participants?: MeetingParticipant[]
  },
  demoMode: boolean
): Promise<NextResponse> {
  // Validate required fields
  if (!data.title || !data.scheduledDate || !data.scheduledTime) {
    return NextResponse.json(
      { success: false, error: 'Missing required fields: title, scheduledDate, scheduledTime' },
      { status: 400 }
    )
  }

  // Generate meeting link and passcode
  const meetingId = randomBytes(8).toString('hex')
  const meetingLink = `https://meet.kazi.app/${meetingId}`
  const passcode = randomBytes(4).toString('hex').toUpperCase()

  try {
    // Insert meeting
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .insert({
        user_id: userId,
        title: data.title,
        description: data.description || null,
        scheduled_date: data.scheduledDate,
        scheduled_time: data.scheduledTime,
        duration: data.duration || 60,
        type: data.type || 'video',
        status: 'scheduled',
        host_id: userId,
        host_name: userName,
        max_participants: data.maxParticipants || 25,
        meeting_link: meetingLink,
        passcode,
        recurrence: data.recurrence || 'none',
        timezone: data.timezone || 'UTC',
        reminders: data.reminders || [15, 30, 60],
        settings: {},
        metadata: { created_via: 'api', demo_mode: demoMode }
      })
      .select()
      .single()

    if (meetingError) {
      logger.error('Failed to create meeting', { error: meetingError })

      // Return mock response for demo mode
      if (demoMode) {
        return NextResponse.json({
          success: true,
          demo: true,
          data: {
            id: meetingId,
            title: data.title,
            scheduled_date: data.scheduledDate,
            scheduled_time: data.scheduledTime,
            duration: data.duration || 60,
            type: data.type || 'video',
            status: 'scheduled',
            meeting_link: meetingLink,
            passcode,
            created_at: new Date().toISOString()
          },
          message: 'Meeting created successfully (demo mode)'
        })
      }

      throw meetingError
    }

    // Add host as participant
    await supabase.from('meeting_participants').insert({
      meeting_id: meeting.id,
      user_id: userId,
      name: userName,
      email: 'host@kazi.app',
      role: 'host',
      is_host: true,
      joined_at: null
    })

    // Add additional participants if provided
    if (data.participants && data.participants.length > 0) {
      const participantInserts = data.participants.map(p => ({
        meeting_id: meeting.id,
        user_id: null,
        name: p.name,
        email: p.email,
        role: p.role || 'participant',
        is_host: false,
        joined_at: null
      }))

      await supabase.from('meeting_participants').insert(participantInserts)
    }

    logger.info('Meeting created', { meetingId: meeting.id, title: data.title, userId })

    return NextResponse.json({
      success: true,
      demo: demoMode,
      data: {
        ...meeting,
        passcode // Include passcode in response
      },
      message: 'Meeting created successfully'
    })
  } catch (error) {
    logger.error('Create meeting error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to create meeting' },
      { status: 500 }
    )
  }
}

async function handleUpdateMeeting(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: {
    meetingId: string
    title?: string
    description?: string
    scheduledDate?: string
    scheduledTime?: string
    duration?: number
    type?: MeetingType
    maxParticipants?: number
  },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.meetingId) {
    return NextResponse.json(
      { success: false, error: 'Meeting ID is required' },
      { status: 400 }
    )
  }

  const updateData: Record<string, unknown> = {}
  if (data.title) updateData.title = data.title
  if (data.description !== undefined) updateData.description = data.description
  if (data.scheduledDate) updateData.scheduled_date = data.scheduledDate
  if (data.scheduledTime) updateData.scheduled_time = data.scheduledTime
  if (data.duration) updateData.duration = data.duration
  if (data.type) updateData.type = data.type
  if (data.maxParticipants) updateData.max_participants = data.maxParticipants

  const { data: meeting, error } = await supabase
    .from('meetings')
    .update(updateData)
    .eq('id', data.meetingId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    logger.error('Failed to update meeting', { error, meetingId: data.meetingId })

    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { meetingId: data.meetingId, ...updateData, updated_at: new Date().toISOString() },
        message: 'Meeting updated successfully (demo mode)'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update meeting' },
      { status: 500 }
    )
  }

  logger.info('Meeting updated', { meetingId: data.meetingId, userId })

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: meeting,
    message: 'Meeting updated successfully'
  })
}

async function handleCancelMeeting(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { meetingId: string; reason?: string },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.meetingId) {
    return NextResponse.json(
      { success: false, error: 'Meeting ID is required' },
      { status: 400 }
    )
  }

  const { data: meeting, error } = await supabase
    .from('meetings')
    .update({
      status: 'cancelled',
      metadata: { cancellation_reason: data.reason, cancelled_at: new Date().toISOString() }
    })
    .eq('id', data.meetingId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    logger.error('Failed to cancel meeting', { error, meetingId: data.meetingId })

    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { meetingId: data.meetingId, status: 'cancelled', cancelled_at: new Date().toISOString() },
        message: 'Meeting cancelled successfully (demo mode)'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to cancel meeting' },
      { status: 500 }
    )
  }

  logger.info('Meeting cancelled', { meetingId: data.meetingId, userId, reason: data.reason })

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: meeting,
    message: 'Meeting cancelled successfully'
  })
}

async function handleStartMeeting(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { meetingId: string },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.meetingId) {
    return NextResponse.json(
      { success: false, error: 'Meeting ID is required' },
      { status: 400 }
    )
  }

  const { data: meeting, error } = await supabase
    .from('meetings')
    .update({
      status: 'ongoing',
      metadata: { started_at: new Date().toISOString() }
    })
    .eq('id', data.meetingId)
    .or(`user_id.eq.${userId},host_id.eq.${userId}`)
    .select()
    .single()

  if (error) {
    logger.error('Failed to start meeting', { error, meetingId: data.meetingId })

    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { meetingId: data.meetingId, status: 'ongoing', started_at: new Date().toISOString() },
        message: 'Meeting started successfully (demo mode)'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to start meeting' },
      { status: 500 }
    )
  }

  // Update host's join time
  await supabase
    .from('meeting_participants')
    .update({ joined_at: new Date().toISOString() })
    .eq('meeting_id', data.meetingId)
    .eq('user_id', userId)

  logger.info('Meeting started', { meetingId: data.meetingId, userId })

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: meeting,
    message: 'Meeting started successfully'
  })
}

async function handleEndMeeting(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { meetingId: string },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.meetingId) {
    return NextResponse.json(
      { success: false, error: 'Meeting ID is required' },
      { status: 400 }
    )
  }

  const { data: meeting, error } = await supabase
    .from('meetings')
    .update({
      status: 'completed',
      is_recording: false,
      metadata: { ended_at: new Date().toISOString() }
    })
    .eq('id', data.meetingId)
    .or(`user_id.eq.${userId},host_id.eq.${userId}`)
    .select()
    .single()

  if (error) {
    logger.error('Failed to end meeting', { error, meetingId: data.meetingId })

    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { meetingId: data.meetingId, status: 'completed', ended_at: new Date().toISOString() },
        message: 'Meeting ended successfully (demo mode)'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to end meeting' },
      { status: 500 }
    )
  }

  // Mark all participants as left
  await supabase
    .from('meeting_participants')
    .update({ left_at: new Date().toISOString() })
    .eq('meeting_id', data.meetingId)
    .is('left_at', null)

  logger.info('Meeting ended', { meetingId: data.meetingId, userId })

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: meeting,
    message: 'Meeting ended successfully'
  })
}

async function handleAddParticipant(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { meetingId: string; name: string; email: string; role?: ParticipantRole },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.meetingId || !data.name || !data.email) {
    return NextResponse.json(
      { success: false, error: 'Meeting ID, name, and email are required' },
      { status: 400 }
    )
  }

  // Verify user owns the meeting
  const { data: meeting } = await supabase
    .from('meetings')
    .select('id, max_participants')
    .eq('id', data.meetingId)
    .or(`user_id.eq.${userId},host_id.eq.${userId}`)
    .single()

  if (!meeting && !demoMode) {
    return NextResponse.json(
      { success: false, error: 'Meeting not found or access denied' },
      { status: 404 }
    )
  }

  // Check participant count
  const { count } = await supabase
    .from('meeting_participants')
    .select('id', { count: 'exact' })
    .eq('meeting_id', data.meetingId)

  if (count && meeting && count >= meeting.max_participants) {
    return NextResponse.json(
      { success: false, error: 'Meeting has reached maximum participants' },
      { status: 400 }
    )
  }

  const { data: participant, error } = await supabase
    .from('meeting_participants')
    .insert({
      meeting_id: data.meetingId,
      name: data.name,
      email: data.email,
      role: data.role || 'participant',
      is_host: false
    })
    .select()
    .single()

  if (error) {
    logger.error('Failed to add participant', { error, meetingId: data.meetingId })

    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: randomBytes(8).toString('hex'), ...data, added_at: new Date().toISOString() },
        message: 'Participant added successfully (demo mode)'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to add participant' },
      { status: 500 }
    )
  }

  logger.info('Participant added', { meetingId: data.meetingId, participantEmail: data.email })

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: participant,
    message: 'Participant added successfully'
  })
}

async function handleRemoveParticipant(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { meetingId: string; participantId: string },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.meetingId || !data.participantId) {
    return NextResponse.json(
      { success: false, error: 'Meeting ID and participant ID are required' },
      { status: 400 }
    )
  }

  // Verify user owns the meeting
  const { data: meeting } = await supabase
    .from('meetings')
    .select('id')
    .eq('id', data.meetingId)
    .or(`user_id.eq.${userId},host_id.eq.${userId}`)
    .single()

  if (!meeting && !demoMode) {
    return NextResponse.json(
      { success: false, error: 'Meeting not found or access denied' },
      { status: 404 }
    )
  }

  const { error } = await supabase
    .from('meeting_participants')
    .delete()
    .eq('id', data.participantId)
    .eq('meeting_id', data.meetingId)

  if (error) {
    logger.error('Failed to remove participant', { error, participantId: data.participantId })

    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { participantId: data.participantId, removed_at: new Date().toISOString() },
        message: 'Participant removed successfully (demo mode)'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to remove participant' },
      { status: 500 }
    )
  }

  logger.info('Participant removed', { meetingId: data.meetingId, participantId: data.participantId })

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: { participantId: data.participantId, removed_at: new Date().toISOString() },
    message: 'Participant removed successfully'
  })
}

async function handleStartRecording(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { meetingId: string; quality?: 'low' | 'medium' | 'high' | 'hd' },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.meetingId) {
    return NextResponse.json(
      { success: false, error: 'Meeting ID is required' },
      { status: 400 }
    )
  }

  const { data: meeting, error } = await supabase
    .from('meetings')
    .update({
      is_recording: true,
      recording_started_at: new Date().toISOString()
    })
    .eq('id', data.meetingId)
    .or(`user_id.eq.${userId},host_id.eq.${userId}`)
    .select()
    .single()

  if (error) {
    logger.error('Failed to start recording', { error, meetingId: data.meetingId })

    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { meetingId: data.meetingId, is_recording: true, recording_started_at: new Date().toISOString() },
        message: 'Recording started (demo mode)'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to start recording' },
      { status: 500 }
    )
  }

  // Create recording record
  await supabase.from('meeting_recordings').insert({
    meeting_id: data.meetingId,
    user_id: userId,
    title: `Recording - ${meeting.title}`,
    started_at: new Date().toISOString(),
    quality: data.quality || 'medium',
    url: '' // Will be updated when recording stops
  })

  logger.info('Recording started', { meetingId: data.meetingId, userId })

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: meeting,
    message: 'Recording started'
  })
}

async function handleStopRecording(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { meetingId: string },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.meetingId) {
    return NextResponse.json(
      { success: false, error: 'Meeting ID is required' },
      { status: 400 }
    )
  }

  const now = new Date()

  // Get recording start time
  const { data: meeting } = await supabase
    .from('meetings')
    .select('recording_started_at')
    .eq('id', data.meetingId)
    .single()

  const recordingDuration = meeting?.recording_started_at
    ? Math.round((now.getTime() - new Date(meeting.recording_started_at).getTime()) / 1000)
    : 0

  const { data: updatedMeeting, error } = await supabase
    .from('meetings')
    .update({
      is_recording: false,
      recording_duration: recordingDuration
    })
    .eq('id', data.meetingId)
    .or(`user_id.eq.${userId},host_id.eq.${userId}`)
    .select()
    .single()

  if (error) {
    logger.error('Failed to stop recording', { error, meetingId: data.meetingId })

    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { meetingId: data.meetingId, is_recording: false, recording_duration: 300 },
        message: 'Recording stopped (demo mode)'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to stop recording' },
      { status: 500 }
    )
  }

  // Update recording record
  const recordingUrl = `https://storage.kazi.app/recordings/${data.meetingId}-${now.getTime()}.mp4`
  await supabase
    .from('meeting_recordings')
    .update({
      ended_at: now.toISOString(),
      duration: recordingDuration,
      url: recordingUrl
    })
    .eq('meeting_id', data.meetingId)
    .is('ended_at', null)

  // Update meeting with recording URL
  await supabase
    .from('meetings')
    .update({ recording_url: recordingUrl })
    .eq('id', data.meetingId)

  logger.info('Recording stopped', { meetingId: data.meetingId, duration: recordingDuration })

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: { ...updatedMeeting, recording_url: recordingUrl },
    message: 'Recording stopped'
  })
}

async function handleJoinMeeting(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  userName: string,
  data: { meetingId: string; passcode?: string },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.meetingId) {
    return NextResponse.json(
      { success: false, error: 'Meeting ID is required' },
      { status: 400 }
    )
  }

  // Verify meeting exists and check passcode
  const { data: meeting } = await supabase
    .from('meetings')
    .select('id, passcode, meeting_link, status')
    .eq('id', data.meetingId)
    .single()

  if (!meeting && !demoMode) {
    return NextResponse.json(
      { success: false, error: 'Meeting not found' },
      { status: 404 }
    )
  }

  if (meeting?.passcode && data.passcode !== meeting.passcode && !demoMode) {
    return NextResponse.json(
      { success: false, error: 'Invalid passcode' },
      { status: 403 }
    )
  }

  // Update or create participant record
  const { data: existingParticipant } = await supabase
    .from('meeting_participants')
    .select('id')
    .eq('meeting_id', data.meetingId)
    .eq('user_id', userId)
    .single()

  if (existingParticipant) {
    await supabase
      .from('meeting_participants')
      .update({ joined_at: new Date().toISOString(), left_at: null })
      .eq('id', existingParticipant.id)
  } else {
    await supabase.from('meeting_participants').insert({
      meeting_id: data.meetingId,
      user_id: userId,
      name: userName,
      email: 'participant@kazi.app',
      role: 'participant',
      is_host: false,
      joined_at: new Date().toISOString()
    })
  }

  logger.info('User joined meeting', { meetingId: data.meetingId, userId })

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: {
      meetingId: data.meetingId,
      meetingLink: meeting?.meeting_link || `https://meet.kazi.app/${data.meetingId}`,
      status: meeting?.status || 'ongoing',
      joinedAt: new Date().toISOString()
    },
    message: 'Joined meeting successfully'
  })
}

async function handleLeaveMeeting(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { meetingId: string },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.meetingId) {
    return NextResponse.json(
      { success: false, error: 'Meeting ID is required' },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from('meeting_participants')
    .update({ left_at: new Date().toISOString() })
    .eq('meeting_id', data.meetingId)
    .eq('user_id', userId)

  if (error && !demoMode) {
    logger.error('Failed to leave meeting', { error, meetingId: data.meetingId })
    return NextResponse.json(
      { success: false, error: 'Failed to leave meeting' },
      { status: 500 }
    )
  }

  logger.info('User left meeting', { meetingId: data.meetingId, userId })

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: { meetingId: data.meetingId, leftAt: new Date().toISOString() },
    message: 'Left meeting successfully'
  })
}

async function handleSendChatMessage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { meetingId: string; message: string; isPrivate?: boolean; recipientId?: string },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.meetingId || !data.message) {
    return NextResponse.json(
      { success: false, error: 'Meeting ID and message are required' },
      { status: 400 }
    )
  }

  // Get participant ID
  const { data: participant } = await supabase
    .from('meeting_participants')
    .select('id')
    .eq('meeting_id', data.meetingId)
    .eq('user_id', userId)
    .single()

  if (!participant && !demoMode) {
    return NextResponse.json(
      { success: false, error: 'You are not a participant of this meeting' },
      { status: 403 }
    )
  }

  const { data: chatMessage, error } = await supabase
    .from('meeting_chat_messages')
    .insert({
      meeting_id: data.meetingId,
      participant_id: participant?.id || randomBytes(8).toString('hex'),
      message: data.message,
      is_private: data.isPrivate || false,
      recipient_id: data.recipientId || null
    })
    .select()
    .single()

  if (error) {
    logger.error('Failed to send chat message', { error, meetingId: data.meetingId })

    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: randomBytes(8).toString('hex'), message: data.message, sent_at: new Date().toISOString() },
        message: 'Message sent (demo mode)'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: chatMessage,
    message: 'Message sent'
  })
}

async function handleCreatePoll(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: { meetingId: string; question: string; options: string[]; isMultipleChoice?: boolean; isAnonymous?: boolean },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.meetingId || !data.question || !data.options || data.options.length < 2) {
    return NextResponse.json(
      { success: false, error: 'Meeting ID, question, and at least 2 options are required' },
      { status: 400 }
    )
  }

  // Get participant ID
  const { data: participant } = await supabase
    .from('meeting_participants')
    .select('id')
    .eq('meeting_id', data.meetingId)
    .eq('user_id', userId)
    .single()

  if (!participant && !demoMode) {
    return NextResponse.json(
      { success: false, error: 'You are not a participant of this meeting' },
      { status: 403 }
    )
  }

  const { data: poll, error } = await supabase
    .from('meeting_polls')
    .insert({
      meeting_id: data.meetingId,
      created_by: participant?.id || randomBytes(8).toString('hex'),
      question: data.question,
      options: data.options,
      is_multiple_choice: data.isMultipleChoice || false,
      is_anonymous: data.isAnonymous || false,
      results: {}
    })
    .select()
    .single()

  if (error) {
    logger.error('Failed to create poll', { error, meetingId: data.meetingId })

    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { id: randomBytes(8).toString('hex'), question: data.question, options: data.options, created_at: new Date().toISOString() },
        message: 'Poll created (demo mode)'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create poll' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: poll,
    message: 'Poll created'
  })
}

async function handleScheduleRecurring(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  userName: string,
  data: {
    title: string
    description?: string
    scheduledTime: string
    duration?: number
    type?: MeetingType
    recurrence: MeetingRecurrence
    occurrences?: number
  },
  demoMode: boolean
): Promise<NextResponse> {
  if (!data.title || !data.scheduledTime || !data.recurrence || data.recurrence === 'none') {
    return NextResponse.json(
      { success: false, error: 'Title, scheduled time, and valid recurrence are required' },
      { status: 400 }
    )
  }

  const occurrences = data.occurrences || 10
  const meetings: unknown[] = []
  const baseDate = new Date()

  for (let i = 0; i < occurrences; i++) {
    const meetingDate = new Date(baseDate)

    switch (data.recurrence) {
      case 'daily':
        meetingDate.setDate(meetingDate.getDate() + i)
        break
      case 'weekly':
        meetingDate.setDate(meetingDate.getDate() + (i * 7))
        break
      case 'biweekly':
        meetingDate.setDate(meetingDate.getDate() + (i * 14))
        break
      case 'monthly':
        meetingDate.setMonth(meetingDate.getMonth() + i)
        break
    }

    const meetingId = randomBytes(8).toString('hex')
    meetings.push({
      user_id: userId,
      title: data.title,
      description: data.description || null,
      scheduled_date: meetingDate.toISOString().split('T')[0],
      scheduled_time: data.scheduledTime,
      duration: data.duration || 60,
      type: data.type || 'video',
      status: 'scheduled',
      host_id: userId,
      host_name: userName,
      max_participants: 25,
      meeting_link: `https://meet.kazi.app/${meetingId}`,
      passcode: randomBytes(4).toString('hex').toUpperCase(),
      recurrence: data.recurrence,
      timezone: 'UTC',
      metadata: { series_id: randomBytes(8).toString('hex'), occurrence: i + 1, total_occurrences: occurrences }
    })
  }

  const { data: createdMeetings, error } = await supabase
    .from('meetings')
    .insert(meetings)
    .select()

  if (error) {
    logger.error('Failed to create recurring meetings', { error })

    if (demoMode) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: { count: occurrences, recurrence: data.recurrence, created_at: new Date().toISOString() },
        message: `${occurrences} recurring meetings scheduled (demo mode)`
      })
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create recurring meetings' },
      { status: 500 }
    )
  }

  logger.info('Recurring meetings created', { count: createdMeetings?.length, recurrence: data.recurrence })

  return NextResponse.json({
    success: true,
    demo: demoMode,
    data: {
      meetings: createdMeetings,
      count: createdMeetings?.length
    },
    message: `${createdMeetings?.length} recurring meetings scheduled`
  })
}

// ========================================================================
// PUT - Update meeting
// ========================================================================
export async function PUT(request: NextRequest) {
  return POST(request)
}

// ========================================================================
// DELETE - Delete meeting
// ========================================================================
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const session = await getServerSession()
    const demoMode = isDemoMode(request)
    const url = new URL(request.url)
    const meetingId = url.searchParams.get('id')

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

    const { error } = await supabase
      .from('meetings')
      .delete()
      .eq('id', meetingId)
      .eq('user_id', effectiveUserId)

    if (error) {
      logger.error('Failed to delete meeting', { error, meetingId })

      if (demoMode) {
        return NextResponse.json({
          success: true,
          demo: true,
          data: { meetingId, deleted_at: new Date().toISOString() },
          message: 'Meeting deleted successfully (demo mode)'
        })
      }

      return NextResponse.json(
        { success: false, error: 'Failed to delete meeting' },
        { status: 500 }
      )
    }

    logger.info('Meeting deleted', { meetingId, userId: effectiveUserId })

    return NextResponse.json({
      success: true,
      demo: demoMode,
      data: { meetingId, deleted_at: new Date().toISOString() },
      message: 'Meeting deleted successfully'
    })
  } catch (error) {
    logger.error('Meetings DELETE error', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to delete meeting' },
      { status: 500 }
    )
  }
}
