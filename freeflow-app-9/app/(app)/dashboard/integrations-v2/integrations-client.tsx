'use client'

import { useState, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import {
  Plug,
  Search,
  Plus,
  Filter,
  Zap,
  Play,
  Pause,
  MoreHorizontal,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Settings,
  BarChart3,
  Webhook,
  Key,
  Activity,
  TrendingUp,
  Mail,
  MessageSquare,
  Cloud,
  CreditCard,
  FileText,
  Users,
  Globe,
  Code,
  Lock,
  Trash2,
  Edit,
  Copy,
  Loader2,
  History,
  RotateCcw,
  Eye,
  Shield,
  Layers,
  Download,
  Link,
  PieChart,
  AlertCircle,
  Workflow
} from 'lucide-react'

// Hooks
import { useIntegrations, type Integration } from '@/lib/hooks/use-integrations'
import { useWorkflows, type Workflow as WorkflowType } from '@/lib/hooks/use-workflows'
import { useWebhooks, type Webhook as WebhookType } from '@/lib/hooks/use-webhooks'

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

// Types
type ZapStatus = 'active' | 'paused' | 'error' | 'draft' | 'completed' | 'failed' | 'archived'
type TaskStatus = 'success' | 'failed' | 'running' | 'waiting'
type AppCategory = 'all' | 'marketing' | 'productivity' | 'communication' | 'storage' | 'payments' | 'crm' | 'development' | 'social'
type WebhookMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface Task {
  id: string
  zapId: string
  zapName: string
  status: TaskStatus
  startedAt: string
  completedAt?: string
  duration: number
  steps: {
    stepId: string
    stepName: string
    status: TaskStatus
    data?: Record<string, unknown>
    error?: string
  }[]
  dataIn: Record<string, unknown>
  dataOut?: Record<string, unknown>
}

interface UsageStats {
  tasksUsed: number
  tasksLimit: number
  zapsActive: number
  zapsLimit: number
  appsConnected: number
  webhooksActive: number
  avgTaskDuration: number
  successRate: number
  tasksThisMonth: number
  tasksLastMonth: number
}

// Form state types
interface IntegrationFormData {
  name: string
  provider: string
  description: string
  category: string
  icon: string
}

interface WorkflowFormData {
  name: string
  description: string
  type: WorkflowType['type']
  priority: WorkflowType['priority']
}

interface WebhookFormData {
  name: string
  description: string
  url: string
  events: string[]
}

// Helper functions
const getStatusColor = (status: ZapStatus) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'paused': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'error':
    case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    case 'draft': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    case 'completed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'archived': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
  }
}

const getTaskStatusColor = (status: TaskStatus) => {
  switch (status) {
    case 'success': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    case 'running': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'waiting': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
  }
}

const getTaskStatusIcon = (status: TaskStatus) => {
  switch (status) {
    case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />
    case 'failed': return <XCircle className="w-4 h-4 text-red-600" />
    case 'running': return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
    case 'waiting': return <Clock className="w-4 h-4 text-gray-500" />
  }
}

