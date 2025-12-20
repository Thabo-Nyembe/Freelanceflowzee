'use server'

/**
 * Extended Phones Server Actions
 * Tables: phone_numbers, phone_verifications, phone_calls, phone_sms, phone_settings, phone_logs
 */

import { createClient } from '@/lib/supabase/server'

export async function getPhoneNumber(phoneId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('phone_numbers').select('*').eq('id', phoneId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addPhoneNumber(phoneData: { user_id: string; phone_number: string; country_code: string; type?: string; is_primary?: boolean; label?: string }) {
  try { const supabase = await createClient(); if (phoneData.is_primary) { await supabase.from('phone_numbers').update({ is_primary: false }).eq('user_id', phoneData.user_id) } const { data, error } = await supabase.from('phone_numbers').insert({ ...phoneData, is_verified: false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePhoneNumber(phoneId: string, updates: Partial<{ type: string; is_primary: boolean; label: string }>) {
  try { const supabase = await createClient(); if (updates.is_primary) { const { data: phone } = await supabase.from('phone_numbers').select('user_id').eq('id', phoneId).single(); if (phone) { await supabase.from('phone_numbers').update({ is_primary: false }).eq('user_id', phone.user_id) } } const { data, error } = await supabase.from('phone_numbers').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', phoneId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deletePhoneNumber(phoneId: string) {
  try { const supabase = await createClient(); await supabase.from('phone_verifications').delete().eq('phone_id', phoneId); const { error } = await supabase.from('phone_numbers').delete().eq('id', phoneId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPhoneNumbers(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('phone_numbers').select('*').eq('user_id', userId).order('is_primary', { ascending: false }).order('created_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function sendVerificationCode(phoneId: string) {
  try { const supabase = await createClient(); const code = Math.floor(100000 + Math.random() * 900000).toString(); const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); await supabase.from('phone_verifications').update({ status: 'expired' }).eq('phone_id', phoneId).eq('status', 'pending'); const { data, error } = await supabase.from('phone_verifications').insert({ phone_id: phoneId, code, expires_at: expiresAt, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data: { message: 'Verification code sent' } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function verifyPhoneNumber(phoneId: string, code: string) {
  try { const supabase = await createClient(); const { data: verification, error: verError } = await supabase.from('phone_verifications').select('*').eq('phone_id', phoneId).eq('code', code).eq('status', 'pending').single(); if (verError || !verification) return { success: false, error: 'Invalid verification code' }; if (new Date(verification.expires_at) < new Date()) return { success: false, error: 'Verification code expired' }; await supabase.from('phone_verifications').update({ status: 'verified', verified_at: new Date().toISOString() }).eq('id', verification.id); const { data, error } = await supabase.from('phone_numbers').update({ is_verified: true, verified_at: new Date().toISOString() }).eq('id', phoneId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function logCall(callData: { phone_id: string; direction: string; from_number: string; to_number: string; duration?: number; status: string; recording_url?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('phone_calls').insert({ ...callData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCalls(phoneId: string, options?: { direction?: string; status?: string; from_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('phone_calls').select('*').eq('phone_id', phoneId); if (options?.direction) query = query.eq('direction', options.direction); if (options?.status) query = query.eq('status', options.status); if (options?.from_date) query = query.gte('created_at', options.from_date); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function sendSms(smsData: { phone_id: string; to_number: string; message: string; scheduled_at?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('phone_sms').insert({ ...smsData, direction: 'outbound', status: smsData.scheduled_at ? 'scheduled' : 'sent', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSms(phoneId: string, options?: { direction?: string; status?: string; from_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('phone_sms').select('*').eq('phone_id', phoneId); if (options?.direction) query = query.eq('direction', options.direction); if (options?.status) query = query.eq('status', options.status); if (options?.from_date) query = query.gte('created_at', options.from_date); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function updateSettings(userId: string, settings: { sms_notifications?: boolean; call_forwarding?: boolean; voicemail_enabled?: boolean; voicemail_greeting_url?: string }) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('phone_settings').select('id').eq('user_id', userId).single(); if (existing) { const { data, error } = await supabase.from('phone_settings').update({ ...settings, updated_at: new Date().toISOString() }).eq('user_id', userId).select().single(); if (error) throw error; return { success: true, data } } const { data, error } = await supabase.from('phone_settings').insert({ user_id: userId, ...settings, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSettings(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('phone_settings').select('*').eq('user_id', userId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data: data || { sms_notifications: true, call_forwarding: false, voicemail_enabled: true } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function logActivity(logData: { phone_id: string; action: string; details?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('phone_logs').insert({ ...logData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
