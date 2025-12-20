'use server'

/**
 * Extended Feature Server Actions
 * Tables: features, feature_flags, feature_requests, feature_votes, feature_releases
 */

import { createClient } from '@/lib/supabase/server'

export async function getFeature(featureId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('features').select('*, feature_votes(*)').eq('id', featureId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createFeature(featureData: { name: string; description?: string; category?: string; priority?: string; status?: string; owner_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('features').insert({ ...featureData, status: featureData.status || 'planned', vote_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateFeature(featureId: string, updates: Partial<{ name: string; description: string; category: string; priority: string; status: string; owner_id: string; release_id: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('features').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', featureId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFeatures(options?: { category?: string; status?: string; priority?: string; owner_id?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('features').select('*'); if (options?.category) query = query.eq('category', options.category); if (options?.status) query = query.eq('status', options.status); if (options?.priority) query = query.eq('priority', options.priority); if (options?.owner_id) query = query.eq('owner_id', options.owner_id); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getFeatureFlag(flagKey: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('feature_flags').select('*').eq('key', flagKey).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createFeatureFlag(flagData: { key: string; name: string; description?: string; is_enabled?: boolean; rollout_percentage?: number; conditions?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('feature_flags').insert({ ...flagData, is_enabled: flagData.is_enabled ?? false, rollout_percentage: flagData.rollout_percentage ?? 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function toggleFeatureFlag(flagKey: string, isEnabled: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('feature_flags').update({ is_enabled: isEnabled, updated_at: new Date().toISOString() }).eq('key', flagKey).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createFeatureRequest(requestData: { user_id: string; title: string; description: string; category?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('feature_requests').insert({ ...requestData, status: 'submitted', vote_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFeatureRequests(options?: { status?: string; category?: string; user_id?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('feature_requests').select('*'); if (options?.status) query = query.eq('status', options.status); if (options?.category) query = query.eq('category', options.category); if (options?.user_id) query = query.eq('user_id', options.user_id); const { data, error } = await query.order('vote_count', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function voteForFeature(featureId: string, userId: string, voteType?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('feature_votes').insert({ feature_id: featureId, user_id: userId, vote_type: voteType || 'upvote', voted_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.rpc('increment_feature_votes', { feature_id: featureId }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFeatureReleases(options?: { status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('feature_releases').select('*, features(*)'); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('release_date', { ascending: false }).limit(options?.limit || 20); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
