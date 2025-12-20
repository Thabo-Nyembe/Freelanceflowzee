'use server'

/**
 * Extended Activity Server Actions - Covers all Activity-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getActivities(userId?: string, itemId?: string, itemType?: string, limit = 50) {
  try { const supabase = await createClient(); let query = supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(limit); if (userId) query = query.eq('user_id', userId); if (itemId) query = query.eq('item_id', itemId); if (itemType) query = query.eq('item_type', itemType); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createActivity(userId: string, action: string, itemId?: string, itemType?: string, metadata?: Record<string, any>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('activities').insert({ user_id: userId, action, item_id: itemId, item_type: itemType, metadata, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getActivityFeed(userId: string, followingIds: string[], limit = 50) {
  try { const supabase = await createClient(); const allIds = [userId, ...followingIds]; const { data, error } = await supabase.from('activities').select('*').in('user_id', allIds).order('created_at', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getActivityByAction(action: string, limit = 50) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('activities').select('*').eq('action', action).order('created_at', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRecentActivity(userId: string, since: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('activities').select('*').eq('user_id', userId).gte('created_at', since).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function deleteActivity(activityId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('activities').delete().eq('id', activityId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getActivityCount(userId: string, action?: string) {
  try { const supabase = await createClient(); let query = supabase.from('activities').select('*', { count: 'exact', head: true }).eq('user_id', userId); if (action) query = query.eq('action', action); const { count, error } = await query; if (error) throw error; return { success: true, count: count || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', count: 0 } }
}

export async function getActivityStats(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('activities').select('action').eq('user_id', userId); if (error) throw error; const stats: Record<string, number> = {}; data?.forEach(a => { stats[a.action] = (stats[a.action] || 0) + 1; }); return { success: true, data: stats } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: {} } }
}

export async function cleanupOldActivities(olderThan: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('activities').delete().lt('created_at', olderThan); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
