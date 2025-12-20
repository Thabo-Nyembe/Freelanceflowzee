'use server'

/**
 * Extended Notifications Server Actions - Covers all Notification-related tables
 * Tables: notifications, notification_bulk_actions, notification_deliveries, notification_delivery_logs, notification_groups, notification_preferences, notification_queue, notification_reactions, notification_schedules, notification_settings, notification_stats, notification_templates, notification_unsubscribes
 */

import { createClient } from '@/lib/supabase/server'

export async function getNotification(notificationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('notifications').select('*').eq('id', notificationId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createNotification(notificationData: { user_id: string; type: string; title: string; message: string; action_url?: string; metadata?: Record<string, any>; priority?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('notifications').insert({ ...notificationData, priority: notificationData.priority || 'normal', is_read: false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function markNotificationRead(notificationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('notifications').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', notificationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function markAllNotificationsRead(userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('notifications').update({ is_read: true, read_at: new Date().toISOString() }).eq('user_id', userId).eq('is_read', false); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteNotification(notificationId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('notifications').delete().eq('id', notificationId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getNotifications(userId: string, options?: { type?: string; isRead?: boolean; priority?: string; limit?: number; offset?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('notifications').select('*', { count: 'exact' }).eq('user_id', userId); if (options?.type) query = query.eq('type', options.type); if (options?.isRead !== undefined) query = query.eq('is_read', options.isRead); if (options?.priority) query = query.eq('priority', options.priority); const { data, count, error } = await query.order('created_at', { ascending: false }).range(options?.offset || 0, (options?.offset || 0) + (options?.limit || 50) - 1); if (error) throw error; return { success: true, data: data || [], total: count || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [], total: 0 } }
}

export async function getUnreadNotificationCount(userId: string) {
  try { const supabase = await createClient(); const { count, error } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('is_read', false); if (error) throw error; return { success: true, count: count || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createBulkNotifications(userIds: string[], notificationData: { type: string; title: string; message: string; action_url?: string; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const inserts = userIds.map(userId => ({ user_id: userId, ...notificationData, is_read: false, created_at: new Date().toISOString() })); const { data, error } = await supabase.from('notifications').insert(inserts).select(); if (error) throw error; return { success: true, data: data || [], count: data?.length || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getNotificationPreferences(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('notification_preferences').select('*').eq('user_id', userId); if (error) throw error; const prefs: Record<string, any> = {}; data?.forEach(p => { prefs[p.notification_type] = { email: p.email_enabled, push: p.push_enabled, in_app: p.in_app_enabled }; }); return { success: true, data: prefs } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateNotificationPreference(userId: string, notificationType: string, preferences: { email_enabled?: boolean; push_enabled?: boolean; in_app_enabled?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('notification_preferences').upsert({ user_id: userId, notification_type: notificationType, ...preferences, updated_at: new Date().toISOString() }, { onConflict: 'user_id,notification_type' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getNotificationSettings(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('notification_settings').select('*').eq('user_id', userId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateNotificationSettings(userId: string, settings: { quiet_hours_start?: string; quiet_hours_end?: string; email_digest?: string; push_enabled?: boolean; sound_enabled?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('notification_settings').upsert({ user_id: userId, ...settings, updated_at: new Date().toISOString() }, { onConflict: 'user_id' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function queueNotification(queueData: { user_id: string; type: string; title: string; message: string; channel: string; scheduled_for?: string; priority?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('notification_queue').insert({ ...queueData, status: 'pending', scheduled_for: queueData.scheduled_for || new Date().toISOString(), priority: queueData.priority || 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getNotificationQueue(options?: { status?: string; channel?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('notification_queue').select('*'); if (options?.status) query = query.eq('status', options.status); if (options?.channel) query = query.eq('channel', options.channel); const { data, error } = await query.order('priority', { ascending: false }).order('scheduled_for', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function processNotificationQueue(queueId: string, status: 'sent' | 'failed', errorMessage?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('notification_queue').update({ status, processed_at: new Date().toISOString(), error_message: errorMessage }).eq('id', queueId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getNotificationTemplate(templateId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('notification_templates').select('*').eq('id', templateId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createNotificationTemplate(templateData: { name: string; type: string; subject?: string; body: string; variables?: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('notification_templates').insert({ ...templateData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getNotificationTemplates(options?: { type?: string; isActive?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('notification_templates').select('*'); if (options?.type) query = query.eq('type', options.type); if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordNotificationDelivery(deliveryData: { notification_id: string; channel: string; status: string; recipient: string; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('notification_deliveries').insert({ ...deliveryData, delivered_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addNotificationReaction(notificationId: string, userId: string, reaction: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('notification_reactions').insert({ notification_id: notificationId, user_id: userId, reaction, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function unsubscribeFromNotifications(userId: string, notificationType: string, reason?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('notification_unsubscribes').insert({ user_id: userId, notification_type: notificationType, reason, created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('notification_preferences').update({ email_enabled: false, push_enabled: false }).eq('user_id', userId).eq('notification_type', notificationType); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getNotificationStats(userId: string, options?: { startDate?: string; endDate?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('notification_stats').select('*').eq('user_id', userId); if (options?.startDate) query = query.gte('period_start', options.startDate); if (options?.endDate) query = query.lte('period_end', options.endDate); const { data, error } = await query.order('period_start', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
