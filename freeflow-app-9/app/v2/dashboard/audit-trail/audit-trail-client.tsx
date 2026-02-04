'use client'
// Enhanced & Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'


export const dynamic = 'force-dynamic';

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

import { CardSkeleton, DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'

// AUTHENTICATION & LOGGING
import { useCurrentUser } from '@/hooks/use-ai-data'
import { createSimpleLogger } from '@/lib/simple-logger'
import { toast } from 'sonner'

const logger = createSimpleLogger('AuditTrailPage')

type ViewMode = 'overview' | 'logs' | 'compliance' | 'export'


// ============================================================================
// V2 COMPETITIVE MOCK DATA - AuditTrail Context
// ============================================================================

const auditTrailAIInsights = [
  { id: '1', type: 'info' as const, title: 'Performance Update', description: 'System running optimally with 99.9% uptime this month.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'success' as const, title: 'Goal Achievement', description: 'Monthly targets exceeded by 15%. Great progress!', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Goals' },
  { id: '3', type: 'warning' as const, title: 'Action Required', description: 'Review pending items to maintain workflow efficiency.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Tasks' },
]

const auditTrailCollaborators = [
  { id: '1', name: 'Alexandra Chen', avatar: '/avatars/alex.jpg', status: 'online' as const, role: 'Manager', lastActive: 'Now' },
  { id: '2', name: 'Marcus Johnson', avatar: '/avatars/marcus.jpg', status: 'online' as const, role: 'Developer', lastActive: '5m ago' },
  { id: '3', name: 'Sarah Williams', avatar: '/avatars/sarah.jpg', status: 'away' as const, role: 'Designer', lastActive: '30m ago' },
]

const auditTrailPredictions = [
  { id: '1', label: 'Completion Rate', current: 85, target: 95, predicted: 92, confidence: 88, trend: 'up' as const },
  { id: '2', label: 'Efficiency Score', current: 78, target: 90, predicted: 86, confidence: 82, trend: 'up' as const },
]

const auditTrailActivities = [
  { id: '1', user: 'Alexandra Chen', action: 'updated', target: 'system settings', timestamp: '5m ago', type: 'info' as const },
  { id: '2', user: 'Marcus Johnson', action: 'completed', target: 'task review', timestamp: '15m ago', type: 'success' as const },
  { id: '3', user: 'System', action: 'generated', target: 'weekly report', timestamp: '1h ago', type: 'info' as const },
]

export default function AuditTrailClient() {
  // AUTHENTICATION
  const { userId, loading: userLoading } = useCurrentUser()

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
    userFilter: string
    dateRange: string
  }>({
    activityTypes: [],
    entityTypes: [],
    severityLevels: [],
    searchQuery: '',
    userFilter: '',
    dateRange: ''
  })

  // DIALOG STATES FOR QUICK ACTIONS
  const [showNewEntryDialog, setShowNewEntryDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)

  // NEW ENTRY FORM STATE
  const [newEntryForm, setNewEntryForm] = useState({
    action: '',
    description: '',
    severity: 'low' as SeverityLevel,
    activityType: 'create' as ActivityType,
    entityType: 'file' as EntityType
  })
  const [isCreatingEntry, setIsCreatingEntry] = useState(false)

  // EXPORT DIALOG STATE
  const [exportOptions, setExportOptions] = useState({
    format: 'csv' as 'csv' | 'json' | 'pdf',
    dateRange: 'all' as 'all' | 'today' | 'week' | 'month' | 'custom',
    includeUserInfo: true,
    includeIpAddresses: true,
    includeChangeDetails: true,
    includeMetadata: false,
    startDate: '',
    endDate: ''
  })
  const [isExporting, setIsExporting] = useState(false)

  // SETTINGS DIALOG STATE
  const [auditSettings, setAuditSettings] = useState({
    retentionPeriod: '90',
    enableRealTimeAlerts: true,
    alertSeverityThreshold: 'high' as SeverityLevel,
    enableEmailNotifications: false,
    notificationEmail: '',
    enableSlackNotifications: false,
    slackWebhookUrl: '',
    autoArchiveOldLogs: true
  })
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  // QUICK ACTIONS WITH REAL DIALOG HANDLERS
  const auditTrailQuickActions = [
    { id: '1', label: 'New Item', icon: 'Plus', shortcut: 'N', action: () => setShowNewEntryDialog(true) },
    { id: '2', label: 'Export', icon: 'Download', shortcut: 'E', action: () => setShowExportDialog(true) },
    { id: '3', label: 'Settings', icon: 'Settings', shortcut: 'S', action: () => setShowSettingsDialog(true) },
  ]

  // HANDLER: Create new audit entry
  const handleCreateEntry = async () => {
    if (!userId) {
      toast.error('Please log in to create an audit entry')
      return
    }

    if (!newEntryForm.action.trim()) {
      toast.error('Please enter an action name')
      return
    }

    setIsCreatingEntry(true)
    try {      const { createAuditLog } = await import('@/lib/audit-trail-queries')

      await createAuditLog({
        userId,
        userName: 'Current User',
        action: newEntryForm.action,
        description: newEntryForm.description || `Manual audit entry: ${newEntryForm.action}`,
        activityType: newEntryForm.activityType,
        entityType: newEntryForm.entityType,
        entityId: `manual-${Date.now()}`,
        severity: newEntryForm.severity,
        ipAddress: '127.0.0.1',
        userAgent: navigator.userAgent,
        location: 'Manual Entry',
        metadata: { source: 'manual', createdVia: 'audit-trail-ui' }
      })

      toast.success('Audit entry created successfully')
      setShowNewEntryDialog(false)
      setNewEntryForm({
        action: '',
        description: '',
        severity: 'low',
        activityType: 'create',
        entityType: 'file'
      })

      // Refresh the logs
      window.location.reload()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create audit entry'
      logger.error('Failed to create audit entry', { error: err, userId })
      toast.error(errorMessage)
    } finally {
      setIsCreatingEntry(false)
    }
  }

  // HANDLER: Export with options
  const handleExportWithOptions = async () => {
    if (!userId) {
      toast.error('Please log in to export logs')
      return
    }

    setIsExporting(true)
    try {      const { exportAuditLogs } = await import('@/lib/audit-trail-queries')

      const exportData = await exportAuditLogs(
        userId,
        filters.activityTypes.length || filters.entityTypes.length || filters.severityLevels.length ? {
          activityTypes: filters.activityTypes.length > 0 ? filters.activityTypes : undefined,
          entityTypes: filters.entityTypes.length > 0 ? filters.entityTypes : undefined,
          severityLevels: filters.severityLevels.length > 0 ? filters.severityLevels : undefined,
          searchQuery: filters.searchQuery || undefined
        } : undefined,
        exportOptions.format
      )

      // Create and download file
      const mimeTypes = {
        csv: 'text/csv',
        json: 'application/json',
        pdf: 'application/pdf'
      }

      const blob = new Blob([exportData], { type: mimeTypes[exportOptions.format] })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${exportOptions.format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success(`Audit logs exported as ${exportOptions.format.toUpperCase()}`)
      setShowExportDialog(false)
      announce('Audit logs exported successfully', 'polite')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export logs'
      logger.error('Failed to export logs', { error: err, userId })
      toast.error(errorMessage)
    } finally {
      setIsExporting(false)
    }
  }

  // HANDLER: Save audit settings
  const handleSaveSettings = async () => {
    setIsSavingSettings(true)
    try {      // Save settings via API
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', section: 'audit-trail', settings: auditSettings })
      })
      if (!res.ok) throw new Error('Failed to save settings')

      // Also save to localStorage for quick access
      localStorage.setItem('auditTrailSettings', JSON.stringify(auditSettings))

      toast.success('Audit trail settings saved successfully')
      setShowSettingsDialog(false)
      announce('Settings saved', 'polite')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save settings'
      logger.error('Failed to save settings', { error: err })
      toast.error(errorMessage)
    } finally {
      setIsSavingSettings(false)
    }
  }

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
        setError(null)        // Load all audit trail data in parallel
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

    try {      const { exportAuditLogs } = await import('@/lib/audit-trail-queries')

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
      announce('Audit logs exported successfully', 'polite')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export logs'
      logger.error('Failed to export logs', { error: err, userId })
      toast.error(errorMessage)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-red-50 to-orange-50 dark:bg-none dark:bg-gray-900">
        <div className="max-w-[1800px] mx-auto space-y-8">
          
        {/* V2 Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <AIInsightsPanel insights={auditTrailAIInsights} />
          <PredictiveAnalytics predictions={auditTrailPredictions} />
          <CollaborationIndicator collaborators={auditTrailCollaborators} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <QuickActionsToolbar actions={auditTrailQuickActions} />
          <ActivityFeed activities={auditTrailActivities} />
        </div>
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

  if (error) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-red-50 to-orange-50 dark:bg-none dark:bg-gray-900">
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
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-red-50 to-orange-50 dark:bg-none dark:bg-gray-900">
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
            <button
              onClick={() => setShowExportDialog(true)}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg text-sm font-medium hover:from-red-600 hover:to-orange-600 transition-colors"
            >
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
                      onClick={() => setFilters({ activityTypes: [], entityTypes: [], severityLevels: [], searchQuery: '', userFilter: '', dateRange: '' })}
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
                    <select
                      value={filters.userFilter}
                      onChange={(e) => {
                        setFilters({ ...filters, userFilter: e.target.value })
                        if (e.target.value) {
                          toast.info(`Filtering by user: ${e.target.value}`)
                        }
                      }}
                      className="px-4 py-2 rounded-lg bg-muted"
                    >
                      <option value="">All Users</option>
                      <option value="John Doe">John Doe</option>
                      <option value="Jane Smith">Jane Smith</option>
                      <option value="Admin User">Admin User</option>
                    </select>
                    <select
                      value={filters.dateRange}
                      onChange={(e) => {
                        setFilters({ ...filters, dateRange: e.target.value })
                        if (e.target.value) {
                          toast.info(`Filtering by: ${e.target.value}`)
                        }
                      }}
                      className="px-4 py-2 rounded-lg bg-muted"
                    >
                      <option value="">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
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
                      <select
                        value={exportOptions.format}
                        onChange={(e) => setExportOptions({ ...exportOptions, format: e.target.value as 'csv' | 'json' | 'pdf' })}
                        className="w-full px-4 py-2 rounded-lg bg-muted"
                      >
                        <option value="csv">CSV</option>
                        <option value="json">JSON</option>
                        <option value="pdf">PDF</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Date Range</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
                        <input
                          type="date"
                          value={exportOptions.startDate}
                          onChange={(e) => {
                            setExportOptions({ ...exportOptions, startDate: e.target.value })
                            if (e.target.value) {
                              toast.info(`Start date: ${e.target.value}`)
                            }
                          }}
                          className="px-4 py-2 rounded-lg bg-muted"
                        />
                        <input
                          type="date"
                          value={exportOptions.endDate}
                          onChange={(e) => {
                            setExportOptions({ ...exportOptions, endDate: e.target.value })
                            if (e.target.value) {
                              toast.info(`End date: ${e.target.value}`)
                            }
                          }}
                          className="px-4 py-2 rounded-lg bg-muted"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Include</label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={exportOptions.includeUserInfo}
                            onChange={(e) => setExportOptions({ ...exportOptions, includeUserInfo: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
                          />
                          <span className="text-sm">User Information</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={exportOptions.includeIpAddresses}
                            onChange={(e) => setExportOptions({ ...exportOptions, includeIpAddresses: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
                          />
                          <span className="text-sm">IP Addresses</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={exportOptions.includeChangeDetails}
                            onChange={(e) => setExportOptions({ ...exportOptions, includeChangeDetails: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
                          />
                          <span className="text-sm">Change Details</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={exportOptions.includeMetadata}
                            onChange={(e) => setExportOptions({ ...exportOptions, includeMetadata: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
                          />
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
                        <button
                          onClick={() => {
                            toast.promise(
                              fetch(`/api/audit-trail/files/${file.name}/download`).then(res => {
                                if (!res.ok) throw new Error('Failed')
                                return res.blob()
                              }).then(blob => {
                                const url = URL.createObjectURL(blob)
                                const a = document.createElement('a')
                                a.href = url
                                a.download = file.name
                                a.click()
                                URL.revokeObjectURL(url)
                              }),
                              { loading: `Downloading ${file.name}...`, success: `${file.name} downloaded successfully`, error: 'Failed to download file' }
                            )
                          }}
                          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium transition-colors"
                        >
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 text-sm">
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

        {/* NEW ENTRY DIALOG */}
        {showNewEntryDialog && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNewEntryDialog(false)}
          >
            <div
              className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-lg w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Create New Audit Entry</h3>
                <button
                  onClick={() => setShowNewEntryDialog(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Action Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Manual system check, Security review..."
                    value={newEntryForm.action}
                    onChange={(e) => setNewEntryForm({ ...newEntryForm, action: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-muted border border-transparent focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    placeholder="Describe the audit entry..."
                    value={newEntryForm.description}
                    onChange={(e) => setNewEntryForm({ ...newEntryForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg bg-muted border border-transparent focus:border-red-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Severity</label>
                    <select
                      value={newEntryForm.severity}
                      onChange={(e) => setNewEntryForm({ ...newEntryForm, severity: e.target.value as SeverityLevel })}
                      className="w-full px-4 py-2 rounded-lg bg-muted"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Activity Type</label>
                    <select
                      value={newEntryForm.activityType}
                      onChange={(e) => setNewEntryForm({ ...newEntryForm, activityType: e.target.value as ActivityType })}
                      className="w-full px-4 py-2 rounded-lg bg-muted"
                    >
                      <option value="create">Create</option>
                      <option value="update">Update</option>
                      <option value="delete">Delete</option>
                      <option value="login">Login</option>
                      <option value="logout">Logout</option>
                      <option value="permission-change">Permission Change</option>
                      <option value="data-access">Data Access</option>
                      <option value="system">System</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Entity Type</label>
                  <select
                    value={newEntryForm.entityType}
                    onChange={(e) => setNewEntryForm({ ...newEntryForm, entityType: e.target.value as EntityType })}
                    className="w-full px-4 py-2 rounded-lg bg-muted"
                  >
                    <option value="file">File</option>
                    <option value="user">User</option>
                    <option value="project">Project</option>
                    <option value="document">Document</option>
                    <option value="system">System</option>
                    <option value="permission">Permission</option>
                    <option value="setting">Setting</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowNewEntryDialog(false)}
                    className="flex-1 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateEntry}
                    disabled={isCreatingEntry || !newEntryForm.action.trim()}
                    className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingEntry ? 'Creating...' : 'Create Entry'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EXPORT DIALOG */}
        {showExportDialog && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowExportDialog(false)}
          >
            <div
              className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-lg w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Export Audit Logs</h3>
                <button
                  onClick={() => setShowExportDialog(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Export Format</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6">
                    {(['csv', 'json', 'pdf'] as const).map((format) => (
                      <button
                        key={format}
                        onClick={() => setExportOptions({ ...exportOptions, format })}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          exportOptions.format === format
                            ? 'bg-red-500 text-white'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        {format.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Date Range</label>
                  <select
                    value={exportOptions.dateRange}
                    onChange={(e) => setExportOptions({ ...exportOptions, dateRange: e.target.value as typeof exportOptions.dateRange })}
                    className="w-full px-4 py-2 rounded-lg bg-muted"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">Include in Export</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeUserInfo}
                        onChange={(e) => setExportOptions({ ...exportOptions, includeUserInfo: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
                      />
                      <span className="text-sm">User Information</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeIpAddresses}
                        onChange={(e) => setExportOptions({ ...exportOptions, includeIpAddresses: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
                      />
                      <span className="text-sm">IP Addresses</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeChangeDetails}
                        onChange={(e) => setExportOptions({ ...exportOptions, includeChangeDetails: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
                      />
                      <span className="text-sm">Change Details</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeMetadata}
                        onChange={(e) => setExportOptions({ ...exportOptions, includeMetadata: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
                      />
                      <span className="text-sm">Metadata</span>
                    </label>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Note:</strong> Export will include {auditLogs.length} log entries based on current filters.
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowExportDialog(false)}
                    className="flex-1 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExportWithOptions}
                    disabled={isExporting}
                    className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isExporting ? 'Exporting...' : `Export as ${exportOptions.format.toUpperCase()}`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS DIALOG */}
        {showSettingsDialog && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSettingsDialog(false)}
          >
            <div
              className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Audit Trail Settings</h3>
                <button
                  onClick={() => setShowSettingsDialog(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Retention Settings */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <span>📅</span>
                    <span>Retention Settings</span>
                  </h4>
                  <div>
                    <label className="block text-sm font-medium mb-2">Log Retention Period (days)</label>
                    <select
                      value={auditSettings.retentionPeriod}
                      onChange={(e) => setAuditSettings({ ...auditSettings, retentionPeriod: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-muted"
                    >
                      <option value="30">30 days</option>
                      <option value="60">60 days</option>
                      <option value="90">90 days</option>
                      <option value="180">180 days</option>
                      <option value="365">1 year</option>
                      <option value="730">2 years</option>
                      <option value="unlimited">Unlimited</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer mt-3">
                    <input
                      type="checkbox"
                      checked={auditSettings.autoArchiveOldLogs}
                      onChange={(e) => setAuditSettings({ ...auditSettings, autoArchiveOldLogs: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
                    />
                    <span className="text-sm">Auto-archive logs before deletion</span>
                  </label>
                </div>

                {/* Alert Settings */}
                <div className="border-t pt-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <span>🔔</span>
                    <span>Alert Settings</span>
                  </h4>
                  <label className="flex items-center gap-3 cursor-pointer mb-4">
                    <input
                      type="checkbox"
                      checked={auditSettings.enableRealTimeAlerts}
                      onChange={(e) => setAuditSettings({ ...auditSettings, enableRealTimeAlerts: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
                    />
                    <span className="text-sm">Enable real-time alerts</span>
                  </label>
                  {auditSettings.enableRealTimeAlerts && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Alert Severity Threshold</label>
                      <select
                        value={auditSettings.alertSeverityThreshold}
                        onChange={(e) => setAuditSettings({ ...auditSettings, alertSeverityThreshold: e.target.value as SeverityLevel })}
                        className="w-full px-4 py-2 rounded-lg bg-muted"
                      >
                        <option value="low">Low and above</option>
                        <option value="medium">Medium and above</option>
                        <option value="high">High and above</option>
                        <option value="critical">Critical only</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Notification Settings */}
                <div className="border-t pt-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <span>📧</span>
                    <span>Notification Settings</span>
                  </h4>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={auditSettings.enableEmailNotifications}
                        onChange={(e) => setAuditSettings({ ...auditSettings, enableEmailNotifications: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
                      />
                      <span className="text-sm">Enable email notifications</span>
                    </label>
                    {auditSettings.enableEmailNotifications && (
                      <input
                        type="email"
                        placeholder="notification@example.com"
                        value={auditSettings.notificationEmail}
                        onChange={(e) => setAuditSettings({ ...auditSettings, notificationEmail: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg bg-muted border border-transparent focus:border-red-500 focus:outline-none"
                      />
                    )}

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={auditSettings.enableSlackNotifications}
                        onChange={(e) => setAuditSettings({ ...auditSettings, enableSlackNotifications: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
                      />
                      <span className="text-sm">Enable Slack notifications</span>
                    </label>
                    {auditSettings.enableSlackNotifications && (
                      <input
                        type="url"
                        placeholder="https://hooks.slack.com/services/..."
                        value={auditSettings.slackWebhookUrl}
                        onChange={(e) => setAuditSettings({ ...auditSettings, slackWebhookUrl: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg bg-muted border border-transparent focus:border-red-500 focus:outline-none"
                      />
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => setShowSettingsDialog(false)}
                    className="flex-1 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSettings}
                    disabled={isSavingSettings}
                    className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSavingSettings ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
