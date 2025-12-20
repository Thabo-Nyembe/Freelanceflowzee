'use server'

/**
 * Extended Reviews Server Actions
 * Tables: reviews, review_responses, review_votes, review_reports, review_media, review_summaries
 */

import { createClient } from '@/lib/supabase/server'

export async function getReview(reviewId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('reviews').select('*, review_responses(*), review_votes(*), review_media(*), users(*)').eq('id', reviewId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createReview(reviewData: { entity_type: string; entity_id: string; user_id: string; rating: number; title?: string; content: string; pros?: string[]; cons?: string[]; is_verified_purchase?: boolean; media?: { type: string; url: string }[] }) {
  try { const supabase = await createClient(); const { media, ...reviewInfo } = reviewData; const { data: existing } = await supabase.from('reviews').select('id').eq('entity_type', reviewData.entity_type).eq('entity_id', reviewData.entity_id).eq('user_id', reviewData.user_id).single(); if (existing) return { success: false, error: 'You have already reviewed this item' }; const { data: review, error: reviewError } = await supabase.from('reviews').insert({ ...reviewInfo, status: 'published', helpful_count: 0, created_at: new Date().toISOString() }).select().single(); if (reviewError) throw reviewError; if (media && media.length > 0) { const mediaData = media.map(m => ({ review_id: review.id, ...m, created_at: new Date().toISOString() })); await supabase.from('review_media').insert(mediaData) } await updateReviewSummary(reviewData.entity_type, reviewData.entity_id); return { success: true, data: review } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateReview(reviewId: string, updates: Partial<{ rating: number; title: string; content: string; pros: string[]; cons: string[] }>) {
  try { const supabase = await createClient(); const { data: review, error } = await supabase.from('reviews').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', reviewId).select().single(); if (error) throw error; await updateReviewSummary(review.entity_type, review.entity_id); return { success: true, data: review } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteReview(reviewId: string) {
  try { const supabase = await createClient(); const { data: review } = await supabase.from('reviews').select('entity_type, entity_id').eq('id', reviewId).single(); await supabase.from('review_media').delete().eq('review_id', reviewId); await supabase.from('review_votes').delete().eq('review_id', reviewId); await supabase.from('review_responses').delete().eq('review_id', reviewId); const { error } = await supabase.from('reviews').delete().eq('id', reviewId); if (error) throw error; if (review) await updateReviewSummary(review.entity_type, review.entity_id); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

async function updateReviewSummary(entityType: string, entityId: string) {
  const supabase = await createClient()
  const { data: reviews } = await supabase.from('reviews').select('rating').eq('entity_type', entityType).eq('entity_id', entityId).eq('status', 'published')
  if (!reviews || reviews.length === 0) {
    await supabase.from('review_summaries').delete().eq('entity_type', entityType).eq('entity_id', entityId)
    return
  }
  const totalReviews = reviews.length
  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
  const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  reviews.forEach(r => { distribution[Math.round(r.rating)] = (distribution[Math.round(r.rating)] || 0) + 1 })
  await supabase.from('review_summaries').upsert({ entity_type: entityType, entity_id: entityId, total_reviews: totalReviews, average_rating: Math.round(averageRating * 10) / 10, distribution, updated_at: new Date().toISOString() }, { onConflict: 'entity_type,entity_id' })
}

export async function getReviews(options: { entity_type: string; entity_id: string; min_rating?: number; verified_only?: boolean; with_media?: boolean; sort_by?: 'recent' | 'helpful' | 'rating_high' | 'rating_low'; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('reviews').select('*, review_media(*), review_responses(*), users(*)').eq('entity_type', options.entity_type).eq('entity_id', options.entity_id).eq('status', 'published'); if (options.min_rating) query = query.gte('rating', options.min_rating); if (options.verified_only) query = query.eq('is_verified_purchase', true); if (options.with_media) query = query.not('review_media', 'is', null); let orderBy = 'created_at'; let ascending = false; if (options.sort_by === 'helpful') orderBy = 'helpful_count'; else if (options.sort_by === 'rating_high') { orderBy = 'rating'; ascending = false } else if (options.sort_by === 'rating_low') { orderBy = 'rating'; ascending = true } const { data, error } = await query.order(orderBy, { ascending }).limit(options.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function voteReview(reviewId: string, userId: string, isHelpful: boolean) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('review_votes').select('id, is_helpful').eq('review_id', reviewId).eq('user_id', userId).single(); if (existing) { if (existing.is_helpful === isHelpful) { await supabase.from('review_votes').delete().eq('id', existing.id); await updateHelpfulCount(reviewId); return { success: true, removed: true } } await supabase.from('review_votes').update({ is_helpful: isHelpful, updated_at: new Date().toISOString() }).eq('id', existing.id); await updateHelpfulCount(reviewId); return { success: true, updated: true } } await supabase.from('review_votes').insert({ review_id: reviewId, user_id: userId, is_helpful: isHelpful, created_at: new Date().toISOString() }); await updateHelpfulCount(reviewId); return { success: true, created: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

async function updateHelpfulCount(reviewId: string) {
  const supabase = await createClient()
  const { count } = await supabase.from('review_votes').select('*', { count: 'exact', head: true }).eq('review_id', reviewId).eq('is_helpful', true)
  await supabase.from('reviews').update({ helpful_count: count || 0 }).eq('id', reviewId)
}

export async function respondToReview(reviewId: string, responseData: { user_id: string; content: string; is_official?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('review_responses').insert({ review_id: reviewId, ...responseData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function reportReview(reviewId: string, reportData: { reporter_id: string; reason: string; details?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('review_reports').insert({ review_id: reviewId, ...reportData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getReviewSummary(entityType: string, entityId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('review_summaries').select('*').eq('entity_type', entityType).eq('entity_id', entityId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data: data || { total_reviews: 0, average_rating: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserReview(entityType: string, entityId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('reviews').select('*, review_media(*)').eq('entity_type', entityType).eq('entity_id', entityId).eq('user_id', userId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMyReviews(userId: string, options?: { entity_type?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('reviews').select('*, review_media(*), review_responses(count)').eq('user_id', userId); if (options?.entity_type) query = query.eq('entity_type', options.entity_type); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTopReviewed(entityType: string, options?: { min_reviews?: number; min_rating?: number; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('review_summaries').select('*').eq('entity_type', entityType); if (options?.min_reviews) query = query.gte('total_reviews', options.min_reviews); if (options?.min_rating) query = query.gte('average_rating', options.min_rating); const { data, error } = await query.order('average_rating', { ascending: false }).order('total_reviews', { ascending: false }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
