/**
 * KAZI Calendar & Scheduling System - Database Queries
 * World-class backend infrastructure for calendar and booking management
 */

import { supabase } from './supabase'
import { addDays, addWeeks, addMonths, startOfDay, endOfDay, format, parseISO } from 'date-fns'
import { formatInTimeZone, toZonedTime } from 'date-fns-tz'

// =====================================================
// TYPES
// =====================================================

export interface CalendarEvent {
  id: string
  user_id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  all_day: boolean
  location?: string
  location_type: 'in_person' | 'video_call' | 'phone' | 'other'
  video_url?: string
  color?: string
  status: 'confirmed' | 'tentative' | 'cancelled'
  visibility: 'public' | 'private' | 'busy'
  recurrence_rule?: string
  recurrence_end?: string
  parent_event_id?: string
  client_id?: string
  project_id?: string
  booking_id?: string
  attendees: EventAttendee[]
  reminders: EventReminder[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface EventAttendee {
  email: string
  name?: string
  status: 'pending' | 'accepted' | 'declined' | 'tentative'
  is_organizer: boolean
}

export interface EventReminder {
  type: 'email' | 'push' | 'sms'
  minutes_before: number
  sent: boolean
}

export interface AvailabilitySchedule {
  id: string
  user_id: string
  name: string
  is_default: boolean
  timezone: string
  schedule: WeeklySchedule
  date_overrides: DateOverride[]
  created_at: string
  updated_at: string
}

export interface WeeklySchedule {
  monday: TimeSlot[]
  tuesday: TimeSlot[]
  wednesday: TimeSlot[]
  thursday: TimeSlot[]
  friday: TimeSlot[]
  saturday: TimeSlot[]
  sunday: TimeSlot[]
}

export interface TimeSlot {
  start: string // HH:mm format
  end: string   // HH:mm format
}

export interface DateOverride {
  date: string  // YYYY-MM-DD format
  available: boolean
  slots?: TimeSlot[]
  reason?: string
}

export interface BookingType {
  id: string
  user_id: string
  name: string
  slug: string
  description?: string
  duration_minutes: number
  buffer_before: number
  buffer_after: number
  color?: string
  price?: number
  currency: string
  location_type: 'in_person' | 'video_call' | 'phone' | 'custom'
  location_details?: string
  custom_questions: CustomQuestion[]
  confirmation_message?: string
  cancellation_policy?: string
  requires_approval: boolean
  max_bookings_per_day?: number
  min_notice_hours: number
  max_advance_days: number
  is_active: boolean
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface CustomQuestion {
  id: string
  question: string
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio'
  options?: string[]
  required: boolean
}

export interface Booking {
  id: string
  booking_type_id: string
  user_id: string
  client_name: string
  client_email: string
  client_phone?: string
  start_time: string
  end_time: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  location?: string
  video_url?: string
  answers: Record<string, any>
  notes?: string
  internal_notes?: string
  payment_status?: 'pending' | 'paid' | 'refunded'
  payment_amount?: number
  cancelled_by?: string
  cancellation_reason?: string
  cancelled_at?: string
  reminder_sent_at?: string
  confirmation_sent_at?: string
  created_at: string
  updated_at: string
  // Joined data
  booking_type?: BookingType
}

export interface CalendarSync {
  id: string
  user_id: string
  provider: 'google' | 'outlook' | 'apple' | 'caldav'
  calendar_id: string
  calendar_name?: string
  sync_direction: 'import' | 'export' | 'both'
  is_active: boolean
  last_synced_at?: string
  sync_token?: string
  credentials: Record<string, any>
  created_at: string
  updated_at: string
}

// =====================================================
// CALENDAR EVENT OPERATIONS
// =====================================================

export async function getCalendarEvents(
  userId: string,
  options: {
    startDate: Date
    endDate: Date
    status?: string
    clientId?: string
    projectId?: string
  }
): Promise<CalendarEvent[]> {
  try {
    let query = supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', options.startDate.toISOString())
      .lte('start_time', options.endDate.toISOString())
      .order('start_time', { ascending: true })

    if (options.status) {
      query = query.eq('status', options.status)
    } else {
      query = query.neq('status', 'cancelled')
    }

    if (options.clientId) {
      query = query.eq('client_id', options.clientId)
    }

    if (options.projectId) {
      query = query.eq('project_id', options.projectId)
    }

    const { data, error } = await query

    if (error) throw error

    // Expand recurring events
    const allEvents = [...(data || [])]
    for (const event of data || []) {
      if (event.recurrence_rule) {
        const recurringInstances = expandRecurringEvent(event, options.startDate, options.endDate)
        allEvents.push(...recurringInstances)
      }
    }

    return allEvents
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return []
  }
}

export async function getCalendarEventById(eventId: string): Promise<CalendarEvent | null> {
  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching calendar event:', error)
    return null
  }
}

export async function createCalendarEvent(event: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        user_id: event.user_id,
        title: event.title,
        description: event.description,
        start_time: event.start_time,
        end_time: event.end_time,
        all_day: event.all_day || false,
        location: event.location,
        location_type: event.location_type || 'other',
        video_url: event.video_url,
        color: event.color,
        status: event.status || 'confirmed',
        visibility: event.visibility || 'private',
        recurrence_rule: event.recurrence_rule,
        recurrence_end: event.recurrence_end,
        parent_event_id: event.parent_event_id,
        client_id: event.client_id,
        project_id: event.project_id,
        booking_id: event.booking_id,
        attendees: event.attendees || [],
        reminders: event.reminders || [
          { type: 'email', minutes_before: 60, sent: false },
          { type: 'push', minutes_before: 15, sent: false }
        ],
        metadata: event.metadata || {}
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating calendar event:', error)
    return null
  }
}

export async function updateCalendarEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', eventId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating calendar event:', error)
    return null
  }
}

