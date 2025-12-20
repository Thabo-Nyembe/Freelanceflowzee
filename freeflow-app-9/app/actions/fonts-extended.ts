'use server'

/**
 * Extended Fonts Server Actions
 * Tables: fonts, font_families, font_uploads, font_licenses, user_fonts
 */

import { createClient } from '@/lib/supabase/server'

export async function getFont(fontId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('fonts').select('*, font_families(*), font_licenses(*)').eq('id', fontId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createFont(fontData: { name: string; family_id?: string; style: string; weight: number; file_url: string; format: string; uploaded_by: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('fonts').insert({ ...fontData, is_active: true, download_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateFont(fontId: string, updates: Partial<{ name: string; style: string; weight: number; is_active: boolean; preview_text: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('fonts').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', fontId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFonts(options?: { family_id?: string; style?: string; is_active?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('fonts').select('*, font_families(*)'); if (options?.family_id) query = query.eq('family_id', options.family_id); if (options?.style) query = query.eq('style', options.style); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createFontFamily(familyData: { name: string; category: string; description?: string; designer?: string; source?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('font_families').insert({ ...familyData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFontFamilies(options?: { category?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('font_families').select('*, fonts(*)'); if (options?.category) query = query.eq('category', options.category); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function uploadFont(uploadData: { user_id: string; name: string; file_url: string; file_size: number; format: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('font_uploads').insert({ ...uploadData, status: 'processing', uploaded_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserFontUploads(userId: string, options?: { status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('font_uploads').select('*').eq('user_id', userId); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('uploaded_at', { ascending: false }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addUserFont(userId: string, fontId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_fonts').insert({ user_id: userId, font_id: fontId, added_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeUserFont(userId: string, fontId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('user_fonts').delete().eq('user_id', userId).eq('font_id', fontId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserFonts(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_fonts').select('*, fonts(*, font_families(*))').eq('user_id', userId).order('added_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getPopularFonts(limit?: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('fonts').select('*, font_families(*)').eq('is_active', true).order('download_count', { ascending: false }).limit(limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
