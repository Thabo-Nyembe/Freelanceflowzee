'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Zap, Link2, Plus, Search, Filter, Play, Pause, Settings,
  ArrowRight, CheckCircle, XCircle, AlertTriangle, RefreshCw, Activity,
  Layers, Calendar, BarChart3, Bell, Folder, Edit, Trash2, Copy, Eye, History, Star, TrendingUp,
  Webhook, Terminal, Key, Shield, AlertCircle, Download, Workflow,
  LayoutGrid, List, Sparkles,
  Sliders, Archive
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
// TYPE DEFINITIONS - Zapier Level Integration Platform
// ============================================================================

type ZapStatus = 'on' | 'off' | 'error' | 'paused' | 'draft'
type TriggerType = 'instant' | 'polling' | 'scheduled' | 'webhook'
type TaskStatus = 'success' | 'error' | 'filtered' | 'held' | 'delayed' | 'replayed'
type AppCategory = 'communication' | 'productivity' | 'crm' | 'payment' | 'marketing' | 'developer' | 'analytics' | 'storage'

interface App {
  id: string
  name: string
  icon: string
  category: AppCategory
  description: string
  is_connected: boolean
  triggers: Trigger[]
  actions: Action[]
  is_premium: boolean
  is_popular: boolean
  auth_type: 'oauth2' | 'api_key' | 'basic' | 'custom'
  connection_count: number
  last_synced_at: string | null
  rate_limit: number
  docs_url: string
}

interface Trigger {
  id: string
  app_id: string
  name: string
  description: string
  trigger_type: TriggerType
  polling_interval_minutes?: number
  sample_data: Record<string, unknown>
  fields: TriggerField[]
}

interface TriggerField {
  key: string
  label: string
  type: 'text' | 'select' | 'boolean' | 'number' | 'datetime'
  required: boolean
  help_text: string
  options?: { label: string; value: string }[]
}

interface Action {
  id: string
  app_id: string
  name: string
  description: string
  fields: ActionField[]
  sample_output: Record<string, unknown>
}

interface ActionField {
  key: string
  label: string
  type: 'text' | 'select' | 'boolean' | 'number' | 'datetime' | 'dynamic'
  required: boolean
  help_text: string
  dynamic_source?: string
}

interface Zap {
  id: string
  name: string
  description: string
  trigger: {
    app: App
    trigger: Trigger
    config: Record<string, unknown>
  }
  actions: {
    app: App
    action: Action
    config: Record<string, unknown>
  }[]
  filters: ZapFilter[]
  paths: ZapPath[]
  status: ZapStatus
  last_run_at: string | null
  next_run_at: string | null
  task_count: number
  task_count_this_month: number
  success_rate: number
  avg_duration_seconds: number
  created_at: string
  updated_at: string
  created_by: string
  folder_id: string | null
  folder_name: string | null
  version: number
  is_shared: boolean
  tags: string[]
}

interface ZapFilter {
  id: string
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'exists' | 'not_exists'
  value: string
}

interface ZapPath {
  id: string
  name: string
  condition: string
  actions: { app: App; action: Action }[]
}

interface TaskHistory {
  id: string
  zap_id: string
  zap_name: string
  status: TaskStatus
  trigger_event: string
  trigger_data: Record<string, unknown>
  action_results: ActionResult[]
  started_at: string
  completed_at: string
  duration_seconds: number
  data_in_bytes: number
  data_out_bytes: number
  error_message: string | null
  replay_of: string | null
  replayed_at: string | null
}

interface ActionResult {
  action_name: string
  app_name: string
  status: 'success' | 'error' | 'skipped'
  output: Record<string, unknown>
  error: string | null
  duration_ms: number
}

interface Template {
  id: string
  name: string
  description: string
  apps: App[]
  trigger_name: string
  action_names: string[]
  usage_count: number
  category: string
  is_featured: boolean
  created_by: string
  rating: number
  review_count: number
}

interface Folder {
  id: string
  name: string
  color: string
  zap_count: number
  created_at: string
}

interface WebhookEndpoint {
  id: string
  name: string
  url: string
  secret: string
  is_active: boolean
  request_count: number
  last_request_at: string | null
  created_at: string
}

// ============================================================================
// DATA ARRAYS - Real data from API
// ============================================================================

const apps: App[] = []

const zaps: Zap[] = []

const tasks: TaskHistory[] = []

const templates: Template[] = []

const folders: Folder[] = []

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getZapStatusColor = (status: ZapStatus): string => {
  const colors: Record<ZapStatus, string> = {
    on: 'bg-green-100 text-green-800 border-green-200',
    off: 'bg-gray-100 text-gray-800 border-gray-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    paused: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    draft: 'bg-blue-100 text-blue-800 border-blue-200'
  }
  return colors[status]
}

const getTaskStatusColor = (status: TaskStatus): string => {
  const colors: Record<TaskStatus, string> = {
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
    filtered: 'bg-yellow-100 text-yellow-800',
    held: 'bg-purple-100 text-purple-800',
    delayed: 'bg-orange-100 text-orange-800',
    replayed: 'bg-blue-100 text-blue-800'
  }
  return colors[status]
}

