/**
 * Tasks API Client
 *
 * Provides typed API access to task management
 * Supports projects, time tracking, and collaboration
 */

import { BaseApiClient } from './base-client'
import { createClient } from '@/lib/supabase/client'

export interface Task {
  id: string
  user_id: string
  project_id: string | null
  assigned_to: string | null
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'in_review' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string | null
  tags: string[] | null
  due_date: string | null
  start_date: string | null
  completed_at: string | null
  estimated_hours: number | null
  actual_hours: number | null
  progress: number // 0-100
  parent_task_id: string | null
  subtasks: Task[] | null
  attachments: TaskAttachment[] | null
  comments: TaskComment[] | null
  checklist: TaskChecklistItem[] | null
  created_at: string
  updated_at: string
  created_by: string
}

export interface TaskAttachment {
  id: string
  name: string
  url: string
  size: number
  type: string
  uploaded_at: string
}

export interface TaskComment {
  id: string
  user_id: string
  user_name: string
  content: string
  created_at: string
}

export interface TaskChecklistItem {
  id: string
  text: string
  completed: boolean
}

export interface CreateTaskData {
  project_id?: string
  assigned_to?: string
  title: string
  description?: string
  status?: 'todo' | 'in_progress' | 'in_review' | 'completed'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  category?: string
  tags?: string[]
  due_date?: string
  start_date?: string
  estimated_hours?: number
  parent_task_id?: string
  checklist?: Omit<TaskChecklistItem, 'id'>[]
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  progress?: number
  actual_hours?: number
  completed_at?: string
}

export interface TaskFilters {
  status?: ('todo' | 'in_progress' | 'in_review' | 'completed' | 'cancelled')[]
  priority?: ('low' | 'medium' | 'high' | 'urgent')[]
  project_id?: string
  assigned_to?: string
  category?: string[]
  tags?: string[]
  due_before?: string
  due_after?: string
  search?: string
  overdue?: boolean
  completed?: boolean
}

export interface TaskStats {
  total: number
  todo: number
  in_progress: number
  in_review: number
  completed: number
  cancelled: number
  overdue: number
  completionRate: number
  averageCompletionTime: number // days
  totalEstimatedHours: number
  totalActualHours: number
  tasksByPriority: {
    low: number
    medium: number
    high: number
    urgent: number
  }
  tasksByProject: Array<{
    project_id: string
    project_name: string
    tasks: number
    completed: number
  }>
  upcomingDeadlines: Array<{
    id: string
    title: string
    due_date: string
    priority: string
    status: string
  }>
}

class TasksApiClient extends BaseApiClient {
  /**
   * Get all tasks with pagination and filters
   */
  async getTasks(
    page: number = 1,
    pageSize: number = 10,
    filters?: TaskFilters
  ) {
    const supabase = createClient()

    let query = supabase
      .from('tasks')
      .select('*, projects(title), users!assigned_to(name, email)', { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters) {
      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status)
      }

      if (filters.priority && filters.priority.length > 0) {
        query = query.in('priority', filters.priority)
      }

      if (filters.project_id) {
        query = query.eq('project_id', filters.project_id)
      }

      if (filters.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to)
      }

