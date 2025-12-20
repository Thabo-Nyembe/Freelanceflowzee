'use server'

/**
 * Extended Monitor Server Actions - Covers all Monitor/Monitoring tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getMonitor(monitorId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('monitors').select('*').eq('id', monitorId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createMonitor(monitorData: { name: string; monitor_type: string; target_url?: string; target_service?: string; check_interval_seconds: number; timeout_seconds?: number; expected_status?: number; alert_threshold?: number; is_enabled?: boolean; workspace_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('monitors').insert({ ...monitorData, is_enabled: monitorData.is_enabled ?? true, status: 'unknown', consecutive_failures: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateMonitor(monitorId: string, updates: Partial<{ name: string; target_url: string; check_interval_seconds: number; timeout_seconds: number; expected_status: number; alert_threshold: number; is_enabled: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('monitors').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', monitorId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteMonitor(monitorId: string) {
  try { const supabase = await createClient(); await supabase.from('monitor_checks').delete().eq('monitor_id', monitorId); await supabase.from('monitor_alerts').delete().eq('monitor_id', monitorId); const { error } = await supabase.from('monitors').delete().eq('id', monitorId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMonitors(options?: { monitorType?: string; status?: string; isEnabled?: boolean; workspaceId?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('monitors').select('*'); if (options?.monitorType) query = query.eq('monitor_type', options.monitorType); if (options?.status) query = query.eq('status', options.status); if (options?.isEnabled !== undefined) query = query.eq('is_enabled', options.isEnabled); if (options?.workspaceId) query = query.eq('workspace_id', options.workspaceId); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordMonitorCheck(monitorId: string, check: { status: 'up' | 'down' | 'degraded'; response_time_ms?: number; status_code?: number; error_message?: string }) {
  try { const supabase = await createClient(); const { data: checkData, error: checkError } = await supabase.from('monitor_checks').insert({ monitor_id: monitorId, ...check, checked_at: new Date().toISOString() }).select().single(); if (checkError) throw checkError; const { data: monitor } = await supabase.from('monitors').select('consecutive_failures, alert_threshold').eq('id', monitorId).single(); const newFailures = check.status === 'down' ? (monitor?.consecutive_failures || 0) + 1 : 0; await supabase.from('monitors').update({ status: check.status, last_check_at: new Date().toISOString(), last_response_time_ms: check.response_time_ms, consecutive_failures: newFailures, updated_at: new Date().toISOString() }).eq('id', monitorId); return { success: true, data: checkData, shouldAlert: newFailures >= (monitor?.alert_threshold || 3) } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMonitorChecks(monitorId: string, limit = 100) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('monitor_checks').select('*').eq('monitor_id', monitorId).order('checked_at', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createMonitorAlert(monitorId: string, alert: { alert_type: string; message: string; severity: 'low' | 'medium' | 'high' | 'critical' }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('monitor_alerts').insert({ monitor_id: monitorId, ...alert, status: 'active', triggered_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function resolveMonitorAlert(alertId: string, resolution?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('monitor_alerts').update({ status: 'resolved', resolution, resolved_at: new Date().toISOString() }).eq('id', alertId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMonitorUptime(monitorId: string, days: number = 30) {
  try { const supabase = await createClient(); const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(); const { data } = await supabase.from('monitor_checks').select('status').eq('monitor_id', monitorId).gte('checked_at', since); const total = data?.length || 0; const up = data?.filter(c => c.status === 'up').length || 0; const uptime = total > 0 ? (up / total) * 100 : 100; return { success: true, uptime: Math.round(uptime * 100) / 100, totalChecks: total } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', uptime: 0, totalChecks: 0 } }
}
