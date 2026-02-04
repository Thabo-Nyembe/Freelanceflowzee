/**
 * Calendar Scheduling API Routes
 *
 * REST endpoints for Calendar & Scheduling:
 * GET - List events, availability, booking types, bookings, syncs, stats, available slots
 * POST - Create event, availability, booking type, booking, calendar sync
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('calendar-scheduling')
import {

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
  getCalendarEvents,
  createCalendarEvent,
  getAvailabilitySchedules,
  getDefaultAvailability,
  createAvailabilitySchedule,
  getBookingTypes,
  getBookingTypeBySlug,
  createBookingType,
  getBookings,
  createBooking,
  getCalendarSyncs,
  createCalendarSync,
  getCalendarStats,
  getAvailableSlots
} from '@/lib/calendar-scheduling-queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'events'
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const status = searchParams.get('status')
    const clientId = searchParams.get('client_id')
    const projectId = searchParams.get('project_id')
    const clientEmail = searchParams.get('client_email')
    const bookingTypeId = searchParams.get('booking_type_id')
    const slug = searchParams.get('slug')
    const publicOnly = searchParams.get('public_only') === 'true'
    const date = searchParams.get('date')
    const timezone = searchParams.get('timezone') || 'UTC'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined

    switch (type) {
      case 'events': {
        if (!startDate || !endDate) {
          return NextResponse.json({ error: 'start_date and end_date required' }, { status: 400 })
        }
        const result = await getCalendarEvents(user.id, {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          status: status || undefined,
          clientId: clientId || undefined,
          projectId: projectId || undefined
        })
        return NextResponse.json({ data: result })
      }

      case 'availability': {
        const result = await getAvailabilitySchedules(user.id)
        return NextResponse.json({ data: result })
      }

      case 'default-availability': {
        const result = await getDefaultAvailability(user.id)
        return NextResponse.json({ data: result })
      }

      case 'booking-types': {
        if (slug) {
          const result = await getBookingTypeBySlug(user.id, slug)
          return NextResponse.json({ data: result })
        }
        const result = await getBookingTypes(user.id, publicOnly)
        return NextResponse.json({ data: result })
      }

      case 'bookings': {
        const options: any = {}
        if (status) {
          options.status = status.includes(',') ? status.split(',') : status
        }
        if (startDate) options.startDate = new Date(startDate)
        if (endDate) options.endDate = new Date(endDate)
        if (clientEmail) options.clientEmail = clientEmail
        if (bookingTypeId) options.bookingTypeId = bookingTypeId
        if (limit) options.limit = limit
        if (offset) options.offset = offset
        const result = await getBookings(user.id, options)
        return NextResponse.json({ data: result.bookings, total: result.total })
      }

      case 'calendar-syncs': {
        const result = await getCalendarSyncs(user.id)
        return NextResponse.json({ data: result })
      }

      case 'stats': {
        const result = await getCalendarStats(user.id)
        return NextResponse.json({ data: result })
      }

      case 'available-slots': {
        if (!bookingTypeId || !date) {
          return NextResponse.json({ error: 'booking_type_id and date required' }, { status: 400 })
        }
        const result = await getAvailableSlots(user.id, bookingTypeId, new Date(date), timezone)
        return NextResponse.json({ data: result })
      }

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Calendar Scheduling API error', { error })
    return NextResponse.json(
      { error: 'Failed to fetch Calendar Scheduling data' },
      { status: 500 }
    )
  }
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
      case 'create-event': {
        const result = await createCalendarEvent({
          user_id: user.id,
          title: payload.title,
          description: payload.description,
          start_time: payload.start_time,
          end_time: payload.end_time,
          all_day: payload.all_day,
          location: payload.location,
          location_type: payload.location_type,
          video_url: payload.video_url,
          color: payload.color,
          status: payload.status,
          visibility: payload.visibility,
          recurrence_rule: payload.recurrence_rule,
          recurrence_end: payload.recurrence_end,
          client_id: payload.client_id,
          project_id: payload.project_id,
          attendees: payload.attendees,
          reminders: payload.reminders,
          metadata: payload.metadata
        })
        return NextResponse.json({ data: result }, { status: 201 })
      }

      case 'create-availability': {
        const result = await createAvailabilitySchedule({
          user_id: user.id,
          name: payload.name,
          is_default: payload.is_default,
          timezone: payload.timezone,
          schedule: payload.schedule,
          date_overrides: payload.date_overrides
        })
        return NextResponse.json({ data: result }, { status: 201 })
      }

      case 'create-booking-type': {
        const result = await createBookingType({
          user_id: user.id,
          name: payload.name,
          description: payload.description,
          duration_minutes: payload.duration_minutes,
          buffer_before: payload.buffer_before,
          buffer_after: payload.buffer_after,
          color: payload.color,
          price: payload.price,
          currency: payload.currency,
          location_type: payload.location_type,
          location_details: payload.location_details,
          custom_questions: payload.custom_questions,
          confirmation_message: payload.confirmation_message,
          cancellation_policy: payload.cancellation_policy,
          requires_approval: payload.requires_approval,
          max_bookings_per_day: payload.max_bookings_per_day,
          min_notice_hours: payload.min_notice_hours,
          max_advance_days: payload.max_advance_days,
          is_active: payload.is_active,
          is_public: payload.is_public
        })
        return NextResponse.json({ data: result }, { status: 201 })
      }

      case 'create-booking': {
        const result = await createBooking({
          booking_type_id: payload.booking_type_id,
          client_name: payload.client_name,
          client_email: payload.client_email,
          client_phone: payload.client_phone,
          start_time: payload.start_time,
          end_time: payload.end_time,
          answers: payload.answers,
          notes: payload.notes
        })
        return NextResponse.json({ data: result }, { status: 201 })
      }

      case 'create-calendar-sync': {
        const result = await createCalendarSync({
          user_id: user.id,
          provider: payload.provider,
          calendar_id: payload.calendar_id,
          calendar_name: payload.calendar_name,
          sync_direction: payload.sync_direction,
          credentials: payload.credentials
        })
        return NextResponse.json({ data: result }, { status: 201 })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Calendar Scheduling API error', { error })
    return NextResponse.json(
      { error: 'Failed to process Calendar Scheduling request' },
      { status: 500 }
    )
  }
}
