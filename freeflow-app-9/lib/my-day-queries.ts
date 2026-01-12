// MY-DAY QUERIES - Database integration for Goals, Schedule, Projects
// Provides CRUD operations for the My Day feature

import { createClient } from '@/lib/supabase/client'
import { Task, TimeBlock } from './my-day-utils'

// ============================================================================
// TYPES
// ============================================================================

export interface Goal {
  id: string
  user_id: string
  title: string
  description?: string
  type: 'daily' | 'weekly' | 'monthly'
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  progress: number
  target_date?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface ScheduleBlock {
  id: string
  user_id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  type: 'focus' | 'meeting' | 'break' | 'admin' | 'personal'
  color: string
  recurring: boolean
  recurrence_pattern?: string
  task_ids: string[]
  date: string
  created_at: string
  updated_at: string
}

export interface MyDayTask {
  id: string
  user_id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'work' | 'personal' | 'meeting' | 'break'
  estimated_time: number
  actual_time?: number
  completed: boolean
  start_time?: string
  end_time?: string
  project_id?: string
  tags: string[]
  date: string
  created_at: string
  updated_at: string
}

export interface MyDayProject {
  id: string
  user_id: string
  project_id: string
  project_name: string
  status: 'active' | 'on_hold' | 'completed'
  priority: 'low' | 'medium' | 'high'
  progress: number
  deadline?: string
  tasks_count: number
  completed_tasks: number
  added_at: string
}

// ============================================================================
// GOALS QUERIES
// ============================================================================

export async function getGoals(userId: string, type?: 'daily' | 'weekly' | 'monthly') {
  const supabase = createClient()

  let query = supabase
    .from('my_day_goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (type) {
    query = query.eq('type', type)
  }

  const { data, error } = await query

  if (error) {
    console.error('[my-day-queries] getGoals error:', error)
    return { data: null, error }
  }

  return { data: data as Goal[], error: null }
}

export async function createGoal(userId: string, goal: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('my_day_goals')
    .insert({
      user_id: userId,
      ...goal,
      progress: goal.progress || 0,
      status: goal.status || 'not_started'
    })
    .select()
    .single()

  if (error) {
    console.error('[my-day-queries] createGoal error:', error)
    return { data: null, error }
  }

  return { data: data as Goal, error: null }
}

export async function updateGoal(userId: string, goalId: string, updates: Partial<Goal>) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('my_day_goals')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', goalId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('[my-day-queries] updateGoal error:', error)
    return { data: null, error }
  }

  return { data: data as Goal, error: null }
}

export async function deleteGoal(userId: string, goalId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('my_day_goals')
    .delete()
    .eq('id', goalId)
    .eq('user_id', userId)

  if (error) {
    console.error('[my-day-queries] deleteGoal error:', error)
    return { success: false, error }
  }

  return { success: true, error: null }
}

// ============================================================================
// SCHEDULE QUERIES
// ============================================================================

export async function getSchedule(userId: string, date: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('my_day_schedule')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('start_time', { ascending: true })

  if (error) {
    console.error('[my-day-queries] getSchedule error:', error)
    return { data: null, error }
  }

  return { data: data as ScheduleBlock[], error: null }
}

export async function createScheduleBlock(userId: string, block: Omit<ScheduleBlock, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('my_day_schedule')
    .insert({
      user_id: userId,
      ...block,
      task_ids: block.task_ids || []
    })
    .select()
    .single()

  if (error) {
    console.error('[my-day-queries] createScheduleBlock error:', error)
    return { data: null, error }
  }

  return { data: data as ScheduleBlock, error: null }
}

export async function updateScheduleBlock(userId: string, blockId: string, updates: Partial<ScheduleBlock>) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('my_day_schedule')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', blockId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('[my-day-queries] updateScheduleBlock error:', error)
    return { data: null, error }
  }

  return { data: data as ScheduleBlock, error: null }
}

export async function deleteScheduleBlock(userId: string, blockId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('my_day_schedule')
    .delete()
    .eq('id', blockId)
    .eq('user_id', userId)

  if (error) {
    console.error('[my-day-queries] deleteScheduleBlock error:', error)
    return { success: false, error }
  }

  return { success: true, error: null }
}

// ============================================================================
// TASKS QUERIES
// ============================================================================

export async function getTasks(userId: string, date: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('my_day_tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('priority', { ascending: false })

  if (error) {
    console.error('[my-day-queries] getTasks error:', error)
    return { data: null, error }
  }

  return { data: data as MyDayTask[], error: null }
}

export async function createTask(userId: string, task: Omit<MyDayTask, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('my_day_tasks')
    .insert({
      user_id: userId,
      ...task,
      completed: task.completed || false,
      tags: task.tags || []
    })
    .select()
    .single()

  if (error) {
    console.error('[my-day-queries] createTask error:', error)
    return { data: null, error }
  }

  return { data: data as MyDayTask, error: null }
}

export async function updateTask(userId: string, taskId: string, updates: Partial<MyDayTask>) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('my_day_tasks')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', taskId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('[my-day-queries] updateTask error:', error)
    return { data: null, error }
  }

  return { data: data as MyDayTask, error: null }
}

