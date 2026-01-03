'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'
import { uuidSchema } from '@/lib/validations'

// ============================================
// TYPES
// ============================================

interface AuditLog {
  id: string
  user_id: string
  log_type: string
  severity: string
  action: string
  description?: string | null
  resource?: string | null
  user_email?: string | null
  ip_address?: string | null
  location?: string | null
  device?: string | null
  status?: string | null
  request_method?: string | null
  request_path?: string | null
  request_body?: Record<string, unknown> | null
  response_status?: number | null
  duration_ms?: number | null
  metadata?: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

interface AuditLogStats {
  total: number
  byType: {
    authentication: number
    data: number
    system: number
    security: number
    admin: number
  }
  bySeverity: {
    info: number
    warning: number
    error: number
    critical: number
  }
  byStatus: {
    success: number
    failed: number
    blocked: number
  }
}

interface AlertRule {
  id: string
  user_id: string
  rule_name: string
  description?: string | null
  log_type?: string | null
  severity?: string | null
  action_pattern?: string | null
  conditions?: Record<string, unknown> | null
  notification_channels?: string[] | null
  is_active: boolean
  deleted_at?: string | null
  created_at: string
  updated_at: string
}

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
  is_active?: boolean
}

interface GetAuditLogsFilters {
  logType?: string
  severity?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  limit?: number
}

interface ExportAuditLogsFilters extends GetAuditLogsFilters {
  format?: 'json' | 'csv'
}

interface ExportResult {
  data: string | AuditLog[]
  format: 'json' | 'csv'
}

// ============================================
// LOGGER
// ============================================

const logger = createFeatureLogger('audit-logs')

// ============================================
// AUDIT LOG ACTIONS
// ============================================

/**
 * Create a new audit log entry
 */
export async function createAuditLog(
  input: CreateAuditLogInput
): Promise<ActionResult<AuditLog>> {
  try {
    if (!input.log_type || input.log_type.trim().length === 0) {
      return actionError('Log type is required', 'VALIDATION_ERROR')
    }

    if (!input.action || input.action.trim().length === 0) {
      return actionError('Action is required', 'VALIDATION_ERROR')
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Create audit log failed: User not authenticated')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        severity: input.severity || 'info',
        ...input
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create audit log', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Audit log created successfully', {
      logId: data.id,
      userId: user.id,
      logType: input.log_type,
      severity: input.severity
    })

    revalidatePath('/dashboard/audit-logs-v2')
    return actionSuccess(data as AuditLog)
  } catch (error) {
    logger.error('Unexpected error creating audit log', { error })
    return actionError('Failed to create audit log', 'INTERNAL_ERROR')
  }
}

/**
 * Get audit logs with optional filters
 */
export async function getAuditLogs(
  filters?: GetAuditLogsFilters
): Promise<ActionResult<AuditLog[]>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Get audit logs failed: User not authenticated')
      return actionError('Not authenticated', 'UNAUTHORIZED')
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

    const limit = filters?.limit || 100
    query = query.limit(limit)

    const { data, error } = await query

    if (error) {
      logger.error('Failed to get audit logs', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Audit logs retrieved successfully', {
      userId: user.id,
      count: data.length,
      filters
    })

    return actionSuccess(data as AuditLog[])
  } catch (error) {
    logger.error('Unexpected error getting audit logs', { error })
    return actionError('Failed to get audit logs', 'INTERNAL_ERROR')
  }
}

/**
 * Get audit log statistics
 */
export async function getAuditLogStats(): Promise<ActionResult<AuditLogStats>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Get audit log stats failed: User not authenticated')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: logs, error } = await supabase
      .from('audit_logs')
      .select('log_type, severity, status')
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to get audit log stats', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    const stats: AuditLogStats = {
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

    logger.info('Audit log stats retrieved successfully', {
      userId: user.id,
      total: stats.total
    })

    return actionSuccess(stats)
  } catch (error) {
    logger.error('Unexpected error getting audit log stats', { error })
    return actionError('Failed to get audit log stats', 'INTERNAL_ERROR')
  }
}

/**
 * Export audit logs
 */
export async function exportAuditLogs(
  filters?: ExportAuditLogsFilters
): Promise<ActionResult<ExportResult>> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Export audit logs failed: User not authenticated')
      return actionError('Not authenticated', 'UNAUTHORIZED')
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
      logger.error('Failed to export audit logs', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
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
        log.status || ''
      ])
      const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')

      logger.info('Audit logs exported successfully as CSV', {
        userId: user.id,
        count: data.length
      })

      return actionSuccess({ data: csv, format: 'csv' as const })
    }

    logger.info('Audit logs exported successfully as JSON', {
      userId: user.id,
      count: data.length
    })

    return actionSuccess({ data: data as AuditLog[], format: 'json' as const })
  } catch (error) {
    logger.error('Unexpected error exporting audit logs', { error })
    return actionError('Failed to export audit logs', 'INTERNAL_ERROR')
  }
}

