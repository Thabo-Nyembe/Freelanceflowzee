'use server'

/**
 * Extended Theme Server Actions - Covers all Theme-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getThemes(themeType?: string, isPublic?: boolean, isActive?: boolean) {
  try { const supabase = await createClient(); let query = supabase.from('themes').select('*').order('name', { ascending: true }); if (themeType) query = query.eq('theme_type', themeType); if (isPublic !== undefined) query = query.eq('is_public', isPublic); if (isActive !== undefined) query = query.eq('is_active', isActive); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTheme(themeId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('themes').select('*').eq('id', themeId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getThemeBySlug(slug: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('themes').select('*').eq('slug', slug).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createTheme(input: { name: string; slug?: string; description?: string; theme_type?: string; colors?: any; fonts?: any; variables?: any; preview_url?: string; is_public?: boolean }) {
  try { const supabase = await createClient(); const slug = input.slug || input.name.toLowerCase().replace(/\s+/g, '-'); const { data, error } = await supabase.from('themes').insert({ ...input, slug, is_active: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTheme(themeId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('themes').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', themeId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteTheme(themeId: string) {
  try { const supabase = await createClient(); await supabase.from('theme_settings').delete().eq('theme_id', themeId); await supabase.from('user_themes').delete().eq('theme_id', themeId); const { error } = await supabase.from('themes').delete().eq('id', themeId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function duplicateTheme(themeId: string, newName: string) {
  try { const supabase = await createClient(); const { data: original, error: origError } = await supabase.from('themes').select('*').eq('id', themeId).single(); if (origError) throw origError; const { id, created_at, updated_at, ...themeData } = original; const { data, error } = await supabase.from('themes').insert({ ...themeData, name: newName, slug: newName.toLowerCase().replace(/\s+/g, '-'), is_public: false }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserTheme(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_themes').select('*, themes(*)').eq('user_id', userId).eq('is_active', true).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setUserTheme(userId: string, themeId: string, customizations?: any) {
  try { const supabase = await createClient(); await supabase.from('user_themes').update({ is_active: false }).eq('user_id', userId); const { data, error } = await supabase.from('user_themes').upsert({ user_id: userId, theme_id: themeId, customizations, is_active: true, updated_at: new Date().toISOString() }, { onConflict: 'user_id,theme_id' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getThemeSettings(themeId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('theme_settings').select('*').eq('theme_id', themeId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateThemeSettings(themeId: string, settings: any) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('theme_settings').select('id').eq('theme_id', themeId).single(); if (existing) { const { data, error } = await supabase.from('theme_settings').update({ ...settings, updated_at: new Date().toISOString() }).eq('theme_id', themeId).select().single(); if (error) throw error; return { success: true, data }; } const { data, error } = await supabase.from('theme_settings').insert({ theme_id: themeId, ...settings }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPublicThemes(limit = 50) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('themes').select('*').eq('is_public', true).eq('is_active', true).order('name', { ascending: true }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
