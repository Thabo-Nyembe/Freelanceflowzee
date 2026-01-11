'use client'
import { useState, useMemo, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useAutomations, type AutomationWorkflow, type WorkflowType, type WorkflowStatus } from '@/lib/hooks/use-automations'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Workflow, Play, Plus, Settings, Download, Search,
  Zap, GitBranch, Clock, CheckCircle2, XCircle, Activity,
  Code, Database, Mail, Webhook, FileText, Users, Slack,
  Globe, ShoppingCart, CreditCard, Key, Terminal, Cloud, Bot, Sparkles,
  RotateCcw, Copy, Trash2, MoreVertical, Eye, Edit2, History, Layers,
  Filter, TrendingUp, AlertTriangle, RefreshCw, Share2, Star, BarChart3, Cpu, Gauge, Network,
  Bell, MessageSquare, ExternalLink, PlayCircle, PauseCircle,
  StopCircle, CheckCircle, Package, Shield, Rocket, ChevronRight
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

// Import mock data from centralized adapters



// ============================================================================
// TYPE DEFINITIONS - Zapier/Make Level Automation Platform
// ============================================================================

interface NodeType {
  id: string
  name: string
  category: string
  icon: React.ReactNode
  description: string
  color: string
  version: string
  isPremium: boolean
}

interface Execution {
  id: string
  workflowId: string
  workflowName: string
  status: 'running' | 'success' | 'failed' | 'waiting' | 'queued' | 'cancelled'
  startedAt: Date
  completedAt?: Date
  duration: number
  nodesExecuted: number
  totalNodes: number
  triggeredBy: string
  dataProcessed: number
  errorMessage?: string
  retryCount: number
}

interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  nodes: number
  uses: number
  author: string
  rating: number
  reviews: number
  icon: React.ReactNode
  isPremium: boolean
  tags: string[]
}

interface Scenario {
  id: string
  name: string
  description: string
  status: 'active' | 'inactive' | 'error'
  operations: number
  lastRun?: Date
  nextRun?: Date
  interval: string
  modules: number
  dataTransferred: number
  creditsUsed: number
}

interface Module {
  id: string
  name: string
  app: string
  category: string
  icon: React.ReactNode
  description: string
  operationsPerRun: number
  isInstant: boolean
  isPremium: boolean
}

interface Connection {
  id: string
  name: string
  app: string
  status: 'connected' | 'expired' | 'error'
  lastUsed: Date
  createdAt: Date
  usageCount: number
}

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'owner' | 'admin' | 'editor' | 'viewer'
  avatar?: string
  lastActive: Date
}

interface UsageStats {
  operationsUsed: number
  operationsLimit: number
  dataTransferred: number
  dataLimit: number
  scenariosActive: number
  scenariosLimit: number
  connectionsUsed: number
  connectionsLimit: number
}

interface ExecutionLog {
  id: string
  timestamp: Date
  level: 'info' | 'warning' | 'error' | 'debug'
  module: string
  message: string
  data?: Record<string, unknown>
}

interface WebhookEndpoint {
  id: string
  name: string
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  scenarioId: string
  scenarioName: string
  isActive: boolean
  lastTriggered?: Date
  totalTriggers: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockScenarios: Scenario[] = [
  { id: '1', name: 'Lead Scoring Pipeline', description: 'Score and qualify leads using AI', status: 'active', operations: 2450, lastRun: new Date(Date.now() - 1000 * 60 * 5), nextRun: new Date(Date.now() + 1000 * 60 * 10), interval: '15 minutes', modules: 8, dataTransferred: 125000, creditsUsed: 245 },
  { id: '2', name: 'Daily Report Generator', description: 'Generate and send daily reports to Slack', status: 'active', operations: 890, lastRun: new Date(Date.now() - 1000 * 60 * 60), nextRun: new Date(Date.now() + 1000 * 60 * 60 * 23), interval: 'Daily at 9am', modules: 12, dataTransferred: 450000, creditsUsed: 89 },
  { id: '3', name: 'Customer Onboarding', description: 'Automate welcome emails and CRM updates', status: 'active', operations: 1560, lastRun: new Date(Date.now() - 1000 * 60 * 30), nextRun: new Date(), interval: 'On new signup', modules: 6, dataTransferred: 78000, creditsUsed: 156 },
  { id: '4', name: 'Invoice Processing', description: 'Extract data from invoices and update accounting', status: 'error', operations: 0, lastRun: new Date(Date.now() - 1000 * 60 * 120), interval: 'On email receipt', modules: 10, dataTransferred: 0, creditsUsed: 0 },
  { id: '5', name: 'Social Media Publisher', description: 'Schedule and publish across platforms', status: 'inactive', operations: 340, lastRun: new Date(Date.now() - 1000 * 60 * 60 * 24), interval: 'Scheduled posts', modules: 5, dataTransferred: 23000, creditsUsed: 34 },
]

const mockExecutions: Execution[] = [
  { id: '1', workflowId: '1', workflowName: 'Lead Scoring Pipeline', status: 'success', startedAt: new Date(Date.now() - 1000 * 60 * 5), completedAt: new Date(Date.now() - 1000 * 60 * 3), duration: 2.3, nodesExecuted: 8, totalNodes: 8, triggeredBy: 'Webhook', dataProcessed: 15000, retryCount: 0 },
  { id: '2', workflowId: '2', workflowName: 'Daily Report Generator', status: 'running', startedAt: new Date(Date.now() - 1000 * 30), duration: 0, nodesExecuted: 3, totalNodes: 12, triggeredBy: 'Schedule', dataProcessed: 45000, retryCount: 0 },
  { id: '3', workflowId: '3', workflowName: 'Slack Notifications', status: 'success', startedAt: new Date(Date.now() - 1000 * 60 * 15), completedAt: new Date(Date.now() - 1000 * 60 * 14), duration: 0.8, nodesExecuted: 4, totalNodes: 4, triggeredBy: 'API Call', dataProcessed: 500, retryCount: 0 },
  { id: '4', workflowId: '1', workflowName: 'Lead Scoring Pipeline', status: 'failed', startedAt: new Date(Date.now() - 1000 * 60 * 30), completedAt: new Date(Date.now() - 1000 * 60 * 28), duration: 1.5, nodesExecuted: 5, totalNodes: 8, triggeredBy: 'Webhook', dataProcessed: 8000, errorMessage: 'API rate limit exceeded', retryCount: 2 },
  { id: '5', workflowId: '4', workflowName: 'Email Campaign', status: 'waiting', startedAt: new Date(Date.now() - 1000 * 60 * 60), duration: 0, nodesExecuted: 0, totalNodes: 6, triggeredBy: 'Manual', dataProcessed: 0, retryCount: 0 },
  { id: '6', workflowId: '2', workflowName: 'Daily Report Generator', status: 'queued', startedAt: new Date(Date.now() + 1000 * 60 * 5), duration: 0, nodesExecuted: 0, totalNodes: 12, triggeredBy: 'Schedule', dataProcessed: 0, retryCount: 0 },
]

const mockTemplates: WorkflowTemplate[] = [
  { id: '1', name: 'New Customer Onboarding', description: 'Automate welcome emails, CRM updates, and Slack notifications for new signups', category: 'Sales', nodes: 8, uses: 12400, author: 'Make Team', rating: 4.8, reviews: 234, icon: <Users className="h-5 w-5" />, isPremium: false, tags: ['CRM', 'Email', 'Slack'] },
  { id: '2', name: 'Daily Report to Slack', description: 'Generate and send daily reports with key metrics to Slack channels', category: 'Productivity', nodes: 5, uses: 8900, author: 'Community', rating: 4.6, reviews: 156, icon: <Slack className="h-5 w-5" />, isPremium: false, tags: ['Slack', 'Reports', 'Analytics'] },
  { id: '3', name: 'AI Lead Scoring', description: 'Use GPT-4 to automatically score and qualify leads based on behavior', category: 'AI', nodes: 12, uses: 5600, author: 'Make Team', rating: 4.9, reviews: 89, icon: <Bot className="h-5 w-5" />, isPremium: true, tags: ['AI', 'OpenAI', 'CRM'] },
  { id: '4', name: 'Invoice to Accounting', description: 'Auto-extract data from invoices and sync to QuickBooks/Xero', category: 'Finance', nodes: 6, uses: 4200, author: 'Community', rating: 4.5, reviews: 67, icon: <CreditCard className="h-5 w-5" />, isPremium: false, tags: ['Finance', 'OCR', 'Accounting'] },
  { id: '5', name: 'GitHub to Notion Sync', description: 'Sync GitHub issues and PRs to Notion databases automatically', category: 'Dev Tools', nodes: 4, uses: 7800, author: 'Community', rating: 4.7, reviews: 178, icon: <GitBranch className="h-5 w-5" />, isPremium: false, tags: ['GitHub', 'Notion', 'Dev'] },
  { id: '6', name: 'Social Media Publisher', description: 'Schedule and publish content across multiple platforms at once', category: 'Marketing', nodes: 10, uses: 6500, author: 'Make Team', rating: 4.4, reviews: 123, icon: <Share2 className="h-5 w-5" />, isPremium: false, tags: ['Social', 'Marketing', 'Scheduling'] },
  { id: '7', name: 'E-commerce Order Sync', description: 'Sync Shopify orders to inventory and fulfillment systems', category: 'E-commerce', nodes: 8, uses: 3400, author: 'Community', rating: 4.6, reviews: 45, icon: <ShoppingCart className="h-5 w-5" />, isPremium: false, tags: ['Shopify', 'Inventory', 'Orders'] },
  { id: '8', name: 'AI Email Responder', description: 'Automatically draft and send AI-powered email responses', category: 'AI', nodes: 7, uses: 2890, author: 'Make Team', rating: 4.8, reviews: 56, icon: <Mail className="h-5 w-5" />, isPremium: true, tags: ['AI', 'Email', 'GPT'] },
]

const mockConnections: Connection[] = [
  { id: '1', name: 'Slack Workspace', app: 'Slack', status: 'connected', lastUsed: new Date(Date.now() - 1000 * 60 * 5), createdAt: new Date('2024-01-15'), usageCount: 1250 },
  { id: '2', name: 'Google Sheets', app: 'Google', status: 'connected', lastUsed: new Date(Date.now() - 1000 * 60 * 30), createdAt: new Date('2024-02-01'), usageCount: 890 },
  { id: '3', name: 'OpenAI API', app: 'OpenAI', status: 'connected', lastUsed: new Date(Date.now() - 1000 * 60 * 15), createdAt: new Date('2024-03-10'), usageCount: 2340 },
  { id: '4', name: 'Stripe Account', app: 'Stripe', status: 'expired', lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), createdAt: new Date('2024-01-01'), usageCount: 456 },
  { id: '5', name: 'HubSpot CRM', app: 'HubSpot', status: 'connected', lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 2), createdAt: new Date('2024-04-01'), usageCount: 670 },
]

const mockWebhooks: WebhookEndpoint[] = [
  { id: '1', name: 'New Lead Webhook', url: 'https://hook.make.com/abc123', method: 'POST', scenarioId: '1', scenarioName: 'Lead Scoring Pipeline', isActive: true, lastTriggered: new Date(Date.now() - 1000 * 60 * 5), totalTriggers: 1250 },
  { id: '2', name: 'Order Received', url: 'https://hook.make.com/def456', method: 'POST', scenarioId: '3', scenarioName: 'Customer Onboarding', isActive: true, lastTriggered: new Date(Date.now() - 1000 * 60 * 30), totalTriggers: 890 },
  { id: '3', name: 'Invoice Webhook', url: 'https://hook.make.com/ghi789', method: 'POST', scenarioId: '4', scenarioName: 'Invoice Processing', isActive: false, totalTriggers: 234 },
]

const nodeCategories = [
  { id: 'triggers', name: 'Triggers', color: 'amber', icon: <Zap className="h-4 w-4" /> },
  { id: 'actions', name: 'Actions', color: 'blue', icon: <Play className="h-4 w-4" /> },
  { id: 'flow', name: 'Flow Control', color: 'purple', icon: <GitBranch className="h-4 w-4" /> },
  { id: 'data', name: 'Data & Storage', color: 'emerald', icon: <Database className="h-4 w-4" /> },
  { id: 'ai', name: 'AI & ML', color: 'pink', icon: <Bot className="h-4 w-4" /> },
  { id: 'integrations', name: 'Integrations', color: 'sky', icon: <Network className="h-4 w-4" /> }
]

const nodeTypes: NodeType[] = [
  // Triggers
  { id: 'webhook', name: 'Webhook', category: 'triggers', icon: <Webhook className="h-4 w-4" />, description: 'Trigger on HTTP request', color: 'amber', version: '2.1', isPremium: false },
  { id: 'cron', name: 'Schedule', category: 'triggers', icon: <Clock className="h-4 w-4" />, description: 'Time-based trigger', color: 'amber', version: '1.5', isPremium: false },
  { id: 'email-trigger', name: 'Email Trigger', category: 'triggers', icon: <Mail className="h-4 w-4" />, description: 'Trigger on email', color: 'amber', version: '1.8', isPremium: false },
  { id: 'form-trigger', name: 'Form Submit', category: 'triggers', icon: <FileText className="h-4 w-4" />, description: 'Form submission', color: 'amber', version: '1.2', isPremium: false },
  // Actions
  { id: 'http', name: 'HTTP Request', category: 'actions', icon: <Globe className="h-4 w-4" />, description: 'Make API calls', color: 'blue', version: '3.0', isPremium: false },
  { id: 'send-email', name: 'Send Email', category: 'actions', icon: <Mail className="h-4 w-4" />, description: 'Send emails', color: 'blue', version: '2.2', isPremium: false },
  { id: 'code', name: 'Code', category: 'actions', icon: <Code className="h-4 w-4" />, description: 'Custom JavaScript', color: 'blue', version: '2.5', isPremium: true },
  { id: 'function', name: 'Function', category: 'actions', icon: <Terminal className="h-4 w-4" />, description: 'Custom function', color: 'blue', version: '1.9', isPremium: true },
  // Flow Control
  { id: 'if', name: 'IF Condition', category: 'flow', icon: <GitBranch className="h-4 w-4" />, description: 'Conditional branching', color: 'purple', version: '2.0', isPremium: false },
  { id: 'switch', name: 'Switch', category: 'flow', icon: <Layers className="h-4 w-4" />, description: 'Multiple conditions', color: 'purple', version: '1.5', isPremium: false },
  { id: 'merge', name: 'Merge', category: 'flow', icon: <GitBranch className="h-4 w-4" />, description: 'Merge branches', color: 'purple', version: '1.3', isPremium: false },
  { id: 'wait', name: 'Wait', category: 'flow', icon: <Clock className="h-4 w-4" />, description: 'Delay execution', color: 'purple', version: '1.0', isPremium: false },
  { id: 'loop', name: 'Loop', category: 'flow', icon: <RotateCcw className="h-4 w-4" />, description: 'Iterate over items', color: 'purple', version: '1.8', isPremium: false },
  // Data
  { id: 'postgres', name: 'PostgreSQL', category: 'data', icon: <Database className="h-4 w-4" />, description: 'Query PostgreSQL', color: 'emerald', version: '2.1', isPremium: false },
  { id: 'supabase', name: 'Supabase', category: 'data', icon: <Cloud className="h-4 w-4" />, description: 'Supabase database', color: 'emerald', version: '1.5', isPremium: false },
  // AI
  { id: 'openai', name: 'OpenAI', category: 'ai', icon: <Bot className="h-4 w-4" />, description: 'GPT models', color: 'pink', version: '3.0', isPremium: true },
  { id: 'anthropic', name: 'Claude AI', category: 'ai', icon: <Sparkles className="h-4 w-4" />, description: 'Claude models', color: 'pink', version: '2.0', isPremium: true },
  // Integrations
  { id: 'slack', name: 'Slack', category: 'integrations', icon: <Slack className="h-4 w-4" />, description: 'Slack messages', color: 'sky', version: '2.5', isPremium: false },
  { id: 'google-sheets', name: 'Google Sheets', category: 'integrations', icon: <FileText className="h-4 w-4" />, description: 'Spreadsheets', color: 'sky', version: '3.1', isPremium: false },
  { id: 'stripe', name: 'Stripe', category: 'integrations', icon: <CreditCard className="h-4 w-4" />, description: 'Payment processing', color: 'sky', version: '2.8', isPremium: false },
  { id: 'hubspot', name: 'HubSpot', category: 'integrations', icon: <Users className="h-4 w-4" />, description: 'CRM operations', color: 'sky', version: '2.2', isPremium: false },
  { id: 'shopify', name: 'Shopify', category: 'integrations', icon: <ShoppingCart className="h-4 w-4" />, description: 'E-commerce', color: 'sky', version: '2.0', isPremium: false },
  { id: 'github', name: 'GitHub', category: 'integrations', icon: <GitBranch className="h-4 w-4" />, description: 'Git operations', color: 'sky', version: '2.4', isPremium: false },
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400',
    running: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 animate-pulse',
    success: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400',
    failed: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400',
    error: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400',
    waiting: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
    queued: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400',
    inactive: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-400',
    draft: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-400',
    cancelled: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-400',
    connected: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400',
    expired: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
  }
  return colors[status] || colors.inactive
}

