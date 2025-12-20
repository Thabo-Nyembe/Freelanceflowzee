'use server'

/**
 * Extended Sprint Server Actions - Covers all Sprint-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getSprints(projectId?: string, status?: string) {
  try { const supabase = await createClient(); let query = supabase.from('sprints').select('*').order('start_date', { ascending: false }); if (projectId) query = query.eq('project_id', projectId); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getSprint(sprintId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('sprints').select('*').eq('id', sprintId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createSprint(input: { name: string; project_id: string; start_date: string; end_date: string; goal?: string; capacity?: number }) {
  try { const supabase = await createClient(); const sprintNumber = `SPR-${Date.now()}`; const { data, error } = await supabase.from('sprints').insert({ sprint_number: sprintNumber, ...input, status: 'planning', velocity: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSprint(sprintId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('sprints').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', sprintId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function startSprint(sprintId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('sprints').update({ status: 'active', started_at: new Date().toISOString() }).eq('id', sprintId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function completeSprint(sprintId: string, velocity: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('sprints').update({ status: 'completed', velocity, completed_at: new Date().toISOString() }).eq('id', sprintId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteSprint(sprintId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('sprints').delete().eq('id', sprintId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSprintTasks(sprintId: string, status?: string) {
  try { const supabase = await createClient(); let query = supabase.from('sprint_tasks').select('*').eq('sprint_id', sprintId).order('priority', { ascending: false }); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addTaskToSprint(sprintId: string, taskId: string, storyPoints?: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('sprint_tasks').insert({ sprint_id: sprintId, task_id: taskId, story_points: storyPoints, status: 'todo' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateSprintTaskStatus(sprintTaskId: string, status: string) {
  try { const supabase = await createClient(); const updates: any = { status, updated_at: new Date().toISOString() }; if (status === 'done') updates.completed_at = new Date().toISOString(); const { data, error } = await supabase.from('sprint_tasks').update(updates).eq('id', sprintTaskId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeTaskFromSprint(sprintTaskId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('sprint_tasks').delete().eq('id', sprintTaskId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSprintBurndown(sprintId: string) {
  try { const supabase = await createClient(); const { data: tasks, error } = await supabase.from('sprint_tasks').select('story_points, status, completed_at').eq('sprint_id', sprintId); if (error) throw error; const totalPoints = tasks?.reduce((sum, t) => sum + (t.story_points || 0), 0) || 0; const completedPoints = tasks?.filter(t => t.status === 'done').reduce((sum, t) => sum + (t.story_points || 0), 0) || 0; return { success: true, data: { total_points: totalPoints, completed_points: completedPoints, remaining_points: totalPoints - completedPoints } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getActiveSprint(projectId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('sprints').select('*').eq('project_id', projectId).eq('status', 'active').single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data: data || null } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
