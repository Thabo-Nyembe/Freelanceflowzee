'use server'

/**
 * Extended Anomaly Server Actions
 * Tables: anomaly_detections, anomaly_rules, anomaly_alerts
 */

import { createClient } from '@/lib/supabase/server'

export async function getAnomaly(anomalyId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('anomaly_detections').select('*').eq('id', anomalyId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createAnomaly(anomalyData: { user_id: string; source: string; type: string; severity?: 'low' | 'medium' | 'high' | 'critical'; description?: string; metric_name?: string; expected_value?: number; actual_value?: number; deviation?: number; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('anomaly_detections').insert({ ...anomalyData, severity: anomalyData.severity || 'medium', status: 'detected', detected_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateAnomaly(anomalyId: string, updates: Partial<{ severity: string; status: string; resolution: string; notes: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('anomaly_detections').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', anomalyId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getAnomalies(options?: { user_id?: string; source?: string; type?: string; severity?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('anomaly_detections').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.source) query = query.eq('source', options.source); if (options?.type) query = query.eq('type', options.type); if (options?.severity) query = query.eq('severity', options.severity); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('detected_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function acknowledgeAnomaly(anomalyId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('anomaly_detections').update({ status: 'acknowledged', acknowledged_at: new Date().toISOString() }).eq('id', anomalyId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function resolveAnomaly(anomalyId: string, resolution: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('anomaly_detections').update({ status: 'resolved', resolution, resolved_at: new Date().toISOString() }).eq('id', anomalyId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function dismissAnomaly(anomalyId: string, reason?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('anomaly_detections').update({ status: 'dismissed', dismissal_reason: reason, dismissed_at: new Date().toISOString() }).eq('id', anomalyId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getActiveAnomalies(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('anomaly_detections').select('*').eq('user_id', userId).in('status', ['detected', 'acknowledged']).order('severity', { ascending: false }).order('detected_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getAnomalyStats(userId: string) {
  try { const supabase = await createClient(); const { data } = await supabase.from('anomaly_detections').select('severity, status, type').eq('user_id', userId); if (!data) return { success: true, data: { total: 0, bySeverity: {}, byStatus: {}, byType: {} } }; const bySeverity = data.reduce((acc: Record<string, number>, a) => { acc[a.severity || 'unknown'] = (acc[a.severity || 'unknown'] || 0) + 1; return acc }, {}); const byStatus = data.reduce((acc: Record<string, number>, a) => { acc[a.status || 'unknown'] = (acc[a.status || 'unknown'] || 0) + 1; return acc }, {}); const byType = data.reduce((acc: Record<string, number>, a) => { acc[a.type || 'unknown'] = (acc[a.type || 'unknown'] || 0) + 1; return acc }, {}); return { success: true, data: { total: data.length, bySeverity, byStatus, byType } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: { total: 0, bySeverity: {}, byStatus: {}, byType: {} } } }
}
