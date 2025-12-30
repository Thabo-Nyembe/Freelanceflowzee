import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'
import { useCallback } from 'react'

export type EntryType = 'manual' | 'timer' | 'automatic' | 'imported' | 'adjusted'
export type TimeTrackingStatus = 'running' | 'paused' | 'stopped' | 'submitted' | 'approved' | 'rejected' | 'invoiced'

export interface TimeEntry {
  id: string
  user_id: string
  entry_type: EntryType
  title: string
  description?: string
  start_time: string
  end_time?: string
  duration_seconds?: number
  duration_hours?: number
  status: TimeTrackingStatus
  is_billable: boolean
  is_locked: boolean
  project_id?: string
  task_id?: string
  client_id?: string
  team_id?: string
  activity_type?: string
  category?: string
  hourly_rate?: number
  billable_amount?: number
  cost_rate?: number
  cost_amount?: number
  currency: string
  location?: string
  device_type?: string
  device_name?: string
  ip_address?: string
  timezone?: string
  productivity_score?: number
  idle_time_seconds: number
  active_time_seconds: number
  breaks_count: number
  screenshots_enabled: boolean
  screenshots: any
  activity_data: any
  apps_used: any
  submitted_at?: string
  submitted_by?: string
  approved_at?: string
  approved_by?: string
  rejected_at?: string
  rejected_by?: string
  rejection_reason?: string
  invoiced_at?: string
  invoice_id?: string
  notes?: string
  tags?: string[]
  metadata: any
  external_id?: string
  external_source?: string
  sync_status?: string
  last_synced_at?: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface UseTimeTrackingOptions {
  status?: TimeTrackingStatus | 'all'
  projectId?: string
  isBillable?: boolean
  limit?: number
}

export function useTimeTracking(options: UseTimeTrackingOptions = {}) {
  const { status, projectId, isBillable, limit } = options

  const filters: Record<string, any> = {}
  if (status && status !== 'all') filters.status = status
  if (projectId) filters.project_id = projectId
  if (isBillable !== undefined) filters.is_billable = isBillable

  const queryOptions: any = {
    table: 'time_tracking',
    filters,
    orderBy: { column: 'start_time', ascending: false },
    limit: limit || 50,
    realtime: true
  }

  const { data, loading: queryLoading, error, refetch } = useSupabaseQuery<TimeEntry>(queryOptions)

  // Use the mutation hook with proper methods
  const { create, update, remove, loading: mutationLoading } = useSupabaseMutation({
    table: 'time_tracking',
    onSuccess: () => refetch()
  })

  // Create a new time entry (for manual entries or starting a timer)
  const createEntry = useCallback(async (entryData: Partial<TimeEntry>) => {
    return await create({
      title: entryData.title || 'Untitled Entry',
      description: entryData.description,
      entry_type: entryData.entry_type || 'manual',
      start_time: entryData.start_time || new Date().toISOString(),
      end_time: entryData.end_time,
      duration_seconds: entryData.duration_seconds || 0,
      duration_hours: entryData.duration_hours || 0,
      status: entryData.status || 'stopped',
      is_billable: entryData.is_billable ?? true,
      is_locked: entryData.is_locked ?? false,
      project_id: entryData.project_id,
      task_id: entryData.task_id,
      client_id: entryData.client_id,
      team_id: entryData.team_id,
      activity_type: entryData.activity_type,
      category: entryData.category,
      hourly_rate: entryData.hourly_rate,
      billable_amount: entryData.billable_amount,
      currency: entryData.currency || 'USD',
      timezone: entryData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      idle_time_seconds: entryData.idle_time_seconds || 0,
      active_time_seconds: entryData.active_time_seconds || 0,
      breaks_count: entryData.breaks_count || 0,
      screenshots_enabled: entryData.screenshots_enabled ?? false,
      screenshots: entryData.screenshots || null,
      activity_data: entryData.activity_data || null,
      apps_used: entryData.apps_used || null,
      notes: entryData.notes,
      tags: entryData.tags,
      metadata: entryData.metadata || {}
    })
  }, [create])

  // Start a timer - creates entry with status 'running'
  const startTimer = useCallback(async (entryData: Partial<TimeEntry>) => {
    return await createEntry({
      ...entryData,
      entry_type: 'timer',
      status: 'running',
      start_time: new Date().toISOString()
    })
  }, [createEntry])

  // Stop a timer - updates entry with end_time and duration
  const stopTimer = useCallback(async (id: string, startTime: string) => {
    const endTime = new Date()
    const startDate = new Date(startTime)
    const durationSeconds = Math.floor((endTime.getTime() - startDate.getTime()) / 1000)
    const durationHours = durationSeconds / 3600

    return await update(id, {
      end_time: endTime.toISOString(),
      duration_seconds: durationSeconds,
      duration_hours: durationHours,
      status: 'stopped'
    })
  }, [update])

  // Update an existing time entry
  const updateEntry = useCallback(async (id: string, entryData: Partial<TimeEntry>) => {
    return await update(id, entryData)
  }, [update])

  // Delete a time entry (soft delete by default)
  const deleteEntry = useCallback(async (id: string, hardDelete = false) => {
    return await remove(id, hardDelete)
  }, [remove])

  // Approve a time entry
  const approveEntry = useCallback(async (id: string, approverId?: string) => {
    return await update(id, {
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: approverId
    })
  }, [update])

  // Reject a time entry
  const rejectEntry = useCallback(async (id: string, reason?: string, rejecterId?: string) => {
    return await update(id, {
      status: 'rejected',
      rejected_at: new Date().toISOString(),
      rejected_by: rejecterId,
      rejection_reason: reason
    })
  }, [update])

  // Submit time entry for approval
  const submitEntry = useCallback(async (id: string, submitterId?: string) => {
    return await update(id, {
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      submitted_by: submitterId
    })
  }, [update])

  // Lock a time entry (prevent further edits)
  const lockEntry = useCallback(async (id: string) => {
    return await update(id, { is_locked: true })
  }, [update])

  // Unlock a time entry
  const unlockEntry = useCallback(async (id: string) => {
    return await update(id, { is_locked: false })
  }, [update])

  return {
    // Data
    timeEntries: data,
    loading: queryLoading || mutationLoading,
    error,
    refetch,

    // CRUD Operations
    createEntry,
    updateEntry,
    deleteEntry,

    // Timer Operations
    startTimer,
    stopTimer,

    // Workflow Operations
    approveEntry,
    rejectEntry,
    submitEntry,
    lockEntry,
    unlockEntry
  }
}
