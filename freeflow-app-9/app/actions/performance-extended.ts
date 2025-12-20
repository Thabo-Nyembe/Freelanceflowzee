'use server'

/**
 * Extended Performance Server Actions - Covers all 7 Performance-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getPerformanceAlerts(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('performance_alerts').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createPerformanceAlert(userId: string, input: { metric: string; threshold: number; condition: string; message?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('performance_alerts').insert({ user_id: userId, ...input, is_active: true }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePerformanceAlert(alertId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('performance_alerts').update(updates).eq('id', alertId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deletePerformanceAlert(alertId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('performance_alerts').delete().eq('id', alertId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPerformanceAnalytics(userId: string, startDate?: string, endDate?: string) {
  try { const supabase = await createClient(); let query = supabase.from('performance_analytics').select('*').eq('user_id', userId).order('recorded_at', { ascending: false }); if (startDate) query = query.gte('recorded_at', startDate); if (endDate) query = query.lte('recorded_at', endDate); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordPerformanceAnalytics(userId: string, metrics: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('performance_analytics').insert({ user_id: userId, metrics, recorded_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPerformanceBenchmarks(category?: string) {
  try { const supabase = await createClient(); let query = supabase.from('performance_benchmarks').select('*').order('name', { ascending: true }); if (category) query = query.eq('category', category); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createPerformanceBenchmark(input: { name: string; category: string; target_value: number; unit?: string; description?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('performance_benchmarks').insert(input).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePerformanceBenchmark(benchmarkId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('performance_benchmarks').update(updates).eq('id', benchmarkId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPerformanceGoals(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('performance_goals').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createPerformanceGoal(userId: string, input: { title: string; description?: string; target_value: number; current_value?: number; due_date?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('performance_goals').insert({ user_id: userId, ...input, status: 'active' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePerformanceGoal(goalId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('performance_goals').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', goalId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completePerformanceGoal(goalId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('performance_goals').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', goalId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPerformanceMetrics(entityType?: string, entityId?: string, limit = 100) {
  try { const supabase = await createClient(); let query = supabase.from('performance_metrics').select('*').order('recorded_at', { ascending: false }); if (entityType) query = query.eq('entity_type', entityType); if (entityId) query = query.eq('entity_id', entityId); const { data, error } = await query.limit(limit); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordPerformanceMetric(input: { entity_type: string; entity_id: string; metric_name: string; value: number; unit?: string; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('performance_metrics').insert({ ...input, recorded_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPerformanceReviews(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('performance_reviews').select('*').eq('user_id', userId).order('review_date', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createPerformanceReview(userId: string, reviewerId: string, input: { review_date: string; period_start: string; period_end: string; overall_rating?: number; comments?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('performance_reviews').insert({ user_id: userId, reviewer_id: reviewerId, ...input, status: 'draft' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePerformanceReview(reviewId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('performance_reviews').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', reviewId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function submitPerformanceReview(reviewId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('performance_reviews').update({ status: 'submitted', submitted_at: new Date().toISOString() }).eq('id', reviewId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPerformanceSnapshots(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('performance_snapshots').select('*').eq('user_id', userId).order('snapshot_date', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createPerformanceSnapshot(userId: string, snapshotData: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('performance_snapshots').insert({ user_id: userId, snapshot_date: new Date().toISOString(), data: snapshotData }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function comparePerformanceSnapshots(snapshotId1: string, snapshotId2: string) {
  try { const supabase = await createClient(); const { data: snapshots, error } = await supabase.from('performance_snapshots').select('*').in('id', [snapshotId1, snapshotId2]); if (error) throw error; return { success: true, data: snapshots || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
