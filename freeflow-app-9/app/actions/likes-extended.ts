'use server'

/**
 * Extended Likes Server Actions
 * Tables: likes, like_counts, like_notifications, like_reactions
 */

import { createClient } from '@/lib/supabase/server'

export async function toggleLike(likeData: { user_id: string; entity_type: string; entity_id: string }) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('likes').select('id').eq('user_id', likeData.user_id).eq('entity_type', likeData.entity_type).eq('entity_id', likeData.entity_id).single(); if (existing) { await supabase.from('likes').delete().eq('id', existing.id); await updateLikeCount(likeData.entity_type, likeData.entity_id, -1); return { success: true, data: { liked: false } } } else { const { data, error } = await supabase.from('likes').insert({ ...likeData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; await updateLikeCount(likeData.entity_type, likeData.entity_id, 1); return { success: true, data: { liked: true, like: data } } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

async function updateLikeCount(entityType: string, entityId: string, delta: number) {
  const supabase = await createClient()
  const { data: existing } = await supabase.from('like_counts').select('count').eq('entity_type', entityType).eq('entity_id', entityId).single()
  if (existing) {
    await supabase.from('like_counts').update({ count: Math.max(0, existing.count + delta), updated_at: new Date().toISOString() }).eq('entity_type', entityType).eq('entity_id', entityId)
  } else if (delta > 0) {
    await supabase.from('like_counts').insert({ entity_type: entityType, entity_id: entityId, count: 1, created_at: new Date().toISOString() })
  }
}

export async function getLike(userId: string, entityType: string, entityId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('likes').select('*').eq('user_id', userId).eq('entity_type', entityType).eq('entity_id', entityId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data, liked: !!data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', liked: false } }
}

export async function getLikeCount(entityType: string, entityId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('like_counts').select('count').eq('entity_type', entityType).eq('entity_id', entityId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, count: data?.count || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', count: 0 } }
}

export async function getLikesForEntity(entityType: string, entityId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('likes').select('*').eq('entity_type', entityType).eq('entity_id', entityId).order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUserLikes(userId: string, options?: { entity_type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('likes').select('*').eq('user_id', userId); if (options?.entity_type) query = query.eq('entity_type', options.entity_type); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addReaction(reactionData: { user_id: string; entity_type: string; entity_id: string; reaction_type: string }) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('like_reactions').select('id, reaction_type').eq('user_id', reactionData.user_id).eq('entity_type', reactionData.entity_type).eq('entity_id', reactionData.entity_id).single(); if (existing) { if (existing.reaction_type === reactionData.reaction_type) { await supabase.from('like_reactions').delete().eq('id', existing.id); return { success: true, data: { reacted: false } } } else { const { data, error } = await supabase.from('like_reactions').update({ reaction_type: reactionData.reaction_type, updated_at: new Date().toISOString() }).eq('id', existing.id).select().single(); if (error) throw error; return { success: true, data: { reacted: true, reaction: data } } } } else { const { data, error } = await supabase.from('like_reactions').insert({ ...reactionData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data: { reacted: true, reaction: data } } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getReactionsForEntity(entityType: string, entityId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('like_reactions').select('*').eq('entity_type', entityType).eq('entity_id', entityId).order('created_at', { ascending: false }); if (error) throw error; const reactionCounts: Record<string, number> = {}; data?.forEach(r => { reactionCounts[r.reaction_type] = (reactionCounts[r.reaction_type] || 0) + 1 }); return { success: true, data: data || [], counts: reactionCounts } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [], counts: {} } }
}

export async function getUserReaction(userId: string, entityType: string, entityId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('like_reactions').select('*').eq('user_id', userId).eq('entity_type', entityType).eq('entity_id', entityId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMostLiked(entityType: string, options?: { limit?: number; period?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('like_counts').select('*').eq('entity_type', entityType); if (options?.period) { const since = new Date(); if (options.period === 'day') since.setDate(since.getDate() - 1); else if (options.period === 'week') since.setDate(since.getDate() - 7); else if (options.period === 'month') since.setMonth(since.getMonth() - 1); query = query.gte('updated_at', since.toISOString()) } const { data, error } = await query.order('count', { ascending: false }).limit(options?.limit || 10); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
