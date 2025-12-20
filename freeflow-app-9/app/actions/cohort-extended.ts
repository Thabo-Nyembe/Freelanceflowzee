'use server'

/**
 * Extended Cohort Server Actions
 * Tables: cohorts, cohort_members, cohort_analysis, cohort_metrics
 */

import { createClient } from '@/lib/supabase/server'

export async function getCohort(cohortId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('cohorts').select('*, cohort_members(*)').eq('id', cohortId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createCohort(cohortData: { name: string; description?: string; criteria: Record<string, any>; cohort_date: string; type?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('cohorts').insert({ ...cohortData, member_count: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateCohort(cohortId: string, updates: Partial<{ name: string; description: string; criteria: Record<string, any> }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('cohorts').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', cohortId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCohorts(options?: { type?: string; date_from?: string; date_to?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('cohorts').select('*'); if (options?.type) query = query.eq('type', options.type); if (options?.date_from) query = query.gte('cohort_date', options.date_from); if (options?.date_to) query = query.lte('cohort_date', options.date_to); const { data, error } = await query.order('cohort_date', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addCohortMember(cohortId: string, memberId: string, metadata?: Record<string, any>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('cohort_members').insert({ cohort_id: cohortId, member_id: memberId, metadata, joined_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.rpc('increment_cohort_count', { cohort_id: cohortId }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeCohortMember(cohortId: string, memberId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('cohort_members').delete().eq('cohort_id', cohortId).eq('member_id', memberId); if (error) throw error; await supabase.rpc('decrement_cohort_count', { cohort_id: cohortId }); return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCohortMembers(cohortId: string, options?: { limit?: number; offset?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('cohort_members').select('*').eq('cohort_id', cohortId).order('joined_at', { ascending: true }); if (options?.offset) query = query.range(options.offset, (options.offset + (options.limit || 50)) - 1); else if (options?.limit) query = query.limit(options.limit); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordCohortMetric(metricData: { cohort_id: string; metric_name: string; value: number; period: string; metadata?: Record<string, any> }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('cohort_metrics').insert({ ...metricData, recorded_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getCohortAnalysis(cohortId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('cohort_analysis').select('*').eq('cohort_id', cohortId).order('analysis_date', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
