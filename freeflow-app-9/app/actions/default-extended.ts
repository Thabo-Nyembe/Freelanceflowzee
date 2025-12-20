'use server'

/**
 * Extended Default Server Actions - Covers all Default value/setting tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getDefault(defaultId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('defaults').select('*').eq('id', defaultId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createDefault(defaultData: { key: string; value: any; default_type: string; entity_type?: string; description?: string; is_system?: boolean; workspace_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('defaults').insert({ ...defaultData, is_system: defaultData.is_system ?? false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateDefault(defaultId: string, updates: Partial<{ value: any; description: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('defaults').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', defaultId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteDefault(defaultId: string) {
  try { const supabase = await createClient(); const { data: def } = await supabase.from('defaults').select('is_system').eq('id', defaultId).single(); if (def?.is_system) throw new Error('Cannot delete system defaults'); const { error } = await supabase.from('defaults').delete().eq('id', defaultId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDefaults(options?: { defaultType?: string; entityType?: string; isSystem?: boolean; workspaceId?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('defaults').select('*'); if (options?.defaultType) query = query.eq('default_type', options.defaultType); if (options?.entityType) query = query.eq('entity_type', options.entityType); if (options?.isSystem !== undefined) query = query.eq('is_system', options.isSystem); if (options?.workspaceId) query = query.eq('workspace_id', options.workspaceId); const { data, error } = await query.order('key', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getDefaultByKey(key: string, workspaceId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('defaults').select('*').eq('key', key); if (workspaceId) query = query.eq('workspace_id', workspaceId); const { data, error } = await query.single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setDefault(key: string, value: any, defaultType: string, workspaceId?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('defaults').upsert({ key, value, default_type: defaultType, workspace_id: workspaceId, updated_at: new Date().toISOString() }, { onConflict: 'key,workspace_id' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDefaultValue(key: string, fallback: any = null, workspaceId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('defaults').select('value').eq('key', key); if (workspaceId) { query = query.eq('workspace_id', workspaceId) } else { query = query.is('workspace_id', null) } const { data, error } = await query.single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, value: data?.value ?? fallback } } catch (error) { return { success: false, value: fallback } }
}

export async function resetToSystemDefault(key: string, workspaceId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('defaults').delete().eq('key', key).eq('workspace_id', workspaceId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
