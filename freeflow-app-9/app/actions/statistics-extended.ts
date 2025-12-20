'use server'

/**
 * Extended Statistics Server Actions
 * Tables: statistics, statistic_snapshots, statistic_aggregations, statistic_reports, statistic_dashboards, statistic_alerts
 */

import { createClient } from '@/lib/supabase/server'

export async function getStatistic(statisticId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('statistics').select('*, statistic_snapshots(*), statistic_alerts(*)').eq('id', statisticId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createStatistic(statData: { name: string; code: string; description?: string; category?: string; metric_type: string; data_source?: string; calculation_formula?: string; unit?: string; is_active?: boolean; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('statistics').insert({ ...statData, is_active: statData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateStatistic(statisticId: string, updates: Partial<{ name: string; code: string; description: string; category: string; calculation_formula: string; unit: string; is_active: boolean; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('statistics').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', statisticId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteStatistic(statisticId: string) {
  try { const supabase = await createClient(); await supabase.from('statistic_snapshots').delete().eq('statistic_id', statisticId); await supabase.from('statistic_alerts').delete().eq('statistic_id', statisticId); const { error } = await supabase.from('statistics').delete().eq('id', statisticId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getStatistics(options?: { category?: string; metric_type?: string; is_active?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('statistics').select('*'); if (options?.category) query = query.eq('category', options.category); if (options?.metric_type) query = query.eq('metric_type', options.metric_type); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.search) query = query.or(`name.ilike.%${options.search}%,code.ilike.%${options.search}%`); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordSnapshot(statisticId: string, value: number, context?: { entity_type?: string; entity_id?: string; period?: string; dimensions?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('statistic_snapshots').insert({ statistic_id: statisticId, value, ...context, recorded_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; await checkAlerts(statisticId, value); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

async function checkAlerts(statisticId: string, value: number) {
  const supabase = await createClient()
  const { data: alerts } = await supabase.from('statistic_alerts').select('*').eq('statistic_id', statisticId).eq('is_active', true)
  for (const alert of alerts || []) {
    let triggered = false
    switch (alert.condition) {
      case 'greater_than': triggered = value > alert.threshold; break
      case 'less_than': triggered = value < alert.threshold; break
      case 'equals': triggered = value === alert.threshold; break
    }
    if (triggered) {
      await supabase.from('statistic_alerts').update({ last_triggered_at: new Date().toISOString(), trigger_count: (alert.trigger_count || 0) + 1 }).eq('id', alert.id)
    }
  }
}

export async function getSnapshots(statisticId: string, options?: { from_date?: string; to_date?: string; period?: string; entity_type?: string; entity_id?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('statistic_snapshots').select('*').eq('statistic_id', statisticId); if (options?.from_date) query = query.gte('recorded_at', options.from_date); if (options?.to_date) query = query.lte('recorded_at', options.to_date); if (options?.period) query = query.eq('period', options.period); if (options?.entity_type) query = query.eq('entity_type', options.entity_type); if (options?.entity_id) query = query.eq('entity_id', options.entity_id); const { data, error } = await query.order('recorded_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createAggregation(aggData: { statistic_id: string; aggregation_type: 'sum' | 'avg' | 'min' | 'max' | 'count'; period: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly'; period_start: string; period_end: string; value: number; record_count?: number; dimensions?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('statistic_aggregations').upsert({ ...aggData, calculated_at: new Date().toISOString(), created_at: new Date().toISOString() }, { onConflict: 'statistic_id,aggregation_type,period,period_start' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAggregations(statisticId: string, options?: { aggregation_type?: string; period?: string; from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('statistic_aggregations').select('*').eq('statistic_id', statisticId); if (options?.aggregation_type) query = query.eq('aggregation_type', options.aggregation_type); if (options?.period) query = query.eq('period', options.period); if (options?.from_date) query = query.gte('period_start', options.from_date); if (options?.to_date) query = query.lte('period_end', options.to_date); const { data, error } = await query.order('period_start', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createReport(reportData: { name: string; description?: string; statistics: string[]; report_type?: string; filters?: any; schedule?: any; is_active?: boolean; created_by?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('statistic_reports').insert({ ...reportData, is_active: reportData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getReports(options?: { report_type?: string; is_active?: boolean; created_by?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('statistic_reports').select('*'); if (options?.report_type) query = query.eq('report_type', options.report_type); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.created_by) query = query.eq('created_by', options.created_by); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createAlert(alertData: { statistic_id: string; name: string; condition: 'greater_than' | 'less_than' | 'equals'; threshold: number; notification_channels?: string[]; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('statistic_alerts').insert({ ...alertData, is_active: alertData.is_active ?? true, trigger_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLatestValue(statisticId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('statistic_snapshots').select('*').eq('statistic_id', statisticId).order('recorded_at', { ascending: false }).limit(1).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

