import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'

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

  const { data, loading, error, refetch } = useSupabaseQuery<TimeEntry>(queryOptions)

  const { mutate: create } = useSupabaseMutation<TimeEntry>({
    table: 'time_tracking',
    operation: 'insert'
  })

  const { mutate: update } = useSupabaseMutation<TimeEntry>({
    table: 'time_tracking',
    operation: 'update'
  })

  const { mutate: remove } = useSupabaseMutation<TimeEntry>({
    table: 'time_tracking',
    operation: 'delete'
  })

  return {
    timeEntries: data,
    loading,
    error,
    createEntry: create,
    updateEntry: update,
    deleteEntry: remove,
    refetch
  }
}
