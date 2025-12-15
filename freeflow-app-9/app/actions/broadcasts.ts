'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

// ===================================
// Broadcast Server Actions
// Created: December 14, 2024
// ===================================

export interface CreateBroadcastData {
  title: string
  message: string
  broadcast_type?: string
  status?: string
  scheduled_for?: string
  recipient_type?: string
  recipient_count?: number
  recipient_list?: any
  recipient_filters?: any
  sender_name?: string
  sender_email?: string
  reply_to?: string
  subject?: string
  html_content?: string
  plain_text_content?: string
  template_id?: string
  variables?: any
  track_opens?: boolean
  track_clicks?: boolean
  tags?: any
  metadata?: any
}

export async function createBroadcast(data: CreateBroadcastData) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: broadcast, error } = await supabase
    .from('broadcasts')
    .insert({ ...data, user_id: user.id })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/broadcasts-v2')
  return broadcast
}

export async function updateBroadcast(id: string, data: Partial<CreateBroadcastData>) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: broadcast, error } = await supabase
    .from('broadcasts')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/broadcasts-v2')
  return broadcast
}

export async function deleteBroadcast(id: string, hardDelete: boolean = false) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  if (hardDelete) {
    const { error } = await supabase
      .from('broadcasts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error
  } else {
    const { error } = await supabase
      .from('broadcasts')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error
  }

  revalidatePath('/dashboard/broadcasts-v2')
  return { success: true }
}

export async function sendBroadcast(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Update status to sending
  const { data: broadcast, error } = await supabase
    .from('broadcasts')
    .update({
      status: 'sending',
      sent_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  // TODO: Implement actual broadcast sending logic here
  // This would integrate with email service, SMS provider, etc.

  // For now, just update status to sent
  await supabase
    .from('broadcasts')
    .update({ status: 'sent' })
    .eq('id', id)

  revalidatePath('/dashboard/broadcasts-v2')
  return broadcast
}

export async function pauseBroadcast(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: broadcast, error } = await supabase
    .from('broadcasts')
    .update({ status: 'paused' })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/broadcasts-v2')
  return broadcast
}

export async function resumeBroadcast(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: broadcast, error } = await supabase
    .from('broadcasts')
    .update({ status: 'sending' })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/broadcasts-v2')
  return broadcast
}

export async function getBroadcastStats() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: broadcasts } = await supabase
    .from('broadcasts')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)

  const stats = {
    total: broadcasts?.length || 0,
    sent: broadcasts?.filter(b => b.status === 'sent').length || 0,
    scheduled: broadcasts?.filter(b => b.status === 'scheduled').length || 0,
    draft: broadcasts?.filter(b => b.status === 'draft').length || 0,
    totalRecipients: broadcasts?.reduce((sum, b) => sum + (b.recipient_count || 0), 0) || 0,
    totalDelivered: broadcasts?.reduce((sum, b) => sum + (b.delivered_count || 0), 0) || 0,
    totalOpened: broadcasts?.reduce((sum, b) => sum + (b.opened_count || 0), 0) || 0,
    avgOpenRate: broadcasts && broadcasts.length > 0
      ? broadcasts.reduce((sum, b) => sum + (b.open_rate || 0), 0) / broadcasts.length
      : 0
  }

  return stats
}
