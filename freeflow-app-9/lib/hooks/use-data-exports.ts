import { useState, useEffect, useCallback } from 'react'
import { useSupabaseMutation } from './base-hooks'
import { createClient } from '@/lib/supabase/client'

export type ExportFormat = 'csv' | 'json' | 'xml' | 'pdf' | 'xlsx' | 'sql' | 'parquet' | 'avro'
export type ExportType = 'manual' | 'scheduled' | 'automated' | 'api_triggered' | 'webhook'
export type ExportStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'scheduled' | 'cancelled' | 'expired'
export type DataSource = 'users' | 'customers' | 'transactions' | 'analytics' | 'inventory' | 'logs' | 'reports' | 'orders' | 'products' | 'other'

export interface DataExport {
  id: string
  user_id: string
  export_name: string
  description?: string

  export_format: ExportFormat
  export_type: ExportType
  data_source: DataSource

  status: ExportStatus
  progress_percentage: number

  total_records: number
  processed_records: number
  failed_records: number

  file_size_bytes: number
  file_size_mb: number
  file_path?: string
  download_url?: string
  cloud_storage_url?: string

  scheduled_at?: string
  started_at?: string
  completed_at?: string
  expires_at?: string
  duration_seconds: number

  requested_by_name?: string
  requested_by_email?: string

  is_encrypted: boolean
  is_compressed: boolean
  password_protected: boolean

  is_recurring: boolean
  recurrence_pattern?: string
  next_run_at?: string
  last_run_at?: string
  run_count: number

  send_email_notification: boolean
  email_recipients?: string[]
  email_sent: boolean

  error_message?: string
  error_code?: string
  retry_count: number
  max_retries: number

  tags?: string[]
  metadata?: any

  created_at: string
  updated_at: string
  deleted_at?: string
}

export function useDataExports(filters?: {
  status?: ExportStatus | 'all'
  format?: ExportFormat | 'all'
  dataSource?: DataSource | 'all'
}) {
  const [data, setData] = useState<DataExport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      let query = supabase.from('data_exports').select('*').is('deleted_at', null)

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }

      if (filters?.format && filters.format !== 'all') {
        query = query.eq('export_format', filters.format)
      }

      if (filters?.dataSource && filters.dataSource !== 'all') {
        query = query.eq('data_source', filters.dataSource)
      }

      const { data: result, error: queryError } = await query.order('created_at', { ascending: false })

      if (queryError) throw new Error(queryError.message)
      setData(result || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { data, isLoading, error, refetch }
}

export function useCreateDataExport() {
  return useSupabaseMutation<DataExport>({
    table: 'data_exports'
  })
}

export function useUpdateDataExport() {
  return useSupabaseMutation<DataExport>({
    table: 'data_exports'
  })
}

export function useDeleteDataExport() {
  return useSupabaseMutation<DataExport>({
    table: 'data_exports'
  })
}
