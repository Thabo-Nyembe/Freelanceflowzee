'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  GitBranch,
  Webhook,
  Key,
  Activity,
  TrendingUp,
  Calendar,
  Mail,
  MessageSquare,
  Database,
  Cloud,
  CreditCard,
  ShoppingCart,
  FileText,
  Users,
  Globe,
  Smartphone,
  Code,
  Lock,
  Trash2,
  Edit,
  Copy,
  ExternalLink,
  ChevronRight,
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
  Workflow,
  Sparkles
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
type ZapStatus = 'active' | 'paused' | 'error' | 'draft'
type TaskStatus = 'success' | 'failed' | 'running' | 'waiting'
type AppCategory = 'all' | 'marketing' | 'productivity' | 'communication' | 'storage' | 'payments' | 'crm' | 'development' | 'social'
type WebhookMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface AppIntegration {
  id: string
  name: string
  icon: string
  category: AppCategory
  description: string
  isConnected: boolean
  connectedAt?: string
  lastSync?: string
  tasksRun: number
  scopes: string[]
  popularity: number
  isPremium: boolean
}

interface ZapStep {
  id: string
  type: 'trigger' | 'action' | 'filter' | 'delay'
  appId: string
  appName: string
  appIcon: string
  event: string
  config: Record<string, unknown>
  order: number
}

interface Zap {
  id: string
  name: string
  description: string
  status: ZapStatus
  trigger: ZapStep
  actions: ZapStep[]
  createdAt: string
  updatedAt: string
  lastRun?: string
  taskCount: number
  successRate: number
  avgExecutionTime: number
  folder?: string
  tags: string[]
}

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

