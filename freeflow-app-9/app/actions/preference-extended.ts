'use server'

/**
 * Extended Preference Server Actions - Covers all Preference-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getPreferences(userId: string, category?: string) {
  try { const supabase = await createClient(); let query = supabase.from('preferences').select('*').eq('user_id', userId).order('key', { ascending: true }); if (category) query = query.eq('category', category); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getPreference(userId: string, key: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('preferences').select('*').eq('user_id', userId).eq('key', key).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setPreference(userId: string, key: string, value: any, category?: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('preferences').select('id').eq('user_id', userId).eq('key', key).single(); if (existing) { const { data, error } = await supabase.from('preferences').update({ value, updated_at: new Date().toISOString() }).eq('id', existing.id).select().single(); if (error) throw error; return { success: true, data }; } const { data, error } = await supabase.from('preferences').insert({ user_id: userId, key, value, category }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deletePreference(userId: string, key: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('preferences').delete().eq('user_id', userId).eq('key', key); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPreferenceValue(userId: string, key: string, defaultValue?: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('preferences').select('value').eq('user_id', userId).eq('key', key).single(); if (error) return { success: true, data: defaultValue }; return { success: true, data: data.value } } catch (error) { return { success: true, data: defaultValue } }
}

export async function bulkSetPreferences(userId: string, preferences: Array<{ key: string; value: any; category?: string }>) {
  try { const supabase = await createClient(); for (const pref of preferences) { await setPreference(userId, pref.key, pref.value, pref.category); } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function resetPreferences(userId: string, category?: string) {
  try { const supabase = await createClient(); let query = supabase.from('preferences').delete().eq('user_id', userId); if (category) query = query.eq('category', category); const { error } = await query; if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPreferenceGroups(isActive?: boolean) {
  try { const supabase = await createClient(); let query = supabase.from('preference_groups').select('*').order('sort_order', { ascending: true }); if (isActive !== undefined) query = query.eq('is_active', isActive); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createPreferenceGroup(input: { name: string; description?: string; icon?: string; sort_order?: number; default_values?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('preference_groups').insert({ ...input, is_active: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePreferenceGroup(groupId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('preference_groups').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', groupId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deletePreferenceGroup(groupId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('preference_groups').delete().eq('id', groupId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserPreferencesWithDefaults(userId: string) {
  try { const supabase = await createClient(); const { data: groups, error: groupsError } = await supabase.from('preference_groups').select('*').eq('is_active', true).order('sort_order', { ascending: true }); if (groupsError) throw groupsError; const { data: userPrefs, error: prefsError } = await supabase.from('preferences').select('*').eq('user_id', userId); if (prefsError) throw prefsError; const userPrefMap: Record<string, any> = {}; userPrefs?.forEach(p => { userPrefMap[p.key] = p.value; }); const result = groups?.map(group => { const merged = { ...group.default_values }; Object.keys(merged).forEach(key => { if (userPrefMap[key] !== undefined) { merged[key] = userPrefMap[key]; } }); return { ...group, preferences: merged }; }) || []; return { success: true, data: result } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
