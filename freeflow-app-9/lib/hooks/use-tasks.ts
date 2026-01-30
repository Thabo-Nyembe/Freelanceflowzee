'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthUserId } from './use-auth-user-id'
import type { RealtimeChannel } from '@supabase/supabase-js'

// Demo mode detection
function isDemoModeEnabled(): boolean {
  if (typeof window === 'undefined') return false
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('demo') === 'true') return true
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'demo_mode' && value === 'true') return true
  }
  return false
}

// ============================================================================
// TYPES
// ============================================================================

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed' | 'cancelled' | 'blocked'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskCategory = 'work' | 'personal' | 'meeting' | 'break' | 'admin' | 'creative'
export type TaskType = 'task' | 'milestone' | 'bug' | 'feature' | 'improvement'

export interface ChecklistItem {
  id: string
  text: string
  completed: boolean
  created_at: string
}

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  category: TaskCategory
  type: TaskType
  user_id: string
  project_id: string | null
  parent_id: string | null
  assignee_id: string | null
  reviewer_id: string | null
  estimated_minutes: number
  actual_minutes: number
  start_date: string | null
  due_date: string | null
  completed_at: string | null
  position: number
  tags: string[]
  labels: string[]
  checklist: ChecklistItem[]
  dependencies: string[]
  blockers: string[]
  attachments: string[]
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  // Joined fields
  project?: { id: string; name: string } | null
  assignee?: { id: string; name: string; avatar_url: string | null } | null
  reviewer?: { id: string; name: string; avatar_url: string | null } | null
  creator?: { id: string; name: string; avatar_url: string | null } | null
}

export interface TimeEntry {
  id: string
  task_id: string
  user_id: string
  start_time: string
  end_time: string | null
  duration: number | null
  description: string
  billable: boolean
  created_at: string
}

export interface TaskStats {
  total: number
  completed: number
  in_progress: number
  todo: number
  overdue: number
  urgent: number
  total_estimated_minutes: number
  total_actual_minutes: number
  completion_rate: number
}

// ============================================================================
// EMPTY DEFAULTS
// ============================================================================

const emptyStats: TaskStats = {
  total: 0,
  completed: 0,
  in_progress: 0,
  todo: 0,
  overdue: 0,
  urgent: 0,
  total_estimated_minutes: 0,
  total_actual_minutes: 0,
  completion_rate: 0
}

// ============================================================================
// HOOK OPTIONS
// ============================================================================

interface UseTasksOptions {
  projectId?: string
  status?: TaskStatus | TaskStatus[]
  priority?: TaskPriority
  assigneeId?: string
  enableRealtime?: boolean
}

// ============================================================================
// MAIN HOOK - useTasks
// ============================================================================

