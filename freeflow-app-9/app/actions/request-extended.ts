'use server'

/**
 * Extended Request Server Actions - Covers all Request-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getRequests(userId?: string, requestType?: string, status?: string, limit = 50) {
  try { const supabase = await createClient(); let query = supabase.from('requests').select('*').order('created_at', { ascending: false }).limit(limit); if (userId) query = query.or(`requester_id.eq.${userId},assignee_id.eq.${userId}`); if (requestType) query = query.eq('request_type', requestType); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createRequest(requesterId: string, requestType: string, title: string, description?: string, priority = 'normal', assigneeId?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('requests').insert({ requester_id: requesterId, request_type: requestType, title, description, priority, assignee_id: assigneeId, status: 'pending' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateRequestStatus(requestId: string, status: string, note?: string) {
  try { const supabase = await createClient(); const updates: any = { status, updated_at: new Date().toISOString() }; if (status === 'completed') updates.completed_at = new Date().toISOString(); if (note) updates.status_note = note; const { data, error } = await supabase.from('requests').update(updates).eq('id', requestId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function assignRequest(requestId: string, assigneeId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('requests').update({ assignee_id: assigneeId, assigned_at: new Date().toISOString(), status: 'assigned' }).eq('id', requestId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cancelRequest(requestId: string, requesterId: string, reason?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('requests').update({ status: 'cancelled', cancel_reason: reason, cancelled_at: new Date().toISOString() }).eq('id', requestId).eq('requester_id', requesterId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRequestById(requestId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('requests').select('*').eq('id', requestId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRequestCount(userId: string, status?: string) {
  try { const supabase = await createClient(); let query = supabase.from('requests').select('*', { count: 'exact', head: true }).or(`requester_id.eq.${userId},assignee_id.eq.${userId}`); if (status) query = query.eq('status', status); const { count, error } = await query; if (error) throw error; return { success: true, count: count || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', count: 0 } }
}

export async function addRequestComment(requestId: string, userId: string, comment: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('request_comments').insert({ request_id: requestId, user_id: userId, comment }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
