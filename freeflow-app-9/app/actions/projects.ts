/**
 * Server Actions for Projects Management
 *
 * Provides type-safe CRUD operations for projects with:
 * - Zod validation
 * - Permission checks
 * - Structured error responses
 * - Full TypeScript types
 */

'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { hasPermission, canAccessResource } from '@/lib/auth/permissions'
import {
  createProjectSchema,
  updateProjectSchema,
  createTaskSchema,
  updateTaskSchema,
  uuidSchema,
  percentageSchema,
  CreateProject,
  UpdateProject,
  CreateTask,
  UpdateTask
} from '@/lib/validations'
import {
  actionSuccess,
  actionError,
  actionValidationError,
  ActionResult
} from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('projects-actions')

// ============================================
// PROJECT ACTIONS
// ============================================

/**
 * Create a new project
 */
export async function createProject(
  data: CreateProject
): Promise<ActionResult<{ id: string; name: string }>> {
  const supabase = createServerActionClient({ cookies })

  try {
    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Validate input
    const validation = createProjectSchema.safeParse(data)
    if (!validation.success) {
      return actionValidationError(validation.error.errors)
    }

    // Permission check
    const canWrite = await hasPermission('write')
    if (!canWrite) {
      return actionError('Permission denied: write access required', 'FORBIDDEN')
    }

    const projectData = validation.data

    // Insert project
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name: projectData.name,
        description: projectData.description,
        client_id: projectData.client_id,
        status: projectData.status || 'draft',
        priority: projectData.priority || 'medium',
        budget: projectData.budget,
        start_date: projectData.start_date,
        end_date: projectData.end_date,
        progress: projectData.progress || 0,
        tags: projectData.tags,
        metadata: projectData.metadata
      })
      .select('id, name')
      .single()

    if (error) {
      logger.error('Failed to create project', { error: error.message, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Project created', { projectId: project.id, name: project.name, userId: user.id })
    revalidatePath('/dashboard/projects-hub-v2')

    return actionSuccess(
      { id: project.id, name: project.name },
      'Project created successfully'
    )
  } catch (error) {
    logger.error('Unexpected error creating project', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Update an existing project
 */
export async function updateProject(
  id: string,
  data: UpdateProject
): Promise<ActionResult<{ id: string }>> {
  const supabase = createServerActionClient({ cookies })

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid project ID', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Validate input
    const validation = updateProjectSchema.safeParse(data)
    if (!validation.success) {
      return actionValidationError(validation.error.errors)
    }

    // Permission check
    const canWrite = await hasPermission('write')
    if (!canWrite) {
      return actionError('Permission denied: write access required', 'FORBIDDEN')
    }

    // Resource access check
    const canAccess = await canAccessResource('projects', id)
    if (!canAccess) {
      return actionError('Access denied: you cannot modify this project', 'FORBIDDEN')
    }

    // Update project
    const { data: project, error } = await supabase
      .from('projects')
      .update({
        ...validation.data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id')
      .single()

    if (error) {
      logger.error('Failed to update project', { error: error.message, projectId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Project updated', { projectId: id, userId: user.id })
    revalidatePath('/dashboard/projects-hub-v2')

    return actionSuccess({ id: project.id }, 'Project updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating project', { error, projectId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Update project progress
 */
export async function updateProjectProgress(
  id: string,
  progress: number
): Promise<ActionResult<{ id: string; progress: number }>> {
  // Validate progress
  const progressValidation = percentageSchema.safeParse(progress)
  if (!progressValidation.success) {
    return actionError('Progress must be between 0 and 100', 'VALIDATION_ERROR')
  }

  const result = await updateProject(id, { progress: progressValidation.data })
  if (!result.success) {
    return result
  }

  return actionSuccess(
    { id: result.data.id, progress: progressValidation.data },
    'Progress updated successfully'
  )
}

/**
 * Archive a project (soft delete)
 */
export async function archiveProject(
  id: string
): Promise<ActionResult<{ archived: boolean }>> {
  const supabase = createServerActionClient({ cookies })

  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid project ID', 'VALIDATION_ERROR')
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('projects')
      .update({
        archived_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to archive project', { error: error.message, projectId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Project archived', { projectId: id, userId: user.id })
    revalidatePath('/dashboard/projects-hub-v2')

    return actionSuccess({ archived: true }, 'Project archived successfully')
  } catch (error) {
    logger.error('Unexpected error archiving project', { error, projectId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Permanently delete a project
 */
export async function deleteProject(
  id: string
): Promise<ActionResult<{ deleted: boolean }>> {
  const supabase = createServerActionClient({ cookies })

  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid project ID', 'VALIDATION_ERROR')
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const canDelete = await hasPermission('delete')
    if (!canDelete) {
      return actionError('Permission denied: delete access required', 'FORBIDDEN')
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete project', { error: error.message, projectId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Project deleted', { projectId: id, userId: user.id })
    revalidatePath('/dashboard/projects-hub-v2')

    return actionSuccess({ deleted: true }, 'Project deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting project', { error, projectId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Get all projects for current user
 */
export async function getProjects(
  options: { includeArchived?: boolean } = {}
): Promise<ActionResult<Array<{ id: string; name: string; status: string }>>> {
  const supabase = createServerActionClient({ cookies })

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    let query = supabase
      .from('projects')
      .select('id, name, status, priority, progress, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (!options.includeArchived) {
      query = query.is('archived_at', null)
    }

    const { data, error } = await query

    if (error) {
      return actionError(error.message, 'DATABASE_ERROR')
    }

    return actionSuccess(data || [])
  } catch (error) {
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Get a single project by ID
 */
export async function getProjectById(
  id: string
): Promise<ActionResult<Record<string, unknown> | null>> {
  const supabase = createServerActionClient({ cookies })

  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid project ID', 'VALIDATION_ERROR')
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return actionSuccess(null)
      }
      return actionError(error.message, 'DATABASE_ERROR')
    }

    return actionSuccess(data)
  } catch (error) {
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// ============================================
// PROJECT TASK ACTIONS
// ============================================

/**
 * Create a new project task
 */
export async function createProjectTask(
  data: CreateTask & { project_id: string }
): Promise<ActionResult<{ id: string }>> {
  const supabase = createServerActionClient({ cookies })

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Validate project_id
    const projectIdValidation = uuidSchema.safeParse(data.project_id)
    if (!projectIdValidation.success) {
      return actionError('Invalid project ID', 'VALIDATION_ERROR')
    }

    // Validate task data
    const validation = createTaskSchema.safeParse(data)
    if (!validation.success) {
      return actionValidationError(validation.error.errors)
    }

    const taskData = validation.data

    const { data: task, error } = await supabase
      .from('project_tasks')
      .insert({
        user_id: user.id,
        project_id: data.project_id,
        title: taskData.title,
        description: taskData.description,
        status: taskData.status || 'todo',
        priority: taskData.priority || 'medium',
        assignee_id: taskData.assignee_id,
        due_date: taskData.due_date,
        estimated_hours: taskData.estimated_hours,
        tags: taskData.tags,
        metadata: taskData.metadata
      })
      .select('id')
      .single()

    if (error) {
      logger.error('Failed to create task', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Task created', { taskId: task.id, projectId: data.project_id })
    revalidatePath('/dashboard/projects-hub-v2')

    return actionSuccess({ id: task.id }, 'Task created successfully')
  } catch (error) {
    logger.error('Unexpected error creating task', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Update a project task
 */
export async function updateProjectTask(
  id: string,
  data: UpdateTask
): Promise<ActionResult<{ id: string }>> {
  const supabase = createServerActionClient({ cookies })

  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid task ID', 'VALIDATION_ERROR')
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const validation = updateTaskSchema.safeParse(data)
    if (!validation.success) {
      return actionValidationError(validation.error.errors)
    }

    const updateData: Record<string, unknown> = {
      ...validation.data,
      updated_at: new Date().toISOString()
    }

    // Set completed_at when marking as done
    if (validation.data.status === 'completed') {
      updateData.completed_at = new Date().toISOString()
    }

    const { data: task, error } = await supabase
      .from('project_tasks')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id')
      .single()

    if (error) {
      logger.error('Failed to update task', { error: error.message, taskId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Task updated', { taskId: id, userId: user.id })
    revalidatePath('/dashboard/projects-hub-v2')

    return actionSuccess({ id: task.id }, 'Task updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating task', { error, taskId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Delete a project task
 */
export async function deleteProjectTask(
  id: string
): Promise<ActionResult<{ deleted: boolean }>> {
  const supabase = createServerActionClient({ cookies })

  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid task ID', 'VALIDATION_ERROR')
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('project_tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Task deleted', { taskId: id, userId: user.id })
    revalidatePath('/dashboard/projects-hub-v2')

    return actionSuccess({ deleted: true }, 'Task deleted successfully')
  } catch (error) {
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Get all tasks for a project
 */
export async function getProjectTasks(
  projectId: string
): Promise<ActionResult<Array<Record<string, unknown>>>> {
  const supabase = createServerActionClient({ cookies })

  try {
    const idValidation = uuidSchema.safeParse(projectId)
    if (!idValidation.success) {
      return actionError('Invalid project ID', 'VALIDATION_ERROR')
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('project_tasks')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .order('position', { ascending: true })

    if (error) {
      return actionError(error.message, 'DATABASE_ERROR')
    }

    return actionSuccess(data || [])
  } catch (error) {
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Duplicate a project
 */
export async function duplicateProject(
  id: string
): Promise<ActionResult<{ id: string; name: string }>> {
  const supabase = createServerActionClient({ cookies })

  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid project ID', 'VALIDATION_ERROR')
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Get original project
    const { data: original, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !original) {
      return actionError('Project not found', 'NOT_FOUND')
    }

    // Create duplicate
    const { data: duplicate, error: insertError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name: `${original.name} (Copy)`,
        description: original.description,
        client_id: original.client_id,
        status: 'draft',
        priority: original.priority,
        budget: original.budget,
        tags: original.tags,
        metadata: original.metadata,
        progress: 0
      })
      .select('id, name')
      .single()

    if (insertError) {
      return actionError(insertError.message, 'DATABASE_ERROR')
    }

    logger.info('Project duplicated', {
      originalId: id,
      duplicateId: duplicate.id,
      userId: user.id
    })
    revalidatePath('/dashboard/projects-hub-v2')

    return actionSuccess(
      { id: duplicate.id, name: duplicate.name },
      'Project duplicated successfully'
    )
  } catch (error) {
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
