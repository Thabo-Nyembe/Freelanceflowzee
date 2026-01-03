'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('onboarding-actions')

export interface CreateProgramInput {
  employee_name: string
  employee_email?: string
  role?: string
  department?: string
  employee_type?: string
  start_date?: string
  end_date?: string
  total_tasks?: number
  buddy_name?: string
  buddy_email?: string
  manager_name?: string
  manager_email?: string
}

export interface UpdateProgramInput {
  employee_name?: string
  employee_email?: string
  role?: string
  department?: string
  employee_type?: string
  status?: string
  start_date?: string
  end_date?: string
  completion_rate?: number
  tasks_completed?: number
  total_tasks?: number
  days_remaining?: number
  buddy_name?: string
  buddy_email?: string
  manager_name?: string
  manager_email?: string
  welcome_email_sent?: boolean
  equipment_provided?: boolean
  access_granted?: boolean
}

export interface CreateTaskInput {
  program_id: string
  task_name: string
  description?: string
  category?: string
  priority?: string
  due_date?: string
  assigned_to?: string
  order_index?: number
  is_required?: boolean
}

export interface UpdateTaskInput {
  task_name?: string
  description?: string
  category?: string
  status?: string
  priority?: string
  due_date?: string
  completed_date?: string
  assigned_to?: string
  order_index?: number
  is_required?: boolean
}

