// Server Actions for Events
// Created: December 14, 2024

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('events-actions')

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

export async function createEvent(data: CreateEventData): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: event, error } = await supabase
      .from('events')
      .insert({
        ...data,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create event', { error, data })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Event created successfully', { id: event.id })
    revalidatePath('/dashboard/events-v2')
    return actionSuccess(event, 'Event created successfully')
  } catch (error) {
    logger.error('Unexpected error creating event', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateEvent(id: string, data: Partial<CreateEventData>): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: event, error } = await supabase
      .from('events')
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update event', { error, id, data })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Event updated successfully', { id })
    revalidatePath('/dashboard/events-v2')
    return actionSuccess(event, 'Event updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating event', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteEvent(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    // Soft delete
    const { error } = await supabase
      .from('events')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete event', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Event deleted successfully', { id })
    revalidatePath('/dashboard/events-v2')
    return actionSuccess({ success: true }, 'Event deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting event', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getEventStats(): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (error) {
      logger.error('Failed to get event stats', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    if (!events) {
      return actionSuccess({
        total: 0,
        upcoming: 0,
        ongoing: 0,
        completed: 0,
        totalAttendees: 0
      }, 'Event stats retrieved successfully')
    }

    const stats = {
      total: events.length,
      upcoming: events.filter(e => e.status === 'upcoming').length,
      ongoing: events.filter(e => e.status === 'ongoing').length,
      completed: events.filter(e => e.status === 'completed').length,
      totalAttendees: events.reduce((sum, e) => sum + (e.current_attendees || 0), 0),
    }

    return actionSuccess(stats, 'Event stats retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error getting event stats', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateEventStatus(id: string, status: EventStatus): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: event, error } = await supabase
      .from('events')
      .update({ status })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update event status', { error, id, status })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Event status updated successfully', { id, status })
    revalidatePath('/dashboard/events-v2')
    return actionSuccess(event, 'Event status updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating event status', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
