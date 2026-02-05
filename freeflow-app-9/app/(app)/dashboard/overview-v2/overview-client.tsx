'use client'

import { createClient } from '@/lib/supabase/client'
import { DEMO_USER_ID, isDemoModeEnabled } from '@/lib/hooks/use-demo-fetch'
import {
  useDashboardStats,
  useDashboardNotifications,
  useDashboardActivities,
  useDashboardInsights
} from '@/lib/hooks/use-dashboard-extended'

import { useState, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  LayoutDashboard, TrendingUp, TrendingDown, Activity,
  AlertTriangle, AlertCircle, CheckCircle, XCircle, Zap, Server, Globe, Cpu, RefreshCw, Settings, Bell, Plus,
  Search, Filter, MoreHorizontal, Download, ArrowUpRight, ArrowDownRight, BarChart3,
  Target, Cloud, Play,
  ExternalLink, Copy, Gauge, Timer, Webhook, Sliders, AlertOctagon, Trash2, Edit3, Mail,
  Loader2
} from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CardDescription } from '@/components/ui/card'

// Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'

import {
  PlatformStatsWidget,
  BusinessMetricsWidget,
} from '@/components/dashboard/dynamic-content-widgets'

// Initialize Supabase client once at module level
const supabase = createClient()

// ============================================================================
// DATABASE TYPES
// ============================================================================

interface DbDashboardMetric {
  id: string
  user_id: string
  name: string
  value: number
  previous_value: number
  change: number
  change_percent: number
  trend: 'up' | 'down' | 'stable'
  unit: string
  icon: string | null
  color: string | null
  is_positive: boolean
  target: number | null
  target_progress: number | null
  last_updated: string
  category: string
  description: string | null
  created_at: string
}

interface DbDashboardStats {
  id: string
  user_id: string
  earnings: number
  earnings_trend: number
  active_projects: number
  active_projects_trend: number
  completed_projects: number
  completed_projects_trend: number
  total_clients: number
  total_clients_trend: number
  hours_this_month: number
  hours_this_month_trend: number
  revenue_this_month: number
  revenue_this_month_trend: number
  average_project_value: number
  average_project_value_trend: number
  productivity_score: number
  productivity_score_trend: number
  pending_tasks: number
  overdue_tasks: number
  upcoming_meetings: number
  unread_messages: number
  last_updated: string
  created_at: string
}

interface DbDashboardNotification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  is_read: boolean
  created_at: string
  action_url: string | null
  action_label: string | null
  priority: 'low' | 'normal' | 'high' | 'urgent'
}

// ============================================================================
// TYPE DEFINITIONS - Datadog Level Monitoring
// ============================================================================

type MetricStatus = 'healthy' | 'warning' | 'critical' | 'unknown' | 'no_data'
type TimeRange = '1h' | '4h' | '24h' | '7d' | '30d' | 'custom'
type AlertSeverity = 'critical' | 'warning' | 'info' | 'low'
type AlertStatus = 'triggered' | 'acknowledged' | 'resolved' | 'muted'
type ServiceStatus = 'operational' | 'degraded' | 'outage' | 'maintenance' | 'unknown'
type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace'

interface Metric {
  id: string
  name: string
  display_name: string
  value: number
  unit: string
  change: number
  change_percent: number
  status: MetricStatus
  sparkline: number[]
  tags: string[]
  host: string
  last_updated: string
  aggregation: 'avg' | 'sum' | 'min' | 'max' | 'count'
  interval_seconds: number
}

interface Alert {
  id: string
  title: string
  message: string
  severity: AlertSeverity
  status: AlertStatus
  source: string
  service: string
  metric: string
  threshold: number
  current_value: number
  triggered_at: string
  acknowledged_by: string | null
  acknowledged_at: string | null
  resolved_at: string | null
  muted_until: string | null
  tags: string[]
  related_alerts: string[]
  runbook_url: string | null
  notification_channels: string[]
}

interface Service {
  id: string
  name: string
  display_name: string
  status: ServiceStatus
  uptime_percent: number
  response_time_p50: number
  response_time_p95: number
  response_time_p99: number
  error_rate: number
  throughput: number
  region: string
  environment: 'production' | 'staging' | 'development'
  last_incident_at: string | null
  dependencies: string[]
  health_checks: HealthCheck[]
  apm_enabled: boolean
  version: string
}

interface HealthCheck {
  id: string
  name: string
  type: 'http' | 'tcp' | 'dns' | 'ssl' | 'process'
  status: 'passing' | 'failing' | 'warning'
  last_check_at: string
  response_time_ms: number
  details: string
}

interface LogEntry {
  id: string
  timestamp: string
  level: LogLevel
  service: string
  host: string
  message: string
  attributes: Record<string, unknown>
  trace_id: string | null
  span_id: string | null
  tags: string[]
}

interface Dashboard {
  id: string
  name: string
  description: string
  widgets: DashboardWidget[]
  tags: string[]
  created_by: string
  created_at: string
  updated_at: string
  is_favorite: boolean
  is_shared: boolean
}

interface DashboardWidget {
  id: string
  type: 'timeseries' | 'query_value' | 'toplist' | 'heatmap' | 'distribution' | 'table' | 'note' | 'slo'
  title: string
  query: string
  size: 'sm' | 'md' | 'lg' | 'xl'
  position: { x: number; y: number; w: number; h: number }
  visualization: Record<string, unknown>
}

interface Monitor {
  id: string
  name: string
  type: 'metric' | 'log' | 'apm' | 'synthetics' | 'composite'
  query: string
  message: string
  priority: 1 | 2 | 3 | 4 | 5
  tags: string[]
  status: 'ok' | 'alert' | 'warn' | 'no_data'
  last_triggered_at: string | null
  created_by: string
  created_at: string
}

interface SLO {
  id: string
  name: string
  description: string
  target_percent: number
  current_percent: number
  time_window: '7d' | '30d' | '90d'
  type: 'metric' | 'monitor'
  status: 'ok' | 'warning' | 'breached'
  error_budget_remaining: number
  burn_rate: number
}

interface InfraHost {
  id: string
  name: string
  hostname: string
  os: string
  ip_address: string
  cpu_percent: number
  memory_percent: number
  disk_percent: number
  network_in_mbps: number
  network_out_mbps: number
  status: 'running' | 'stopped' | 'pending' | 'unknown'
  agent_version: string
  last_seen_at: string
  tags: string[]
  cloud_provider: 'aws' | 'gcp' | 'azure' | 'on-prem'
  instance_type: string
}

// ============================================================================
// DATA ARRAYS - Empty (populated from Supabase)
// ============================================================================

const metrics: Metric[] = []

const alerts: Alert[] = []

const services: Service[] = []

const logs: LogEntry[] = []

const hosts: InfraHost[] = []

const slos: SLO[] = []

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getStatusColor = (status: MetricStatus | ServiceStatus): string => {
  const colors: Record<string, string> = {
    healthy: 'bg-green-100 text-green-800 border-green-200',
    operational: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    degraded: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    critical: 'bg-red-100 text-red-800 border-red-200',
    outage: 'bg-red-100 text-red-800 border-red-200',
    maintenance: 'bg-blue-100 text-blue-800 border-blue-200',
    unknown: 'bg-gray-100 text-gray-800 border-gray-200',
    no_data: 'bg-gray-100 text-gray-800 border-gray-200'
  }
  return colors[status] || colors.unknown
}

const getSeverityColor = (severity: AlertSeverity): string => {
  const colors: Record<AlertSeverity, string> = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    low: 'bg-gray-100 text-gray-800 border-gray-200'
  }
  return colors[severity]
}

const getLogLevelColor = (level: LogLevel): string => {
  const colors: Record<LogLevel, string> = {
    error: 'bg-red-100 text-red-800',
    warn: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800',
    debug: 'bg-gray-100 text-gray-800',
    trace: 'bg-purple-100 text-purple-800'
  }
  return colors[level]
}

const formatValue = (value: number, unit: string): string => {
  if (unit === 'USD') return `$${value.toLocaleString()}`
  if (unit === '%') return `${value.toFixed(value < 1 ? 2 : 0)}%`
  if (unit === 'ms') return `${value}ms`
  if (unit === 'rpm') return `${(value / 1000).toFixed(1)}K/min`
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return value.toLocaleString()
}