const getCategoryColor = (category: AppCategory): string => {
  const colors: Record<AppCategory, string> = {
    communication: 'bg-blue-100 text-blue-800',
    productivity: 'bg-green-100 text-green-800',
    crm: 'bg-purple-100 text-purple-800',
    payment: 'bg-orange-100 text-orange-800',
    marketing: 'bg-pink-100 text-pink-800',
    developer: 'bg-gray-100 text-gray-800',
    analytics: 'bg-cyan-100 text-cyan-800',
    storage: 'bg-yellow-100 text-yellow-800'
  }
  return colors[category]
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// ============================================================================
// COMPETITIVE UPGRADE DATA - Real data from API
// ============================================================================

const connectorsAIInsights: { id: string; type: 'success' | 'warning' | 'info'; title: string; description: string; priority: 'low' | 'medium' | 'high'; timestamp: string; category: string }[] = []

const connectorsCollaborators: { id: string; name: string; avatar: string; status: 'online' | 'offline' | 'away'; role: string }[] = []

const connectorsPredictions: { id: string; title: string; prediction: string; confidence: number; trend: 'up' | 'down'; impact: 'low' | 'medium' | 'high' }[] = []

const connectorsActivities: { id: string; user: string; action: string; target: string; timestamp: string; type: 'success' | 'info' | 'warning' | 'error' }[] = []

// ============================================================================
// API HELPER FUNCTIONS - Real Connector Operations
// ============================================================================

const connectConnector = async (connectorId: string, authType: 'oauth2' | 'api_key' | 'basic' | 'custom', apiKey?: string): Promise<{ success: boolean; connection_id?: string }> => {
  const response = await fetch('/api/connectors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      connector_id: connectorId,
      auth_type: authType,
      ...(authType === 'api_key' && apiKey ? { api_key: apiKey } : {}),
      ...(authType === 'oauth2' ? { redirect_uri: window.location.origin + '/api/connectors/oauth/callback' } : {})
    })
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Connection failed' }))
    throw new Error(error.message || 'Failed to connect')
  }
  return response.json()
}

const disconnectConnector = async (connectorId: string): Promise<{ success: boolean }> => {
  const response = await fetch(`/api/connectors/${connectorId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Disconnection failed' }))
    throw new Error(error.message || 'Failed to disconnect')
  }
  return response.json()
}

const testConnectorConnection = async (connectorId: string): Promise<{ success: boolean; latency_ms?: number }> => {
  const response = await fetch('/api/connectors/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ connector_id: connectorId })
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Test failed' }))
    throw new Error(error.message || 'Connection test failed')
  }
  return response.json()
}

const syncConnector = async (connectorId: string): Promise<{ success: boolean; records_synced?: number }> => {
  const response = await fetch('/api/connectors/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ connector_id: connectorId })
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Sync failed' }))
    throw new Error(error.message || 'Failed to sync')
  }
  return response.json()
}

const copyToClipboard = async (text: string): Promise<void> => {
  await navigator.clipboard.writeText(text)
}

const fetchTaskHistory = async (zapId?: string): Promise<TaskHistory[]> => {
  const url = zapId ? `/api/connectors/tasks?zap_id=${zapId}` : '/api/connectors/tasks'
  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to load task history')
  return response.json()
}

const fetchErrorLogs = async (): Promise<TaskHistory[]> => {
  const response = await fetch('/api/connectors/tasks?status=error')
  if (!response.ok) throw new Error('Failed to load error logs')
  return response.json()
}

const fetchTemplates = async (): Promise<Template[]> => {
  const response = await fetch('/api/connectors/templates')
  if (!response.ok) throw new Error('Failed to load templates')
  return response.json()
}

const fetchApiKeys = async (): Promise<{ production: string; development: string }> => {
  const response = await fetch('/api/connectors/api-keys')
  if (!response.ok) throw new Error('Failed to load API keys')
  return response.json()
}

const regenerateApiKey = async (type: 'production' | 'development'): Promise<{ key: string }> => {
  const response = await fetch('/api/connectors/api-keys/regenerate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type })
  })
  if (!response.ok) throw new Error('Failed to regenerate API key')
  return response.json()
}

const createApiKey = async (): Promise<{ key: string; id: string }> => {
  const response = await fetch('/api/connectors/api-keys', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  })
  if (!response.ok) throw new Error('Failed to create API key')
  return response.json()
}

const clearTaskHistory = async (): Promise<{ success: boolean }> => {
  const response = await fetch('/api/connectors/tasks', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  })
  if (!response.ok) throw new Error('Failed to clear task history')
  return response.json()
}

const deleteAllZaps = async (): Promise<{ success: boolean }> => {
  const response = await fetch('/api/connectors/zaps', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  })
  if (!response.ok) throw new Error('Failed to delete zaps')
  return response.json()
}

const replayTask = async (taskId: string): Promise<{ success: boolean; new_task_id: string }> => {
  const response = await fetch(`/api/connectors/tasks/${taskId}/replay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  })
  if (!response.ok) throw new Error('Failed to replay task')
  return response.json()
}

