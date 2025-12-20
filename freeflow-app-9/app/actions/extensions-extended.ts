'use server'

/**
 * Extended Extensions Server Actions
 * Tables: extensions, extension_installs, extension_settings, extension_versions
 */

import { createClient } from '@/lib/supabase/server'

export async function getExtension(extensionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('extensions').select('*, extension_versions(*)').eq('id', extensionId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createExtension(extensionData: { name: string; description?: string; developer_id: string; category?: string; icon?: string; repository_url?: string; version: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('extensions').insert({ ...extensionData, status: 'draft', install_count: 0, rating_avg: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateExtension(extensionId: string, updates: Partial<{ name: string; description: string; category: string; icon: string; status: string; version: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('extensions').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', extensionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getExtensions(options?: { category?: string; status?: string; developer_id?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('extensions').select('*'); if (options?.category) query = query.eq('category', options.category); if (options?.status) query = query.eq('status', options.status); if (options?.developer_id) query = query.eq('developer_id', options.developer_id); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('install_count', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function installExtension(extensionId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('extension_installs').insert({ extension_id: extensionId, user_id: userId, is_active: true, installed_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.rpc('increment_install_count', { extension_id: extensionId }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function uninstallExtension(extensionId: string, userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('extension_installs').delete().eq('extension_id', extensionId).eq('user_id', userId); if (error) throw error; await supabase.rpc('decrement_install_count', { extension_id: extensionId }); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserExtensions(userId: string, options?: { is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('extension_installs').select('*, extensions(*)').eq('user_id', userId); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('installed_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getExtensionSettings(extensionId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('extension_settings').select('*').eq('extension_id', extensionId).eq('user_id', userId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateExtensionSettings(extensionId: string, userId: string, settings: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('extension_settings').upsert({ extension_id: extensionId, user_id: userId, settings, updated_at: new Date().toISOString() }, { onConflict: 'extension_id,user_id' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function publishExtensionVersion(versionData: { extension_id: string; version: string; changelog?: string; download_url: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('extension_versions').insert({ ...versionData, published_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('extensions').update({ version: versionData.version, updated_at: new Date().toISOString() }).eq('id', versionData.extension_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
