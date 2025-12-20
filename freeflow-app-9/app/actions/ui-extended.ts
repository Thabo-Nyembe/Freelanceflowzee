'use server'

/**
 * Extended UI Server Actions
 * Tables: ui_components, ui_themes, ui_layouts, ui_preferences
 */

import { createClient } from '@/lib/supabase/server'

export async function getUiComponent(componentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ui_components').select('*').eq('id', componentId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createUiComponent(componentData: { name: string; type: string; config?: Record<string, any>; styles?: Record<string, any>; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ui_components').insert({ ...componentData, is_active: componentData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateUiComponent(componentId: string, updates: Partial<{ name: string; type: string; config: Record<string, any>; styles: Record<string, any>; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ui_components').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', componentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUiComponents(options?: { type?: string; is_active?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('ui_components').select('*'); if (options?.type) query = query.eq('type', options.type); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUiThemes(options?: { is_active?: boolean; is_default?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('ui_themes').select('*'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.is_default !== undefined) query = query.eq('is_default', options.is_default); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUiLayouts(options?: { type?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('ui_layouts').select('*'); if (options?.type) query = query.eq('type', options.type); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUiPreferences(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ui_preferences').select('*').eq('user_id', userId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateUiPreferences(userId: string, preferences: Record<string, any>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ui_preferences').upsert({ user_id: userId, ...preferences, updated_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
