'use server'

/**
 * Extended Connection Server Actions - Covers all Connection-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getConnections(userId: string, status?: string, limit = 50) {
  try { const supabase = await createClient(); let query = supabase.from('connections').select('*').or(`user_id.eq.${userId},connected_user_id.eq.${userId}`).order('created_at', { ascending: false }).limit(limit); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function sendConnectionRequest(senderId: string, receiverId: string, message?: string) {
  try { const supabase = await createClient(); if (senderId === receiverId) throw new Error('Cannot connect with yourself'); const { data: existing } = await supabase.from('connections').select('id, status').or(`and(user_id.eq.${senderId},connected_user_id.eq.${receiverId}),and(user_id.eq.${receiverId},connected_user_id.eq.${senderId})`).single(); if (existing) { if (existing.status === 'accepted') return { success: true, alreadyConnected: true }; if (existing.status === 'pending') return { success: true, alreadyPending: true }; } const { data, error } = await supabase.from('connections').insert({ user_id: senderId, connected_user_id: receiverId, status: 'pending', message }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function acceptConnection(connectionId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('connections').update({ status: 'accepted', accepted_at: new Date().toISOString() }).eq('id', connectionId).eq('connected_user_id', userId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function rejectConnection(connectionId: string, userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('connections').delete().eq('id', connectionId).eq('connected_user_id', userId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeConnection(userId: string, connectedUserId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('connections').delete().or(`and(user_id.eq.${userId},connected_user_id.eq.${connectedUserId}),and(user_id.eq.${connectedUserId},connected_user_id.eq.${userId})`); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPendingRequests(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('connections').select('*').eq('connected_user_id', userId).eq('status', 'pending').order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSentRequests(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('connections').select('*').eq('user_id', userId).eq('status', 'pending').order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getConnectionStatus(userId: string, otherUserId: string) {
  try { const supabase = await createClient(); const { data } = await supabase.from('connections').select('status, user_id').or(`and(user_id.eq.${userId},connected_user_id.eq.${otherUserId}),and(user_id.eq.${otherUserId},connected_user_id.eq.${userId})`).single(); if (!data) return { success: true, status: 'none' }; return { success: true, status: data.status, isRequester: data.user_id === userId } } catch (error) { return { success: false, status: 'none' } }
}

export async function getConnectionCount(userId: string) {
  try { const supabase = await createClient(); const { count, error } = await supabase.from('connections').select('*', { count: 'exact', head: true }).eq('status', 'accepted').or(`user_id.eq.${userId},connected_user_id.eq.${userId}`); if (error) throw error; return { success: true, count: count || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', count: 0 } }
}

export async function getMutualConnections(userId1: string, userId2: string) {
  try { const supabase = await createClient(); const { data: conn1 } = await supabase.from('connections').select('user_id, connected_user_id').eq('status', 'accepted').or(`user_id.eq.${userId1},connected_user_id.eq.${userId1}`); const { data: conn2 } = await supabase.from('connections').select('user_id, connected_user_id').eq('status', 'accepted').or(`user_id.eq.${userId2},connected_user_id.eq.${userId2}`); const set1 = new Set<string>(); conn1?.forEach(c => { set1.add(c.user_id === userId1 ? c.connected_user_id : c.user_id); }); const mutual: string[] = []; conn2?.forEach(c => { const other = c.user_id === userId2 ? c.connected_user_id : c.user_id; if (set1.has(other)) mutual.push(other); }); return { success: true, data: mutual, count: mutual.length } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [], count: 0 } }
}
