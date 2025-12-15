'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type { TimeEntry } from '@/lib/hooks/use-time-tracking'

export async function createTimeEntry(data: Partial<TimeEntry>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: timeEntry, error } = await supabase
    .from('time_tracking')
    .insert([{ ...data, user_id: user.id }])
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/time-tracking-v2')
  return timeEntry
}

export async function updateTimeEntry(id: string, data: Partial<TimeEntry>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: timeEntry, error } = await supabase
    .from('time_tracking')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/time-tracking-v2')
  return timeEntry
}

export async function deleteTimeEntry(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('time_tracking')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/dashboard/time-tracking-v2')
  return { success: true }
}

export async function startTimer(data: { title: string; description?: string; project_id?: string; is_billable?: boolean }) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: timeEntry, error } = await supabase
    .from('time_tracking')
    .insert([{
      user_id: user.id,
      entry_type: 'timer',
      title: data.title,
      description: data.description,
      project_id: data.project_id,
      is_billable: data.is_billable || false,
      start_time: new Date().toISOString(),
      status: 'running'
    }])
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/time-tracking-v2')
  return timeEntry
}

export async function stopTimer(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Get the time entry
  const { data: entry } = await supabase
    .from('time_tracking')
    .select('start_time, hourly_rate')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!entry) throw new Error('Time entry not found')

  const endTime = new Date()
  const startTime = new Date(entry.start_time)
  const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
  const durationHours = parseFloat((durationSeconds / 3600).toFixed(2))
  const billableAmount = entry.hourly_rate ? parseFloat((durationHours * entry.hourly_rate).toFixed(2)) : null

  const { data: timeEntry, error } = await supabase
    .from('time_tracking')
    .update({
      end_time: endTime.toISOString(),
      duration_seconds: durationSeconds,
      duration_hours: durationHours,
      billable_amount: billableAmount,
      status: 'stopped'
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/time-tracking-v2')
  return timeEntry
}

export async function submitTimeEntry(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: timeEntry, error } = await supabase
    .from('time_tracking')
    .update({
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      submitted_by: user.id
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/time-tracking-v2')
  return timeEntry
}

export async function approveTimeEntry(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: timeEntry, error } = await supabase
    .from('time_tracking')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: user.id,
      is_locked: true
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/time-tracking-v2')
  return timeEntry
}
