// Server Actions for Event/Webinar Registrations
// Created: December 14, 2024

'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

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

export async function createRegistration(data: CreateRegistrationData) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Check capacity if registering for an event
  if (data.event_id) {
    const { data: event } = await supabase
      .from('events')
      .select('current_attendees, max_attendees')
      .eq('id', data.event_id)
      .single()

    if (event && event.max_attendees && event.current_attendees >= event.max_attendees) {
      throw new Error('Event is at capacity')
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

  if (error) throw error

  // Update event/webinar registration count
  if (data.event_id) {
    await supabase.rpc('increment_event_registrations', { event_id: data.event_id })
  } else if (data.webinar_id) {
    await supabase.rpc('increment_webinar_registrations', { webinar_id: data.webinar_id })
  }

  revalidatePath('/dashboard/registrations-v2')
  return registration
}

export async function updateRegistration(id: string, data: Partial<CreateRegistrationData>) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: registration, error } = await supabase
    .from('event_registrations')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/registrations-v2')
  return registration
}

export async function deleteRegistration(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error

  // Decrement registration count
  if (registration?.event_id) {
    await supabase.rpc('decrement_event_registrations', { event_id: registration.event_id })
  } else if (registration?.webinar_id) {
    await supabase.rpc('decrement_webinar_registrations', { webinar_id: registration.webinar_id })
  }

  revalidatePath('/dashboard/registrations-v2')
  return { success: true }
}

export async function checkInRegistration(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error

  revalidatePath('/dashboard/registrations-v2')
  return registration
}

export async function getRegistrationStats() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: registrations } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)

  if (!registrations) return null

  return {
    total: registrations.length,
    confirmed: registrations.filter(r => r.status === 'confirmed').length,
    attended: registrations.filter(r => r.status === 'attended').length,
    pending: registrations.filter(r => r.status === 'pending').length,
    noShow: registrations.filter(r => r.status === 'no-show').length,
  }
}
