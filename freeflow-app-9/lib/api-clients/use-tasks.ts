/**
 * React hooks for Tasks API
 *
 * Uses TanStack Query for caching, loading states, and error handling
 * Replaces useEffect + setTimeout patterns
 *
 * Caching Strategy:
 * - Tasks list: 5 min staleTime (user data)
 * - Single task: 5 min staleTime (user data)
 * - Task stats: 2 min staleTime (analytics)
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import { tasksClient, type CreateTaskData, type UpdateTaskData, type TaskFilters, type Task } from './tasks-client'
import { toast } from 'sonner'
import { STALE_TIMES, userDataQueryOptions, analyticsQueryOptions, invalidationPatterns } from '@/lib/query-client'
import { isDemoMode } from './base-client'

// Demo tasks data for showcase
function getDemoTasks() {
  const now = new Date()
  const tasks: Task[] = [
    {
      id: 'demo-task-1',
      user_id: 'demo',
      project_id: null,
      title: 'Complete project proposal',
      description: 'Write and review the Q1 project proposal document',
      status: 'in_progress',
      priority: 'high',
      due_date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      estimated_hours: 4,
      actual_hours: 2,
      assignee_id: null,
      tags: ['proposal', 'q1'],
      checklist: [],
      attachments: [],
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    },
    {
      id: 'demo-task-2',
      user_id: 'demo',
      project_id: null,
      title: 'Review client feedback',
      description: 'Analyze and respond to client feedback from last sprint',
      status: 'todo',
      priority: 'medium',
      due_date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      estimated_hours: 2,
      actual_hours: 0,
      assignee_id: null,
      tags: ['feedback', 'client'],
      checklist: [],
      attachments: [],
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    },
    {
      id: 'demo-task-3',
      user_id: 'demo',
      project_id: null,
      title: 'Update documentation',
      description: 'Update API documentation with latest changes',
      status: 'completed',
      priority: 'low',
      due_date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      estimated_hours: 3,
      actual_hours: 2.5,
      assignee_id: null,
      tags: ['docs', 'api'],
      checklist: [],
      attachments: [],
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    }
  ]

  return {
    data: tasks,
    pagination: {
      page: 1,
      pageSize: 10,
      total: tasks.length,
      totalPages: 1
    }
  }
}

/**
 * Get all tasks with pagination and filters
 */
export function useTasks(
  page: number = 1,
  pageSize: number = 10,
  filters?: TaskFilters,
  options?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>
) {
  const isDemo = isDemoMode()
  const emptyData = { data: [], pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 } }

  return useQuery({
    queryKey: ['tasks', page, pageSize, filters],
    queryFn: async () => {
      // Demo mode: return demo tasks
      if (isDemo) {
        return getDemoTasks()
      }

      // Regular users: fetch from API
      try {
        const response = await tasksClient.getTasks(page, pageSize, filters)

        if (!response.success || !response.data) {
          return emptyData
        }

        return response.data
      } catch {
        return emptyData
      }
    },
    placeholderData: isDemo ? getDemoTasks() : emptyData,
    staleTime: STALE_TIMES.USER_DATA,
    ...userDataQueryOptions,
    ...options
  })
}

/**
 * Get single task by ID
 */
export function useTask(id: string) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: async () => {
      const response = await tasksClient.getTask(id)

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch task')
      }

      return response.data
    },
    enabled: !!id,
    staleTime: STALE_TIMES.USER_DATA,
    ...userDataQueryOptions
  })
}

/**
 * Create new task
 */
