'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export interface SupportTicketInput {
  subject: string
  description?: string
  status?: 'open' | 'in-progress' | 'waiting' | 'resolved' | 'closed'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  category?: 'technical' | 'billing' | 'feature-request' | 'bug' | 'general' | 'account'
  customer_name?: string
  customer_email?: string
  assigned_to?: string
  tags?: string[]
}

export async function createSupportTicket(input: SupportTicketInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('support_tickets')
    .insert([{ ...input, user_id: user.id }])
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/support-tickets-v2')
  return { data }
}

export async function updateSupportTicket(id: string, input: Partial<SupportTicketInput>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('support_tickets')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/support-tickets-v2')
  return { data }
}

export async function deleteSupportTicket(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('support_tickets')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/support-tickets-v2')
  return { success: true }
}

export async function resolveTicket(id: string) {
  return updateSupportTicket(id, { status: 'resolved' })
}

export async function closeTicket(id: string) {
  return updateSupportTicket(id, { status: 'closed' })
}

export async function reopenTicket(id: string) {
  return updateSupportTicket(id, { status: 'open' })
}

export async function assignTicket(id: string, assignedTo: string) {
  return updateSupportTicket(id, { status: 'in-progress', assigned_to: assignedTo })
}

export async function escalateTicket(id: string) {
  return updateSupportTicket(id, { priority: 'urgent' })
}
