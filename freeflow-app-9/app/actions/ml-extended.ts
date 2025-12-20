'use server'

/**
 * Extended ML (Machine Learning) Server Actions - Covers all 8 ML-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getMLAlerts(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ml_alerts').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createMLAlert(userId: string, input: { type: string; severity: string; message: string; data?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ml_alerts').insert({ user_id: userId, ...input, is_read: false }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function markMLAlertRead(alertId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ml_alerts').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', alertId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMLAnomalies(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ml_anomalies').select('*').eq('user_id', userId).order('detected_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createMLAnomaly(userId: string, input: { type: string; severity: string; description: string; data?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ml_anomalies').insert({ user_id: userId, ...input, detected_at: new Date().toISOString(), status: 'detected' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function resolveMLAnomaly(anomalyId: string, resolution?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ml_anomalies').update({ status: 'resolved', resolution, resolved_at: new Date().toISOString() }).eq('id', anomalyId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMLInsights(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ml_insights').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createMLInsight(userId: string, input: { type: string; title: string; description: string; confidence: number; data?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ml_insights').insert({ user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMLModels(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ml_models').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createMLModel(userId: string, input: { name: string; type: string; config?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ml_models').insert({ user_id: userId, ...input, status: 'created' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateMLModelStatus(modelId: string, status: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ml_models').update({ status, updated_at: new Date().toISOString() }).eq('id', modelId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMLPatterns(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ml_patterns').select('*').eq('user_id', userId).order('detected_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createMLPattern(userId: string, input: { type: string; name: string; description?: string; pattern_data: any; confidence: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ml_patterns').insert({ user_id: userId, ...input, detected_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMLPerformanceMetrics(modelId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ml_performance_metrics').select('*').eq('model_id', modelId).order('recorded_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordMLPerformanceMetric(modelId: string, metrics: { accuracy?: number; precision?: number; recall?: number; f1_score?: number; latency_ms?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ml_performance_metrics').insert({ model_id: modelId, ...metrics, recorded_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMLPredictions(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ml_predictions').select('*').eq('user_id', userId).order('predicted_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createMLPrediction(userId: string, modelId: string, input: { type: string; prediction: any; confidence: number; input_data?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ml_predictions').insert({ user_id: userId, model_id: modelId, ...input, predicted_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMLRecommendations(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ml_recommendations').select('*').eq('user_id', userId).eq('is_active', true).order('score', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createMLRecommendation(userId: string, input: { type: string; title: string; description: string; score: number; action_data?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ml_recommendations').insert({ user_id: userId, ...input, is_active: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function dismissMLRecommendation(recommendationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ml_recommendations').update({ is_active: false, dismissed_at: new Date().toISOString() }).eq('id', recommendationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function acceptMLRecommendation(recommendationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ml_recommendations').update({ status: 'accepted', accepted_at: new Date().toISOString() }).eq('id', recommendationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
