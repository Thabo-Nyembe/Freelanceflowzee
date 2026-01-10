'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('support-actions')

// Types
export interface SupportTicket {
  id: string
  user_id: string
  ticket_code: string
  subject: string
  description: string | null
  category: 'general' | 'technical' | 'billing' | 'feature' | 'bug' | 'other'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed'
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  assigned_to: string | null
  assigned_at: string | null
  channel: 'email' | 'chat' | 'phone' | 'self_service' | 'social'
  resolution_notes: string | null
  resolved_at: string | null
  resolved_by: string | null
  first_response_at: string | null
  sla_due_at: string | null
  sla_breached: boolean
  satisfaction_rating: number | null
  satisfaction_feedback: string | null
  tags: string[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface TicketReply {
  id: string
  ticket_id: string
  message: string
  is_internal: boolean
  reply_type: 'reply' | 'note' | 'system'
  author_id: string | null
  author_name: string | null
  author_type: 'agent' | 'customer' | 'system'
  attachments: any[]
  created_at: string
}

// Fetch all tickets
export async function fetchTickets(): Promise<ActionResult<SupportTicket[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to fetch tickets', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Tickets fetched', { count: data?.length || 0 })
    return actionSuccess(data || [], 'Tickets fetched successfully')
  } catch (error: any) {
    logger.error('Unexpected error fetching tickets', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Create ticket
export async function createTicket(ticket: Partial<SupportTicket>): Promise<ActionResult<SupportTicket>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('support_tickets')
      .insert([{ ...ticket, user_id: user.id }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create ticket', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/support-v2')
    logger.info('Ticket created', { ticketId: data.id })
    return actionSuccess(data, 'Ticket created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating ticket', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Update ticket
export async function updateTicket(id: string, updates: Partial<SupportTicket>): Promise<ActionResult<SupportTicket>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('support_tickets')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update ticket', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/support-v2')
    logger.info('Ticket updated', { ticketId: id })
    return actionSuccess(data, 'Ticket updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating ticket', { error: error.message, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Delete ticket (soft delete)
export async function deleteTicket(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('support_tickets')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      logger.error('Failed to delete ticket', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/support-v2')
    logger.info('Ticket deleted', { ticketId: id })
    return actionSuccess({ success: true }, 'Ticket deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error deleting ticket', { error: error.message, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Assign ticket
export async function assignTicket(id: string, assignedTo: string): Promise<ActionResult<SupportTicket>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('support_tickets')
      .update({
        assigned_to: assignedTo,
        assigned_at: new Date().toISOString(),
        status: 'in_progress'
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to assign ticket', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/support-v2')
    logger.info('Ticket assigned', { ticketId: id, assignedTo })
    return actionSuccess(data, 'Ticket assigned successfully')
  } catch (error: any) {
    logger.error('Unexpected error assigning ticket', { error: error.message, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Resolve ticket
export async function resolveTicket(id: string, resolutionNotes: string): Promise<ActionResult<SupportTicket>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('support_tickets')
      .update({
        status: 'resolved',
        resolution_notes: resolutionNotes,
        resolved_at: new Date().toISOString(),
        resolved_by: user.id
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to resolve ticket', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/support-v2')
    logger.info('Ticket resolved', { ticketId: id })
    return actionSuccess(data, 'Ticket resolved successfully')
  } catch (error: any) {
    logger.error('Unexpected error resolving ticket', { error: error.message, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Close ticket
export async function closeTicket(id: string): Promise<ActionResult<SupportTicket>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('support_tickets')
      .update({ status: 'closed' })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to close ticket', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/support-v2')
    logger.info('Ticket closed', { ticketId: id })
    return actionSuccess(data, 'Ticket closed successfully')
  } catch (error: any) {
    logger.error('Unexpected error closing ticket', { error: error.message, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Reopen ticket
export async function reopenTicket(id: string): Promise<ActionResult<SupportTicket>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('support_tickets')
      .update({ status: 'open', resolved_at: null, resolved_by: null })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to reopen ticket', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/support-v2')
    logger.info('Ticket reopened', { ticketId: id })
    return actionSuccess(data, 'Ticket reopened successfully')
  } catch (error: any) {
    logger.error('Unexpected error reopening ticket', { error: error.message, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Add reply to ticket
export async function addTicketReply(ticketId: string, message: string, isInternal: boolean = false): Promise<ActionResult<TicketReply>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('support_ticket_replies')
      .insert([{
        ticket_id: ticketId,
        message,
        is_internal: isInternal,
        author_id: user.id,
        author_type: 'agent'
      }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to add ticket reply', { error: error.message, ticketId })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/support-v2')
    logger.info('Ticket reply added', { ticketId, replyId: data.id })
    return actionSuccess(data, 'Reply added successfully')
  } catch (error: any) {
    logger.error('Unexpected error adding ticket reply', { error: error.message, ticketId })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Fetch ticket replies
export async function fetchTicketReplies(ticketId: string): Promise<ActionResult<TicketReply[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('support_ticket_replies')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true })

    if (error) {
      logger.error('Failed to fetch ticket replies', { error: error.message, ticketId })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Ticket replies fetched', { ticketId, count: data?.length || 0 })
    return actionSuccess(data || [], 'Replies fetched successfully')
  } catch (error: any) {
    logger.error('Unexpected error fetching ticket replies', { error: error.message, ticketId })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Rate ticket satisfaction
export async function rateTicketSatisfaction(id: string, rating: number, feedback?: string): Promise<ActionResult<SupportTicket>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('support_tickets')
      .update({
        satisfaction_rating: rating,
        satisfaction_feedback: feedback || null
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to rate ticket satisfaction', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/support-v2')
    logger.info('Ticket satisfaction rated', { ticketId: id, rating })
    return actionSuccess(data, 'Satisfaction rating submitted successfully')
  } catch (error: any) {
    logger.error('Unexpected error rating ticket satisfaction', { error: error.message, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
