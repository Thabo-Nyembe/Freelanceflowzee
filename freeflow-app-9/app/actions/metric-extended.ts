'use server'

/**
 * Extended Metric Server Actions - Covers all Metric-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getMetrics(entityId: string, entityType: string, metricName?: string, limit = 100) {
  try { const supabase = await createClient(); let query = supabase.from('metrics').select('*').eq('entity_id', entityId).eq('entity_type', entityType).order('timestamp', { ascending: false }).limit(limit); if (metricName) query = query.eq('metric_name', metricName); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordMetric(entityId: string, entityType: string, metricName: string, value: number, unit?: string, metadata?: Record<string, any>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('metrics').insert({ entity_id: entityId, entity_type: entityType, metric_name: metricName, value, unit, metadata, timestamp: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function recordBatchMetrics(metrics: Array<{ entityId: string; entityType: string; metricName: string; value: number; unit?: string }>) {
  try { const supabase = await createClient(); const records = metrics.map(m => ({ entity_id: m.entityId, entity_type: m.entityType, metric_name: m.metricName, value: m.value, unit: m.unit, timestamp: new Date().toISOString() })); const { data, error } = await supabase.from('metrics').insert(records).select(); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getMetricTimeSeries(entityId: string, entityType: string, metricName: string, since: string, until?: string) {
  try { const supabase = await createClient(); let query = supabase.from('metrics').select('value, timestamp').eq('entity_id', entityId).eq('entity_type', entityType).eq('metric_name', metricName).gte('timestamp', since).order('timestamp', { ascending: true }); if (until) query = query.lte('timestamp', until); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getMetricAggregate(entityId: string, entityType: string, metricName: string, aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count', since?: string) {
  try { const supabase = await createClient(); let query = supabase.from('metrics').select('value').eq('entity_id', entityId).eq('entity_type', entityType).eq('metric_name', metricName); if (since) query = query.gte('timestamp', since); const { data, error } = await query; if (error) throw error; const values = data?.map(m => m.value) || []; let result: number; switch (aggregation) { case 'sum': result = values.reduce((a, b) => a + b, 0); break; case 'avg': result = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0; break; case 'min': result = Math.min(...values, 0); break; case 'max': result = Math.max(...values, 0); break; case 'count': result = values.length; break; } return { success: true, value: result } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', value: 0 } }
}

export async function getLatestMetric(entityId: string, entityType: string, metricName: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('metrics').select('*').eq('entity_id', entityId).eq('entity_type', entityType).eq('metric_name', metricName).order('timestamp', { ascending: false }).limit(1).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteOldMetrics(entityId: string, entityType: string, olderThan: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('metrics').delete().eq('entity_id', entityId).eq('entity_type', entityType).lt('timestamp', olderThan); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
