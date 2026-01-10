'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('tickets-actions')

export interface CreateTicketInput {
  subject: string
  description?: string
  customer_name?: string
  customer_email?: string
  priority?: string
  category?: string
  tags?: string[]
}

export interface UpdateTicketInput extends Partial<CreateTicketInput> {
  id: string
  status?: string
  assigned_to?: string
  assigned_name?: string
  sla_status?: string
  satisfaction_score?: number
}

export async function createTicket(input: CreateTicketInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    // Generate ticket number
    const { data: lastTicket } = await supabase
      .from('support_tickets')
      .select('ticket_number')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const lastNumber = lastTicket?.ticket_number
      ? parseInt(lastTicket.ticket_number.replace('TICK-', ''))
      : 0
    const ticketNumber = `TICK-${(lastNumber + 1).toString().padStart(4, '0')}`

    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        ...input,
        user_id: user.id,
        ticket_number: ticketNumber
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create ticket', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Ticket created successfully', { ticketNumber })
    revalidatePath('/dashboard/tickets-v2')
    return actionSuccess(data, 'Ticket created successfully')
  } catch (error) {
    logger.error('Unexpected error creating ticket', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateTicket(input: UpdateTicketInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { id, ...updateData } = input

    // Handle status changes
    if (updateData.status === 'resolved') {
      updateData.resolved_at = new Date().toISOString()
    } else if (updateData.status === 'closed') {
      updateData.closed_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('support_tickets')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update ticket', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Ticket updated successfully', { id })
    revalidatePath('/dashboard/tickets-v2')
    return actionSuccess(data, 'Ticket updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating ticket', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteTicket(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('support_tickets')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete ticket', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Ticket deleted successfully', { id })
    revalidatePath('/dashboard/tickets-v2')
    return actionSuccess({ success: true }, 'Ticket deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting ticket', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function assignTicket(id: string, assignedTo: string, assignedName: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('support_tickets')
      .update({
        assigned_to: assignedTo,
        assigned_name: assignedName,
        status: 'in-progress'
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to assign ticket', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Ticket assigned successfully', { id, assignedTo })
    revalidatePath('/dashboard/tickets-v2')
    return actionSuccess(data, 'Ticket assigned successfully')
  } catch (error) {
    logger.error('Unexpected error assigning ticket', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function addTicketMessage(input: {
  ticket_id: string
  content: string
  message_type?: string
  is_internal?: boolean
  sender_name?: string
  sender_email?: string
  attachments?: unknown[]
}): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('ticket_messages')
      .insert({
        ...input,
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to add ticket message', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    // Update message count
    await supabase.rpc('increment_ticket_messages', { ticket_id: input.ticket_id })

    // Set first response time if not set
    const { data: ticket } = await supabase
      .from('support_tickets')
      .select('first_response_at')
      .eq('id', input.ticket_id)
      .single()

    if (ticket && !ticket.first_response_at && !input.is_internal) {
      await supabase
        .from('support_tickets')
        .update({ first_response_at: new Date().toISOString() })
        .eq('id', input.ticket_id)
    }

    logger.info('Ticket message added successfully', { ticketId: input.ticket_id })
    revalidatePath('/dashboard/tickets-v2')
    return actionSuccess(data, 'Message added successfully')
  } catch (error) {
    logger.error('Unexpected error adding ticket message', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getTicketStats(): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: tickets, error } = await supabase
      .from('support_tickets')
      .select('status, priority, sla_status')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (error) {
      logger.error('Failed to get ticket stats', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    const stats = {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      inProgress: tickets.filter(t => t.status === 'in-progress').length,
      pending: tickets.filter(t => t.status === 'pending').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      urgent: tickets.filter(t => t.priority === 'urgent').length,
      atRisk: tickets.filter(t => t.sla_status === 'at_risk').length
    }

    logger.info('Ticket stats retrieved successfully')
    return actionSuccess(stats, 'Ticket stats retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error getting ticket stats', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
