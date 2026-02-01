// Server Actions for Event/Webinar Registrations
// Created: December 14, 2024

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('registrations-actions')

export type RegistrationType = 'event' | 'webinar'
export type RegistrationStatus = 'pending' | 'confirmed' | 'attended' | 'no-show' | 'cancelled' | 'waitlist'
export type TicketType = 'free' | 'paid' | 'vip' | 'speaker' | 'sponsor' | 'press'
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'cancelled'

export interface CreateRegistrationData {
  event_id?: string
  webinar_id?: string
  registration_type: RegistrationType
  registrant_name: string
  registrant_email: string
  registrant_phone?: string
  company?: string
  job_title?: string
  status?: RegistrationStatus
  ticket_type?: TicketType
  ticket_price?: number
  payment_status?: PaymentStatus
}

export async function createRegistration(data: CreateRegistrationData): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    // Check capacity if registering for an event
    if (data.event_id) {
      const { data: event } = await supabase
        .from('events')
        .select('current_attendees, max_attendees')
        .eq('id', data.event_id)
        .single()

      if (event && event.max_attendees && event.current_attendees >= event.max_attendees) {
        logger.error('Event at capacity', { eventId: data.event_id })
        return actionError('Event is at capacity', 'VALIDATION_ERROR')
      }
    }

    const { data: registration, error } = await supabase
      .from('event_registrations')
      .insert({
        ...data,
        user_id: user.id,
        status: data.status || 'confirmed'
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create registration', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    // Update event/webinar registration count
    if (data.event_id) {
      await supabase.rpc('increment_event_registrations', { event_id: data.event_id })
    } else if (data.webinar_id) {
      await supabase.rpc('increment_webinar_registrations', { webinar_id: data.webinar_id })
    }

    revalidatePath('/dashboard/registrations-v2')
    logger.info('Registration created successfully', { registrationId: registration.id })
    return actionSuccess(registration, 'Registration created successfully')
  } catch (error) {
    logger.error('Unexpected error creating registration', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateRegistration(id: string, data: Partial<CreateRegistrationData>): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: registration, error } = await supabase
      .from('event_registrations')
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update registration', { error, registrationId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/registrations-v2')
    logger.info('Registration updated successfully', { registrationId: id })
    return actionSuccess(registration, 'Registration updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating registration', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteRegistration(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    // Get registration details before deleting
    const { data: registration } = await supabase
      .from('event_registrations')
      .select('event_id, webinar_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    // Soft delete
    const { error } = await supabase
      .from('event_registrations')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete registration', { error, registrationId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    // Decrement registration count
    if (registration?.event_id) {
      await supabase.rpc('decrement_event_registrations', { event_id: registration.event_id })
    } else if (registration?.webinar_id) {
      await supabase.rpc('decrement_webinar_registrations', { webinar_id: registration.webinar_id })
    }

    revalidatePath('/dashboard/registrations-v2')
    logger.info('Registration deleted successfully', { registrationId: id })
    return actionSuccess({ success: true }, 'Registration deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting registration', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function checkInRegistration(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: registration, error } = await supabase
      .from('event_registrations')
      .update({
        status: 'attended',
        checked_in_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to check in registration', { error, registrationId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/registrations-v2')
    logger.info('Registration checked in successfully', { registrationId: id })
    return actionSuccess(registration, 'Registration checked in successfully')
  } catch (error) {
    logger.error('Unexpected error checking in registration', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getRegistrationStats(): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: registrations, error } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (error) {
      logger.error('Failed to fetch registration stats', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    if (!registrations) {
      return actionSuccess({
        total: 0,
        confirmed: 0,
        attended: 0,
        pending: 0,
        noShow: 0,
      }, 'No registrations found')
    }

    const stats = {
      total: registrations.length,
      confirmed: registrations.filter(r => r.status === 'confirmed').length,
      attended: registrations.filter(r => r.status === 'attended').length,
      pending: registrations.filter(r => r.status === 'pending').length,
      noShow: registrations.filter(r => r.status === 'no-show').length,
    }

    logger.info('Registration stats fetched successfully', { total: stats.total })
    return actionSuccess(stats, 'Registration statistics retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error fetching registration stats', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