/**
 * Search audit logs
 */
export async function searchAuditLogs(
  query: string
): Promise<ActionResult<AuditLog[]>> {
  try {
    if (!query || query.trim().length === 0) {
      return actionError('Search query is required', 'VALIDATION_ERROR')
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Search audit logs failed: User not authenticated')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const searchQuery = query.trim()
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', user.id)
      .or(`action.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,user_email.ilike.%${searchQuery}%,ip_address.ilike.%${searchQuery}%`)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      logger.error('Failed to search audit logs', { error, userId: user.id, query: searchQuery })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Audit logs search completed', {
      userId: user.id,
      query: searchQuery,
      resultsCount: data.length
    })

    return actionSuccess(data as AuditLog[])
  } catch (error) {
    logger.error('Unexpected error searching audit logs', { error })
    return actionError('Failed to search audit logs', 'INTERNAL_ERROR')
  }
}

// ============================================
// ALERT RULE ACTIONS
// ============================================

/**
 * Create a new alert rule
 */
export async function createAlertRule(
  input: CreateAlertRuleInput
): Promise<ActionResult<AlertRule>> {
  try {
    if (!input.rule_name || input.rule_name.trim().length === 0) {
      return actionError('Rule name is required', 'VALIDATION_ERROR')
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Create alert rule failed: User not authenticated')
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('audit_alert_rules')
      .insert({
        user_id: user.id,
        is_active: true,
        ...input
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create alert rule', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Alert rule created successfully', {
      ruleId: data.id,
      userId: user.id,
      ruleName: input.rule_name
    })

    revalidatePath('/dashboard/audit-logs-v2')
    return actionSuccess(data as AlertRule)
  } catch (error) {
    logger.error('Unexpected error creating alert rule', { error })
    return actionError('Failed to create alert rule', 'INTERNAL_ERROR')
  }
}

/**
 * Update an alert rule
 */
export async function updateAlertRule(
  id: string,
  input: UpdateAlertRuleInput
): Promise<ActionResult<AlertRule>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid alert rule ID format', 'VALIDATION_ERROR')
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Update alert rule failed: User not authenticated', { ruleId: id })
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('audit_alert_rules')
      .update({
        ...input,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update alert rule', { error, ruleId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Alert rule updated successfully', { ruleId: id, userId: user.id })

    revalidatePath('/dashboard/audit-logs-v2')
    return actionSuccess(data as AlertRule)
  } catch (error) {
    logger.error('Unexpected error updating alert rule', { error, ruleId: id })
    return actionError('Failed to update alert rule', 'INTERNAL_ERROR')
  }
}

/**
 * Delete an alert rule (soft delete)
 */
export async function deleteAlertRule(
  id: string
): Promise<ActionResult<{ success: true }>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid alert rule ID format', 'VALIDATION_ERROR')
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Delete alert rule failed: User not authenticated', { ruleId: id })
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('audit_alert_rules')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete alert rule', { error, ruleId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Alert rule deleted successfully', { ruleId: id, userId: user.id })

    revalidatePath('/dashboard/audit-logs-v2')
    return actionSuccess({ success: true })
  } catch (error) {
    logger.error('Unexpected error deleting alert rule', { error, ruleId: id })
    return actionError('Failed to delete alert rule', 'INTERNAL_ERROR')
  }
}

/**
 * Toggle alert rule active status
 */
export async function toggleAlertRule(
  id: string,
  isActive: boolean
): Promise<ActionResult<AlertRule>> {
  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid alert rule ID format', 'VALIDATION_ERROR')
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Toggle alert rule failed: User not authenticated', { ruleId: id })
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('audit_alert_rules')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to toggle alert rule', {
        error,
        ruleId: id,
        userId: user.id,
        isActive
      })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Alert rule toggled successfully', {
      ruleId: id,
      userId: user.id,
      isActive
    })

    revalidatePath('/dashboard/audit-logs-v2')
    return actionSuccess(data as AlertRule)
  } catch (error) {
    logger.error('Unexpected error toggling alert rule', { error, ruleId: id })
    return actionError('Failed to toggle alert rule', 'INTERNAL_ERROR')
  }
}
