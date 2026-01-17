import type {
  AuditLog,
  ActivitySummary,
  ComplianceReport,
  ActivityType,
  EntityType,
  SeverityLevel
} from './audit-types'

// Mock Audit Logs
// MIGRATED: Batch #15 - Removed mock data, using database hooks
export const MOCK_AUDIT_LOGS: AuditLog[] = []

// Activity Summary
// MIGRATED: Batch #15 - Removed mock data, using database hooks
export const ACTIVITY_SUMMARY: ActivitySummary = {
  totalActivities: 0,
  todayActivities: 0,
  weekActivities: 0,
  monthActivities: 0,
  byType: {
    create: 0,
    update: 0,
    delete: 0,
    login: 0,
    logout: 0,
    export: 0,
    import: 0,
    share: 0,
    'permission-change': 0,
    'settings-change': 0
  },
  byEntity: {
    user: 0,
    client: 0,
    project: 0,
    invoice: 0,
    payment: 0,
    file: 0,
    report: 0,
    workflow: 0,
    integration: 0,
    widget: 0
  },
  bySeverity: {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0
  },
  topUsers: [],
  recentCritical: []
}

// Compliance Report
// MIGRATED: Batch #15 - Removed mock data, using database hooks
export const COMPLIANCE_REPORT: ComplianceReport = {
  id: '',
  name: '',
  generatedAt: new Date(),
  period: {
    start: new Date(),
    end: new Date()
  },
  totalLogs: 0,
  criticalEvents: 0,
  securityIncidents: 0,
  dataChanges: 0,
  userLogins: 0,
  failedLogins: 0,
  exportActivities: 0,
  permissionChanges: 0,
  complianceScore: 0,
  findings: []
}

// Helper Functions
export function getSeverityColor(severity: SeverityLevel): string {
  const colors: Record<SeverityLevel, string> = {
    low: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    critical: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
  }
  return colors[severity]
}

export function getActivityIcon(type: ActivityType): string {
  const icons: Record<ActivityType, string> = {
    create: '➕',
    update: '✏️',
    delete: '🗑️',
    login: '🔓',
    logout: '🔒',
    export: '📥',
    import: '📤',
    share: '🔗',
    'permission-change': '🔐',
    'settings-change': '⚙️'
  }
  return icons[type]
}

export function getEntityIcon(type: EntityType): string {
  const icons: Record<EntityType, string> = {
    user: '👤',
    client: '🏢',
    project: '📁',
    invoice: '🧾',
    payment: '💳',
    file: '📄',
    report: '📊',
    workflow: '⚡',
    integration: '🔌',
    widget: '📦'
  }
  return icons[type]
}

export function filterLogs(
  logs: AuditLog[],
  filters?: {
    startDate?: Date
    endDate?: Date
    userId?: string
    activityTypes?: ActivityType[]
    entityTypes?: EntityType[]
    severityLevels?: SeverityLevel[]
    searchQuery?: string
  }
): AuditLog[] {
  let filtered = [...logs]

  if (filters?.startDate) {
    filtered = filtered.filter(log => log.timestamp >= filters.startDate!)
  }

  if (filters?.endDate) {
    filtered = filtered.filter(log => log.timestamp <= filters.endDate!)
  }

  if (filters?.userId) {
    filtered = filtered.filter(log => log.userId === filters.userId)
  }

  if (filters?.activityTypes?.length) {
    filtered = filtered.filter(log => filters.activityTypes!.includes(log.activityType))
  }

  if (filters?.entityTypes?.length) {
    filtered = filtered.filter(log => filters.entityTypes!.includes(log.entityType))
  }

  if (filters?.severityLevels?.length) {
    filtered = filtered.filter(log => filters.severityLevels!.includes(log.severity))
  }

  if (filters?.searchQuery) {
    const query = filters.searchQuery.toLowerCase()
    filtered = filtered.filter(log =>
      log.action.toLowerCase().includes(query) ||
      log.description.toLowerCase().includes(query) ||
      log.userName.toLowerCase().includes(query) ||
      log.entityName?.toLowerCase().includes(query)
    )
  }

  return filtered
}

export function exportAuditLogs(logs: AuditLog[], format: 'csv' | 'json' | 'pdf'): void {
  console.log(`Exporting ${logs.length} logs as ${format}`)
  // In a real app, this would trigger actual export functionality
}

export function getLogsByTimeRange(
  logs: AuditLog[],
  range: 'today' | 'week' | 'month' | 'all'
): AuditLog[] {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfWeek = new Date(now.setDate(now.getDate() - 7))
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  switch (range) {
    case 'today':
      return logs.filter(log => log.timestamp >= startOfDay)
    case 'week':
      return logs.filter(log => log.timestamp >= startOfWeek)
    case 'month':
      return logs.filter(log => log.timestamp >= startOfMonth)
    default:
      return logs
  }
}

export function groupLogsByDate(logs: AuditLog[]): Record<string, AuditLog[]> {
  const grouped: Record<string, AuditLog[]> = {}

  logs.forEach(log => {
    const dateKey = log.timestamp.toLocaleDateString()
    if (!grouped[dateKey]) {
      grouped[dateKey] = []
    }
    grouped[dateKey].push(log)
  })

  return grouped
}

export function calculateComplianceScore(logs: AuditLog[]): number {
  const criticalIssues = logs.filter(log => log.severity === 'critical').length
  const highIssues = logs.filter(log => log.severity === 'high').length
  const totalLogs = logs.length

  if (totalLogs === 0) return 100

  const issueRatio = (criticalIssues * 10 + highIssues * 5) / totalLogs
  return Math.max(0, Math.min(100, 100 - issueRatio * 10))
}
