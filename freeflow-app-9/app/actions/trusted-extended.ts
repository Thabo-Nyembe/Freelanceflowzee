'use server'

/**
 * Extended Trusted/Security Server Actions - Covers all Trusted Device & Two-Factor tables
 * Tables: trusted_devices, two_factor_backup_codes, secure_file_deliveries
 */

import { createClient } from '@/lib/supabase/server'

export async function getTrustedDevice(deviceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('trusted_devices').select('*').eq('id', deviceId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function registerTrustedDevice(deviceData: { user_id: string; device_name: string; device_type: string; device_fingerprint: string; browser?: string; os?: string; ip_address?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('trusted_devices').insert({ ...deviceData, is_trusted: true, last_used_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTrustedDeviceLastUsed(deviceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('trusted_devices').update({ last_used_at: new Date().toISOString() }).eq('id', deviceId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function revokeTrustedDevice(deviceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('trusted_devices').update({ is_trusted: false, revoked_at: new Date().toISOString() }).eq('id', deviceId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteTrustedDevice(deviceId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('trusted_devices').delete().eq('id', deviceId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTrustedDevices(userId: string, options?: { onlyActive?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('trusted_devices').select('*').eq('user_id', userId); if (options?.onlyActive) query = query.eq('is_trusted', true); const { data, error } = await query.order('last_used_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function checkDeviceTrusted(userId: string, deviceFingerprint: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('trusted_devices').select('*').eq('user_id', userId).eq('device_fingerprint', deviceFingerprint).eq('is_trusted', true).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, isTrusted: !!data, device: data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function revokeAllTrustedDevices(userId: string, exceptDeviceId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('trusted_devices').update({ is_trusted: false, revoked_at: new Date().toISOString() }).eq('user_id', userId).eq('is_trusted', true); if (exceptDeviceId) query = query.neq('id', exceptDeviceId); const { error } = await query; if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function generateTwoFactorBackupCodes(userId: string, count?: number) {
  try { const supabase = await createClient(); await supabase.from('two_factor_backup_codes').delete().eq('user_id', userId).eq('is_used', false); const codes = Array.from({ length: count || 10 }, () => Math.random().toString(36).substring(2, 10).toUpperCase()); const inserts = codes.map(code => ({ user_id: userId, code, is_used: false, created_at: new Date().toISOString() })); const { error } = await supabase.from('two_factor_backup_codes').insert(inserts); if (error) throw error; return { success: true, codes } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function validateTwoFactorBackupCode(userId: string, code: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('two_factor_backup_codes').select('*').eq('user_id', userId).eq('code', code.toUpperCase()).eq('is_used', false).single(); if (error && error.code !== 'PGRST116') throw error; if (!data) return { success: false, error: 'Invalid or already used backup code' }; await supabase.from('two_factor_backup_codes').update({ is_used: true, used_at: new Date().toISOString() }).eq('id', data.id); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTwoFactorBackupCodesCount(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('two_factor_backup_codes').select('id').eq('user_id', userId).eq('is_used', false); if (error) throw error; return { success: true, count: data?.length || 0 } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSecureFileDelivery(deliveryId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('secure_file_deliveries').select('*').eq('id', deliveryId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createSecureFileDelivery(deliveryData: { file_id: string; sender_id: string; recipient_email: string; access_code?: string; expires_at?: string; max_downloads?: number; requires_auth?: boolean }) {
  try { const supabase = await createClient(); const accessCode = deliveryData.access_code || Math.random().toString(36).substring(2, 10).toUpperCase(); const { data, error } = await supabase.from('secure_file_deliveries').insert({ ...deliveryData, access_code: accessCode, download_count: 0, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data: { ...data, accessCode } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function validateSecureFileDelivery(deliveryId: string, accessCode: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('secure_file_deliveries').select('*').eq('id', deliveryId).eq('access_code', accessCode).eq('is_active', true).single(); if (error && error.code !== 'PGRST116') throw error; if (!data) return { success: false, error: 'Invalid access code or delivery not found' }; if (data.expires_at && new Date(data.expires_at) < new Date()) return { success: false, error: 'Delivery has expired' }; if (data.max_downloads && data.download_count >= data.max_downloads) return { success: false, error: 'Maximum downloads reached' }; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function recordSecureFileDownload(deliveryId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('secure_file_deliveries').update({ download_count: supabase.rpc('increment_download_count'), last_downloaded_at: new Date().toISOString() }).eq('id', deliveryId).select().single(); if (error) { const { data: current } = await supabase.from('secure_file_deliveries').select('download_count').eq('id', deliveryId).single(); await supabase.from('secure_file_deliveries').update({ download_count: (current?.download_count || 0) + 1, last_downloaded_at: new Date().toISOString() }).eq('id', deliveryId); } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function revokeSecureFileDelivery(deliveryId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('secure_file_deliveries').update({ is_active: false, revoked_at: new Date().toISOString() }).eq('id', deliveryId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSecureFileDeliveries(userId: string, options?: { isActive?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('secure_file_deliveries').select('*').eq('sender_id', userId); if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
