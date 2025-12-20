'use server'

/**
 * Extended Block Server Actions - Covers all Block-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getBlockedUsers(userId: string, limit = 50) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('blocks').select('*, blocked:profiles!blocked_id(*)').eq('blocker_id', userId).order('created_at', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function blockUser(blockerId: string, blockedId: string, reason?: string) {
  try { const supabase = await createClient(); if (blockerId === blockedId) throw new Error('Cannot block yourself'); const { data: existing } = await supabase.from('blocks').select('id').eq('blocker_id', blockerId).eq('blocked_id', blockedId).single(); if (existing) return { success: true, alreadyBlocked: true }; const { data, error } = await supabase.from('blocks').insert({ blocker_id: blockerId, blocked_id: blockedId, reason }).select().single(); if (error) throw error; await supabase.from('follows').delete().or(`and(follower_id.eq.${blockerId},following_id.eq.${blockedId}),and(follower_id.eq.${blockedId},following_id.eq.${blockerId})`); await supabase.from('friends').delete().or(`and(user_id.eq.${blockerId},friend_id.eq.${blockedId}),and(user_id.eq.${blockedId},friend_id.eq.${blockerId})`); await supabase.from('connections').delete().or(`and(user_id.eq.${blockerId},connected_user_id.eq.${blockedId}),and(user_id.eq.${blockedId},connected_user_id.eq.${blockerId})`); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function unblockUser(blockerId: string, blockedId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('blocks').delete().eq('blocker_id', blockerId).eq('blocked_id', blockedId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function isBlocked(userId: string, otherUserId: string) {
  try { const supabase = await createClient(); const { data } = await supabase.from('blocks').select('id, blocker_id').or(`and(blocker_id.eq.${userId},blocked_id.eq.${otherUserId}),and(blocker_id.eq.${otherUserId},blocked_id.eq.${userId})`).single(); if (!data) return { success: true, blocked: false, blockedBy: null }; return { success: true, blocked: true, blockedBy: data.blocker_id === userId ? 'me' : 'them' } } catch (error) { return { success: false, blocked: false, blockedBy: null } }
}

export async function hasBlocked(blockerId: string, blockedId: string) {
  try { const supabase = await createClient(); const { data } = await supabase.from('blocks').select('id').eq('blocker_id', blockerId).eq('blocked_id', blockedId).single(); return { success: true, hasBlocked: !!data } } catch (error) { return { success: false, hasBlocked: false } }
}

export async function getBlockCount(userId: string) {
  try { const supabase = await createClient(); const { count, error } = await supabase.from('blocks').select('*', { count: 'exact', head: true }).eq('blocker_id', userId); if (error) throw error; return { success: true, count: count || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', count: 0 } }
}

export async function getBlockedByCount(userId: string) {
  try { const supabase = await createClient(); const { count, error } = await supabase.from('blocks').select('*', { count: 'exact', head: true }).eq('blocked_id', userId); if (error) throw error; return { success: true, count: count || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', count: 0 } }
}

export async function getBlockedIds(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('blocks').select('blocked_id').eq('blocker_id', userId); if (error) throw error; return { success: true, data: data?.map(b => b.blocked_id) || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getBlockedByIds(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('blocks').select('blocker_id').eq('blocked_id', userId); if (error) throw error; return { success: true, data: data?.map(b => b.blocker_id) || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getAllBlockRelations(userId: string) {
  try { const supabase = await createClient(); const [blocked, blockedBy] = await Promise.all([ supabase.from('blocks').select('blocked_id').eq('blocker_id', userId), supabase.from('blocks').select('blocker_id').eq('blocked_id', userId) ]); return { success: true, blocked: blocked.data?.map(b => b.blocked_id) || [], blockedBy: blockedBy.data?.map(b => b.blocker_id) || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', blocked: [], blockedBy: [] } }
}
