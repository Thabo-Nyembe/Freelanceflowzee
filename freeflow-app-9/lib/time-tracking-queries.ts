/**
 * Time Tracking Queries
 *
 * Supabase queries for time tracking and billing management.
 * Supports CRUD operations, timer controls, and reporting.
 */

import { createClient } from '@/lib/supabase/client'
import { createSimpleLogger } from '@/lib/simple-logger'
import { DatabaseError, toDbError, JsonValue } from '@/lib/types/database'

const logger = createSimpleLogger('TimeTrackingQueries')

// Types matching the database schema
export type EntryStatus = 'running' | 'paused' | 'stopped' | 'completed'

export interface TimeEntry {
  id: string
  user_id: string
  project_id?: string
  project_name: string
  task_id?: string
  task_name?: string
  description: string
  start_time: string
  end_time?: string
  duration: number
  status: EntryStatus
  is_billable: boolean
  hourly_rate: number
  total_amount: number
  entry_date: string
  tags: string[]
  notes?: string
  metadata: Record<string, JsonValue>
  created_at: string
  updated_at: string
}

export interface TimeEntrySummary {
  total_entries: number
  total_hours: number
  billable_hours: number
  non_billable_hours: number
  total_amount: number
  entries_by_project: Array<{
    project_name: string
    hours: number
    amount: number
  }>
}

export interface DailyTimeEntry {
  id: string
  project_name: string
  task_name?: string
  description: string
  start_time: string
  end_time?: string
  duration: number
  status: EntryStatus
  is_billable: boolean
  hourly_rate: number
  total_amount: number
}

export interface WeeklyTimeReport {
  day: string
  total_hours: number
  billable_hours: number
  total_amount: number
  entries_count: number
}

// ============================================
// TIME ENTRY CRUD OPERATIONS
// ============================================

/**
 * Get all time entries for a user with optional filters
 */
export async function getTimeEntries(
  userId: string,
  filters?: {
    startDate?: string
    endDate?: string
    projectId?: string
    status?: EntryStatus
    isBillable?: boolean
  }
): Promise<{ data: TimeEntry[]; error: DatabaseError | null }> {
  try {
    logger.info('Fetching time entries from Supabase', { userId, filters })

    const supabase = createClient()
    let query = supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: false })

    // Apply filters
    if (filters?.startDate) {
      query = query.gte('entry_date', filters.startDate)
    }
    if (filters?.endDate) {
      query = query.lte('entry_date', filters.endDate)
    }
    if (filters?.projectId) {
      query = query.eq('project_id', filters.projectId)
    }
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.isBillable !== undefined) {
      query = query.eq('is_billable', filters.isBillable)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Failed to fetch time entries', { error, userId, filters })
      return { data: [], error: toDbError(error) }
    }

    logger.info('Time entries fetched successfully', {
      count: data?.length || 0,
      userId
    })

    return { data: data || [], error: null }
  } catch (error: unknown) {
    logger.error('Exception fetching time entries', { error, userId })
    return { data: [], error: toDbError(error) }
  }
}

/**
 * Get a single time entry by ID
 */