      if (filters.category && filters.category.length > 0) {
        query = query.in('category', filters.category)
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags)
      }

      if (filters.due_before) {
        query = query.lte('due_date', filters.due_before)
      }

      if (filters.due_after) {
        query = query.gte('due_date', filters.due_after)
      }

      if (filters.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        )
      }

      if (filters.overdue) {
        query = query
          .lt('due_date', new Date().toISOString())
          .neq('status', 'completed')
      }

      if (filters.completed !== undefined) {
        if (filters.completed) {
          query = query.eq('status', 'completed')
        } else {
          query = query.neq('status', 'completed')
        }
      }
    }

    // Pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: {
        data: data as Task[],
        pagination: {
          page,
          pageSize,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize)
        }
      },
      error: null
    }
  }

  /**
   * Get single task by ID
   */
  async getTask(id: string) {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('tasks')
      .select('*, projects(title), users!assigned_to(name, email, avatar_url)')
      .eq('id', id)
      .single()

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: data as Task,
      error: null
    }
  }

  /**
   * Create new task
   */
  async createTask(taskData: CreateTaskData) {
    const supabase = createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
        data: null
      }
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        ...taskData,
        user_id: user.id,
        created_by: user.id,
        status: taskData.status || 'todo',
        priority: taskData.priority || 'medium',
        progress: 0,
        actual_hours: 0
      })
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: data as Task,
      error: null
    }
  }

  /**
   * Update existing task
   */
  async updateTask(id: string, updates: UpdateTaskData) {
    const supabase = createClient()

    // Auto-set completed_at if status changed to completed
    if (updates.status === 'completed' && !updates.completed_at) {
      updates.completed_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('tasks')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: data as Task,
      error: null
    }
  }

  /**
   * Delete task
   */
  async deleteTask(id: string) {
    const supabase = createClient()

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: null,
      error: null
    }
  }

  /**
   * Assign task to user
   */
  async assignTask(taskId: string, userId: string) {
    return this.updateTask(taskId, { assigned_to: userId })
  }

  /**
   * Update task progress
   */
  async updateProgress(taskId: string, progress: number) {
    return this.updateTask(taskId, { progress })
  }

  /**
   * Add comment to task
   */
  async addComment(taskId: string, content: string) {
    const supabase = createClient()

    // Get current task
    const { data: task } = await supabase
      .from('tasks')
      .select('comments')
      .eq('id', taskId)
      .single()

    if (!task) {
      return {
        success: false,
        error: 'Task not found',
        data: null
      }
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
        data: null
      }
    }

    const newComment: TaskComment = {
      id: crypto.randomUUID(),
      user_id: user.id,
      user_name: user.email || 'Unknown',
      content,
      created_at: new Date().toISOString()
    }

    const comments = [...(task.comments || []), newComment]

    return this.updateTask(taskId, { comments } as any)
  }

  /**
   * Get task statistics
   */
  async getTaskStats() {
    const supabase = createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
        data: null
      }
    }

    // Get all tasks for current user
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*, projects(title)')
      .eq('user_id', user.id)

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    // Calculate statistics
    const now = new Date()
    const overdueTasks = tasks.filter(t =>
      t.due_date &&
      new Date(t.due_date) < now &&
      t.status !== 'completed'
    )

    const completedTasks = tasks.filter(t => t.status === 'completed')
    const avgCompletionTime = this.calculateAverageCompletionTime(completedTasks)

    const stats: TaskStats = {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      in_review: tasks.filter(t => t.status === 'in_review').length,
      completed: completedTasks.length,
      cancelled: tasks.filter(t => t.status === 'cancelled').length,
      overdue: overdueTasks.length,
      completionRate: tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0,
      averageCompletionTime: avgCompletionTime,
      totalEstimatedHours: tasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0),
      totalActualHours: tasks.reduce((sum, t) => sum + (t.actual_hours || 0), 0),
      tasksByPriority: {
        low: tasks.filter(t => t.priority === 'low').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        high: tasks.filter(t => t.priority === 'high').length,
        urgent: tasks.filter(t => t.priority === 'urgent').length
      },
      tasksByProject: this.groupTasksByProject(tasks),
      upcomingDeadlines: tasks
        .filter(t => t.due_date && new Date(t.due_date) >= now && t.status !== 'completed')
        .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
        .slice(0, 10)
        .map(t => ({
          id: t.id,
          title: t.title,
          due_date: t.due_date!,
          priority: t.priority,
          status: t.status
        }))
    }

    return {
      success: true,
      data: stats,
      error: null
    }
  }

  /**
   * Helper: Calculate average completion time
   */
  private calculateAverageCompletionTime(tasks: any[]): number {
    const tasksWithDates = tasks.filter(t => t.created_at && t.completed_at)
    if (tasksWithDates.length === 0) return 0

    const totalDays = tasksWithDates.reduce((sum, t) => {
      const created = new Date(t.created_at)
      const completed = new Date(t.completed_at)
      const days = Math.floor((completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
      return sum + days
    }, 0)

    return totalDays / tasksWithDates.length
  }

  /**
   * Helper: Group tasks by project
   */
  private groupTasksByProject(tasks: any[]): Array<{
    project_id: string
    project_name: string
    tasks: number
    completed: number
  }> {
    const projectMap: Record<string, { name: string; tasks: number; completed: number }> = {}

    tasks.forEach(task => {
      const projectId = task.project_id || 'no-project'
      const projectName = task.projects?.title || 'No Project'

      if (!projectMap[projectId]) {
        projectMap[projectId] = { name: projectName, tasks: 0, completed: 0 }
      }

      projectMap[projectId].tasks += 1
      if (task.status === 'completed') {
        projectMap[projectId].completed += 1
      }
    })

    return Object.entries(projectMap).map(([id, data]) => ({
      project_id: id,
      project_name: data.name,
      tasks: data.tasks,
      completed: data.completed
    }))
  }
}

export const tasksClient = new TasksApiClient()