export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateTaskData) => {
      const response = await tasksClient.createTask(data)

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create task')
      }

      return response.data
    },
    onSuccess: (task) => {
      // Use centralized invalidation pattern
      invalidationPatterns.tasks(queryClient)

      // Optimistically update cache
      queryClient.setQueryData(['task', task.id], task)

      toast.success('Task created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Update existing task
 */
export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: UpdateTaskData }) => {
      const response = await tasksClient.updateTask(id, updates)

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update task')
      }

      return response.data
    },
    onSuccess: (task) => {
      // Use centralized invalidation pattern
      invalidationPatterns.tasks(queryClient)
      queryClient.setQueryData(['task', task.id], task)

      toast.success('Task updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Delete task
 */
export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await tasksClient.deleteTask(id)

      if (!response.success) {
        throw new Error(response.error || 'Failed to delete task')
      }

      return id
    },
    onSuccess: (deletedId) => {
      // Use centralized invalidation pattern
      invalidationPatterns.tasks(queryClient)
      // Remove the specific task from cache
      queryClient.removeQueries({ queryKey: ['task', deletedId] })
      toast.success('Task deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Assign task to user
 */
export function useAssignTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ taskId, userId }: { taskId: string, userId: string }) => {
      const response = await tasksClient.assignTask(taskId, userId)

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to assign task')
      }

      return response.data
    },
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.setQueryData(['task', task.id], task)
      toast.success('Task assigned successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Update task progress
 */
export function useUpdateTaskProgress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ taskId, progress }: { taskId: string, progress: number }) => {
      const response = await tasksClient.updateProgress(taskId, progress)

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update progress')
      }

      return response.data
    },
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.setQueryData(['task', task.id], task)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Add comment to task
 */
export function useAddTaskComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ taskId, content }: { taskId: string, content: string }) => {
      const response = await tasksClient.addComment(taskId, content)

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to add comment')
      }

      return response.data
    },
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.setQueryData(['task', task.id], task)
      toast.success('Comment added')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Get task statistics
 */
export function useTaskStats() {
  const isDemo = isDemoMode()
  const demoStats = {
    total_tasks: 24,
    completed_tasks: 18,
    in_progress_tasks: 4,
    overdue_tasks: 2,
    completion_rate: 75,
    average_completion_time: 3.5,
    tasks_by_priority: { low: 5, medium: 12, high: 5, urgent: 2 },
    tasks_by_status: { todo: 6, in_progress: 4, in_review: 2, completed: 12 }
  }
  const emptyStats = {
    total_tasks: 0,
    completed_tasks: 0,
    in_progress_tasks: 0,
    overdue_tasks: 0,
    completion_rate: 0,
    average_completion_time: 0,
    tasks_by_priority: { low: 0, medium: 0, high: 0, urgent: 0 },
    tasks_by_status: { todo: 0, in_progress: 0, in_review: 0, completed: 0 }
  }

  return useQuery({
    queryKey: ['task-stats'],
    queryFn: async () => {
      // Demo mode: return demo stats
      if (isDemo) {
        return demoStats
      }

      // Regular users: fetch from API
      try {
        const response = await tasksClient.getTaskStats()

        if (!response.success || !response.data) {
          return emptyStats
        }

        return response.data
      } catch {
        return emptyStats
      }
    },
    placeholderData: isDemo ? demoStats : emptyStats,
    staleTime: STALE_TIMES.ANALYTICS,
    ...analyticsQueryOptions,
    refetchInterval: 60000 // Refetch every minute
  })
}

/**
 * Example component showing how to use these hooks:
 *
 * ```tsx
 * function TasksList() {
 *   const { data, isLoading, error } = useTasks(1, 10, { status: ['todo', 'in_progress'] })
 *   const createTask = useCreateTask()
 *   const updateTask = useUpdateTask()
 *   const assignTask = useAssignTask()
 *   const updateProgress = useUpdateTaskProgress()
 *   const addComment = useAddTaskComment()
 *
 *   if (isLoading) return <Skeleton />
 *   if (error) return <ErrorMessage error={error} />
 *
 *   return (
 *     <div>
 *       {data.data.map(task => (
 *         <TaskCard
 *           key={task.id}
 *           task={task}
 *           onUpdate={(updates) => updateTask.mutate({ id: task.id, updates })}
 *           onAssign={(userId) => assignTask.mutate({ taskId: task.id, userId })}
 *           onProgressChange={(progress) => updateProgress.mutate({ taskId: task.id, progress })}
 *           onComment={(content) => addComment.mutate({ taskId: task.id, content })}
 *         />
 *       ))}
 *
 *       <Button onClick={() => createTask.mutate({
 *         title: 'New Task',
 *         priority: 'medium'
 *       })}>
 *         Add Task
 *       </Button>
 *     </div>
 *   )
 * }
 * ```
 */
