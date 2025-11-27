// Audit Trail System - Supabase Queries
// Complete activity logging, compliance reporting, and security tracking

import { createClient } from '@/lib/supabase/client'
import type {
  ActivityType,
  EntityType,
  SeverityLevel,
  AuditLog,
  ActivitySummary,
  ComplianceReport,
  ComplianceFinding,
  AuditFilter
} from '@/lib/audit-types'

// ============================================================================
// AUDIT LOG QUERIES
// ============================================================================

/**
 * Log an activity (create audit trail entry)
 */
export async function logActivity(data: {
  user_id: string
  activity_type: ActivityType
  entity_type: EntityType
  action: string
  description: string
  severity?: SeverityLevel
  entity_id?: string
  entity_name?: string
  ip_address?: string
  user_agent?: string
  location?: string
  changes?: any[]
  metadata?: any
}) {
  const supabase = createClient()

  // Convert activity_type to match database enum format
  const activityTypeMap: Record<ActivityType, string> = {
    'create': 'create',
    'update': 'update',
    'delete': 'delete',
    'login': 'login',
    'logout': 'logout',
    'export': 'export',
    'import': 'import',
    'share': 'share',
    'permission-change': 'permission_change',
    'settings-change': 'settings_change'
  }

  const { data: log, error } = await supabase
    .from('audit_logs')
    .insert({
      user_id: data.user_id,
      activity_type: activityTypeMap[data.activity_type] || data.activity_type,
      entity_type: data.entity_type,
      action: data.action,
      description: data.description,
      severity: data.severity || 'low',
      entity_id: data.entity_id,
      entity_name: data.entity_name,
      ip_address: data.ip_address,
      user_agent: data.user_agent,
      location: data.location,
      changes: data.changes || [],
      metadata: data.metadata || {}
    })
    .select()
    .single()

  if (error) throw error
  return log
}

/**
 * Get all audit logs with optional filters
 */
