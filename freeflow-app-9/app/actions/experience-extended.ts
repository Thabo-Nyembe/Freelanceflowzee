'use server'

/**
 * Extended Experience Server Actions
 * Tables: experiences, experience_ratings, experience_reviews, experience_bookings, experience_hosts
 */

import { createClient } from '@/lib/supabase/server'

export async function getExperience(experienceId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('experiences').select('*, experience_hosts(*), experience_reviews(*)').eq('id', experienceId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createExperience(experienceData: { host_id: string; title: string; description?: string; category?: string; location?: any; duration_minutes?: number; price?: number; max_participants?: number; images?: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('experiences').insert({ ...experienceData, status: 'draft', rating_avg: 0, review_count: 0, booking_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateExperience(experienceId: string, updates: Partial<{ title: string; description: string; category: string; location: any; duration_minutes: number; price: number; max_participants: number; status: string; images: string[] }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('experiences').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', experienceId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getExperiences(options?: { host_id?: string; category?: string; status?: string; location?: string; price_max?: number; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('experiences').select('*'); if (options?.host_id) query = query.eq('host_id', options.host_id); if (options?.category) query = query.eq('category', options.category); if (options?.status) query = query.eq('status', options.status); if (options?.price_max) query = query.lte('price', options.price_max); if (options?.search) query = query.ilike('title', `%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function bookExperience(bookingData: { experience_id: string; user_id: string; scheduled_date: string; scheduled_time?: string; participants: number; total_price: number; notes?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('experience_bookings').insert({ ...bookingData, status: 'pending', booked_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.rpc('increment_booking_count', { experience_id: bookingData.experience_id }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateBookingStatus(bookingId: string, status: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('experience_bookings').update({ status, updated_at: new Date().toISOString() }).eq('id', bookingId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getExperienceBookings(experienceId: string, options?: { status?: string; date_from?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('experience_bookings').select('*').eq('experience_id', experienceId); if (options?.status) query = query.eq('status', options.status); if (options?.date_from) query = query.gte('scheduled_date', options.date_from); const { data, error } = await query.order('scheduled_date', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getUserBookings(userId: string, options?: { status?: string; upcoming?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('experience_bookings').select('*, experiences(*)').eq('user_id', userId); if (options?.status) query = query.eq('status', options.status); if (options?.upcoming) query = query.gte('scheduled_date', new Date().toISOString().split('T')[0]); const { data, error } = await query.order('scheduled_date', { ascending: options?.upcoming ?? true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addExperienceReview(reviewData: { experience_id: string; user_id: string; booking_id?: string; rating: number; content?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('experience_reviews').insert({ ...reviewData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; const { data: reviews } = await supabase.from('experience_reviews').select('rating').eq('experience_id', reviewData.experience_id); const avgRating = reviews && reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0; await supabase.from('experiences').update({ rating_avg: avgRating, review_count: reviews?.length || 0 }).eq('id', reviewData.experience_id); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getExperienceReviews(experienceId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('experience_reviews').select('*').eq('experience_id', experienceId).order('created_at', { ascending: false }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
