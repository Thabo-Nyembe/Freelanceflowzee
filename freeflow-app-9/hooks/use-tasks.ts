'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

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
// HOOK
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

  // ============================================================================
  // FETCH TASKS
  // ============================================================================

  const fetchTasks = useCallback(async (filters?: {
    status?: string
    priority?: string
    search?: string
    projectId?: string
    assigneeId?: string
    dueDate?: string
    overdue?: boolean
    today?: boolean
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    page?: number
    limit?: number
  }) => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()

      // Apply filters
      if (filters?.status || status) {
        const statusValue = filters?.status || (Array.isArray(status) ? status.join(',') : status)
        if (statusValue) params.set('status', statusValue)
      }
      if (filters?.priority || priority) params.set('priority', filters?.priority || priority || '')
      if (filters?.projectId || projectId) params.set('project_id', filters?.projectId || projectId || '')
      if (filters?.assigneeId || assigneeId) params.set('assignee_id', filters?.assigneeId || assigneeId || '')
      if (filters?.search) params.set('search', filters.search)
      if (filters?.dueDate) params.set('due_date', filters.dueDate)
      if (filters?.overdue) params.set('overdue', 'true')
      if (filters?.today) params.set('today', 'true')
      if (filters?.sortBy) params.set('sort_by', filters.sortBy)
      if (filters?.sortOrder) params.set('sort_order', filters.sortOrder)
      if (filters?.page) params.set('page', filters.page.toString())
      if (filters?.limit) params.set('limit', filters.limit.toString())

      const response = await fetch(`/api/tasks?${params}`)
      const result = await response.json()

      if (result.success) {
        setTasks(Array.isArray(result.tasks) ? result.tasks : [])
        setStats(result.stats || emptyStats)
        return { success: true, tasks: result.tasks || [], stats: result.stats }
      }

      // Handle demo mode
      if (result.demo) {
        setTasks(result.tasks || [])
        setStats(result.stats || emptyStats)
        return { success: true, tasks: result.tasks || [], stats: result.stats, demo: true }
      }

      setTasks([])
      setStats(emptyStats)
      return { success: false, error: result.error }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch tasks')
      setError(error)
      setTasks([])
      setStats(emptyStats)
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }, [projectId, status, priority, assigneeId])

  // ============================================================================
  // GET SINGLE TASK
  // ============================================================================

  const getTask = useCallback(async (taskId: string, options?: {
    includeSubtasks?: boolean
    includeTimeEntries?: boolean
  }) => {
    try {
      const params = new URLSearchParams()
      params.set('id', taskId)
      if (options?.includeSubtasks) params.set('include_subtasks', 'true')
      if (options?.includeTimeEntries) params.set('include_time_entries', 'true')

      const response = await fetch(`/api/tasks?${params}`)
      const result = await response.json()

      if (result.success) {
        setCurrentTask(result.task)
        return { success: true, task: result.task }
      }
      return { success: false, error: result.error }
    } catch (err) {
      return { success: false, error: 'Failed to fetch task' }
    }
  }, [])

  // ============================================================================
  // CREATE TASK
  // ============================================================================

  const createTask = useCallback(async (data: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', ...data })
      })
      const result = await response.json()

      if (result.success) {
        setTasks(prev => [result.task, ...prev])
        // Update stats
        setStats(prev => ({
          ...prev,
          total: prev.total + 1,
          todo: prev.todo + 1
        }))
        return { success: true, task: result.task }
      }
      return { success: false, error: result.error }
    } catch (err) {
      return { success: false, error: 'Failed to create task' }
    }
  }, [])

  // ============================================================================
  // UPDATE TASK
  // ============================================================================

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, ...updates })
      })
      const result = await response.json()

      if (result.success) {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates, updated_at: new Date().toISOString() } : t))
        if (currentTask?.id === taskId) {
          setCurrentTask(prev => prev ? { ...prev, ...updates } : prev)
        }
        return { success: true, task: result.task }
      }
      return { success: false, error: result.error }
    } catch (err) {
      return { success: false, error: 'Failed to update task' }
    }
  }, [currentTask])

  // ============================================================================
  // DELETE TASK
  // ============================================================================

  const deleteTask = useCallback(async (taskId: string, permanent = false) => {
    try {
      const response = await fetch(`/api/tasks?id=${taskId}&permanent=${permanent}`, {
        method: 'DELETE'
      })
      const result = await response.json()

      if (result.success) {
        if (permanent) {
          setTasks(prev => prev.filter(t => t.id !== taskId))
          setStats(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }))
        } else {
          setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'cancelled' as TaskStatus } : t))
        }
        if (currentTask?.id === taskId) {
          setCurrentTask(null)
        }
        return { success: true }
      }
      return { success: false, error: result.error }
    } catch (err) {
      return { success: false, error: 'Failed to delete task' }
    }
  }, [currentTask])

  // ============================================================================
  // TOGGLE TASK COMPLETION
  // ============================================================================

  const toggleTaskCompletion = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return { success: false, error: 'Task not found' }

    const isCompleting = task.status !== 'completed'

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete',
          task_id: taskId,
          completed: isCompleting
        })
      })
      const result = await response.json()

      if (result.success) {
        const newStatus: TaskStatus = isCompleting ? 'completed' : 'todo'
        setTasks(prev => prev.map(t =>
          t.id === taskId
            ? { ...t, status: newStatus, completed_at: isCompleting ? new Date().toISOString() : null }
            : t
        ))
        // Update stats
        setStats(prev => ({
          ...prev,
          completed: isCompleting ? prev.completed + 1 : Math.max(0, prev.completed - 1),
          todo: isCompleting ? Math.max(0, prev.todo - 1) : prev.todo + 1,
          completion_rate: prev.total > 0
            ? Math.round(((isCompleting ? prev.completed + 1 : prev.completed - 1) / prev.total) * 100)
            : 0
        }))
        return { success: true, task: result.task, celebration: result.celebration }
      }
      return { success: false, error: result.error }
    } catch (err) {
      return { success: false, error: 'Failed to toggle task completion' }
    }
  }, [tasks])

  // ============================================================================
  // ASSIGN TASK
  // ============================================================================

  const assignTask = useCallback(async (taskId: string, assigneeId: string | null) => {
    return updateTask(taskId, { assignee_id: assigneeId })
  }, [updateTask])

  // ============================================================================
  // CHANGE TASK STATUS
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
      // Update stats based on status change
      setStats(prev => {
        const updates: Partial<TaskStats> = {}

        // Decrement old status count
        if (oldStatus === 'completed') updates.completed = Math.max(0, prev.completed - 1)
        else if (oldStatus === 'in_progress') updates.in_progress = Math.max(0, prev.in_progress - 1)
        else if (oldStatus === 'todo') updates.todo = Math.max(0, prev.todo - 1)

        // Increment new status count
        if (newStatus === 'completed') updates.completed = (updates.completed ?? prev.completed) + 1
        else if (newStatus === 'in_progress') updates.in_progress = (updates.in_progress ?? prev.in_progress) + 1
        else if (newStatus === 'todo') updates.todo = (updates.todo ?? prev.todo) + 1

        return { ...prev, ...updates }
      })
    }

    return result
  }, [tasks, updateTask])

  // ============================================================================
  // CHANGE TASK PRIORITY
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
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start_timer',
          task_id: taskId,
          description
        })
      })
      const result = await response.json()

      if (result.success) {
        setActiveTimer(result.time_entry)
        // Update task status to in_progress
        setTasks(prev => prev.map(t =>
          t.id === taskId && t.status === 'todo'
            ? { ...t, status: 'in_progress' as TaskStatus }
            : t
        ))
        return { success: true, timeEntry: result.time_entry }
      }
      return { success: false, error: result.error }
    } catch (err) {
      return { success: false, error: 'Failed to start timer' }
    }
  }, [])

  const stopTimer = useCallback(async (taskId?: string) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'stop_timer',
          task_id: taskId,
          time_entry_id: activeTimer?.id
        })
      })
      const result = await response.json()

      if (result.success) {
        setActiveTimer(null)
        // Update task actual_minutes
        if (result.time_entry) {
          setTasks(prev => prev.map(t =>
            t.id === result.time_entry.task_id
              ? { ...t, actual_minutes: t.actual_minutes + (result.duration || 0) }
              : t
          ))
        }
        return { success: true, timeEntry: result.time_entry, duration: result.duration }
      }
      return { success: false, error: result.error }
    } catch (err) {
      return { success: false, error: 'Failed to stop timer' }
    }
  }, [activeTimer])

  const logTime = useCallback(async (taskId: string, duration: number, description?: string) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'log_time',
          task_id: taskId,
          duration,
          description
        })
      })
      const result = await response.json()

      if (result.success) {
        setTasks(prev => prev.map(t =>
          t.id === taskId
            ? { ...t, actual_minutes: t.actual_minutes + duration }
            : t
        ))
        return { success: true, timeEntry: result.time_entry }
      }
      return { success: false, error: result.error }
    } catch (err) {
      return { success: false, error: 'Failed to log time' }
    }
  }, [])

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  const bulkUpdateTasks = useCallback(async (taskIds: string[], updates: Partial<Task>) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk_update',
          task_ids: taskIds,
          updates
        })
      })
      const result = await response.json()

      if (result.success) {
        setTasks(prev => prev.map(t =>
          taskIds.includes(t.id) ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
        ))
        return { success: true, updatedCount: result.updated_count }
      }
      return { success: false, error: result.error }
    } catch (err) {
      return { success: false, error: 'Failed to bulk update tasks' }
    }
  }, [])

  const bulkDeleteTasks = useCallback(async (taskIds: string[], permanent = false) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk_delete',
          task_ids: taskIds,
          permanent
        })
      })
      const result = await response.json()

      if (result.success) {
        if (permanent) {
          setTasks(prev => prev.filter(t => !taskIds.includes(t.id)))
        } else {
          setTasks(prev => prev.map(t =>
            taskIds.includes(t.id) ? { ...t, status: 'cancelled' as TaskStatus } : t
          ))
        }
        return { success: true, deletedCount: result.deleted_count }
      }
      return { success: false, error: result.error }
    } catch (err) {
      return { success: false, error: 'Failed to bulk delete tasks' }
    }
  }, [])

  // ============================================================================
  // REORDER TASKS
  // ============================================================================

  const reorderTasks = useCallback(async (taskOrders: { id: string; position: number }[]) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reorder',
          task_orders: taskOrders
        })
      })
      const result = await response.json()

      if (result.success) {
        setTasks(prev => {
          const updated = [...prev]
          taskOrders.forEach(order => {
            const idx = updated.findIndex(t => t.id === order.id)
            if (idx !== -1) {
              updated[idx] = { ...updated[idx], position: order.position }
            }
          })
          return updated.sort((a, b) => a.position - b.position)
        })
        return { success: true }
      }
      return { success: false, error: result.error }
    } catch (err) {
      return { success: false, error: 'Failed to reorder tasks' }
    }
  }, [])

  // ============================================================================
  // DUPLICATE TASK
  // ============================================================================

  const duplicateTask = useCallback(async (taskId: string, includeSubtasks = false) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'duplicate',
          task_id: taskId,
          include_subtasks: includeSubtasks
        })
      })
      const result = await response.json()

      if (result.success) {
        setTasks(prev => [result.task, ...prev])
        setStats(prev => ({ ...prev, total: prev.total + 1, todo: prev.todo + 1 }))
        return { success: true, task: result.task }
      }
      return { success: false, error: result.error }
    } catch (err) {
      return { success: false, error: 'Failed to duplicate task' }
    }
  }, [])

  // ============================================================================
  // AI OPTIMIZE
  // ============================================================================

  const aiOptimizeSchedule = useCallback(async (date?: string) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ai_optimize',
          date
        })
      })
      const result = await response.json()

      if (result.success) {
        return { success: true, schedule: result.schedule }
      }
      return { success: false, error: result.error }
    } catch (err) {
      return { success: false, error: 'Failed to optimize schedule' }
    }
  }, [])

  // ============================================================================
  // SEARCH
  // ============================================================================

  const search = useCallback((query: string) => {
    setSearchQuery(query)
    fetchTasks({ search: query })
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
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tasks'
        },
        (payload) => {
          const newTask = payload.new as Task
          setTasks(prev => {
            // Avoid duplicates
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
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tasks'
        },
        (payload) => {
          const updatedTask = payload.new as Task
          const oldTask = payload.old as Task
          setTasks(prev => prev.map(t =>
            t.id === updatedTask.id ? { ...t, ...updatedTask } : t
          ))
          if (currentTask?.id === updatedTask.id) {
            setCurrentTask(prev => prev ? { ...prev, ...updatedTask } : prev)
          }
          // Update stats if status changed
          if (oldTask.status !== updatedTask.status) {
            setStats(prev => {
              const updates: Partial<TaskStats> = {}
              if (oldTask.status === 'completed') updates.completed = Math.max(0, prev.completed - 1)
              if (oldTask.status === 'in_progress') updates.in_progress = Math.max(0, prev.in_progress - 1)
              if (oldTask.status === 'todo') updates.todo = Math.max(0, prev.todo - 1)
              if (updatedTask.status === 'completed') updates.completed = (updates.completed ?? prev.completed) + 1
              if (updatedTask.status === 'in_progress') updates.in_progress = (updates.in_progress ?? prev.in_progress) + 1
              if (updatedTask.status === 'todo') updates.todo = (updates.todo ?? prev.todo) + 1
              return { ...prev, ...updates }
            })
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'tasks'
        },
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
          if (currentTask?.id === deletedTask.id) {
            setCurrentTask(null)
          }
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
    fetchTasks()
  }, [fetchTasks])

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
      todo: [],
      in_progress: [],
      review: [],
      completed: [],
      cancelled: [],
      blocked: []
    }
    tasks.forEach(t => {
      if (grouped[t.status]) {
        grouped[t.status].push(t)
      }
    })
    return grouped
  }, [tasks])

  const tasksByPriority = useMemo(() => {
    const grouped: Record<TaskPriority, Task[]> = {
      urgent: [],
      high: [],
      medium: [],
      low: []
    }
    tasks.forEach(t => {
      if (grouped[t.priority]) {
        grouped[t.priority].push(t)
      }
    })
    return grouped
  }, [tasks])

  const allTags = useMemo(() => [...new Set(tasks.flatMap(t => t.tags))], [tasks])
  const allLabels = useMemo(() => [...new Set(tasks.flatMap(t => t.labels))], [tasks])

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Data
    tasks,
    currentTask,
    stats,
    activeTimer,

    // Filtered views
    todoTasks,
    inProgressTasks,
    completedTasks,
    reviewTasks,
    blockedTasks,
    urgentTasks,
    highPriorityTasks,
    overdueTasks,
    todaysTasks,
    upcomingTasks,
    tasksByStatus,
    tasksByPriority,
    allTags,
    allLabels,

    // State
    isLoading,
    error,
    searchQuery,

    // Actions
    refresh,
    fetchTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    assignTask,
    changeTaskStatus,
    changeTaskPriority,
    updateDueDate,
    startTimer,
    stopTimer,
    logTime,
    bulkUpdateTasks,
    bulkDeleteTasks,
    reorderTasks,
    duplicateTask,
    aiOptimizeSchedule,
    search,
    setCurrentTask
  }
}

export default useTasks
