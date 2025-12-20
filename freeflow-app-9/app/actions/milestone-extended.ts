'use server'

/**
 * Extended Milestone Server Actions - Covers all Milestone-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getMilestones(projectId?: string, status?: string) {
  try { const supabase = await createClient(); let query = supabase.from('milestones').select('*').order('due_date', { ascending: true }); if (projectId) query = query.eq('project_id', projectId); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getMilestone(milestoneId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('milestones').select('*').eq('id', milestoneId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createMilestone(input: { name: string; description?: string; project_id: string; due_date: string; owner_id?: string; deliverables?: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('milestones').insert({ ...input, status: 'pending', progress: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateMilestone(milestoneId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('milestones').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', milestoneId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateMilestoneProgress(milestoneId: string, progress: number) {
  try { const supabase = await createClient(); const status = progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'pending'; const updates: any = { progress, status, updated_at: new Date().toISOString() }; if (progress === 100) updates.completed_at = new Date().toISOString(); const { data, error } = await supabase.from('milestones').update(updates).eq('id', milestoneId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeMilestone(milestoneId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('milestones').update({ status: 'completed', progress: 100, completed_at: new Date().toISOString() }).eq('id', milestoneId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteMilestone(milestoneId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('milestones').delete().eq('id', milestoneId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMilestoneTasks(milestoneId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('milestone_tasks').select('*').eq('milestone_id', milestoneId).order('order_index', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createMilestoneTask(milestoneId: string, input: { title: string; description?: string; assignee_id?: string; due_date?: string; order_index?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('milestone_tasks').insert({ milestone_id: milestoneId, ...input, status: 'pending' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateMilestoneTask(taskId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('milestone_tasks').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', taskId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeMilestoneTask(taskId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('milestone_tasks').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', taskId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteMilestoneTask(taskId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('milestone_tasks').delete().eq('id', taskId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUpcomingMilestones(projectId?: string, days = 30) {
  try { const supabase = await createClient(); const futureDate = new Date(); futureDate.setDate(futureDate.getDate() + days); let query = supabase.from('milestones').select('*').lte('due_date', futureDate.toISOString()).neq('status', 'completed').order('due_date', { ascending: true }); if (projectId) query = query.eq('project_id', projectId); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getOverdueMilestones(projectId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('milestones').select('*').lt('due_date', new Date().toISOString()).neq('status', 'completed').order('due_date', { ascending: true }); if (projectId) query = query.eq('project_id', projectId); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
