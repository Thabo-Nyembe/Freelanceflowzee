'use client'
import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-helpers'

export type ConnectorType = 'api' | 'webhook' | 'oauth' | 'database' | 'cloud_service' | 'saas' | 'messaging' | 'payment' | 'analytics'
export type ConnectionType = 'rest_api' | 'graphql' | 'soap' | 'grpc' | 'websocket' | 'webhook' | 'database' | 'ftp' | 'sftp'
export type AuthType = 'api_key' | 'oauth' | 'oauth2' | 'basic' | 'bearer' | 'jwt' | 'custom' | 'none'
export type ConnectorStatus = 'active' | 'inactive' | 'error' | 'disabled' | 'testing' | 'deprecated'
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown'

export interface Connector {
  id: string
  user_id: string
  connector_name: string
  description?: string
  connector_type: ConnectorType
  provider_name: string
  provider_url?: string
  provider_category?: string
  connection_type: ConnectionType
  protocol?: string
  base_url?: string
  api_endpoint?: string
  webhook_url?: string
  callback_url?: string
  auth_type: AuthType
  api_key?: string
  api_secret?: string
  access_token?: string
  refresh_token?: string
  token_expires_at?: string
  client_id?: string
  client_secret?: string
  config?: any
  headers?: any
  query_params?: any
  settings?: any
  status: ConnectorStatus
  is_active: boolean
  is_connected: boolean
  is_verified: boolean
  verified_at?: string
  health_status: HealthStatus
  last_health_check?: string
  next_health_check?: string
  health_check_frequency: number
  uptime_percentage?: number
  request_count: number
  success_count: number
  error_count: number
  last_request_at?: string
  last_success_at?: string
  last_error_at?: string
  rate_limit?: number
  rate_limit_window?: string
  requests_today: number
  requests_this_month: number
  quota_limit?: number
  quota_used: number
  quota_reset_at?: string
  avg_response_time?: number
  min_response_time?: number
  max_response_time?: number
  total_response_time: number
  success_rate?: number
  error_rate?: number
  availability_percentage?: number
  retry_enabled: boolean
  retry_count: number
  retry_delay: number
  last_error?: string
  last_error_code?: string
  error_log?: any[]
  webhook_events?: string[]
  webhook_secret?: string
  webhook_enabled: boolean
  sync_enabled: boolean
  sync_frequency?: string
  last_sync_at?: string
  next_sync_at?: string
  sync_status?: string
  records_synced: number
  field_mapping?: any
  data_transformation?: any
  api_version?: string
  connector_version?: string
  deprecated: boolean
  deprecation_date?: string
  encryption_enabled: boolean
  ssl_enabled: boolean
  certificate_url?: string
  certificate_expires_at?: string
  ip_whitelist?: string[]
  logging_enabled: boolean
  log_level: string
  log_retention_days: number
  notify_on_error: boolean
  notify_on_disconnect: boolean
  notification_channels?: any[]
  is_paid: boolean
  billing_tier?: string
  monthly_cost?: number
  environment: string
  dependencies?: any[]
  depends_on?: string[]
  category?: string
  tags?: string[]
  priority?: string
  notes?: string
  custom_fields?: any
  created_at: string
  updated_at: string
  deleted_at?: string
}

interface UseConnectorsOptions {
  connectorType?: ConnectorType | 'all'
  status?: ConnectorStatus | 'all'
  healthStatus?: HealthStatus | 'all'
  limit?: number
}

export function useConnectors(options: UseConnectorsOptions = {}) {
  const { connectorType, status, healthStatus, limit } = options

  const filters: Record<string, any> = {}
  if (connectorType && connectorType !== 'all') filters.connector_type = connectorType
  if (status && status !== 'all') filters.status = status
  if (healthStatus && healthStatus !== 'all') filters.health_status = healthStatus

  const queryOptions: any = {
    table: 'connectors',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    limit: limit || 50,
    realtime: true
  }

  const { data, loading, error, refetch } = useSupabaseQuery<Connector>(queryOptions)

  const { mutate: createConnector } = useSupabaseMutation({
    table: 'connectors',
    action: 'insert',
    onSuccess: refetch
  })

  const { mutate: updateConnector } = useSupabaseMutation({
    table: 'connectors',
    action: 'update',
    onSuccess: refetch
  })

  const { mutate: deleteConnector } = useSupabaseMutation({
    table: 'connectors',
    action: 'delete',
    onSuccess: refetch
  })

  return {
    connectors: data,
    loading,
    error,
    createConnector,
    updateConnector,
    deleteConnector,
    refetch
  }
}
