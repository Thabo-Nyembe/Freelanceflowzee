'use server'

/**
 * Extended Pending Server Actions - Covers all Pending-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getPendingItems(userId: string, itemType?: string, limit = 50) {
  try { const supabase = await createClient(); let query = supabase.from('pending_items').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit); if (itemType) query = query.eq('item_type', itemType); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createPendingItem(userId: string, itemId: string, itemType: string, action: string, expiresAt?: string, metadata?: Record<string, any>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('pending_items').insert({ user_id: userId, item_id: itemId, item_type: itemType, action, expires_at: expiresAt, metadata, status: 'pending' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completePendingItem(pendingId: string, userId: string, result?: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('pending_items').update({ status: 'completed', result, completed_at: new Date().toISOString() }).eq('id', pendingId).eq('user_id', userId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cancelPendingItem(pendingId: string, userId: string, reason?: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('pending_items').update({ status: 'cancelled', cancel_reason: reason }).eq('id', pendingId).eq('user_id', userId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPendingCount(userId: string, itemType?: string) {
  try { const supabase = await createClient(); let query = supabase.from('pending_items').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'pending'); if (itemType) query = query.eq('item_type', itemType); const { count, error } = await query; if (error) throw error; return { success: true, count: count || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', count: 0 } }
}

export async function expirePendingItems() {
  try { const supabase = await createClient(); const { error } = await supabase.from('pending_items').update({ status: 'expired' }).eq('status', 'pending').lt('expires_at', new Date().toISOString()); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPendingByItem(itemId: string, itemType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('pending_items').select('*').eq('item_id', itemId).eq('item_type', itemType).eq('status', 'pending'); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getAllPendingByType(itemType: string, limit = 100) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('pending_items').select('*').eq('item_type', itemType).eq('status', 'pending').order('created_at', { ascending: true }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getPendingStats(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('pending_items').select('item_type, status').eq('user_id', userId); if (error) throw error; const stats: Record<string, Record<string, number>> = {}; data?.forEach(item => { if (!stats[item.item_type]) stats[item.item_type] = {}; stats[item.item_type][item.status] = (stats[item.item_type][item.status] || 0) + 1; }); return { success: true, data: stats } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: {} } }
}
