'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  X,
  AlertTriangle,
  Clock,
  ArrowRight,
  ArrowDown,
  Filter,
  ChevronRight,
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
  Cloud,
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
  Trash2,
  Copy,
  ExternalLink,
  ChevronDown,
  MoreVertical,
  Sparkles,
  Workflow,
  Timer,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'

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
            <Button className="bg-white text-orange-600 hover:bg-white/90">
              <Plus className="h-4 w-4 mr-2" />
              Create Zap
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-8">
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
          </TabsList>

          <TabsContent value="zaps" className="space-y-6">
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
                <Button variant="outline" size="sm">
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
                          <Button variant="ghost" size="sm">
                            {zap.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="sm">
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
                          <Button variant="outline" size="sm" className="w-full">
                            <Settings className="h-4 w-4 mr-2" />
                            Manage
                          </Button>
                        </div>
                      ) : (
                        <Button className="w-full bg-orange-500 hover:bg-orange-600">
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
                          <Button variant="ghost" size="sm">
                            <RefreshCcw className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
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
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Key className="h-4 w-4" />
                      Manage API Keys
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Shield className="h-4 w-4" />
                      Security Settings
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Webhook className="h-4 w-4" />
                      Webhooks
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Execution History</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
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
                          <Button variant="ghost" size="sm">
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
        </Tabs>
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

                <div className="grid grid-cols-4 gap-4">
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
                  <Button className="flex-1 bg-orange-500 hover:bg-orange-600">
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
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline">
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
                <div className="grid grid-cols-2 gap-4">
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
                  <Button variant="outline" className="flex-1">
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Sync Now
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Key className="h-4 w-4 mr-2" />
                    Reauthorize
                  </Button>
                  <Button variant="outline" className="text-red-600 hover:text-red-700">
                    <Unlink className="h-4 w-4 mr-2" />
                    Disconnect
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
