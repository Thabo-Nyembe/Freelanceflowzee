'use server'

/**
 * Extended Preset Server Actions - Covers all Preset-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getPreset(presetId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('presets').select('*').eq('id', presetId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createPreset(presetData: { name: string; preset_type: string; category?: string; settings: Record<string, any>; description?: string; is_default?: boolean; is_public?: boolean; user_id?: string; workspace_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('presets').insert({ ...presetData, is_default: presetData.is_default ?? false, is_public: presetData.is_public ?? false, usage_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePreset(presetId: string, updates: Partial<{ name: string; settings: Record<string, any>; description: string; is_default: boolean; is_public: boolean; category: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('presets').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', presetId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deletePreset(presetId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('presets').delete().eq('id', presetId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPresets(options?: { presetType?: string; category?: string; isPublic?: boolean; userId?: string; workspaceId?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('presets').select('*'); if (options?.presetType) query = query.eq('preset_type', options.presetType); if (options?.category) query = query.eq('category', options.category); if (options?.isPublic !== undefined) query = query.eq('is_public', options.isPublic); if (options?.userId) query = query.eq('user_id', options.userId); if (options?.workspaceId) query = query.eq('workspace_id', options.workspaceId); const { data, error } = await query.order('usage_count', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getDefaultPreset(presetType: string, workspaceId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('presets').select('*').eq('preset_type', presetType).eq('is_default', true); if (workspaceId) query = query.eq('workspace_id', workspaceId); const { data, error } = await query.single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setDefaultPreset(presetId: string, presetType: string, workspaceId?: string) {
  try { const supabase = await createClient(); let clearQuery = supabase.from('presets').update({ is_default: false, updated_at: new Date().toISOString() }).eq('preset_type', presetType).eq('is_default', true); if (workspaceId) clearQuery = clearQuery.eq('workspace_id', workspaceId); await clearQuery; const { data, error } = await supabase.from('presets').update({ is_default: true, updated_at: new Date().toISOString() }).eq('id', presetId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function incrementPresetUsage(presetId: string) {
  try { const supabase = await createClient(); const { data: current } = await supabase.from('presets').select('usage_count').eq('id', presetId).single(); const { data, error } = await supabase.from('presets').update({ usage_count: (current?.usage_count || 0) + 1, last_used_at: new Date().toISOString() }).eq('id', presetId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function duplicatePreset(presetId: string, newName?: string) {
  try { const supabase = await createClient(); const { data: original, error: fetchError } = await supabase.from('presets').select('*').eq('id', presetId).single(); if (fetchError) throw fetchError; const { id, created_at, updated_at, usage_count, last_used_at, is_default, ...presetData } = original; const { data, error } = await supabase.from('presets').insert({ ...presetData, name: newName || `${original.name} (Copy)`, is_default: false, usage_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
