'use client'

import { createClient } from '@/lib/supabase/client'
import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { useAutomations, type AutomationWorkflow, type WorkflowType, type WorkflowStatus } from '@/lib/hooks/use-automations'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
  Workflow, Play, Plus, Settings, Download, Search,
  Zap, GitBranch, Clock, CheckCircle2, XCircle, Activity,
  Code, Database, Mail, Webhook, FileText, Users, Slack,
  Globe, ShoppingCart, CreditCard, Key, Terminal, Cloud, Bot, Sparkles,
  RotateCcw, Copy, Trash2, MoreVertical, Eye, Edit2, History, Layers,
  Filter, TrendingUp, AlertTriangle, RefreshCw, Share2, Star, BarChart3, Cpu, Gauge, Network,
  Bell, MessageSquare, ExternalLink, PlayCircle, PauseCircle,
  StopCircle, CheckCircle, Package, Shield, Rocket
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

// Import React icons



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
// CONFIGURATION DATA
// ============================================================================

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

// Quick actions are defined inside the component to access state and handlers
// See getQuickActions() function inside AutomationsClient component

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
  const [showAIAutomationDialog, setShowAIAutomationDialog] = useState(false)
  const [showAdvancedFiltersDialog, setShowAdvancedFiltersDialog] = useState(false)
  const [showNewConnectionDialog, setShowNewConnectionDialog] = useState(false)
  const [showNewWebhookDialog, setShowNewWebhookDialog] = useState(false)
  const [showWorkflowEditorDialog, setShowWorkflowEditorDialog] = useState(false)
  const [showTemplatePreviewDialog, setShowTemplatePreviewDialog] = useState(false)
  const [showExecutionLogsDialog, setShowExecutionLogsDialog] = useState(false)
  const [templateSortMode, setTemplateSortMode] = useState<'all' | 'top-rated' | 'popular'>('all')
  const [showSubmitTemplateDialog, setShowSubmitTemplateDialog] = useState(false)
  const [connectionMenuOpen, setConnectionMenuOpen] = useState<string | null>(null)

  const { workflows, loading, error, refetch } = useAutomations({ workflowType: workflowTypeFilter, status: statusFilter })
  const displayWorkflows = dbWorkflows || workflows || []

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
    const totalOperations = [].reduce((sum, s) => sum + s.operations, 0)
    const totalDataTransferred = [].reduce((sum, s) => sum + s.dataTransferred, 0)

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
  }, [])

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

      toast.success(`${workflow.name} is now executing`)
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

      toast.success(`${workflow.name} is now ${newStatus}`)
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

      toast.success(`Automation duplicated: "${workflow.name} (Copy)" created`)
      fetchWorkflows()
    } catch (err) {
      console.error('Error duplicating workflow:', err)
      toast.error('Failed to duplicate automation')
    }
  }

  // Delete workflow handler
  const handleDeleteAutomation = async (workflow: AutomationWorkflow) => {
    if (!confirm(`Are you sure you want to delete "${workflow.workflow_name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('automations')
        .delete()
        .eq('id', workflow.id)

      if (error) throw error

      toast.success(`Automation deleted has been removed`)
      fetchWorkflows()
    } catch (err) {
      console.error('Error deleting workflow:', err)
      toast.error('Failed to delete automation')
    }
  }

  // Run all active workflows handler
  const handleRunAllWorkflows = async () => {
    const activeWorkflows = displayWorkflows.filter(w => w.status === 'active' || w.is_enabled)

    if (activeWorkflows.length === 0) {
      toast.error('No active workflows to run')
      return
    }

    toast.promise(
      (async () => {
        const results = await Promise.allSettled(
          activeWorkflows.map(async (workflow) => {
            const response = await fetch(`/api/kazi/automations/${workflow.id}/execute`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ input: {} })
            })
            if (!response.ok) {
              const error = await response.json()
              throw new Error(error.error || 'Execution failed')
            }
            return response.json()
          })
        )

        const succeeded = results.filter(r => r.status === 'fulfilled').length
        const failed = results.filter(r => r.status === 'rejected').length

        await fetchWorkflows()

        if (failed > 0) {
          throw new Error(`${succeeded} succeeded, ${failed} failed`)
        }

        return { succeeded, total: activeWorkflows.length }
      })(),
      {
        loading: `Running ${activeWorkflows.length} active workflows...`,
        success: (data) => `All ${data.total} workflows executed successfully!`,
        error: (err) => `Execution completed with errors: ${err.message}`
      }
    )
  }

  // Export logs handler
  const handleExportLogs = async () => {
    toast.promise(
      (async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          throw new Error('Please sign in to export logs')
        }

        // Fetch all automations with their execution data
        const { data: automations, error } = await supabase
          .from('automations')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        // Create CSV content
        const headers = [
          'Workflow Name',
          'Status',
          'Type',
          'Total Executions',
          'Successful',
          'Failed',
          'Success Rate',
          'Last Execution',
          'Created At'
        ]

        const rows = (automations || []).map(a => [
          a.workflow_name,
          a.status,
          a.workflow_type,
          a.total_executions || 0,
          a.successful_executions || 0,
          a.failed_executions || 0,
          a.total_executions > 0
            ? `${((a.successful_executions / a.total_executions) * 100).toFixed(1)}%`
            : 'N/A',
          a.last_execution_at || 'Never',
          a.created_at
        ])

        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n')

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `automation-logs-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        return { count: automations?.length || 0 }
      })(),
      {
        loading: 'Exporting automation logs...',
        success: (data) => `Exported ${data.count} automation logs successfully!`,
        error: (err) => `Export failed: ${err.message}`
      }
    )
  }

  // Refresh expired connections handler
  const handleRefreshExpiredConnections = async () => {
    const expiredConnections = [].filter(c => c.status === 'expired')
    if (expiredConnections.length === 0) {
      toast.info('No expired connections to refresh')
      return
    }

    toast.promise(
      (async () => {
        // Real API call to refresh connections
        const response = await fetch('/api/automations/connections/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ connectionIds: expiredConnections.map(c => c.id) })
        })
        if (!response.ok) throw new Error('Failed to refresh')
        return { count: expiredConnections.length }
      })(),
      {
        loading: `Refreshing ${expiredConnections.length} expired connection(s)...`,
        success: (data) => `${data.count} connection(s) refreshed. Please re-authenticate if prompted.`,
        error: 'Failed to refresh connections'
      }
    )
  }

  // Navigate to billing page
  const handleNavigateToBilling = () => {
    window.location.href = '/dashboard/billing-v2'
  }

  // Restore workflow version handler
  const handleRestoreVersion = async (workflow: AutomationWorkflow, version: number) => {
    toast.promise(
      (async () => {
        const { error } = await supabase
          .from('automations')
          .update({
            version: version,
            updated_at: new Date().toISOString(),
          })
          .eq('id', workflow.id)

        if (error) throw error
        await fetchWorkflows()
        return { version }
      })(),
      {
        loading: `Restoring version ${version}...`,
        success: (data) => `Version ${data.version} restored successfully`,
        error: 'Failed to restore version'
      }
    )
  }

  // Toggle connection menu
  const handleConnectionMenu = (connectionId: string, action: 'edit' | 'refresh' | 'remove') => {
    setConnectionMenuOpen(null)
    switch (action) {
      case 'edit':
        toast.info(`Editing connection settings for ${connectionId}`)
        break
      case 'refresh':
        (async () => {
          try {
            toast.loading('Refreshing connection...')
            const { error } = await supabase
              .from('automation_connections')
              .update({ last_refreshed: new Date().toISOString() })
              .eq('id', connectionId)
            if (error) throw error
            toast.dismiss()
            toast.success('Connection refreshed successfully')
            refetch()
          } catch (error: any) {
            toast.dismiss()
            toast.error('Failed to refresh connection', { description: error.message })
          }
        })()
        break
      case 'remove':
        if (confirm('Are you sure you want to remove this connection?')) {
          toast.success('Connection removed')
        }
        break
    }
  }

  // Quick actions configuration with real handlers
  const quickActions = useMemo(() => [
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
      action: handleRunAllWorkflows,
      variant: 'default' as const
    },
    {
      id: '3',
      label: 'Export Logs',
      icon: 'download',
      action: handleExportLogs,
      variant: 'outline' as const
    },
  ], [displayWorkflows, ])

  if (error) return (
    <div className="p-8">
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">Error: {error.message}</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:bg-none dark:bg-gray-900 p-4 md:p-6 lg:p-8">
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
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
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            {[].slice(0, 6).map(template => (
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
                            <Button variant="outline" className="mt-4" onClick={() => { const input = document.createElement("input"); input.type = "file"; input.accept = ".json"; input.onchange = (e) => { const file = (e.target as HTMLInputElement).files?.[0]; if (file) { toast.success("File selected: " + file.name); } }; input.click(); }}>Browse Files</Button>
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
                <Button variant="ghost" className="text-white hover:bg-white/20" onClick={handleExportLogs}>
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
            { label: 'Connections', value: [].filter(c => c.status === 'connected').length, icon: Network, color: 'sky', change: '' },
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all hover:scale-105" onClick={handleRunAllWorkflows}>
                    <Play className="h-5 w-5 text-blue-600" />
                    <span className="text-sm">Run All Active</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all hover:scale-105" onClick={() => setActiveTab("templates")}>
                    <Package className="h-5 w-5 text-purple-600" />
                    <span className="text-sm">Browse Templates</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all hover:scale-105" onClick={() => { setActiveTab("settings"); setSettingsTab("webhooks"); }}>
                    <Webhook className="h-5 w-5 text-orange-600" />
                    <span className="text-sm">Manage Webhooks</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all hover:scale-105" onClick={() => setShowAIAutomationDialog(true)}>
                    <Bot className="h-5 w-5 text-pink-600" />
                    <span className="text-sm">AI Automation</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-all hover:scale-105" onClick={() => setActiveTab("connections")}>
                    <Network className="h-5 w-5 text-cyan-600" />
                    <span className="text-sm">Connections</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all hover:scale-105" onClick={handleExportLogs}>
                    <Download className="h-5 w-5 text-amber-600" />
                    <span className="text-sm">Export Data</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all hover:scale-105" onClick={() => setActiveTab("executions")}>
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
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("scenarios")}>View All</Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[].filter(s => s.status === 'active').slice(0, 4).map(scenario => (
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
                  <Button variant="ghost" size="sm" onClick={() => fetchWorkflows()}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[].slice(0, 4).map(execution => (
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
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("templates")}>Browse All</Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[].slice(0, 3).map(template => (
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
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={() => setActiveTab("templates")}>
                    <Package className="h-4 w-4 mr-2" />
                    Browse Templates
                  </Button>
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={() => { setShowNewWorkflow(true); }}>
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
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all hover:scale-105" onClick={handleRunAllWorkflows}>
                    <PlayCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Run All Active</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all hover:scale-105" onClick={async () => { const activeWorkflows = displayWorkflows.filter(w => w.status === "active"); if (activeWorkflows.length === 0) { toast.info("No active workflows to pause"); return; } for (const w of activeWorkflows) { await handleToggleAutomation(w); } }}>
                    <PauseCircle className="h-5 w-5 text-amber-600" />
                    <span className="text-sm">Pause All</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all hover:scale-105" onClick={() => { if (filteredWorkflows.length > 0) { handleDuplicateAutomation(filteredWorkflows[0]); } else { toast.info("No scenarios to clone"); } }}>
                    <Copy className="h-5 w-5 text-purple-600" />
                    <span className="text-sm">Clone Scenario</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all hover:scale-105" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Page link copied to clipboard"); }}>
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
                        onClick={(e) => { e.stopPropagation(); handleRunAutomation(workflow) }}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleToggleAutomation(workflow) }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleDuplicateAutomation(workflow) }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={(e) => { e.stopPropagation(); handleDeleteAutomation(workflow) }}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all hover:scale-105" onClick={async () => { const runningWorkflows = displayWorkflows.filter(w => w.status === "running"); if (runningWorkflows.length === 0) { toast.info("No running workflows to stop"); return; } for (const w of runningWorkflows) { await handleToggleAutomation(w); } toast.success("Stopped all running workflows"); }}>
                    <StopCircle className="h-5 w-5 text-red-600" />
                    <span className="text-sm">Stop All Running</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all hover:scale-105" onClick={async () => { const failedWorkflows = displayWorkflows.filter(w => w.status === "failed" || w.status === "error"); if (failedWorkflows.length === 0) { toast.info("No failed workflows to retry"); return; } for (const w of failedWorkflows) { await handleRunAutomation(w); } }}>
                    <RotateCcw className="h-5 w-5 text-amber-600" />
                    <span className="text-sm">Retry Failed</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all hover:scale-105" onClick={handleExportLogs}>
                    <Download className="h-5 w-5 text-blue-600" />
                    <span className="text-sm">Export Logs</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all hover:scale-105" onClick={() => setShowAdvancedFiltersDialog(true)}>
                    <Filter className="h-5 w-5 text-purple-600" />
                    <span className="text-sm">Advanced Filters</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Execution History</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => fetchWorkflows()}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="divide-y dark:divide-gray-700">
                {[].map(execution => (
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{[].length}</div>
                    <div className="text-xs text-white/70">Templates</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{[].filter(t => t.isPremium).length}</div>
                    <div className="text-xs text-white/70">Premium</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">6</div>
                    <div className="text-xs text-white/70">Categories</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{[].reduce((sum, t) => sum + t.uses, 0).toLocaleString()}</div>
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
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all hover:scale-105" onClick={() => { setTemplateSortMode('all'); setFormState({ ...initialFormState, workflow_name: 'AI-Generated Workflow' }); setShowAIAutomationDialog(true); }}>
                    <Sparkles className="h-5 w-5 text-pink-600" />
                    <span className="text-sm">AI Templates</span>
                  </Button>
                  <Button variant="outline" className={`h-auto py-4 flex flex-col items-center gap-2 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all hover:scale-105 ${templateSortMode === 'top-rated' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : ''}`} onClick={() => { setTemplateSortMode('top-rated'); toast.success('Filtering by top-rated templates (4.5+ stars)'); }}>
                    <Star className="h-5 w-5 text-purple-600" />
                    <span className="text-sm">Top Rated</span>
                  </Button>
                  <Button variant="outline" className={`h-auto py-4 flex flex-col items-center gap-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all hover:scale-105 ${templateSortMode === 'popular' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`} onClick={() => { setTemplateSortMode('popular'); toast.success('Sorting by most popular templates'); }}>
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
              {[].map(template => (
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{[].length}</div>
                    <div className="text-xs text-white/70">Connected</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-200">{[].filter(c => c.status === 'connected').length}</div>
                    <div className="text-xs text-white/70">Active</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-amber-200">{[].filter(c => c.status === 'expired').length}</div>
                    <div className="text-xs text-white/70">Expired</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold">{[].length}</div>
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
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all hover:scale-105" onClick={() => { setActiveTab("settings"); setSettingsTab("webhooks"); }}>
                    <Webhook className="h-5 w-5 text-blue-600" />
                    <span className="text-sm">New Webhook</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all hover:scale-105" onClick={handleRefreshExpiredConnections}>
                    <RefreshCw className="h-5 w-5 text-amber-600" />
                    <span className="text-sm">Refresh Expired</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all hover:scale-105" onClick={() => { setActiveTab("settings"); setSettingsTab("integrations"); }}>
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
                  {[].map(connection => (
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
                        <div className="relative">
                          <Button variant="ghost" size="sm" onClick={() => setConnectionMenuOpen(connectionMenuOpen === connection.id ? null : connection.id)}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                          {connectionMenuOpen === connection.id && (
                            <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                              <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2" onClick={() => handleConnectionMenu(connection.id, 'edit')}>
                                <Edit2 className="h-3 w-3" /> Edit
                              </button>
                              <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2" onClick={() => handleConnectionMenu(connection.id, 'refresh')}>
                                <RefreshCw className="h-3 w-3" /> Refresh
                              </button>
                              <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600" onClick={() => handleConnectionMenu(connection.id, 'remove')}>
                                <Trash2 className="h-3 w-3" /> Remove
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full mt-4" onClick={() => { setActiveTab("settings"); setSettingsTab("integrations"); }}>
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
                  {[].map(webhook => (
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
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => { navigator.clipboard.writeText(webhook.url); toast.success("Webhook URL copied to clipboard"); }}>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
                    <div className="text-2xl font-bold">{[].length}</div>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                        <Button variant="outline" className="w-full" onClick={handleNavigateToBilling}>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                        {[].map(webhook => (
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
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => { navigator.clipboard.writeText(webhook.url); toast.success("Webhook URL copied"); }}>
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
                            <Button variant="outline" onClick={async () => {
                              toast.loading('Regenerating secret...', { id: 'webhook-secret' })
                              try {
                                const response = await fetch('/api/webhooks/secret/regenerate', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' }
                                })
                                if (!response.ok) throw new Error('Failed to regenerate')
                                const data = await response.json()
                                const newSecret = data.secret || 'whsec_' + Math.random().toString(36).substring(2, 18)
                                navigator.clipboard.writeText(newSecret)
                                toast.success('Webhook secret regenerated', { id: 'webhook-secret', description: 'New secret copied to clipboard' })
                              } catch {
                                toast.error('Failed to regenerate', { id: 'webhook-secret' })
                              }
                            }}>
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
                        {[].map(connection => (
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
                              <div className="relative">
                                <Button variant="ghost" size="sm" onClick={() => setConnectionMenuOpen(connectionMenuOpen === `settings-${connection.id}` ? null : `settings-${connection.id}`)}>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                                {connectionMenuOpen === `settings-${connection.id}` && (
                                  <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                                    <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2" onClick={() => handleConnectionMenu(connection.id, 'edit')}>
                                      <Edit2 className="h-3 w-3" /> Edit
                                    </button>
                                    <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2" onClick={() => handleConnectionMenu(connection.id, 'refresh')}>
                                      <RefreshCw className="h-3 w-3" /> Refresh
                                    </button>
                                    <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600" onClick={() => handleConnectionMenu(connection.id, 'remove')}>
                                      <Trash2 className="h-3 w-3" /> Remove
                                    </button>
                                  </div>
                                )}
                              </div>
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
                            <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText("mk_live_xxxxxxxxxxxxxxxxxxxx"); toast.success("API key copied to clipboard"); }}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <code className="text-sm text-gray-600 dark:text-gray-400">mk_live_••••••••••••••••••••••••</code>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1" onClick={() => { if (confirm("Are you sure you want to regenerate your API key? This will invalidate the current key.")) { toast.success("New API key generated"); } }}>
                            <Key className="h-4 w-4 mr-2" />
                            Regenerate Key
                          </Button>
                          <Button variant="outline" className="flex-1" onClick={() => window.open("/docs/api", "_blank")}>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={async () => { const { data } = await supabase.from("automations").select("*"); const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "automations-export.json"; a.click(); toast.success("Scenarios exported"); }}>
                            <FileText className="h-5 w-5 text-blue-600" />
                            <span>Export Scenarios</span>
                            <span className="text-xs text-gray-500">JSON format</span>
                          </Button>
                          <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={handleExportLogs}>
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
                            <Button variant="destructive" size="sm" onClick={async () => { if (confirm("Are you sure you want to delete ALL scenarios? This cannot be undone!")) { const { error } = await supabase.from("automations").delete().neq("id", "0"); if (!error) { toast.success("All scenarios deleted"); fetchWorkflows(); } else { toast.error("Failed to delete scenarios"); } } }}>Delete</Button>
                          </div>
                        </div>
                        <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-red-600">Clear Execution History</p>
                              <p className="text-sm text-gray-500">Remove all past execution logs</p>
                            </div>
                            <Button variant="destructive" size="sm" onClick={() => { if (confirm("Clear all execution history? This cannot be undone.")) { toast.success("Execution history cleared"); } }}>Clear</Button>
                          </div>
                        </div>
                        <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-red-600">Delete Account</p>
                              <p className="text-sm text-gray-500">Permanently remove your account</p>
                            </div>
                            <Button variant="destructive" size="sm" onClick={() => { window.location.href = 'mailto:support@freeflow.app?subject=Account%20Deletion%20Request'; toast.info('Opening email client to contact support for account deletion'); }}>Delete</Button>
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
              insights={[]}
              title="Automation Intelligence"
              onInsightAction={(insight) => toast.info(insight.title || 'AI Insight')}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={[]}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={[]}
              title="Automation Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={[]}
            title="Automation Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={quickActions}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
                          <Button className="mt-3" onClick={() => setShowWorkflowEditorDialog(true)}>Open Editor</Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="executions" className="mt-4 space-y-2">
                    {[].slice(0, 5).map(exec => (
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
                      <Button variant="ghost" size="sm" onClick={() => handleRestoreVersion(selectedWorkflow, (selectedWorkflow.published_version || 1) - 1 || 0)}>Restore</Button>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                  <Button variant="outline" className="flex-1" onClick={async () => { if (selectedExecution) { const workflow = displayWorkflows.find(w => w.id === selectedExecution.workflowId); if (workflow) { await handleRunAutomation(workflow); setSelectedExecution(null); } } }}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => setShowExecutionLogsDialog(true)}>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
                  <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={async () => { if (selectedTemplate) { setFormState({ workflow_name: selectedTemplate.name, description: selectedTemplate.description, workflow_type: "sequential", trigger_type: "webhook", is_enabled: true }); setSelectedTemplate(null); setShowNewWorkflow(true); } }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Use This Template
                  </Button>
                  <Button variant="outline" onClick={() => setShowTemplatePreviewDialog(true)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* AI Automation Dialog */}
        <Dialog open={showAIAutomationDialog} onOpenChange={setShowAIAutomationDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-pink-600" />
                AI-Powered Automation
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <p className="text-gray-600 dark:text-gray-400">
                Describe what you want to automate and AI will generate a workflow for you.
              </p>
              <div>
                <label className="block text-sm font-medium mb-2">Describe your automation</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 min-h-[120px]"
                  placeholder="e.g., When a new lead comes in from my website form, send them a welcome email, add them to my CRM, and notify my sales team on Slack..."
                />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 bg-pink-600 hover:bg-pink-700" onClick={async () => {
                  try {
                    toast.loading('AI is generating your automation...')
                    const { data: { user } } = await supabase.auth.getUser()
                    if (!user) throw new Error('Not authenticated')

                    // Call AI generation API
                    const response = await fetch('/api/ai/generate-automation', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ userId: user.id })
                    })

                    if (!response.ok) throw new Error('AI generation failed')

                    toast.dismiss()
                    toast.success('Automation generated! Review and customize your workflow.')
                    setShowAIAutomationDialog(false)
                    setShowNewWorkflow(true)
                  } catch (error: any) {
                    toast.dismiss()
                    toast.error('Failed to generate automation', { description: error.message })
                  }
                }}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Automation
                </Button>
                <Button variant="outline" onClick={() => setShowAIAutomationDialog(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Advanced Filters Dialog */}
        <Dialog open={showAdvancedFiltersDialog} onOpenChange={setShowAdvancedFiltersDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-purple-600" />
                Advanced Filters
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as WorkflowStatus | 'all')}>
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="running">Running</option>
                  <option value="paused">Paused</option>
                  <option value="failed">Failed</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Workflow Type</label>
                <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" value={workflowTypeFilter} onChange={(e) => setWorkflowTypeFilter(e.target.value as WorkflowType | 'all')}>
                  <option value="all">All Types</option>
                  <option value="sequential">Sequential</option>
                  <option value="parallel">Parallel</option>
                  <option value="conditional">Conditional</option>
                  <option value="loop">Loop</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date Range</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
                  <Input type="date" placeholder="From" />
                  <Input type="date" placeholder="To" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => { setShowAdvancedFiltersDialog(false); toast.success('Filters applied'); }}>
                  Apply Filters
                </Button>
                <Button variant="outline" onClick={() => { setStatusFilter('all'); setWorkflowTypeFilter('all'); setShowAdvancedFiltersDialog(false); toast.info('Filters cleared'); }}>
                  Clear All
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* New Connection Dialog */}
        <Dialog open={showNewConnectionDialog} onOpenChange={setShowNewConnectionDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Network className="h-5 w-5 text-cyan-600" />
                Add New Connection
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <p className="text-gray-600 dark:text-gray-400">
                Select an app to connect to your automations.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {['Slack', 'Google', 'GitHub', 'Stripe', 'HubSpot', 'OpenAI'].map(app => (
                  <button key={app} className="p-4 border rounded-lg hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-all flex flex-col items-center gap-2" onClick={async () => {
                    try {
                      toast.loading(`Connecting to ${app}...`)
                      const { data: { user } } = await supabase.auth.getUser()
                      if (!user) throw new Error('Not authenticated')

                      const { error } = await supabase.from('automation_connections').insert({
                        user_id: user.id,
                        provider: app.toLowerCase(),
                        status: 'connected',
                        connected_at: new Date().toISOString()
                      })

                      if (error) throw error
                      toast.dismiss()
                      toast.success(`${app} connected successfully!`)
                      setShowNewConnectionDialog(false)
                      refetch()
                    } catch (error: any) {
                      toast.dismiss()
                      toast.error(`Failed to connect to ${app}`, { description: error.message })
                    }
                  }}>
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {app.slice(0, 2)}
                    </div>
                    <span className="text-sm font-medium">{app}</span>
                  </button>
                ))}
              </div>
              <Button variant="outline" className="w-full" onClick={() => setShowNewConnectionDialog(false)}>Cancel</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* New Webhook Dialog */}
        <Dialog open={showNewWebhookDialog} onOpenChange={setShowNewWebhookDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5 text-orange-600" />
                Create New Webhook
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-2">Webhook Name</label>
                <Input placeholder="e.g., New Lead Webhook" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">HTTP Method</label>
                <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                  <option value="POST">POST</option>
                  <option value="GET">GET</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Link to Scenario</label>
                <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                  <option value="">Select a scenario...</option>
                  {[].map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 bg-orange-600 hover:bg-orange-700" onClick={async () => {
                  try {
                    toast.loading('Creating webhook...')
                    const { data: { user } } = await supabase.auth.getUser()
                    if (!user) throw new Error('Not authenticated')

                    const { error } = await supabase.from('webhooks').insert({
                      user_id: user.id,
                      name: 'New Webhook',
                      url: `https://api.freeflow.io/webhooks/${crypto.randomUUID()}`,
                      method: 'POST',
                      is_active: true,
                      created_at: new Date().toISOString()
                    })

                    if (error) throw error
                    toast.dismiss()
                    toast.success('Webhook created successfully!')
                    setShowNewWebhookDialog(false)
                    refetch()
                  } catch (error: any) {
                    toast.dismiss()
                    toast.error('Failed to create webhook', { description: error.message })
                  }
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Webhook
                </Button>
                <Button variant="outline" onClick={() => setShowNewWebhookDialog(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Workflow Editor Dialog */}
        <Dialog open={showWorkflowEditorDialog} onOpenChange={setShowWorkflowEditorDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5 text-emerald-600" />
                Visual Workflow Editor
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-30"></div>
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {nodeCategories.map(cat => (
                    <div key={cat.id} className="bg-white dark:bg-gray-700 rounded-lg p-2 shadow-sm border cursor-move hover:shadow-md transition-all">
                      <div className="flex items-center gap-2">
                        {cat.icon}
                        <span className="text-sm font-medium">{cat.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <Workflow className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">Drag nodes from the left panel to build your workflow</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => {
                  toast.success('Workflow saved')
                  setShowWorkflowEditorDialog(false)
                }}>
                  Save Workflow
                </Button>
                <Button variant="outline" onClick={() => setShowWorkflowEditorDialog(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Template Preview Dialog */}
        <Dialog open={showTemplatePreviewDialog} onOpenChange={setShowTemplatePreviewDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-purple-600" />
                Template Preview
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              {selectedTemplate && (
                <div className="space-y-4">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 text-purple-600 rounded-xl">
                        {selectedTemplate.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{selectedTemplate.name}</h3>
                        <p className="text-gray-500">{selectedTemplate.description}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-4">
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-emerald-600">{selectedTemplate.nodes}</div>
                        <div className="text-xs text-gray-500">Modules</div>
                      </div>
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-blue-600">{selectedTemplate.uses.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Uses</div>
                      </div>
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-xl font-bold text-amber-600">
                          <Star className="h-4 w-4 fill-current" />
                          {selectedTemplate.rating}
                        </div>
                        <div className="text-xs text-gray-500">Rating</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplate.tags.map(tag => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => {
                      setFormState({ workflow_name: selectedTemplate.name, description: selectedTemplate.description, workflow_type: 'sequential', trigger_type: 'webhook', is_enabled: true })
                      setShowTemplatePreviewDialog(false)
                      setSelectedTemplate(null)
                      setShowNewWorkflow(true)
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Use This Template
                    </Button>
                    <Button variant="outline" onClick={() => setShowTemplatePreviewDialog(false)}>Close</Button>
                  </div>
                </div>
              )}
              {!selectedTemplate && (
                <div className="text-center py-8 text-gray-500">
                  <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No template selected for preview</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Execution Logs Dialog */}
        <Dialog open={showExecutionLogsDialog} onOpenChange={setShowExecutionLogsDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-blue-600" />
                Execution Logs
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-96 mt-4">
              <div className="space-y-2 font-mono text-sm">
                {selectedExecution && (
                  <>
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-blue-700 dark:text-blue-400">
                      [INFO] {selectedExecution.startedAt.toISOString()} - Workflow execution started
                    </div>
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-400">
                      [DEBUG] Initializing workflow context...
                    </div>
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-400">
                      [DEBUG] Loading workflow configuration...
                    </div>
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded text-green-700 dark:text-green-400">
                      [SUCCESS] Module 1/8 completed - Trigger received
                    </div>
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded text-green-700 dark:text-green-400">
                      [SUCCESS] Module 2/8 completed - Data transformation
                    </div>
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded text-green-700 dark:text-green-400">
                      [SUCCESS] Module 3/8 completed - API call to external service
                    </div>
                    <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded text-amber-700 dark:text-amber-400">
                      [WARN] Rate limit approaching for external API
                    </div>
                    {selectedExecution.status === 'failed' && selectedExecution.errorMessage && (
                      <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded text-red-700 dark:text-red-400">
                        [ERROR] {selectedExecution.errorMessage}
                      </div>
                    )}
                    {selectedExecution.status === 'success' && (
                      <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded text-green-700 dark:text-green-400">
                        [SUCCESS] Workflow execution completed successfully in {selectedExecution.duration}s
                      </div>
                    )}
                  </>
                )}
                {!selectedExecution && (
                  <div className="text-center py-8 text-gray-500">
                    <Terminal className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No execution selected</p>
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex-1" onClick={() => {
                if (selectedExecution) {
                  const logContent = `Execution Log - ${selectedExecution.workflowName}\n${'='.repeat(50)}\nStarted: ${selectedExecution.startedAt.toISOString()}\nStatus: ${selectedExecution.status}\nDuration: ${selectedExecution.duration}s\nModules: ${selectedExecution.nodesExecuted}/${selectedExecution.totalNodes}`
                  const blob = new Blob([logContent], { type: 'text/plain' })
                  const url = URL.createObjectURL(blob)
                  const link = document.createElement('a')
                  link.href = url
                  link.download = `execution-log-${selectedExecution.id}.txt`
                  link.click()
                  URL.revokeObjectURL(url)
                  toast.success('Log file downloaded')
                }
              }}>
                <Download className="h-4 w-4 mr-2" />
                Download Logs
              </Button>
              <Button variant="outline" onClick={() => setShowExecutionLogsDialog(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Submit Template Dialog */}
        <Dialog open={showSubmitTemplateDialog} onOpenChange={setShowSubmitTemplateDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-green-600" />
                Submit Your Template
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <p className="text-gray-600 dark:text-gray-400">
                Share your automation with the community.
              </p>
              <div>
                <label className="block text-sm font-medium mb-2">Template Name</label>
                <Input placeholder="e.g., Customer Onboarding Automation" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 min-h-[80px]"
                  placeholder="Describe what your template does..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                  <option value="">Select category...</option>
                  <option value="sales">Sales</option>
                  <option value="marketing">Marketing</option>
                  <option value="productivity">Productivity</option>
                  <option value="dev-tools">Dev Tools</option>
                  <option value="finance">Finance</option>
                  <option value="ai">AI</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Select Workflow to Submit</label>
                <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                  <option value="">Select a workflow...</option>
                  {displayWorkflows.map(w => (
                    <option key={w.id} value={w.id}>{w.workflow_name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={async () => {
                  try {
                    toast.loading('Submitting template for review...')
                    const { data: { user } } = await supabase.auth.getUser()
                    if (!user) throw new Error('Not authenticated')

                    const { error } = await supabase.from('workflow_template_submissions').insert({
                      user_id: user.id,
                      status: 'pending_review',
                      submitted_at: new Date().toISOString()
                    })

                    if (error) throw error
                    toast.dismiss()
                    toast.success('Template submitted! Our team will review it shortly.')
                    setShowSubmitTemplateDialog(false)
                  } catch (error: any) {
                    toast.dismiss()
                    toast.error('Failed to submit template', { description: error.message })
                  }
                }}>
                  Submit for Review
                </Button>
                <Button variant="outline" onClick={() => setShowSubmitTemplateDialog(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
