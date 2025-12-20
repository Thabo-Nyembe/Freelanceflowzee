'use server'

/**
 * Extended Callback Server Actions - Covers all Callback-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getCallback(callbackId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('callbacks').select('*').eq('id', callbackId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createCallback(callbackData: { name: string; callback_type: string; url: string; method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; headers?: Record<string, string>; auth_type?: 'none' | 'basic' | 'bearer' | 'api_key'; auth_config?: Record<string, string>; payload_template?: Record<string, any>; retry_config?: { max_retries: number; retry_delay: number; backoff_multiplier: number }; timeout_ms?: number; user_id?: string; description?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('callbacks').insert({ ...callbackData, method: callbackData.method || 'POST', auth_type: callbackData.auth_type || 'none', timeout_ms: callbackData.timeout_ms || 30000, is_active: true, call_count: 0, failure_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCallback(callbackId: string, updates: Partial<{ name: string; url: string; method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; headers: Record<string, string>; auth_type: 'none' | 'basic' | 'bearer' | 'api_key'; auth_config: Record<string, string>; payload_template: Record<string, any>; retry_config: { max_retries: number; retry_delay: number; backoff_multiplier: number }; timeout_ms: number; is_active: boolean; description: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('callbacks').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', callbackId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteCallback(callbackId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('callbacks').delete().eq('id', callbackId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function activateCallback(callbackId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('callbacks').update({ is_active: true, updated_at: new Date().toISOString() }).eq('id', callbackId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deactivateCallback(callbackId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('callbacks').update({ is_active: false, updated_at: new Date().toISOString() }).eq('id', callbackId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function executeCallback(callbackId: string, payload: Record<string, any>) {
  try { const supabase = await createClient(); const { data: callback } = await supabase.from('callbacks').select('*').eq('id', callbackId).eq('is_active', true).single(); if (!callback) return { success: false, error: 'Callback not found or inactive' }; const startTime = Date.now(); let status = 'success'; let responseData = null; let errorMessage = null; try { const response = await fetch(callback.url, { method: callback.method, headers: { 'Content-Type': 'application/json', ...callback.headers }, body: callback.method !== 'GET' ? JSON.stringify({ ...callback.payload_template, ...payload }) : undefined, signal: AbortSignal.timeout(callback.timeout_ms) }); responseData = await response.json().catch(() => null); if (!response.ok) { status = 'failure'; errorMessage = `HTTP ${response.status}`; } } catch (err) { status = 'failure'; errorMessage = err instanceof Error ? err.message : 'Unknown error'; } const duration = Date.now() - startTime; await supabase.from('callbacks').update({ call_count: callback.call_count + 1, failure_count: status === 'failure' ? callback.failure_count + 1 : callback.failure_count, last_called_at: new Date().toISOString(), last_status: status }).eq('id', callbackId); await supabase.from('callback_logs').insert({ callback_id: callbackId, status, duration_ms: duration, request_payload: payload, response_data: responseData, error_message: errorMessage, executed_at: new Date().toISOString() }); return { success: status === 'success', data: responseData, error: errorMessage, duration } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserCallbacks(userId: string, options?: { isActive?: boolean; callbackType?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('callbacks').select('*').eq('user_id', userId); if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive); if (options?.callbackType) query = query.eq('callback_type', options.callbackType); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getCallbackLogs(callbackId: string, options?: { status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('callback_logs').select('*').eq('callback_id', callbackId); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('executed_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function testCallback(callbackId: string, testPayload?: Record<string, any>) {
  const payload = testPayload || { test: true, timestamp: new Date().toISOString() };
  return executeCallback(callbackId, payload);
}
