'use client'
import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-helpers'

export type PipelineType = 'deployment' | 'build' | 'test' | 'release' | 'integration' | 'delivery' | 'quality'
export type PipelineStatus = 'active' | 'paused' | 'disabled' | 'failed' | 'archived'
export type BuildStatus = 'success' | 'failure' | 'running' | 'cancelled' | 'skipped' | 'pending'

export interface CiCd {
  id: string
  user_id: string
  pipeline_name: string
  description?: string
  pipeline_type: PipelineType
  config: any
  variables?: any
  secrets?: any
  environment_variables?: any
  stages?: any[]
  steps?: any[]
  stage_count: number
  step_count: number
  trigger_type: string
  trigger_branch?: string
  trigger_pattern?: string
  trigger_schedule?: string
  last_run_at?: string
  next_scheduled_run?: string
  run_count: number
  success_count: number
  failure_count: number
  avg_duration_seconds?: number
  total_duration_seconds: number
  status: PipelineStatus
  last_status?: BuildStatus
  is_running: boolean
  last_build_number?: number
  last_build_commit?: string
  last_build_branch?: string
  last_build_tag?: string
  artifacts?: any[]
  artifact_storage_path?: string
  artifact_retention_days: number
  deployment_target?: string
  deployment_environment?: string
  deployment_strategy?: string
  rollback_enabled: boolean
  test_coverage?: number
  test_pass_rate?: number
  total_tests: number
  passed_tests: number
  failed_tests: number
  quality_gates?: any[]
  quality_score?: number
  quality_passed: boolean
  notify_on_success: boolean
  notify_on_failure: boolean
  notification_channels?: any[]
  repository_url?: string
  repository_provider?: string
  integration_type?: string
  integration_config?: any
  logs_url?: string
  logs_retention_days: number
  last_log_size_bytes?: number
  performance_metrics?: any
  resource_usage?: any
  requires_approval: boolean
  approved_by?: string
  approved_at?: string
  tags?: string[]
  category?: string
  priority?: string
  notes?: string
  custom_fields?: any
  created_at: string
  updated_at: string
  deleted_at?: string
}

interface UseCiCdOptions {
  pipelineType?: PipelineType | 'all'
  status?: PipelineStatus | 'all'
  limit?: number
}

export function useCiCd(options: UseCiCdOptions = {}) {
  const { pipelineType, status, limit } = options

  const filters: Record<string, any> = {}
  if (pipelineType && pipelineType !== 'all') filters.pipeline_type = pipelineType
  if (status && status !== 'all') filters.status = status

  const queryOptions: any = {
    table: 'ci_cd',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    limit: limit || 50,
    realtime: true
  }

  const { data, loading, error, refetch } = useSupabaseQuery<CiCd>(queryOptions)

  const { mutate: createPipeline } = useSupabaseMutation({
    table: 'ci_cd',
    action: 'insert',
    onSuccess: refetch
  })

  const { mutate: updatePipeline } = useSupabaseMutation({
    table: 'ci_cd',
    action: 'update',
    onSuccess: refetch
  })

  const { mutate: deletePipeline } = useSupabaseMutation({
    table: 'ci_cd',
    action: 'delete',
    onSuccess: refetch
  })

  return {
    pipelines: data,
    loading,
    error,
    createPipeline,
    updatePipeline,
    deletePipeline,
    refetch
  }
}
