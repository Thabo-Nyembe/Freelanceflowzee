'use server'

/**
 * Extended API Server Actions - Covers all 4 API-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getAPIEndpoints(isPublic?: boolean) {
  try { const supabase = await createClient(); let query = supabase.from('api_endpoints').select('*').order('path', { ascending: true }); if (isPublic !== undefined) query = query.eq('is_public', isPublic); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createAPIEndpoint(input: { path: string; method: string; description?: string; rate_limit?: number; is_public?: boolean; required_scopes?: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('api_endpoints').insert({ ...input, is_active: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateAPIEndpoint(endpointId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('api_endpoints').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', endpointId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function toggleAPIEndpoint(endpointId: string, isActive: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('api_endpoints').update({ is_active: isActive }).eq('id', endpointId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteAPIEndpoint(endpointId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('api_endpoints').delete().eq('id', endpointId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAPIKeys(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('api_keys').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createAPIKey(userId: string, input: { name: string; scopes?: string[]; expires_at?: string; rate_limit?: number }) {
  try { const supabase = await createClient(); const key = `sk_${crypto.randomUUID().replace(/-/g, '')}`; const { data, error } = await supabase.from('api_keys').insert({ user_id: userId, key, ...input, is_active: true }).select().single(); if (error) throw error; return { success: true, data: { ...data, plainKey: key } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateAPIKey(keyId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('api_keys').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', keyId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function revokeAPIKey(keyId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('api_keys').update({ is_active: false, revoked_at: new Date().toISOString() }).eq('id', keyId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteAPIKey(keyId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('api_keys').delete().eq('id', keyId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAPIRequestLogs(apiKeyId: string, limit = 100) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('api_request_logs').select('*').eq('api_key_id', apiKeyId).order('created_at', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createAPIRequestLog(input: { api_key_id: string; endpoint: string; method: string; status_code: number; response_time_ms?: number; ip_address?: string; user_agent?: string; request_body?: any; response_body?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('api_request_logs').insert(input).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAPIUsageLogs(userId: string, startDate?: string, endDate?: string) {
  try { const supabase = await createClient(); let query = supabase.from('api_usage_logs').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (startDate) query = query.gte('created_at', startDate); if (endDate) query = query.lte('created_at', endDate); const { data, error } = await query.limit(100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createAPIUsageLog(userId: string, input: { endpoint: string; method: string; api_key_id?: string; request_count?: number; bandwidth_bytes?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('api_usage_logs').insert({ user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAPIUsageStats(userId: string, period: string = 'day') {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('api_usage_logs').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; const stats = { total_requests: data?.length || 0, total_bandwidth: data?.reduce((sum: number, log: any) => sum + (log.bandwidth_bytes || 0), 0) || 0 }; return { success: true, data: stats } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
