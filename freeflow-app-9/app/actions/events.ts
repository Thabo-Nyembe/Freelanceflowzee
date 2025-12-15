// Server Actions for Events
// Created: December 14, 2024

'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export type EventType = 'conference' | 'workshop' | 'meetup' | 'training' | 'seminar' | 'networking' | 'launch' | 'other'
export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'postponed'
export type LocationType = 'in-person' | 'virtual' | 'hybrid'

export interface CreateEventData {
  name: string
  description?: string
  event_type: EventType
  status?: EventStatus
  start_date: string
  end_date: string
  timezone?: string
  location_type?: LocationType
  venue_name?: string
  venue_address?: string
  virtual_link?: string
  max_attendees?: number
  tags?: string[]
  image_url?: string
  is_featured?: boolean
  is_public?: boolean
}

export async function createEvent(data: CreateEventData) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: event, error } = await supabase
    .from('events')
    .insert({
      ...data,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/events-v2')
  return event
}

export async function updateEvent(id: string, data: Partial<CreateEventData>) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: event, error } = await supabase
    .from('events')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/events-v2')
  return event
}

export async function deleteEvent(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Soft delete
  const { error } = await supabase
    .from('events')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/dashboard/events-v2')
  return { success: true }
}

export async function getEventStats() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)

  if (!events) return null

  return {
    total: events.length,
    upcoming: events.filter(e => e.status === 'upcoming').length,
    ongoing: events.filter(e => e.status === 'ongoing').length,
    completed: events.filter(e => e.status === 'completed').length,
    totalAttendees: events.reduce((sum, e) => sum + (e.current_attendees || 0), 0),
  }
}

export async function updateEventStatus(id: string, status: EventStatus) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: event, error } = await supabase
    .from('events')
    .update({ status })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/events-v2')
  return event
}
