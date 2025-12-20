'use server'

/**
 * Extended Installed Apps Server Actions
 * Tables: installed_apps, installed_plugins, installed_extensions, installed_themes
 */

import { createClient } from '@/lib/supabase/server'

export async function getInstalledApp(installId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('installed_apps').select('*').eq('id', installId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function installApp(installData: { user_id: string; app_id: string; version?: string; settings?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('installed_apps').insert({ ...installData, is_active: true, installed_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateInstalledApp(installId: string, updates: Partial<{ version: string; settings: Record<string, any>; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('installed_apps').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', installId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function uninstallApp(installId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('installed_apps').delete().eq('id', installId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInstalledApps(userId: string, options?: { is_active?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('installed_apps').select('*').eq('user_id', userId); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('installed_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getInstalledPlugins(userId: string, options?: { is_active?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('installed_plugins').select('*').eq('user_id', userId); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('installed_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getInstalledExtensions(userId: string, options?: { is_active?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('installed_extensions').select('*').eq('user_id', userId); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('installed_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getInstalledThemes(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('installed_themes').select('*').eq('user_id', userId).order('installed_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function toggleAppStatus(installId: string, isActive: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('installed_apps').update({ is_active: isActive, updated_at: new Date().toISOString() }).eq('id', installId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
