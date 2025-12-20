'use server'

/**
 * Extended Rate Server Actions
 * Tables: rates, rate_limits, rate_cards, rate_history
 */

import { createClient } from '@/lib/supabase/server'

export async function getRate(rateId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('rates').select('*').eq('id', rateId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createRate(rateData: { name: string; type: string; value: number; currency?: string; unit?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('rates').insert({ ...rateData, is_active: rateData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateRate(rateId: string, updates: Partial<{ name: string; type: string; value: number; currency: string; unit: string; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('rates').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', rateId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteRate(rateId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('rates').delete().eq('id', rateId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRates(options?: { type?: string; is_active?: boolean; currency?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('rates').select('*'); if (options?.type) query = query.eq('type', options.type); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.currency) query = query.eq('currency', options.currency); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRateLimits(options?: { endpoint?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('rate_limits').select('*'); if (options?.endpoint) query = query.eq('endpoint', options.endpoint); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('endpoint', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRateCards(options?: { type?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('rate_cards').select('*, rates(*)'); if (options?.type) query = query.eq('type', options.type); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRateHistory(rateId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('rate_history').select('*').eq('rate_id', rateId).order('changed_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
