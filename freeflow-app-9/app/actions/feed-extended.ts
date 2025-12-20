'use server'

/**
 * Extended Feed Server Actions - Covers all Feed-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getFeedItems(userId: string, feedType?: string, limit = 50, offset = 0) {
  try { const supabase = await createClient(); let query = supabase.from('feed_items').select('*').eq('user_id', userId).order('created_at', { ascending: false }).range(offset, offset + limit - 1); if (feedType) query = query.eq('feed_type', feedType); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createFeedItem(userId: string, itemId: string, itemType: string, feedType: string, metadata?: Record<string, any>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('feed_items').insert({ user_id: userId, item_id: itemId, item_type: itemType, feed_type: feedType, metadata, is_read: false }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function markFeedItemRead(feedItemId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('feed_items').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', feedItemId).eq('user_id', userId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function markAllFeedRead(userId: string, feedType?: string) {
  try { const supabase = await createClient(); let query = supabase.from('feed_items').update({ is_read: true, read_at: new Date().toISOString() }).eq('user_id', userId).eq('is_read', false); if (feedType) query = query.eq('feed_type', feedType); const { error } = await query; if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteFeedItem(feedItemId: string, userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('feed_items').delete().eq('id', feedItemId).eq('user_id', userId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUnreadFeedCount(userId: string, feedType?: string) {
  try { const supabase = await createClient(); let query = supabase.from('feed_items').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('is_read', false); if (feedType) query = query.eq('feed_type', feedType); const { count, error } = await query; if (error) throw error; return { success: true, count: count || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', count: 0 } }
}

export async function getFeedSettings(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('feed_settings').select('*').eq('user_id', userId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateFeedSettings(userId: string, settings: Record<string, any>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('feed_settings').upsert({ user_id: userId, ...settings, updated_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function generateFeed(userId: string, followingIds: string[], limit = 50) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('feed_items').select('*').in('user_id', followingIds).order('created_at', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
