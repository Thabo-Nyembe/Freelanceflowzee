'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export interface ProjectInput {
  name: string
  description?: string
  client_id?: string
  status?: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
  priority?: 'low' | 'medium' | 'high' | 'critical'
  start_date?: string
  end_date?: string
  budget?: number
  team_members?: string[]
  tags?: string[]
  cover_image?: string
  color?: string
  is_template?: boolean
  template_id?: string
  metadata?: Record<string, any>
}

export interface ProjectTaskInput {
  project_id: string
  title: string
  description?: string
  status?: 'todo' | 'in_progress' | 'review' | 'done'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  assignee_id?: string
  due_date?: string
  estimated_hours?: number
  parent_task_id?: string
  tags?: string[]
  attachments?: string[]
}

// Project Actions
export async function createProject(input: ProjectInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('projects')
    .insert([{
      ...input,
      user_id: user.id,
      status: input.status || 'planning',
      priority: input.priority || 'medium',
      progress: 0,
      spent: 0
    }])
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/projects-hub-v2')
  return data
}

export async function updateProject(id: string, updates: Partial<ProjectInput>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('projects')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/projects-hub-v2')
  return data
}

export async function updateProjectProgress(id: string, progress: number) {
  return updateProject(id, { progress: Math.min(100, Math.max(0, progress)) })
}

export async function archiveProject(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('projects')
    .update({
      archived_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/projects-hub-v2')
  return data
}

export async function deleteProject(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/dashboard/projects-hub-v2')
  return { success: true }
}

export async function getProjects(includeArchived: boolean = false) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  let query = supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (!includeArchived) {
    query = query.is('archived_at', null)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getProjectById(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) return null
  return data
}

// Project Task Actions
export async function createProjectTask(input: ProjectTaskInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('project_tasks')
    .insert([{
      ...input,
      user_id: user.id,
      status: input.status || 'todo',
      priority: input.priority || 'medium'
    }])
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/projects-hub-v2')
  return data
}

export async function updateProjectTask(id: string, updates: Partial<ProjectTaskInput>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const updateData: any = { ...updates, updated_at: new Date().toISOString() }

  if (updates.status === 'done') {
    updateData.completed_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('project_tasks')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/projects-hub-v2')
  return data
}

export async function deleteProjectTask(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('project_tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/dashboard/projects-hub-v2')
  return { success: true }
}

export async function getProjectTasks(projectId: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('project_tasks')
    .select('*')
    .eq('project_id', projectId)
    .eq('user_id', user.id)
    .order('position', { ascending: true })

  if (error) throw error
  return data || []
}
