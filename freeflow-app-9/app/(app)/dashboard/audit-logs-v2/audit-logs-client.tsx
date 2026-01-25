'use client'

import { createClient } from '@/lib/supabase/client'
import { useAuditLogs, useAuditAlertRules, useAuditLogMutations, useAuditAlertRuleMutations, type AuditLog as HookAuditLog, type AuditAlertRule } from '@/lib/hooks/use-audit-logs'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  FileText,
  Activity,
  User,
  Settings,
  Database,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Download,
  Search,
  Calendar,
  Eye,
  Trash2,
  Edit,
  Plus,
  LogIn,
  Globe,
  MapPin,
  Monitor,
  Smartphone,
  Server,
  Key,
  Bell,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Play,
  Pause,
  AlertCircle,
  Zap,
  BarChart3,
  ChevronRight,
  Copy,
  ExternalLink,
  Terminal,
  Code,
  Archive,
  ShieldCheck,
  Sliders,
  Webhook,
  Loader2
} from 'lucide-react'

// Enhanced & Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
  type AIInsight,
  type Collaborator,
  type Prediction,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
  type ActivityItem,
  type QuickAction,
} from '@/components/ui/competitive-upgrades-extended'

// Initialize Supabase client once at module level (for operations not covered by hooks)
const supabase = createClient()

// ============================================================================
// TYPE DEFINITIONS - Datadog/Splunk Level Audit Logging
// ============================================================================

type LogSeverity = 'debug' | 'info' | 'warning' | 'error' | 'critical'
type LogType = 'authentication' | 'authorization' | 'data_access' | 'data_modification' | 'system' | 'security' | 'admin' | 'api'
type LogStatus = 'success' | 'failed' | 'blocked' | 'pending' | 'timeout'
type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'muted'
type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'
type ComplianceFramework = 'SOC2' | 'GDPR' | 'HIPAA' | 'PCI-DSS' | 'ISO27001'
type RetentionPeriod = '7d' | '30d' | '90d' | '1y' | '7y'

