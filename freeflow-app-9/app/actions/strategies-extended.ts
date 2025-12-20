'use server'

/**
 * Extended Strategies Server Actions
 * Tables: strategies, strategy_goals, strategy_initiatives, strategy_metrics, strategy_reviews, strategy_milestones
 */

import { createClient } from '@/lib/supabase/server'

export async function getStrategy(strategyId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('strategies').select('*, strategy_goals(*), strategy_initiatives(*), strategy_metrics(*), strategy_milestones(*)').eq('id', strategyId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createStrategy(strategyData: { name: string; description?: string; vision?: string; mission?: string; strategy_type?: string; owner_id?: string; start_date?: string; end_date?: string; status?: string; is_active?: boolean; metadata?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('strategies').insert({ ...strategyData, status: strategyData.status || 'draft', is_active: strategyData.is_active ?? true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateStrategy(strategyId: string, updates: Partial<{ name: string; description: string; vision: string; mission: string; strategy_type: string; start_date: string; end_date: string; status: string; is_active: boolean; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('strategies').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', strategyId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteStrategy(strategyId: string) {
  try { const supabase = await createClient(); await supabase.from('strategy_goals').delete().eq('strategy_id', strategyId); await supabase.from('strategy_initiatives').delete().eq('strategy_id', strategyId); await supabase.from('strategy_metrics').delete().eq('strategy_id', strategyId); await supabase.from('strategy_milestones').delete().eq('strategy_id', strategyId); const { error } = await supabase.from('strategies').delete().eq('id', strategyId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getStrategies(options?: { strategy_type?: string; owner_id?: string; status?: string; is_active?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('strategies').select('*, strategy_goals(count), strategy_initiatives(count)'); if (options?.strategy_type) query = query.eq('strategy_type', options.strategy_type); if (options?.owner_id) query = query.eq('owner_id', options.owner_id); if (options?.status) query = query.eq('status', options.status); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addGoal(strategyId: string, goalData: { name: string; description?: string; goal_type?: string; target_value?: number; current_value?: number; unit?: string; start_date?: string; target_date?: string; owner_id?: string; priority?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('strategy_goals').insert({ strategy_id: strategyId, ...goalData, status: 'not_started', progress: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateGoal(goalId: string, updates: Partial<{ name: string; description: string; target_value: number; current_value: number; status: string; progress: number; owner_id: string }>) {
  try { const supabase = await createClient(); if (updates.current_value !== undefined && updates.target_value !== undefined) { updates.progress = Math.round((updates.current_value / updates.target_value) * 100) } const { data, error } = await supabase.from('strategy_goals').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', goalId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getGoals(strategyId: string, options?: { goal_type?: string; status?: string; owner_id?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('strategy_goals').select('*, users(*)').eq('strategy_id', strategyId); if (options?.goal_type) query = query.eq('goal_type', options.goal_type); if (options?.status) query = query.eq('status', options.status); if (options?.owner_id) query = query.eq('owner_id', options.owner_id); const { data, error } = await query.order('priority', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addInitiative(strategyId: string, initiativeData: { name: string; description?: string; goal_id?: string; owner_id?: string; start_date?: string; end_date?: string; budget?: number; priority?: number; status?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('strategy_initiatives').insert({ strategy_id: strategyId, ...initiativeData, status: initiativeData.status || 'planned', progress: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateInitiative(initiativeId: string, updates: Partial<{ name: string; description: string; status: string; progress: number; actual_budget: number; completion_date: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('strategy_initiatives').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', initiativeId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getInitiatives(strategyId: string, options?: { goal_id?: string; status?: string; owner_id?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('strategy_initiatives').select('*, strategy_goals(*), users(*)').eq('strategy_id', strategyId); if (options?.goal_id) query = query.eq('goal_id', options.goal_id); if (options?.status) query = query.eq('status', options.status); if (options?.owner_id) query = query.eq('owner_id', options.owner_id); const { data, error } = await query.order('priority', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordMetric(strategyId: string, metricData: { metric_name: string; metric_value: number; target_value?: number; unit?: string; period?: string; goal_id?: string; notes?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('strategy_metrics').insert({ strategy_id: strategyId, ...metricData, recorded_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMetrics(strategyId: string, options?: { metric_name?: string; goal_id?: string; from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('strategy_metrics').select('*').eq('strategy_id', strategyId); if (options?.metric_name) query = query.eq('metric_name', options.metric_name); if (options?.goal_id) query = query.eq('goal_id', options.goal_id); if (options?.from_date) query = query.gte('recorded_at', options.from_date); if (options?.to_date) query = query.lte('recorded_at', options.to_date); const { data, error } = await query.order('recorded_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createReview(strategyId: string, reviewData: { review_type: string; period_start: string; period_end: string; summary: string; achievements?: any[]; challenges?: any[]; recommendations?: any[]; reviewed_by: string; participants?: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('strategy_reviews').insert({ strategy_id: strategyId, ...reviewData, reviewed_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addMilestone(strategyId: string, milestoneData: { name: string; description?: string; target_date: string; initiative_id?: string; owner_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('strategy_milestones').insert({ strategy_id: strategyId, ...milestoneData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeMilestone(milestoneId: string, completedBy: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('strategy_milestones').update({ status: 'completed', completed_at: new Date().toISOString(), completed_by: completedBy, updated_at: new Date().toISOString() }).eq('id', milestoneId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

