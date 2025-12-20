'use server'

/**
 * Extended Country Server Actions - Covers all Country-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getCountry(countryId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('countries').select('*').eq('id', countryId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createCountry(countryData: { name: string; code: string; iso3?: string; numeric_code?: string; phone_code?: string; capital?: string; currency_code?: string; native_name?: string; continent?: string; region?: string; subregion?: string; languages?: string[]; timezones?: string[]; flag_url?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('countries').insert({ ...countryData, is_active: countryData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCountry(countryId: string, updates: Partial<{ name: string; phone_code: string; currency_code: string; flag_url: string; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('countries').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', countryId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteCountry(countryId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('countries').delete().eq('id', countryId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCountries(options?: { continent?: string; region?: string; isActive?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('countries').select('*'); if (options?.continent) query = query.eq('continent', options.continent); if (options?.region) query = query.eq('region', options.region); if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getCountryByCode(code: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('countries').select('*').eq('code', code.toUpperCase()).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCountriesByContinent(continent: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('countries').select('*').eq('continent', continent).eq('is_active', true).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function searchCountries(searchTerm: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('countries').select('*').or(`name.ilike.%${searchTerm}%,native_name.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%`).eq('is_active', true).order('name', { ascending: true }).limit(20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getCountryStates(countryCode: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('country_states').select('*').eq('country_code', countryCode).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getCountryCities(countryCode: string, stateCode?: string) {
  try { const supabase = await createClient(); let query = supabase.from('country_cities').select('*').eq('country_code', countryCode); if (stateCode) query = query.eq('state_code', stateCode); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
