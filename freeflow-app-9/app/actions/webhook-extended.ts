'use server'

/**
 * Extended Webhook Server Actions - Covers all Webhook-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getWebhooks(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('webhooks').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getWebhook(webhookId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('webhooks').select('*').eq('id', webhookId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createWebhook(userId: string, input: { name: string; url: string; events: string[]; secret?: string; headers?: any }) {
  try { const supabase = await createClient(); const secret = input.secret || crypto.randomUUID(); const { data, error } = await supabase.from('webhooks').insert({ user_id: userId, ...input, secret, is_active: true, failure_count: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateWebhook(webhookId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('webhooks').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', webhookId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function toggleWebhook(webhookId: string, isActive: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('webhooks').update({ is_active: isActive }).eq('id', webhookId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function regenerateWebhookSecret(webhookId: string) {
  try { const supabase = await createClient(); const secret = crypto.randomUUID(); const { data, error } = await supabase.from('webhooks').update({ secret }).eq('id', webhookId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteWebhook(webhookId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('webhooks').delete().eq('id', webhookId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getWebhookLogs(webhookId: string, limit = 100) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('webhook_logs').select('*').eq('webhook_id', webhookId).order('timestamp', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function logWebhookDelivery(webhookId: string, input: { event_type: string; payload: any; response_status?: number; response_body?: string; duration_ms?: number; success: boolean; error_message?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('webhook_logs').insert({ webhook_id: webhookId, ...input, timestamp: new Date().toISOString() }).select().single(); if (error) throw error; if (!input.success) { await supabase.from('webhooks').update({ failure_count: supabase.rpc('increment_counter', { row_id: webhookId }), last_failure_at: new Date().toISOString() }).eq('id', webhookId); } else { await supabase.from('webhooks').update({ failure_count: 0, last_success_at: new Date().toISOString() }).eq('id', webhookId); } return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function clearWebhookLogs(webhookId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('webhook_logs').delete().eq('webhook_id', webhookId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getWebhookEvents() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('webhook_events').select('*').order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createWebhookEvent(input: { name: string; description?: string; payload_schema?: any; category?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('webhook_events').insert(input).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function testWebhook(webhookId: string) {
  try { const supabase = await createClient(); const { data: webhook, error } = await supabase.from('webhooks').select('*').eq('id', webhookId).single(); if (error) throw error; const testPayload = { event: 'webhook.test', timestamp: new Date().toISOString(), data: { message: 'This is a test webhook delivery' } }; return { success: true, data: { webhook_id: webhookId, url: webhook.url, payload: testPayload, message: 'Test webhook would be sent to the URL' } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
