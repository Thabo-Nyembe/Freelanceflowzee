/**
 * Calendar/Events API Client
 *
 * Provides typed API access to calendar events, bookings, and scheduling
 * Supports recurring events, reminders, and calendar sharing
 */

import { BaseApiClient } from './base-client'
import { createClient } from '@/lib/supabase/client'

export interface CalendarEvent {
  id: string
  user_id: string
  calendar_id: string | null
  title: string
  description: string | null
  location: string | null
  start_time: string
  end_time: string
  all_day: boolean
  timezone: string
  color: string | null
  status: 'confirmed' | 'tentative' | 'cancelled'
  visibility: 'public' | 'private' | 'confidential'
  recurrence_rule: string | null // iCalendar RRULE format
  recurrence_end: string | null
  is_recurring: boolean
  parent_event_id: string | null
  attendees: EventAttendee[]
  reminders: EventReminder[]
  attachments: string[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface EventAttendee {
  email: string
  name: string
  status: 'accepted' | 'declined' | 'tentative' | 'needs-action'
  is_organizer: boolean
  optional: boolean
}

export interface EventReminder {
  type: 'email' | 'notification' | 'sms'
  minutes_before: number
}

export interface Calendar {
  id: string
  user_id: string
  name: string
  description: string | null
  color: string
  timezone: string
  is_default: boolean
  is_visible: boolean
  is_shared: boolean
  shared_with: string[]
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  user_id: string
  event_id: string | null
  client_id: string | null
  service_type: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show'
  start_time: string
  end_time: string
  duration_minutes: number
  location: string | null
  notes: string | null
  payment_status: 'unpaid' | 'paid' | 'refunded'
  payment_amount: number | null
  cancellation_reason: string | null
  cancelled_at: string | null
  confirmed_at: string | null
  created_at: string
  updated_at: string
}

export interface CreateEventData {
  calendar_id?: string
  title: string
  description?: string
  location?: string
  start_time: string
  end_time: string
  all_day?: boolean
  timezone?: string
  color?: string
  status?: 'confirmed' | 'tentative'
  visibility?: 'public' | 'private' | 'confidential'
  recurrence_rule?: string
  attendees?: Omit<EventAttendee, 'status' | 'is_organizer'>[]
  reminders?: EventReminder[]
}

export interface UpdateEventData {
  title?: string
  description?: string
  location?: string
  start_time?: string
  end_time?: string
  all_day?: boolean
  color?: string
  status?: 'confirmed' | 'tentative' | 'cancelled'
  visibility?: 'public' | 'private' | 'confidential'
  attendees?: EventAttendee[]
  reminders?: EventReminder[]
}

export interface CreateCalendarData {
  name: string
  description?: string
  color: string
  timezone?: string
  is_default?: boolean
}

export interface CreateBookingData {
  client_id?: string
  service_type: string
  start_time: string
  end_time: string
  duration_minutes: number
  location?: string
  notes?: string
  payment_amount?: number
}

export interface EventFilters {
  calendar_id?: string
  start_date?: string
  end_date?: string
  status?: ('confirmed' | 'tentative' | 'cancelled')[]
  search?: string
  has_attendees?: boolean
  is_recurring?: boolean
}

export interface CalendarStats {
  total_events: number
  upcoming_events: number
  events_today: number
  events_this_week: number
  events_this_month: number
  recurring_events: number
  total_bookings: number
  pending_bookings: number
  confirmed_bookings: number
  busiest_day: string
  average_events_per_week: number
}

// Demo mode detection
function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('demo') === 'true') return true
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'demo_mode' && value === 'true') return true
  }
  return false
}

