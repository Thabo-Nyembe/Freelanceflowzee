import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'
import { useState, useEffect, useCallback } from 'react'

// Demo mode detection
function isDemoModeEnabled(): boolean {
  if (typeof window === 'undefined') return false
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('demo') === 'true') return true
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'demo_mode' && value === 'true') return true
  }
  return false
}

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

  // Demo mode state
  const [demoData, setDemoData] = useState<TimeEntry[]>([])
  const [demoLoading, setDemoLoading] = useState(true)
  const [demoError, setDemoError] = useState<Error | null>(null)
  const isDemo = isDemoModeEnabled()

  // Fetch data via API for demo mode
  useEffect(() => {
    if (!isDemo) return

    const fetchDemoData = async () => {
      setDemoLoading(true)
      try {
        const params = new URLSearchParams()
        params.set('demo', 'true')
        params.set('type', 'entries')
        if (status && status !== 'all') params.set('status', status)
        if (projectId) params.set('project_id', projectId)
        if (isBillable !== undefined) params.set('is_billable', String(isBillable))

        const response = await fetch(`/api/time-tracking?${params.toString()}`)
        const result = await response.json()

        if (result.data && result.data.length > 0) {
          setDemoData(result.data)
        } else {
          // Fallback demo data when API returns empty
          setDemoData(getDemoTimeEntries())
        }
        setDemoError(null)
      } catch (err) {
        setDemoError(err instanceof Error ? err : new Error('Failed to fetch time entries'))
        setDemoData(getDemoTimeEntries())
      } finally {
        setDemoLoading(false)
      }
    }

    fetchDemoData()
  }, [isDemo, status, projectId, isBillable])

  const filters: Record<string, any> = {}
  if (status && status !== 'all') filters.status = status
  if (projectId) filters.project_id = projectId
  if (isBillable !== undefined) filters.is_billable = isBillable

  const queryOptions: any = {
    table: 'time_tracking',
    filters,
    orderBy: { column: 'start_time', ascending: false },
    limit: limit || 50,
    realtime: !isDemo, // Disable realtime in demo mode
    enabled: !isDemo // Skip Supabase query in demo mode
  }

  const { data: supabaseData, loading: queryLoading, error: supabaseError, refetch: supabaseRefetch } = useSupabaseQuery<TimeEntry>(queryOptions)

  // Use demo data if in demo mode
  const data = isDemo ? demoData : supabaseData
  const loading = isDemo ? demoLoading : queryLoading
  const error = isDemo ? demoError : supabaseError
  const refetch = isDemo ? async () => {
    setDemoLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('demo', 'true')
      params.set('type', 'entries')
      const response = await fetch(`/api/time-tracking?${params.toString()}`)
      const result = await response.json()
      if (result.data) setDemoData(result.data)
    } catch (err) {
      setDemoError(err instanceof Error ? err : new Error('Failed to fetch'))
    } finally {
      setDemoLoading(false)
    }
  } : supabaseRefetch

  // Use the mutation hook with proper methods
  const { create, update, remove, loading: mutationLoading } = useSupabaseMutation({
    table: 'time_tracking',
    onSuccess: () => !isDemo && supabaseRefetch()
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
    loading: loading || mutationLoading,
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

// Demo time entries for fallback
function getDemoTimeEntries(): TimeEntry[] {
  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)

  return [
    {
      id: 'demo-1',
      user_id: '00000000-0000-0000-0000-000000000001',
      entry_type: 'timer',
      title: 'Client Website Redesign',
      description: 'Working on homepage mockups',
      start_time: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
      duration_seconds: 7200,
      duration_hours: 2,
      status: 'stopped',
      is_billable: true,
      is_locked: false,
      project_id: 'proj-1',
      hourly_rate: 150,
      billable_amount: 300,
      currency: 'USD',
      idle_time_seconds: 0,
      active_time_seconds: 7200,
      breaks_count: 0,
      screenshots_enabled: false,
      screenshots: null,
      activity_data: null,
      apps_used: null,
      metadata: {},
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    },
    {
      id: 'demo-2',
      user_id: '00000000-0000-0000-0000-000000000001',
      entry_type: 'manual',
      title: 'Team Meeting',
      description: 'Weekly sprint planning',
      start_time: new Date(yesterday.getTime() - 1 * 60 * 60 * 1000).toISOString(),
      end_time: yesterday.toISOString(),
      duration_seconds: 3600,
      duration_hours: 1,
      status: 'approved',
      is_billable: false,
      is_locked: true,
      hourly_rate: 0,
      billable_amount: 0,
      currency: 'USD',
      idle_time_seconds: 0,
      active_time_seconds: 3600,
      breaks_count: 0,
      screenshots_enabled: false,
      screenshots: null,
      activity_data: null,
      apps_used: null,
      metadata: {},
      created_at: yesterday.toISOString(),
      updated_at: yesterday.toISOString()
    },
    {
      id: 'demo-3',
      user_id: '00000000-0000-0000-0000-000000000001',
      entry_type: 'timer',
      title: 'Mobile App Development',
      description: 'Implementing authentication flow',
      start_time: new Date(twoDaysAgo.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      end_time: twoDaysAgo.toISOString(),
      duration_seconds: 14400,
      duration_hours: 4,
      status: 'submitted',
      is_billable: true,
      is_locked: false,
      project_id: 'proj-2',
      hourly_rate: 175,
      billable_amount: 700,
      currency: 'USD',
      idle_time_seconds: 600,
      active_time_seconds: 13800,
      breaks_count: 1,
      screenshots_enabled: false,
      screenshots: null,
      activity_data: null,
      apps_used: null,
      metadata: {},
      created_at: twoDaysAgo.toISOString(),
      updated_at: twoDaysAgo.toISOString()
    }
  ]
}
