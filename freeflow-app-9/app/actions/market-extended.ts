'use server'

/**
 * Extended Market Server Actions
 * Tables: markets, market_data, market_analysis, market_trends
 */

import { createClient } from '@/lib/supabase/server'

export async function getMarket(marketId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('markets').select('*').eq('id', marketId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createMarket(marketData: { name: string; type?: string; region?: string; currency?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('markets').insert({ ...marketData, is_active: marketData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateMarket(marketId: string, updates: Partial<{ name: string; type: string; region: string; currency: string; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('markets').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', marketId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMarkets(options?: { type?: string; region?: string; is_active?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('markets').select('*'); if (options?.type) query = query.eq('type', options.type); if (options?.region) query = query.eq('region', options.region); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getMarketData(marketId: string, options?: { date_from?: string; date_to?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('market_data').select('*').eq('market_id', marketId); if (options?.date_from) query = query.gte('recorded_at', options.date_from); if (options?.date_to) query = query.lte('recorded_at', options.date_to); const { data, error } = await query.order('recorded_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getMarketAnalysis(marketId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('market_analysis').select('*').eq('market_id', marketId).order('analyzed_at', { ascending: false }).limit(1).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMarketTrends(options?: { market_id?: string; type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('market_trends').select('*'); if (options?.market_id) query = query.eq('market_id', options.market_id); if (options?.type) query = query.eq('type', options.type); const { data, error } = await query.order('trend_score', { ascending: false }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
