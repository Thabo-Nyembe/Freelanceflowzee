'use client'

import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'
import { useCallback, useState } from 'react'
import type { JsonValue } from '@/lib/types/database'

export type EventType = 'meeting' | 'appointment' | 'task' | 'reminder' | 'deadline' | 'milestone' | 'holiday' | 'birthday' | 'custom'
export type EventStatus = 'tentative' | 'confirmed' | 'cancelled' | 'rescheduled' | 'completed'
export type LocationType = 'in_person' | 'virtual' | 'hybrid' | 'tbd'

/** Attendee information for calendar events */
export interface CalendarAttendee {
  id?: string
  email: string
  name?: string
  status?: 'pending' | 'accepted' | 'declined' | 'tentative'
  required?: boolean
}

/** Reminder configuration for calendar events */
export interface CalendarReminder {
  id?: string
  type: 'email' | 'push' | 'sms'
  minutes_before: number
}

/** Attachment for calendar events */
export interface CalendarAttachment {
  id?: string
  name: string
  url: string
  type?: string
  size?: number
}

export interface CalendarEvent {
  id: string
  user_id: string
  title: string
  description?: string | null
  event_type: EventType
  start_time: string
  end_time: string
  all_day: boolean
  timezone: string
  duration_minutes?: number
  location?: string | null
  location_type?: LocationType
  meeting_url?: string | null
  meeting_id?: string | null
  meeting_password?: string | null
  status: EventStatus
  availability: string
  visibility: string
  is_recurring: boolean
  recurrence_rule?: string | null
  recurrence_frequency?: string | null
  recurrence_end_date?: string | null
  recurrence_count?: number | null
  parent_event_id?: string | null
  organizer_id?: string | null
  attendees: CalendarAttendee[] | null
  required_attendees?: string[]
  optional_attendees?: string[]
  total_attendees: number
  rsvp_required: boolean
  rsvp_deadline?: string | null
  accepted_count: number
  declined_count: number
  tentative_count: number
  calendar_id?: string | null
  calendar_name?: string | null
  color?: string | null
  reminders: CalendarReminder[] | null
  reminder_sent: boolean
  category?: string | null
  priority: string
  tags?: string[]
  attachments: CalendarAttachment[] | null
  resources?: string[]
  agenda?: string | null
  notes?: string | null
  external_id?: string | null
  external_source?: string | null
  external_calendar_id?: string | null
  sync_status?: string | null
  last_synced_at?: string | null
  metadata: Record<string, JsonValue> | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface CreateCalendarEventInput {
  title: string
  start_time: string
  end_time: string
  description?: string | null
  event_type?: EventType
  all_day?: boolean
  timezone?: string
  location?: string | null
  location_type?: LocationType
  meeting_url?: string | null
  status?: EventStatus
  visibility?: string
  color?: string | null
  reminders?: CalendarReminder[]
  attendees?: CalendarAttendee[]
  calendar_id?: string | null
}

export interface UpdateCalendarEventInput {
  id: string
  title?: string
  start_time?: string
  end_time?: string
  description?: string | null
  event_type?: EventType
  all_day?: boolean
  timezone?: string
  location?: string | null
  location_type?: LocationType
  meeting_url?: string | null
  status?: EventStatus
  visibility?: string
  color?: string | null
  reminders?: CalendarReminder[]
  attendees?: CalendarAttendee[]
}

export interface UseCalendarEventsOptions {
  eventType?: EventType | 'all'
  status?: EventStatus | 'all'
  startDate?: string
  endDate?: string
  limit?: number
}

interface CalendarEventFilters {
  status?: EventStatus
}

interface CalendarEventQueryOptions {
  table: string
  filters: CalendarEventFilters
  orderBy: { column: string; ascending: boolean }
  limit: number
  realtime: boolean
  softDelete: boolean
}

export function useCalendarEvents(options: UseCalendarEventsOptions = {}) {
  const { status, limit } = options
  const [mutationLoading, setMutationLoading] = useState(false)
  const [mutationError, setMutationError] = useState<Error | null>(null)

  const filters: CalendarEventFilters = {}
  if (status && status !== 'all') filters.status = status

  const queryOptions: CalendarEventQueryOptions = {
    table: 'calendar_events',
    filters,
    orderBy: { column: 'start_time', ascending: true },
    limit: limit || 50,
    realtime: true,
    softDelete: false
  }

  const { data, loading, error, refetch } = useSupabaseQuery<CalendarEvent>(queryOptions)

  const { create, update, remove } = useSupabaseMutation({
    table: 'calendar_events',
    onSuccess: () => {
      refetch()
    },
    onError: (err) => {
      setMutationError(err)
    }
  })

  // Create a new calendar event
  const createEvent = useCallback(async (input: CreateCalendarEventInput) => {
    setMutationLoading(true)
    setMutationError(null)
    try {
      const eventData = {
        title: input.title,
        start_time: input.start_time,
        end_time: input.end_time,
        description: input.description || null,
        event_type: input.event_type || 'meeting',
        all_day: input.all_day || false,
        timezone: input.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        location: input.location || null,
        location_type: input.location_type || 'tbd',
        meeting_url: input.meeting_url || null,
        status: input.status || 'confirmed',
        visibility: input.visibility || 'private',
        availability: 'busy',
        is_recurring: false,
        total_attendees: 0,
        accepted_count: 0,
        declined_count: 0,
        tentative_count: 0,
        rsvp_required: false,
        reminder_sent: false,
        priority: 'medium',
        color: input.color || '#3B82F6',
        reminders: input.reminders || [],
        attendees: input.attendees || [],
        attachments: [],
        metadata: {},
        calendar_id: input.calendar_id || null
      }
      const result = await create(eventData)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create event')
      setMutationError(error)
      throw error
    } finally {
      setMutationLoading(false)
    }
  }, [create])

  // Update an existing calendar event
  const updateEvent = useCallback(async (input: UpdateCalendarEventInput) => {
    setMutationLoading(true)
    setMutationError(null)
    try {
      const { id, ...updateData } = input
      const result = await update(id, updateData)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update event')
      setMutationError(error)
      throw error
    } finally {
      setMutationLoading(false)
    }
  }, [update])

  // Delete a calendar event (hard delete since table doesn't have deleted_at)
  const deleteEvent = useCallback(async (input: { id: string }) => {
    setMutationLoading(true)
    setMutationError(null)
    try {
      await remove(input.id, true) // true for hard delete
      return { success: true }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete event')
      setMutationError(error)
      throw error
    } finally {
      setMutationLoading(false)
    }
  }, [remove])

  return {
    events: data || [],
    loading: loading || mutationLoading,
    error: error || mutationError,
    createEvent,
    updateEvent,
    deleteEvent,
    refetch
  }
}