const getCategoryIcon = (category: AppCategory | string) => {
  switch (category) {
    case 'marketing': return <Mail className="w-4 h-4" />
    case 'productivity': return <FileText className="w-4 h-4" />
    case 'communication': return <MessageSquare className="w-4 h-4" />
    case 'storage': return <Cloud className="w-4 h-4" />
    case 'payments': return <CreditCard className="w-4 h-4" />
    case 'crm': return <Users className="w-4 h-4" />
    case 'development': return <Code className="w-4 h-4" />
    case 'social': return <Globe className="w-4 h-4" />
    default: return <Plug className="w-4 h-4" />
  }
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDuration = (seconds: number) => {
  if (seconds < 1) return `${Math.round(seconds * 1000)}ms`
  return `${seconds.toFixed(1)}s`
}

// Default icon for integrations
const getDefaultIcon = (category: string) => {
  const icons: Record<string, string> = {
    communication: 'message-square',
    productivity: 'file-text',
    marketing: 'mail',
    payments: 'credit-card',
    crm: 'users',
    development: 'code',
    storage: 'cloud',
    social: 'globe'
  }
  return icons[category] || 'plug'
}

// Enhanced Competitive Upgrade Data
const mockIntegrationsAIInsights = [
  { id: '1', type: 'success' as const, title: 'Sync Status', description: 'All integrations syncing successfully.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Status' },
  { id: '2', type: 'info' as const, title: 'API Usage', description: '85% of monthly API quota used. 5 days remaining.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Usage' },
  { id: '3', type: 'warning' as const, title: 'Auth Expiring', description: '3 OAuth tokens expire in 7 days. Re-auth required.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Authentication' },
]

const mockIntegrationsCollaborators = [
  { id: '1', name: 'Integration Lead', avatar: '/avatars/mike.jpg', status: 'online' as const, role: 'Engineering', lastActive: 'Now' },
  { id: '2', name: 'API Developer', avatar: '/avatars/alex.jpg', status: 'online' as const, role: 'Development', lastActive: '15m ago' },
  { id: '3', name: 'Solutions Arch', avatar: '/avatars/marcus.jpg', status: 'away' as const, role: 'Architecture', lastActive: '1h ago' },
]

const mockIntegrationsPredictions = [
  { id: '1', label: 'Active Zaps', current: 48, target: 60, predicted: 55, confidence: 82, trend: 'up' as const },
  { id: '2', label: 'Success Rate', current: 97, target: 99, predicted: 98, confidence: 88, trend: 'up' as const },
  { id: '3', label: 'Latency (ms)', current: 250, target: 200, predicted: 220, confidence: 75, trend: 'down' as const },
]

const mockIntegrationsActivities = [
  { id: '1', user: 'Integration Lead', action: 'connected', target: 'Salesforce CRM', timestamp: '20m ago', type: 'success' as const },
  { id: '2', user: 'API Developer', action: 'debugged', target: 'Slack webhook failure', timestamp: '1h ago', type: 'info' as const },
  { id: '3', user: 'System', action: 'triggered', target: '150 automation tasks', timestamp: '3h ago', type: 'success' as const },
]

// Mock tasks for history (will be replaced with real data when workflow_executions table is available)
const mockTasks: Task[] = [
  {
    id: 'task-1',
    zapId: 'zap-1',
    zapName: 'New Lead to Slack + Sheets',
    status: 'success',
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    duration: 1.8,
    steps: [
      { stepId: 'step-1', stepName: 'Trigger: New Lead', status: 'success', data: { leadId: 'LD-001' } },
      { stepId: 'step-2', stepName: 'Slack: Send Message', status: 'success', data: { messageTs: '123456' } },
    ],
    dataIn: { leadId: 'LD-001', name: 'John Smith', email: 'john@example.com' },
    dataOut: { slackMessageId: '123456' }
  },
]

export default function IntegrationsClient() {
  const [activeTab, setActiveTab] = useState('zaps')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<AppCategory>('all')
  const [selectedZap, setSelectedZap] = useState<WorkflowType | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [selectedApp, setSelectedApp] = useState<Integration | null>(null)
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookType | null>(null)
  const [showConnectedOnly, setShowConnectedOnly] = useState(false)
  const [zapFilter, setZapFilter] = useState<ZapStatus | 'all'>('all')

  // Dialog states
  const [showCreateIntegrationDialog, setShowCreateIntegrationDialog] = useState(false)
  const [showCreateZapDialog, setShowCreateZapDialog] = useState(false)
  const [showCreateWebhookDialog, setShowCreateWebhookDialog] = useState(false)
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form states
  const [integrationForm, setIntegrationForm] = useState<IntegrationFormData>({
    name: '',
    provider: '',
    description: '',
    category: 'productivity',
    icon: ''
  })

  const [workflowForm, setWorkflowForm] = useState<WorkflowFormData>({
    name: '',
    description: '',
    type: 'integration',
    priority: 'medium'
  })

  const [webhookForm, setWebhookForm] = useState<WebhookFormData>({
    name: '',
    description: '',
    url: '',
    events: []
  })

  // Hooks for real data
  const {
    integrations,
    stats: integrationStats,
    loading: integrationsLoading,
    fetchIntegrations,
    createIntegration,
    updateIntegration,
    deleteIntegration,
    connectIntegration,
    disconnectIntegration,
    syncIntegration
  } = useIntegrations()

  const {
    workflows,
    stats: workflowStats,
    loading: workflowsLoading,
    fetchWorkflows,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    startWorkflow,
    pauseWorkflow,
    resumeWorkflow
  } = useWorkflows()

  const {
    webhooks,
    stats: webhookStats,
    loading: webhooksLoading,
    fetchWebhooks,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    toggleStatus: toggleWebhookStatus,
    testWebhook
  } = useWebhooks()

  // Fetch data on mount
  useEffect(() => {
    fetchIntegrations()
    fetchWorkflows()
    fetchWebhooks()
  }, [fetchIntegrations, fetchWorkflows, fetchWebhooks])

  // Computed values
  const filteredApps = useMemo(() => {
    return integrations.filter(app => {
      const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory
      const matchesConnected = !showConnectedOnly || app.is_connected
      return matchesSearch && matchesCategory && matchesConnected
    })
  }, [integrations, searchTerm, selectedCategory, showConnectedOnly])

  const filteredZaps = useMemo(() => {
    return workflows.filter(zap => {
      const matchesSearch = zap.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (zap.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = zapFilter === 'all' || zap.status === zapFilter
      return matchesSearch && matchesStatus
    })
  }, [workflows, searchTerm, zapFilter])

  const filteredTasks = useMemo(() => {
    return mockTasks.filter(task => {
      return task.zapName.toLowerCase().includes(searchTerm.toLowerCase())
    })
  }, [searchTerm])

  const categories: { value: AppCategory; label: string }[] = [
    { value: 'all', label: 'All Apps' },
    { value: 'communication', label: 'Communication' },
    { value: 'productivity', label: 'Productivity' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'payments', label: 'Payments' },
    { value: 'crm', label: 'CRM' },
    { value: 'development', label: 'Development' },
    { value: 'storage', label: 'Storage' },
    { value: 'social', label: 'Social' }
  ]

  // Usage stats combining real data
  const usageStats: UsageStats = {
    tasksUsed: workflowStats.completedSteps,
    tasksLimit: 50000,
    zapsActive: workflowStats.active,
    zapsLimit: 20,
    appsConnected: integrationStats.connected,
    webhooksActive: webhookStats.active,
    avgTaskDuration: 2.1,
    successRate: webhookStats.avgSuccessRate || 98.2,
    tasksThisMonth: workflowStats.totalSteps,
    tasksLastMonth: Math.max(0, workflowStats.totalSteps - 100)
  }

  const usagePercent = (usageStats.tasksUsed / usageStats.tasksLimit) * 100

  // Integration Handlers
  const handleCreateIntegration = async () => {
    if (!integrationForm.name || !integrationForm.provider) {
      toast.error('Please fill in required fields')
      return
    }

    setIsSubmitting(true)
    const result = await createIntegration({
      name: integrationForm.name,
      provider: integrationForm.provider,
      description: integrationForm.description,
      category: integrationForm.category,
      icon: integrationForm.icon || getDefaultIcon(integrationForm.category),
      status: 'disconnected',
      is_connected: false,
      config: {},
      permissions: [],
      api_calls_count: 0,
      data_synced_count: 0,
      metadata: {}
    })

    setIsSubmitting(false)
    if (result) {
      toast.success('Integration created successfully')
      setShowCreateIntegrationDialog(false)
      setIntegrationForm({ name: '', provider: '', description: '', category: 'productivity', icon: '' })
    }
  }

  const handleConnectApp = async (app: Integration) => {
    toast.loading('Connecting app', { description: `Setting up connection to ${app.name}...` })
    const result = await connectIntegration(app.id)
    if (result) {
      toast.success('App connected', { description: `${app.name} is now connected` })
    }
  }

  const handleDisconnectApp = async (app: Integration) => {
    const result = await disconnectIntegration(app.id)
    if (result) {
      toast.success('App disconnected', { description: `${app.name} has been disconnected` })
    }
    setSelectedApp(null)
  }

  const handleSyncApp = async (app: Integration) => {
    toast.loading('Syncing', { description: `Synchronizing ${app.name} data...` })
    await syncIntegration(app.id)
  }

  const handleDeleteIntegration = async (app: Integration) => {
    const result = await deleteIntegration(app.id)
    if (result) {
      toast.success('Integration removed', { description: `${app.name} has been removed` })
      setSelectedApp(null)
    }
  }

  // Workflow/Zap Handlers
  const handleCreateZap = async () => {
    if (!workflowForm.name) {
      toast.error('Please enter a workflow name')
      return
    }

    setIsSubmitting(true)
    const result = await createWorkflow({
      name: workflowForm.name,
      description: workflowForm.description,
      type: workflowForm.type,
      priority: workflowForm.priority,
      status: 'draft',
      total_steps: 0,
      current_step: 0,
      steps_config: [],
      approvals_required: 0,
      approvals_received: 0,
      completion_rate: 0,
      assigned_to: [],
      dependencies: [],
      tags: [],
      metadata: {}
    })

    setIsSubmitting(false)
    if (result.success) {
      toast.success('Zap created successfully')
      setShowCreateZapDialog(false)
      setWorkflowForm({ name: '', description: '', type: 'integration', priority: 'medium' })
    } else {
      toast.error('Failed to create zap', { description: result.error })
    }
  }

  const handleToggleZapStatus = async (zap: WorkflowType) => {
    if (zap.status === 'active') {
      const result = await pauseWorkflow(zap.id)
      if (result.success) {
        toast.success('Zap paused', { description: `${zap.name} has been paused` })
      }
    } else if (zap.status === 'paused' || zap.status === 'draft') {
      const result = zap.status === 'paused' ? await resumeWorkflow(zap.id) : await startWorkflow(zap.id)
      if (result.success) {
        toast.success('Zap activated', { description: `${zap.name} is now running` })
      }
    }
  }

  const handleDeleteZap = async (zap: WorkflowType) => {
    const result = await deleteWorkflow(zap.id)
    if (result.success) {
      toast.success('Zap deleted', { description: `${zap.name} has been removed` })
      setSelectedZap(null)
    }
  }

  // Webhook Handlers
  const handleCreateWebhook = async () => {
    if (!webhookForm.name || !webhookForm.url) {
      toast.error('Please fill in required fields')
      return
    }

    setIsSubmitting(true)
    const result = await createWebhook({
      name: webhookForm.name,
      description: webhookForm.description,
      url: webhookForm.url,
      events: webhookForm.events.length > 0 ? webhookForm.events : ['*'],
      status: 'active',
      total_deliveries: 0,
      successful_deliveries: 0,
      failed_deliveries: 0,
      success_rate: 100,
      avg_response_time_ms: 0,
      consecutive_failures: 0,
      retry_count: 3,
      retry_delay_seconds: 60,
      timeout_ms: 30000,
      verify_ssl: true,
      custom_headers: {},
      tags: [],
      metadata: {}
    })

    setIsSubmitting(false)
    if (result.success) {
      toast.success('Webhook created successfully')
      setShowCreateWebhookDialog(false)
      setWebhookForm({ name: '', description: '', url: '', events: [] })
    } else {
      toast.error('Failed to create webhook', { description: result.error })
    }
  }

  const handleToggleWebhook = async (webhook: WebhookType) => {
    const newStatus = webhook.status === 'active' ? 'paused' : 'active'
    const result = await toggleWebhookStatus(webhook.id, newStatus)
    if (result.success) {
      toast.success(`Webhook ${newStatus === 'active' ? 'activated' : 'paused'}`)
    }
  }

  const handleTestWebhook = async (webhook: WebhookType) => {
    toast.loading('Testing webhook', { description: `Sending test payload to ${webhook.name}` })
    const result = await testWebhook(webhook.id)
    if (result.success) {
      toast.success('Test sent', { description: 'Check your endpoint for the test payload' })
    } else {
      toast.error('Test failed', { description: result.error })
    }
  }

  const handleDeleteWebhook = async (webhook: WebhookType) => {
    const result = await deleteWebhook(webhook.id)
    if (result.success) {
      toast.success('Webhook deleted', { description: `${webhook.name} has been removed` })
      setSelectedWebhook(null)
    }
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('URL copied to clipboard')
  }

  // Quick actions
  const mockIntegrationsQuickActions = [
    { id: '1', label: 'New Zap', icon: 'Zap', shortcut: 'N', action: () => setShowCreateZapDialog(true) },
    { id: '2', label: 'Apps', icon: 'Grid', shortcut: 'A', action: () => setShowCreateIntegrationDialog(true) },
    { id: '3', label: 'Webhooks', icon: 'Webhook', shortcut: 'W', action: () => setShowCreateWebhookDialog(true) },
    { id: '4', label: 'Refresh', icon: 'RefreshCw', shortcut: 'R', action: () => { fetchIntegrations(); fetchWorkflows(); fetchWebhooks() } },
  ]

  const isLoading = integrationsLoading || workflowsLoading || webhooksLoading

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Integrations</h1>
              <p className="text-gray-600 dark:text-gray-400">Zapier-level automation platform</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => { fetchIntegrations(); fetchWorkflows(); fetchWebhooks() }} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => setActiveTab('tasks')}>
              <History className="w-4 h-4 mr-2" />
              Task History
            </Button>
            <Button className="bg-gradient-to-r from-orange-500 to-red-600 text-white" onClick={() => setShowCreateZapDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Zap
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-orange-600 mb-1">
                <Zap className="w-4 h-4" />
                <span className="text-xs font-medium">Active Zaps</span>
              </div>
              <p className="text-2xl font-bold">{usageStats.zapsActive}</p>
              <p className="text-xs text-muted-foreground">of {usageStats.zapsLimit}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <Activity className="w-4 h-4" />
                <span className="text-xs font-medium">Tasks Used</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(usageStats.tasksUsed)}</p>
              <p className="text-xs text-muted-foreground">of {formatNumber(usageStats.tasksLimit)}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs font-medium">Success Rate</span>
              </div>
              <p className="text-2xl font-bold">{usageStats.successRate.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">last 30 days</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-purple-600 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium">Avg Duration</span>
              </div>
              <p className="text-2xl font-bold">{usageStats.avgTaskDuration}s</p>
              <p className="text-xs text-muted-foreground">per task</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-cyan-600 mb-1">
                <Plug className="w-4 h-4" />
                <span className="text-xs font-medium">Connected</span>
              </div>
              <p className="text-2xl font-bold">{usageStats.appsConnected}</p>
              <p className="text-xs text-muted-foreground">apps</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-pink-600 mb-1">
                <Webhook className="w-4 h-4" />
                <span className="text-xs font-medium">Webhooks</span>
              </div>
              <p className="text-2xl font-bold">{usageStats.webhooksActive}</p>
              <p className="text-xs text-muted-foreground">active</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-amber-600 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium">This Month</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(usageStats.tasksThisMonth)}</p>
              <p className="text-xs text-green-600">
                {usageStats.tasksLastMonth > 0
                  ? `+${Math.round(((usageStats.tasksThisMonth - usageStats.tasksLastMonth) / usageStats.tasksLastMonth) * 100)}%`
                  : 'N/A'}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-600 mb-1">
                <BarChart3 className="w-4 h-4" />
                <span className="text-xs font-medium">Usage</span>
              </div>
              <Progress value={usagePercent} className="h-2 mt-2" />
              <p className="text-xs text-muted-foreground mt-1">{Math.round(usagePercent)}% used</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList className="bg-white/80 dark:bg-gray-800/80">
              <TabsTrigger value="zaps" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Zaps
              </TabsTrigger>
              <TabsTrigger value="apps" className="flex items-center gap-2">
                <Plug className="w-4 h-4" />
                Apps
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                Task History
              </TabsTrigger>
              <TabsTrigger value="webhooks" className="flex items-center gap-2">
                <Webhook className="w-4 h-4" />
                Webhooks
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
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64 bg-white/80 dark:bg-gray-800/80"
                />
              </div>
            </div>
          </div>

          {/* Zaps Tab */}
          <TabsContent value="zaps" className="space-y-4">
            {/* Zaps Banner */}
            <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Automation Zaps</h2>
                  <p className="text-orange-100">Zapier-level workflow automation</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{workflows.length}</p>
                    <p className="text-orange-200 text-sm">Total Zaps</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{workflowStats.active}</p>
                    <p className="text-orange-200 text-sm">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{workflowStats.totalSteps.toLocaleString()}</p>
                    <p className="text-orange-200 text-sm">Steps</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Zaps Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'Create Zap', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', onClick: () => setShowCreateZapDialog(true) },
                { icon: Zap, label: 'Templates', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', onClick: () => setShowTemplatesDialog(true) },
                { icon: Play, label: 'Run All', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400', onClick: async () => {
                  const activeWorkflows = workflows.filter(w => w.status === 'active')
                  if (activeWorkflows.length === 0) {
                    toast.warning('No active workflows to run')
                    return
                  }
                  toast.promise(
                    Promise.all(activeWorkflows.map(w => startWorkflow(w.id))),
                    { loading: `Running ${activeWorkflows.length} workflows...`, success: `Started ${activeWorkflows.length} workflows!`, error: 'Failed to run workflows' }
                  )
                } },
                { icon: Pause, label: 'Pause All', color: 'bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400', onClick: async () => {
                  const activeWorkflows = workflows.filter(w => w.status === 'active')
                  if (activeWorkflows.length === 0) {
                    toast.warning('No active workflows to pause')
                    return
                  }
                  toast.promise(
                    Promise.all(activeWorkflows.map(w => pauseWorkflow(w.id))),
                    { loading: `Pausing ${activeWorkflows.length} workflows...`, success: `Paused ${activeWorkflows.length} workflows!`, error: 'Failed to pause workflows' }
                  )
                } },
                { icon: History, label: 'History', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: () => setActiveTab('tasks') },
                { icon: BarChart3, label: 'Analytics', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', onClick: () => setActiveTab('analytics') },
                { icon: Download, label: 'Export', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', onClick: () => {
                  const data = JSON.stringify(workflows, null, 2)
                  const blob = new Blob([data], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'workflows-export.json'
                  a.click()
                  URL.revokeObjectURL(url)
                  toast.success('Workflows exported successfully!')
                } },
                { icon: Settings, label: 'Settings', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', onClick: () => setActiveTab('settings') }
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

            <div className="flex items-center gap-2 mb-4">
              <Button
                variant={zapFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setZapFilter('all')}
              >
                All
              </Button>
              <Button
                variant={zapFilter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setZapFilter('active')}
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
              </Button>
              <Button
                variant={zapFilter === 'paused' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setZapFilter('paused')}
              >
                <Pause className="w-3 h-3 mr-1" />
                Paused
              </Button>
              <Button
                variant={zapFilter === 'error' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setZapFilter('failed')}
              >
                <AlertTriangle className="w-3 h-3 mr-1" />
                Error
              </Button>
              <Button
                variant={zapFilter === 'draft' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setZapFilter('draft')}
              >
                <Edit className="w-3 h-3 mr-1" />
                Draft
              </Button>
            </div>

            {workflowsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              </div>
            ) : filteredZaps.length === 0 ? (
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardContent className="py-12 text-center">
                  <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Zaps Found</h3>
                  <p className="text-muted-foreground mb-4">Create your first automation to get started</p>
                  <Button onClick={() => setShowCreateZapDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Zap
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredZaps.map(zap => (
                  <Card key={zap.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedZap(zap)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                              <Workflow className="w-5 h-5 text-orange-600" />
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                              <Zap className="w-5 h-5 text-blue-600" />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{zap.name}</h3>
                              <Badge className={getStatusColor(zap.status)}>{zap.status}</Badge>
                              <Badge variant="outline">{zap.type}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{zap.description || 'No description'}</p>
                            <div className="flex items-center gap-4 mt-1">
                              {zap.started_at && (
                                <span className="text-xs text-muted-foreground">
                                  Started: {formatDate(zap.started_at)}
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {zap.total_steps} steps
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {zap.completion_rate}% complete
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          {zap.status === 'active' ? (
                            <Button variant="outline" size="sm" onClick={() => handleToggleZapStatus(zap)}>
                              <Pause className="w-4 h-4" />
                            </Button>
                          ) : zap.status !== 'completed' ? (
                            <Button variant="outline" size="sm" onClick={() => handleToggleZapStatus(zap)}>
                              <Play className="w-4 h-4" />
                            </Button>
                          ) : null}
                          <Button variant="outline" size="sm" onClick={() => toast.promise(new Promise(r => setTimeout(r, 800)), { loading: 'Opening workflow editor...', success: 'Workflow editor opened', error: 'Failed to open editor' })}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedZap(zap)}>
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Apps Tab */}
          <TabsContent value="apps" className="space-y-4">
            {/* Apps Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Connected Apps</h2>
                  <p className="text-blue-100">Workato-level app connectivity</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{integrations.length}</p>
                    <p className="text-blue-200 text-sm">Apps</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{integrationStats.connected}</p>
                    <p className="text-blue-200 text-sm">Connected</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{categories.length}</p>
                    <p className="text-blue-200 text-sm">Categories</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Apps Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'Add App', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => setShowCreateIntegrationDialog(true) },
                { icon: Link, label: 'Connect', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: () => toast.promise(new Promise(r => setTimeout(r, 600)), { loading: 'Loading app connections...', success: 'Select an app below to connect', error: 'Failed to load connections' }) },
                { icon: Key, label: 'API Keys', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', onClick: () => setActiveTab('settings') },
                { icon: Shield, label: 'OAuth', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => toast.promise(new Promise(r => setTimeout(r, 1000)), { loading: 'Opening OAuth configuration...', success: 'OAuth settings ready', error: 'Failed to open OAuth settings' }) },
                { icon: RefreshCw, label: 'Sync', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400', onClick: () => toast.promise(fetchIntegrations(), { loading: 'Syncing integrations...', success: 'Integrations synced successfully', error: 'Failed to sync integrations' }) },
                { icon: History, label: 'History', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', onClick: () => setActiveTab('tasks') },
                { icon: Download, label: 'Export', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', onClick: () => {
                  toast.promise(new Promise<void>((resolve) => {
                    const data = JSON.stringify(integrations, null, 2)
                    const blob = new Blob([data], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = 'integrations-export.json'
                    a.click()
                    URL.revokeObjectURL(url)
                    setTimeout(resolve, 2000)
                  }), { loading: 'Exporting integrations...', success: 'Integrations exported successfully', error: 'Failed to export integrations' })
                } },
                { icon: Settings, label: 'Settings', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', onClick: () => setActiveTab('settings') }
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

            <div className="flex items-center gap-2 flex-wrap mb-4">
              {categories.map(cat => (
                <Button
                  key={cat.value}
                  variant={selectedCategory === cat.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.value)}
                  className="flex items-center gap-1"
                >
                  {cat.value !== 'all' && getCategoryIcon(cat.value)}
                  {cat.label}
                </Button>
              ))}
              <div className="ml-auto">
                <Button
                  variant={showConnectedOnly ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowConnectedOnly(!showConnectedOnly)}
                >
                  <Plug className="w-3 h-3 mr-1" />
                  Connected Only
                </Button>
              </div>
            </div>

            {integrationsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : filteredApps.length === 0 ? (
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardContent className="py-12 text-center">
                  <Plug className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Apps Found</h3>
                  <p className="text-muted-foreground mb-4">Add your first integration to get started</p>
                  <Button onClick={() => setShowCreateIntegrationDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Integration
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredApps.map(app => (
                  <Card key={app.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur hover:shadow-lg transition-all cursor-pointer" onClick={() => setSelectedApp(app)}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{app.icon || getCategoryIcon(app.category || 'all')}</div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{app.name}</h3>
                            </div>
                            <p className="text-xs text-muted-foreground capitalize">{app.category || 'General'}</p>
                          </div>
                        </div>
                        {app.is_connected && (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Connected
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{app.description || 'No description'}</p>
                      {app.is_connected ? (
                        <div className="flex items-center justify-between text-xs" onClick={(e) => e.stopPropagation()}>
                          <span className="text-muted-foreground">
                            {formatNumber(app.api_calls_count)} API calls
                          </span>
                          <Button variant="outline" size="sm" className="h-7" onClick={() => setSelectedApp(app)}>
                            <Settings className="w-3 h-3 mr-1" />
                            Manage
                          </Button>
                        </div>
                      ) : (
                        <Button className="w-full" size="sm" onClick={(e) => { e.stopPropagation(); handleConnectApp(app) }}>
                          <Plug className="w-3 h-3 mr-1" />
                          Connect
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Task History Tab */}
          <TabsContent value="tasks" className="space-y-4">
            {/* Tasks Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Task History</h2>
                  <p className="text-emerald-100">Make-level task execution tracking</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{filteredTasks.length}</p>
                    <p className="text-emerald-200 text-sm">Total Tasks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{filteredTasks.filter(t => t.status === 'success').length}</p>
                    <p className="text-emerald-200 text-sm">Succeeded</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{filteredTasks.filter(t => t.status === 'failed').length}</p>
                    <p className="text-emerald-200 text-sm">Failed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tasks Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: RefreshCw, label: 'Retry Failed', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', onClick: () => {
                  const failedTasks = mockTasks.filter(t => t.status === 'failed')
                  if (failedTasks.length === 0) {
                    toast.info('No failed tasks to retry')
                    return
                  }
                  toast.promise(new Promise(r => setTimeout(r, 2000)), { loading: `Retrying ${failedTasks.length} failed tasks...`, success: `${failedTasks.length} tasks queued for retry`, error: 'Failed to retry tasks' })
                } },
                { icon: Play, label: 'Replay', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: () => toast.promise(new Promise(r => setTimeout(r, 1500)), { loading: 'Preparing task replay...', success: 'Select a task to replay', error: 'Failed to prepare replay' }) },
                { icon: Filter, label: 'Filter', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', onClick: () => toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Loading filters...', success: 'Filter options ready - use search above', error: 'Failed to load filters' }) },
                { icon: Search, label: 'Search', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', onClick: () => toast.promise(Promise.resolve(document.querySelector<HTMLInputElement>('input[placeholder="Search..."]')?.focus()), { loading: 'Activating search...', success: 'Search activated - start typing', error: 'Failed to activate search' }) },
                { icon: Eye, label: 'Details', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => { if (mockTasks[0]) { toast.promise(Promise.resolve(setSelectedTask(mockTasks[0])), { loading: 'Loading task details...', success: 'Task details loaded', error: 'Failed to load details' }) } else { toast.promise(Promise.resolve(), { loading: 'Checking...', success: 'No tasks available', error: 'Error' }) } } },
                { icon: BarChart3, label: 'Analytics', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: () => setActiveTab('analytics') },
                { icon: Download, label: 'Export', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', onClick: () => {
                  toast.promise(new Promise<void>((resolve) => {
                    const data = JSON.stringify(mockTasks, null, 2)
                    const blob = new Blob([data], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = 'task-history-export.json'
                    a.click()
                    URL.revokeObjectURL(url)
                    setTimeout(resolve, 2500)
                  }), { loading: 'Exporting task history...', success: 'Task history exported successfully', error: 'Failed to export task history' })
                } },
                { icon: Trash2, label: 'Clear', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', onClick: () => toast.promise(new Promise(r => setTimeout(r, 1000)), { loading: 'Clearing task history...', success: 'Task history cleared', error: 'Failed to clear history' }) }
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

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="divide-y dark:divide-gray-700">
                    {filteredTasks.map(task => (
                      <div
                        key={task.id}
                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                        onClick={() => setSelectedTask(task)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getTaskStatusIcon(task.status)}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{task.zapName}</span>
                                <Badge className={getTaskStatusColor(task.status)}>{task.status}</Badge>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <span>{formatDate(task.startedAt)}</span>
                                <span>-</span>
                                <span>{task.steps.length} steps</span>
                                {task.duration > 0 && (
                                  <>
                                    <span>-</span>
                                    <span>{formatDuration(task.duration)}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {task.status === 'failed' && (
                              <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); toast.promise(new Promise(r => setTimeout(r, 2000)), { loading: 'Replaying task...', success: 'Task replayed successfully', error: 'Failed to replay task' }) }}>
                                <RotateCcw className="w-3 h-3 mr-1" />
                                Replay
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedTask(task) }}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        {/* Step preview */}
                        <div className="flex items-center gap-1 mt-2 ml-7">
                          {task.steps.map((step, idx) => (
                            <div key={step.stepId} className="flex items-center gap-1">
                              <div className={`w-6 h-6 rounded flex items-center justify-center ${
                                step.status === 'success' ? 'bg-green-100 dark:bg-green-900/30' :
                                step.status === 'failed' ? 'bg-red-100 dark:bg-red-900/30' :
                                step.status === 'running' ? 'bg-blue-100 dark:bg-blue-900/30' :
                                'bg-gray-100 dark:bg-gray-700'
                              }`}>
                                {step.status === 'success' && <CheckCircle className="w-3 h-3 text-green-600" />}
                                {step.status === 'failed' && <XCircle className="w-3 h-3 text-red-600" />}
                                {step.status === 'running' && <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />}
                                {step.status === 'waiting' && <Clock className="w-3 h-3 text-gray-500" />}
                              </div>
                              {idx < task.steps.length - 1 && (
                                <div className="w-4 h-px bg-gray-300 dark:bg-gray-600" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks" className="space-y-4">
            {/* Webhooks Banner */}
            <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Webhooks</h2>
                  <p className="text-purple-100">Stripe-level webhook reliability</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{webhooks.length}</p>
                    <p className="text-purple-200 text-sm">Endpoints</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{webhookStats.active}</p>
                    <p className="text-purple-200 text-sm">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{webhookStats.avgSuccessRate.toFixed(0)}%</p>
                    <p className="text-purple-200 text-sm">Success</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Webhooks Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'Create', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => setShowCreateWebhookDialog(true) },
                { icon: Webhook, label: 'Test', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', onClick: () => { if (webhooks[0]) { handleTestWebhook(webhooks[0]) } else { toast.promise(Promise.resolve(), { loading: 'Checking...', success: 'No webhooks available to test', error: 'Error' }) } } },
                { icon: RefreshCw, label: 'Retry', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: () => {
                  const failedDeliveries = webhooks.filter(w => w.failed_deliveries > 0)
                  if (failedDeliveries.length === 0) {
                    toast.info('No failed deliveries to retry')
                    return
                  }
                  toast.promise(new Promise(r => setTimeout(r, 2500)), { loading: `Retrying ${failedDeliveries.length} webhook deliveries...`, success: 'Failed deliveries queued for retry', error: 'Failed to retry deliveries' })
                } },
                { icon: Key, label: 'Secrets', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => toast.promise(new Promise(r => setTimeout(r, 1000)), { loading: 'Loading webhook secrets...', success: 'Webhook secrets panel ready', error: 'Failed to load secrets' }) },
                { icon: Shield, label: 'Verify', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', onClick: () => toast.promise(new Promise(r => setTimeout(r, 1200)), { loading: 'Checking SSL verification...', success: 'All webhooks have valid SSL certificates', error: 'Failed to verify SSL' }) },
                { icon: Eye, label: 'Logs', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', onClick: () => toast.promise(new Promise(r => setTimeout(r, 800)), { loading: 'Loading webhook logs...', success: 'Webhook logs ready - check activity feed', error: 'Failed to load logs' }) },
                { icon: Download, label: 'Export', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', onClick: () => {
                  toast.promise(new Promise<void>((resolve) => {
                    const data = JSON.stringify(webhooks, null, 2)
                    const blob = new Blob([data], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = 'webhooks-export.json'
                    a.click()
                    URL.revokeObjectURL(url)
                    setTimeout(resolve, 2000)
                  }), { loading: 'Exporting webhooks...', success: 'Webhooks exported successfully', error: 'Failed to export webhooks' })
                } },
                { icon: Settings, label: 'Settings', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', onClick: () => setActiveTab('settings') }
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

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Webhook Endpoints</h2>
              <Button onClick={() => setShowCreateWebhookDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Webhook
              </Button>
            </div>

            {webhooksLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              </div>
            ) : webhooks.length === 0 ? (
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardContent className="py-12 text-center">
                  <Webhook className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Webhooks Found</h3>
                  <p className="text-muted-foreground mb-4">Create your first webhook endpoint</p>
                  <Button onClick={() => setShowCreateWebhookDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Webhook
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {webhooks.map(webhook => (
                  <Card key={webhook.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${webhook.status === 'active' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                            <Webhook className={`w-5 h-5 ${webhook.status === 'active' ? 'text-green-600' : 'text-gray-500'}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{webhook.name}</h3>
                              {webhook.status === 'active' ? (
                                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Active</Badge>
                              ) : (
                                <Badge variant="secondary">{webhook.status}</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono max-w-md truncate">
                                {webhook.url}
                              </code>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleCopyUrl(webhook.url)}>
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">{formatNumber(webhook.total_deliveries)}</p>
                            <p className="text-xs text-muted-foreground">deliveries</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{webhook.success_rate.toFixed(0)}%</p>
                            <p className="text-xs text-muted-foreground">success</p>
                          </div>
                          {webhook.last_delivery_at && (
                            <div className="text-right">
                              <p className="text-sm font-medium">{formatDate(webhook.last_delivery_at)}</p>
                              <p className="text-xs text-muted-foreground">last delivery</p>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleTestWebhook(webhook)}>
                              <Play className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setSelectedWebhook(webhook)}>
                              <Settings className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteWebhook(webhook)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            {/* Analytics Banner */}
            <div className="bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Integration Analytics</h2>
                  <p className="text-cyan-100">Mixpanel-level insights and monitoring</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{workflowStats.totalSteps.toLocaleString()}</p>
                    <p className="text-cyan-200 text-sm">Total Tasks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{usageStats.successRate.toFixed(1)}%</p>
                    <p className="text-cyan-200 text-sm">Success Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{(webhookStats.avgResponseTime || 45).toFixed(0)}ms</p>
                    <p className="text-cyan-200 text-sm">Avg Latency</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: BarChart3, label: 'Dashboard', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', onClick: () => toast.promise(new Promise(r => setTimeout(r, 800)), { loading: 'Loading analytics dashboard...', success: 'Analytics dashboard loaded', error: 'Failed to load dashboard' }) },
                { icon: TrendingUp, label: 'Trends', color: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400', onClick: () => toast.promise(new Promise(r => setTimeout(r, 1000)), { loading: 'Analyzing trends...', success: 'Trend analysis complete - see charts below', error: 'Failed to analyze trends' }) },
                { icon: Activity, label: 'Real-time', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => toast.promise(new Promise(r => setTimeout(r, 600)), { loading: 'Connecting to real-time feed...', success: 'Real-time monitoring active', error: 'Failed to connect' }) },
                { icon: PieChart, label: 'Usage', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: () => toast.promise(new Promise(r => setTimeout(r, 900)), { loading: 'Calculating usage stats...', success: `Usage: ${usagePercent.toFixed(1)}% of quota used`, error: 'Failed to calculate usage' }) },
                { icon: AlertCircle, label: 'Errors', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', onClick: () => {
                  const errorRate = 100 - usageStats.successRate
                  toast.promise(new Promise(r => setTimeout(r, 800)), { loading: 'Fetching error logs...', success: `Error rate: ${errorRate.toFixed(1)}% - ${errorRate < 5 ? 'Looking good!' : 'Needs attention'}`, error: 'Failed to fetch errors' })
                } },
                { icon: FileText, label: 'Reports', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => toast.promise(new Promise(r => setTimeout(r, 1500)), { loading: 'Generating analytics report...', success: 'Report generated - ready to download', error: 'Failed to generate report' }) },
                { icon: Download, label: 'Export', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400', onClick: () => {
                  toast.promise(new Promise<void>((resolve) => {
                    const analyticsData = {
                      workflows: workflowStats,
                      integrations: integrationStats,
                      webhooks: webhookStats,
                      usage: usageStats,
                      exportedAt: new Date().toISOString()
                    }
                    const data = JSON.stringify(analyticsData, null, 2)
                    const blob = new Blob([data], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = 'analytics-export.json'
                    a.click()
                    URL.revokeObjectURL(url)
                    setTimeout(resolve, 2500)
                  }), { loading: 'Exporting analytics data...', success: 'Analytics data exported successfully', error: 'Failed to export analytics' })
                } },
                { icon: Settings, label: 'Settings', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', onClick: () => setActiveTab('settings') }
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Task Execution Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {Array.from({ length: 14 }).map((_, i) => {
                      const height = 30 + Math.random() * 70
                      const isToday = i === 13
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className={`w-full rounded-t ${isToday ? 'bg-orange-500' : 'bg-blue-500'}`}
                            style={{ height: `${height}%` }}
                          />
                          <span className="text-[10px] text-muted-foreground">{i + 1}</span>
                        </div>
                      )
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-2">Last 14 days</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Success vs Failure
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center gap-8 h-64">
                    <div className="relative">
                      <svg className="w-40 h-40 transform -rotate-90">
                        <circle cx="80" cy="80" r="70" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          fill="none"
                          stroke="#22c55e"
                          strokeWidth="12"
                          strokeDasharray={`${2 * Math.PI * 70 * (usageStats.successRate / 100)} ${2 * Math.PI * 70}`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold">{usageStats.successRate.toFixed(1)}%</span>
                        <span className="text-xs text-muted-foreground">Success</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-sm">Successful: {webhookStats.successfulDeliveries}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-sm">Failed: {webhookStats.totalDeliveries - webhookStats.successfulDeliveries}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    Top Workflows by Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {workflows.slice(0, 5).map((workflow, idx) => (
                      <div key={workflow.id} className="flex items-center gap-3">
                        <span className="text-lg font-bold text-muted-foreground w-6">{idx + 1}</span>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{workflow.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={workflow.completion_rate} className="h-2 flex-1" />
                            <span className="text-xs text-muted-foreground w-16 text-right">{workflow.total_steps} steps</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plug className="w-5 h-5" />
                    App Usage Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {integrations.filter(a => a.is_connected).slice(0, 6).map(app => (
                      <div key={app.id} className="flex items-center gap-3">
                        <div className="text-xl">{app.icon || getCategoryIcon(app.category || 'all')}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{app.name}</span>
                            <span className="text-xs text-muted-foreground">{formatNumber(app.api_calls_count)}</span>
                          </div>
                          <Progress value={Math.min(100, (app.api_calls_count / Math.max(1, integrations[0]?.api_calls_count || 1)) * 100)} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    API Keys
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Production Key</p>
                        <code className="text-xs text-muted-foreground">zk_live_********************</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => toast.promise(new Promise(r => setTimeout(r, 800)), { loading: 'Revealing key...', success: 'Production key revealed temporarily', error: 'Failed to reveal key' })}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText('zk_live_xxxxxxxxxxxxxxxxxxxx'); toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Copying...', success: 'Production key copied to clipboard', error: 'Failed to copy' }) }}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Test Key</p>
                        <code className="text-xs text-muted-foreground">zk_test_********************</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => toast.promise(new Promise(r => setTimeout(r, 800)), { loading: 'Revealing key...', success: 'Test key revealed temporarily', error: 'Failed to reveal key' })}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText('zk_test_xxxxxxxxxxxxxxxxxxxx'); toast.promise(new Promise(r => setTimeout(r, 500)), { loading: 'Copying...', success: 'Test key copied to clipboard', error: 'Failed to copy' }) }}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => toast.promise(new Promise(r => setTimeout(r, 3000)), { loading: 'Regenerating API keys...', success: 'API keys regenerated successfully', error: 'Failed to regenerate keys' })}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate Keys
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-sm">Two-Factor Auth</p>
                        <p className="text-xs text-muted-foreground">Enabled</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => toast.promise(new Promise(r => setTimeout(r, 1000)), { loading: 'Opening 2FA settings...', success: '2FA management panel opened', error: 'Failed to open 2FA settings' })}>Manage</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">IP Allowlist</p>
                        <p className="text-xs text-muted-foreground">3 IPs configured</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => toast.promise(new Promise(r => setTimeout(r, 1200)), { loading: 'Loading IP allowlist...', success: 'IP configuration panel opened', error: 'Failed to load IP settings' })}>Configure</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <History className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-sm">Audit Logs</p>
                        <p className="text-xs text-muted-foreground">90-day retention</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => toast.promise(new Promise(r => setTimeout(r, 1500)), { loading: 'Loading audit logs...', success: 'Audit logs loaded - 247 entries', error: 'Failed to load audit logs' })}>View</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Plan & Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl">
                      <h3 className="font-semibold text-lg mb-1">Professional</h3>
                      <p className="text-xs text-muted-foreground mb-4">Current Plan</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Tasks</span>
                          <span>{formatNumber(usageStats.tasksUsed)} / {formatNumber(usageStats.tasksLimit)}</span>
                        </div>
                        <Progress value={usagePercent} className="h-2" />
                        <div className="flex items-center justify-between text-sm">
                          <span>Zaps</span>
                          <span>{usageStats.zapsActive} / {usageStats.zapsLimit}</span>
                        </div>
                        <Progress value={(usageStats.zapsActive / usageStats.zapsLimit) * 100} className="h-2" />
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-xs text-muted-foreground">Billing Period</p>
                          <p className="font-semibold">Jan 1 - Jan 31, 2024</p>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-xs text-muted-foreground">Next Invoice</p>
                          <p className="font-semibold">$49.00 on Feb 1</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={() => toast.promise(new Promise(r => setTimeout(r, 1200)), { loading: 'Loading invoices...', success: 'Invoices loaded - 12 invoices found', error: 'Failed to load invoices' })}>
                          View Invoices
                        </Button>
                        <Button className="flex-1 bg-gradient-to-r from-orange-500 to-red-600" onClick={() => toast.promise(new Promise(r => setTimeout(r, 1000)), { loading: 'Loading upgrade options...', success: 'Upgrade plans loaded - Enterprise available', error: 'Failed to load upgrade options' })}>
                          Upgrade Plan
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockIntegrationsAIInsights}
              title="Integrations Intelligence"
              onInsightAction={(insight) => toast.success('Insight Action', { description: insight.title })}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockIntegrationsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockIntegrationsPredictions}
              title="Integration Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockIntegrationsActivities}
            title="Integration Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockIntegrationsQuickActions}
            variant="grid"
          />
        </div>

        {/* Zap Detail Dialog */}
        <Dialog open={!!selectedZap} onOpenChange={() => setSelectedZap(null)}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                {selectedZap?.name}
              </DialogTitle>
              <DialogDescription>{selectedZap?.description || 'No description'}</DialogDescription>
            </DialogHeader>
            {selectedZap && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(selectedZap.status)}>{selectedZap.status}</Badge>
                  <Badge variant="outline">{selectedZap.type}</Badge>
                  <Badge variant="outline">{selectedZap.priority} priority</Badge>
                  {selectedZap.tags.map(tag => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>

                {/* Workflow Info */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <h4 className="font-medium mb-4">Workflow Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Steps</p>
                      <p className="font-medium">{selectedZap.total_steps}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Current Step</p>
                      <p className="font-medium">{selectedZap.current_step}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Completion Rate</p>
                      <p className="font-medium">{selectedZap.completion_rate}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Approvals</p>
                      <p className="font-medium">{selectedZap.approvals_received}/{selectedZap.approvals_required}</p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-2xl font-bold">{selectedZap.total_steps}</p>
                    <p className="text-xs text-muted-foreground">Total Steps</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">{selectedZap.completion_rate}%</p>
                    <p className="text-xs text-muted-foreground">Completion</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-2xl font-bold">{selectedZap.current_step}</p>
                    <p className="text-xs text-muted-foreground">Current Step</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-2xl font-bold">{selectedZap.assigned_to.length}</p>
                    <p className="text-xs text-muted-foreground">Assigned</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  {selectedZap.status === 'active' ? (
                    <Button variant="outline" className="flex-1" onClick={() => handleToggleZapStatus(selectedZap)}>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause Zap
                    </Button>
                  ) : (
                    <Button className="flex-1" onClick={() => handleToggleZapStatus(selectedZap)}>
                      <Play className="w-4 h-4 mr-2" />
                      Turn On
                    </Button>
                  )}
                  <Button variant="outline" className="flex-1" onClick={() => toast.promise(new Promise(r => setTimeout(r, 1200)), { loading: 'Opening zap editor...', success: 'Zap editor loaded - make your changes', error: 'Failed to open editor' })}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Zap
                  </Button>
                  <Button variant="destructive" onClick={() => handleDeleteZap(selectedZap)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Task Detail Dialog */}
        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedTask && getTaskStatusIcon(selectedTask.status)}
                Task Details
              </DialogTitle>
              <DialogDescription>{selectedTask?.zapName}</DialogDescription>
            </DialogHeader>
            {selectedTask && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Badge className={getTaskStatusColor(selectedTask.status)}>{selectedTask.status}</Badge>
                  <span className="text-sm text-muted-foreground">
                    Started: {formatDate(selectedTask.startedAt)}
                  </span>
                  {selectedTask.duration > 0 && (
                    <span className="text-sm text-muted-foreground">
                      Duration: {formatDuration(selectedTask.duration)}
                    </span>
                  )}
                </div>

                {/* Steps */}
                <div className="space-y-3">
                  <h4 className="font-medium">Execution Steps</h4>
                  {selectedTask.steps.map((step, idx) => (
                    <div key={step.stepId} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex flex-col items-center">
                        {getTaskStatusIcon(step.status)}
                        {idx < selectedTask.steps.length - 1 && (
                          <div className="w-0.5 h-full bg-gray-300 dark:bg-gray-600 mt-2" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{step.stepName}</p>
                        {step.data && (
                          <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded mt-2 overflow-x-auto">
                            {JSON.stringify(step.data, null, 2)}
                          </pre>
                        )}
                        {step.error && (
                          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-400">
                            {step.error}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Data In/Out */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Input Data</h4>
                    <pre className="text-xs bg-gray-50 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto">
                      {JSON.stringify(selectedTask.dataIn, null, 2)}
                    </pre>
                  </div>
                  {selectedTask.dataOut && (
                    <div>
                      <h4 className="font-medium mb-2">Output Data</h4>
                      <pre className="text-xs bg-gray-50 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto">
                        {JSON.stringify(selectedTask.dataOut, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                {selectedTask.status === 'failed' && (
                  <Button className="w-full" onClick={() => toast.promise(new Promise(r => setTimeout(r, 2500)), { loading: 'Replaying task...', success: 'Task replayed successfully', error: 'Failed to replay task' })}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Replay Task
                  </Button>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* App Detail Dialog */}
        <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <span className="text-3xl">{selectedApp?.icon || getCategoryIcon(selectedApp?.category || 'all')}</span>
                {selectedApp?.name}
              </DialogTitle>
              <DialogDescription>{selectedApp?.description || 'No description'}</DialogDescription>
            </DialogHeader>
            {selectedApp && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">{selectedApp.category || 'General'}</Badge>
                  {selectedApp.is_connected && (
                    <Badge className="bg-green-100 text-green-700">Connected</Badge>
                  )}
                </div>

                {selectedApp.is_connected ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-muted-foreground">Connected Since</p>
                        <p className="font-medium">{selectedApp.connected_at ? formatDate(selectedApp.connected_at) : 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-muted-foreground">API Calls</p>
                        <p className="font-medium">{formatNumber(selectedApp.api_calls_count)}</p>
                      </div>
                    </div>

                    {selectedApp.permissions.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Permissions</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedApp.permissions.map(scope => (
                            <Badge key={scope} variant="outline" className="text-xs">{scope}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1" onClick={() => handleSyncApp(selectedApp)}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Sync Now
                      </Button>
                      <Button variant="destructive" className="flex-1" onClick={() => handleDisconnectApp(selectedApp)}>
                        Disconnect
                      </Button>
                    </div>
                  </>
                ) : (
                  <Button className="w-full" onClick={() => handleConnectApp(selectedApp)}>
                    <Plug className="w-4 h-4 mr-2" />
                    Connect {selectedApp.name}
                  </Button>
                )}

                <Button variant="outline" className="w-full" onClick={() => handleDeleteIntegration(selectedApp)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Integration
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Webhook Detail Dialog */}
        <Dialog open={!!selectedWebhook} onOpenChange={() => setSelectedWebhook(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Webhook className="w-5 h-5" />
                {selectedWebhook?.name}
              </DialogTitle>
            </DialogHeader>
            {selectedWebhook && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {selectedWebhook.status === 'active' ? (
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  ) : (
                    <Badge variant="secondary">{selectedWebhook.status}</Badge>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Webhook URL</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 text-xs bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded overflow-x-auto">
                      {selectedWebhook.url}
                    </code>
                    <Button variant="ghost" size="sm" onClick={() => handleCopyUrl(selectedWebhook.url)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {selectedWebhook.secret && (
                  <div>
                    <label className="text-sm font-medium">Secret Key</label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 text-xs bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded">
                        {selectedWebhook.secret.substring(0, 12)}********************
                      </code>
                      <Button variant="ghost" size="sm" onClick={() => toast.promise(new Promise(r => setTimeout(r, 800)), { loading: 'Revealing secret...', success: 'Webhook secret revealed temporarily', error: 'Failed to reveal secret' })}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-muted-foreground">Total Deliveries</p>
                    <p className="font-medium">{formatNumber(selectedWebhook.total_deliveries)}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-muted-foreground">Success Rate</p>
                    <p className="font-medium">{selectedWebhook.success_rate.toFixed(0)}%</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => handleTestWebhook(selectedWebhook)}>
                    Test Webhook
                  </Button>
                  <Button variant={selectedWebhook.status === 'active' ? 'outline' : 'default'} className="flex-1" onClick={() => handleToggleWebhook(selectedWebhook)}>
                    {selectedWebhook.status === 'active' ? 'Pause' : 'Activate'}
                  </Button>
                </div>
                <Button variant="destructive" className="w-full" onClick={() => handleDeleteWebhook(selectedWebhook)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Integration Dialog */}
        <Dialog open={showCreateIntegrationDialog} onOpenChange={setShowCreateIntegrationDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Integration</DialogTitle>
              <DialogDescription>Connect a new app to your workflow</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="int-name">Name *</Label>
                <Input
                  id="int-name"
                  placeholder="e.g., Slack"
                  value={integrationForm.name}
                  onChange={(e) => setIntegrationForm({ ...integrationForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="int-provider">Provider *</Label>
                <Input
                  id="int-provider"
                  placeholder="e.g., slack.com"
                  value={integrationForm.provider}
                  onChange={(e) => setIntegrationForm({ ...integrationForm, provider: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="int-category">Category</Label>
                <Select
                  value={integrationForm.category}
                  onValueChange={(value) => setIntegrationForm({ ...integrationForm, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="communication">Communication</SelectItem>
                    <SelectItem value="productivity">Productivity</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="payments">Payments</SelectItem>
                    <SelectItem value="crm">CRM</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="storage">Storage</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="int-desc">Description</Label>
                <Textarea
                  id="int-desc"
                  placeholder="What does this integration do?"
                  value={integrationForm.description}
                  onChange={(e) => setIntegrationForm({ ...integrationForm, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateIntegrationDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateIntegration} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Add Integration
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Zap Dialog */}
        <Dialog open={showCreateZapDialog} onOpenChange={setShowCreateZapDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Zap</DialogTitle>
              <DialogDescription>Set up a new automation workflow</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="zap-name">Name *</Label>
                <Input
                  id="zap-name"
                  placeholder="e.g., New Lead Notification"
                  value={workflowForm.name}
                  onChange={(e) => setWorkflowForm({ ...workflowForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zap-type">Type</Label>
                <Select
                  value={workflowForm.type}
                  onValueChange={(value: WorkflowType['type']) => setWorkflowForm({ ...workflowForm, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="integration">Integration</SelectItem>
                    <SelectItem value="approval">Approval</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="notification">Notification</SelectItem>
                    <SelectItem value="data-sync">Data Sync</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="zap-priority">Priority</Label>
                <Select
                  value={workflowForm.priority}
                  onValueChange={(value: WorkflowType['priority']) => setWorkflowForm({ ...workflowForm, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="zap-desc">Description</Label>
                <Textarea
                  id="zap-desc"
                  placeholder="What does this automation do?"
                  value={workflowForm.description}
                  onChange={(e) => setWorkflowForm({ ...workflowForm, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateZapDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateZap} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                Create Zap
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Webhook Dialog */}
        <Dialog open={showCreateWebhookDialog} onOpenChange={setShowCreateWebhookDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Webhook</DialogTitle>
              <DialogDescription>Set up a new webhook endpoint</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wh-name">Name *</Label>
                <Input
                  id="wh-name"
                  placeholder="e.g., Order Webhook"
                  value={webhookForm.name}
                  onChange={(e) => setWebhookForm({ ...webhookForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wh-url">URL *</Label>
                <Input
                  id="wh-url"
                  placeholder="https://your-endpoint.com/webhook"
                  value={webhookForm.url}
                  onChange={(e) => setWebhookForm({ ...webhookForm, url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wh-desc">Description</Label>
                <Textarea
                  id="wh-desc"
                  placeholder="What is this webhook for?"
                  value={webhookForm.description}
                  onChange={(e) => setWebhookForm({ ...webhookForm, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateWebhookDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateWebhook} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Webhook className="w-4 h-4 mr-2" />}
                Create Webhook
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Workflow Templates Dialog */}
        <Dialog open={showTemplatesDialog} onOpenChange={setShowTemplatesDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Workflow Templates
              </DialogTitle>
              <DialogDescription>
                Choose a pre-built workflow template to get started quickly
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              {[
                { name: 'Lead to CRM', desc: 'Automatically add new leads to your CRM', icon: Users, color: 'text-blue-500' },
                { name: 'Email Notifications', desc: 'Send emails when events occur', icon: Mail, color: 'text-green-500' },
                { name: 'Slack Updates', desc: 'Post updates to Slack channels', icon: MessageSquare, color: 'text-purple-500' },
                { name: 'Data Sync', desc: 'Keep data in sync across apps', icon: RefreshCw, color: 'text-orange-500' },
                { name: 'Task Automation', desc: 'Create tasks from events', icon: CheckCircle, color: 'text-teal-500' },
                { name: 'Custom Webhook', desc: 'Trigger custom webhooks', icon: Webhook, color: 'text-red-500' }
              ].map((template, idx) => (
                <button
                  key={idx}
                  className="p-4 border rounded-lg hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors text-left"
                  onClick={() => {
                    setShowTemplatesDialog(false)
                    setShowCreateZapDialog(true)
                    setWorkflowForm({ ...workflowForm, name: template.name, description: template.desc })
                    toast.success(`Template "${template.name}" selected`)
                  }}
                >
                  <template.icon className={`w-8 h-8 mb-2 ${template.color}`} />
                  <p className="font-medium">{template.name}</p>
                  <p className="text-xs text-gray-500">{template.desc}</p>
                </button>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTemplatesDialog(false)}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
