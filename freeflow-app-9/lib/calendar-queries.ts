/**
 * Calendar Database Queries
 *
 * Handles all calendar-related database operations including:
 * - Event CRUD operations
 * - Recurring events management
 * - Calendar analytics and insights
 * - Sharing and permissions
 * - Timezone handling
 *
 * @module calendar-queries
 */

import { createClient } from '@/lib/supabase/client'
import { DatabaseError, toDbError } from '@/lib/types/database'

// ============================================================================
// TYPES
// ============================================================================

export interface CalendarEvent {
  id: string
  user_id: string
  title: string
  description?: string
  date: string
  time: string
  duration: string
  type: 'meeting' | 'review' | 'deadline' | 'presentation' | 'other'
  location: string
  attendees: number
  color: string
  reminder: number
  is_recurring: boolean
  recurrence_pattern?: string
  created_at: string
  updated_at: string
}

export interface CalendarStats {
  total_events: number
  total_meetings: number
  total_hours: number
  avg_attendees: number
  most_common_location: string
  productivity_index: number
}

// ============================================================================
// GET CALENDAR EVENTS
// ============================================================================

export async function getCalendarEvents(
  userId: string,
  options?: {
    startDate?: string
    endDate?: string
    type?: string
  }
) {
  try {
    const supabase = createClient()

    let query = supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true })

    if (options?.startDate) {
      query = query.gte('date', options.startDate)
    }

    if (options?.endDate) {
      query = query.lte('date', options.endDate)
    }

    if (options?.type) {
      query = query.eq('type', options.type)
    }

    const { data, error } = await query

    if (error) throw error

    return { data: data as CalendarEvent[], error: null as DatabaseError | null }
  } catch (error: unknown) {
    return { data: null, error: toDbError(error) }
  }
}

// ============================================================================
// CREATE CALENDAR EVENT
// ============================================================================

export async function createCalendarEvent(
  userId: string,
  eventData: {
    title: string
    description?: string
    date: string
    time: string
    duration?: string
    type?: string
    location?: string
    attendees?: number
    color?: string
    reminder?: number
  }
) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        user_id: userId,
        title: eventData.title,
        description: eventData.description || '',
        date: eventData.date,
        time: eventData.time,
        duration: eventData.duration || '1 hour',
        type: eventData.type || 'meeting',
        location: eventData.location || 'To be determined',
        attendees: eventData.attendees || 1,
        color: eventData.color || 'blue',
        reminder: eventData.reminder || 15,
        is_recurring: false
      })
      .select()
      .single()

    if (error) throw error

    return { data: data as CalendarEvent, error: null as DatabaseError | null }
  } catch (error: unknown) {
    return { data: null, error: toDbError(error) }
  }
}

// ============================================================================
// UPDATE CALENDAR EVENT
// ============================================================================

export async function updateCalendarEvent(
  userId: string,
  eventId: string,
  updates: Partial<CalendarEvent>
) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('calendar_events')
      .update(updates)
      .eq('id', eventId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error

    return { data: data as CalendarEvent, error: null as DatabaseError | null }
  } catch (error: unknown) {
    return { data: null, error: toDbError(error) }
  }
}

// ============================================================================
// DELETE CALENDAR EVENT
// ============================================================================

export async function deleteCalendarEvent(
  userId: string,
  eventId: string
) {
  try {
    const supabase = createClient()

    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', eventId)
      .eq('user_id', userId)

    if (error) throw error

    return { success: true, error: null as DatabaseError | null }
  } catch (error: unknown) {
    return { success: false, error: toDbError(error) }
  }
}

// ============================================================================
// CREATE RECURRING EVENTS
// ============================================================================

export async function createRecurringEvents(
  userId: string,
  eventData: {
    title: string
    frequency: string
    occurrences: number
    baseDate: string
    time: string
    duration?: string
    type?: string
    location?: string
  }
) {
  try {
    const supabase = createClient()

    const events = []
    const baseDate = new Date(eventData.baseDate)

    for (let i = 0; i < eventData.occurrences; i++) {
      const eventDate = new Date(baseDate)

      if (eventData.frequency.toLowerCase() === 'daily') {
        eventDate.setDate(baseDate.getDate() + i)
      } else if (eventData.frequency.toLowerCase() === 'weekly') {
        eventDate.setDate(baseDate.getDate() + (i * 7))
      } else if (eventData.frequency.toLowerCase() === 'monthly') {
        eventDate.setMonth(baseDate.getMonth() + i)
      }

      events.push({
        user_id: userId,
        title: `${eventData.title} (${i + 1}/${eventData.occurrences})`,
        description: `Recurring ${eventData.frequency} event`,
        date: eventDate.toISOString().split('T')[0],
        time: eventData.time,
        duration: eventData.duration || '1 hour',
        type: eventData.type || 'meeting',
        location: eventData.location || 'To be determined',
        attendees: 1,
        color: 'purple',
        reminder: 15,
        is_recurring: true,
        recurrence_pattern: eventData.frequency
      })
    }

    const { data, error } = await supabase
      .from('calendar_events')
      .insert(events)
      .select()

    if (error) throw error

    return { data: data as CalendarEvent[], error: null as DatabaseError | null }
  } catch (error: unknown) {
    return { data: null, error: toDbError(error) }
  }
}

// ============================================================================
// GET CALENDAR STATISTICS
// ============================================================================

export async function getCalendarStatistics(
  userId: string,
  options?: {
    startDate?: string
    endDate?: string
  }
) {
  try {
    const { data: events, error } = await getCalendarEvents(userId, options)

    if (error) throw error

    if (!events || events.length === 0) {
      return {
        data: {
          total_events: 0,
          total_meetings: 0,
          total_hours: 0,
          avg_attendees: 0,
          most_common_location: 'N/A',
          productivity_index: 0
        } as CalendarStats,
        error: null as DatabaseError | null
      }
    }

    const totalMeetings = events.filter(e => e.type === 'meeting').length

    // Calculate total hours
    const totalMinutes = events.reduce((sum, e) => {
      const duration = e.duration.toLowerCase()
      if (duration.includes('hour')) {
        const hours = parseInt(duration) || 1
        return sum + (hours * 60)
      }
      return sum + 60 // default 1 hour
    }, 0)
    const totalHours = Math.round(totalMinutes / 60 * 10) / 10

    // Average attendees
    const avgAttendees = events.length > 0
      ? Math.round(events.reduce((sum, e) => sum + e.attendees, 0) / events.length * 10) / 10
      : 0

    // Most common location
    const locationCounts: Record<string, number> = {}
    events.forEach(e => {
      locationCounts[e.location] = (locationCounts[e.location] || 0) + 1
    })
    const mostCommonLocation = Object.entries(locationCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'

    // Productivity index (simple calculation)
    const productivityIndex = Math.min(100, Math.round((totalMeetings / events.length) * 100))

    return {
      data: {
        total_events: events.length,
        total_meetings: totalMeetings,
        total_hours: totalHours,
        avg_attendees: avgAttendees,
        most_common_location: mostCommonLocation,
        productivity_index: productivityIndex
      } as CalendarStats,
      error: null as DatabaseError | null
    }
  } catch (error: unknown) {
    return { data: null, error: toDbError(error) }
  }
}

// ============================================================================
// SEARCH EVENTS
// ============================================================================

export async function searchCalendarEvents(
  userId: string,
  searchTerm: string
) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`)
      .order('date', { ascending: true })

    if (error) throw error

    return { data: data as CalendarEvent[], error: null as DatabaseError | null }
  } catch (error: unknown) {
    return { data: null, error: toDbError(error) }
  }
}
