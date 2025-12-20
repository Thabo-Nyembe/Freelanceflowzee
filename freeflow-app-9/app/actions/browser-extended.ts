'use server'

/**
 * Extended Browser Server Actions - Covers all Browser-related tables
 * Tables: browser_extension_installations, browser_info
 */

import { createClient } from '@/lib/supabase/server'

export async function getBrowserInfo(infoId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('browser_info').select('*').eq('id', infoId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createBrowserInfo(infoData: { user_id?: string; session_id?: string; browser_name: string; browser_version: string; os: string; os_version?: string; device_type?: string; screen_resolution?: string; language?: string; timezone?: string; user_agent?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('browser_info').insert({ ...infoData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBrowserInfoBySession(sessionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('browser_info').select('*').eq('session_id', sessionId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserBrowserHistory(userId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('browser_info').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getBrowserStats(options?: { startDate?: string; endDate?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('browser_info').select('browser_name, os, device_type'); if (options?.startDate) query = query.gte('created_at', options.startDate); if (options?.endDate) query = query.lte('created_at', options.endDate); const { data } = await query; const stats = { total: data?.length || 0, byBrowser: {} as Record<string, number>, byOS: {} as Record<string, number>, byDevice: {} as Record<string, number> }; data?.forEach(b => { stats.byBrowser[b.browser_name] = (stats.byBrowser[b.browser_name] || 0) + 1; stats.byOS[b.os] = (stats.byOS[b.os] || 0) + 1; if (b.device_type) stats.byDevice[b.device_type] = (stats.byDevice[b.device_type] || 0) + 1; }); return { success: true, data: stats } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getExtensionInstallation(installationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('browser_extension_installations').select('*').eq('id', installationId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createExtensionInstallation(installData: { user_id: string; extension_id: string; extension_name: string; extension_version: string; browser: string; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('browser_extension_installations').insert({ ...installData, is_active: installData.is_active ?? true, installed_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateExtensionInstallation(installationId: string, updates: Partial<{ extension_version: string; is_active: boolean; last_used_at: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('browser_extension_installations').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', installationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteExtensionInstallation(installationId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('browser_extension_installations').delete().eq('id', installationId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserExtensions(userId: string, options?: { isActive?: boolean; browser?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('browser_extension_installations').select('*').eq('user_id', userId); if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive); if (options?.browser) query = query.eq('browser', options.browser); const { data, error } = await query.order('installed_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getExtensionStats(extensionId: string) {
  try { const supabase = await createClient(); const { data } = await supabase.from('browser_extension_installations').select('browser, is_active').eq('extension_id', extensionId); const stats = { total: data?.length || 0, active: data?.filter(e => e.is_active).length || 0, byBrowser: {} as Record<string, number> }; data?.forEach(e => { stats.byBrowser[e.browser] = (stats.byBrowser[e.browser] || 0) + 1; }); return { success: true, data: stats } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deactivateExtension(userId: string, extensionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('browser_extension_installations').update({ is_active: false, deactivated_at: new Date().toISOString() }).eq('user_id', userId).eq('extension_id', extensionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
