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
import { tasksClient, type Task, type CreateTaskData, type UpdateTaskData, type TaskFilters } from './tasks-client'
import { toast } from 'sonner'
import { STALE_TIMES, userDataQueryOptions, analyticsQueryOptions, invalidationPatterns } from '@/lib/query-client'

/**
 * Get all tasks with pagination and filters
 */
export function useTasks(
  page: number = 1,
  pageSize: number = 10,
  filters?: TaskFilters,
  options?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['tasks', page, pageSize, filters],
    queryFn: async () => {
      const response = await tasksClient.getTasks(page, pageSize, filters)

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch tasks')
      }

      return response.data
    },
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
  return useQuery({
    queryKey: ['task-stats'],
    queryFn: async () => {
      const response = await tasksClient.getTaskStats()

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch task stats')
      }

      return response.data
    },
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
