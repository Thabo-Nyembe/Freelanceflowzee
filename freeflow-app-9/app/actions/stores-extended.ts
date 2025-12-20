'use server'

/**
 * Extended Stores Server Actions
 * Tables: stores, store_settings, store_hours, store_locations, store_staff, store_analytics
 */

import { createClient } from '@/lib/supabase/server'

export async function getStore(storeId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('stores').select('*, store_settings(*), store_hours(*), store_locations(*)').eq('id', storeId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createStore(storeData: { name: string; code?: string; description?: string; type?: string; owner_id?: string; address?: any; phone?: string; email?: string; website?: string; timezone?: string; currency?: string; is_active?: boolean; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('stores').insert({ ...storeData, code: storeData.code || `STR-${Date.now()}`, is_active: storeData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateStore(storeId: string, updates: Partial<{ name: string; description: string; type: string; address: any; phone: string; email: string; website: string; timezone: string; currency: string; is_active: boolean; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('stores').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', storeId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteStore(storeId: string) {
  try { const supabase = await createClient(); await supabase.from('store_settings').delete().eq('store_id', storeId); await supabase.from('store_hours').delete().eq('store_id', storeId); await supabase.from('store_staff').delete().eq('store_id', storeId); const { error } = await supabase.from('stores').delete().eq('id', storeId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getStores(options?: { type?: string; owner_id?: string; is_active?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('stores').select('*, store_locations(*)'); if (options?.type) query = query.eq('type', options.type); if (options?.owner_id) query = query.eq('owner_id', options.owner_id); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.search) query = query.or(`name.ilike.%${options.search}%,code.ilike.%${options.search}%`); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function updateSettings(storeId: string, settings: Record<string, any>) {
  try { const supabase = await createClient(); const settingsArray = Object.entries(settings).map(([key, value]) => ({ store_id: storeId, setting_key: key, setting_value: value, updated_at: new Date().toISOString() })); for (const setting of settingsArray) { await supabase.from('store_settings').upsert(setting, { onConflict: 'store_id,setting_key' }) } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSettings(storeId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('store_settings').select('*').eq('store_id', storeId); if (error) throw error; const settingsMap: Record<string, any> = {}; data?.forEach(s => { settingsMap[s.setting_key] = s.setting_value }); return { success: true, data: settingsMap } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: {} } }
}

export async function setStoreHours(storeId: string, hours: { day_of_week: number; open_time?: string; close_time?: string; is_closed?: boolean }[]) {
  try { const supabase = await createClient(); await supabase.from('store_hours').delete().eq('store_id', storeId); if (hours.length > 0) { const hoursData = hours.map(h => ({ store_id: storeId, ...h, created_at: new Date().toISOString() })); await supabase.from('store_hours').insert(hoursData) } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getStoreHours(storeId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('store_hours').select('*').eq('store_id', storeId).order('day_of_week', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addStaffMember(storeId: string, staffData: { user_id: string; role: string; permissions?: any; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('store_staff').insert({ store_id: storeId, ...staffData, is_active: staffData.is_active ?? true, joined_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getStoreStaff(storeId: string, options?: { role?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('store_staff').select('*, users(*)').eq('store_id', storeId); if (options?.role) query = query.eq('role', options.role); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('joined_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function removeStaffMember(storeId: string, userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('store_staff').delete().eq('store_id', storeId).eq('user_id', userId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function recordAnalytics(storeId: string, analyticsData: { metric_type: string; metric_value: number; period?: string; dimensions?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('store_analytics').insert({ store_id: storeId, ...analyticsData, recorded_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAnalytics(storeId: string, options?: { metric_type?: string; period?: string; from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('store_analytics').select('*').eq('store_id', storeId); if (options?.metric_type) query = query.eq('metric_type', options.metric_type); if (options?.period) query = query.eq('period', options.period); if (options?.from_date) query = query.gte('recorded_at', options.from_date); if (options?.to_date) query = query.lte('recorded_at', options.to_date); const { data, error } = await query.order('recorded_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function isStoreOpen(storeId: string) {
  try { const supabase = await createClient(); const now = new Date(); const dayOfWeek = now.getDay(); const { data } = await supabase.from('store_hours').select('*').eq('store_id', storeId).eq('day_of_week', dayOfWeek).single(); if (!data || data.is_closed) return { success: true, data: { isOpen: false } }; const currentTime = now.toTimeString().slice(0, 5); const isOpen = currentTime >= data.open_time && currentTime <= data.close_time; return { success: true, data: { isOpen, openTime: data.open_time, closeTime: data.close_time } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

