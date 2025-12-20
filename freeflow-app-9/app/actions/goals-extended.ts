'use server'

/**
 * Extended Goals Server Actions
 * Tables: goals, goal_milestones, goal_progress, goal_categories, goal_reminders, goal_collaborators
 */

import { createClient } from '@/lib/supabase/server'

export async function getGoal(goalId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('goals').select('*, goal_milestones(*), goal_progress(*), goal_collaborators(*)').eq('id', goalId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createGoal(goalData: { user_id: string; title: string; description?: string; category_id?: string; target_value?: number; target_date?: string; priority?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('goals').insert({ ...goalData, status: 'active', progress: 0, current_value: 0, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateGoal(goalId: string, updates: Partial<{ title: string; description: string; target_value: number; target_date: string; priority: string; status: string; progress: number; current_value: number }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('goals').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', goalId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteGoal(goalId: string) {
  try { const supabase = await createClient(); await supabase.from('goal_milestones').delete().eq('goal_id', goalId); await supabase.from('goal_progress').delete().eq('goal_id', goalId); await supabase.from('goal_reminders').delete().eq('goal_id', goalId); await supabase.from('goal_collaborators').delete().eq('goal_id', goalId); const { error } = await supabase.from('goals').delete().eq('id', goalId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getGoals(options?: { user_id?: string; status?: string; category_id?: string; priority?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('goals').select('*, goal_categories(*)'); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.status) query = query.eq('status', options.status); if (options?.category_id) query = query.eq('category_id', options.category_id); if (options?.priority) query = query.eq('priority', options.priority); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createMilestone(milestoneData: { goal_id: string; title: string; description?: string; target_date?: string; order?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('goal_milestones').insert({ ...milestoneData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateMilestone(milestoneId: string, updates: Partial<{ title: string; description: string; target_date: string; status: string; completed_at: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('goal_milestones').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', milestoneId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMilestones(goalId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('goal_milestones').select('*').eq('goal_id', goalId).order('order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordProgress(progressData: { goal_id: string; value: number; notes?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('goal_progress').insert({ ...progressData, recorded_at: new Date().toISOString() }).select().single(); if (error) throw error; const { data: goal } = await supabase.from('goals').select('target_value').eq('id', progressData.goal_id).single(); if (goal?.target_value) { const newProgress = Math.min(100, (progressData.value / goal.target_value) * 100); await supabase.from('goals').update({ current_value: progressData.value, progress: newProgress, updated_at: new Date().toISOString() }).eq('id', progressData.goal_id) }; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getProgressHistory(goalId: string, options?: { from_date?: string; to_date?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('goal_progress').select('*').eq('goal_id', goalId); if (options?.from_date) query = query.gte('recorded_at', options.from_date); if (options?.to_date) query = query.lte('recorded_at', options.to_date); const { data, error } = await query.order('recorded_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getGoalCategories() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('goal_categories').select('*').order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addGoalReminder(reminderData: { goal_id: string; reminder_type: string; reminder_time: string; is_recurring?: boolean; recurrence_pattern?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('goal_reminders').insert({ ...reminderData, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addGoalCollaborator(goalId: string, userId: string, role?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('goal_collaborators').insert({ goal_id: goalId, user_id: userId, role: role || 'viewer', added_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getGoalCollaborators(goalId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('goal_collaborators').select('*').eq('goal_id', goalId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
