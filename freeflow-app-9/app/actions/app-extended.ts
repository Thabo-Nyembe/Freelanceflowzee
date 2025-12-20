'use server'

/**
 * Extended App Server Actions
 * Tables: app_settings, app_configs, app_versions, app_features
 */

import { createClient } from '@/lib/supabase/server'

export async function getAppSettings(appId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('app_settings').select('*'); if (appId) query = query.eq('app_id', appId); const { data, error } = await query.single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateAppSettings(appId: string, settings: Record<string, any>) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('app_settings').select('id').eq('app_id', appId).single(); if (existing) { const { data, error } = await supabase.from('app_settings').update({ settings, updated_at: new Date().toISOString() }).eq('app_id', appId).select().single(); if (error) throw error; return { success: true, data } } else { const { data, error } = await supabase.from('app_settings').insert({ app_id: appId, settings, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAppConfig(configKey: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('app_configs').select('*').eq('key', configKey).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setAppConfig(configKey: string, value: any, options?: { description?: string; is_public?: boolean }) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('app_configs').select('id').eq('key', configKey).single(); if (existing) { const { data, error } = await supabase.from('app_configs').update({ value, ...options, updated_at: new Date().toISOString() }).eq('key', configKey).select().single(); if (error) throw error; return { success: true, data } } else { const { data, error } = await supabase.from('app_configs').insert({ key: configKey, value, ...options, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAppConfigs(options?: { is_public?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('app_configs').select('*'); if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public); const { data, error } = await query.order('key', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getAppVersion(versionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('app_versions').select('*').eq('id', versionId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createAppVersion(versionData: { version: string; release_notes?: string; is_mandatory?: boolean; min_supported_version?: string; download_url?: string; platform?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('app_versions').insert({ ...versionData, status: 'draft', is_mandatory: versionData.is_mandatory ?? false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function publishAppVersion(versionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('app_versions').update({ status: 'published', published_at: new Date().toISOString() }).eq('id', versionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLatestAppVersion(platform?: string) {
  try { const supabase = await createClient(); let query = supabase.from('app_versions').select('*').eq('status', 'published'); if (platform) query = query.eq('platform', platform); const { data, error } = await query.order('published_at', { ascending: false }).limit(1).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAppFeatures(options?: { is_enabled?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('app_features').select('*'); if (options?.is_enabled !== undefined) query = query.eq('is_enabled', options.is_enabled); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function toggleAppFeature(featureKey: string, isEnabled: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('app_features').update({ is_enabled: isEnabled, updated_at: new Date().toISOString() }).eq('key', featureKey).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
