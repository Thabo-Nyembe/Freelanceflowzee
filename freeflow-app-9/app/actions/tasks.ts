/**
 * Server Actions for Tasks Management
 *
 * Provides type-safe CRUD operations for tasks with:
 * - Zod validation
 * - Permission checks
 * - Structured error responses
 * - Full TypeScript types
 * - Logging and error tracking
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  createTaskSchema,
  updateTaskSchema,
  uuidSchema,
  CreateTask,
  UpdateTask
} from '@/lib/validations'
import {
  actionSuccess,
  actionError,
  actionValidationError,
  ActionResult
} from '@/lib/api/response'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('tasks-actions')

// ============================================
// TYPE DEFINITIONS
// ============================================

interface Task {
  id: string
  user_id: string
  title: string
  description?: string | null
  project_id?: string | null
  assignee_id?: string | null
  status: 'todo' | 'in_progress' | 'in_review' | 'blocked' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date?: string | null
  estimated_hours?: number | null
  actual_hours?: number | null
  tags?: string[]
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
  completed_at?: string | null
  deleted_at?: string | null
}

// ============================================
// TASK ACTIONS
// ============================================

/**
 * Create a new task
 */
export async function createTask(
  data: CreateTask
): Promise<ActionResult<Task>> {
  const supabase = await createClient()

  try {
    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Validate input
    const validation = createTaskSchema.safeParse(data)
    if (!validation.success) {
      return actionValidationError(validation.error.errors)
    }

    const taskData = validation.data

    // Insert task
    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        title: taskData.title,
        description: taskData.description,
        project_id: taskData.project_id,
        assignee_id: taskData.assignee_id,
        status: taskData.status || 'todo',
        priority: taskData.priority || 'medium',
        due_date: taskData.due_date,
        estimated_hours: taskData.estimated_hours,
        actual_hours: taskData.actual_hours,
        tags: taskData.tags,
        metadata: taskData.metadata
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create task', { error: error.message, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Task created', { taskId: task.id, title: task.title, userId: user.id })
    revalidatePath('/dashboard/tasks-v2')
    revalidatePath('/dashboard/projects-hub-v2')

    return actionSuccess(task, 'Task created successfully')
  } catch (error) {
    logger.error('Unexpected error creating task', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Update an existing task
 */
export async function updateTask(
  id: string,
  data: UpdateTask
): Promise<ActionResult<Task>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid task ID', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Validate input
    const validation = updateTaskSchema.safeParse(data)
    if (!validation.success) {
      return actionValidationError(validation.error.errors)
    }

    const updateData = validation.data

    // If status is being changed to completed, set completed_at
    if (updateData.status === 'completed') {
      (updateData as Record<string, unknown>).completed_at = new Date().toISOString()
    }

    // Update task
    const { data: task, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update task', { error: error.message, taskId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    if (!task) {
      return actionError('Task not found or access denied', 'NOT_FOUND')
    }

    logger.info('Task updated', { taskId: id, userId: user.id })
    revalidatePath('/dashboard/tasks-v2')
    revalidatePath('/dashboard/projects-hub-v2')

    return actionSuccess(task, 'Task updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating task', { error, taskId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Delete a task (soft delete)
 */
export async function deleteTask(
  id: string
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid task ID', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Soft delete task
    const { error } = await supabase
      .from('tasks')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete task', { error: error.message, taskId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Task deleted', { taskId: id, userId: user.id })
    revalidatePath('/dashboard/tasks-v2')
    revalidatePath('/dashboard/projects-hub-v2')

    return actionSuccess({ id }, 'Task deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting task', { error, taskId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Assign task to a user
 */
export async function assignTask(
  id: string,
  assigneeId: string
): Promise<ActionResult<Task>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid task ID', 'VALIDATION_ERROR')
    }

    // Validate assignee ID
    const assigneeValidation = uuidSchema.safeParse(assigneeId)
    if (!assigneeValidation.success) {
      return actionError('Invalid assignee ID', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Update task
    const { data: task, error } = await supabase
      .from('tasks')
      .update({ assignee_id: assigneeId })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to assign task', { error: error.message, taskId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    if (!task) {
      return actionError('Task not found or access denied', 'NOT_FOUND')
    }

    logger.info('Task assigned', { taskId: id, assigneeId, userId: user.id })
    revalidatePath('/dashboard/tasks-v2')
    revalidatePath('/dashboard/projects-hub-v2')

    return actionSuccess(task, 'Task assigned successfully')
  } catch (error) {
    logger.error('Unexpected error assigning task', { error, taskId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Update task status
 */
export async function updateTaskStatus(
  id: string,
  status: 'todo' | 'in_progress' | 'in_review' | 'blocked' | 'completed' | 'cancelled'
): Promise<ActionResult<Task>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid task ID', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const updateData: Record<string, unknown> = { status }

    // If status is completed, set completed_at
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString()
    }

    // Update task
    const { data: task, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update task status', { error: error.message, taskId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    if (!task) {
      return actionError('Task not found or access denied', 'NOT_FOUND')
    }

    logger.info('Task status updated', { taskId: id, status, userId: user.id })
    revalidatePath('/dashboard/tasks-v2')
    revalidatePath('/dashboard/projects-hub-v2')

    return actionSuccess(task, 'Task status updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating task status', { error, taskId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Update task priority
 */
export async function updateTaskPriority(
  id: string,
  priority: 'low' | 'medium' | 'high' | 'urgent'
): Promise<ActionResult<Task>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid task ID', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Update task
    const { data: task, error } = await supabase
      .from('tasks')
      .update({ priority })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update task priority', { error: error.message, taskId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    if (!task) {
      return actionError('Task not found or access denied', 'NOT_FOUND')
    }

    logger.info('Task priority updated', { taskId: id, priority, userId: user.id })
    revalidatePath('/dashboard/tasks-v2')
    revalidatePath('/dashboard/projects-hub-v2')

    return actionSuccess(task, 'Task priority updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating task priority', { error, taskId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Bulk delete tasks
 */
export async function bulkDeleteTasks(
  ids: string[]
): Promise<ActionResult<{ success: boolean; count: number }>> {
  const supabase = await createClient()

  try {
    // Validate IDs
    if (!Array.isArray(ids) || ids.length === 0) {
      return actionError('Invalid task IDs array', 'VALIDATION_ERROR')
    }

    for (const id of ids) {
      const validation = uuidSchema.safeParse(id)
      if (!validation.success) {
        return actionError('Invalid task ID in array', 'VALIDATION_ERROR')
      }
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Bulk delete
    const { error } = await supabase
      .from('tasks')
      .update({ deleted_at: new Date().toISOString() })
      .in('id', ids)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to bulk delete tasks', { error: error.message, count: ids.length, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Tasks bulk deleted', { count: ids.length, userId: user.id })
    revalidatePath('/dashboard/tasks-v2')
    revalidatePath('/dashboard/projects-hub-v2')

    return actionSuccess({ success: true, count: ids.length }, `${ids.length} tasks deleted`)
  } catch (error) {
    logger.error('Unexpected error bulk deleting tasks', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Get tasks by project
 */
export async function getTasksByProject(
  projectId: string
): Promise<ActionResult<Task[]>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(projectId)
    if (!idValidation.success) {
      return actionError('Invalid project ID', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Get tasks
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('project_id', projectId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to get tasks by project', { error: error.message, projectId, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Tasks retrieved by project', { projectId, count: tasks?.length || 0, userId: user.id })

    return actionSuccess(tasks || [], 'Tasks retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error getting tasks by project', { error, projectId })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Get tasks by assignee
 */
export async function getTasksByAssignee(
  assigneeId: string
): Promise<ActionResult<Task[]>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(assigneeId)
    if (!idValidation.success) {
      return actionError('Invalid assignee ID', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Get tasks
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('assignee_id', assigneeId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to get tasks by assignee', { error: error.message, assigneeId, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Tasks retrieved by assignee', { assigneeId, count: tasks?.length || 0, userId: user.id })

    return actionSuccess(tasks || [], 'Tasks retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error getting tasks by assignee', { error, assigneeId })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
