'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import {
  getSeverityColor,
  getActivityIcon,
  getEntityIcon,
  filterLogs,
  groupLogsByDate
} from '@/lib/audit-utils'
import type { AuditLog, ActivityType, EntityType, SeverityLevel } from '@/lib/audit-types'

// A+++ UTILITIES
import { CardSkeleton, DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'

// AUTHENTICATION & LOGGING
import { useCurrentUser } from '@/hooks/use-ai-data'
import { createFeatureLogger } from '@/lib/logger'
import { toast } from 'sonner'

const logger = createFeatureLogger('AuditTrailPage')

type ViewMode = 'overview' | 'logs' | 'compliance' | 'export'

export default function AuditTrailPage() {
  // AUTHENTICATION
  const { userId, loading: userLoading } = useCurrentUser()

  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()

  // DATABASE STATE
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [activitySummary, setActivitySummary] = useState<any>(null)
  const [complianceReports, setComplianceReports] = useState<any[]>([])
  const [criticalEvents, setCriticalEvents] = useState<AuditLog[]>([])

  const [viewMode, setViewMode] = useState<ViewMode>('overview')
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [filters, setFilters] = useState<{
    activityTypes: ActivityType[]
    entityTypes: EntityType[]
    severityLevels: SeverityLevel[]
    searchQuery: string
  }>({
    activityTypes: [],
    entityTypes: [],
    severityLevels: [],
    searchQuery: ''
  })

  // A+++ LOAD AUDIT TRAIL DATA
  useEffect(() => {
    const loadAuditTrailData = async () => {
      // Wait for authentication
      if (userLoading) return

      if (!userId) {
        logger.warn('Audit trail accessed without authentication')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        logger.info('Loading audit trail data', { userId })

        // Load all audit trail data in parallel
        const {
          getAuditLogs,
          getActivitySummary,
          getCriticalEvents,
          getComplianceReports
        } = await import('@/lib/audit-trail-queries')

        const [logs, summary, critical, reports] = await Promise.all([
          getAuditLogs(userId, filters.activityTypes.length || filters.entityTypes.length || filters.severityLevels.length ? {
            activityTypes: filters.activityTypes.length > 0 ? filters.activityTypes : undefined,
            entityTypes: filters.entityTypes.length > 0 ? filters.entityTypes : undefined,
            severityLevels: filters.severityLevels.length > 0 ? filters.severityLevels : undefined,
            searchQuery: filters.searchQuery || undefined
          } : undefined),
          getActivitySummary(userId),
          getCriticalEvents(userId),
          getComplianceReports(userId, 5)
        ])

        setAuditLogs(logs)
        setActivitySummary(summary)
        setCriticalEvents(critical)
        setComplianceReports(reports)

        setIsLoading(false)
        logger.info('Audit trail data loaded successfully', {
          logsCount: logs.length,
          criticalCount: critical.length,
          reportsCount: reports.length
        })
        announce('Audit trail loaded successfully', 'polite')
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load audit trail data'
        logger.error('Failed to load audit trail data', { error: err, userId })
        setError(errorMessage)
        setIsLoading(false)
        announce('Error loading audit trail', 'assertive')
      }
    }

    loadAuditTrailData()
  }, [userId, userLoading, filters]) // eslint-disable-line react-hooks/exhaustive-deps

  const viewTabs = [
    { id: 'overview' as ViewMode, label: 'Overview', icon: '📊' },
    { id: 'logs' as ViewMode, label: 'Activity Logs', icon: '📋' },
    { id: 'compliance' as ViewMode, label: 'Compliance', icon: '✅' },
    { id: 'export' as ViewMode, label: 'Export', icon: '📥' }
  ]

  const filteredLogs = filterLogs(auditLogs, filters)
  const groupedLogs = groupLogsByDate(filteredLogs)

  // HANDLER: Export audit logs
  const handleExportLogs = async () => {
    if (!userId) {
      toast.error('Please log in to export logs')
      logger.warn('Export attempted without authentication')
      return
    }

    try {
      logger.info('Exporting audit logs', { userId, filtersCount: Object.keys(filters).length })

      const { exportAuditLogs } = await import('@/lib/audit-trail-queries')

      // Export with current filters
      const csvData = await exportAuditLogs(
        userId,
        filters.activityTypes.length || filters.entityTypes.length || filters.severityLevels.length ? {
          activityTypes: filters.activityTypes.length > 0 ? filters.activityTypes : undefined,
          entityTypes: filters.entityTypes.length > 0 ? filters.entityTypes : undefined,
          severityLevels: filters.severityLevels.length > 0 ? filters.severityLevels : undefined,
          searchQuery: filters.searchQuery || undefined
        } : undefined,
        'csv'
      )

      // Download CSV file
      const blob = new Blob([csvData], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Audit logs exported successfully')
      logger.info('Audit logs exported', { userId, logsCount: auditLogs.length })
      announce('Audit logs exported successfully', 'polite')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export logs'
      logger.error('Failed to export logs', { error: err, userId })
      toast.error(errorMessage)
    }
  }

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-[1800px] mx-auto space-y-8">
          <CardSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <DashboardSkeleton />
        </div>
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-[1800px] mx-auto">
          <div className="max-w-2xl mx-auto mt-20">
            <ErrorEmptyState
              error={error}
              onRetry={() => window.location.reload()}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-[1800px] mx-auto space-y-8">
        {/* Header */}
        <ScrollReveal>
          <div className="flex items-center justify-between">
            <div>
              <TextShimmer className="text-4xl font-bold mb-2">
                Audit Trail
              </TextShimmer>
              <p className="text-muted-foreground">
                Complete activity logs and compliance reporting
              </p>
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg text-sm font-medium hover:from-red-600 hover:to-orange-600 transition-colors">
              Export Logs
            </button>
          </div>
        </ScrollReveal>

        {/* View Tabs */}
        <ScrollReveal delay={0.1}>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {viewTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  viewMode === tab.id
                    ? 'bg-red-500 text-white shadow-lg'
                    : 'bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Overview */}
        {viewMode === 'overview' && (
          <>
            {/* Statistics */}
            <ScrollReveal delay={0.2}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <LiquidGlassCard>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground mb-1">Total Activities</div>
                        <div className="text-3xl font-bold text-blue-500">
                          {activitySummary?.totalActivities?.toLocaleString() || '0'}
                        </div>
                      </div>
                      <div className="text-2xl">📊</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {activitySummary?.todayActivities || 0} today
                    </div>
                  </div>
                </LiquidGlassCard>

                <LiquidGlassCard>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground mb-1">This Week</div>
                        <div className="text-3xl font-bold text-green-500">
                          {activitySummary?.weekActivities || 0}
                        </div>
                      </div>
                      <div className="text-2xl">📅</div>
                    </div>
                    <div className="text-xs text-green-500">
                      Active monitoring
                    </div>
                  </div>
                </LiquidGlassCard>

                <LiquidGlassCard>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground mb-1">Critical Events</div>
                        <div className="text-3xl font-bold text-red-500">
                          {activitySummary?.bySeverity?.critical || 0}
                        </div>
                      </div>
                      <div className="text-2xl">⚠️</div>
                    </div>
                    <div className="text-xs text-red-500">
                      Requires attention
                    </div>
                  </div>
                </LiquidGlassCard>

                <LiquidGlassCard>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground mb-1">Compliance Score</div>
                        <div className="text-3xl font-bold text-purple-500">
                          {complianceReports[0]?.complianceScore?.toFixed(1) || '0.0'}%
                        </div>
                      </div>
                      <div className="text-2xl">✅</div>
                    </div>
                    <div className="text-xs text-purple-500">
                      Excellent standing
                    </div>
                  </div>
                </LiquidGlassCard>
              </div>
            </ScrollReveal>

            {/* Activity by Type */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ScrollReveal delay={0.3}>
                <LiquidGlassCard>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-6">Activity by Type</h3>
                    <div className="space-y-3">
                      {activitySummary?.byType && Object.entries(activitySummary.byType)
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .slice(0, 6)
                        .map(([type, count]) => {
                          const percentage = ((count as number) / (activitySummary.totalActivities || 1)) * 100
                          return (
                            <div key={type}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span>{getActivityIcon(type as ActivityType)}</span>
                                  <span className="text-sm font-medium capitalize">{type.replace('-', ' ')}</span>
                                </div>
                                <span className="text-sm font-bold">{count}</span>
                              </div>
                              <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ duration: 0.5 }}
                                  className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                                />
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                </LiquidGlassCard>
              </ScrollReveal>

              <ScrollReveal delay={0.4}>
                <LiquidGlassCard>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-6">Top Users</h3>
                    <div className="space-y-4">
                      {activitySummary?.topUsers?.map((user: any, index: number) => (
                        <div key={user.userId} className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold">{user.userName}</div>
                            <div className="text-xs text-muted-foreground">
                              Last active: {user.lastActive.toLocaleString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-red-500">{user.activityCount}</div>
                            <div className="text-xs text-muted-foreground">activities</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </LiquidGlassCard>
              </ScrollReveal>
            </div>

            {/* Recent Critical Events */}
            {criticalEvents.length > 0 && (
              <ScrollReveal delay={0.5}>
                <LiquidGlassCard>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                      <span>⚠️</span>
                      <span>Recent Critical Events</span>
                    </h3>
                    <div className="space-y-3">
                      {criticalEvents.map((log) => (
                        <div
                          key={log.id}
                          className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span>{getActivityIcon(log.activityType)}</span>
                                <span className="font-semibold">{log.action}</span>
                                <span className={`text-xs px-2 py-0.5 rounded ${getSeverityColor(log.severity)}`}>
                                  {log.severity}
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground">{log.description}</div>
                              <div className="text-xs text-muted-foreground mt-2">
                                {log.userName} • {log.timestamp.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </LiquidGlassCard>
              </ScrollReveal>
            )}
          </>
        )}

        {/* Logs View */}
        {viewMode === 'logs' && (
          <>
            {/* Filters */}
            <ScrollReveal delay={0.2}>
              <LiquidGlassCard>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Filters</h3>
                    <button
                      onClick={() => setFilters({ activityTypes: [], entityTypes: [], severityLevels: [], searchQuery: '' })}
                      className="text-sm text-red-500 hover:text-red-600 font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input
                      type="text"
                      placeholder="Search logs..."
                      value={filters.searchQuery}
                      onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                      className="px-4 py-2 rounded-lg bg-muted"
                    />
                    <select
                      className="px-4 py-2 rounded-lg bg-muted"
                      onChange={(e) => setFilters({
                        ...filters,
                        severityLevels: e.target.value ? [e.target.value as SeverityLevel] : []
                      })}
                    >
                      <option value="">All Severities</option>
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                    <select className="px-4 py-2 rounded-lg bg-muted">
                      <option>All Users</option>
                      <option>John Doe</option>
                      <option>Jane Smith</option>
                      <option>Admin User</option>
                    </select>
                    <select className="px-4 py-2 rounded-lg bg-muted">
                      <option>All Time</option>
                      <option>Today</option>
                      <option>This Week</option>
                      <option>This Month</option>
                    </select>
                  </div>
                </div>
              </LiquidGlassCard>
            </ScrollReveal>

            {/* Logs List */}
            <ScrollReveal delay={0.3}>
              <LiquidGlassCard>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Activity Logs ({filteredLogs.length})</h3>
                  </div>

                  <div className="space-y-6">
                    {Object.entries(groupedLogs).map(([date, logs]) => (
                      <div key={date}>
                        <div className="text-sm font-semibold text-muted-foreground mb-3">{date}</div>
                        <div className="space-y-2">
                          {logs.map((log) => (
                            <div
                              key={log.id}
                              onClick={() => setSelectedLog(log)}
                              className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xl">{getActivityIcon(log.activityType)}</span>
                                    <span className="text-xl">{getEntityIcon(log.entityType)}</span>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold">{log.action}</span>
                                      <span className={`text-xs px-2 py-0.5 rounded ${getSeverityColor(log.severity)}`}>
                                        {log.severity}
                                      </span>
                                    </div>
                                    <div className="text-sm text-muted-foreground mb-1">{log.description}</div>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                      <span>👤 {log.userName}</span>
                                      <span>🕒 {log.timestamp.toLocaleTimeString()}</span>
                                      <span>📍 {log.location}</span>
                                      <span>💻 {log.ipAddress}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </LiquidGlassCard>
            </ScrollReveal>
          </>
        )}

        {/* Compliance View */}
        {viewMode === 'compliance' && (
          <>
            <ScrollReveal delay={0.2}>
              <LiquidGlassCard>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold">{complianceReports[0]?.name || 'Compliance Report'}</h3>
                      <p className="text-sm text-muted-foreground">
                        Generated: {complianceReports[0]?.generatedAt ? new Date(complianceReports[0].generatedAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-500 mb-1">
                        {complianceReports[0]?.complianceScore?.toFixed(1) || '0.0'}%
                      </div>
                      <div className="text-sm text-muted-foreground">Compliance Score</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                      <div className="text-2xl font-bold text-blue-500">{complianceReports[0]?.totalLogs || 0}</div>
                      <div className="text-xs text-muted-foreground">Total Logs</div>
                    </div>
                    <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30">
                      <div className="text-2xl font-bold text-red-500">{complianceReports[0]?.criticalEvents || 0}</div>
                      <div className="text-xs text-muted-foreground">Critical Events</div>
                    </div>
                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30">
                      <div className="text-2xl font-bold text-green-500">{complianceReports[0]?.userLogins || 0}</div>
                      <div className="text-xs text-muted-foreground">User Logins</div>
                    </div>
                    <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/30">
                      <div className="text-2xl font-bold text-orange-500">{complianceReports[0]?.permissionChanges || 0}</div>
                      <div className="text-xs text-muted-foreground">Permission Changes</div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-semibold mb-4">Compliance Findings</h4>
                    <div className="space-y-4">
                      {complianceReports[0]?.findings?.map((finding: any) => (
                        <div
                          key={finding.id}
                          className={`p-4 rounded-lg border-l-4 ${
                            finding.severity === 'critical' ? 'border-red-500 bg-red-50 dark:bg-red-950/30' :
                            finding.severity === 'high' ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30' :
                            finding.severity === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30' :
                            'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="font-semibold mb-1">{finding.title}</div>
                              <div className="text-sm text-muted-foreground mb-2">{finding.description}</div>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(finding.severity)}`}>
                              {finding.severity}
                            </span>
                          </div>
                          <div className="text-sm">
                            <div className="font-medium mb-1">Recommendation:</div>
                            <div className="text-muted-foreground">{finding.recommendation}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </LiquidGlassCard>
            </ScrollReveal>
          </>
        )}

        {/* Export View */}
        {viewMode === 'export' && (
          <ScrollReveal delay={0.2}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LiquidGlassCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-6">Export Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Export Format</label>
                      <select className="w-full px-4 py-2 rounded-lg bg-muted">
                        <option>CSV</option>
                        <option>JSON</option>
                        <option>PDF</option>
                        <option>Excel</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Date Range</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="date" className="px-4 py-2 rounded-lg bg-muted" />
                        <input type="date" className="px-4 py-2 rounded-lg bg-muted" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Include</label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked />
                          <span className="text-sm">User Information</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked />
                          <span className="text-sm">IP Addresses</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked />
                          <span className="text-sm">Change Details</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" />
                          <span className="text-sm">Metadata</span>
                        </label>
                      </div>
                    </div>
                    <button
                      onClick={handleExportLogs}
                      className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Export Audit Logs
                    </button>
                  </div>
                </div>
              </LiquidGlassCard>

              <LiquidGlassCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-6">Export History</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'audit-logs-2025-01-21.csv', size: '2.4 MB', date: '2025-01-21' },
                      { name: 'compliance-report-q1.pdf', size: '1.8 MB', date: '2025-01-15' },
                      { name: 'audit-logs-2025-01-01.json', size: '5.2 MB', date: '2025-01-01' }
                    ].map((file, idx) => (
                      <div key={idx} className="p-4 rounded-lg bg-muted/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">📄</span>
                          <div>
                            <div className="font-medium text-sm">{file.name}</div>
                            <div className="text-xs text-muted-foreground">{file.size} • {file.date}</div>
                          </div>
                        </div>
                        <button className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium transition-colors">
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </LiquidGlassCard>
            </div>
          </ScrollReveal>
        )}

        {/* Log Detail Modal */}
        {selectedLog && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedLog(null)}
          >
            <div
              className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-2xl w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Activity Details</h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Action</div>
                    <div className="font-medium">{selectedLog.action}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Severity</div>
                    <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(selectedLog.severity)}`}>
                      {selectedLog.severity}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">User</div>
                    <div className="font-medium">{selectedLog.userName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Time</div>
                    <div className="font-medium">{selectedLog.timestamp.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">IP Address</div>
                    <div className="font-medium font-mono text-sm">{selectedLog.ipAddress}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Location</div>
                    <div className="font-medium">{selectedLog.location}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-1">Description</div>
                  <div className="p-3 rounded-lg bg-muted/30">{selectedLog.description}</div>
                </div>

                {selectedLog.changes && selectedLog.changes.length > 0 && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Changes</div>
                    <div className="space-y-2">
                      {selectedLog.changes.map((change, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-muted/30">
                          <div className="font-medium text-sm mb-1 capitalize">{change.field}</div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Old Value</div>
                              <div className="p-2 rounded bg-red-100 dark:bg-red-900/20 font-mono text-xs">
                                {String(change.oldValue || 'null')}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">New Value</div>
                              <div className="p-2 rounded bg-green-100 dark:bg-green-900/20 font-mono text-xs">
                                {String(change.newValue)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-sm text-muted-foreground mb-1">User Agent</div>
                  <div className="p-2 rounded-lg bg-muted/30 font-mono text-xs break-all">
                    {selectedLog.userAgent}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
