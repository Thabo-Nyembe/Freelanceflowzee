'use server'

/**
 * Extended Rating Server Actions - Covers all Rating-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getRatings(itemId: string, itemType: string, limit = 50) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ratings').select('*').eq('item_id', itemId).eq('item_type', itemType).order('created_at', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUserRating(userId: string, itemId: string, itemType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ratings').select('*').eq('user_id', userId).eq('item_id', itemId).eq('item_type', itemType).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setRating(userId: string, itemId: string, itemType: string, rating: number, review?: string) {
  try { const supabase = await createClient(); if (rating < 1 || rating > 5) throw new Error('Rating must be between 1 and 5'); const { data: existing } = await supabase.from('ratings').select('id').eq('user_id', userId).eq('item_id', itemId).eq('item_type', itemType).single(); if (existing) { const { data, error } = await supabase.from('ratings').update({ rating, review, updated_at: new Date().toISOString() }).eq('id', existing.id).select().single(); if (error) throw error; return { success: true, data }; } const { data, error } = await supabase.from('ratings').insert({ user_id: userId, item_id: itemId, item_type: itemType, rating, review }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeRating(userId: string, itemId: string, itemType: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('ratings').delete().eq('user_id', userId).eq('item_id', itemId).eq('item_type', itemType); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAverageRating(itemId: string, itemType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ratings').select('rating').eq('item_id', itemId).eq('item_type', itemType); if (error) throw error; if (!data || data.length === 0) return { success: true, average: 0, count: 0 }; const sum = data.reduce((acc, r) => acc + r.rating, 0); return { success: true, average: sum / data.length, count: data.length } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', average: 0, count: 0 } }
}

export async function getRatingDistribution(itemId: string, itemType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ratings').select('rating').eq('item_id', itemId).eq('item_type', itemType); if (error) throw error; const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }; data?.forEach(r => { distribution[r.rating] = (distribution[r.rating] || 0) + 1; }); return { success: true, data: distribution } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTopRated(itemType: string, minRatings = 5, limit = 10) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ratings').select('item_id, rating').eq('item_type', itemType); if (error) throw error; const itemStats: Record<string, { sum: number; count: number }> = {}; data?.forEach(r => { if (!itemStats[r.item_id]) itemStats[r.item_id] = { sum: 0, count: 0 }; itemStats[r.item_id].sum += r.rating; itemStats[r.item_id].count++; }); const rated = Object.entries(itemStats).filter(([_, stats]) => stats.count >= minRatings).map(([item_id, stats]) => ({ item_id, average: stats.sum / stats.count, count: stats.count })).sort((a, b) => b.average - a.average).slice(0, limit); return { success: true, data: rated } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUserRatings(userId: string, itemType?: string, limit = 50) {
  try { const supabase = await createClient(); let query = supabase.from('ratings').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit); if (itemType) query = query.eq('item_type', itemType); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRecentRatings(itemType?: string, limit = 20) {
  try { const supabase = await createClient(); let query = supabase.from('ratings').select('*').order('created_at', { ascending: false }).limit(limit); if (itemType) query = query.eq('item_type', itemType); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRatingsWithReviews(itemId: string, itemType: string, limit = 20) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ratings').select('*').eq('item_id', itemId).eq('item_type', itemType).not('review', 'is', null).order('created_at', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
