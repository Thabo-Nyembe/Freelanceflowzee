'use server'

/**
 * Extended Color Server Actions
 * Tables: color_palettes, color_schemes, color_history, color_favorites
 */

import { createClient } from '@/lib/supabase/server'

export async function getColorPalette(paletteId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('color_palettes').select('*').eq('id', paletteId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createColorPalette(paletteData: { user_id: string; name: string; colors: string[]; description?: string; tags?: string[]; is_public?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('color_palettes').insert({ ...paletteData, is_public: paletteData.is_public ?? false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateColorPalette(paletteId: string, updates: Partial<{ name: string; colors: string[]; description: string; tags: string[]; is_public: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('color_palettes').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', paletteId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteColorPalette(paletteId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('color_palettes').delete().eq('id', paletteId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getColorPalettes(options?: { user_id?: string; is_public?: boolean; tag?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('color_palettes').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public); if (options?.tag) query = query.contains('tags', [options.tag]); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createColorScheme(schemeData: { user_id: string; name: string; primary: string; secondary?: string; accent?: string; background?: string; text?: string; type?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('color_schemes').insert({ ...schemeData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getColorSchemes(options?: { user_id?: string; type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('color_schemes').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.type) query = query.eq('type', options.type); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addColorToHistory(userId: string, color: string, source?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('color_history').insert({ user_id: userId, color, source, used_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getColorHistory(userId: string, limit?: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('color_history').select('*').eq('user_id', userId).order('used_at', { ascending: false }).limit(limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addFavoriteColor(userId: string, color: string, name?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('color_favorites').insert({ user_id: userId, color, name, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFavoriteColors(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('color_favorites').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
