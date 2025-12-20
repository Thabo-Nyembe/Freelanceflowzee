'use server'

/**
 * Extended Insight Server Actions
 * Tables: insights, insight_categories, insight_metrics, insight_alerts
 */

import { createClient } from '@/lib/supabase/server'

export async function getInsight(insightId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('insights').select('*').eq('id', insightId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createInsight(insightData: { user_id: string; title: string; description?: string; type: string; category_id?: string; data?: Record<string, any>; priority?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('insights').insert({ ...insightData, status: 'new', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateInsight(insightId: string, updates: Partial<{ title: string; description: string; status: string; priority: string; data: Record<string, any> }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('insights').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', insightId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteInsight(insightId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('insights').delete().eq('id', insightId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInsights(options?: { user_id?: string; type?: string; category_id?: string; status?: string; priority?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('insights').select('*'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.type) query = query.eq('type', options.type); if (options?.category_id) query = query.eq('category_id', options.category_id); if (options?.status) query = query.eq('status', options.status); if (options?.priority) query = query.eq('priority', options.priority); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getInsightCategories() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('insight_categories').select('*').order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getInsightMetrics(insightId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('insight_metrics').select('*').eq('insight_id', insightId).order('recorded_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function dismissInsight(insightId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('insights').update({ status: 'dismissed', dismissed_at: new Date().toISOString() }).eq('id', insightId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function acknowledgeInsight(insightId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('insights').update({ status: 'acknowledged', acknowledged_at: new Date().toISOString() }).eq('id', insightId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
