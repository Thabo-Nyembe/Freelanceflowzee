/**
 * ML Insights Query Library
 */

import { createClient } from '@/lib/supabase/client'
import type { JsonValue } from '@/lib/types/database'

export type InsightType = 'trend' | 'anomaly' | 'forecast' | 'pattern' | 'recommendation' | 'alert'
export type MetricCategory = 'revenue' | 'users' | 'performance' | 'engagement' | 'conversion' | 'retention' | 'churn'
export type PredictionConfidence = 'low' | 'medium' | 'high' | 'very-high'
export type AlertSeverity = 'info' | 'warning' | 'critical'
export type TrendDirection = 'up' | 'down' | 'stable'
export type PatternFrequency = 'daily' | 'weekly' | 'monthly' | 'seasonal'
export type MLAlgorithm = 'linear-regression' | 'random-forest' | 'neural-network' | 'time-series'
export type ActionStatus = 'pending' | 'in-progress' | 'completed' | 'dismissed'

export interface MLInsight {
  id: string
  user_id: string
  type: InsightType
  category: MetricCategory
  title: string
  description: string
  confidence: PredictionConfidence
  impact: string
  is_actionable: boolean
  recommendations: string[]
  affected_metrics: string[]
  data_points: number
  accuracy: number
  detected_at: string
  expires_at?: string
  created_at: string
  updated_at: string
}

export interface MLModel {
  id: string
  user_id: string
  name: string
  category: MetricCategory
  algorithm: MLAlgorithm
  accuracy: number
  features: string[]
  mse: number
  rmse: number
  mae: number
  r2_score: number
  last_trained: string
  created_at: string
  updated_at: string
}

export interface MLPrediction {
  id: string
  model_id: string
  user_id: string
  prediction_date: string
  predicted_value: number
  confidence_lower?: number
  confidence_upper?: number
  actual_value?: number
  error?: number
  created_at: string
}

export interface MLAnomaly {
  id: string
  user_id: string
  metric: string
  category: MetricCategory
  expected_value: number
  actual_value: number
  deviation: number
  severity: AlertSeverity
  description: string
  possible_causes: string[]
  recommended_actions: string[]
  is_resolved: boolean
  detected_at: string
  resolved_at?: string
  created_at: string
  updated_at: string
}

export interface MLPattern {
  id: string
  user_id: string
  name: string
  category: MetricCategory
  description: string
  frequency: PatternFrequency
  confidence: PredictionConfidence
  occurrences: JsonValue[]
  next_occurrence_date?: string
  next_occurrence_probability?: number
  insights: string[]
  created_at: string
  updated_at: string
}

export interface MLRecommendation {
  id: string
  user_id: string
  category: MetricCategory
  title: string
  description: string
  priority: string
  expected_metric?: string
  expected_improvement?: number
  expected_timeframe?: string
  based_on: string[]
  confidence: PredictionConfidence
  is_dismissed: boolean
  created_at: string
  updated_at: string
}

export interface RecommendationAction {
  id: string
  recommendation_id: string
  title: string
  description: string
  effort: string
  impact: string
  status: ActionStatus
  action_order: number
  created_at: string
  updated_at: string
}

export interface MLAlert {
  id: string
  user_id: string
  type: InsightType
  severity: AlertSeverity
  metric: string
  category: MetricCategory
  message: string
  details?: string
  threshold?: number
  actual_value?: number
  is_acknowledged: boolean
  actions: string[]
  triggered_at: string
  acknowledged_at?: string
  created_at: string
  updated_at: string
}

// INSIGHTS
export async function getMLInsights(userId: string, filters?: { type?: InsightType; category?: MetricCategory }) {
  const supabase = createClient()
  let query = supabase.from('ml_insights').select('*').eq('user_id', userId).order('detected_at', { ascending: false })
  if (filters?.type) query = query.eq('type', filters.type)
  if (filters?.category) query = query.eq('category', filters.category)
  return await query
}

export async function createMLInsight(userId: string, insight: Partial<MLInsight>) {
  const supabase = createClient()
  return await supabase.from('ml_insights').insert({ user_id: userId, ...insight }).select().single()
}

export async function deleteMLInsight(insightId: string) {
  const supabase = createClient()
  return await supabase.from('ml_insights').delete().eq('id', insightId)
}

// MODELS
export async function getMLModels(userId: string, filters?: { category?: MetricCategory; algorithm?: MLAlgorithm }) {
  const supabase = createClient()
  let query = supabase.from('ml_models').select('*').eq('user_id', userId).order('last_trained', { ascending: false })
  if (filters?.category) query = query.eq('category', filters.category)
  if (filters?.algorithm) query = query.eq('algorithm', filters.algorithm)
  return await query
}

export async function createMLModel(userId: string, model: Partial<MLModel>) {
  const supabase = createClient()
  return await supabase.from('ml_models').insert({ user_id: userId, ...model }).select().single()
}

export async function updateMLModel(modelId: string, updates: Partial<MLModel>) {
  const supabase = createClient()
  return await supabase.from('ml_models').update(updates).eq('id', modelId).select().single()
}

export async function deleteMLModel(modelId: string) {
  const supabase = createClient()
  return await supabase.from('ml_models').delete().eq('id', modelId)
}

// PREDICTIONS
export async function getMLPredictions(modelId: string) {
  const supabase = createClient()
  return await supabase.from('ml_predictions').select('*').eq('model_id', modelId).order('prediction_date', { ascending: false })
}

