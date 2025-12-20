'use server'

/**
 * Extended Favorite Server Actions - Covers all Favorite-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getFavorites(userId: string, itemType?: string, limit = 50) {
  try { const supabase = await createClient(); let query = supabase.from('favorites').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit); if (itemType) query = query.eq('item_type', itemType); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addFavorite(userId: string, itemId: string, itemType: string, metadata?: any) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('favorites').select('id').eq('user_id', userId).eq('item_id', itemId).eq('item_type', itemType).single(); if (existing) return { success: true, data: existing }; const { data, error } = await supabase.from('favorites').insert({ user_id: userId, item_id: itemId, item_type: itemType, metadata }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeFavorite(userId: string, itemId: string, itemType: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('favorites').delete().eq('user_id', userId).eq('item_id', itemId).eq('item_type', itemType); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function toggleFavorite(userId: string, itemId: string, itemType: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('favorites').select('id').eq('user_id', userId).eq('item_id', itemId).eq('item_type', itemType).single(); if (existing) { await supabase.from('favorites').delete().eq('id', existing.id); return { success: true, favorited: false }; } const { data, error } = await supabase.from('favorites').insert({ user_id: userId, item_id: itemId, item_type: itemType }).select().single(); if (error) throw error; return { success: true, favorited: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function isFavorited(userId: string, itemId: string, itemType: string) {
  try { const supabase = await createClient(); const { data } = await supabase.from('favorites').select('id').eq('user_id', userId).eq('item_id', itemId).eq('item_type', itemType).single(); return { success: true, favorited: !!data } } catch (error) { return { success: false, favorited: false } }
}

export async function getFavoriteCount(itemId: string, itemType: string) {
  try { const supabase = await createClient(); const { count, error } = await supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('item_id', itemId).eq('item_type', itemType); if (error) throw error; return { success: true, count: count || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', count: 0 } }
}

export async function getUserFavoriteStats(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('favorites').select('item_type').eq('user_id', userId); if (error) throw error; const stats = { total: data?.length || 0, by_type: {} as Record<string, number> }; data?.forEach(f => { stats.by_type[f.item_type] = (stats.by_type[f.item_type] || 0) + 1; }); return { success: true, data: stats } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMostFavorited(itemType: string, limit = 10) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('favorites').select('item_id').eq('item_type', itemType); if (error) throw error; const counts: Record<string, number> = {}; data?.forEach(f => { counts[f.item_id] = (counts[f.item_id] || 0) + 1; }); const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([item_id, count]) => ({ item_id, count })); return { success: true, data: sorted } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function bulkAddFavorites(userId: string, items: { item_id: string; item_type: string }[]) {
  try { const supabase = await createClient(); const inserts = items.map(item => ({ user_id: userId, ...item })); const { data, error } = await supabase.from('favorites').upsert(inserts, { onConflict: 'user_id,item_id,item_type', ignoreDuplicates: true }).select(); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
