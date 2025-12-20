'use server'

/**
 * Extended Preferences Server Actions
 * Tables: preferences, preference_categories, preference_options, preference_defaults, preference_overrides, preference_history
 */

import { createClient } from '@/lib/supabase/server'

export async function getPreference(preferenceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('preferences').select('*, preference_categories(*), preference_options(*)').eq('id', preferenceId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserPreferences(userId: string, categoryId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('preferences').select('*, preference_categories(*), preference_options(*)').eq('user_id', userId); if (categoryId) query = query.eq('category_id', categoryId); const { data, error } = await query.order('created_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function setPreference(userId: string, key: string, value: any, categoryId?: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('preferences').select('id, value').eq('user_id', userId).eq('key', key).single(); if (existing) { await supabase.from('preference_history').insert({ preference_id: existing.id, old_value: existing.value, new_value: value, changed_at: new Date().toISOString() }); const { data, error } = await supabase.from('preferences').update({ value, updated_at: new Date().toISOString() }).eq('id', existing.id).select().single(); if (error) throw error; return { success: true, data } } const { data, error } = await supabase.from('preferences').insert({ user_id: userId, key, value, category_id: categoryId, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setMultiplePreferences(userId: string, preferences: { key: string; value: any; category_id?: string }[]) {
  try { const supabase = await createClient(); for (const pref of preferences) { const { data: existing } = await supabase.from('preferences').select('id').eq('user_id', userId).eq('key', pref.key).single(); if (existing) { await supabase.from('preferences').update({ value: pref.value, updated_at: new Date().toISOString() }).eq('id', existing.id) } else { await supabase.from('preferences').insert({ user_id: userId, key: pref.key, value: pref.value, category_id: pref.category_id, created_at: new Date().toISOString() }) } } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deletePreference(preferenceId: string) {
  try { const supabase = await createClient(); await supabase.from('preference_history').delete().eq('preference_id', preferenceId); const { error } = await supabase.from('preferences').delete().eq('id', preferenceId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function resetToDefault(userId: string, key: string) {
  try { const supabase = await createClient(); const { data: defaultPref } = await supabase.from('preference_defaults').select('default_value').eq('key', key).single(); if (!defaultPref) { return { success: false, error: 'No default value found' } } const { data: existing } = await supabase.from('preferences').select('id').eq('user_id', userId).eq('key', key).single(); if (existing) { const { data, error } = await supabase.from('preferences').update({ value: defaultPref.default_value, updated_at: new Date().toISOString() }).eq('id', existing.id).select().single(); if (error) throw error; return { success: true, data } } return { success: true, data: { key, value: defaultPref.default_value } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function resetAllToDefaults(userId: string, categoryId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('preferences').select('id, key').eq('user_id', userId); if (categoryId) query = query.eq('category_id', categoryId); const { data: userPrefs } = await query; if (!userPrefs || userPrefs.length === 0) return { success: true }; const keys = userPrefs.map(p => p.key); const { data: defaults } = await supabase.from('preference_defaults').select('key, default_value').in('key', keys); const defaultMap = new Map(defaults?.map(d => [d.key, d.default_value]) || []); for (const pref of userPrefs) { const defaultValue = defaultMap.get(pref.key); if (defaultValue !== undefined) { await supabase.from('preferences').update({ value: defaultValue, updated_at: new Date().toISOString() }).eq('id', pref.id) } } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCategories() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('preference_categories').select('*, preference_options(count)').order('order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getOptions(key: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('preference_options').select('*').eq('preference_key', key).order('order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getDefaults(categoryId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('preference_defaults').select('*, preference_categories(*)'); if (categoryId) query = query.eq('category_id', categoryId); const { data, error } = await query.order('key', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function setOverride(userId: string, key: string, overrideData: { value: any; reason?: string; expires_at?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('preference_overrides').upsert({ user_id: userId, preference_key: key, ...overrideData, created_at: new Date().toISOString() }, { onConflict: 'user_id,preference_key' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getHistory(preferenceId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('preference_history').select('*').eq('preference_id', preferenceId).order('changed_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function exportPreferences(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('preferences').select('key, value, category_id, preference_categories(name)').eq('user_id', userId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function importPreferences(userId: string, preferences: { key: string; value: any; category_id?: string }[]) {
  try { const supabase = await createClient(); for (const pref of preferences) { await supabase.from('preferences').upsert({ user_id: userId, key: pref.key, value: pref.value, category_id: pref.category_id, updated_at: new Date().toISOString() }, { onConflict: 'user_id,key' }) } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
