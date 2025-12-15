'use client'

import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-query'
import { useCallback, useMemo } from 'react'

export interface Sprint {
  id: string
  user_id: string
  sprint_code: string
  name: string
  description: string | null
  status: string
  start_date: string | null
  end_date: string | null
  days_remaining: number
  total_tasks: number
  completed_tasks: number
  in_progress_tasks: number
  blocked_tasks: number
  velocity: number
  team_name: string | null
  scrum_master: string | null
  capacity: number
  committed: number
  burned: number
  goal: string | null
  retrospective: string | null
  configuration: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface SprintTask {
  id: string
  user_id: string
  sprint_id: string
  task_code: string
  title: string
  description: string | null
  status: string
  priority: string
  assignee_name: string | null
  assignee_email: string | null
  story_points: number
  progress: number
  estimated_hours: number
  actual_hours: number
  due_date: string | null
  completed_date: string | null
  labels: string[]
  configuration: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface SprintFilters {
  status?: string
  teamName?: string
}

export interface TaskFilters {
  sprintId?: string
  status?: string
  priority?: string
  assignee?: string
}

export interface SprintStats {
  total: number
  active: number
  planning: number
  completed: number
  avgVelocity: number
  totalTasks: number
  completedTasks: number
  completionRate: number
}

export function useSprints(initialSprints: Sprint[] = [], filters: SprintFilters = {}) {
  const queryKey = ['sprints', JSON.stringify(filters)]

  const queryFn = useCallback(async (supabase: any) => {
    let query = supabase
      .from('sprints')
      .select('*')
      .is('deleted_at', null)
      .order('start_date', { ascending: false })

    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.teamName) {
      query = query.ilike('team_name', `%${filters.teamName}%`)
    }

    const { data, error } = await query.limit(100)
    if (error) throw error
    return data as Sprint[]
  }, [filters])

  const { data: sprints, isLoading, error, refetch } = useSupabaseQuery<Sprint[]>(
    queryKey,
    queryFn,
    { initialData: initialSprints }
  )

  const stats: SprintStats = useMemo(() => {
    const sprintList = sprints || []
    const completedSprints = sprintList.filter(s => s.status === 'completed' && s.velocity > 0)

    return {
      total: sprintList.length,
      active: sprintList.filter(s => s.status === 'active').length,
      planning: sprintList.filter(s => s.status === 'planning').length,
      completed: sprintList.filter(s => s.status === 'completed').length,
      avgVelocity: completedSprints.length > 0
        ? completedSprints.reduce((sum, s) => sum + s.velocity, 0) / completedSprints.length
        : 0,
      totalTasks: sprintList.reduce((sum, s) => sum + s.total_tasks, 0),
      completedTasks: sprintList.reduce((sum, s) => sum + s.completed_tasks, 0),
      completionRate: sprintList.reduce((sum, s) => sum + s.total_tasks, 0) > 0
        ? (sprintList.reduce((sum, s) => sum + s.completed_tasks, 0) / sprintList.reduce((sum, s) => sum + s.total_tasks, 0)) * 100
        : 0
    }
  }, [sprints])

  return { sprints: sprints || [], stats, isLoading, error, refetch }
}

export function useSprintTasks(initialTasks: SprintTask[] = [], filters: TaskFilters = {}) {
  const queryKey = ['sprint-tasks', JSON.stringify(filters)]

  const queryFn = useCallback(async (supabase: any) => {
    let query = supabase
      .from('sprint_tasks')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters.sprintId) {
      query = query.eq('sprint_id', filters.sprintId)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.priority) {
      query = query.eq('priority', filters.priority)
    }
    if (filters.assignee) {
      query = query.ilike('assignee_name', `%${filters.assignee}%`)
    }

    const { data, error } = await query.limit(200)
    if (error) throw error
    return data as SprintTask[]
  }, [filters])

  const { data: tasks, isLoading, error, refetch } = useSupabaseQuery<SprintTask[]>(
    queryKey,
    queryFn,
    { initialData: initialTasks }
  )

  return { tasks: tasks || [], isLoading, error, refetch }
}