const formatTimeAgo = (date: string): string => {
  const now = new Date()
  const then = new Date(date)
  const diffMins = Math.floor((now.getTime() - then.getTime()) / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
  return `${Math.floor(diffMins / 1440)}d ago`
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// ============================================================================
// COMPETITIVE UPGRADE DATA - Empty arrays (populated from real data sources)
// ============================================================================

const aiInsights: { id: string; query: string; insight: string; confidence: number; category: 'engagement' | 'conversion' | 'revenue'; timestamp: string }[] = []

const overviewCollaborators: { id: string; name: string; avatar: string; status: 'active' | 'idle' | 'offline'; lastActive: string; role: string }[] = []

const overviewPredictions: { id: string; metric: string; currentValue: number; predictedValue: number; confidence: number; trend: 'up' | 'down' | 'stable'; timeframe: string; factors: string[] }[] = []

const overviewActivities: { id: string; type: 'status_change' | 'update' | 'create' | 'delete' | 'comment'; title: string; description: string; user: { name: string; avatar: string }; timestamp: string; metadata: Record<string, unknown> }[] = []

// Note: Quick actions are defined inside the component using useState dialog handlers
// See quickActions useMemo for the proper implementation with dialog-based workflows

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function OverviewClient() {
  // User state for hooks
  const [userId, setUserId] = useState<string | undefined>(undefined)

  // Fetch current user on mount - use demo user ID in demo mode
  useEffect(() => {
    const fetchUser = async () => {
      // Check for demo mode first
      if (isDemoModeEnabled()) {
        setUserId(DEMO_USER_ID)
        return
      }
      // Otherwise get authenticated user
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }
    }
    fetchUser()
  }, [])

  // Use dashboard hooks for Supabase data
  const {
    data: hookStats,
    isLoading: statsLoading,
    refresh: refreshStats
  } = useDashboardStats(userId)

  const {
    data: hookNotifications,
    isLoading: notificationsLoading,
    refresh: refreshNotifications
  } = useDashboardNotifications(userId)

  const {
    data: hookActivities,
    isLoading: activitiesLoading,
    refresh: refreshActivities
  } = useDashboardActivities(userId)

  const {
    data: hookInsights,
    isLoading: insightsLoading,
    refresh: refreshInsights
  } = useDashboardInsights(userId)

  // Computed loading state from all hooks
  const isLoading = statsLoading || notificationsLoading || activitiesLoading || insightsLoading

  // Map DB stats to component state
  const dbStats: DbDashboardStats | null = hookStats ? {
    id: hookStats.id || '',
    user_id: hookStats.user_id || '',
    earnings: hookStats.earnings || 0,
    earnings_trend: hookStats.earnings_trend || 0,
    active_projects: hookStats.active_projects || 0,
    active_projects_trend: hookStats.active_projects_trend || 0,
    completed_projects: hookStats.completed_projects || 0,
    completed_projects_trend: hookStats.completed_projects_trend || 0,
    total_clients: hookStats.total_clients || 0,
    total_clients_trend: hookStats.total_clients_trend || 0,
    hours_this_month: hookStats.hours_this_month || 0,
    hours_this_month_trend: hookStats.hours_this_month_trend || 0,
    revenue_this_month: hookStats.revenue_this_month || 0,
    revenue_this_month_trend: hookStats.revenue_this_month_trend || 0,
    average_project_value: hookStats.average_project_value || 0,
    average_project_value_trend: hookStats.average_project_value_trend || 0,
    productivity_score: hookStats.productivity_score || 0,
    productivity_score_trend: hookStats.productivity_score_trend || 0,
    pending_tasks: hookStats.pending_tasks || 0,
    overdue_tasks: hookStats.overdue_tasks || 0,
    upcoming_meetings: hookStats.upcoming_meetings || 0,
    unread_messages: hookStats.unread_messages || 0,
    last_updated: hookStats.last_updated || new Date().toISOString(),
    created_at: hookStats.created_at || new Date().toISOString()
  } : null

  // Map DB notifications to component state
  const dbNotifications: DbDashboardNotification[] = (hookNotifications || []).map((n: any) => ({
    id: n.id || '',
    user_id: n.user_id || '',
    title: n.title || '',
    message: n.message || '',
    type: n.type || 'info',
    is_read: n.is_read || false,
    created_at: n.created_at || new Date().toISOString(),
    action_url: n.action_url || null,
    action_label: n.action_label || null,
    priority: n.priority || 'normal'
  }))

  // Map DB metrics from activities/insights for display
  const dbMetrics: DbDashboardMetric[] = (hookInsights || []).map((insight: any) => ({
    id: insight.id || '',
    user_id: insight.user_id || '',
    name: insight.title || insight.name || '',
    value: insight.value || 0,
    previous_value: insight.previous_value || 0,
    change: insight.change || 0,
    change_percent: insight.change_percent || 0,
    trend: insight.trend || 'stable',
    unit: insight.unit || '',
    icon: insight.icon || null,
    color: insight.color || null,
    is_positive: insight.is_positive || false,
    target: insight.target || null,
    target_progress: insight.target_progress || null,
    last_updated: insight.updated_at || new Date().toISOString(),
    category: insight.category || '',
    description: insight.description || null,
    created_at: insight.created_at || new Date().toISOString()
  }))

  // UI State
  const [activeTab, setActiveTab] = useState('dashboard')
  const [timeRange, setTimeRange] = useState<TimeRange>('24h')
  const [searchQuery, setSearchQuery] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)
  const [settingsTab, setSettingsTab] = useState('general')

  // Quick Action Dialog States
  const [showCreateAlertDialog, setShowCreateAlertDialog] = useState(false)
  const [showViewLogsDialog, setShowViewLogsDialog] = useState(false)
  const [showHealthCheckDialog, setShowHealthCheckDialog] = useState(false)
  const [showDeployDialog, setShowDeployDialog] = useState(false)

  // Additional Dialog States for buttons without onClick
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [showAlertActionsDialog, setShowAlertActionsDialog] = useState<string | null>(null)
  const [showExportLogsDialog, setShowExportLogsDialog] = useState(false)
  const [showLiveTailDialog, setShowLiveTailDialog] = useState(false)
  const [showEditChannelDialog, setShowEditChannelDialog] = useState<string | null>(null)
  const [showAddChannelDialog, setShowAddChannelDialog] = useState(false)
  const [showEditEscalationDialog, setShowEditEscalationDialog] = useState<string | null>(null)
  const [showAddEscalationDialog, setShowAddEscalationDialog] = useState(false)
  const [showConfigureProviderDialog, setShowConfigureProviderDialog] = useState<string | null>(null)
  const [showRegenerateApiKeyDialog, setShowRegenerateApiKeyDialog] = useState(false)
  const [showEditWebhookDialog, setShowEditWebhookDialog] = useState<string | null>(null)
  const [showDeleteWebhookDialog, setShowDeleteWebhookDialog] = useState<string | null>(null)
  const [showAddWebhookDialog, setShowAddWebhookDialog] = useState(false)

  // Additional Loading States
  const [isSaving, setIsSaving] = useState(false)

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState({
    orgName: 'Kazi Platform',
    environment: 'production',
    timezone: 'utc',
    dateFormat: 'iso',
    weekStartsOn: 'monday',
    darkMode: false,
    compactView: false,
    highContrastMode: false,
    showSparklines: true,
    animateTransitions: true,
    autoRefresh: true,
    refreshInterval: '30',
    defaultTimeRange: '4h',
    defaultTab: 'overview'
  })

  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: '1h', label: '1H' },
    { value: '4h', label: '4H' },
    { value: '24h', label: '24H' },
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' }
  ]

  // Dashboard stats
  const stats = useMemo(() => ({
    healthyServices: services.filter(s => s.status === 'operational').length,
    totalServices: services.length,
    criticalAlerts: alerts.filter(a => a.severity === 'critical' && a.status === 'triggered').length,
    warningAlerts: alerts.filter(a => a.severity === 'warning' && a.status === 'triggered').length,
    overallUptime: services.length > 0 ? (services.reduce((sum, s) => sum + s.uptime_percent, 0) / services.length).toFixed(2) : '0.00',
    totalHosts: hosts.length,
    activeHosts: hosts.filter(h => h.status === 'running').length,
    avgCpu: hosts.length > 0 ? Math.round(hosts.reduce((sum, h) => sum + h.cpu_percent, 0) / hosts.length) : 0
  }), [])

  // Filtered data
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert =>
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  const filteredLogs = useMemo(() => {
    return logs.filter(log =>
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.service.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  // Quick Actions with proper dialog handlers
  const quickActions = useMemo(() => [
    { id: '1', label: 'Create Alert', icon: 'Bell', shortcut: '⌘A', action: () => setShowCreateAlertDialog(true) },
    { id: '2', label: 'View Logs', icon: 'FileText', shortcut: '⌘L', action: () => setShowViewLogsDialog(true) },
    { id: '3', label: 'Run Health Check', icon: 'Activity', shortcut: '⌘H', action: () => setShowHealthCheckDialog(true) },
    { id: '4', label: 'Deploy', icon: 'Rocket', shortcut: '⌘D', action: () => setShowDeployDialog(true) },
  ], [])

  // Real-time subscription for dashboard changes
  useEffect(() => {
    const channel = supabase
      .channel('dashboard_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dashboard_metrics' }, () => {
        refreshInsights()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dashboard_stats' }, () => {
        refreshStats()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dashboard_notifications' }, () => {
        refreshNotifications()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dashboard_activities' }, () => {
        refreshActivities()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [refreshStats, refreshNotifications, refreshActivities, refreshInsights])

  // Handle refresh using hooks
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await Promise.all([
      refreshStats(),
      refreshNotifications(),
      refreshActivities(),
      refreshInsights()
    ])
    toast.success('Dashboard refreshed')
    setIsRefreshing(false)
  }

  // Export dashboard data
  const handleExportDashboard = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please log in to export data')
        return
      }

      const exportData = {
        metrics: dbMetrics,
        stats: dbStats,
        notifications: dbNotifications,
        exportedAt: new Date().toISOString(),
        timeRange
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Dashboard exported')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Export failed')
    }
  }

  // Save settings to Supabase
  const handleSaveSettings = async () => {
    try {
      setIsSaving(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please log in to save settings')
        return
      }

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          theme: settingsForm.darkMode ? 'dark' : 'light',
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })

      if (error) throw error
      toast.success('Settings saved')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  // Mark notification as read
  const handleMarkNotificationRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('dashboard_notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (error) throw error
      await refreshNotifications()
      toast.success('Notification dismissed')
    } catch (error: unknown) {
      console.error('Error marking notification read:', error)
      toast.error('Failed to dismiss notification')
    }
  }

  // Clear all metrics (danger zone)
  const handleClearMetrics = async () => {
    try {
      if (!userId) return

      const { error } = await supabase
        .from('dashboard_insights')
        .delete()
        .eq('user_id', userId)

      if (error) throw error
      await refreshInsights()
      toast.success('Metrics cleared')
    } catch (error: unknown) {
      console.error('Error clearing metrics:', error)
      toast.error('Failed to clear metrics')
    }
  }

  // Reset dashboard stats (danger zone)
  const handleResetDashboards = async () => {
    try {
      if (!userId) return

      const { error } = await supabase
        .from('dashboard_stats')
        .delete()
        .eq('user_id', userId)

      if (error) throw error
      await refreshStats()
      toast.success('Dashboard reset')
    } catch (error: unknown) {
      console.error('Error resetting dashboard:', error)
      toast.error('Failed to reset dashboard')
    }
  }

  // Delete all data (danger zone)
  const handleDeleteAllData = async () => {
    try {
      if (!userId) return

      await Promise.all([
        supabase.from('dashboard_insights').delete().eq('user_id', userId),
        supabase.from('dashboard_stats').delete().eq('user_id', userId),
        supabase.from('dashboard_notifications').delete().eq('user_id', userId)
      ])

      await Promise.all([
        refreshInsights(),
        refreshStats(),
        refreshNotifications()
      ])
      toast.success('All data deleted')
    } catch (error: unknown) {
      console.error('Error deleting all data:', error)
      toast.error('Failed to delete data')
    }
  }

  // Acknowledge alert (placeholder - can be connected to alerts table)
  const handleAcknowledgeAlert = (alertTitle: string) => {
    toast.success(`Alert acknowledged: "${alertTitle}" has been acknowledged`)
  }

  // View details (placeholder)
  const handleViewDetails = (section: string) => {
    toast.info(`View Details: ${section} details...`)
  }

  // Show loading spinner during initial load
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:bg-none dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:bg-none dark:bg-gray-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 p-8">
          <div className="absolute inset-0 bg-grid-white/10" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <LayoutDashboard className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
                <p className="text-indigo-200 mt-1">Datadog-level monitoring & observability</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Collaboration Indicator */}
              <CollaborationIndicator
                collaborators={overviewCollaborators}
                maxVisible={3}
              />
              <div className="flex items-center bg-white/10 rounded-lg p-1">
                {timeRanges.map(range => (
                  <Button
                    key={range.value}
                    variant="ghost"
                    size="sm"
                    className={`${timeRange === range.value ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                    onClick={() => setTimeRange(range.value)}
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={handleRefresh}
               aria-label="Refresh">
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { label: 'Services', value: `${stats.healthyServices}/${stats.totalServices}`, icon: Server, color: 'from-green-500 to-emerald-500', change: 'All healthy' },
            { label: 'Uptime', value: `${stats.overallUptime}%`, icon: Activity, color: 'from-blue-500 to-cyan-500', change: '30 days' },
            { label: 'Critical', value: stats.criticalAlerts.toString(), icon: AlertTriangle, color: 'from-red-500 to-pink-500', change: 'Active' },
            { label: 'Warnings', value: stats.warningAlerts.toString(), icon: AlertCircle, color: 'from-yellow-500 to-orange-500', change: 'Active' },
            { label: 'Hosts', value: `${stats.activeHosts}/${stats.totalHosts}`, icon: Cpu, color: 'from-purple-500 to-indigo-500', change: 'Running' },
            { label: 'Avg CPU', value: `${stats.avgCpu}%`, icon: Gauge, color: 'from-teal-500 to-green-500', change: 'All hosts' },
            { label: 'Requests', value: formatValue(45200, 'rpm'), icon: Zap, color: 'from-orange-500 to-red-500', change: '/min' },
            { label: 'Latency P95', value: '145ms', icon: Timer, color: 'from-pink-500 to-rose-500', change: 'API' }
          ].map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all dark:bg-gray-800">
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm">
            <TabsTrigger value="dashboard" className="rounded-lg">Dashboard</TabsTrigger>
            <TabsTrigger value="metrics" className="rounded-lg">Metrics</TabsTrigger>
            <TabsTrigger value="services" className="rounded-lg">Services</TabsTrigger>
            <TabsTrigger value="alerts" className="rounded-lg">
              Alerts
              {stats.criticalAlerts > 0 && (
                <Badge className="ml-2 bg-red-500 text-white text-xs">{stats.criticalAlerts}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="logs" className="rounded-lg">Logs</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg">Settings</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6 mt-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {metrics.slice(0, 8).map(metric => (
                <Card key={metric.id} className="border-0 shadow-sm hover:shadow-md transition-all dark:bg-gray-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500 truncate">{metric.display_name}</span>
                      <Badge className={getStatusColor(metric.status)}>{metric.status}</Badge>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatValue(metric.value, metric.unit)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {metric.change_percent > 0 ? (
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`text-sm ${metric.change_percent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {metric.change_percent > 0 ? '+' : ''}{metric.change_percent}%
                      </span>
                    </div>
                    <div className="flex items-end gap-0.5 h-8 mt-3">
                      {metric.sparkline.map((value, idx) => (
                        <div
                          key={idx}
                          className="flex-1 bg-indigo-200 dark:bg-indigo-800 rounded-t"
                          style={{ height: `${(value / Math.max(...metric.sparkline)) * 100}%` }}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Services & SLOs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 border-0 shadow-sm dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-indigo-600" />
                    Service Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {services.map(service => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        onClick={() => setSelectedService(service)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            service.status === 'operational' ? 'bg-green-500' :
                            service.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{service.display_name}</p>
                            <p className="text-xs text-gray-500">{service.region} · {service.environment}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-right">
                            <p className="font-medium text-gray-900 dark:text-white">{service.uptime_percent}%</p>
                            <p className="text-xs text-gray-500">Uptime</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900 dark:text-white">{service.response_time_p95}ms</p>
                            <p className="text-xs text-gray-500">P95</p>
                          </div>
                          <Badge className={getStatusColor(service.status)}>{service.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-600" />
                    SLOs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {slos.map(slo => (
                      <div key={slo.id} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900 dark:text-white">{slo.name}</span>
                          <Badge className={slo.status === 'ok' ? 'bg-green-100 text-green-800' : slo.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                            {slo.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-500">Current: {slo.current_percent}%</span>
                          <span className="text-gray-500">Target: {slo.target_percent}%</span>
                        </div>
                        <Progress value={(slo.current_percent / slo.target_percent) * 100} className="h-2" />
                        <p className="text-xs text-gray-500 mt-2">Error budget: {slo.error_budget_remaining}% remaining</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Alerts */}
            <Card className="border-0 shadow-sm dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-indigo-600" />
                  Recent Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.slice(0, 4).map(alert => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-xl border ${getSeverityColor(alert.severity)} cursor-pointer hover:shadow-md transition-all`}
                      onClick={() => setSelectedAlert(alert)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {alert.severity === 'critical' ? <XCircle className="w-5 h-5" /> :
                           alert.severity === 'warning' ? <AlertTriangle className="w-5 h-5" /> :
                           <AlertCircle className="w-5 h-5" />}
                          <div>
                            <p className="font-semibold">{alert.title}</p>
                            <p className="text-sm opacity-80">{alert.message}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{alert.status}</Badge>
                          <span className="text-xs opacity-70">{formatTimeAgo(alert.triggered_at)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Platform Stats & Business Metrics - Dynamic Content */}
            <div className="space-y-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-600" />
                Platform Insights
              </h3>
              <PlatformStatsWidget />
              <div className="grid md:grid-cols-2 gap-6">
                <BusinessMetricsWidget />
                <Card className="border-0 shadow-sm dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-purple-500" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <QuickActionsToolbar />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics.map(metric => (
                <Card key={metric.id} className="border-0 shadow-sm hover:shadow-md transition-all dark:bg-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900 dark:text-white">{metric.display_name}</h4>
                      <Badge className={getStatusColor(metric.status)}>{metric.status}</Badge>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{formatValue(metric.value, metric.unit)}</p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        {metric.change_percent > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <span className={metric.change_percent > 0 ? 'text-green-600' : 'text-red-600'}>
                          {metric.change_percent > 0 ? '+' : ''}{metric.change_percent}%
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{formatTimeAgo(metric.last_updated)}</span>
                    </div>
                    <div className="flex items-end gap-0.5 h-12 mb-4">
                      {metric.sparkline.map((value, idx) => (
                        <div
                          key={idx}
                          className="flex-1 bg-indigo-200 dark:bg-indigo-800 rounded-t"
                          style={{ height: `${(value / Math.max(...metric.sparkline)) * 100}%` }}
                        />
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {metric.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6 mt-6">
            <div className="space-y-4">
              {services.map(service => (
                <Card
                  key={service.id}
                  className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer dark:bg-gray-800"
                  onClick={() => setSelectedService(service)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getStatusColor(service.status)}`}>
                          <Server className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{service.display_name}</h4>
                          <p className="text-sm text-gray-500">{service.region} · {service.environment} · v{service.version}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(service.status)}>{service.status}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 text-sm">
                      <div>
                        <p className="text-gray-500">Uptime</p>
                        <p className="font-semibold text-lg text-gray-900 dark:text-white">{service.uptime_percent}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">P50 Latency</p>
                        <p className="font-semibold text-lg text-gray-900 dark:text-white">{service.response_time_p50}ms</p>
                      </div>
                      <div>
                        <p className="text-gray-500">P95 Latency</p>
                        <p className="font-semibold text-lg text-gray-900 dark:text-white">{service.response_time_p95}ms</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Error Rate</p>
                        <p className="font-semibold text-lg text-gray-900 dark:text-white">{service.error_rate}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Throughput</p>
                        <p className="font-semibold text-lg text-gray-900 dark:text-white">{service.throughput.toLocaleString()}/min</p>
                      </div>
                    </div>
                    {service.dependencies.length > 0 && (
                      <div className="mt-4 pt-4 border-t dark:border-gray-700">
                        <p className="text-xs text-gray-500 mb-2">Dependencies</p>
                        <div className="flex gap-2">
                          {service.dependencies.map(dep => (
                            <Badge key={dep} variant="outline">{dep}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search alerts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowFilterDialog(true)}>
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {filteredAlerts.map(alert => (
                <Card
                  key={alert.id}
                  className={`border-0 shadow-sm cursor-pointer transition-all ${getSeverityColor(alert.severity)}`}
                  onClick={() => setSelectedAlert(alert)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {alert.severity === 'critical' ? <XCircle className="w-5 h-5" /> :
                         alert.severity === 'warning' ? <AlertTriangle className="w-5 h-5" /> :
                         <AlertCircle className="w-5 h-5" />}
                        <div>
                          <h4 className="font-semibold">{alert.title}</h4>
                          <p className="text-sm opacity-80">{alert.message}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{alert.status}</Badge>
                        <Button variant="ghost" size="sm" onClick={(e) => {
                          e.stopPropagation()
                          setShowAlertActionsDialog(alert.id)
                        }}>
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span>Service: {alert.service}</span>
                        <span>Metric: {alert.metric}</span>
                        <span>Current: {alert.current_value} (threshold: {alert.threshold})</span>
                      </div>
                      <span className="text-xs opacity-70">{formatTimeAgo(alert.triggered_at)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-80 font-mono"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowExportLogsDialog(true)}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowLiveTailDialog(true)}>
                  <Play className="w-4 h-4 mr-2" />
                  Live Tail
                </Button>
              </div>
            </div>

            <Card className="border-0 shadow-sm dark:bg-gray-800">
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  <div className="font-mono text-sm">
                    {filteredLogs.map(log => (
                      <div
                        key={log.id}
                        className="flex items-start gap-4 p-3 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                        onClick={() => setSelectedLog(log)}
                      >
                        <span className="text-xs text-gray-500 whitespace-nowrap">{formatDate(log.timestamp)}</span>
                        <Badge className={getLogLevelColor(log.level)}>{log.level.toUpperCase()}</Badge>
                        <span className="text-blue-600 dark:text-blue-400 whitespace-nowrap">{log.service}</span>
                        <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap">{log.host}</span>
                        <span className="text-gray-900 dark:text-white flex-1 truncate">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          {/* Settings Tab - Mixpanel Level Analytics Platform */}
          <TabsContent value="settings" className="space-y-6 mt-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-12 lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Settings</CardTitle>
                    <CardDescription>Configure dashboard platform</CardDescription>
                  </CardHeader>
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', label: 'General', icon: Settings },
                        { id: 'metrics', label: 'Metrics', icon: BarChart3 },
                        { id: 'alerts', label: 'Alerts', icon: Bell },
                        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                        { id: 'integrations', label: 'Integrations', icon: Webhook },
                        { id: 'advanced', label: 'Advanced', icon: Sliders }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            settingsTab === item.id
                              ? 'bg-indigo-600 text-white'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          <item.icon className="h-4 w-4" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>

                {/* Platform Stats Sidebar */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Platform Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">API Usage</span>
                        <span className="font-medium">78%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Event Volume</span>
                        <span className="font-medium">2.4M/day</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Data Storage</span>
                        <span className="font-medium">847 GB</span>
                      </div>
                      <Progress value={84} className="h-2" />
                    </div>
                    <div className="pt-4 border-t space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Active Users</span>
                        <span className="font-medium">12,458</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Dashboards</span>
                        <span className="font-medium text-indigo-600">24</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Reports</span>
                        <span className="font-medium text-purple-600">156</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-12 lg:col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>General Settings</CardTitle>
                        <CardDescription>Basic platform configuration</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Organization Name</Label>
                            <Input defaultValue="Kazi Platform" />
                          </div>
                          <div className="space-y-2">
                            <Label>Environment</Label>
                            <Select defaultValue="production">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="development">Development</SelectItem>
                                <SelectItem value="staging">Staging</SelectItem>
                                <SelectItem value="production">Production</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Default Timezone</Label>
                            <Select defaultValue="utc">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="utc">UTC</SelectItem>
                                <SelectItem value="est">Eastern Time</SelectItem>
                                <SelectItem value="pst">Pacific Time</SelectItem>
                                <SelectItem value="cet">Central European</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Date Format</Label>
                            <Select defaultValue="iso">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="iso">YYYY-MM-DD</SelectItem>
                                <SelectItem value="us">MM/DD/YYYY</SelectItem>
                                <SelectItem value="eu">DD/MM/YYYY</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-4 border-t">
                          <div>
                            <Label>Week Starts On</Label>
                            <p className="text-sm text-gray-500">First day of the week in reports</p>
                          </div>
                          <Select defaultValue="monday">
                            <SelectTrigger className="w-[150px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sunday">Sunday</SelectItem>
                              <SelectItem value="monday">Monday</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Display Preferences</CardTitle>
                        <CardDescription>Customize dashboard appearance</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Dark Mode</Label>
                            <p className="text-sm text-gray-500">Use dark theme for dashboard</p>
                          </div>
                          <Switch
                            checked={settingsForm.darkMode}
                            onCheckedChange={(checked) => setSettingsForm(prev => ({ ...prev, darkMode: checked }))}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Compact View</Label>
                            <p className="text-sm text-gray-500">Show more data on screen</p>
                          </div>
                          <Switch
                            checked={settingsForm.compactView}
                            onCheckedChange={(checked) => setSettingsForm(prev => ({ ...prev, compactView: checked }))}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>High Contrast Mode</Label>
                            <p className="text-sm text-gray-500">Enhanced visibility for metrics</p>
                          </div>
                          <Switch
                            checked={settingsForm.highContrastMode}
                            onCheckedChange={(checked) => setSettingsForm(prev => ({ ...prev, highContrastMode: checked }))}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Show Sparklines</Label>
                            <p className="text-sm text-gray-500">Display mini charts in cards</p>
                          </div>
                          <Switch
                            checked={settingsForm.showSparklines}
                            onCheckedChange={(checked) => setSettingsForm(prev => ({ ...prev, showSparklines: checked }))}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Animate Transitions</Label>
                            <p className="text-sm text-gray-500">Smooth animations between states</p>
                          </div>
                          <Switch
                            checked={settingsForm.animateTransitions}
                            onCheckedChange={(checked) => setSettingsForm(prev => ({ ...prev, animateTransitions: checked }))}
                          />
                        </div>
                        <div className="pt-4 border-t">
                          <Button onClick={handleSaveSettings} disabled={isSaving} className="w-full">
                            {isSaving ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              'Save Settings'
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Metrics Settings */}
                {settingsTab === 'metrics' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Metric Collection</CardTitle>
                        <CardDescription>Configure how metrics are collected</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Enable Metric Collection</Label>
                            <p className="text-sm text-gray-500">Collect and aggregate metrics</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Collection Interval</Label>
                            <Select defaultValue="10">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="5">5 seconds</SelectItem>
                                <SelectItem value="10">10 seconds</SelectItem>
                                <SelectItem value="30">30 seconds</SelectItem>
                                <SelectItem value="60">1 minute</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Aggregation Method</Label>
                            <Select defaultValue="avg">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="avg">Average</SelectItem>
                                <SelectItem value="sum">Sum</SelectItem>
                                <SelectItem value="max">Maximum</SelectItem>
                                <SelectItem value="min">Minimum</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Include Host Tags</Label>
                            <p className="text-sm text-gray-500">Add host metadata to metrics</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Custom Metric Tags</Label>
                            <p className="text-sm text-gray-500">Add custom tags to all metrics</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Data Retention</CardTitle>
                        <CardDescription>Configure how long metrics are stored</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                              <Activity className="h-5 w-5 text-blue-600" />
                              <Label className="text-base">High Resolution</Label>
                            </div>
                            <Select defaultValue="15">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="7">7 days</SelectItem>
                                <SelectItem value="15">15 days</SelectItem>
                                <SelectItem value="30">30 days</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 mt-2">1-second resolution</p>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                              <BarChart3 className="h-5 w-5 text-purple-600" />
                              <Label className="text-base">Aggregated</Label>
                            </div>
                            <Select defaultValue="90">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="30">30 days</SelectItem>
                                <SelectItem value="90">90 days</SelectItem>
                                <SelectItem value="365">1 year</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 mt-2">1-minute resolution</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Metric Categories</CardTitle>
                        <CardDescription>Enable/disable metric categories</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Infrastructure', enabled: true, count: 156 },
                          { name: 'Application Performance', enabled: true, count: 89 },
                          { name: 'Business Metrics', enabled: true, count: 45 },
                          { name: 'Custom Events', enabled: true, count: 234 },
                          { name: 'User Behavior', enabled: false, count: 0 }
                        ].map((category, idx) => (
                          <div key={idx} className="flex items-center justify-between py-3 px-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <BarChart3 className={`h-4 w-4 ${category.enabled ? 'text-indigo-600' : 'text-gray-400'}`} />
                              <div>
                                <p className="font-medium">{category.name}</p>
                                <p className="text-sm text-gray-500">{category.count} metrics</p>
                              </div>
                            </div>
                            <Switch defaultChecked={category.enabled} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Alert Settings */}
                {settingsTab === 'alerts' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Notification Channels</CardTitle>
                        <CardDescription>Configure where alerts are sent</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Email', icon: Mail, config: 'team@company.com', enabled: true },
                          { name: 'Slack', icon: Webhook, config: '#alerts-production', enabled: true },
                          { name: 'PagerDuty', icon: Bell, config: 'On-call rotation', enabled: true },
                          { name: 'Microsoft Teams', icon: Webhook, config: 'DevOps Channel', enabled: false },
                          { name: 'Webhook', icon: Globe, config: 'https://hooks.example.com', enabled: false }
                        ].map((channel, idx) => (
                          <div key={idx} className="flex items-center justify-between py-3 px-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${channel.enabled ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                <channel.icon className={`h-4 w-4 ${channel.enabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`} />
                              </div>
                              <div>
                                <p className="font-medium">{channel.name}</p>
                                <p className="text-sm text-gray-500">{channel.config}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Button variant="ghost" size="sm" onClick={() => setShowEditChannelDialog(channel.name)}>
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Switch defaultChecked={channel.enabled} />
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full mt-4" onClick={() => setShowAddChannelDialog(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Notification Channel
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Alert Policies</CardTitle>
                        <CardDescription>Configure alert behavior</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Alert Cooldown</Label>
                            <Select defaultValue="5">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">No cooldown</SelectItem>
                                <SelectItem value="5">5 minutes</SelectItem>
                                <SelectItem value="15">15 minutes</SelectItem>
                                <SelectItem value="30">30 minutes</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Auto-resolve After</Label>
                            <Select defaultValue="30">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="never">Never</SelectItem>
                                <SelectItem value="15">15 minutes</SelectItem>
                                <SelectItem value="30">30 minutes</SelectItem>
                                <SelectItem value="60">1 hour</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Aggregate Similar Alerts</Label>
                            <p className="text-sm text-gray-500">Group related alerts together</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Weekend Quiet Hours</Label>
                            <p className="text-sm text-gray-500">Reduce non-critical alerts on weekends</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Include Context Data</Label>
                            <p className="text-sm text-gray-500">Add metrics and logs to alert notifications</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Escalation Policies</CardTitle>
                        <CardDescription>Configure multi-tier alert escalation</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { tier: 'Tier 1', team: 'On-call Engineer', delay: 'Immediate', channels: ['PagerDuty'] },
                          { tier: 'Tier 2', team: 'Team Lead', delay: '15 min', channels: ['PagerDuty', 'SMS'] },
                          { tier: 'Tier 3', team: 'Engineering Manager', delay: '30 min', channels: ['Phone'] }
                        ].map((policy, idx) => (
                          <div key={idx} className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                              <p className="font-medium">{policy.tier}: {policy.team}</p>
                              <p className="text-sm text-gray-500">
                                After {policy.delay} → {policy.channels.join(', ')}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setShowEditEscalationDialog(policy.tier)}>
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full" onClick={() => setShowAddEscalationDialog(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Escalation Tier
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Dashboard Settings */}
                {settingsTab === 'dashboard' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Auto-refresh</CardTitle>
                        <CardDescription>Configure automatic data refresh</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Enable Auto-refresh</Label>
                            <p className="text-sm text-gray-500">Automatically update dashboard data</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Refresh Interval</Label>
                            <Select defaultValue="30">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="10">10 seconds</SelectItem>
                                <SelectItem value="30">30 seconds</SelectItem>
                                <SelectItem value="60">1 minute</SelectItem>
                                <SelectItem value="300">5 minutes</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Pause After Inactivity</Label>
                            <Select defaultValue="5">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="never">Never</SelectItem>
                                <SelectItem value="5">5 minutes</SelectItem>
                                <SelectItem value="15">15 minutes</SelectItem>
                                <SelectItem value="30">30 minutes</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Show Refresh Indicator</Label>
                            <p className="text-sm text-gray-500">Display when data is refreshing</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Default Views</CardTitle>
                        <CardDescription>Configure default dashboard settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Default Time Range</Label>
                            <Select defaultValue="4h">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1h">Last 1 hour</SelectItem>
                                <SelectItem value="4h">Last 4 hours</SelectItem>
                                <SelectItem value="24h">Last 24 hours</SelectItem>
                                <SelectItem value="7d">Last 7 days</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Default Tab</Label>
                            <Select defaultValue="overview">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="overview">Overview</SelectItem>
                                <SelectItem value="services">Services</SelectItem>
                                <SelectItem value="alerts">Alerts</SelectItem>
                                <SelectItem value="logs">Logs</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Remember Last View</Label>
                            <p className="text-sm text-gray-500">Open to last viewed tab</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Persist Filters</Label>
                            <p className="text-sm text-gray-500">Remember applied filters</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Widget Settings</CardTitle>
                        <CardDescription>Configure dashboard widgets</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Show Trend Indicators</Label>
                            <p className="text-sm text-gray-500">Display up/down arrows on metrics</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Show Sparklines</Label>
                            <p className="text-sm text-gray-500">Mini charts in metric cards</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Color-coded Status</Label>
                            <p className="text-sm text-gray-500">Use colors for health status</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Hover Tooltips</Label>
                            <p className="text-sm text-gray-500">Show details on hover</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Cloud Providers</CardTitle>
                        <CardDescription>Connect to cloud infrastructure</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'AWS CloudWatch', status: 'connected', lastSync: '2 min ago' },
                          { name: 'Google Cloud Monitoring', status: 'connected', lastSync: '5 min ago' },
                          { name: 'Azure Monitor', status: 'not_connected', lastSync: null },
                          { name: 'Datadog', status: 'not_connected', lastSync: null }
                        ].map((provider, idx) => (
                          <div key={idx} className="flex items-center justify-between py-3 px-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${provider.status === 'connected' ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                <Cloud className={`h-4 w-4 ${provider.status === 'connected' ? 'text-emerald-600' : 'text-gray-400'}`} />
                              </div>
                              <div>
                                <p className="font-medium">{provider.name}</p>
                                {provider.lastSync && (
                                  <p className="text-sm text-gray-500">Last sync: {provider.lastSync}</p>
                                )}
                              </div>
                            </div>
                            <Button
                              variant={provider.status === 'connected' ? 'outline' : 'default'}
                              size="sm"
                              onClick={() => setShowConfigureProviderDialog(provider.name)}
                            >
                              {provider.status === 'connected' ? 'Configure' : 'Connect'}
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>API Access</CardTitle>
                        <CardDescription>Manage API keys and access</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <div className="flex items-center gap-2">
                            <Input type="password" value="kazi-prod-xxxxxxxxxxxxxxxxxxxxx" readOnly className="font-mono" />
                            <Button variant="outline" size="sm" onClick={() => {
                              navigator.clipboard.writeText('kazi-prod-xxxxxxxxxxxxxxxxxxxxx')
                              toast.success('API key copied to clipboard')
                            }}>
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setShowRegenerateApiKeyDialog(true)}>
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500">Created: Dec 1, 2024 • Last used: 2 min ago</p>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div>
                            <Label>Enable API</Label>
                            <p className="text-sm text-gray-500">Allow programmatic access</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Rate Limiting</Label>
                            <p className="text-sm text-gray-500">1000 requests/minute</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Webhooks</CardTitle>
                        <CardDescription>Send data to external services</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Metrics Export', url: 'https://metrics.example.com/ingest', events: ['metrics'] },
                          { name: 'Alert Handler', url: 'https://alerts.example.com/webhook', events: ['alerts'] }
                        ].map((webhook, idx) => (
                          <div key={idx} className="flex items-center justify-between py-3 px-4 border rounded-lg">
                            <div>
                              <p className="font-medium">{webhook.name}</p>
                              <p className="text-sm text-gray-500 font-mono">{webhook.url}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => setShowEditWebhookDialog(webhook.name)}>
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600" onClick={() => setShowDeleteWebhookDialog(webhook.name)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full" onClick={() => setShowAddWebhookDialog(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Webhook
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Data Export</CardTitle>
                        <CardDescription>Export dashboard data</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                          <div className="space-y-2">
                            <Label>Export Format</Label>
                            <Select defaultValue="json">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="json">JSON</SelectItem>
                                <SelectItem value="csv">CSV</SelectItem>
                                <SelectItem value="parquet">Parquet</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Time Range</Label>
                            <Select defaultValue="7d">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1d">Last 24 hours</SelectItem>
                                <SelectItem value="7d">Last 7 days</SelectItem>
                                <SelectItem value="30d">Last 30 days</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full" onClick={handleExportDashboard}>
                          <Download className="h-4 w-4 mr-2" />
                          Export Data
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Security</CardTitle>
                        <CardDescription>Security and compliance settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Two-Factor Authentication</Label>
                            <p className="text-sm text-gray-500">Require 2FA for all users</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>IP Allowlist</Label>
                            <p className="text-sm text-gray-500">Restrict access by IP</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Audit Logging</Label>
                            <p className="text-sm text-gray-500">Log all configuration changes</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Data Encryption</Label>
                            <p className="text-sm text-gray-500">Encrypt data at rest</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-red-200 dark:border-red-800">
                      <CardHeader>
                        <CardTitle className="text-red-600 flex items-center gap-2">
                          <AlertOctagon className="h-5 w-5" />
                          Danger Zone
                        </CardTitle>
                        <CardDescription>Irreversible actions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-3 px-4 border border-red-200 dark:border-red-800 rounded-lg">
                          <div>
                            <p className="font-medium">Clear All Metrics</p>
                            <p className="text-sm text-gray-500">Delete all stored metrics data</p>
                          </div>
                          <Button
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={handleClearMetrics}
                          >
                            Clear Metrics
                          </Button>
                        </div>
                        <div className="flex items-center justify-between py-3 px-4 border border-red-200 dark:border-red-800 rounded-lg">
                          <div>
                            <p className="font-medium">Reset All Dashboards</p>
                            <p className="text-sm text-gray-500">Restore default dashboard layouts</p>
                          </div>
                          <Button
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={handleResetDashboards}
                          >
                            Reset Dashboards
                          </Button>
                        </div>
                        <div className="flex items-center justify-between py-3 px-4 border border-red-200 dark:border-red-800 rounded-lg">
                          <div>
                            <p className="font-medium">Delete All Data</p>
                            <p className="text-sm text-gray-500">Permanently delete all monitoring data</p>
                          </div>
                          <Button variant="destructive" onClick={handleDeleteAllData}>
                            Delete All
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

        {/* Alert Detail Dialog */}
        <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Alert Details</DialogTitle>
            </DialogHeader>
            {selectedAlert && (
              <div className="space-y-4 p-4">
                <div className={`p-4 rounded-xl ${getSeverityColor(selectedAlert.severity)}`}>
                  <div className="flex items-center gap-3 mb-2">
                    {selectedAlert.severity === 'critical' ? <XCircle className="w-6 h-6" /> :
                     selectedAlert.severity === 'warning' ? <AlertTriangle className="w-6 h-6" /> :
                     <AlertCircle className="w-6 h-6" />}
                    <h3 className="text-lg font-bold">{selectedAlert.title}</h3>
                  </div>
                  <p>{selectedAlert.message}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs text-gray-500">Service</p>
                    <p className="font-semibold">{selectedAlert.service}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs text-gray-500">Metric</p>
                    <p className="font-semibold">{selectedAlert.metric}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs text-gray-500">Threshold</p>
                    <p className="font-semibold">{selectedAlert.threshold}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs text-gray-500">Current Value</p>
                    <p className="font-semibold">{selectedAlert.current_value}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => {
                    handleAcknowledgeAlert(selectedAlert.title)
                    setSelectedAlert(null)
                  }}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Acknowledge
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => {
                    if (selectedAlert.runbook_url) {
                      window.open(selectedAlert.runbook_url, '_blank')
                    } else {
                      toast.info('No runbook available')
                    }
                  }}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Runbook
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Service Detail Dialog */}
        <Dialog open={!!selectedService} onOpenChange={() => setSelectedService(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Service Details</DialogTitle>
            </DialogHeader>
            {selectedService && (
              <ScrollArea className="max-h-[70vh]">
                <div className="space-y-6 p-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${getStatusColor(selectedService.status)}`}>
                      <Server className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedService.display_name}</h3>
                      <p className="text-gray-500">{selectedService.region} · {selectedService.environment} · v{selectedService.version}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">Uptime</p>
                      <p className="text-2xl font-bold">{selectedService.uptime_percent}%</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">Error Rate</p>
                      <p className="text-2xl font-bold">{selectedService.error_rate}%</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">Throughput</p>
                      <p className="text-2xl font-bold">{selectedService.throughput.toLocaleString()}/min</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Latency Distribution</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                        <p className="text-xs text-gray-500">P50</p>
                        <p className="font-semibold">{selectedService.response_time_p50}ms</p>
                      </div>
                      <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                        <p className="text-xs text-gray-500">P95</p>
                        <p className="font-semibold">{selectedService.response_time_p95}ms</p>
                      </div>
                      <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                        <p className="text-xs text-gray-500">P99</p>
                        <p className="font-semibold">{selectedService.response_time_p99}ms</p>
                      </div>
                    </div>
                  </div>

                  {selectedService.health_checks.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Health Checks</p>
                      <div className="space-y-2">
                        {selectedService.health_checks.map(check => (
                          <div key={check.id} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${
                                check.status === 'passing' ? 'bg-green-500' :
                                check.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                              }`} />
                              <div>
                                <p className="font-medium">{check.name}</p>
                                <p className="text-xs text-gray-500">{check.details}</p>
                              </div>
                            </div>
                            <Badge className={check.status === 'passing' ? 'bg-green-100 text-green-800' : check.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                              {check.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>

        {/* Log Detail Dialog */}
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Log Entry</DialogTitle>
            </DialogHeader>
            {selectedLog && (
              <div className="space-y-4 p-4 font-mono text-sm">
                <div className="flex items-center gap-2">
                  <Badge className={getLogLevelColor(selectedLog.level)}>{selectedLog.level.toUpperCase()}</Badge>
                  <span className="text-gray-500">{formatDate(selectedLog.timestamp)}</span>
                </div>

                <div className="p-4 rounded-xl bg-gray-900 text-gray-100">
                  <p>{selectedLog.message}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs text-gray-500">Service</p>
                    <p className="font-semibold">{selectedLog.service}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs text-gray-500">Host</p>
                    <p className="font-semibold">{selectedLog.host}</p>
                  </div>
                </div>

                {selectedLog.trace_id && (
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <p className="text-xs text-gray-500">Trace ID</p>
                    <code className="text-sm">{selectedLog.trace_id}</code>
                  </div>
                )}

                {Object.keys(selectedLog.attributes).length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Attributes</p>
                    <div className="p-3 rounded-xl bg-gray-900 text-gray-100">
                      <pre className="text-xs">{JSON.stringify(selectedLog.attributes, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* AI-Powered Infrastructure Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          
          <PredictiveAnalytics predictions={overviewPredictions} />
        </div>

        {/* Activity Feed */}
        <div className="mt-6">
          
        </div>

        {/* Quick Actions Toolbar */}
        <QuickActionsToolbar actions={quickActions} />

        {/* Create Alert Dialog */}
        <Dialog open={showCreateAlertDialog} onOpenChange={setShowCreateAlertDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-600" />
                Create Alert
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Alert Name</Label>
                <Input placeholder="e.g., High CPU Usage Alert" />
              </div>
              <div className="space-y-2">
                <Label>Metric</Label>
                <Select defaultValue="cpu">
                  <SelectTrigger>
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cpu">CPU Usage</SelectItem>
                    <SelectItem value="memory">Memory Usage</SelectItem>
                    <SelectItem value="disk">Disk Usage</SelectItem>
                    <SelectItem value="latency">API Latency</SelectItem>
                    <SelectItem value="error_rate">Error Rate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Threshold (%)</Label>
                <Input type="number" placeholder="80" defaultValue="80" />
              </div>
              <div className="space-y-2">
                <Label>Severity</Label>
                <Select defaultValue="warning">
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowCreateAlertDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => {
                  toast.success('Alert created successfully')
                  setShowCreateAlertDialog(false)
                }}>
                  Create Alert
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Logs Dialog */}
        <Dialog open={showViewLogsDialog} onOpenChange={setShowViewLogsDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                Application Logs
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input placeholder="Search logs..." className="pl-10 font-mono" />
                </div>
                <Select defaultValue="24h">
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">Last 1h</SelectItem>
                    <SelectItem value="6h">Last 6h</SelectItem>
                    <SelectItem value="24h">Last 24h</SelectItem>
                    <SelectItem value="7d">Last 7d</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ScrollArea className="h-[400px] border rounded-lg">
                <div className="font-mono text-sm">
                  {logs.map(log => (
                    <div key={log.id} className="flex items-start gap-4 p-3 border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <span className="text-xs text-gray-500 whitespace-nowrap">{formatDate(log.timestamp)}</span>
                      <Badge className={getLogLevelColor(log.level)}>{log.level.toUpperCase()}</Badge>
                      <span className="text-blue-600 dark:text-blue-400 whitespace-nowrap">{log.service}</span>
                      <span className="text-gray-600 dark:text-gray-400 flex-1 truncate">{log.message}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowViewLogsDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Health Check Dialog */}
        <Dialog open={showHealthCheckDialog} onOpenChange={setShowHealthCheckDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600" />
                System Health Check
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-800 dark:text-green-200">All Systems Operational</p>
                    <p className="text-sm text-green-600 dark:text-green-400">Last checked: Just now</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {services.map(service => (
                  <div key={service.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        service.status === 'operational' ? 'bg-green-500' :
                        service.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <span className="font-medium">{service.display_name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Uptime: {service.uptime_percent}%</span>
                      <span>Latency: {service.response_time_p95}ms</span>
                      <Badge className={getStatusColor(service.status)}>{service.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => {
                  toast.success('Running full health check...')
                }}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Run Full Check
                </Button>
                <Button variant="outline" onClick={() => setShowHealthCheckDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Deploy Dialog */}
        <Dialog open={showDeployDialog} onOpenChange={setShowDeployDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-600" />
                Deploy Application
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Service</Label>
                <Select defaultValue="api-gateway">
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="api-gateway">API Gateway</SelectItem>
                    <SelectItem value="auth-service">Auth Service</SelectItem>
                    <SelectItem value="worker-nodes">Worker Nodes</SelectItem>
                    <SelectItem value="frontend">Frontend</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Environment</Label>
                <Select defaultValue="production">
                  <SelectTrigger>
                    <SelectValue placeholder="Select environment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Version/Branch</Label>
                <Input placeholder="main" defaultValue="main" />
              </div>
              <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <AlertTriangle className="w-4 h-4 inline mr-1" />
                  Production deployments require approval from team lead.
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowDeployDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-orange-600 hover:bg-orange-700" onClick={() => {
                  toast.success('Deployment pipeline started. View progress in CI/CD')
                  setShowDeployDialog(false)
                }}>
                  <Play className="w-4 h-4 mr-2" />
                  Start Deploy
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Filter Alerts Dialog */}
        <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-indigo-600" />
                Filter Alerts
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Severity</Label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="triggered">Triggered</SelectItem>
                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Service</Label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    <SelectItem value="api-gateway">API Gateway</SelectItem>
                    <SelectItem value="auth-service">Auth Service</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                    <SelectItem value="worker-nodes">Worker Nodes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Time Range</Label>
                <Select defaultValue="24h">
                  <SelectTrigger>
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">Last 1 hour</SelectItem>
                    <SelectItem value="6h">Last 6 hours</SelectItem>
                    <SelectItem value="24h">Last 24 hours</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowFilterDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => {
                  toast.success('Filters applied')
                  setShowFilterDialog(false)
                }}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Alert Actions Dialog */}
        <Dialog open={!!showAlertActionsDialog} onOpenChange={() => setShowAlertActionsDialog(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Alert Actions</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 py-4">
              <Button variant="outline" className="w-full justify-start" onClick={() => {
                toast.success('Alert acknowledged')
                setShowAlertActionsDialog(null)
              }}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Acknowledge Alert
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => {
                toast.success('Alert muted for 1 hour')
                setShowAlertActionsDialog(null)
              }}>
                <Bell className="w-4 h-4 mr-2" />
                Mute for 1 Hour
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => {
                toast.success('Alert resolved')
                setShowAlertActionsDialog(null)
              }}>
                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                Mark as Resolved
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-600" onClick={() => {
                toast.success('Alert deleted')
                setShowAlertActionsDialog(null)
              }}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Alert
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Export Logs Dialog */}
        <Dialog open={showExportLogsDialog} onOpenChange={setShowExportLogsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-indigo-600" />
                Export Logs
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Export Format</Label>
                <Select defaultValue="json">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="txt">Plain Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Time Range</Label>
                <Select defaultValue="24h">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">Last 1 hour</SelectItem>
                    <SelectItem value="6h">Last 6 hours</SelectItem>
                    <SelectItem value="24h">Last 24 hours</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Log Level</Label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="error">Error Only</SelectItem>
                    <SelectItem value="warn">Warning & Above</SelectItem>
                    <SelectItem value="info">Info & Above</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowExportLogsDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => {
                  const exportData = {
                    logs: logs,
                    exportedAt: new Date().toISOString()
                  }
                  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `logs-export-${new Date().toISOString().split('T')[0]}.json`
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  URL.revokeObjectURL(url)
                  toast.success('Logs exported successfully')
                  setShowExportLogsDialog(false)
                }}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Live Tail Dialog */}
        <Dialog open={showLiveTailDialog} onOpenChange={setShowLiveTailDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-green-600" />
                Live Log Tail
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                  Live
                </Badge>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    <SelectItem value="api-gateway">API Gateway</SelectItem>
                    <SelectItem value="auth-service">Auth Service</SelectItem>
                    <SelectItem value="worker-nodes">Worker Nodes</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="warn">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ScrollArea className="h-[350px] border rounded-lg bg-gray-900 p-4">
                <div className="font-mono text-sm text-gray-100 space-y-2">
                  {logs.map(log => (
                    <div key={log.id} className="flex items-start gap-3">
                      <span className="text-xs text-gray-500">{formatDate(log.timestamp)}</span>
                      <Badge className={getLogLevelColor(log.level)}>{log.level.toUpperCase()}</Badge>
                      <span className="text-blue-400">{log.service}</span>
                      <span className="text-gray-300">{log.message}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => {
                  toast.loading('Pausing stream...', { id: 'stream-pause' })
                  setTimeout(() => {
                    toast.success('Log stream paused', { id: 'stream-pause' })
                  }, 500)
                }}>
                  Pause Stream
                </Button>
                <Button variant="outline" onClick={() => setShowLiveTailDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Notification Channel Dialog */}
        <Dialog open={!!showEditChannelDialog} onOpenChange={() => setShowEditChannelDialog(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-600" />
                Edit Notification Channel
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Channel Name</Label>
                <Input defaultValue={showEditChannelDialog || ''} />
              </div>
              <div className="space-y-2">
                <Label>Configuration</Label>
                <Input placeholder="e.g., team@company.com or #channel-name" />
              </div>
              <div className="space-y-2">
                <Label>Alert Types</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked />
                    <Label className="text-sm">Critical Alerts</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked />
                    <Label className="text-sm">Warning Alerts</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch />
                    <Label className="text-sm">Info Alerts</Label>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowEditChannelDialog(null)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => {
                  toast.success('Notification channel updated')
                  setShowEditChannelDialog(null)
                }}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Notification Channel Dialog */}
        <Dialog open={showAddChannelDialog} onOpenChange={setShowAddChannelDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                Add Notification Channel
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Channel Type</Label>
                <Select defaultValue="email">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="slack">Slack</SelectItem>
                    <SelectItem value="pagerduty">PagerDuty</SelectItem>
                    <SelectItem value="teams">Microsoft Teams</SelectItem>
                    <SelectItem value="webhook">Webhook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Channel Name</Label>
                <Input placeholder="e.g., Primary Email" />
              </div>
              <div className="space-y-2">
                <Label>Configuration</Label>
                <Input placeholder="e.g., team@company.com" />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddChannelDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => {
                  toast.success('Notification channel added')
                  setShowAddChannelDialog(false)
                }}>
                  Add Channel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Escalation Policy Dialog */}
        <Dialog open={!!showEditEscalationDialog} onOpenChange={() => setShowEditEscalationDialog(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-600" />
                Edit Escalation Policy
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Tier Name</Label>
                <Input defaultValue={showEditEscalationDialog || ''} />
              </div>
              <div className="space-y-2">
                <Label>Team/Person</Label>
                <Input placeholder="e.g., On-call Engineer" />
              </div>
              <div className="space-y-2">
                <Label>Delay Before Escalation</Label>
                <Select defaultValue="15">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Immediate</SelectItem>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notification Channels</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked />
                    <Label className="text-sm">PagerDuty</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch />
                    <Label className="text-sm">SMS</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch />
                    <Label className="text-sm">Phone Call</Label>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowEditEscalationDialog(null)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => {
                  toast.success('Escalation policy updated')
                  setShowEditEscalationDialog(null)
                }}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Escalation Tier Dialog */}
        <Dialog open={showAddEscalationDialog} onOpenChange={setShowAddEscalationDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                Add Escalation Tier
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Tier Number</Label>
                <Select defaultValue="4">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">Tier 4</SelectItem>
                    <SelectItem value="5">Tier 5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Team/Person</Label>
                <Input placeholder="e.g., VP of Engineering" />
              </div>
              <div className="space-y-2">
                <Label>Delay Before Escalation</Label>
                <Select defaultValue="60">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddEscalationDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => {
                  toast.success('Escalation tier added')
                  setShowAddEscalationDialog(false)
                }}>
                  Add Tier
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Configure Cloud Provider Dialog */}
        <Dialog open={!!showConfigureProviderDialog} onOpenChange={() => setShowConfigureProviderDialog(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-indigo-600" />
                {showConfigureProviderDialog?.includes('not_connected') ? 'Connect' : 'Configure'} {showConfigureProviderDialog}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>API Key / Access Key</Label>
                <Input type="password" placeholder="Enter your API key" />
              </div>
              <div className="space-y-2">
                <Label>Secret Key</Label>
                <Input type="password" placeholder="Enter your secret key" />
              </div>
              <div className="space-y-2">
                <Label>Region</Label>
                <Select defaultValue="us-east-1">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                    <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                    <SelectItem value="eu-west-1">EU (Ireland)</SelectItem>
                    <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div>
                  <Label>Auto-sync Metrics</Label>
                  <p className="text-sm text-gray-500">Automatically import metrics</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowConfigureProviderDialog(null)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => {
                  toast.success(`${showConfigureProviderDialog} configured successfully`)
                  setShowConfigureProviderDialog(null)
                }}>
                  Save Configuration
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Regenerate API Key Dialog */}
        <Dialog open={showRegenerateApiKeyDialog} onOpenChange={setShowRegenerateApiKeyDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-orange-600" />
                Regenerate API Key
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  <AlertTriangle className="w-4 h-4 inline mr-1" />
                  Warning: Regenerating your API key will invalidate the current key. Any integrations using the old key will stop working immediately.
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowRegenerateApiKeyDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-orange-600 hover:bg-orange-700" onClick={() => {
                  toast.success('API key regenerated')
                  setShowRegenerateApiKeyDialog(false)
                }}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate Key
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Webhook Dialog */}
        <Dialog open={!!showEditWebhookDialog} onOpenChange={() => setShowEditWebhookDialog(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-600" />
                Edit Webhook
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Webhook Name</Label>
                <Input defaultValue={showEditWebhookDialog || ''} />
              </div>
              <div className="space-y-2">
                <Label>URL</Label>
                <Input placeholder="https://example.com/webhook" />
              </div>
              <div className="space-y-2">
                <Label>Events</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked />
                    <Label className="text-sm">Metrics</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked />
                    <Label className="text-sm">Alerts</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch />
                    <Label className="text-sm">Logs</Label>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowEditWebhookDialog(null)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => {
                  toast.success('Webhook updated')
                  setShowEditWebhookDialog(null)
                }}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Webhook Dialog */}
        <Dialog open={!!showDeleteWebhookDialog} onOpenChange={() => setShowDeleteWebhookDialog(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="w-5 h-5" />
                Delete Webhook
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to delete the webhook <span className="font-semibold">"{showDeleteWebhookDialog}"</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowDeleteWebhookDialog(null)}>
                  Cancel
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => {
                  toast.success('Webhook deleted')
                  setShowDeleteWebhookDialog(null)
                }}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Webhook
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Webhook Dialog */}
        <Dialog open={showAddWebhookDialog} onOpenChange={setShowAddWebhookDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                Add Webhook
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Webhook Name</Label>
                <Input placeholder="e.g., Metrics Export" />
              </div>
              <div className="space-y-2">
                <Label>URL</Label>
                <Input placeholder="https://example.com/webhook" />
              </div>
              <div className="space-y-2">
                <Label>Events to Send</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked />
                    <Label className="text-sm">Metrics</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch />
                    <Label className="text-sm">Alerts</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch />
                    <Label className="text-sm">Logs</Label>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddWebhookDialog(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => {
                  toast.success('Webhook added')
                  setShowAddWebhookDialog(false)
                }}>
                  Add Webhook
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
