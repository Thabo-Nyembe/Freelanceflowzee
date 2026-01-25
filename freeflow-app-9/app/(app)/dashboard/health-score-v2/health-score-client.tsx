'use client'

import { createClient } from '@/lib/supabase/client'

import { useState, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import { shareContent, downloadAsCsv, apiCall } from '@/lib/button-handlers'
import {
  Activity,
  Server,
  Database,
  Globe,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  TrendingUp,
  TrendingDown,
  Target,
  Bell,
  Settings,
  RefreshCw,
  Play,
  Pause,
  ExternalLink,
  Search,
  Filter,
  Cpu,
  HardDrive,
  Container,
  Cloud,
  Shield,
  Eye,
  BarChart3,
  Minus,
  Calendar,
  Download,
  Layers,
  GitBranch,
  Box,
  Plus,
  FileText,
  Users,
  Network,
  Gauge,
  Trash2,
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




import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useHealthScores, useHealthScoreMutations, type HealthScore } from '@/lib/hooks/use-health-scores'
import { useSystemHealth } from '@/lib/hooks/use-health-extended'

// Initialize Supabase client once at module level
const supabase = createClient()

// Types
type ServiceStatus = 'healthy' | 'degraded' | 'critical' | 'unknown'
type AlertSeverity = 'critical' | 'warning' | 'info'
type IncidentStatus = 'open' | 'acknowledged' | 'resolved'

interface ServiceHealth {
  id: string
  name: string
  type: 'api' | 'web' | 'database' | 'cache' | 'queue' | 'external'
  status: ServiceStatus
  apdexScore: number
  errorRate: number
  responseTime: {
    p50: number
    p95: number
    p99: number
  }
  throughput: number
  uptime: number
  lastDeployment: string
  version: string
  instances: number
  dependencies: string[]
  healthChecks: {
    name: string
    status: 'passing' | 'failing'
    lastCheck: string
  }[]
}

interface HostMetrics {
  id: string
  hostname: string
  type: 'server' | 'container' | 'kubernetes'
  status: ServiceStatus
  cpu: number
  memory: number
  disk: number
  network: {
    in: number
    out: number
  }
  processes: number
  uptime: string
  os: string
  region: string
  tags: string[]
}

interface AlertRule {
  id: string
  name: string
  description: string
  severity: AlertSeverity
  condition: string
  threshold: string
  service: string
  enabled: boolean
  lastTriggered: string | null
  notifications: string[]
}

interface Incident {
  id: string
  title: string
  severity: AlertSeverity
  status: IncidentStatus
  service: string
  startedAt: string
  acknowledgedAt: string | null
  resolvedAt: string | null
  duration: string
  assignee: string | null
  timeline: {
    time: string
    event: string
    user: string | null
  }[]
}

interface SLO {
  id: string
  name: string
  service: string
  target: number
  current: number
  budgetRemaining: number
  budgetConsumed: number
  timeWindow: '7d' | '30d' | '90d'
  indicator: 'availability' | 'latency' | 'error_rate'
  status: 'met' | 'at_risk' | 'breached'
  history: { date: string; value: number }[]
}

// Form state type for create/edit dialog
interface HealthScoreFormState {
  customer_name: string
  account_type: string
  overall_score: number
  category: string
  trend: string
  product_usage: number
  engagement: number
  support_health: number
  financial: number
  sentiment: number
  notes: string
}

const initialFormState: HealthScoreFormState = {
  customer_name: '',
  account_type: 'standard',
  overall_score: 50,
  category: 'fair',
  trend: 'stable',
  product_usage: 50,
  engagement: 50,
  support_health: 50,
  financial: 50,
  sentiment: 50,
  notes: '',
}

// Empty data arrays (to be populated from real data sources)
const mockServices: ServiceHealth[] = []

const mockHosts: HostMetrics[] = []

const mockAlerts: AlertRule[] = []

const mockIncidents: Incident[] = []

const mockSLOs: SLO[] = []

// Enhanced Competitive Upgrade Data (empty arrays)
const mockHealthScoreAIInsights: { id: string; type: 'success' | 'info' | 'warning'; title: string; description: string; priority: 'low' | 'medium' | 'high'; timestamp: string; category: string }[] = []

const mockHealthScoreCollaborators: { id: string; name: string; avatar: string; status: 'online' | 'away' | 'offline'; role: string; lastActive: string }[] = []

const mockHealthScorePredictions: { id: string; label: string; current: number; target: number; predicted: number; confidence: number; trend: 'up' | 'down' | 'stable' }[] = []

const mockHealthScoreActivities: { id: string; user: string; action: string; target: string; timestamp: string; type: 'success' | 'info' | 'warning' }[] = []

// Quick actions will be defined inside the component to access state setters

export default function HealthScoreClient() {
  // Supabase hooks for real health score data
  const { healthScores: dbHealthScores, stats: healthStats, isLoading: isLoadingHealthScores, error: healthScoresError, refetch: fetchHealthScores } = useHealthScores()
  const { health: systemHealth, isLoading: isLoadingSystemHealth, refresh: refreshSystemHealth } = useSystemHealth()
  const { createHealthScore: createHealthScoreMutation, updateHealthScore: updateHealthScoreMutation, deleteHealthScore: deleteHealthScoreMutation, isCreating, isUpdating, isDeleting: _isDeleting } = useHealthScoreMutations()

  // UI State
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedService, setSelectedService] = useState<ServiceHealth | null>(null)
  const [selectedHost, setSelectedHost] = useState<HostMetrics | null>(null)
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [isLiveMode, setIsLiveMode] = useState(true)
  const [timeRange, setTimeRange] = useState<'1h' | '4h' | '1d' | '7d' | '30d'>('1d')

  // Dialog State
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [showAlertsDialog, setShowAlertsDialog] = useState(false)
  const [showMetricsDialog, setShowMetricsDialog] = useState(false)
  const [showReportsDialog, setShowReportsDialog] = useState(false)
  const [formState, setFormState] = useState<HealthScoreFormState>(initialFormState)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Combined loading state
  const isLoading = isLoadingHealthScores || isLoadingSystemHealth

  // Show error toast if there's an error loading health scores
  useEffect(() => {
    if (healthScoresError) {
      toast.error('Failed to load health scores')
    }
  }, [healthScoresError])

  // Computed stats from hook data
  const overallHealth = useMemo(() => {
    if (dbHealthScores.length === 0) return systemHealth.status === 'healthy' ? 100 : systemHealth.status === 'degraded' ? 50 : 0
    return Math.round(healthStats.avgScore)
  }, [dbHealthScores, healthStats, systemHealth])

  const avgApdex = useMemo(() => {
    if (dbHealthScores.length === 0) return 0
    return healthStats.avgScore / 100
  }, [dbHealthScores, healthStats])

  const avgErrorRate = useMemo(() => {
    if (dbHealthScores.length === 0) return 0
    return (100 - healthStats.avgScore) / 100
  }, [dbHealthScores, healthStats])

  const openIncidents = mockIncidents.filter(i => i.status !== 'resolved').length

  // Create health score using mutation hook
  const handleCreateHealthScore = async () => {
    if (!formState.customer_name.trim()) {
      toast.error('Customer name is required')
      return
    }

    try {
      await createHealthScoreMutation({
        customer_name: formState.customer_name,
        account_type: formState.account_type,
        overall_score: formState.overall_score,
        category: formState.category,
        trend: formState.trend,
        product_usage: formState.product_usage,
        engagement: formState.engagement,
        support_health: formState.support_health,
        financial: formState.financial,
        sentiment: formState.sentiment,
        notes: formState.notes || undefined,
      })

      toast.success('Health score created successfully')
      setShowCreateDialog(false)
      setFormState(initialFormState)
      fetchHealthScores()
    } catch (error) {
      console.error('Error creating health score:', error)
      toast.error('Failed to create health score')
    }
  }

  // Update health score using mutation hook
  const handleUpdateHealthScore = async () => {
    if (!editingId || !formState.customer_name.trim()) {
      toast.error('Customer name is required')
      return
    }

    try {
      await updateHealthScoreMutation(editingId, {
        customer_name: formState.customer_name,
        account_type: formState.account_type,
        overall_score: formState.overall_score,
        category: formState.category,
        trend: formState.trend,
        product_usage: formState.product_usage,
        engagement: formState.engagement,
        support_health: formState.support_health,
        financial: formState.financial,
        sentiment: formState.sentiment,
        notes: formState.notes || undefined,
      })

      toast.success('Health score updated successfully')
      setShowCreateDialog(false)
      setFormState(initialFormState)
      setEditingId(null)
      fetchHealthScores()
    } catch (error) {
      console.error('Error updating health score:', error)
      toast.error('Failed to update health score')
    }
  }

  // Delete health score using mutation hook
  const handleDeleteHealthScore = async (id: string) => {
    try {
      await deleteHealthScoreMutation(id)
      toast.success('Health score deleted')
      fetchHealthScores()
    } catch (error) {
      console.error('Error deleting health score:', error)
      toast.error('Failed to delete health score')
    }
  }

  // Edit health score - populate form with existing data
  const handleEditHealthScore = (healthScore: HealthScore) => {
    setFormState({
      customer_name: healthScore.customer_name,
      account_type: healthScore.account_type,
      overall_score: healthScore.overall_score,
      category: healthScore.category,
      trend: healthScore.trend,
      product_usage: healthScore.product_usage,
      engagement: healthScore.engagement,
      support_health: healthScore.support_health,
      financial: healthScore.financial,
      sentiment: healthScore.sentiment,
      notes: healthScore.notes || '',
    })
    setEditingId(healthScore.id)
    setShowCreateDialog(true)
  }

  // Refresh metrics handler
  const handleRefreshMetrics = () => {
    toast.promise(
      (async () => {
        await fetchHealthScores()
        refreshSystemHealth()
      })(),
      {
        loading: 'Refreshing metrics...',
        success: 'Metrics refreshed successfully',
        error: 'Failed to refresh metrics'
      }
    )
  }

  // Combined stats from DB + system health
  const combinedOverallHealth = useMemo(() => {
    if (dbHealthScores.length > 0) {
      return Math.round(healthStats.avgScore)
    }
    // Fallback to system health status
    return systemHealth.status === 'healthy' ? 100 : systemHealth.status === 'degraded' ? 50 : 0
  }, [dbHealthScores, healthStats, systemHealth])

  const getStatusColor = (status: ServiceStatus) => {
    switch (status) {
      case 'healthy': return 'text-green-500'
      case 'degraded': return 'text-yellow-500'
      case 'critical': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusBg = (status: ServiceStatus) => {
    switch (status) {
      case 'healthy': return 'bg-green-500/10 border-green-500/20'
      case 'degraded': return 'bg-yellow-500/10 border-yellow-500/20'
      case 'critical': return 'bg-red-500/10 border-red-500/20'
      default: return 'bg-gray-500/10 border-gray-500/20'
    }
  }

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'warning': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'info': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    }
  }

  const getSLOStatusColor = (status: SLO['status']) => {
    switch (status) {
      case 'met': return 'text-green-500 bg-green-500/10'
      case 'at_risk': return 'text-yellow-500 bg-yellow-500/10'
      case 'breached': return 'text-red-500 bg-red-500/10'
    }
  }

  const getServiceIcon = (type: ServiceHealth['type']) => {
    switch (type) {
      case 'api': return Globe
      case 'web': return Globe
      case 'database': return Database
      case 'cache': return Zap
      case 'queue': return Layers
      case 'external': return ExternalLink
    }
  }

  const getHostIcon = (type: HostMetrics['type']) => {
    switch (type) {
      case 'server': return Server
      case 'container': return Container
      case 'kubernetes': return Box
    }
  }

  // Run diagnostics by calling the health check API
  const handleRunDiagnostics = async () => {
    const result = await apiCall('/api/health-score/check', {
      method: 'POST',
      body: JSON.stringify({ services: mockServices.map(s => s.id) })
    }, {
      loading: 'Running diagnostics...',
      success: 'System health check completed',
      error: 'Diagnostics failed'
    })
    if (result.success) {
      fetchHealthScores()
    }
  }

  // Export health data as CSV
  const handleExportHealth = () => {
    const exportData = [
      ...mockServices.map(s => ({
        type: 'Service',
        name: s.name,
        status: s.status,
        apdexScore: s.apdexScore,
        errorRate: s.errorRate,
        uptime: s.uptime,
        throughput: s.throughput
      })),
      ...dbHealthScores.map(h => ({
        type: 'Customer Health',
        name: h.customer_name,
        status: h.category,
        apdexScore: h.overall_score / 100,
        errorRate: 0,
        uptime: h.overall_score,
        throughput: 0
      }))
    ]
    downloadAsCsv(exportData, `health-report-${new Date().toISOString().split('T')[0]}.csv`)
  }

  // Open alerts configuration dialog
  const handleConfigureAlerts = () => {
    setShowAlertsDialog(true)
  }

  // Open settings dialog
  const handleOpenSettings = () => {
    setShowSettingsDialog(true)
  }

  // Open metrics dialog
  const handleViewMetrics = () => {
    setShowMetricsDialog(true)
  }

  // Open reports dialog
  const handleViewReports = () => {
    setShowReportsDialog(true)
  }

  // Save settings with real persistence
  const handleSaveSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to save settings')
        return
      }

      // Save settings to local storage for now (can be enhanced to save to database)
      const settingsData = {
        userId: user.id,
        healthThresholds: {
          critical: 20,
          warning: 50,
          good: 70,
          excellent: 90
        },
        notifications: {
          email: true,
          slack: false,
          webhook: false
        },
        updatedAt: new Date().toISOString()
      }
      localStorage.setItem('healthScoreSettings', JSON.stringify(settingsData))
      setShowSettingsDialog(false)
      toast.success('Settings saved successfully')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    }
  }

  // Save alert configuration with real persistence
  const handleSaveAlertConfig = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to save alert configuration')
        return
      }

      // Collect enabled alerts from the form
      const alertConfig = {
        userId: user.id,
        alerts: mockAlerts.slice(0, 3).map(alert => ({
          id: alert.id,
          name: alert.name,
          enabled: alert.enabled
        })),
        updatedAt: new Date().toISOString()
      }
      localStorage.setItem('healthScoreAlertConfig', JSON.stringify(alertConfig))
      setShowAlertsDialog(false)
      toast.success('Alert configuration saved successfully')
    } catch (error) {
      console.error('Error saving alert config:', error)
      toast.error('Failed to save alert configuration')
    }
  }

  // Export health report as JSON with blob download
  const handleExportReportAsJson = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      overallHealth,
      avgApdex,
      avgErrorRate,
      openIncidents,
      services: mockServices.map(s => ({
        name: s.name,
        status: s.status,
        apdexScore: s.apdexScore,
        errorRate: s.errorRate,
        uptime: s.uptime
      })),
      hosts: mockHosts.map(h => ({
        hostname: h.hostname,
        status: h.status,
        cpu: h.cpu,
        memory: h.memory,
        disk: h.disk
      })),
      slos: mockSLOs.map(s => ({
        name: s.name,
        target: s.target,
        current: s.current,
        status: s.status
      }))
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `health-report-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Report exported as JSON')
  }

  // Export health report as PDF
  const handleExportReportAsPdf = () => {
    // Create a printable version of the report
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Health Score Report - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #059669; }
            .metric { margin: 10px 0; padding: 10px; background: #f0fdf4; border-radius: 8px; }
            .metric-label { font-weight: bold; color: #374151; }
            .metric-value { font-size: 1.5em; color: #059669; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
            th { background: #f3f4f6; }
            .status-healthy { color: #059669; }
            .status-degraded { color: #d97706; }
            .status-critical { color: #dc2626; }
          </style>
        </head>
        <body>
          <h1>System Health Report</h1>
          <p>Generated: ${new Date().toLocaleString()}</p>

          <div class="metric">
            <span class="metric-label">Overall Health:</span>
            <span class="metric-value">${overallHealth}%</span>
          </div>
          <div class="metric">
            <span class="metric-label">Average Apdex:</span>
            <span class="metric-value">${avgApdex.toFixed(2)}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Error Rate:</span>
            <span class="metric-value">${avgErrorRate.toFixed(2)}%</span>
          </div>
          <div class="metric">
            <span class="metric-label">Open Incidents:</span>
            <span class="metric-value">${openIncidents}</span>
          </div>

          <h2>Services</h2>
          <table>
            <tr><th>Service</th><th>Status</th><th>Apdex</th><th>Error Rate</th><th>Uptime</th></tr>
            ${mockServices.map(s => `
              <tr>
                <td>${s.name}</td>
                <td class="status-${s.status}">${s.status}</td>
                <td>${s.apdexScore}</td>
                <td>${s.errorRate}%</td>
                <td>${s.uptime}%</td>
              </tr>
            `).join('')}
          </table>

          <h2>Hosts</h2>
          <table>
            <tr><th>Hostname</th><th>Status</th><th>CPU</th><th>Memory</th><th>Disk</th></tr>
            ${mockHosts.map(h => `
              <tr>
                <td>${h.hostname}</td>
                <td class="status-${h.status}">${h.status}</td>
                <td>${h.cpu}%</td>
                <td>${h.memory}%</td>
                <td>${h.disk}%</td>
              </tr>
            `).join('')}
          </table>
        </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
    toast.success('PDF report generated')
  }

  // Share health report
  const handleShareReport = async () => {
    await shareContent({
      title: 'System Health Report',
      text: `Overall Health: ${overallHealth}% | Services: ${mockServices.length} | Open Incidents: ${openIncidents}`,
      url: window.location.href
    })
  }

  // Quick actions defined inside component to access state
  const healthScoreQuickActions = [
    { id: '1', label: 'Run Check', icon: 'Activity', shortcut: 'C', action: handleRunDiagnostics },
    { id: '2', label: 'View Metrics', icon: 'BarChart', shortcut: 'M', action: handleViewMetrics },
    { id: '3', label: 'Alerts', icon: 'Bell', shortcut: 'A', action: handleConfigureAlerts },
    { id: '4', label: 'Reports', icon: 'FileText', shortcut: 'R', action: handleViewReports },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:bg-none dark:bg-gray-900">
      <div className="max-w-[1800px] mx-auto p-6 space-y-6">

        {/* Premium Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-8">
          <div className="absolute inset-0 bg-grid-white/10" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-white">System Health</h1>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-white text-sm font-medium backdrop-blur-sm">
                    New Relic Level
                  </span>
                </div>
                <p className="text-emerald-100 max-w-2xl">
                  Real-time application performance monitoring with service health, infrastructure metrics, and SLO tracking
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsLiveMode(!isLiveMode)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isLiveMode
                      ? 'bg-green-500 text-white'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {isLiveMode ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  {isLiveMode ? 'Live' : 'Paused'}
                </button>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
                  className="px-4 py-2 bg-white/20 text-white rounded-lg border-0 focus:ring-2 focus:ring-white/50"
                >
                  <option value="1h" className="text-gray-900">Last 1 hour</option>
                  <option value="4h" className="text-gray-900">Last 4 hours</option>
                  <option value="1d" className="text-gray-900">Last 24 hours</option>
                  <option value="7d" className="text-gray-900">Last 7 days</option>
                  <option value="30d" className="text-gray-900">Last 30 days</option>
                </select>
                {isLoading && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-lg text-white text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </div>
                )}
                <button
                  onClick={handleRefreshMetrics}
                  className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-5 h-5 text-white ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-emerald-200 text-sm mb-1">Overall Health</div>
                <div className="text-3xl font-bold text-white">{overallHealth}%</div>
                <div className="text-emerald-200 text-xs mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +2% from yesterday
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-emerald-200 text-sm mb-1">Avg Apdex</div>
                <div className="text-3xl font-bold text-white">{avgApdex.toFixed(2)}</div>
                <div className="text-emerald-200 text-xs mt-1">Target: 0.90</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-emerald-200 text-sm mb-1">Error Rate</div>
                <div className="text-3xl font-bold text-white">{avgErrorRate.toFixed(2)}%</div>
                <div className="text-emerald-200 text-xs mt-1 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" /> -0.3% from yesterday
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-emerald-200 text-sm mb-1">Services</div>
                <div className="text-3xl font-bold text-white">{mockServices.length}</div>
                <div className="text-emerald-200 text-xs mt-1">
                  {mockServices.filter(s => s.status === 'healthy').length} healthy
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-emerald-200 text-sm mb-1">Open Incidents</div>
                <div className="text-3xl font-bold text-white">{openIncidents}</div>
                <div className={`text-xs mt-1 ${openIncidents > 0 ? 'text-yellow-300' : 'text-emerald-200'}`}>
                  {openIncidents > 0 ? 'Requires attention' : 'All clear'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
            <TabsTrigger value="services" className="rounded-lg">Services</TabsTrigger>
            <TabsTrigger value="infrastructure" className="rounded-lg">Infrastructure</TabsTrigger>
            <TabsTrigger value="alerts" className="rounded-lg">Alerts</TabsTrigger>
            <TabsTrigger value="slos" className="rounded-lg">SLOs</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Overview Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">System Health Overview</h2>
                  <p className="text-emerald-100">Datadog-level observability and monitoring</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{combinedOverallHealth}%</p>
                    <p className="text-emerald-200 text-sm">Health Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockServices.filter(s => s.status === 'healthy').length}</p>
                    <p className="text-emerald-200 text-sm">Healthy</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{openIncidents}</p>
                    <p className="text-emerald-200 text-sm">Incidents</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Overview Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              <Button
                variant="ghost"
                onClick={() => setShowCreateDialog(true)}
                className="h-20 flex-col gap-2 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 hover:scale-105 transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                <span className="text-xs font-medium">Add Score</span>
              </Button>
              <Button
                variant="ghost"
                onClick={handleRefreshMetrics}
                className="h-20 flex-col gap-2 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 hover:scale-105 transition-all duration-200"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="text-xs font-medium">Refresh</span>
              </Button>
              <Button
                variant="ghost"
                onClick={handleConfigureAlerts}
                className="h-20 flex-col gap-2 bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400 hover:scale-105 transition-all duration-200"
              >
                <Bell className="w-5 h-5" />
                <span className="text-xs font-medium">Alerts</span>
              </Button>
              <Button
                variant="ghost"
                onClick={handleViewMetrics}
                className="h-20 flex-col gap-2 bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400 hover:scale-105 transition-all duration-200"
              >
                <BarChart3 className="w-5 h-5" />
                <span className="text-xs font-medium">Metrics</span>
              </Button>
              <Button
                variant="ghost"
                onClick={handleViewReports}
                className="h-20 flex-col gap-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:scale-105 transition-all duration-200"
              >
                <FileText className="w-5 h-5" />
                <span className="text-xs font-medium">Reports</span>
              </Button>
              <Button
                variant="ghost"
                onClick={handleExportHealth}
                className="h-20 flex-col gap-2 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 hover:scale-105 transition-all duration-200"
              >
                <Download className="w-5 h-5" />
                <span className="text-xs font-medium">Export</span>
              </Button>
              <Button
                variant="ghost"
                onClick={handleShareReport}
                className="h-20 flex-col gap-2 bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 hover:scale-105 transition-all duration-200"
              >
                <Shield className="w-5 h-5" />
                <span className="text-xs font-medium">Security</span>
              </Button>
              <Button
                variant="ghost"
                onClick={handleOpenSettings}
                className="h-20 flex-col gap-2 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:scale-105 transition-all duration-200"
              >
                <Settings className="w-5 h-5" />
                <span className="text-xs font-medium">Settings</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Service Status Grid */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Service Status</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {mockServices.map(service => {
                    const Icon = getServiceIcon(service.type)
                    return (
                      <button
                        key={service.id}
                        onClick={() => setSelectedService(service)}
                        className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${getStatusBg(service.status)}`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <Icon className={`w-5 h-5 ${getStatusColor(service.status)}`} />
                          <span className="font-medium text-gray-900 dark:text-white text-sm">{service.name}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 dark:text-gray-400">Apdex: {service.apdexScore}</span>
                          <span className={getStatusColor(service.status)}>{service.status}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Active Incidents */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Active Incidents</h2>
                  <span className="px-2 py-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-full text-xs font-medium">
                    {openIncidents} Open
                  </span>
                </div>
                <ScrollArea className="h-[280px]">
                  <div className="space-y-3">
                    {mockIncidents.filter(i => i.status !== 'resolved').map(incident => (
                      <button
                        key={incident.id}
                        onClick={() => setSelectedIncident(incident)}
                        className="w-full p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-emerald-500/50 transition-colors text-left"
                      >
                        <div className="flex items-start gap-3">
                          <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                            incident.severity === 'critical' ? 'text-red-500' : 'text-yellow-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                              {incident.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {incident.service} · {incident.duration}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                    {openIncidents === 0 && (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                        <p>No active incidents</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* Customer Health Scores from Database */}
            {dbHealthScores.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Customer Health Scores</h2>
                  <Button size="sm" onClick={() => setShowCreateDialog(true)}>
                    <Plus className="w-4 h-4 mr-1" /> Add Score
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dbHealthScores.slice(0, 6).map(score => (
                    <div key={score.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{score.customer_name}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          score.category === 'excellent' ? 'bg-green-500/10 text-green-500' :
                          score.category === 'good' ? 'bg-emerald-500/10 text-emerald-500' :
                          score.category === 'fair' ? 'bg-yellow-500/10 text-yellow-500' :
                          score.category === 'poor' ? 'bg-orange-500/10 text-orange-500' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                          {score.category}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {score.overall_score}%
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                        <span className={`flex items-center gap-1 ${
                          score.trend === 'improving' ? 'text-green-500' :
                          score.trend === 'declining' ? 'text-red-500' : 'text-gray-500'
                        }`}>
                          {score.trend === 'improving' ? <TrendingUp className="w-3 h-3" /> :
                           score.trend === 'declining' ? <TrendingDown className="w-3 h-3" /> :
                           <Minus className="w-3 h-3" />}
                          {score.trend}
                        </span>
                        <span>·</span>
                        <span>{score.account_type}</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
                        <div
                          className={`h-full transition-all ${
                            score.overall_score >= 80 ? 'bg-green-500' :
                            score.overall_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${score.overall_score}%` }}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEditHealthScore(score)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteHealthScore(score.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SLO Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">SLO Status</h2>
                <button className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline">View All</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {mockSLOs.map(slo => (
                  <div key={slo.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{slo.name}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSLOStatusColor(slo.status)}`}>
                        {slo.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {slo.current}%
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Target: {slo.target}% · Budget: {slo.budgetRemaining}% remaining
                    </div>
                    <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          slo.status === 'met' ? 'bg-green-500' :
                          slo.status === 'at_risk' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${slo.budgetRemaining}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6 mt-6">
            {/* Services Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Service Monitoring</h2>
                  <p className="text-blue-100">New Relic-level APM and service health</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockServices.length}</p>
                    <p className="text-blue-200 text-sm">Services</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockServices.filter(s => s.status === 'healthy').length}</p>
                    <p className="text-blue-200 text-sm">Healthy</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockServices.filter(s => s.status === 'degraded' || s.status === 'critical').length}</p>
                    <p className="text-blue-200 text-sm">Issues</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Services Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'Add Service', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
                { icon: Activity, label: 'APM', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
                { icon: Zap, label: 'Traces', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' },
                { icon: BarChart3, label: 'Metrics', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
                { icon: Eye, label: 'Logs', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400' },
                { icon: GitBranch, label: 'Dependencies', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
                { icon: Download, label: 'Export', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' },
                { icon: Settings, label: 'Settings', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                <Filter className="w-4 h-4" /> Filter
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Apdex</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Error Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Response Time</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Throughput</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Uptime</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {mockServices.filter(s =>
                    s.name.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map(service => {
                    const Icon = getServiceIcon(service.type)
                    return (
                      <tr key={service.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{service.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{service.version} · {service.instances} instances</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBg(service.status)} ${getStatusColor(service.status)}`}>
                            {service.status === 'healthy' ? <CheckCircle className="w-3 h-3" /> :
                             service.status === 'degraded' ? <AlertTriangle className="w-3 h-3" /> :
                             <XCircle className="w-3 h-3" />}
                            {service.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`font-mono font-medium ${
                            service.apdexScore >= 0.9 ? 'text-green-600 dark:text-green-400' :
                            service.apdexScore >= 0.75 ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-red-600 dark:text-red-400'
                          }`}>
                            {service.apdexScore.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`font-mono ${
                            service.errorRate < 1 ? 'text-green-600 dark:text-green-400' :
                            service.errorRate < 5 ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-red-600 dark:text-red-400'
                          }`}>
                            {service.errorRate.toFixed(2)}%
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-900 dark:text-white font-mono">
                            p50: {service.responseTime.p50}ms
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            p95: {service.responseTime.p95}ms · p99: {service.responseTime.p99}ms
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-900 dark:text-white font-mono">
                            {service.throughput.toLocaleString()} rpm
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-900 dark:text-white font-mono">
                            {service.uptime}%
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedService(service)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                          >
                            <Eye className="w-4 h-4 text-gray-500" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Infrastructure Tab */}
          <TabsContent value="infrastructure" className="space-y-6 mt-6">
            {/* Infrastructure Banner */}
            <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Infrastructure</h2>
                  <p className="text-amber-100">AWS CloudWatch-level infrastructure monitoring</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockHosts.length}</p>
                    <p className="text-amber-200 text-sm">Resources</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockHosts.filter(i => i.status === 'healthy').length}</p>
                    <p className="text-amber-200 text-sm">Healthy</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{(mockHosts.reduce((sum, i) => sum + i.cpu, 0) / mockHosts.length).toFixed(0)}%</p>
                    <p className="text-amber-200 text-sm">Avg CPU</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Infrastructure Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Server, label: 'Servers', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
                { icon: Database, label: 'Databases', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
                { icon: Cloud, label: 'Cloud', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
                { icon: Container, label: 'Containers', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' },
                { icon: Network, label: 'Network', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' },
                { icon: HardDrive, label: 'Storage', color: 'bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400' },
                { icon: Cpu, label: 'Compute', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
                { icon: Settings, label: 'Settings', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Server className="w-5 h-5 text-blue-500" />
                  <span className="font-medium text-gray-900 dark:text-white">Servers</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mockHosts.filter(h => h.type === 'server').length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {mockHosts.filter(h => h.type === 'server' && h.status === 'healthy').length} healthy
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Box className="w-5 h-5 text-purple-500" />
                  <span className="font-medium text-gray-900 dark:text-white">Kubernetes Nodes</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mockHosts.filter(h => h.type === 'kubernetes').length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {mockHosts.filter(h => h.type === 'kubernetes' && h.status === 'healthy').length} healthy
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Container className="w-5 h-5 text-cyan-500" />
                  <span className="font-medium text-gray-900 dark:text-white">Containers</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">24</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">22 running</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Host</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">CPU</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Memory</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Disk</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Network</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Uptime</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {mockHosts.map(host => {
                    const Icon = getHostIcon(host.type)
                    return (
                      <tr key={host.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white font-mono">{host.hostname}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{host.os} · {host.region}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBg(host.status)} ${getStatusColor(host.status)}`}>
                            {host.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  host.cpu < 70 ? 'bg-green-500' :
                                  host.cpu < 85 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${host.cpu}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-900 dark:text-white font-mono">{host.cpu}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  host.memory < 70 ? 'bg-green-500' :
                                  host.memory < 85 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${host.memory}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-900 dark:text-white font-mono">{host.memory}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  host.disk < 70 ? 'bg-green-500' :
                                  host.disk < 85 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${host.disk}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-900 dark:text-white font-mono">{host.disk}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white font-mono">
                            ↓{host.network.in} MB/s ↑{host.network.out} MB/s
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900 dark:text-white">{host.uptime}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedHost(host)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                          >
                            <Eye className="w-4 h-4 text-gray-500" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6 mt-6">
            {/* Alerts Banner */}
            <div className="bg-gradient-to-r from-rose-600 via-red-600 to-orange-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Alerting & Notifications</h2>
                  <p className="text-rose-100">PagerDuty-level incident management</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockAlerts.length}</p>
                    <p className="text-rose-200 text-sm">Rules</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockAlerts.filter(a => a.enabled).length}</p>
                    <p className="text-rose-200 text-sm">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{openIncidents}</p>
                    <p className="text-rose-200 text-sm">Open</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerts Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'New Rule', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' },
                { icon: Bell, label: 'Active', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
                { icon: AlertTriangle, label: 'Critical', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
                { icon: CheckCircle, label: 'Resolve', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
                { icon: Users, label: 'On-Call', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' },
                { icon: Clock, label: 'History', color: 'bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400' },
                { icon: BarChart3, label: 'Analytics', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
                { icon: Settings, label: 'Settings', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Alert Rules */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Alert Rules</h2>
                  <button className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">
                    + Add Rule
                  </button>
                </div>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {mockAlerts.map(alert => (
                      <div key={alert.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Bell className={`w-4 h-4 ${
                              alert.severity === 'critical' ? 'text-red-500' :
                              alert.severity === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                            }`} />
                            <span className="font-medium text-gray-900 dark:text-white">{alert.name}</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={alert.enabled} className="sr-only peer" readOnly />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                          </label>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{alert.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span className={`px-2 py-0.5 rounded ${getSeverityColor(alert.severity)}`}>
                            {alert.severity}
                          </span>
                          <span>Threshold: {alert.threshold}</span>
                          <span>Service: {alert.service}</span>
                        </div>
                        {alert.lastTriggered && (
                          <p className="text-xs text-gray-400 mt-2">
                            Last triggered: {new Date(alert.lastTriggered).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Incidents */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Incidents</h2>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-red-500/10 text-red-500 rounded text-xs">
                      {mockIncidents.filter(i => i.status === 'open').length} Open
                    </span>
                    <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded text-xs">
                      {mockIncidents.filter(i => i.status === 'acknowledged').length} Acknowledged
                    </span>
                  </div>
                </div>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {mockIncidents.map(incident => (
                      <button
                        key={incident.id}
                        onClick={() => setSelectedIncident(incident)}
                        className="w-full p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-emerald-500/50 transition-colors text-left"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {incident.status === 'resolved' ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : incident.severity === 'critical' ? (
                              <XCircle className="w-4 h-4 text-red-500" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-yellow-500" />
                            )}
                            <span className="font-medium text-gray-900 dark:text-white text-sm">
                              {incident.id}
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            incident.status === 'resolved' ? 'bg-green-500/10 text-green-500' :
                            incident.status === 'acknowledged' ? 'bg-yellow-500/10 text-yellow-500' :
                            'bg-red-500/10 text-red-500'
                          }`}>
                            {incident.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 dark:text-white mb-1">{incident.title}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                          <span>{incident.service}</span>
                          <span>·</span>
                          <span>{incident.duration}</span>
                          {incident.assignee && (
                            <>
                              <span>·</span>
                              <span>Assigned: {incident.assignee}</span>
                            </>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>

          {/* SLOs Tab */}
          <TabsContent value="slos" className="space-y-6 mt-6">
            {/* SLOs Banner */}
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Service Level Objectives</h2>
                  <p className="text-purple-100">Google SRE-level SLO tracking and error budgets</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockSLOs.length}</p>
                    <p className="text-purple-200 text-sm">SLOs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockSLOs.filter(s => s.current >= s.target).length}</p>
                    <p className="text-purple-200 text-sm">On Track</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockSLOs.filter(s => s.current < s.target).length}</p>
                    <p className="text-purple-200 text-sm">At Risk</p>
                  </div>
                </div>
              </div>
            </div>

            {/* SLOs Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'Create SLO', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
                { icon: Target, label: 'Objectives', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
                { icon: TrendingUp, label: 'Error Budget', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
                { icon: Gauge, label: 'SLIs', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400' },
                { icon: BarChart3, label: 'Reports', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' },
                { icon: Calendar, label: 'History', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
                { icon: Download, label: 'Export', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
                { icon: Settings, label: 'Settings', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' }
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Service Level Objectives</h2>
              <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                + Create SLO
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockSLOs.map(slo => (
                <div key={slo.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{slo.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{slo.service}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSLOStatusColor(slo.status)}`}>
                      {slo.status === 'met' ? 'Meeting Target' : slo.status === 'at_risk' ? 'At Risk' : 'Breached'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-4">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{slo.current}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Target</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{slo.target}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Window</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{slo.timeWindow}</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-500 dark:text-gray-400">Error Budget</span>
                      <span className={`font-medium ${
                        slo.budgetRemaining > 50 ? 'text-green-600 dark:text-green-400' :
                        slo.budgetRemaining > 20 ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {slo.budgetRemaining}% remaining
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          slo.budgetRemaining > 50 ? 'bg-green-500' :
                          slo.budgetRemaining > 20 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${slo.budgetRemaining}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">7-Day Trend</div>
                    <div className="flex items-end gap-1 h-16">
                      {slo.history.map((point, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center">
                          <div
                            className={`w-full rounded-t transition-all ${
                              point.value >= slo.target ? 'bg-green-500' : 'bg-red-500'
                            }`}
                            style={{ height: `${Math.max(20, (point.value / 100) * 60)}px` }}
                          />
                          <span className="text-[10px] text-gray-400 mt-1">{point.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockHealthScoreAIInsights}
              title="Health Score Intelligence"
              onInsightAction={(insight) => toast.info(insight.title || 'AI Insight')}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockHealthScoreCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockHealthScorePredictions}
              title="System Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockHealthScoreActivities}
            title="Health Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={healthScoreQuickActions}
            variant="grid"
          />
        </div>

        {/* Service Detail Dialog */}
        <Dialog open={!!selectedService} onOpenChange={() => setSelectedService(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedService && (() => {
                  const Icon = getServiceIcon(selectedService.type)
                  return <Icon className="w-5 h-5 text-emerald-500" />
                })()}
                {selectedService?.name}
              </DialogTitle>
            </DialogHeader>
            {selectedService && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Apdex Score</div>
                    <div className={`text-2xl font-bold ${
                      selectedService.apdexScore >= 0.9 ? 'text-green-600' :
                      selectedService.apdexScore >= 0.75 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {selectedService.apdexScore}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Error Rate</div>
                    <div className={`text-2xl font-bold ${
                      selectedService.errorRate < 1 ? 'text-green-600' :
                      selectedService.errorRate < 5 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {selectedService.errorRate}%
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Throughput</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedService.throughput.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">rpm</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Response Time</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">{selectedService.responseTime.p50}ms</div>
                      <div className="text-xs text-gray-500">p50</div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">{selectedService.responseTime.p95}ms</div>
                      <div className="text-xs text-gray-500">p95</div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">{selectedService.responseTime.p99}ms</div>
                      <div className="text-xs text-gray-500">p99</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Health Checks</h4>
                  <div className="space-y-2">
                    {selectedService.healthChecks.map((check, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex items-center gap-2">
                          {check.status === 'passing' ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span className="text-gray-900 dark:text-white">{check.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">{check.lastCheck}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Dependencies</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedService.dependencies.map(dep => (
                      <span key={dep} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300">
                        {dep}
                      </span>
                    ))}
                    {selectedService.dependencies.length === 0 && (
                      <span className="text-gray-500 dark:text-gray-400">No dependencies</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span>Version: {selectedService.version}</span>
                  <span>{selectedService.instances} instances</span>
                  <span>Uptime: {selectedService.uptime}%</span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Host Detail Dialog */}
        <Dialog open={!!selectedHost} onOpenChange={() => setSelectedHost(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedHost && (() => {
                  const Icon = getHostIcon(selectedHost.type)
                  return <Icon className="w-5 h-5 text-emerald-500" />
                })()}
                {selectedHost?.hostname}
              </DialogTitle>
            </DialogHeader>
            {selectedHost && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBg(selectedHost.status)} ${getStatusColor(selectedHost.status)}`}>
                    {selectedHost.status}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{selectedHost.os}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">·</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{selectedHost.region}</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-500 dark:text-gray-400">CPU</span>
                      <span className="font-mono text-gray-900 dark:text-white">{selectedHost.cpu}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full ${selectedHost.cpu < 70 ? 'bg-green-500' : selectedHost.cpu < 85 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${selectedHost.cpu}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-500 dark:text-gray-400">Memory</span>
                      <span className="font-mono text-gray-900 dark:text-white">{selectedHost.memory}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full ${selectedHost.memory < 70 ? 'bg-green-500' : selectedHost.memory < 85 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${selectedHost.memory}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-500 dark:text-gray-400">Disk</span>
                      <span className="font-mono text-gray-900 dark:text-white">{selectedHost.disk}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full ${selectedHost.disk < 70 ? 'bg-green-500' : selectedHost.disk < 85 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${selectedHost.disk}%` }} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Network In</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{selectedHost.network.in} MB/s</div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Network Out</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{selectedHost.network.out} MB/s</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span>Processes: {selectedHost.processes}</span>
                  <span>Uptime: {selectedHost.uptime}</span>
                </div>

                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedHost.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Incident Detail Dialog */}
        <Dialog open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedIncident?.severity === 'critical' ? (
                  <XCircle className="w-5 h-5 text-red-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                )}
                {selectedIncident?.id}
              </DialogTitle>
            </DialogHeader>
            {selectedIncident && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{selectedIncident.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${getSeverityColor(selectedIncident.severity)}`}>
                      {selectedIncident.severity}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      selectedIncident.status === 'resolved' ? 'bg-green-500/10 text-green-500' :
                      selectedIncident.status === 'acknowledged' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {selectedIncident.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Service:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{selectedIncident.service}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{selectedIncident.duration}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Assignee:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">{selectedIncident.assignee || 'Unassigned'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Started:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {new Date(selectedIncident.startedAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Timeline</h4>
                  <div className="space-y-3">
                    {selectedIncident.timeline.map((event, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          {i < selectedIncident.timeline.length - 1 && (
                            <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 mt-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-3">
                          <div className="text-xs text-gray-500 dark:text-gray-400">{event.time}</div>
                          <div className="text-sm text-gray-900 dark:text-white">{event.event}</div>
                          {event.user && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">by {event.user}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedIncident.status !== 'resolved' && (
                  <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                      Acknowledge
                    </button>
                    <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                      Resolve
                    </button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create/Edit Health Score Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={(open) => {
          setShowCreateDialog(open)
          if (!open) {
            setFormState(initialFormState)
            setEditingId(null)
          }
        }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Health Score' : 'Create Health Score'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="customer_name">Customer Name *</Label>
                <Input
                  id="customer_name"
                  value={formState.customer_name}
                  onChange={(e) => setFormState(prev => ({ ...prev, customer_name: e.target.value }))}
                  placeholder="Enter customer name"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label htmlFor="account_type">Account Type</Label>
                  <select
                    id="account_type"
                    value={formState.account_type}
                    onChange={(e) => setFormState(prev => ({ ...prev, account_type: e.target.value }))}
                    className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                  >
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="overall_score">Overall Score</Label>
                  <Input
                    id="overall_score"
                    type="number"
                    min="0"
                    max="100"
                    value={formState.overall_score}
                    onChange={(e) => setFormState(prev => ({ ...prev, overall_score: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={formState.category}
                    onChange={(e) => setFormState(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="trend">Trend</Label>
                  <select
                    id="trend"
                    value={formState.trend}
                    onChange={(e) => setFormState(prev => ({ ...prev, trend: e.target.value }))}
                    className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                  >
                    <option value="improving">Improving</option>
                    <option value="stable">Stable</option>
                    <option value="declining">Declining</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label htmlFor="product_usage">Product Usage</Label>
                  <Input
                    id="product_usage"
                    type="number"
                    min="0"
                    max="100"
                    value={formState.product_usage}
                    onChange={(e) => setFormState(prev => ({ ...prev, product_usage: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="engagement">Engagement</Label>
                  <Input
                    id="engagement"
                    type="number"
                    min="0"
                    max="100"
                    value={formState.engagement}
                    onChange={(e) => setFormState(prev => ({ ...prev, engagement: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div>
                  <Label htmlFor="support_health">Support</Label>
                  <Input
                    id="support_health"
                    type="number"
                    min="0"
                    max="100"
                    value={formState.support_health}
                    onChange={(e) => setFormState(prev => ({ ...prev, support_health: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="financial">Financial</Label>
                  <Input
                    id="financial"
                    type="number"
                    min="0"
                    max="100"
                    value={formState.financial}
                    onChange={(e) => setFormState(prev => ({ ...prev, financial: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="sentiment">Sentiment</Label>
                  <Input
                    id="sentiment"
                    type="number"
                    min="0"
                    max="100"
                    value={formState.sentiment}
                    onChange={(e) => setFormState(prev => ({ ...prev, sentiment: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formState.notes}
                  onChange={(e) => setFormState(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                <Button onClick={editingId ? handleUpdateHealthScore : handleCreateHealthScore} disabled={isCreating || isUpdating}>
                  {(isCreating || isUpdating) ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : editingId ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Settings Dialog */}
        <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Health Score Settings
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h4 className="font-medium mb-2">Refresh Interval</h4>
                <select className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                  <option value="30">30 seconds</option>
                  <option value="60">1 minute</option>
                  <option value="300">5 minutes</option>
                  <option value="0">Manual only</option>
                </select>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h4 className="font-medium mb-2">Health Score Thresholds</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6 text-sm">
                  <div>
                    <Label>Excellent</Label>
                    <Input type="number" defaultValue={80} min={0} max={100} />
                  </div>
                  <div>
                    <Label>Good</Label>
                    <Input type="number" defaultValue={60} min={0} max={100} />
                  </div>
                  <div>
                    <Label>Fair</Label>
                    <Input type="number" defaultValue={40} min={0} max={100} />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>Cancel</Button>
                <Button onClick={handleSaveSettings}>Save Settings</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Alerts Configuration Dialog */}
        <Dialog open={showAlertsDialog} onOpenChange={setShowAlertsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Alert Configuration
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-3">
                {mockAlerts.slice(0, 3).map(alert => (
                  <div key={alert.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{alert.name}</p>
                      <p className="text-xs text-gray-500">{alert.condition}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={alert.enabled} className="sr-only peer" />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAlertsDialog(false)}>Cancel</Button>
                <Button onClick={handleSaveAlertConfig}>Save Alerts</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Metrics Dialog */}
        <Dialog open={showMetricsDialog} onOpenChange={setShowMetricsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Metrics Dashboard
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                  <p className="text-2xl font-bold text-emerald-600">{overallHealth}%</p>
                  <p className="text-xs text-gray-500">Overall Health</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">{avgApdex.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">Avg Apdex</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                  <p className="text-2xl font-bold text-orange-600">{avgErrorRate.toFixed(2)}%</p>
                  <p className="text-xs text-gray-500">Error Rate</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h4 className="font-medium mb-3">Service Performance</h4>
                <div className="space-y-2">
                  {mockServices.slice(0, 4).map(service => (
                    <div key={service.id} className="flex items-center justify-between text-sm">
                      <span>{service.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={service.status === 'healthy' ? 'text-green-600' : 'text-yellow-600'}>{service.status}</span>
                        <span className="text-gray-500">{service.uptime}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setShowMetricsDialog(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reports Dialog */}
        <Dialog open={showReportsDialog} onOpenChange={setShowReportsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Health Reports
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <button
                  onClick={() => { handleExportHealth(); setShowReportsDialog(false); }}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <p className="font-medium">Export Health Report (CSV)</p>
                  <p className="text-xs text-gray-500">Download all health metrics as CSV</p>
                </button>
                <button
                  onClick={() => { handleExportReportAsJson(); setShowReportsDialog(false); }}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <p className="font-medium">Export Health Report (JSON)</p>
                  <p className="text-xs text-gray-500">Download all health metrics as JSON</p>
                </button>
                <button
                  onClick={() => { handleExportReportAsPdf(); setShowReportsDialog(false); }}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <p className="font-medium">Export Health Report (PDF)</p>
                  <p className="text-xs text-gray-500">Generate a printable PDF report</p>
                </button>
                <button
                  onClick={() => { handleShareReport(); setShowReportsDialog(false); }}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <p className="font-medium">Share Health Report</p>
                  <p className="text-xs text-gray-500">Share via email or copy link</p>
                </button>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowReportsDialog(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  )
}
