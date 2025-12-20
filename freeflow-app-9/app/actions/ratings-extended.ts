'use server'

/**
 * Extended Ratings Server Actions
 * Tables: ratings, rating_criteria, rating_responses, rating_summaries, rating_reports, rating_settings
 */

import { createClient } from '@/lib/supabase/server'

export async function getRating(ratingId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ratings').select('*, rating_criteria(*), rating_responses(*), users(*)').eq('id', ratingId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createRating(ratingData: { entity_type: string; entity_id: string; user_id: string; rating: number; title?: string; review?: string; criteria_ratings?: { criteria_id: string; rating: number }[]; is_anonymous?: boolean }) {
  try { const supabase = await createClient(); const { criteria_ratings, ...ratingInfo } = ratingData; const { data: existing } = await supabase.from('ratings').select('id').eq('entity_type', ratingData.entity_type).eq('entity_id', ratingData.entity_id).eq('user_id', ratingData.user_id).single(); if (existing) return { success: false, error: 'You have already rated this item' }; const { data: rating, error: ratingError } = await supabase.from('ratings').insert({ ...ratingInfo, is_verified: false, helpful_count: 0, created_at: new Date().toISOString() }).select().single(); if (ratingError) throw ratingError; if (criteria_ratings && criteria_ratings.length > 0) { const responsesData = criteria_ratings.map(cr => ({ rating_id: rating.id, criteria_id: cr.criteria_id, rating: cr.rating, created_at: new Date().toISOString() })); await supabase.from('rating_responses').insert(responsesData) } await updateSummary(ratingData.entity_type, ratingData.entity_id); return { success: true, data: rating } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateRating(ratingId: string, updates: Partial<{ rating: number; title: string; review: string; criteria_ratings: { criteria_id: string; rating: number }[] }>) {
  try { const supabase = await createClient(); const { criteria_ratings, ...ratingUpdates } = updates; const { data: rating, error } = await supabase.from('ratings').update({ ...ratingUpdates, updated_at: new Date().toISOString() }).eq('id', ratingId).select().single(); if (error) throw error; if (criteria_ratings && criteria_ratings.length > 0) { await supabase.from('rating_responses').delete().eq('rating_id', ratingId); const responsesData = criteria_ratings.map(cr => ({ rating_id: ratingId, criteria_id: cr.criteria_id, rating: cr.rating, created_at: new Date().toISOString() })); await supabase.from('rating_responses').insert(responsesData) } await updateSummary(rating.entity_type, rating.entity_id); return { success: true, data: rating } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteRating(ratingId: string) {
  try { const supabase = await createClient(); const { data: rating } = await supabase.from('ratings').select('entity_type, entity_id').eq('id', ratingId).single(); await supabase.from('rating_responses').delete().eq('rating_id', ratingId); const { error } = await supabase.from('ratings').delete().eq('id', ratingId); if (error) throw error; if (rating) await updateSummary(rating.entity_type, rating.entity_id); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

async function updateSummary(entityType: string, entityId: string) {
  const supabase = await createClient()
  const { data: ratings } = await supabase.from('ratings').select('rating').eq('entity_type', entityType).eq('entity_id', entityId)
  if (!ratings || ratings.length === 0) {
    await supabase.from('rating_summaries').delete().eq('entity_type', entityType).eq('entity_id', entityId)
    return
  }
  const totalRatings = ratings.length
  const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
  const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  ratings.forEach(r => { distribution[Math.round(r.rating)] = (distribution[Math.round(r.rating)] || 0) + 1 })
  await supabase.from('rating_summaries').upsert({ entity_type: entityType, entity_id: entityId, total_ratings: totalRatings, average_rating: Math.round(averageRating * 10) / 10, distribution, updated_at: new Date().toISOString() }, { onConflict: 'entity_type,entity_id' })
}

export async function getRatings(options: { entity_type: string; entity_id: string; min_rating?: number; verified_only?: boolean; sort_by?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('ratings').select('*, rating_responses(*), users(*)').eq('entity_type', options.entity_type).eq('entity_id', options.entity_id); if (options.min_rating) query = query.gte('rating', options.min_rating); if (options.verified_only) query = query.eq('is_verified', true); let orderBy = 'created_at'; if (options.sort_by === 'helpful') orderBy = 'helpful_count'; else if (options.sort_by === 'rating_high') { query = query.order('rating', { ascending: false }) } else if (options.sort_by === 'rating_low') { query = query.order('rating', { ascending: true }) } if (options.sort_by !== 'rating_high' && options.sort_by !== 'rating_low') { query = query.order(orderBy, { ascending: false }) } const { data, error } = await query.limit(options.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSummary(entityType: string, entityId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('rating_summaries').select('*').eq('entity_type', entityType).eq('entity_id', entityId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data: data || { total_ratings: 0, average_rating: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCriteria(entityType: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('rating_criteria').select('*').eq('entity_type', entityType).eq('is_active', true).order('order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createCriteria(criteriaData: { entity_type: string; name: string; description?: string; weight?: number; order?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('rating_criteria').insert({ ...criteriaData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function markHelpful(ratingId: string, userId: string) {
  try { const supabase = await createClient(); await supabase.from('ratings').update({ helpful_count: supabase.sql`helpful_count + 1` }).eq('id', ratingId); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function reportRating(ratingId: string, reportData: { reporter_id: string; reason: string; details?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('rating_reports').insert({ rating_id: ratingId, ...reportData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserRating(entityType: string, entityId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ratings').select('*, rating_responses(*)').eq('entity_type', entityType).eq('entity_id', entityId).eq('user_id', userId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function verifyRating(ratingId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('ratings').update({ is_verified: true, verified_at: new Date().toISOString() }).eq('id', ratingId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTopRated(entityType: string, options?: { min_ratings?: number; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('rating_summaries').select('*').eq('entity_type', entityType); if (options?.min_ratings) query = query.gte('total_ratings', options.min_ratings); const { data, error } = await query.order('average_rating', { ascending: false }).limit(options?.limit || 10); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUserRatings(userId: string, options?: { entity_type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('ratings').select('*').eq('user_id', userId); if (options?.entity_type) query = query.eq('entity_type', options.entity_type); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
