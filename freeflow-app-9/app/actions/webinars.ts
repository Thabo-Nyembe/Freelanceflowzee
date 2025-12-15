// Server Actions for Webinars
// Created: December 14, 2024

'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export type WebinarTopic = 'sales' | 'marketing' | 'product' | 'training' | 'demo' | 'onboarding' | 'qa' | 'other'
export type WebinarStatus = 'scheduled' | 'live' | 'ended' | 'cancelled' | 'recording'
export type Platform = 'zoom' | 'teams' | 'meet' | 'webex' | 'custom'

export interface CreateWebinarData {
  title: string
  description?: string
  topic: WebinarTopic
  status?: WebinarStatus
  scheduled_date: string
  duration_minutes: number
  timezone?: string
  platform?: Platform
  meeting_link?: string
  meeting_id?: string
  passcode?: string
  max_participants?: number
  host_name?: string
  speakers?: any
}

export async function createWebinar(data: CreateWebinarData) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: webinar, error } = await supabase
    .from('webinars')
    .insert({
      ...data,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/webinars-v2')
  return webinar
}

export async function updateWebinar(id: string, data: Partial<CreateWebinarData>) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: webinar, error } = await supabase
    .from('webinars')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/webinars-v2')
  return webinar
}

export async function deleteWebinar(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Soft delete
  const { error } = await supabase
    .from('webinars')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/dashboard/webinars-v2')
  return { success: true }
}

export async function startWebinar(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: webinar, error } = await supabase
    .from('webinars')
    .update({ status: 'live' })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/webinars-v2')
  return webinar
}

export async function endWebinar(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: webinar, error } = await supabase
    .from('webinars')
    .update({ status: 'ended' })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/webinars-v2')
  return webinar
}

export async function getWebinarStats() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: webinars } = await supabase
    .from('webinars')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)

  if (!webinars) return null

  return {
    total: webinars.length,
    scheduled: webinars.filter(w => w.status === 'scheduled').length,
    live: webinars.filter(w => w.status === 'live').length,
    ended: webinars.filter(w => w.status === 'ended').length,
    totalRegistrations: webinars.reduce((sum, w) => sum + (w.registered_count || 0), 0),
  }
}
