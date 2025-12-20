'use server'

/**
 * Extended Trace Server Actions - Covers all Trace/Tracing tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getTrace(traceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('traces').select('*').eq('id', traceId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createTrace(traceData: { trace_id: string; name: string; service_name: string; operation_name?: string; parent_trace_id?: string; span_id?: string; parent_span_id?: string; attributes?: Record<string, any>; status?: string; workspace_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('traces').insert({ ...traceData, status: traceData.status || 'active', started_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function endTrace(traceId: string, status: 'completed' | 'error' | 'timeout', errorMessage?: string) {
  try { const supabase = await createClient(); const { data: trace } = await supabase.from('traces').select('started_at').eq('id', traceId).single(); const duration = trace ? Date.now() - new Date(trace.started_at).getTime() : 0; const { data, error } = await supabase.from('traces').update({ status, error_message: errorMessage, duration_ms: duration, ended_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', traceId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addTraceSpan(traceId: string, spanData: { span_id: string; name: string; parent_span_id?: string; attributes?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('trace_spans').insert({ trace_id: traceId, ...spanData, status: 'active', started_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function endTraceSpan(spanId: string, status: 'completed' | 'error', errorMessage?: string) {
  try { const supabase = await createClient(); const { data: span } = await supabase.from('trace_spans').select('started_at').eq('span_id', spanId).single(); const duration = span ? Date.now() - new Date(span.started_at).getTime() : 0; const { data, error } = await supabase.from('trace_spans').update({ status, error_message: errorMessage, duration_ms: duration, ended_at: new Date().toISOString() }).eq('span_id', spanId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTraces(options?: { serviceName?: string; operationName?: string; status?: string; startTime?: string; endTime?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('traces').select('*'); if (options?.serviceName) query = query.eq('service_name', options.serviceName); if (options?.operationName) query = query.eq('operation_name', options.operationName); if (options?.status) query = query.eq('status', options.status); if (options?.startTime) query = query.gte('started_at', options.startTime); if (options?.endTime) query = query.lte('started_at', options.endTime); const { data, error } = await query.order('started_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTraceSpans(traceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('trace_spans').select('*').eq('trace_id', traceId).order('started_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTraceTree(traceId: string) {
  try { const supabase = await createClient(); const { data: trace } = await supabase.from('traces').select('*').eq('trace_id', traceId).single(); const { data: spans } = await supabase.from('trace_spans').select('*').eq('trace_id', trace?.id).order('started_at', { ascending: true }); return { success: true, trace, spans: spans || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addTraceEvent(traceId: string, event: { name: string; timestamp?: string; attributes?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('trace_events').insert({ trace_id: traceId, ...event, timestamp: event.timestamp || new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
