'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('support-tickets-actions')

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

export async function createSupportTicket(input: SupportTicketInput): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('support_tickets')
      .insert([{ ...input, user_id: user.id }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create support ticket', { error: error.message, input })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/support-tickets-v2')
    logger.info('Support ticket created', { ticketId: data.id })
    return actionSuccess(data, 'Support ticket created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating support ticket', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateSupportTicket(id: string, input: Partial<SupportTicketInput>): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('support_tickets')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update support ticket', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/support-tickets-v2')
    logger.info('Support ticket updated', { ticketId: id })
    return actionSuccess(data, 'Support ticket updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating support ticket', { error: error.message, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteSupportTicket(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('support_tickets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete support ticket', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/support-tickets-v2')
    logger.info('Support ticket deleted', { ticketId: id })
    return actionSuccess({ success: true }, 'Support ticket deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error deleting support ticket', { error: error.message, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
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
