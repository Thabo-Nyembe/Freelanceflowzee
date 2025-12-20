'use server'

/**
 * Extended Trend Server Actions
 * Tables: trends, trend_data, trend_alerts, trend_forecasts
 */

import { createClient } from '@/lib/supabase/server'

export async function getTrend(trendId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('trends').select('*').eq('id', trendId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createTrend(trendData: { name: string; metric_type: string; description?: string; threshold?: number; is_active?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('trends').insert({ ...trendData, is_active: trendData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTrend(trendId: string, updates: Partial<{ name: string; description: string; threshold: number; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('trends').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', trendId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTrends(options?: { metric_type?: string; is_active?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('trends').select('*'); if (options?.metric_type) query = query.eq('metric_type', options.metric_type); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTrendData(trendId: string, options?: { days?: number }) {
  try { const supabase = await createClient(); const since = new Date(); since.setDate(since.getDate() - (options?.days || 30)); const { data, error } = await supabase.from('trend_data').select('*').eq('trend_id', trendId).gte('recorded_at', since.toISOString()).order('recorded_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordTrendData(trendId: string, value: number, metadata?: Record<string, any>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('trend_data').insert({ trend_id: trendId, value, metadata, recorded_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTrendAlerts(options?: { trend_id?: string; is_acknowledged?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('trend_alerts').select('*'); if (options?.trend_id) query = query.eq('trend_id', options.trend_id); if (options?.is_acknowledged !== undefined) query = query.eq('is_acknowledged', options.is_acknowledged); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTrendForecasts(trendId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('trend_forecasts').select('*').eq('trend_id', trendId).order('forecast_date', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
