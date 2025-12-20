'use server'

/**
 * Extended Usages Server Actions
 * Tables: usages, usage_metrics, usage_limits, usage_alerts, usage_reports, usage_billing
 */

import { createClient } from '@/lib/supabase/server'

export async function getUsage(usageId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('usages').select('*, usage_metrics(*), users(*)').eq('id', usageId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function recordUsage(usageData: { user_id?: string; resource_type: string; resource_id?: string; metric_name: string; quantity: number; unit?: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('usages').insert({ ...usageData, recorded_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; await checkLimits(usageData.user_id, usageData.resource_type, usageData.metric_name); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

async function checkLimits(userId?: string, resourceType?: string, metricName?: string) {
  if (!userId) return
  const supabase = await createClient()
  const { data: limit } = await supabase.from('usage_limits').select('*').eq('user_id', userId).eq('resource_type', resourceType).eq('metric_name', metricName).eq('is_active', true).single()
  if (!limit) return
  const periodStart = getPeriodStart(limit.period)
  const { data: usages } = await supabase.from('usages').select('quantity').eq('user_id', userId).eq('resource_type', resourceType).eq('metric_name', metricName).gte('recorded_at', periodStart.toISOString())
  const totalUsage = usages?.reduce((sum, u) => sum + (u.quantity || 0), 0) || 0
  const percentage = (totalUsage / limit.max_value) * 100
  if (percentage >= 100 && limit.action_on_exceed !== 'allow') {
    await supabase.from('usage_alerts').insert({ user_id: userId, limit_id: limit.id, alert_type: 'exceeded', current_value: totalUsage, threshold_value: limit.max_value, message: `Usage limit exceeded for ${metricName}`, created_at: new Date().toISOString() })
  } else if (percentage >= (limit.warning_threshold || 80)) {
    await supabase.from('usage_alerts').insert({ user_id: userId, limit_id: limit.id, alert_type: 'warning', current_value: totalUsage, threshold_value: limit.max_value, message: `Usage at ${Math.round(percentage)}% of limit for ${metricName}`, created_at: new Date().toISOString() })
  }
}

function getPeriodStart(period: string): Date {
  const now = new Date()
  switch (period) {
    case 'hourly': return new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0)
    case 'daily': return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
    case 'weekly': { const day = now.getDay(); return new Date(now.getFullYear(), now.getMonth(), now.getDate() - day, 0, 0, 0) }
    case 'monthly': return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0)
    case 'yearly': return new Date(now.getFullYear(), 0, 1, 0, 0, 0)
    default: return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0)
  }
}

export async function getUsages(options?: { user_id?: string; resource_type?: string; metric_name?: string; from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('usages').select('*, users(*)'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.resource_type) query = query.eq('resource_type', options.resource_type); if (options?.metric_name) query = query.eq('metric_name', options.metric_name); if (options?.from_date) query = query.gte('recorded_at', options.from_date); if (options?.to_date) query = query.lte('recorded_at', options.to_date); const { data, error } = await query.order('recorded_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUsageSummary(userId: string, period: string = 'monthly') {
  try { const supabase = await createClient(); const periodStart = getPeriodStart(period); const { data, error } = await supabase.from('usages').select('resource_type, metric_name, quantity').eq('user_id', userId).gte('recorded_at', periodStart.toISOString()); if (error) throw error; const summary: Record<string, Record<string, number>> = {}; data?.forEach(u => { if (!summary[u.resource_type]) summary[u.resource_type] = {}; summary[u.resource_type][u.metric_name] = (summary[u.resource_type][u.metric_name] || 0) + u.quantity }); return { success: true, data: summary } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setMetric(metricData: { name: string; display_name: string; description?: string; unit: string; aggregation_type?: string; is_billable?: boolean; rate_per_unit?: number }) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('usage_metrics').select('id').eq('name', metricData.name).single(); if (existing) { const { data, error } = await supabase.from('usage_metrics').update({ ...metricData, updated_at: new Date().toISOString() }).eq('id', existing.id).select().single(); if (error) throw error; return { success: true, data } } else { const { data, error } = await supabase.from('usage_metrics').insert({ ...metricData, aggregation_type: metricData.aggregation_type || 'sum', is_billable: metricData.is_billable ?? false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMetrics(options?: { is_billable?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('usage_metrics').select('*'); if (options?.is_billable !== undefined) query = query.eq('is_billable', options.is_billable); const { data, error } = await query.order('display_name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function setLimit(userId: string, limitData: { resource_type: string; metric_name: string; max_value: number; period: string; warning_threshold?: number; action_on_exceed?: string }) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('usage_limits').select('id').eq('user_id', userId).eq('resource_type', limitData.resource_type).eq('metric_name', limitData.metric_name).single(); if (existing) { const { data, error } = await supabase.from('usage_limits').update({ ...limitData, updated_at: new Date().toISOString() }).eq('id', existing.id).select().single(); if (error) throw error; return { success: true, data } } else { const { data, error } = await supabase.from('usage_limits').insert({ user_id: userId, ...limitData, warning_threshold: limitData.warning_threshold || 80, action_on_exceed: limitData.action_on_exceed || 'warn', is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLimits(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('usage_limits').select('*').eq('user_id', userId).eq('is_active', true); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getLimitStatus(userId: string, resourceType: string, metricName: string) {
  try { const supabase = await createClient(); const { data: limit } = await supabase.from('usage_limits').select('*').eq('user_id', userId).eq('resource_type', resourceType).eq('metric_name', metricName).eq('is_active', true).single(); if (!limit) return { success: true, data: { hasLimit: false } }; const periodStart = getPeriodStart(limit.period); const { data: usages } = await supabase.from('usages').select('quantity').eq('user_id', userId).eq('resource_type', resourceType).eq('metric_name', metricName).gte('recorded_at', periodStart.toISOString()); const currentUsage = usages?.reduce((sum, u) => sum + (u.quantity || 0), 0) || 0; return { success: true, data: { hasLimit: true, limit: limit.max_value, used: currentUsage, remaining: Math.max(0, limit.max_value - currentUsage), percentage: Math.round((currentUsage / limit.max_value) * 100), period: limit.period, periodStart: periodStart.toISOString() } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAlerts(userId: string, options?: { alert_type?: string; is_read?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('usage_alerts').select('*, usage_limits(*)').eq('user_id', userId); if (options?.alert_type) query = query.eq('alert_type', options.alert_type); if (options?.is_read !== undefined) query = query.eq('is_read', options.is_read); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function markAlertRead(alertId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('usage_alerts').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', alertId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function generateReport(userId: string, reportData: { period: string; from_date: string; to_date: string; resource_types?: string[] }) {
  try { const supabase = await createClient(); let query = supabase.from('usages').select('*').eq('user_id', userId).gte('recorded_at', reportData.from_date).lte('recorded_at', reportData.to_date); if (reportData.resource_types && reportData.resource_types.length > 0) { query = query.in('resource_type', reportData.resource_types) } const { data: usages } = await query; const summary: Record<string, Record<string, { total: number; count: number }>> = {}; usages?.forEach(u => { if (!summary[u.resource_type]) summary[u.resource_type] = {}; if (!summary[u.resource_type][u.metric_name]) summary[u.resource_type][u.metric_name] = { total: 0, count: 0 }; summary[u.resource_type][u.metric_name].total += u.quantity; summary[u.resource_type][u.metric_name].count++ }); const { data: report, error } = await supabase.from('usage_reports').insert({ user_id: userId, period: reportData.period, from_date: reportData.from_date, to_date: reportData.to_date, summary, generated_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data: report } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getReports(userId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('usage_reports').select('*').eq('user_id', userId).order('generated_at', { ascending: false }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function calculateBilling(userId: string, fromDate: string, toDate: string) {
  try { const supabase = await createClient(); const { data: metrics } = await supabase.from('usage_metrics').select('*').eq('is_billable', true); const { data: usages } = await supabase.from('usages').select('*').eq('user_id', userId).gte('recorded_at', fromDate).lte('recorded_at', toDate); const billing: any[] = []; let totalAmount = 0; metrics?.forEach(metric => { const metricUsages = usages?.filter(u => u.metric_name === metric.name) || []; const totalQuantity = metricUsages.reduce((sum, u) => sum + (u.quantity || 0), 0); const amount = totalQuantity * (metric.rate_per_unit || 0); if (totalQuantity > 0) { billing.push({ metric_name: metric.name, display_name: metric.display_name, quantity: totalQuantity, unit: metric.unit, rate: metric.rate_per_unit, amount }); totalAmount += amount } }); const { data, error } = await supabase.from('usage_billing').insert({ user_id: userId, from_date: fromDate, to_date: toDate, line_items: billing, total_amount: totalAmount, status: 'calculated', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data: { billing, total_amount: totalAmount, record: data } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
