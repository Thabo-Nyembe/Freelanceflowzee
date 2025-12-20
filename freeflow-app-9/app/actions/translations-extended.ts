'use server'

/**
 * Extended Translations Server Actions
 * Tables: translations, translation_keys, translation_locales, translation_imports, translation_exports, translation_history
 */

import { createClient } from '@/lib/supabase/server'

export async function getTranslation(translationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('translations').select('*, translation_keys(*), translation_locales(*)').eq('id', translationId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createTranslation(translationData: { key: string; locale: string; value: string; namespace?: string; context?: string; plural_form?: string; is_reviewed?: boolean; created_by?: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data: keyRecord } = await supabase.from('translation_keys').select('id').eq('key', translationData.key).eq('namespace', translationData.namespace || 'default').single(); let keyId = keyRecord?.id; if (!keyId) { const { data: newKey } = await supabase.from('translation_keys').insert({ key: translationData.key, namespace: translationData.namespace || 'default', context: translationData.context, created_at: new Date().toISOString() }).select().single(); keyId = newKey?.id } const { data, error } = await supabase.from('translations').insert({ key_id: keyId, locale: translationData.locale, value: translationData.value, plural_form: translationData.plural_form, is_reviewed: translationData.is_reviewed ?? false, created_by: translationData.created_by, created_at: new Date().toISOString() }).select().single(); if (error) throw error; await logHistory(data.id, 'created', { value: translationData.value }, translationData.created_by); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTranslation(translationId: string, updates: Partial<{ value: string; plural_form: string; is_reviewed: boolean; metadata: any }>, userId?: string) {
  try { const supabase = await createClient(); const { data: current } = await supabase.from('translations').select('value').eq('id', translationId).single(); const { data, error } = await supabase.from('translations').update({ ...updates, reviewed_by: updates.is_reviewed ? userId : undefined, reviewed_at: updates.is_reviewed ? new Date().toISOString() : undefined, updated_at: new Date().toISOString() }).eq('id', translationId).select().single(); if (error) throw error; if (updates.value && updates.value !== current?.value) { await logHistory(translationId, 'updated', { old_value: current?.value, new_value: updates.value }, userId) } return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteTranslation(translationId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('translations').delete().eq('id', translationId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTranslations(options?: { locale?: string; namespace?: string; key_id?: string; is_reviewed?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('translations').select('*, translation_keys(*)'); if (options?.locale) query = query.eq('locale', options.locale); if (options?.namespace) query = query.eq('translation_keys.namespace', options.namespace); if (options?.key_id) query = query.eq('key_id', options.key_id); if (options?.is_reviewed !== undefined) query = query.eq('is_reviewed', options.is_reviewed); if (options?.search) query = query.ilike('value', `%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTranslationsByKey(key: string, namespace: string = 'default') {
  try { const supabase = await createClient(); const { data: keyRecord } = await supabase.from('translation_keys').select('id').eq('key', key).eq('namespace', namespace).single(); if (!keyRecord) return { success: true, data: [] }; const { data, error } = await supabase.from('translations').select('*, translation_locales(*)').eq('key_id', keyRecord.id).order('locale', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTranslationValue(key: string, locale: string, namespace: string = 'default') {
  try { const supabase = await createClient(); const { data: keyRecord } = await supabase.from('translation_keys').select('id').eq('key', key).eq('namespace', namespace).single(); if (!keyRecord) return { success: true, data: null }; const { data, error } = await supabase.from('translations').select('value').eq('key_id', keyRecord.id).eq('locale', locale).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data: data?.value || null } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getKeys(options?: { namespace?: string; has_translations?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('translation_keys').select('*, translations(count)'); if (options?.namespace) query = query.eq('namespace', options.namespace); if (options?.search) query = query.ilike('key', `%${options.search}%`); const { data, error } = await query.order('key', { ascending: true }).limit(options?.limit || 200); if (error) throw error; let result = data || []; if (options?.has_translations !== undefined) { result = result.filter(k => options.has_translations ? k.translations?.length > 0 : k.translations?.length === 0) } return { success: true, data: result } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getLocales(options?: { is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('translation_locales').select('*'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addLocale(localeData: { code: string; name: string; native_name?: string; direction?: string; is_default?: boolean }) {
  try { const supabase = await createClient(); if (localeData.is_default) { await supabase.from('translation_locales').update({ is_default: false }).eq('is_default', true) } const { data, error } = await supabase.from('translation_locales').insert({ ...localeData, direction: localeData.direction || 'ltr', is_active: true, is_default: localeData.is_default ?? false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

async function logHistory(translationId: string, action: string, details?: any, userId?: string) {
  const supabase = await createClient()
  await supabase.from('translation_history').insert({ translation_id: translationId, action, details, performed_by: userId, occurred_at: new Date().toISOString(), created_at: new Date().toISOString() })
}

export async function getHistory(translationId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('translation_history').select('*, users(*)').eq('translation_id', translationId).order('occurred_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function importTranslations(importData: { locale: string; namespace?: string; translations: Record<string, string>; imported_by: string; overwrite?: boolean }) {
  try { const supabase = await createClient(); const { data: importRecord, error: importError } = await supabase.from('translation_imports').insert({ locale: importData.locale, namespace: importData.namespace || 'default', key_count: Object.keys(importData.translations).length, status: 'processing', imported_by: importData.imported_by, created_at: new Date().toISOString() }).select().single(); if (importError) throw importError; let imported = 0, skipped = 0; for (const [key, value] of Object.entries(importData.translations)) { const existing = await getTranslationValue(key, importData.locale, importData.namespace || 'default'); if (existing.data && !importData.overwrite) { skipped++; continue } await createTranslation({ key, locale: importData.locale, value, namespace: importData.namespace, created_by: importData.imported_by }); imported++ } await supabase.from('translation_imports').update({ status: 'completed', imported_count: imported, skipped_count: skipped, completed_at: new Date().toISOString() }).eq('id', importRecord.id); return { success: true, data: { imported, skipped, total: Object.keys(importData.translations).length } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function exportTranslations(locale: string, namespace?: string) {
  try { const supabase = await createClient(); let query = supabase.from('translations').select('*, translation_keys(key, namespace)').eq('locale', locale); if (namespace) query = query.eq('translation_keys.namespace', namespace); const { data, error } = await query; if (error) throw error; const translations: Record<string, string> = {}; data?.forEach(t => { if (t.translation_keys?.key) translations[t.translation_keys.key] = t.value }); await supabase.from('translation_exports').insert({ locale, namespace, key_count: Object.keys(translations).length, exported_at: new Date().toISOString(), created_at: new Date().toISOString() }); return { success: true, data: translations } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getNamespaces() {
  try { const supabase = await createClient(); const { data } = await supabase.from('translation_keys').select('namespace'); const unique = [...new Set(data?.map(k => k.namespace).filter(Boolean))]; return { success: true, data: unique } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getMissingTranslations(locale: string, namespace?: string) {
  try { const supabase = await createClient(); let keysQuery = supabase.from('translation_keys').select('id, key, namespace'); if (namespace) keysQuery = keysQuery.eq('namespace', namespace); const { data: keys } = await keysQuery; const { data: translations } = await supabase.from('translations').select('key_id').eq('locale', locale); const translatedKeyIds = translations?.map(t => t.key_id) || []; const missing = keys?.filter(k => !translatedKeyIds.includes(k.id)) || []; return { success: true, data: missing } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
