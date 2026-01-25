'use client'

import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { useServers, useSystemAlerts, useServerMutations, useAlertMutations } from '@/lib/hooks/use-monitoring'
import type { Server as DbServer, SystemAlert as DbAlert } from '@/lib/hooks/use-monitoring'
import { useSystemLogs } from '@/lib/hooks/use-system-logs'
import type { SystemLog } from '@/lib/hooks/use-system-logs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Activity,
  Server,
  Cpu,
  HardDrive,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  BarChart3,
  Search,
  Filter,
  RefreshCw,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  Bell,
  Layers,
  Container,
  Terminal,
  FileText,
  AlertCircle,
  XCircle,
  Gauge,
  Users,
  MapPin,
  MemoryStick,
  Webhook,
  AlertOctagon,
  Sliders,
  Mail,
  Copy,
  Loader2
} from 'lucide-react'

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




// ============================================================================
// TYPE DEFINITIONS - Datadog Level Infrastructure Monitoring
// ============================================================================

type HostStatus = 'healthy' | 'warning' | 'critical' | 'unknown' | 'offline'
type AlertSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical'
type AlertStatus = 'triggered' | 'acknowledged' | 'resolved' | 'muted'
type ServiceStatus = 'operational' | 'degraded' | 'partial_outage' | 'major_outage'
type MetricType = 'gauge' | 'counter' | 'histogram' | 'rate'
type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

interface Host {
  id: string
  name: string
  hostname: string
  ip_address: string
  os: string
  status: HostStatus
  cpu_usage: number
  memory_usage: number
  disk_usage: number
  network_in: number
  network_out: number
  load_avg: number
  uptime_seconds: number
  processes: number
  containers: number
  region: string
  availability_zone: string
  instance_type: string
  tags: string[]
  last_seen_at: string
  agent_version: string
}

interface Service {
  id: string
  name: string
  status: ServiceStatus
  type: 'web' | 'api' | 'database' | 'cache' | 'queue' | 'worker'
  hosts_count: number
  requests_per_sec: number
  error_rate: number
  latency_p50: number
  latency_p95: number
  latency_p99: number
  apdex_score: number
  dependencies: string[]
  last_deploy_at: string
  version: string
}

interface Alert {
  id: string
  title: string
  message: string
  severity: AlertSeverity
  status: AlertStatus
  source: string
  host_id: string | null
  host_name: string | null
  service_name: string | null
  metric_name: string
  threshold: number
  current_value: number
  triggered_at: string
  acknowledged_at: string | null
  acknowledged_by: string | null
  resolved_at: string | null
  escalation_level: number
  notification_sent: boolean
}

interface LogEntry {
  id: string
  timestamp: string
  level: LogLevel
  service: string
  host: string
  message: string
  trace_id: string | null
  span_id: string | null
  attributes: Record<string, unknown>
}

interface Metric {
  id: string
  name: string
  display_name: string
  type: MetricType
  unit: string
  current_value: number
  previous_value: number
  change_percent: number
  tags: string[]
}

interface Dashboard {
  id: string
  name: string
  description: string
  widgets_count: number
  created_by: string
  is_shared: boolean
  last_modified_at: string
}

interface SLO {
  id: string
  name: string
  target: number
  current: number
  status: 'met' | 'at_risk' | 'breached'
  time_window: '7d' | '30d' | '90d'
  service: string
  metric_type: string
}

// ============================================================================
// EMPTY DATA ARRAYS (No mock data - use real database data)
// ============================================================================

const mockServices: Service[] = []

const mockLogs: LogEntry[] = []

const mockSLOs: SLO[] = []

