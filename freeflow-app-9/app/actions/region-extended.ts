'use server'

/**
 * Extended Region Server Actions - Covers all Region-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getRegion(regionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('regions').select('*').eq('id', regionId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createRegion(regionData: { name: string; code: string; region_type?: string; parent_id?: string; country_code?: string; timezone?: string; currency_code?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('regions').insert({ ...regionData, is_active: regionData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateRegion(regionId: string, updates: Partial<{ name: string; timezone: string; currency_code: string; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('regions').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', regionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteRegion(regionId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('regions').delete().eq('id', regionId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRegions(options?: { regionType?: string; countryCode?: string; parentId?: string; isActive?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('regions').select('*'); if (options?.regionType) query = query.eq('region_type', options.regionType); if (options?.countryCode) query = query.eq('country_code', options.countryCode); if (options?.parentId) query = query.eq('parent_id', options.parentId); if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRegionByCode(code: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('regions').select('*').eq('code', code).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSubRegions(parentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('regions').select('*').eq('parent_id', parentId).eq('is_active', true).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRegionHierarchy(regionId: string) {
  try { const supabase = await createClient(); const hierarchy: any[] = []; let currentId: string | null = regionId; while (currentId) { const { data } = await supabase.from('regions').select('*').eq('id', currentId).single(); if (data) { hierarchy.unshift(data); currentId = data.parent_id; } else { break; } } return { success: true, hierarchy } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', hierarchy: [] } }
}

export async function getRegionSettings(regionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('region_settings').select('*').eq('region_id', regionId); if (error) throw error; const settings = data?.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {}) || {}; return { success: true, settings } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', settings: {} } }
}

export async function setRegionSetting(regionId: string, key: string, value: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('region_settings').upsert({ region_id: regionId, key, value, updated_at: new Date().toISOString() }, { onConflict: 'region_id,key' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
