'use server'

/**
 * Extended Login Server Actions
 * Tables: login_attempts, login_sessions, login_history, login_devices, login_security, login_mfa
 */

import { createClient } from '@/lib/supabase/server'

export async function recordLoginAttempt(attemptData: { user_id?: string; email: string; ip_address?: string; user_agent?: string; success: boolean; failure_reason?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('login_attempts').insert({ ...attemptData, attempted_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLoginAttempts(email: string, options?: { from_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('login_attempts').select('*').eq('email', email); if (options?.from_date) query = query.gte('attempted_at', options.from_date); const { data, error } = await query.order('attempted_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getFailedAttemptCount(email: string, minutes: number = 15) {
  try { const supabase = await createClient(); const since = new Date(Date.now() - minutes * 60 * 1000).toISOString(); const { data, error } = await supabase.from('login_attempts').select('id').eq('email', email).eq('success', false).gte('attempted_at', since); if (error) throw error; return { success: true, count: data?.length || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', count: 0 } }
}

export async function createLoginSession(sessionData: { user_id: string; device_id?: string; ip_address?: string; user_agent?: string; location?: string }) {
  try { const supabase = await createClient(); const sessionToken = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 32)}`; const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); const { data, error } = await supabase.from('login_sessions').insert({ ...sessionData, session_token: sessionToken, is_active: true, expires_at: expiresAt.toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getActiveSession(sessionToken: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('login_sessions').select('*').eq('session_token', sessionToken).eq('is_active', true).gte('expires_at', new Date().toISOString()).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data, isValid: !!data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', isValid: false } }
}

export async function getUserSessions(userId: string, options?: { is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('login_sessions').select('*, login_devices(*)').eq('user_id', userId); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function invalidateSession(sessionId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('login_sessions').update({ is_active: false, invalidated_at: new Date().toISOString() }).eq('id', sessionId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function invalidateAllUserSessions(userId: string, exceptSessionId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('login_sessions').update({ is_active: false, invalidated_at: new Date().toISOString() }).eq('user_id', userId).eq('is_active', true); if (exceptSessionId) query = query.neq('id', exceptSessionId); const { error } = await query; if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addLoginHistory(historyData: { user_id: string; action: string; ip_address?: string; user_agent?: string; location?: string; device_info?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('login_history').insert({ ...historyData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLoginHistory(userId: string, options?: { action?: string; from_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('login_history').select('*').eq('user_id', userId); if (options?.action) query = query.eq('action', options.action); if (options?.from_date) query = query.gte('created_at', options.from_date); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function registerDevice(deviceData: { user_id: string; device_name: string; device_type: string; device_id: string; platform?: string; browser?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('login_devices').upsert({ ...deviceData, is_trusted: false, last_used_at: new Date().toISOString(), created_at: new Date().toISOString() }, { onConflict: 'device_id' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserDevices(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('login_devices').select('*').eq('user_id', userId).order('last_used_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function trustDevice(deviceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('login_devices').update({ is_trusted: true }).eq('id', deviceId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeDevice(deviceId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('login_devices').delete().eq('id', deviceId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLoginSecuritySettings(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('login_security').select('*').eq('user_id', userId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateLoginSecuritySettings(userId: string, settings: Partial<{ mfa_enabled: boolean; mfa_method: string; session_timeout_minutes: number; allow_multiple_sessions: boolean; trusted_devices_only: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('login_security').upsert({ user_id: userId, ...settings, updated_at: new Date().toISOString() }, { onConflict: 'user_id' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
