'use server'

/**
 * Extended Setting Server Actions - Covers all Setting-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getSettings(category?: string, groupId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('settings').select('*').order('key', { ascending: true }); if (category) query = query.eq('category', category); if (groupId) query = query.eq('group_id', groupId); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSetting(settingId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('settings').select('*').eq('id', settingId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSettingByKey(key: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('settings').select('*').eq('key', key).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createSetting(input: { key: string; value: any; category?: string; group_id?: string; label?: string; description?: string; data_type?: string; options?: any[]; is_public?: boolean; is_required?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('settings').insert({ ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSetting(settingId: string, value: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('settings').update({ value, updated_at: new Date().toISOString() }).eq('id', settingId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSettingByKey(key: string, value: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('settings').update({ value, updated_at: new Date().toISOString() }).eq('key', key).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteSetting(settingId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('settings').delete().eq('id', settingId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSettingValue(key: string, defaultValue?: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('settings').select('value').eq('key', key).single(); if (error) return { success: true, data: defaultValue }; return { success: true, data: data.value } } catch (error) { return { success: true, data: defaultValue } }
}

export async function bulkUpdateSettings(settings: Array<{ key: string; value: any }>) {
  try { const supabase = await createClient(); for (const setting of settings) { await supabase.from('settings').update({ value: setting.value, updated_at: new Date().toISOString() }).eq('key', setting.key); } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPublicSettings() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('settings').select('key, value, label, description').eq('is_public', true); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSettingGroups(isActive?: boolean) {
  try { const supabase = await createClient(); let query = supabase.from('setting_groups').select('*').order('sort_order', { ascending: true }); if (isActive !== undefined) query = query.eq('is_active', isActive); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSettingGroup(groupId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('setting_groups').select('*').eq('id', groupId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createSettingGroup(input: { name: string; description?: string; icon?: string; sort_order?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('setting_groups').insert({ ...input, is_active: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSettingGroup(groupId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('setting_groups').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', groupId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteSettingGroup(groupId: string) {
  try { const supabase = await createClient(); await supabase.from('settings').update({ group_id: null }).eq('group_id', groupId); const { error } = await supabase.from('setting_groups').delete().eq('id', groupId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function reorderSettingGroups(groupIds: string[]) {
  try { const supabase = await createClient(); for (let i = 0; i < groupIds.length; i++) { await supabase.from('setting_groups').update({ sort_order: i }).eq('id', groupIds[i]); } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSettingsWithGroups() {
  try { const supabase = await createClient(); const { data: groups, error: groupsError } = await supabase.from('setting_groups').select('*').eq('is_active', true).order('sort_order', { ascending: true }); if (groupsError) throw groupsError; const { data: settings, error: settingsError } = await supabase.from('settings').select('*'); if (settingsError) throw settingsError; const result = groups?.map(group => ({ ...group, settings: settings?.filter(s => s.group_id === group.id) || [] })) || []; const ungrouped = settings?.filter(s => !s.group_id) || []; return { success: true, data: { groups: result, ungrouped } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
