'use server'

/**
 * Extended Milestones Server Actions
 * Tables: milestones, milestone_tasks, milestone_dependencies, milestone_progress, milestone_updates
 */

import { createClient } from '@/lib/supabase/server'

export async function getMilestone(milestoneId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('milestones').select('*, milestone_tasks(*), milestone_dependencies(*), milestone_updates(*)').eq('id', milestoneId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createMilestone(milestoneData: { project_id: string; name: string; description?: string; due_date?: string; owner_id?: string; priority?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('milestones').insert({ ...milestoneData, status: 'pending', progress: 0, priority: milestoneData.priority || 'medium', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateMilestone(milestoneId: string, updates: Partial<{ name: string; description: string; due_date: string; owner_id: string; status: string; priority: string; progress: number }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('milestones').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', milestoneId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteMilestone(milestoneId: string) {
  try { const supabase = await createClient(); await supabase.from('milestone_tasks').delete().eq('milestone_id', milestoneId); await supabase.from('milestone_dependencies').delete().eq('milestone_id', milestoneId); await supabase.from('milestone_dependencies').delete().eq('depends_on_id', milestoneId); const { error } = await supabase.from('milestones').delete().eq('id', milestoneId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMilestones(projectId: string, options?: { status?: string; owner_id?: string; priority?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('milestones').select('*, milestone_tasks(*)').eq('project_id', projectId); if (options?.status) query = query.eq('status', options.status); if (options?.owner_id) query = query.eq('owner_id', options.owner_id); if (options?.priority) query = query.eq('priority', options.priority); const { data, error } = await query.order('due_date', { ascending: true }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addTask(milestoneId: string, taskData: { title: string; description?: string; assignee_id?: string; due_date?: string; priority?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('milestone_tasks').insert({ milestone_id: milestoneId, ...taskData, status: 'pending', priority: taskData.priority || 'medium', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTask(taskId: string, updates: Partial<{ title: string; description: string; assignee_id: string; due_date: string; status: string; priority: string }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('milestone_tasks').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', taskId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteTask(taskId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('milestone_tasks').delete().eq('id', taskId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTasks(milestoneId: string, options?: { status?: string; assignee_id?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('milestone_tasks').select('*').eq('milestone_id', milestoneId); if (options?.status) query = query.eq('status', options.status); if (options?.assignee_id) query = query.eq('assignee_id', options.assignee_id); const { data, error } = await query.order('due_date', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addDependency(milestoneId: string, dependsOnId: string, dependencyType?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('milestone_dependencies').insert({ milestone_id: milestoneId, depends_on_id: dependsOnId, dependency_type: dependencyType || 'finish_to_start', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeDependency(dependencyId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('milestone_dependencies').delete().eq('id', dependencyId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getDependencies(milestoneId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('milestone_dependencies').select('*, milestones!depends_on_id(*)').eq('milestone_id', milestoneId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function recordProgress(milestoneId: string, progressData: { progress: number; notes?: string; recorded_by: string }) {
  try { const supabase = await createClient(); await supabase.from('milestones').update({ progress: progressData.progress, updated_at: new Date().toISOString() }).eq('id', milestoneId); const { data, error } = await supabase.from('milestone_progress').insert({ milestone_id: milestoneId, ...progressData, recorded_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getProgressHistory(milestoneId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('milestone_progress').select('*').eq('milestone_id', milestoneId).order('recorded_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addUpdate(milestoneId: string, updateData: { title: string; content: string; update_type?: string; user_id: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('milestone_updates').insert({ milestone_id: milestoneId, ...updateData, update_type: updateData.update_type || 'general', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeMilestone(milestoneId: string, userId: string, notes?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('milestones').update({ status: 'completed', progress: 100, completed_at: new Date().toISOString(), completed_by: userId, completion_notes: notes, updated_at: new Date().toISOString() }).eq('id', milestoneId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
