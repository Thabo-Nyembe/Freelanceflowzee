'use server'

/**
 * Extended Push Notifications Server Actions
 * Tables: push_notifications, push_subscriptions, push_campaigns, push_analytics
 */

import { createClient } from '@/lib/supabase/server'

export async function getPushNotification(notificationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('push_notifications').select('*').eq('id', notificationId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createPushNotification(notificationData: { user_id: string; title: string; body: string; data?: Record<string, any>; scheduled_at?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('push_notifications').insert({ ...notificationData, status: notificationData.scheduled_at ? 'scheduled' : 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePushNotification(notificationId: string, updates: Partial<{ title: string; body: string; data: Record<string, any>; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('push_notifications').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', notificationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPushNotifications(options?: { user_id?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('push_notifications').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function sendPushNotification(notificationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('push_notifications').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', notificationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function subscribeToPush(userId: string, subscriptionData: { endpoint: string; keys: Record<string, string>; device_type?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('push_subscriptions').insert({ user_id: userId, ...subscriptionData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function unsubscribeFromPush(subscriptionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('push_subscriptions').update({ is_active: false, unsubscribed_at: new Date().toISOString() }).eq('id', subscriptionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPushCampaigns(options?: { status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('push_campaigns').select('*'); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
