'use server'

/**
 * Extended Language Server Actions - Covers all Language-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getLanguage(languageId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('languages').select('*').eq('id', languageId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createLanguage(languageData: { name: string; code: string; native_name?: string; iso639_1?: string; iso639_2?: string; direction?: 'ltr' | 'rtl'; script?: string; is_supported?: boolean; is_enabled?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('languages').insert({ ...languageData, direction: languageData.direction || 'ltr', is_supported: languageData.is_supported ?? false, is_enabled: languageData.is_enabled ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateLanguage(languageId: string, updates: Partial<{ name: string; native_name: string; is_supported: boolean; is_enabled: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('languages').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', languageId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteLanguage(languageId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('languages').delete().eq('id', languageId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLanguages(options?: { isSupported?: boolean; isEnabled?: boolean; direction?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('languages').select('*'); if (options?.isSupported !== undefined) query = query.eq('is_supported', options.isSupported); if (options?.isEnabled !== undefined) query = query.eq('is_enabled', options.isEnabled); if (options?.direction) query = query.eq('direction', options.direction); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getLanguageByCode(code: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('languages').select('*').eq('code', code.toLowerCase()).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSupportedLanguages() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('languages').select('*').eq('is_supported', true).eq('is_enabled', true).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRTLLanguages() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('languages').select('*').eq('direction', 'rtl').eq('is_enabled', true).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function setUserLanguage(userId: string, languageCode: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_language_preferences').upsert({ user_id: userId, language_code: languageCode, updated_at: new Date().toISOString() }, { onConflict: 'user_id' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserLanguage(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_language_preferences').select('language_code, languages(*)').eq('user_id', userId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function detectLanguage(text: string) {
  // Placeholder for language detection - would typically use an external API
  return { success: true, detected: 'en', confidence: 0.95 }
}
