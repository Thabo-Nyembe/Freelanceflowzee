'use client'

import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-helpers'

export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace'
export type LogSource = 'api' | 'database' | 'auth' | 'worker' | 'scheduler' | 'webhook' | 'integration' | 'system'
export type LogSeverity = 'critical' | 'high' | 'medium' | 'low'

export interface SystemLog {
  id: string
  user_id: string

  // Log Entry
  log_level: LogLevel
  log_source: LogSource
  message: string
  details: string | null

  // Request Context
  request_id: string | null
  session_id: string | null
  correlation_id: string | null

  // HTTP Context
  http_method: string | null
  http_path: string | null
  http_status_code: number | null
  response_time_ms: number | null

  // User Context
  actor_user_id: string | null
  actor_email: string | null
  actor_ip_address: string | null
  actor_user_agent: string | null

  // Error Details
  error_code: string | null
  error_stack: string | null
  error_type: string | null

  // Classification
  category: string | null
  tags: string[] | null
  severity: LogSeverity

  // Environment
  environment: string
  server_hostname: string | null
  server_region: string | null

  // Metadata
  metadata: any
  context: any

  // Retention
  is_archived: boolean
  archived_at: string | null
  retention_days: number

  // Timestamps
  logged_at: string
  created_at: string
  deleted_at: string | null
}

export interface UseSystemLogsOptions {
  level?: LogLevel | 'all'
  source?: LogSource | 'all'
  severity?: LogSeverity | 'all'
  environment?: string | 'all'
}

export function useSystemLogs(options: UseSystemLogsOptions = {}) {
  const { level, source, severity, environment } = options

  const buildQuery = (supabase: any) => {
    let query = supabase
      .from('system_logs')
      .select('*')
      .is('deleted_at', null)
      .order('logged_at', { ascending: false })

    if (level && level !== 'all') {
      query = query.eq('log_level', level)
    }

    if (source && source !== 'all') {
      query = query.eq('log_source', source)
    }

    if (severity && severity !== 'all') {
      query = query.eq('severity', severity)
    }

    if (environment && environment !== 'all') {
      query = query.eq('environment', environment)
    }

    return query
  }

  return useSupabaseQuery<SystemLog>('system_logs', buildQuery, [level, source, severity, environment])
}

export function useCreateSystemLog() {
  return useSupabaseMutation<SystemLog>('system_logs', 'insert')
}

export function useUpdateSystemLog() {
  return useSupabaseMutation<SystemLog>('system_logs', 'update')
}

export function useDeleteSystemLog() {
  return useSupabaseMutation<SystemLog>('system_logs', 'delete')
}
