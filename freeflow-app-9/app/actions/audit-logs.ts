'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

// Audit log types
export interface CreateAuditLogInput {
  log_type: string
  severity?: string
  action: string
  description?: string
  resource?: string
  user_email?: string
  ip_address?: string
  location?: string
  device?: string
  status?: string
  request_method?: string
  request_path?: string
  request_body?: Record<string, unknown>
  response_status?: number
  duration_ms?: number
  metadata?: Record<string, unknown>
}

// Alert rule types
export interface CreateAlertRuleInput {
  rule_name: string
  description?: string
  log_type?: string
  severity?: string
  action_pattern?: string
  conditions?: Record<string, unknown>
  notification_channels?: string[]
}

export interface UpdateAlertRuleInput extends Partial<CreateAlertRuleInput> {
  id: string
  is_active?: boolean
}

// Audit Log Actions
export async function createAuditLog(input: CreateAuditLogInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('audit_logs')
    .insert({
      ...input,
      user_id: user.id
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/audit-logs-v2')
  return { data }
}

export async function getAuditLogs(filters?: {
  logType?: string
  severity?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  limit?: number
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  let query = supabase
    .from('audit_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (filters?.logType && filters.logType !== 'all') {
    query = query.eq('log_type', filters.logType)
  }

  if (filters?.severity && filters.severity !== 'all') {
    query = query.eq('severity', filters.severity)
  }

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  if (filters?.dateFrom) {
    query = query.gte('created_at', filters.dateFrom)
  }

  if (filters?.dateTo) {
    query = query.lte('created_at', filters.dateTo)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function getAuditLogStats() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: logs, error } = await supabase
    .from('audit_logs')
    .select('log_type, severity, status')
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  return {
    data: {
      total: logs.length,
      byType: {
        authentication: logs.filter(l => l.log_type === 'authentication').length,
        data: logs.filter(l => l.log_type === 'data').length,
        system: logs.filter(l => l.log_type === 'system').length,
        security: logs.filter(l => l.log_type === 'security').length,
        admin: logs.filter(l => l.log_type === 'admin').length
      },
      bySeverity: {
        info: logs.filter(l => l.severity === 'info').length,
        warning: logs.filter(l => l.severity === 'warning').length,
        error: logs.filter(l => l.severity === 'error').length,
        critical: logs.filter(l => l.severity === 'critical').length
      },
      byStatus: {
        success: logs.filter(l => l.status === 'success').length,
        failed: logs.filter(l => l.status === 'failed').length,
        blocked: logs.filter(l => l.status === 'blocked').length
      }
    }
  }
}

export async function exportAuditLogs(filters?: {
  logType?: string
  severity?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  format?: 'json' | 'csv'
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  let query = supabase
    .from('audit_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (filters?.logType && filters.logType !== 'all') {
    query = query.eq('log_type', filters.logType)
  }

  if (filters?.severity && filters.severity !== 'all') {
    query = query.eq('severity', filters.severity)
  }

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  if (filters?.dateFrom) {
    query = query.gte('created_at', filters.dateFrom)
  }

  if (filters?.dateTo) {
    query = query.lte('created_at', filters.dateTo)
  }

  const { data, error } = await query

  if (error) {
    return { error: error.message }
  }

  if (filters?.format === 'csv') {
    // Convert to CSV format
    const headers = ['id', 'timestamp', 'type', 'severity', 'action', 'user', 'ip_address', 'status']
    const rows = data.map(log => [
      log.id,
      log.created_at,
      log.log_type,
      log.severity,
      log.action,
      log.user_email || '',
      log.ip_address || '',
      log.status
    ])
    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
    return { data: csv, format: 'csv' }
  }

  return { data, format: 'json' }
}

// Alert Rule Actions
export async function createAlertRule(input: CreateAlertRuleInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('audit_alert_rules')
    .insert({
      ...input,
      user_id: user.id
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/audit-logs-v2')
  return { data }
}

export async function updateAlertRule(input: UpdateAlertRuleInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { id, ...updateData } = input

  const { data, error } = await supabase
    .from('audit_alert_rules')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/audit-logs-v2')
  return { data }
}

export async function deleteAlertRule(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('audit_alert_rules')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/audit-logs-v2')
  return { success: true }
}

export async function toggleAlertRule(id: string, isActive: boolean) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('audit_alert_rules')
    .update({ is_active: isActive })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/audit-logs-v2')
  return { data }
}

// Search logs
export async function searchAuditLogs(query: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('user_id', user.id)
    .or(`action.ilike.%${query}%,description.ilike.%${query}%,user_email.ilike.%${query}%,ip_address.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    return { error: error.message }
  }

  return { data }
}