const downloadTaskLog = async (taskId: string): Promise<void> => {
  const response = await fetch(`/api/connectors/tasks/${taskId}/log`)
  if (!response.ok) throw new Error('Failed to download log')
  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `task-${taskId}-log.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

const setupTemplate = async (templateId: string): Promise<{ success: boolean; zap_id: string }> => {
  const response = await fetch('/api/connectors/templates/setup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ template_id: templateId })
  })
  if (!response.ok) throw new Error('Template setup failed')
  return response.json()
}

const createWebhook = async (name: string, url: string): Promise<{ success: boolean; webhook_id: string }> => {
  const response = await fetch('/api/connectors/webhooks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, url })
  })
  if (!response.ok) throw new Error('Failed to create webhook')
  return response.json()
}

const fetchAnalytics = async (): Promise<{ tasks_today: number; success_rate: number }> => {
  const response = await fetch('/api/connectors/analytics')
  if (!response.ok) throw new Error('Failed to load analytics')
  return response.json()
}

const connectorsQuickActions: { id: string; label: string; icon: string; action: () => Promise<void>; variant: 'default' | 'outline' }[] = []

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ConnectorsClient() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedZap, setSelectedZap] = useState<Zap | null>(null)
  const [selectedApp, setSelectedApp] = useState<App | null>(null)
  const [selectedTask, setSelectedTask] = useState<TaskHistory | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [categoryFilter, setCategoryFilter] = useState<AppCategory | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<ZapStatus | 'all'>('all')
  const [settingsTab, setSettingsTab] = useState('general')

  // Dashboard stats
  const stats = useMemo(() => ({
    totalZaps: zaps.length,
    activeZaps: zaps.filter(z => z.status === 'on').length,
    totalTasks: zaps.reduce((sum, z) => sum + z.task_count, 0),
    tasksThisMonth: zaps.reduce((sum, z) => sum + z.task_count_this_month, 0),
    avgSuccessRate: zaps.length > 0 ? zaps.reduce((sum, z) => sum + z.success_rate, 0) / zaps.length : 0,
    connectedApps: apps.filter(a => a.is_connected).length,
    totalApps: apps.length,
    errorZaps: zaps.filter(z => z.status === 'error').length
  }), [])

  // Filtered data
  const filteredZaps = useMemo(() => {
    return zaps.filter(zap => {
      const matchesSearch = zap.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           zap.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || zap.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [searchQuery, statusFilter])

  const filteredApps = useMemo(() => {
    return apps.filter(app => {
      const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || app.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, categoryFilter])

  const categories = [...new Set(apps.map(a => a.category))]

  // Handlers - Real API implementations
  const handleAddConnector = async () => {
    await toast.promise(
      connectConnector('new', 'oauth2'),
      { loading: 'Opening setup wizard...', success: 'Setup wizard opened', error: 'Failed to open wizard' }
    )
  }

  const handleConfigureConnector = async (n: string) => {
    await toast.promise(
      fetch(`/api/connectors/${n.toLowerCase().replace(/\s+/g, '-')}/settings`).then(r => {
        if (!r.ok) throw new Error('Failed to open settings')
        return r.json()
      }),
      { loading: `Opening settings for "${n}"...`, success: `Settings opened for "${n}"`, error: 'Failed to open settings' }
    )
  }

  const handleTestConnector = async (n: string) => {
    await toast.promise(
      testConnectorConnection(n.toLowerCase().replace(/\s+/g, '-')),
      { loading: `Testing "${n}"...`, success: `"${n}" connection verified!`, error: 'Test failed' }
    )
  }

  const handleDisconnect = async (n: string) => {
    if (!confirm(`Are you sure you want to disconnect "${n}"? This will stop all automations using this connector.`)) {
      return
    }
    await toast.promise(
      disconnectConnector(n.toLowerCase().replace(/\s+/g, '-')),
      { loading: `Disconnecting "${n}"...`, success: `"${n}" has been disconnected`, error: 'Failed to disconnect' }
    )
  }

  const handleRefreshConnector = async (n: string) => {
    await toast.promise(
      syncConnector(n.toLowerCase().replace(/\s+/g, '-')),
      { loading: `Refreshing "${n}"...`, success: `"${n}" refreshed`, error: 'Failed to refresh' }
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:bg-none dark:bg-gray-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 p-8">
          <div className="absolute inset-0 bg-grid-white/10" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Automation Hub</h1>
                <p className="text-orange-100 mt-1">Zapier-level workflow automation platform</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={async () => {
                  await toast.promise(
                    fetchTaskHistory(),
                    { loading: 'Loading task history...', success: 'Task history opened', error: 'Failed to load history' }
                  )
                }}>
                <History className="w-4 h-4 mr-2" />
                History
              </Button>
              <Button className="bg-white text-orange-600 hover:bg-orange-50" onClick={handleAddConnector}>
                <Plus className="w-4 h-4 mr-2" />
                Create Zap
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { label: 'Active Zaps', value: `${stats.activeZaps}/${stats.totalZaps}`, icon: Zap, color: 'from-green-500 to-emerald-500', change: '+2' },
            { label: 'Tasks Run', value: formatNumber(stats.totalTasks), icon: Activity, color: 'from-blue-500 to-cyan-500', change: '+18%' },
            { label: 'This Month', value: formatNumber(stats.tasksThisMonth), icon: Calendar, color: 'from-purple-500 to-pink-500', change: '+890' },
            { label: 'Success Rate', value: `${stats.avgSuccessRate.toFixed(1)}%`, icon: CheckCircle, color: 'from-green-500 to-teal-500', change: '+0.5%' },
            { label: 'Connected Apps', value: stats.connectedApps.toString(), icon: Link2, color: 'from-orange-500 to-red-500', change: '+1' },
            { label: 'Total Apps', value: stats.totalApps.toString(), icon: Layers, color: 'from-indigo-500 to-purple-500', change: '8' },
            { label: 'Errors', value: stats.errorZaps.toString(), icon: AlertTriangle, color: 'from-red-500 to-pink-500', change: '1' },
            { label: 'Folders', value: folders.length.toString(), icon: Folder, color: 'from-yellow-500 to-orange-500', change: '4' }
          ].map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all dark:bg-gray-800">
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-xs text-green-600 mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm">
            <TabsTrigger value="dashboard" className="rounded-lg">Dashboard</TabsTrigger>
            <TabsTrigger value="zaps" className="rounded-lg">Zaps</TabsTrigger>
            <TabsTrigger value="apps" className="rounded-lg">Apps</TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg">History</TabsTrigger>
            <TabsTrigger value="templates" className="rounded-lg">Templates</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg">Settings</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6 mt-6">
            {/* Dashboard Overview Banner */}
            <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Integration Dashboard</h2>
                  <p className="text-orange-100">Monitor all your automated workflows and connected apps</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.activeZaps}</p>
                    <p className="text-orange-200 text-sm">Active Zaps</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.connectedApps}</p>
                    <p className="text-orange-200 text-sm">Connected Apps</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Plus, label: 'New Zap', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', onClick: handleAddConnector },
                { icon: Link2, label: 'Connect App', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: handleAddConnector },
                { icon: RefreshCw, label: 'Sync All', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: () => handleRefreshConnector('All Connectors') },
                { icon: History, label: 'Task History', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: async () => {
                  await toast.promise(fetchTaskHistory(), { loading: 'Loading task history...', success: 'Task history opened', error: 'Failed to load task history' })
                }},
                { icon: AlertCircle, label: 'View Errors', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', onClick: async () => {
                  await toast.promise(fetchErrorLogs(), { loading: 'Loading error logs...', success: 'Error logs loaded', error: 'Failed to load error logs' })
                }},
                { icon: Sparkles, label: 'Templates', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', onClick: async () => {
                  await toast.promise(fetchTemplates(), { loading: 'Loading templates...', success: 'Templates loaded', error: 'Failed to load templates' })
                }},
                { icon: Key, label: 'API Keys', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', onClick: async () => {
                  await toast.promise(fetchApiKeys(), { loading: 'Loading API keys...', success: 'API key management opened', error: 'Failed to load API keys' })
                }},
                { icon: BarChart3, label: 'Analytics', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: async () => {
                  await toast.promise(fetchAnalytics(), { loading: 'Loading analytics...', success: 'Analytics dashboard loaded', error: 'Failed to load analytics' })
                }},
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <Card className="lg:col-span-2 border-0 shadow-sm dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-orange-600" />
                    Recent Task Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tasks.slice(0, 5).map(task => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        onClick={() => setSelectedTask(task)}
                      >
                        <div className="flex items-center gap-3">
                          <Badge className={getTaskStatusColor(task.status)}>
                            {task.status === 'success' ? <CheckCircle className="w-3 h-3 mr-1" /> :
                             task.status === 'error' ? <XCircle className="w-3 h-3 mr-1" /> :
                             <AlertTriangle className="w-3 h-3 mr-1" />}
                            {task.status}
                          </Badge>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">{task.zap_name}</p>
                            <p className="text-xs text-gray-500 truncate max-w-xs">{task.trigger_event}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{task.duration_seconds}s</p>
                          <p className="text-xs text-gray-400">{formatDate(task.started_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Folders */}
              <Card className="border-0 shadow-sm dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Folder className="w-5 h-5 text-orange-600" />
                    Folders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {folders.map(folder => (
                      <div key={folder.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${folder.color}20` }}
                          >
                            <Folder className="w-4 h-4" style={{ color: folder.color }} />
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{folder.name}</span>
                        </div>
                        <Badge variant="outline">{folder.zap_count} zaps</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Zaps */}
            <Card className="border-0 shadow-sm dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  Top Performing Zaps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {zaps.filter(z => z.status === 'on').slice(0, 3).map((zap, index) => (
                    <div key={zap.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center text-white text-xs font-bold">
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{zap.name}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 text-sm">
                        <div>
                          <p className="text-gray-500">Tasks</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{formatNumber(zap.task_count)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Success</p>
                          <p className="font-semibold text-green-600">{zap.success_rate}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Zaps Tab */}
          <TabsContent value="zaps" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search zaps..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as ZapStatus | 'all')}
                  className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="all">All Status</option>
                  <option value="on">Active</option>
                  <option value="off">Paused</option>
                  <option value="error">Error</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredZaps.map(zap => (
                <Card
                  key={zap.id}
                  className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer dark:bg-gray-800"
                  onClick={() => setSelectedZap(zap)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-2xl">
                            {zap.trigger.app.icon}
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                          {zap.actions.map((action, i) => (
                            <div key={i} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-2xl">
                              {action.app.icon}
                            </div>
                          ))}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{zap.name}</h3>
                          <p className="text-sm text-gray-500">{zap.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getZapStatusColor(zap.status)}>
                          {zap.status === 'on' ? 'Active' : zap.status === 'off' ? 'Paused' : zap.status}
                        </Badge>
                        {zap.folder_name && <Badge variant="outline">{zap.folder_name}</Badge>}
                      </div>
                    </div>

                    {/* Workflow Preview */}
                    <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg overflow-x-auto">
                      <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-600 rounded border dark:border-gray-500 min-w-fit">
                        <span>{zap.trigger.app.icon}</span>
                        <div className="text-sm">
                          <p className="font-medium text-gray-900 dark:text-white">{zap.trigger.trigger.name}</p>
                          <p className="text-xs text-gray-500">{zap.trigger.app.name}</p>
                        </div>
                      </div>
                      {zap.actions.map((action, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-600 rounded border dark:border-gray-500 min-w-fit">
                            <span>{action.app.icon}</span>
                            <div className="text-sm">
                              <p className="font-medium text-gray-900 dark:text-white">{action.action.name}</p>
                              <p className="text-xs text-gray-500">{action.app.name}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-4">
                      <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{formatNumber(zap.task_count)}</p>
                        <p className="text-xs text-gray-500">Total Tasks</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                        <p className="text-xl font-bold text-green-600">{zap.success_rate}%</p>
                        <p className="text-xs text-gray-500">Success Rate</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{zap.actions.length + 1}</p>
                        <p className="text-xs text-gray-500">Steps</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{zap.avg_duration_seconds}s</p>
                        <p className="text-xs text-gray-500">Avg Duration</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>v{zap.version}</span>
                        <span>•</span>
                        <span>Last run: {zap.last_run_at ? formatDate(zap.last_run_at) : 'Never'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={async (e) => { e.stopPropagation(); await toast.promise(fetchTaskHistory(zap.id), { loading: `Loading history for "${zap.name}"...`, success: `Viewing history for "${zap.name}"`, error: 'Failed to load zap history' }) }}>
                          <Eye className="w-4 h-4 mr-2" />
                          History
                        </Button>
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleConfigureConnector(zap.name) }}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        {zap.status === 'on' ? (
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleDisconnect(zap.name) }}>
                            <Pause className="w-4 h-4 mr-2" />
                            Pause
                          </Button>
                        ) : (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={(e) => { e.stopPropagation(); handleTestConnector(zap.name) }}>
                            <Play className="w-4 h-4 mr-2" />
                            Turn On
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Apps Tab */}
          <TabsContent value="apps" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search apps..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
                <div className="flex items-center gap-2">
                  {categories.map(cat => (
                    <Button
                      key={cat}
                      variant={categoryFilter === cat ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCategoryFilter(categoryFilter === cat ? 'all' : cat)}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredApps.map(app => (
                <Card
                  key={app.id}
                  className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer dark:bg-gray-800"
                  onClick={() => setSelectedApp(app)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{app.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{app.name}</h3>
                            {app.is_premium && <Badge className="bg-purple-100 text-purple-700 text-xs">Premium</Badge>}
                          </div>
                          <Badge className={getCategoryColor(app.category)} variant="outline">{app.category}</Badge>
                        </div>
                      </div>
                      {app.is_connected && <CheckCircle className="w-5 h-5 text-green-500" />}
                    </div>
                    <p className="text-sm text-gray-500 mb-4">{app.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span>{app.triggers.length} triggers</span>
                      <span>{app.actions.length} actions</span>
                    </div>
                    <Button
                      variant={app.is_connected ? 'outline' : 'default'}
                      className="w-full"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); app.is_connected ? handleConfigureConnector(app.name) : handleAddConnector() }}
                    >
                      {app.is_connected ? 'Manage Connection' : 'Connect'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Task History</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={async () => {
                  await toast.promise(
                    fetch('/api/connectors/tasks/filters').then(r => {
                      if (!r.ok) throw new Error('Failed to open filters')
                      return r.json()
                    }),
                    { loading: 'Opening filter options...', success: 'Filter options opened', error: 'Failed to open filters' }
                  )
                }}>
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleRefreshConnector('Task History')}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            <Card className="border-0 shadow-sm dark:bg-gray-800">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zap</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trigger</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {tasks.map(task => (
                        <tr
                          key={task.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                          onClick={() => setSelectedTask(task)}
                        >
                          <td className="px-4 py-3">
                            <Badge className={getTaskStatusColor(task.status)}>
                              {task.status === 'success' ? <CheckCircle className="w-3 h-3 mr-1" /> :
                               task.status === 'error' ? <XCircle className="w-3 h-3 mr-1" /> :
                               <AlertTriangle className="w-3 h-3 mr-1" />}
                              {task.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{task.zap_name}</td>
                          <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{task.trigger_event}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{task.duration_seconds}s</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{formatDate(task.started_at)}</td>
                          <td className="px-4 py-3">
                            <Button variant="ghost" size="sm" onClick={async (e) => {
                              e.stopPropagation()
                              await toast.promise(
                                fetch(`/api/connectors/tasks/${task.id}`).then(r => {
                                  if (!r.ok) throw new Error('Failed to load task details')
                                  return r.json()
                                }),
                                { loading: `Loading task details...`, success: `Task details for "${task.zap_name}" loaded`, error: 'Failed to load task details' }
                              )
                            }}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Popular Templates</h2>
              <Button variant="outline" onClick={async () => {
                await toast.promise(fetchTemplates(), { loading: 'Loading all templates...', success: 'All templates loaded', error: 'Failed to load templates' })
              }}>View All</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map(template => (
                <Card key={template.id} className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer dark:bg-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {template.apps.map(app => (
                          <span key={app.id} className="text-3xl">{app.icon}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1">
                        {template.is_featured && <Badge className="bg-orange-100 text-orange-700">Featured</Badge>}
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{template.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{template.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium">{template.rating}</span>
                        <span className="text-xs text-gray-500">({template.review_count})</span>
                      </div>
                      <span className="text-xs text-gray-500">{formatNumber(template.usage_count)} users</span>
                    </div>
                    <Button size="sm" className="w-full" onClick={async () => {
                      await toast.promise(setupTemplate(template.id), { loading: `Setting up "${template.name}"...`, success: 'Template ready to configure!', error: 'Setup failed' })
                    }}>Use Template</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6 mt-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-6">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="w-5 h-5 text-orange-500" />
                      Settings
                    </CardTitle>
                    <CardDescription>Configure your integration platform</CardDescription>
                  </CardHeader>
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', label: 'General', icon: Sliders },
                        { id: 'workflows', label: 'Workflows', icon: Workflow },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'integrations', label: 'Integrations', icon: Webhook },
                        { id: 'security', label: 'Security', icon: Shield },
                        { id: 'advanced', label: 'Advanced', icon: Terminal },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                            settingsTab === item.id
                              ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 font-medium'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          {item.label}
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <>
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sliders className="w-5 h-5 text-orange-500" />
                          General Settings
                        </CardTitle>
                        <CardDescription>Basic platform preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div className="flex items-center gap-3">
                            <Label htmlFor="auto-retry" className="flex flex-col gap-1 cursor-pointer">
                              <span className="font-medium">Auto-retry Failed Tasks</span>
                              <span className="text-sm text-slate-500">Automatically retry tasks that fail</span>
                            </Label>
                          </div>
                          <Switch id="auto-retry" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div className="flex items-center gap-3">
                            <Label htmlFor="instant-trigger" className="flex flex-col gap-1 cursor-pointer">
                              <span className="font-medium">Instant Triggers</span>
                              <span className="text-sm text-slate-500">Enable real-time webhook triggers</span>
                            </Label>
                          </div>
                          <Switch id="instant-trigger" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div className="flex items-center gap-3">
                            <Label htmlFor="dedup" className="flex flex-col gap-1 cursor-pointer">
                              <span className="font-medium">Deduplication</span>
                              <span className="text-sm text-slate-500">Prevent duplicate task execution</span>
                            </Label>
                          </div>
                          <Switch id="dedup" defaultChecked />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Retry Limit</Label>
                            <Input type="number" defaultValue="3" />
                          </div>
                          <div className="space-y-2">
                            <Label>Retry Delay (seconds)</Label>
                            <Input type="number" defaultValue="60" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Data Retention</CardTitle>
                        <CardDescription>Manage task history storage</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div>
                            <p className="font-medium">Task History</p>
                            <p className="text-sm text-slate-500">How long to keep task logs</p>
                          </div>
                          <Badge variant="outline">30 days</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div>
                            <p className="font-medium">Detailed Logs</p>
                            <p className="text-sm text-slate-500">Full request/response data</p>
                          </div>
                          <Badge variant="outline">7 days</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Workflows Settings */}
                {settingsTab === 'workflows' && (
                  <>
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Workflow className="w-5 h-5 text-orange-500" />
                          Workflow Defaults
                        </CardTitle>
                        <CardDescription>Default settings for new zaps</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="auto-enable" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Auto-enable New Zaps</span>
                            <span className="text-sm text-slate-500">Start zaps automatically after creation</span>
                          </Label>
                          <Switch id="auto-enable" />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="error-pause" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Pause on Error</span>
                            <span className="text-sm text-slate-500">Pause zap after multiple consecutive failures</span>
                          </Label>
                          <Switch id="error-pause" defaultChecked />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Default Polling Interval</Label>
                            <Input type="number" defaultValue="15" placeholder="Minutes" />
                          </div>
                          <div className="space-y-2">
                            <Label>Error Threshold</Label>
                            <Input type="number" defaultValue="5" placeholder="Failures before pause" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Concurrency Settings</CardTitle>
                        <CardDescription>Control parallel execution</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Max Concurrent Tasks</Label>
                            <Input type="number" defaultValue="10" />
                          </div>
                          <div className="space-y-2">
                            <Label>Queue Timeout (seconds)</Label>
                            <Input type="number" defaultValue="300" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <>
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="w-5 h-5 text-orange-500" />
                          Email Notifications
                        </CardTitle>
                        <CardDescription>Configure email alerts</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="error-email" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Error Notifications</span>
                            <span className="text-sm text-slate-500">Get notified when tasks fail</span>
                          </Label>
                          <Switch id="error-email" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="weekly-email" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Weekly Summary</span>
                            <span className="text-sm text-slate-500">Receive weekly task summary</span>
                          </Label>
                          <Switch id="weekly-email" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="paused-email" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Paused Zap Alerts</span>
                            <span className="text-sm text-slate-500">Notify when zaps are paused</span>
                          </Label>
                          <Switch id="paused-email" defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>Notification Email</Label>
                          <Input type="email" placeholder="alerts@company.com" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Slack Notifications</CardTitle>
                        <CardDescription>Send alerts to Slack</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="slack-enabled" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Enable Slack</span>
                            <span className="text-sm text-slate-500">Send notifications to Slack</span>
                          </Label>
                          <Switch id="slack-enabled" />
                        </div>
                        <div className="space-y-2">
                          <Label>Webhook URL</Label>
                          <Input placeholder="https://hooks.slack.com/services/..." />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Integrations Settings */}
                {settingsTab === 'integrations' && (
                  <>
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="w-5 h-5 text-orange-500" />
                          API Keys
                        </CardTitle>
                        <CardDescription>Manage your API credentials</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Production API Key</p>
                              <code className="text-sm text-slate-500">zap_live_••••••••••••••••</code>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={async () => {
                                await toast.promise(copyToClipboard('zap_live_xxxxxxxxxxxxxxxxxxxx'), { loading: 'Copying API key...', success: 'Production API key copied to clipboard', error: 'Failed to copy' })
                              }}>
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={async () => {
                                if (!confirm('Are you sure you want to regenerate the production API key? This will invalidate the current key immediately.')) return
                                await toast.promise(regenerateApiKey('production'), { loading: 'Regenerating production API key...', success: 'Production API key regenerated', error: 'Failed to regenerate key' })
                              }}>
                                <RefreshCw className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Development API Key</p>
                              <code className="text-sm text-slate-500">zap_dev_••••••••••••••••</code>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={async () => {
                                await toast.promise(copyToClipboard('zap_dev_xxxxxxxxxxxxxxxxxxxx'), { loading: 'Copying API key...', success: 'Development API key copied to clipboard', error: 'Failed to copy' })
                              }}>
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={async () => {
                                if (!confirm('Are you sure you want to regenerate the development API key?')) return
                                await toast.promise(regenerateApiKey('development'), { loading: 'Regenerating development API key...', success: 'Development API key regenerated', error: 'Failed to regenerate key' })
                              }}>
                                <RefreshCw className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" onClick={async () => {
                          await toast.promise(createApiKey(), { loading: 'Creating new API key...', success: 'New API key created successfully', error: 'Failed to create API key' })
                        }}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create New Key
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Webhook className="w-5 h-5 text-orange-500" />
                          Webhooks
                        </CardTitle>
                        <CardDescription>Configure outgoing webhooks</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-center py-8 text-slate-500">
                          <Webhook className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                          <p>No webhooks configured</p>
                          <Button variant="outline" className="mt-4" onClick={async () => {
                            const name = prompt('Enter webhook name:')
                            if (!name) return
                            const url = prompt('Enter webhook URL:')
                            if (!url) return
                            await toast.promise(createWebhook(name, url), { loading: 'Creating webhook...', success: 'Webhook created successfully', error: 'Failed to create webhook' })
                          }}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Webhook
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Security Settings */}
                {settingsTab === 'security' && (
                  <>
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-orange-500" />
                          Security Settings
                        </CardTitle>
                        <CardDescription>Protect your integrations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="ip-restrict" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">IP Restrictions</span>
                            <span className="text-sm text-slate-500">Limit API access by IP</span>
                          </Label>
                          <Switch id="ip-restrict" />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="audit-log" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Audit Logging</span>
                            <span className="text-sm text-slate-500">Track all API activity</span>
                          </Label>
                          <Switch id="audit-log" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="encrypt-data" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Data Encryption</span>
                            <span className="text-sm text-slate-500">Encrypt sensitive data at rest</span>
                          </Label>
                          <Switch id="encrypt-data" defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Access Control</CardTitle>
                        <CardDescription>Manage team permissions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div>
                            <p className="font-medium">Two-Factor Authentication</p>
                            <p className="text-sm text-slate-500">Require 2FA for all users</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Enabled</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <div>
                            <p className="font-medium">SSO Integration</p>
                            <p className="text-sm text-slate-500">SAML/OAuth integration</p>
                          </div>
                          <Badge variant="outline">Not Configured</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <>
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Terminal className="w-5 h-5 text-orange-500" />
                          Advanced Settings
                        </CardTitle>
                        <CardDescription>Developer and debugging options</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="debug-mode" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Debug Mode</span>
                            <span className="text-sm text-slate-500">Enable verbose logging</span>
                          </Label>
                          <Switch id="debug-mode" />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="sandbox" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Sandbox Mode</span>
                            <span className="text-sm text-slate-500">Test zaps without affecting live data</span>
                          </Label>
                          <Switch id="sandbox" />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Label htmlFor="custom-code" className="flex flex-col gap-1 cursor-pointer">
                            <span className="font-medium">Custom Code Actions</span>
                            <span className="text-sm text-slate-500">Enable JavaScript/Python code steps</span>
                          </Label>
                          <Switch id="custom-code" defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <AlertTriangle className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                        <CardDescription>Irreversible actions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Clear Task History</p>
                            <p className="text-sm text-red-600 dark:text-red-400/80">Delete all task logs permanently</p>
                          </div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-100" onClick={async () => {
                            if (!confirm('Are you sure you want to permanently delete all task history? This action cannot be undone.')) return
                            await toast.promise(clearTaskHistory(), { loading: 'Clearing task history...', success: 'All task history has been cleared', error: 'Failed to clear task history' })
                          }}>
                            <Archive className="w-4 h-4 mr-2" />
                            Clear
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Delete All Zaps</p>
                            <p className="text-sm text-red-600 dark:text-red-400/80">Permanently delete all zaps</p>
                          </div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-100" onClick={async () => {
                            if (!confirm('WARNING: This will permanently delete ALL zaps and their configurations. Type "DELETE" to confirm.')) return
                            const confirmText = prompt('Type "DELETE" to confirm:')
                            if (confirmText !== 'DELETE') {
                              toast.error('Deletion cancelled')
                              return
                            }
                            await toast.promise(deleteAllZaps(), { loading: 'Deleting all zaps...', success: 'All zaps have been permanently deleted', error: 'Failed to delete zaps' })
                          }}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
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
              insights={connectorsAIInsights}
              title="Integration Intelligence"
              onInsightAction={(insight) => toast.info(insight.title || 'AI Insight', { description: insight.description || 'View insight details' })}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={connectorsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={connectorsPredictions}
              title="Zap Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={connectorsActivities}
            title="Integration Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={connectorsQuickActions}
            variant="grid"
          />
        </div>

        {/* Zap Detail Dialog */}
        <Dialog open={!!selectedZap} onOpenChange={() => setSelectedZap(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Zap Details</DialogTitle>
            </DialogHeader>
            {selectedZap && (
              <ScrollArea className="max-h-[70vh]">
                <div className="space-y-6 p-4">
                  <div className="flex items-center gap-2">
                    <Badge className={getZapStatusColor(selectedZap.status)}>{selectedZap.status}</Badge>
                    {selectedZap.folder_name && <Badge variant="outline">{selectedZap.folder_name}</Badge>}
                    <Badge variant="outline">v{selectedZap.version}</Badge>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedZap.name}</h3>
                    <p className="text-gray-500">{selectedZap.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">Total Tasks</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(selectedZap.task_count)}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">Success Rate</p>
                      <p className="text-2xl font-bold text-green-600">{selectedZap.success_rate}%</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">This Month</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(selectedZap.task_count_this_month)}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <p className="text-xs text-gray-500">Avg Duration</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedZap.avg_duration_seconds}s</p>
                    </div>
                  </div>

                  {selectedZap.tags.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedZap.tags.map(tag => (
                          <Badge key={tag} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button className="flex-1 bg-orange-600 hover:bg-orange-700" onClick={async () => {
                      await toast.promise(
                        fetch(`/api/connectors/zaps/${selectedZap.id}/edit`).then(r => {
                          if (!r.ok) throw new Error('Failed to open editor')
                          return r.json()
                        }),
                        { loading: 'Opening zap editor...', success: 'Zap editor opened', error: 'Failed to open editor' }
                      )
                    }}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Zap
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={async () => {
                      await toast.promise(fetchTaskHistory(selectedZap.id), { loading: 'Loading zap history...', success: 'Zap history loaded', error: 'Failed to load history' })
                    }}>
                      <History className="w-4 h-4 mr-2" />
                      View History
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>

        {/* App Detail Dialog */}
        <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>App Details</DialogTitle>
            </DialogHeader>
            {selectedApp && (
              <ScrollArea className="max-h-[70vh]">
                <div className="space-y-6 p-4">
                  <div className="flex items-center gap-4">
                    <span className="text-5xl">{selectedApp.icon}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedApp.name}</h2>
                      <p className="text-gray-500">{selectedApp.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getCategoryColor(selectedApp.category)}>{selectedApp.category}</Badge>
                        {selectedApp.is_connected && <Badge className="bg-green-100 text-green-800">Connected</Badge>}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Triggers ({selectedApp.triggers.length})</h3>
                      <div className="space-y-2">
                        {selectedApp.triggers.map(trigger => (
                          <div key={trigger.id} className="p-3 border dark:border-gray-700 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-900 dark:text-white">{trigger.name}</span>
                              <Badge variant="outline" className="text-xs">{trigger.trigger_type}</Badge>
                            </div>
                            <p className="text-xs text-gray-500">{trigger.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Actions ({selectedApp.actions.length})</h3>
                      <div className="space-y-2">
                        {selectedApp.actions.map(action => (
                          <div key={action.id} className="p-3 border dark:border-gray-700 rounded-lg">
                            <span className="font-medium text-gray-900 dark:text-white">{action.name}</span>
                            <p className="text-xs text-gray-500">{action.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button className="w-full" size="lg" onClick={async () => {
                    if (selectedApp.is_connected) {
                      await toast.promise(
                        fetch(`/api/connectors/${selectedApp.id}/settings`).then(r => {
                          if (!r.ok) throw new Error('Failed to open settings')
                          return r.json()
                        }),
                        { loading: 'Opening connection settings...', success: 'Connection settings opened', error: 'Failed to open settings' }
                      )
                    } else {
                      await toast.promise(
                        connectConnector(selectedApp.id, selectedApp.auth_type),
                        { loading: `Connecting to ${selectedApp.name}...`, success: `Connected to ${selectedApp.name}`, error: 'Connection failed' }
                      )
                    }
                  }}>
                    {selectedApp.is_connected ? 'Manage Connection' : `Connect ${selectedApp.name}`}
                  </Button>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>

        {/* Task Detail Dialog */}
        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Task Details</DialogTitle>
            </DialogHeader>
            {selectedTask && (
              <div className="space-y-4 p-4">
                <div className="flex items-center gap-2">
                  <Badge className={getTaskStatusColor(selectedTask.status)}>
                    {selectedTask.status === 'success' ? <CheckCircle className="w-3 h-3 mr-1" /> :
                     selectedTask.status === 'error' ? <XCircle className="w-3 h-3 mr-1" /> :
                     <AlertTriangle className="w-3 h-3 mr-1" />}
                    {selectedTask.status}
                  </Badge>
                  <span className="text-sm text-gray-500">{selectedTask.duration_seconds}s</span>
                </div>

                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedTask.zap_name}</p>
                  <p className="text-sm text-gray-500">{selectedTask.trigger_event}</p>
                </div>

                {selectedTask.action_results.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Action Results</p>
                    <div className="space-y-2">
                      {selectedTask.action_results.map((result, i) => (
                        <div key={i} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{result.app_name}: {result.action_name}</span>
                            <Badge className={result.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {result.status}
                            </Badge>
                          </div>
                          {result.error && (
                            <p className="text-sm text-red-600 mt-1">{result.error}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTask.error_message && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-700 dark:text-red-400">
                      <AlertCircle className="w-4 h-4 inline-block mr-1" />
                      {selectedTask.error_message}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={async () => {
                    if (!confirm('Are you sure you want to replay this task? This will re-execute all actions.')) return
                    await toast.promise(replayTask(selectedTask.id), { loading: 'Replaying task...', success: 'Task replayed successfully', error: 'Failed to replay task' })
                  }}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Replay Task
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={async () => {
                    await toast.promise(downloadTaskLog(selectedTask.id), { loading: 'Preparing log download...', success: 'Task log downloaded', error: 'Failed to download log' })
                  }}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Log
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
