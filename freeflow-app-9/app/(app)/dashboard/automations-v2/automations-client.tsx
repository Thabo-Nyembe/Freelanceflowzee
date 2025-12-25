'use client'
import { useState, useMemo } from 'react'
import { useAutomations, type AutomationWorkflow, type WorkflowType, type WorkflowStatus } from '@/lib/hooks/use-automations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Workflow, Play, Pause, Square, Plus, Settings, Download, Search,
  Zap, GitBranch, ArrowRight, Clock, CheckCircle2, XCircle, Activity,
  Code, Database, Mail, Webhook, Calendar, FileText, Users, Slack,
  Globe, ShoppingCart, CreditCard, Key, Terminal, Cloud, Bot, Sparkles,
  RotateCcw, Copy, Trash2, MoreVertical, Eye, Edit2, History, Layers,
  Filter, ChevronRight, TrendingUp, AlertTriangle, RefreshCw, Share2,
  Folder, Tag, Star, BarChart3, Timer, Cpu, Gauge, Network, Lock,
  Bell, MessageSquare, ArrowUpRight, ExternalLink, PlayCircle, PauseCircle,
  StopCircle, CheckCircle, Package, Shield, Rocket, Target, Lightbulb
} from 'lucide-react'

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
// MAIN COMPONENT
// ============================================================================

export default function AutomationsClient({ initialWorkflows }: { initialWorkflows: AutomationWorkflow[] }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [workflowTypeFilter, setWorkflowTypeFilter] = useState<WorkflowType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<WorkflowStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewWorkflow, setShowNewWorkflow] = useState(false)
  const [selectedWorkflow, setSelectedWorkflow] = useState<AutomationWorkflow | null>(null)
  const [selectedExecution, setSelectedExecution] = useState<Execution | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null)

  const { workflows, loading, error } = useAutomations({ workflowType: workflowTypeFilter, status: statusFilter })
  const displayWorkflows = workflows.length > 0 ? workflows : initialWorkflows

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
                            <Input placeholder="My Automation Scenario" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" rows={3} placeholder="What does this scenario automate?" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Start with a Trigger</label>
                            <div className="grid grid-cols-2 gap-3">
                              {nodeTypes.filter(n => n.category === 'triggers').map(node => (
                                <button key={node.id} className="flex items-center gap-3 p-3 border rounded-lg hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all text-left">
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
                            <Button variant="outline" className="mt-4">Browse Files</Button>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Or paste JSON</label>
                            <textarea className="w-full px-3 py-2 border rounded-lg font-mono text-sm dark:bg-gray-800 dark:border-gray-700" rows={6} placeholder='{"modules": [...], "connections": [...]}' />
                          </div>
                        </TabsContent>
                      </ScrollArea>
                    </Tabs>
                  </DialogContent>
                </Dialog>
                <Button variant="ghost" className="text-white hover:bg-white/20">
                  <Download className="h-5 w-5" />
                </Button>
                <Button variant="ghost" className="text-white hover:bg-white/20">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Scenarios */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-semibold">Active Scenarios</CardTitle>
                  <Button variant="ghost" size="sm">View All</Button>
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
                  <Button variant="ghost" size="sm">
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
                  <Button variant="ghost" size="sm">Browse All</Button>
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
          <TabsContent value="scenarios" className="space-y-4">
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
                      <Button variant="ghost" size="sm" className="text-green-600">
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Executions Tab */}
          <TabsContent value="executions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Execution History</CardTitle>
                <Button variant="ghost" size="sm">
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Scenario Templates</h2>
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
          <TabsContent value="connections">
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
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full mt-4">
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
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
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

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable Notifications</p>
                      <p className="text-sm text-gray-500">Get notified about execution failures</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Auto-retry Failed Executions</p>
                      <p className="text-sm text-gray-500">Automatically retry up to 3 times</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Execution Logging</p>
                      <p className="text-sm text-gray-500">Store detailed execution logs</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Digest</p>
                      <p className="text-sm text-gray-500">Daily summary of all executions</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Plan & Usage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg text-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Pro Plan</span>
                      <Badge className="bg-white/20 text-white border-0">Active</Badge>
                    </div>
                    <p className="text-sm text-white/80">10,000 operations/month • 5 GB data</p>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Operations Used</span>
                      <span>5,240 / 10,000</span>
                    </div>
                    <Progress value={52.4} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Data Transfer</span>
                      <span>2.1 GB / 5 GB</span>
                    </div>
                    <Progress value={42} className="h-2" />
                  </div>
                  <Button variant="outline" className="w-full">
                    <Rocket className="h-4 w-4 mr-2" />
                    Upgrade Plan
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>API Access</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">API Key</span>
                      <Button variant="ghost" size="sm">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <code className="text-sm text-gray-600 dark:text-gray-400">••••••••••••••••••••••••</code>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <Key className="h-4 w-4 mr-2" />
                      Regenerate Key
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      API Docs
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Danger Zone</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-red-600">Delete All Data</p>
                        <p className="text-sm text-gray-500">Remove all scenarios and executions</p>
                      </div>
                      <Button variant="destructive" size="sm">Delete</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

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
                          <Button className="mt-3">Open Editor</Button>
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
                      <Button variant="ghost" size="sm">Restore</Button>
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
                  <Button variant="outline" className="flex-1">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                  <Button variant="outline" className="flex-1">
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
                  <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Use This Template
                  </Button>
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}
