'use server'

/**
 * Extended Systems Server Actions
 * Tables: systems, system_configs, system_health, system_logs, system_metrics, system_alerts
 */

import { createClient } from '@/lib/supabase/server'

export async function getSystem(systemId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('systems').select('*, system_configs(*), system_health(*), system_alerts(*)').eq('id', systemId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createSystem(systemData: { name: string; code?: string; description?: string; system_type?: string; version?: string; environment?: string; url?: string; owner_id?: string; is_active?: boolean; metadata?: any }) {
  try { const supabase = await createClient(); const systemCode = systemData.code || `SYS-${Date.now()}`; const { data, error } = await supabase.from('systems').insert({ ...systemData, code: systemCode, status: 'active', is_active: systemData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSystem(systemId: string, updates: Partial<{ name: string; description: string; system_type: string; version: string; environment: string; url: string; status: string; is_active: boolean; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('systems').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', systemId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteSystem(systemId: string) {
  try { const supabase = await createClient(); await supabase.from('system_configs').delete().eq('system_id', systemId); await supabase.from('system_health').delete().eq('system_id', systemId); await supabase.from('system_logs').delete().eq('system_id', systemId); await supabase.from('system_metrics').delete().eq('system_id', systemId); await supabase.from('system_alerts').delete().eq('system_id', systemId); const { error } = await supabase.from('systems').delete().eq('id', systemId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSystems(options?: { system_type?: string; environment?: string; status?: string; is_active?: boolean; owner_id?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('systems').select('*, system_health(*)'); if (options?.system_type) query = query.eq('system_type', options.system_type); if (options?.environment) query = query.eq('environment', options.environment); if (options?.status) query = query.eq('status', options.status); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.owner_id) query = query.eq('owner_id', options.owner_id); if (options?.search) query = query.or(`name.ilike.%${options.search}%,code.ilike.%${options.search}%`); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function setConfig(systemId: string, key: string, value: any, options?: { is_secret?: boolean; description?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('system_configs').upsert({ system_id: systemId, config_key: key, config_value: value, is_secret: options?.is_secret ?? false, description: options?.description, updated_at: new Date().toISOString() }, { onConflict: 'system_id,config_key' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getConfig(systemId: string, key?: string) {
  try { const supabase = await createClient(); if (key) { const { data, error } = await supabase.from('system_configs').select('*').eq('system_id', systemId).eq('config_key', key).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data: data?.config_value } } const { data, error } = await supabase.from('system_configs').select('*').eq('system_id', systemId); if (error) throw error; const configMap: Record<string, any> = {}; data?.forEach(c => { configMap[c.config_key] = c.config_value }); return { success: true, data: configMap } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function recordHealthCheck(systemId: string, healthData: { status: 'healthy' | 'degraded' | 'unhealthy'; latency_ms?: number; checks?: any; message?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('system_health').insert({ system_id: systemId, ...healthData, checked_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('systems').update({ status: healthData.status === 'healthy' ? 'active' : healthData.status === 'degraded' ? 'degraded' : 'error', last_health_check: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', systemId); if (healthData.status === 'unhealthy') { await createAlert(systemId, { alert_type: 'health', severity: 'critical', title: 'System Unhealthy', message: healthData.message || 'System health check failed' }) } return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getHealthHistory(systemId: string, options?: { from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('system_health').select('*').eq('system_id', systemId); if (options?.from_date) query = query.gte('checked_at', options.from_date); if (options?.to_date) query = query.lte('checked_at', options.to_date); const { data, error } = await query.order('checked_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function logEvent(systemId: string, logData: { level: 'debug' | 'info' | 'warning' | 'error' | 'critical'; message: string; category?: string; details?: any; trace_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('system_logs').insert({ system_id: systemId, ...logData, logged_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLogs(systemId: string, options?: { level?: string; category?: string; from_date?: string; to_date?: string; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('system_logs').select('*').eq('system_id', systemId); if (options?.level) query = query.eq('level', options.level); if (options?.category) query = query.eq('category', options.category); if (options?.from_date) query = query.gte('logged_at', options.from_date); if (options?.to_date) query = query.lte('logged_at', options.to_date); if (options?.search) query = query.ilike('message', `%${options.search}%`); const { data, error } = await query.order('logged_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordMetric(systemId: string, metricData: { metric_name: string; metric_value: number; unit?: string; tags?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('system_metrics').insert({ system_id: systemId, ...metricData, recorded_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMetrics(systemId: string, options?: { metric_name?: string; from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('system_metrics').select('*').eq('system_id', systemId); if (options?.metric_name) query = query.eq('metric_name', options.metric_name); if (options?.from_date) query = query.gte('recorded_at', options.from_date); if (options?.to_date) query = query.lte('recorded_at', options.to_date); const { data, error } = await query.order('recorded_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createAlert(systemId: string, alertData: { alert_type: string; severity: 'info' | 'warning' | 'critical'; title: string; message: string; details?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('system_alerts').insert({ system_id: systemId, ...alertData, status: 'active', triggered_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function acknowledgeAlert(alertId: string, acknowledgedBy: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('system_alerts').update({ status: 'acknowledged', acknowledged_by: acknowledgedBy, acknowledged_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', alertId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function resolveAlert(alertId: string, resolvedBy: string, resolution?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('system_alerts').update({ status: 'resolved', resolved_by: resolvedBy, resolved_at: new Date().toISOString(), resolution, updated_at: new Date().toISOString() }).eq('id', alertId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getActiveAlerts(options?: { system_id?: string; severity?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('system_alerts').select('*, systems(*)').eq('status', 'active'); if (options?.system_id) query = query.eq('system_id', options.system_id); if (options?.severity) query = query.eq('severity', options.severity); const { data, error } = await query.order('triggered_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

