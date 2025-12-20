'use server'

/**
 * Extended Ticket Server Actions
 * Tables: tickets, ticket_comments, ticket_attachments, ticket_history
 */

import { createClient } from '@/lib/supabase/server'

export async function getTicket(ticketId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tickets').select('*, ticket_comments(*), ticket_attachments(*)').eq('id', ticketId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createTicket(ticketData: { title: string; description: string; user_id: string; priority?: string; category?: string; assigned_to?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tickets').insert({ ...ticketData, status: 'open', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTicket(ticketId: string, updates: Partial<{ title: string; description: string; status: string; priority: string; assigned_to: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tickets').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', ticketId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function closeTicket(ticketId: string, resolution?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tickets').update({ status: 'closed', resolution, closed_at: new Date().toISOString() }).eq('id', ticketId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTickets(options?: { user_id?: string; status?: string; priority?: string; assigned_to?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('tickets').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.status) query = query.eq('status', options.status); if (options?.priority) query = query.eq('priority', options.priority); if (options?.assigned_to) query = query.eq('assigned_to', options.assigned_to); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addTicketComment(ticketId: string, commentData: { user_id: string; content: string; is_internal?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ticket_comments').insert({ ticket_id: ticketId, ...commentData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTicketComments(ticketId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ticket_comments').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTicketHistory(ticketId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ticket_history').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
