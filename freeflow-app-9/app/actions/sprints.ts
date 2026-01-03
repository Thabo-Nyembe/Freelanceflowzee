'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, type ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'
import { uuidSchema } from '@/lib/validations'

const logger = createFeatureLogger('sprints')

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

interface Sprint {
  id: string
  user_id: string
  sprint_code: string
  name: string
  description?: string
  status: string
  start_date?: string
  end_date?: string
  days_remaining: number
  total_tasks: number
  completed_tasks: number
  in_progress_tasks: number
  blocked_tasks: number
  velocity?: number
  team_name?: string
  scrum_master?: string
  capacity: number
  committed: number
  burned: number
  goal?: string
  retrospective?: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

interface SprintTask {
  id: string
  user_id: string
  sprint_id: string
  task_code: string
  title: string
  description?: string
  status: string
  priority: string
  assignee_name?: string
  assignee_email?: string
  story_points: number
  progress: number
  estimated_hours: number
  actual_hours?: number
  due_date?: string
  completed_date?: string
  labels: string[]
  created_at: string
  updated_at: string
}

export async function createSprint(input: CreateSprintInput): Promise<ActionResult<Sprint>> {
  try {
    if (!input.name || input.name.trim().length === 0) {
      return actionError('Sprint name is required', 400)
    }

    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.error('Authentication failed', { error: authError })
      return actionError('Unauthorized', 401)
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
      logger.error('Failed to create sprint', { error, userId: user.id })
      return actionError('Failed to create sprint', 500)
    }

    revalidatePath('/dashboard/sprints-v2')
    return actionSuccess(data, 'Sprint created successfully')
  } catch (error) {
    logger.error('Unexpected error creating sprint', { error })
    return actionError('An unexpected error occurred', 500)
  }
}

export async function updateSprint(id: string, input: UpdateSprintInput): Promise<ActionResult<Sprint>> {
  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid sprint ID format', 400)
    }

    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.error('Authentication failed', { error: authError })
      return actionError('Unauthorized', 401)
    }

    const { data, error } = await supabase
      .from('sprints')
      .update(input)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update sprint', { error, sprintId: id, userId: user.id })
      return actionError('Failed to update sprint', 500)
    }

    revalidatePath('/dashboard/sprints-v2')
    return actionSuccess(data, 'Sprint updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating sprint', { error, sprintId: id })
    return actionError('An unexpected error occurred', 500)
  }
}

export async function startSprint(id: string): Promise<ActionResult<Sprint>> {
  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid sprint ID format', 400)
    }

    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.error('Authentication failed', { error: authError })
      return actionError('Unauthorized', 401)
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
      logger.error('Failed to start sprint', { error, sprintId: id, userId: user.id })
      return actionError('Failed to start sprint', 500)
    }

    revalidatePath('/dashboard/sprints-v2')
    return actionSuccess(data, 'Sprint started successfully')
  } catch (error) {
    logger.error('Unexpected error starting sprint', { error, sprintId: id })
    return actionError('An unexpected error occurred', 500)
  }
}

export async function completeSprint(id: string, retrospective?: string): Promise<ActionResult<Sprint>> {
  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid sprint ID format', 400)
    }

    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.error('Authentication failed', { error: authError })
      return actionError('Unauthorized', 401)
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
      logger.error('Failed to complete sprint', { error, sprintId: id, userId: user.id })
      return actionError('Failed to complete sprint', 500)
    }

    revalidatePath('/dashboard/sprints-v2')
    return actionSuccess(data, 'Sprint completed successfully')
  } catch (error) {
    logger.error('Unexpected error completing sprint', { error, sprintId: id })
    return actionError('An unexpected error occurred', 500)
  }
}

export async function deleteSprint(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid sprint ID format', 400)
    }

    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.error('Authentication failed', { error: authError })
      return actionError('Unauthorized', 401)
    }

    const { error } = await supabase
      .from('sprints')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete sprint', { error, sprintId: id, userId: user.id })
      return actionError('Failed to delete sprint', 500)
    }

    revalidatePath('/dashboard/sprints-v2')
    return actionSuccess({ success: true }, 'Sprint deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting sprint', { error, sprintId: id })
    return actionError('An unexpected error occurred', 500)
  }
}

