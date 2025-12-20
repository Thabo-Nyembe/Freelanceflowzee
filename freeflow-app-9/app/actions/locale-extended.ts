'use server'

/**
 * Extended Locale Server Actions - Covers all Locale/Localization tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getLocale(localeId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('locales').select('*').eq('id', localeId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createLocale(localeData: { code: string; name: string; native_name?: string; language_code: string; country_code?: string; script?: string; direction?: 'ltr' | 'rtl'; date_format?: string; time_format?: string; number_format?: Record<string, any>; is_default?: boolean; is_enabled?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('locales').insert({ ...localeData, is_default: localeData.is_default ?? false, is_enabled: localeData.is_enabled ?? true, direction: localeData.direction || 'ltr', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateLocale(localeId: string, updates: Partial<{ name: string; native_name: string; date_format: string; time_format: string; number_format: Record<string, any>; is_default: boolean; is_enabled: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('locales').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', localeId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteLocale(localeId: string) {
  try { const supabase = await createClient(); const { data: locale } = await supabase.from('locales').select('is_default').eq('id', localeId).single(); if (locale?.is_default) throw new Error('Cannot delete default locale'); const { error } = await supabase.from('locales').delete().eq('id', localeId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLocales(options?: { languageCode?: string; isEnabled?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('locales').select('*'); if (options?.languageCode) query = query.eq('language_code', options.languageCode); if (options?.isEnabled !== undefined) query = query.eq('is_enabled', options.isEnabled); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getLocaleByCode(code: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('locales').select('*').eq('code', code).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDefaultLocale() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('locales').select('*').eq('is_default', true).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setDefaultLocale(localeId: string) {
  try { const supabase = await createClient(); await supabase.from('locales').update({ is_default: false, updated_at: new Date().toISOString() }).eq('is_default', true); const { data, error } = await supabase.from('locales').update({ is_default: true, updated_at: new Date().toISOString() }).eq('id', localeId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLocaleStrings(localeCode: string, namespace?: string) {
  try { const supabase = await createClient(); let query = supabase.from('locale_strings').select('*').eq('locale_code', localeCode); if (namespace) query = query.eq('namespace', namespace); const { data, error } = await query; if (error) throw error; const strings = data?.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {}) || {}; return { success: true, strings } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', strings: {} } }
}

export async function setLocaleString(localeCode: string, key: string, value: string, namespace?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('locale_strings').upsert({ locale_code: localeCode, key, value, namespace: namespace || 'common', updated_at: new Date().toISOString() }, { onConflict: 'locale_code,key,namespace' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
