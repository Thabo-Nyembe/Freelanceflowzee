'use client'

import { useState, useMemo } from 'react'
import { useWebhooks, useWebhookEventTypes, Webhook, WebhookEventType } from '@/lib/hooks/use-webhooks'
import {
  Webhook as WebhookIcon,
  Zap,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Clock,
  Send,
  RefreshCw,
  Shield,
  Settings,
  Code,
  Globe,
  Activity,
  TrendingUp,
  TrendingDown,
  Play,
  Pause,
  Plus,
  Trash2,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Copy,
  ExternalLink,
  Terminal,
  Key,
  Lock,
  Unlock,
  RotateCcw,
  History,
  FileJson,
  ChevronRight,
  ChevronDown,
  X,
  ArrowRight,
  Link2,
  Braces,
  TestTube,
  Timer,
  Layers,
  GitBranch,
  Workflow,
  Box,
  Plug,
  Sparkles,
  Download,
  Upload,
  Bell,
  HardDrive,
  AlertOctagon,
  CreditCard,
  Sliders
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

// Comprehensive type definitions for Zapier-level webhooks
type AuthType = 'none' | 'api_key' | 'bearer' | 'basic' | 'oauth2' | 'hmac'
type DeliveryStatus = 'success' | 'failed' | 'pending' | 'retrying'
type WebhookStatus = 'active' | 'paused' | 'failed' | 'disabled'

interface WebhookEndpoint {
  id: string
  name: string
  url: string
  description: string
  status: WebhookStatus
  events: string[]
  authType: AuthType
  secret: string
  headers: Record<string, string>
  retryPolicy: {
    maxRetries: number
    backoffType: 'linear' | 'exponential'
    initialDelay: number
  }
  rateLimiting: {
    enabled: boolean
    requestsPerMinute: number
  }
  filters: WebhookFilter[]
  totalDeliveries: number
  successfulDeliveries: number
  failedDeliveries: number
  successRate: number
  avgResponseTime: number
  lastDeliveryAt: string | null
  lastDeliveryStatus: DeliveryStatus | null
  createdAt: string
  updatedAt: string
}

interface WebhookFilter {
  id: string
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than'
  value: string
}

interface EventType {
  id: string
  name: string
  category: string
  description: string
  payloadExample: string
  subscriberCount: number
  totalDeliveries: number
  avgResponseTime: number
}

interface DeliveryLog {
  id: string
  webhookId: string
  webhookName: string
  eventType: string
  status: DeliveryStatus
  statusCode: number | null
  requestHeaders: Record<string, string>
  requestBody: string
  responseHeaders: Record<string, string> | null
  responseBody: string | null
  responseTime: number | null
  attempt: number
  maxAttempts: number
  error: string | null
  timestamp: string
}

interface Integration {
  id: string
  name: string
  icon: string
  category: string
  description: string
  installed: boolean
  eventsSupported: string[]
  popularity: number
}

interface WebhookTemplate {
  id: string
  name: string
  description: string
  url: string
  events: string[]
  headers: Record<string, string>
  category: string
}

interface WebhookStats {
  totalEndpoints: number
  activeEndpoints: number
  pausedEndpoints: number
  failedEndpoints: number
  totalDeliveries: number
  successfulDeliveries: number
  failedDeliveries: number
  successRate: number
  avgResponseTime: number
  deliveriesToday: number
  deliveriesThisWeek: number
}

// Mock data
const mockEndpoints: WebhookEndpoint[] = [
  {
    id: 'wh1',
    name: 'Slack Notifications',
    url: 'https://hooks.slack.com/services/T00000/B00000/XXXX',
    description: 'Send notifications to #general channel',
    status: 'active',
    events: ['user.created', 'order.completed', 'payment.received'],
    authType: 'bearer',
    secret: 'whsec_abc123def456ghi789',
    headers: { 'Content-Type': 'application/json' },
    retryPolicy: { maxRetries: 3, backoffType: 'exponential', initialDelay: 1000 },
    rateLimiting: { enabled: true, requestsPerMinute: 60 },
    filters: [],
    totalDeliveries: 15420,
    successfulDeliveries: 15380,
    failedDeliveries: 40,
    successRate: 99.74,
    avgResponseTime: 245,
    lastDeliveryAt: '2024-12-23T08:15:00Z',
    lastDeliveryStatus: 'success',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-12-20T14:30:00Z'
  },
  {
    id: 'wh2',
    name: 'CRM Sync',
    url: 'https://api.crm.example.com/webhooks/sync',
    description: 'Sync customer data to CRM',
    status: 'active',
    events: ['user.created', 'user.updated', 'user.deleted'],
    authType: 'api_key',
    secret: 'whsec_xyz789abc123',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': 'crm_key_xxx' },
    retryPolicy: { maxRetries: 5, backoffType: 'exponential', initialDelay: 2000 },
    rateLimiting: { enabled: true, requestsPerMinute: 100 },
    filters: [{ id: 'f1', field: 'user.type', operator: 'equals', value: 'customer' }],
    totalDeliveries: 8750,
    successfulDeliveries: 8720,
    failedDeliveries: 30,
    successRate: 99.66,
    avgResponseTime: 380,
    lastDeliveryAt: '2024-12-23T08:10:00Z',
    lastDeliveryStatus: 'success',
    createdAt: '2024-02-20T09:00:00Z',
    updatedAt: '2024-12-18T11:00:00Z'
  },
  {
    id: 'wh3',
    name: 'Analytics Tracker',
    url: 'https://analytics.example.com/events',
    description: 'Track all user events for analytics',
    status: 'paused',
    events: ['*'],
    authType: 'hmac',
    secret: 'whsec_analytics123',
    headers: { 'Content-Type': 'application/json' },
    retryPolicy: { maxRetries: 2, backoffType: 'linear', initialDelay: 500 },
    rateLimiting: { enabled: false, requestsPerMinute: 0 },
    filters: [],
    totalDeliveries: 45000,
    successfulDeliveries: 44800,
    failedDeliveries: 200,
    successRate: 99.56,
    avgResponseTime: 120,
    lastDeliveryAt: '2024-12-15T16:00:00Z',
    lastDeliveryStatus: 'success',
    createdAt: '2024-03-10T08:00:00Z',
    updatedAt: '2024-12-15T16:00:00Z'
  },
  {
    id: 'wh4',
    name: 'Payment Gateway',
    url: 'https://payment.example.com/webhook',
    description: 'Process payment confirmations',
    status: 'failed',
    events: ['payment.received', 'payment.failed', 'refund.created'],
    authType: 'bearer',
    secret: 'whsec_payment456',
    headers: { 'Content-Type': 'application/json' },
    retryPolicy: { maxRetries: 5, backoffType: 'exponential', initialDelay: 5000 },
    rateLimiting: { enabled: true, requestsPerMinute: 30 },
    filters: [{ id: 'f2', field: 'amount', operator: 'greater_than', value: '100' }],
    totalDeliveries: 3200,
    successfulDeliveries: 3100,
    failedDeliveries: 100,
    successRate: 96.88,
    avgResponseTime: 890,
    lastDeliveryAt: '2024-12-22T14:30:00Z',
    lastDeliveryStatus: 'failed',
    createdAt: '2024-04-05T11:00:00Z',
    updatedAt: '2024-12-22T14:30:00Z'
  }
]

const mockEventTypes: EventType[] = [
  { id: 'evt1', name: 'user.created', category: 'Users', description: 'Triggered when a new user is created', payloadExample: '{"user_id": "usr_123", "email": "user@example.com"}', subscriberCount: 4, totalDeliveries: 12500, avgResponseTime: 210 },
  { id: 'evt2', name: 'user.updated', category: 'Users', description: 'Triggered when user profile is updated', payloadExample: '{"user_id": "usr_123", "changes": {"name": "New Name"}}', subscriberCount: 2, totalDeliveries: 8900, avgResponseTime: 195 },
  { id: 'evt3', name: 'user.deleted', category: 'Users', description: 'Triggered when a user account is deleted', payloadExample: '{"user_id": "usr_123", "deleted_at": "2024-12-23T10:00:00Z"}', subscriberCount: 2, totalDeliveries: 450, avgResponseTime: 180 },
  { id: 'evt4', name: 'order.created', category: 'Orders', description: 'Triggered when a new order is placed', payloadExample: '{"order_id": "ord_456", "total": 99.99}', subscriberCount: 3, totalDeliveries: 15600, avgResponseTime: 320 },
  { id: 'evt5', name: 'order.completed', category: 'Orders', description: 'Triggered when an order is completed', payloadExample: '{"order_id": "ord_456", "status": "completed"}', subscriberCount: 3, totalDeliveries: 14200, avgResponseTime: 285 },
  { id: 'evt6', name: 'payment.received', category: 'Payments', description: 'Triggered when payment is received', payloadExample: '{"payment_id": "pay_789", "amount": 99.99}', subscriberCount: 2, totalDeliveries: 14100, avgResponseTime: 450 },
  { id: 'evt7', name: 'payment.failed', category: 'Payments', description: 'Triggered when payment fails', payloadExample: '{"payment_id": "pay_789", "error": "insufficient_funds"}', subscriberCount: 2, totalDeliveries: 890, avgResponseTime: 380 },
  { id: 'evt8', name: 'refund.created', category: 'Payments', description: 'Triggered when a refund is created', payloadExample: '{"refund_id": "ref_012", "amount": 50.00}', subscriberCount: 1, totalDeliveries: 320, avgResponseTime: 420 }
]

const mockDeliveryLogs: DeliveryLog[] = [
  { id: 'log1', webhookId: 'wh1', webhookName: 'Slack Notifications', eventType: 'order.completed', status: 'success', statusCode: 200, requestHeaders: { 'Content-Type': 'application/json' }, requestBody: '{"event": "order.completed", "data": {"order_id": "ord_123"}}', responseHeaders: { 'Content-Type': 'application/json' }, responseBody: '{"ok": true}', responseTime: 234, attempt: 1, maxAttempts: 3, error: null, timestamp: '2024-12-23T08:15:00Z' },
  { id: 'log2', webhookId: 'wh2', webhookName: 'CRM Sync', eventType: 'user.created', status: 'success', statusCode: 201, requestHeaders: { 'Content-Type': 'application/json' }, requestBody: '{"event": "user.created", "data": {"user_id": "usr_456"}}', responseHeaders: { 'Content-Type': 'application/json' }, responseBody: '{"success": true}', responseTime: 412, attempt: 1, maxAttempts: 5, error: null, timestamp: '2024-12-23T08:10:00Z' },
  { id: 'log3', webhookId: 'wh4', webhookName: 'Payment Gateway', eventType: 'payment.received', status: 'failed', statusCode: 503, requestHeaders: { 'Content-Type': 'application/json' }, requestBody: '{"event": "payment.received", "data": {"payment_id": "pay_789"}}', responseHeaders: null, responseBody: null, responseTime: 5000, attempt: 3, maxAttempts: 5, error: 'Service Unavailable', timestamp: '2024-12-22T14:30:00Z' },
  { id: 'log4', webhookId: 'wh1', webhookName: 'Slack Notifications', eventType: 'user.created', status: 'success', statusCode: 200, requestHeaders: { 'Content-Type': 'application/json' }, requestBody: '{"event": "user.created", "data": {"user_id": "usr_999"}}', responseHeaders: { 'Content-Type': 'application/json' }, responseBody: '{"ok": true}', responseTime: 189, attempt: 1, maxAttempts: 3, error: null, timestamp: '2024-12-23T07:45:00Z' },
  { id: 'log5', webhookId: 'wh4', webhookName: 'Payment Gateway', eventType: 'payment.failed', status: 'retrying', statusCode: 504, requestHeaders: { 'Content-Type': 'application/json' }, requestBody: '{"event": "payment.failed", "data": {"payment_id": "pay_888"}}', responseHeaders: null, responseBody: null, responseTime: 30000, attempt: 2, maxAttempts: 5, error: 'Gateway Timeout', timestamp: '2024-12-23T06:00:00Z' }
]

const mockIntegrations: Integration[] = [
  { id: 'int1', name: 'Slack', icon: '💬', category: 'Communication', description: 'Send notifications to Slack channels', installed: true, eventsSupported: ['*'], popularity: 95 },
  { id: 'int2', name: 'Stripe', icon: '💳', category: 'Payments', description: 'Process payments and manage subscriptions', installed: true, eventsSupported: ['payment.*', 'subscription.*'], popularity: 92 },
  { id: 'int3', name: 'Salesforce', icon: '☁️', category: 'CRM', description: 'Sync customer data with Salesforce', installed: false, eventsSupported: ['user.*', 'order.*'], popularity: 88 },
  { id: 'int4', name: 'HubSpot', icon: '🧡', category: 'CRM', description: 'Marketing automation and CRM', installed: false, eventsSupported: ['user.*', 'order.*'], popularity: 85 },
  { id: 'int5', name: 'Mailchimp', icon: '📧', category: 'Email', description: 'Email marketing automation', installed: true, eventsSupported: ['user.created', 'order.completed'], popularity: 82 },
  { id: 'int6', name: 'Twilio', icon: '📱', category: 'Communication', description: 'SMS and voice notifications', installed: false, eventsSupported: ['*'], popularity: 78 },
  { id: 'int7', name: 'Segment', icon: '📊', category: 'Analytics', description: 'Customer data platform', installed: false, eventsSupported: ['*'], popularity: 75 },
  { id: 'int8', name: 'Zendesk', icon: '🎫', category: 'Support', description: 'Customer support ticketing', installed: false, eventsSupported: ['user.*', 'order.*'], popularity: 72 }
]

const mockTemplates: WebhookTemplate[] = [
  { id: 'tpl1', name: 'Slack Alert', description: 'Send alerts to Slack channel', url: 'https://hooks.slack.com/services/...', events: ['*'], headers: { 'Content-Type': 'application/json' }, category: 'Communication' },
  { id: 'tpl2', name: 'Discord Bot', description: 'Post messages to Discord', url: 'https://discord.com/api/webhooks/...', events: ['*'], headers: { 'Content-Type': 'application/json' }, category: 'Communication' },
  { id: 'tpl3', name: 'Zapier Trigger', description: 'Trigger Zapier automations', url: 'https://hooks.zapier.com/...', events: ['*'], headers: { 'Content-Type': 'application/json' }, category: 'Automation' },
  { id: 'tpl4', name: 'Custom API', description: 'Send to any REST API', url: 'https://your-api.com/webhook', events: ['*'], headers: { 'Content-Type': 'application/json' }, category: 'Custom' }
]

const mockStats: WebhookStats = {
  totalEndpoints: 4,
  activeEndpoints: 2,
  pausedEndpoints: 1,
  failedEndpoints: 1,
  totalDeliveries: 72370,
  successfulDeliveries: 72000,
  failedDeliveries: 370,
  successRate: 99.49,
  avgResponseTime: 284,
  deliveriesToday: 1250,
  deliveriesThisWeek: 8420
}

interface WebhooksClientProps {
  initialWebhooks: Webhook[]
  initialEventTypes: WebhookEventType[]
  initialStats: {
    total: number
    active: number
    paused: number
    failed: number
    totalDeliveries: number
    successfulDeliveries: number
    avgSuccessRate: number
    avgResponseTime: number
  }
}

export default function WebhooksClient({
  initialWebhooks,
  initialEventTypes,
  initialStats
}: WebhooksClientProps) {
  const [activeTab, setActiveTab] = useState('endpoints')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<WebhookStatus | 'all'>('all')
  const [selectedEndpoint, setSelectedEndpoint] = useState<WebhookEndpoint | null>(null)
  const [selectedLog, setSelectedLog] = useState<DeliveryLog | null>(null)
  const [showEndpointDialog, setShowEndpointDialog] = useState(false)
  const [showLogDialog, setShowLogDialog] = useState(false)
  const [showTestDialog, setShowTestDialog] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Users', 'Orders', 'Payments']))
  const [settingsTab, setSettingsTab] = useState('general')

  const filteredEndpoints = useMemo(() => {
    return mockEndpoints.filter(endpoint => {
      const matchesSearch = endpoint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        endpoint.url.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || endpoint.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [searchQuery, statusFilter])

  const groupedEvents = useMemo(() => {
    const groups: Record<string, EventType[]> = {}
    mockEventTypes.forEach(event => {
      if (!groups[event.category]) groups[event.category] = []
      groups[event.category].push(event)
    })
    return groups
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'paused': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'disabled': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
      case 'success': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'pending': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'retrying': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="w-3 h-3" />
      case 'paused': return <Pause className="w-3 h-3" />
      case 'failed': return <AlertCircle className="w-3 h-3" />
      case 'success': return <CheckCircle className="w-3 h-3" />
      case 'pending': return <Clock className="w-3 h-3" />
      case 'retrying': return <RefreshCw className="w-3 h-3" />
      default: return <Activity className="w-3 h-3" />
    }
  }

  const getAuthIcon = (authType: AuthType) => {
    switch (authType) {
      case 'api_key': return <Key className="w-4 h-4" />
      case 'bearer': return <Shield className="w-4 h-4" />
      case 'basic': return <Lock className="w-4 h-4" />
      case 'oauth2': return <Unlock className="w-4 h-4" />
      case 'hmac': return <Code className="w-4 h-4" />
      default: return <Globe className="w-4 h-4" />
    }
  }

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/30 to-cyan-50/40 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 dark:bg-none dark:bg-gray-900">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white">
        <div className="max-w-[1800px] mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                <WebhookIcon className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Webhooks & Integrations</h1>
                <p className="text-white/80">Zapier-level event delivery and automation</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-white/20 text-sm font-medium backdrop-blur">
                Zapier Level
              </span>
              <button
                onClick={() => { setSelectedEndpoint(null); setShowEndpointDialog(true); }}
                className="px-4 py-2 bg-white text-emerald-600 rounded-lg font-medium hover:bg-white/90 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Webhook
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <WebhookIcon className="w-4 h-4" />
                Endpoints
              </div>
              <div className="text-2xl font-bold">{mockStats.totalEndpoints}</div>
              <div className="text-xs text-white/60">{mockStats.activeEndpoints} active</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <Send className="w-4 h-4" />
                Total Deliveries
              </div>
              <div className="text-2xl font-bold">{(mockStats.totalDeliveries / 1000).toFixed(1)}K</div>
              <div className="text-xs text-white/60">{mockStats.deliveriesToday} today</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <CheckCircle className="w-4 h-4" />
                Success Rate
              </div>
              <div className="text-2xl font-bold text-green-300">{mockStats.successRate}%</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <Timer className="w-4 h-4" />
                Avg Latency
              </div>
              <div className="text-2xl font-bold">{mockStats.avgResponseTime}ms</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <AlertCircle className="w-4 h-4" />
                Failed
              </div>
              <div className="text-2xl font-bold text-red-300">{mockStats.failedDeliveries}</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <Zap className="w-4 h-4" />
                This Week
              </div>
              <div className="text-2xl font-bold">{(mockStats.deliveriesThisWeek / 1000).toFixed(1)}K</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border dark:border-gray-700 mb-6">
            <TabsTrigger value="endpoints" className="rounded-lg data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-600 dark:data-[state=active]:bg-emerald-900/30">
              <WebhookIcon className="w-4 h-4 mr-2" />
              Endpoints
            </TabsTrigger>
            <TabsTrigger value="events" className="rounded-lg data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-600 dark:data-[state=active]:bg-emerald-900/30">
              <Zap className="w-4 h-4 mr-2" />
              Event Types
            </TabsTrigger>
            <TabsTrigger value="logs" className="rounded-lg data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-600 dark:data-[state=active]:bg-emerald-900/30">
              <History className="w-4 h-4 mr-2" />
              Delivery Logs
            </TabsTrigger>
            <TabsTrigger value="integrations" className="rounded-lg data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-600 dark:data-[state=active]:bg-emerald-900/30">
              <Plug className="w-4 h-4 mr-2" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="templates" className="rounded-lg data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-600 dark:data-[state=active]:bg-emerald-900/30">
              <Sparkles className="w-4 h-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-600 dark:data-[state=active]:bg-emerald-900/30">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Endpoints Tab */}
          <TabsContent value="endpoints" className="space-y-4">
            {/* Filters */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search webhooks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:text-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  {(['all', 'active', 'paused', 'failed'] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                        statusFilter === status
                          ? status === 'all' ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
                            : getStatusColor(status)
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {status !== 'all' && getStatusIcon(status)}
                      {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Endpoints List */}
            <div className="space-y-4">
              {filteredEndpoints.map((endpoint) => (
                <div
                  key={endpoint.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          endpoint.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                          endpoint.status === 'paused' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                          'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        }`}>
                          <WebhookIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{endpoint.name}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(endpoint.status)}`}>
                              {getStatusIcon(endpoint.status)}
                              {endpoint.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{endpoint.description}</p>
                          <div className="flex items-center gap-2 text-sm">
                            <Globe className="w-4 h-4 text-gray-400" />
                            <code className="font-mono text-gray-600 dark:text-gray-400 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                              {endpoint.url}
                            </code>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setSelectedEndpoint(endpoint); setShowTestDialog(true); }}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400"
                          title="Test Webhook"
                        >
                          <TestTube className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setSelectedEndpoint(endpoint); setShowEndpointDialog(true); }}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Events */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {endpoint.events.map((event) => (
                        <span key={event} className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded text-xs font-mono">
                          {event}
                        </span>
                      ))}
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-5 gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm">
                      <div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">Deliveries</div>
                        <div className="font-semibold text-gray-900 dark:text-white">{endpoint.totalDeliveries.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">Success Rate</div>
                        <div className={`font-semibold ${endpoint.successRate >= 99 ? 'text-green-600 dark:text-green-400' : endpoint.successRate >= 95 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                          {endpoint.successRate}%
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">Avg Latency</div>
                        <div className="font-semibold text-gray-900 dark:text-white">{endpoint.avgResponseTime}ms</div>
                      </div>
                      <div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">Auth</div>
                        <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                          {getAuthIcon(endpoint.authType)}
                          {endpoint.authType}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">Last Delivery</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {endpoint.lastDeliveryAt ? new Date(endpoint.lastDeliveryAt).toLocaleTimeString() : 'Never'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Event Types Tab */}
          <TabsContent value="events" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Available Event Types</h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {mockEventTypes.length} event types
              </div>
            </div>
            <div className="space-y-4">
              {Object.entries(groupedEvents).map(([category, events]) => (
                <div key={category} className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <div className="flex items-center gap-3">
                      <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-semibold text-gray-900 dark:text-white">{category}</span>
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-400">
                        {events.length} events
                      </span>
                    </div>
                    {expandedCategories.has(category) ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  {expandedCategories.has(category) && (
                    <div className="border-t dark:border-gray-700">
                      {events.map((event) => (
                        <div key={event.id} className="p-4 border-b dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <code className="font-mono text-sm font-semibold text-gray-900 dark:text-white">{event.name}</code>
                                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded text-xs">
                                  {event.subscriberCount} subscribers
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{event.description}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                <span>{event.totalDeliveries.toLocaleString()} deliveries</span>
                                <span>{event.avgResponseTime}ms avg</span>
                              </div>
                            </div>
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400">
                              <FileJson className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Delivery Logs Tab */}
          <TabsContent value="logs" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Delivery Logs</h2>
              <button className="px-3 py-2 border dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Timestamp</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Webhook</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Event</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Response</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Latency</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockDeliveryLogs.map((log) => (
                    <tr key={log.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900 dark:text-white">{log.webhookName}</span>
                      </td>
                      <td className="py-3 px-4">
                        <code className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300">
                          {log.eventType}
                        </code>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(log.status)}`}>
                          {getStatusIcon(log.status)}
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {log.statusCode ? (
                          <span className={`font-mono text-sm ${log.statusCode >= 200 && log.statusCode < 300 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {log.statusCode}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-600 dark:text-gray-400">
                        {log.responseTime ? `${log.responseTime}ms` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => { setSelectedLog(log); setShowLogDialog(true); }}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">App Integrations</h2>
              <div className="relative max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search apps..."
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-sm dark:text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockIntegrations.map((integration) => (
                <div key={integration.id} className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl">{integration.icon}</div>
                    {integration.installed && (
                      <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-medium">
                        Installed
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{integration.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{integration.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{integration.category}</span>
                    <button className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      integration.installed
                        ? 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}>
                      {integration.installed ? 'Configure' : 'Install'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Webhook Templates</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockTemplates.map((template) => (
                <div key={template.id} className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{template.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{template.description}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                      {template.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <code className="font-mono text-xs text-gray-600 dark:text-gray-400">{template.url}</code>
                  </div>
                  <button className="w-full px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/30">
                    Use Template
                  </button>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab - Zapier Level */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3 space-y-2">
                <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', label: 'General', icon: Settings },
                        { id: 'delivery', label: 'Delivery', icon: Send },
                        { id: 'security', label: 'Security', icon: Shield },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'api', label: 'API Settings', icon: Code },
                        { id: 'advanced', label: 'Advanced', icon: Sliders }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            settingsTab === item.id
                              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          <item.icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>

                {/* Webhook Stats Sidebar */}
                <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium opacity-90">Webhook Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-2xl font-bold">{mockStats.successRate}%</div>
                      <div className="text-xs opacity-80">Success Rate</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-white/20 rounded-lg p-2">
                        <div className="text-lg font-semibold">{mockStats.totalEndpoints}</div>
                        <div className="text-xs opacity-80">Endpoints</div>
                      </div>
                      <div className="bg-white/20 rounded-lg p-2">
                        <div className="text-lg font-semibold">{mockStats.avgResponseTime}ms</div>
                        <div className="text-xs opacity-80">Avg Latency</div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Daily Quota</span>
                        <span>12.5K / 50K</span>
                      </div>
                      <Progress value={25} className="h-2 bg-white/20" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {settingsTab === 'general' && (
                  <>
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="w-5 h-5 text-emerald-600" />
                          Webhook Defaults
                        </CardTitle>
                        <CardDescription>Configure default settings for new webhooks</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Default Timeout</Label>
                            <Select defaultValue="30">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="10">10 seconds</SelectItem>
                                <SelectItem value="30">30 seconds</SelectItem>
                                <SelectItem value="60">60 seconds</SelectItem>
                                <SelectItem value="120">2 minutes</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Default Content Type</Label>
                            <Select defaultValue="json">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="json">application/json</SelectItem>
                                <SelectItem value="form">application/x-www-form-urlencoded</SelectItem>
                                <SelectItem value="xml">application/xml</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Active Webhook Limit</div>
                            <div className="text-sm text-gray-500">Maximum concurrent active webhooks</div>
                          </div>
                          <Select defaultValue="100">
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="25">25</SelectItem>
                              <SelectItem value="50">50</SelectItem>
                              <SelectItem value="100">100</SelectItem>
                              <SelectItem value="unlimited">Unlimited</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Include Metadata</div>
                            <div className="text-sm text-gray-500">Add metadata to webhook payloads</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Workflow className="w-5 h-5 text-blue-600" />
                          Event Settings
                        </CardTitle>
                        <CardDescription>Configure event handling behavior</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Event Batching</div>
                            <div className="text-sm text-gray-500">Batch multiple events in single delivery</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Event Ordering</div>
                            <div className="text-sm text-gray-500">Guarantee event delivery order</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Deduplicate Events</div>
                            <div className="text-sm text-gray-500">Prevent duplicate event deliveries</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'delivery' && (
                  <>
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <RefreshCw className="w-5 h-5 text-orange-600" />
                          Retry Policy
                        </CardTitle>
                        <CardDescription>Configure automatic retry behavior</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Max Retry Attempts</Label>
                            <Select defaultValue="5">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">No retries</SelectItem>
                                <SelectItem value="3">3 attempts</SelectItem>
                                <SelectItem value="5">5 attempts</SelectItem>
                                <SelectItem value="10">10 attempts</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Backoff Strategy</Label>
                            <Select defaultValue="exponential">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="linear">Linear</SelectItem>
                                <SelectItem value="exponential">Exponential</SelectItem>
                                <SelectItem value="fixed">Fixed Interval</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Initial Delay</Label>
                            <Select defaultValue="1000">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="500">500ms</SelectItem>
                                <SelectItem value="1000">1 second</SelectItem>
                                <SelectItem value="5000">5 seconds</SelectItem>
                                <SelectItem value="30000">30 seconds</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Max Delay</Label>
                            <Select defaultValue="3600000">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="60000">1 minute</SelectItem>
                                <SelectItem value="300000">5 minutes</SelectItem>
                                <SelectItem value="3600000">1 hour</SelectItem>
                                <SelectItem value="86400000">24 hours</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Timer className="w-5 h-5 text-purple-600" />
                          Rate Limiting
                        </CardTitle>
                        <CardDescription>Control delivery rate to prevent overwhelming endpoints</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Enable Rate Limiting</div>
                            <div className="text-sm text-gray-500">Limit requests per endpoint</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Requests per Minute</Label>
                            <Input type="number" defaultValue="60" />
                          </div>
                          <div className="space-y-2">
                            <Label>Burst Limit</Label>
                            <Input type="number" defaultValue="100" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Queue Overflow Action</div>
                            <div className="text-sm text-gray-500">What to do when queue is full</div>
                          </div>
                          <Select defaultValue="queue">
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="queue">Queue</SelectItem>
                              <SelectItem value="drop">Drop</SelectItem>
                              <SelectItem value="error">Error</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'security' && (
                  <>
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-green-600" />
                          Signature Verification
                        </CardTitle>
                        <CardDescription>Configure webhook signing and verification</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <div>
                              <div className="font-medium text-green-800 dark:text-green-400">HMAC Signing Enabled</div>
                              <div className="text-sm text-green-600 dark:text-green-500">All payloads are signed with SHA-256</div>
                            </div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>Signing Algorithm</Label>
                          <Select defaultValue="sha256">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sha256">SHA-256 (Recommended)</SelectItem>
                              <SelectItem value="sha512">SHA-512</SelectItem>
                              <SelectItem value="sha1">SHA-1 (Legacy)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Signature Header Name</Label>
                          <Input defaultValue="X-Webhook-Signature" className="font-mono" />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Include Timestamp</div>
                            <div className="text-sm text-gray-500">Add timestamp to prevent replay attacks</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lock className="w-5 h-5 text-amber-600" />
                          Secret Management
                        </CardTitle>
                        <CardDescription>Manage webhook secrets and rotation</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Signing Secret</Label>
                          <div className="flex gap-2">
                            <Input type="password" value="whsec_xxxxxxxxxxxxxxxx" readOnly className="font-mono" />
                            <Button variant="outline">Copy</Button>
                            <Button variant="outline">Rotate</Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Auto-rotate Secrets</div>
                            <div className="text-sm text-gray-500">Automatically rotate secrets periodically</div>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Secret Expiration Warning</div>
                            <div className="text-sm text-gray-500">Notify before secrets expire</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'notifications' && (
                  <>
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="w-5 h-5 text-orange-600" />
                          Delivery Alerts
                        </CardTitle>
                        <CardDescription>Configure alerts for webhook events</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Failed Delivery Alert</div>
                            <div className="text-sm text-gray-500">Notify when deliveries fail</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Endpoint Disabled Alert</div>
                            <div className="text-sm text-gray-500">Notify when endpoint is auto-disabled</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Success Rate Drop Alert</div>
                            <div className="text-sm text-gray-500">Notify when success rate drops below threshold</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>Success Rate Threshold</Label>
                          <Select defaultValue="95">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="99">99%</SelectItem>
                              <SelectItem value="95">95%</SelectItem>
                              <SelectItem value="90">90%</SelectItem>
                              <SelectItem value="80">80%</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="w-5 h-5 text-blue-600" />
                          Health Reports
                        </CardTitle>
                        <CardDescription>Configure periodic health reports</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Daily Health Summary</div>
                            <div className="text-sm text-gray-500">Receive daily webhook health report</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Weekly Analytics Report</div>
                            <div className="text-sm text-gray-500">Detailed weekly analytics email</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>Report Recipients</Label>
                          <Input placeholder="email@example.com, team@example.com" />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'api' && (
                  <>
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="w-5 h-5 text-amber-600" />
                          API Credentials
                        </CardTitle>
                        <CardDescription>Manage API keys for webhook management</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <div className="flex gap-2">
                            <Input type="password" value="wh_api_xxxxxxxxxxxxxxxx" readOnly className="font-mono" />
                            <Button variant="outline">Copy</Button>
                            <Button variant="outline">Regenerate</Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>API Secret</Label>
                          <div className="flex gap-2">
                            <Input type="password" value="wh_secret_xxxxxxxxxxxxxxxx" readOnly className="font-mono" />
                            <Button variant="outline">Copy</Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">API Rate Limit</div>
                            <div className="text-sm text-gray-500">Requests per minute for management API</div>
                          </div>
                          <Badge variant="outline">1000 req/min</Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Terminal className="w-5 h-5 text-purple-600" />
                          API Settings
                        </CardTitle>
                        <CardDescription>Configure API behavior</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">API Versioning</div>
                            <div className="text-sm text-gray-500">Include version in API responses</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>Default API Version</Label>
                          <Select defaultValue="v2">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="v1">v1 (Legacy)</SelectItem>
                              <SelectItem value="v2">v2 (Current)</SelectItem>
                              <SelectItem value="v3">v3 (Beta)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Verbose Error Messages</div>
                            <div className="text-sm text-gray-500">Return detailed error information</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {settingsTab === 'advanced' && (
                  <>
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <HardDrive className="w-5 h-5 text-gray-600" />
                          Data Retention
                        </CardTitle>
                        <CardDescription>Configure log retention and storage</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Delivery Log Retention</Label>
                          <Select defaultValue="30">
                            <SelectTrigger>
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
                        <div className="space-y-2">
                          <Label>Failed Delivery Retention</Label>
                          <Select defaultValue="90">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30 days</SelectItem>
                              <SelectItem value="90">90 days</SelectItem>
                              <SelectItem value="180">180 days</SelectItem>
                              <SelectItem value="365">1 year</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex gap-3">
                          <Button variant="outline" className="flex-1">
                            <Download className="w-4 h-4 mr-2" />
                            Export Logs
                          </Button>
                          <Button variant="outline" className="flex-1">
                            <Upload className="w-4 h-4 mr-2" />
                            Import Config
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sliders className="w-5 h-5 text-indigo-600" />
                          Performance
                        </CardTitle>
                        <CardDescription>Configure performance settings</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Parallel Delivery</div>
                            <div className="text-sm text-gray-500">Enable concurrent webhook deliveries</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="space-y-2">
                          <Label>Max Concurrent Deliveries</Label>
                          <Select defaultValue="10">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5</SelectItem>
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value="25">25</SelectItem>
                              <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                          <div>
                            <div className="font-medium">Connection Pooling</div>
                            <div className="text-sm text-gray-500">Reuse connections for better performance</div>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm border-red-200 dark:border-red-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <AlertOctagon className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                        <CardDescription>Irreversible actions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                          <div>
                            <div className="font-medium text-red-700 dark:text-red-400">Delete All Webhooks</div>
                            <div className="text-sm text-red-600 dark:text-red-500">Permanently delete all webhook endpoints</div>
                          </div>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete All
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                          <div>
                            <div className="font-medium text-red-700 dark:text-red-400">Clear All Logs</div>
                            <div className="text-sm text-red-600 dark:text-red-500">Permanently delete all delivery logs</div>
                          </div>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear Logs
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                          <div>
                            <div className="font-medium text-red-700 dark:text-red-400">Reset Configuration</div>
                            <div className="text-sm text-red-600 dark:text-red-500">Reset all settings to defaults</div>
                          </div>
                          <Button variant="destructive" size="sm">
                            <RotateCcw className="w-4 h-4 mr-2" />
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
      </div>

      {/* Create/Edit Endpoint Dialog */}
      <Dialog open={showEndpointDialog} onOpenChange={setShowEndpointDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white">
                <WebhookIcon className="w-5 h-5" />
              </div>
              {selectedEndpoint ? 'Edit Webhook' : 'Create Webhook'}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  defaultValue={selectedEndpoint?.name || ''}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:text-white"
                  placeholder="My Webhook"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Endpoint URL</label>
                <input
                  type="url"
                  defaultValue={selectedEndpoint?.url || ''}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:text-white font-mono text-sm"
                  placeholder="https://example.com/webhook"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  defaultValue={selectedEndpoint?.description || ''}
                  rows={2}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:text-white"
                  placeholder="What does this webhook do?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Authentication</label>
                  <select
                    defaultValue={selectedEndpoint?.authType || 'none'}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg dark:text-white"
                  >
                    <option value="none">None</option>
                    <option value="api_key">API Key</option>
                    <option value="bearer">Bearer Token</option>
                    <option value="basic">Basic Auth</option>
                    <option value="hmac">HMAC Signature</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Retries</label>
                  <select
                    defaultValue={selectedEndpoint?.retryPolicy.maxRetries || 3}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg dark:text-white"
                  >
                    <option value="0">No retries</option>
                    <option value="3">3 retries</option>
                    <option value="5">5 retries</option>
                    <option value="10">10 retries</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Events to Subscribe</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 border dark:border-gray-600 rounded-lg">
                  {mockEventTypes.map(event => (
                    <label key={event.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={selectedEndpoint?.events.includes(event.name)}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-mono text-gray-700 dark:text-gray-300">{event.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
          <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => setShowEndpointDialog(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700">
              {selectedEndpoint ? 'Save Changes' : 'Create Webhook'}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delivery Log Detail Dialog */}
      <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                selectedLog?.status === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                selectedLog?.status === 'failed' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
              }`}>
                {selectedLog && getStatusIcon(selectedLog.status)}
              </div>
              Delivery Details
            </DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status Code</div>
                    <div className={`text-xl font-bold ${selectedLog.statusCode && selectedLog.statusCode < 300 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedLog.statusCode || 'N/A'}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Response Time</div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedLog.responseTime ? `${selectedLog.responseTime}ms` : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Attempt</div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedLog.attempt} / {selectedLog.maxAttempts}
                    </div>
                  </div>
                </div>

                {selectedLog.error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <div className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">Error</div>
                    <div className="text-sm text-red-600 dark:text-red-400">{selectedLog.error}</div>
                  </div>
                )}

                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Request Body</div>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                    {JSON.stringify(JSON.parse(selectedLog.requestBody), null, 2)}
                  </pre>
                </div>

                {selectedLog.responseBody && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Response Body</div>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                      {selectedLog.responseBody}
                    </pre>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
          <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => setShowLogDialog(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
            >
              Close
            </button>
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Retry Delivery
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Test Webhook Dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                <TestTube className="w-5 h-5" />
              </div>
              Test Webhook
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Event</label>
              <select className="w-full px-3 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg dark:text-white">
                {mockEventTypes.map(event => (
                  <option key={event.id} value={event.name}>{event.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payload</label>
              <textarea
                rows={6}
                className="w-full px-3 py-2 bg-gray-900 text-gray-100 border dark:border-gray-600 rounded-lg font-mono text-sm"
                defaultValue={JSON.stringify({ event: 'test.event', data: { id: 'test_123' } }, null, 2)}
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
              <button
                onClick={() => setShowTestDialog(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2">
                <Send className="w-4 h-4" />
                Send Test
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