export async function createSprintTask(input: CreateTaskInput): Promise<ActionResult<SprintTask>> {
  try {
    const sprintIdValidation = uuidSchema.safeParse(input.sprint_id)
    if (!sprintIdValidation.success) {
      return actionError('Invalid sprint ID format', 400)
    }

    if (!input.title || input.title.trim().length === 0) {
      return actionError('Task title is required', 400)
    }

    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.error('Authentication failed', { error: authError })
      return actionError('Unauthorized', 401)
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
      logger.error('Failed to create sprint task', { error, sprintId: input.sprint_id, userId: user.id })
      return actionError('Failed to create sprint task', 500)
    }

    // Update sprint task counts
    await updateSprintTaskCounts(input.sprint_id)

    revalidatePath('/dashboard/sprints-v2')
    return actionSuccess(data, 'Sprint task created successfully')
  } catch (error) {
    logger.error('Unexpected error creating sprint task', { error })
    return actionError('An unexpected error occurred', 500)
  }
}

export async function updateSprintTask(id: string, input: UpdateTaskInput): Promise<ActionResult<SprintTask>> {
  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid task ID format', 400)
    }

    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.error('Authentication failed', { error: authError })
      return actionError('Unauthorized', 401)
    }

    const { data, error } = await supabase
      .from('sprint_tasks')
      .update(input)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update sprint task', { error, taskId: id, userId: user.id })
      return actionError('Failed to update sprint task', 500)
    }

    // Update sprint task counts if status changed
    if (input.status && data) {
      await updateSprintTaskCounts(data.sprint_id)
    }

    revalidatePath('/dashboard/sprints-v2')
    return actionSuccess(data, 'Sprint task updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating sprint task', { error, taskId: id })
    return actionError('An unexpected error occurred', 500)
  }
}

export async function completeSprintTask(id: string): Promise<ActionResult<SprintTask>> {
  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid task ID format', 400)
    }

    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.error('Authentication failed', { error: authError })
      return actionError('Unauthorized', 401)
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
      logger.error('Failed to complete sprint task', { error, taskId: id, userId: user.id })
      return actionError('Failed to complete sprint task', 500)
    }

    // Update sprint task counts
    if (data) {
      await updateSprintTaskCounts(data.sprint_id)
    }

    revalidatePath('/dashboard/sprints-v2')
    return actionSuccess(data, 'Sprint task completed successfully')
  } catch (error) {
    logger.error('Unexpected error completing sprint task', { error, taskId: id })
    return actionError('An unexpected error occurred', 500)
  }
}

export async function deleteSprintTask(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid task ID format', 400)
    }

    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.error('Authentication failed', { error: authError })
      return actionError('Unauthorized', 401)
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
      logger.error('Failed to delete sprint task', { error, taskId: id, userId: user.id })
      return actionError('Failed to delete sprint task', 500)
    }

    // Update sprint task counts
    if (task) {
      await updateSprintTaskCounts(task.sprint_id)
    }

    revalidatePath('/dashboard/sprints-v2')
    return actionSuccess({ success: true }, 'Sprint task deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting sprint task', { error, taskId: id })
    return actionError('An unexpected error occurred', 500)
  }
}

async function updateSprintTaskCounts(sprintId: string): Promise<void> {
  try {
    const supabase = createClient()

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
  } catch (error) {
    logger.error('Failed to update sprint task counts', { error, sprintId })
  }
}

export async function getSprints(filters?: {
  status?: string
  teamName?: string
}): Promise<ActionResult<Sprint[]>> {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.error('Authentication failed', { error: authError })
      return actionError('Unauthorized', 401)
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
      logger.error('Failed to fetch sprints', { error, userId: user.id, filters })
      return actionError('Failed to fetch sprints', 500)
    }

    return actionSuccess(data, 'Sprints fetched successfully')
  } catch (error) {
    logger.error('Unexpected error fetching sprints', { error, filters })
    return actionError('An unexpected error occurred', 500)
  }
}

export async function getSprintTasks(sprintId: string): Promise<ActionResult<SprintTask[]>> {
  try {
    const sprintIdValidation = uuidSchema.safeParse(sprintId)
    if (!sprintIdValidation.success) {
      return actionError('Invalid sprint ID format', 400)
    }

    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      logger.error('Authentication failed', { error: authError })
      return actionError('Unauthorized', 401)
    }

    const { data, error } = await supabase
      .from('sprint_tasks')
      .select('*')
      .eq('sprint_id', sprintId)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to fetch sprint tasks', { error, sprintId, userId: user.id })
      return actionError('Failed to fetch sprint tasks', 500)
    }

    return actionSuccess(data, 'Sprint tasks fetched successfully')
  } catch (error) {
    logger.error('Unexpected error fetching sprint tasks', { error, sprintId })
    return actionError('An unexpected error occurred', 500)
  }
}