export function useTasks(options: UseTasksOptions = {}) {
  const { projectId, status, priority, assigneeId, enableRealtime = true } = options

  const [tasks, setTasks] = useState<Task[]>([])
  const [currentTask, setCurrentTask] = useState<Task | null>(null)
  const [stats, setStats] = useState<TaskStats>(emptyStats)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null)

  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabase = useMemo(() => createClient(), [])
  const { getUserId, isSessionLoaded } = useAuthUserId()

  // ============================================================================
  // FETCH TASKS (via API to bypass RLS)
  // ============================================================================

  const fetchTasks = useCallback(async (filters?: {
    status?: string
    priority?: string
    search?: string
    projectId?: string
    assigneeId?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    limit?: number
  }) => {
    setIsLoading(true)
    setError(null)

    // In demo mode, add demo=true to query
    const isDemo = isDemoModeEnabled()

    try {
      // Build query parameters
      const params = new URLSearchParams()
      const statusValue = filters?.status || (Array.isArray(status) ? status.join(',') : status)
      if (statusValue && statusValue !== 'all') params.set('status', statusValue)
      if (filters?.priority || priority) params.set('priority', filters?.priority || priority || '')
      if (filters?.projectId || projectId) params.set('project_id', filters?.projectId || projectId || '')
      if (filters?.assigneeId || assigneeId) params.set('assignee_id', filters?.assigneeId || assigneeId || '')
      if (filters?.search) params.set('search', filters.search)
      if (filters?.sortBy) params.set('sort_by', filters.sortBy)
      if (filters?.sortOrder) params.set('sort_order', filters.sortOrder)
      if (filters?.limit) params.set('limit', String(filters.limit))

      // Fetch via API (uses service role key, bypasses RLS)
      if (isDemo) params.set('demo', 'true')
      const response = await fetch(`/api/tasks?${params.toString()}`, {
        credentials: 'include'
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch tasks')
      }

      // Handle demo mode
      if (result.demo) {
        const demoTasks = result.tasks || getDemoTasks()
        setTasks(demoTasks as Task[])
        setStats(result.stats || getDemoStats())
        setIsLoading(false)
        return { success: true, tasks: demoTasks, demo: true }
      }

      const fetchedTasks = (result.tasks || []) as Task[]
      setTasks(fetchedTasks)

      // Use stats from API or calculate locally
      const calculatedStats = result.stats || calculateStats(fetchedTasks)
      setStats(calculatedStats)

      return { success: true, tasks: fetchedTasks, stats: calculatedStats }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch tasks')
      setError(error)
      setTasks([])
      setStats(emptyStats)
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }, [supabase, getUserId, projectId, status, priority, assigneeId])

  // ============================================================================
  // CREATE TASK
  // ============================================================================

  const createTask = useCallback(async (data: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      const userId = await getUserId()
      if (!userId) {
        return { success: false, error: 'Authentication required' }
      }

      // Get next position
      const { data: lastTask } = await supabase
        .from('tasks')
        .select('position')
        .eq('user_id', userId)
        .is('parent_id', null)
        .order('position', { ascending: false })
        .limit(1)
        .single()

      const position = (lastTask?.position || 0) + 1

      const taskData = {
        title: data.title || 'Untitled Task',
        description: data.description || '',
        status: data.status || 'todo',
        priority: data.priority || 'medium',
        category: data.category || 'work',
        type: data.type || 'task',
        user_id: userId,
        project_id: data.project_id || null,
        parent_id: data.parent_id || null,
        assignee_id: data.assignee_id || userId,
        reviewer_id: data.reviewer_id || null,
        estimated_minutes: data.estimated_minutes || 60,
        actual_minutes: 0,
        start_date: data.start_date || null,
        due_date: data.due_date || null,
        completed_at: null,
        position,
        tags: data.tags || [],
        labels: data.labels || [],
        checklist: data.checklist || [],
        dependencies: data.dependencies || [],
        blockers: [],
        attachments: [],
        metadata: data.metadata || {}
      }

      const { data: newTask, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single()

      if (error) throw error

      setTasks(prev => [newTask as Task, ...prev])
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        todo: prev.todo + 1
      }))

      return { success: true, task: newTask }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create task')
      return { success: false, error: error.message }
    }
  }, [supabase, getUserId])

  // ============================================================================
  // UPDATE TASK
  // ============================================================================

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    try {
      // Handle status change to completed
      const updateData: Record<string, unknown> = {
        ...updates,
        updated_at: new Date().toISOString()
      }

      if (updates.status === 'completed') {
        updateData.completed_at = new Date().toISOString()
      } else if (updates.status && updates.status !== 'completed') {
        updateData.completed_at = null
      }

      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId)
        .select()
        .single()

      if (error) throw error

      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...data } as Task : t))
      if (currentTask?.id === taskId) {
        setCurrentTask(prev => prev ? { ...prev, ...data } as Task : prev)
      }

      return { success: true, task: data }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update task')
      return { success: false, error: error.message }
    }
  }, [supabase, currentTask])

  // ============================================================================
  // DELETE TASK
  // ============================================================================

  const deleteTask = useCallback(async (taskId: string, permanent = false) => {
    try {
      if (permanent) {
        // Delete subtasks first
        await supabase.from('tasks').delete().eq('parent_id', taskId)

        const { error } = await supabase.from('tasks').delete().eq('id', taskId)
        if (error) throw error

        setTasks(prev => prev.filter(t => t.id !== taskId))
        setStats(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }))
      } else {
        // Soft delete - mark as cancelled
        const { error } = await supabase
          .from('tasks')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('id', taskId)

        if (error) throw error

        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'cancelled' as TaskStatus } : t))
      }

      if (currentTask?.id === taskId) {
        setCurrentTask(null)
      }

      return { success: true }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete task')
      return { success: false, error: error.message }
    }
  }, [supabase, currentTask])

  // ============================================================================
  // TOGGLE TASK COMPLETION
  // ============================================================================

  const toggleTaskCompletion = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return { success: false, error: 'Task not found' }

    const isCompleting = task.status !== 'completed'
    const newStatus: TaskStatus = isCompleting ? 'completed' : 'todo'

    const result = await updateTask(taskId, {
      status: newStatus,
      completed_at: isCompleting ? new Date().toISOString() : null
    })

    if (result.success) {
      setStats(prev => ({
        ...prev,
        completed: isCompleting ? prev.completed + 1 : Math.max(0, prev.completed - 1),
        todo: isCompleting ? Math.max(0, prev.todo - 1) : prev.todo + 1,
        completion_rate: prev.total > 0
          ? Math.round(((isCompleting ? prev.completed + 1 : prev.completed - 1) / prev.total) * 100)
          : 0
      }))

      return {
        success: true,
        task: result.task,
        celebration: isCompleting ? { message: 'Task completed!', points: 10 } : undefined
      }
    }

    return result
  }, [tasks, updateTask])

  // ============================================================================
  // ASSIGN TASK
  // ============================================================================

  const assignTask = useCallback(async (taskId: string, newAssigneeId: string | null) => {
    return updateTask(taskId, { assignee_id: newAssigneeId })
  }, [updateTask])

  // ============================================================================
  // CHANGE STATUS
  // ============================================================================

  const changeTaskStatus = useCallback(async (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return { success: false, error: 'Task not found' }

    const oldStatus = task.status
    const result = await updateTask(taskId, {
      status: newStatus,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : null
    })

    if (result.success) {
      setStats(prev => {
        const updates: Partial<TaskStats> = {}
        if (oldStatus === 'completed') updates.completed = Math.max(0, prev.completed - 1)
        if (oldStatus === 'in_progress') updates.in_progress = Math.max(0, prev.in_progress - 1)
        if (oldStatus === 'todo') updates.todo = Math.max(0, prev.todo - 1)
        if (newStatus === 'completed') updates.completed = (updates.completed ?? prev.completed) + 1
        if (newStatus === 'in_progress') updates.in_progress = (updates.in_progress ?? prev.in_progress) + 1
        if (newStatus === 'todo') updates.todo = (updates.todo ?? prev.todo) + 1
        return { ...prev, ...updates }
      })
    }

    return result
  }, [tasks, updateTask])

  // ============================================================================
  // CHANGE PRIORITY
  // ============================================================================

  const changeTaskPriority = useCallback(async (taskId: string, newPriority: TaskPriority) => {
    return updateTask(taskId, { priority: newPriority })
  }, [updateTask])

  // ============================================================================
  // UPDATE DUE DATE
  // ============================================================================

  const updateDueDate = useCallback(async (taskId: string, dueDate: string | null) => {
    return updateTask(taskId, { due_date: dueDate })
  }, [updateTask])

  // ============================================================================
  // TIME TRACKING
  // ============================================================================

  const startTimer = useCallback(async (taskId: string, description?: string) => {
    try {
      const userId = await getUserId()
      if (!userId) return { success: false, error: 'Authentication required' }

      // Check for existing running timer
      const { data: runningTimer } = await supabase
        .from('time_entries')
        .select('id')
        .eq('user_id', userId)
        .is('end_time', null)
        .single()

      if (runningTimer) {
        return { success: false, error: 'You already have a running timer. Stop it first.' }
      }

      const { data: timeEntry, error } = await supabase
        .from('time_entries')
        .insert({
          task_id: taskId,
          user_id: userId,
          start_time: new Date().toISOString(),
          description: description || '',
          billable: true
        })
        .select()
        .single()

      if (error) throw error

      setActiveTimer(timeEntry as TimeEntry)

      // Update task status to in_progress if it's todo
      const task = tasks.find(t => t.id === taskId)
      if (task?.status === 'todo') {
        await updateTask(taskId, { status: 'in_progress' })
      }

      return { success: true, timeEntry }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to start timer')
      return { success: false, error: error.message }
    }
  }, [supabase, getUserId, tasks, updateTask])

  const stopTimer = useCallback(async (taskId?: string) => {
    try {
      const userId = await getUserId()
      if (!userId) return { success: false, error: 'Authentication required' }

      let query = supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', userId)
        .is('end_time', null)

      if (activeTimer?.id) {
        query = query.eq('id', activeTimer.id)
      } else if (taskId) {
        query = query.eq('task_id', taskId)
      }

      const { data: runningTimer } = await query.single()

      if (!runningTimer) {
        return { success: false, error: 'No running timer found' }
      }

      const endTime = new Date()
      const startTime = new Date(runningTimer.start_time)
      const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000)

      const { data: timeEntry, error } = await supabase
        .from('time_entries')
        .update({
          end_time: endTime.toISOString(),
          duration
        })
        .eq('id', runningTimer.id)
        .select()
        .single()

      if (error) throw error

      setActiveTimer(null)

      // Update task actual_minutes
      setTasks(prev => prev.map(t =>
        t.id === runningTimer.task_id
          ? { ...t, actual_minutes: t.actual_minutes + duration }
          : t
      ))

      return { success: true, timeEntry, duration }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to stop timer')
      return { success: false, error: error.message }
    }
  }, [supabase, getUserId, activeTimer])

  const logTime = useCallback(async (taskId: string, duration: number, description?: string) => {
    try {
      const userId = await getUserId()
      if (!userId) return { success: false, error: 'Authentication required' }

      const now = new Date()
      const startTime = new Date(now.getTime() - duration * 60000)

      const { data: timeEntry, error } = await supabase
        .from('time_entries')
        .insert({
          task_id: taskId,
          user_id: userId,
          start_time: startTime.toISOString(),
          end_time: now.toISOString(),
          duration,
          description: description || '',
          billable: true
        })
        .select()
        .single()

      if (error) throw error

      setTasks(prev => prev.map(t =>
        t.id === taskId
          ? { ...t, actual_minutes: t.actual_minutes + duration }
          : t
      ))

      return { success: true, timeEntry }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to log time')
      return { success: false, error: error.message }
    }
  }, [supabase, getUserId])

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  const bulkUpdateTasks = useCallback(async (taskIds: string[], updates: Partial<Task>) => {
    try {
      const updateData: Record<string, unknown> = {
        ...updates,
        updated_at: new Date().toISOString()
      }

      if (updates.status === 'completed') {
        updateData.completed_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .in('id', taskIds)

      if (error) throw error

      setTasks(prev => prev.map(t =>
        taskIds.includes(t.id) ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
      ))

      return { success: true, updatedCount: taskIds.length }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to bulk update tasks')
      return { success: false, error: error.message }
    }
  }, [supabase])

  const bulkDeleteTasks = useCallback(async (taskIds: string[], permanent = false) => {
    try {
      if (permanent) {
        const { error } = await supabase.from('tasks').delete().in('id', taskIds)
        if (error) throw error
        setTasks(prev => prev.filter(t => !taskIds.includes(t.id)))
      } else {
        const { error } = await supabase
          .from('tasks')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .in('id', taskIds)
        if (error) throw error
        setTasks(prev => prev.map(t =>
          taskIds.includes(t.id) ? { ...t, status: 'cancelled' as TaskStatus } : t
        ))
      }

      return { success: true, deletedCount: taskIds.length }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to bulk delete tasks')
      return { success: false, error: error.message }
    }
  }, [supabase])

  // ============================================================================
  // DUPLICATE TASK
  // ============================================================================

  const duplicateTask = useCallback(async (taskId: string, includeSubtasks = false) => {
    try {
      const task = tasks.find(t => t.id === taskId)
      if (!task) return { success: false, error: 'Task not found' }

      const duplicateData = {
        title: `${task.title} (Copy)`,
        description: task.description,
        status: 'todo' as TaskStatus,
        priority: task.priority,
        category: task.category,
        type: task.type,
        project_id: task.project_id,
        assignee_id: task.assignee_id,
        reviewer_id: task.reviewer_id,
        estimated_minutes: task.estimated_minutes,
        due_date: task.due_date,
        tags: task.tags,
        labels: task.labels,
        checklist: task.checklist,
        dependencies: task.dependencies,
        metadata: task.metadata
      }

      const result = await createTask(duplicateData)

      if (result.success && includeSubtasks) {
        // Duplicate subtasks
        const { data: subtasks } = await supabase
          .from('tasks')
          .select('*')
          .eq('parent_id', taskId)

        if (subtasks?.length) {
          for (const st of subtasks) {
            await supabase.from('tasks').insert({
              ...st,
              id: undefined,
              parent_id: result.task.id,
              status: 'todo',
              completed_at: null,
              actual_minutes: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          }
        }
      }

      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to duplicate task')
      return { success: false, error: error.message }
    }
  }, [tasks, createTask, supabase])

  // ============================================================================
  // SEARCH
  // ============================================================================

  const search = useCallback((query: string) => {
    setSearchQuery(query)
    if (query.length >= 2) {
      fetchTasks({ search: query })
    } else if (query.length === 0) {
      fetchTasks()
    }
  }, [fetchTasks])

  // ============================================================================
  // REFRESH
  // ============================================================================

  const refresh = useCallback(async () => {
    return fetchTasks()
  }, [fetchTasks])

  // ============================================================================
  // REAL-TIME SUBSCRIPTIONS
  // ============================================================================

  useEffect(() => {
    if (!enableRealtime) return

    const channel = supabase
      .channel('tasks-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tasks' },
        (payload) => {
          const newTask = payload.new as Task
          setTasks(prev => {
            if (prev.some(t => t.id === newTask.id)) return prev
            return [newTask, ...prev]
          })
          setStats(prev => ({
            ...prev,
            total: prev.total + 1,
            todo: newTask.status === 'todo' ? prev.todo + 1 : prev.todo,
            in_progress: newTask.status === 'in_progress' ? prev.in_progress + 1 : prev.in_progress
          }))
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'tasks' },
        (payload) => {
          const updatedTask = payload.new as Task
          setTasks(prev => prev.map(t => t.id === updatedTask.id ? { ...t, ...updatedTask } : t))
          if (currentTask?.id === updatedTask.id) {
            setCurrentTask(prev => prev ? { ...prev, ...updatedTask } : prev)
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'tasks' },
        (payload) => {
          const deletedTask = payload.old as Task
          setTasks(prev => prev.filter(t => t.id !== deletedTask.id))
          setStats(prev => ({
            ...prev,
            total: Math.max(0, prev.total - 1),
            completed: deletedTask.status === 'completed' ? Math.max(0, prev.completed - 1) : prev.completed,
            in_progress: deletedTask.status === 'in_progress' ? Math.max(0, prev.in_progress - 1) : prev.in_progress,
            todo: deletedTask.status === 'todo' ? Math.max(0, prev.todo - 1) : prev.todo
          }))
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [enableRealtime, supabase, currentTask])

  // ============================================================================
  // INITIAL FETCH
  // ============================================================================

  useEffect(() => {
    // Refetch when session loads to ensure we have the correct user ID
    if (isSessionLoaded) {
      fetchTasks()
    }
  }, [fetchTasks, isSessionLoaded])

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const todoTasks = useMemo(() => tasks.filter(t => t.status === 'todo'), [tasks])
  const inProgressTasks = useMemo(() => tasks.filter(t => t.status === 'in_progress'), [tasks])
  const completedTasks = useMemo(() => tasks.filter(t => t.status === 'completed'), [tasks])
  const reviewTasks = useMemo(() => tasks.filter(t => t.status === 'review'), [tasks])
  const blockedTasks = useMemo(() => tasks.filter(t => t.status === 'blocked'), [tasks])
  const urgentTasks = useMemo(() => tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed'), [tasks])
  const highPriorityTasks = useMemo(() => tasks.filter(t => t.priority === 'high' && t.status !== 'completed'), [tasks])

  const overdueTasks = useMemo(() => {
    const now = new Date()
    return tasks.filter(t =>
      t.due_date &&
      new Date(t.due_date) < now &&
      t.status !== 'completed' &&
      t.status !== 'cancelled'
    )
  }, [tasks])

  const todaysTasks = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tasks.filter(t =>
      t.due_date &&
      new Date(t.due_date) >= today &&
      new Date(t.due_date) < tomorrow
    )
  }, [tasks])

  const upcomingTasks = useMemo(() => {
    const now = new Date()
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    return tasks
      .filter(t =>
        t.due_date &&
        new Date(t.due_date) > now &&
        new Date(t.due_date) <= nextWeek &&
        t.status !== 'completed'
      )
      .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
  }, [tasks])

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      todo: [], in_progress: [], review: [], completed: [], cancelled: [], blocked: []
    }
    tasks.forEach(t => { if (grouped[t.status]) grouped[t.status].push(t) })
    return grouped
  }, [tasks])

  const tasksByPriority = useMemo(() => {
    const grouped: Record<TaskPriority, Task[]> = { urgent: [], high: [], medium: [], low: [] }
    tasks.forEach(t => { if (grouped[t.priority]) grouped[t.priority].push(t) })
    return grouped
  }, [tasks])

  const allTags = useMemo(() => [...new Set(tasks.flatMap(t => t.tags))], [tasks])
  const allLabels = useMemo(() => [...new Set(tasks.flatMap(t => t.labels))], [tasks])

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    tasks, currentTask, stats, activeTimer,
    todoTasks, inProgressTasks, completedTasks, reviewTasks, blockedTasks,
    urgentTasks, highPriorityTasks, overdueTasks, todaysTasks, upcomingTasks,
    tasksByStatus, tasksByPriority, allTags, allLabels,
    isLoading, error, searchQuery,
    refresh, fetchTasks, createTask, updateTask, deleteTask,
    toggleTaskCompletion, assignTask, changeTaskStatus, changeTaskPriority, updateDueDate,
    startTimer, stopTimer, logTime,
    bulkUpdateTasks, bulkDeleteTasks, duplicateTask, search,
    setCurrentTask
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateStats(tasks: Task[]): TaskStats {
  const now = new Date()
  const total = tasks.length
  const completed = tasks.filter(t => t.status === 'completed').length
  const inProgress = tasks.filter(t => t.status === 'in_progress').length
  const todo = tasks.filter(t => t.status === 'todo').length
  const overdue = tasks.filter(t =>
    t.due_date && new Date(t.due_date) < now && t.status !== 'completed' && t.status !== 'cancelled'
  ).length
  const urgent = tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length
  const totalEstimated = tasks.reduce((sum, t) => sum + (t.estimated_minutes || 0), 0)
  const totalActual = tasks.reduce((sum, t) => sum + (t.actual_minutes || 0), 0)

  return {
    total,
    completed,
    in_progress: inProgress,
    todo,
    overdue,
    urgent,
    total_estimated_minutes: totalEstimated,
    total_actual_minutes: totalActual,
    completion_rate: total > 0 ? Math.round((completed / total) * 100) : 0
  }
}

function getDemoTasks(): Partial<Task>[] {
  return [
    {
      id: 'demo-1',
      title: 'Complete logo design mockups',
      description: 'Create 3 logo variations for TechCorp client',
      status: 'in_progress',
      priority: 'high',
      category: 'work',
      type: 'task',
      estimated_minutes: 120,
      actual_minutes: 45,
      due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['design', 'branding'],
      labels: [],
      checklist: [],
      dependencies: [],
      blockers: [],
      attachments: [],
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'demo-2',
      title: 'Review brand guidelines',
      description: 'Final review before client presentation',
      status: 'completed',
      priority: 'medium',
      category: 'work',
      type: 'task',
      estimated_minutes: 45,
      actual_minutes: 40,
      tags: ['review'],
      labels: [],
      checklist: [],
      dependencies: [],
      blockers: [],
      attachments: [],
      metadata: {},
      completed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'demo-3',
      title: 'Client call - Project Alpha',
      description: 'Weekly sync with stakeholders',
      status: 'todo',
      priority: 'urgent',
      category: 'meeting',
      type: 'task',
      estimated_minutes: 60,
      actual_minutes: 0,
      due_date: new Date().toISOString(),
      tags: ['meeting', 'client'],
      labels: [],
      checklist: [],
      dependencies: [],
      blockers: [],
      attachments: [],
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'demo-4',
      title: 'Update portfolio website',
      description: 'Add recent projects and testimonials',
      status: 'todo',
      priority: 'low',
      category: 'personal',
      type: 'task',
      estimated_minutes: 90,
      actual_minutes: 0,
      tags: ['portfolio', 'website'],
      labels: [],
      checklist: [],
      dependencies: [],
      blockers: [],
      attachments: [],
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
}

function getDemoStats(): TaskStats {
  return {
    total: 4,
    completed: 1,
    in_progress: 1,
    todo: 2,
    overdue: 0,
    urgent: 1,
    total_estimated_minutes: 315,
    total_actual_minutes: 85,
    completion_rate: 25
  }
}

export default useTasks
