'use server'

/**
 * Extended Growth Server Actions - Covers all 3 Growth-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getGrowthExperiments(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('growth_experiments').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createGrowthExperiment(userId: string, input: { name: string; hypothesis: string; metric: string; variants?: any[]; sample_size?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('growth_experiments').insert({ user_id: userId, ...input, status: 'draft' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function startGrowthExperiment(experimentId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('growth_experiments').update({ status: 'running', started_at: new Date().toISOString() }).eq('id', experimentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function endGrowthExperiment(experimentId: string, results: any, winner?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('growth_experiments').update({ status: 'completed', ended_at: new Date().toISOString(), results, winner }).eq('id', experimentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateGrowthExperiment(experimentId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('growth_experiments').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', experimentId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getGrowthMetrics(userId: string, startDate?: string, endDate?: string) {
  try { const supabase = await createClient(); let query = supabase.from('growth_metrics').select('*').eq('user_id', userId).order('recorded_at', { ascending: false }); if (startDate) query = query.gte('recorded_at', startDate); if (endDate) query = query.lte('recorded_at', endDate); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordGrowthMetric(userId: string, input: { metric_name: string; value: number; dimension?: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('growth_metrics').insert({ user_id: userId, ...input, recorded_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getGrowthPlaybooks(category?: string) {
  try { const supabase = await createClient(); let query = supabase.from('growth_playbooks').select('*').order('name', { ascending: true }); if (category) query = query.eq('category', category); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createGrowthPlaybook(input: { name: string; description: string; category: string; steps: any[]; expected_outcomes?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('growth_playbooks').insert(input).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateGrowthPlaybook(playbookId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('growth_playbooks').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', playbookId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteGrowthPlaybook(playbookId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('growth_playbooks').delete().eq('id', playbookId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
