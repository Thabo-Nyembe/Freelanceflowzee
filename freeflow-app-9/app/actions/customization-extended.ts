'use server'

/**
 * Extended Customization Server Actions
 * Tables: customizations, customization_options, customization_presets, user_customizations
 */

import { createClient } from '@/lib/supabase/server'

export async function getCustomization(customizationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('customizations').select('*, customization_options(*)').eq('id', customizationId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createCustomization(customizationData: { name: string; type: string; description?: string; default_value?: any; options?: any; is_global?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('customizations').insert({ ...customizationData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCustomization(customizationId: string, updates: Partial<{ name: string; description: string; default_value: any; options: any; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('customizations').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', customizationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCustomizations(options?: { type?: string; is_global?: boolean; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('customizations').select('*'); if (options?.type) query = query.eq('type', options.type); if (options?.is_global !== undefined) query = query.eq('is_global', options.is_global); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getCustomizationPresets(options?: { type?: string; is_default?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('customization_presets').select('*'); if (options?.type) query = query.eq('type', options.type); if (options?.is_default !== undefined) query = query.eq('is_default', options.is_default); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCustomizationPreset(presetData: { name: string; type: string; values: any; description?: string; is_default?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('customization_presets').insert({ ...presetData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserCustomizations(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_customizations').select('*, customizations(*)').eq('user_id', userId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function setUserCustomization(userId: string, customizationId: string, value: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_customizations').upsert({ user_id: userId, customization_id: customizationId, value, updated_at: new Date().toISOString() }, { onConflict: 'user_id,customization_id' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function resetUserCustomizations(userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('user_customizations').delete().eq('user_id', userId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function applyPreset(userId: string, presetId: string) {
  try { const supabase = await createClient(); const { data: preset, error: presetError } = await supabase.from('customization_presets').select('values').eq('id', presetId).single(); if (presetError) throw presetError; if (!preset?.values) return { success: true }; for (const [customizationId, value] of Object.entries(preset.values)) { await supabase.from('user_customizations').upsert({ user_id: userId, customization_id: customizationId, value, updated_at: new Date().toISOString() }, { onConflict: 'user_id,customization_id' }) } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