interface WebhookEndpoint {
  id: string
  name: string
  url: string
  method: WebhookMethod
  secret: string
  isActive: boolean
  createdAt: string
  lastTriggered?: string
  triggerCount: number
  headers: Record<string, string>
  zapId?: string
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

// Mock Data
const mockApps: AppIntegration[] = [
  { id: '1', name: 'Slack', icon: '💬', category: 'communication', description: 'Send messages and notifications to Slack channels', isConnected: true, connectedAt: '2024-01-10', lastSync: '2024-01-15T14:30:00', tasksRun: 15420, scopes: ['chat:write', 'channels:read', 'users:read'], popularity: 98, isPremium: false },
  { id: '2', name: 'Gmail', icon: '📧', category: 'communication', description: 'Send and receive emails through Gmail', isConnected: true, connectedAt: '2024-01-05', lastSync: '2024-01-15T14:25:00', tasksRun: 8930, scopes: ['gmail.send', 'gmail.readonly'], popularity: 97, isPremium: false },
  { id: '3', name: 'Salesforce', icon: '☁️', category: 'crm', description: 'Manage leads, contacts, and opportunities', isConnected: true, connectedAt: '2024-01-08', lastSync: '2024-01-15T14:00:00', tasksRun: 6250, scopes: ['api', 'refresh_token'], popularity: 95, isPremium: true },
  { id: '4', name: 'Google Sheets', icon: '📊', category: 'productivity', description: 'Read and write data to spreadsheets', isConnected: true, connectedAt: '2024-01-12', lastSync: '2024-01-15T14:20:00', tasksRun: 12340, scopes: ['spreadsheets', 'drive.readonly'], popularity: 96, isPremium: false },
  { id: '5', name: 'Stripe', icon: '💳', category: 'payments', description: 'Process payments and manage subscriptions', isConnected: true, connectedAt: '2024-01-03', lastSync: '2024-01-15T14:10:00', tasksRun: 4560, scopes: ['read_only', 'webhooks'], popularity: 94, isPremium: false },
  { id: '6', name: 'HubSpot', icon: '🧡', category: 'crm', description: 'CRM, marketing, and sales automation', isConnected: false, tasksRun: 0, scopes: [], popularity: 93, isPremium: false },
  { id: '7', name: 'Notion', icon: '📝', category: 'productivity', description: 'Create and manage pages and databases', isConnected: true, connectedAt: '2024-01-14', lastSync: '2024-01-15T13:45:00', tasksRun: 2180, scopes: ['read_content', 'insert_content'], popularity: 91, isPremium: false },
  { id: '8', name: 'GitHub', icon: '🐙', category: 'development', description: 'Manage repositories, issues, and PRs', isConnected: true, connectedAt: '2024-01-02', lastSync: '2024-01-15T14:35:00', tasksRun: 7890, scopes: ['repo', 'notifications'], popularity: 92, isPremium: false },
  { id: '9', name: 'Shopify', icon: '🛍️', category: 'payments', description: 'E-commerce orders and inventory', isConnected: false, tasksRun: 0, scopes: [], popularity: 89, isPremium: false },
  { id: '10', name: 'Twitter/X', icon: '🐦', category: 'social', description: 'Post tweets and monitor mentions', isConnected: false, tasksRun: 0, scopes: [], popularity: 88, isPremium: false },
  { id: '11', name: 'Dropbox', icon: '📦', category: 'storage', description: 'Store and sync files in the cloud', isConnected: true, connectedAt: '2024-01-11', lastSync: '2024-01-15T12:00:00', tasksRun: 3450, scopes: ['files.content.read', 'files.content.write'], popularity: 87, isPremium: false },
  { id: '12', name: 'Mailchimp', icon: '🐵', category: 'marketing', description: 'Email marketing and automation', isConnected: false, tasksRun: 0, scopes: [], popularity: 86, isPremium: false },
  { id: '13', name: 'Trello', icon: '📋', category: 'productivity', description: 'Manage boards, lists, and cards', isConnected: true, connectedAt: '2024-01-09', lastSync: '2024-01-15T11:30:00', tasksRun: 5670, scopes: ['read', 'write'], popularity: 85, isPremium: false },
  { id: '14', name: 'Airtable', icon: '🗃️', category: 'productivity', description: 'Database-spreadsheet hybrid', isConnected: false, tasksRun: 0, scopes: [], popularity: 84, isPremium: false },
  { id: '15', name: 'Jira', icon: '🔵', category: 'development', description: 'Issue tracking and project management', isConnected: true, connectedAt: '2024-01-07', lastSync: '2024-01-15T14:15:00', tasksRun: 4230, scopes: ['read:jira-work', 'write:jira-work'], popularity: 90, isPremium: false },
  { id: '16', name: 'Zendesk', icon: '🎧', category: 'communication', description: 'Customer support ticketing', isConnected: false, tasksRun: 0, scopes: [], popularity: 83, isPremium: true }
]

const mockZaps: Zap[] = [
  {
    id: 'zap-1',
    name: 'New Lead to Slack + Sheets',
    description: 'When a new lead is created in Salesforce, notify Slack and add to Google Sheets',
    status: 'active',
    trigger: { id: 'step-1', type: 'trigger', appId: '3', appName: 'Salesforce', appIcon: '☁️', event: 'New Lead', config: {}, order: 1 },
    actions: [
      { id: 'step-2', type: 'action', appId: '1', appName: 'Slack', appIcon: '💬', event: 'Send Message', config: { channel: '#sales' }, order: 2 },
      { id: 'step-3', type: 'action', appId: '4', appName: 'Google Sheets', appIcon: '📊', event: 'Add Row', config: { spreadsheetId: 'xxx' }, order: 3 }
    ],
    createdAt: '2024-01-02',
    updatedAt: '2024-01-14',
    lastRun: '2024-01-15T14:30:00',
    taskCount: 2456,
    successRate: 99.2,
    avgExecutionTime: 1.8,
    folder: 'Sales',
    tags: ['sales', 'notifications']
  },
  {
    id: 'zap-2',
    name: 'GitHub Issue to Jira',
    description: 'Sync GitHub issues to Jira for project tracking',
    status: 'active',
    trigger: { id: 'step-1', type: 'trigger', appId: '8', appName: 'GitHub', appIcon: '🐙', event: 'New Issue', config: { repo: 'main' }, order: 1 },
    actions: [
      { id: 'step-2', type: 'action', appId: '15', appName: 'Jira', appIcon: '🔵', event: 'Create Issue', config: { project: 'DEV' }, order: 2 }
    ],
    createdAt: '2024-01-05',
    updatedAt: '2024-01-12',
    lastRun: '2024-01-15T13:45:00',
    taskCount: 892,
    successRate: 98.5,
    avgExecutionTime: 2.3,
    folder: 'Development',
    tags: ['development', 'sync']
  },
  {
    id: 'zap-3',
    name: 'Payment Received Notification',
    description: 'Notify team when Stripe payment is received',
    status: 'active',
    trigger: { id: 'step-1', type: 'trigger', appId: '5', appName: 'Stripe', appIcon: '💳', event: 'Payment Succeeded', config: {}, order: 1 },
    actions: [
      { id: 'step-2', type: 'action', appId: '1', appName: 'Slack', appIcon: '💬', event: 'Send Message', config: { channel: '#payments' }, order: 2 },
      { id: 'step-3', type: 'action', appId: '2', appName: 'Gmail', appIcon: '📧', event: 'Send Email', config: { to: 'finance@company.com' }, order: 3 }
    ],
    createdAt: '2024-01-03',
    updatedAt: '2024-01-10',
    lastRun: '2024-01-15T14:15:00',
    taskCount: 1567,
    successRate: 99.8,
    avgExecutionTime: 1.5,
    folder: 'Finance',
    tags: ['payments', 'notifications']
  },
  {
    id: 'zap-4',
    name: 'Email Attachment to Dropbox',
    description: 'Save email attachments to Dropbox automatically',
    status: 'paused',
    trigger: { id: 'step-1', type: 'trigger', appId: '2', appName: 'Gmail', appIcon: '📧', event: 'New Email with Attachment', config: { label: 'attachments' }, order: 1 },
    actions: [
      { id: 'step-2', type: 'action', appId: '11', appName: 'Dropbox', appIcon: '📦', event: 'Upload File', config: { folder: '/attachments' }, order: 2 }
    ],
    createdAt: '2024-01-08',
    updatedAt: '2024-01-14',
    lastRun: '2024-01-14T10:00:00',
    taskCount: 456,
    successRate: 97.3,
    avgExecutionTime: 3.2,
    folder: 'Automation',
    tags: ['files', 'email']
  },
  {
    id: 'zap-5',
    name: 'Trello Card to Notion',
    description: 'Create Notion page when Trello card is completed',
    status: 'error',
    trigger: { id: 'step-1', type: 'trigger', appId: '13', appName: 'Trello', appIcon: '📋', event: 'Card Moved to Done', config: { board: 'Main' }, order: 1 },
    actions: [
      { id: 'step-2', type: 'action', appId: '7', appName: 'Notion', appIcon: '📝', event: 'Create Page', config: { database: 'Completed Tasks' }, order: 2 }
    ],
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
    lastRun: '2024-01-15T12:00:00',
    taskCount: 234,
    successRate: 85.2,
    avgExecutionTime: 2.1,
    folder: 'Productivity',
    tags: ['sync', 'documentation']
  },
  {
    id: 'zap-6',
    name: 'Daily Digest Email',
    description: 'Send daily summary of Salesforce activities via Gmail',
    status: 'draft',
    trigger: { id: 'step-1', type: 'trigger', appId: '3', appName: 'Salesforce', appIcon: '☁️', event: 'Schedule', config: { time: '08:00' }, order: 1 },
    actions: [
      { id: 'step-2', type: 'action', appId: '2', appName: 'Gmail', appIcon: '📧', event: 'Send Email', config: { to: 'team@company.com' }, order: 2 }
    ],
    createdAt: '2024-01-14',
    updatedAt: '2024-01-15',
    taskCount: 0,
    successRate: 0,
    avgExecutionTime: 0,
    folder: 'Reports',
    tags: ['scheduled', 'reports']
  }
]

const mockTasks: Task[] = [
  {
    id: 'task-1',
    zapId: 'zap-1',
    zapName: 'New Lead to Slack + Sheets',
    status: 'success',
    startedAt: '2024-01-15T14:30:00',
    completedAt: '2024-01-15T14:30:02',
    duration: 1.8,
    steps: [
      { stepId: 'step-1', stepName: 'Salesforce: New Lead', status: 'success', data: { leadId: 'LD-001', name: 'John Smith' } },
      { stepId: 'step-2', stepName: 'Slack: Send Message', status: 'success', data: { messageTs: '123456' } },
      { stepId: 'step-3', stepName: 'Google Sheets: Add Row', status: 'success', data: { rowNumber: 156 } }
    ],
    dataIn: { leadId: 'LD-001', name: 'John Smith', email: 'john@example.com', company: 'Acme Inc' },
    dataOut: { slackMessageId: '123456', sheetsRow: 156 }
  },
  {
    id: 'task-2',
    zapId: 'zap-3',
    zapName: 'Payment Received Notification',
    status: 'success',
    startedAt: '2024-01-15T14:15:00',
    completedAt: '2024-01-15T14:15:01',
    duration: 1.2,
    steps: [
      { stepId: 'step-1', stepName: 'Stripe: Payment Succeeded', status: 'success', data: { amount: 9900, currency: 'usd' } },
      { stepId: 'step-2', stepName: 'Slack: Send Message', status: 'success' },
      { stepId: 'step-3', stepName: 'Gmail: Send Email', status: 'success' }
    ],
    dataIn: { paymentId: 'pi_xxx', amount: 9900, customer: 'cus_xxx' },
    dataOut: { slackSent: true, emailSent: true }
  },
  {
    id: 'task-3',
    zapId: 'zap-5',
    zapName: 'Trello Card to Notion',
    status: 'failed',
    startedAt: '2024-01-15T12:00:00',
    completedAt: '2024-01-15T12:00:03',
    duration: 2.8,
    steps: [
      { stepId: 'step-1', stepName: 'Trello: Card Moved', status: 'success', data: { cardId: 'card-123' } },
      { stepId: 'step-2', stepName: 'Notion: Create Page', status: 'failed', error: 'API rate limit exceeded. Please retry after 60 seconds.' }
    ],
    dataIn: { cardId: 'card-123', title: 'Complete feature X' }
  },
  {
    id: 'task-4',
    zapId: 'zap-2',
    zapName: 'GitHub Issue to Jira',
    status: 'running',
    startedAt: '2024-01-15T14:35:00',
    duration: 0,
    steps: [
      { stepId: 'step-1', stepName: 'GitHub: New Issue', status: 'success', data: { issueNumber: 456 } },
      { stepId: 'step-2', stepName: 'Jira: Create Issue', status: 'running' }
    ],
    dataIn: { issueNumber: 456, title: 'Bug in login page' }
  },
  {
    id: 'task-5',
    zapId: 'zap-1',
    zapName: 'New Lead to Slack + Sheets',
    status: 'success',
    startedAt: '2024-01-15T14:00:00',
    completedAt: '2024-01-15T14:00:02',
    duration: 1.9,
    steps: [
      { stepId: 'step-1', stepName: 'Salesforce: New Lead', status: 'success' },
      { stepId: 'step-2', stepName: 'Slack: Send Message', status: 'success' },
      { stepId: 'step-3', stepName: 'Google Sheets: Add Row', status: 'success' }
    ],
    dataIn: { leadId: 'LD-002', name: 'Jane Doe', email: 'jane@example.com' },
    dataOut: { slackMessageId: '123457', sheetsRow: 155 }
  }
]

const mockWebhooks: WebhookEndpoint[] = [
  { id: 'wh-1', name: 'Order Webhook', url: 'https://hooks.zapier.com/catch/xxx/order', method: 'POST', secret: 'whsec_xxx123', isActive: true, createdAt: '2024-01-05', lastTriggered: '2024-01-15T14:20:00', triggerCount: 1234, headers: { 'Content-Type': 'application/json' }, zapId: 'zap-3' },
  { id: 'wh-2', name: 'Customer Signup', url: 'https://hooks.zapier.com/catch/xxx/signup', method: 'POST', secret: 'whsec_xxx456', isActive: true, createdAt: '2024-01-08', lastTriggered: '2024-01-15T13:45:00', triggerCount: 567, headers: { 'Content-Type': 'application/json' } },
  { id: 'wh-3', name: 'Form Submission', url: 'https://hooks.zapier.com/catch/xxx/form', method: 'POST', secret: 'whsec_xxx789', isActive: false, createdAt: '2024-01-10', triggerCount: 89, headers: {} },
  { id: 'wh-4', name: 'Status Update', url: 'https://hooks.zapier.com/catch/xxx/status', method: 'PUT', secret: 'whsec_xxx012', isActive: true, createdAt: '2024-01-12', lastTriggered: '2024-01-15T10:00:00', triggerCount: 234, headers: { 'Authorization': 'Bearer xxx' } }
]

const mockUsageStats: UsageStats = {
  tasksUsed: 15420,
  tasksLimit: 50000,
  zapsActive: 4,
  zapsLimit: 20,
  appsConnected: 10,
  webhooksActive: 3,
  avgTaskDuration: 2.1,
  successRate: 98.2,
  tasksThisMonth: 4560,
  tasksLastMonth: 3890
}

// Helper functions
const getStatusColor = (status: ZapStatus) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'paused': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'error': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    case 'draft': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
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

const getCategoryIcon = (category: AppCategory) => {
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

// Enhanced Competitive Upgrade Data
const mockIntegrationsAIInsights = [
  { id: '1', type: 'success' as const, title: 'Sync Status', description: 'All 24 integrations syncing successfully.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Status' },
  { id: '2', type: 'info' as const, title: 'API Usage', description: '85% of monthly API quota used. 5 days remaining.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Usage' },
  { id: '3', type: 'warning' as const, title: 'Auth Expiring', description: '3 OAuth tokens expire in 7 days. Re-auth required.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Authentication' },
]

const mockIntegrationsCollaborators = [
  { id: '1', name: 'Integration Lead', avatar: '/avatars/integ.jpg', status: 'online' as const, role: 'Engineering', lastActive: 'Now' },
  { id: '2', name: 'API Developer', avatar: '/avatars/api.jpg', status: 'online' as const, role: 'Development', lastActive: '15m ago' },
  { id: '3', name: 'Solutions Arch', avatar: '/avatars/arch.jpg', status: 'away' as const, role: 'Architecture', lastActive: '1h ago' },
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

const mockIntegrationsQuickActions = [
  { id: '1', label: 'New Zap', icon: 'Zap', shortcut: 'N', action: () => console.log('New zap') },
  { id: '2', label: 'Apps', icon: 'Grid', shortcut: 'A', action: () => console.log('Apps') },
  { id: '3', label: 'Webhooks', icon: 'Webhook', shortcut: 'W', action: () => console.log('Webhooks') },
  { id: '4', label: 'Logs', icon: 'FileText', shortcut: 'L', action: () => console.log('Logs') },
]

export default function IntegrationsClient() {
  const [activeTab, setActiveTab] = useState('zaps')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<AppCategory>('all')
  const [selectedZap, setSelectedZap] = useState<Zap | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [selectedApp, setSelectedApp] = useState<AppIntegration | null>(null)
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookEndpoint | null>(null)
  const [showConnectedOnly, setShowConnectedOnly] = useState(false)
  const [zapFilter, setZapFilter] = useState<ZapStatus | 'all'>('all')

  // Computed values
  const filteredApps = useMemo(() => {
    return mockApps.filter(app => {
      const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory
      const matchesConnected = !showConnectedOnly || app.isConnected
      return matchesSearch && matchesCategory && matchesConnected
    }).sort((a, b) => b.popularity - a.popularity)
  }, [searchTerm, selectedCategory, showConnectedOnly])

  const filteredZaps = useMemo(() => {
    return mockZaps.filter(zap => {
      const matchesSearch = zap.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        zap.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = zapFilter === 'all' || zap.status === zapFilter
      return matchesSearch && matchesStatus
    })
  }, [searchTerm, zapFilter])

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

  const usagePercent = (mockUsageStats.tasksUsed / mockUsageStats.tasksLimit) * 100

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
            <Button variant="outline" size="sm">
              <History className="w-4 h-4 mr-2" />
              Task History
            </Button>
            <Button className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
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
              <p className="text-2xl font-bold">{mockUsageStats.zapsActive}</p>
              <p className="text-xs text-muted-foreground">of {mockUsageStats.zapsLimit}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <Activity className="w-4 h-4" />
                <span className="text-xs font-medium">Tasks Used</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(mockUsageStats.tasksUsed)}</p>
              <p className="text-xs text-muted-foreground">of {formatNumber(mockUsageStats.tasksLimit)}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs font-medium">Success Rate</span>
              </div>
              <p className="text-2xl font-bold">{mockUsageStats.successRate}%</p>
              <p className="text-xs text-muted-foreground">last 30 days</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-purple-600 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium">Avg Duration</span>
              </div>
              <p className="text-2xl font-bold">{mockUsageStats.avgTaskDuration}s</p>
              <p className="text-xs text-muted-foreground">per task</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-cyan-600 mb-1">
                <Plug className="w-4 h-4" />
                <span className="text-xs font-medium">Connected</span>
              </div>
              <p className="text-2xl font-bold">{mockUsageStats.appsConnected}</p>
              <p className="text-xs text-muted-foreground">apps</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-pink-600 mb-1">
                <Webhook className="w-4 h-4" />
                <span className="text-xs font-medium">Webhooks</span>
              </div>
              <p className="text-2xl font-bold">{mockUsageStats.webhooksActive}</p>
              <p className="text-xs text-muted-foreground">active</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-amber-600 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium">This Month</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(mockUsageStats.tasksThisMonth)}</p>
              <p className="text-xs text-green-600">+{Math.round(((mockUsageStats.tasksThisMonth - mockUsageStats.tasksLastMonth) / mockUsageStats.tasksLastMonth) * 100)}%</p>
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
                    <p className="text-3xl font-bold">{mockZaps.length}</p>
                    <p className="text-orange-200 text-sm">Total Zaps</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockZaps.filter(z => z.status === 'active').length}</p>
                    <p className="text-orange-200 text-sm">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockZaps.reduce((sum, z) => sum + z.taskCount, 0).toLocaleString()}</p>
                    <p className="text-orange-200 text-sm">Tasks</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Zaps Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'Create Zap', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
                { icon: Zap, label: 'Templates', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
                { icon: Play, label: 'Run All', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' },
                { icon: Pause, label: 'Pause All', color: 'bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400' },
                { icon: History, label: 'History', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
                { icon: BarChart3, label: 'Analytics', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
                { icon: Download, label: 'Export', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' },
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
                onClick={() => setZapFilter('error')}
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

            <div className="grid gap-4">
              {filteredZaps.map(zap => (
                <Card key={zap.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedZap(zap)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Zap Flow Visualization */}
                        <div className="flex items-center gap-1">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl">
                            {zap.trigger.appIcon}
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                          {zap.actions.map((action, idx) => (
                            <div key={action.id} className="flex items-center gap-1">
                              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl">
                                {action.appIcon}
                              </div>
                              {idx < zap.actions.length - 1 && (
                                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                          ))}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{zap.name}</h3>
                            <Badge className={getStatusColor(zap.status)}>{zap.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{zap.description}</p>
                          <div className="flex items-center gap-4 mt-1">
                            {zap.lastRun && (
                              <span className="text-xs text-muted-foreground">
                                Last run: {formatDate(zap.lastRun)}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatNumber(zap.taskCount)} tasks
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {zap.successRate}% success
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {zap.status === 'active' ? (
                          <Button variant="outline" size="sm">
                            <Pause className="w-4 h-4" />
                          </Button>
                        ) : zap.status !== 'draft' ? (
                          <Button variant="outline" size="sm">
                            <Play className="w-4 h-4" />
                          </Button>
                        ) : null}
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
                    <p className="text-3xl font-bold">{mockApps.length}</p>
                    <p className="text-blue-200 text-sm">Apps</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockApps.filter(a => a.isConnected).length}</p>
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
                { icon: Plus, label: 'Add App', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
                { icon: Link, label: 'Connect', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
                { icon: Key, label: 'API Keys', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' },
                { icon: Shield, label: 'OAuth', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
                { icon: RefreshCw, label: 'Sync', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400' },
                { icon: History, label: 'History', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredApps.map(app => (
                <Card key={app.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur hover:shadow-lg transition-all cursor-pointer" onClick={() => setSelectedApp(app)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{app.icon}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{app.name}</h3>
                            {app.isPremium && (
                              <Badge variant="secondary" className="text-xs">Premium</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground capitalize">{app.category}</p>
                        </div>
                      </div>
                      {app.isConnected && (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{app.description}</p>
                    {app.isConnected ? (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {formatNumber(app.tasksRun)} tasks run
                        </span>
                        <Button variant="outline" size="sm" className="h-7">
                          <Settings className="w-3 h-3 mr-1" />
                          Manage
                        </Button>
                      </div>
                    ) : (
                      <Button className="w-full" size="sm">
                        <Plug className="w-3 h-3 mr-1" />
                        Connect
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
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
                    <p className="text-3xl font-bold">{mockTasks.length}</p>
                    <p className="text-emerald-200 text-sm">Total Tasks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockTasks.filter(t => t.status === 'success').length}</p>
                    <p className="text-emerald-200 text-sm">Succeeded</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockTasks.filter(t => t.status === 'error').length}</p>
                    <p className="text-emerald-200 text-sm">Failed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tasks Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: RefreshCw, label: 'Retry Failed', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
                { icon: Play, label: 'Replay', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
                { icon: Filter, label: 'Filter', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' },
                { icon: Search, label: 'Search', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400' },
                { icon: Eye, label: 'Details', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
                { icon: BarChart3, label: 'Analytics', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
                { icon: Download, label: 'Export', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' },
                { icon: Trash2, label: 'Clear', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' }
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
                                <span>•</span>
                                <span>{task.steps.length} steps</span>
                                {task.duration > 0 && (
                                  <>
                                    <span>•</span>
                                    <span>{formatDuration(task.duration)}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {task.status === 'failed' && (
                              <Button variant="outline" size="sm">
                                <RotateCcw className="w-3 h-3 mr-1" />
                                Replay
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
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
                    <p className="text-3xl font-bold">{mockWebhooks.length}</p>
                    <p className="text-purple-200 text-sm">Endpoints</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockWebhooks.filter(w => w.status === 'active').length}</p>
                    <p className="text-purple-200 text-sm">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockWebhooks.reduce((sum, w) => sum + w.successRate, 0) / mockWebhooks.length}%</p>
                    <p className="text-purple-200 text-sm">Success</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Webhooks Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'Create', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
                { icon: Webhook, label: 'Test', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' },
                { icon: RefreshCw, label: 'Retry', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
                { icon: Key, label: 'Secrets', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
                { icon: Shield, label: 'Verify', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400' },
                { icon: Eye, label: 'Logs', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' },
                { icon: Download, label: 'Export', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
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
              <h2 className="text-lg font-semibold">Webhook Endpoints</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Webhook
              </Button>
            </div>

            <div className="grid gap-4">
              {mockWebhooks.map(webhook => (
                <Card key={webhook.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${webhook.isActive ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                          <Webhook className={`w-5 h-5 ${webhook.isActive ? 'text-green-600' : 'text-gray-500'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{webhook.name}</h3>
                            <Badge variant="outline">{webhook.method}</Badge>
                            {webhook.isActive ? (
                              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">
                              {webhook.url}
                            </code>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatNumber(webhook.triggerCount)}</p>
                          <p className="text-xs text-muted-foreground">triggers</p>
                        </div>
                        {webhook.lastTriggered && (
                          <div className="text-right">
                            <p className="text-sm font-medium">{formatDate(webhook.lastTriggered)}</p>
                            <p className="text-xs text-muted-foreground">last triggered</p>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => setSelectedWebhook(webhook)}>
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
                    <p className="text-3xl font-bold">{mockZaps.reduce((sum, z) => sum + z.taskCount, 0).toLocaleString()}</p>
                    <p className="text-cyan-200 text-sm">Total Tasks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">99.2%</p>
                    <p className="text-cyan-200 text-sm">Success Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">45ms</p>
                    <p className="text-cyan-200 text-sm">Avg Latency</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: BarChart3, label: 'Dashboard', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400' },
                { icon: TrendingUp, label: 'Trends', color: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400' },
                { icon: Activity, label: 'Real-time', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
                { icon: PieChart, label: 'Usage', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
                { icon: AlertCircle, label: 'Errors', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' },
                { icon: FileText, label: 'Reports', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
                { icon: Download, label: 'Export', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400' },
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
                          strokeDasharray={`${2 * Math.PI * 70 * 0.982} ${2 * Math.PI * 70}`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold">98.2%</span>
                        <span className="text-xs text-muted-foreground">Success</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-sm">Successful: 15,142</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-sm">Failed: 278</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    Top Zaps by Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockZaps.slice(0, 5).sort((a, b) => b.taskCount - a.taskCount).map((zap, idx) => (
                      <div key={zap.id} className="flex items-center gap-3">
                        <span className="text-lg font-bold text-muted-foreground w-6">{idx + 1}</span>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{zap.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={(zap.taskCount / mockZaps[0].taskCount) * 100} className="h-2 flex-1" />
                            <span className="text-xs text-muted-foreground w-16 text-right">{formatNumber(zap.taskCount)}</span>
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
                    {mockApps.filter(a => a.isConnected).slice(0, 6).map(app => (
                      <div key={app.id} className="flex items-center gap-3">
                        <div className="text-xl">{app.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{app.name}</span>
                            <span className="text-xs text-muted-foreground">{formatNumber(app.tasksRun)}</span>
                          </div>
                          <Progress value={(app.tasksRun / mockApps[0].tasksRun) * 100} className="h-2" />
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
                        <code className="text-xs text-muted-foreground">zk_live_•••••••••••••••</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Test Key</p>
                        <code className="text-xs text-muted-foreground">zk_test_•••••••••••••••</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
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
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">IP Allowlist</p>
                        <p className="text-xs text-muted-foreground">3 IPs configured</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <History className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-sm">Audit Logs</p>
                        <p className="text-xs text-muted-foreground">90-day retention</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">View</Button>
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
                          <span>{formatNumber(mockUsageStats.tasksUsed)} / {formatNumber(mockUsageStats.tasksLimit)}</span>
                        </div>
                        <Progress value={usagePercent} className="h-2" />
                        <div className="flex items-center justify-between text-sm">
                          <span>Zaps</span>
                          <span>{mockUsageStats.zapsActive} / {mockUsageStats.zapsLimit}</span>
                        </div>
                        <Progress value={(mockUsageStats.zapsActive / mockUsageStats.zapsLimit) * 100} className="h-2" />
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
                        <Button variant="outline" className="flex-1">
                          View Invoices
                        </Button>
                        <Button className="flex-1 bg-gradient-to-r from-orange-500 to-red-600">
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
              onInsightAction={(insight) => console.log('Insight action:', insight)}
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
              <DialogDescription>{selectedZap?.description}</DialogDescription>
            </DialogHeader>
            {selectedZap && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(selectedZap.status)}>{selectedZap.status}</Badge>
                  {selectedZap.tags.map(tag => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>

                {/* Workflow Visualization */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <h4 className="font-medium mb-4">Workflow</h4>
                  <div className="space-y-4">
                    {/* Trigger */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-2xl">
                        {selectedZap.trigger.appIcon}
                      </div>
                      <div className="flex-1">
                        <Badge className="mb-1">Trigger</Badge>
                        <p className="font-medium">{selectedZap.trigger.appName}</p>
                        <p className="text-sm text-muted-foreground">{selectedZap.trigger.event}</p>
                      </div>
                    </div>
                    {/* Actions */}
                    {selectedZap.actions.map((action, idx) => (
                      <div key={action.id} className="flex items-center gap-3 ml-6">
                        <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600 -mt-8 ml-5" />
                        <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-2xl">
                          {action.appIcon}
                        </div>
                        <div className="flex-1">
                          <Badge variant="secondary" className="mb-1">Action {idx + 1}</Badge>
                          <p className="font-medium">{action.appName}</p>
                          <p className="text-sm text-muted-foreground">{action.event}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-2xl font-bold">{formatNumber(selectedZap.taskCount)}</p>
                    <p className="text-xs text-muted-foreground">Total Tasks</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">{selectedZap.successRate}%</p>
                    <p className="text-xs text-muted-foreground">Success Rate</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-2xl font-bold">{selectedZap.avgExecutionTime}s</p>
                    <p className="text-xs text-muted-foreground">Avg Duration</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-2xl font-bold">{selectedZap.actions.length + 1}</p>
                    <p className="text-xs text-muted-foreground">Steps</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  {selectedZap.status === 'active' ? (
                    <Button variant="outline" className="flex-1">
                      <Pause className="w-4 h-4 mr-2" />
                      Pause Zap
                    </Button>
                  ) : (
                    <Button className="flex-1">
                      <Play className="w-4 h-4 mr-2" />
                      Turn On
                    </Button>
                  )}
                  <Button variant="outline" className="flex-1">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Zap
                  </Button>
                  <Button variant="outline">
                    <Copy className="w-4 h-4" />
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
                  <Button className="w-full">
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
                <span className="text-3xl">{selectedApp?.icon}</span>
                {selectedApp?.name}
              </DialogTitle>
              <DialogDescription>{selectedApp?.description}</DialogDescription>
            </DialogHeader>
            {selectedApp && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">{selectedApp.category}</Badge>
                  {selectedApp.isPremium && <Badge>Premium</Badge>}
                  {selectedApp.isConnected && (
                    <Badge className="bg-green-100 text-green-700">Connected</Badge>
                  )}
                </div>

                {selectedApp.isConnected ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-muted-foreground">Connected Since</p>
                        <p className="font-medium">{selectedApp.connectedAt}</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-muted-foreground">Tasks Run</p>
                        <p className="font-medium">{formatNumber(selectedApp.tasksRun)}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Permissions</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedApp.scopes.map(scope => (
                          <Badge key={scope} variant="outline" className="text-xs">{scope}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reconnect
                      </Button>
                      <Button variant="destructive" className="flex-1">
                        Disconnect
                      </Button>
                    </div>
                  </>
                ) : (
                  <Button className="w-full">
                    <Plug className="w-4 h-4 mr-2" />
                    Connect {selectedApp.name}
                  </Button>
                )}

                <Button variant="outline" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Documentation
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
                  <Badge variant="outline">{selectedWebhook.method}</Badge>
                  {selectedWebhook.isActive ? (
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Webhook URL</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 text-xs bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded overflow-x-auto">
                      {selectedWebhook.url}
                    </code>
                    <Button variant="ghost" size="sm">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Secret Key</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 text-xs bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded">
                      {selectedWebhook.secret.substring(0, 12)}•••••••
                    </code>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-muted-foreground">Total Triggers</p>
                    <p className="font-medium">{formatNumber(selectedWebhook.triggerCount)}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="font-medium">{selectedWebhook.createdAt}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1">
                    Test Webhook
                  </Button>
                  <Button variant="destructive" className="flex-1">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
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
