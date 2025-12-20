'use server'

/**
 * Extended Health Server Actions - Covers all Health check/status tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getHealthCheck(checkId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('health_checks').select('*').eq('id', checkId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createHealthCheck(checkData: { name: string; service_name: string; check_type: string; endpoint?: string; expected_response?: Record<string, any>; timeout_ms?: number; interval_seconds?: number; is_critical?: boolean; workspace_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('health_checks').insert({ ...checkData, is_critical: checkData.is_critical ?? false, is_enabled: true, status: 'unknown', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateHealthCheck(checkId: string, updates: Partial<{ name: string; endpoint: string; expected_response: Record<string, any>; timeout_ms: number; interval_seconds: number; is_critical: boolean; is_enabled: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('health_checks').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', checkId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteHealthCheck(checkId: string) {
  try { const supabase = await createClient(); await supabase.from('health_check_results').delete().eq('check_id', checkId); const { error } = await supabase.from('health_checks').delete().eq('id', checkId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getHealthChecks(options?: { serviceName?: string; checkType?: string; status?: string; isCritical?: boolean; workspaceId?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('health_checks').select('*'); if (options?.serviceName) query = query.eq('service_name', options.serviceName); if (options?.checkType) query = query.eq('check_type', options.checkType); if (options?.status) query = query.eq('status', options.status); if (options?.isCritical !== undefined) query = query.eq('is_critical', options.isCritical); if (options?.workspaceId) query = query.eq('workspace_id', options.workspaceId); const { data, error } = await query.order('service_name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordHealthCheckResult(checkId: string, result: { status: 'healthy' | 'unhealthy' | 'degraded'; response_time_ms?: number; details?: Record<string, any>; error_message?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('health_check_results').insert({ check_id: checkId, ...result, checked_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('health_checks').update({ status: result.status, last_check_at: new Date().toISOString(), last_response_time_ms: result.response_time_ms, updated_at: new Date().toISOString() }).eq('id', checkId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getHealthCheckResults(checkId: string, limit = 100) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('health_check_results').select('*').eq('check_id', checkId).order('checked_at', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSystemHealth(workspaceId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('health_checks').select('*').eq('is_enabled', true); if (workspaceId) query = query.eq('workspace_id', workspaceId); const { data: checks } = await query; const healthy = checks?.filter(c => c.status === 'healthy').length || 0; const unhealthy = checks?.filter(c => c.status === 'unhealthy').length || 0; const degraded = checks?.filter(c => c.status === 'degraded').length || 0; const unknown = checks?.filter(c => c.status === 'unknown').length || 0; const criticalUnhealthy = checks?.filter(c => c.is_critical && c.status === 'unhealthy').length || 0; const overallStatus = criticalUnhealthy > 0 ? 'critical' : unhealthy > 0 ? 'unhealthy' : degraded > 0 ? 'degraded' : 'healthy'; return { success: true, status: overallStatus, summary: { healthy, unhealthy, degraded, unknown, total: checks?.length || 0 }, checks: checks || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', status: 'unknown', summary: { healthy: 0, unhealthy: 0, degraded: 0, unknown: 0, total: 0 }, checks: [] } }
}

export async function getServiceHealth(serviceName: string) {
  try { const supabase = await createClient(); const { data: checks } = await supabase.from('health_checks').select('*').eq('service_name', serviceName).eq('is_enabled', true); const allHealthy = checks?.every(c => c.status === 'healthy'); const anyUnhealthy = checks?.some(c => c.status === 'unhealthy'); const status = anyUnhealthy ? 'unhealthy' : allHealthy ? 'healthy' : 'degraded'; return { success: true, serviceName, status, checks: checks || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
