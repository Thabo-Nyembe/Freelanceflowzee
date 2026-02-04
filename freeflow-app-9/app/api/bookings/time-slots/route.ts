/**
 * Booking Time Slots API Routes
 *
 * REST endpoints for Time Slot Management:
 * GET - Get available time slots for a date
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

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

const logger = createSimpleLogger('booking-time-slots')

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const duration = parseInt(searchParams.get('duration') || '30')
    const serviceId = searchParams.get('serviceId')

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 })
    }

    // Fetch user's availability settings
    const { data: settingsData } = await supabase
      .from('user_preferences')
      .select('booking_settings')
      .eq('user_id', user.id)
      .single()

    const settings = settingsData?.booking_settings || {
      workingHours: { start: '09:00', end: '17:00' },
      slotDuration: 30,
      bufferBefore: 10,
      bufferAfter: 10
    }

    // Fetch existing bookings for the date
    const startOfDay = `${date}T00:00:00`
    const endOfDay = `${date}T23:59:59`

    const { data: existingBookings } = await supabase
      .from('bookings')
      .select('start_time, end_time, duration_minutes, buffer_before_minutes, buffer_after_minutes')
      .eq('user_id', user.id)
      .gte('start_time', startOfDay)
      .lte('start_time', endOfDay)
      .not('status', 'in', '("cancelled","no_show")')

    // Fetch blocked time slots for the date
    const { data: blockedSlots } = await supabase
      .from('blocked_time_slots')
      .select('start_time, end_time')
      .eq('user_id', user.id)
      .eq('date', date)

    // Generate available time slots
    const startHour = parseInt(settings.workingHours?.start?.split(':')[0] || '9')
    const endHour = parseInt(settings.workingHours?.end?.split(':')[0] || '17')
    const slotDuration = duration || parseInt(settings.slotDuration || '30')

    const timeSlots: { time: string; available: boolean; reason?: string }[] = []
    const requestedDate = new Date(date)
    const now = new Date()

    for (let hour = startHour; hour < endHour; hour++) {
      for (let min = 0; min < 60; min += slotDuration) {
        const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
        const slotStart = new Date(`${date}T${time}:00`)
        const slotEnd = new Date(slotStart.getTime() + slotDuration * 60000)

        let available = true
        let reason: string | undefined

        // Check if slot is in the past
        if (slotStart < now) {
          available = false
          reason = 'past'
        }

        // Check if slot overlaps with existing bookings
        if (available && existingBookings) {
          for (const booking of existingBookings) {
            const bookingStart = new Date(booking.start_time)
            const bookingEnd = new Date(booking.end_time)
            const bufferStart = new Date(bookingStart.getTime() - (booking.buffer_before_minutes || 0) * 60000)
            const bufferEnd = new Date(bookingEnd.getTime() + (booking.buffer_after_minutes || 0) * 60000)

            if (slotStart < bufferEnd && slotEnd > bufferStart) {
              available = false
              reason = 'booked'
              break
            }
          }
        }

        // Check if slot overlaps with blocked time
        if (available && blockedSlots) {
          for (const blocked of blockedSlots) {
            const blockStart = blocked.start_time
            const blockEnd = blocked.end_time

            if (time >= blockStart && time < blockEnd) {
              available = false
              reason = 'blocked'
              break
            }
          }
        }

        timeSlots.push({ time, available, reason })
      }
    }

    return NextResponse.json({
      success: true,
      date,
      duration: slotDuration,
      timeSlots
    })
  } catch (error) {
    logger.error('Time slots GET error', { error })
    return NextResponse.json({ error: 'Failed to fetch time slots' }, { status: 500 })
  }
}
