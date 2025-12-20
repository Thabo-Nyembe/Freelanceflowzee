'use server'

/**
 * Extended Variables Server Actions
 * Tables: variables, variable_values, variable_groups, variable_history, variable_overrides, variable_environments
 */

import { createClient } from '@/lib/supabase/server'

export async function getVariable(variableId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('variables').select('*, variable_groups(*), variable_values(*), variable_overrides(*)').eq('id', variableId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createVariable(variableData: { key: string; value: any; description?: string; value_type?: string; group_id?: string; is_secret?: boolean; is_editable?: boolean; default_value?: any; validation_rules?: any; created_by?: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('variables').insert({ ...variableData, value_type: variableData.value_type || 'string', is_secret: variableData.is_secret ?? false, is_editable: variableData.is_editable ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; await logHistory(data.id, 'created', { value: variableData.is_secret ? '[SECRET]' : variableData.value }, variableData.created_by); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateVariable(variableId: string, updates: Partial<{ value: any; description: string; value_type: string; group_id: string; is_secret: boolean; is_editable: boolean; default_value: any; validation_rules: any; metadata: any }>, userId?: string) {
  try { const supabase = await createClient(); const { data: current } = await supabase.from('variables').select('value, is_secret, is_editable').eq('id', variableId).single(); if (current && !current.is_editable) return { success: false, error: 'Variable is not editable' }; const { data, error } = await supabase.from('variables').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', variableId).select().single(); if (error) throw error; if (updates.value !== undefined && updates.value !== current?.value) { await logHistory(variableId, 'updated', { old_value: current?.is_secret ? '[SECRET]' : current?.value, new_value: data.is_secret ? '[SECRET]' : updates.value }, userId) } return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteVariable(variableId: string) {
  try { const supabase = await createClient(); await supabase.from('variable_values').delete().eq('variable_id', variableId); await supabase.from('variable_history').delete().eq('variable_id', variableId); await supabase.from('variable_overrides').delete().eq('variable_id', variableId); const { error } = await supabase.from('variables').delete().eq('id', variableId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getVariables(options?: { group_id?: string; value_type?: string; is_secret?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('variables').select('*, variable_groups(*)'); if (options?.group_id) query = query.eq('group_id', options.group_id); if (options?.value_type) query = query.eq('value_type', options.value_type); if (options?.is_secret !== undefined) query = query.eq('is_secret', options.is_secret); if (options?.search) query = query.or(`key.ilike.%${options.search}%,description.ilike.%${options.search}%`); const { data, error } = await query.order('key', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getVariableByKey(key: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('variables').select('*, variable_groups(*)').eq('key', key).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

async function logHistory(variableId: string, action: string, details?: any, userId?: string) {
  const supabase = await createClient()
  await supabase.from('variable_history').insert({ variable_id: variableId, action, details, performed_by: userId, occurred_at: new Date().toISOString(), created_at: new Date().toISOString() })
}

export async function getHistory(variableId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('variable_history').select('*, users(*)').eq('variable_id', variableId).order('occurred_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createGroup(groupData: { name: string; description?: string; parent_id?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('variable_groups').insert({ ...groupData, is_active: groupData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getGroups(options?: { parent_id?: string | null; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('variable_groups').select('*, variables(count)'); if (options?.parent_id) query = query.eq('parent_id', options.parent_id); else if (options?.parent_id === null) query = query.is('parent_id', null); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function setOverride(variableId: string, overrideData: { environment_id?: string; context_type?: string; context_id?: string; value: any; priority?: number }) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('variable_overrides').select('id').eq('variable_id', variableId).eq('environment_id', overrideData.environment_id || null).eq('context_type', overrideData.context_type || null).eq('context_id', overrideData.context_id || null).single(); if (existing) { const { data, error } = await supabase.from('variable_overrides').update({ value: overrideData.value, priority: overrideData.priority, updated_at: new Date().toISOString() }).eq('id', existing.id).select().single(); if (error) throw error; return { success: true, data } } else { const { data, error } = await supabase.from('variable_overrides').insert({ variable_id: variableId, ...overrideData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getOverrides(variableId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('variable_overrides').select('*, variable_environments(*)').eq('variable_id', variableId).eq('is_active', true).order('priority', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function removeOverride(overrideId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('variable_overrides').update({ is_active: false }).eq('id', overrideId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function resolveValue(key: string, context?: { environment_id?: string; context_type?: string; context_id?: string }) {
  try { const supabase = await createClient(); const { data: variable } = await supabase.from('variables').select('*').eq('key', key).single(); if (!variable) return { success: false, error: 'Variable not found' }; if (context) { let query = supabase.from('variable_overrides').select('value, priority').eq('variable_id', variable.id).eq('is_active', true); if (context.environment_id) query = query.eq('environment_id', context.environment_id); if (context.context_type && context.context_id) { query = query.eq('context_type', context.context_type).eq('context_id', context.context_id) } const { data: overrides } = await query.order('priority', { ascending: false }).limit(1); if (overrides && overrides.length > 0) { return { success: true, data: overrides[0].value } } } return { success: true, data: variable.value ?? variable.default_value } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createEnvironment(envData: { name: string; code: string; description?: string; is_default?: boolean; is_active?: boolean }) {
  try { const supabase = await createClient(); if (envData.is_default) { await supabase.from('variable_environments').update({ is_default: false }).eq('is_default', true) } const { data, error } = await supabase.from('variable_environments').insert({ ...envData, is_default: envData.is_default ?? false, is_active: envData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getEnvironments(options?: { is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('variable_environments').select('*'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function bulkSet(variables: { key: string; value: any }[], userId?: string) {
  try { const supabase = await createClient(); const results: any[] = []; for (const v of variables) { const { data: existing } = await supabase.from('variables').select('id').eq('key', v.key).single(); if (existing) { await supabase.from('variables').update({ value: v.value, updated_at: new Date().toISOString() }).eq('id', existing.id); results.push({ key: v.key, action: 'updated' }) } else { await supabase.from('variables').insert({ key: v.key, value: v.value, value_type: typeof v.value, created_at: new Date().toISOString() }); results.push({ key: v.key, action: 'created' }) } } return { success: true, data: results } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function exportVariables(groupId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('variables').select('key, value, value_type, description, is_secret, default_value').eq('is_secret', false); if (groupId) query = query.eq('group_id', groupId); const { data, error } = await query.order('key', { ascending: true }); if (error) throw error; const exportData: Record<string, any> = {}; data?.forEach(v => { exportData[v.key] = { value: v.value, type: v.value_type, description: v.description, default: v.default_value } }); return { success: true, data: exportData } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
