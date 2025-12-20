'use server'

/**
 * Extended Licenses Server Actions
 * Tables: licenses, license_keys, license_activations, license_types, license_renewals
 */

import { createClient } from '@/lib/supabase/server'

export async function getLicense(licenseId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('licenses').select('*, license_types(*), license_activations(*)').eq('id', licenseId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createLicense(licenseData: { user_id: string; type_id: string; product_id?: string; max_activations?: number; expires_at?: string }) {
  try { const supabase = await createClient(); const licenseKey = `LIC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`; const { data, error } = await supabase.from('licenses').insert({ ...licenseData, license_key: licenseKey, activation_count: 0, max_activations: licenseData.max_activations || 1, status: 'active', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateLicense(licenseId: string, updates: Partial<{ status: string; max_activations: number; expires_at: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('licenses').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', licenseId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function revokeLicense(licenseId: string, reason?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('licenses').update({ status: 'revoked', revoked_at: new Date().toISOString(), revoke_reason: reason }).eq('id', licenseId).select().single(); if (error) throw error; await supabase.from('license_activations').update({ deactivated_at: new Date().toISOString() }).eq('license_id', licenseId).is('deactivated_at', null); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserLicenses(userId: string, options?: { status?: string; product_id?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('licenses').select('*, license_types(*), license_activations(*)').eq('user_id', userId); if (options?.status) query = query.eq('status', options.status); if (options?.product_id) query = query.eq('product_id', options.product_id); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function activateLicense(licenseId: string, deviceInfo: { device_id: string; device_name?: string; platform?: string; ip_address?: string }) {
  try { const supabase = await createClient(); const { data: license } = await supabase.from('licenses').select('activation_count, max_activations, status, expires_at').eq('id', licenseId).single(); if (!license || license.status !== 'active') return { success: false, error: 'License is not active' }; if (license.expires_at && new Date(license.expires_at) < new Date()) return { success: false, error: 'License has expired' }; if (license.activation_count >= license.max_activations) return { success: false, error: 'Maximum activations reached' }; const { data, error } = await supabase.from('license_activations').insert({ license_id: licenseId, ...deviceInfo, activated_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('licenses').update({ activation_count: license.activation_count + 1 }).eq('id', licenseId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deactivateLicense(activationId: string) {
  try { const supabase = await createClient(); const { data: activation } = await supabase.from('license_activations').select('license_id').eq('id', activationId).single(); const { error } = await supabase.from('license_activations').update({ deactivated_at: new Date().toISOString() }).eq('id', activationId); if (error) throw error; if (activation?.license_id) { const { data: license } = await supabase.from('licenses').select('activation_count').eq('id', activation.license_id).single(); await supabase.from('licenses').update({ activation_count: Math.max(0, (license?.activation_count || 1) - 1) }).eq('id', activation.license_id) } return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function validateLicenseKey(licenseKey: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('licenses').select('*, license_types(*)').eq('license_key', licenseKey).single(); if (error && error.code !== 'PGRST116') throw error; if (!data) return { success: false, error: 'Invalid license key', data: null }; const isValid = data.status === 'active' && (!data.expires_at || new Date(data.expires_at) > new Date()); return { success: true, data: { ...data, is_valid: isValid } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLicenseTypes() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('license_types').select('*').order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function renewLicense(licenseId: string, renewalData: { duration_months: number; payment_id?: string }) {
  try { const supabase = await createClient(); const { data: license } = await supabase.from('licenses').select('expires_at').eq('id', licenseId).single(); const currentExpiry = license?.expires_at ? new Date(license.expires_at) : new Date(); const newExpiry = new Date(currentExpiry); newExpiry.setMonth(newExpiry.getMonth() + renewalData.duration_months); await supabase.from('license_renewals').insert({ license_id: licenseId, previous_expiry: license?.expires_at, new_expiry: newExpiry.toISOString(), payment_id: renewalData.payment_id, renewed_at: new Date().toISOString() }); const { data, error } = await supabase.from('licenses').update({ expires_at: newExpiry.toISOString(), status: 'active', updated_at: new Date().toISOString() }).eq('id', licenseId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getLicenseActivations(licenseId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('license_activations').select('*').eq('license_id', licenseId).order('activated_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
