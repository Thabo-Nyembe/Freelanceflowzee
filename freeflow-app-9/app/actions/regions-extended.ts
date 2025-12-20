'use server'

/**
 * Extended Regions Server Actions
 * Tables: regions, region_settings, region_languages, region_currencies, region_taxes, region_shipping
 */

import { createClient } from '@/lib/supabase/server'

export async function getRegion(regionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('regions').select('*, region_settings(*), region_languages(*), region_currencies(*), region_taxes(*), region_shipping(*)').eq('id', regionId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createRegion(regionData: { name: string; code: string; description?: string; country_code?: string; timezone?: string; default_language?: string; default_currency?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('regions').insert({ ...regionData, is_active: regionData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateRegion(regionId: string, updates: Partial<{ name: string; description: string; timezone: string; default_language: string; default_currency: string; is_active: boolean; settings: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('regions').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', regionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteRegion(regionId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('regions').delete().eq('id', regionId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRegions(options?: { country_code?: string; is_active?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('regions').select('*, region_currencies(*), region_languages(*)'); if (options?.country_code) query = query.eq('country_code', options.country_code); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.search) query = query.or(`name.ilike.%${options.search}%,code.ilike.%${options.search}%`); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRegionByCode(code: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('regions').select('*, region_settings(*), region_languages(*), region_currencies(*)').eq('code', code.toUpperCase()).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRegionLanguages(regionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('region_languages').select('*').eq('region_id', regionId).order('is_default', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addRegionLanguage(regionId: string, languageData: { language_code: string; is_default?: boolean }) {
  try { const supabase = await createClient(); if (languageData.is_default) { await supabase.from('region_languages').update({ is_default: false }).eq('region_id', regionId) } const { data, error } = await supabase.from('region_languages').insert({ region_id: regionId, ...languageData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRegionCurrencies(regionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('region_currencies').select('*').eq('region_id', regionId).order('is_default', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addRegionCurrency(regionId: string, currencyData: { currency_code: string; exchange_rate?: number; is_default?: boolean }) {
  try { const supabase = await createClient(); if (currencyData.is_default) { await supabase.from('region_currencies').update({ is_default: false }).eq('region_id', regionId) } const { data, error } = await supabase.from('region_currencies').insert({ region_id: regionId, exchange_rate: 1, ...currencyData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRegionTaxes(regionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('region_taxes').select('*').eq('region_id', regionId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addRegionTax(regionId: string, taxData: { name: string; rate: number; type?: string; applies_to?: string[]; is_compound?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('region_taxes').insert({ region_id: regionId, ...taxData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRegionShipping(regionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('region_shipping').select('*').eq('region_id', regionId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addRegionShipping(regionId: string, shippingData: { name: string; carrier?: string; method?: string; base_rate: number; per_kg_rate?: number; min_days?: number; max_days?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('region_shipping').insert({ region_id: regionId, ...shippingData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRegionSettings(regionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('region_settings').select('*').eq('region_id', regionId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateRegionSettings(regionId: string, settings: any) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('region_settings').select('id').eq('region_id', regionId).single(); if (existing) { const { data, error } = await supabase.from('region_settings').update({ ...settings, updated_at: new Date().toISOString() }).eq('region_id', regionId).select().single(); if (error) throw error; return { success: true, data } } else { const { data, error } = await supabase.from('region_settings').insert({ region_id: regionId, ...settings, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
