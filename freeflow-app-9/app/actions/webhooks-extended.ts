'use server'

/**
 * Extended Webhooks Server Actions
 * Tables: webhooks, webhook_events, webhook_deliveries, webhook_logs
 */

import { createClient } from '@/lib/supabase/server'

export async function getWebhook(webhookId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('webhooks').select('*').eq('id', webhookId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createWebhook(webhookData: { url: string; user_id: string; events: string[]; secret?: string; description?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('webhooks').insert({ ...webhookData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateWebhook(webhookId: string, updates: Partial<{ url: string; events: string[]; is_active: boolean; description: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('webhooks').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', webhookId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteWebhook(webhookId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('webhooks').delete().eq('id', webhookId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getWebhooks(options?: { user_id?: string; is_active?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('webhooks').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getWebhookEvents(options?: { event_type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('webhook_events').select('*'); if (options?.event_type) query = query.eq('event_type', options.event_type); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getWebhookDeliveries(webhookId: string, options?: { status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('webhook_deliveries').select('*').eq('webhook_id', webhookId); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getWebhookLogs(webhookId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('webhook_logs').select('*').eq('webhook_id', webhookId).order('created_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
