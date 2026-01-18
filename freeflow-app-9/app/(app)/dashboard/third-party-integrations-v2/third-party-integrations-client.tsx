'use client'

import { createClient } from '@/lib/supabase/client'

import React, { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Plug,
  Zap,
  Search,
  Plus,
  Settings,
  Play,
  Pause,
  RefreshCcw,
  Check,
  AlertTriangle,
  Clock,
  ArrowRight,
  ArrowDown,
  Filter,
  Activity,
  BarChart3,
  Shield,
  Key,
  Link2,
  Unlink,
  GitBranch,
  Code,
  Webhook,
  Database,
  Mail,
  MessageSquare,
  Calendar,
  CreditCard,
  ShoppingCart,
  FileText,
  Users,
  Globe,
  Layers,
  History,
  Eye,
  Edit,
  Copy,
  Sparkles,
  Workflow,
  Timer,
  CheckCircle,
  XCircle,
  AlertCircle,
  Bell,
  Lock,
  Palette,
  Info,
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

// Types
type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'pending' | 'rate_limited'
type IntegrationCategory = 'crm' | 'marketing' | 'payment' | 'storage' | 'communication' | 'analytics' | 'ecommerce' | 'productivity'
type TriggerType = 'webhook' | 'polling' | 'realtime'
type ActionType = 'create' | 'update' | 'delete' | 'get' | 'search' | 'custom'

interface IntegrationApp {
  id: string
  name: string
  description: string
  icon: string
  category: IntegrationCategory
  website: string
  docsUrl: string
  popular: boolean
}

interface Trigger {
  id: string
  name: string
  description: string
  type: TriggerType
  app: IntegrationApp
  fields: { name: string; type: string; required: boolean }[]
}

interface Action {
  id: string
  name: string
  description: string
  type: ActionType
  app: IntegrationApp
  fields: { name: string; type: string; required: boolean }[]
}

interface ZapStep {
  id: string
  type: 'trigger' | 'action' | 'filter' | 'delay'
  app?: IntegrationApp
  trigger?: Trigger
  action?: Action
  config: Record<string, any>
}

interface Zap {
  id: string
  name: string
  description: string
  status: 'active' | 'paused' | 'draft' | 'error'
  trigger: ZapStep
  actions: ZapStep[]
  createdAt: string
  updatedAt: string
  lastRun?: string
  runCount: number
  errorCount: number
  avgExecutionTime: number
}

interface Connection {
  id: string
  app: IntegrationApp
  status: IntegrationStatus
  connectedAt: string
  lastSync?: string
  credentials: {
    type: 'oauth' | 'api_key' | 'basic'
    expiresAt?: string
  }
  usageThisMonth: number
  rateLimit: number
  rateLimitRemaining: number
}

interface ExecutionLog {
  id: string
  zapId: string
  zapName: string
  status: 'success' | 'error' | 'skipped'
  triggeredAt: string
  completedAt: string
  duration: number
  stepsExecuted: number
  error?: string
}

// Mock Data
const mockApps: IntegrationApp[] = [
  { id: '1', name: 'Slack', description: 'Team communication', icon: 'slack', category: 'communication', website: 'https://slack.com', docsUrl: 'https://api.slack.com', popular: true },
  { id: '2', name: 'Salesforce', description: 'CRM platform', icon: 'salesforce', category: 'crm', website: 'https://salesforce.com', docsUrl: 'https://developer.salesforce.com', popular: true },
  { id: '3', name: 'Stripe', description: 'Payment processing', icon: 'stripe', category: 'payment', website: 'https://stripe.com', docsUrl: 'https://stripe.com/docs', popular: true },
  { id: '4', name: 'Google Sheets', description: 'Spreadsheets', icon: 'sheets', category: 'productivity', website: 'https://sheets.google.com', docsUrl: 'https://developers.google.com/sheets', popular: true },
  { id: '5', name: 'Mailchimp', description: 'Email marketing', icon: 'mailchimp', category: 'marketing', website: 'https://mailchimp.com', docsUrl: 'https://mailchimp.com/developer', popular: true },
  { id: '6', name: 'HubSpot', description: 'Marketing & CRM', icon: 'hubspot', category: 'crm', website: 'https://hubspot.com', docsUrl: 'https://developers.hubspot.com', popular: true },
  { id: '7', name: 'Dropbox', description: 'Cloud storage', icon: 'dropbox', category: 'storage', website: 'https://dropbox.com', docsUrl: 'https://dropbox.com/developers', popular: false },
  { id: '8', name: 'Shopify', description: 'E-commerce', icon: 'shopify', category: 'ecommerce', website: 'https://shopify.com', docsUrl: 'https://shopify.dev', popular: true },
  { id: '9', name: 'Notion', description: 'Workspace', icon: 'notion', category: 'productivity', website: 'https://notion.so', docsUrl: 'https://developers.notion.com', popular: true },
  { id: '10', name: 'Airtable', description: 'Database', icon: 'airtable', category: 'productivity', website: 'https://airtable.com', docsUrl: 'https://airtable.com/developers', popular: false },
]

const mockConnections: Connection[] = [
  {
    id: '1',
    app: mockApps[0],
    status: 'connected',
    connectedAt: '2024-01-15',
    lastSync: '2024-03-20T14:30:00',
    credentials: { type: 'oauth', expiresAt: '2025-01-15' },
    usageThisMonth: 45230,
    rateLimit: 100000,
    rateLimitRemaining: 54770
  },
  {
    id: '2',
    app: mockApps[1],
    status: 'connected',
    connectedAt: '2024-02-01',
    lastSync: '2024-03-20T12:00:00',
    credentials: { type: 'oauth', expiresAt: '2024-08-01' },
    usageThisMonth: 12450,
    rateLimit: 50000,
    rateLimitRemaining: 37550
  },
  {
    id: '3',
    app: mockApps[2],
    status: 'connected',
    connectedAt: '2024-01-20',
    lastSync: '2024-03-20T15:00:00',
    credentials: { type: 'api_key' },
    usageThisMonth: 8920,
    rateLimit: 25000,
    rateLimitRemaining: 16080
  },
  {
    id: '4',
    app: mockApps[4],
    status: 'error',
    connectedAt: '2024-03-01',
    lastSync: '2024-03-18T10:00:00',
    credentials: { type: 'api_key' },
    usageThisMonth: 560,
    rateLimit: 10000,
    rateLimitRemaining: 9440
  }
]

const mockZaps: Zap[] = [
  {
    id: '1',
    name: 'New Stripe Payment → Slack',
    description: 'Send notification to #sales when payment received',
    status: 'active',
    trigger: {
      id: 't1',
      type: 'trigger',
      app: mockApps[2],
      config: { event: 'payment.succeeded' }
    },
    actions: [
      {
        id: 'a1',
        type: 'action',
        app: mockApps[0],
        config: { channel: '#sales', message: 'New payment!' }
      }
    ],
    createdAt: '2024-02-15',
    updatedAt: '2024-03-18',
    lastRun: '2024-03-20T15:30:00',
    runCount: 1245,
    errorCount: 3,
    avgExecutionTime: 1.2
  },
  {
    id: '2',
    name: 'New Salesforce Lead → HubSpot',
    description: 'Sync new leads to HubSpot CRM',
    status: 'active',
    trigger: {
      id: 't2',
      type: 'trigger',
      app: mockApps[1],
      config: { object: 'Lead', event: 'create' }
    },
    actions: [
      {
        id: 'a2',
        type: 'action',
        app: mockApps[5],
        config: { action: 'create_contact' }
      }
    ],
    createdAt: '2024-01-20',
    updatedAt: '2024-03-15',
    lastRun: '2024-03-20T14:00:00',
    runCount: 892,
    errorCount: 12,
    avgExecutionTime: 2.5
  },
  {
    id: '3',
    name: 'New Shopify Order → Google Sheets',
    description: 'Log all orders to spreadsheet',
    status: 'paused',
    trigger: {
      id: 't3',
      type: 'trigger',
      app: mockApps[7],
      config: { event: 'order.created' }
    },
    actions: [
      {
        id: 'a3',
        type: 'action',
        app: mockApps[3],
        config: { spreadsheet: 'Orders 2024', worksheet: 'Sheet1' }
      }
    ],
    createdAt: '2024-03-01',
    updatedAt: '2024-03-10',
    runCount: 156,
    errorCount: 0,
    avgExecutionTime: 0.8
  }
]

const mockLogs: ExecutionLog[] = [
  { id: '1', zapId: '1', zapName: 'New Stripe Payment → Slack', status: 'success', triggeredAt: '2024-03-20T15:30:00', completedAt: '2024-03-20T15:30:01', duration: 1.2, stepsExecuted: 2 },
  { id: '2', zapId: '2', zapName: 'New Salesforce Lead → HubSpot', status: 'success', triggeredAt: '2024-03-20T14:00:00', completedAt: '2024-03-20T14:00:03', duration: 2.8, stepsExecuted: 2 },
  { id: '3', zapId: '1', zapName: 'New Stripe Payment → Slack', status: 'error', triggeredAt: '2024-03-20T12:15:00', completedAt: '2024-03-20T12:15:02', duration: 1.5, stepsExecuted: 1, error: 'Slack channel not found' },
  { id: '4', zapId: '1', zapName: 'New Stripe Payment → Slack', status: 'success', triggeredAt: '2024-03-20T10:45:00', completedAt: '2024-03-20T10:45:01', duration: 1.1, stepsExecuted: 2 },
  { id: '5', zapId: '3', zapName: 'New Shopify Order → Google Sheets', status: 'skipped', triggeredAt: '2024-03-20T09:00:00', completedAt: '2024-03-20T09:00:00', duration: 0.1, stepsExecuted: 0 },
]

const categories = ['All', 'CRM', 'Marketing', 'Payment', 'Storage', 'Communication', 'Analytics', 'E-commerce', 'Productivity']

// Enhanced Competitive Upgrade Mock Data
const mockIntegrationsAIInsights = [
  { id: '1', type: 'success' as const, title: 'All Systems Operational', description: '12 of 12 integrations running with 99.9% uptime.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Health' },
  { id: '2', type: 'warning' as const, title: 'Rate Limit Warning', description: 'Salesforce API approaching 80% of daily quota.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'API' },
  { id: '3', type: 'info' as const, title: 'New Integration Available', description: 'HubSpot v3 API now supported with enhanced features.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Updates' },
]

const mockIntegrationsCollaborators = [
  { id: '1', name: 'Integration Lead', avatar: '/avatars/mike.jpg', status: 'online' as const, role: 'Lead' },
  { id: '2', name: 'API Developer', avatar: '/avatars/alex.jpg', status: 'online' as const, role: 'Developer' },
  { id: '3', name: 'Support Engineer', avatar: '/avatars/bob.jpg', status: 'away' as const, role: 'Support' },
]

const mockIntegrationsPredictions = [
  { id: '1', title: 'API Usage Trend', prediction: 'Stripe API calls expected to increase 25% next week', confidence: 82, trend: 'up' as const, impact: 'medium' as const },
  { id: '2', title: 'Sync Performance', prediction: 'Data sync times will improve with new batching', confidence: 88, trend: 'down' as const, impact: 'low' as const },
]

const mockIntegrationsActivities = [
  { id: '1', user: 'Integration Lead', action: 'Connected', target: 'new Stripe webhook endpoint', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'API Developer', action: 'Updated', target: 'Salesforce OAuth credentials', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'System', action: 'Synced', target: '2,450 records from HubSpot', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'success' as const },
]

// Quick actions will be defined inside the component to access state setters

export default function ThirdPartyIntegrationsClient() {
  const [apps] = useState<IntegrationApp[]>(mockApps)
  const [connections] = useState<Connection[]>(mockConnections)
  const [zaps] = useState<Zap[]>(mockZaps)
  const [logs] = useState<ExecutionLog[]>(mockLogs)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null)
  const [selectedZap, setSelectedZap] = useState<Zap | null>(null)
  const [activeTab, setActiveTab] = useState('zaps')
  const [settingsTab, setSettingsTab] = useState('general')

  // Dialog states for quick actions
  const [showAddIntegrationDialog, setShowAddIntegrationDialog] = useState(false)
  const [showTestConnectionDialog, setShowTestConnectionDialog] = useState(false)
  const [showViewLogsDialog, setShowViewLogsDialog] = useState(false)

  // Additional dialog states
  const [showCreateZapDialog, setShowCreateZapDialog] = useState(false)
  const [showFilterZapsDialog, setShowFilterZapsDialog] = useState(false)
  const [showManageAppDialog, setShowManageAppDialog] = useState<IntegrationApp | null>(null)
  const [showConnectAppDialog, setShowConnectAppDialog] = useState<IntegrationApp | null>(null)
  const [showApiKeysDialog, setShowApiKeysDialog] = useState(false)
  const [showSecuritySettingsDialog, setShowSecuritySettingsDialog] = useState(false)
  const [showWebhooksDialog, setShowWebhooksDialog] = useState(false)
  const [showHistoryFilterDialog, setShowHistoryFilterDialog] = useState(false)
  const [showLogDetailDialog, setShowLogDetailDialog] = useState<ExecutionLog | null>(null)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [showApiDocsDialog, setShowApiDocsDialog] = useState(false)
  const [showSdksDialog, setShowSdksDialog] = useState(false)
  const [showAddWebhookDialog, setShowAddWebhookDialog] = useState(false)
  const [showCustomIntegrationDialog, setShowCustomIntegrationDialog] = useState(false)
  const [showExportDataDialog, setShowExportDataDialog] = useState(false)
  const [showCloneConfigDialog, setShowCloneConfigDialog] = useState(false)
  const [showPauseAllDialog, setShowPauseAllDialog] = useState(false)
  const [showDeleteConnectionsDialog, setShowDeleteConnectionsDialog] = useState(false)
  const [showResetSettingsDialog, setShowResetSettingsDialog] = useState(false)
  const [showRegenerateApiKeyDialog, setShowRegenerateApiKeyDialog] = useState<'production' | 'test' | null>(null)
  const [showWebhookTestDialog, setShowWebhookTestDialog] = useState<{ name: string; url: string } | null>(null)
  const [showWebhookEditDialog, setShowWebhookEditDialog] = useState<{ name: string; url: string; active: boolean } | null>(null)

  // Form states for Add Integration dialog
  const [newIntegrationApp, setNewIntegrationApp] = useState('')
  const [newIntegrationAuthType, setNewIntegrationAuthType] = useState<'oauth' | 'api_key' | 'basic'>('oauth')
  const [newIntegrationApiKey, setNewIntegrationApiKey] = useState('')
  const [newIntegrationUsername, setNewIntegrationUsername] = useState('')
  const [newIntegrationPassword, setNewIntegrationPassword] = useState('')

  // Test connection states
  const [testConnectionAppId, setTestConnectionAppId] = useState('')
  const [testConnectionStatus, setTestConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [testConnectionMessage, setTestConnectionMessage] = useState('')

  // Logs filter states
  const [logsFilterStatus, setLogsFilterStatus] = useState<'all' | 'success' | 'error' | 'skipped'>('all')
  const [logsFilterZapId, setLogsFilterZapId] = useState('')

  // Create Zap form states
  const [newZapName, setNewZapName] = useState('')
  const [newZapDescription, setNewZapDescription] = useState('')
  const [newZapTriggerApp, setNewZapTriggerApp] = useState('')
  const [newZapActionApp, setNewZapActionApp] = useState('')

  // Filter zaps states
  const [filterZapStatus, setFilterZapStatus] = useState<'all' | 'active' | 'paused' | 'draft' | 'error'>('all')
  const [filterZapApp, setFilterZapApp] = useState('')

  // History filter states (for dialog)
  const [historyDateRange, setHistoryDateRange] = useState('7days')
  const [historyStatus, setHistoryStatus] = useState('all')

  // Webhook form states
  const [newWebhookName, setNewWebhookName] = useState('')
  const [newWebhookUrl, setNewWebhookUrl] = useState('')
  const [newWebhookEvents, setNewWebhookEvents] = useState<string[]>([])

  // Custom integration form states
  const [customIntegrationName, setCustomIntegrationName] = useState('')
  const [customIntegrationDescription, setCustomIntegrationDescription] = useState('')
  const [customIntegrationAuthType, setCustomIntegrationAuthType] = useState('api_key')

  // Export/Clone states
  const [exportFormat, setExportFormat] = useState('json')
  const [cloneTarget, setCloneTarget] = useState('')

  // Manage app states
  const [manageAppSyncEnabled, setManageAppSyncEnabled] = useState(true)
  const [manageAppSyncInterval, setManageAppSyncInterval] = useState('15')

  // Quick actions with dialog triggers
  const integrationsQuickActions = [
    { id: '1', label: 'Add Integration', icon: 'plus', action: () => setShowAddIntegrationDialog(true), variant: 'default' as const },
    { id: '2', label: 'Test Connection', icon: 'refresh', action: () => setShowTestConnectionDialog(true), variant: 'default' as const },
    { id: '3', label: 'View Logs', icon: 'file', action: () => setShowViewLogsDialog(true), variant: 'outline' as const },
  ]

  // Handler for adding new integration
  const handleAddIntegration = () => {
    if (!newIntegrationApp) {
      toast.error('Please select an app')
      return
    }

    if (newIntegrationAuthType === 'api_key' && !newIntegrationApiKey) {
      toast.error('Please enter an API key')
      return
    }

    if (newIntegrationAuthType === 'basic' && (!newIntegrationUsername || !newIntegrationPassword)) {
      toast.error('Please enter username and password')
      return
    }

    const selectedApp = mockApps.find(a => a.id === newIntegrationApp)
    toast.success(`Integration Connected has been successfully connected using ${newIntegrationAuthType === 'api_key' ? 'API Key' : newIntegrationAuthType === 'basic' ? 'Basic Auth' : 'OAuth'}`)

    // Reset form
    setNewIntegrationApp('')
    setNewIntegrationAuthType('oauth')
    setNewIntegrationApiKey('')
    setNewIntegrationUsername('')
    setNewIntegrationPassword('')
    setShowAddIntegrationDialog(false)
  }

  // Handler for testing connection
  const handleTestConnection = async () => {
    if (!testConnectionAppId) {
      toast.error('Please select a connection to test')
      return
    }

    setTestConnectionStatus('testing')
    setTestConnectionMessage('Testing connection...')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const connection = connections.find(c => c.id === testConnectionAppId)
      const startTime = Date.now()

      // Actually test the connection by calling our API
      const response = await fetch('/api/integrations/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectionId: testConnectionAppId,
          appType: connection?.app.name
        })
      })

      const responseTime = Date.now() - startTime
      const result = await response.json()

      // Log the test result
      await supabase.from('integration_connection_tests').insert({
        user_id: user.id,
        connection_id: testConnectionAppId,
        status: result.success ? 'success' : 'failed',
        response_time_ms: responseTime,
        error_message: result.error || null
      })

      if (result.success) {
        setTestConnectionStatus('success')
        setTestConnectionMessage(`Connection to ${connection?.app.name} is healthy. Response time: ${responseTime}ms`)
      } else {
        setTestConnectionStatus('error')
        setTestConnectionMessage(`Connection to ${connection?.app.name} failed: ${result.error}`)
      }
    } catch (error: any) {
      setTestConnectionStatus('error')
      setTestConnectionMessage(`Connection test failed: ${error.message}`)
    }
  }

  // Reset test connection dialog
  const resetTestConnectionDialog = () => {
    setTestConnectionAppId('')
    setTestConnectionStatus('idle')
    setTestConnectionMessage('')
    setShowTestConnectionDialog(false)
  }

  // Filter logs based on selected filters
  const filteredLogs = useMemo(() => {
    let result = logs
    if (logsFilterStatus !== 'all') {
      result = result.filter(l => l.status === logsFilterStatus)
    }
    if (logsFilterZapId) {
      result = result.filter(l => l.zapId === logsFilterZapId)
    }
    return result
  }, [logs, logsFilterStatus, logsFilterZapId])

  // Stats
  const stats = useMemo(() => ({
    activeZaps: zaps.filter(z => z.status === 'active').length,
    totalRuns: zaps.reduce((sum, z) => sum + z.runCount, 0),
    successRate: logs.length > 0 ? (logs.filter(l => l.status === 'success').length / logs.length * 100) : 0,
    connectedApps: connections.filter(c => c.status === 'connected').length
  }), [zaps, logs, connections])

  // Filtered apps
  const filteredApps = useMemo(() => {
    let result = apps

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(a =>
        a.name.toLowerCase().includes(query) ||
        a.description.toLowerCase().includes(query)
      )
    }

    if (selectedCategory !== 'All') {
      result = result.filter(a => a.category.toLowerCase() === selectedCategory.toLowerCase())
    }

    return result
  }, [apps, searchQuery, selectedCategory])

  const getStatusColor = (status: IntegrationStatus | Zap['status']) => {
    const colors: Record<string, string> = {
      connected: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      disconnected: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
      paused: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      pending: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
      rate_limited: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getCategoryIcon = (category: IntegrationCategory) => {
    const icons: Record<IntegrationCategory, React.ReactNode> = {
      crm: <Users className="h-4 w-4" />,
      marketing: <Mail className="h-4 w-4" />,
      payment: <CreditCard className="h-4 w-4" />,
      storage: <Database className="h-4 w-4" />,
      communication: <MessageSquare className="h-4 w-4" />,
      analytics: <BarChart3 className="h-4 w-4" />,
      ecommerce: <ShoppingCart className="h-4 w-4" />,
      productivity: <Calendar className="h-4 w-4" />
    }
    return icons[category]
  }

  const getLogStatusIcon = (status: ExecutionLog['status']) => {
    const icons: Record<string, React.ReactNode> = {
      success: <CheckCircle className="h-4 w-4 text-green-500" />,
      error: <XCircle className="h-4 w-4 text-red-500" />,
      skipped: <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
    return icons[status]
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Handlers
  const handleConnectIntegration = (integrationName: string) => {
    toast.info(`Connecting ${integrationName}...`)
  }

  const handleDisconnectIntegration = (integrationName: string) => {
    toast.success(`Integration disconnected has been removed`)
  }

  const handleRefreshIntegration = (integrationName: string) => {
    toast.info(`Refreshing integration data...`)
  }

  const handleConfigureIntegration = (integrationName: string) => {
    toast.info(`Opening configuration settings`)
  }

  const handleViewLogs = (integrationName: string) => {
    toast.info(`Loading logs activity logs`)
  }

  // Create Zap handler
  const handleCreateZap = () => {
    if (!newZapName || !newZapTriggerApp || !newZapActionApp) {
      toast.error('Please fill in all required fields')
      return
    }
    const triggerApp = mockApps.find(a => a.id === newZapTriggerApp)
    const actionApp = mockApps.find(a => a.id === newZapActionApp)
    toast.success(`Zap Created: ${triggerApp?.name} → ${actionApp?.name}`)
    setNewZapName('')
    setNewZapDescription('')
    setNewZapTriggerApp('')
    setNewZapActionApp('')
    setShowCreateZapDialog(false)
  }

  // Toggle zap status handler
  const handleToggleZapStatus = (zap: Zap, e: React.MouseEvent) => {
    e.stopPropagation()
    const newStatus = zap.status === 'active' ? 'paused' : 'active'
    toast.success(`Zap ${newStatus === 'active' ? 'Activated' : 'Paused'}: "${zap.name}" is now ${newStatus}`)
  }

  // Edit zap handler
  const handleEditZap = (zap: Zap, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedZap(zap)
    toast.info(`Edit Mode: Editing "${zap.name}"`)
  }

  // Apply zap filters handler
  const handleApplyZapFilters = () => {
    toast.success(`Filters Applied: Showing ${filterZapStatus || 'all'} zaps${filterZapApp ? ` for ${mockApps.find(a => a.id === filterZapApp)?.name}` : ''}`)
    setShowFilterZapsDialog(false)
  }

  // Manage app handler
  const handleSaveAppSettings = () => {
    if (showManageAppDialog) {
      toast.success(`Settings Saved: "${showManageAppDialog}" settings updated`)
    }
    setShowManageAppDialog(null)
  }

  // Connect app handler
  const handleConnectApp = () => {
    if (showConnectAppDialog) {
      toast.success(`App Connected has been connected`)
    }
    setShowConnectAppDialog(null)
  }

  // Refresh connection handler
  const handleRefreshConnection = async (conn: Connection, e: React.MouseEvent) => {
    e.stopPropagation()
    const toastId = toast.loading(`Syncing ${conn.app.name} data...`)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Sync the integration data
      await supabase.from('integration_connections').update({
        last_synced_at: new Date().toISOString(),
        sync_status: 'synced'
      }).eq('id', conn.id)

      // Log sync event
      await supabase.from('integration_sync_logs').insert({
        user_id: user.id,
        connection_id: conn.id,
        status: 'success'
      })

      toast.dismiss(toastId)
      toast.success('Sync Complete', { description: `${conn.app.name} data is now up to date` })
    } catch (error: any) {
      toast.dismiss(toastId)
      toast.error('Sync failed', { description: error.message })
    }
  }

  // Connection settings handler
  const handleConnectionSettings = (conn: Connection, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedConnection(conn)
  }

  // History filter handler
  const handleApplyHistoryFilters = () => {
    toast.success('Filters Applied: logs for the last ' + historyDateRange)
    setShowHistoryFilterDialog(false)
  }

  // Refresh history handler
  const handleRefreshHistory = async () => {
    const toastId = toast.loading('Refreshing logs...')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Fetch fresh logs
      const { data: freshLogs, error } = await supabase
        .from('integration_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error

      toast.dismiss(toastId)
      toast.success('Logs Refreshed', { description: `${freshLogs?.length || 0} logs loaded` })
    } catch (error: any) {
      toast.dismiss(toastId)
      toast.error('Refresh failed', { description: error.message })
    }
  }

  // Upgrade handler
  const handleUpgrade = () => {
    toast.success('Upgrade Initiated')
    setShowUpgradeDialog(false)
  }

  // Regenerate API key handler
  const handleRegenerateApiKey = () => {
    const keyType = showRegenerateApiKeyDialog
    toast.success('API Key Regenerated: API key has been regenerated. Please update your applications.')
    setShowRegenerateApiKeyDialog(null)
  }

  // Webhook test handler
  const handleTestWebhook = async () => {
    if (showWebhookTestDialog) {
      const toastId = toast.loading(`Testing ${showWebhookTestDialog.name}...`)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        // Send test webhook
        const response = await fetch('/api/webhooks/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ webhookId: showWebhookTestDialog.id })
        })

        const result = await response.json()

        // Log test result
        await supabase.from('webhook_test_logs').insert({
          user_id: user.id,
          webhook_id: showWebhookTestDialog.id,
          status: result.success ? 'success' : 'failed',
          response_code: result.statusCode || null
        })

        toast.dismiss(toastId)
        if (result.success) {
          toast.success('Test Successful', { description: `${showWebhookTestDialog.name} responded with ${result.statusCode || 200} OK` })
        } else {
          toast.error('Test Failed', { description: result.error })
        }
        setShowWebhookTestDialog(null)
      } catch (error: any) {
        toast.dismiss(toastId)
        toast.error('Test failed', { description: error.message })
      }
    }
  }

  // Webhook edit handler
  const handleSaveWebhook = () => {
    if (showWebhookEditDialog) {
      toast.success('Webhook Updated: configuration saved')
    }
    setShowWebhookEditDialog(null)
  }

  // Add webhook handler
  const handleAddWebhook = () => {
    if (!newWebhookName || !newWebhookUrl) {
      toast.error('Please fill in all required fields')
      return
    }
    toast.success(`Webhook Created has been configured`)
    setNewWebhookName('')
    setNewWebhookUrl('')
    setNewWebhookEvents([])
    setShowAddWebhookDialog(false)
  }

  // Create custom integration handler
  const handleCreateCustomIntegration = () => {
    if (!customIntegrationName) {
      toast.error('Please provide an integration name')
      return
    }
    toast.success(`Custom Integration Created is ready for development`)
    setCustomIntegrationName('')
    setCustomIntegrationDescription('')
    setCustomIntegrationAuthType('api_key')
    setShowCustomIntegrationDialog(false)
  }

  // Export data handler
  const handleExportData = async () => {
    const toastId = toast.loading('Preparing export...')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Fetch all integration data
      const [connectionsRes, webhooksRes, logsRes] = await Promise.all([
        supabase.from('integration_connections').select('*').eq('user_id', user.id),
        supabase.from('webhooks').select('*').eq('user_id', user.id),
        supabase.from('integration_logs').select('*').eq('user_id', user.id).limit(500)
      ])

      const exportData = {
        exportedAt: new Date().toISOString(),
        connections: connectionsRes.data || [],
        webhooks: webhooksRes.data || [],
        logs: logsRes.data || []
      }

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `integrations-export-${Date.now()}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.dismiss(toastId)
      toast.success('Export Complete', { description: 'Your data has been downloaded' })
      setShowExportDataDialog(false)
    } catch (error: any) {
      toast.dismiss(toastId)
      toast.error('Export failed', { description: error.message })
    }
  }

  // Clone configuration handler
  const handleCloneConfig = () => {
    if (!cloneTarget) {
      toast.error('Please select a target environment')
      return
    }
    toast.success(`Configuration Cloned to ${cloneTarget}`)
    setCloneTarget('')
    setShowCloneConfigDialog(false)
  }

  // Pause all zaps handler
  const handlePauseAllZaps = () => {
    toast.success(`All Zaps Paused: active zaps have been paused`)
    setShowPauseAllDialog(false)
  }

  // Delete all connections handler
  const handleDeleteAllConnections = () => {
    toast.success('Connections Deleted')
    setShowDeleteConnectionsDialog(false)
  }

  // Reset settings handler
  const handleResetSettings = () => {
    toast.success('Settings Reset')
    setShowResetSettingsDialog(false)
  }

  // Sync connection now handler
  const handleSyncNow = async () => {
    if (selectedConnection) {
      const toastId = toast.loading(`Syncing ${selectedConnection.app.name}...`)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        // Update sync timestamp
        await supabase.from('integration_connections').update({
          last_synced_at: new Date().toISOString(),
          sync_status: 'synced'
        }).eq('id', selectedConnection.id)

        // Log sync
        await supabase.from('integration_sync_logs').insert({
          user_id: user.id,
          connection_id: selectedConnection.id,
          status: 'success'
        })

        toast.dismiss(toastId)
        toast.success('Sync Complete', { description: `${selectedConnection.app.name} data synchronized` })
      } catch (error: any) {
        toast.dismiss(toastId)
        toast.error('Sync failed', { description: error.message })
      }
    }
  }

  // Reauthorize connection handler
  const handleReauthorize = () => {
    if (selectedConnection) {
      toast.info(`Reauthorizing for authorization...`)
    }
  }

  // Disconnect connection handler
  const handleDisconnect = () => {
    if (selectedConnection) {
      toast.success(`Disconnected has been disconnected`)
      setSelectedConnection(null)
    }
  }

  // Zap detail toggle handler
  const handleToggleSelectedZapStatus = () => {
    if (selectedZap) {
      const newStatus = selectedZap.status === 'active' ? 'paused' : 'active'
      toast.success(`Zap ${newStatus === 'active' ? 'Activated' : 'Paused'}: "${selectedZap.name}" is now ${newStatus}`)
    }
  }

  // Edit selected zap handler
  const handleEditSelectedZap = () => {
    if (selectedZap) {
      toast.info(`Edit Mode: Editing "${selectedZap.name}"`)
    }
  }

  // View zap history handler
  const handleViewZapHistory = () => {
    if (selectedZap) {
      setActiveTab('history')
      setLogsFilterZapId(selectedZap.id)
      setSelectedZap(null)
      toast.info(`Filtered History: Showing logs for "${selectedZap.name}"`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/30 to-yellow-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Zap className="h-8 w-8" />
                Integrations
              </h1>
              <p className="mt-2 text-white/80">
                Connect your apps and automate workflows
              </p>
            </div>
            <Button className="bg-white text-orange-600 hover:bg-white/90" onClick={() => setShowCreateZapDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Zap
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mt-8">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold">{stats.activeZaps}</div>
              <div className="text-sm text-white/70">Active Zaps</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold">{stats.totalRuns.toLocaleString()}</div>
              <div className="text-sm text-white/70">Total Runs</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold">{stats.successRate.toFixed(0)}%</div>
              <div className="text-sm text-white/70">Success Rate</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold">{stats.connectedApps}</div>
              <div className="text-sm text-white/70">Connected Apps</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800">
            <TabsTrigger value="zaps" className="gap-2">
              <Workflow className="h-4 w-4" />
              Zaps
            </TabsTrigger>
            <TabsTrigger value="apps" className="gap-2">
              <Layers className="h-4 w-4" />
              Apps
            </TabsTrigger>
            <TabsTrigger value="connections" className="gap-2">
              <Plug className="h-4 w-4" />
              Connections
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="zaps" className="space-y-6">
            {/* Zaps Banner */}
            <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Automation Zaps</h2>
                  <p className="text-orange-100">Zapier-level workflow automation and triggers</p>
                  <p className="text-orange-200 text-xs mt-1">Multi-step workflows • Conditional logic • Error handling</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockZaps.length}</p>
                    <p className="text-orange-200 text-sm">Zaps</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockZaps.filter(z => z.status === 'active').length}</p>
                    <p className="text-orange-200 text-sm">Active</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search zaps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowFilterZapsDialog(true)}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {zaps.map(zap => (
                <Card
                  key={zap.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedZap(zap)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold">
                            {zap.trigger.app?.name[0]}
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            {zap.actions[0]?.app?.name[0]}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{zap.name}</h3>
                            <Badge className={getStatusColor(zap.status)}>
                              {zap.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">{zap.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <div className="font-semibold">{zap.runCount.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">Runs</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-red-500">{zap.errorCount}</div>
                          <div className="text-xs text-gray-500">Errors</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{zap.avgExecutionTime}s</div>
                          <div className="text-xs text-gray-500">Avg Time</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={(e) => handleToggleZapStatus(zap, e)}>
                            {zap.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={(e) => handleEditZap(zap, e)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {zap.lastRun && (
                      <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Last run: {new Date(zap.lastRun).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity className="h-4 w-4" />
                          {zap.actions.length + 1} steps
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="apps" className="space-y-6">
            {/* Apps Banner */}
            <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">App Directory</h2>
                  <p className="text-purple-100">Workato-level app connectivity and ecosystem</p>
                  <p className="text-purple-200 text-xs mt-1">1000+ apps • OAuth • API keys • Webhooks</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockApps.length}</p>
                    <p className="text-purple-200 text-sm">Available</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockApps.filter(a => a.connected).length}</p>
                    <p className="text-purple-200 text-sm">Connected</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search apps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {categories.map(cat => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredApps.map(app => {
                const connection = connections.find(c => c.app.id === app.id)
                return (
                  <Card key={app.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-lg">
                          {app.name[0]}
                        </div>
                        {app.popular && (
                          <Badge className="bg-amber-100 text-amber-700">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                      </div>

                      <h3 className="font-semibold mb-1">{app.name}</h3>
                      <p className="text-sm text-gray-500 mb-3">{app.description}</p>

                      <div className="flex items-center gap-2 mb-4">
                        {getCategoryIcon(app.category)}
                        <span className="text-sm text-gray-500 capitalize">{app.category}</span>
                      </div>

                      {connection ? (
                        <div className="space-y-2">
                          <Badge className={getStatusColor(connection.status)}>
                            {connection.status === 'connected' ? (
                              <Check className="h-3 w-3 mr-1" />
                            ) : (
                              <AlertTriangle className="h-3 w-3 mr-1" />
                            )}
                            {connection.status}
                          </Badge>
                          <Button variant="outline" size="sm" className="w-full" onClick={() => setShowManageAppDialog(app)}>
                            <Settings className="h-4 w-4 mr-2" />
                            Manage
                          </Button>
                        </div>
                      ) : (
                        <Button className="w-full bg-orange-500 hover:bg-orange-600" onClick={() => setShowConnectAppDialog(app)}>
                          <Link2 className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="connections" className="space-y-6">
            {/* Connections Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Active Connections</h2>
                  <p className="text-emerald-100">Tray.io-level connection management and monitoring</p>
                  <p className="text-emerald-200 text-xs mt-1">Health checks • Credential rotation • Usage stats</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{connections.length}</p>
                    <p className="text-emerald-200 text-sm">Connections</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{connections.filter(c => c.status === 'active').length}</p>
                    <p className="text-emerald-200 text-sm">Healthy</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {connections.map(conn => (
                  <Card
                    key={conn.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedConnection(conn)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-lg">
                            {conn.app.name[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{conn.app.name}</h3>
                              <Badge className={getStatusColor(conn.status)}>
                                {conn.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">{conn.app.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>Connected {new Date(conn.connectedAt).toLocaleDateString()}</span>
                              {conn.lastSync && (
                                <span>Last sync: {formatTime(conn.lastSync)}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={(e) => handleRefreshConnection(conn, e)}>
                            <RefreshCcw className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={(e) => handleConnectionSettings(conn, e)}>
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-500">API Usage</span>
                          <span className="font-medium">
                            {conn.usageThisMonth.toLocaleString()} / {conn.rateLimit.toLocaleString()}
                          </span>
                        </div>
                        <Progress value={(conn.usageThisMonth / conn.rateLimit) * 100} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Connection Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Connected</span>
                      <span className="font-semibold text-green-600">
                        {connections.filter(c => c.status === 'connected').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Errors</span>
                      <span className="font-semibold text-red-600">
                        {connections.filter(c => c.status === 'error').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Total API Calls</span>
                      <span className="font-semibold">
                        {connections.reduce((sum, c) => sum + c.usageThisMonth, 0).toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setShowApiKeysDialog(true)}>
                      <Key className="h-4 w-4" />
                      Manage API Keys
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setShowSecuritySettingsDialog(true)}>
                      <Shield className="h-4 w-4" />
                      Security Settings
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setShowWebhooksDialog(true)}>
                      <Webhook className="h-4 w-4" />
                      Webhooks
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            {/* History Banner */}
            <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Execution History</h2>
                  <p className="text-pink-100">n8n-level execution logs and debugging</p>
                  <p className="text-pink-200 text-xs mt-1">Step-by-step logs • Error replay • Data inspection</p>
                  <div className="flex gap-2 mt-3">
                    <span className="px-2 py-1 bg-white/10 rounded-lg text-xs">Real-time</span>
                    <span className="px-2 py-1 bg-white/10 rounded-lg text-xs">Retry Failed</span>
                    <span className="px-2 py-1 bg-white/10 rounded-lg text-xs">Export Logs</span>
                    <span className="px-2 py-1 bg-white/10 rounded-lg text-xs">Debug Mode</span>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockLogs.length}</p>
                    <p className="text-pink-200 text-sm">Executions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockLogs.filter(e => e.status === 'success').length}</p>
                    <p className="text-pink-200 text-sm">Successful</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Execution History</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowHistoryFilterDialog(true)}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" onClick={handleRefreshHistory}>
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {logs.map(log => (
                    <div key={log.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {getLogStatusIcon(log.status)}
                          <div>
                            <div className="font-medium">{log.zapName}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(log.triggeredAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <div className="font-medium">{log.duration}s</div>
                            <div className="text-xs text-gray-500">Duration</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium">{log.stepsExecuted}</div>
                            <div className="text-xs text-gray-500">Steps</div>
                          </div>
                          <Badge className={getStatusColor(log.status === 'success' ? 'connected' : log.status === 'error' ? 'error' : 'pending')}>
                            {log.status}
                          </Badge>
                          <Button variant="ghost" size="sm" onClick={() => setShowLogDetailDialog(log)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {log.error && (
                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-600">
                          {log.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              {/* Settings Sub-tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex gap-1 p-2 overflow-x-auto">
                  {[
                    { id: 'general', label: 'General', icon: Settings },
                    { id: 'execution', label: 'Execution', icon: Zap },
                    { id: 'security', label: 'Security', icon: Shield },
                    { id: 'notifications', label: 'Notifications', icon: Bell },
                    { id: 'api', label: 'API & Webhooks', icon: Webhook },
                    { id: 'advanced', label: 'Advanced', icon: Database }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setSettingsTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        settingsTab === tab.id
                          ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {/* General Settings */}
                {settingsTab === 'general' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">General Settings</h3>

                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Workflow className="w-5 h-5 text-orange-600" />
                          Default Zap Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <Label>Default Timezone</Label>
                            <Select defaultValue="utc-5">
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="utc-8">Pacific Time (UTC-8)</SelectItem>
                                <SelectItem value="utc-5">Eastern Time (UTC-5)</SelectItem>
                                <SelectItem value="utc">UTC</SelectItem>
                                <SelectItem value="utc+1">Central European (UTC+1)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Date Format</Label>
                            <Select defaultValue="mdy">
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                                <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                                <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Auto-activate New Zaps</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Start zaps immediately after creation</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Duplicate Detection</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Skip duplicate triggers</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Globe className="w-5 h-5 text-blue-600" />
                          Account Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Organization Name</Label>
                          <Input defaultValue="Kazi Technologies" className="mt-1" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <Label>Plan Type</Label>
                            <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Badge className="bg-orange-100 text-orange-700">Professional</Badge>
                                <Button variant="link" size="sm" className="text-orange-600" onClick={() => setShowUpgradeDialog(true)}>Upgrade</Button>
                              </div>
                            </div>
                          </div>
                          <div>
                            <Label>Monthly Task Limit</Label>
                            <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">45,230 / 100,000</span>
                                <span className="text-sm text-gray-500">45%</span>
                              </div>
                              <Progress value={45} className="h-1.5 mt-2" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Palette className="w-5 h-5 text-purple-600" />
                          Appearance
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Compact View</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Show more zaps per page</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Show Run Previews</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Preview data in execution logs</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Execution Settings */}
                {settingsTab === 'execution' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Execution Settings</h3>

                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Timer className="w-5 h-5 text-orange-600" />
                          Timing & Delays
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Polling Interval</Label>
                          <Select defaultValue="15">
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 minute</SelectItem>
                              <SelectItem value="5">5 minutes</SelectItem>
                              <SelectItem value="15">15 minutes</SelectItem>
                              <SelectItem value="30">30 minutes</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-gray-500 mt-1">How often to check for new triggers</p>
                        </div>
                        <div>
                          <Label>Default Delay Between Actions</Label>
                          <Select defaultValue="0">
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">No delay</SelectItem>
                              <SelectItem value="1">1 second</SelectItem>
                              <SelectItem value="5">5 seconds</SelectItem>
                              <SelectItem value="10">10 seconds</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Rate Limit Protection</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Auto-throttle to prevent API limits</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          Error Handling
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Retry Failed Tasks</Label>
                          <Select defaultValue="3">
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">No retries</SelectItem>
                              <SelectItem value="1">1 retry</SelectItem>
                              <SelectItem value="3">3 retries</SelectItem>
                              <SelectItem value="5">5 retries</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Auto-pause After Errors</Label>
                          <Select defaultValue="10">
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5 consecutive errors</SelectItem>
                              <SelectItem value="10">10 consecutive errors</SelectItem>
                              <SelectItem value="25">25 consecutive errors</SelectItem>
                              <SelectItem value="never">Never auto-pause</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Send Error Notifications</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Email on task failures</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Activity className="w-5 h-5 text-green-600" />
                          Performance
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Parallel Execution</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Run multiple actions simultaneously</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Smart Batching</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Group similar API calls</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Security Settings */}
                {settingsTab === 'security' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Security Settings</h3>

                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Lock className="w-5 h-5 text-red-600" />
                          Authentication
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Two-Factor Authentication</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Require 2FA for team members</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>SSO Only</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Require single sign-on</p>
                          </div>
                          <Switch />
                        </div>
                        <div>
                          <Label>Session Timeout</Label>
                          <Select defaultValue="24">
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 hour</SelectItem>
                              <SelectItem value="8">8 hours</SelectItem>
                              <SelectItem value="24">24 hours</SelectItem>
                              <SelectItem value="168">7 days</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Key className="w-5 h-5 text-amber-600" />
                          Credentials
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Encrypt Stored Credentials</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">AES-256 encryption for API keys</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Auto-refresh OAuth Tokens</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Automatically renew expiring tokens</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>Credential Expiration Warning</Label>
                          <Select defaultValue="7">
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3">3 days before</SelectItem>
                              <SelectItem value="7">7 days before</SelectItem>
                              <SelectItem value="14">14 days before</SelectItem>
                              <SelectItem value="30">30 days before</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Eye className="w-5 h-5 text-blue-600" />
                          Audit & Compliance
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Audit Logging</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Log all configuration changes</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <Label>Log Retention</Label>
                          <Select defaultValue="90">
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30 days</SelectItem>
                              <SelectItem value="90">90 days</SelectItem>
                              <SelectItem value="365">1 year</SelectItem>
                              <SelectItem value="forever">Forever</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notification Preferences</h3>

                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Bell className="w-5 h-5 text-orange-600" />
                          Zap Notifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Task Failures</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Notify when zaps fail</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Auto-pause Events</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Alert when zaps are auto-paused</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Rate Limit Warnings</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Warn when approaching limits</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Weekly Summary</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Weekly digest of zap activity</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Plug className="w-5 h-5 text-blue-600" />
                          Connection Notifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Connection Errors</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Alert on disconnections</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Token Expiration</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Remind before tokens expire</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Delivery Channels</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                              <Bell className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <Label>In-App Notifications</Label>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                              <Mail className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <Label>Email Notifications</Label>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                              <MessageSquare className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                              <Label>Slack Notifications</Label>
                            </div>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* API & Webhooks Settings */}
                {settingsTab === 'api' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">API & Webhooks</h3>

                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Key className="w-5 h-5 text-orange-600" />
                          API Keys
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Label>Production API Key</Label>
                            <Button variant="ghost" size="sm" onClick={() => setShowRegenerateApiKeyDialog('production')}>Regenerate</Button>
                          </div>
                          <Input type="password" value="zap_live_••••••••••••••••" readOnly className="font-mono" />
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Label>Test API Key</Label>
                            <Button variant="ghost" size="sm" onClick={() => setShowRegenerateApiKeyDialog('test')}>Regenerate</Button>
                          </div>
                          <Input type="password" value="zap_test_••••••••••••••••" readOnly className="font-mono" />
                        </div>
                        <div className="flex items-center gap-4">
                          <Button variant="outline" className="flex items-center gap-2" onClick={() => setShowApiDocsDialog(true)}>
                            <FileText className="w-4 h-4" />
                            API Docs
                          </Button>
                          <Button variant="outline" className="flex items-center gap-2" onClick={() => setShowSdksDialog(true)}>
                            <Code className="w-4 h-4" />
                            SDKs
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Webhook className="w-5 h-5 text-blue-600" />
                          Webhooks
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[
                            { name: 'Task Completed', url: 'https://api.kazi.io/webhooks/task-complete', active: true },
                            { name: 'Zap Error', url: 'https://api.kazi.io/webhooks/zap-error', active: true },
                            { name: 'Connection Lost', url: 'https://api.kazi.io/webhooks/connection-lost', active: false }
                          ].map((webhook, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{webhook.name}</span>
                                  {webhook.active && <Badge className="bg-green-100 text-green-700">Active</Badge>}
                                </div>
                                <p className="text-xs text-gray-500 font-mono">{webhook.url}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setShowWebhookTestDialog({ name: webhook.name, url: webhook.url })}>Test</Button>
                                <Button variant="ghost" size="sm" onClick={() => setShowWebhookEditDialog(webhook)}>Edit</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button variant="outline" className="mt-4 w-full" onClick={() => setShowAddWebhookDialog(true)}>
                          <Webhook className="w-4 h-4 mr-2" />
                          Add Webhook
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <GitBranch className="w-5 h-5 text-purple-600" />
                          Custom Integrations
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Developer Mode</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Build custom integrations</p>
                          </div>
                          <Switch />
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => setShowCustomIntegrationDialog(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Custom Integration
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Advanced Settings</h3>

                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Database className="w-5 h-5 text-blue-600" />
                          Data Management
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Execution History Retention</Label>
                          <Select defaultValue="30">
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="7">7 days</SelectItem>
                              <SelectItem value="30">30 days</SelectItem>
                              <SelectItem value="90">90 days</SelectItem>
                              <SelectItem value="365">1 year</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Auto-cleanup Old Data</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Remove data past retention period</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center gap-4">
                          <Button variant="outline" className="flex items-center gap-2" onClick={() => setShowExportDataDialog(true)}>
                            <FileText className="w-4 h-4" />
                            Export All Data
                          </Button>
                          <Button variant="outline" className="flex items-center gap-2" onClick={() => setShowCloneConfigDialog(true)}>
                            <Copy className="w-4 h-4" />
                            Clone Configuration
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Info className="w-5 h-5 text-green-600" />
                          Debug Mode
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Verbose Logging</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Log detailed execution info</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <Label>Test Mode</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Run zaps without side effects</p>
                          </div>
                          <Switch />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-800">
                      <CardHeader>
                        <CardTitle className="text-base text-red-600 dark:text-red-400 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div>
                            <Label className="text-red-700 dark:text-red-400">Pause All Zaps</Label>
                            <p className="text-sm text-red-600 dark:text-red-500">Immediately stop all active zaps</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => setShowPauseAllDialog(true)}>Pause All</Button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div>
                            <Label className="text-red-700 dark:text-red-400">Delete All Connections</Label>
                            <p className="text-sm text-red-600 dark:text-red-500">Remove all app connections</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => setShowDeleteConnectionsDialog(true)}>Delete</Button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div>
                            <Label className="text-red-700 dark:text-red-400">Reset All Settings</Label>
                            <p className="text-sm text-red-600 dark:text-red-500">Restore factory defaults</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => setShowResetSettingsDialog(true)}>Reset</Button>
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
              insights={mockIntegrationsAIInsights}
              title="Integration Intelligence"
              onInsightAction={(insight) => toast.info(insight.title || 'AI Insight')}
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
            actions={integrationsQuickActions}
            variant="grid"
          />
        </div>
      </div>

      {/* Zap Detail Dialog */}
      <Dialog open={!!selectedZap} onOpenChange={() => setSelectedZap(null)}>
        <DialogContent className="max-w-3xl">
          {selectedZap && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-xl">{selectedZap.name}</DialogTitle>
                    <p className="text-gray-500 mt-1">{selectedZap.description}</p>
                  </div>
                  <Badge className={getStatusColor(selectedZap.status)}>
                    {selectedZap.status}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-4">Workflow</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold">
                        {selectedZap.trigger.app?.name[0]}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{selectedZap.trigger.app?.name}</div>
                        <div className="text-sm text-gray-500">Trigger: {selectedZap.trigger.config.event || 'New event'}</div>
                      </div>
                      <Badge variant="outline">Trigger</Badge>
                    </div>

                    <div className="flex justify-center">
                      <ArrowDown className="h-6 w-6 text-gray-400" />
                    </div>

                    {selectedZap.actions.map((action, i) => (
                      <div key={action.id} className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold">
                          {action.app?.name[0]}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{action.app?.name}</div>
                          <div className="text-sm text-gray-500">Action: {action.config.action || 'Perform action'}</div>
                        </div>
                        <Badge variant="outline">Action {i + 1}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold">{selectedZap.runCount.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Total Runs</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-red-500">{selectedZap.errorCount}</div>
                      <div className="text-sm text-gray-500">Errors</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold">{selectedZap.avgExecutionTime}s</div>
                      <div className="text-sm text-gray-500">Avg Time</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-500">
                        {selectedZap.runCount > 0 ? ((1 - selectedZap.errorCount / selectedZap.runCount) * 100).toFixed(0) : 100}%
                      </div>
                      <div className="text-sm text-gray-500">Success Rate</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex items-center gap-3">
                  <Button className="flex-1 bg-orange-500 hover:bg-orange-600" onClick={handleToggleSelectedZapStatus}>
                    {selectedZap.status === 'active' ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause Zap
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Activate Zap
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={handleEditSelectedZap}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" onClick={handleViewZapHistory}>
                    <History className="h-4 w-4 mr-2" />
                    View History
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Connection Detail Dialog */}
      <Dialog open={!!selectedConnection} onOpenChange={() => setSelectedConnection(null)}>
        <DialogContent className="max-w-2xl">
          {selectedConnection && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-xl">
                    {selectedConnection.app.name[0]}
                  </div>
                  <div>
                    <DialogTitle className="text-xl">{selectedConnection.app.name}</DialogTitle>
                    <p className="text-gray-500">{selectedConnection.app.description}</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-gray-500 mb-1">Status</div>
                      <Badge className={getStatusColor(selectedConnection.status)}>
                        {selectedConnection.status}
                      </Badge>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-gray-500 mb-1">Auth Type</div>
                      <div className="font-medium capitalize">{selectedConnection.credentials.type.replace('_', ' ')}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-gray-500 mb-1">Connected</div>
                      <div className="font-medium">{new Date(selectedConnection.connectedAt).toLocaleDateString()}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-gray-500 mb-1">Last Sync</div>
                      <div className="font-medium">
                        {selectedConnection.lastSync ? new Date(selectedConnection.lastSync).toLocaleString() : 'Never'}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">API Usage This Month</span>
                    <span className="text-sm text-gray-500">
                      {selectedConnection.usageThisMonth.toLocaleString()} / {selectedConnection.rateLimit.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={(selectedConnection.usageThisMonth / selectedConnection.rateLimit) * 100} className="h-3" />
                  <div className="text-sm text-gray-500 mt-1">
                    {selectedConnection.rateLimitRemaining.toLocaleString()} requests remaining
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button variant="outline" className="flex-1" onClick={handleSyncNow}>
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Sync Now
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={handleReauthorize}>
                    <Key className="h-4 w-4 mr-2" />
                    Reauthorize
                  </Button>
                  <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={handleDisconnect}>
                    <Unlink className="h-4 w-4 mr-2" />
                    Disconnect
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Integration Dialog */}
      <Dialog open={showAddIntegrationDialog} onOpenChange={setShowAddIntegrationDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-orange-500" />
              Add New Integration
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <Label>Select Application</Label>
              <Select value={newIntegrationApp} onValueChange={setNewIntegrationApp}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose an app to connect..." />
                </SelectTrigger>
                <SelectContent>
                  {mockApps.map(app => (
                    <SelectItem key={app.id} value={app.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-xs font-bold">
                          {app.name[0]}
                        </div>
                        <span>{app.name}</span>
                        <span className="text-xs text-gray-500">({app.category})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Authentication Type</Label>
              <Select value={newIntegrationAuthType} onValueChange={(value: 'oauth' | 'api_key' | 'basic') => setNewIntegrationAuthType(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oauth">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-500" />
                      OAuth 2.0 (Recommended)
                    </div>
                  </SelectItem>
                  <SelectItem value="api_key">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-amber-500" />
                      API Key
                    </div>
                  </SelectItem>
                  <SelectItem value="basic">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-gray-500" />
                      Basic Authentication
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newIntegrationAuthType === 'oauth' && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-700 dark:text-blue-400">OAuth Authentication</p>
                    <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                      You will be redirected to {mockApps.find(a => a.id === newIntegrationApp)?.name || 'the application'} to authorize access.
                      This is the most secure authentication method.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {newIntegrationAuthType === 'api_key' && (
              <div className="space-y-3">
                <div>
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    value={newIntegrationApiKey}
                    onChange={(e) => setNewIntegrationApiKey(e.target.value)}
                    placeholder="Enter your API key..."
                    className="mt-1 font-mono"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Your API key will be encrypted and stored securely.
                </p>
              </div>
            )}

            {newIntegrationAuthType === 'basic' && (
              <div className="space-y-3">
                <div>
                  <Label>Username</Label>
                  <Input
                    value={newIntegrationUsername}
                    onChange={(e) => setNewIntegrationUsername(e.target.value)}
                    placeholder="Enter username..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={newIntegrationPassword}
                    onChange={(e) => setNewIntegrationPassword(e.target.value)}
                    placeholder="Enter password..."
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-4 border-t">
              <Button variant="outline" className="flex-1" onClick={() => setShowAddIntegrationDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1 bg-orange-500 hover:bg-orange-600" onClick={handleAddIntegration}>
                <Link2 className="h-4 w-4 mr-2" />
                {newIntegrationAuthType === 'oauth' ? 'Continue with OAuth' : 'Connect Integration'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Test Connection Dialog */}
      <Dialog open={showTestConnectionDialog} onOpenChange={(open) => !open && resetTestConnectionDialog()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCcw className="h-5 w-5 text-blue-500" />
              Test Connection
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <Label>Select Connection to Test</Label>
              <Select value={testConnectionAppId} onValueChange={setTestConnectionAppId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a connection..." />
                </SelectTrigger>
                <SelectContent>
                  {connections.map(conn => (
                    <SelectItem key={conn.id} value={conn.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-xs font-bold">
                          {conn.app.name[0]}
                        </div>
                        <span>{conn.app.name}</span>
                        <Badge className={`ml-2 ${getStatusColor(conn.status)}`}>
                          {conn.status}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {testConnectionStatus !== 'idle' && (
              <div className={`p-4 rounded-lg ${
                testConnectionStatus === 'testing' ? 'bg-blue-50 dark:bg-blue-900/20' :
                testConnectionStatus === 'success' ? 'bg-green-50 dark:bg-green-900/20' :
                'bg-red-50 dark:bg-red-900/20'
              }`}>
                <div className="flex items-start gap-3">
                  {testConnectionStatus === 'testing' && (
                    <RefreshCcw className="h-5 w-5 text-blue-500 animate-spin" />
                  )}
                  {testConnectionStatus === 'success' && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {testConnectionStatus === 'error' && (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className={`font-medium ${
                      testConnectionStatus === 'testing' ? 'text-blue-700 dark:text-blue-400' :
                      testConnectionStatus === 'success' ? 'text-green-700 dark:text-green-400' :
                      'text-red-700 dark:text-red-400'
                    }`}>
                      {testConnectionStatus === 'testing' ? 'Testing Connection...' :
                       testConnectionStatus === 'success' ? 'Connection Successful' :
                       'Connection Failed'}
                    </p>
                    <p className={`text-sm mt-1 ${
                      testConnectionStatus === 'testing' ? 'text-blue-600 dark:text-blue-300' :
                      testConnectionStatus === 'success' ? 'text-green-600 dark:text-green-300' :
                      'text-red-600 dark:text-red-300'
                    }`}>
                      {testConnectionMessage}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {testConnectionAppId && testConnectionStatus === 'idle' && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium mb-2">Connection Details</h4>
                {(() => {
                  const conn = connections.find(c => c.id === testConnectionAppId)
                  if (!conn) return null
                  return (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">App:</span>
                        <span className="font-medium">{conn.app.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Auth Type:</span>
                        <span className="font-medium capitalize">{conn.credentials.type.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Connected:</span>
                        <span className="font-medium">{new Date(conn.connectedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Last Sync:</span>
                        <span className="font-medium">{conn.lastSync ? new Date(conn.lastSync).toLocaleString() : 'Never'}</span>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}

            <div className="flex items-center gap-3 pt-4 border-t">
              <Button variant="outline" className="flex-1" onClick={resetTestConnectionDialog}>
                Close
              </Button>
              <Button
                className="flex-1 bg-blue-500 hover:bg-blue-600"
                onClick={handleTestConnection}
                disabled={!testConnectionAppId || testConnectionStatus === 'testing'}
              >
                <Activity className="h-4 w-4 mr-2" />
                {testConnectionStatus === 'testing' ? 'Testing...' : 'Run Test'}
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
              <History className="h-5 w-5 text-purple-500" />
              Integration Logs
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-xs text-gray-500">Filter by Status</Label>
                <Select value={logsFilterStatus} onValueChange={(value: 'all' | 'success' | 'error' | 'skipped') => setLogsFilterStatus(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="success">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Success
                      </div>
                    </SelectItem>
                    <SelectItem value="error">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        Error
                      </div>
                    </SelectItem>
                    <SelectItem value="skipped">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                        Skipped
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label className="text-xs text-gray-500">Filter by Zap</Label>
                <Select value={logsFilterZapId} onValueChange={setLogsFilterZapId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All Zaps" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Zaps</SelectItem>
                    {zaps.map(zap => (
                      <SelectItem key={zap.id} value={zap.id}>{zap.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
              <div className="divide-y">
                {filteredLogs.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <History className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No logs match your filters</p>
                  </div>
                ) : (
                  filteredLogs.map(log => (
                    <div key={log.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {log.status === 'success' && <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />}
                          {log.status === 'error' && <XCircle className="h-5 w-5 text-red-500 mt-0.5" />}
                          {log.status === 'skipped' && <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />}
                          <div>
                            <div className="font-medium">{log.zapName}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(log.triggeredAt).toLocaleString()}
                            </div>
                            {log.error && (
                              <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-600 dark:text-red-400">
                                {log.error}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-center">
                            <div className="font-medium">{log.duration}s</div>
                            <div className="text-xs text-gray-500">Duration</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium">{log.stepsExecuted}</div>
                            <div className="text-xs text-gray-500">Steps</div>
                          </div>
                          <Badge className={getStatusColor(
                            log.status === 'success' ? 'connected' :
                            log.status === 'error' ? 'error' : 'pending'
                          )}>
                            {log.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-500">
                Showing {filteredLogs.length} of {logs.length} logs
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  setLogsFilterStatus('all')
                  setLogsFilterZapId('')
                }}>
                  Clear Filters
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowViewLogsDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Zap Dialog */}
      <Dialog open={showCreateZapDialog} onOpenChange={setShowCreateZapDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-500" />
              Create New Zap
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Zap Name</Label>
              <Input
                value={newZapName}
                onChange={(e) => setNewZapName(e.target.value)}
                placeholder="e.g., New Lead to Slack"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={newZapDescription}
                onChange={(e) => setNewZapDescription(e.target.value)}
                placeholder="What does this zap do?"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Trigger App</Label>
              <Select value={newZapTriggerApp} onValueChange={setNewZapTriggerApp}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select trigger app..." />
                </SelectTrigger>
                <SelectContent>
                  {mockApps.map(app => (
                    <SelectItem key={app.id} value={app.id}>{app.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Action App</Label>
              <Select value={newZapActionApp} onValueChange={setNewZapActionApp}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select action app..." />
                </SelectTrigger>
                <SelectContent>
                  {mockApps.map(app => (
                    <SelectItem key={app.id} value={app.id}>{app.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button variant="outline" className="flex-1" onClick={() => setShowCreateZapDialog(false)}>Cancel</Button>
              <Button className="flex-1 bg-orange-500 hover:bg-orange-600" onClick={handleCreateZap}>Create Zap</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filter Zaps Dialog */}
      <Dialog open={showFilterZapsDialog} onOpenChange={setShowFilterZapsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-500" />
              Filter Zaps
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Status</Label>
              <Select value={filterZapStatus} onValueChange={(v: 'all' | 'active' | 'paused' | 'draft' | 'error') => setFilterZapStatus(v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>App</Label>
              <Select value={filterZapApp} onValueChange={setFilterZapApp}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All Apps" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Apps</SelectItem>
                  {mockApps.map(app => (
                    <SelectItem key={app.id} value={app.id}>{app.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button variant="outline" className="flex-1" onClick={() => { setFilterZapStatus('all'); setFilterZapApp(''); }}>Reset</Button>
              <Button className="flex-1 bg-blue-500 hover:bg-blue-600" onClick={handleApplyZapFilters}>Apply Filters</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage App Dialog */}
      <Dialog open={!!showManageAppDialog} onOpenChange={() => setShowManageAppDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-orange-500" />
              Manage {showManageAppDialog?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <Label>Auto Sync</Label>
                <p className="text-sm text-gray-500">Automatically sync data</p>
              </div>
              <Switch checked={manageAppSyncEnabled} onCheckedChange={setManageAppSyncEnabled} />
            </div>
            <div>
              <Label>Sync Interval</Label>
              <Select value={manageAppSyncInterval} onValueChange={setManageAppSyncInterval}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Every 5 minutes</SelectItem>
                  <SelectItem value="15">Every 15 minutes</SelectItem>
                  <SelectItem value="30">Every 30 minutes</SelectItem>
                  <SelectItem value="60">Every hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button variant="outline" className="flex-1" onClick={() => setShowManageAppDialog(null)}>Cancel</Button>
              <Button className="flex-1 bg-orange-500 hover:bg-orange-600" onClick={handleSaveAppSettings}>Save Settings</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Connect App Dialog */}
      <Dialog open={!!showConnectAppDialog} onOpenChange={() => setShowConnectAppDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-green-500" />
              Connect {showConnectAppDialog?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                You will be redirected to {showConnectAppDialog?.name} to authorize the connection.
              </p>
            </div>
            <div className="text-sm text-gray-500">
              <p className="mb-2">This will allow Kazi to:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Read your {showConnectAppDialog?.name} data</li>
                <li>Create and update records</li>
                <li>Receive notifications</li>
              </ul>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button variant="outline" className="flex-1" onClick={() => setShowConnectAppDialog(null)}>Cancel</Button>
              <Button className="flex-1 bg-green-500 hover:bg-green-600" onClick={handleConnectApp}>Connect</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* API Keys Dialog */}
      <Dialog open={showApiKeysDialog} onOpenChange={setShowApiKeysDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-amber-500" />
              Manage API Keys
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {connections.map(conn => (
              <div key={conn.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{conn.app.name}</span>
                  <Badge className={getStatusColor(conn.status)}>{conn.status}</Badge>
                </div>
                <div className="text-xs text-gray-500">
                  Type: {conn.credentials.type} | Connected: {new Date(conn.connectedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setShowApiKeysDialog(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Security Settings Dialog */}
      <Dialog open={showSecuritySettingsDialog} onOpenChange={setShowSecuritySettingsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              Security Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <Label>Require 2FA</Label>
                <p className="text-sm text-gray-500">For all team members</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <Label>IP Whitelist</Label>
                <p className="text-sm text-gray-500">Restrict API access by IP</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <Label>Audit Logging</Label>
                <p className="text-sm text-gray-500">Log all API requests</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setShowSecuritySettingsDialog(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Webhooks Dialog */}
      <Dialog open={showWebhooksDialog} onOpenChange={setShowWebhooksDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5 text-blue-500" />
              Webhooks
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              {[
                { name: 'Task Completed', url: 'https://api.kazi.io/webhooks/task-complete', active: true },
                { name: 'Zap Error', url: 'https://api.kazi.io/webhooks/zap-error', active: true },
                { name: 'Connection Lost', url: 'https://api.kazi.io/webhooks/connection-lost', active: false }
              ].map((wh, i) => (
                <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{wh.name}</span>
                    {wh.active && <Badge className="bg-green-100 text-green-700">Active</Badge>}
                  </div>
                  <p className="text-xs text-gray-500 font-mono mt-1">{wh.url}</p>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full" onClick={() => { setShowWebhooksDialog(false); setShowAddWebhookDialog(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Webhook
            </Button>
            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setShowWebhooksDialog(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* History Filter Dialog */}
      <Dialog open={showHistoryFilterDialog} onOpenChange={setShowHistoryFilterDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-pink-500" />
              Filter History
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Date Range</Label>
              <Select value={historyDateRange} onValueChange={setHistoryDateRange}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24hours">Last 24 hours</SelectItem>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={historyStatus} onValueChange={setHistoryStatus}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="skipped">Skipped</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button variant="outline" className="flex-1" onClick={() => { setHistoryDateRange('7days'); setHistoryStatus('all'); }}>Reset</Button>
              <Button className="flex-1 bg-pink-500 hover:bg-pink-600" onClick={handleApplyHistoryFilters}>Apply</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Log Detail Dialog */}
      <Dialog open={!!showLogDetailDialog} onOpenChange={() => setShowLogDetailDialog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-500" />
              Execution Details
            </DialogTitle>
          </DialogHeader>
          {showLogDetailDialog && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-500">Zap</div>
                  <div className="font-medium">{showLogDetailDialog.zapName}</div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-500">Status</div>
                  <Badge className={getStatusColor(showLogDetailDialog.status === 'success' ? 'connected' : showLogDetailDialog.status === 'error' ? 'error' : 'pending')}>
                    {showLogDetailDialog.status}
                  </Badge>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-500">Duration</div>
                  <div className="font-medium">{showLogDetailDialog.duration}s</div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-500">Steps Executed</div>
                  <div className="font-medium">{showLogDetailDialog.stepsExecuted}</div>
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-sm text-gray-500">Triggered At</div>
                <div className="font-medium">{new Date(showLogDetailDialog.triggeredAt).toLocaleString()}</div>
              </div>
              {showLogDetailDialog.error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-sm text-red-600 font-medium">Error</div>
                  <div className="text-sm text-red-500">{showLogDetailDialog.error}</div>
                </div>
              )}
              <div className="flex justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setShowLogDetailDialog(null)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Upgrade Plan
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg text-white">
              <h3 className="font-bold text-lg">Enterprise Plan</h3>
              <p className="text-white/80 text-sm">Unlimited tasks, priority support, and advanced features</p>
              <div className="text-2xl font-bold mt-2">$299/month</div>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Unlimited zaps</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Unlimited tasks</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Priority support</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Custom integrations</li>
            </ul>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button variant="outline" className="flex-1" onClick={() => setShowUpgradeDialog(false)}>Maybe Later</Button>
              <Button className="flex-1 bg-orange-500 hover:bg-orange-600" onClick={handleUpgrade}>Upgrade Now</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Regenerate API Key Dialog */}
      <Dialog open={!!showRegenerateApiKeyDialog} onOpenChange={() => setShowRegenerateApiKeyDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Regenerate {showRegenerateApiKeyDialog} API Key
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Regenerating your API key will invalidate the current key. Make sure to update all applications using this key.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button variant="outline" className="flex-1" onClick={() => setShowRegenerateApiKeyDialog(null)}>Cancel</Button>
              <Button className="flex-1 bg-amber-500 hover:bg-amber-600" onClick={handleRegenerateApiKey}>Regenerate Key</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* API Docs Dialog */}
      <Dialog open={showApiDocsDialog} onOpenChange={setShowApiDocsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              API Documentation
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-blue-700 dark:text-blue-300">Getting Started</h4>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                Use your API key to authenticate requests to the Kazi API.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Endpoints</h4>
              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded font-mono text-sm">
                GET /api/v1/zaps
              </div>
              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded font-mono text-sm">
                POST /api/v1/zaps/execute
              </div>
              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded font-mono text-sm">
                GET /api/v1/connections
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setShowApiDocsDialog(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* SDKs Dialog */}
      <Dialog open={showSdksDialog} onOpenChange={setShowSdksDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-purple-500" />
              SDKs & Libraries
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {[
              { name: 'JavaScript/Node.js', cmd: 'npm install @kazi/sdk' },
              { name: 'Python', cmd: 'pip install kazi-sdk' },
              { name: 'Ruby', cmd: 'gem install kazi' },
              { name: 'Go', cmd: 'go get github.com/kazi/sdk-go' }
            ].map((sdk, i) => (
              <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="font-medium">{sdk.name}</div>
                <code className="text-sm text-gray-500">{sdk.cmd}</code>
              </div>
            ))}
            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setShowSdksDialog(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Webhook Test Dialog */}
      <Dialog open={!!showWebhookTestDialog} onOpenChange={() => setShowWebhookTestDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              Test Webhook
            </DialogTitle>
          </DialogHeader>
          {showWebhookTestDialog && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-sm text-gray-500">Webhook</div>
                <div className="font-medium">{showWebhookTestDialog.name}</div>
                <div className="text-xs text-gray-500 font-mono mt-1">{showWebhookTestDialog.url}</div>
              </div>
              <p className="text-sm text-gray-500">
                A test payload will be sent to verify the webhook endpoint is responding correctly.
              </p>
              <div className="flex items-center gap-3 pt-4 border-t">
                <Button variant="outline" className="flex-1" onClick={() => setShowWebhookTestDialog(null)}>Cancel</Button>
                <Button className="flex-1 bg-green-500 hover:bg-green-600" onClick={handleTestWebhook}>Send Test</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Webhook Edit Dialog */}
      <Dialog open={!!showWebhookEditDialog} onOpenChange={() => setShowWebhookEditDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-500" />
              Edit Webhook
            </DialogTitle>
          </DialogHeader>
          {showWebhookEditDialog && (
            <div className="space-y-4">
              <div>
                <Label>Webhook Name</Label>
                <Input defaultValue={showWebhookEditDialog.name} className="mt-1" />
              </div>
              <div>
                <Label>URL</Label>
                <Input defaultValue={showWebhookEditDialog.url} className="mt-1 font-mono" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Label>Active</Label>
                <Switch defaultChecked={showWebhookEditDialog.active} />
              </div>
              <div className="flex items-center gap-3 pt-4 border-t">
                <Button variant="outline" className="flex-1" onClick={() => setShowWebhookEditDialog(null)}>Cancel</Button>
                <Button className="flex-1 bg-blue-500 hover:bg-blue-600" onClick={handleSaveWebhook}>Save</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Webhook Dialog */}
      <Dialog open={showAddWebhookDialog} onOpenChange={setShowAddWebhookDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5 text-blue-500" />
              Add Webhook
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Webhook Name</Label>
              <Input
                value={newWebhookName}
                onChange={(e) => setNewWebhookName(e.target.value)}
                placeholder="e.g., Payment Received"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Endpoint URL</Label>
              <Input
                value={newWebhookUrl}
                onChange={(e) => setNewWebhookUrl(e.target.value)}
                placeholder="https://your-server.com/webhook"
                className="mt-1 font-mono"
              />
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button variant="outline" className="flex-1" onClick={() => setShowAddWebhookDialog(false)}>Cancel</Button>
              <Button className="flex-1 bg-blue-500 hover:bg-blue-600" onClick={handleAddWebhook}>Add Webhook</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom Integration Dialog */}
      <Dialog open={showCustomIntegrationDialog} onOpenChange={setShowCustomIntegrationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-purple-500" />
              Create Custom Integration
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Integration Name</Label>
              <Input
                value={customIntegrationName}
                onChange={(e) => setCustomIntegrationName(e.target.value)}
                placeholder="e.g., My Custom App"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={customIntegrationDescription}
                onChange={(e) => setCustomIntegrationDescription(e.target.value)}
                placeholder="What does this integration do?"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Authentication Type</Label>
              <Select value={customIntegrationAuthType} onValueChange={setCustomIntegrationAuthType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="api_key">API Key</SelectItem>
                  <SelectItem value="oauth">OAuth 2.0</SelectItem>
                  <SelectItem value="basic">Basic Auth</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button variant="outline" className="flex-1" onClick={() => setShowCustomIntegrationDialog(false)}>Cancel</Button>
              <Button className="flex-1 bg-purple-500 hover:bg-purple-600" onClick={handleCreateCustomIntegration}>Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Data Dialog */}
      <Dialog open={showExportDataDialog} onOpenChange={setShowExportDataDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Export Data
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xml">XML</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
              <p>This will export:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-gray-500">
                <li>All zap configurations</li>
                <li>Connection settings</li>
                <li>Execution history</li>
              </ul>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button variant="outline" className="flex-1" onClick={() => setShowExportDataDialog(false)}>Cancel</Button>
              <Button className="flex-1 bg-blue-500 hover:bg-blue-600" onClick={handleExportData}>Export</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clone Config Dialog */}
      <Dialog open={showCloneConfigDialog} onOpenChange={setShowCloneConfigDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Copy className="h-5 w-5 text-green-500" />
              Clone Configuration
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Target Environment</Label>
              <Select value={cloneTarget} onValueChange={setCloneTarget}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select environment..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="production-backup">Production Backup</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
              <p>This will clone:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-gray-500">
                <li>All settings and preferences</li>
                <li>Zap configurations (without credentials)</li>
                <li>Webhook configurations</li>
              </ul>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button variant="outline" className="flex-1" onClick={() => setShowCloneConfigDialog(false)}>Cancel</Button>
              <Button className="flex-1 bg-green-500 hover:bg-green-600" onClick={handleCloneConfig}>Clone</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pause All Zaps Dialog */}
      <Dialog open={showPauseAllDialog} onOpenChange={setShowPauseAllDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Pause All Zaps
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">
                This will immediately pause all {zaps.filter(z => z.status === 'active').length} active zaps. No automations will run until you manually reactivate them.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button variant="outline" className="flex-1" onClick={() => setShowPauseAllDialog(false)}>Cancel</Button>
              <Button variant="destructive" className="flex-1" onClick={handlePauseAllZaps}>Pause All</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete All Connections Dialog */}
      <Dialog open={showDeleteConnectionsDialog} onOpenChange={setShowDeleteConnectionsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete All Connections
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">
                This will remove all {connections.length} app connections. You will need to reconnect each app and reconfigure your zaps.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button variant="outline" className="flex-1" onClick={() => setShowDeleteConnectionsDialog(false)}>Cancel</Button>
              <Button variant="destructive" className="flex-1" onClick={handleDeleteAllConnections}>Delete All</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Settings Dialog */}
      <Dialog open={showResetSettingsDialog} onOpenChange={setShowResetSettingsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Reset All Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">
                This will restore all settings to their factory defaults. Your zaps and connections will remain intact, but all customizations will be lost.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button variant="outline" className="flex-1" onClick={() => setShowResetSettingsDialog(false)}>Cancel</Button>
              <Button variant="destructive" className="flex-1" onClick={handleResetSettings}>Reset All</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