const mockDashboards: Dashboard[] = []

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getHostStatusColor = (status: HostStatus): string => {
  switch (status) {
    case 'healthy': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    case 'unknown': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    case 'offline': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

const getServiceStatusColor = (status: ServiceStatus): string => {
  switch (status) {
    case 'operational': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'degraded': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'partial_outage': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
    case 'major_outage': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

const getAlertSeverityColor = (severity: AlertSeverity): string => {
  switch (severity) {
    case 'info': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case 'low': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400'
    case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
    case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

const getAlertStatusColor = (status: AlertStatus): string => {
  switch (status) {
    case 'triggered': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    case 'acknowledged': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'muted': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

const getLogLevelColor = (level: LogLevel): string => {
  switch (level) {
    case 'debug': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    case 'info': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case 'warn': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'error': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
    case 'fatal': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

const getSLOStatusColor = (status: string): string => {
  switch (status) {
    case 'met': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'at_risk': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'breached': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  return `${days}d ${hours}h`
}

const getMetricColor = (value: number, threshold: number): string => {
  if (value >= threshold) return 'text-red-600'
  if (value >= threshold * 0.8) return 'text-yellow-600'
  return 'text-green-600'
}

// Empty arrays for competitive upgrade components (no mock data)
const mockMonitoringAIInsights: { id: string; type: 'success' | 'info' | 'warning' | 'error'; title: string; description: string; priority: 'low' | 'medium' | 'high'; timestamp: string; category: string }[] = []

const mockMonitoringCollaborators: { id: string; name: string; avatar: string; status: 'online' | 'away' | 'offline'; role: string; lastActive: string }[] = []

const mockMonitoringPredictions: { id: string; label: string; current: number; target: number; predicted: number; confidence: number; trend: 'up' | 'down' | 'stable' }[] = []

const mockMonitoringActivities: { id: string; user: string; action: string; target: string; timestamp: string; type: 'success' | 'info' | 'warning' | 'error' }[] = []

// Quick actions are defined inside the component to access state setters

// ============================================================================
// MAIN COMPONENT
// ============================================================================

// Form state types
interface ServerFormData {
  server_name: string
  server_type: string
  location: string
  ip_address: string
  tags: string
}

interface AlertFormData {
  title: string
  alert_type: string
  severity: string
  description: string
  server_id: string
}

const initialServerForm: ServerFormData = {
  server_name: '',
  server_type: 'production',
  location: '',
  ip_address: '',
  tags: ''
}

const initialAlertForm: AlertFormData = {
  title: '',
  alert_type: 'cpu_high',
  severity: 'warning',
  description: '',
  server_id: ''
}

export default function MonitoringClient() {

  const [activeTab, setActiveTab] = useState('infrastructure')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedHost, setSelectedHost] = useState<Host | null>(null)
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [settingsTab, setSettingsTab] = useState('general')

  // Supabase hooks for servers and alerts
  const { servers: dbServers, stats: serverStats, data: allServers, isLoading: serversLoading, error: serversError, refetch: refetchServers } = useServers(undefined, {
    status: statusFilter !== 'all' ? statusFilter : undefined
  })
  const { alerts: dbAlerts, isLoading: alertsLoading, error: alertsError, refetch: refetchAlerts } = useSystemAlerts()
  const { data: systemLogs, isLoading: logsLoading, error: logsError, refetch: refetchLogs } = useSystemLogs()
  const { createServer, deleteServer, isCreating, isDeleting } = useServerMutations()
  const { acknowledgeAlert, resolveAlert, isAcknowledging, isResolving } = useAlertMutations()

  const isLoading = serversLoading || alertsLoading || logsLoading

  // Dialog state
  const [showAddServerDialog, setShowAddServerDialog] = useState(false)
  const [showAddAlertDialog, setShowAddAlertDialog] = useState(false)
  const [showDashboardsDialog, setShowDashboardsDialog] = useState(false)
  const [showAlertsConfigDialog, setShowAlertsConfigDialog] = useState(false)
  const [showMetricsExplorerDialog, setShowMetricsExplorerDialog] = useState(false)
  const [serverForm, setServerForm] = useState<ServerFormData>(initialServerForm)
  const [alertForm, setAlertForm] = useState<AlertFormData>(initialAlertForm)

  // Create server via hook
  const handleCreateServer = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      createServer({
        user_id: user.id,
        server_name: serverForm.server_name,
        server_type: serverForm.server_type,
        location: serverForm.location || null,
        ip_address: serverForm.ip_address || null,
        tags: serverForm.tags ? serverForm.tags.split(',').map(t => t.trim()) : [],
        status: 'healthy',
        cpu_usage: 0,
        memory_usage: 0,
        disk_usage: 0
      } as Partial<DbServer>)

      toast.success('Server added', { description: `${serverForm.server_name} has been registered` })
      setShowAddServerDialog(false)
      setServerForm(initialServerForm)
    } catch (error) {
      toast.error('Failed to add server', { description: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  // Delete server via hook
  const handleDeleteServer = async (serverId: string) => {
    try {
      deleteServer(serverId)
      toast.success('Server removed', { description: 'Server has been unregistered' })
    } catch (error) {
      toast.error('Failed to remove server', { description: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  // Create alert
  const handleCreateAlert = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('system_alerts').insert({
        user_id: user.id,
        title: alertForm.title,
        alert_type: alertForm.alert_type,
        severity: alertForm.severity,
        description: alertForm.description || null,
        server_id: alertForm.server_id || null,
        status: 'active'
      })

      if (error) throw error

      toast.success('Alert created', { description: alertForm.title })
      setShowAddAlertDialog(false)
      setAlertForm(initialAlertForm)
      refetchAlerts()
    } catch (error) {
      toast.error('Failed to create alert', { description: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  // Acknowledge alert via hook
  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      acknowledgeAlert(alertId, user?.id || '')
      toast.success('Alert acknowledged')
    } catch (error) {
      toast.error('Failed to acknowledge alert', { description: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  // Resolve alert via hook
  const handleResolveAlert = async (alertId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      resolveAlert(alertId, user?.id || '')
      toast.success('Alert resolved')
    } catch (error) {
      toast.error('Failed to resolve alert', { description: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  // Refresh metrics via hooks
  const handleRefreshMetrics = async () => {
    try {
      await Promise.all([refetchServers(), refetchAlerts(), refetchLogs()])
      toast.success('Metrics refreshed', { description: 'Infrastructure data updated' })
    } catch (error) {
      toast.error('Failed to refresh', { description: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  // Filtered servers for infrastructure tab (search filtering on top of hook's status filter)
  const filteredServers = useMemo(() => {
    if (!dbServers) return []
    return dbServers.filter(server => {
      const matchesSearch =
        server.server_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (server.ip_address || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (server.location || '').toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [dbServers, searchQuery])

  // Stats calculations from hook data
  const stats = useMemo(() => {
    const total = serverStats?.total || 0
    const healthy = serverStats?.healthy || 0
    const warning = serverStats?.warning || 0
    const critical = serverStats?.critical || 0
    const avgCpu = serverStats?.avgCpu || 0
    const avgMemory = serverStats?.avgMemory || 0
    const totalContainers = 0
    const activeAlerts = dbAlerts ? dbAlerts.filter((a: DbAlert) => a.status === 'active' || a.status === 'triggered').length : 0

    return { total, healthy, warning, critical, avgCpu, avgMemory, totalContainers, activeAlerts }
  }, [serverStats, dbAlerts])

  // Quick actions with proper dialog openers
  const monitoringQuickActions = [
    { id: '1', label: 'Add Host', icon: 'Server', shortcut: 'H', action: () => setShowAddServerDialog(true) },
    { id: '2', label: 'Dashboards', icon: 'LayoutDashboard', shortcut: 'D', action: () => setShowDashboardsDialog(true) },
    { id: '3', label: 'Alerts', icon: 'Bell', shortcut: 'A', action: () => setShowAlertsConfigDialog(true) },
    { id: '4', label: 'Metrics', icon: 'Activity', shortcut: 'M', action: () => setShowMetricsExplorerDialog(true) },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50/30 to-zinc-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Infrastructure Monitoring</h1>
              <p className="text-gray-500 dark:text-gray-400">Datadog level observability platform</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleRefreshMetrics} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              className="bg-gradient-to-r from-slate-500 to-gray-600 text-white"
              onClick={() => setShowAddServerDialog(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Host
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
            <CardContent className="p-4 flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-200">Loading monitoring data...</p>
                <p className="text-sm text-blue-700 dark:text-blue-400">Fetching servers, alerts, and logs from database</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {(serversError || alertsError || logsError) && (
          <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-900 dark:text-red-200">Error loading data</p>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {serversError?.message || alertsError?.message || logsError?.message || 'Failed to load monitoring data'}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleRefreshMetrics}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { label: 'Total Hosts', value: stats.total.toString(), icon: Server, color: 'from-slate-500 to-gray-500', change: 0 },
            { label: 'Healthy', value: stats.healthy.toString(), icon: CheckCircle, color: 'from-green-500 to-emerald-500', change: 5.2 },
            { label: 'Warning', value: stats.warning.toString(), icon: AlertTriangle, color: 'from-yellow-500 to-orange-500', change: -2.1 },
            { label: 'Critical', value: stats.critical.toString(), icon: XCircle, color: 'from-red-500 to-rose-500', change: 0 },
            { label: 'Avg CPU', value: `${stats.avgCpu}%`, icon: Cpu, color: 'from-blue-500 to-cyan-500', change: 3.4 },
            { label: 'Avg Memory', value: `${stats.avgMemory}%`, icon: MemoryStick, color: 'from-purple-500 to-violet-500', change: 8.7 },
            { label: 'Containers', value: stats.totalContainers.toString(), icon: Container, color: 'from-teal-500 to-cyan-500', change: 12.3 },
            { label: 'Active Alerts', value: stats.activeAlerts.toString(), icon: Bell, color: 'from-orange-500 to-red-500', change: 0 }
          ].map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  {stat.change !== 0 && (
                    <span className={`text-xs font-medium flex items-center ${stat.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
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
            <TabsTrigger value="infrastructure" className="flex items-center gap-2">
              <Server className="w-4 h-4" />
              Infrastructure
            </TabsTrigger>
            <TabsTrigger value="apm" className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              APM
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Logs
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Alerts
              {stats.activeAlerts > 0 && (
                <Badge className="ml-1 bg-red-500 text-white">{stats.activeAlerts}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="dashboards" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboards
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Infrastructure Tab */}
          <TabsContent value="infrastructure" className="mt-6">
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle>Host List ({filteredServers.length} servers)</CardTitle>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search hosts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      {(['all', 'healthy', 'warning', 'critical'] as const).map(status => (
                        <Button
                          key={status}
                          variant={statusFilter === status ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setStatusFilter(status)}
                          className={statusFilter === status ? 'bg-slate-600' : ''}
                        >
                          {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredServers.map(server => (
                    <div
                      key={server.id}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          server.status === 'healthy' ? 'bg-green-100 text-green-600' :
                          server.status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                          server.status === 'critical' ? 'bg-red-100 text-red-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          <Server className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {server.server_name}
                            </span>
                            <Badge className={getHostStatusColor(server.status as HostStatus)}>
                              {server.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {server.server_type}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {server.ip_address || 'No IP'} {server.location ? `• ${server.location}` : ''}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                            {server.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {server.location}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Uptime: {server.uptime_percentage}%
                            </span>
                            <span className="flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              {server.requests_per_hour} req/h
                            </span>
                          </div>
                          {server.tags && server.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {server.tags.map((tag: string) => (
                                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 text-center">
                          <div>
                            <p className={`text-lg font-bold ${getMetricColor(Number(server.cpu_usage), 80)}`}>
                              {Number(server.cpu_usage).toFixed(1)}%
                            </p>
                            <p className="text-xs text-gray-500">CPU</p>
                          </div>
                          <div>
                            <p className={`text-lg font-bold ${getMetricColor(Number(server.memory_usage), 80)}`}>
                              {Number(server.memory_usage).toFixed(1)}%
                            </p>
                            <p className="text-xs text-gray-500">Memory</p>
                          </div>
                          <div>
                            <p className={`text-lg font-bold ${getMetricColor(Number(server.disk_usage), 80)}`}>
                              {Number(server.disk_usage).toFixed(1)}%
                            </p>
                            <p className="text-xs text-gray-500">Disk</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteServer(server.id)
                          }}
                          disabled={isDeleting}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {filteredServers.length === 0 && !isLoading && (
                    <div className="p-8 text-center text-gray-500">
                      <Server className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No servers found. Click &quot;Add Host&quot; to register your first server.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* APM Tab */}
          <TabsContent value="apm" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {mockServices.map(service => (
                <Card key={service.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <Badge className={getServiceStatusColor(service.status)}>
                        {service.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <CardDescription>{service.type} • v{service.version}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-4">
                      <div className="text-center">
                        <p className="text-lg font-bold">{service.requests_per_sec}</p>
                        <p className="text-xs text-gray-500">req/s</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-lg font-bold ${service.error_rate > 1 ? 'text-red-600' : 'text-green-600'}`}>
                          {service.error_rate}%
                        </p>
                        <p className="text-xs text-gray-500">Errors</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold">{service.latency_p50}ms</p>
                        <p className="text-xs text-gray-500">P50</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Apdex</span>
                        <span className={`font-semibold ${service.apdex_score >= 0.9 ? 'text-green-600' : 'text-yellow-600'}`}>
                          {service.apdex_score.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Hosts</span>
                        <span className="font-semibold">{service.hosts_count}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>SLO Status</CardTitle>
                <CardDescription>Service Level Objectives tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockSLOs.map(slo => (
                    <div key={slo.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{slo.name}</span>
                          <Badge className={getSLOStatusColor(slo.status)}>{slo.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-500">{slo.service} • {slo.time_window}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {slo.current}
                          <span className="text-sm text-gray-500 ml-1">/ {slo.target}</span>
                        </p>
                        <Progress value={(slo.current / slo.target) * 100} className="w-24 h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="mt-6">
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle>Log Stream ({systemLogs?.length || 0} entries)</CardTitle>
                  <div className="flex items-center gap-3">
                    <Input placeholder="Search logs..." className="w-64" />
                    <Button variant="outline" size="sm" onClick={() => refetchLogs()}>
                      <RefreshCw className={`w-4 h-4 mr-2 ${logsLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {logsLoading && (
                  <div className="p-8 text-center">
                    <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-gray-400" />
                    <p className="text-gray-500">Loading logs...</p>
                  </div>
                )}
                <div className="divide-y font-mono text-sm">
                  {(systemLogs || []).map((log: SystemLog) => (
                    <div key={log.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <div className="flex items-start gap-3">
                        <span className="text-gray-400 text-xs">
                          {new Date(log.logged_at).toLocaleTimeString()}
                        </span>
                        <Badge className={getLogLevelColor(log.log_level as LogLevel)}>
                          {log.log_level.toUpperCase()}
                        </Badge>
                        <span className="text-blue-600">[{log.log_source}]</span>
                        <span className="text-purple-600">{log.server_hostname || 'system'}</span>
                        <span className="flex-1 text-gray-700 dark:text-gray-300">
                          {log.message}
                        </span>
                      </div>
                      {log.request_id && (
                        <div className="mt-1 ml-20 text-xs text-gray-400">
                          request_id: {log.request_id}
                        </div>
                      )}
                    </div>
                  ))}
                  {!logsLoading && (!systemLogs || systemLogs.length === 0) && (
                    <div className="p-8 text-center text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No logs found. System logs will appear here when generated.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="mt-6">
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle>Active Alerts ({dbAlerts.filter(a => a.status === 'active').length} active)</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setShowAddAlertDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Alert
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {/* Database Alerts */}
                  {dbAlerts.map(alert => (
                    <div
                      key={alert.id}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          alert.severity === 'critical' ? 'bg-red-100 text-red-600' :
                          alert.severity === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{alert.title}</span>
                            <Badge className={
                              alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                              alert.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }>{alert.severity}</Badge>
                            <Badge className={
                              alert.status === 'active' ? 'bg-red-100 text-red-800' :
                              alert.status === 'acknowledged' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }>{alert.status}</Badge>
                          </div>
                          {alert.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300">{alert.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                            <span>Created: {new Date(alert.created_at).toLocaleString()}</span>
                            <span>Type: {alert.alert_type}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {alert.status === 'active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAcknowledgeAlert(alert.id)}
                            >
                              Acknowledge
                            </Button>
                          )}
                          {(alert.status === 'active' || alert.status === 'acknowledged') && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600"
                              onClick={() => handleResolveAlert(alert.id)}
                            >
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {dbAlerts.length === 0 && !alertsLoading && (
                    <div className="p-8 text-center text-gray-500">
                      <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No alerts. Click &quot;Create Alert&quot; to add one.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dashboards Tab */}
          <TabsContent value="dashboards" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockDashboards.map(dashboard => (
                <Card key={dashboard.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{dashboard.name}</CardTitle>
                      {dashboard.is_shared && (
                        <Badge variant="outline">
                          <Users className="w-3 h-3 mr-1" />
                          Shared
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{dashboard.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{dashboard.widgets_count} widgets</span>
                      <span className="text-gray-500">by {dashboard.created_by}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
                <CardContent className="flex flex-col items-center justify-center h-full py-8">
                  <Plus className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-gray-500">Create Dashboard</span>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-12 md:col-span-3 space-y-2">
                <nav className="space-y-1">
                  {[
                    { id: 'general', label: 'General', icon: Settings },
                    { id: 'agents', label: 'Agents', icon: Server },
                    { id: 'notifications', label: 'Notifications', icon: Bell },
                    { id: 'thresholds', label: 'Thresholds', icon: Gauge },
                    { id: 'integrations', label: 'Integrations', icon: Webhook },
                    { id: 'advanced', label: 'Advanced', icon: Sliders }
                  ].map((item) => (
                    <Button
                      key={item.id}
                      variant={settingsTab === item.id ? 'secondary' : 'ghost'}
                      className="w-full justify-start gap-2"
                      onClick={() => setSettingsTab(item.id)}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  ))}
                </nav>

                {/* Monitoring Stats */}
                <Card className="mt-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">System Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Hosts</span>
                      <Badge variant="secondary">{stats.total}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Healthy</span>
                      <Badge className="bg-green-100 text-green-700">{stats.healthy}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Active Alerts</span>
                      <Badge className={stats.activeAlerts > 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}>{stats.activeAlerts}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Containers</span>
                      <Badge variant="secondary">{stats.totalContainers}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-12 md:col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Organization Settings</CardTitle>
                        <CardDescription>Configure your monitoring organization</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Organization Name</Label>
                            <Input defaultValue="Production Infrastructure" />
                          </div>
                          <div className="space-y-2">
                            <Label>Organization ID</Label>
                            <Input defaultValue="org-prod-12345" readOnly className="font-mono" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Default Region</Label>
                            <Select defaultValue="us-west-2">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                                <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                                <SelectItem value="eu-west-1">EU West (Ireland)</SelectItem>
                                <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Timezone</Label>
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
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Display Preferences</CardTitle>
                        <CardDescription>Customize your monitoring dashboard</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Auto-Refresh Dashboard</Label>
                            <p className="text-sm text-gray-500">Automatically refresh data</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                            <Label>Default Time Range</Label>
                            <Select defaultValue="1h">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="15m">Last 15 minutes</SelectItem>
                                <SelectItem value="1h">Last 1 hour</SelectItem>
                                <SelectItem value="4h">Last 4 hours</SelectItem>
                                <SelectItem value="24h">Last 24 hours</SelectItem>
                                <SelectItem value="7d">Last 7 days</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Show Metric Annotations</Label>
                            <p className="text-sm text-gray-500">Display events on charts</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Agents Settings */}
                {settingsTab === 'agents' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Agent Configuration</CardTitle>
                        <CardDescription>Global agent settings and defaults</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Agent Version (Target)</Label>
                            <Select defaultValue="7.45.0">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="7.45.0">7.45.0 (Latest)</SelectItem>
                                <SelectItem value="7.44.1">7.44.1</SelectItem>
                                <SelectItem value="7.43.0">7.43.0</SelectItem>
                                <SelectItem value="7.42.0">7.42.0</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Collection Interval</Label>
                            <Select defaultValue="15">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="10">10 seconds</SelectItem>
                                <SelectItem value="15">15 seconds</SelectItem>
                                <SelectItem value="30">30 seconds</SelectItem>
                                <SelectItem value="60">60 seconds</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Auto-Update Agents</Label>
                            <p className="text-sm text-gray-500">Automatically update to latest version</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Log Collection</Label>
                            <p className="text-sm text-gray-500">Collect and forward application logs</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Process Monitoring</Label>
                            <p className="text-sm text-gray-500">Monitor running processes</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Container Monitoring</Label>
                            <p className="text-sm text-gray-500">Monitor Docker/Kubernetes containers</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>API Keys</CardTitle>
                        <CardDescription>Manage agent authentication keys</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <div className="flex gap-2">
                            <Input type="password" defaultValue="dd_api_xxxxxxxxxxxxxxxxxx" readOnly className="flex-1 font-mono" />
                            <Button variant="outline" size="icon" onClick={() => {
                              toast.promise(
                                navigator.clipboard.writeText('dd_api_xxxxxxxxxxxxxxxxxx'),
                                {
                                  loading: 'Copying API key...',
                                  success: 'API key copied to clipboard',
                                  error: 'Failed to copy API key'
                                }
                              )
                            }}>
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={async () => {
                              try {
                                const newKey = `dd_api_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`
                                const { error } = await supabase.from('api_keys').upsert({ id: 'monitoring', key: newKey, updated_at: new Date().toISOString() })
                                if (error) throw error
                                toast.success('API key regenerated successfully', { description: 'Copy your new key now - it won\'t be shown again' })
                              } catch (err) {
                                toast.error('Failed to regenerate API key')
                              }
                            }}>
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Application Key</Label>
                          <div className="flex gap-2">
                            <Input type="password" defaultValue="dd_app_xxxxxxxxxxxxxxxxxx" readOnly className="flex-1 font-mono" />
                            <Button variant="outline" size="icon" onClick={() => {
                              toast.promise(
                                navigator.clipboard.writeText('dd_app_xxxxxxxxxxxxxxxxxx'),
                                {
                                  loading: 'Copying application key...',
                                  success: 'Application key copied to clipboard',
                                  error: 'Failed to copy application key'
                                }
                              )
                            }}>
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Alert Channels</CardTitle>
                        <CardDescription>Configure notification delivery channels</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Slack #alerts', type: 'Slack', enabled: true },
                          { name: 'Slack #oncall', type: 'Slack', enabled: true },
                          { name: 'PagerDuty', type: 'PagerDuty', enabled: true },
                          { name: 'ops@company.com', type: 'Email', enabled: true },
                          { name: 'Webhook (Internal)', type: 'Webhook', enabled: false }
                        ].map((channel) => (
                          <div key={channel.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                {channel.type === 'Slack' && <Bell className="w-4 h-4" />}
                                {channel.type === 'PagerDuty' && <AlertCircle className="w-4 h-4" />}
                                {channel.type === 'Email' && <Mail className="w-4 h-4" />}
                                {channel.type === 'Webhook' && <Webhook className="w-4 h-4" />}
                              </div>
                              <div>
                                <span className="font-medium">{channel.name}</span>
                                <p className="text-xs text-gray-500">{channel.type}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch defaultChecked={channel.enabled} />
                              <Button variant="ghost" size="sm" onClick={() => {
                                setShowAddAlertDialog(true)
                                toast.info(`Opening ${channel.name} configuration`, { description: 'Configure notification settings' })
                              }}>Configure</Button>
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full" onClick={() => {
                          setShowAddAlertDialog(true)
                          toast.info('Opening add channel dialog', { description: 'Select your notification channel type' })
                        }}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Channel
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Escalation Policies</CardTitle>
                        <CardDescription>Configure alert escalation rules</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Enable Escalation</Label>
                            <p className="text-sm text-gray-500">Escalate unacknowledged alerts</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>First Escalation</Label>
                            <Select defaultValue="15">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="5">After 5 minutes</SelectItem>
                                <SelectItem value="15">After 15 minutes</SelectItem>
                                <SelectItem value="30">After 30 minutes</SelectItem>
                                <SelectItem value="60">After 1 hour</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Second Escalation</Label>
                            <Select defaultValue="60">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="30">After 30 minutes</SelectItem>
                                <SelectItem value="60">After 1 hour</SelectItem>
                                <SelectItem value="120">After 2 hours</SelectItem>
                                <SelectItem value="240">After 4 hours</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Quiet Hours</CardTitle>
                        <CardDescription>Suppress non-critical alerts during specified times</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Enable Quiet Hours</Label>
                            <p className="text-sm text-gray-500">Suppress low/medium alerts</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Start Time</Label>
                            <Input type="time" defaultValue="22:00" />
                          </div>
                          <div className="space-y-2">
                            <Label>End Time</Label>
                            <Input type="time" defaultValue="08:00" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Thresholds Settings */}
                {settingsTab === 'thresholds' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>CPU Thresholds</CardTitle>
                        <CardDescription>Configure CPU usage alert thresholds</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label className="text-yellow-600">Warning</Label>
                            <div className="flex items-center gap-2">
                              <Input type="number" defaultValue="70" className="w-20" />
                              <span className="text-gray-500">%</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-orange-600">High</Label>
                            <div className="flex items-center gap-2">
                              <Input type="number" defaultValue="85" className="w-20" />
                              <span className="text-gray-500">%</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-red-600">Critical</Label>
                            <div className="flex items-center gap-2">
                              <Input type="number" defaultValue="95" className="w-20" />
                              <span className="text-gray-500">%</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Evaluation Window</Label>
                          <Select defaultValue="5">
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 minute average</SelectItem>
                              <SelectItem value="5">5 minute average</SelectItem>
                              <SelectItem value="15">15 minute average</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Memory Thresholds</CardTitle>
                        <CardDescription>Configure memory usage alert thresholds</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label className="text-yellow-600">Warning</Label>
                            <div className="flex items-center gap-2">
                              <Input type="number" defaultValue="75" className="w-20" />
                              <span className="text-gray-500">%</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-orange-600">High</Label>
                            <div className="flex items-center gap-2">
                              <Input type="number" defaultValue="85" className="w-20" />
                              <span className="text-gray-500">%</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-red-600">Critical</Label>
                            <div className="flex items-center gap-2">
                              <Input type="number" defaultValue="95" className="w-20" />
                              <span className="text-gray-500">%</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Disk Thresholds</CardTitle>
                        <CardDescription>Configure disk usage alert thresholds</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label className="text-yellow-600">Warning</Label>
                            <div className="flex items-center gap-2">
                              <Input type="number" defaultValue="70" className="w-20" />
                              <span className="text-gray-500">%</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-orange-600">High</Label>
                            <div className="flex items-center gap-2">
                              <Input type="number" defaultValue="80" className="w-20" />
                              <span className="text-gray-500">%</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-red-600">Critical</Label>
                            <div className="flex items-center gap-2">
                              <Input type="number" defaultValue="90" className="w-20" />
                              <span className="text-gray-500">%</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Network Thresholds</CardTitle>
                        <CardDescription>Configure network alert thresholds</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Packet Loss Warning</Label>
                            <div className="flex items-center gap-2">
                              <Input type="number" defaultValue="1" className="w-20" />
                              <span className="text-gray-500">%</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Latency Warning</Label>
                            <div className="flex items-center gap-2">
                              <Input type="number" defaultValue="100" className="w-20" />
                              <span className="text-gray-500">ms</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Cloud Integrations</CardTitle>
                        <CardDescription>Connect cloud providers for enhanced monitoring</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          {[
                            { name: 'AWS', connected: true, description: 'EC2, RDS, S3, Lambda metrics' },
                            { name: 'Google Cloud', connected: false, description: 'GCE, Cloud SQL, GKE metrics' },
                            { name: 'Azure', connected: false, description: 'VMs, SQL Database, AKS metrics' },
                            { name: 'DigitalOcean', connected: true, description: 'Droplets, Kubernetes metrics' }
                          ].map((integration) => (
                            <div key={integration.name} className="p-4 rounded-lg border dark:border-gray-700">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">{integration.name}</span>
                                <Badge variant={integration.connected ? 'default' : 'outline'}>
                                  {integration.connected ? 'Connected' : 'Not Connected'}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-500 mb-3">{integration.description}</p>
                              <Button variant="outline" size="sm" className="w-full" onClick={async () => {
                                if (integration.connected) {
                                  setShowAddAlertDialog(true)
                                  toast.info(`${integration.name} settings opened`, { description: 'Configure your integration' })
                                } else {
                                  const oauthUrl = `/api/integrations/${integration.name.toLowerCase().replace(' ', '-')}/oauth`
                                  const popup = window.open(oauthUrl, `${integration.name} Connection`, 'width=600,height=700')
                                  if (popup) {
                                    toast.info(`Complete ${integration.name} authorization in the popup window`)
                                  } else {
                                    toast.error('Popup blocked', { description: 'Please allow popups to connect to this service' })
                                  }
                                }
                              }}>
                                {integration.connected ? 'Configure' : 'Connect'}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Database Integrations</CardTitle>
                        <CardDescription>Connect databases for query performance monitoring</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'PostgreSQL', connected: true, hosts: 2 },
                          { name: 'MySQL', connected: false, hosts: 0 },
                          { name: 'MongoDB', connected: true, hosts: 1 },
                          { name: 'Redis', connected: true, hosts: 3 },
                          { name: 'Elasticsearch', connected: false, hosts: 0 }
                        ].map((db) => (
                          <div key={db.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <div className="flex items-center gap-3">
                              <Database className="w-5 h-5 text-gray-500" />
                              <div>
                                <span className="font-medium">{db.name}</span>
                                {db.connected && <span className="text-xs text-gray-500 ml-2">{db.hosts} hosts</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {db.connected ? (
                                <Badge className="bg-green-100 text-green-700">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Connected
                                </Badge>
                              ) : (
                                <Button variant="outline" size="sm" onClick={async () => {
                                  try {
                                    const { error } = await supabase.from('database_integrations').insert({
                                      name: db.name,
                                      type: db.name.toLowerCase(),
                                      status: 'connected',
                                      connected_at: new Date().toISOString()
                                    })
                                    if (error) throw error
                                    toast.success(`${db.name} connected successfully`)
                                  } catch (err) {
                                    toast.error(`Failed to connect to ${db.name}`)
                                  }
                                }}>Connect</Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Container Orchestration</CardTitle>
                        <CardDescription>Connect container platforms</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { name: 'Kubernetes', connected: true, clusters: 3 },
                          { name: 'Docker Swarm', connected: false, clusters: 0 },
                          { name: 'ECS', connected: true, clusters: 1 }
                        ].map((platform) => (
                          <div key={platform.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <div className="flex items-center gap-3">
                              <Container className="w-5 h-5 text-gray-500" />
                              <div>
                                <span className="font-medium">{platform.name}</span>
                                {platform.connected && <span className="text-xs text-gray-500 ml-2">{platform.clusters} clusters</span>}
                              </div>
                            </div>
                            <Badge className={platform.connected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                              {platform.connected ? 'Connected' : 'Not Connected'}
                            </Badge>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Data Retention</CardTitle>
                        <CardDescription>Configure data retention policies</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Metrics Retention</Label>
                            <Select defaultValue="15m">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="3m">3 months</SelectItem>
                                <SelectItem value="6m">6 months</SelectItem>
                                <SelectItem value="15m">15 months</SelectItem>
                                <SelectItem value="2y">2 years</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Logs Retention</Label>
                            <Select defaultValue="30d">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="7d">7 days</SelectItem>
                                <SelectItem value="15d">15 days</SelectItem>
                                <SelectItem value="30d">30 days</SelectItem>
                                <SelectItem value="90d">90 days</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Traces Retention</Label>
                            <Select defaultValue="15d">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="7d">7 days</SelectItem>
                                <SelectItem value="15d">15 days</SelectItem>
                                <SelectItem value="30d">30 days</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Events Retention</Label>
                            <Select defaultValue="30d">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="15d">15 days</SelectItem>
                                <SelectItem value="30d">30 days</SelectItem>
                                <SelectItem value="90d">90 days</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Security</CardTitle>
                        <CardDescription>Configure security settings</CardDescription>
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
                            <p className="text-sm text-gray-500">Restrict access by IP address</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>SSO Only</Label>
                            <p className="text-sm text-gray-500">Require SSO authentication</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Audit Logging</Label>
                            <p className="text-sm text-gray-500">Log all user actions</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Advanced Features</CardTitle>
                        <CardDescription>Enable experimental features</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>AI-Powered Anomaly Detection</Label>
                            <p className="text-sm text-gray-500">ML-based anomaly detection</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Predictive Alerting</Label>
                            <p className="text-sm text-gray-500">Alert before thresholds are breached</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Debug Mode</Label>
                            <p className="text-sm text-gray-500">Enable verbose logging</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-red-200 dark:border-red-900">
                      <CardHeader>
                        <CardTitle className="text-red-600 flex items-center gap-2">
                          <AlertOctagon className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                        <CardDescription>Irreversible and destructive actions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-900">
                          <div>
                            <div className="font-medium">Reset All Alerts</div>
                            <p className="text-sm text-gray-500">Clear all alert history</p>
                          </div>
                          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={async () => {
                            if (!confirm('Are you sure you want to reset all alerts? This action cannot be undone.')) return
                            try {
                              const { error } = await supabase.from('monitoring_alerts').update({ status: 'resolved', resolved_at: new Date().toISOString() }).eq('status', 'active')
                              if (error) throw error
                              toast.success('All alerts have been reset')
                            } catch (err) {
                              toast.error('Failed to reset alerts')
                            }
                          }}>
                            Reset Alerts
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-900">
                          <div>
                            <div className="font-medium">Remove All Hosts</div>
                            <p className="text-sm text-gray-500">Unregister all monitored hosts</p>
                          </div>
                          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={async () => {
                            if (!confirm('Are you sure you want to remove all hosts? You will need to re-register them to continue monitoring.')) return
                            try {
                              const { error } = await supabase.from('monitoring_hosts').update({ status: 'removed', removed_at: new Date().toISOString() }).neq('status', 'removed')
                              if (error) throw error
                              toast.success('All hosts have been removed')
                            } catch (err) {
                              toast.error('Failed to remove hosts')
                            }
                          }}>
                            Remove Hosts
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-900">
                          <div>
                            <div className="font-medium">Delete Organization</div>
                            <p className="text-sm text-gray-500">Permanently delete this organization</p>
                          </div>
                          <Button variant="destructive" onClick={async () => {
                            const confirmed = prompt('Type "DELETE" to confirm organization deletion:')
                            if (confirmed !== 'DELETE') {
                              toast.error('Deletion cancelled', { description: 'You must type DELETE to confirm' })
                              return
                            }
                            try {
                              const { error } = await supabase.from('organizations').update({ deleted_at: new Date().toISOString() }).is('deleted_at', null)
                              if (error) throw error
                              toast.success('Organization deleted successfully', { description: 'You will be redirected shortly' })
                            } catch (err) {
                              toast.error('Failed to delete organization')
                            }
                          }}>
                            Delete Organization
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockMonitoringAIInsights}
              title="Monitoring Intelligence"
              onInsightAction={(insight) => toast.info(insight.title || 'AI Insight', { description: insight.description || 'View insight details' })}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockMonitoringCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockMonitoringPredictions}
              title="Infrastructure Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockMonitoringActivities}
            title="Monitoring Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={monitoringQuickActions}
            variant="grid"
          />
        </div>

        {/* Host Detail Dialog */}
        <Dialog open={!!selectedHost} onOpenChange={() => setSelectedHost(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Server className="w-5 h-5" />
                {selectedHost?.name}
              </DialogTitle>
              <DialogDescription>
                {selectedHost?.hostname} • {selectedHost?.ip_address}
              </DialogDescription>
            </DialogHeader>
            {selectedHost && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Badge className={getHostStatusColor(selectedHost.status)}>{selectedHost.status}</Badge>
                  <Badge variant="outline">{selectedHost.instance_type}</Badge>
                  <Badge variant="outline">{selectedHost.os}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  <div className="p-4 border rounded-lg text-center">
                    <Cpu className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <p className={`text-2xl font-bold ${getMetricColor(selectedHost.cpu_usage, 80)}`}>
                      {selectedHost.cpu_usage}%
                    </p>
                    <p className="text-xs text-gray-500">CPU</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <MemoryStick className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                    <p className={`text-2xl font-bold ${getMetricColor(selectedHost.memory_usage, 80)}`}>
                      {selectedHost.memory_usage}%
                    </p>
                    <p className="text-xs text-gray-500">Memory</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <HardDrive className="w-6 h-6 mx-auto mb-2 text-green-600" />
                    <p className={`text-2xl font-bold ${getMetricColor(selectedHost.disk_usage, 80)}`}>
                      {selectedHost.disk_usage}%
                    </p>
                    <p className="text-xs text-gray-500">Disk</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <Activity className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                    <p className="text-2xl font-bold">{selectedHost.load_avg.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Load</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Region / AZ</p>
                    <p className="font-medium">{selectedHost.region} / {selectedHost.availability_zone}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Uptime</p>
                    <p className="font-medium">{formatUptime(selectedHost.uptime_seconds)}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Processes</p>
                    <p className="font-medium">{selectedHost.processes}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Containers</p>
                    <p className="font-medium">{selectedHost.containers}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedHost.tags.map(tag => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t">
                  <Button variant="outline" className="flex-1" onClick={() => {
                    const sshUrl = `ssh://${selectedHost.hostname}`
                    window.open(sshUrl, '_blank')
                    toast.success(`SSH session opened for ${selectedHost.name}`, { description: `Connecting to ${selectedHost.ip_address}` })
                  }}>
                    <Terminal className="w-4 h-4 mr-2" />
                    SSH
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => {
                    setShowMetricsExplorerDialog(true)
                    toast.info(`Metrics dashboard opened for ${selectedHost.name}`)
                  }}>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Metrics
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => {
                    setActiveTab('logs')
                    toast.info(`Logs viewer opened for ${selectedHost.name}`, { description: `Filtered to host: ${selectedHost.hostname}` })
                    setSelectedHost(null)
                  }}>
                    <FileText className="w-4 h-4 mr-2" />
                    Logs
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Server Dialog */}
        <Dialog open={showAddServerDialog} onOpenChange={setShowAddServerDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Server</DialogTitle>
              <DialogDescription>Register a new server for monitoring</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="server_name">Server Name *</Label>
                <Input
                  id="server_name"
                  placeholder="e.g., web-prod-01"
                  value={serverForm.server_name}
                  onChange={(e) => setServerForm(prev => ({ ...prev, server_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="server_type">Server Type</Label>
                <Select
                  value={serverForm.server_type}
                  onValueChange={(value) => setServerForm(prev => ({ ...prev, server_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                    <SelectItem value="cache">Cache</SelectItem>
                    <SelectItem value="worker">Worker</SelectItem>
                    <SelectItem value="network">Network</SelectItem>
                    <SelectItem value="storage">Storage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., us-west-2"
                    value={serverForm.location}
                    onChange={(e) => setServerForm(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ip_address">IP Address</Label>
                  <Input
                    id="ip_address"
                    placeholder="e.g., 10.0.1.101"
                    value={serverForm.ip_address}
                    onChange={(e) => setServerForm(prev => ({ ...prev, ip_address: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  placeholder="e.g., env:production, team:platform"
                  value={serverForm.tags}
                  onChange={(e) => setServerForm(prev => ({ ...prev, tags: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddServerDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateServer} disabled={isCreating || !serverForm.server_name}>
                {isCreating ? 'Adding...' : 'Add Server'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Alert Dialog */}
        <Dialog open={showAddAlertDialog} onOpenChange={setShowAddAlertDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Alert Rule</DialogTitle>
              <DialogDescription>Set up a new monitoring alert</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="alert_title">Alert Title *</Label>
                <Input
                  id="alert_title"
                  placeholder="e.g., High CPU Usage"
                  value={alertForm.title}
                  onChange={(e) => setAlertForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="alert_type">Alert Type</Label>
                  <Select
                    value={alertForm.alert_type}
                    onValueChange={(value) => setAlertForm(prev => ({ ...prev, alert_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cpu_high">CPU High</SelectItem>
                      <SelectItem value="memory_high">Memory High</SelectItem>
                      <SelectItem value="disk_full">Disk Full</SelectItem>
                      <SelectItem value="network_issue">Network Issue</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="severity">Severity</Label>
                  <Select
                    value={alertForm.severity}
                    onValueChange={(value) => setAlertForm(prev => ({ ...prev, severity: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="server_select">Associated Server (optional)</Label>
                <Select
                  value={alertForm.server_id}
                  onValueChange={(value) => setAlertForm(prev => ({ ...prev, server_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a server" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {dbServers.map(server => (
                      <SelectItem key={server.id} value={server.id}>{server.server_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Alert description"
                  value={alertForm.description}
                  onChange={(e) => setAlertForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddAlertDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateAlert} disabled={isLoading || !alertForm.title}>
                {isLoading ? 'Creating...' : 'Create Alert'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dashboards Dialog */}
        <Dialog open={showDashboardsDialog} onOpenChange={setShowDashboardsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Monitoring Dashboards
              </DialogTitle>
              <DialogDescription>View and manage your monitoring dashboards</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              {mockDashboards.map(dashboard => (
                <div key={dashboard.id} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{dashboard.name}</h4>
                      <p className="text-sm text-gray-500">{dashboard.description}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{dashboard.widgets_count} widgets</Badge>
                      <p className="text-xs text-gray-400 mt-1">{dashboard.is_shared ? 'Shared' : 'Private'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDashboardsDialog(false)}>Close</Button>
              <Button onClick={() => {
                toast.success('New dashboard created')
                setShowDashboardsDialog(false)
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Create Dashboard
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Alerts Configuration Dialog */}
        <Dialog open={showAlertsConfigDialog} onOpenChange={setShowAlertsConfigDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Alert Configuration
              </DialogTitle>
              <DialogDescription>Manage alert rules and notification settings</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Notification Channels</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Email Notifications', enabled: true },
                    { label: 'Slack Integration', enabled: true },
                    { label: 'PagerDuty', enabled: false },
                    { label: 'Webhook Alerts', enabled: false },
                  ].map((channel, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm">{channel.label}</span>
                      <Switch defaultChecked={channel.enabled} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Alert Thresholds</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                  <div className="p-3 border rounded-lg">
                    <Label className="text-xs text-gray-500">CPU Warning</Label>
                    <Input type="number" defaultValue={70} className="mt-1" />
                  </div>
                  <div className="p-3 border rounded-lg">
                    <Label className="text-xs text-gray-500">CPU Critical</Label>
                    <Input type="number" defaultValue={90} className="mt-1" />
                  </div>
                  <div className="p-3 border rounded-lg">
                    <Label className="text-xs text-gray-500">Memory Warning</Label>
                    <Input type="number" defaultValue={75} className="mt-1" />
                  </div>
                  <div className="p-3 border rounded-lg">
                    <Label className="text-xs text-gray-500">Memory Critical</Label>
                    <Input type="number" defaultValue={95} className="mt-1" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAlertsConfigDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success('Alert configuration saved')
                setShowAlertsConfigDialog(false)
              }}>
                Save Configuration
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Metrics Explorer Dialog */}
        <Dialog open={showMetricsExplorerDialog} onOpenChange={setShowMetricsExplorerDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Metrics Explorer
              </DialogTitle>
              <DialogDescription>Explore and visualize infrastructure metrics</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Label className="text-xs text-gray-500 mb-1 block">Metric Type</Label>
                  <Select defaultValue="cpu">
                    <SelectTrigger>
                      <SelectValue placeholder="Select metric" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cpu">CPU Usage</SelectItem>
                      <SelectItem value="memory">Memory Usage</SelectItem>
                      <SelectItem value="disk">Disk Usage</SelectItem>
                      <SelectItem value="network">Network I/O</SelectItem>
                      <SelectItem value="latency">Request Latency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label className="text-xs text-gray-500 mb-1 block">Time Range</Label>
                  <Select defaultValue="1h">
                    <SelectTrigger>
                      <SelectValue placeholder="Select time range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15m">Last 15 minutes</SelectItem>
                      <SelectItem value="1h">Last 1 hour</SelectItem>
                      <SelectItem value="6h">Last 6 hours</SelectItem>
                      <SelectItem value="24h">Last 24 hours</SelectItem>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label className="text-xs text-gray-500 mb-1 block">Host Filter</Label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Select host" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Hosts</SelectItem>
                      {(allServers || []).map((server: DbServer) => (
                        <SelectItem key={server.id} value={server.id}>{server.server_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="border rounded-lg p-6 bg-gray-50 dark:bg-gray-800 min-h-[200px] flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Gauge className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Select metrics and time range to visualize data</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                {[
                  { label: 'Current', value: '42%', color: 'text-green-600' },
                  { label: 'Average', value: '38%', color: 'text-blue-600' },
                  { label: 'Peak', value: '78%', color: 'text-orange-600' },
                  { label: 'Min', value: '12%', color: 'text-gray-600' },
                ].map((stat, idx) => (
                  <div key={idx} className="p-3 border rounded-lg text-center">
                    <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowMetricsExplorerDialog(false)}>Close</Button>
              <Button onClick={async () => {
                try {
                  const { data: metrics } = await supabase.from('monitoring_metrics').select('*').limit(1000)
                  const csvContent = metrics ? `timestamp,metric_name,value\n${metrics.map(m => `${m.created_at},${m.name},${m.value}`).join('\n')}` : 'No data'
                  const blob = new Blob([csvContent], { type: 'text/csv' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `metrics-export-${new Date().toISOString().split('T')[0]}.csv`
                  a.click()
                  URL.revokeObjectURL(url)
                  toast.success('Metrics data exported!')
                  setShowMetricsExplorerDialog(false)
                } catch (err) {
                  toast.error('Failed to export metrics')
                }
              }}>
                Export Data
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
