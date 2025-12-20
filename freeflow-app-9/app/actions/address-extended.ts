'use server'

/**
 * Extended Address Server Actions - Covers all Address-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getAddresses(userId: string, addressType?: string) {
  try { const supabase = await createClient(); let query = supabase.from('addresses').select('*').eq('user_id', userId).order('is_default', { ascending: false }); if (addressType) query = query.eq('address_type', addressType); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getAddress(addressId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('addresses').select('*').eq('id', addressId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createAddress(input: { user_id: string; address_type: string; label?: string; line1: string; line2?: string; city: string; state?: string; postal_code?: string; country: string; is_default?: boolean }) {
  try { const supabase = await createClient(); if (input.is_default) { await supabase.from('addresses').update({ is_default: false }).eq('user_id', input.user_id).eq('address_type', input.address_type); } const { data, error } = await supabase.from('addresses').insert({ ...input, is_verified: false }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateAddress(addressId: string, updates: any) {
  try { const supabase = await createClient(); if (updates.is_default) { const { data: current } = await supabase.from('addresses').select('user_id, address_type').eq('id', addressId).single(); if (current) { await supabase.from('addresses').update({ is_default: false }).eq('user_id', current.user_id).eq('address_type', current.address_type); } } const { data, error } = await supabase.from('addresses').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', addressId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteAddress(addressId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('addresses').delete().eq('id', addressId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setDefaultAddress(addressId: string) {
  try { const supabase = await createClient(); const { data: address, error: getError } = await supabase.from('addresses').select('user_id, address_type').eq('id', addressId).single(); if (getError) throw getError; await supabase.from('addresses').update({ is_default: false }).eq('user_id', address.user_id).eq('address_type', address.address_type); const { data, error } = await supabase.from('addresses').update({ is_default: true }).eq('id', addressId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDefaultAddress(userId: string, addressType?: string) {
  try { const supabase = await createClient(); let query = supabase.from('addresses').select('*').eq('user_id', userId).eq('is_default', true); if (addressType) query = query.eq('address_type', addressType); const { data, error } = await query.single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function verifyAddress(addressId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('addresses').update({ is_verified: true, verified_at: new Date().toISOString() }).eq('id', addressId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCountries(isActive = true) {
  try { const supabase = await createClient(); let query = supabase.from('countries').select('*').order('name', { ascending: true }); if (isActive) query = query.eq('is_active', true); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getStates(countryCode: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('states').select('*').eq('country_code', countryCode).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getCities(stateCode: string, countryCode: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('cities').select('*').eq('state_code', stateCode).eq('country_code', countryCode).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function formatAddress(addressId: string) {
  try { const supabase = await createClient(); const { data: address, error } = await supabase.from('addresses').select('*').eq('id', addressId).single(); if (error) throw error; const parts = [address.line1]; if (address.line2) parts.push(address.line2); parts.push(`${address.city}${address.state ? ', ' + address.state : ''} ${address.postal_code || ''}`); parts.push(address.country); return { success: true, formatted: parts.join('\n').trim() } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
