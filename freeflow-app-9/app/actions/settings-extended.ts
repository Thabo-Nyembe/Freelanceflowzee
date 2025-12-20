'use server'

/**
 * Extended Settings Server Actions
 * Tables: settings, setting_categories, setting_values, setting_history, setting_presets, setting_overrides
 */

import { createClient } from '@/lib/supabase/server'

export async function getSetting(key: string, scope?: { type: string; id: string }) {
  try { const supabase = await createClient(); let query = supabase.from('settings').select('*, setting_categories(*)').eq('key', key); if (scope) { const { data: override } = await supabase.from('setting_overrides').select('value').eq('setting_key', key).eq('scope_type', scope.type).eq('scope_id', scope.id).single(); if (override) return { success: true, data: { key, value: override.value, isOverride: true } } } const { data, error } = await query.single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setSetting(key: string, value: any, changedBy?: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('settings').select('id, value').eq('key', key).single(); if (existing) { await supabase.from('setting_history').insert({ setting_id: existing.id, previous_value: existing.value, new_value: value, changed_by: changedBy, changed_at: new Date().toISOString(), created_at: new Date().toISOString() }); const { data, error } = await supabase.from('settings').update({ value, updated_at: new Date().toISOString() }).eq('key', key).select().single(); if (error) throw error; return { success: true, data } } else { const { data, error } = await supabase.from('settings').insert({ key, value, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSettings(options?: { category_id?: string; is_public?: boolean; search?: string; keys?: string[] }) {
  try { const supabase = await createClient(); let query = supabase.from('settings').select('*, setting_categories(*)'); if (options?.category_id) query = query.eq('category_id', options.category_id); if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public); if (options?.keys && options.keys.length > 0) query = query.in('key', options.keys); if (options?.search) query = query.or(`key.ilike.%${options.search}%,label.ilike.%${options.search}%`); const { data, error } = await query.order('key', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSettingsMap(keys: string[], scope?: { type: string; id: string }) {
  try { const supabase = await createClient(); const { data: settings } = await supabase.from('settings').select('key, value').in('key', keys); const settingsMap: { [key: string]: any } = {}; (settings || []).forEach(s => { settingsMap[s.key] = s.value }); if (scope) { const { data: overrides } = await supabase.from('setting_overrides').select('setting_key, value').in('setting_key', keys).eq('scope_type', scope.type).eq('scope_id', scope.id); (overrides || []).forEach(o => { settingsMap[o.setting_key] = o.value }) } return { success: true, data: settingsMap } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: {} } }
}

export async function setSettingOverride(key: string, value: any, scope: { type: string; id: string }, setBy?: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('setting_overrides').select('id').eq('setting_key', key).eq('scope_type', scope.type).eq('scope_id', scope.id).single(); if (existing) { const { data, error } = await supabase.from('setting_overrides').update({ value, set_by: setBy, updated_at: new Date().toISOString() }).eq('id', existing.id).select().single(); if (error) throw error; return { success: true, data } } else { const { data, error } = await supabase.from('setting_overrides').insert({ setting_key: key, value, scope_type: scope.type, scope_id: scope.id, set_by: setBy, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeSettingOverride(key: string, scope: { type: string; id: string }) {
  try { const supabase = await createClient(); const { error } = await supabase.from('setting_overrides').delete().eq('setting_key', key).eq('scope_type', scope.type).eq('scope_id', scope.id); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSettingHistory(settingKey: string, options?: { from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); const { data: setting } = await supabase.from('settings').select('id').eq('key', settingKey).single(); if (!setting) return { success: true, data: [] }; let query = supabase.from('setting_history').select('*, users(*)').eq('setting_id', setting.id); if (options?.from_date) query = query.gte('changed_at', options.from_date); if (options?.to_date) query = query.lte('changed_at', options.to_date); const { data, error } = await query.order('changed_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSettingCategories(options?: { parent_id?: string | null; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('setting_categories').select('*, settings(count)'); if (options?.parent_id !== undefined) { if (options.parent_id === null) query = query.is('parent_id', null); else query = query.eq('parent_id', options.parent_id) } if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSettingPresets(options?: { category?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('setting_presets').select('*'); if (options?.category) query = query.eq('category', options.category); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function applySettingPreset(presetId: string, changedBy?: string) {
  try { const supabase = await createClient(); const { data: preset } = await supabase.from('setting_presets').select('*').eq('id', presetId).single(); if (!preset) return { success: false, error: 'Preset not found' }; const settings = preset.settings || {}; for (const [key, value] of Object.entries(settings)) { await setSetting(key, value, changedBy) } return { success: true, data: { appliedSettings: Object.keys(settings).length } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createSettingPreset(presetData: { name: string; description?: string; category?: string; settings: { [key: string]: any }; is_default?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('setting_presets').insert({ ...presetData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function exportSettings(categoryId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('settings').select('key, value'); if (categoryId) query = query.eq('category_id', categoryId); const { data, error } = await query; if (error) throw error; const exportData: { [key: string]: any } = {}; (data || []).forEach(s => { exportData[s.key] = s.value }); return { success: true, data: exportData } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function importSettings(settings: { [key: string]: any }, changedBy?: string) {
  try { for (const [key, value] of Object.entries(settings)) { await setSetting(key, value, changedBy) } return { success: true, data: { importedCount: Object.keys(settings).length } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

