'use server'

/**
 * Extended Localization Server Actions
 * Tables: localization_strings, localization_locales, localization_projects, localization_translations, localization_contexts
 */

import { createClient } from '@/lib/supabase/server'

export async function getLocalizationString(stringId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('localization_strings').select('*, localization_translations(*)').eq('id', stringId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createLocalizationString(stringData: { key: string; default_value: string; project_id?: string; context_id?: string; description?: string; max_length?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('localization_strings').insert({ ...stringData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateLocalizationString(stringId: string, updates: Partial<{ key: string; default_value: string; description: string; max_length: number; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('localization_strings').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', stringId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLocalizationStrings(options?: { project_id?: string; context_id?: string; status?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('localization_strings').select('*, localization_translations(*)'); if (options?.project_id) query = query.eq('project_id', options.project_id); if (options?.context_id) query = query.eq('context_id', options.context_id); if (options?.status) query = query.eq('status', options.status); if (options?.search) query = query.or(`key.ilike.%${options.search}%,default_value.ilike.%${options.search}%`); const { data, error } = await query.order('key', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createTranslation(translationData: { string_id: string; locale_code: string; value: string; translated_by?: string; is_machine?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('localization_translations').insert({ ...translationData, status: translationData.is_machine ? 'needs_review' : 'approved', is_machine: translationData.is_machine ?? false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTranslation(translationId: string, updates: Partial<{ value: string; status: string; reviewed_by: string }>) {
  try { const supabase = await createClient(); const updateData: any = { ...updates, updated_at: new Date().toISOString() }; if (updates.reviewed_by) updateData.reviewed_at = new Date().toISOString(); const { data, error } = await supabase.from('localization_translations').update(updateData).eq('id', translationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTranslationsForLocale(localeCode: string, options?: { project_id?: string; status?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('localization_translations').select('*, localization_strings(*)').eq('locale_code', localeCode); if (options?.project_id) query = query.eq('localization_strings.project_id', options.project_id); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getLocales() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('localization_locales').select('*').order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createLocale(localeData: { code: string; name: string; native_name?: string; direction?: string; is_default?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('localization_locales').insert({ ...localeData, direction: localeData.direction || 'ltr', is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLocalizationProjects(options?: { organization_id?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('localization_projects').select('*'); if (options?.organization_id) query = query.eq('organization_id', options.organization_id); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createLocalizationProject(projectData: { name: string; description?: string; organization_id?: string; source_locale: string; target_locales: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('localization_projects').insert({ ...projectData, string_count: 0, translated_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTranslationProgress(projectId: string) {
  try { const supabase = await createClient(); const { data: strings } = await supabase.from('localization_strings').select('id').eq('project_id', projectId); const { data: translations } = await supabase.from('localization_translations').select('locale_code, status').in('string_id', strings?.map(s => s.id) || []); const { data: project } = await supabase.from('localization_projects').select('target_locales').eq('id', projectId).single(); const progress: Record<string, { total: number; translated: number; approved: number }> = {}; project?.target_locales?.forEach((locale: string) => { const localeTranslations = translations?.filter(t => t.locale_code === locale) || []; progress[locale] = { total: strings?.length || 0, translated: localeTranslations.length, approved: localeTranslations.filter(t => t.status === 'approved').length } }); return { success: true, data: progress } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function exportTranslations(projectId: string, localeCode: string, format?: string) {
  try { const supabase = await createClient(); const { data } = await supabase.from('localization_translations').select('localization_strings(key), value').eq('locale_code', localeCode).eq('localization_strings.project_id', projectId); const translations: Record<string, string> = {}; data?.forEach((t: any) => { if (t.localization_strings?.key) translations[t.localization_strings.key] = t.value }); return { success: true, data: translations, format: format || 'json' } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
