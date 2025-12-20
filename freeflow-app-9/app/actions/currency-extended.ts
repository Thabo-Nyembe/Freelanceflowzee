'use server'

/**
 * Extended Currency Server Actions - Covers all Currency-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getCurrencies(isActive?: boolean) {
  try { const supabase = await createClient(); let query = supabase.from('currencies').select('*').order('name', { ascending: true }); if (isActive !== undefined) query = query.eq('is_active', isActive); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getCurrency(currencyCode: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('currencies').select('*').eq('code', currencyCode).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createCurrency(input: { code: string; name: string; symbol: string; decimal_places?: number; format?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('currencies').insert({ ...input, is_active: true, is_default: false }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCurrency(currencyCode: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('currencies').update({ ...updates, updated_at: new Date().toISOString() }).eq('code', currencyCode).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setDefaultCurrency(currencyCode: string) {
  try { const supabase = await createClient(); await supabase.from('currencies').update({ is_default: false }).neq('code', currencyCode); const { data, error } = await supabase.from('currencies').update({ is_default: true, is_active: true }).eq('code', currencyCode).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDefaultCurrency() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('currencies').select('*').eq('is_default', true).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function toggleCurrencyActive(currencyCode: string, isActive: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('currencies').update({ is_active: isActive }).eq('code', currencyCode).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getExchangeRates(baseCurrency: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('exchange_rates').select('*').eq('base_currency', baseCurrency).order('target_currency', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getExchangeRate(baseCurrency: string, targetCurrency: string) {
  try { const supabase = await createClient(); if (baseCurrency === targetCurrency) return { success: true, rate: 1 }; const { data, error } = await supabase.from('exchange_rates').select('rate').eq('base_currency', baseCurrency).eq('target_currency', targetCurrency).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, rate: data?.rate || null } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function setExchangeRate(baseCurrency: string, targetCurrency: string, rate: number) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('exchange_rates').select('id').eq('base_currency', baseCurrency).eq('target_currency', targetCurrency).single(); if (existing) { const { data, error } = await supabase.from('exchange_rates').update({ rate, updated_at: new Date().toISOString() }).eq('id', existing.id).select().single(); if (error) throw error; return { success: true, data }; } const { data, error } = await supabase.from('exchange_rates').insert({ base_currency: baseCurrency, target_currency: targetCurrency, rate }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function convertAmount(amount: number, fromCurrency: string, toCurrency: string) {
  try { if (fromCurrency === toCurrency) return { success: true, amount, rate: 1 }; const { rate } = await getExchangeRate(fromCurrency, toCurrency); if (!rate) throw new Error(`No exchange rate found for ${fromCurrency} to ${toCurrency}`); return { success: true, amount: amount * rate, rate } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function formatCurrency(amount: number, currencyCode: string) {
  try { const supabase = await createClient(); const { data: currency, error } = await supabase.from('currencies').select('symbol, decimal_places, format').eq('code', currencyCode).single(); if (error) throw error; const decimalPlaces = currency?.decimal_places ?? 2; const formatted = amount.toFixed(decimalPlaces); const symbol = currency?.symbol || currencyCode; return { success: true, formatted: `${symbol}${formatted}` } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
