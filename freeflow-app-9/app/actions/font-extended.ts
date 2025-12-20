'use server'

/**
 * Extended Font Server Actions
 * Tables: fonts, font_families, font_usage, font_licenses
 */

import { createClient } from '@/lib/supabase/server'

export async function getFont(fontId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('fonts').select('*').eq('id', fontId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createFont(fontData: { name: string; family_id?: string; weight?: number; style?: string; format?: string; file_url?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('fonts').insert({ ...fontData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateFont(fontId: string, updates: Partial<{ name: string; weight: number; style: string; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('fonts').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', fontId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteFont(fontId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('fonts').delete().eq('id', fontId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFonts(options?: { family_id?: string; style?: string; is_active?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('fonts').select('*'); if (options?.family_id) query = query.eq('family_id', options.family_id); if (options?.style) query = query.eq('style', options.style); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getFontFamilies(options?: { category?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('font_families').select('*, fonts(*)'); if (options?.category) query = query.eq('category', options.category); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createFontFamily(familyData: { name: string; category?: string; designer?: string; license?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('font_families').insert({ ...familyData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function trackFontUsage(fontId: string, projectId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('font_usage').insert({ font_id: fontId, project_id: projectId, used_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
