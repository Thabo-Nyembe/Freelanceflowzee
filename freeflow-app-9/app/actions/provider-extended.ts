'use server'

/**
 * Extended Provider Server Actions
 * Tables: providers, provider_services, provider_availability, provider_reviews
 */

import { createClient } from '@/lib/supabase/server'

export async function getProvider(providerId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('providers').select('*, provider_services(*)').eq('id', providerId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createProvider(providerData: { user_id: string; name: string; type?: string; description?: string; hourly_rate?: number; skills?: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('providers').insert({ ...providerData, status: 'pending', rating: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateProvider(providerId: string, updates: Partial<{ name: string; type: string; description: string; hourly_rate: number; skills: string[]; status: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('providers').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', providerId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteProvider(providerId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('providers').delete().eq('id', providerId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getProviders(options?: { type?: string; status?: string; min_rating?: number; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('providers').select('*'); if (options?.type) query = query.eq('type', options.type); if (options?.status) query = query.eq('status', options.status); if (options?.min_rating) query = query.gte('rating', options.min_rating); const { data, error } = await query.order('rating', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getProviderServices(providerId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('provider_services').select('*').eq('provider_id', providerId).eq('is_active', true).order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getProviderAvailability(providerId: string, options?: { date_from?: string; date_to?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('provider_availability').select('*').eq('provider_id', providerId); if (options?.date_from) query = query.gte('date', options.date_from); if (options?.date_to) query = query.lte('date', options.date_to); const { data, error } = await query.order('date', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getProviderReviews(providerId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('provider_reviews').select('*').eq('provider_id', providerId).order('created_at', { ascending: false }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addProviderReview(providerId: string, reviewData: { user_id: string; rating: number; comment?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('provider_reviews').insert({ provider_id: providerId, ...reviewData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
