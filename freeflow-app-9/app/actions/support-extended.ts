'use server'

/**
 * Extended Support Server Actions - Covers all 5 Support-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getSupportAgents(activeOnly = true) {
  try { const supabase = await createClient(); let query = supabase.from('support_agents').select('*').order('name', { ascending: true }); if (activeOnly) query = query.eq('is_active', true); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createSupportAgent(userId: string, input: { name: string; email: string; department?: string; skills?: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('support_agents').insert({ user_id: userId, ...input, is_active: true, status: 'available' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSupportAgent(agentId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('support_agents').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', agentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSupportAgentStatus(agentId: string, status: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('support_agents').update({ status }).eq('id', agentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deactivateSupportAgent(agentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('support_agents').update({ is_active: false }).eq('id', agentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSupportChannels(activeOnly = true) {
  try { const supabase = await createClient(); let query = supabase.from('support_channels').select('*').order('name', { ascending: true }); if (activeOnly) query = query.eq('is_active', true); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createSupportChannel(input: { name: string; type: string; config?: any; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('support_channels').insert({ ...input, is_active: input.is_active ?? true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSupportChannel(channelId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('support_channels').update(updates).eq('id', channelId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSupportConversations(ticketId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('support_conversations').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addSupportConversationMessage(ticketId: string, senderId: string, senderType: string, message: string, attachments?: any[]) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('support_conversations').insert({ ticket_id: ticketId, sender_id: senderId, sender_type: senderType, message, attachments }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSupportTicketReplies(ticketId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('support_ticket_replies').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createSupportTicketReply(ticketId: string, userId: string, input: { content: string; is_internal?: boolean; attachments?: any[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('support_ticket_replies').insert({ ticket_id: ticketId, user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSupportTickets(userId: string, status?: string) {
  try { const supabase = await createClient(); let query = supabase.from('support_tickets').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createSupportTicket(userId: string, input: { subject: string; description: string; priority?: string; category?: string; channel_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('support_tickets').insert({ user_id: userId, ...input, status: 'open', priority: input.priority || 'medium' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSupportTicket(ticketId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('support_tickets').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', ticketId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function assignSupportTicket(ticketId: string, agentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('support_tickets').update({ assigned_to: agentId, status: 'in_progress', assigned_at: new Date().toISOString() }).eq('id', ticketId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function closeSupportTicket(ticketId: string, resolution?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('support_tickets').update({ status: 'closed', resolution, closed_at: new Date().toISOString() }).eq('id', ticketId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function reopenSupportTicket(ticketId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('support_tickets').update({ status: 'open', closed_at: null }).eq('id', ticketId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
