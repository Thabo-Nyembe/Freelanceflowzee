// Hook for Events management
// Created: December 14, 2024

import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'

export type EventType = 'conference' | 'workshop' | 'meetup' | 'training' | 'seminar' | 'networking' | 'launch' | 'other'
export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'postponed'
export type LocationType = 'in-person' | 'virtual' | 'hybrid'

export interface Event {
  id: string
  user_id: string
  organization_id: string | null
  name: string
  description: string | null
  event_type: EventType
  status: EventStatus
  start_date: string
  end_date: string
  timezone: string
  duration_minutes: number | null
  location_type: LocationType | null
  venue_name: string | null
  venue_address: string | null
  virtual_link: string | null
  max_attendees: number | null
  current_attendees: number
  waitlist_count: number
  registrations: number
  attendance_rate: number | null
  satisfaction_score: number | null
  tags: string[] | null
  image_url: string | null
  is_featured: boolean
  is_public: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface UseEventsOptions {
  status?: EventStatus | 'all'
  eventType?: EventType | 'all'
  limit?: number
}

export function useEvents(options: UseEventsOptions = {}) {
  const { status, eventType, limit } = options

  const filters: Record<string, any> = {}
  if (status && status !== 'all') filters.status = status
  if (eventType && eventType !== 'all') filters.event_type = eventType

  const queryOptions: any = {
    table: 'events',
    filters,
    orderBy: { column: 'start_date', ascending: false },
    realtime: true
  }
  if (limit !== undefined) queryOptions.limit = limit

  const { data, loading, error, refetch } = useSupabaseQuery<Event>(queryOptions)

  const { create, update, remove, loading: mutating } = useSupabaseMutation({
    table: 'events',
    onSuccess: refetch
  })

  return {
    events: data,
    loading,
    error,
    mutating,
    createEvent: create,
    updateEvent: update,
    deleteEvent: remove,
    refetch
  }
}
