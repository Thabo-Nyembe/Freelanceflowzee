'use server'

/**
 * Extended Friend Server Actions - Covers all Friend-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getFriends(userId: string, limit = 50, offset = 0) {
  try { const supabase = await createClient(); const { data, error, count } = await supabase.from('friends').select('*', { count: 'exact' }).eq('status', 'accepted').or(`user_id.eq.${userId},friend_id.eq.${userId}`).order('created_at', { ascending: false }).range(offset, offset + limit - 1); if (error) throw error; return { success: true, data: data || [], total: count || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [], total: 0 } }
}

export async function sendFriendRequest(senderId: string, receiverId: string, message?: string) {
  try { const supabase = await createClient(); if (senderId === receiverId) throw new Error('Cannot send friend request to yourself'); const { data: existing } = await supabase.from('friends').select('id, status').or(`and(user_id.eq.${senderId},friend_id.eq.${receiverId}),and(user_id.eq.${receiverId},friend_id.eq.${senderId})`).single(); if (existing) { if (existing.status === 'accepted') return { success: true, alreadyFriends: true }; if (existing.status === 'pending') return { success: true, alreadyPending: true }; } const { data, error } = await supabase.from('friends').insert({ user_id: senderId, friend_id: receiverId, status: 'pending', message }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function acceptFriendRequest(requestId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('friends').update({ status: 'accepted', accepted_at: new Date().toISOString() }).eq('id', requestId).eq('friend_id', userId).eq('status', 'pending').select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function rejectFriendRequest(requestId: string, userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('friends').update({ status: 'rejected' }).eq('id', requestId).eq('friend_id', userId).eq('status', 'pending'); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeFriend(userId: string, friendId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('friends').delete().or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPendingFriendRequests(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('friends').select('*').eq('friend_id', userId).eq('status', 'pending').order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSentFriendRequests(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('friends').select('*').eq('user_id', userId).eq('status', 'pending').order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getFriendStatus(userId: string, otherUserId: string) {
  try { const supabase = await createClient(); const { data } = await supabase.from('friends').select('status, user_id').or(`and(user_id.eq.${userId},friend_id.eq.${otherUserId}),and(user_id.eq.${otherUserId},friend_id.eq.${userId})`).single(); if (!data) return { success: true, status: 'none' }; return { success: true, status: data.status, isRequester: data.user_id === userId } } catch (error) { return { success: false, status: 'none' } }
}

export async function getFriendCount(userId: string) {
  try { const supabase = await createClient(); const { count, error } = await supabase.from('friends').select('*', { count: 'exact', head: true }).eq('status', 'accepted').or(`user_id.eq.${userId},friend_id.eq.${userId}`); if (error) throw error; return { success: true, count: count || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', count: 0 } }
}

export async function getMutualFriends(userId1: string, userId2: string) {
  try { const supabase = await createClient(); const { data: friends1 } = await supabase.from('friends').select('user_id, friend_id').eq('status', 'accepted').or(`user_id.eq.${userId1},friend_id.eq.${userId1}`); const { data: friends2 } = await supabase.from('friends').select('user_id, friend_id').eq('status', 'accepted').or(`user_id.eq.${userId2},friend_id.eq.${userId2}`); const set1 = new Set<string>(); friends1?.forEach(f => { set1.add(f.user_id === userId1 ? f.friend_id : f.user_id); }); const mutual: string[] = []; friends2?.forEach(f => { const other = f.user_id === userId2 ? f.friend_id : f.user_id; if (set1.has(other)) mutual.push(other); }); return { success: true, data: mutual, count: mutual.length } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [], count: 0 } }
}
