'use server'

/**
 * Extended Languages Server Actions
 * Tables: languages, language_translations, language_locales, language_strings, language_preferences
 */

import { createClient } from '@/lib/supabase/server'

export async function getLanguage(languageId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('languages').select('*').eq('id', languageId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLanguages(options?: { is_active?: boolean; is_default?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('languages').select('*'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.is_default !== undefined) query = query.eq('is_default', options.is_default); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createLanguage(languageData: { code: string; name: string; native_name?: string; direction?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('languages').insert({ ...languageData, direction: languageData.direction || 'ltr', is_active: languageData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateLanguage(languageId: string, updates: Partial<{ name: string; native_name: string; is_active: boolean; is_default: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('languages').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', languageId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTranslations(languageCode: string, options?: { namespace?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('language_translations').select('*').eq('language_code', languageCode); if (options?.namespace) query = query.eq('namespace', options.namespace); const { data, error } = await query.order('key', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTranslation(languageCode: string, key: string, namespace?: string) {
  try { const supabase = await createClient(); let query = supabase.from('language_translations').select('*').eq('language_code', languageCode).eq('key', key); if (namespace) query = query.eq('namespace', namespace); const { data, error } = await query.single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createTranslation(translationData: { language_code: string; key: string; value: string; namespace?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('language_translations').insert({ ...translationData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTranslation(translationId: string, value: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('language_translations').update({ value, updated_at: new Date().toISOString() }).eq('id', translationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLocales() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('language_locales').select('*').order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function setUserLanguagePreference(userId: string, languageCode: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('language_preferences').upsert({ user_id: userId, language_code: languageCode, updated_at: new Date().toISOString() }, { onConflict: 'user_id' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserLanguagePreference(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('language_preferences').select('*, languages(*)').eq('user_id', userId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMissingTranslations(languageCode: string, referenceCode?: string) {
  try { const supabase = await createClient(); const refCode = referenceCode || 'en'; const { data: refTranslations } = await supabase.from('language_translations').select('key, namespace').eq('language_code', refCode); const { data: langTranslations } = await supabase.from('language_translations').select('key, namespace').eq('language_code', languageCode); const langKeys = new Set(langTranslations?.map(t => `${t.namespace}:${t.key}`) || []); const missing = refTranslations?.filter(t => !langKeys.has(`${t.namespace}:${t.key}`)) || []; return { success: true, data: missing } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