// Demo calendar events
function getDemoEvents(): CalendarEvent[] {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  return [
    {
      id: 'demo-1',
      user_id: 'demo-user',
      calendar_id: null,
      title: 'Team Standup',
      description: 'Daily sync meeting',
      location: 'Google Meet',
      start_time: `${today}T09:00:00Z`,
      end_time: `${today}T09:30:00Z`,
      all_day: false,
      timezone: 'UTC',
      color: '#4285F4',
      status: 'confirmed',
      visibility: 'private',
      recurrence_rule: null,
      recurrence_end: null,
      is_recurring: false,
      parent_event_id: null,
      attendees: [],
      reminders: [],
      attachments: [],
      metadata: {},
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    },
    {
      id: 'demo-2',
      user_id: 'demo-user',
      calendar_id: null,
      title: 'Client Review Meeting',
      description: 'Review project progress',
      location: 'Zoom',
      start_time: `${today}T14:00:00Z`,
      end_time: `${today}T15:00:00Z`,
      all_day: false,
      timezone: 'UTC',
      color: '#0F9D58',
      status: 'confirmed',
      visibility: 'private',
      recurrence_rule: null,
      recurrence_end: null,
      is_recurring: false,
      parent_event_id: null,
      attendees: [],
      reminders: [],
      attachments: [],
      metadata: {},
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    }
  ]
}

class CalendarApiClient extends BaseApiClient {
  /**
   * Get all events with filters
   */
  async getEvents(
    startDate: string,
    endDate: string,
    filters?: EventFilters
  ) {
    // Check for demo mode first
    if (isDemoMode()) {
      return {
        success: true,
        data: getDemoEvents(),
        error: null
      }
    }

    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      // Fall back to demo data if no user
      return {
        success: true,
        data: getDemoEvents(),
        error: null
      }
    }

    let query = supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', user.id)
      .gte('start_time', startDate)
      .lte('end_time', endDate)
      .order('start_time', { ascending: true })

