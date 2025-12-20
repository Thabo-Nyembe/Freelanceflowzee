'use server'

/**
 * Extended Notification Server Actions - Covers all 12 Notification-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getNotificationBulkActions(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('notification_bulk_actions').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createNotificationBulkAction(userId: string, action: string, notificationIds: string[]) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('notification_bulk_actions').insert({ user_id: userId, action, notification_ids: notificationIds }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getNotificationDeliveries(notificationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('notification_deliveries').select('*').eq('notification_id', notificationId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getNotificationDeliveryLogs(deliveryId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('notification_delivery_logs').select('*').eq('delivery_id', deliveryId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getNotificationGroups(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('notification_groups').select('*').eq('user_id', userId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createNotificationGroup(userId: string, name: string, description?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('notification_groups').insert({ user_id: userId, name, description }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getNotificationPreferences(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('notification_preferences').select('*').eq('user_id', userId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateNotificationPreferences(userId: string, preferences: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('notification_preferences').upsert({ user_id: userId, ...preferences }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getNotificationQueue(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('notification_queue').select('*').eq('user_id', userId).eq('status', 'pending').order('scheduled_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function queueNotification(userId: string, type: string, content: any, scheduledAt?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('notification_queue').insert({ user_id: userId, type, content, scheduled_at: scheduledAt || new Date().toISOString(), status: 'pending' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getNotificationReactions(notificationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('notification_reactions').select('*').eq('notification_id', notificationId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addNotificationReaction(notificationId: string, userId: string, reaction: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('notification_reactions').insert({ notification_id: notificationId, user_id: userId, reaction }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getNotificationSchedules(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('notification_schedules').select('*').eq('user_id', userId).eq('is_active', true); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createNotificationSchedule(userId: string, input: { name: string; cron: string; type: string; config: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('notification_schedules').insert({ user_id: userId, ...input, is_active: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function toggleNotificationSchedule(scheduleId: string, isActive: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('notification_schedules').update({ is_active: isActive }).eq('id', scheduleId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getNotificationSettings(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('notification_settings').select('*').eq('user_id', userId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateNotificationSettings(userId: string, settings: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('notification_settings').upsert({ user_id: userId, ...settings }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getNotificationStats(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('notification_stats').select('*').eq('user_id', userId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getNotificationTemplates() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('notification_templates').select('*').order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createNotificationTemplate(input: { name: string; type: string; subject?: string; body: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('notification_templates').insert(input).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getNotificationUnsubscribes(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('notification_unsubscribes').select('*').eq('user_id', userId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function unsubscribeFromNotification(userId: string, notificationType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('notification_unsubscribes').insert({ user_id: userId, notification_type: notificationType }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function resubscribeToNotification(userId: string, notificationType: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('notification_unsubscribes').delete().eq('user_id', userId).eq('notification_type', notificationType); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
