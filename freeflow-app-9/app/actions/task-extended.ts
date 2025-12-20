'use server'

/**
 * Extended Task Server Actions - Covers all Task-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getTasks(projectId?: string, status?: string, assigneeId?: string, priority?: string) {
  try { const supabase = await createClient(); let query = supabase.from('tasks').select('*').order('created_at', { ascending: false }); if (projectId) query = query.eq('project_id', projectId); if (status) query = query.eq('status', status); if (assigneeId) query = query.eq('assignee_id', assigneeId); if (priority) query = query.eq('priority', priority); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTask(taskId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tasks').select('*').eq('id', taskId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createTask(input: { title: string; description?: string; project_id?: string; assignee_id?: string; priority?: string; due_date?: string; estimated_hours?: number; tags?: string[]; parent_task_id?: string }) {
  try { const supabase = await createClient(); const taskNumber = `TASK-${Date.now()}`; const { data, error } = await supabase.from('tasks').insert({ task_number: taskNumber, ...input, status: 'todo', progress: 0 }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTask(taskId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tasks').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', taskId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTaskStatus(taskId: string, status: string) {
  try { const supabase = await createClient(); const updates: any = { status, updated_at: new Date().toISOString() }; if (status === 'completed') { updates.completed_at = new Date().toISOString(); updates.progress = 100; } else if (status === 'in_progress' && !updates.started_at) { updates.started_at = new Date().toISOString(); } const { data, error } = await supabase.from('tasks').update(updates).eq('id', taskId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTaskProgress(taskId: string, progress: number) {
  try { const supabase = await createClient(); const status = progress >= 100 ? 'completed' : progress > 0 ? 'in_progress' : 'todo'; const { data, error } = await supabase.from('tasks').update({ progress: Math.min(100, Math.max(0, progress)), status, updated_at: new Date().toISOString() }).eq('id', taskId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function assignTask(taskId: string, assigneeId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tasks').update({ assignee_id: assigneeId, assigned_at: new Date().toISOString() }).eq('id', taskId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteTask(taskId: string) {
  try { const supabase = await createClient(); await supabase.from('task_assignments').delete().eq('task_id', taskId); const { error } = await supabase.from('tasks').delete().eq('id', taskId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSubtasks(parentTaskId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tasks').select('*').eq('parent_task_id', parentTaskId).order('created_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTaskAssignments(taskId?: string, userId?: string) {
  try { const supabase = await createClient(); let query = supabase.from('task_assignments').select('*').order('assigned_at', { ascending: false }); if (taskId) query = query.eq('task_id', taskId); if (userId) query = query.eq('user_id', userId); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createTaskAssignment(taskId: string, userId: string, role?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('task_assignments').insert({ task_id: taskId, user_id: userId, role: role || 'assignee', assigned_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeTaskAssignment(taskId: string, userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('task_assignments').delete().eq('task_id', taskId).eq('user_id', userId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getUserTasks(userId: string, status?: string) {
  try { const supabase = await createClient(); let query = supabase.from('tasks').select('*').eq('assignee_id', userId).order('due_date', { ascending: true }); if (status) query = query.eq('status', status); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getOverdueTasks(projectId?: string) {
  try { const supabase = await createClient(); const now = new Date().toISOString(); let query = supabase.from('tasks').select('*').lt('due_date', now).neq('status', 'completed'); if (projectId) query = query.eq('project_id', projectId); const { data, error } = await query; if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getTaskStats(projectId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tasks').select('status').eq('project_id', projectId); if (error) throw error; const stats = { total: data?.length || 0, todo: data?.filter(t => t.status === 'todo').length || 0, in_progress: data?.filter(t => t.status === 'in_progress').length || 0, completed: data?.filter(t => t.status === 'completed').length || 0 }; return { success: true, data: { ...stats, completion_rate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0 } } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
