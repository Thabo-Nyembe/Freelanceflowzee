'use server'

/**
 * Extended Tickets Server Actions
 * Tables: tickets, ticket_comments, ticket_assignments, ticket_tags, ticket_history, ticket_attachments
 */

import { createClient } from '@/lib/supabase/server'

export async function getTicket(ticketId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tickets').select('*, ticket_comments(*, users(*)), ticket_assignments(*, users(*)), ticket_tags(*), ticket_attachments(*)').eq('id', ticketId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createTicket(ticketData: { title: string; description: string; ticket_type?: string; priority?: string; category?: string; created_by: string; assigned_to?: string; department?: string; due_date?: string; metadata?: any }) {
  try { const supabase = await createClient(); const ticketNumber = `TKT-${Date.now()}`; const { data: ticket, error: ticketError } = await supabase.from('tickets').insert({ ...ticketData, ticket_number: ticketNumber, priority: ticketData.priority || 'medium', status: 'open', created_at: new Date().toISOString() }).select().single(); if (ticketError) throw ticketError; await logHistory(ticket.id, 'created', { title: ticketData.title }, ticketData.created_by); if (ticketData.assigned_to) { await assignTicket(ticket.id, ticketData.assigned_to, ticketData.created_by) } return { success: true, data: ticket } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTicket(ticketId: string, updates: Partial<{ title: string; description: string; ticket_type: string; priority: string; category: string; status: string; department: string; due_date: string; resolved_at: string; metadata: any }>, userId?: string) {
  try { const supabase = await createClient(); const { data: current } = await supabase.from('tickets').select('status, priority').eq('id', ticketId).single(); const { data, error } = await supabase.from('tickets').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', ticketId).select().single(); if (error) throw error; const changes: any = {}; if (updates.status && updates.status !== current?.status) changes.status = { from: current?.status, to: updates.status }; if (updates.priority && updates.priority !== current?.priority) changes.priority = { from: current?.priority, to: updates.priority }; if (Object.keys(changes).length > 0) { await logHistory(ticketId, 'updated', changes, userId) } return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteTicket(ticketId: string) {
  try { const supabase = await createClient(); await supabase.from('ticket_comments').delete().eq('ticket_id', ticketId); await supabase.from('ticket_assignments').delete().eq('ticket_id', ticketId); await supabase.from('ticket_tags').delete().eq('ticket_id', ticketId); await supabase.from('ticket_history').delete().eq('ticket_id', ticketId); await supabase.from('ticket_attachments').delete().eq('ticket_id', ticketId); const { error } = await supabase.from('tickets').delete().eq('id', ticketId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTickets(options?: { ticket_type?: string; status?: string; priority?: string; category?: string; department?: string; created_by?: string; assigned_to?: string; overdue?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('tickets').select('*, ticket_assignments(*, users(*)), ticket_tags(*)'); if (options?.ticket_type) query = query.eq('ticket_type', options.ticket_type); if (options?.status) query = query.eq('status', options.status); if (options?.priority) query = query.eq('priority', options.priority); if (options?.category) query = query.eq('category', options.category); if (options?.department) query = query.eq('department', options.department); if (options?.created_by) query = query.eq('created_by', options.created_by); if (options?.overdue) query = query.lt('due_date', new Date().toISOString()).not('status', 'in', '(resolved,closed)'); if (options?.search) query = query.or(`title.ilike.%${options.search}%,ticket_number.ilike.%${options.search}%`); if (options?.assigned_to) { const { data: assignments } = await supabase.from('ticket_assignments').select('ticket_id').eq('user_id', options.assigned_to); if (assignments && assignments.length > 0) { query = query.in('id', assignments.map(a => a.ticket_id)) } else { return { success: true, data: [] } } } const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addComment(ticketId: string, commentData: { content: string; user_id: string; is_internal?: boolean; reply_to_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ticket_comments').insert({ ticket_id: ticketId, ...commentData, is_internal: commentData.is_internal ?? false, created_at: new Date().toISOString() }).select('*, users(*)').single(); if (error) throw error; await supabase.from('tickets').update({ updated_at: new Date().toISOString() }).eq('id', ticketId); await logHistory(ticketId, 'comment_added', { comment_id: data.id, is_internal: data.is_internal }, commentData.user_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getComments(ticketId: string, options?: { is_internal?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('ticket_comments').select('*, users(*)').eq('ticket_id', ticketId); if (options?.is_internal !== undefined) query = query.eq('is_internal', options.is_internal); const { data, error } = await query.order('created_at', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function assignTicket(ticketId: string, userId: string, assignedBy?: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('ticket_assignments').select('id').eq('ticket_id', ticketId).eq('user_id', userId).single(); if (existing) return { success: false, error: 'User is already assigned' }; const { data, error } = await supabase.from('ticket_assignments').insert({ ticket_id: ticketId, user_id: userId, assigned_by: assignedBy, assigned_at: new Date().toISOString(), created_at: new Date().toISOString() }).select('*, users(*)').single(); if (error) throw error; await logHistory(ticketId, 'assigned', { user_id: userId }, assignedBy); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function unassignTicket(ticketId: string, userId: string, unassignedBy?: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('ticket_assignments').delete().eq('ticket_id', ticketId).eq('user_id', userId); if (error) throw error; await logHistory(ticketId, 'unassigned', { user_id: userId }, unassignedBy); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addTag(ticketId: string, tag: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ticket_tags').insert({ ticket_id: ticketId, tag, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeTag(ticketId: string, tag: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('ticket_tags').delete().eq('ticket_id', ticketId).eq('tag', tag); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

async function logHistory(ticketId: string, action: string, details?: any, userId?: string) {
  const supabase = await createClient()
  await supabase.from('ticket_history').insert({ ticket_id: ticketId, action, details, performed_by: userId, occurred_at: new Date().toISOString(), created_at: new Date().toISOString() })
}

export async function getHistory(ticketId: string, options?: { action?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('ticket_history').select('*, users(*)').eq('ticket_id', ticketId); if (options?.action) query = query.eq('action', options.action); const { data, error } = await query.order('occurred_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function resolveTicket(ticketId: string, resolution: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tickets').update({ status: 'resolved', resolution, resolved_by: userId, resolved_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', ticketId).select().single(); if (error) throw error; await logHistory(ticketId, 'resolved', { resolution }, userId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function reopenTicket(ticketId: string, reason: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tickets').update({ status: 'open', resolution: null, resolved_by: null, resolved_at: null, updated_at: new Date().toISOString() }).eq('id', ticketId).select().single(); if (error) throw error; await logHistory(ticketId, 'reopened', { reason }, userId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addAttachment(ticketId: string, attachmentData: { file_name: string; file_url: string; file_size?: number; mime_type?: string; uploaded_by: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ticket_attachments').insert({ ticket_id: ticketId, ...attachmentData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getStats(options?: { department?: string; from_date?: string; to_date?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('tickets').select('status, priority, created_at, resolved_at'); if (options?.department) query = query.eq('department', options.department); if (options?.from_date) query = query.gte('created_at', options.from_date); if (options?.to_date) query = query.lte('created_at', options.to_date); const { data } = await query; const tickets = data || []; const now = new Date(); const stats = { total: tickets.length, open: tickets.filter(t => t.status === 'open').length, inProgress: tickets.filter(t => t.status === 'in_progress').length, resolved: tickets.filter(t => t.status === 'resolved').length, closed: tickets.filter(t => t.status === 'closed').length, byPriority: { critical: tickets.filter(t => t.priority === 'critical').length, high: tickets.filter(t => t.priority === 'high').length, medium: tickets.filter(t => t.priority === 'medium').length, low: tickets.filter(t => t.priority === 'low').length }, avgResolutionTime: 0 }; const resolvedTickets = tickets.filter(t => t.resolved_at); if (resolvedTickets.length > 0) { const totalTime = resolvedTickets.reduce((sum, t) => sum + (new Date(t.resolved_at).getTime() - new Date(t.created_at).getTime()), 0); stats.avgResolutionTime = totalTime / resolvedTickets.length / (1000 * 60 * 60) } return { success: true, data: stats } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
