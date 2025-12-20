'use server'

/**
 * Extended Forecast Server Actions
 * Tables: forecasts, forecast_models, forecast_scenarios, forecast_adjustments
 */

import { createClient } from '@/lib/supabase/server'

export async function getForecast(forecastId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('forecasts').select('*').eq('id', forecastId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createForecast(forecastData: { user_id: string; name: string; type: string; model_id?: string; start_date: string; end_date: string; parameters?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('forecasts').insert({ ...forecastData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateForecast(forecastId: string, updates: Partial<{ name: string; status: string; parameters: Record<string, any>; results: Record<string, any> }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('forecasts').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', forecastId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteForecast(forecastId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('forecasts').delete().eq('id', forecastId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getForecasts(options?: { user_id?: string; type?: string; status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('forecasts').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.type) query = query.eq('type', options.type); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getForecastModels(options?: { type?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('forecast_models').select('*'); if (options?.type) query = query.eq('type', options.type); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getForecastScenarios(forecastId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('forecast_scenarios').select('*').eq('forecast_id', forecastId).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function runForecast(forecastId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('forecasts').update({ status: 'running', started_at: new Date().toISOString() }).eq('id', forecastId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
