'use server'

/**
 * Extended Projects Server Actions
 * Tables: projects, project_members, project_tasks, project_milestones, project_files, project_comments, project_timelines, project_budgets
 */

import { createClient } from '@/lib/supabase/server'

export async function getProject(projectId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('projects').select('*, project_members(*, users(*)), project_tasks(count), project_milestones(*), project_files(count), project_budgets(*)').eq('id', projectId).single(); if (error && error.code !== 'PGRST116') throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createProject(projectData: { name: string; description?: string; owner_id: string; organization_id?: string; client_id?: string; start_date?: string; due_date?: string; budget?: number; template_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('projects').insert({ ...projectData, status: 'planning', progress: 0, is_active: true, created_at: new Date().toISOString() }).select().single(); if (error) throw error; await supabase.from('project_members').insert({ project_id: data.id, user_id: projectData.owner_id, role: 'owner', joined_at: new Date().toISOString() }); return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateProject(projectId: string, updates: Partial<{ name: string; description: string; status: string; start_date: string; due_date: string; budget: number; progress: number; is_active: boolean }>) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('projects').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', projectId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function deleteProject(projectId: string) {
  try { const supabase = await createClient(); await supabase.from('project_tasks').delete().eq('project_id', projectId); await supabase.from('project_milestones').delete().eq('project_id', projectId); await supabase.from('project_members').delete().eq('project_id', projectId); await supabase.from('project_files').delete().eq('project_id', projectId); await supabase.from('project_comments').delete().eq('project_id', projectId); await supabase.from('project_timelines').delete().eq('project_id', projectId); await supabase.from('project_budgets').delete().eq('project_id', projectId); const { error } = await supabase.from('projects').delete().eq('id', projectId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getProjects(options?: { owner_id?: string; organization_id?: string; client_id?: string; status?: string; is_active?: boolean; search?: string; limit?: number }) {
  try { const supabase = await createClient(); let query = supabase.from('projects').select('*, project_members(count), project_tasks(count), project_milestones(count)'); if (options?.owner_id) query = query.eq('owner_id', options.owner_id); if (options?.organization_id) query = query.eq('organization_id', options.organization_id); if (options?.client_id) query = query.eq('client_id', options.client_id); if (options?.status) query = query.eq('status', options.status); if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active); if (options?.search) query = query.ilike('name', `%${options.search}%`); const { data, error } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addMember(projectId: string, memberData: { user_id: string; role: string; permissions?: any }) {
  try { const supabase = await createClient(); const { data: existing } = await supabase.from('project_members').select('id').eq('project_id', projectId).eq('user_id', memberData.user_id).single(); if (existing) return { success: false, error: 'User is already a member' }; const { data, error } = await supabase.from('project_members').insert({ project_id: projectId, ...memberData, joined_at: new Date().toISOString() }).select('*, users(*)').single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function removeMember(projectId: string, userId: string) {
  try { const supabase = await createClient(); const { error } = await supabase.from('project_members').delete().eq('project_id', projectId).eq('user_id', userId); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateMemberRole(projectId: string, userId: string, role: string, permissions?: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('project_members').update({ role, permissions, updated_at: new Date().toISOString() }).eq('project_id', projectId).eq('user_id', userId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMembers(projectId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('project_members').select('*, users(*)').eq('project_id', projectId).order('joined_at', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createTask(projectId: string, taskData: { title: string; description?: string; assignee_id?: string; priority?: string; due_date?: string; milestone_id?: string; parent_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('project_tasks').insert({ project_id: projectId, ...taskData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateTask(taskId: string, updates: Partial<{ title: string; description: string; status: string; priority: string; assignee_id: string; due_date: string; completed_at: string }>) {
  try { const supabase = await createClient(); if (updates.status === 'completed' && !updates.completed_at) { updates.completed_at = new Date().toISOString() } const { data, error } = await supabase.from('project_tasks').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', taskId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getTasks(projectId: string, options?: { status?: string; assignee_id?: string; milestone_id?: string; priority?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('project_tasks').select('*, users(*)').eq('project_id', projectId); if (options?.status) query = query.eq('status', options.status); if (options?.assignee_id) query = query.eq('assignee_id', options.assignee_id); if (options?.milestone_id) query = query.eq('milestone_id', options.milestone_id); if (options?.priority) query = query.eq('priority', options.priority); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createMilestone(projectId: string, milestoneData: { title: string; description?: string; due_date: string; order?: number }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('project_milestones').insert({ project_id: projectId, ...milestoneData, status: 'pending', created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getMilestones(projectId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('project_milestones').select('*, project_tasks(count)').eq('project_id', projectId).order('due_date', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addFile(projectId: string, fileData: { name: string; url: string; type?: string; size?: number; uploaded_by: string; folder_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('project_files').insert({ project_id: projectId, ...fileData, created_at: new Date().toISOString() }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getFiles(projectId: string, options?: { folder_id?: string; type?: string }) {
  try { const supabase = await createClient(); let query = supabase.from('project_files').select('*, users(*)').eq('project_id', projectId); if (options?.folder_id) query = query.eq('folder_id', options.folder_id); if (options?.type) query = query.eq('type', options.type); const { data, error } = await query.order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addComment(projectId: string, commentData: { author_id: string; content: string; task_id?: string; parent_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('project_comments').insert({ project_id: projectId, ...commentData, created_at: new Date().toISOString() }).select('*, users(*)').single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updateProgress(projectId: string) {
  try { const supabase = await createClient(); const { data: tasks } = await supabase.from('project_tasks').select('status').eq('project_id', projectId); if (!tasks || tasks.length === 0) return { success: true, progress: 0 }; const completed = tasks.filter(t => t.status === 'completed').length; const progress = Math.round((completed / tasks.length) * 100); await supabase.from('projects').update({ progress, updated_at: new Date().toISOString() }).eq('id', projectId); return { success: true, progress } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}
