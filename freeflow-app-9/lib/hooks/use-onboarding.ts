'use client'

import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-query'
import { useCallback, useMemo } from 'react'

export interface OnboardingProgram {
  id: string
  user_id: string
  onboarding_code: string
  employee_name: string
  employee_email: string | null
  role: string | null
  department: string | null
  employee_type: string
  status: string
  start_date: string | null
  end_date: string | null
  completion_rate: number
  tasks_completed: number
  total_tasks: number
  days_remaining: number
  buddy_name: string | null
  buddy_email: string | null
  manager_name: string | null
  manager_email: string | null
  welcome_email_sent: boolean
  equipment_provided: boolean
  access_granted: boolean
  configuration: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface OnboardingTask {
  id: string
  user_id: string
  program_id: string
  task_code: string
  task_name: string
  description: string | null
  category: string | null
  status: string
  priority: string
  due_date: string | null
  completed_date: string | null
  assigned_to: string | null
  order_index: number
  is_required: boolean
  configuration: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface OnboardingFilters {
  status?: string
  department?: string
  employeeType?: string
}

export interface TaskFilters {
  programId?: string
  status?: string
  category?: string
  priority?: string
}

export interface OnboardingStats {
  total: number
  pending: number
  inProgress: number
  completed: number
  avgCompletionRate: number
  tasksCompleted: number
  totalTasks: number
  avgDaysToComplete: number
}

export function useOnboardingPrograms(initialPrograms: OnboardingProgram[] = [], filters: OnboardingFilters = {}) {
  const queryKey = ['onboarding-programs', JSON.stringify(filters)]

  const queryFn = useCallback(async (supabase: any) => {
    let query = supabase
      .from('onboarding_programs')
      .select('*')
      .is('deleted_at', null)
      .order('start_date', { ascending: false })

    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.department) {
      query = query.eq('department', filters.department)
    }
    if (filters.employeeType) {
      query = query.eq('employee_type', filters.employeeType)
    }

    const { data, error } = await query.limit(100)
    if (error) throw error
    return data as OnboardingProgram[]
  }, [filters])

  const { data: programs, isLoading, error, refetch } = useSupabaseQuery<OnboardingProgram[]>(
    queryKey,
    queryFn,
    { initialData: initialPrograms }
  )

  const stats: OnboardingStats = useMemo(() => {
    const programList = programs || []
    const completedPrograms = programList.filter(p => p.status === 'completed')

    let totalDays = 0
    completedPrograms.forEach(program => {
      if (program.start_date && program.end_date) {
        const start = new Date(program.start_date)
        const end = new Date(program.end_date)
        totalDays += (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      }
    })

    return {
      total: programList.length,
      pending: programList.filter(p => p.status === 'pending').length,
      inProgress: programList.filter(p => p.status === 'in-progress').length,
      completed: programList.filter(p => p.status === 'completed').length,
      avgCompletionRate: programList.length > 0
        ? programList.reduce((sum, p) => sum + Number(p.completion_rate), 0) / programList.length
        : 0,
      tasksCompleted: programList.reduce((sum, p) => sum + p.tasks_completed, 0),
      totalTasks: programList.reduce((sum, p) => sum + p.total_tasks, 0),
      avgDaysToComplete: completedPrograms.length > 0 ? totalDays / completedPrograms.length : 0
    }
  }, [programs])

  return { programs: programs || [], stats, isLoading, error, refetch }
}

export function useOnboardingTasks(initialTasks: OnboardingTask[] = [], filters: TaskFilters = {}) {
  const queryKey = ['onboarding-tasks', JSON.stringify(filters)]

  const queryFn = useCallback(async (supabase: any) => {
    let query = supabase
      .from('onboarding_tasks')
      .select('*')
      .order('order_index', { ascending: true })

    if (filters.programId) {
      query = query.eq('program_id', filters.programId)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.category) {
      query = query.eq('category', filters.category)
    }
    if (filters.priority) {
      query = query.eq('priority', filters.priority)
    }

    const { data, error } = await query.limit(200)
    if (error) throw error
    return data as OnboardingTask[]
  }, [filters])

  const { data: tasks, isLoading, error, refetch } = useSupabaseQuery<OnboardingTask[]>(
    queryKey,
    queryFn,
    { initialData: initialTasks }
  )

  return { tasks: tasks || [], isLoading, error, refetch }
}

export function useOnboardingMutations() {
  const createProgramMutation = useSupabaseMutation<Partial<OnboardingProgram>, OnboardingProgram>(
    async (supabase, programData) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const onboardingCode = `ONB-${Date.now().toString(36).toUpperCase()}`

      const { data, error } = await supabase
        .from('onboarding_programs')
        .insert({
          ...programData,
          user_id: user.id,
          onboarding_code: onboardingCode
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    { invalidateKeys: [['onboarding-programs']] }
  )

  const updateProgramMutation = useSupabaseMutation<{ id: string; updates: Partial<OnboardingProgram> }, OnboardingProgram>(
    async (supabase, { id, updates }) => {
      const { data, error } = await supabase
        .from('onboarding_programs')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    { invalidateKeys: [['onboarding-programs']] }
  )

  const deleteProgramMutation = useSupabaseMutation<string, void>(
    async (supabase, id) => {
      const { error } = await supabase
        .from('onboarding_programs')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
    },
    { invalidateKeys: [['onboarding-programs']] }
  )

  const createTaskMutation = useSupabaseMutation<Partial<OnboardingTask>, OnboardingTask>(
    async (supabase, taskData) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const taskCode = `TASK-${Date.now().toString(36).toUpperCase()}`

      const { data, error } = await supabase
        .from('onboarding_tasks')
        .insert({
          ...taskData,
          user_id: user.id,
          task_code: taskCode
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    { invalidateKeys: [['onboarding-tasks'], ['onboarding-programs']] }
  )

  const updateTaskMutation = useSupabaseMutation<{ id: string; updates: Partial<OnboardingTask> }, OnboardingTask>(
    async (supabase, { id, updates }) => {
      const { data, error } = await supabase
        .from('onboarding_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    { invalidateKeys: [['onboarding-tasks'], ['onboarding-programs']] }
  )

  const completeTaskMutation = useSupabaseMutation<string, OnboardingTask>(
    async (supabase, id) => {
      const { data, error } = await supabase
        .from('onboarding_tasks')
        .update({
          status: 'completed',
          completed_date: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    { invalidateKeys: [['onboarding-tasks'], ['onboarding-programs']] }
  )

  const deleteTaskMutation = useSupabaseMutation<string, void>(
    async (supabase, id) => {
      const { error } = await supabase
        .from('onboarding_tasks')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    { invalidateKeys: [['onboarding-tasks'], ['onboarding-programs']] }
  )

  return {
    createProgram: createProgramMutation.mutate,
    updateProgram: updateProgramMutation.mutate,
    deleteProgram: deleteProgramMutation.mutate,
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    completeTask: completeTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    isCreatingProgram: createProgramMutation.isPending,
    isUpdatingProgram: updateProgramMutation.isPending,
    isDeletingProgram: deleteProgramMutation.isPending,
    isCreatingTask: createTaskMutation.isPending,
    isUpdatingTask: updateTaskMutation.isPending,
    isCompletingTask: completeTaskMutation.isPending,
    isDeletingTask: deleteTaskMutation.isPending
  }
}

export function getProgramStatusColor(status: string): string {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'completed': return 'bg-green-100 text-green-800 border-green-200'
    case 'on-hold': return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function getTaskStatusColor(status: string): string {
  switch (status) {
    case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200'
    case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'completed': return 'bg-green-100 text-green-800 border-green-200'
    case 'blocked': return 'bg-red-100 text-red-800 border-red-200'
    case 'skipped': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function getTaskPriorityColor(priority: string): string {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800 border-red-200'
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'low': return 'bg-green-100 text-green-800 border-green-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function calculateDaysRemaining(endDate: string | null): number {
  if (!endDate) return 0
  const end = new Date(endDate)
  const now = new Date()
  const diff = end.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function getCompletionColor(rate: number): string {
  if (rate >= 90) return 'text-green-600'
  if (rate >= 70) return 'text-blue-600'
  if (rate >= 50) return 'text-yellow-600'
  return 'text-red-600'
}
