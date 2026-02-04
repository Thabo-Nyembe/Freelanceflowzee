'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, type ActionResult } from '@/lib/api/response'
import { createSimpleLogger } from '@/lib/simple-logger'
import { uuidSchema } from '@/lib/validations'
import type { CalendarEvent } from '@/lib/hooks/use-calendar-events'

const logger = createSimpleLogger('calendar-events')

type EventStatus = 'tentative' | 'confirmed' | 'cancelled' | 'rescheduled' | 'completed'
type RSVPResponse = 'accepted' | 'declined' | 'tentative'

interface Attendee {
  email: string
  status: string
  added_at?: string
  responded_at?: string
}

export async function createEvent(data: Partial<CalendarEvent>): Promise<ActionResult<CalendarEvent>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Unauthorized', 401)
    }

    const { data: event, error } = await supabase
      .from('calendar_events')
      .insert([{ ...data, user_id: user.id, organizer_id: user.id }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create event', { error, userId: user.id })
      return actionError('Failed to create calendar event', 500)
    }

    revalidatePath('/dashboard/calendar-v2')
    return actionSuccess(event, 'Calendar event created successfully')
  } catch (error) {
    logger.error('Unexpected error creating event', { error })
    return actionError('An unexpected error occurred', 500)
  }
}

export async function updateEvent(id: string, data: Partial<CalendarEvent>): Promise<ActionResult<CalendarEvent>> {
  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid event ID format', 400)
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Unauthorized', 401)
    }

    const { data: event, error } = await supabase
      .from('calendar_events')
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update event', { error, eventId: id, userId: user.id })
      return actionError('Failed to update calendar event', 500)
    }

    revalidatePath('/dashboard/calendar-v2')
    return actionSuccess(event, 'Calendar event updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating event', { error, eventId: id })
    return actionError('An unexpected error occurred', 500)
  }
}

export async function deleteEvent(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid event ID format', 400)
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Unauthorized', 401)
    }

    const { error } = await supabase
      .from('calendar_events')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete event', { error, eventId: id, userId: user.id })
      return actionError('Failed to delete calendar event', 500)
    }

    revalidatePath('/dashboard/calendar-v2')
    return actionSuccess({ success: true }, 'Calendar event deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting event', { error, eventId: id })
    return actionError('An unexpected error occurred', 500)
  }
}

export async function updateEventStatus(id: string, status: EventStatus): Promise<ActionResult<CalendarEvent>> {
  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid event ID format', 400)
    }

    const validStatuses: EventStatus[] = ['tentative', 'confirmed', 'cancelled', 'rescheduled', 'completed']
    if (!validStatuses.includes(status)) {
      return actionError('Invalid status value', 400)
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Unauthorized', 401)
    }

    const { data: event, error } = await supabase
      .from('calendar_events')
      .update({ status })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update event status', { error, eventId: id, status, userId: user.id })
      return actionError('Failed to update event status', 500)
    }

    revalidatePath('/dashboard/calendar-v2')
    return actionSuccess(event, 'Event status updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating event status', { error, eventId: id, status })
    return actionError('An unexpected error occurred', 500)
  }
}

export async function addAttendee(eventId: string, attendeeEmail: string): Promise<ActionResult<CalendarEvent>> {
  try {
    const idValidation = uuidSchema.safeParse(eventId)
    if (!idValidation.success) {
      return actionError('Invalid event ID format', 400)
    }

    if (!attendeeEmail || !attendeeEmail.includes('@')) {
      return actionError('Invalid email address', 400)
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Unauthorized', 401)
    }

    // Get current attendees
    const { data: event, error: fetchError } = await supabase
      .from('calendar_events')
      .select('attendees, total_attendees')
      .eq('id', eventId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !event) {
      logger.error('Event not found', { error: fetchError, eventId, userId: user.id })
      return actionError('Event not found', 404)
    }

    const attendees = Array.isArray(event.attendees) ? event.attendees : []
    const existingAttendee = attendees.find((a: Attendee) => a.email === attendeeEmail)

    if (existingAttendee) {
      return actionError('Attendee already added to this event', 400)
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

    if (error) {
      logger.error('Failed to add attendee', { error, eventId, attendeeEmail, userId: user.id })
      return actionError('Failed to add attendee', 500)
    }

    revalidatePath('/dashboard/calendar-v2')
    return actionSuccess(updatedEvent, 'Attendee added successfully')
  } catch (error) {
    logger.error('Unexpected error adding attendee', { error, eventId, attendeeEmail })
    return actionError('An unexpected error occurred', 500)
  }
}

export async function removeAttendee(eventId: string, attendeeEmail: string): Promise<ActionResult<CalendarEvent>> {
  try {
    const idValidation = uuidSchema.safeParse(eventId)
    if (!idValidation.success) {
      return actionError('Invalid event ID format', 400)
    }

    if (!attendeeEmail) {
      return actionError('Email address is required', 400)
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Unauthorized', 401)
    }

    // Get current attendees
    const { data: event, error: fetchError } = await supabase
      .from('calendar_events')
      .select('attendees')
      .eq('id', eventId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !event) {
      logger.error('Event not found', { error: fetchError, eventId, userId: user.id })
      return actionError('Event not found', 404)
    }

    const attendees = Array.isArray(event.attendees) ? event.attendees : []
    const filteredAttendees = attendees.filter((a: Attendee) => a.email !== attendeeEmail)

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

    if (error) {
      logger.error('Failed to remove attendee', { error, eventId, attendeeEmail, userId: user.id })
      return actionError('Failed to remove attendee', 500)
    }

    revalidatePath('/dashboard/calendar-v2')
    return actionSuccess(updatedEvent, 'Attendee removed successfully')
  } catch (error) {
    logger.error('Unexpected error removing attendee', { error, eventId, attendeeEmail })
    return actionError('An unexpected error occurred', 500)
  }
}

export async function updateRSVP(eventId: string, attendeeEmail: string, response: RSVPResponse): Promise<ActionResult<CalendarEvent>> {
  try {
    const idValidation = uuidSchema.safeParse(eventId)
    if (!idValidation.success) {
      return actionError('Invalid event ID format', 400)
    }

    const validResponses: RSVPResponse[] = ['accepted', 'declined', 'tentative']
    if (!validResponses.includes(response)) {
      return actionError('Invalid RSVP response', 400)
    }

    if (!attendeeEmail) {
      return actionError('Email address is required', 400)
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Unauthorized', 401)
    }

    // Get current event
    const { data: event, error: fetchError } = await supabase
      .from('calendar_events')
      .select('attendees, accepted_count, declined_count, tentative_count')
      .eq('id', eventId)
      .single()

    if (fetchError || !event) {
      logger.error('Event not found', { error: fetchError, eventId })
      return actionError('Event not found', 404)
    }

    const attendees = Array.isArray(event.attendees) ? event.attendees : []
    const attendeeIndex = attendees.findIndex((a: Attendee) => a.email === attendeeEmail)

    if (attendeeIndex === -1) {
      return actionError('Attendee not found in this event', 404)
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

    if (error) {
      logger.error('Failed to update RSVP', { error, eventId, attendeeEmail, response })
      return actionError('Failed to update RSVP', 500)
    }

    revalidatePath('/dashboard/calendar-v2')
    return actionSuccess(updatedEvent, 'RSVP updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating RSVP', { error, eventId, attendeeEmail, response })
    return actionError('An unexpected error occurred', 500)
  }
}
