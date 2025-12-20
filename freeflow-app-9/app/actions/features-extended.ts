'use server'

/**
 * Extended Features Server Actions
 * Tables: features, feature_flags, feature_requests, feature_usage
 */

import { createClient } from '@/lib/supabase/server'

export async function getFeature(featureId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('features').select('*').eq('id', featureId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createFeature(featureData: { name: string; description?: string; key: string; is_enabled?: boolean; rollout_percentage?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('features').insert({ ...featureData, is_enabled: featureData.is_enabled ?? false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateFeature(featureId: string, updates: Partial<{ name: string; description: string; is_enabled: boolean; rollout_percentage: number }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('features').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', featureId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteFeature(featureId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('features').delete().eq('id', featureId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFeatures(options?: { is_enabled?: boolean; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('features').select('*'); if (options?.is_enabled !== undefined) query = query.eq('is_enabled', options.is_enabled); const { data, error } = await query.order('name', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getFeatureFlags(options?: { user_id?: string; environment?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('feature_flags').select('*, features(*)'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.environment) query = query.eq('environment', options.environment); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function toggleFeature(featureId: string, isEnabled: boolean) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('features').update({ is_enabled: isEnabled, updated_at: new Date().toISOString() }).eq('id', featureId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFeatureRequests(options?: { status?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('feature_requests').select('*'); if (options?.status) query = query.eq('status', options.status); const { data, error } = await query.order('votes', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function trackFeatureUsage(featureId: string, userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('feature_usage').insert({ feature_id: featureId, user_id: userId, used_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
