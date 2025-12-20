'use server'

/**
 * Extended License Server Actions - Covers all License-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getLicenses(userId?: string, status?: string, productId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('licenses').select('*').order('created_at', { ascending: false }); if (userId) query = query.eq('user_id', userId); if (status) query = query.eq('status', status); if (productId) query = query.eq('product_id', productId); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getLicense(licenseId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('licenses').select('*').eq('id', licenseId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createLicense(input: { user_id: string; product_id: string; license_type: string; max_activations?: number; expires_at?: string; features?: string[]; metadata?: any }) {
  try { const supabase = await createClient(); const licenseKey = generateLicenseKey(); const { data, error } = await supabase.from('licenses').insert({ ...input, license_key: licenseKey, status: 'active', activation_count: 0, max_activations: input.max_activations || 1 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

function generateLicenseKey(): string { const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; const segments = 4; const segmentLength = 4; const key = []; for (let i = 0; i < segments; i++) { let segment = ''; for (let j = 0; j < segmentLength; j++) { segment += chars.charAt(Math.floor(Math.random() * chars.length)); } key.push(segment); } return key.join('-'); }

export async function updateLicense(licenseId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('licenses').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', licenseId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function revokeLicense(licenseId: string, reason?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('licenses').update({ status: 'revoked', revoked_at: new Date().toISOString(), revocation_reason: reason }).eq('id', licenseId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function suspendLicense(licenseId: string, reason?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('licenses').update({ status: 'suspended', suspended_at: new Date().toISOString(), suspension_reason: reason }).eq('id', licenseId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function reactivateLicense(licenseId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('licenses').update({ status: 'active', suspended_at: null, suspension_reason: null }).eq('id', licenseId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function validateLicenseKey(licenseKey: string) {
  try { const supabase = await createClient(); const { data: license, error } = await supabase.from('licenses').select('*').eq('license_key', licenseKey).single(); if (error) throw error; if (license.status !== 'active') throw new Error(`License is ${license.status}`); if (license.expires_at && new Date(license.expires_at) < new Date()) throw new Error('License has expired'); if (license.max_activations && license.activation_count >= license.max_activations) throw new Error('Maximum activations reached'); return { success: true, data: { valid: true, license } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLicenseKeys(licenseId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('license_keys').select('*').eq('license_id', licenseId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function generateLicenseKeyForLicense(licenseId: string) {
  try { const supabase = await createClient(); const key = generateLicenseKey(); const { data, error } = await supabase.from('license_keys').insert({ license_id: licenseId, key, status: 'active', is_used: false }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function activateLicenseKey(key: string, deviceId: string, deviceInfo?: any) {
  try { const supabase = await createClient(); const { data: licenseKey, error: keyError } = await supabase.from('license_keys').select('*, licenses(*)').eq('key', key).single(); if (keyError) throw keyError; if (licenseKey.is_used) throw new Error('License key already used'); if (licenseKey.status !== 'active') throw new Error('License key is not active'); const license = licenseKey.licenses; if (license.max_activations && license.activation_count >= license.max_activations) throw new Error('Maximum activations reached'); const { data, error } = await supabase.from('license_keys').update({ is_used: true, used_at: new Date().toISOString(), device_id: deviceId, device_info: deviceInfo }).eq('id', licenseKey.id).select().single(); if (error) throw error; await supabase.from('licenses').update({ activation_count: (license.activation_count || 0) + 1, last_activated_at: new Date().toISOString() }).eq('id', license.id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deactivateLicenseKey(keyId: string) {
  try { const supabase = await createClient(); const { data: licenseKey, error: keyError } = await supabase.from('license_keys').select('license_id').eq('id', keyId).single(); if (keyError) throw keyError; const { data, error } = await supabase.from('license_keys').update({ is_used: false, device_id: null, device_info: null, deactivated_at: new Date().toISOString() }).eq('id', keyId).select().single(); if (error) throw error; const { data: license } = await supabase.from('licenses').select('activation_count').eq('id', licenseKey.license_id).single(); if (license) { await supabase.from('licenses').update({ activation_count: Math.max(0, (license.activation_count || 1) - 1) }).eq('id', licenseKey.license_id); } return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteLicenseKey(keyId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('license_keys').delete().eq('id', keyId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
