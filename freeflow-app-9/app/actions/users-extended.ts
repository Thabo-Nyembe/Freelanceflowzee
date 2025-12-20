'use server'

/**
 * Extended Users Server Actions
 * Tables: users, user_profiles, user_preferences, user_sessions, user_devices, user_verifications
 */

import { createClient } from '@/lib/supabase/server'

export async function getUser(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('users').select('*, user_profiles(*), user_preferences(*)').eq('id', userId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateUser(userId: string, updates: Partial<{ email: string; full_name: string; avatar_url: string; phone: string; is_active: boolean; role: string; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('users').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', userId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUsers(options?: { role?: string; is_active?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('users').select('*, user_profiles(*)'); if (options?.role) query = query.eq('role', options.role); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.search) query = query.or(`email.ilike.%${options.search}%,full_name.ilike.%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUserByEmail(email: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('users').select('*, user_profiles(*)').eq('email', email).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateProfile(userId: string, profileData: Partial<{ bio: string; location: string; website: string; company: string; job_title: string; timezone: string; language: string; social_links: any; skills: string[]; interests: string[] }>) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('user_profiles').select('id').eq('user_id', userId).single(); if (existing) { const { data, error } = await supabase.from('user_profiles').update({ ...profileData, updated_at: new Date().toISOString() }).eq('user_id', userId).select().single(); if (error) throw error; return { success: true, data } } else { const { data, error } = await supabase.from('user_profiles').insert({ user_id: userId, ...profileData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getProfile(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_profiles').select('*').eq('user_id', userId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePreferences(userId: string, preferences: Partial<{ theme: string; notifications_enabled: boolean; email_notifications: boolean; push_notifications: boolean; newsletter_subscribed: boolean; marketing_emails: boolean; two_factor_enabled: boolean; default_visibility: string; locale: string; date_format: string; time_format: string }>) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('user_preferences').select('id').eq('user_id', userId).single(); if (existing) { const { data, error } = await supabase.from('user_preferences').update({ ...preferences, updated_at: new Date().toISOString() }).eq('user_id', userId).select().single(); if (error) throw error; return { success: true, data } } else { const { data, error } = await supabase.from('user_preferences').insert({ user_id: userId, ...preferences, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPreferences(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_preferences').select('*').eq('user_id', userId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function recordSession(userId: string, sessionData: { ip_address?: string; user_agent?: string; device_type?: string; location?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_sessions').insert({ user_id: userId, ...sessionData, started_at: new Date().toISOString(), is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('users').update({ last_login_at: new Date().toISOString() }).eq('id', userId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function endSession(sessionId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('user_sessions').update({ is_active: false, ended_at: new Date().toISOString() }).eq('id', sessionId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSessions(userId: string, options?: { is_active?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('user_sessions').select('*').eq('user_id', userId); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('started_at', { ascending: false }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function registerDevice(userId: string, deviceData: { device_id: string; device_type: string; device_name?: string; os?: string; os_version?: string; app_version?: string; push_token?: string }) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('user_devices').select('id').eq('user_id', userId).eq('device_id', deviceData.device_id).single(); if (existing) { const { data, error } = await supabase.from('user_devices').update({ ...deviceData, last_active_at: new Date().toISOString() }).eq('id', existing.id).select().single(); if (error) throw error; return { success: true, data } } else { const { data, error } = await supabase.from('user_devices').insert({ user_id: userId, ...deviceData, is_active: true, registered_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDevices(userId: string, options?: { is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('user_devices').select('*').eq('user_id', userId); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('last_active_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function deactivateDevice(deviceId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('user_devices').update({ is_active: false, deactivated_at: new Date().toISOString() }).eq('id', deviceId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createVerification(userId: string, verificationType: string, expiresInMinutes: number = 60) {
  try { const supabase = await createClient(); const token = crypto.randomUUID(); const expiresAt = new Date(); expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes); const { data, error } = await supabase.from('user_verifications').insert({ user_id: userId, verification_type: verificationType, token, expires_at: expiresAt.toISOString(), is_used: false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function verifyToken(token: string, verificationType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('user_verifications').select('*').eq('token', token).eq('verification_type', verificationType).eq('is_used', false).single(); if (error && error.code !== 'PGRST116') throw error; if (!data) return { success: false, error: 'Invalid token' }; if (new Date(data.expires_at) < new Date()) return { success: false, error: 'Token expired' }; await supabase.from('user_verifications').update({ is_used: true, used_at: new Date().toISOString() }).eq('id', data.id); return { success: true, data: { user_id: data.user_id } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deactivateUser(userId: string, reason?: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('users').update({ is_active: false, deactivated_at: new Date().toISOString(), deactivation_reason: reason, updated_at: new Date().toISOString() }).eq('id', userId); if (error) throw error; await supabase.from('user_sessions').update({ is_active: false, ended_at: new Date().toISOString() }).eq('user_id', userId).eq('is_active', true); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function reactivateUser(userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('users').update({ is_active: true, deactivated_at: null, deactivation_reason: null, reactivated_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', userId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function searchUsers(query: string, options?: { exclude_ids?: string[]; limit?: number }) {
  try { const supabase = await createClient(); let dbQuery = supabase.from('users').select('id, email, full_name, avatar_url').eq('is_active', true).or(`email.ilike.%${query}%,full_name.ilike.%${query}%`); if (options?.exclude_ids && options.exclude_ids.length > 0) { dbQuery = dbQuery.not('id', 'in', `(${options.exclude_ids.join(',')})`) } const { data, error } = await dbQuery.limit(options?.limit || 10); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
