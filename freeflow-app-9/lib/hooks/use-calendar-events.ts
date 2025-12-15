import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'

export type EventType = 'meeting' | 'appointment' | 'task' | 'reminder' | 'deadline' | 'milestone' | 'holiday' | 'birthday' | 'custom'
export type EventStatus = 'tentative' | 'confirmed' | 'cancelled' | 'rescheduled' | 'completed'
export type LocationType = 'in_person' | 'virtual' | 'hybrid' | 'tbd'

export interface CalendarEvent {
  id: string
  user_id: string
  title: string
  description?: string
  event_type: EventType
  start_time: string
  end_time: string
  all_day: boolean
  timezone: string
  duration_minutes?: number
  location?: string
  location_type?: LocationType
  meeting_url?: string
  meeting_id?: string
  meeting_password?: string
  status: EventStatus
  availability: string
  visibility: string
  is_recurring: boolean
  recurrence_rule?: string
  recurrence_frequency?: string
  recurrence_end_date?: string
  recurrence_count?: number
  parent_event_id?: string
  organizer_id?: string
  attendees: any
  required_attendees?: string[]
  optional_attendees?: string[]
  total_attendees: number
  rsvp_required: boolean
  rsvp_deadline?: string
  accepted_count: number
  declined_count: number
  tentative_count: number
  calendar_id?: string
  calendar_name?: string
  color?: string
  reminders: any
  reminder_sent: boolean
  category?: string
  priority: string
  tags?: string[]
  attachments: any
  resources?: string[]
  agenda?: string
  notes?: string
  external_id?: string
  external_source?: string
  external_calendar_id?: string
  sync_status?: string
  last_synced_at?: string
  metadata: any
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface UseCalendarEventsOptions {
  eventType?: EventType | 'all'
  status?: EventStatus | 'all'
  startDate?: string
  endDate?: string
  limit?: number
}

export function useCalendarEvents(options: UseCalendarEventsOptions = {}) {
  const { eventType, status, limit } = options

  const filters: Record<string, any> = {}
  if (eventType && eventType !== 'all') filters.event_type = eventType
  if (status && status !== 'all') filters.status = status

  const queryOptions: any = {
    table: 'calendar_events',
    filters,
    orderBy: { column: 'start_time', ascending: true },
    limit: limit || 50,
    realtime: true
  }

  const { data, loading, error, refetch } = useSupabaseQuery<CalendarEvent>(queryOptions)

  const { mutate: create } = useSupabaseMutation<CalendarEvent>({
    table: 'calendar_events',
    operation: 'insert'
  })

  const { mutate: update } = useSupabaseMutation<CalendarEvent>({
    table: 'calendar_events',
    operation: 'update'
  })

  const { mutate: remove } = useSupabaseMutation<CalendarEvent>({
    table: 'calendar_events',
    operation: 'delete'
  })

  return {
    events: data,
    loading,
    error,
    createEvent: create,
    updateEvent: update,
    deleteEvent: remove,
    refetch
  }
}
