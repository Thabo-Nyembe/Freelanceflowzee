'use server'

/**
 * Extended Forecasts Server Actions
 * Tables: forecasts, forecast_models, forecast_predictions, forecast_accuracy, forecast_scenarios
 */

import { createClient } from '@/lib/supabase/server'

export async function getForecast(forecastId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('forecasts').select('*, forecast_predictions(*), forecast_accuracy(*)').eq('id', forecastId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createForecast(forecastData: { name: string; type: string; model_id?: string; target_metric: string; start_date: string; end_date: string; created_by: string; parameters?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('forecasts').insert({ ...forecastData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateForecast(forecastId: string, updates: Partial<{ name: string; status: string; parameters: any; results: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('forecasts').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', forecastId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getForecasts(options?: { type?: string; status?: string; created_by?: string; target_metric?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('forecasts').select('*'); if (options?.type) query = query.eq('type', options.type); if (options?.status) query = query.eq('status', options.status); if (options?.created_by) query = query.eq('created_by', options.created_by); if (options?.target_metric) query = query.eq('target_metric', options.target_metric); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createForecastModel(modelData: { name: string; type: string; algorithm: string; parameters: any; training_data?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('forecast_models').insert({ ...modelData, is_active: true, version: 1, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getForecastModels(options?: { type?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('forecast_models').select('*'); if (options?.type) query = query.eq('type', options.type); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addPrediction(predictionData: { forecast_id: string; date: string; predicted_value: number; confidence_low?: number; confidence_high?: number; confidence_level?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('forecast_predictions').insert({ ...predictionData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPredictions(forecastId: string, options?: { from_date?: string; to_date?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('forecast_predictions').select('*').eq('forecast_id', forecastId); if (options?.from_date) query = query.gte('date', options.from_date); if (options?.to_date) query = query.lte('date', options.to_date); const { data, error } = await query.order('date', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordForecastAccuracy(accuracyData: { forecast_id: string; date: string; predicted_value: number; actual_value: number; error: number; error_percentage: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('forecast_accuracy').insert({ ...accuracyData, recorded_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getForecastAccuracy(forecastId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('forecast_accuracy').select('*').eq('forecast_id', forecastId).order('date', { ascending: true }); if (error) throw error; const avgError = data?.length ? data.reduce((sum, a) => sum + Math.abs(a.error_percentage), 0) / data.length : 0; return { success: true, data: { records: data || [], avgError } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createScenario(scenarioData: { forecast_id: string; name: string; description?: string; assumptions: any; adjustments: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('forecast_scenarios').insert({ ...scenarioData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getScenarios(forecastId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('forecast_scenarios').select('*').eq('forecast_id', forecastId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