export async function createOnboardingProgram(input: CreateProgramInput): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const onboardingCode = `ONB-${Date.now().toString(36).toUpperCase()}`

    const { data, error } = await supabase
      .from('onboarding_programs')
      .insert({
        user_id: user.id,
        onboarding_code: onboardingCode,
        employee_name: input.employee_name,
        employee_email: input.employee_email,
        role: input.role,
        department: input.department,
        employee_type: input.employee_type || 'full-time',
        status: 'pending',
        start_date: input.start_date,
        end_date: input.end_date,
        total_tasks: input.total_tasks || 0,
        tasks_completed: 0,
        completion_rate: 0,
        days_remaining: 30,
        buddy_name: input.buddy_name,
        buddy_email: input.buddy_email,
        manager_name: input.manager_name,
        manager_email: input.manager_email
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create onboarding program', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/onboarding-v2')
    return actionSuccess(data, 'Onboarding program created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating onboarding program', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateOnboardingProgram(id: string, input: UpdateProgramInput): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('onboarding_programs')
      .update(input)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update onboarding program', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/onboarding-v2')
    return actionSuccess(data, 'Onboarding program updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating onboarding program', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function startOnboardingProgram(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('onboarding_programs')
      .update({
        status: 'in-progress',
        start_date: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to start onboarding program', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/onboarding-v2')
    return actionSuccess(data, 'Onboarding program started successfully')
  } catch (error: any) {
    logger.error('Unexpected error starting onboarding program', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function completeOnboardingProgram(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('onboarding_programs')
      .update({
        status: 'completed',
        end_date: new Date().toISOString(),
        completion_rate: 100,
        days_remaining: 0
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to complete onboarding program', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/onboarding-v2')
    return actionSuccess(data, 'Onboarding program completed successfully')
  } catch (error: any) {
    logger.error('Unexpected error completing onboarding program', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteOnboardingProgram(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('onboarding_programs')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete onboarding program', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/onboarding-v2')
    return actionSuccess({ success: true }, 'Onboarding program deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error deleting onboarding program', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function sendWelcomeEmail(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // In a real implementation, this would send an actual email
    const { data, error } = await supabase
      .from('onboarding_programs')
      .update({
        welcome_email_sent: true
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to send welcome email', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/onboarding-v2')
    return actionSuccess(data, 'Welcome email sent successfully')
  } catch (error: any) {
    logger.error('Unexpected error sending welcome email', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function markEquipmentProvided(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('onboarding_programs')
      .update({
        equipment_provided: true
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to mark equipment provided', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/onboarding-v2')
    return actionSuccess(data, 'Equipment marked as provided')
  } catch (error: any) {
    logger.error('Unexpected error marking equipment provided', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function grantSystemAccess(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('onboarding_programs')
      .update({
        access_granted: true
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to grant system access', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/onboarding-v2')
    return actionSuccess(data, 'System access granted successfully')
  } catch (error: any) {
    logger.error('Unexpected error granting system access', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function createOnboardingTask(input: CreateTaskInput): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const taskCode = `TASK-${Date.now().toString(36).toUpperCase()}`

    const { data, error } = await supabase
      .from('onboarding_tasks')
      .insert({
        user_id: user.id,
        program_id: input.program_id,
        task_code: taskCode,
        task_name: input.task_name,
        description: input.description,
        category: input.category,
        status: 'pending',
        priority: input.priority || 'medium',
        due_date: input.due_date,
        assigned_to: input.assigned_to,
        order_index: input.order_index || 0,
        is_required: input.is_required ?? true
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create onboarding task', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    // Update program total_tasks count
    await updateProgramTaskCounts(input.program_id)

    revalidatePath('/dashboard/onboarding-v2')
    return actionSuccess(data, 'Onboarding task created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating onboarding task', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateOnboardingTask(id: string, input: UpdateTaskInput): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('onboarding_tasks')
      .update(input)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update onboarding task', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    // Update program task counts if status changed
    if (input.status && data) {
      await updateProgramTaskCounts(data.program_id)
    }

    revalidatePath('/dashboard/onboarding-v2')
    return actionSuccess(data, 'Onboarding task updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating onboarding task', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function completeOnboardingTask(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('onboarding_tasks')
      .update({
        status: 'completed',
        completed_date: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to complete onboarding task', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    // Update program task counts
    if (data) {
      await updateProgramTaskCounts(data.program_id)
    }

    revalidatePath('/dashboard/onboarding-v2')
    return actionSuccess(data, 'Onboarding task completed successfully')
  } catch (error: any) {
    logger.error('Unexpected error completing onboarding task', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteOnboardingTask(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Get task to find program_id
    const { data: task } = await supabase
      .from('onboarding_tasks')
      .select('program_id')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('onboarding_tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete onboarding task', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    // Update program task counts
    if (task) {
      await updateProgramTaskCounts(task.program_id)
    }

    revalidatePath('/dashboard/onboarding-v2')
    return actionSuccess({ success: true }, 'Onboarding task deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error deleting onboarding task', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

async function updateProgramTaskCounts(programId: string) {
  const supabase = createClient()

  // Get task counts
  const { data: tasks } = await supabase
    .from('onboarding_tasks')
    .select('status')
    .eq('program_id', programId)

  if (!tasks) return

  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  await supabase
    .from('onboarding_programs')
    .update({
      total_tasks: totalTasks,
      tasks_completed: completedTasks,
      completion_rate: completionRate
    })
    .eq('id', programId)
}

export async function getOnboardingPrograms(filters?: {
  status?: string
  department?: string
  employeeType?: string
}): Promise<ActionResult<any[]>> {
  try {
    const supabase = createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    let query = supabase
      .from('onboarding_programs')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('start_date', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.department) {
      query = query.eq('department', filters.department)
    }
    if (filters?.employeeType) {
      query = query.eq('employee_type', filters.employeeType)
    }

    const { data, error } = await query.limit(100)

    if (error) {
      logger.error('Failed to get onboarding programs', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    return actionSuccess(data || [], 'Onboarding programs retrieved successfully')
  } catch (error: any) {
    logger.error('Unexpected error getting onboarding programs', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getOnboardingTasks(programId: string): Promise<ActionResult<any[]>> {
  try {
    const supabase = createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('onboarding_tasks')
      .select('*')
      .eq('program_id', programId)
      .order('order_index', { ascending: true })

    if (error) {
      logger.error('Failed to get onboarding tasks', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    return actionSuccess(data || [], 'Onboarding tasks retrieved successfully')
  } catch (error: any) {
    logger.error('Unexpected error getting onboarding tasks', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
