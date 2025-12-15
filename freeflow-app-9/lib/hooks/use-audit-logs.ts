'use client'

import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'
import { useMemo } from 'react'

export interface AuditLog {
  id: string
  user_id: string
  log_type: string
  severity: string
  action: string
  description: string | null
  resource: string | null
  user_email: string | null
  ip_address: string | null
  location: string | null
  device: string | null
  status: string
  request_method: string | null
  request_path: string | null
  request_body: Record<string, unknown>
  response_status: number | null
  duration_ms: number
  metadata: Record<string, unknown>
  created_at: string
}

export interface AuditAlertRule {
  id: string
  user_id: string
  rule_name: string
  description: string | null
  log_type: string | null
  severity: string | null
  action_pattern: string | null
  conditions: Record<string, unknown>
  notification_channels: string[]
  is_active: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface AuditLogFilters {
  logType?: string
  severity?: string
  status?: string
  dateFrom?: string
  dateTo?: string
}

export function useAuditLogs(initialData?: AuditLog[], filters?: AuditLogFilters) {
  const query = useSupabaseQuery<AuditLog>({
    table: 'audit_logs',
    select: '*',
    orderBy: { column: 'created_at', ascending: false },
    initialData
  })

  const filteredLogs = useMemo(() => {
    if (!query.data) return []

    return query.data.filter(log => {
      if (filters?.logType && filters.logType !== 'all' && log.log_type !== filters.logType) return false
      if (filters?.severity && filters.severity !== 'all' && log.severity !== filters.severity) return false
      if (filters?.status && filters.status !== 'all' && log.status !== filters.status) return false
      if (filters?.dateFrom) {
        const fromDate = new Date(filters.dateFrom)
        const logDate = new Date(log.created_at)
        if (logDate < fromDate) return false
      }
      if (filters?.dateTo) {
        const toDate = new Date(filters.dateTo)
        const logDate = new Date(log.created_at)
        if (logDate > toDate) return false
      }
      return true
    })
  }, [query.data, filters])

  const stats = useMemo(() => {
    if (!query.data) return {
      total: 0,
      info: 0,
      warning: 0,
      error: 0,
      critical: 0,
      authentication: 0,
      data: 0,
      system: 0,
      security: 0,
      admin: 0,
      success: 0,
      failed: 0,
      blocked: 0
    }

    return {
      total: query.data.length,
      info: query.data.filter(l => l.severity === 'info').length,
      warning: query.data.filter(l => l.severity === 'warning').length,
      error: query.data.filter(l => l.severity === 'error').length,
      critical: query.data.filter(l => l.severity === 'critical').length,
      authentication: query.data.filter(l => l.log_type === 'authentication').length,
      data: query.data.filter(l => l.log_type === 'data').length,
      system: query.data.filter(l => l.log_type === 'system').length,
      security: query.data.filter(l => l.log_type === 'security').length,
      admin: query.data.filter(l => l.log_type === 'admin').length,
      success: query.data.filter(l => l.status === 'success').length,
      failed: query.data.filter(l => l.status === 'failed').length,
      blocked: query.data.filter(l => l.status === 'blocked').length
    }
  }, [query.data])

  return {
    ...query,
    logs: filteredLogs,
    stats
  }
}

export function useAuditAlertRules(initialData?: AuditAlertRule[]) {
  const query = useSupabaseQuery<AuditAlertRule>({
    table: 'audit_alert_rules',
    select: '*',
    filters: [
      { column: 'deleted_at', operator: 'is', value: null }
    ],
    orderBy: { column: 'rule_name', ascending: true },
    initialData
  })

  const activeRules = useMemo(() => {
    if (!query.data) return []
    return query.data.filter(r => r.is_active)
  }, [query.data])

  return {
    ...query,
    rules: query.data || [],
    activeRules
  }
}

export function useAuditLogMutations() {
  const createLog = useSupabaseMutation<AuditLog>({
    table: 'audit_logs',
    operation: 'insert',
    invalidateQueries: ['audit_logs']
  })

  return {
    createLog: createLog.mutate,
    isCreating: createLog.isLoading
  }
}

export function useAuditAlertRuleMutations() {
  const createRule = useSupabaseMutation<AuditAlertRule>({
    table: 'audit_alert_rules',
    operation: 'insert',
    invalidateQueries: ['audit_alert_rules']
  })

  const updateRule = useSupabaseMutation<AuditAlertRule>({
    table: 'audit_alert_rules',
    operation: 'update',
    invalidateQueries: ['audit_alert_rules']
  })

  const deleteRule = useSupabaseMutation<AuditAlertRule>({
    table: 'audit_alert_rules',
    operation: 'update',
    invalidateQueries: ['audit_alert_rules']
  })

  const toggleRule = useSupabaseMutation<AuditAlertRule>({
    table: 'audit_alert_rules',
    operation: 'update',
    invalidateQueries: ['audit_alert_rules']
  })

  return {
    createRule: createRule.mutate,
    updateRule: updateRule.mutate,
    deleteRule: (id: string) => deleteRule.mutate({ id, deleted_at: new Date().toISOString() }),
    toggleRule: (id: string, isActive: boolean) => toggleRule.mutate({ id, is_active: isActive }),
    isCreating: createRule.isLoading,
    isUpdating: updateRule.isLoading,
    isDeleting: deleteRule.isLoading,
    isToggling: toggleRule.isLoading
  }
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical': return 'bg-red-100 text-red-800 border-red-200'
    case 'error': return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'info': return 'bg-blue-100 text-blue-800 border-blue-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'success': return 'bg-green-100 text-green-800 border-green-200'
    case 'failed':
    case 'error': return 'bg-red-100 text-red-800 border-red-200'
    case 'blocked': return 'bg-orange-100 text-orange-800 border-orange-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}