export async function deleteCalendarEvent(eventId: string, deleteRecurring: boolean = false): Promise<boolean> {
  try {
    if (deleteRecurring) {
      // Delete all instances of recurring event
      const { data: event } = await supabase
        .from('calendar_events')
        .select('parent_event_id')
        .eq('id', eventId)
        .single()

      const parentId = event?.parent_event_id || eventId

      await supabase
        .from('calendar_events')
        .delete()
        .or(`id.eq.${parentId},parent_event_id.eq.${parentId}`)
    } else {
      await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId)
    }

    return true
  } catch (error) {
    console.error('Error deleting calendar event:', error)
    return false
  }
}

export async function cancelCalendarEvent(eventId: string, reason?: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('calendar_events')
      .update({
        status: 'cancelled',
        metadata: { cancellation_reason: reason },
        updated_at: new Date().toISOString()
      })
      .eq('id', eventId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error cancelling calendar event:', error)
    return false
  }
}

export async function updateAttendeeStatus(
  eventId: string,
  email: string,
  status: EventAttendee['status']
): Promise<boolean> {
  try {
    const { data: event } = await supabase
      .from('calendar_events')
      .select('attendees')
      .eq('id', eventId)
      .single()

    if (!event) return false

    const attendees = event.attendees.map((a: EventAttendee) =>
      a.email === email ? { ...a, status } : a
    )

    const { error } = await supabase
      .from('calendar_events')
      .update({ attendees, updated_at: new Date().toISOString() })
      .eq('id', eventId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error updating attendee status:', error)
    return false
  }
}

// =====================================================
// AVAILABILITY OPERATIONS
// =====================================================

export async function getAvailabilitySchedules(userId: string): Promise<AvailabilitySchedule[]> {
  try {
    const { data, error } = await supabase
      .from('availability_schedules')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching availability schedules:', error)
    return []
  }
}

export async function getDefaultAvailability(userId: string): Promise<AvailabilitySchedule | null> {
  try {
    const { data, error } = await supabase
      .from('availability_schedules')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching default availability:', error)
    return null
  }
}

export async function createAvailabilitySchedule(schedule: Partial<AvailabilitySchedule>): Promise<AvailabilitySchedule | null> {
  try {
    // If this is set as default, unset other defaults
    if (schedule.is_default) {
      await supabase
        .from('availability_schedules')
        .update({ is_default: false })
        .eq('user_id', schedule.user_id)
    }

    const { data, error } = await supabase
      .from('availability_schedules')
      .insert({
        user_id: schedule.user_id,
        name: schedule.name,
        is_default: schedule.is_default || false,
        timezone: schedule.timezone || 'UTC',
        schedule: schedule.schedule || getDefaultWeeklySchedule(),
        date_overrides: schedule.date_overrides || []
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating availability schedule:', error)
    return null
  }
}

export async function updateAvailabilitySchedule(
  scheduleId: string,
  updates: Partial<AvailabilitySchedule>
): Promise<AvailabilitySchedule | null> {
  try {
    // If setting as default, unset other defaults
    if (updates.is_default) {
      const { data: current } = await supabase
        .from('availability_schedules')
        .select('user_id')
        .eq('id', scheduleId)
        .single()

      if (current) {
        await supabase
          .from('availability_schedules')
          .update({ is_default: false })
          .eq('user_id', current.user_id)
          .neq('id', scheduleId)
      }
    }

    const { data, error } = await supabase
      .from('availability_schedules')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', scheduleId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating availability schedule:', error)
    return null
  }
}

export async function deleteAvailabilitySchedule(scheduleId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('availability_schedules')
      .delete()
      .eq('id', scheduleId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting availability schedule:', error)
    return false
  }
}

export async function addDateOverride(
  scheduleId: string,
  override: DateOverride
): Promise<boolean> {
  try {
    const { data: schedule } = await supabase
      .from('availability_schedules')
      .select('date_overrides')
      .eq('id', scheduleId)
      .single()

    if (!schedule) return false

    const overrides = [...(schedule.date_overrides || [])].filter(
      o => o.date !== override.date
    )
    overrides.push(override)

    const { error } = await supabase
      .from('availability_schedules')
      .update({
        date_overrides: overrides,
        updated_at: new Date().toISOString()
      })
      .eq('id', scheduleId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error adding date override:', error)
    return false
  }
}

export async function getAvailableSlots(
  userId: string,
  bookingTypeId: string,
  date: Date,
  timezone: string = 'UTC'
): Promise<TimeSlot[]> {
  try {
    // Get booking type
    const { data: bookingType } = await supabase
      .from('booking_types')
      .select('*')
      .eq('id', bookingTypeId)
      .single()

    if (!bookingType) return []

    // Get availability schedule
    const schedule = await getDefaultAvailability(userId)
    if (!schedule) return []

    const dayOfWeek = format(date, 'EEEE').toLowerCase() as keyof WeeklySchedule
    let daySlots = schedule.schedule[dayOfWeek] || []

    // Check for date override
    const dateStr = format(date, 'yyyy-MM-dd')
    const override = schedule.date_overrides.find(o => o.date === dateStr)
    if (override) {
      if (!override.available) return []
      if (override.slots) daySlots = override.slots
    }

    // Get existing bookings for the day
    const dayStart = startOfDay(date)
    const dayEnd = endOfDay(date)

    const { data: existingEvents } = await supabase
      .from('calendar_events')
      .select('start_time, end_time')
      .eq('user_id', userId)
      .eq('status', 'confirmed')
      .gte('start_time', dayStart.toISOString())
      .lte('start_time', dayEnd.toISOString())

    const { data: existingBookings } = await supabase
      .from('bookings')
      .select('start_time, end_time')
      .eq('user_id', userId)
      .in('status', ['pending', 'confirmed'])
      .gte('start_time', dayStart.toISOString())
      .lte('start_time', dayEnd.toISOString())

    const busySlots = [
      ...(existingEvents || []),
      ...(existingBookings || [])
    ]

    // Generate available time slots
    const availableSlots: TimeSlot[] = []
    const duration = bookingType.duration_minutes
    const bufferBefore = bookingType.buffer_before || 0
    const bufferAfter = bookingType.buffer_after || 0
    const totalDuration = duration + bufferBefore + bufferAfter

    for (const slot of daySlots) {
      const [startHour, startMin] = slot.start.split(':').map(Number)
      const [endHour, endMin] = slot.end.split(':').map(Number)

      let currentTime = new Date(date)
      currentTime.setHours(startHour, startMin, 0, 0)

      const slotEnd = new Date(date)
      slotEnd.setHours(endHour, endMin, 0, 0)

      while (currentTime.getTime() + totalDuration * 60000 <= slotEnd.getTime()) {
        const appointmentStart = new Date(currentTime.getTime() + bufferBefore * 60000)
        const appointmentEnd = new Date(appointmentStart.getTime() + duration * 60000)

        // Check if slot conflicts with existing bookings
        const hasConflict = busySlots.some(busy => {
          const busyStart = new Date(busy.start_time)
          const busyEnd = new Date(busy.end_time)
          return (
            (appointmentStart >= busyStart && appointmentStart < busyEnd) ||
            (appointmentEnd > busyStart && appointmentEnd <= busyEnd) ||
            (appointmentStart <= busyStart && appointmentEnd >= busyEnd)
          )
        })

        if (!hasConflict) {
          // Check min notice
          const now = new Date()
          const minNotice = bookingType.min_notice_hours * 60 * 60 * 1000
          if (appointmentStart.getTime() - now.getTime() >= minNotice) {
            availableSlots.push({
              start: format(appointmentStart, 'HH:mm'),
              end: format(appointmentEnd, 'HH:mm')
            })
          }
        }

        currentTime = new Date(currentTime.getTime() + 30 * 60000) // Move by 30 min intervals
      }
    }

    return availableSlots
  } catch (error) {
    console.error('Error getting available slots:', error)
    return []
  }
}

// =====================================================
// BOOKING TYPE OPERATIONS
// =====================================================

export async function getBookingTypes(userId: string, publicOnly: boolean = false): Promise<BookingType[]> {
  try {
    let query = supabase
      .from('booking_types')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true })

    if (publicOnly) {
      query = query.eq('is_active', true).eq('is_public', true)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching booking types:', error)
    return []
  }
}

export async function getBookingTypeById(bookingTypeId: string): Promise<BookingType | null> {
  try {
    const { data, error } = await supabase
      .from('booking_types')
      .select('*')
      .eq('id', bookingTypeId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching booking type:', error)
    return null
  }
}

export async function getBookingTypeBySlug(userId: string, slug: string): Promise<BookingType | null> {
  try {
    const { data, error } = await supabase
      .from('booking_types')
      .select('*')
      .eq('user_id', userId)
      .eq('slug', slug)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching booking type by slug:', error)
    return null
  }
}

export async function createBookingType(bookingType: Partial<BookingType>): Promise<BookingType | null> {
  try {
    const slug = generateSlug(bookingType.name || 'meeting')

    const { data, error } = await supabase
      .from('booking_types')
      .insert({
        user_id: bookingType.user_id,
        name: bookingType.name,
        slug,
        description: bookingType.description,
        duration_minutes: bookingType.duration_minutes || 30,
        buffer_before: bookingType.buffer_before || 0,
        buffer_after: bookingType.buffer_after || 0,
        color: bookingType.color,
        price: bookingType.price,
        currency: bookingType.currency || 'USD',
        location_type: bookingType.location_type || 'video_call',
        location_details: bookingType.location_details,
        custom_questions: bookingType.custom_questions || [],
        confirmation_message: bookingType.confirmation_message,
        cancellation_policy: bookingType.cancellation_policy,
        requires_approval: bookingType.requires_approval || false,
        max_bookings_per_day: bookingType.max_bookings_per_day,
        min_notice_hours: bookingType.min_notice_hours || 24,
        max_advance_days: bookingType.max_advance_days || 60,
        is_active: bookingType.is_active !== false,
        is_public: bookingType.is_public !== false
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating booking type:', error)
    return null
  }
}

export async function updateBookingType(bookingTypeId: string, updates: Partial<BookingType>): Promise<BookingType | null> {
  try {
    const { data, error } = await supabase
      .from('booking_types')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingTypeId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating booking type:', error)
    return null
  }
}

export async function deleteBookingType(bookingTypeId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('booking_types')
      .delete()
      .eq('id', bookingTypeId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting booking type:', error)
    return false
  }
}

// =====================================================
// BOOKING OPERATIONS
// =====================================================

export async function getBookings(
  userId: string,
  options: {
    status?: string | string[]
    startDate?: Date
    endDate?: Date
    clientEmail?: string
    bookingTypeId?: string
    limit?: number
    offset?: number
  } = {}
): Promise<{ bookings: Booking[]; total: number }> {
  try {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        booking_type:booking_type_id (*)
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('start_time', { ascending: true })

    if (options.status) {
      if (Array.isArray(options.status)) {
        query = query.in('status', options.status)
      } else {
        query = query.eq('status', options.status)
      }
    }

    if (options.startDate) {
      query = query.gte('start_time', options.startDate.toISOString())
    }

    if (options.endDate) {
      query = query.lte('start_time', options.endDate.toISOString())
    }

    if (options.clientEmail) {
      query = query.eq('client_email', options.clientEmail)
    }

    if (options.bookingTypeId) {
      query = query.eq('booking_type_id', options.bookingTypeId)
    }

    if (options.limit) {
      query = query.limit(options.limit)
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 50) - 1)
    }

    const { data, error, count } = await query

    if (error) throw error
    return { bookings: data || [], total: count || 0 }
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return { bookings: [], total: 0 }
  }
}

export async function getBookingById(bookingId: string): Promise<Booking | null> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        booking_type:booking_type_id (*)
      `)
      .eq('id', bookingId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching booking:', error)
    return null
  }
}

export async function createBooking(booking: Partial<Booking>): Promise<Booking | null> {
  try {
    const bookingType = await getBookingTypeById(booking.booking_type_id!)
    if (!bookingType) return null

    // Check for conflicts
    const hasConflict = await checkBookingConflict(
      bookingType.user_id,
      new Date(booking.start_time!),
      new Date(booking.end_time!)
    )

    if (hasConflict) {
      throw new Error('Time slot is no longer available')
    }

    // Check max bookings per day
    if (bookingType.max_bookings_per_day) {
      const dayStart = startOfDay(new Date(booking.start_time!))
      const dayEnd = endOfDay(new Date(booking.start_time!))

      const { count } = await supabase
        .from('bookings')
        .select('id', { count: 'exact' })
        .eq('booking_type_id', booking.booking_type_id)
        .in('status', ['pending', 'confirmed'])
        .gte('start_time', dayStart.toISOString())
        .lte('start_time', dayEnd.toISOString())

      if ((count || 0) >= bookingType.max_bookings_per_day) {
        throw new Error('Maximum bookings reached for this day')
      }
    }

    const status = bookingType.requires_approval ? 'pending' : 'confirmed'

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        booking_type_id: booking.booking_type_id,
        user_id: bookingType.user_id,
        client_name: booking.client_name,
        client_email: booking.client_email,
        client_phone: booking.client_phone,
        start_time: booking.start_time,
        end_time: booking.end_time,
        status,
        location: bookingType.location_details,
        video_url: bookingType.location_type === 'video_call' ? generateVideoUrl() : undefined,
        answers: booking.answers || {},
        notes: booking.notes,
        payment_status: bookingType.price ? 'pending' : undefined,
        payment_amount: bookingType.price
      })
      .select(`
        *,
        booking_type:booking_type_id (*)
      `)
      .single()

    if (error) throw error

    // Create calendar event
    if (data) {
      await createCalendarEvent({
        user_id: bookingType.user_id,
        title: `${bookingType.name} with ${booking.client_name}`,
        description: booking.notes,
        start_time: booking.start_time,
        end_time: booking.end_time,
        location: bookingType.location_details,
        location_type: bookingType.location_type,
        video_url: data.video_url,
        booking_id: data.id,
        attendees: [{
          email: booking.client_email!,
          name: booking.client_name,
          status: 'pending',
          is_organizer: false
        }]
      })

      // TODO: Send confirmation email
    }

    return data
  } catch (error) {
    console.error('Error creating booking:', error)
    return null
  }
}

export async function updateBooking(bookingId: string, updates: Partial<Booking>): Promise<Booking | null> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select(`
        *,
        booking_type:booking_type_id (*)
      `)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating booking:', error)
    return null
  }
}

export async function confirmBooking(bookingId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
        confirmation_sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)

    if (error) throw error

    // TODO: Send confirmation email

    return true
  } catch (error) {
    console.error('Error confirming booking:', error)
    return false
  }
}

export async function cancelBooking(
  bookingId: string,
  cancelledBy: string,
  reason?: string
): Promise<boolean> {
  try {
    const { data: booking } = await supabase
      .from('bookings')
      .select('booking_id:id')
      .eq('id', bookingId)
      .single()

    const { error } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancelled_by: cancelledBy,
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)

    if (error) throw error

    // Cancel associated calendar event
    if (booking) {
      await supabase
        .from('calendar_events')
        .update({ status: 'cancelled' })
        .eq('booking_id', bookingId)
    }

    // TODO: Send cancellation email

    return true
  } catch (error) {
    console.error('Error cancelling booking:', error)
    return false
  }
}

export async function rescheduleBooking(
  bookingId: string,
  newStartTime: Date,
  newEndTime: Date
): Promise<Booking | null> {
  try {
    const booking = await getBookingById(bookingId)
    if (!booking) return null

    // Check for conflicts
    const hasConflict = await checkBookingConflict(
      booking.user_id,
      newStartTime,
      newEndTime,
      bookingId
    )

    if (hasConflict) {
      throw new Error('New time slot is not available')
    }

    const { data, error } = await supabase
      .from('bookings')
      .update({
        start_time: newStartTime.toISOString(),
        end_time: newEndTime.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select(`
        *,
        booking_type:booking_type_id (*)
      `)
      .single()

    if (error) throw error

    // Update calendar event
    await supabase
      .from('calendar_events')
      .update({
        start_time: newStartTime.toISOString(),
        end_time: newEndTime.toISOString()
      })
      .eq('booking_id', bookingId)

    // TODO: Send reschedule notification

    return data
  } catch (error) {
    console.error('Error rescheduling booking:', error)
    return null
  }
}

async function checkBookingConflict(
  userId: string,
  startTime: Date,
  endTime: Date,
  excludeBookingId?: string
): Promise<boolean> {
  try {
    let query = supabase
      .from('bookings')
      .select('id')
      .eq('user_id', userId)
      .in('status', ['pending', 'confirmed'])
      .or(`and(start_time.lt.${endTime.toISOString()},end_time.gt.${startTime.toISOString()})`)

    if (excludeBookingId) {
      query = query.neq('id', excludeBookingId)
    }

    const { data } = await query

    return (data?.length || 0) > 0
  } catch (error) {
    console.error('Error checking booking conflict:', error)
    return true // Assume conflict on error for safety
  }
}

// =====================================================
// CALENDAR SYNC OPERATIONS
// =====================================================

export async function getCalendarSyncs(userId: string): Promise<CalendarSync[]> {
  try {
    const { data, error } = await supabase
      .from('calendar_syncs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching calendar syncs:', error)
    return []
  }
}

export async function createCalendarSync(sync: Partial<CalendarSync>): Promise<CalendarSync | null> {
  try {
    const { data, error } = await supabase
      .from('calendar_syncs')
      .insert({
        user_id: sync.user_id,
        provider: sync.provider,
        calendar_id: sync.calendar_id,
        calendar_name: sync.calendar_name,
        sync_direction: sync.sync_direction || 'both',
        is_active: true,
        credentials: sync.credentials || {}
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating calendar sync:', error)
    return null
  }
}

export async function deleteCalendarSync(syncId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('calendar_syncs')
      .delete()
      .eq('id', syncId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting calendar sync:', error)
    return false
  }
}

// =====================================================
// STATS & ANALYTICS
// =====================================================

export async function getCalendarStats(userId: string): Promise<{
  upcomingEvents: number
  upcomingBookings: number
  pendingBookings: number
  completedBookings: number
  cancelledBookings: number
  totalRevenue: number
}> {
  try {
    const now = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Upcoming events
    const { count: upcomingEvents } = await supabase
      .from('calendar_events')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('status', 'confirmed')
      .gte('start_time', now.toISOString())

    // Upcoming bookings
    const { count: upcomingBookings } = await supabase
      .from('bookings')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('status', 'confirmed')
      .gte('start_time', now.toISOString())

    // Pending bookings
    const { count: pendingBookings } = await supabase
      .from('bookings')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('status', 'pending')

    // Completed bookings (last 30 days)
    const { count: completedBookings } = await supabase
      .from('bookings')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('end_time', thirtyDaysAgo.toISOString())

    // Cancelled bookings (last 30 days)
    const { count: cancelledBookings } = await supabase
      .from('bookings')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('status', 'cancelled')
      .gte('cancelled_at', thirtyDaysAgo.toISOString())

    // Total revenue (last 30 days)
    const { data: paidBookings } = await supabase
      .from('bookings')
      .select('payment_amount')
      .eq('user_id', userId)
      .eq('payment_status', 'paid')
      .gte('created_at', thirtyDaysAgo.toISOString())

    const totalRevenue = paidBookings?.reduce((sum, b) => sum + (b.payment_amount || 0), 0) || 0

    return {
      upcomingEvents: upcomingEvents || 0,
      upcomingBookings: upcomingBookings || 0,
      pendingBookings: pendingBookings || 0,
      completedBookings: completedBookings || 0,
      cancelledBookings: cancelledBookings || 0,
      totalRevenue
    }
  } catch (error) {
    console.error('Error getting calendar stats:', error)
    return {
      upcomingEvents: 0,
      upcomingBookings: 0,
      pendingBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      totalRevenue: 0
    }
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function getDefaultWeeklySchedule(): WeeklySchedule {
  const defaultSlots = [{ start: '09:00', end: '17:00' }]
  return {
    monday: defaultSlots,
    tuesday: defaultSlots,
    wednesday: defaultSlots,
    thursday: defaultSlots,
    friday: defaultSlots,
    saturday: [],
    sunday: []
  }
}

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  const random = Math.random().toString(36).substring(2, 6)
  return `${base}-${random}`
}

function generateVideoUrl(): string {
  // In production, integrate with actual video service (Zoom, Google Meet, etc.)
  const meetingId = Math.random().toString(36).substring(2, 12)
  return `https://meet.kazi.app/${meetingId}`
}

function expandRecurringEvent(
  event: CalendarEvent,
  startDate: Date,
  endDate: Date
): CalendarEvent[] {
  const instances: CalendarEvent[] = []

  if (!event.recurrence_rule) return instances

  // Parse recurrence rule (simplified RRULE support)
  const rule = parseRecurrenceRule(event.recurrence_rule)
  if (!rule) return instances

  let currentDate = new Date(event.start_time)
  const eventDuration = new Date(event.end_time).getTime() - new Date(event.start_time).getTime()
  const maxDate = event.recurrence_end ? new Date(event.recurrence_end) : endDate

  while (currentDate <= endDate && currentDate <= maxDate) {
    if (currentDate >= startDate && currentDate.toISOString() !== event.start_time) {
      instances.push({
        ...event,
        id: `${event.id}_${currentDate.toISOString()}`,
        start_time: currentDate.toISOString(),
        end_time: new Date(currentDate.getTime() + eventDuration).toISOString(),
        parent_event_id: event.id
      })
    }

    // Advance to next occurrence
    switch (rule.frequency) {
      case 'DAILY':
        currentDate = addDays(currentDate, rule.interval || 1)
        break
      case 'WEEKLY':
        currentDate = addWeeks(currentDate, rule.interval || 1)
        break
      case 'MONTHLY':
        currentDate = addMonths(currentDate, rule.interval || 1)
        break
      default:
        return instances
    }
  }

  return instances
}

function parseRecurrenceRule(rule: string): { frequency: string; interval?: number } | null {
  try {
    const parts = rule.split(';')
    const result: { frequency: string; interval?: number } = { frequency: 'DAILY' }

    for (const part of parts) {
      const [key, value] = part.split('=')
      if (key === 'FREQ') result.frequency = value
      if (key === 'INTERVAL') result.interval = parseInt(value)
    }

    return result
  } catch {
    return null
  }
}
