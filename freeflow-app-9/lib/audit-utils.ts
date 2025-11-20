import type {
  AuditLog,
  ActivitySummary,
  ComplianceReport,
  ActivityType,
  EntityType,
  SeverityLevel
} from './audit-types'

// Mock Audit Logs
export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: new Date('2025-01-21T14:30:00'),
    userId: 'user-1',
    userName: 'John Doe',
    userEmail: 'john@company.com',
    activityType: 'create',
    entityType: 'invoice',
    entityId: 'inv-001',
    entityName: 'Invoice #INV-2024-001',
    action: 'Created new invoice',
    description: 'Created invoice for client Acme Corp worth $5,000',
    severity: 'low',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    location: 'San Francisco, CA',
    changes: [
      { field: 'total', oldValue: null, newValue: 5000, dataType: 'number' },
      { field: 'status', oldValue: null, newValue: 'draft', dataType: 'string' }
    ]
  },
  {
    id: 'log-2',
    timestamp: new Date('2025-01-21T14:15:00'),
    userId: 'user-2',
    userName: 'Jane Smith',
    userEmail: 'jane@company.com',
    activityType: 'update',
    entityType: 'client',
    entityId: 'client-001',
    entityName: 'Acme Corp',
    action: 'Updated client information',
    description: 'Changed client email address',
    severity: 'medium',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    location: 'New York, NY',
    changes: [
      { field: 'email', oldValue: 'old@acme.com', newValue: 'new@acme.com', dataType: 'string' }
    ]
  },
  {
    id: 'log-3',
    timestamp: new Date('2025-01-21T13:45:00'),
    userId: 'user-1',
    userName: 'John Doe',
    userEmail: 'john@company.com',
    activityType: 'delete',
    entityType: 'file',
    entityId: 'file-001',
    entityName: 'old-report.pdf',
    action: 'Deleted file',
    description: 'Permanently deleted file from storage',
    severity: 'high',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    location: 'San Francisco, CA'
  },
  {
    id: 'log-4',
    timestamp: new Date('2025-01-21T13:30:00'),
    userId: 'user-3',
    userName: 'Admin User',
    userEmail: 'admin@company.com',
    activityType: 'permission-change',
    entityType: 'user',
    entityId: 'user-2',
    entityName: 'Jane Smith',
    action: 'Changed user permissions',
    description: 'Granted admin access to user',
    severity: 'critical',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    location: 'San Francisco, CA',
    changes: [
      { field: 'role', oldValue: 'user', newValue: 'admin', dataType: 'string' }
    ]
  },
  {
    id: 'log-5',
    timestamp: new Date('2025-01-21T12:00:00'),
    userId: 'user-1',
    userName: 'John Doe',
    userEmail: 'john@company.com',
    activityType: 'login',
    entityType: 'user',
    entityId: 'user-1',
    entityName: 'John Doe',
    action: 'User logged in',
    description: 'Successful login from new device',
    severity: 'low',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    location: 'San Francisco, CA'
  },
  {
    id: 'log-6',
    timestamp: new Date('2025-01-21T11:30:00'),
    userId: 'user-2',
    userName: 'Jane Smith',
    userEmail: 'jane@company.com',
    activityType: 'export',
    entityType: 'report',
    entityId: 'report-001',
    entityName: 'Q1 Financial Report',
    action: 'Exported report',
    description: 'Exported financial report as PDF',
    severity: 'medium',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    location: 'New York, NY'
  },
  {
    id: 'log-7',
    timestamp: new Date('2025-01-21T10:15:00'),
    userId: 'user-1',
    userName: 'John Doe',
    userEmail: 'john@company.com',
    activityType: 'create',
    entityType: 'project',
    entityId: 'project-001',
    entityName: 'Website Redesign',
    action: 'Created new project',
    description: 'Created project for client website redesign',
    severity: 'low',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    location: 'San Francisco, CA'
  },
  {
    id: 'log-8',
    timestamp: new Date('2025-01-21T09:00:00'),
    userId: 'user-3',
    userName: 'Admin User',
    userEmail: 'admin@company.com',
    activityType: 'settings-change',
    entityType: 'integration',
    entityId: 'int-stripe',
    entityName: 'Stripe Integration',
    action: 'Updated integration settings',
    description: 'Changed Stripe webhook configuration',
    severity: 'high',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    location: 'San Francisco, CA',
    changes: [
      { field: 'webhook_url', oldValue: 'https://old.webhook.com', newValue: 'https://new.webhook.com', dataType: 'string' }
    ]
  }
]

// Activity Summary
export const ACTIVITY_SUMMARY: ActivitySummary = {
  totalActivities: 1247,
  todayActivities: 38,
  weekActivities: 245,
  monthActivities: 1247,
  byType: {
    create: 324,
    update: 456,
    delete: 89,
    login: 234,
    logout: 198,
    export: 67,
    import: 23,
    share: 45,
    'permission-change': 12,
    'settings-change': 19
  },
  byEntity: {
    user: 432,
    client: 234,
    project: 156,
    invoice: 189,
    payment: 98,
    file: 67,
    report: 45,
    workflow: 23,
    integration: 12,
    widget: 11
  },
  bySeverity: {
    low: 856,
    medium: 298,
    high: 78,
    critical: 15
  },
  topUsers: [
    { userId: 'user-1', userName: 'John Doe', activityCount: 456, lastActive: new Date('2025-01-21T14:30:00') },
    { userId: 'user-2', userName: 'Jane Smith', activityCount: 389, lastActive: new Date('2025-01-21T14:15:00') },
    { userId: 'user-3', userName: 'Admin User', activityCount: 234, lastActive: new Date('2025-01-21T13:30:00') }
  ],
  recentCritical: MOCK_AUDIT_LOGS.filter(log => log.severity === 'critical')
}

// Compliance Report
export const COMPLIANCE_REPORT: ComplianceReport = {
  id: 'report-001',
  name: 'Q1 2025 Compliance Report',
  generatedAt: new Date('2025-01-21'),
  period: {
    start: new Date('2025-01-01'),
    end: new Date('2025-03-31')
  },
  totalLogs: 1247,
  criticalEvents: 15,
  securityIncidents: 3,
  dataChanges: 545,
  userLogins: 234,
  failedLogins: 12,
  exportActivities: 67,
  permissionChanges: 12,
  complianceScore: 94.5,
  findings: [
    {
      id: 'finding-1',
      category: 'security',
      severity: 'high',
      title: 'Multiple Failed Login Attempts',
      description: '12 failed login attempts detected from unusual locations',
      affectedLogs: ['log-9', 'log-10', 'log-11'],
      recommendation: 'Implement rate limiting and IP blocking for failed login attempts'
    },
    {
      id: 'finding-2',
      category: 'access',
      severity: 'medium',
      title: 'Permission Changes Not Documented',
      description: 'Some permission changes lack proper documentation',
      affectedLogs: ['log-4'],
      recommendation: 'Require approval and documentation for all permission changes'
    }
  ]
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
