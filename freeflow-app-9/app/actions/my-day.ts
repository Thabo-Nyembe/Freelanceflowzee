'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('my-day-actions')

export interface MyDayTaskInput {
  title: string
  description?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  due_date?: string
  due_time?: string
  estimated_minutes?: number
  category?: string
  tags?: string[]
  project_id?: string
}

export async function createMyDayTask(input: MyDayTaskInput): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to createMyDayTask')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Creating my day task', { userId: user.id, title: input.title })

    const { data, error } = await supabase
      .from('my_day_tasks')
      .insert([{
        ...input,
        user_id: user.id,
        priority: input.priority || 'medium',
        status: input.status || 'pending'
      }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create my day task', { error: error.message, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/my-day-v2')
    logger.info('My day task created successfully', { taskId: data.id })
    return actionSuccess(data, 'Task created successfully')
  } catch (error) {
    logger.error('Unexpected error in createMyDayTask', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateMyDayTask(id: string, updates: Partial<MyDayTaskInput>): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to updateMyDayTask')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Updating my day task', { userId: user.id, taskId: id })

    const { data, error } = await supabase
      .from('my_day_tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update my day task', { error: error.message, taskId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/my-day-v2')
    logger.info('My day task updated successfully', { taskId: data.id })
    return actionSuccess(data, 'Task updated successfully')
  } catch (error) {
    logger.error('Unexpected error in updateMyDayTask', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function completeMyDayTask(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to completeMyDayTask')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Completing my day task', { userId: user.id, taskId: id })

    const { data, error } = await supabase
      .from('my_day_tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to complete my day task', { error: error.message, taskId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/my-day-v2')
    logger.info('My day task completed successfully', { taskId: data.id })
    return actionSuccess(data, 'Task completed successfully')
  } catch (error) {
    logger.error('Unexpected error in completeMyDayTask', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteMyDayTask(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to deleteMyDayTask')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Deleting my day task', { userId: user.id, taskId: id })

    const { error } = await supabase
      .from('my_day_tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete my day task', { error: error.message, taskId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/my-day-v2')
    logger.info('My day task deleted successfully', { taskId: id })
    return actionSuccess({ success: true }, 'Task deleted successfully')
  } catch (error) {
    logger.error('Unexpected error in deleteMyDayTask', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getMyDayTasks(date?: string): Promise<ActionResult<any[]>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to getMyDayTasks')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Fetching my day tasks', { userId: user.id, date })

    let query = supabase
      .from('my_day_tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('priority', { ascending: false })
      .order('due_time', { ascending: true, nullsFirst: false })

    if (date) {
      query = query.eq('due_date', date)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Failed to fetch my day tasks', { error: error.message, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('My day tasks fetched successfully', { count: data?.length || 0 })
    return actionSuccess(data || [], 'Tasks fetched successfully')
  } catch (error) {
    logger.error('Unexpected error in getMyDayTasks', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Focus Session Actions
export async function startFocusSession(taskId?: string, type: 'focus' | 'break' | 'meeting' = 'focus'): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to startFocusSession')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Starting focus session', { userId: user.id, taskId, type })

    const { data, error } = await supabase
      .from('focus_sessions')
      .insert([{
        user_id: user.id,
        task_id: taskId,
        session_type: type,
        start_time: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to start focus session', { error: error.message, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/my-day-v2')
    logger.info('Focus session started successfully', { sessionId: data.id })
    return actionSuccess(data, 'Focus session started successfully')
  } catch (error) {
    logger.error('Unexpected error in startFocusSession', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function endFocusSession(id: string, notes?: string): Promise<ActionResult<any>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to endFocusSession')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    logger.info('Ending focus session', { userId: user.id, sessionId: id })

    // First get the session to calculate duration
    const { data: session, error: fetchError } = await supabase
      .from('focus_sessions')
      .select('start_time')
      .eq('id', id)
      .single()

    if (fetchError) {
      logger.error('Failed to fetch focus session', { error: fetchError.message, sessionId: id })
      return actionError(fetchError.message, 'DATABASE_ERROR')
    }

    const endTime = new Date()
    const startTime = new Date(session.start_time)
    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000)

    const { data, error } = await supabase
      .from('focus_sessions')
      .update({
        end_time: endTime.toISOString(),
        duration_minutes: durationMinutes,
        notes
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to end focus session', { error: error.message, sessionId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/my-day-v2')
    logger.info('Focus session ended successfully', { sessionId: data.id, duration: durationMinutes })
    return actionSuccess(data, 'Focus session ended successfully')
  } catch (error) {
    logger.error('Unexpected error in endFocusSession', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getTodayFocusSessions(): Promise<ActionResult<any[]>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthenticated access attempt to getTodayFocusSessions')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const today = new Date().toISOString().split('T')[0]

    logger.info('Fetching today focus sessions', { userId: user.id, date: today })

    const { data, error } = await supabase
      .from('focus_sessions')
      .select('*')
      .eq('user_id', user.id)
      .gte('start_time', `${today}T00:00:00`)
      .order('start_time', { ascending: false })

    if (error) {
      logger.error('Failed to fetch focus sessions', { error: error.message, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Focus sessions fetched successfully', { count: data?.length || 0 })
    return actionSuccess(data || [], 'Focus sessions fetched successfully')
  } catch (error) {
    logger.error('Unexpected error in getTodayFocusSessions', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