export async function getAuditLogs(userId: string, filters?: AuditFilter, limit: number = 100) {
  const supabase = createClient()

  let query = supabase
    .from('audit_logs')
    .select('*')
    .eq('user_id', userId)

  // Apply filters
  if (filters?.startDate) {
    query = query.gte('timestamp', filters.startDate.toISOString())
  }
  if (filters?.endDate) {
    query = query.lte('timestamp', filters.endDate.toISOString())
  }
  if (filters?.activityTypes && filters.activityTypes.length > 0) {
    query = query.in('activity_type', filters.activityTypes)
  }
  if (filters?.entityTypes && filters.entityTypes.length > 0) {
    query = query.in('entity_type', filters.entityTypes)
  }
  if (filters?.severityLevels && filters.severityLevels.length > 0) {
    query = query.in('severity', filters.severityLevels)
  }
  if (filters?.searchQuery) {
    query = query.or(`action.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%,entity_name.ilike.%${filters.searchQuery}%`)
  }

  const { data, error } = await query
    .order('timestamp', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

/**
 * Get audit log by ID
 */
export async function getAuditLogById(logId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('id', logId)
    .single()

  if (error) throw error
  return data
}

/**
 * Get recent critical events
 */
export async function getCriticalEvents(userId: string, limit: number = 20) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('severity', 'critical')
    .order('timestamp', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

/**
 * Get logs by activity type
 */
export async function getLogsByActivityType(
  userId: string,
  activityType: ActivityType,
  limit: number = 50
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('activity_type', activityType)
    .order('timestamp', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

/**
 * Get logs by entity
 */
export async function getLogsByEntity(
  userId: string,
  entityType: EntityType,
  entityId: string,
  limit: number = 50
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('timestamp', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

/**
 * Get activity summary statistics
 */
export async function getActivitySummary(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<ActivitySummary> {
  const supabase = createClient()

  const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
  const end = endDate || new Date()

  // Get all logs in period
  const { data: logs, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('timestamp', start.toISOString())
    .lte('timestamp', end.toISOString())

  if (error) throw error

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Calculate metrics
  const summary: ActivitySummary = {
    totalActivities: logs.length,
    todayActivities: logs.filter(l => new Date(l.timestamp) >= today).length,
    weekActivities: logs.filter(l => new Date(l.timestamp) >= weekAgo).length,
    monthActivities: logs.filter(l => new Date(l.timestamp) >= monthAgo).length,
    byType: {} as Record<ActivityType, number>,
    byEntity: {} as Record<EntityType, number>,
    bySeverity: {} as Record<SeverityLevel, number>,
    topUsers: [],
    recentCritical: logs.filter(l => l.severity === 'critical').slice(0, 10)
  }

  // Count by type
  logs.forEach(log => {
    summary.byType[log.activity_type as ActivityType] = (summary.byType[log.activity_type as ActivityType] || 0) + 1
    summary.byEntity[log.entity_type as EntityType] = (summary.byEntity[log.entity_type as EntityType] || 0) + 1
    summary.bySeverity[log.severity as SeverityLevel] = (summary.bySeverity[log.severity as SeverityLevel] || 0) + 1
  })

  return summary
}

/**
 * Delete audit log (admin only - use with caution)
 */
export async function deleteAuditLog(logId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('audit_logs')
    .delete()
    .eq('id', logId)

  if (error) throw error
}

/**
 * Bulk delete old audit logs
 */
export async function deleteOldLogs(userId: string, olderThanDays: number = 365) {
  const supabase = createClient()

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

  const { error } = await supabase
    .from('audit_logs')
    .delete()
    .eq('user_id', userId)
    .lt('timestamp', cutoffDate.toISOString())

  if (error) throw error
}

// ============================================================================
// COMPLIANCE REPORT QUERIES
// ============================================================================

/**
 * Generate compliance report
 */
export async function generateComplianceReport(
  userId: string,
  name: string,
  periodStart: Date,
  periodEnd: Date
) {
  const supabase = createClient()

  // Get logs in period
  const { data: logs, error: logsError } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('timestamp', periodStart.toISOString())
    .lte('timestamp', periodEnd.toISOString())

  if (logsError) throw logsError

  // Calculate metrics
  const criticalEvents = logs.filter(l => l.severity === 'critical').length
  const securityIncidents = logs.filter(l =>
    l.activity_type === 'permission_change' ||
    l.entity_type === 'user' ||
    l.severity === 'critical'
  ).length
  const dataChanges = logs.filter(l =>
    l.activity_type === 'update' ||
    l.activity_type === 'delete'
  ).length
  const userLogins = logs.filter(l => l.activity_type === 'login').length
  const failedLogins = logs.filter(l =>
    l.activity_type === 'login' &&
    l.severity === 'high'
  ).length
  const exportActivities = logs.filter(l => l.activity_type === 'export').length
  const permissionChanges = logs.filter(l => l.activity_type === 'permission_change').length

  // Calculate compliance score (100 = perfect, deduct for issues)
  let complianceScore = 100
  if (failedLogins > 10) complianceScore -= 10
  if (criticalEvents > 5) complianceScore -= 15
  if (securityIncidents > 10) complianceScore -= 20
  if (permissionChanges > 50) complianceScore -= 5
  complianceScore = Math.max(0, complianceScore)

  // Create report
  const { data: report, error: reportError } = await supabase
    .from('compliance_reports')
    .insert({
      user_id: userId,
      name,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      total_logs: logs.length,
      critical_events: criticalEvents,
      security_incidents: securityIncidents,
      data_changes: dataChanges,
      user_logins: userLogins,
      failed_logins: failedLogins,
      export_activities: exportActivities,
      permission_changes: permissionChanges,
      compliance_score: complianceScore,
      summary: {
        period: {
          start: periodStart.toISOString(),
          end: periodEnd.toISOString()
        },
        highlights: {
          total_activities: logs.length,
          critical_events: criticalEvents,
          compliance_score: complianceScore
        }
      }
    })
    .select()
    .single()

  if (reportError) throw reportError

  // Auto-generate findings for critical issues
  const findings: Partial<ComplianceFinding>[] = []

  if (failedLogins > 10) {
    findings.push({
      report_id: report.id,
      category: 'security',
      severity: 'high',
      title: 'High Number of Failed Logins',
      description: `Detected ${failedLogins} failed login attempts during the reporting period.`,
      recommendation: 'Review login security policies and consider implementing additional authentication measures.',
      affected_count: failedLogins
    })
  }

  if (criticalEvents > 0) {
    findings.push({
      report_id: report.id,
      category: 'security',
      severity: 'critical',
      title: 'Critical Security Events',
      description: `Found ${criticalEvents} critical security events requiring immediate attention.`,
      recommendation: 'Review all critical events and ensure appropriate actions have been taken.',
      affected_count: criticalEvents
    })
  }

  // Insert findings
  if (findings.length > 0) {
    await supabase
      .from('compliance_findings')
      .insert(findings)
  }

  return report
}

/**
 * Get all compliance reports
 */
export async function getComplianceReports(userId: string, limit: number = 50) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('compliance_reports')
    .select('*')
    .eq('user_id', userId)
    .order('generated_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

/**
 * Get compliance report by ID with findings
 */
export async function getComplianceReport(reportId: string) {
  const supabase = createClient()

  const [reportResult, findingsResult] = await Promise.all([
    supabase
      .from('compliance_reports')
      .select('*')
      .eq('id', reportId)
      .single(),
    supabase
      .from('compliance_findings')
      .select('*')
      .eq('report_id', reportId)
      .order('severity', { ascending: false })
  ])

  if (reportResult.error) throw reportResult.error
  if (findingsResult.error) throw findingsResult.error

  return {
    ...reportResult.data,
    findings: findingsResult.data
  }
}

/**
 * Delete compliance report
 */
export async function deleteComplianceReport(reportId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('compliance_reports')
    .delete()
    .eq('id', reportId)

  if (error) throw error
}

// ============================================================================
// COMPLIANCE FINDINGS QUERIES
// ============================================================================

/**
 * Add compliance finding
 */
export async function addComplianceFinding(findingData: Partial<ComplianceFinding>) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('compliance_findings')
    .insert(findingData)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get findings by report
 */
export async function getFindingsByReport(reportId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('compliance_findings')
    .select('*')
    .eq('report_id', reportId)
    .order('severity', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Get findings by severity
 */
export async function getFindingsBySeverity(reportId: string, severity: SeverityLevel) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('compliance_findings')
    .select('*')
    .eq('report_id', reportId)
    .eq('severity', severity)

  if (error) throw error
  return data
}

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

/**
 * Export audit logs to CSV
 */
export async function exportAuditLogs(
  userId: string,
  filters?: AuditFilter,
  format: 'csv' | 'json' = 'csv'
) {
  const logs = await getAuditLogs(userId, filters, 10000) // Get up to 10k logs

  if (format === 'json') {
    return JSON.stringify(logs, null, 2)
  }

  // CSV format
  const headers = [
    'Timestamp',
    'Activity Type',
    'Entity Type',
    'Action',
    'Description',
    'Severity',
    'Entity ID',
    'IP Address',
    'Location'
  ]

  const rows = logs.map(log => [
    log.timestamp,
    log.activity_type,
    log.entity_type,
    log.action,
    log.description,
    log.severity,
    log.entity_id || '',
    log.ip_address || '',
    log.location || ''
  ])

  return { headers, rows }
}

/**
 * Export compliance report to CSV
 */
export async function exportComplianceReport(reportId: string) {
  const report = await getComplianceReport(reportId)

  const headers = ['Report Name', 'Period Start', 'Period End', 'Total Logs', 'Critical Events', 'Compliance Score']
  const rows = [[
    report.name,
    report.period_start,
    report.period_end,
    report.total_logs.toString(),
    report.critical_events.toString(),
    report.compliance_score.toString()
  ]]

  // Add findings
  if (report.findings && report.findings.length > 0) {
    rows.push([]) // Empty row
    rows.push(['Findings', 'Category', 'Severity', 'Description', 'Recommendation', ''])

    report.findings.forEach((finding: ComplianceFinding) => {
      rows.push([
        finding.title,
        finding.category,
        finding.severity,
        finding.description,
        finding.recommendation || '',
        ''
      ])
    })
  }

  return { headers, rows }
}

// ============================================================================
// DASHBOARD QUERIES
// ============================================================================

/**
 * Get audit dashboard data
 */
export async function getAuditDashboard(userId: string) {
  const [recentLogs, criticalEvents, summary] = await Promise.all([
    getAuditLogs(userId, undefined, 20),
    getCriticalEvents(userId, 10),
    getActivitySummary(userId)
  ])

  return {
    recentLogs,
    criticalEvents,
    summary
  }
}