export async function createMLPrediction(modelId: string, userId: string, prediction: Partial<MLPrediction>) {
  const supabase = createClient()
  return await supabase.from('ml_predictions').insert({ model_id: modelId, user_id: userId, ...prediction }).select().single()
}

// ANOMALIES
export async function getMLAnomalies(userId: string, filters?: { category?: MetricCategory; severity?: AlertSeverity; resolved?: boolean }) {
  const supabase = createClient()
  let query = supabase.from('ml_anomalies').select('*').eq('user_id', userId).order('detected_at', { ascending: false })
  if (filters?.category) query = query.eq('category', filters.category)
  if (filters?.severity) query = query.eq('severity', filters.severity)
  if (filters?.resolved !== undefined) query = query.eq('is_resolved', filters.resolved)
  return await query
}

export async function createMLAnomaly(userId: string, anomaly: Partial<MLAnomaly>) {
  const supabase = createClient()
  return await supabase.from('ml_anomalies').insert({ user_id: userId, ...anomaly }).select().single()
}

export async function resolveAnomaly(anomalyId: string) {
  const supabase = createClient()
  return await supabase.from('ml_anomalies').update({ is_resolved: true }).eq('id', anomalyId).select().single()
}

export async function deleteMLAnomaly(anomalyId: string) {
  const supabase = createClient()
  return await supabase.from('ml_anomalies').delete().eq('id', anomalyId)
}

// PATTERNS
export async function getMLPatterns(userId: string, filters?: { category?: MetricCategory; frequency?: PatternFrequency }) {
  const supabase = createClient()
  let query = supabase.from('ml_patterns').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (filters?.category) query = query.eq('category', filters.category)
  if (filters?.frequency) query = query.eq('frequency', filters.frequency)
  return await query
}

export async function createMLPattern(userId: string, pattern: Partial<MLPattern>) {
  const supabase = createClient()
  return await supabase.from('ml_patterns').insert({ user_id: userId, ...pattern }).select().single()
}

export async function deleteMLPattern(patternId: string) {
  const supabase = createClient()
  return await supabase.from('ml_patterns').delete().eq('id', patternId)
}

// RECOMMENDATIONS
export async function getMLRecommendations(userId: string, filters?: { category?: MetricCategory; dismissed?: boolean }) {
  const supabase = createClient()
  let query = supabase.from('ml_recommendations').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (filters?.category) query = query.eq('category', filters.category)
  if (filters?.dismissed !== undefined) query = query.eq('is_dismissed', filters.dismissed)
  return await query
}

export async function createMLRecommendation(userId: string, recommendation: Partial<MLRecommendation>) {
  const supabase = createClient()
  return await supabase.from('ml_recommendations').insert({ user_id: userId, ...recommendation }).select().single()
}

export async function dismissRecommendation(recommendationId: string) {
  const supabase = createClient()
  return await supabase.from('ml_recommendations').update({ is_dismissed: true }).eq('id', recommendationId).select().single()
}

export async function deleteMLRecommendation(recommendationId: string) {
  const supabase = createClient()
  return await supabase.from('ml_recommendations').delete().eq('id', recommendationId)
}

// RECOMMENDATION ACTIONS
export async function getRecommendationActions(recommendationId: string) {
  const supabase = createClient()
  return await supabase.from('recommendation_actions').select('*').eq('recommendation_id', recommendationId).order('action_order')
}

export async function createRecommendationAction(recommendationId: string, action: Partial<RecommendationAction>) {
  const supabase = createClient()
  return await supabase.from('recommendation_actions').insert({ recommendation_id: recommendationId, ...action }).select().single()
}

export async function updateActionStatus(actionId: string, status: ActionStatus) {
  const supabase = createClient()
  return await supabase.from('recommendation_actions').update({ status }).eq('id', actionId).select().single()
}

// ALERTS
export async function getMLAlerts(userId: string, filters?: { severity?: AlertSeverity; acknowledged?: boolean }) {
  const supabase = createClient()
  let query = supabase.from('ml_alerts').select('*').eq('user_id', userId).order('triggered_at', { ascending: false })
  if (filters?.severity) query = query.eq('severity', filters.severity)
  if (filters?.acknowledged !== undefined) query = query.eq('is_acknowledged', filters.acknowledged)
  return await query
}

export async function createMLAlert(userId: string, alert: Partial<MLAlert>) {
  const supabase = createClient()
  return await supabase.from('ml_alerts').insert({ user_id: userId, ...alert }).select().single()
}

export async function acknowledgeAlert(alertId: string) {
  const supabase = createClient()
  return await supabase.from('ml_alerts').update({ is_acknowledged: true }).eq('id', alertId).select().single()
}

export async function deleteMLAlert(alertId: string) {
  const supabase = createClient()
  return await supabase.from('ml_alerts').delete().eq('id', alertId)
}

// STATS
export async function getMLStats(userId: string) {
  const supabase = createClient()
  const [insightsResult, modelsResult, anomaliesResult, recommendationsResult, alertsResult] = await Promise.all([
    supabase.from('ml_insights').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('ml_models').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('ml_anomalies').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('is_resolved', false),
    supabase.from('ml_recommendations').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('is_dismissed', false),
    supabase.from('ml_alerts').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('is_acknowledged', false)
  ])

  return {
    data: {
      total_insights: insightsResult.count || 0,
      total_models: modelsResult.count || 0,
      active_anomalies: anomaliesResult.count || 0,
      active_recommendations: recommendationsResult.count || 0,
      unread_alerts: alertsResult.count || 0
    },
    error: insightsResult.error || modelsResult.error || anomaliesResult.error || recommendationsResult.error || alertsResult.error
  }
}