const getConnectionColor = (status: Connection['status']): string => {
  const colors: Record<Connection['status'], string> = {
    connected: 'bg-green-100 text-green-800',
    expired: 'bg-amber-100 text-amber-800',
    error: 'bg-red-100 text-red-800',
  }
  return colors[status]
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs.toFixed(0)}s`
}

// ============================================================================
// ENHANCED COMPETITIVE UPGRADE MOCK DATA
// ============================================================================

const mockAutomationsAIInsights = [
  { id: '1', type: 'success' as const, title: 'Automation Health', description: 'All 24 active workflows running smoothly. 99.8% uptime.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'info' as const, title: 'Optimization Opportunity', description: '3 workflows can be combined for 40% faster execution.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Optimization' },
  { id: '3', type: 'warning' as const, title: 'Rate Limit Alert', description: 'Gmail API approaching daily limit. Consider scheduling.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Limits' },
]

const mockAutomationsCollaborators = [
  { id: '1', name: 'Automation Engineer', avatar: '/avatars/auto.jpg', status: 'online' as const, role: 'Engineer' },
  { id: '2', name: 'DevOps Lead', avatar: '/avatars/devops.jpg', status: 'online' as const, role: 'Lead' },
  { id: '3', name: 'Integration Specialist', avatar: '/avatars/int.jpg', status: 'away' as const, role: 'Specialist' },
]

const mockAutomationsPredictions = [
  { id: '1', title: 'Execution Forecast', prediction: 'Peak automation usage expected Tuesday 9-11 AM', confidence: 89, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Cost Savings', prediction: 'Current automations saving 120 hours/month', confidence: 95, trend: 'up' as const, impact: 'medium' as const },
]

const mockAutomationsActivities = [
  { id: '1', user: 'System', action: 'Executed', target: 'Email sync workflow 150 times', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'DevOps', action: 'Created', target: 'new Slack notification workflow', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'Engineer', action: 'Updated', target: 'CRM data sync schedule', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'update' as const },
]

// QuickActions moved inside component for state access

// ============================================================================
// FORM STATE INTERFACE
// ============================================================================

interface WorkflowFormState {
  workflow_name: string
  description: string
  workflow_type: WorkflowType
  trigger_type: string
  is_enabled: boolean
}

const initialFormState: WorkflowFormState = {
  workflow_name: '',
  description: '',
  workflow_type: 'sequential',
  trigger_type: 'webhook',
  is_enabled: true,
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AutomationsClient({ initialWorkflows }: { initialWorkflows: AutomationWorkflow[] }) {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [workflowTypeFilter, setWorkflowTypeFilter] = useState<WorkflowType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<WorkflowStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewWorkflow, setShowNewWorkflow] = useState(false)
  const [selectedWorkflow, setSelectedWorkflow] = useState<AutomationWorkflow | null>(null)
  const [selectedExecution, setSelectedExecution] = useState<Execution | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null)
  const [settingsTab, setSettingsTab] = useState('general')
  const [formState, setFormState] = useState<WorkflowFormState>(initialFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dbWorkflows, setDbWorkflows] = useState<AutomationWorkflow[]>([])

  // Dialog states for QuickActions
  const [showRunAllDialog, setShowRunAllDialog] = useState(false)
  const [showExportLogsDialog, setShowExportLogsDialog] = useState(false)
  const [runAllConfig, setRunAllConfig] = useState({
    includeInactive: false,
    skipFailed: true,
    parallelExecution: false,
    notifyOnComplete: true
  })
  const [exportLogsConfig, setExportLogsConfig] = useState({
    format: 'json' as 'json' | 'csv' | 'pdf',
    dateRange: '7days' as '24hours' | '7days' | '30days' | 'all',
    includeSuccessful: true,
    includeFailed: true,
    includeMetadata: true
  })
  const [isRunningAll, setIsRunningAll] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Additional dialog states
  const [showWebhooksDialog, setShowWebhooksDialog] = useState(false)
  const [showAIAutomationDialog, setShowAIAutomationDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showCloneDialog, setShowCloneDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showFiltersDialog, setShowFiltersDialog] = useState(false)
  const [showNewConnectionDialog, setShowNewConnectionDialog] = useState(false)
  const [showNewWebhookDialog, setShowNewWebhookDialog] = useState(false)
  const [showAPIKeysDialog, setShowAPIKeysDialog] = useState(false)
  const [showSubmitTemplateDialog, setShowSubmitTemplateDialog] = useState(false)
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false)
  const [showClearHistoryDialog, setShowClearHistoryDialog] = useState(false)
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false)
  const [showEditorDialog, setShowEditorDialog] = useState(false)
  const [showViewLogsDialog, setShowViewLogsDialog] = useState(false)
  const [showPreviewTemplateDialog, setShowPreviewTemplateDialog] = useState(false)
  const [showUpgradePlanDialog, setShowUpgradePlanDialog] = useState(false)
  const [importJsonContent, setImportJsonContent] = useState('')
  const [newConnectionForm, setNewConnectionForm] = useState({ name: '', app: '', apiKey: '' })
  const [newWebhookForm, setNewWebhookForm] = useState({ name: '', method: 'POST' as 'GET' | 'POST' | 'PUT' | 'DELETE', scenarioId: '' })
  const [submitTemplateForm, setSubmitTemplateForm] = useState({ name: '', description: '', category: 'Productivity' })
  const [selectedCloneWorkflow, setSelectedCloneWorkflow] = useState<AutomationWorkflow | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [templateFilterType, setTemplateFilterType] = useState<'ai' | 'top_rated' | 'popular' | 'all'>('all')

  // Additional dialog states for confirmations and editing
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false)
  const [showRunConfirmDialog, setShowRunConfirmDialog] = useState(false)
  const [showEditWorkflowDialog, setShowEditWorkflowDialog] = useState(false)
  const [workflowToDelete, setWorkflowToDelete] = useState<AutomationWorkflow | null>(null)
  const [workflowToRun, setWorkflowToRun] = useState<AutomationWorkflow | null>(null)
  const [workflowToEdit, setWorkflowToEdit] = useState<AutomationWorkflow | null>(null)
  const [editFormState, setEditFormState] = useState<WorkflowFormState>(initialFormState)

  const { workflows, loading, error, refetch } = useAutomations({ workflowType: workflowTypeFilter, status: statusFilter })
  const displayWorkflows = dbWorkflows.length > 0 ? dbWorkflows : (workflows.length > 0 ? workflows : initialWorkflows)

  // Calculate comprehensive stats
  const stats = useMemo(() => {
    const total = displayWorkflows.length
    const active = displayWorkflows.filter(w => w.status === 'active').length
    const running = displayWorkflows.filter(w => w.status === 'running').length
    const totalExecutions = displayWorkflows.reduce((sum, w) => sum + w.total_executions, 0)
    const successfulExecutions = displayWorkflows.reduce((sum, w) => sum + w.successful_executions, 0)
    const failedExecutions = displayWorkflows.reduce((sum, w) => sum + w.failed_executions, 0)
    const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0
    const totalNodes = displayWorkflows.reduce((sum, w) => sum + w.step_count, 0)
    const totalOperations = mockScenarios.reduce((sum, s) => sum + s.operations, 0)
    const totalDataTransferred = mockScenarios.reduce((sum, s) => sum + s.dataTransferred, 0)

    return {
      total,
      active,
      running,
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      successRate,
      totalNodes,
      totalOperations,
      totalDataTransferred
    }
  }, [displayWorkflows])

  // Filter workflows
  const filteredWorkflows = useMemo(() => {
    return displayWorkflows.filter(w => {
      const matchesSearch = !searchQuery ||
        w.workflow_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.description?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = workflowTypeFilter === 'all' || w.workflow_type === workflowTypeFilter
      const matchesStatus = statusFilter === 'all' || w.status === statusFilter
      return matchesSearch && matchesType && matchesStatus
    })
  }, [displayWorkflows, searchQuery, workflowTypeFilter, statusFilter])

  // Fetch workflows from Supabase
  const fetchWorkflows = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('automations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setDbWorkflows(data || [])
    } catch (err) {
      console.error('Error fetching workflows:', err)
    }
  }, [supabase])

  useEffect(() => {
    fetchWorkflows()
  }, [fetchWorkflows])

  // Create workflow handler
  const handleCreateWorkflow = async () => {
    if (!formState.workflow_name.trim()) {
      toast.error('Workflow name is required')
      return
    }

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to create workflows')
        return
      }

      const { error } = await supabase.from('automations').insert({
        user_id: user.id,
        workflow_name: formState.workflow_name,
        description: formState.description || null,
        workflow_type: formState.workflow_type,
        trigger_type: formState.trigger_type,
        status: 'draft',
        is_enabled: formState.is_enabled,
        steps: [],
        step_count: 0,
        current_step: 0,
        trigger_config: {},
        total_executions: 0,
        successful_executions: 0,
        failed_executions: 0,
        total_duration_seconds: 0,
        version: 1,
        is_published: false,
        variables: {},
        context_data: {},
        error_handling_strategy: 'stop',
        max_retries: 3,
        retry_delay_seconds: 30,
        notify_on_success: false,
        notify_on_failure: true,
        notification_config: {},
        is_scheduled: false,
        schedule_config: {},
        requires_approval: false,
        approved: false,
        metadata: {},
      })

      if (error) throw error

      toast.success('Workflow created successfully')
      setShowNewWorkflow(false)
      setFormState(initialFormState)
      fetchWorkflows()
      refetch()
    } catch (err) {
      console.error('Error creating workflow:', err)
      toast.error('Failed to create workflow')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Run workflow handler
  const handleRunAutomation = async (workflow: AutomationWorkflow) => {
    try {
      const { error } = await supabase
        .from('automations')
        .update({
          status: 'running',
          is_running: true,
          last_execution_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', workflow.id)

      if (error) throw error

      toast.success('Automation started', {
        description: `${workflow.workflow_name} is now executing`
      })
      fetchWorkflows()
    } catch (err) {
      console.error('Error running workflow:', err)
      toast.error('Failed to start automation')
    }
  }

  // Toggle workflow status handler
  const handleToggleAutomation = async (workflow: AutomationWorkflow) => {
    const newStatus = workflow.status === 'active' ? 'paused' : 'active'
    try {
      const { error } = await supabase
        .from('automations')
        .update({
          status: newStatus,
          is_enabled: newStatus === 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', workflow.id)

      if (error) throw error

      toast.success(newStatus === 'active' ? 'Automation activated' : 'Automation paused', {
        description: `${workflow.workflow_name} is now ${newStatus}`
      })
      fetchWorkflows()
    } catch (err) {
      console.error('Error toggling workflow:', err)
      toast.error('Failed to update automation status')
    }
  }

  // Duplicate workflow handler
  const handleDuplicateAutomation = async (workflow: AutomationWorkflow) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to duplicate workflows')
        return
      }

      const { error } = await supabase.from('automations').insert({
        user_id: user.id,
        workflow_name: `${workflow.workflow_name} (Copy)`,
        description: workflow.description,
        workflow_type: workflow.workflow_type,
        trigger_type: workflow.trigger_type,
        status: 'draft',
        is_enabled: false,
        steps: workflow.steps,
        step_count: workflow.step_count,
        current_step: 0,
        trigger_config: workflow.trigger_config,
        total_executions: 0,
        successful_executions: 0,
        failed_executions: 0,
        total_duration_seconds: 0,
        version: 1,
        is_published: false,
        variables: workflow.variables,
        context_data: {},
        error_handling_strategy: workflow.error_handling_strategy,
        max_retries: workflow.max_retries,
        retry_delay_seconds: workflow.retry_delay_seconds,
        notify_on_success: workflow.notify_on_success,
        notify_on_failure: workflow.notify_on_failure,
        notification_config: workflow.notification_config,
        is_scheduled: false,
        schedule_config: {},
        requires_approval: false,
        approved: false,
        metadata: workflow.metadata,
      })

      if (error) throw error

      toast.success('Automation duplicated', {
        description: `Copy of ${workflow.workflow_name} created`
      })
      fetchWorkflows()
    } catch (err) {
      console.error('Error duplicating workflow:', err)
      toast.error('Failed to duplicate automation')
    }
  }

  // Delete workflow handler
  const handleDeleteAutomation = async (workflow: AutomationWorkflow) => {
    try {
      const { error } = await supabase
        .from('automations')
        .delete()
        .eq('id', workflow.id)

      if (error) throw error

      toast.success('Automation deleted', {
        description: `${workflow.workflow_name} has been removed`
      })
      setShowDeleteConfirmDialog(false)
      setWorkflowToDelete(null)
      fetchWorkflows()
    } catch (err) {
      console.error('Error deleting workflow:', err)
      toast.error('Failed to delete automation')
    }
  }

  // Show delete confirmation dialog
  const handleShowDeleteConfirm = (workflow: AutomationWorkflow) => {
    setWorkflowToDelete(workflow)
    setShowDeleteConfirmDialog(true)
  }

  // Show run confirmation dialog
  const handleShowRunConfirm = (workflow: AutomationWorkflow) => {
    setWorkflowToRun(workflow)
    setShowRunConfirmDialog(true)
  }

  // Confirm and run automation
  const handleConfirmRun = async () => {
    if (!workflowToRun) return
    await handleRunAutomation(workflowToRun)
    setShowRunConfirmDialog(false)
    setWorkflowToRun(null)
  }

  // Show edit workflow dialog
  const handleShowEditDialog = (workflow: AutomationWorkflow) => {
    setWorkflowToEdit(workflow)
    setEditFormState({
      workflow_name: workflow.workflow_name,
      description: workflow.description || '',
      workflow_type: workflow.workflow_type,
      trigger_type: workflow.trigger_type,
      is_enabled: workflow.is_enabled,
    })
    setShowEditWorkflowDialog(true)
  }

  // Update workflow handler
  const handleUpdateWorkflow = async () => {
    if (!workflowToEdit || !editFormState.workflow_name.trim()) {
      toast.error('Workflow name is required')
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('automations')
        .update({
          workflow_name: editFormState.workflow_name,
          description: editFormState.description || null,
          workflow_type: editFormState.workflow_type,
          trigger_type: editFormState.trigger_type,
          is_enabled: editFormState.is_enabled,
          updated_at: new Date().toISOString(),
        })
        .eq('id', workflowToEdit.id)

      if (error) throw error

      toast.success('Workflow updated successfully', {
        description: `${editFormState.workflow_name} has been saved`
      })
      setShowEditWorkflowDialog(false)
      setWorkflowToEdit(null)
      setEditFormState(initialFormState)
      fetchWorkflows()
      refetch()
    } catch (err) {
      console.error('Error updating workflow:', err)
      toast.error('Failed to update workflow')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle AI insight action
  const handleInsightAction = async (insight: { id: string; type: string; title: string; description: string }) => {
    try {
      if (insight.type === 'warning') {
        toast.warning(`Addressing: ${insight.title}`, {
          description: 'Taking action to resolve this issue'
        })
      } else if (insight.type === 'info') {
        toast.info(`Viewing: ${insight.title}`, {
          description: insight.description
        })
      } else {
        toast.success(`Insight acknowledged: ${insight.title}`)
      }
    } catch (err) {
      console.error('Error handling insight action:', err)
      toast.error('Failed to process insight action')
    }
  }

  // Run all workflows handler
  const handleRunAllWorkflows = async () => {
    setIsRunningAll(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to run workflows')
        return
      }

      const workflowsToRun = displayWorkflows.filter(w => {
        if (!runAllConfig.includeInactive && w.status !== 'active') return false
        if (runAllConfig.skipFailed && w.status === 'failed') return false
        return true
      })

      if (workflowsToRun.length === 0) {
        toast.error('No workflows to run', {
          description: 'Adjust your filters or enable inactive workflows'
        })
        return
      }

      // Update all selected workflows to running status
      const { error } = await supabase
        .from('automations')
        .update({
          status: 'running',
          is_running: true,
          last_execution_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .in('id', workflowsToRun.map(w => w.id))

      if (error) throw error

      toast.success(`Started ${workflowsToRun.length} workflow${workflowsToRun.length > 1 ? 's' : ''}`, {
        description: runAllConfig.parallelExecution
          ? 'Running in parallel mode'
          : 'Running sequentially'
      })

      setShowRunAllDialog(false)
      fetchWorkflows()
    } catch (err) {
      console.error('Error running workflows:', err)
      toast.error('Failed to start workflows')
    } finally {
      setIsRunningAll(false)
    }
  }

  // Export logs handler
  const handleExportLogs = async () => {
    setIsExporting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to export logs')
        return
      }

      // Build date filter based on selection
      const now = new Date()
      let startDate: Date | null = null
      switch (exportLogsConfig.dateRange) {
        case '24hours':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
          break
        case '7days':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case '30days':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case 'all':
          startDate = null
          break
      }

      // Prepare export data
      const exportData = {
        exportedAt: new Date().toISOString(),
        format: exportLogsConfig.format,
        dateRange: exportLogsConfig.dateRange,
        workflows: displayWorkflows.map(w => ({
          id: w.id,
          name: w.workflow_name,
          status: w.status,
          totalExecutions: w.total_executions,
          successfulExecutions: exportLogsConfig.includeSuccessful ? w.successful_executions : undefined,
          failedExecutions: exportLogsConfig.includeFailed ? w.failed_executions : undefined,
          lastExecution: w.last_execution_at,
          ...(exportLogsConfig.includeMetadata && {
            metadata: {
              type: w.workflow_type,
              triggerType: w.trigger_type,
              stepCount: w.step_count,
              version: w.version
            }
          })
        })),
        executions: mockExecutions.filter(e => {
          if (!exportLogsConfig.includeSuccessful && e.status === 'success') return false
          if (!exportLogsConfig.includeFailed && e.status === 'failed') return false
          if (startDate && e.startedAt < startDate) return false
          return true
        })
      }

      // Create and download file
      let content: string
      let mimeType: string
      let extension: string

      if (exportLogsConfig.format === 'csv') {
        // Convert to CSV
        const headers = ['Workflow', 'Status', 'Total Executions', 'Successful', 'Failed', 'Last Run']
        const rows = exportData.workflows.map(w => [
          w.name,
          w.status,
          w.totalExecutions,
          w.successfulExecutions || 0,
          w.failedExecutions || 0,
          w.lastExecution || 'Never'
        ])
        content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
        mimeType = 'text/csv'
        extension = 'csv'
      } else if (exportLogsConfig.format === 'pdf') {
        // For PDF, we'll create a simple text representation (in real app, use a PDF library)
        content = `Automation Logs Export\n${'='.repeat(50)}\n\nExported: ${exportData.exportedAt}\nDate Range: ${exportData.dateRange}\n\nWorkflows:\n${exportData.workflows.map(w => `- ${w.name}: ${w.status} (${w.totalExecutions} executions)`).join('\n')}`
        mimeType = 'text/plain'
        extension = 'txt' // Would be 'pdf' with proper PDF generation
      } else {
        content = JSON.stringify(exportData, null, 2)
        mimeType = 'application/json'
        extension = 'json'
      }

      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `automation-logs-${new Date().toISOString().split('T')[0]}.${extension}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Logs exported successfully', {
        description: `Downloaded as ${exportLogsConfig.format.toUpperCase()} file`
      })

      setShowExportLogsDialog(false)
    } catch (err) {
      console.error('Error exporting logs:', err)
      toast.error('Failed to export logs')
    } finally {
      setIsExporting(false)
    }
  }

  // Pause all workflows handler
  const handlePauseAllWorkflows = async () => {
    setIsProcessing(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to pause workflows')
        return
      }

      const activeWorkflows = displayWorkflows.filter(w => w.status === 'active')
      if (activeWorkflows.length === 0) {
        toast.info('No active workflows to pause')
        return
      }

      const { error } = await supabase
        .from('automations')
        .update({
          status: 'paused',
          is_enabled: false,
          updated_at: new Date().toISOString(),
        })
        .in('id', activeWorkflows.map(w => w.id))

      if (error) throw error

      toast.success(`Paused ${activeWorkflows.length} workflow${activeWorkflows.length > 1 ? 's' : ''}`)
      fetchWorkflows()
    } catch (err) {
      console.error('Error pausing workflows:', err)
      toast.error('Failed to pause workflows')
    } finally {
      setIsProcessing(false)
    }
  }

  // Stop all running workflows handler
  const handleStopAllRunning = async () => {
    setIsProcessing(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to stop workflows')
        return
      }

      const runningWorkflows = displayWorkflows.filter(w => w.status === 'running')
      if (runningWorkflows.length === 0) {
        toast.info('No running workflows to stop')
        return
      }

      const { error } = await supabase
        .from('automations')
        .update({
          status: 'paused',
          is_running: false,
          updated_at: new Date().toISOString(),
        })
        .in('id', runningWorkflows.map(w => w.id))

      if (error) throw error

      toast.success(`Stopped ${runningWorkflows.length} workflow${runningWorkflows.length > 1 ? 's' : ''}`)
      fetchWorkflows()
    } catch (err) {
      console.error('Error stopping workflows:', err)
      toast.error('Failed to stop workflows')
    } finally {
      setIsProcessing(false)
    }
  }

  // Retry failed workflows handler
  const handleRetryFailed = async () => {
    setIsProcessing(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to retry workflows')
        return
      }

      const failedWorkflows = displayWorkflows.filter(w => w.status === 'failed')
      if (failedWorkflows.length === 0) {
        toast.info('No failed workflows to retry')
        return
      }

      const { error } = await supabase
        .from('automations')
        .update({
          status: 'running',
          is_running: true,
          last_execution_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .in('id', failedWorkflows.map(w => w.id))

      if (error) throw error

      toast.success(`Retrying ${failedWorkflows.length} failed workflow${failedWorkflows.length > 1 ? 's' : ''}`)
      fetchWorkflows()
    } catch (err) {
      console.error('Error retrying workflows:', err)
      toast.error('Failed to retry workflows')
    } finally {
      setIsProcessing(false)
    }
  }

  // Refresh expired connections handler
  const handleRefreshExpiredConnections = async () => {
    setIsProcessing(true)
    try {
      // Simulate refreshing expired connections
      await new Promise(resolve => setTimeout(resolve, 1500))
      const expiredCount = mockConnections.filter(c => c.status === 'expired').length
      if (expiredCount === 0) {
        toast.info('No expired connections to refresh')
      } else {
        toast.success(`Refreshed ${expiredCount} expired connection${expiredCount > 1 ? 's' : ''}`)
      }
    } catch (err) {
      console.error('Error refreshing connections:', err)
      toast.error('Failed to refresh connections')
    } finally {
      setIsProcessing(false)
    }
  }

  // Copy to clipboard helper
  const handleCopyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} copied to clipboard`)
    } catch (err) {
      console.error('Error copying to clipboard:', err)
      toast.error('Failed to copy to clipboard')
    }
  }

  // Create new connection handler
  const handleCreateConnection = async () => {
    if (!newConnectionForm.name.trim() || !newConnectionForm.app.trim()) {
      toast.error('Please fill in all required fields')
      return
    }
    setIsProcessing(true)
    try {
      // Simulate API call to create connection
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Connection created successfully', {
        description: `${newConnectionForm.name} is now connected`
      })
      setShowNewConnectionDialog(false)
      setNewConnectionForm({ name: '', app: '', apiKey: '' })
    } catch (err) {
      console.error('Error creating connection:', err)
      toast.error('Failed to create connection')
    } finally {
      setIsProcessing(false)
    }
  }

  // Create new webhook handler
  const handleCreateWebhook = async () => {
    if (!newWebhookForm.name.trim()) {
      toast.error('Please enter a webhook name')
      return
    }
    setIsProcessing(true)
    try {
      // Simulate API call to create webhook
      await new Promise(resolve => setTimeout(resolve, 1000))
      const webhookUrl = `https://hook.freeflow.app/${Math.random().toString(36).substring(7)}`
      toast.success('Webhook created successfully', {
        description: `URL: ${webhookUrl}`
      })
      setShowNewWebhookDialog(false)
      setNewWebhookForm({ name: '', method: 'POST', scenarioId: '' })
    } catch (err) {
      console.error('Error creating webhook:', err)
      toast.error('Failed to create webhook')
    } finally {
      setIsProcessing(false)
    }
  }

  // Submit template handler
  const handleSubmitTemplate = async () => {
    if (!submitTemplateForm.name.trim() || !submitTemplateForm.description.trim()) {
      toast.error('Please fill in all required fields')
      return
    }
    setIsProcessing(true)
    try {
      // Simulate API call to submit template
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('Template submitted for review', {
        description: 'We will review your template and publish it soon'
      })
      setShowSubmitTemplateDialog(false)
      setSubmitTemplateForm({ name: '', description: '', category: 'Productivity' })
    } catch (err) {
      console.error('Error submitting template:', err)
      toast.error('Failed to submit template')
    } finally {
      setIsProcessing(false)
    }
  }

  // Delete all scenarios handler
  const handleDeleteAllScenarios = async () => {
    setIsProcessing(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to delete scenarios')
        return
      }

      const { error } = await supabase
        .from('automations')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error

      toast.success('All scenarios deleted successfully')
      setShowDeleteAllDialog(false)
      fetchWorkflows()
    } catch (err) {
      console.error('Error deleting scenarios:', err)
      toast.error('Failed to delete scenarios')
    } finally {
      setIsProcessing(false)
    }
  }

  // Clear execution history handler
  const handleClearExecutionHistory = async () => {
    setIsProcessing(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to clear history')
        return
      }

      // Reset execution counts on all workflows
      const { error } = await supabase
        .from('automations')
        .update({
          total_executions: 0,
          successful_executions: 0,
          failed_executions: 0,
          total_duration_seconds: 0,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      if (error) throw error

      toast.success('Execution history cleared')
      setShowClearHistoryDialog(false)
      fetchWorkflows()
    } catch (err) {
      console.error('Error clearing history:', err)
      toast.error('Failed to clear execution history')
    } finally {
      setIsProcessing(false)
    }
  }

  // Import scenario from JSON handler
  const handleImportScenario = async () => {
    if (!importJsonContent.trim()) {
      toast.error('Please paste valid JSON content')
      return
    }
    setIsProcessing(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to import scenarios')
        return
      }

      const imported = JSON.parse(importJsonContent)
      const { error } = await supabase.from('automations').insert({
        user_id: user.id,
        workflow_name: imported.name || 'Imported Scenario',
        description: imported.description || 'Imported from external source',
        workflow_type: imported.workflow_type || 'sequential',
        trigger_type: imported.trigger_type || 'webhook',
        status: 'draft',
        is_enabled: false,
        steps: imported.steps || [],
        step_count: imported.steps?.length || 0,
        current_step: 0,
        trigger_config: imported.trigger_config || {},
        total_executions: 0,
        successful_executions: 0,
        failed_executions: 0,
        total_duration_seconds: 0,
        version: 1,
        is_published: false,
        variables: imported.variables || {},
        context_data: {},
        error_handling_strategy: 'stop',
        max_retries: 3,
        retry_delay_seconds: 30,
        notify_on_success: false,
        notify_on_failure: true,
        notification_config: {},
        is_scheduled: false,
        schedule_config: {},
        requires_approval: false,
        approved: false,
        metadata: { imported: true, importedAt: new Date().toISOString() },
      })

      if (error) throw error

      toast.success('Scenario imported successfully')
      setShowImportDialog(false)
      setImportJsonContent('')
      fetchWorkflows()
    } catch (err) {
      console.error('Error importing scenario:', err)
      toast.error('Failed to import scenario - check JSON format')
    } finally {
      setIsProcessing(false)
    }
  }

  // Export scenarios handler
  const handleExportScenarios = async () => {
    try {
      const exportData = {
        exportedAt: new Date().toISOString(),
        scenarios: displayWorkflows.map(w => ({
          name: w.workflow_name,
          description: w.description,
          workflow_type: w.workflow_type,
          trigger_type: w.trigger_type,
          steps: w.steps,
          variables: w.variables,
          trigger_config: w.trigger_config,
        }))
      }

      const content = JSON.stringify(exportData, null, 2)
      const blob = new Blob([content], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `scenarios-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Scenarios exported successfully')
    } catch (err) {
      console.error('Error exporting scenarios:', err)
      toast.error('Failed to export scenarios')
    }
  }

  // Clone workflow handler with dialog
  const handleCloneWorkflow = async () => {
    if (!selectedCloneWorkflow) return
    setIsProcessing(true)
    try {
      await handleDuplicateAutomation(selectedCloneWorkflow)
      setShowCloneDialog(false)
      setSelectedCloneWorkflow(null)
    } catch (err) {
      console.error('Error cloning workflow:', err)
      toast.error('Failed to clone workflow')
    } finally {
      setIsProcessing(false)
    }
  }

  // Share workflow handler
  const handleShareWorkflow = async () => {
    setIsProcessing(true)
    try {
      const shareUrl = `${window.location.origin}/shared/workflow/${Math.random().toString(36).substring(7)}`
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Share link copied to clipboard', {
        description: 'Anyone with this link can view the workflow'
      })
      setShowShareDialog(false)
    } catch (err) {
      console.error('Error sharing workflow:', err)
      toast.error('Failed to generate share link')
    } finally {
      setIsProcessing(false)
    }
  }

  // Regenerate API key handler
  const handleRegenerateAPIKey = async () => {
    setIsProcessing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const newKey = `mk_live_${Math.random().toString(36).substring(2, 34)}`
      await navigator.clipboard.writeText(newKey)
      toast.success('New API key generated and copied to clipboard', {
        description: 'Make sure to update your integrations'
      })
    } catch (err) {
      console.error('Error regenerating API key:', err)
      toast.error('Failed to regenerate API key')
    } finally {
      setIsProcessing(false)
    }
  }

  // Retry single execution handler
  const handleRetryExecution = async (execution: Execution) => {
    setIsProcessing(true)
    try {
      const workflow = displayWorkflows.find(w => w.id === execution.workflowId)
      if (workflow) {
        await handleRunAutomation(workflow)
      }
      toast.success('Execution retried', {
        description: `${execution.workflowName} is now running`
      })
    } catch (err) {
      console.error('Error retrying execution:', err)
      toast.error('Failed to retry execution')
    } finally {
      setIsProcessing(false)
    }
  }

  // Use template handler
  const handleUseTemplate = async (template: WorkflowTemplate) => {
    setIsProcessing(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to use templates')
        return
      }

      const { error } = await supabase.from('automations').insert({
        user_id: user.id,
        workflow_name: template.name,
        description: template.description,
        workflow_type: 'sequential',
        trigger_type: 'webhook',
        status: 'draft',
        is_enabled: false,
        steps: [],
        step_count: template.nodes,
        current_step: 0,
        trigger_config: {},
        total_executions: 0,
        successful_executions: 0,
        failed_executions: 0,
        total_duration_seconds: 0,
        version: 1,
        is_published: false,
        variables: {},
        context_data: {},
        error_handling_strategy: 'stop',
        max_retries: 3,
        retry_delay_seconds: 30,
        notify_on_success: false,
        notify_on_failure: true,
        notification_config: {},
        is_scheduled: false,
        schedule_config: {},
        requires_approval: false,
        approved: false,
        metadata: { fromTemplate: template.id, templateName: template.name },
      })

      if (error) throw error

      toast.success('Template applied successfully', {
        description: `"${template.name}" scenario created`
      })
      setSelectedTemplate(null)
      fetchWorkflows()
    } catch (err) {
      console.error('Error using template:', err)
      toast.error('Failed to apply template')
    } finally {
      setIsProcessing(false)
    }
  }

  // Restore workflow version handler
  const handleRestoreVersion = async (workflow: AutomationWorkflow, version: number) => {
    setIsProcessing(true)
    try {
      const { error } = await supabase
        .from('automations')
        .update({
          version: version,
          updated_at: new Date().toISOString(),
        })
        .eq('id', workflow.id)

      if (error) throw error

      toast.success(`Restored to version ${version}`)
      fetchWorkflows()
    } catch (err) {
      console.error('Error restoring version:', err)
      toast.error('Failed to restore version')
    } finally {
      setIsProcessing(false)
    }
  }

  // File upload handler for import
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      setImportJsonContent(text)
      toast.success('File loaded', {
        description: 'Click Import to create the scenario'
      })
    } catch (err) {
      console.error('Error reading file:', err)
      toast.error('Failed to read file')
    }
  }

  // QuickActions with dialog triggers
  const automationsQuickActions = [
    {
      id: '1',
      label: 'New Workflow',
      icon: 'plus',
      action: () => setShowNewWorkflow(true),
      variant: 'default' as const
    },
    {
      id: '2',
      label: 'Run All',
      icon: 'play',
      action: () => setShowRunAllDialog(true),
      variant: 'default' as const
    },
    {
      id: '3',
      label: 'Export Logs',
      icon: 'download',
      action: () => setShowExportLogsDialog(true),
      variant: 'outline' as const
    },
  ]

  if (error) return (
    <div className="p-8">
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">Error: {error.message}</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:bg-none dark:bg-gray-900 p-8">
      <div className="max-w-[1800px] mx-auto space-y-8">
        {/* Premium Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-8 text-white">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Workflow className="h-8 w-8" />
                  </div>
                  <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                    Automation Pro
                  </Badge>
                  <Badge className="bg-emerald-500/30 text-white border-0 backdrop-blur-sm">
                    Zapier/Make Level
                  </Badge>
                </div>
                <h1 className="text-4xl font-bold mb-2">Workflow Automation</h1>
                <p className="text-white/80 max-w-xl">
                  Build powerful automations with 400+ apps, AI nodes, visual workflow builder, and real-time execution monitoring
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Dialog open={showNewWorkflow} onOpenChange={setShowNewWorkflow}>
                  <DialogTrigger asChild>
                    <Button className="bg-white text-emerald-600 hover:bg-white/90">
                      <Plus className="h-4 w-4 mr-2" />
                      New Scenario
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
                    <DialogHeader>
                      <DialogTitle>Create New Scenario</DialogTitle>
                    </DialogHeader>
                    <Tabs defaultValue="blank" className="mt-4">
                      <TabsList className="grid grid-cols-3 w-full">
                        <TabsTrigger value="blank">Start Blank</TabsTrigger>
                        <TabsTrigger value="template">From Template</TabsTrigger>
                        <TabsTrigger value="import">Import</TabsTrigger>
                      </TabsList>
                      <ScrollArea className="h-[400px] mt-4">
                        <TabsContent value="blank" className="space-y-4 pr-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Scenario Name</label>
                            <Input
                              placeholder="My Automation Scenario"
                              value={formState.workflow_name}
                              onChange={(e) => setFormState(prev => ({ ...prev, workflow_name: e.target.value }))}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                              rows={3}
                              placeholder="What does this scenario automate?"
                              value={formState.description}
                              onChange={(e) => setFormState(prev => ({ ...prev, description: e.target.value }))}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Workflow Type</label>
                            <select
                              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                              value={formState.workflow_type}
                              onChange={(e) => setFormState(prev => ({ ...prev, workflow_type: e.target.value as WorkflowType }))}
                            >
                              <option value="sequential">Sequential</option>
                              <option value="parallel">Parallel</option>
                              <option value="conditional">Conditional</option>
                              <option value="branching">Branching</option>
                              <option value="loop">Loop</option>
                              <option value="hybrid">Hybrid</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Start with a Trigger</label>
                            <div className="grid grid-cols-2 gap-3">
                              {nodeTypes.filter(n => n.category === 'triggers').map(node => (
                                <button
                                  key={node.id}
                                  type="button"
                                  onClick={() => setFormState(prev => ({ ...prev, trigger_type: node.id }))}
                                  className={`flex items-center gap-3 p-3 border rounded-lg hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all text-left ${formState.trigger_type === node.id ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : ''}`}
                                >
                                  <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                                    {node.icon}
                                  </div>
                                  <div>
                                    <p className="font-medium">{node.name}</p>
                                    <p className="text-xs text-gray-500">{node.description}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="pt-4 border-t flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setShowNewWorkflow(false)}>
                              Cancel
                            </Button>
                            <Button
                              onClick={handleCreateWorkflow}
                              disabled={isSubmitting || !formState.workflow_name.trim()}
                            >
                              {isSubmitting ? (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                  Creating...
                                </>
                              ) : (
                                <>
                                  <Plus className="h-4 w-4 mr-2" />
                                  Create Scenario
                                </>
                              )}
                            </Button>
                          </div>
                        </TabsContent>
                        <TabsContent value="template" className="pr-4">
                          <div className="grid grid-cols-2 gap-4">
                            {mockTemplates.slice(0, 6).map(template => (
                              <button key={template.id} className="p-4 border rounded-lg hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all text-left relative">
                                {template.isPremium && (
                                  <Badge className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                                    <Star className="h-3 w-3 mr-1" /> Premium
                                  </Badge>
                                )}
                                <div className="flex items-center justify-between mb-2">
                                  <Badge variant="secondary">{template.category}</Badge>
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Star className="h-3 w-3 text-amber-500" />
                                    {template.rating}
                                  </span>
                                </div>
                                <h4 className="font-medium mb-1">{template.name}</h4>
                                <p className="text-sm text-gray-500 line-clamp-2">{template.description}</p>
                                <p className="text-xs text-gray-400 mt-2">{template.nodes} modules • {template.uses.toLocaleString()} uses</p>
                              </button>
                            ))}
                          </div>
                        </TabsContent>
                        <TabsContent value="import" className="space-y-4 pr-4">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                            <p className="font-medium mb-1">Drop your scenario file here</p>
                            <p className="text-sm text-gray-500">Supports .json exports from Make, Zapier, n8n</p>
                            <input
                              type="file"
                              accept=".json"
                              onChange={handleFileUpload}
                              className="hidden"
                              id="import-file-input"
                            />
                            <Button variant="outline" className="mt-4" onClick={() => document.getElementById('import-file-input')?.click()}>Browse Files</Button>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Or paste JSON</label>
                            <textarea
                              className="w-full px-3 py-2 border rounded-lg font-mono text-sm dark:bg-gray-800 dark:border-gray-700"
                              rows={6}
                              placeholder='{"modules": [...], "connections": [...]}'
                              value={importJsonContent}
                              onChange={(e) => setImportJsonContent(e.target.value)}
                            />
                          </div>
                          <div className="pt-4 border-t flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setShowNewWorkflow(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleImportScenario} disabled={isProcessing || !importJsonContent.trim()}>
                              {isProcessing ? (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                  Importing...
                                </>
                              ) : (
                                <>
                                  <Download className="h-4 w-4 mr-2" />
                                  Import Scenario
                                </>
                              )}
                            </Button>
                          </div>
                        </TabsContent>
                      </ScrollArea>
                    </Tabs>
                  </DialogContent>
                </Dialog>
                <Button variant="ghost" className="text-white hover:bg-white/20" onClick={() => setShowExportLogsDialog(true)}>
                  <Download className="h-5 w-5" />
                </Button>
                <Button variant="ghost" className="text-white hover:bg-white/20" onClick={() => setActiveTab('settings')}>
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid - 8 Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { label: 'Scenarios', value: stats.total, icon: Workflow, color: 'emerald', change: '+3' },
            { label: 'Active', value: stats.active, icon: PlayCircle, color: 'green', change: '' },
            { label: 'Operations', value: stats.totalOperations.toLocaleString(), icon: Zap, color: 'blue', change: '+12%' },
            { label: 'Success Rate', value: `${stats.successRate.toFixed(1)}%`, icon: CheckCircle, color: 'teal', change: '+2.3%' },
            { label: 'Failed', value: stats.failedExecutions, icon: XCircle, color: 'red', change: '-5' },
            { label: 'Data Transferred', value: formatBytes(stats.totalDataTransferred), icon: Database, color: 'purple', change: '+8%' },
            { label: 'Total Nodes', value: stats.totalNodes, icon: Layers, color: 'amber', change: '+15' },
            { label: 'Connections', value: mockConnections.filter(c => c.status === 'connected').length, icon: Network, color: 'sky', change: '' },
          ].map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-lg bg-gradient-to-br from-${stat.color}-400 to-${stat.color}-600`}>
                    <stat.icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-xs text-gray-500 truncate">{stat.label}</span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
                  {stat.change && (
                    <span className={`text-xs ${stat.change.startsWith('+') ? 'text-green-600' : stat.change.startsWith('-') ? 'text-red-600' : 'text-gray-500'}`}>
                      {stat.change}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-white dark:bg-gray-800 p-1 shadow-sm">
              <TabsTrigger value="dashboard" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="scenarios" className="gap-2">
                <Workflow className="h-4 w-4" />
                Scenarios
              </TabsTrigger>
              <TabsTrigger value="executions" className="gap-2">
                <Activity className="h-4 w-4" />
                Executions
              </TabsTrigger>
              <TabsTrigger value="templates" className="gap-2">
                <Package className="h-4 w-4" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="connections" className="gap-2">
                <Network className="h-4 w-4" />
                Connections
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search scenarios..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="running">Running</option>
              </select>
            </div>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Dashboard Overview Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-xl p-6 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Automation Dashboard</h3>
                </div>
                <p className="text-white/80 mb-4 max-w-2xl">
                  Monitor your automation performance with real-time metrics, track executions, and optimize your workflows for maximum efficiency.
                </p>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <div className="text-xs text-white/70">Total Scenarios</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.active}</div>
                    <div className="text-xs text-white/70">Active</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.successRate.toFixed(0)}%</div>
                    <div className="text-xs text-white/70">Success Rate</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{formatBytes(stats.totalDataTransferred)}</div>
                    <div className="text-xs text-white/70">Data Processed</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-emerald-600" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Common automation tasks and operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all hover:scale-105" onClick={() => setShowNewWorkflow(true)}>
                    <Plus className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm">New Scenario</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all hover:scale-105" onClick={() => setShowRunAllDialog(true)}>
                    <Play className="h-5 w-5 text-blue-600" />
                    <span className="text-sm">Run All Active</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all hover:scale-105" onClick={() => setActiveTab('templates')}>
                    <Package className="h-5 w-5 text-purple-600" />
                    <span className="text-sm">Browse Templates</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all hover:scale-105" onClick={() => setShowWebhooksDialog(true)}>
                    <Webhook className="h-5 w-5 text-orange-600" />
                    <span className="text-sm">Manage Webhooks</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all hover:scale-105" onClick={() => setShowAIAutomationDialog(true)}>
                    <Bot className="h-5 w-5 text-pink-600" />
                    <span className="text-sm">AI Automation</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-all hover:scale-105" onClick={() => setActiveTab('connections')}>
                    <Network className="h-5 w-5 text-cyan-600" />
                    <span className="text-sm">Connections</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all hover:scale-105" onClick={() => setShowExportLogsDialog(true)}>
                    <Download className="h-5 w-5 text-amber-600" />
                    <span className="text-sm">Export Data</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all hover:scale-105" onClick={() => setActiveTab('executions')}>
                    <History className="h-5 w-5 text-red-600" />
                    <span className="text-sm">Execution History</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Scenarios */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-semibold">Active Scenarios</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('scenarios')}>View All</Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockScenarios.filter(s => s.status === 'active').slice(0, 4).map(scenario => (
                    <div key={scenario.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                          <Workflow className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{scenario.name}</p>
                          <p className="text-xs text-gray-500">{scenario.modules} modules • {scenario.interval}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-emerald-600">{scenario.operations.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">operations</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Executions */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-semibold">Recent Executions</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => { fetchWorkflows(); toast.success('Refreshed executions') }}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockExecutions.slice(0, 4).map(execution => (
                    <div key={execution.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          execution.status === 'success' ? 'bg-green-100 text-green-600' :
                          execution.status === 'running' ? 'bg-blue-100 text-blue-600' :
                          execution.status === 'failed' ? 'bg-red-100 text-red-600' :
                          'bg-amber-100 text-amber-600'
                        }`}>
                          {execution.status === 'success' ? <CheckCircle2 className="h-4 w-4" /> :
                           execution.status === 'running' ? <Activity className="h-4 w-4 animate-spin" /> :
                           execution.status === 'failed' ? <XCircle className="h-4 w-4" /> :
                           <Clock className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium">{execution.workflowName}</p>
                          <p className="text-xs text-gray-500">{execution.startedAt.toLocaleTimeString()}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(execution.status)}>{execution.status}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Usage Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Usage This Month</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Operations</span>
                      <span className="font-medium">5,240 / 10,000</span>
                    </div>
                    <Progress value={52.4} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Data Transfer</span>
                      <span className="font-medium">2.1 GB / 5 GB</span>
                    </div>
                    <Progress value={42} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Active Scenarios</span>
                      <span className="font-medium">8 / 15</span>
                    </div>
                    <Progress value={53.3} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Popular Templates */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-semibold">Popular Templates</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('templates')}>Browse All</Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockTemplates.slice(0, 3).map(template => (
                    <div key={template.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 text-purple-600 rounded-lg">
                          {template.icon}
                        </div>
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-xs text-gray-500">{template.uses.toLocaleString()} uses</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-medium">{template.rating}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Scenarios Tab */}
          <TabsContent value="scenarios" className="space-y-6">
            {/* Scenarios Overview Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-xl p-6 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <Workflow className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Automation Scenarios</h3>
                </div>
                <p className="text-white/80 mb-4 max-w-2xl">
                  Build and manage powerful automation workflows. Connect apps, set triggers, and automate complex business processes with visual flow builders.
                </p>
                <div className="flex items-center gap-4">
                  <Button className="bg-white text-blue-600 hover:bg-white/90" onClick={() => setShowNewWorkflow(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Scenario
                  </Button>
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={() => setActiveTab('templates')}>
                    <Package className="h-4 w-4 mr-2" />
                    Browse Templates
                  </Button>
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={() => setShowImportDialog(true)}>
                    <Download className="h-4 w-4 mr-2" />
                    Import Scenario
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Actions for Scenarios */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  Scenario Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all hover:scale-105" onClick={() => setShowRunAllDialog(true)}>
                    <PlayCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Run All Active</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all hover:scale-105" onClick={handlePauseAllWorkflows} disabled={isProcessing}>
                    <PauseCircle className="h-5 w-5 text-amber-600" />
                    <span className="text-sm">Pause All</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all hover:scale-105" onClick={() => setShowCloneDialog(true)}>
                    <Copy className="h-5 w-5 text-purple-600" />
                    <span className="text-sm">Clone Scenario</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all hover:scale-105" onClick={() => setShowShareDialog(true)}>
                    <Share2 className="h-5 w-5 text-blue-600" />
                    <span className="text-sm">Share Scenario</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {loading && (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div>
              </div>
            )}

            {filteredWorkflows.map(workflow => (
              <Card
                key={workflow.id}
                className="hover:shadow-md transition-all cursor-pointer group"
                onClick={() => setSelectedWorkflow(workflow)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getStatusColor(workflow.status)}>{workflow.status}</Badge>
                        <Badge variant="outline">{workflow.workflow_type}</Badge>
                        {workflow.is_published && (
                          <Badge variant="outline" className="gap-1">
                            <Share2 className="h-3 w-3" />
                            v{workflow.published_version}
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold mb-1">{workflow.workflow_name}</h3>
                      {workflow.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{workflow.description}</p>
                      )}
                      <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Layers className="h-4 w-4" />
                          {workflow.step_count} modules
                        </span>
                        <span className="flex items-center gap-1">
                          <Activity className="h-4 w-4" />
                          {workflow.total_executions.toLocaleString()} runs
                        </span>
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          {workflow.successful_executions} success
                        </span>
                        {workflow.avg_duration_seconds && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatDuration(workflow.avg_duration_seconds)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600"
                        title="Run automation"
                        onClick={(e) => { e.stopPropagation(); handleShowRunConfirm(workflow) }}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Edit automation"
                        onClick={(e) => { e.stopPropagation(); handleShowEditDialog(workflow) }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Duplicate automation"
                        onClick={(e) => { e.stopPropagation(); handleDuplicateAutomation(workflow) }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        title="Delete automation"
                        onClick={(e) => { e.stopPropagation(); handleShowDeleteConfirm(workflow) }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Executions Tab */}
          <TabsContent value="executions" className="space-y-6">
            {/* Executions Overview Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-xl p-6 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Execution History</h3>
                </div>
                <p className="text-white/80 mb-4 max-w-2xl">
                  Monitor all workflow executions in real-time. Track success rates, debug failures, and analyze performance metrics across your automations.
                </p>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.totalExecutions}</div>
                    <div className="text-xs text-white/70">Total Executions</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-200">{stats.successfulExecutions}</div>
                    <div className="text-xs text-white/70">Successful</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-red-200">{stats.failedExecutions}</div>
                    <div className="text-xs text-white/70">Failed</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{stats.running}</div>
                    <div className="text-xs text-white/70">Running Now</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Execution Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-600" />
                  Execution Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all hover:scale-105" onClick={handleStopAllRunning} disabled={isProcessing}>
                    <StopCircle className="h-5 w-5 text-red-600" />
                    <span className="text-sm">Stop All Running</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all hover:scale-105" onClick={handleRetryFailed} disabled={isProcessing}>
                    <RotateCcw className="h-5 w-5 text-amber-600" />
                    <span className="text-sm">Retry Failed</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all hover:scale-105" onClick={() => setShowExportLogsDialog(true)}>
                    <Download className="h-5 w-5 text-blue-600" />
                    <span className="text-sm">Export Logs</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all hover:scale-105" onClick={() => setShowFiltersDialog(true)}>
                    <Filter className="h-5 w-5 text-purple-600" />
                    <span className="text-sm">Advanced Filters</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Execution History</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => { fetchWorkflows(); toast.success('Refreshed execution history') }}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="divide-y dark:divide-gray-700">
                {mockExecutions.map(execution => (
                  <div
                    key={execution.id}
                    className="py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 -mx-6 px-6 cursor-pointer transition-all"
                    onClick={() => setSelectedExecution(execution)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        execution.status === 'success' ? 'bg-green-100 text-green-600' :
                        execution.status === 'running' ? 'bg-blue-100 text-blue-600' :
                        execution.status === 'failed' ? 'bg-red-100 text-red-600' :
                        execution.status === 'queued' ? 'bg-purple-100 text-purple-600' :
                        'bg-amber-100 text-amber-600'
                      }`}>
                        {execution.status === 'success' ? <CheckCircle2 className="h-5 w-5" /> :
                         execution.status === 'running' ? <Activity className="h-5 w-5 animate-spin" /> :
                         execution.status === 'failed' ? <XCircle className="h-5 w-5" /> :
                         execution.status === 'queued' ? <Clock className="h-5 w-5" /> :
                         <Clock className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-medium">{execution.workflowName}</p>
                        <p className="text-sm text-gray-500">
                          {execution.startedAt.toLocaleString()} • Triggered by {execution.triggeredBy}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-medium">{execution.nodesExecuted}/{execution.totalNodes} modules</p>
                        <Progress value={(execution.nodesExecuted / execution.totalNodes) * 100} className="w-24 h-1.5 mt-1" />
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatBytes(execution.dataProcessed)}</p>
                        <p className="text-xs text-gray-500">processed</p>
                      </div>
                      {execution.duration > 0 && (
                        <div className="text-sm text-gray-500 w-16 text-right">
                          {formatDuration(execution.duration)}
                        </div>
                      )}
                      <Badge className={getStatusColor(execution.status)}>{execution.status}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            {/* Templates Overview Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-xl p-6 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <Package className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Scenario Templates</h3>
                </div>
                <p className="text-white/80 mb-4 max-w-2xl">
                  Browse our library of pre-built automation templates. Start with community-proven workflows and customize them for your unique needs.
                </p>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{mockTemplates.length}</div>
                    <div className="text-xs text-white/70">Templates</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{mockTemplates.filter(t => t.isPremium).length}</div>
                    <div className="text-xs text-white/70">Premium</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">6</div>
                    <div className="text-xs text-white/70">Categories</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{mockTemplates.reduce((sum, t) => sum + t.uses, 0).toLocaleString()}</div>
                    <div className="text-xs text-white/70">Total Uses</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Template Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  Template Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all hover:scale-105" onClick={() => setTemplateFilterType('ai')}>
                    <Sparkles className="h-5 w-5 text-pink-600" />
                    <span className="text-sm">AI Templates</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all hover:scale-105" onClick={() => setTemplateFilterType('top_rated')}>
                    <Star className="h-5 w-5 text-purple-600" />
                    <span className="text-sm">Top Rated</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all hover:scale-105" onClick={() => setTemplateFilterType('popular')}>
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span className="text-sm">Most Popular</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all hover:scale-105" onClick={() => setShowSubmitTemplateDialog(true)}>
                    <Plus className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Submit Template</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Browse Templates</h2>
                <p className="text-gray-500">Start with pre-built automations from the community</p>
              </div>
              <select className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                <option>All Categories</option>
                <option>Sales</option>
                <option>Marketing</option>
                <option>AI</option>
                <option>Finance</option>
                <option>Productivity</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {mockTemplates.map(template => (
                <Card
                  key={template.id}
                  className="hover:shadow-md transition-all cursor-pointer group relative"
                  onClick={() => setSelectedTemplate(template)}
                >
                  {template.isPremium && (
                    <Badge className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                      <Star className="h-3 w-3 mr-1" /> Premium
                    </Badge>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 text-purple-600 rounded-lg">
                        {template.icon}
                      </div>
                      <Badge variant="secondary">{template.category}</Badge>
                    </div>
                    <h3 className="font-semibold mb-2">{template.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">{template.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t dark:border-gray-700">
                      <span className="text-xs text-gray-500">{template.nodes} modules</span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="text-xs font-medium">{template.rating}</span>
                        </div>
                        <span className="text-xs text-gray-500">({template.reviews})</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Connections Tab */}
          <TabsContent value="connections" className="space-y-6">
            {/* Connections Overview Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500 rounded-xl p-6 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <Network className="h-6 w-6" />
                  <h3 className="text-xl font-bold">App Connections</h3>
                </div>
                <p className="text-white/80 mb-4 max-w-2xl">
                  Manage your connected apps and API integrations. Connect to over 400+ apps and services to power your automations.
                </p>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{mockConnections.length}</div>
                    <div className="text-xs text-white/70">Connected</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-200">{mockConnections.filter(c => c.status === 'connected').length}</div>
                    <div className="text-xs text-white/70">Active</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-amber-200">{mockConnections.filter(c => c.status === 'expired').length}</div>
                    <div className="text-xs text-white/70">Expired</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{mockWebhooks.length}</div>
                    <div className="text-xs text-white/70">Webhooks</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Connection Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-cyan-600" />
                  Connection Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-all hover:scale-105" onClick={() => setShowNewConnectionDialog(true)}>
                    <Plus className="h-5 w-5 text-cyan-600" />
                    <span className="text-sm">New Connection</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all hover:scale-105" onClick={() => setShowNewWebhookDialog(true)}>
                    <Webhook className="h-5 w-5 text-blue-600" />
                    <span className="text-sm">New Webhook</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all hover:scale-105" onClick={handleRefreshExpiredConnections} disabled={isProcessing}>
                    <RefreshCw className="h-5 w-5 text-amber-600" />
                    <span className="text-sm">Refresh Expired</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all hover:scale-105" onClick={() => setShowAPIKeysDialog(true)}>
                    <Key className="h-5 w-5 text-purple-600" />
                    <span className="text-sm">API Keys</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Connected Apps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockConnections.map(connection => (
                    <div key={connection.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                            {connection.app.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{connection.name}</p>
                          <p className="text-xs text-gray-500">Last used {connection.lastUsed.toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">{connection.usageCount} uses</span>
                        <Badge className={getConnectionColor(connection.status)}>{connection.status}</Badge>
                        <Button variant="ghost" size="sm" onClick={() => {
                          toast.info('Connection settings - Feature coming soon')
                        }}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full mt-4" onClick={() => setShowNewConnectionDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Connection
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Webhook Endpoints</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockWebhooks.map(webhook => (
                    <div key={webhook.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={webhook.isActive ? 'default' : 'secondary'}>
                            {webhook.method}
                          </Badge>
                          <span className="font-medium">{webhook.name}</span>
                        </div>
                        <Switch checked={webhook.isActive} />
                      </div>
                      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded p-2 font-mono text-xs">
                        <code className="flex-1 truncate">{webhook.url}</code>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleCopyToClipboard(webhook.url, 'Webhook URL')}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {webhook.totalTriggers} triggers • Last: {webhook.lastTriggered?.toLocaleDateString() || 'Never'}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab - Comprehensive 6 Sub-tabs */}
          <TabsContent value="settings" className="space-y-6">
            {/* Settings Overview Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 rounded-xl p-6 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <Settings className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Automation Settings</h3>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-0">Pro Plan</Badge>
                </div>
                <p className="text-white/70 mb-4 max-w-2xl">
                  Configure your automation platform settings, execution preferences, webhooks, integrations, notifications, and advanced options.
                </p>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">5,240</div>
                    <div className="text-xs text-white/70">Operations Used</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">2.1 GB</div>
                    <div className="text-xs text-white/70">Data Transfer</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">8</div>
                    <div className="text-xs text-white/70">Active Scenarios</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{mockConnections.length}</div>
                    <div className="text-xs text-white/70">Connections</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Grid with Sidebar Navigation */}
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card>
                  <CardContent className="p-4">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', label: 'General', icon: Settings, description: 'Basic settings' },
                        { id: 'execution', label: 'Execution', icon: Play, description: 'Runtime options' },
                        { id: 'webhooks', label: 'Webhooks', icon: Webhook, description: 'HTTP endpoints' },
                        { id: 'integrations', label: 'Integrations', icon: Network, description: 'Connected apps' },
                        { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Alerts & digests' },
                        { id: 'advanced', label: 'Advanced', icon: Cpu, description: 'Power features' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all ${
                            settingsTab === item.id
                              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-l-4 border-emerald-500'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <item.icon className={`h-5 w-5 ${settingsTab === item.id ? 'text-emerald-600' : 'text-gray-400'}`} />
                          <div>
                            <p className="font-medium text-sm">{item.label}</p>
                            <p className="text-xs text-gray-500">{item.description}</p>
                          </div>
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
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="h-5 w-5 text-emerald-600" />
                          General Settings
                        </CardTitle>
                        <CardDescription>Configure basic automation preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium mb-2">Default Timezone</label>
                            <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                              <option>UTC</option>
                              <option>America/New_York</option>
                              <option>America/Los_Angeles</option>
                              <option>Europe/London</option>
                              <option>Asia/Tokyo</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Date Format</label>
                            <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                              <option>MM/DD/YYYY</option>
                              <option>DD/MM/YYYY</option>
                              <option>YYYY-MM-DD</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                              <p className="font-medium">Dark Mode</p>
                              <p className="text-sm text-gray-500">Use dark theme for the interface</p>
                            </div>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                              <p className="font-medium">Compact View</p>
                              <p className="text-sm text-gray-500">Show more items with less spacing</p>
                            </div>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                              <p className="font-medium">Auto-save Drafts</p>
                              <p className="text-sm text-gray-500">Automatically save scenario changes</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Rocket className="h-5 w-5 text-purple-600" />
                          Plan & Usage
                        </CardTitle>
                        <CardDescription>Your current subscription and usage</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg text-white">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">Pro Plan</span>
                            <Badge className="bg-white/20 text-white border-0">Active</Badge>
                          </div>
                          <p className="text-sm text-white/80">10,000 operations/month • 5 GB data • 15 active scenarios</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Operations</span>
                              <span className="font-medium">5,240 / 10,000</span>
                            </div>
                            <Progress value={52.4} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Data Transfer</span>
                              <span className="font-medium">2.1 GB / 5 GB</span>
                            </div>
                            <Progress value={42} className="h-2" />
                          </div>
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => setShowUpgradePlanDialog(true)}>
                          <Rocket className="h-4 w-4 mr-2" />
                          Upgrade Plan
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Execution Settings */}
                {settingsTab === 'execution' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Play className="h-5 w-5 text-blue-600" />
                          Execution Settings
                        </CardTitle>
                        <CardDescription>Configure how your automations run</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                              <p className="font-medium">Auto-retry Failed Executions</p>
                              <p className="text-sm text-gray-500">Automatically retry up to 3 times on failure</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                              <p className="font-medium">Parallel Execution</p>
                              <p className="text-sm text-gray-500">Run independent branches simultaneously</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                              <p className="font-medium">Sequential Processing</p>
                              <p className="text-sm text-gray-500">Process items one at a time instead of batches</p>
                            </div>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                              <p className="font-medium">Detailed Logging</p>
                              <p className="text-sm text-gray-500">Store detailed execution logs for debugging</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Default Timeout</label>
                            <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                              <option>30 seconds</option>
                              <option>1 minute</option>
                              <option>5 minutes</option>
                              <option>10 minutes</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Retry Delay</label>
                            <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                              <option>1 second</option>
                              <option>5 seconds</option>
                              <option>10 seconds</option>
                              <option>30 seconds</option>
                            </select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Gauge className="h-5 w-5 text-amber-600" />
                          Rate Limits
                        </CardTitle>
                        <CardDescription>Control execution frequency</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Max Concurrent Executions</label>
                            <Input type="number" defaultValue="10" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Max Executions per Hour</label>
                            <Input type="number" defaultValue="100" />
                          </div>
                        </div>
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm font-medium">Setting limits too low may cause delays in execution</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Webhooks Settings */}
                {settingsTab === 'webhooks' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Webhook className="h-5 w-5 text-orange-600" />
                          Webhook Endpoints
                        </CardTitle>
                        <CardDescription>Manage your webhook URLs and triggers</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {mockWebhooks.map(webhook => (
                          <div key={webhook.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge variant={webhook.isActive ? 'default' : 'secondary'}>{webhook.method}</Badge>
                                <span className="font-medium">{webhook.name}</span>
                              </div>
                              <Switch checked={webhook.isActive} />
                            </div>
                            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded p-2 font-mono text-xs">
                              <code className="flex-1 truncate">{webhook.url}</code>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleCopyToClipboard(webhook.url, 'Webhook URL')}>
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                              <span>Linked to: {webhook.scenarioName}</span>
                              <span>{webhook.totalTriggers} triggers • Last: {webhook.lastTriggered?.toLocaleDateString() || 'Never'}</span>
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full" onClick={() => setShowNewWebhookDialog(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create New Webhook
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-green-600" />
                          Webhook Security
                        </CardTitle>
                        <CardDescription>Secure your webhook endpoints</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Signature Verification</p>
                            <p className="text-sm text-gray-500">Validate webhook payloads with HMAC signatures</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">IP Whitelist</p>
                            <p className="text-sm text-gray-500">Only accept webhooks from specific IPs</p>
                          </div>
                          <Switch />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Webhook Secret</label>
                          <div className="flex gap-2">
                            <Input type="password" defaultValue="whsec_••••••••••••••••" className="flex-1" />
                            <Button variant="outline" onClick={handleRegenerateAPIKey}>
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </div>
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
                        <CardTitle className="flex items-center gap-2">
                          <Network className="h-5 w-5 text-cyan-600" />
                          Connected Apps
                        </CardTitle>
                        <CardDescription>Manage your app connections</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {mockConnections.map(connection => (
                          <div key={connection.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                                  {connection.app.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{connection.name}</p>
                                <p className="text-xs text-gray-500">Last used {connection.lastUsed.toLocaleDateString()} • {connection.usageCount} uses</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className={getConnectionColor(connection.status)}>{connection.status}</Badge>
                              <Button variant="ghost" size="sm" onClick={() => {
                                toast.info('Connection settings - Feature coming soon')
                              }}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" className="w-full" onClick={() => setShowNewConnectionDialog(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add New Connection
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="h-5 w-5 text-purple-600" />
                          API Access
                        </CardTitle>
                        <CardDescription>Manage API keys and access tokens</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Primary API Key</span>
                            <Button variant="ghost" size="sm" onClick={() => handleCopyToClipboard('mk_live_••••••••••••••••••••••••', 'API Key')}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <code className="text-sm text-gray-600 dark:text-gray-400">mk_live_••••••••••••••••••••••••</code>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1" onClick={handleRegenerateAPIKey} disabled={isProcessing}>
                            <Key className="h-4 w-4 mr-2" />
                            Regenerate Key
                          </Button>
                          <Button variant="outline" className="flex-1" onClick={() => window.open('/docs/api', '_blank')}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            API Documentation
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Notifications Settings */}
                {settingsTab === 'notifications' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="h-5 w-5 text-red-600" />
                          Email Notifications
                        </CardTitle>
                        <CardDescription>Configure email alerts and digests</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Execution Failures</p>
                            <p className="text-sm text-gray-500">Get notified when a scenario fails</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Connection Expired</p>
                            <p className="text-sm text-gray-500">Alert when app connections need refresh</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Usage Alerts</p>
                            <p className="text-sm text-gray-500">Notify at 80% and 100% of quota</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Daily Digest</p>
                            <p className="text-sm text-gray-500">Daily summary of all executions</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Weekly Report</p>
                            <p className="text-sm text-gray-500">Weekly automation performance report</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MessageSquare className="h-5 w-5 text-blue-600" />
                          Slack Notifications
                        </CardTitle>
                        <CardDescription>Send alerts to Slack channels</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Enable Slack Notifications</p>
                            <p className="text-sm text-gray-500">Send alerts to connected Slack workspace</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Default Channel</label>
                          <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                            <option>#automations</option>
                            <option>#alerts</option>
                            <option>#general</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Thread Replies</p>
                            <p className="text-sm text-gray-500">Group related notifications in threads</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Advanced Settings */}
                {settingsTab === 'advanced' && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Cpu className="h-5 w-5 text-indigo-600" />
                          Advanced Options
                        </CardTitle>
                        <CardDescription>Power user features and configurations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Debug Mode</p>
                            <p className="text-sm text-gray-500">Enable verbose logging for troubleshooting</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Beta Features</p>
                            <p className="text-sm text-gray-500">Access experimental features early</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Custom Functions</p>
                            <p className="text-sm text-gray-500">Enable JavaScript code execution in scenarios</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">Data Encryption</p>
                            <p className="text-sm text-gray-500">Encrypt sensitive data at rest</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Download className="h-5 w-5 text-green-600" />
                          Data Export
                        </CardTitle>
                        <CardDescription>Export your automation data</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={handleExportScenarios}>
                            <FileText className="h-5 w-5 text-blue-600" />
                            <span>Export Scenarios</span>
                            <span className="text-xs text-gray-500">JSON format</span>
                          </Button>
                          <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={() => setShowExportLogsDialog(true)}>
                            <Activity className="h-5 w-5 text-green-600" />
                            <span>Export Logs</span>
                            <span className="text-xs text-gray-500">CSV format</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <AlertTriangle className="h-5 w-5" />
                          Danger Zone
                        </CardTitle>
                        <CardDescription>Irreversible actions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-red-600">Delete All Scenarios</p>
                              <p className="text-sm text-gray-500">Remove all scenarios and their data</p>
                            </div>
                            <Button variant="destructive" size="sm" onClick={() => setShowDeleteAllDialog(true)}>Delete</Button>
                          </div>
                        </div>
                        <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-red-600">Clear Execution History</p>
                              <p className="text-sm text-gray-500">Remove all past execution logs</p>
                            </div>
                            <Button variant="destructive" size="sm" onClick={() => setShowClearHistoryDialog(true)}>Clear</Button>
                          </div>
                        </div>
                        <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-red-600">Delete Account</p>
                              <p className="text-sm text-gray-500">Permanently remove your account</p>
                            </div>
                            <Button variant="destructive" size="sm" onClick={() => setShowDeleteAccountDialog(true)}>Delete</Button>
                          </div>
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
              insights={mockAutomationsAIInsights}
              title="Automation Intelligence"
              onInsightAction={(insight) => handleInsightAction(insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockAutomationsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockAutomationsPredictions}
              title="Automation Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockAutomationsActivities}
            title="Automation Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={automationsQuickActions}
            variant="grid"
          />
        </div>

        {/* Workflow Detail Modal */}
        {selectedWorkflow && (
          <Dialog open={!!selectedWorkflow} onOpenChange={() => setSelectedWorkflow(null)}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                    <Workflow className="h-6 w-6" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl">{selectedWorkflow.workflow_name}</DialogTitle>
                    <p className="text-gray-500">{selectedWorkflow.description}</p>
                  </div>
                </div>
              </DialogHeader>
              <ScrollArea className="h-[500px] mt-4">
                <Tabs defaultValue="overview">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="executions">Executions</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                    <TabsTrigger value="versions">Versions</TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview" className="mt-4 space-y-6">
                    <div className="grid grid-cols-4 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                        <div className="text-2xl font-bold text-emerald-600">{selectedWorkflow.step_count}</div>
                        <p className="text-xs text-gray-500">Modules</p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">{selectedWorkflow.total_executions}</div>
                        <p className="text-xs text-gray-500">Executions</p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {selectedWorkflow.total_executions > 0
                            ? ((selectedWorkflow.successful_executions / selectedWorkflow.total_executions) * 100).toFixed(0)
                            : 0}%
                        </div>
                        <p className="text-xs text-gray-500">Success Rate</p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-600">{selectedWorkflow.avg_duration_seconds?.toFixed(1) || 0}s</div>
                        <p className="text-xs text-gray-500">Avg Duration</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                      <h4 className="font-medium mb-4">Visual Workflow Builder</h4>
                      <div className="h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                        <div className="text-center">
                          <Workflow className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">Drag and drop modules to build</p>
                          <Button className="mt-3" onClick={() => { setSelectedWorkflow(null); setShowEditorDialog(true); toast.success('Opening workflow editor') }}>Open Editor</Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="executions" className="mt-4 space-y-2">
                    {mockExecutions.slice(0, 5).map(exec => (
                      <div key={exec.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          {exec.status === 'success' ? <CheckCircle2 className="h-5 w-5 text-green-600" /> :
                           exec.status === 'failed' ? <XCircle className="h-5 w-5 text-red-600" /> :
                           <Activity className="h-5 w-5 text-blue-600 animate-spin" />}
                          <div>
                            <p className="font-medium">{exec.startedAt.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">{exec.nodesExecuted}/{exec.totalNodes} modules</p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{formatDuration(exec.duration)}</span>
                      </div>
                    ))}
                  </TabsContent>
                  <TabsContent value="settings" className="mt-4 space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">Enable Scenario</span>
                          <p className="text-sm text-gray-500">Turn on/off this automation</p>
                        </div>
                        <Switch defaultChecked={selectedWorkflow.is_enabled} />
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">Error Notifications</span>
                          <p className="text-sm text-gray-500">Get notified when scenario fails</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="versions" className="mt-4 space-y-2">
                    <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center gap-3">
                        <History className="h-5 w-5 text-emerald-600" />
                        <div>
                          <p className="font-medium">v{selectedWorkflow.published_version || 1}</p>
                          <p className="text-xs text-gray-500">Current version</p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <History className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium">v{(selectedWorkflow.published_version || 1) - 1 || 0}</p>
                          <p className="text-xs text-gray-500">2 days ago</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleRestoreVersion(selectedWorkflow, (selectedWorkflow.published_version || 1) - 1)}>Restore</Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}

        {/* Execution Detail Modal */}
        {selectedExecution && (
          <Dialog open={!!selectedExecution} onOpenChange={() => setSelectedExecution(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Execution Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${getStatusColor(selectedExecution.status)}`}>
                    {selectedExecution.status === 'success' ? <CheckCircle2 className="h-6 w-6" /> :
                     selectedExecution.status === 'failed' ? <XCircle className="h-6 w-6" /> :
                     <Activity className="h-6 w-6" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{selectedExecution.workflowName}</h3>
                    <p className="text-gray-500">{selectedExecution.startedAt.toLocaleString()}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="text-xl font-bold">{formatDuration(selectedExecution.duration)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Data Processed</p>
                    <p className="text-xl font-bold">{formatBytes(selectedExecution.dataProcessed)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Modules Executed</p>
                    <p className="text-xl font-bold">{selectedExecution.nodesExecuted}/{selectedExecution.totalNodes}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Triggered By</p>
                    <p className="text-xl font-bold">{selectedExecution.triggeredBy}</p>
                  </div>
                </div>
                {selectedExecution.errorMessage && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="font-medium text-red-600">Error</p>
                    <p className="text-sm text-red-700 dark:text-red-400">{selectedExecution.errorMessage}</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => handleRetryExecution(selectedExecution)} disabled={isProcessing}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => { setSelectedExecution(null); setShowViewLogsDialog(true); }}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Logs
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Template Detail Modal */}
        {selectedTemplate && (
          <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 text-purple-600 rounded-xl">
                    {selectedTemplate.icon}
                  </div>
                  <div>
                    <DialogTitle className="text-xl">{selectedTemplate.name}</DialogTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{selectedTemplate.category}</Badge>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-medium">{selectedTemplate.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <p className="text-gray-600 dark:text-gray-400">{selectedTemplate.description}</p>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.tags.map(tag => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-2xl font-bold text-emerald-600">{selectedTemplate.nodes}</p>
                    <p className="text-xs text-gray-500">Modules</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-600">{selectedTemplate.uses.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Uses</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-2xl font-bold text-purple-600">{selectedTemplate.reviews}</p>
                    <p className="text-xs text-gray-500">Reviews</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => handleUseTemplate(selectedTemplate)} disabled={isProcessing}>
                    <Plus className="h-4 w-4 mr-2" />
                    Use This Template
                  </Button>
                  <Button variant="outline" onClick={() => setShowPreviewTemplateDialog(true)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Run All Workflows Dialog */}
        <Dialog open={showRunAllDialog} onOpenChange={setShowRunAllDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-blue-600" />
                Run All Workflows
              </DialogTitle>
              <DialogDescription>
                Configure and execute multiple workflows at once
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <Activity className="h-5 w-5" />
                  <span className="font-medium">
                    {displayWorkflows.filter(w => w.status === 'active').length} active workflows will be executed
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="includeInactive">Include inactive workflows</Label>
                    <p className="text-xs text-gray-500">Run paused and draft workflows too</p>
                  </div>
                  <Switch
                    id="includeInactive"
                    checked={runAllConfig.includeInactive}
                    onCheckedChange={(checked) => setRunAllConfig(prev => ({ ...prev, includeInactive: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="skipFailed">Skip previously failed</Label>
                    <p className="text-xs text-gray-500">Exclude workflows with error status</p>
                  </div>
                  <Switch
                    id="skipFailed"
                    checked={runAllConfig.skipFailed}
                    onCheckedChange={(checked) => setRunAllConfig(prev => ({ ...prev, skipFailed: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="parallelExecution">Parallel execution</Label>
                    <p className="text-xs text-gray-500">Run all workflows simultaneously</p>
                  </div>
                  <Switch
                    id="parallelExecution"
                    checked={runAllConfig.parallelExecution}
                    onCheckedChange={(checked) => setRunAllConfig(prev => ({ ...prev, parallelExecution: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifyOnComplete">Notify on completion</Label>
                    <p className="text-xs text-gray-500">Send notification when all finish</p>
                  </div>
                  <Switch
                    id="notifyOnComplete"
                    checked={runAllConfig.notifyOnComplete}
                    onCheckedChange={(checked) => setRunAllConfig(prev => ({ ...prev, notifyOnComplete: checked }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRunAllDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleRunAllWorkflows} disabled={isRunningAll} className="bg-blue-600 hover:bg-blue-700">
                {isRunningAll ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run All
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Logs Dialog */}
        <Dialog open={showExportLogsDialog} onOpenChange={setShowExportLogsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-green-600" />
                Export Automation Logs
              </DialogTitle>
              <DialogDescription>
                Download workflow execution logs and statistics
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="exportFormat">Export Format</Label>
                <select
                  id="exportFormat"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                  value={exportLogsConfig.format}
                  onChange={(e) => setExportLogsConfig(prev => ({ ...prev, format: e.target.value as 'json' | 'csv' | 'pdf' }))}
                >
                  <option value="json">JSON - Full data with metadata</option>
                  <option value="csv">CSV - Spreadsheet compatible</option>
                  <option value="pdf">PDF - Printable report</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateRange">Date Range</Label>
                <select
                  id="dateRange"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                  value={exportLogsConfig.dateRange}
                  onChange={(e) => setExportLogsConfig(prev => ({ ...prev, dateRange: e.target.value as '24hours' | '7days' | '30days' | 'all' }))}
                >
                  <option value="24hours">Last 24 hours</option>
                  <option value="7days">Last 7 days</option>
                  <option value="30days">Last 30 days</option>
                  <option value="all">All time</option>
                </select>
              </div>

              <div className="space-y-3 pt-2">
                <Label>Include in Export</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeSuccessful"
                      checked={exportLogsConfig.includeSuccessful}
                      onCheckedChange={(checked) => setExportLogsConfig(prev => ({ ...prev, includeSuccessful: checked as boolean }))}
                    />
                    <label htmlFor="includeSuccessful" className="text-sm cursor-pointer">
                      Successful executions
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeFailed"
                      checked={exportLogsConfig.includeFailed}
                      onCheckedChange={(checked) => setExportLogsConfig(prev => ({ ...prev, includeFailed: checked as boolean }))}
                    />
                    <label htmlFor="includeFailed" className="text-sm cursor-pointer">
                      Failed executions
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeMetadata"
                      checked={exportLogsConfig.includeMetadata}
                      onCheckedChange={(checked) => setExportLogsConfig(prev => ({ ...prev, includeMetadata: checked as boolean }))}
                    />
                    <label htmlFor="includeMetadata" className="text-sm cursor-pointer">
                      Workflow metadata (type, steps, version)
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>
                    Estimated: {displayWorkflows.length} workflows, {mockExecutions.length} execution records
                  </span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportLogsDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleExportLogs} disabled={isExporting} className="bg-green-600 hover:bg-green-700">
                {isExporting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export Logs
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Webhooks Management Dialog */}
        <Dialog open={showWebhooksDialog} onOpenChange={setShowWebhooksDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5 text-orange-600" />
                Manage Webhooks
              </DialogTitle>
              <DialogDescription>
                Configure and monitor your webhook endpoints
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              {mockWebhooks.map(webhook => (
                <div key={webhook.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={webhook.isActive ? 'default' : 'secondary'}>{webhook.method}</Badge>
                      <span className="font-medium">{webhook.name}</span>
                    </div>
                    <Switch checked={webhook.isActive} />
                  </div>
                  <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded p-2 font-mono text-xs">
                    <code className="flex-1 truncate">{webhook.url}</code>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleCopyToClipboard(webhook.url, 'Webhook URL')}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {webhook.totalTriggers} triggers - Last: {webhook.lastTriggered?.toLocaleDateString() || 'Never'}
                  </p>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowWebhooksDialog(false)}>
                Close
              </Button>
              <Button onClick={() => { setShowWebhooksDialog(false); setShowNewWebhookDialog(true); }} className="bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                New Webhook
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* AI Automation Dialog */}
        <Dialog open={showAIAutomationDialog} onOpenChange={setShowAIAutomationDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-pink-600" />
                AI Automation Builder
              </DialogTitle>
              <DialogDescription>
                Describe what you want to automate and let AI build it for you
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium mb-2">Describe your automation</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 min-h-[120px]"
                  placeholder="e.g., When a new email arrives with an attachment, save it to Google Drive and notify me on Slack..."
                />
              </div>
              <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                <div className="flex items-center gap-2 text-pink-700 dark:text-pink-400 mb-2">
                  <Sparkles className="h-4 w-4" />
                  <span className="font-medium">AI Suggestions</span>
                </div>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <li>- Email to Google Drive automation</li>
                  <li>- New Lead notification workflow</li>
                  <li>- Social media posting scheduler</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAIAutomationDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => { toast.success('AI is building your automation...', { description: 'This may take a moment' }); setShowAIAutomationDialog(false); }} className="bg-pink-600 hover:bg-pink-700">
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Automation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Import Scenario Dialog */}
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-blue-600" />
                Import Scenario
              </DialogTitle>
              <DialogDescription>
                Import automation scenarios from JSON files
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="font-medium mb-1">Drop your scenario file here</p>
                <p className="text-sm text-gray-500 mb-4">Supports .json exports from Make, Zapier, n8n</p>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="import-dialog-file-input"
                />
                <Button variant="outline" onClick={() => document.getElementById('import-dialog-file-input')?.click()}>Browse Files</Button>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Or paste JSON content</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg font-mono text-sm dark:bg-gray-800 dark:border-gray-700"
                  rows={6}
                  placeholder='{"name": "My Workflow", "steps": [...]}'
                  value={importJsonContent}
                  onChange={(e) => setImportJsonContent(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowImportDialog(false); setImportJsonContent(''); }}>
                Cancel
              </Button>
              <Button onClick={handleImportScenario} disabled={isProcessing || !importJsonContent.trim()} className="bg-blue-600 hover:bg-blue-700">
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Import
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Clone Scenario Dialog */}
        <Dialog open={showCloneDialog} onOpenChange={setShowCloneDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Copy className="h-5 w-5 text-purple-600" />
                Clone Scenario
              </DialogTitle>
              <DialogDescription>
                Select a scenario to duplicate
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-4 max-h-[50vh] overflow-y-auto">
              {displayWorkflows.map(workflow => (
                <div
                  key={workflow.id}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedCloneWorkflow?.id === workflow.id
                      ? 'bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-500'
                      : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setSelectedCloneWorkflow(workflow)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Workflow className="h-4 w-4 text-emerald-600" />
                      <span className="font-medium">{workflow.workflow_name}</span>
                    </div>
                    <Badge className={getStatusColor(workflow.status)}>{workflow.status}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{workflow.step_count} steps</p>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowCloneDialog(false); setSelectedCloneWorkflow(null); }}>
                Cancel
              </Button>
              <Button onClick={handleCloneWorkflow} disabled={isProcessing || !selectedCloneWorkflow} className="bg-purple-600 hover:bg-purple-700">
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Cloning...
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Clone Selected
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Share Scenario Dialog */}
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5 text-blue-600" />
                Share Scenario
              </DialogTitle>
              <DialogDescription>
                Generate a shareable link for your automation
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <label className="block text-sm font-medium mb-2">Share Settings</label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Allow viewing</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Allow cloning</span>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Require authentication</span>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowShareDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleShareWorkflow} disabled={isProcessing} className="bg-blue-600 hover:bg-blue-700">
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 mr-2" />
                    Generate Link
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Advanced Filters Dialog */}
        <Dialog open={showFiltersDialog} onOpenChange={setShowFiltersDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-purple-600" />
                Advanced Filters
              </DialogTitle>
              <DialogDescription>
                Filter execution history by specific criteria
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                  <option>All Statuses</option>
                  <option>Success</option>
                  <option>Failed</option>
                  <option>Running</option>
                  <option>Queued</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date Range</label>
                <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                  <option>Last 24 hours</option>
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>All time</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Trigger Type</label>
                <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                  <option>All Triggers</option>
                  <option>Webhook</option>
                  <option>Schedule</option>
                  <option>Manual</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowFiltersDialog(false)}>
                Reset
              </Button>
              <Button onClick={() => { toast.success('Filters applied'); setShowFiltersDialog(false); }} className="bg-purple-600 hover:bg-purple-700">
                Apply Filters
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Connection Dialog */}
        <Dialog open={showNewConnectionDialog} onOpenChange={setShowNewConnectionDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Network className="h-5 w-5 text-cyan-600" />
                Add New Connection
              </DialogTitle>
              <DialogDescription>
                Connect a new app or service
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium mb-2">Connection Name</label>
                <Input
                  placeholder="My Gmail Connection"
                  value={newConnectionForm.name}
                  onChange={(e) => setNewConnectionForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">App / Service</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                  value={newConnectionForm.app}
                  onChange={(e) => setNewConnectionForm(prev => ({ ...prev, app: e.target.value }))}
                >
                  <option value="">Select an app...</option>
                  <option value="gmail">Gmail</option>
                  <option value="slack">Slack</option>
                  <option value="notion">Notion</option>
                  <option value="drive">Google Drive</option>
                  <option value="sheets">Google Sheets</option>
                  <option value="airtable">Airtable</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">API Key (optional)</label>
                <Input
                  type="password"
                  placeholder="Enter API key or connect via OAuth"
                  value={newConnectionForm.apiKey}
                  onChange={(e) => setNewConnectionForm(prev => ({ ...prev, apiKey: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowNewConnectionDialog(false); setNewConnectionForm({ name: '', app: '', apiKey: '' }); }}>
                Cancel
              </Button>
              <Button onClick={handleCreateConnection} disabled={isProcessing} className="bg-cyan-600 hover:bg-cyan-700">
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Connect
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Webhook Dialog */}
        <Dialog open={showNewWebhookDialog} onOpenChange={setShowNewWebhookDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5 text-orange-600" />
                Create New Webhook
              </DialogTitle>
              <DialogDescription>
                Set up a new webhook endpoint
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium mb-2">Webhook Name</label>
                <Input
                  placeholder="My Webhook"
                  value={newWebhookForm.name}
                  onChange={(e) => setNewWebhookForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">HTTP Method</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                  value={newWebhookForm.method}
                  onChange={(e) => setNewWebhookForm(prev => ({ ...prev, method: e.target.value as any }))}
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Link to Scenario (optional)</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                  value={newWebhookForm.scenarioId}
                  onChange={(e) => setNewWebhookForm(prev => ({ ...prev, scenarioId: e.target.value }))}
                >
                  <option value="">Select a scenario...</option>
                  {displayWorkflows.map(w => (
                    <option key={w.id} value={w.id}>{w.workflow_name}</option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowNewWebhookDialog(false); setNewWebhookForm({ name: '', method: 'POST', scenarioId: '' }); }}>
                Cancel
              </Button>
              <Button onClick={handleCreateWebhook} disabled={isProcessing} className="bg-orange-600 hover:bg-orange-700">
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Webhook
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* API Keys Dialog */}
        <Dialog open={showAPIKeysDialog} onOpenChange={setShowAPIKeysDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-purple-600" />
                API Keys Management
              </DialogTitle>
              <DialogDescription>
                Manage your API keys and access tokens
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Primary API Key</span>
                  <Badge className="bg-green-100 text-green-700">Active</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm text-gray-600 dark:text-gray-400 truncate">mk_live_a1b2c3d4e5f6g7h8i9j0...</code>
                  <Button variant="ghost" size="sm" onClick={() => handleCopyToClipboard('mk_live_a1b2c3d4e5f6g7h8i9j0', 'API Key')}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Created: Dec 15, 2024 - Last used: Today</p>
              </div>
              <div className="p-4 border-2 border-dashed rounded-lg text-center">
                <Key className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Need another API key?</p>
                <Button variant="outline" className="mt-2" onClick={() => {
                  toast.loading('Creating API key...', { id: 'create-api-key' })
                  setTimeout(() => {
                    toast.success('New API key created!', { id: 'create-api-key' })
                  }, 1000)
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Key
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAPIKeysDialog(false)}>
                Close
              </Button>
              <Button onClick={handleRegenerateAPIKey} disabled={isProcessing} className="bg-purple-600 hover:bg-purple-700">
                Regenerate Primary Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Submit Template Dialog */}
        <Dialog open={showSubmitTemplateDialog} onOpenChange={setShowSubmitTemplateDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-green-600" />
                Submit Template
              </DialogTitle>
              <DialogDescription>
                Share your automation with the community
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium mb-2">Template Name</label>
                <Input
                  placeholder="Email to Spreadsheet Sync"
                  value={submitTemplateForm.name}
                  onChange={(e) => setSubmitTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                  rows={3}
                  placeholder="Describe what this template does..."
                  value={submitTemplateForm.description}
                  onChange={(e) => setSubmitTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                  value={submitTemplateForm.category}
                  onChange={(e) => setSubmitTemplateForm(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option>Productivity</option>
                  <option>Sales</option>
                  <option>Marketing</option>
                  <option>Finance</option>
                  <option>AI</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowSubmitTemplateDialog(false); setSubmitTemplateForm({ name: '', description: '', category: 'Productivity' }); }}>
                Cancel
              </Button>
              <Button onClick={handleSubmitTemplate} disabled={isProcessing} className="bg-green-600 hover:bg-green-700">
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Submit
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete All Scenarios Dialog */}
        <Dialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Delete All Scenarios
              </DialogTitle>
              <DialogDescription>
                This action cannot be undone. All your scenarios and their data will be permanently deleted.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-400">
                  You are about to delete {displayWorkflows.length} scenarios. This will remove all workflow configurations, execution history, and associated data.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteAllDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteAllScenarios} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete All Scenarios'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Clear History Dialog */}
        <Dialog open={showClearHistoryDialog} onOpenChange={setShowClearHistoryDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Clear Execution History
              </DialogTitle>
              <DialogDescription>
                This will remove all past execution logs and reset statistics.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  All execution counts, duration statistics, and log entries will be permanently cleared. Your scenarios will remain intact.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowClearHistoryDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleClearExecutionHistory} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  'Clear History'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Account Dialog */}
        <Dialog open={showDeleteAccountDialog} onOpenChange={setShowDeleteAccountDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Delete Account
              </DialogTitle>
              <DialogDescription>
                This action is irreversible and will permanently delete your account.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-400 mb-3">
                  Deleting your account will:
                </p>
                <ul className="text-sm text-red-700 dark:text-red-400 space-y-1 list-disc list-inside">
                  <li>Remove all your scenarios and workflows</li>
                  <li>Delete all execution history</li>
                  <li>Revoke all API keys and connections</li>
                  <li>Cancel any active subscriptions</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteAccountDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => {
                if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                  /* TODO: Implement account deletion API call */
                  setShowDeleteAccountDialog(false);
                }
              }}>
                Delete Account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Logs Dialog */}
        <Dialog open={showViewLogsDialog} onOpenChange={setShowViewLogsDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Execution Logs
              </DialogTitle>
              <DialogDescription>
                Detailed execution logs and debug information
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[50vh] mt-4">
              <div className="space-y-2 font-mono text-xs">
                {[
                  { time: '10:30:45.123', level: 'INFO', message: 'Workflow execution started' },
                  { time: '10:30:45.234', level: 'DEBUG', message: 'Loading trigger configuration...' },
                  { time: '10:30:45.456', level: 'INFO', message: 'Trigger: Webhook received POST request' },
                  { time: '10:30:45.678', level: 'DEBUG', message: 'Parsing request body (1.2KB)' },
                  { time: '10:30:45.890', level: 'INFO', message: 'Step 1: Filter - Processing 15 items' },
                  { time: '10:30:46.123', level: 'INFO', message: 'Step 1: Complete - 12 items passed filter' },
                  { time: '10:30:46.456', level: 'INFO', message: 'Step 2: Transform - Mapping data' },
                  { time: '10:30:46.789', level: 'DEBUG', message: 'Applying transformation rules...' },
                  { time: '10:30:47.012', level: 'INFO', message: 'Step 2: Complete - 12 items transformed' },
                  { time: '10:30:47.234', level: 'INFO', message: 'Step 3: HTTP Request - Sending to API' },
                  { time: '10:30:48.567', level: 'INFO', message: 'Step 3: Complete - Status 200 OK' },
                  { time: '10:30:48.789', level: 'INFO', message: 'Workflow execution completed successfully' },
                  { time: '10:30:48.890', level: 'DEBUG', message: 'Total duration: 3.767s, Data: 4.5KB' },
                ].map((log, i) => (
                  <div key={i} className={`p-2 rounded ${
                    log.level === 'ERROR' ? 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                    log.level === 'WARN' ? 'bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                    log.level === 'DEBUG' ? 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400' :
                    'bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                  }`}>
                    <span className="text-gray-500">[{log.time}]</span>
                    <span className={`font-medium ml-2 ${
                      log.level === 'ERROR' ? 'text-red-600' :
                      log.level === 'WARN' ? 'text-amber-600' :
                      log.level === 'DEBUG' ? 'text-gray-500' :
                      'text-blue-600'
                    }`}>[{log.level}]</span>
                    <span className="ml-2">{log.message}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowViewLogsDialog(false)}>
                Close
              </Button>
              <Button onClick={() => { handleCopyToClipboard('Execution logs copied', 'Logs'); }} className="bg-blue-600 hover:bg-blue-700">
                <Copy className="h-4 w-4 mr-2" />
                Copy Logs
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Template Dialog */}
        <Dialog open={showPreviewTemplateDialog} onOpenChange={setShowPreviewTemplateDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-purple-600" />
                Template Preview
              </DialogTitle>
              <DialogDescription>
                {selectedTemplate?.name || 'Template'} workflow structure
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[50vh] mt-4">
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-medium mb-3">Workflow Steps</h4>
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map(step => (
                      <div key={step} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-medium">
                          {step}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">
                            {step === 1 ? 'Trigger: Webhook' :
                             step === 2 ? 'Filter Data' :
                             step === 3 ? 'Transform' :
                             'Send to API'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {step === 1 ? 'Receives incoming HTTP requests' :
                             step === 2 ? 'Filters items based on conditions' :
                             step === 3 ? 'Maps and transforms data structure' :
                             'Sends processed data to external service'}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-medium mb-2">Required Connections</h4>
                  <div className="flex gap-2">
                    <Badge>Gmail</Badge>
                    <Badge>Google Sheets</Badge>
                    <Badge>Slack</Badge>
                  </div>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPreviewTemplateDialog(false)}>
                Close
              </Button>
              {selectedTemplate && (
                <Button onClick={() => { setShowPreviewTemplateDialog(false); handleUseTemplate(selectedTemplate); }} className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Use Template
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Upgrade Plan Dialog */}
        <Dialog open={showUpgradePlanDialog} onOpenChange={setShowUpgradePlanDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-purple-600" />
                Upgrade Your Plan
              </DialogTitle>
              <DialogDescription>
                Unlock more automation power with a premium plan
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg hover:border-gray-400 transition-all cursor-pointer">
                  <div className="font-semibold mb-1">Starter</div>
                  <div className="text-2xl font-bold mb-2">$19<span className="text-sm font-normal text-gray-500">/mo</span></div>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-4">
                    <li>- 5,000 operations/month</li>
                    <li>- 2 GB data transfer</li>
                    <li>- 5 active scenarios</li>
                    <li>- Email support</li>
                  </ul>
                  <Button variant="outline" className="w-full" onClick={() => { toast.success('Starter plan selected'); setShowUpgradePlanDialog(false); }}>
                    Select Starter
                  </Button>
                </div>
                <div className="p-4 border-2 border-emerald-500 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 relative">
                  <Badge className="absolute -top-2 right-4 bg-emerald-500">Popular</Badge>
                  <div className="font-semibold mb-1">Pro</div>
                  <div className="text-2xl font-bold mb-2">$49<span className="text-sm font-normal text-gray-500">/mo</span></div>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-4">
                    <li>- 25,000 operations/month</li>
                    <li>- 10 GB data transfer</li>
                    <li>- 25 active scenarios</li>
                    <li>- Priority support</li>
                    <li>- AI automation features</li>
                  </ul>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => { toast.success('Pro plan selected - redirecting to checkout'); setShowUpgradePlanDialog(false); }}>
                    Upgrade to Pro
                  </Button>
                </div>
                <div className="p-4 border rounded-lg hover:border-gray-400 transition-all cursor-pointer">
                  <div className="font-semibold mb-1">Enterprise</div>
                  <div className="text-2xl font-bold mb-2">Custom</div>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-4">
                    <li>- Unlimited operations</li>
                    <li>- Unlimited data transfer</li>
                    <li>- Unlimited scenarios</li>
                    <li>- Dedicated support</li>
                    <li>- Custom integrations</li>
                  </ul>
                  <Button variant="outline" className="w-full" onClick={() => { toast.success('Contact sales request sent'); setShowUpgradePlanDialog(false); }}>
                    Contact Sales
                  </Button>
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Shield className="h-4 w-4" />
                  <span>All plans include SSL encryption, 99.9% uptime SLA, and 30-day money-back guarantee</span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUpgradePlanDialog(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Delete Automation
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this automation? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            {workflowToDelete && (
              <div className="py-4">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-3 mb-2">
                    <Workflow className="h-5 w-5 text-red-600" />
                    <span className="font-medium">{workflowToDelete.workflow_name}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {workflowToDelete.description || 'No description'}
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                    <span>{workflowToDelete.total_executions} executions</span>
                    <span>{workflowToDelete.step_count} steps</span>
                    <Badge className={getStatusColor(workflowToDelete.status)}>{workflowToDelete.status}</Badge>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowDeleteConfirmDialog(false); setWorkflowToDelete(null); }}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => workflowToDelete && handleDeleteAutomation(workflowToDelete)}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Automation
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Run Confirmation Dialog */}
        <Dialog open={showRunConfirmDialog} onOpenChange={setShowRunConfirmDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <Play className="h-5 w-5" />
                Run Automation
              </DialogTitle>
              <DialogDescription>
                Confirm that you want to manually trigger this automation.
              </DialogDescription>
            </DialogHeader>
            {workflowToRun && (
              <div className="py-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3 mb-2">
                    <Workflow className="h-5 w-5 text-green-600" />
                    <span className="font-medium">{workflowToRun.workflow_name}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {workflowToRun.description || 'No description'}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 bg-white dark:bg-gray-800 rounded">
                      <div className="text-xs text-gray-500">Total Executions</div>
                      <div className="font-medium">{workflowToRun.total_executions}</div>
                    </div>
                    <div className="p-2 bg-white dark:bg-gray-800 rounded">
                      <div className="text-xs text-gray-500">Success Rate</div>
                      <div className="font-medium">
                        {workflowToRun.total_executions > 0
                          ? ((workflowToRun.successful_executions / workflowToRun.total_executions) * 100).toFixed(0)
                          : 0}%
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-sm text-amber-700 dark:text-amber-400">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span>This will execute all workflow steps immediately.</span>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowRunConfirmDialog(false); setWorkflowToRun(null); }}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirmRun}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run Now
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Workflow Dialog */}
        <Dialog open={showEditWorkflowDialog} onOpenChange={setShowEditWorkflowDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-blue-600" />
                Edit Automation
              </DialogTitle>
              <DialogDescription>
                Update your automation workflow settings.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[400px] mt-4 pr-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-workflow-name">Workflow Name</Label>
                  <Input
                    id="edit-workflow-name"
                    placeholder="My Automation Scenario"
                    value={editFormState.workflow_name}
                    onChange={(e) => setEditFormState(prev => ({ ...prev, workflow_name: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <textarea
                    id="edit-description"
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 mt-1"
                    rows={3}
                    placeholder="What does this automation do?"
                    value={editFormState.description}
                    onChange={(e) => setEditFormState(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-workflow-type">Workflow Type</Label>
                  <select
                    id="edit-workflow-type"
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 mt-1"
                    value={editFormState.workflow_type}
                    onChange={(e) => setEditFormState(prev => ({ ...prev, workflow_type: e.target.value as WorkflowType }))}
                  >
                    <option value="sequential">Sequential</option>
                    <option value="parallel">Parallel</option>
                    <option value="conditional">Conditional</option>
                    <option value="branching">Branching</option>
                    <option value="loop">Loop</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="edit-trigger-type">Trigger Type</Label>
                  <select
                    id="edit-trigger-type"
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 mt-1"
                    value={editFormState.trigger_type}
                    onChange={(e) => setEditFormState(prev => ({ ...prev, trigger_type: e.target.value }))}
                  >
                    <option value="webhook">Webhook</option>
                    <option value="cron">Schedule</option>
                    <option value="email-trigger">Email Trigger</option>
                    <option value="form-trigger">Form Submit</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <Label htmlFor="edit-is-enabled">Enable Automation</Label>
                    <p className="text-sm text-gray-500">Turn on/off this automation</p>
                  </div>
                  <Switch
                    id="edit-is-enabled"
                    checked={editFormState.is_enabled}
                    onCheckedChange={(checked) => setEditFormState(prev => ({ ...prev, is_enabled: checked }))}
                  />
                </div>
                {workflowToEdit && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-sm text-blue-700 dark:text-blue-400">
                      <div className="font-medium mb-1">Workflow Stats</div>
                      <div className="grid grid-cols-3 gap-4 mt-2">
                        <div>
                          <div className="text-xs text-gray-500">Steps</div>
                          <div className="font-medium">{workflowToEdit.step_count}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Version</div>
                          <div className="font-medium">{workflowToEdit.version}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Executions</div>
                          <div className="font-medium">{workflowToEdit.total_executions}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => { setShowEditWorkflowDialog(false); setWorkflowToEdit(null); setEditFormState(initialFormState); }}>
                Cancel
              </Button>
              <Button onClick={handleUpdateWorkflow} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Workflow Editor Dialog */}
        <Dialog open={showEditorDialog} onOpenChange={setShowEditorDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-purple-600" />
                Visual Workflow Editor
              </DialogTitle>
              <DialogDescription>
                Design your automation workflow visually with drag-and-drop modules.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="col-span-1 space-y-2">
                  <h4 className="font-medium text-sm">Available Modules</h4>
                  <ScrollArea className="h-[400px] border rounded-lg p-2">
                    {nodeCategories.map(category => (
                      <div key={category.id} className="mb-4">
                        <div className="flex items-center gap-2 mb-2 text-xs font-medium text-gray-500 uppercase">
                          {category.icon}
                          {category.name}
                        </div>
                        <div className="space-y-1">
                          {nodeTypes.filter(n => n.category === category.id).map(node => (
                            <div
                              key={node.id}
                              className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                              draggable
                            >
                              {node.icon}
                              <span className="text-sm">{node.name}</span>
                              {node.isPremium && <Badge className="text-xs bg-amber-100 text-amber-700">Pro</Badge>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
                <div className="col-span-3">
                  <div className="h-[400px] bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <div className="text-center">
                      <Workflow className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-500 font-medium">Drag modules here to build your workflow</p>
                      <p className="text-sm text-gray-400 mt-1">Connect triggers, actions, and conditions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditorDialog(false)}>
                Close
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => { toast.success('Workflow saved'); setShowEditorDialog(false); }}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Save Workflow
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