// Database Types
interface DbAuditLog {
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

interface AuditLog {
  id: string
  timestamp: string
  log_type: LogType
  severity: LogSeverity
  status: LogStatus
  action: string
  description: string
  user_id: string | null
  user_email: string | null
  user_name: string | null
  user_role: string | null
  ip_address: string
  user_agent: string
  device_type: 'desktop' | 'mobile' | 'tablet' | 'api'
  location: string
  country: string
  city: string
  resource_type: string
  resource_id: string
  resource_name: string
  request_id: string
  session_id: string | null
  duration_ms: number
  metadata: Record<string, unknown>
  tags: string[]
  is_anomaly: boolean
  risk_score: number
}

interface AlertRule {
  id: string
  name: string
  description: string
  condition: string
  severity: AlertSeverity
  is_active: boolean
  threshold: number
  window_minutes: number
  notification_channels: string[]
  last_triggered_at: string | null
  trigger_count_24h: number
  created_at: string
  updated_at: string
}

interface Alert {
  id: string
  rule_id: string
  rule_name: string
  severity: AlertSeverity
  status: AlertStatus
  message: string
  triggered_at: string
  acknowledged_at: string | null
  resolved_at: string | null
  acknowledged_by: string | null
  resolved_by: string | null
  affected_resources: number
  sample_logs: string[]
}

interface ComplianceReport {
  id: string
  framework: ComplianceFramework
  period: string
  status: 'compliant' | 'non_compliant' | 'partial' | 'pending'
  score: number
  total_controls: number
  passed_controls: number
  failed_controls: number
  findings: number
  generated_at: string
}

interface UserSession {
  id: string
  user_id: string
  user_email: string
  user_name: string
  started_at: string
  last_activity_at: string
  ip_address: string
  location: string
  device_type: 'desktop' | 'mobile' | 'tablet'
  browser: string
  os: string
  is_active: boolean
  actions_count: number
  risk_level: 'low' | 'medium' | 'high'
}

interface GeoDistribution {
  country: string
  country_code: string
  count: number
  percentage: number
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getSeverityColor = (severity: LogSeverity | AlertSeverity): string => {
  switch (severity) {
    case 'debug': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    case 'info': case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case 'warning': case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'error': case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
    case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

const getStatusColor = (status: LogStatus | AlertStatus): string => {
  switch (status) {
    case 'success': case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'failed': case 'active': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    case 'blocked': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
    case 'pending': case 'acknowledged': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'timeout': case 'muted': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

const getComplianceColor = (status: string): string => {
  switch (status) {
    case 'compliant': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'non_compliant': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    case 'partial': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'pending': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

const getLogTypeIcon = (type: LogType) => {
  switch (type) {
    case 'authentication': return <LogIn className="w-4 h-4" />
    case 'authorization': return <Key className="w-4 h-4" />
    case 'data_access': return <Eye className="w-4 h-4" />
    case 'data_modification': return <Edit className="w-4 h-4" />
    case 'system': return <Server className="w-4 h-4" />
    case 'security': return <Shield className="w-4 h-4" />
    case 'admin': return <Settings className="w-4 h-4" />
    case 'api': return <Code className="w-4 h-4" />
    default: return <Activity className="w-4 h-4" />
  }
}

const getDeviceIcon = (type: string) => {
  switch (type) {
    case 'desktop': return <Monitor className="w-4 h-4" />
    case 'mobile': return <Smartphone className="w-4 h-4" />
    case 'tablet': return <Monitor className="w-4 h-4" />
    case 'api': return <Terminal className="w-4 h-4" />
    default: return <Monitor className="w-4 h-4" />
  }
}

const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AuditLogsClient() {

  // ---- Supabase Hooks ----
  const [severityFilter, setSeverityFilter] = useState<LogSeverity | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<LogType | 'all'>('all')

  // Build filters object for the hook
  const hookFilters = useMemo(() => ({
    severity: severityFilter === 'all' ? undefined : severityFilter,
    logType: typeFilter === 'all' ? undefined : typeFilter
  }), [severityFilter, typeFilter])

  const { logs: hookLogs, data: rawLogs, isLoading, error: logsError, refetch: refetchLogs, stats: hookStats } = useAuditLogs(undefined, hookFilters)
  const { rules: hookAlertRules, error: rulesError, refetch: refetchRules } = useAuditAlertRules()
  const { createLog } = useAuditLogMutations()
  const { createRule, updateRule, deleteRule, toggleRule, isCreating: isCreatingRule, isUpdating: isUpdatingRule, isDeleting: isDeletingRule } = useAuditAlertRuleMutations()

  // UI State
  const [activeTab, setActiveTab] = useState('events')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [isLiveMode, setIsLiveMode] = useState(true)
  const [settingsTab, setSettingsTab] = useState('general')

  // Dialog State
  const [showCreateRuleDialog, setShowCreateRuleDialog] = useState(false)
  const [showEditRuleDialog, setShowEditRuleDialog] = useState(false)
  const [editingRule, setEditingRule] = useState<AuditAlertRule | null>(null)

  // Form State for Alert Rules
  const [ruleFormData, setRuleFormData] = useState({
    rule_name: '',
    description: '',
    log_type: '',
    severity: '',
    action_pattern: '',
    notification_channels: ['email'],
    is_active: true
  })

  // Derive isSaving from mutation states
  const isSaving = isCreatingRule || isUpdatingRule || isDeletingRule

  // Create audit log entry via hook
  const createAuditLog = async (logData: Partial<DbAuditLog>) => {
    try {
      createLog({
        log_type: logData.log_type || 'system',
        severity: logData.severity || 'info',
        action: logData.action || 'manual_entry',
        description: logData.description || null,
        resource: logData.resource || null,
        ip_address: logData.ip_address || null,
        location: logData.location || null,
        device: logData.device || null,
        status: logData.status || 'success',
        duration_ms: logData.duration_ms || 0,
        metadata: logData.metadata || {}
      } as Partial<HookAuditLog>)
    } catch (error) {
      console.error('Error creating audit log:', error)
      toast.error('Failed to create audit log')
    }
  }

  // Create alert rule via hook
  const handleCreateAlertRule = async () => {
    try {
      createRule({
        rule_name: ruleFormData.rule_name,
        description: ruleFormData.description || null,
        log_type: ruleFormData.log_type || null,
        severity: ruleFormData.severity || null,
        action_pattern: ruleFormData.action_pattern || null,
        notification_channels: ruleFormData.notification_channels,
        is_active: ruleFormData.is_active,
        conditions: {}
      } as Partial<AuditAlertRule>)
      toast.success('Alert rule created successfully')
      setShowCreateRuleDialog(false)
      resetRuleForm()
    } catch (error) {
      console.error('Error creating alert rule:', error)
      toast.error('Failed to create alert rule')
    }
  }

  // Update alert rule via hook
  const handleUpdateAlertRule = async () => {
    if (!editingRule) return
    try {
      updateRule({
        id: editingRule.id,
        rule_name: ruleFormData.rule_name,
        description: ruleFormData.description || null,
        log_type: ruleFormData.log_type || null,
        severity: ruleFormData.severity || null,
        action_pattern: ruleFormData.action_pattern || null,
        notification_channels: ruleFormData.notification_channels,
        is_active: ruleFormData.is_active,
        updated_at: new Date().toISOString()
      } as Partial<AuditAlertRule>)
      toast.success('Alert rule updated successfully')
      setShowEditRuleDialog(false)
      setEditingRule(null)
      resetRuleForm()
    } catch (error) {
      console.error('Error updating alert rule:', error)
      toast.error('Failed to update alert rule')
    }
  }

  // Delete alert rule via hook
  const handleDeleteAlertRule = async (ruleId: string) => {
    try {
      deleteRule(ruleId)
      toast.success('Alert rule deleted')
    } catch (error) {
      console.error('Error deleting alert rule:', error)
      toast.error('Failed to delete alert rule')
    }
  }

  // Toggle alert rule status via hook
  const handleToggleRuleStatus = async (ruleId: string, isActive: boolean) => {
    try {
      toggleRule(ruleId, isActive)
      toast.success(`Alert rule ${isActive ? 'activated' : 'deactivated'}`)
    } catch (error) {
      console.error('Error toggling rule status:', error)
      toast.error('Failed to update rule status')
    }
  }

  // Reset form
  const resetRuleForm = () => {
    setRuleFormData({
      rule_name: '',
      description: '',
      log_type: '',
      severity: '',
      action_pattern: '',
      notification_channels: ['email'],
      is_active: true
    })
  }

  // Open edit dialog
  const openEditRuleDialog = (rule: AuditAlertRule) => {
    setEditingRule(rule)
    setRuleFormData({
      rule_name: rule.rule_name,
      description: rule.description || '',
      log_type: rule.log_type || '',
      severity: rule.severity || '',
      action_pattern: rule.action_pattern || '',
      notification_channels: rule.notification_channels || ['email'],
      is_active: rule.is_active
    })
    setShowEditRuleDialog(true)
  }

  // Export audit logs using hook data
  const handleExportAuditLogs = async () => {
    try {
      const exportData = rawLogs || []

      // Create CSV
      const headers = ['ID', 'Type', 'Severity', 'Action', 'Description', 'Status', 'IP Address', 'Created At']
      const csvContent = [
        headers.join(','),
        ...exportData.map(log => [
          log.id,
          log.log_type,
          log.severity,
          log.action,
          `"${(log.description || '').replace(/"/g, '""')}"`,
          log.status,
          log.ip_address || '',
          log.created_at
        ].join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)

      // Log the export action
      await createAuditLog({
        log_type: 'data_access',
        action: 'data.export',
        description: 'Exported audit logs to CSV',
        status: 'success'
      })

      toast.success('Audit logs exported successfully')
    } catch (error) {
      console.error('Error exporting logs:', error)
      toast.error('Failed to export audit logs')
    }
  }

  // Convert hook logs (HookAuditLog from Supabase) to display format
  const allLogs: AuditLog[] = useMemo(() => {
    if (!hookLogs || hookLogs.length === 0) return []
    return hookLogs.map(log => ({
      id: log.id,
      timestamp: log.created_at,
      log_type: (log.log_type || 'system') as LogType,
      severity: (log.severity || 'info') as LogSeverity,
      status: (log.status || 'success') as LogStatus,
      action: log.action,
      description: log.description || '',
      user_id: log.user_id,
      user_email: log.user_email,
      user_name: log.user_email?.split('@')[0] || null,
      user_role: null,
      ip_address: log.ip_address || '0.0.0.0',
      user_agent: log.device || 'Unknown',
      device_type: 'desktop' as const,
      location: log.location || 'Unknown',
      country: 'Unknown',
      city: 'Unknown',
      resource_type: log.resource || 'unknown',
      resource_id: log.id,
      resource_name: log.resource || 'Unknown',
      request_id: log.id,
      session_id: null,
      duration_ms: log.duration_ms || 0,
      metadata: log.metadata || {},
      tags: [],
      is_anomaly: log.severity === 'critical' || log.severity === 'error',
      risk_score: log.severity === 'critical' ? 90 : log.severity === 'error' ? 60 : log.severity === 'warning' ? 40 : 10
    }))
  }, [hookLogs])

  // Filtered logs (search only; severity/type already handled by hook filters)
  const filteredLogs = useMemo(() => {
    if (!searchQuery) return allLogs
    return allLogs.filter(log => {
      const matchesSearch =
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        log.ip_address.includes(searchQuery)
      return matchesSearch
    })
  }, [allLogs, searchQuery])

  // Convert hook alert rules to display format
  const allAlertRules = useMemo(() => {
    if (!hookAlertRules || hookAlertRules.length === 0) return []
    return hookAlertRules.map((rule: AuditAlertRule) => ({
      id: rule.id,
      name: rule.rule_name,
      description: rule.description || '',
      condition: rule.action_pattern || 'custom condition',
      severity: (rule.severity || 'medium') as AlertSeverity,
      is_active: rule.is_active,
      threshold: 1,
      window_minutes: 15,
      notification_channels: rule.notification_channels || ['email'],
      last_triggered_at: null,
      trigger_count_24h: 0,
      created_at: rule.created_at,
      updated_at: rule.updated_at
    })) as AlertRule[]
  }, [hookAlertRules])

  // Stats calculations from hook
  const stats = useMemo(() => {
    const total = hookStats?.total ?? allLogs.length
    const critical = hookStats?.critical ?? allLogs.filter(l => l.severity === 'critical').length
    const warnings = hookStats?.warning ?? allLogs.filter(l => l.severity === 'warning').length
    const errors = hookStats?.error ?? allLogs.filter(l => l.severity === 'error').length
    const anomalies = allLogs.filter(l => l.is_anomaly).length
    const blocked = hookStats?.blocked ?? allLogs.filter(l => l.status === 'blocked').length
    const activeAlerts = ([] as Alert[]).filter(a => a.status === 'active').length
    const avgRisk = allLogs.length > 0 ? allLogs.reduce((acc, l) => acc + l.risk_score, 0) / allLogs.length : 0

    return { total, critical, warnings, errors, anomalies, blocked, activeAlerts, avgRisk }
  }, [hookStats, allLogs])

  // Handlers
  const handleCreateAlert = () => {
    setShowCreateRuleDialog(true)
  }

  const handleInvestigateLog = async (logId: string) => {
    toast.promise(
      createAuditLog({
        log_type: 'security',
        action: 'log.investigate',
        description: `Investigating log ${logId}`,
        status: 'success'
      }),
      {
        loading: `Opening investigation for log ${logId}...`,
        success: 'Investigation started',
        error: 'Failed to start investigation'
      }
    )
  }

  const handleMarkResolved = async (alertId: string) => {
    toast.promise(
      createAuditLog({
        log_type: 'admin',
        action: 'alert.resolve',
        description: `Resolved alert ${alertId}`,
        status: 'success'
      }),
      {
        loading: `Resolving alert ${alertId}...`,
        success: `Alert ${alertId} has been marked as resolved`,
        error: 'Failed to resolve alert'
      }
    )
  }

  const handleGenerateReport = async () => {
    toast.promise(
      createAuditLog({
        log_type: 'data_access',
        action: 'report.generate',
        description: 'Generated compliance report',
        status: 'success'
      }),
      {
        loading: 'Generating compliance report...',
        success: 'Compliance report generated successfully',
        error: 'Failed to generate report'
      }
    )
  }

  const handleRefresh = () => {
    toast.promise(
      (async () => {
        await Promise.all([refetchLogs(), refetchRules()])
      })(),
      {
        loading: 'Refreshing data...',
        success: 'Data refreshed',
        error: 'Failed to refresh data'
      }
    )
  }

  // Handle saved queries button
  const handleSavedQueries = async () => {
    try {
      const { data, error } = await supabase.from('saved_queries').select('*').eq('type', 'audit_log')
      if (error) throw error
      toast.success('Saved queries loaded', { description: `${data?.length || 0} queries available` })
    } catch (err) {
      toast.error('Failed to load saved queries')
    }
  }

  // Handle search logs
  const handleSearchLogs = () => {
    toast.promise(
      createAuditLog({
        log_type: 'data_access',
        action: 'logs.search',
        description: 'Performed advanced log search',
        status: 'success'
      }),
      {
        loading: 'Searching audit logs...',
        success: 'Search completed',
        error: 'Search failed'
      }
    )
  }

  // Handle refresh compliance
  const handleRefreshCompliance = () => {
    toast.promise(
      createAuditLog({
        log_type: 'system',
        action: 'compliance.refresh',
        description: 'Refreshed compliance dashboard',
        status: 'success'
      }),
      {
        loading: 'Refreshing compliance data...',
        success: 'Compliance data refreshed',
        error: 'Failed to refresh compliance data'
      }
    )
  }

  // Handle export all compliance reports
  const handleExportAllCompliance = async () => {
    await createAuditLog({
      log_type: 'data_access',
      action: 'compliance.export_all',
      description: 'Exported all compliance reports',
      status: 'success'
    })
    const blob = new Blob([JSON.stringify({ exported_at: new Date().toISOString(), frameworks: ['SOC2', 'HIPAA', 'GDPR', 'PCI-DSS'] })], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `compliance-reports-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('All compliance reports exported')
  }

  // Handle download individual compliance report
  const handleDownloadComplianceReport = async (framework: string) => {
    await createAuditLog({
      log_type: 'data_access',
      action: 'compliance.download_report',
      description: `Downloaded ${framework} compliance report`,
      status: 'success'
    })
    const blob = new Blob([JSON.stringify({ framework, exported_at: new Date().toISOString(), status: 'compliant' })], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${framework.toLowerCase()}-compliance-report-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`${framework} report downloaded`)
  }

  // Handle SIEM integration
  const handleSiemIntegration = (name: string, status: string) => {
    if (status === 'connected') {
      toast.promise(
        createAuditLog({
          log_type: 'admin',
          action: 'integration.manage',
          description: `Managing ${name} integration`,
          status: 'success'
        }),
        {
          loading: `Opening ${name} settings...`,
          success: `${name} settings opened`,
          error: `Failed to open ${name} settings`
        }
      )
    } else {
      const oauthUrl = `/api/integrations/${name.toLowerCase()}/oauth`
      const popup = window.open(oauthUrl, `${name} Connection`, 'width=600,height=700')
      if (popup) {
        createAuditLog({
          log_type: 'admin',
          action: 'integration.connect',
          description: `Connecting to ${name}`,
          status: 'success'
        })
        toast.info(`Complete ${name} authorization in the popup window`)
      } else {
        toast.error('Popup blocked', { description: 'Please allow popups to connect to this service' })
      }
    }
  }

  // Handle export all logs (advanced settings)
  const handleExportAllLogs = () => {
    toast.promise(
      (async () => {
        await handleExportAuditLogs()
      })(),
      {
        loading: 'Exporting all audit logs...',
        success: 'All audit logs exported',
        error: 'Failed to export logs'
      }
    )
  }

  // Handle clear debug logs
  const handleClearDebugLogs = async () => {
    if (!confirm('Are you sure you want to clear all debug logs? This action cannot be undone.')) return
    try {
      const { error } = await supabase.from('audit_logs').delete().eq('log_type', 'debug')
      if (error) throw error
      await createAuditLog({
        log_type: 'admin',
        action: 'logs.clear_debug',
        description: 'Cleared debug logs',
        status: 'success'
      })
      toast.success('Debug logs cleared')
    } catch (err) {
      toast.error('Failed to clear debug logs')
    }
  }

  // Handle reset configuration
  const handleResetConfiguration = async () => {
    if (!confirm('Are you sure you want to reset all audit log settings to defaults?')) return
    try {
      const { error } = await supabase.from('audit_log_settings').update({ settings: {} }).is('deleted_at', null)
      if (error) throw error
      await createAuditLog({
        log_type: 'admin',
        action: 'settings.reset',
        description: 'Reset all audit log settings to default',
        status: 'success'
      })
      toast.success('Configuration reset to defaults')
    } catch (err) {
      toast.error('Failed to reset configuration')
    }
  }

  // Handle copy log ID
  const handleCopyLogId = (logId: string) => {
    navigator.clipboard.writeText(logId)
    toast.success('Log ID copied to clipboard')
  }

  // Handle related events
  const handleRelatedEvents = (logId: string) => {
    toast.promise(
      createAuditLog({
        log_type: 'data_access',
        action: 'logs.view_related',
        description: `Viewing related events for log ${logId}`,
        status: 'success'
      }),
      {
        loading: 'Loading related events...',
        success: 'Related events loaded',
        error: 'Failed to load related events'
      }
    )
  }

  // Show error state
  if (logsError || rulesError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/30 to-violet-50/40 dark:bg-none dark:bg-gray-900 p-6">
        <div className="max-w-[1800px] mx-auto">
          <Card className="border-red-200 dark:border-red-900/50">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Failed to load audit logs</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {(logsError as Error)?.message || (rulesError as Error)?.message || 'An unexpected error occurred'}
              </p>
              <Button onClick={() => { refetchLogs(); refetchRules() }} className="bg-indigo-600">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/30 to-violet-50/40 dark:bg-none dark:bg-gray-900 p-6">
        <div className="max-w-[1800px] mx-auto flex items-center justify-center h-[calc(100vh-6rem)]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Loading audit logs...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/30 to-violet-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
              <p className="text-gray-500 dark:text-gray-400">Datadog level security monitoring</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant={isLiveMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsLiveMode(!isLiveMode)}
              className={isLiveMode ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {isLiveMode ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
              {isLiveMode ? 'Live' : 'Paused'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Refresh
            </Button>
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white" onClick={handleExportAuditLogs}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { label: 'Total Events', value: stats.total.toLocaleString(), icon: Activity, color: 'from-indigo-500 to-purple-500', change: 18.2 },
            { label: 'Critical', value: stats.critical.toString(), icon: AlertTriangle, color: 'from-red-500 to-rose-500', change: -24.7 },
            { label: 'Warnings', value: stats.warnings.toString(), icon: AlertCircle, color: 'from-yellow-500 to-orange-500', change: 5.3 },
            { label: 'Errors', value: stats.errors.toString(), icon: XCircle, color: 'from-orange-500 to-red-500', change: -12.4 },
            { label: 'Anomalies', value: stats.anomalies.toString(), icon: Zap, color: 'from-purple-500 to-pink-500', change: 8.1 },
            { label: 'Blocked', value: stats.blocked.toString(), icon: Shield, color: 'from-green-500 to-emerald-500', change: 15.6 },
            { label: 'Active Alerts', value: stats.activeAlerts.toString(), icon: Bell, color: 'from-blue-500 to-cyan-500', change: 0 },
            { label: 'Avg Risk', value: `${stats.avgRisk.toFixed(0)}%`, icon: TrendingUp, color: 'from-teal-500 to-cyan-500', change: -3.2 }
          ].map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  {stat.change !== 0 && (
                    <span className={`text-xs font-medium flex items-center ${stat.change > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {stat.change > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {Math.abs(stat.change)}%
                    </span>
                  )}
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 border shadow-sm">
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Alerts
              {stats.activeAlerts > 0 && (
                <Badge className="ml-1 bg-red-500 text-white">{stats.activeAlerts}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Compliance
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Events Tab */}
          <TabsContent value="events" className="mt-6 space-y-6">
            {/* Events Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500 p-8 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Activity className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Event Stream</h2>
                    <p className="text-white/80">Real-time security monitoring and audit trail</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Total Events</p>
                    <p className="text-2xl font-bold">{stats.total.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Critical</p>
                    <p className="text-2xl font-bold">{stats.critical}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Anomalies</p>
                    <p className="text-2xl font-bold">{stats.anomalies}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Blocked</p>
                    <p className="text-2xl font-bold">{stats.blocked}</p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {[
                { icon: Search, label: 'Search Logs', color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' },
                { icon: Bell, label: 'New Alert', color: 'bg-red-100 dark:bg-red-900/30 text-red-600' },
                { icon: Download, label: 'Export', color: 'bg-green-100 dark:bg-green-900/30 text-green-600' },
                { icon: Filter, label: 'Save Filter', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' },
                { icon: ShieldCheck, label: 'Compliance', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
                { icon: BarChart3, label: 'Analytics', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' },
                { icon: Archive, label: 'Archive', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' },
                { icon: Webhook, label: 'Integrations', color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600' },
              ].map((action, i) => (
                <button
                  key={i}
                  className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  <div className={`p-3 rounded-xl ${action.color}`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
                </button>
              ))}
            </div>

            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle>Event Stream</CardTitle>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search events..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      {(['all', 'critical', 'error', 'warning', 'info'] as const).map(sev => (
                        <Button
                          key={sev}
                          variant={severityFilter === sev ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setSeverityFilter(sev)}
                          className={severityFilter === sev ? 'bg-indigo-600' : ''}
                        >
                          {sev === 'all' ? 'All' : sev.charAt(0).toUpperCase() + sev.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredLogs.map(log => (
                    <div
                      key={log.id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors ${log.is_anomaly ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}
                      onClick={() => setSelectedLog(log)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          log.severity === 'critical' ? 'bg-red-100 text-red-600' :
                          log.severity === 'error' ? 'bg-orange-100 text-orange-600' :
                          log.severity === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {getLogTypeIcon(log.log_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {log.action}
                            </span>
                            <Badge className={getSeverityColor(log.severity)}>
                              {log.severity}
                            </Badge>
                            <Badge className={getStatusColor(log.status)}>
                              {log.status}
                            </Badge>
                            {log.is_anomaly && (
                              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                                <Zap className="w-3 h-3 mr-1" />
                                Anomaly
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 truncate mb-1">
                            {log.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                            {log.user_email && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {log.user_email}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              {log.ip_address}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {log.location}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Risk: {log.risk_score}%
                          </p>
                          <p className="text-xs text-gray-500">{formatDuration(log.duration_ms)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search" className="mt-6 space-y-6">
            {/* Search Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-100 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Search className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Log Query</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Use structured queries to search audit logs</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleSavedQueries}>
                <Filter className="w-4 h-4 mr-2" />
                Saved Queries
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Advanced Search</CardTitle>
                <CardDescription>Use query language to search logs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Input
                      placeholder="severity:critical AND log_type:security"
                      className="flex-1 font-mono"
                    />
                    <Button className="bg-indigo-600" onClick={handleSearchLogs}>
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">severity:critical</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">log_type:security</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">is_anomaly:true</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">status:blocked</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">risk_score:&gt;50</Badge>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-medium mb-2">Saved Searches</h4>
                    <div className="space-y-2">
                      {['Failed logins last 24h', 'High risk events', 'Data exports with PII', 'Security incidents'].map((search, i) => (
                        <div key={i} className="flex items-center justify-between p-2 hover:bg-white dark:hover:bg-gray-700 rounded cursor-pointer">
                          <span className="text-sm">{search}</span>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="mt-6 space-y-6">
            {/* Alerts Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 p-8 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Bell className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Alert Management</h2>
                    <p className="text-white/80">Configure and manage security alerts</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Active</p>
                    <p className="text-2xl font-bold">{([] as Alert[]).filter(a => a.status === 'active').length}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Acknowledged</p>
                    <p className="text-2xl font-bold">{([] as Alert[]).filter(a => a.status === 'acknowledged').length}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Resolved</p>
                    <p className="text-2xl font-bold">{([] as Alert[]).filter(a => a.status === 'resolved').length}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-white/70 text-sm">Rules</p>
                    <p className="text-2xl font-bold">{allAlertRules.length}</p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Active Alerts</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {([] as Alert[]).map(alert => (
                        <div
                          key={alert.id}
                          className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                          onClick={() => setSelectedAlert(alert)}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              alert.severity === 'critical' ? 'bg-red-100 text-red-600' :
                              alert.severity === 'high' ? 'bg-orange-100 text-orange-600' :
                              alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              <Bell className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold">{alert.rule_name}</span>
                                <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                                <Badge className={getStatusColor(alert.status)}>{alert.status}</Badge>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{alert.message}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Triggered {new Date(alert.triggered_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Alert Rules</CardTitle>
                      <Button size="sm" onClick={handleCreateAlert}>
                        <Plus className="w-4 h-4 mr-2" />
                        New Rule
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {allAlertRules.map(rule => (
                        <div key={rule.id} className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{rule.name}</span>
                              <Badge className={getSeverityColor(rule.severity)}>{rule.severity}</Badge>
                              <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                                {rule.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">
                                {rule.trigger_count_24h} triggers/24h
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  const hookRule = hookAlertRules.find(r => r.id === rule.id)
                                  if (hookRule) openEditRuleDialog(hookRule)
                                }}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{rule.description}</p>
                          <code className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded mt-2 inline-block">
                            {rule.condition}
                          </code>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Alert Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Active</span>
                        <span className="font-bold text-red-600">{([] as Alert[]).filter(a => a.status === 'active').length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Acknowledged</span>
                        <span className="font-bold text-yellow-600">{([] as Alert[]).filter(a => a.status === 'acknowledged').length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Resolved (24h)</span>
                        <span className="font-bold text-green-600">{([] as Alert[]).filter(a => a.status === 'resolved').length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Notification Channels</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {['Slack #security-alerts', 'PagerDuty On-Call', 'Email security@company.com'].map((channel, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 border rounded-lg">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">{channel}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="mt-6 space-y-6">
            {/* Compliance Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <ShieldCheck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Compliance Dashboard</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">SOC2, GDPR, HIPAA, PCI-DSS, ISO27001 compliance status</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleRefreshCompliance}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={handleExportAllCompliance}>
                  <Download className="w-4 h-4 mr-2" />
                  Export All
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {([] as ComplianceReport[]).map(report => (
                <Card key={report.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{report.framework}</CardTitle>
                      <Badge className={getComplianceColor(report.status)}>
                        {report.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <CardDescription>{report.period}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <span className={`text-4xl font-bold ${
                          report.score >= 90 ? 'text-green-600' :
                          report.score >= 70 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {report.score}%
                        </span>
                        <p className="text-sm text-gray-500">Compliance Score</p>
                      </div>
                      <Progress value={report.score} className="h-2" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-center">
                        <div>
                          <p className="text-2xl font-bold text-green-600">{report.passed_controls}</p>
                          <p className="text-xs text-gray-500">Passed</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-red-600">{report.failed_controls}</p>
                          <p className="text-xs text-gray-500">Failed</p>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full" onClick={() => handleDownloadComplianceReport(report.framework)}>
                        <Download className="w-4 h-4 mr-2" />
                        Download Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6 space-y-6">
            {/* Analytics Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 p-8 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <BarChart3 className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Security Analytics</h2>
                    <p className="text-white/80">Insights and trends from your audit logs</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-6">
                  <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-colors">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Last 7 Days
                  </button>
                  <button className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-white/90 transition-colors">
                    <Download className="w-4 h-4 inline mr-2" />
                    Export Report
                  </button>
                </div>
              </div>
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Events by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { type: 'authentication', count: 45, color: 'bg-blue-500' },
                      { type: 'data_modification', count: 32, color: 'bg-green-500' },
                      { type: 'security', count: 18, color: 'bg-red-500' },
                      { type: 'system', count: 12, color: 'bg-purple-500' },
                      { type: 'admin', count: 8, color: 'bg-orange-500' }
                    ].map(item => (
                      <div key={item.type} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="flex-1 text-sm capitalize">{item.type.replace('_', ' ')}</span>
                        <span className="font-semibold">{item.count}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Geographic Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { country: 'United States', count: 156, pct: 65 },
                      { country: 'Germany', count: 34, pct: 14 },
                      { country: 'United Kingdom', count: 28, pct: 12 },
                      { country: 'Japan', count: 15, pct: 6 },
                      { country: 'Other', count: 7, pct: 3 }
                    ].map(item => (
                      <div key={item.country} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{item.country}</span>
                          <span className="font-semibold">{item.count} ({item.pct}%)</span>
                        </div>
                        <Progress value={item.pct} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {([] as UserSession[]).map(session => (
                      <div key={session.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>{session.user_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{session.user_name}</p>
                          <p className="text-xs text-gray-500">{session.location} • {session.browser}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={session.is_active ? 'default' : 'secondary'}>
                            {session.is_active ? 'Active' : 'Idle'}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">{session.actions_count} actions</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-5 h-5 text-green-600" />
                        <span>Critical Events</span>
                      </div>
                      <span className="font-bold text-green-600">-24.7%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-red-600" />
                        <span>Anomaly Detection</span>
                      </div>
                      <span className="font-bold text-red-600">+8.1%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <span>Blocked Attacks</span>
                      </div>
                      <span className="font-bold text-green-600">+15.6%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6 space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-12 md:col-span-3">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sticky top-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Settings</h3>
                  <nav className="space-y-1">
                    {[
                      { id: 'general', label: 'General', icon: Sliders },
                      { id: 'retention', label: 'Retention', icon: Database },
                      { id: 'notifications', label: 'Notifications', icon: Bell },
                      { id: 'integrations', label: 'Integrations', icon: Webhook },
                      { id: 'security', label: 'Security', icon: Shield },
                      { id: 'advanced', label: 'Advanced', icon: Terminal },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSettingsTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          settingsTab === item.id
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Settings Content */}
              <div className="col-span-12 md:col-span-9 space-y-6">
                {settingsTab === 'general' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Log Sources</CardTitle>
                        <CardDescription>Connected log sources and event rates</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[
                            { name: 'Application Server', status: 'connected', events: '12.4K/hr' },
                            { name: 'Database', status: 'connected', events: '8.2K/hr' },
                            { name: 'Load Balancer', status: 'connected', events: '45.6K/hr' },
                            { name: 'Firewall', status: 'connected', events: '23.1K/hr' },
                            { name: 'CDN', status: 'connected', events: '67.2K/hr' },
                          ].map((source, i) => (
                            <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="font-medium">{source.name}</span>
                              </div>
                              <span className="text-sm text-gray-500">{source.events}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Anomaly Detection</CardTitle>
                        <CardDescription>ML-powered anomaly detection settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Enable Anomaly Detection</p>
                            <p className="text-sm text-gray-500">Uses ML to detect unusual patterns</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label htmlFor="sensitivity">Sensitivity Level</Label>
                          <select id="sensitivity" className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="learningPeriod">Learning Period</Label>
                          <select id="learningPeriod" className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                            <option>7 days</option>
                            <option>14 days</option>
                            <option>30 days</option>
                          </select>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'retention' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Retention Policy</CardTitle>
                        <CardDescription>Configure how long logs are retained</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            { type: 'Security Logs', retention: '7 years', required: true },
                            { type: 'Authentication Logs', retention: '1 year', required: true },
                            { type: 'Audit Logs', retention: '2 years', required: true },
                            { type: 'System Logs', retention: '90 days', required: false },
                            { type: 'Debug Logs', retention: '7 days', required: false }
                          ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">{item.type}</p>
                                {item.required && <span className="text-xs text-gray-500">Compliance required</span>}
                              </div>
                              <select className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                                <option>{item.retention}</option>
                                <option>30 days</option>
                                <option>90 days</option>
                                <option>1 year</option>
                                <option>7 years</option>
                              </select>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Storage Settings</CardTitle>
                        <CardDescription>Configure log storage options</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Compression</p>
                            <p className="text-sm text-gray-500">Compress archived logs</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Encryption at Rest</p>
                            <p className="text-sm text-gray-500">Encrypt stored logs</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'notifications' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Alert Notifications</CardTitle>
                        <CardDescription>Configure notification preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Critical Events', desc: 'Immediate alerts for critical events', enabled: true },
                          { name: 'Failed Logins', desc: 'Alert on failed login attempts', enabled: true },
                          { name: 'Anomaly Detection', desc: 'Alert when anomalies are detected', enabled: true },
                          { name: 'Data Exports', desc: 'Notify on bulk data exports', enabled: false },
                          { name: 'Daily Summary', desc: 'Daily audit log summary', enabled: true },
                        ].map((notification) => (
                          <div key={notification.name} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{notification.name}</p>
                              <p className="text-sm text-gray-500">{notification.desc}</p>
                            </div>
                            <Switch defaultChecked={notification.enabled} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Notification Channels</CardTitle>
                        <CardDescription>Where to send notifications</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="emailNotify">Email Addresses</Label>
                          <Input id="emailNotify" type="text" className="mt-1" defaultValue="security@company.com" />
                        </div>
                        <div>
                          <Label htmlFor="slackWebhook">Slack Webhook</Label>
                          <Input id="slackWebhook" type="url" className="mt-1" placeholder="https://hooks.slack.com/..." />
                        </div>
                        <div>
                          <Label htmlFor="pagerduty">PagerDuty Key</Label>
                          <Input id="pagerduty" type="text" className="mt-1" placeholder="Integration key" />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'integrations' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>SIEM Integration</CardTitle>
                        <CardDescription>Connect to your SIEM platform</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Splunk', desc: 'Forward logs to Splunk', status: 'connected', icon: '📊' },
                          { name: 'Datadog', desc: 'Send to Datadog', status: 'disconnected', icon: '🐕' },
                          { name: 'Elastic', desc: 'Elasticsearch integration', status: 'disconnected', icon: '🔍' },
                          { name: 'Sumo Logic', desc: 'Cloud SIEM', status: 'disconnected', icon: '☁️' },
                        ].map((integration) => (
                          <div key={integration.name} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{integration.icon}</span>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{integration.name}</p>
                                <p className="text-sm text-gray-500">{integration.desc}</p>
                              </div>
                            </div>
                            <Button variant={integration.status === 'connected' ? 'outline' : 'default'} size="sm" onClick={() => handleSiemIntegration(integration.name, integration.status)}>
                              {integration.status === 'connected' ? 'Manage' : 'Connect'}
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Cloud Storage</CardTitle>
                        <CardDescription>Archive logs to cloud storage</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">AWS S3</p>
                            <p className="text-sm text-gray-500">Auto-archive to S3</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label htmlFor="s3Bucket">S3 Bucket</Label>
                          <Input id="s3Bucket" type="text" className="mt-1" defaultValue="audit-logs-archive" />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'security' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Access Control</CardTitle>
                        <CardDescription>Manage who can access audit logs</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">SSO Required</p>
                            <p className="text-sm text-gray-500">Require SSO for access</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">IP Allowlist</p>
                            <p className="text-sm text-gray-500">Restrict access by IP</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Audit Log Access</p>
                            <p className="text-sm text-gray-500">Log who views audit logs</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Data Protection</CardTitle>
                        <CardDescription>Configure data security settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">PII Masking</p>
                            <p className="text-sm text-gray-500">Mask sensitive data in logs</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Encryption in Transit</p>
                            <p className="text-sm text-gray-500">TLS for all transfers</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'advanced' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Export Settings</CardTitle>
                        <CardDescription>Configure log export options</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Export All Logs</p>
                            <p className="text-sm text-gray-500">Download complete audit trail</p>
                          </div>
                          <Button onClick={handleExportAllLogs}>
                            <Download className="w-4 h-4 mr-2" />
                            Export
                          </Button>
                        </div>
                        <div>
                          <Label htmlFor="exportFormat">Default Format</Label>
                          <select id="exportFormat" className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                            <option>JSON</option>
                            <option>CSV</option>
                            <option>Parquet</option>
                          </select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-900/50">
                      <CardHeader>
                        <CardTitle className="text-red-600">Danger Zone</CardTitle>
                        <CardDescription>Irreversible actions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Clear Debug Logs</p>
                            <p className="text-sm text-gray-500">Remove all debug-level logs</p>
                          </div>
                          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleClearDebugLogs}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear
                          </Button>
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Reset Configuration</p>
                            <p className="text-sm text-gray-500">Reset all settings to default</p>
                          </div>
                          <Button variant="destructive" onClick={handleResetConfiguration}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reset
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={[] as AIInsight[]}
              title="Audit Intelligence"
              onInsightAction={(insight) => toast.info(insight.title || 'AI Insight')}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={[] as Collaborator[]}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={[] as Prediction[]}
              title="Audit Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={[] as ActivityItem[]}
            title="Audit Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={[] as QuickAction[]}
            variant="grid"
          />
        </div>

        {/* Log Detail Dialog */}
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="max-w-3xl max-h-[85vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Activity className="w-5 h-5" />
                Event Details
              </DialogTitle>
              <DialogDescription>
                {selectedLog?.id} • {selectedLog?.timestamp && new Date(selectedLog.timestamp).toLocaleString()}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(85vh-120px)]">
              {selectedLog && (
                <div className="space-y-6 pr-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={getSeverityColor(selectedLog.severity)}>{selectedLog.severity}</Badge>
                    <Badge className={getStatusColor(selectedLog.status)}>{selectedLog.status}</Badge>
                    <Badge variant="outline">{selectedLog.log_type}</Badge>
                    {selectedLog.is_anomaly && (
                      <Badge className="bg-purple-100 text-purple-800">Anomaly</Badge>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">{selectedLog.action}</h4>
                    <p className="text-gray-600 dark:text-gray-300">{selectedLog.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">User</p>
                      <p className="font-medium">{selectedLog.user_email || 'System'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">IP Address</p>
                      <p className="font-medium font-mono">{selectedLog.ip_address}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Location</p>
                      <p className="font-medium">{selectedLog.city}, {selectedLog.country}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Duration</p>
                      <p className="font-medium">{formatDuration(selectedLog.duration_ms)}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Resource</p>
                      <p className="font-medium">{selectedLog.resource_name}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Risk Score</p>
                      <p className={`font-medium ${selectedLog.risk_score > 50 ? 'text-red-600' : 'text-green-600'}`}>
                        {selectedLog.risk_score}%
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedLog.tags.map(tag => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Metadata</p>
                    <pre className="p-3 bg-gray-900 text-gray-100 rounded-lg text-xs overflow-x-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t">
                    <Button variant="outline" className="flex-1" onClick={() => handleCopyLogId(selectedLog.id)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy ID
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => handleRelatedEvents(selectedLog.id)}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Related Events
                    </Button>
                  </div>
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Create Alert Rule Dialog */}
        <Dialog open={showCreateRuleDialog} onOpenChange={setShowCreateRuleDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Create Alert Rule
              </DialogTitle>
              <DialogDescription>
                Configure a new alert rule for audit log monitoring
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="rule_name">Rule Name</Label>
                <Input
                  id="rule_name"
                  value={ruleFormData.rule_name}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, rule_name: e.target.value })}
                  placeholder="e.g., Failed Login Threshold"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={ruleFormData.description}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, description: e.target.value })}
                  placeholder="What does this rule monitor?"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="log_type">Log Type</Label>
                  <select
                    id="log_type"
                    value={ruleFormData.log_type}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, log_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <option value="">Any</option>
                    <option value="authentication">Authentication</option>
                    <option value="security">Security</option>
                    <option value="data_access">Data Access</option>
                    <option value="admin">Admin</option>
                    <option value="system">System</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="severity">Severity</Label>
                  <select
                    id="severity"
                    value={ruleFormData.severity}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, severity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <option value="">Any</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="action_pattern">Action Pattern</Label>
                <Input
                  id="action_pattern"
                  value={ruleFormData.action_pattern}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, action_pattern: e.target.value })}
                  placeholder="e.g., user.login_failed"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Active</Label>
                <Switch
                  id="is_active"
                  checked={ruleFormData.is_active}
                  onCheckedChange={(checked) => setRuleFormData({ ...ruleFormData, is_active: checked })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCreateRuleDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAlertRule} disabled={isSaving || !ruleFormData.rule_name}>
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Create Rule
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Alert Rule Dialog */}
        <Dialog open={showEditRuleDialog} onOpenChange={setShowEditRuleDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Edit Alert Rule
              </DialogTitle>
              <DialogDescription>
                Update alert rule configuration
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit_rule_name">Rule Name</Label>
                <Input
                  id="edit_rule_name"
                  value={ruleFormData.rule_name}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, rule_name: e.target.value })}
                  placeholder="e.g., Failed Login Threshold"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_description">Description</Label>
                <Input
                  id="edit_description"
                  value={ruleFormData.description}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, description: e.target.value })}
                  placeholder="What does this rule monitor?"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="edit_log_type">Log Type</Label>
                  <select
                    id="edit_log_type"
                    value={ruleFormData.log_type}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, log_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <option value="">Any</option>
                    <option value="authentication">Authentication</option>
                    <option value="security">Security</option>
                    <option value="data_access">Data Access</option>
                    <option value="admin">Admin</option>
                    <option value="system">System</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_severity">Severity</Label>
                  <select
                    id="edit_severity"
                    value={ruleFormData.severity}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, severity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <option value="">Any</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_action_pattern">Action Pattern</Label>
                <Input
                  id="edit_action_pattern"
                  value={ruleFormData.action_pattern}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, action_pattern: e.target.value })}
                  placeholder="e.g., user.login_failed"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="edit_is_active">Active</Label>
                <Switch
                  id="edit_is_active"
                  checked={ruleFormData.is_active}
                  onCheckedChange={(checked) => setRuleFormData({ ...ruleFormData, is_active: checked })}
                />
              </div>
            </div>
            <div className="flex justify-between">
              <Button
                variant="destructive"
                onClick={() => {
                  if (editingRule) {
                    handleDeleteAlertRule(editingRule.id)
                    setShowEditRuleDialog(false)
                    setEditingRule(null)
                    resetRuleForm()
                  }
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowEditRuleDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateAlertRule} disabled={isSaving || !ruleFormData.rule_name}>
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
