'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

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

export async function createMyDayTask(input: MyDayTaskInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

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

  if (error) throw error
  revalidatePath('/dashboard/my-day-v2')
  return data
}

export async function updateMyDayTask(id: string, updates: Partial<MyDayTaskInput>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('my_day_tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/my-day-v2')
  return data
}

export async function completeMyDayTask(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

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

  if (error) throw error
  revalidatePath('/dashboard/my-day-v2')
  return data
}

export async function deleteMyDayTask(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('my_day_tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/dashboard/my-day-v2')
  return { success: true }
}

export async function getMyDayTasks(date?: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

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
  if (error) throw error
  return data || []
}

// Focus Session Actions
export async function startFocusSession(taskId?: string, type: 'focus' | 'break' | 'meeting' = 'focus') {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

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

  if (error) throw error
  revalidatePath('/dashboard/my-day-v2')
  return data
}

export async function endFocusSession(id: string, notes?: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // First get the session to calculate duration
  const { data: session } = await supabase
    .from('focus_sessions')
    .select('start_time')
    .eq('id', id)
    .single()

  const endTime = new Date()
  const startTime = new Date(session?.start_time)
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

  if (error) throw error
  revalidatePath('/dashboard/my-day-v2')
  return data
}

export async function getTodayFocusSessions() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('focus_sessions')
    .select('*')
    .eq('user_id', user.id)
    .gte('start_time', `${today}T00:00:00`)
    .order('start_time', { ascending: false })

  if (error) throw error
  return data || []
}
