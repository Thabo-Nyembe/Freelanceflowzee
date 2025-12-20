'use server'

/**
 * Extended Saved Server Actions
 * Tables: saved_items, saved_searches, saved_filters, saved_views
 */

import { createClient } from '@/lib/supabase/server'

export async function getSavedItem(itemId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('saved_items').select('*').eq('id', itemId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createSavedItem(itemData: { user_id: string; item_type: string; item_id: string; title?: string; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('saved_items').insert({ ...itemData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteSavedItem(itemId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('saved_items').delete().eq('id', itemId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSavedItems(options?: { user_id?: string; item_type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('saved_items').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.item_type) query = query.eq('item_type', options.item_type); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSavedSearches(options?: { user_id?: string; search_type?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('saved_searches').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.search_type) query = query.eq('search_type', options.search_type); const { data, error } = await query.order('last_used_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createSavedSearch(searchData: { user_id: string; name: string; query: string; search_type?: string; filters?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('saved_searches').insert({ ...searchData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSavedFilters(options?: { user_id?: string; filter_type?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('saved_filters').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.filter_type) query = query.eq('filter_type', options.filter_type); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSavedViews(options?: { user_id?: string; view_type?: string; is_default?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('saved_views').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.view_type) query = query.eq('view_type', options.view_type); if (options?.is_default !== undefined) query = query.eq('is_default', options.is_default); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
