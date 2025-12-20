'use server'

/**
 * Extended Tasks Server Actions
 * Tables: tasks, task_assignments, task_dependencies, task_comments, task_time_logs, task_checklists
 */

import { createClient } from '@/lib/supabase/server'

export async function getTask(taskId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tasks').select('*, task_assignments(*), task_dependencies(*), task_checklists(*), users(*), projects(*)').eq('id', taskId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createTask(taskData: { title: string; description?: string; project_id?: string; parent_id?: string; assignees?: string[]; priority?: string; status?: string; due_date?: string; estimated_hours?: number; labels?: string[]; created_by?: string; metadata?: any }) {
  try { const supabase = await createClient(); const { assignees, ...taskInfo } = taskData; const { data: task, error: taskError } = await supabase.from('tasks').insert({ ...taskInfo, status: taskInfo.status || 'todo', priority: taskInfo.priority || 'medium', created_at: new Date().toISOString() }).select().single(); if (taskError) throw taskError; if (assignees && assignees.length > 0) { const assignments = assignees.map(userId => ({ task_id: task.id, user_id: userId, assigned_at: new Date().toISOString(), created_at: new Date().toISOString() })); await supabase.from('task_assignments').insert(assignments) } return { success: true, data: task } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTask(taskId: string, updates: Partial<{ title: string; description: string; status: string; priority: string; due_date: string; estimated_hours: number; actual_hours: number; labels: string[]; metadata: any }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tasks').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', taskId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteTask(taskId: string) {
  try { const supabase = await createClient(); await supabase.from('task_assignments').delete().eq('task_id', taskId); await supabase.from('task_dependencies').delete().or(`task_id.eq.${taskId},depends_on_id.eq.${taskId}`); await supabase.from('task_comments').delete().eq('task_id', taskId); await supabase.from('task_time_logs').delete().eq('task_id', taskId); await supabase.from('task_checklists').delete().eq('task_id', taskId); await supabase.from('tasks').delete().eq('parent_id', taskId); const { error } = await supabase.from('tasks').delete().eq('id', taskId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTasks(options?: { project_id?: string; status?: string; priority?: string; assignee_id?: string; parent_id?: string; has_due_date?: boolean; overdue?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('tasks').select('*, task_assignments(*), users(*), projects(*)'); if (options?.project_id) query = query.eq('project_id', options.project_id); if (options?.status) query = query.eq('status', options.status); if (options?.priority) query = query.eq('priority', options.priority); if (options?.parent_id) query = query.eq('parent_id', options.parent_id); if (options?.parent_id === null) query = query.is('parent_id', null); if (options?.has_due_date) query = query.not('due_date', 'is', null); if (options?.overdue) query = query.lt('due_date', new Date().toISOString()).neq('status', 'done'); if (options?.search) query = query.ilike('title', `%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 100); if (error) throw error; let tasks = data || []; if (options?.assignee_id) { const { data: assignments } = await supabase.from('task_assignments').select('task_id').eq('user_id', options.assignee_id); const taskIds = assignments?.map(a => a.task_id) || []; tasks = tasks.filter(t => taskIds.includes(t.id)) } return { success: true, data: tasks } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function assignTask(taskId: string, userId: string, assignedBy?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('task_assignments').upsert({ task_id: taskId, user_id: userId, assigned_by: assignedBy, assigned_at: new Date().toISOString() }, { onConflict: 'task_id,user_id' }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function unassignTask(taskId: string, userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('task_assignments').delete().eq('task_id', taskId).eq('user_id', userId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addDependency(taskId: string, dependsOnId: string, dependencyType?: string) {
  try { const supabase = await createClient(); if (taskId === dependsOnId) return { success: false, error: 'Task cannot depend on itself' }; const { data, error } = await supabase.from('task_dependencies').insert({ task_id: taskId, depends_on_id: dependsOnId, dependency_type: dependencyType || 'finish_to_start', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeDependency(taskId: string, dependsOnId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('task_dependencies').delete().eq('task_id', taskId).eq('depends_on_id', dependsOnId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function addComment(taskId: string, commentData: { user_id: string; content: string; parent_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('task_comments').insert({ task_id: taskId, ...commentData, created_at: new Date().toISOString() }).select('*, users(*)').single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getComments(taskId: string, options?: { limit?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('task_comments').select('*, users(*)').eq('task_id', taskId).is('parent_id', null).order('created_at', { ascending: true }).limit(options?.limit || 100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function logTime(taskId: string, timeData: { user_id: string; hours: number; description?: string; logged_date?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('task_time_logs').insert({ task_id: taskId, ...timeData, logged_date: timeData.logged_date || new Date().toISOString().split('T')[0], logged_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single(); if (error) throw error; const { data: totalData } = await supabase.from('task_time_logs').select('hours').eq('task_id', taskId); const totalHours = totalData?.reduce((sum, l) => sum + (l.hours || 0), 0) || 0; await supabase.from('tasks').update({ actual_hours: totalHours, updated_at: new Date().toISOString() }).eq('id', taskId); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTimeLogs(taskId: string, options?: { user_id?: string; from_date?: string; to_date?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('task_time_logs').select('*, users(*)').eq('task_id', taskId); if (options?.user_id) query = query.eq('user_id', options.user_id); if (options?.from_date) query = query.gte('logged_date', options.from_date); if (options?.to_date) query = query.lte('logged_date', options.to_date); const { data, error } = await query.order('logged_date', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addChecklistItem(taskId: string, itemData: { title: string; order_index?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('task_checklists').insert({ task_id: taskId, ...itemData, is_completed: false, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function toggleChecklistItem(itemId: string, completedBy?: string) {
  try { const supabase = await createClient(); const { data: item } = await supabase.from('task_checklists').select('is_completed').eq('id', itemId).single(); const { data, error } = await supabase.from('task_checklists').update({ is_completed: !item?.is_completed, completed_at: !item?.is_completed ? new Date().toISOString() : null, completed_by: !item?.is_completed ? completedBy : null, updated_at: new Date().toISOString() }).eq('id', itemId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getSubtasks(taskId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('tasks').select('*, task_assignments(*)').eq('parent_id', taskId).order('created_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

