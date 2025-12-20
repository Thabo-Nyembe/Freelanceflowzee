'use server'

/**
 * Extended Plugins Server Actions
 * Tables: plugins, plugin_installs, plugin_settings, plugin_hooks
 */

import { createClient } from '@/lib/supabase/server'

export async function getPlugin(pluginId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('plugins').select('*').eq('id', pluginId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createPlugin(pluginData: { name: string; description?: string; version: string; author?: string; category?: string; config?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('plugins').insert({ ...pluginData, status: 'active', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePlugin(pluginId: string, updates: Partial<{ name: string; description: string; version: string; config: Record<string, any>; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('plugins').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', pluginId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deletePlugin(pluginId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('plugins').delete().eq('id', pluginId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPlugins(options?: { category?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('plugins').select('*'); if (options?.category) query = query.eq('category', options.category); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function installPlugin(userId: string, pluginId: string, settings?: Record<string, any>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('plugin_installs').insert({ user_id: userId, plugin_id: pluginId, settings, is_active: true, installed_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function uninstallPlugin(installId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('plugin_installs').delete().eq('id', installId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserPlugins(userId: string, options?: { is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('plugin_installs').select('*, plugins(*)').eq('user_id', userId); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('installed_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function updatePluginSettings(installId: string, settings: Record<string, any>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('plugin_installs').update({ settings, updated_at: new Date().toISOString() }).eq('id', installId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
