'use server'

/**
 * Extended Config Server Actions - Covers all Config-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getConfigs(category?: string, isActive?: boolean) {
  try { const supabase = await createClient(); let query = supabase.from('configs').select('*').order('key', { ascending: true }); if (category) query = query.eq('category', category); if (isActive !== undefined) query = query.eq('is_active', isActive); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getConfig(configId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('configs').select('*').eq('id', configId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getConfigByKey(key: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('configs').select('*').eq('key', key).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createConfig(input: { key: string; value: any; category?: string; description?: string; data_type?: string; is_secret?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('configs').insert({ ...input, is_active: true, version: 1 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateConfig(configId: string, value: any, updatedBy?: string) {
  try { const supabase = await createClient(); const { data: current, error: currentError } = await supabase.from('configs').select('*').eq('id', configId).single(); if (currentError) throw currentError; await supabase.from('config_versions').insert({ config_id: configId, version: current.version, value: current.value, created_by: updatedBy }); const { data, error } = await supabase.from('configs').update({ value, version: (current.version || 0) + 1, updated_at: new Date().toISOString(), updated_by: updatedBy }).eq('id', configId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteConfig(configId: string) {
  try { const supabase = await createClient(); await supabase.from('config_versions').delete().eq('config_id', configId); const { error } = await supabase.from('configs').delete().eq('id', configId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function toggleConfigActive(configId: string, isActive: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('configs').update({ is_active: isActive }).eq('id', configId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getConfigValue(key: string, defaultValue?: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('configs').select('value').eq('key', key).eq('is_active', true).single(); if (error) return { success: true, data: defaultValue }; return { success: true, data: data.value } } catch (error) { return { success: true, data: defaultValue } }
}

export async function setConfigValue(key: string, value: any, category?: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('configs').select('id').eq('key', key).single(); if (existing) { return updateConfig(existing.id, value); } return createConfig({ key, value, category }); } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getConfigVersions(configId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('config_versions').select('*').eq('config_id', configId).order('version', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function revertConfigToVersion(configId: string, version: number, revertedBy?: string) {
  try { const supabase = await createClient(); const { data: versionData, error: versionError } = await supabase.from('config_versions').select('value').eq('config_id', configId).eq('version', version).single(); if (versionError) throw versionError; return updateConfig(configId, versionData.value, revertedBy); } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function bulkGetConfigs(keys: string[]) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('configs').select('key, value').in('key', keys).eq('is_active', true); if (error) throw error; const configMap: Record<string, any> = {}; data?.forEach(c => { configMap[c.key] = c.value; }); return { success: true, data: configMap } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function exportConfigs(category?: string) {
  try { const supabase = await createClient(); let query = supabase.from('configs').select('key, value, category, description').eq('is_active', true).eq('is_secret', false); if (category) query = query.eq('category', category); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function importConfigs(configs: Array<{ key: string; value: any; category?: string; description?: string }>) {
  try { const supabase = await createClient(); for (const config of configs) { await setConfigValue(config.key, config.value, config.category); } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
