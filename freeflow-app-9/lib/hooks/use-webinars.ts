// Hook for Webinars management
// Created: December 14, 2024

import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'

export type WebinarTopic = 'sales' | 'marketing' | 'product' | 'training' | 'demo' | 'onboarding' | 'qa' | 'other'
export type WebinarStatus = 'scheduled' | 'live' | 'ended' | 'cancelled' | 'recording'
export type Platform = 'zoom' | 'teams' | 'meet' | 'webex' | 'custom'

export interface Webinar {
  id: string
  user_id: string
  organization_id: string | null
  title: string
  description: string | null
  topic: WebinarTopic
  status: WebinarStatus
  scheduled_date: string
  duration_minutes: number
  timezone: string
  platform: Platform | null
  meeting_link: string | null
  meeting_id: string | null
  passcode: string | null
  max_participants: number | null
  registered_count: number
  attended_count: number
  live_viewers: number
  recording_url: string | null
  recording_duration: number | null
  recording_views: number
  host_name: string | null
  speakers: any | null
  questions_asked: number
  polls_conducted: number
  chat_messages: number
  satisfaction_rating: number | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface UseWebinarsOptions {
  status?: WebinarStatus | 'all'
  topic?: WebinarTopic | 'all'
  limit?: number
}

export function useWebinars(options: UseWebinarsOptions = {}) {
  const { status, topic, limit } = options

  const filters: Record<string, any> = {}
  if (status && status !== 'all') filters.status = status
  if (topic && topic !== 'all') filters.topic = topic

  const queryOptions: any = {
    table: 'webinars',
    filters,
    orderBy: { column: 'scheduled_date', ascending: false },
    realtime: true
  }
  if (limit !== undefined) queryOptions.limit = limit

  const { data, loading, error, refetch } = useSupabaseQuery<Webinar>(queryOptions)

  const { create, update, remove, loading: mutating } = useSupabaseMutation({
    table: 'webinars',
    onSuccess: refetch
  })

  return {
    webinars: data,
    loading,
    error,
    mutating,
    createWebinar: create,
    updateWebinar: update,
    deleteWebinar: remove,
    refetch
  }
}
