// Hook for Event/Webinar Registrations management
// Created: December 14, 2024

import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'

export type RegistrationType = 'event' | 'webinar'
export type RegistrationStatus = 'pending' | 'confirmed' | 'attended' | 'no-show' | 'cancelled' | 'waitlist'
export type TicketType = 'free' | 'paid' | 'vip' | 'speaker' | 'sponsor' | 'press'
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'cancelled'

export interface Registration {
  id: string
  user_id: string
  organization_id: string | null
  event_id: string | null
  webinar_id: string | null
  registration_type: RegistrationType
  registrant_name: string
  registrant_email: string
  registrant_phone: string | null
  company: string | null
  job_title: string | null
  status: RegistrationStatus
  ticket_type: TicketType | null
  ticket_price: number | null
  payment_status: PaymentStatus | null
  checked_in_at: string | null
  attendance_duration: number | null
  confirmation_sent: boolean
  reminder_sent: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface UseRegistrationsOptions {
  eventId?: string
  webinarId?: string
  status?: RegistrationStatus | 'all'
  limit?: number
}

export function useRegistrations(options: UseRegistrationsOptions = {}) {
  const { eventId, webinarId, status, limit } = options

  const filters: Record<string, any> = {}
  if (eventId) filters.event_id = eventId
  if (webinarId) filters.webinar_id = webinarId
  if (status && status !== 'all') filters.status = status

  const queryOptions: any = {
    table: 'event_registrations',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    realtime: true
  }
  if (limit !== undefined) queryOptions.limit = limit

  const { data, loading, error, refetch } = useSupabaseQuery<Registration>(queryOptions)

  const { create, update, remove, loading: mutating } = useSupabaseMutation({
    table: 'event_registrations',
    onSuccess: refetch
  })

  return {
    registrations: data,
    loading,
    error,
    mutating,
    createRegistration: create,
    updateRegistration: update,
    deleteRegistration: remove,
    refetch
  }
}
