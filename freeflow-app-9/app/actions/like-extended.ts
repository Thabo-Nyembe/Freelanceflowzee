'use server'

/**
 * Extended Like Server Actions - Covers all Like-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getLikes(itemId: string, itemType: string, limit = 50) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('likes').select('*').eq('item_id', itemId).eq('item_type', itemType).order('created_at', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addLike(userId: string, itemId: string, itemType: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('likes').select('id').eq('user_id', userId).eq('item_id', itemId).eq('item_type', itemType).single(); if (existing) return { success: true, data: existing }; const { data, error } = await supabase.from('likes').insert({ user_id: userId, item_id: itemId, item_type: itemType }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeLike(userId: string, itemId: string, itemType: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('likes').delete().eq('user_id', userId).eq('item_id', itemId).eq('item_type', itemType); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function toggleLike(userId: string, itemId: string, itemType: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('likes').select('id').eq('user_id', userId).eq('item_id', itemId).eq('item_type', itemType).single(); if (existing) { await supabase.from('likes').delete().eq('id', existing.id); return { success: true, liked: false }; } const { data, error } = await supabase.from('likes').insert({ user_id: userId, item_id: itemId, item_type: itemType }).select().single(); if (error) throw error; return { success: true, liked: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function isLiked(userId: string, itemId: string, itemType: string) {
  try { const supabase = await createClient(); const { data } = await supabase.from('likes').select('id').eq('user_id', userId).eq('item_id', itemId).eq('item_type', itemType).single(); return { success: true, liked: !!data } } catch (error) { return { success: false, liked: false } }
}

export async function getLikeCount(itemId: string, itemType: string) {
  try { const supabase = await createClient(); const { count, error } = await supabase.from('likes').select('*', { count: 'exact', head: true }).eq('item_id', itemId).eq('item_type', itemType); if (error) throw error; return { success: true, count: count || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', count: 0 } }
}

export async function getUserLikes(userId: string, itemType?: string, limit = 50) {
  try { const supabase = await createClient(); let query = supabase.from('likes').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit); if (itemType) query = query.eq('item_type', itemType); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getMostLiked(itemType: string, limit = 10) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('likes').select('item_id').eq('item_type', itemType); if (error) throw error; const counts: Record<string, number> = {}; data?.forEach(l => { counts[l.item_id] = (counts[l.item_id] || 0) + 1; }); const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([item_id, count]) => ({ item_id, count })); return { success: true, data: sorted } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
