/**
 * Calendar Scheduling API - Single Resource Routes
 *
 * GET - Get single event, booking type, booking
 * PUT - Update event, availability, booking type, booking, confirm/cancel/reschedule
 * DELETE - Delete event, availability, booking type, calendar sync
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getCalendarEventById,
  updateCalendarEvent,
  deleteCalendarEvent,
  cancelCalendarEvent,
  updateAttendeeStatus,
  updateAvailabilitySchedule,
  deleteAvailabilitySchedule,
  addDateOverride,
  getBookingTypeById,
  updateBookingType,
  deleteBookingType,
  getBookingById,
  updateBooking,
  confirmBooking,
  cancelBooking,
  rescheduleBooking,
  deleteCalendarSync
} from '@/lib/calendar-scheduling-queries'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'event'

    switch (type) {
      case 'event': {
        const result = await getCalendarEventById(id)
        if (!result) {
          return NextResponse.json({ error: 'Event not found' }, { status: 404 })
        }
        return NextResponse.json({ data: result })
      }

      case 'booking-type': {
        const result = await getBookingTypeById(id)
        if (!result) {
          return NextResponse.json({ error: 'Booking type not found' }, { status: 404 })
        }
        return NextResponse.json({ data: result })
      }

      case 'booking': {
        const result = await getBookingById(id)
        if (!result) {
          return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
        }
        return NextResponse.json({ data: result })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Calendar Scheduling API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resource' },
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
      case 'event': {
        if (action === 'cancel') {
          const result = await cancelCalendarEvent(id, updates.reason)
          return NextResponse.json({ success: result })
        } else if (action === 'update-attendee') {
          const result = await updateAttendeeStatus(id, updates.email, updates.status)
          return NextResponse.json({ success: result })
        } else {
          const result = await updateCalendarEvent(id, updates)
          return NextResponse.json({ data: result })
        }
      }

      case 'availability': {
        if (action === 'add-override') {
          const result = await addDateOverride(id, updates.override)
          return NextResponse.json({ success: result })
        } else {
          const result = await updateAvailabilitySchedule(id, updates)
          return NextResponse.json({ data: result })
        }
      }

      case 'booking-type': {
        const result = await updateBookingType(id, updates)
        return NextResponse.json({ data: result })
      }

      case 'booking': {
        if (action === 'confirm') {
          const result = await confirmBooking(id)
          return NextResponse.json({ success: result })
        } else if (action === 'cancel') {
          const result = await cancelBooking(id, updates.cancelled_by, updates.reason)
          return NextResponse.json({ success: result })
        } else if (action === 'reschedule') {
          const result = await rescheduleBooking(
            id,
            new Date(updates.new_start_time),
            new Date(updates.new_end_time)
          )
          return NextResponse.json({ data: result })
        } else {
          const result = await updateBooking(id, updates)
          return NextResponse.json({ data: result })
        }
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Calendar Scheduling API error:', error)
    return NextResponse.json(
      { error: 'Failed to update resource' },
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
    const type = searchParams.get('type') || 'event'
    const deleteRecurring = searchParams.get('delete_recurring') === 'true'

    switch (type) {
      case 'event': {
        const result = await deleteCalendarEvent(id, deleteRecurring)
        return NextResponse.json({ success: result })
      }

      case 'availability': {
        const result = await deleteAvailabilitySchedule(id)
        return NextResponse.json({ success: result })
      }

      case 'booking-type': {
        const result = await deleteBookingType(id)
        return NextResponse.json({ success: result })
      }

      case 'calendar-sync': {
        const result = await deleteCalendarSync(id)
        return NextResponse.json({ success: result })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Calendar Scheduling API error:', error)
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
