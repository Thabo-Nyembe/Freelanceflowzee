'use server'

/**
 * Extended Alias Server Actions - Covers all Alias-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getAlias(aliasId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('aliases').select('*').eq('id', aliasId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAliasByName(name: string, type?: string) {
  try { const supabase = await createClient(); let query = supabase.from('aliases').select('*').eq('alias_name', name); if (type) query = query.eq('alias_type', type); const { data, error } = await query.single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createAlias(aliasData: { alias_name: string; alias_type: string; target_id: string; target_type: string; user_id?: string; description?: string; is_primary?: boolean; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); if (aliasData.is_primary) { await supabase.from('aliases').update({ is_primary: false }).eq('target_id', aliasData.target_id).eq('target_type', aliasData.target_type).eq('alias_type', aliasData.alias_type); } const { data, error } = await supabase.from('aliases').insert({ ...aliasData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateAlias(aliasId: string, updates: Partial<{ alias_name: string; description: string; is_active: boolean; is_primary: boolean; metadata: Record<string, any> }>) {
  try { const supabase = await createClient(); if (updates.is_primary) { const { data: existing } = await supabase.from('aliases').select('target_id, target_type, alias_type').eq('id', aliasId).single(); if (existing) { await supabase.from('aliases').update({ is_primary: false }).eq('target_id', existing.target_id).eq('target_type', existing.target_type).eq('alias_type', existing.alias_type).neq('id', aliasId); } } const { data, error } = await supabase.from('aliases').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', aliasId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteAlias(aliasId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('aliases').delete().eq('id', aliasId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function resolveAlias(aliasName: string, aliasType?: string) {
  try { const supabase = await createClient(); let query = supabase.from('aliases').select('target_id, target_type').eq('alias_name', aliasName).eq('is_active', true); if (aliasType) query = query.eq('alias_type', aliasType); const { data, error } = await query.single(); if (error && error.code !== 'PGRST116') throw error; if (!data) return { success: false, error: 'Alias not found' }; return { success: true, targetId: data.target_id, targetType: data.target_type } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAliasesForTarget(targetId: string, targetType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('aliases').select('*').eq('target_id', targetId).eq('target_type', targetType).eq('is_active', true).order('is_primary', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getPrimaryAlias(targetId: string, targetType: string, aliasType?: string) {
  try { const supabase = await createClient(); let query = supabase.from('aliases').select('*').eq('target_id', targetId).eq('target_type', targetType).eq('is_primary', true).eq('is_active', true); if (aliasType) query = query.eq('alias_type', aliasType); const { data, error } = await query.single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function checkAliasAvailability(aliasName: string, aliasType: string) {
  try { const supabase = await createClient(); const { data } = await supabase.from('aliases').select('id').eq('alias_name', aliasName).eq('alias_type', aliasType).single(); return { success: true, available: !data } } catch (error) { return { success: true, available: true } }
}

export async function getUserAliases(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('aliases').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
