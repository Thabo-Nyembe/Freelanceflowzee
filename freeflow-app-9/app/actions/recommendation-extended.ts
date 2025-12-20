'use server'

/**
 * Extended Recommendation Server Actions - Covers all Recommendation-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getRecommendations(userId: string, type?: string) {
  try { const supabase = await createClient(); let query = supabase.from('recommendations').select('*').eq('user_id', userId).order('score', { ascending: false }); if (type) query = query.eq('type', type); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createRecommendation(userId: string, input: { type: string; item_id: string; item_type: string; score: number; reason?: string; engine_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('recommendations').insert({ user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function dismissRecommendation(recommendationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('recommendations').update({ is_dismissed: true, dismissed_at: new Date().toISOString() }).eq('id', recommendationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function markRecommendationViewed(recommendationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('recommendations').update({ is_viewed: true, viewed_at: new Date().toISOString() }).eq('id', recommendationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function markRecommendationActedOn(recommendationId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('recommendations').update({ is_acted_on: true, acted_on_at: new Date().toISOString() }).eq('id', recommendationId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRecommendationEngines(activeOnly = true) {
  try { const supabase = await createClient(); let query = supabase.from('recommendation_engines').select('*').order('name', { ascending: true }); if (activeOnly) query = query.eq('is_active', true); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createRecommendationEngine(input: { name: string; type: string; algorithm: string; config?: any; description?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('recommendation_engines').insert({ ...input, is_active: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateRecommendationEngine(engineId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('recommendation_engines').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', engineId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function toggleRecommendationEngine(engineId: string, isActive: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('recommendation_engines').update({ is_active: isActive }).eq('id', engineId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getRecommendationFeedback(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('recommendation_feedback').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function submitRecommendationFeedback(userId: string, recommendationId: string, input: { rating: number; feedback_type: string; comment?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('recommendation_feedback').insert({ user_id: userId, recommendation_id: recommendationId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function analyzeRecommendationEffectiveness(engineId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('recommendation_feedback').select('rating, feedback_type').eq('engine_id', engineId); if (error) throw error; const avgRating = data?.length ? data.reduce((sum, f) => sum + f.rating, 0) / data.length : 0; return { success: true, data: { total_feedback: data?.length || 0, average_rating: avgRating } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
