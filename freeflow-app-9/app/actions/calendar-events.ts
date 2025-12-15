'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type { CalendarEvent } from '@/lib/hooks/use-calendar-events'

export async function createEvent(data: Partial<CalendarEvent>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: event, error } = await supabase
    .from('calendar_events')
    .insert([{ ...data, user_id: user.id, organizer_id: user.id }])
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/calendar-v2')
  return event
}

export async function updateEvent(id: string, data: Partial<CalendarEvent>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: event, error } = await supabase
    .from('calendar_events')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/calendar-v2')
  return event
}

export async function deleteEvent(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('calendar_events')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/dashboard/calendar-v2')
  return { success: true }
}

export async function updateEventStatus(id: string, status: 'tentative' | 'confirmed' | 'cancelled' | 'rescheduled' | 'completed') {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: event, error } = await supabase
    .from('calendar_events')
    .update({ status })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/calendar-v2')
  return event
}

export async function addAttendee(eventId: string, attendeeEmail: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Get current attendees
  const { data: event } = await supabase
    .from('calendar_events')
    .select('attendees, total_attendees')
    .eq('id', eventId)
    .eq('user_id', user.id)
    .single()

  if (!event) throw new Error('Event not found')

  const attendees = Array.isArray(event.attendees) ? event.attendees : []
  const existingAttendee = attendees.find((a: any) => a.email === attendeeEmail)

  if (existingAttendee) {
    throw new Error('Attendee already added')
  }

  attendees.push({
    email: attendeeEmail,
    status: 'pending',
    added_at: new Date().toISOString()
  })

  const { data: updatedEvent, error } = await supabase
    .from('calendar_events')
    .update({
      attendees,
      total_attendees: attendees.length
    })
    .eq('id', eventId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/calendar-v2')
  return updatedEvent
}

export async function removeAttendee(eventId: string, attendeeEmail: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Get current attendees
  const { data: event } = await supabase
    .from('calendar_events')
    .select('attendees')
    .eq('id', eventId)
    .eq('user_id', user.id)
    .single()

  if (!event) throw new Error('Event not found')

  const attendees = Array.isArray(event.attendees) ? event.attendees : []
  const filteredAttendees = attendees.filter((a: any) => a.email !== attendeeEmail)

  const { data: updatedEvent, error } = await supabase
    .from('calendar_events')
    .update({
      attendees: filteredAttendees,
      total_attendees: filteredAttendees.length
    })
    .eq('id', eventId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/calendar-v2')
  return updatedEvent
}

export async function updateRSVP(eventId: string, attendeeEmail: string, response: 'accepted' | 'declined' | 'tentative') {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Get current event
  const { data: event } = await supabase
    .from('calendar_events')
    .select('attendees, accepted_count, declined_count, tentative_count')
    .eq('id', eventId)
    .single()

  if (!event) throw new Error('Event not found')

  const attendees = Array.isArray(event.attendees) ? event.attendees : []
  const attendeeIndex = attendees.findIndex((a: any) => a.email === attendeeEmail)

  if (attendeeIndex === -1) {
    throw new Error('Attendee not found')
  }

  const oldStatus = attendees[attendeeIndex].status
  attendees[attendeeIndex] = {
    ...attendees[attendeeIndex],
    status: response,
    responded_at: new Date().toISOString()
  }

  // Update counts
  let acceptedCount = event.accepted_count || 0
  let declinedCount = event.declined_count || 0
  let tentativeCount = event.tentative_count || 0

  // Decrement old count
  if (oldStatus === 'accepted') acceptedCount--
  if (oldStatus === 'declined') declinedCount--
  if (oldStatus === 'tentative') tentativeCount--

  // Increment new count
  if (response === 'accepted') acceptedCount++
  if (response === 'declined') declinedCount++
  if (response === 'tentative') tentativeCount++

  const { data: updatedEvent, error } = await supabase
    .from('calendar_events')
    .update({
      attendees,
      accepted_count: acceptedCount,
      declined_count: declinedCount,
      tentative_count: tentativeCount
    })
    .eq('id', eventId)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/calendar-v2')
  return updatedEvent
}