export async function getTimeEntry(
  entryId: string,
  userId: string
): Promise<{ data: TimeEntry | null; error: DatabaseError | null }> {
  try {
    logger.info('Fetching time entry from Supabase', { entryId, userId })

    const supabase = createClient()
    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('id', entryId)
      .eq('user_id', userId)
      .single()

    if (error) {
      logger.error('Failed to fetch time entry', { error, entryId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('Time entry fetched successfully', { entryId })
    return { data, error: null }
  } catch (error: unknown) {
    logger.error('Exception fetching time entry', { error, entryId })
    return { data: null, error: toDbError(error) }
  }
}

/**
 * Get currently running time entry for a user
 */
export async function getRunningTimeEntry(
  userId: string
): Promise<{ data: TimeEntry | null; error: DatabaseError | null }> {
  try {
    logger.info('Fetching running time entry', { userId })

    const supabase = createClient()
    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'running')
      .order('start_time', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      logger.error('Failed to fetch running time entry', { error, userId })
      return { data: null, error: toDbError(error) }
    }

    if (data) {
      logger.info('Running time entry found', { entryId: data.id })
    } else {
      logger.debug('No running time entry found', { userId })
    }

    return { data, error: null }
  } catch (error: unknown) {
    logger.error('Exception fetching running time entry', { error, userId })
    return { data: null, error: toDbError(error) }
  }
}

/**
 * Create a new time entry (start timer)
 */
export async function createTimeEntry(
  userId: string,
  entry: {
    project_id?: string
    project_name: string
    task_id?: string
    task_name?: string
    description: string
    is_billable?: boolean
    hourly_rate?: number
    tags?: string[]
    notes?: string
    metadata?: Record<string, JsonValue>
  }
): Promise<{ data: TimeEntry | null; error: DatabaseError | null }> {
  try {
    logger.info('Creating time entry in Supabase', { userId, entry })

    const supabase = createClient()

    // Check if there's already a running timer
    const { data: runningEntry } = await getRunningTimeEntry(userId)
    if (runningEntry) {
      const runningError = toDbError(new Error('Another timer is already running. Please stop it first.'))
      logger.warn('Cannot start timer - another is running', {
        userId,
        runningEntryId: runningEntry.id
      })
      return { data: null, error: runningError }
    }

    const { data, error } = await supabase
      .from('time_entries')
      .insert({
        user_id: userId,
        project_id: entry.project_id,
        project_name: entry.project_name,
        task_id: entry.task_id,
        task_name: entry.task_name,
        description: entry.description,
        is_billable: entry.is_billable ?? true,
        hourly_rate: entry.hourly_rate ?? 0,
        tags: entry.tags ?? [],
        notes: entry.notes,
        metadata: entry.metadata ?? {},
        status: 'running',
        start_time: new Date().toISOString(),
        entry_date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create time entry', { error, userId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('Time entry created successfully', {
      entryId: data.id,
      project: entry.project_name
    })

    return { data, error: null }
  } catch (error: unknown) {
    logger.error('Exception creating time entry', { error, userId })
    return { data: null, error: toDbError(error) }
  }
}

/**
 * Update a time entry
 */
export async function updateTimeEntry(
  entryId: string,
  userId: string,
  updates: Partial<Omit<TimeEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: TimeEntry | null; error: DatabaseError | null }> {
  try {
    logger.info('Updating time entry in Supabase', { entryId, userId, updates })

    const supabase = createClient()
    const { data, error } = await supabase
      .from('time_entries')
      .update(updates)
      .eq('id', entryId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update time entry', { error, entryId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('Time entry updated successfully', { entryId })
    return { data, error: null }
  } catch (error: unknown) {
    logger.error('Exception updating time entry', { error, entryId })
    return { data: null, error: toDbError(error) }
  }
}

/**
 * Stop a running time entry
 */
export async function stopTimeEntry(
  entryId: string,
  userId: string
): Promise<{ data: TimeEntry | null; error: DatabaseError | null }> {
  try {
    logger.info('Stopping time entry', { entryId, userId })

    const supabase = createClient()
    const { data, error } = await supabase
      .from('time_entries')
      .update({
        status: 'stopped',
        end_time: new Date().toISOString()
      })
      .eq('id', entryId)
      .eq('user_id', userId)
      .eq('status', 'running')
      .select()
      .single()

    if (error) {
      logger.error('Failed to stop time entry', { error, entryId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('Time entry stopped successfully', {
      entryId,
      duration: data.duration
    })

    return { data, error: null }
  } catch (error: unknown) {
    logger.error('Exception stopping time entry', { error, entryId })
    return { data: null, error: toDbError(error) }
  }
}

/**
 * Pause a running time entry
 */
export async function pauseTimeEntry(
  entryId: string,
  userId: string
): Promise<{ data: TimeEntry | null; error: DatabaseError | null }> {
  try {
    logger.info('Pausing time entry', { entryId, userId })

    const supabase = createClient()

    // Get current entry to calculate elapsed time
    const { data: entry, error: fetchError } = await getTimeEntry(entryId, userId)
    if (fetchError || !entry) {
      return { data: null, error: fetchError || toDbError(new Error('Entry not found')) }
    }

    const currentDuration = entry.duration +
      Math.floor((Date.now() - new Date(entry.start_time).getTime()) / 1000)

    const { data, error } = await supabase
      .from('time_entries')
      .update({
        status: 'paused',
        duration: currentDuration
      })
      .eq('id', entryId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to pause time entry', { error, entryId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('Time entry paused successfully', { entryId, duration: currentDuration })
    return { data, error: null }
  } catch (error: unknown) {
    logger.error('Exception pausing time entry', { error, entryId })
    return { data: null, error: toDbError(error) }
  }
}

/**
 * Resume a paused time entry
 */
export async function resumeTimeEntry(
  entryId: string,
  userId: string
): Promise<{ data: TimeEntry | null; error: DatabaseError | null }> {
  try {
    logger.info('Resuming time entry', { entryId, userId })

    const supabase = createClient()
    const { data, error } = await supabase
      .from('time_entries')
      .update({
        status: 'running',
        start_time: new Date().toISOString()
      })
      .eq('id', entryId)
      .eq('user_id', userId)
      .eq('status', 'paused')
      .select()
      .single()

    if (error) {
      logger.error('Failed to resume time entry', { error, entryId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('Time entry resumed successfully', { entryId })
    return { data, error: null }
  } catch (error: unknown) {
    logger.error('Exception resuming time entry', { error, entryId })
    return { data: null, error: toDbError(error) }
  }
}

/**
 * Delete a time entry
 */
export async function deleteTimeEntry(
  entryId: string,
  userId: string
): Promise<{ success: boolean; error: DatabaseError | null }> {
  try {
    logger.info('Deleting time entry from Supabase', { entryId, userId })

    const supabase = createClient()
    const { error } = await supabase
      .from('time_entries')
      .delete()
      .eq('id', entryId)
      .eq('user_id', userId)

    if (error) {
      logger.error('Failed to delete time entry', { error, entryId })
      return { success: false, error: toDbError(error) }
    }

    logger.info('Time entry deleted successfully', { entryId })
    return { success: true, error: null }
  } catch (error: unknown) {
    logger.error('Exception deleting time entry', { error, entryId })
    return { success: false, error: toDbError(error) }
  }
}

/**
 * Delete all time entries for a user
 */
export async function deleteAllTimeEntries(
  userId: string
): Promise<{ success: boolean; deletedCount: number; error: DatabaseError | null }> {
  try {
    logger.info('Deleting all time entries from Supabase', { userId })

    const supabase = createClient()

    // First count entries to be deleted
    const { count } = await supabase
      .from('time_entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Delete all entries
    const { error } = await supabase
      .from('time_entries')
      .delete()
      .eq('user_id', userId)

    if (error) {
      logger.error('Failed to delete all time entries', { error, userId })
      return { success: false, deletedCount: 0, error: toDbError(error) }
    }

    logger.info('All time entries deleted successfully', { userId, deletedCount: count || 0 })
    return { success: true, deletedCount: count || 0, error: null }
  } catch (error: unknown) {
    logger.error('Exception deleting all time entries', { error, userId })
    return { success: false, deletedCount: 0, error: toDbError(error) }
  }
}

/**
 * Archive a time entry (soft delete - updates status to 'archived')
 */
export async function archiveTimeEntry(
  entryId: string,
  userId: string
): Promise<{ success: boolean; error: DatabaseError | null }> {
  try {
    logger.info('Archiving time entry', { entryId, userId })

    const supabase = createClient()
    const { error } = await supabase
      .from('time_entries')
      .update({
        status: 'completed',
        metadata: { archived: true, archived_at: new Date().toISOString() }
      })
      .eq('id', entryId)
      .eq('user_id', userId)

    if (error) {
      logger.error('Failed to archive time entry', { error, entryId })
      return { success: false, error: toDbError(error) }
    }

    logger.info('Time entry archived successfully', { entryId })
    return { success: true, error: null }
  } catch (error: unknown) {
    logger.error('Exception archiving time entry', { error, entryId })
    return { success: false, error: toDbError(error) }
  }
}

// ============================================
// REPORTING & ANALYTICS
// ============================================

/**
 * Get time tracking summary for a period
 */
export async function getTimeTrackingSummary(
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<{ data: TimeEntrySummary | null; error: DatabaseError | null }> {
  try {
    logger.info('Fetching time tracking summary', { userId, startDate, endDate })

    const supabase = createClient()
    const { data, error } = await supabase
      .rpc('get_time_tracking_summary', {
        p_user_id: userId,
        p_start_date: startDate || null,
        p_end_date: endDate || null
      })
      .single()

    if (error) {
      logger.error('Failed to fetch time tracking summary', { error, userId })
      return { data: null, error: toDbError(error) }
    }

    logger.info('Time tracking summary fetched successfully', {
      totalHours: data?.total_hours,
      totalAmount: data?.total_amount
    })

    return { data, error: null }
  } catch (error: unknown) {
    logger.error('Exception fetching time tracking summary', { error, userId })
    return { data: null, error: toDbError(error) }
  }
}

/**
 * Get daily time entries
 */
export async function getDailyTimeEntries(
  userId: string,
  date?: string
): Promise<{ data: DailyTimeEntry[]; error: DatabaseError | null }> {
  try {
    const targetDate = date || new Date().toISOString().split('T')[0]
    logger.info('Fetching daily time entries', { userId, date: targetDate })

    const supabase = createClient()
    const { data, error } = await supabase
      .rpc('get_daily_time_entries', {
        p_user_id: userId,
        p_date: targetDate
      })

    if (error) {
      logger.error('Failed to fetch daily time entries', { error, userId })
      return { data: [], error: toDbError(error) }
    }

    logger.info('Daily time entries fetched successfully', {
      count: data?.length || 0,
      date: targetDate
    })

    return { data: data || [], error: null }
  } catch (error: unknown) {
    logger.error('Exception fetching daily time entries', { error, userId })
    return { data: [], error: toDbError(error) }
  }
}

/**
 * Get weekly time report
 */
export async function getWeeklyTimeReport(
  userId: string,
  weekStart?: string
): Promise<{ data: WeeklyTimeReport[]; error: DatabaseError | null }> {
  try {
    logger.info('Fetching weekly time report', { userId, weekStart })

    const supabase = createClient()
    const { data, error } = await supabase
      .rpc('get_weekly_time_report', {
        p_user_id: userId,
        p_week_start: weekStart || null
      })

    if (error) {
      logger.error('Failed to fetch weekly time report', { error, userId })
      return { data: [], error: toDbError(error) }
    }

    logger.info('Weekly time report fetched successfully', {
      days: data?.length || 0
    })

    return { data: data || [], error: null }
  } catch (error: unknown) {
    logger.error('Exception fetching weekly time report', { error, userId })
    return { data: [], error: toDbError(error) }
  }
}

/**
 * Get time entries by project
 */
export async function getTimeEntriesByProject(
  userId: string,
  projectId: string,
  startDate?: string,
  endDate?: string
): Promise<{ data: TimeEntry[]; error: DatabaseError | null; stats: { totalHours: number; totalAmount: number } }> {
  try {
    logger.info('Fetching time entries by project', { userId, projectId, startDate, endDate })

    const { data: entries, error } = await getTimeEntries(userId, {
      projectId,
      startDate,
      endDate
    })

    if (error) {
      return { data: [], error, stats: { totalHours: 0, totalAmount: 0 } }
    }

    // Calculate stats
    const totalHours = entries.reduce((sum, entry) => sum + (entry.duration / 3600), 0)
    const totalAmount = entries.reduce((sum, entry) => sum + entry.total_amount, 0)

    logger.info('Time entries by project fetched successfully', {
      count: entries.length,
      totalHours,
      totalAmount
    })

    return {
      data: entries,
      error: null,
      stats: { totalHours, totalAmount }
    }
  } catch (error: unknown) {
    logger.error('Exception fetching time entries by project', { error, userId, projectId })
    return { data: [], error: toDbError(error), stats: { totalHours: 0, totalAmount: 0 } }
  }
}

/**
 * Export time entries to CSV format
 */
export async function exportTimeEntries(
  userId: string,
  filters?: {
    startDate?: string
    endDate?: string
    projectId?: string
  }
): Promise<{ data: string | null; error: DatabaseError | null }> {
  try {
    logger.info('Exporting time entries to CSV', { userId, filters })

    const { data: entries, error } = await getTimeEntries(userId, filters)

    if (error || !entries.length) {
      logger.error('Failed to export time entries', { error, userId })
      return { data: null, error: error || toDbError(new Error('No entries to export')) }
    }

    // Create CSV header
    const headers = [
      'Date',
      'Project',
      'Task',
      'Description',
      'Start Time',
      'End Time',
      'Duration (hours)',
      'Billable',
      'Hourly Rate',
      'Total Amount',
      'Status'
    ]

    // Create CSV rows
    const rows = entries.map(entry => [
      entry.entry_date,
      entry.project_name,
      entry.task_name || '',
      entry.description,
      new Date(entry.start_time).toLocaleString(),
      entry.end_time ? new Date(entry.end_time).toLocaleString() : '',
      (entry.duration / 3600).toFixed(2),
      entry.is_billable ? 'Yes' : 'No',
      entry.hourly_rate.toFixed(2),
      entry.total_amount.toFixed(2),
      entry.status
    ])

    // Combine headers and rows
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    logger.info('Time entries exported successfully', {
      count: entries.length,
      size: csv.length
    })

    return { data: csv, error: null }
  } catch (error: unknown) {
    logger.error('Exception exporting time entries', { error, userId })
    return { data: null, error: toDbError(error) }
  }
}