export async function deleteTask(userId: string, taskId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('my_day_tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', userId)

  if (error) {
    console.error('[my-day-queries] deleteTask error:', error)
    return { success: false, error }
  }

  return { success: true, error: null }
}

export async function toggleTaskComplete(userId: string, taskId: string) {
  const supabase = createClient()

  // First get current state
  const { data: task } = await supabase
    .from('my_day_tasks')
    .select('completed')
    .eq('id', taskId)
    .eq('user_id', userId)
    .single()

  if (!task) {
    return { data: null, error: { message: 'Task not found' } }
  }

  // Toggle the state
  const { data, error } = await supabase
    .from('my_day_tasks')
    .update({
      completed: !task.completed,
      end_time: !task.completed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    })
    .eq('id', taskId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('[my-day-queries] toggleTaskComplete error:', error)
    return { data: null, error }
  }

  return { data: data as MyDayTask, error: null }
}

// ============================================================================
// MY-DAY PROJECTS QUERIES
// ============================================================================

export async function getMyDayProjects(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('my_day_projects')
    .select('*')
    .eq('user_id', userId)
    .order('added_at', { ascending: false })

  if (error) {
    console.error('[my-day-queries] getMyDayProjects error:', error)
    return { data: null, error }
  }

  return { data: data as MyDayProject[], error: null }
}

export async function addProjectToMyDay(userId: string, project: Omit<MyDayProject, 'id' | 'user_id' | 'added_at'>) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('my_day_projects')
    .insert({
      user_id: userId,
      ...project
    })
    .select()
    .single()

  if (error) {
    console.error('[my-day-queries] addProjectToMyDay error:', error)
    return { data: null, error }
  }

  return { data: data as MyDayProject, error: null }
}

export async function updateMyDayProject(userId: string, projectId: string, updates: Partial<MyDayProject>) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('my_day_projects')
    .update(updates)
    .eq('id', projectId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('[my-day-queries] updateMyDayProject error:', error)
    return { data: null, error }
  }

  return { data: data as MyDayProject, error: null }
}

export async function removeProjectFromMyDay(userId: string, projectId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('my_day_projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', userId)

  if (error) {
    console.error('[my-day-queries] removeProjectFromMyDay error:', error)
    return { success: false, error }
  }

  return { success: true, error: null }
}

// ============================================================================
// ANALYTICS QUERIES
// ============================================================================

export async function getMyDayAnalytics(userId: string, startDate: string, endDate: string) {
  const supabase = createClient()

  // Get completed tasks count
  const { data: tasks } = await supabase
    .from('my_day_tasks')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)

  // Get completed goals count
  const { data: goals } = await supabase
    .from('my_day_goals')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate)
    .lte('created_at', endDate)

  // Calculate metrics
  const totalTasks = tasks?.length || 0
  const completedTasks = tasks?.filter(t => t.completed).length || 0
  const totalGoals = goals?.length || 0
  const completedGoals = goals?.filter(g => g.status === 'completed').length || 0

  // Calculate focus time (sum of actual_time for completed tasks)
  const totalFocusTime = tasks?.reduce((acc, t) => acc + (t.actual_time || 0), 0) || 0

  return {
    data: {
      totalTasks,
      completedTasks,
      taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      totalGoals,
      completedGoals,
      goalCompletionRate: totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0,
      totalFocusTime,
      averageFocusTimePerDay: totalFocusTime / 7, // Assuming weekly view
      productivityScore: Math.min(Math.round(((completedTasks + completedGoals) / (totalTasks + totalGoals || 1)) * 100), 100)
    },
    error: null
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Convert database task to UI Task format
export function dbTaskToUITask(dbTask: MyDayTask): Task {
  return {
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description,
    priority: dbTask.priority,
    category: dbTask.category,
    estimatedTime: dbTask.estimated_time,
    completed: dbTask.completed,
    startTime: dbTask.start_time,
    endTime: dbTask.end_time,
    projectId: dbTask.project_id,
    tags: dbTask.tags
  }
}

// Convert database schedule block to UI TimeBlock format
export function dbBlockToUIBlock(dbBlock: ScheduleBlock): TimeBlock {
  return {
    id: dbBlock.id,
    title: dbBlock.title,
    start: dbBlock.start_time,
    end: dbBlock.end_time,
    type: dbBlock.type,
    tasks: dbBlock.task_ids,
    color: dbBlock.color
  }
}