export function useSprintMutations() {
  const createSprintMutation = useSupabaseMutation<Partial<Sprint>, Sprint>(
    async (supabase, sprintData) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const sprintCode = `SPR-${Date.now().toString(36).toUpperCase()}`

      const { data, error } = await supabase
        .from('sprints')
        .insert({
          ...sprintData,
          user_id: user.id,
          sprint_code: sprintCode
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    { invalidateKeys: [['sprints']] }
  )

  const updateSprintMutation = useSupabaseMutation<{ id: string; updates: Partial<Sprint> }, Sprint>(
    async (supabase, { id, updates }) => {
      const { data, error } = await supabase
        .from('sprints')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    { invalidateKeys: [['sprints']] }
  )

  const deleteSprintMutation = useSupabaseMutation<string, void>(
    async (supabase, id) => {
      const { error } = await supabase
        .from('sprints')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
    },
    { invalidateKeys: [['sprints']] }
  )

  const startSprintMutation = useSupabaseMutation<string, Sprint>(
    async (supabase, id) => {
      const { data, error } = await supabase
        .from('sprints')
        .update({
          status: 'active',
          start_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    { invalidateKeys: [['sprints']] }
  )

  const completeSprintMutation = useSupabaseMutation<{ id: string; retrospective?: string }, Sprint>(
    async (supabase, { id, retrospective }) => {
      const { data, error } = await supabase
        .from('sprints')
        .update({
          status: 'completed',
          end_date: new Date().toISOString().split('T')[0],
          days_remaining: 0,
          retrospective
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    { invalidateKeys: [['sprints']] }
  )

  const createTaskMutation = useSupabaseMutation<Partial<SprintTask>, SprintTask>(
    async (supabase, taskData) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const taskCode = `TASK-${Date.now().toString(36).toUpperCase()}`

      const { data, error } = await supabase
        .from('sprint_tasks')
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
    { invalidateKeys: [['sprint-tasks'], ['sprints']] }
  )

  const updateTaskMutation = useSupabaseMutation<{ id: string; updates: Partial<SprintTask> }, SprintTask>(
    async (supabase, { id, updates }) => {
      const { data, error } = await supabase
        .from('sprint_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    { invalidateKeys: [['sprint-tasks'], ['sprints']] }
  )

  const completeTaskMutation = useSupabaseMutation<string, SprintTask>(
    async (supabase, id) => {
      const { data, error } = await supabase
        .from('sprint_tasks')
        .update({
          status: 'done',
          progress: 100,
          completed_date: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    { invalidateKeys: [['sprint-tasks'], ['sprints']] }
  )

  return {
    createSprint: createSprintMutation.mutate,
    updateSprint: updateSprintMutation.mutate,
    deleteSprint: deleteSprintMutation.mutate,
    startSprint: startSprintMutation.mutate,
    completeSprint: completeSprintMutation.mutate,
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    completeTask: completeTaskMutation.mutate,
    isCreatingSprint: createSprintMutation.isPending,
    isUpdatingSprint: updateSprintMutation.isPending,
    isDeletingSprint: deleteSprintMutation.isPending,
    isStartingSprint: startSprintMutation.isPending,
    isCompletingSprint: completeSprintMutation.isPending,
    isCreatingTask: createTaskMutation.isPending,
    isUpdatingTask: updateTaskMutation.isPending,
    isCompletingTask: completeTaskMutation.isPending
  }
}

export function getSprintStatusColor(status: string): string {
  switch (status) {
    case 'planning': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'active': return 'bg-green-100 text-green-800 border-green-200'
    case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200'
    case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function getTaskStatusColor(status: string): string {
  switch (status) {
    case 'todo': return 'bg-gray-100 text-gray-800 border-gray-200'
    case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'review': return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'done': return 'bg-green-100 text-green-800 border-green-200'
    case 'blocked': return 'bg-red-100 text-red-800 border-red-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function getTaskPriorityColor(priority: string): string {
  switch (priority) {
    case 'critical': return 'bg-red-100 text-red-800 border-red-200'
    case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
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

export function getCompletionPercentage(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}