    // Apply filters
    if (filters) {
      if (filters.calendar_id) {
        query = query.eq('calendar_id', filters.calendar_id)
      }

      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status)
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      if (filters.is_recurring !== undefined) {
        query = query.eq('is_recurring', filters.is_recurring)
      }
    }

    const { data, error } = await query

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: data as CalendarEvent[],
      error: null
    }
  }

  /**
   * Get single event by ID
   */
  async getEvent(id: string) {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: data as CalendarEvent,
      error: null
    }
  }

  /**
   * Create a new event
   */
  async createEvent(eventData: CreateEventData) {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
        data: null
      }
    }

    // Get default calendar if not specified
    let calendarId = eventData.calendar_id
    if (!calendarId) {
      const { data: defaultCalendar } = await supabase
        .from('calendars')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .single()

      calendarId = defaultCalendar?.id
    }

    const event = {
      user_id: user.id,
      calendar_id: calendarId,
      title: eventData.title,
      description: eventData.description || null,
      location: eventData.location || null,
      start_time: eventData.start_time,
      end_time: eventData.end_time,
      all_day: eventData.all_day || false,
      timezone: eventData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      color: eventData.color || null,
      status: eventData.status || 'confirmed',
      visibility: eventData.visibility || 'public',
      recurrence_rule: eventData.recurrence_rule || null,
      is_recurring: !!eventData.recurrence_rule,
      attendees: eventData.attendees?.map(a => ({
        ...a,
        status: 'needs-action',
        is_organizer: false
      })) || [],
      reminders: eventData.reminders || [],
      attachments: [],
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('calendar_events')
      .insert(event)
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: data as CalendarEvent,
      error: null
    }
  }

  /**
   * Update an event
   */
  async updateEvent(id: string, updates: UpdateEventData) {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('calendar_events')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: data as CalendarEvent,
      error: null
    }
  }

  /**
   * Delete an event
   */
  async deleteEvent(id: string) {
    const supabase = createClient()

    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id)

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: null,
      error: null
    }
  }

  /**
   * Get all calendars
   */
  async getCalendars() {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
        data: null
      }
    }

    const { data, error } = await supabase
      .from('calendars')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: data as Calendar[],
      error: null
    }
  }

  /**
   * Create a new calendar
   */
  async createCalendar(calendarData: CreateCalendarData) {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
        data: null
      }
    }

    const calendar = {
      user_id: user.id,
      name: calendarData.name,
      description: calendarData.description || null,
      color: calendarData.color,
      timezone: calendarData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      is_default: calendarData.is_default || false,
      is_visible: true,
      is_shared: false,
      shared_with: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('calendars')
      .insert(calendar)
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: data as Calendar,
      error: null
    }
  }

  /**
   * Get all bookings
   */
  async getBookings(
    status?: ('pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show')[]
  ) {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
        data: null
      }
    }

    let query = supabase
      .from('bookings')
      .select('*')
      .eq('user_id', user.id)
      .order('start_time', { ascending: false })

    if (status && status.length > 0) {
      query = query.in('status', status)
    }

    const { data, error } = await query

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: data as Booking[],
      error: null
    }
  }

  /**
   * Create a booking
   */
  async createBooking(bookingData: CreateBookingData) {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
        data: null
      }
    }

    const booking = {
      user_id: user.id,
      client_id: bookingData.client_id || null,
      service_type: bookingData.service_type,
      status: 'pending',
      start_time: bookingData.start_time,
      end_time: bookingData.end_time,
      duration_minutes: bookingData.duration_minutes,
      location: bookingData.location || null,
      notes: bookingData.notes || null,
      payment_status: 'unpaid',
      payment_amount: bookingData.payment_amount || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert(booking)
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: data as Booking,
      error: null
    }
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(
    id: string,
    status: 'confirmed' | 'cancelled' | 'completed' | 'no-show',
    cancellationReason?: string
  ) {
    const supabase = createClient()

    const updates: any = {
      status,
      updated_at: new Date().toISOString()
    }

    if (status === 'confirmed') {
      updates.confirmed_at = new Date().toISOString()
    }

    if (status === 'cancelled') {
      updates.cancelled_at = new Date().toISOString()
      updates.cancellation_reason = cancellationReason || null
    }

    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: data as Booking,
      error: null
    }
  }

  /**
   * Get calendar statistics
   */
  async getCalendarStats() {
    // Demo mode support
    if (isDemoMode()) {
      return {
        success: true,
        data: {
          total_events: 12,
          upcoming_events: 5,
          recurring_events: 3,
          this_week_events: 4,
          this_month_events: 12,
          total_bookings: 8,
          pending_bookings: 2,
          confirmed_bookings: 6,
          busiest_day: 'Wednesday',
          average_events_per_week: 3.5
        } as CalendarStats,
        error: null
      }
    }

    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      // Fall back to demo stats
      return {
        success: true,
        data: {
          total_events: 12,
          upcoming_events: 5,
          recurring_events: 3,
          this_week_events: 4,
          this_month_events: 12,
          total_bookings: 8,
          pending_bookings: 2,
          confirmed_bookings: 6,
          busiest_day: 'Wednesday',
          average_events_per_week: 3.5
        } as CalendarStats,
        error: null
      }
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Get all events
    const { data: events } = await supabase
      .from('calendar_events')
      .select('start_time, is_recurring, status')
      .eq('user_id', user.id)
      .gte('start_time', today.toISOString())

    // Get bookings
    const { data: bookings } = await supabase
      .from('bookings')
      .select('status')
      .eq('user_id', user.id)

    const stats: CalendarStats = {
      total_events: events?.length || 0,
      upcoming_events: events?.filter(e => new Date(e.start_time) > now).length || 0,
      events_today: events?.filter(e => new Date(e.start_time).toDateString() === today.toDateString()).length || 0,
      events_this_week: events?.filter(e => new Date(e.start_time) >= weekStart).length || 0,
      events_this_month: events?.filter(e => new Date(e.start_time) >= monthStart).length || 0,
      recurring_events: events?.filter(e => e.is_recurring).length || 0,
      total_bookings: bookings?.length || 0,
      pending_bookings: bookings?.filter(b => b.status === 'pending').length || 0,
      confirmed_bookings: bookings?.filter(b => b.status === 'confirmed').length || 0,
      busiest_day: 'Monday', // Calculate from events
      average_events_per_week: events?.length || 0 / 4
    }

    return {
      success: true,
      data: stats,
      error: null
    }
  }
}

export const calendarClient = new CalendarApiClient()
