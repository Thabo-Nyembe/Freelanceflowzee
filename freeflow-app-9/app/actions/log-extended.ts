'use server'

/**
 * Extended Log Server Actions - Covers all Log-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getLogs(logType?: string, level?: string, startDate?: string, endDate?: string, limit = 100) {
  try { const supabase = await createClient(); let query = supabase.from('logs').select('*').order('created_at', { ascending: false }).limit(limit); if (logType) query = query.eq('log_type', logType); if (level) query = query.eq('level', level); if (startDate) query = query.gte('created_at', startDate); if (endDate) query = query.lte('created_at', endDate); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getLog(logId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('logs').select('*').eq('id', logId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createLog(input: { log_type: string; level: string; message: string; source?: string; context?: any; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('logs').insert({ ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function logInfo(message: string, source?: string, context?: any) {
  return createLog({ log_type: 'application', level: 'info', message, source, context })
}

export async function logWarning(message: string, source?: string, context?: any) {
  return createLog({ log_type: 'application', level: 'warning', message, source, context })
}

export async function logError(message: string, source?: string, context?: any) {
  return createLog({ log_type: 'application', level: 'error', message, source, context })
}

export async function logDebug(message: string, source?: string, context?: any) {
  return createLog({ log_type: 'application', level: 'debug', message, source, context })
}

export async function searchLogs(query: string, limit = 100) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('logs').select('*').ilike('message', `%${query}%`).order('created_at', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getLogSummary(days = 7) {
  try { const supabase = await createClient(); const startDate = new Date(); startDate.setDate(startDate.getDate() - days); const { data, error } = await supabase.from('logs').select('level, log_type').gte('created_at', startDate.toISOString()); if (error) throw error; const summary = { total: data?.length || 0, by_level: {} as Record<string, number>, by_type: {} as Record<string, number> }; data?.forEach(l => { summary.by_level[l.level] = (summary.by_level[l.level] || 0) + 1; summary.by_type[l.log_type] = (summary.by_type[l.log_type] || 0) + 1; }); return { success: true, data: summary } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cleanupOldLogs(daysToKeep = 30) {
  try { const supabase = await createClient(); const cutoffDate = new Date(); cutoffDate.setDate(cutoffDate.getDate() - daysToKeep); const { error } = await supabase.from('logs').delete().lt('created_at', cutoffDate.toISOString()); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLogEntries(logId: string, limit = 100) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('log_entries').select('*').eq('log_id', logId).order('timestamp', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createLogEntry(logId: string, input: { level: string; message: string; data?: any; timestamp?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('log_entries').insert({ log_id: logId, ...input, timestamp: input.timestamp || new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function bulkCreateLogEntries(logId: string, entries: Array<{ level: string; message: string; data?: any; timestamp?: string }>) {
  try { const supabase = await createClient(); const inserts = entries.map(e => ({ log_id: logId, ...e, timestamp: e.timestamp || new Date().toISOString() })); const { data, error } = await supabase.from('log_entries').insert(inserts).select(); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function deleteLogEntries(logId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('log_entries').delete().eq('log_id', logId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRecentErrors(limit = 50) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('logs').select('*').eq('level', 'error').order('created_at', { ascending: false }).limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
