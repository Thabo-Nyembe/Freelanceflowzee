'use server'

/**
 * Extended Appearance Server Actions
 * Tables: appearance_settings, appearance_themes, appearance_presets
 */

import { createClient } from '@/lib/supabase/server'

export async function getAppearanceSettings(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('appearance_settings').select('*').eq('user_id', userId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateAppearanceSettings(userId: string, settings: Partial<{ theme: string; color_scheme: string; font_family: string; font_size: string; accent_color: string; sidebar_position: string; compact_mode: boolean; animations_enabled: boolean; custom_css: string }>) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('appearance_settings').select('id').eq('user_id', userId).single(); if (existing) { const { data, error } = await supabase.from('appearance_settings').update({ ...settings, updated_at: new Date().toISOString() }).eq('user_id', userId).select().single(); if (error) throw error; return { success: true, data } } else { const { data, error } = await supabase.from('appearance_settings').insert({ user_id: userId, ...settings, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAppearanceThemes(options?: { category?: string; is_public?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('appearance_themes').select('*'); if (options?.category) query = query.eq('category', options.category); if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getAppearanceTheme(themeId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('appearance_themes').select('*').eq('id', themeId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createAppearanceTheme(themeData: { name: string; description?: string; user_id: string; variables: Record<string, string>; category?: string; is_public?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('appearance_themes').insert({ ...themeData, is_public: themeData.is_public ?? false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function applyTheme(userId: string, themeId: string) {
  try { const supabase = await createClient(); const { data: theme } = await supabase.from('appearance_themes').select('variables').eq('id', themeId).single(); if (!theme) return { success: false, error: 'Theme not found' }; const { data, error } = await supabase.from('appearance_settings').upsert({ user_id: userId, theme_id: themeId, ...theme.variables, updated_at: new Date().toISOString() }, { onConflict: 'user_id' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function resetAppearance(userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('appearance_settings').delete().eq('user_id', userId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
