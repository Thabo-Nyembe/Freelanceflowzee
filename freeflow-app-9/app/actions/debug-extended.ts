'use server'

/**
 * Extended Debug Server Actions - Covers all Debug/Debugging tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getDebugSession(sessionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('debug_sessions').select('*').eq('id', sessionId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createDebugSession(sessionData: { name?: string; session_type: string; target_type: string; target_id?: string; configuration?: Record<string, any>; user_id: string; workspace_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('debug_sessions').insert({ ...sessionData, status: 'active', started_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function endDebugSession(sessionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('debug_sessions').update({ status: 'ended', ended_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', sessionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addDebugLog(sessionId: string, logData: { level: 'debug' | 'info' | 'warn' | 'error'; message: string; context?: Record<string, any>; source?: string; line_number?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('debug_logs').insert({ session_id: sessionId, ...logData, timestamp: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDebugLogs(sessionId: string, options?: { level?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('debug_logs').select('*').eq('session_id', sessionId); if (options?.level) query = query.eq('level', options.level); const { data, error } = await query.order('timestamp', { ascending: true }).limit(options?.limit || 1000); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addBreakpoint(sessionId: string, breakpoint: { file_path: string; line_number: number; condition?: string; is_enabled?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('debug_breakpoints').insert({ session_id: sessionId, ...breakpoint, is_enabled: breakpoint.is_enabled ?? true, hit_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeBreakpoint(breakpointId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('debug_breakpoints').delete().eq('id', breakpointId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function toggleBreakpoint(breakpointId: string, isEnabled: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('debug_breakpoints').update({ is_enabled: isEnabled, updated_at: new Date().toISOString() }).eq('id', breakpointId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getBreakpoints(sessionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('debug_breakpoints').select('*').eq('session_id', sessionId).order('file_path', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function captureDebugSnapshot(sessionId: string, snapshot: { snapshot_type: string; data: Record<string, any>; description?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('debug_snapshots').insert({ session_id: sessionId, ...snapshot, captured_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDebugSnapshots(sessionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('debug_snapshots').select('*').eq('session_id', sessionId).order('captured_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
