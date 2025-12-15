import { useSupabaseQuery, useSupabaseMutation } from './base-hooks'

export type DeploymentEnvironment = 'production' | 'staging' | 'development' | 'testing' | 'qa' | 'sandbox' | 'preview'
export type DeploymentStatus = 'pending' | 'in_progress' | 'success' | 'failed' | 'rolled_back' | 'cancelled' | 'skipped'
export type DeploymentType = 'full' | 'incremental' | 'rollback' | 'hotfix' | 'canary' | 'blue_green' | 'rolling'
export type DeploymentStrategy = 'standard' | 'blue_green' | 'canary' | 'rolling' | 'recreate' | 'custom'

export interface Deployment {
  id: string
  user_id: string
  deployment_name: string
  version: string

  environment: DeploymentEnvironment
  status: DeploymentStatus
  deployment_state?: string

  branch?: string
  commit_hash?: string
  commit_message?: string
  commit_author?: string
  repository_url?: string

  deploy_type?: DeploymentType
  deployment_strategy?: DeploymentStrategy

  scheduled_at?: string
  started_at?: string
  completed_at?: string
  duration_seconds: number

  deployed_by_id?: string
  deployed_by_name?: string
  deployed_by_email?: string

  server_count: number
  healthy_servers: number
  unhealthy_servers: number
  traffic_percentage: number
  target_instances?: number
  active_instances: number

  build_id?: string
  build_number?: number
  build_url?: string
  artifact_url?: string
  docker_image?: string
  docker_tag?: string

  health_check_passed?: boolean
  health_check_url?: string
  health_check_count: number
  last_health_check_at?: string

  rollback_to_version?: string
  rollback_reason?: string
  can_rollback: boolean
  auto_rollback_enabled: boolean

  error_message?: string
  error_code?: string
  error_logs?: string
  failed_steps?: string[]

  request_count: number
  error_count: number
  error_rate: number
  avg_response_time_ms?: number

  send_notifications: boolean
  notification_channels?: string[]
  notifications_sent: boolean

  requires_approval: boolean
  approved_by_id?: string
  approved_by_name?: string
  approved_at?: string

  tags?: string[]
  metadata?: any
  notes?: string

  created_at: string
  updated_at: string
  deleted_at?: string
}

export function useDeployments(filters?: {
  environment?: DeploymentEnvironment | 'all'
  status?: DeploymentStatus | 'all'
}) {
  let query = useSupabaseQuery<Deployment>('deployments')

  if (filters?.environment && filters.environment !== 'all') {
    query = query.eq('environment', filters.environment)
  }

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  return query.order('started_at', { ascending: false })
}

export function useCreateDeployment() {
  return useSupabaseMutation<Deployment>('deployments', 'insert')
}

export function useUpdateDeployment() {
  return useSupabaseMutation<Deployment>('deployments', 'update')
}

export function useDeleteDeployment() {
  return useSupabaseMutation<Deployment>('deployments', 'delete')
}
