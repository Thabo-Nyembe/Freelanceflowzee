'use server'

/**
 * Extended Platform Server Actions
 * Tables: platforms, platform_settings, platform_features, platform_analytics
 */

import { createClient } from '@/lib/supabase/server'

export async function getPlatform(platformId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('platforms').select('*').eq('id', platformId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createPlatform(platformData: { name: string; type?: string; domain?: string; config?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('platforms').insert({ ...platformData, status: 'active', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePlatform(platformId: string, updates: Partial<{ name: string; type: string; domain: string; config: Record<string, any>; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('platforms').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', platformId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPlatforms(options?: { type?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('platforms').select('*'); if (options?.type) query = query.eq('type', options.type); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getPlatformSettings(platformId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('platform_settings').select('*').eq('platform_id', platformId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function updatePlatformSetting(platformId: string, key: string, value: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('platform_settings').upsert({ platform_id: platformId, key, value, updated_at: new Date().toISOString() }, { onConflict: 'platform_id,key' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPlatformFeatures(platformId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('platform_features').select('*').eq('platform_id', platformId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getPlatformAnalytics(platformId: string, options?: { date_from?: string; date_to?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('platform_analytics').select('*').eq('platform_id', platformId); if (options?.date_from) query = query.gte('date', options.date_from); if (options?.date_to) query = query.lte('date', options.date_to); const { data, error } = await query.order('date', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
