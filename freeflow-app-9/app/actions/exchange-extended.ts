'use server'

/**
 * Extended Exchange Server Actions
 * Tables: exchange_rates, exchange_transactions, exchange_history, exchange_providers
 */

import { createClient } from '@/lib/supabase/server'

export async function getExchangeRate(fromCurrency: string, toCurrency: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('exchange_rates').select('*').eq('from_currency', fromCurrency).eq('to_currency', toCurrency).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateExchangeRate(fromCurrency: string, toCurrency: string, rate: number, provider?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('exchange_rates').upsert({ from_currency: fromCurrency, to_currency: toCurrency, rate, provider, updated_at: new Date().toISOString() }, { onConflict: 'from_currency,to_currency' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getExchangeRates(options?: { base_currency?: string; provider?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('exchange_rates').select('*'); if (options?.base_currency) query = query.eq('from_currency', options.base_currency); if (options?.provider) query = query.eq('provider', options.provider); const { data, error } = await query.order('from_currency', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createExchangeTransaction(txData: { user_id: string; from_currency: string; to_currency: string; from_amount: number; to_amount: number; rate: number; fee?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('exchange_transactions').insert({ ...txData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTransactionStatus(transactionId: string, status: string) {
  try { const supabase = await createClient(); const updates: any = { status, updated_at: new Date().toISOString() }; if (status === 'completed') updates.completed_at = new Date().toISOString(); const { data, error } = await supabase.from('exchange_transactions').update(updates).eq('id', transactionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserExchangeTransactions(userId: string, options?: { status?: string; from_currency?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('exchange_transactions').select('*').eq('user_id', userId); if (options?.status) query = query.eq('status', options.status); if (options?.from_currency) query = query.eq('from_currency', options.from_currency); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordRateHistory(historyData: { from_currency: string; to_currency: string; rate: number; high: number; low: number; date: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('exchange_history').insert({ ...historyData, recorded_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getExchangeHistory(fromCurrency: string, toCurrency: string, options?: { days?: number }) {
  try { const supabase = await createClient(); const daysAgo = options?.days || 30; const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; const { data, error } = await supabase.from('exchange_history').select('*').eq('from_currency', fromCurrency).eq('to_currency', toCurrency).gte('date', startDate).order('date', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getExchangeProviders(options?: { is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('exchange_providers').select('*'); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function convertCurrency(amount: number, fromCurrency: string, toCurrency: string) {
  try { const supabase = await createClient(); const { data: rate } = await supabase.from('exchange_rates').select('rate').eq('from_currency', fromCurrency).eq('to_currency', toCurrency).single(); if (!rate) throw new Error('Exchange rate not found'); const convertedAmount = amount * rate.rate; return { success: true, data: { from: { currency: fromCurrency, amount }, to: { currency: toCurrency, amount: convertedAmount }, rate: rate.rate } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
