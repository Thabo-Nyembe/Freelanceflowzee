'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

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
export async function fetchTickets() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

// Create ticket
export async function createTicket(ticket: Partial<SupportTicket>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('support_tickets')
    .insert([{ ...ticket, user_id: user.id }])
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/support-v2')
  return { error: null, data }
}

// Update ticket
export async function updateTicket(id: string, updates: Partial<SupportTicket>) {
  const supabase = createServerActionClient({ cookies })

  const { data, error } = await supabase
    .from('support_tickets')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/support-v2')
  return { error: null, data }
}

// Delete ticket (soft delete)
export async function deleteTicket(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { error } = await supabase
    .from('support_tickets')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/dashboard/support-v2')
  return { error: null, success: true }
}

// Assign ticket
export async function assignTicket(id: string, assignedTo: string) {
  const supabase = createServerActionClient({ cookies })

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
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/support-v2')
  return { error: null, data }
}

// Resolve ticket
export async function resolveTicket(id: string, resolutionNotes: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('support_tickets')
    .update({
      status: 'resolved',
      resolution_notes: resolutionNotes,
      resolved_at: new Date().toISOString(),
      resolved_by: user?.id
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/support-v2')
  return { error: null, data }
}

// Close ticket
export async function closeTicket(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data, error } = await supabase
    .from('support_tickets')
    .update({ status: 'closed' })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/support-v2')
  return { error: null, data }
}

// Reopen ticket
export async function reopenTicket(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data, error } = await supabase
    .from('support_tickets')
    .update({ status: 'open', resolved_at: null, resolved_by: null })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/support-v2')
  return { error: null, data }
}

// Add reply to ticket
export async function addTicketReply(ticketId: string, message: string, isInternal: boolean = false) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

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
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/support-v2')
  return { error: null, data }
}

// Fetch ticket replies
export async function fetchTicketReplies(ticketId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data, error } = await supabase
    .from('support_ticket_replies')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

// Rate ticket satisfaction
export async function rateTicketSatisfaction(id: string, rating: number, feedback?: string) {
  const supabase = createServerActionClient({ cookies })

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
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/support-v2')
  return { error: null, data }
}
