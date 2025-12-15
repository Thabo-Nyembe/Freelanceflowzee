import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'

export type WorkflowType = 'sequential' | 'parallel' | 'conditional' | 'branching' | 'loop' | 'hybrid'
export type WorkflowStatus = 'draft' | 'active' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled' | 'archived'

export interface AutomationWorkflow {
  id: string
  user_id: string
  workflow_name: string
  description?: string
  workflow_type: WorkflowType
  steps: any
  step_count: number
  current_step: number
  trigger_config: any
  trigger_type?: string
  status: WorkflowStatus
  is_enabled: boolean
  is_running: boolean
  total_executions: number
  successful_executions: number
  failed_executions: number
  last_execution_at?: string
  last_execution_status?: string
  last_execution_error?: string
  avg_duration_seconds?: number
  min_duration_seconds?: number
  max_duration_seconds?: number
  total_duration_seconds: number
  version: number
  version_notes?: string
  published_version?: number
  is_published: boolean
  published_at?: string
  variables: any
  context_data: any
  error_handling_strategy: string
  max_retries: number
  retry_delay_seconds: number
  notify_on_success: boolean
  notify_on_failure: boolean
  notification_config: any
  is_scheduled: boolean
  schedule_config: any
  next_scheduled_run?: string
  dependencies?: string[]
  parent_workflow_id?: string
  tags?: string[]
  category?: string
  folder?: string
  requires_approval: boolean
  approved: boolean
  approved_at?: string
  approved_by?: string
  created_by?: string
  updated_by?: string
  metadata: any
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface UseAutomationsOptions {
  workflowType?: WorkflowType | 'all'
  status?: WorkflowStatus | 'all'
  limit?: number
}

export function useAutomations(options: UseAutomationsOptions = {}) {
  const { workflowType, status, limit } = options

  const filters: Record<string, any> = {}
  if (workflowType && workflowType !== 'all') filters.workflow_type = workflowType
  if (status && status !== 'all') filters.status = status

  const queryOptions: any = {
    table: 'automations',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    limit: limit || 50,
    realtime: true
  }

  const { data, loading, error, refetch } = useSupabaseQuery<AutomationWorkflow>(queryOptions)

  const { mutate: create } = useSupabaseMutation<AutomationWorkflow>({
    table: 'automations',
    operation: 'insert'
  })

  const { mutate: update } = useSupabaseMutation<AutomationWorkflow>({
    table: 'automations',
    operation: 'update'
  })

  const { mutate: remove } = useSupabaseMutation<AutomationWorkflow>({
    table: 'automations',
    operation: 'delete'
  })

  return {
    workflows: data,
    loading,
    error,
    createWorkflow: create,
    updateWorkflow: update,
    deleteWorkflow: remove,
    refetch
  }
}
