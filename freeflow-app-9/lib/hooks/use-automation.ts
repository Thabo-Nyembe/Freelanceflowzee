import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'

export type AutomationType = 'trigger' | 'scheduled' | 'conditional' | 'event' | 'webhook' | 'api' | 'manual' | 'batch' | 'realtime'
export type AutomationStatus = 'active' | 'inactive' | 'paused' | 'running' | 'failed' | 'completed' | 'disabled'

export interface Automation {
  id: string
  user_id: string
  automation_name: string
  description?: string
  automation_type: AutomationType
  trigger_type: string
  trigger_event?: string
  trigger_conditions: any
  schedule_type?: string
  schedule_expression?: string
  schedule_timezone: string
  next_run_at?: string
  last_run_at?: string
  action_type: string
  action_config: any
  action_parameters: any
  status: AutomationStatus
  is_enabled: boolean
  is_running: boolean
  run_count: number
  success_count: number
  failure_count: number
  last_success_at?: string
  last_failure_at?: string
  last_error?: string
  avg_execution_time_ms?: number
  total_execution_time_ms: number
  priority: string
  queue_name?: string
  retry_enabled: boolean
  max_retries: number
  retry_count: number
  retry_delay_seconds: number
  timeout_seconds: number
  filters: any
  conditions: any
  tags?: string[]
  category?: string
  created_by?: string
  updated_by?: string
  metadata: any
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface UseAutomationOptions {
  automationType?: AutomationType | 'all'
  status?: AutomationStatus | 'all'
  limit?: number
}

export function useAutomation(options: UseAutomationOptions = {}) {
  const { automationType, status, limit } = options

  const filters: Record<string, any> = {}
  if (automationType && automationType !== 'all') filters.automation_type = automationType
  if (status && status !== 'all') filters.status = status

  const queryOptions: any = {
    table: 'automation',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    limit: limit || 50,
    realtime: true
  }

  const { data, loading, error, refetch } = useSupabaseQuery<Automation>(queryOptions)

  const { create, update, remove } = useSupabaseMutation({
    table: 'automation'
  })

  return {
    automations: data,
    loading,
    error,
    createAutomation: create,
    updateAutomation: update,
    deleteAutomation: remove,
    refetch
  }
}
