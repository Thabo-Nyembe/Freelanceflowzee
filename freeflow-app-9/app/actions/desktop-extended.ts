'use server'

/**
 * Extended Desktop Server Actions - Covers all Desktop-related tables
 * Tables: desktop_apps, desktop_notifications, desktop_shortcuts, desktop_preferences
 */

import { createClient } from '@/lib/supabase/server'

export async function getDesktopApp(appId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('desktop_apps').select('*').eq('id', appId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createDesktopApp(appData: { name: string; description?: string; user_id: string; app_type: string; icon_url?: string; executable_path?: string; config?: Record<string, any>; permissions?: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('desktop_apps').insert({ ...appData, version: '1.0.0', is_installed: false, is_running: false, launch_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateDesktopApp(appId: string, updates: Partial<{ name: string; description: string; version: string; icon_url: string; executable_path: string; config: Record<string, any>; permissions: string[]; is_installed: boolean; is_running: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('desktop_apps').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', appId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteDesktopApp(appId: string) {
  try { const supabase = await createClient(); await supabase.from('desktop_shortcuts').delete().eq('app_id', appId); const { error } = await supabase.from('desktop_apps').delete().eq('id', appId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDesktopApps(userId: string, options?: { app_type?: string; is_installed?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('desktop_apps').select('*').eq('user_id', userId); if (options?.app_type) query = query.eq('app_type', options.app_type); if (options?.is_installed !== undefined) query = query.eq('is_installed', options.is_installed); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function launchDesktopApp(appId: string) {
  try { const supabase = await createClient(); const { data: app } = await supabase.from('desktop_apps').select('launch_count').eq('id', appId).single(); const { data, error } = await supabase.from('desktop_apps').update({ is_running: true, last_launched_at: new Date().toISOString(), launch_count: (app?.launch_count || 0) + 1, updated_at: new Date().toISOString() }).eq('id', appId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function stopDesktopApp(appId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('desktop_apps').update({ is_running: false, updated_at: new Date().toISOString() }).eq('id', appId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function installDesktopApp(appId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('desktop_apps').update({ is_installed: true, installed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', appId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function uninstallDesktopApp(appId: string) {
  try { const supabase = await createClient(); await supabase.from('desktop_shortcuts').delete().eq('app_id', appId); const { data, error } = await supabase.from('desktop_apps').update({ is_installed: false, is_running: false, uninstalled_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', appId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createDesktopNotification(notificationData: { user_id: string; title: string; body?: string; icon_url?: string; app_id?: string; action_url?: string; priority?: 'low' | 'normal' | 'high' | 'urgent' }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('desktop_notifications').insert({ ...notificationData, priority: notificationData.priority || 'normal', is_read: false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDesktopNotifications(userId: string, options?: { is_read?: boolean; priority?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('desktop_notifications').select('*').eq('user_id', userId); if (options?.is_read !== undefined) query = query.eq('is_read', options.is_read); if (options?.priority) query = query.eq('priority', options.priority); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function markNotificationAsRead(notificationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('desktop_notifications').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', notificationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function markAllNotificationsAsRead(userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('desktop_notifications').update({ is_read: true, read_at: new Date().toISOString() }).eq('user_id', userId).eq('is_read', false); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteDesktopNotification(notificationId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('desktop_notifications').delete().eq('id', notificationId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createDesktopShortcut(shortcutData: { user_id: string; app_id?: string; name: string; icon_url?: string; target_url?: string; position?: { x: number; y: number }; folder_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('desktop_shortcuts').insert({ ...shortcutData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateDesktopShortcut(shortcutId: string, updates: Partial<{ name: string; icon_url: string; target_url: string; position: { x: number; y: number }; folder_id: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('desktop_shortcuts').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', shortcutId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteDesktopShortcut(shortcutId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('desktop_shortcuts').delete().eq('id', shortcutId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDesktopShortcuts(userId: string, options?: { folder_id?: string | null }) {
  try { const supabase = await createClient(); let query = supabase.from('desktop_shortcuts').select('*, desktop_apps(*)').eq('user_id', userId); if (options?.folder_id === null) { query = query.is('folder_id', null) } else if (options?.folder_id) { query = query.eq('folder_id', options.folder_id) } const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getDesktopPreferences(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('desktop_preferences').select('*').eq('user_id', userId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateDesktopPreferences(userId: string, preferences: Partial<{ wallpaper_url: string; theme: string; icon_size: string; grid_size: { columns: number; rows: number }; dock_position: string; dock_auto_hide: boolean; notification_settings: Record<string, any> }>) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('desktop_preferences').select('id').eq('user_id', userId).single(); if (existing) { const { data, error } = await supabase.from('desktop_preferences').update({ ...preferences, updated_at: new Date().toISOString() }).eq('user_id', userId).select().single(); if (error) throw error; return { success: true, data } } else { const { data, error } = await supabase.from('desktop_preferences').insert({ user_id: userId, ...preferences, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRunningApps(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('desktop_apps').select('*').eq('user_id', userId).eq('is_running', true).order('last_launched_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
