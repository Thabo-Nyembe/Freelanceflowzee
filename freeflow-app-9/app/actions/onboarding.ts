'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

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

export async function createOnboardingProgram(input: CreateProgramInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/onboarding-v2')
  return { data }
}

export async function updateOnboardingProgram(id: string, input: UpdateProgramInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('onboarding_programs')
    .update(input)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/onboarding-v2')
  return { data }
}

export async function startOnboardingProgram(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/onboarding-v2')
  return { data }
}

export async function completeOnboardingProgram(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/onboarding-v2')
  return { data }
}

export async function deleteOnboardingProgram(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('onboarding_programs')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/onboarding-v2')
  return { success: true }
}

export async function sendWelcomeEmail(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/onboarding-v2')
  return { data }
}

export async function markEquipmentProvided(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/onboarding-v2')
  return { data }
}

export async function grantSystemAccess(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/onboarding-v2')
  return { data }
}

export async function createOnboardingTask(input: CreateTaskInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
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
    return { error: error.message }
  }

  // Update program total_tasks count
  await updateProgramTaskCounts(input.program_id)

  revalidatePath('/dashboard/onboarding-v2')
  return { data }
}

export async function updateOnboardingTask(id: string, input: UpdateTaskInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('onboarding_tasks')
    .update(input)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Update program task counts if status changed
  if (input.status && data) {
    await updateProgramTaskCounts(data.program_id)
  }

  revalidatePath('/dashboard/onboarding-v2')
  return { data }
}

export async function completeOnboardingTask(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
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
    return { error: error.message }
  }

  // Update program task counts
  if (data) {
    await updateProgramTaskCounts(data.program_id)
  }

  revalidatePath('/dashboard/onboarding-v2')
  return { data }
}

export async function deleteOnboardingTask(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
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
    return { error: error.message }
  }

  // Update program task counts
  if (task) {
    await updateProgramTaskCounts(task.program_id)
  }

  revalidatePath('/dashboard/onboarding-v2')
  return { success: true }
}

async function updateProgramTaskCounts(programId: string) {
  const supabase = createServerActionClient({ cookies })

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
}) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
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
    return { error: error.message }
  }

  return { data }
}

export async function getOnboardingTasks(programId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('onboarding_tasks')
    .select('*')
    .eq('program_id', programId)
    .order('order_index', { ascending: true })

  if (error) {
    return { error: error.message }
  }

  return { data }
}
