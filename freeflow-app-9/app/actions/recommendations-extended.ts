'use server'

/**
 * Extended Recommendations Server Actions
 * Tables: recommendations, recommendation_models, recommendation_scores, recommendation_feedback, recommendation_settings
 */

import { createClient } from '@/lib/supabase/server'

export async function getRecommendation(recommendationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('recommendations').select('*, recommendation_models(*), users(*), recommendation_feedback(*)').eq('id', recommendationId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createRecommendation(recommendationData: { user_id: string; entity_type: string; entity_id: string; model_id?: string; score: number; reason?: string; context?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('recommendations').insert({ ...recommendationData, status: 'active', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createBulkRecommendations(recommendations: { user_id: string; entity_type: string; entity_id: string; model_id?: string; score: number; reason?: string }[]) {
  try { const supabase = await createClient(); const data = recommendations.map(r => ({ ...r, status: 'active', created_at: new Date().toISOString() })); const { error } = await supabase.from('recommendations').insert(data); if (error) throw error; return { success: true, count: recommendations.length } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function dismissRecommendation(recommendationId: string, userId: string, reason?: string) {
  try { const supabase = await createClient(); const { error: updateError } = await supabase.from('recommendations').update({ status: 'dismissed', dismissed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', recommendationId); if (updateError) throw updateError; await supabase.from('recommendation_feedback').insert({ recommendation_id: recommendationId, user_id: userId, feedback_type: 'dismissed', reason, created_at: new Date().toISOString() }); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function acceptRecommendation(recommendationId: string, userId: string) {
  try { const supabase = await createClient(); const { error: updateError } = await supabase.from('recommendations').update({ status: 'accepted', accepted_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', recommendationId); if (updateError) throw updateError; await supabase.from('recommendation_feedback').insert({ recommendation_id: recommendationId, user_id: userId, feedback_type: 'accepted', created_at: new Date().toISOString() }); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRecommendations(options: { user_id: string; entity_type?: string; model_id?: string; status?: string; min_score?: number; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('recommendations').select('*').eq('user_id', options.user_id); if (options.entity_type) query = query.eq('entity_type', options.entity_type); if (options.model_id) query = query.eq('model_id', options.model_id); if (options.status) query = query.eq('status', options.status); else query = query.eq('status', 'active'); if (options.min_score) query = query.gte('score', options.min_score); const { data, error } = await query.order('score', { ascending: false }).limit(options.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTopRecommendations(userId: string, entityType: string, limit?: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('recommendations').select('*').eq('user_id', userId).eq('entity_type', entityType).eq('status', 'active').order('score', { ascending: false }).limit(limit || 10); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRecommendationModels(options?: { type?: string; is_active?: boolean }) {
  try { const supabase = await createClient(); let query = supabase.from('recommendation_models').select('*'); if (options?.type) query = query.eq('type', options.type); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); const { data, error } = await query.order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createRecommendationModel(modelData: { name: string; type: string; description?: string; algorithm?: string; parameters?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('recommendation_models').insert({ ...modelData, is_active: true, version: 1, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function recordFeedback(feedbackData: { recommendation_id: string; user_id: string; feedback_type: 'clicked' | 'viewed' | 'converted' | 'dismissed' | 'liked' | 'disliked'; rating?: number; comment?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('recommendation_feedback').insert({ ...feedbackData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; if (feedbackData.feedback_type === 'converted') { await supabase.from('recommendations').update({ status: 'converted', converted_at: new Date().toISOString() }).eq('id', feedbackData.recommendation_id) } return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRecommendationFeedback(recommendationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('recommendation_feedback').select('*, users(*)').eq('recommendation_id', recommendationId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getRecommendationStats(options?: { model_id?: string; entity_type?: string; from_date?: string; to_date?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('recommendations').select('status, entity_type'); if (options?.model_id) query = query.eq('model_id', options.model_id); if (options?.entity_type) query = query.eq('entity_type', options.entity_type); if (options?.from_date) query = query.gte('created_at', options.from_date); if (options?.to_date) query = query.lte('created_at', options.to_date); const { data } = await query; const recommendations = data || []; const total = recommendations.length; const active = recommendations.filter(r => r.status === 'active').length; const accepted = recommendations.filter(r => r.status === 'accepted').length; const dismissed = recommendations.filter(r => r.status === 'dismissed').length; const converted = recommendations.filter(r => r.status === 'converted').length; const acceptanceRate = total > 0 ? Math.round((accepted / total) * 100) : 0; const conversionRate = accepted > 0 ? Math.round((converted / accepted) * 100) : 0; return { success: true, data: { total, active, accepted, dismissed, converted, acceptanceRate, conversionRate } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function refreshRecommendations(userId: string, entityType: string) {
  try { const supabase = await createClient(); await supabase.from('recommendations').update({ status: 'expired', updated_at: new Date().toISOString() }).eq('user_id', userId).eq('entity_type', entityType).eq('status', 'active'); return { success: true, message: 'Recommendations marked for refresh' } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSimilarItems(entityType: string, entityId: string, limit?: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('recommendation_scores').select('*, target:target_entity_id(*)').eq('source_entity_type', entityType).eq('source_entity_id', entityId).order('similarity_score', { ascending: false }).limit(limit || 10); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
