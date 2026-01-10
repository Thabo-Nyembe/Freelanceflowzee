'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, type ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'
import { uuidSchema } from '@/lib/validations'
import type { TimeEntry } from '@/lib/hooks/use-time-tracking'

const logger = createFeatureLogger('time-tracking')

interface StartTimerInput {
  title: string
  description?: string
  project_id?: string
  is_billable?: boolean
}

export async function createTimeEntry(data: Partial<TimeEntry>): Promise<ActionResult<TimeEntry>> {
  try {
    if (!data.title || data.title.trim().length === 0) {
      return actionError('Time entry title is required', 400)
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Unauthorized', 401)
    }

    const { data: timeEntry, error } = await supabase
      .from('time_tracking')
      .insert([{ ...data, user_id: user.id }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create time entry', { error, userId: user.id })
      return actionError('Failed to create time entry', 500)
    }

    revalidatePath('/dashboard/time-tracking-v2')
    return actionSuccess(timeEntry, 'Time entry created successfully')
  } catch (error) {
    logger.error('Unexpected error creating time entry', { error })
    return actionError('An unexpected error occurred', 500)
  }
}

export async function updateTimeEntry(id: string, data: Partial<TimeEntry>): Promise<ActionResult<TimeEntry>> {
  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid time entry ID format', 400)
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Unauthorized', 401)
    }

    const { data: timeEntry, error } = await supabase
      .from('time_tracking')
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update time entry', { error, timeEntryId: id, userId: user.id })
      return actionError('Failed to update time entry', 500)
    }

    revalidatePath('/dashboard/time-tracking-v2')
    return actionSuccess(timeEntry, 'Time entry updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating time entry', { error, timeEntryId: id })
    return actionError('An unexpected error occurred', 500)
  }
}

export async function deleteTimeEntry(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid time entry ID format', 400)
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Unauthorized', 401)
    }

    const { error } = await supabase
      .from('time_tracking')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete time entry', { error, timeEntryId: id, userId: user.id })
      return actionError('Failed to delete time entry', 500)
    }

    revalidatePath('/dashboard/time-tracking-v2')
    return actionSuccess({ success: true }, 'Time entry deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting time entry', { error, timeEntryId: id })
    return actionError('An unexpected error occurred', 500)
  }
}

export async function startTimer(data: StartTimerInput): Promise<ActionResult<TimeEntry>> {
  try {
    if (!data.title || data.title.trim().length === 0) {
      return actionError('Timer title is required', 400)
    }

    if (data.project_id) {
      const projectIdValidation = uuidSchema.safeParse(data.project_id)
      if (!projectIdValidation.success) {
        return actionError('Invalid project ID format', 400)
      }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Unauthorized', 401)
    }

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

    if (error) {
      logger.error('Failed to start timer', { error, userId: user.id })
      return actionError('Failed to start timer', 500)
    }

    revalidatePath('/dashboard/time-tracking-v2')
    return actionSuccess(timeEntry, 'Timer started successfully')
  } catch (error) {
    logger.error('Unexpected error starting timer', { error })
    return actionError('An unexpected error occurred', 500)
  }
}

export async function stopTimer(id: string): Promise<ActionResult<TimeEntry>> {
  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid timer ID format', 400)
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Unauthorized', 401)
    }

    // Get the time entry
    const { data: entry, error: fetchError } = await supabase
      .from('time_tracking')
      .select('start_time, hourly_rate')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !entry) {
      logger.error('Time entry not found', { error: fetchError, timeEntryId: id, userId: user.id })
      return actionError('Time entry not found', 404)
    }

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

    if (error) {
      logger.error('Failed to stop timer', { error, timeEntryId: id, userId: user.id })
      return actionError('Failed to stop timer', 500)
    }

    revalidatePath('/dashboard/time-tracking-v2')
    return actionSuccess(timeEntry, 'Timer stopped successfully')
  } catch (error) {
    logger.error('Unexpected error stopping timer', { error, timeEntryId: id })
    return actionError('An unexpected error occurred', 500)
  }
}

export async function submitTimeEntry(id: string): Promise<ActionResult<TimeEntry>> {
  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid time entry ID format', 400)
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Unauthorized', 401)
    }

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

    if (error) {
      logger.error('Failed to submit time entry', { error, timeEntryId: id, userId: user.id })
      return actionError('Failed to submit time entry', 500)
    }

    revalidatePath('/dashboard/time-tracking-v2')
    return actionSuccess(timeEntry, 'Time entry submitted successfully')
  } catch (error) {
    logger.error('Unexpected error submitting time entry', { error, timeEntryId: id })
    return actionError('An unexpected error occurred', 500)
  }
}

export async function approveTimeEntry(id: string): Promise<ActionResult<TimeEntry>> {
  try {
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid time entry ID format', 400)
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Unauthorized', 401)
    }

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

    if (error) {
      logger.error('Failed to approve time entry', { error, timeEntryId: id, userId: user.id })
      return actionError('Failed to approve time entry', 500)
    }

    revalidatePath('/dashboard/time-tracking-v2')
    return actionSuccess(timeEntry, 'Time entry approved successfully')
  } catch (error) {
    logger.error('Unexpected error approving time entry', { error, timeEntryId: id })
    return actionError('An unexpected error occurred', 500)
  }
}
