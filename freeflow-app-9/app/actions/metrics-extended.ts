'use server'

/**
 * Extended Metrics Server Actions
 * Tables: metrics, metric_values, metric_thresholds, metric_alerts, metric_dashboards, metric_widgets
 */

import { createClient } from '@/lib/supabase/server'

export async function getMetric(metricId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('metrics').select('*, metric_thresholds(*), metric_alerts(*)').eq('id', metricId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createMetric(metricData: { name: string; description?: string; category?: string; unit?: string; aggregation_type?: string; organization_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('metrics').insert({ ...metricData, aggregation_type: metricData.aggregation_type || 'sum', is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateMetric(metricId: string, updates: Partial<{ name: string; description: string; category: string; unit: string; aggregation_type: string; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('metrics').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', metricId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteMetric(metricId: string) {
  try { const supabase = await createClient(); await supabase.from('metric_values').delete().eq('metric_id', metricId); await supabase.from('metric_thresholds').delete().eq('metric_id', metricId); await supabase.from('metric_alerts').delete().eq('metric_id', metricId); const { error } = await supabase.from('metrics').delete().eq('id', metricId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMetrics(options?: { category?: string; organization_id?: string; is_active?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('metrics').select('*'); if (options?.category) query = query.eq('category', options.category); if (options?.organization_id) query = query.eq('organization_id', options.organization_id); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordValue(metricId: string, value: number, metadata?: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('metric_values').insert({ metric_id: metricId, value, metadata, recorded_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getValues(metricId: string, options?: { from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('metric_values').select('*').eq('metric_id', metricId); if (options?.from_date) query = query.gte('recorded_at', options.from_date); if (options?.to_date) query = query.lte('recorded_at', options.to_date); const { data, error } = await query.order('recorded_at', { ascending: false }).limit(options?.limit || 1000); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function setThreshold(metricId: string, thresholdData: { threshold_type: string; value: number; comparison: string; severity?: string; notify?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('metric_thresholds').insert({ metric_id: metricId, ...thresholdData, severity: thresholdData.severity || 'warning', notify: thresholdData.notify ?? true, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getThresholds(metricId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('metric_thresholds').select('*').eq('metric_id', metricId).eq('is_active', true); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createAlert(alertData: { metric_id: string; threshold_id?: string; value: number; severity: string; message?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('metric_alerts').insert({ ...alertData, status: 'active', triggered_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function acknowledgeAlert(alertId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('metric_alerts').update({ status: 'acknowledged', acknowledged_by: userId, acknowledged_at: new Date().toISOString() }).eq('id', alertId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function resolveAlert(alertId: string, userId: string, notes?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('metric_alerts').update({ status: 'resolved', resolved_by: userId, resolved_at: new Date().toISOString(), resolution_notes: notes }).eq('id', alertId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAlerts(options?: { metric_id?: string; status?: string; severity?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('metric_alerts').select('*, metrics(*)'); if (options?.metric_id) query = query.eq('metric_id', options.metric_id); if (options?.status) query = query.eq('status', options.status); if (options?.severity) query = query.eq('severity', options.severity); const { data, error } = await query.order('triggered_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createDashboard(dashboardData: { name: string; description?: string; user_id: string; organization_id?: string; is_public?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('metric_dashboards').insert({ ...dashboardData, is_public: dashboardData.is_public ?? false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addWidget(dashboardId: string, widgetData: { metric_id: string; widget_type: string; title?: string; config?: any; position?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('metric_widgets').insert({ dashboard_id: dashboardId, ...widgetData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
