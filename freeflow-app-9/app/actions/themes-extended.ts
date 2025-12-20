'use server'

/**
 * Extended Themes Server Actions
 * Tables: themes, theme_settings, theme_customizations, theme_assets, theme_versions, theme_installations
 */

import { createClient } from '@/lib/supabase/server'

export async function getTheme(themeId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('themes').select('*, theme_settings(*), theme_assets(*), theme_versions(*)').eq('id', themeId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createTheme(themeData: { name: string; slug: string; description?: string; author_id: string; category?: string; preview_url?: string; settings_schema?: any; default_settings?: any; is_public?: boolean; price?: number; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('themes').insert({ ...themeData, version: '1.0.0', is_public: themeData.is_public ?? false, status: 'draft', install_count: 0, rating: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('theme_versions').insert({ theme_id: data.id, version: '1.0.0', settings_schema: themeData.settings_schema, default_settings: themeData.default_settings, created_by: themeData.author_id, created_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTheme(themeId: string, updates: Partial<{ name: string; description: string; category: string; preview_url: string; settings_schema: any; default_settings: any; is_public: boolean; status: string; price: number; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('themes').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', themeId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteTheme(themeId: string) {
  try { const supabase = await createClient(); await supabase.from('theme_versions').delete().eq('theme_id', themeId); await supabase.from('theme_settings').delete().eq('theme_id', themeId); await supabase.from('theme_assets').delete().eq('theme_id', themeId); await supabase.from('theme_customizations').delete().eq('theme_id', themeId); await supabase.from('theme_installations').delete().eq('theme_id', themeId); const { error } = await supabase.from('themes').delete().eq('id', themeId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getThemes(options?: { category?: string; author_id?: string; status?: string; is_public?: boolean; is_free?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('themes').select('*'); if (options?.category) query = query.eq('category', options.category); if (options?.author_id) query = query.eq('author_id', options.author_id); if (options?.status) query = query.eq('status', options.status); if (options?.is_public !== undefined) query = query.eq('is_public', options.is_public); if (options?.is_free) query = query.or('price.is.null,price.eq.0'); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function publishTheme(themeId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('themes').update({ status: 'published', published_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', themeId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function installTheme(themeId: string, userId: string, entityType: string, entityId: string) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('theme_installations').select('id').eq('theme_id', themeId).eq('entity_type', entityType).eq('entity_id', entityId).single(); if (existing) return { success: false, error: 'Theme already installed' }; const { data: theme } = await supabase.from('themes').select('default_settings').eq('id', themeId).single(); const { data, error } = await supabase.from('theme_installations').insert({ theme_id: themeId, user_id: userId, entity_type: entityType, entity_id: entityId, settings: theme?.default_settings || {}, status: 'active', installed_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('themes').update({ install_count: supabase.rpc('increment_count', { row_id: themeId, count_column: 'install_count' }) }).eq('id', themeId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function uninstallTheme(installationId: string) {
  try { const supabase = await createClient(); const { data: installation } = await supabase.from('theme_installations').select('theme_id').eq('id', installationId).single(); const { error } = await supabase.from('theme_installations').delete().eq('id', installationId); if (error) throw error; if (installation?.theme_id) { await supabase.rpc('decrement_count', { row_id: installation.theme_id, table_name: 'themes', count_column: 'install_count' }) } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateInstallationSettings(installationId: string, settings: Record<string, any>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('theme_installations').update({ settings, updated_at: new Date().toISOString() }).eq('id', installationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInstallations(options?: { theme_id?: string; user_id?: string; entity_type?: string; entity_id?: string; status?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('theme_installations').select('*, themes(*)'); if (options?.theme_id) query = query.eq('theme_id', options.theme_id); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.entity_type) query = query.eq('entity_type', options.entity_type); if (options?.entity_id) query = query.eq('entity_id', options.entity_id); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('installed_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function saveCustomization(installationId: string, customizations: Record<string, any>, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('theme_customizations').insert({ installation_id: installationId, customizations, created_by: userId, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getVersions(themeId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('theme_versions').select('*, users(*)').eq('theme_id', themeId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addAsset(themeId: string, assetData: { name: string; asset_type: string; file_url: string; file_size?: number; mime_type?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('theme_assets').insert({ theme_id: themeId, ...assetData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCategories() {
  try { const supabase = await createClient(); const { data } = await supabase.from('themes').select('category').not('category', 'is', null).eq('status', 'published'); const unique = [...new Set(data?.map(t => t.category).filter(Boolean))]; return { success: true, data: unique } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
