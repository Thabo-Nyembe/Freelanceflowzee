'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export interface CreateSprintInput {
  name: string
  description?: string
  start_date?: string
  end_date?: string
  team_name?: string
  scrum_master?: string
  capacity?: number
  committed?: number
  goal?: string
}

export interface UpdateSprintInput {
  name?: string
  description?: string
  status?: string
  start_date?: string
  end_date?: string
  days_remaining?: number
  total_tasks?: number
  completed_tasks?: number
  in_progress_tasks?: number
  blocked_tasks?: number
  velocity?: number
  team_name?: string
  scrum_master?: string
  capacity?: number
  committed?: number
  burned?: number
  goal?: string
  retrospective?: string
}

export interface CreateTaskInput {
  sprint_id: string
  title: string
  description?: string
  priority?: string
  assignee_name?: string
  assignee_email?: string
  story_points?: number
  estimated_hours?: number
  due_date?: string
  labels?: string[]
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  status?: string
  priority?: string
  assignee_name?: string
  assignee_email?: string
  story_points?: number
  progress?: number
  estimated_hours?: number
  actual_hours?: number
  due_date?: string
  completed_date?: string
  labels?: string[]
}

export async function createSprint(input: CreateSprintInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const sprintCode = `SPR-${Date.now().toString(36).toUpperCase()}`

  // Calculate days remaining if dates provided
  let daysRemaining = 0
  if (input.end_date) {
    const end = new Date(input.end_date)
    const now = new Date()
    daysRemaining = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
  }

  const { data, error } = await supabase
    .from('sprints')
    .insert({
      user_id: user.id,
      sprint_code: sprintCode,
      name: input.name,
      description: input.description,
      status: 'planning',
      start_date: input.start_date,
      end_date: input.end_date,
      days_remaining: daysRemaining,
      team_name: input.team_name,
      scrum_master: input.scrum_master,
      capacity: input.capacity || 0,
      committed: input.committed || 0,
      goal: input.goal
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/sprints-v2')
  return { data }
}

export async function updateSprint(id: string, input: UpdateSprintInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('sprints')
    .update(input)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/sprints-v2')
  return { data }
}

export async function startSprint(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('sprints')
    .update({
      status: 'active',
      start_date: new Date().toISOString().split('T')[0]
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/sprints-v2')
  return { data }
}

export async function completeSprint(id: string, retrospective?: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('sprints')
    .update({
      status: 'completed',
      end_date: new Date().toISOString().split('T')[0],
      days_remaining: 0,
      retrospective
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/sprints-v2')
  return { data }
}

export async function deleteSprint(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('sprints')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/sprints-v2')
  return { success: true }
}

export async function createSprintTask(input: CreateTaskInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const taskCode = `TASK-${Date.now().toString(36).toUpperCase()}`

  const { data, error } = await supabase
    .from('sprint_tasks')
    .insert({
      user_id: user.id,
      sprint_id: input.sprint_id,
      task_code: taskCode,
      title: input.title,
      description: input.description,
      status: 'todo',
      priority: input.priority || 'medium',
      assignee_name: input.assignee_name,
      assignee_email: input.assignee_email,
      story_points: input.story_points || 0,
      estimated_hours: input.estimated_hours || 0,
      due_date: input.due_date,
      labels: input.labels || []
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Update sprint task counts
  await updateSprintTaskCounts(input.sprint_id)

  revalidatePath('/dashboard/sprints-v2')
  return { data }
}

export async function updateSprintTask(id: string, input: UpdateTaskInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('sprint_tasks')
    .update(input)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Update sprint task counts if status changed
  if (input.status && data) {
    await updateSprintTaskCounts(data.sprint_id)
  }

  revalidatePath('/dashboard/sprints-v2')
  return { data }
}

export async function completeSprintTask(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('sprint_tasks')
    .update({
      status: 'done',
      progress: 100,
      completed_date: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Update sprint task counts
  if (data) {
    await updateSprintTaskCounts(data.sprint_id)
  }

  revalidatePath('/dashboard/sprints-v2')
  return { data }
}

export async function deleteSprintTask(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Get task to find sprint_id
  const { data: task } = await supabase
    .from('sprint_tasks')
    .select('sprint_id')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('sprint_tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  // Update sprint task counts
  if (task) {
    await updateSprintTaskCounts(task.sprint_id)
  }

  revalidatePath('/dashboard/sprints-v2')
  return { success: true }
}

async function updateSprintTaskCounts(sprintId: string) {
  const supabase = createServerActionClient({ cookies })

  // Get task counts by status
  const { data: tasks } = await supabase
    .from('sprint_tasks')
    .select('status, story_points')
    .eq('sprint_id', sprintId)

  if (!tasks) return

  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'done').length
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length
  const blockedTasks = tasks.filter(t => t.status === 'blocked').length
  const burned = tasks.filter(t => t.status === 'done').reduce((sum, t) => sum + (t.story_points || 0), 0)

  await supabase
    .from('sprints')
    .update({
      total_tasks: totalTasks,
      completed_tasks: completedTasks,
      in_progress_tasks: inProgressTasks,
      blocked_tasks: blockedTasks,
      burned
    })
    .eq('id', sprintId)
}

export async function getSprints(filters?: {
  status?: string
  teamName?: string
}) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  let query = supabase
    .from('sprints')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('start_date', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.teamName) {
    query = query.ilike('team_name', `%${filters.teamName}%`)
  }

  const { data, error } = await query.limit(50)

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function getSprintTasks(sprintId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('sprint_tasks')
    .select('*')
    .eq('sprint_id', sprintId)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data }
}
