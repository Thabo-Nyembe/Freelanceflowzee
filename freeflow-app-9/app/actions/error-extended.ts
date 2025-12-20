'use server'

/**
 * Extended Error Server Actions
 * Tables: error_logs, error_reports, error_alerts, error_resolutions
 */

import { createClient } from '@/lib/supabase/server'

export async function logError(errorData: { message: string; stack?: string; type?: string; severity?: string; source?: string; user_id?: string; context?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('error_logs').insert({ ...errorData, status: 'new', occurred_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getErrorLog(errorId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('error_logs').select('*, error_resolutions(*)').eq('id', errorId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getErrorLogs(options?: { type?: string; severity?: string; status?: string; source?: string; date_from?: string; date_to?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('error_logs').select('*'); if (options?.type) query = query.eq('type', options.type); if (options?.severity) query = query.eq('severity', options.severity); if (options?.status) query = query.eq('status', options.status); if (options?.source) query = query.eq('source', options.source); if (options?.date_from) query = query.gte('occurred_at', options.date_from); if (options?.date_to) query = query.lte('occurred_at', options.date_to); const { data, error } = await query.order('occurred_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function updateErrorStatus(errorId: string, status: string, notes?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('error_logs').update({ status, status_notes: notes, updated_at: new Date().toISOString() }).eq('id', errorId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createErrorReport(reportData: { title: string; description?: string; error_ids?: string[]; reported_by: string; priority?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('error_reports').insert({ ...reportData, status: 'open', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getErrorReports(options?: { status?: string; priority?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('error_reports').select('*'); if (options?.status) query = query.eq('status', options.status); if (options?.priority) query = query.eq('priority', options.priority); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createErrorAlert(alertData: { name: string; conditions: any; recipients: string[]; channels?: string[]; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('error_alerts').insert({ ...alertData, is_active: alertData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getErrorAlerts(options?: { is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('error_alerts').select('*'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function resolveError(resolutionData: { error_id: string; resolved_by: string; resolution: string; root_cause?: string; prevention_steps?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('error_resolutions').insert({ ...resolutionData, resolved_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('error_logs').update({ status: 'resolved', updated_at: new Date().toISOString() }).eq('id', resolutionData.error_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getErrorStats(options?: { days?: number }) {
  try { const supabase = await createClient(); const daysAgo = options?.days || 7; const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(); const { data } = await supabase.from('error_logs').select('severity, type, status').gte('occurred_at', startDate); if (!data) return { success: true, data: null }; const total = data.length; const bySeverity = data.reduce((acc: Record<string, number>, e) => { acc[e.severity || 'unknown'] = (acc[e.severity || 'unknown'] || 0) + 1; return acc }, {}); const byType = data.reduce((acc: Record<string, number>, e) => { acc[e.type || 'unknown'] = (acc[e.type || 'unknown'] || 0) + 1; return acc }, {}); const byStatus = data.reduce((acc: Record<string, number>, e) => { acc[e.status] = (acc[e.status] || 0) + 1; return acc }, {}); return { success: true, data: { total, bySeverity, byType, byStatus } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
