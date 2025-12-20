'use server'

/**
 * Extended Sessions Server Actions
 * Tables: sessions, session_tokens, session_activities, session_devices, session_logs, session_settings
 */

import { createClient } from '@/lib/supabase/server'

export async function getSession(sessionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('sessions').select('*, session_tokens(*), session_devices(*), session_activities(*), users(*)').eq('id', sessionId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createSession(sessionData: { user_id: string; device_id?: string; ip_address?: string; user_agent?: string; location?: any; metadata?: any }) {
  try { const supabase = await createClient(); const token = generateSessionToken(); const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); const { data: session, error: sessionError } = await supabase.from('sessions').insert({ ...sessionData, status: 'active', started_at: new Date().toISOString(), expires_at: expiresAt, last_activity_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (sessionError) throw sessionError; await supabase.from('session_tokens').insert({ session_id: session.id, token, type: 'access', expires_at: expiresAt, created_at: new Date().toISOString() }); return { success: true, data: { session, token } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

function generateSessionToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 64; i++) { token += chars.charAt(Math.floor(Math.random() * chars.length)) }
  return token
}

export async function endSession(sessionId: string, reason?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('sessions').update({ status: 'ended', ended_at: new Date().toISOString(), end_reason: reason, updated_at: new Date().toISOString() }).eq('id', sessionId).select().single(); if (error) throw error; await supabase.from('session_tokens').update({ revoked_at: new Date().toISOString() }).eq('session_id', sessionId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function refreshSession(sessionId: string) {
  try { const supabase = await createClient(); const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); const newToken = generateSessionToken(); await supabase.from('session_tokens').update({ revoked_at: new Date().toISOString() }).eq('session_id', sessionId).is('revoked_at', null); await supabase.from('session_tokens').insert({ session_id: sessionId, token: newToken, type: 'access', expires_at: newExpiry, created_at: new Date().toISOString() }); const { data, error } = await supabase.from('sessions').update({ expires_at: newExpiry, last_activity_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', sessionId).select().single(); if (error) throw error; return { success: true, data: { session: data, token: newToken } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSessions(options?: { user_id?: string; status?: string; device_id?: string; from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('sessions').select('*, session_devices(*), users(*)'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.status) query = query.eq('status', options.status); if (options?.device_id) query = query.eq('device_id', options.device_id); if (options?.from_date) query = query.gte('started_at', options.from_date); if (options?.to_date) query = query.lte('started_at', options.to_date); const { data, error } = await query.order('started_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUserActiveSessions(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('sessions').select('*, session_devices(*)').eq('user_id', userId).eq('status', 'active').gt('expires_at', new Date().toISOString()).order('last_activity_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function endAllUserSessions(userId: string, exceptSessionId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('sessions').update({ status: 'ended', ended_at: new Date().toISOString(), end_reason: 'user_requested', updated_at: new Date().toISOString() }).eq('user_id', userId).eq('status', 'active'); if (exceptSessionId) query = query.neq('id', exceptSessionId); const { error } = await query; if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function logSessionActivity(sessionId: string, activityData: { action: string; resource?: string; resource_id?: string; details?: any; ip_address?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('session_activities').insert({ session_id: sessionId, ...activityData, performed_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('sessions').update({ last_activity_at: new Date().toISOString() }).eq('id', sessionId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSessionActivities(sessionId: string, options?: { action?: string; from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('session_activities').select('*').eq('session_id', sessionId); if (options?.action) query = query.eq('action', options.action); if (options?.from_date) query = query.gte('performed_at', options.from_date); if (options?.to_date) query = query.lte('performed_at', options.to_date); const { data, error } = await query.order('performed_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function registerDevice(deviceData: { user_id: string; device_name: string; device_type: string; platform?: string; browser?: string; push_token?: string; is_trusted?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('session_devices').insert({ ...deviceData, last_used_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserDevices(userId: string, options?: { is_trusted?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('session_devices').select('*').eq('user_id', userId); if (options?.is_trusted !== undefined) query = query.eq('is_trusted', options.is_trusted); const { data, error } = await query.order('last_used_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function validateSessionToken(token: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('session_tokens').select('*, sessions(*, users(*))').eq('token', token).is('revoked_at', null).gt('expires_at', new Date().toISOString()).single(); if (error && error.code !== 'PGRST116') throw error; if (!data || data.sessions?.status !== 'active') return { success: true, data: { valid: false } }; return { success: true, data: { valid: true, session: data.sessions } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function cleanupExpiredSessions() {
  try { const supabase = await createClient(); const { error } = await supabase.from('sessions').update({ status: 'expired', ended_at: new Date().toISOString(), end_reason: 'expired' }).eq('status', 'active').lt('expires_at', new Date().toISOString()); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

