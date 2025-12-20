'use server'

/**
 * Extended Store Server Actions
 * Tables: stores, store_products, store_categories, store_settings
 */

import { createClient } from '@/lib/supabase/server'

export async function getStore(storeId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('stores').select('*').eq('id', storeId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createStore(storeData: { name: string; user_id: string; description?: string; type?: string; currency?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('stores').insert({ ...storeData, status: 'active', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateStore(storeId: string, updates: Partial<{ name: string; description: string; status: string; settings: Record<string, any> }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('stores').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', storeId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteStore(storeId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('stores').delete().eq('id', storeId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getStores(options?: { user_id?: string; status?: string; type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('stores').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.status) query = query.eq('status', options.status); if (options?.type) query = query.eq('type', options.type); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getStoreProducts(storeId: string, options?: { category_id?: string; is_active?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('store_products').select('*').eq('store_id', storeId); if (options?.category_id) query = query.eq('category_id', options.category_id); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getStoreCategories(storeId: string, options?: { is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('store_categories').select('*').eq('store_id', storeId); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getStoreSettings(storeId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('store_settings').select('*').eq('store_id', storeId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
