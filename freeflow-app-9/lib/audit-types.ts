/**
 * Activity Logs & Audit Trail Types
 * Track all user actions and system changes
 */

export type ActivityType =
  | 'create'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'export'
  | 'import'
  | 'share'
  | 'permission-change'
  | 'settings-change'

export type EntityType =
  | 'user'
  | 'client'
  | 'project'
  | 'invoice'
  | 'payment'
  | 'file'
  | 'report'
  | 'workflow'
  | 'integration'
  | 'widget'

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical'

export interface AuditLog {
  id: string
  timestamp: Date
  userId: string
  userName: string
  userEmail: string
  activityType: ActivityType
  entityType: EntityType
  entityId?: string
  entityName?: string
  action: string
  description: string
  severity: SeverityLevel
  ipAddress: string
  userAgent: string
  location?: string
  changes?: ChangeRecord[]
  metadata?: Record<string, any>
}

export interface ChangeRecord {
  field: string
  oldValue: any
  newValue: any
  dataType: string
}

export interface ActivitySummary {
  totalActivities: number
  todayActivities: number
  weekActivities: number
  monthActivities: number
  byType: Record<ActivityType, number>
  byEntity: Record<EntityType, number>
  bySeverity: Record<SeverityLevel, number>
  topUsers: UserActivity[]
  recentCritical: AuditLog[]
}

export interface UserActivity {
  userId: string
  userName: string
  activityCount: number
  lastActive: Date
}

export interface AuditFilter {
  startDate?: Date
  endDate?: Date
  userId?: string
  activityTypes?: ActivityType[]
  entityTypes?: EntityType[]
  severityLevels?: SeverityLevel[]
  searchQuery?: string
}

export interface AuditExport {
  format: 'csv' | 'json' | 'pdf' | 'excel'
  dateRange: {
    start: Date
    end: Date
  }
  filters?: AuditFilter
  includeMetadata: boolean
}

export interface ComplianceReport {
  id: string
  name: string
  generatedAt: Date
  period: {
    start: Date
    end: Date
  }
  totalLogs: number
  criticalEvents: number
  securityIncidents: number
  dataChanges: number
  userLogins: number
  failedLogins: number
  exportActivities: number
  permissionChanges: number
  complianceScore: number
  findings: ComplianceFinding[]
}

export interface ComplianceFinding {
  id: string
  category: 'security' | 'privacy' | 'access' | 'data-integrity'
  severity: SeverityLevel
  title: string
  description: string
  affectedLogs: string[]
  recommendation: string
}
