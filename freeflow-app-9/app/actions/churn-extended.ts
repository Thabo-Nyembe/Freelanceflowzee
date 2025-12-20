'use server'

/**
 * Extended Churn Server Actions
 * Tables: churn_predictions, churn_indicators, churn_analysis, churn_interventions
 */

import { createClient } from '@/lib/supabase/server'

export async function getChurnPrediction(predictionId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('churn_predictions').select('*, churn_indicators(*)').eq('id', predictionId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createChurnPrediction(predictionData: { customer_id: string; risk_score: number; risk_level: string; indicators?: Record<string, any>; predicted_churn_date?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('churn_predictions').insert({ ...predictionData, status: 'active', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateChurnPrediction(predictionId: string, updates: Partial<{ risk_score: number; risk_level: string; indicators: Record<string, any>; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('churn_predictions').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', predictionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getChurnPredictions(options?: { risk_level?: string; status?: string; min_score?: number; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('churn_predictions').select('*'); if (options?.risk_level) query = query.eq('risk_level', options.risk_level); if (options?.status) query = query.eq('status', options.status); if (options?.min_score) query = query.gte('risk_score', options.min_score); const { data, error } = await query.order('risk_score', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getHighRiskCustomers(options?: { threshold?: number; limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('churn_predictions').select('*').eq('status', 'active').gte('risk_score', options?.threshold || 70).order('risk_score', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createChurnIntervention(interventionData: { prediction_id: string; customer_id: string; intervention_type: string; description: string; assigned_to?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('churn_interventions').insert({ ...interventionData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateInterventionStatus(interventionId: string, status: string, outcome?: string) {
  try { const supabase = await createClient(); const updates: any = { status, updated_at: new Date().toISOString() }; if (outcome) updates.outcome = outcome; if (status === 'completed') updates.completed_at = new Date().toISOString(); const { data, error } = await supabase.from('churn_interventions').update(updates).eq('id', interventionId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getChurnAnalysis(options?: { date_from?: string; date_to?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('churn_analysis').select('*'); if (options?.date_from) query = query.gte('analysis_date', options.date_from); if (options?.date_to) query = query.lte('analysis_date', options.date_to); const { data, error } = await query.order('analysis_date', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordChurnIndicator(indicatorData: { prediction_id: string; indicator_name: string; indicator_value: number; weight?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('churn_indicators').insert({ ...indicatorData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
