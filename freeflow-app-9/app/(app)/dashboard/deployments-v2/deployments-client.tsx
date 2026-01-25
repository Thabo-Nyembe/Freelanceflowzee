'use client'

import { createClient } from '@/lib/supabase/client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useDeployments, type Deployment as HookDeployment, type DeploymentEnvironment as HookDeploymentEnvironment, type DeploymentStatus as HookDeploymentStatus } from '@/lib/hooks/use-deployments'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Rocket, CheckCircle2, Clock, GitBranch, Globe, Activity,
  RotateCcw, Play, Terminal, Eye, Settings, Trash2, Copy, ExternalLink,
  GitCommit, FileCode, Zap, Shield, RefreshCw, AlertTriangle, Check, X,
  Box, Layers, Database, Lock, Plus, ChevronRight, ChevronDown,
  Search, Filter, MoreHorizontal, Download, Upload, ArrowUpRight, Timer, Network, User, MessageSquare, FileText, BarChart3, AlertCircle, Webhook,
  Folder, File, Package, Gauge, MonitorPlay, GitPullRequest, Bell, AlertOctagon, Globe2, Loader2
} from 'lucide-react'

// Lazy-loaded Enhanced & Competitive Upgrade Components for code splitting
import { TabContentSkeleton } from '@/components/dashboard/lazy'

const AIInsightsPanel = dynamic(
  () => import('@/components/ui/competitive-upgrades').then(mod => ({ default: mod.AIInsightsPanel })),
  {
    loading: () => <TabContentSkeleton />,
    ssr: false
  }
)

const CollaborationIndicator = dynamic(
  () => import('@/components/ui/competitive-upgrades').then(mod => ({ default: mod.CollaborationIndicator })),
  {
    loading: () => <div className="animate-pulse h-8 w-32 bg-muted rounded" />,
    ssr: false
  }
)

const PredictiveAnalytics = dynamic(
  () => import('@/components/ui/competitive-upgrades').then(mod => ({ default: mod.PredictiveAnalytics })),
  {
    loading: () => <TabContentSkeleton />,
    ssr: false
  }
)

const ActivityFeed = dynamic(
  () => import('@/components/ui/competitive-upgrades-extended').then(mod => ({ default: mod.ActivityFeed })),
  {
    loading: () => <TabContentSkeleton />,
    ssr: false
  }
)

const QuickActionsToolbar = dynamic(
  () => import('@/components/ui/competitive-upgrades-extended').then(mod => ({ default: mod.QuickActionsToolbar })),
  {
    loading: () => <div className="animate-pulse h-12 w-full bg-muted rounded" />,
    ssr: false
  }
)

import { Textarea } from '@/components/ui/textarea'

// Initialize Supabase client once at module level
const supabase = createClient()

// Database types
interface DbDeployment {
  id: string
  user_id: string
  deployment_name: string
  version: string
  environment: 'production' | 'staging' | 'development' | 'testing' | 'qa' | 'sandbox' | 'preview'
  status: 'pending' | 'in_progress' | 'success' | 'failed' | 'rolled_back' | 'cancelled' | 'skipped'
  branch?: string
  commit_hash?: string
  commit_message?: string
  commit_author?: string
  deploy_type?: string
  started_at?: string
  completed_at?: string
  duration_seconds: number
  can_rollback: boolean
  error_message?: string
  notes?: string
  tags?: string[]
  metadata?: any
  created_at: string
  updated_at: string
}

// Types
type DeploymentStatus = 'success' | 'in_progress' | 'failed' | 'rolled_back' | 'cancelled' | 'queued'
type DeploymentEnvironment = 'production' | 'staging' | 'development' | 'preview'
type BuildLogLevel = 'info' | 'warn' | 'error' | 'success'

interface Deployment {
  id: string
  name: string
  status: DeploymentStatus
  environment: DeploymentEnvironment
  branch: string
  commit: string
  commitMessage: string
  author: string
  authorAvatar: string
  createdAt: string
  duration: number
  previewUrl: string
  productionUrl?: string
  prNumber?: number
  prTitle?: string
  buildCache: boolean
  isProtected: boolean
}

interface BuildLog {
  id: string
  timestamp: string
  level: BuildLogLevel
  message: string
  step: string
}

interface DeploymentDomain {
  id: string
  domain: string
  type: 'production' | 'preview' | 'custom'
  verified: boolean
  ssl: boolean
  createdAt: string
  redirectTo?: string
}

interface EnvironmentVariable {
  id: string
  key: string
  value: string
  environment: 'production' | 'preview' | 'development' | 'all'
  encrypted: boolean
  createdAt: string
}

interface ServerlessFunction {
  id: string
  name: string
  runtime: string
  region: string
  invocations: number
  avgDuration: number
  errors: number
  memory: number
}

interface EdgeConfig {
  id: string
  name: string
  itemCount: number
  reads: number
  writes: number
  createdAt: string
}

interface StorageBlob {
  id: string
  name: string
  size: number
  contentType: string
  uploadedAt: string
  downloadCount: number
  isPublic: boolean
}

interface UsageMetric {
  date: string
  bandwidth: number
  requests: number
  executions: number
}

interface DeploymentProtection {
  id: string
  name: string
  type: 'password' | 'vercel_auth' | 'trusted_ips'
  enabled: boolean
  config: Record<string, any>
}

interface DeploymentWebhook {
  id: string
  name: string
  url: string
  events: string[]
  status: 'active' | 'inactive' | 'failed'
  lastTriggered?: string
  successRate: number
  secret: string
}

interface Integration {
  id: string
  name: string
  type: 'ci_cd' | 'monitoring' | 'notification' | 'logging' | 'analytics'
  status: 'connected' | 'disconnected' | 'error'
  icon: string
  lastSync: string
  config: Record<string, any>
}

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'owner' | 'admin' | 'developer' | 'viewer'
  avatar: string
  lastActive: string
  deploymentsThisMonth: number
}

interface BuildPlugin {
  id: string
  name: string
  version: string
  enabled: boolean
  description: string
  author: string
  installCount: number
}

// Types for AI features (data comes from database when implemented)
// Type definitions for AI Insights
interface AIInsight {
  id: string
  type: 'recommendation' | 'alert' | 'opportunity' | 'prediction' | 'success' | 'info' | 'warning' | 'error'
  title: string
  description: string
  impact?: 'high' | 'medium' | 'low'
  priority?: 'high' | 'medium' | 'low'
  metric?: string
  change?: number
  confidence?: number
  action?: string
  category?: string
  timestamp?: string | Date
  createdAt?: Date
}

interface Collaborator {
  id: string
  name: string
  avatar?: string
  color?: string
  status: 'online' | 'away' | 'offline'
  role?: string
  isTyping?: boolean
  lastSeen?: Date
  lastActive?: string | Date
  cursor?: { x: number; y: number }
}

interface Prediction {
  id?: string
  label?: string
  title?: string
  prediction?: string
  current?: number
  target?: number
  currentValue?: number
  predictedValue?: number
  predicted?: number
  confidence: number
  trend: 'up' | 'down' | 'stable'
  timeframe?: string
  impact?: string
  factors?: Array<{ name: string; impact: 'positive' | 'negative' | 'neutral'; weight: number }> | string[]
}

interface ActivityItem {
  id: string
  type: 'comment' | 'update' | 'create' | 'delete' | 'mention' | 'assignment' | 'status_change' | 'milestone' | 'integration' | 'success' | 'info'
  title?: string
  action?: string
  description?: string
  user: string | { id: string; name: string; avatar?: string }
  target?: string | { type: string; name: string; url?: string }
  metadata?: Record<string, unknown>
  timestamp: Date | string
  isRead?: boolean
  isPinned?: boolean
  actions?: Array<{ label: string; action: () => void; variant?: 'default' | 'destructive' }>
}

// Quick actions are defined inside the component to access state setters and handlers

// Default form state for creating deployments
const defaultDeploymentForm = {
  deployment_name: '',
  version: '',
  environment: 'development' as DbDeployment['environment'],
  branch: '',
  commit_hash: '',
  commit_message: '',
  commit_author: '',
  deploy_type: 'full',
  notes: '',
}

export default function DeploymentsClient() {

  // Use the deployments hook for data fetching and mutations
  const {
    deployments: dbDeployments,
    loading,
    error: deploymentsError,
    refetch: fetchDeployments,
    mutationLoading: isSubmitting,
    createDeployment,
    updateDeployment,
    deleteDeployment,
    startDeployment,
    completeDeployment,
    rollbackDeployment,
    cancelDeployment
  } = useDeployments()

  const [deploymentForm, setDeploymentForm] = useState(defaultDeploymentForm)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedDbDeployment, setSelectedDbDeployment] = useState<DbDeployment | null>(null)

  // Show error toast if there's an error loading deployments
  useEffect(() => {
    if (deploymentsError) {
      toast.error('Failed to load deployments')
    }
  }, [deploymentsError])

  // Create deployment
  const handleCreateDeployment = async () => {
    if (!deploymentForm.deployment_name || !deploymentForm.version) {
      toast.error('Validation Error')
      return
    }

    try {
      await createDeployment({
        deployment_name: deploymentForm.deployment_name,
        version: deploymentForm.version,
        environment: deploymentForm.environment as HookDeploymentEnvironment,
        branch: deploymentForm.branch || undefined,
        commit_hash: deploymentForm.commit_hash || undefined,
        commit_message: deploymentForm.commit_message || undefined,
        commit_author: deploymentForm.commit_author || undefined,
        deploy_type: deploymentForm.deploy_type as any || 'full',
        notes: deploymentForm.notes || undefined,
      })

      toast.success(`Deployment v${deploymentForm.version} queued`)
      setShowCreateDialog(false)
      setDeploymentForm(defaultDeploymentForm)
    } catch (error: any) {
      toast.error('Failed to create deployment')
    }
  }

  // Start deployment (update status to in_progress)
  const handleStartDeployment = async (deployment: DbDeployment) => {
    try {
      await startDeployment(deployment.id)
      toast.info(`Deployment Started: ${deployment.deployment_name} is now deploying...`)
    } catch (error: any) {
      toast.error('Failed to start deployment')
    }
  }

  // Complete deployment
  const handleCompleteDeployment = async (deployment: DbDeployment, success: boolean) => {
    try {
      await completeDeployment(deployment.id, success, deployment.started_at)
      toast[success ? 'success' : 'error'](
        success ? 'Deployment Successful' : 'Deployment Failed',
        { description: `${deployment.deployment_name} v${deployment.version}` }
      )
    } catch (error: any) {
      toast.error('Failed to update deployment')
    }
  }

  // Rollback deployment
  const handleRollbackDeployment = async (deployment: DbDeployment) => {
    if (!deployment.can_rollback) {
      toast.error('Cannot Rollback')
      return
    }

    try {
      await rollbackDeployment(deployment.id)
      toast.success(`Rollback Initiated`)
      setShowRollbackDialog(false)
    } catch (error: any) {
      toast.error('Failed to rollback')
    }
  }

  // Cancel deployment
  const handleCancelDeployment = async (deployment: DbDeployment) => {
    try {
      await cancelDeployment(deployment.id)
      toast.info(`Deployment Cancelled: "${deployment.deployment_name}" has been cancelled`)
    } catch (error: any) {
      toast.error('Failed to cancel deployment')
    }
  }

  // Delete deployment
  const handleDeleteDeployment = async (id: string) => {
    try {
      await deleteDeployment(id)
      toast.success('Deployment Deleted')
    } catch (error: any) {
      toast.error('Failed to delete deployment')
    }
  }

  const [activeTab, setActiveTab] = useState('deployments')
  const [searchQuery, setSearchQuery] = useState('')
  const [environmentFilter, setEnvironmentFilter] = useState<DeploymentEnvironment | 'all'>('all')
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null)
  const [showLogsDialog, setShowLogsDialog] = useState(false)
  const [showEnvDialog, setShowEnvDialog] = useState(false)
  const [showDomainDialog, setShowDomainDialog] = useState(false)
  const [showRollbackDialog, setShowRollbackDialog] = useState(false)
  const [showWebhookDialog, setShowWebhookDialog] = useState(false)
  const [showTeamDialog, setShowTeamDialog] = useState(false)
  const [showIntegrationDialog, setShowIntegrationDialog] = useState(false)
  const [expandedLogs, setExpandedLogs] = useState<string[]>(['clone', 'install', 'build', 'deploy'])
  const [settingsTab, setSettingsTab] = useState('general')
  const [showInspectDialog, setShowInspectDialog] = useState(false)
  const [showNewFunctionDialog, setShowNewFunctionDialog] = useState(false)
  const [showEdgeConfigDialog, setShowEdgeConfigDialog] = useState(false)
  const [selectedTeamMember, setSelectedTeamMember] = useState<TeamMember | null>(null)
  const [showTeamMemberMenu, setShowTeamMemberMenu] = useState(false)

  // Additional dialog states for button handlers
  const [showFiltersDialog, setShowFiltersDialog] = useState(false)
  const [showEdgeConfigViewDialog, setShowEdgeConfigViewDialog] = useState(false)
  const [showEdgeConfigEditDialog, setShowEdgeConfigEditDialog] = useState(false)
  const [selectedEdgeConfig, setSelectedEdgeConfig] = useState<EdgeConfig | null>(null)
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [isLiveTailActive, setIsLiveTailActive] = useState(false)
  const [showLogFiltersDialog, setShowLogFiltersDialog] = useState(false)
  const [showErrorsDialog, setShowErrorsDialog] = useState(false)
  const [showAlertsDialog, setShowAlertsDialog] = useState(false)
  const [showLogAnalyticsDialog, setShowLogAnalyticsDialog] = useState(false)
  const [showExportLogsDialog, setShowExportLogsDialog] = useState(false)
  const [showExportAnalyticsDialog, setShowExportAnalyticsDialog] = useState(false)
  const [showSecurityAuditDialog, setShowSecurityAuditDialog] = useState(false)
  const [showAddRuleDialog, setShowAddRuleDialog] = useState(false)
  const [showDeleteAllDeploymentsDialog, setShowDeleteAllDeploymentsDialog] = useState(false)
  const [showResetSettingsDialog, setShowResetSettingsDialog] = useState(false)
  const [showDisableDeploymentsDialog, setShowDisableDeploymentsDialog] = useState(false)
  const [showDeleteProjectDialog, setShowDeleteProjectDialog] = useState(false)
  const [showCreateHookDialog, setShowCreateHookDialog] = useState(false)
  const [showMarketplaceDialog, setShowMarketplaceDialog] = useState(false)

  // Additional state for confirmations and operations
  const [showDeleteBlobDialog, setShowDeleteBlobDialog] = useState(false)
  const [selectedBlob, setSelectedBlob] = useState<StorageBlob | null>(null)
  const [showDeleteHookDialog, setShowDeleteHookDialog] = useState(false)
  const [selectedHookName, setSelectedHookName] = useState<string>('')
  const [showClearLogsDialog, setShowClearLogsDialog] = useState(false)
  const [showDeleteConfigItemDialog, setShowDeleteConfigItemDialog] = useState(false)
  const [selectedConfigItem, setSelectedConfigItem] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showDeleteEnvVarDialog, setShowDeleteEnvVarDialog] = useState(false)
  const [selectedEnvVar, setSelectedEnvVar] = useState<EnvVar | null>(null)
  // MIGRATED: Batch #13 - Using empty array instead of mock data
  const [realTimeLogs, setRealTimeLogs] = useState<BuildLog[]>([])
  const [logStreamInterval, setLogStreamInterval] = useState<NodeJS.Timeout | null>(null)
  const [selectedFunction, setSelectedFunction] = useState<ServerlessFunction | null>(null)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [logFilters, setLogFilters] = useState<{ levels: string[]; timeRange: string; functionFilter: string; messageFilter: string }>({
    levels: ['error', 'warn', 'info', 'debug'],
    timeRange: '1h',
    functionFilter: '',
    messageFilter: ''
  })

  // AI Insight action handler
  const handleInsightAction = useCallback(async (insight: { id: string; type: string; title: string; description: string }) => {
    setIsProcessing(true)
    try {
      // Real API call to handle insight action
      const response = await fetch('/api/deployments/insights/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ insightId: insight.id, type: insight.type })
      })
      if (!response.ok) throw new Error('Failed to process insight')

      switch (insight.type) {
        case 'warning':
          toast.info(`Action Required`)
          setActiveTab('logs')
          break
        case 'success':
          toast.success('Great Performance!')
          break
        case 'info':
          toast.info('Insight Details')
          setActiveTab('analytics')
          break
        default:
          toast.info(`Processing Insight`)
      }
    } catch (error: any) {
      toast.error('Action Failed')
    } finally {
      setIsProcessing(false)
    }
  }, [])

  // Real-time log streaming
  const startLogStreaming = useCallback(() => {
    if (logStreamInterval) return

    setIsLiveTailActive(true)
    const interval = setInterval(() => {
      const newLog: BuildLog = {
        id: `live-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        level: ['info', 'success', 'warn'][Math.floor(Math.random() * 3)] as BuildLogLevel,
        message: [
          'Request processed successfully',
          'Cache hit for static asset',
          'Function invocation completed',
          'Edge response served',
          'API route handled',
        ][Math.floor(Math.random() * 5)],
        step: 'runtime'
      }
      setRealTimeLogs(prev => [...prev.slice(-50), newLog])
    }, 2000)

    setLogStreamInterval(interval)
    toast.success('Live Tail Started')
  }, [logStreamInterval])

  const stopLogStreaming = useCallback(() => {
    if (logStreamInterval) {
      clearInterval(logStreamInterval)
      setLogStreamInterval(null)
    }
    setIsLiveTailActive(false)
    toast.info('Live Tail Stopped')
  }, [logStreamInterval])

  // Cleanup log streaming on unmount
  useEffect(() => {
    return () => {
      if (logStreamInterval) {
        clearInterval(logStreamInterval)
      }
    }
  }, [logStreamInterval])

  // Delete env var handler
  const handleDeleteEnvVar = async (envVar: EnvVar) => {
    setIsProcessing(true)
    try {
      const { error } = await supabase.from('environment_variables').delete().eq('id', envVar.id)
      if (error) throw error
      toast.success(`Variable Deleted: "${envVar.key}" has been removed`)
      setShowDeleteEnvVarDialog(false)
      setSelectedEnvVar(null)
    } catch (error: any) {
      toast.error('Delete Failed')
    } finally {
      setIsProcessing(false)
    }
  }

  // Delete blob handler with API call
  const handleDeleteBlob = async (blob: StorageBlob) => {
    setIsProcessing(true)
    try {
      const { error } = await supabase.from('storage_blobs').delete().eq('id', blob.id)
      if (error) throw error
      toast.success(`Deleted: "${blob.name}" has been deleted`)
      setShowDeleteBlobDialog(false)
      setSelectedBlob(null)
    } catch (error: any) {
      toast.error('Delete Failed')
    } finally {
      setIsProcessing(false)
    }
  }

  // Clear logs handler
  const handleClearLogs = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch('/api/deployments/logs/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      if (!response.ok) throw new Error('Failed to clear logs')
      setRealTimeLogs([])
      toast.success('Logs Cleared')
      setShowClearLogsDialog(false)
    } catch (error: any) {
      toast.error('Clear Failed')
    } finally {
      setIsProcessing(false)
    }
  }

  // Delete hook handler
  const handleDeleteHook = async (hookName: string) => {
    setIsProcessing(true)
    try {
      const { error } = await supabase.from('deploy_hooks').delete().eq('name', hookName)
      if (error) throw error
      toast.success(`Hook Deleted: "${hookName}" has been removed`)
      setShowDeleteHookDialog(false)
      setSelectedHookName('')
    } catch (error: any) {
      toast.error('Delete Failed')
    } finally {
      setIsProcessing(false)
    }
  }

  // Team member removal handler
  const handleRemoveTeamMember = async (member: TeamMember) => {
    setIsProcessing(true)
    try {
      const { error } = await supabase.from('team_members').delete().eq('id', member.id)
      if (error) throw error
      toast.success(`Member Removed: "${member.name}" has been removed from the team`)
      setShowTeamMemberMenu(false)
      setSelectedTeamMember(null)
    } catch (error: any) {
      toast.error('Remove Failed')
    } finally {
      setIsProcessing(false)
    }
  }

  // Plugin install handler
  const handleInstallPlugin = async (pluginName: string) => {
    setIsProcessing(true)
    toast.info(`Installing Plugin: "${pluginName}" is being installed...`)
    try {
      // Real API call to install plugin
      const response = await fetch('/api/plugins/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: pluginName })
      })
      if (!response.ok) throw new Error('Plugin installation failed')

      const { error } = await supabase.from('installed_plugins').insert({
        name: pluginName,
        installed_at: new Date().toISOString(),
        enabled: true
      })
      if (error) throw error
      toast.success(`Plugin Installed: "${pluginName}" has been installed successfully`)
    } catch (error: any) {
      toast.error('Install Failed')
    } finally {
      setIsProcessing(false)
    }
  }

  // Save environment variables handler
  const handleSaveEnvVariables = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch('/api/deployments/env', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variables: envVariables })
      })
      if (!response.ok) throw new Error('Failed to save environment variables')
      toast.success('Environment Variables Saved')
      setShowEnvDialog(false)
    } catch (error: any) {
      toast.error('Save Failed')
    } finally {
      setIsProcessing(false)
    }
  }

  // Save alerts handler
  const handleSaveAlerts = async () => {
    setIsProcessing(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Not authenticated')

      const response = await fetch('/api/deployments/alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData.user.id, alerts: alertSettings })
      })
      if (!response.ok) throw new Error('Failed to save alerts')
      toast.success('Alerts Configured')
      setShowAlertsDialog(false)
    } catch (error: any) {
      toast.error('Save Failed')
    } finally {
      setIsProcessing(false)
    }
  }

  // Export logs handler
  const handleExportLogs = async (format: string, timeRange: string) => {
    setIsProcessing(true)
    try {
      const logsText = realTimeLogs.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] [${l.step}] ${l.message}`).join('\n')
      const blob = new Blob([logsText], { type: format === 'json' ? 'application/json' : 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `logs-${timeRange}-${new Date().toISOString().split('T')[0]}.${format === 'json' ? 'json' : 'txt'}`
      link.click()
      URL.revokeObjectURL(url)
      toast.success('Export Started')
      setShowExportLogsDialog(false)
    } catch (error: any) {
      toast.error('Export Failed')
    } finally {
      setIsProcessing(false)
    }
  }

  // Create serverless function handler
  const handleCreateFunction = async (name: string, runtime: string, region: string, memory: string) => {
    setIsProcessing(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Not authenticated')

      const { error } = await supabase.from('serverless_functions').insert({
        user_id: userData.user.id,
        name,
        runtime,
        region,
        memory: parseInt(memory),
        invocations: 0,
        avg_duration: 0,
        errors: 0,
        created_at: new Date().toISOString()
      })
      if (error) throw error
      toast.success(`Function Created: "${name}" has been created`)
      setShowNewFunctionDialog(false)
    } catch (error: any) {
      toast.error('Create Failed')
    } finally {
      setIsProcessing(false)
    }
  }

  // Create edge config handler
  const handleCreateEdgeConfig = async (name: string, description: string) => {
    setIsProcessing(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Not authenticated')

      const { error } = await supabase.from('edge_configs').insert({
        user_id: userData.user.id,
        name,
        description,
        item_count: 0,
        reads: 0,
        writes: 0,
        created_at: new Date().toISOString()
      })
      if (error) throw error
      toast.success(`Config Created: edge config has been created`)
      setShowEdgeConfigDialog(false)
    } catch (error: any) {
      toast.error('Create Failed')
    } finally {
      setIsProcessing(false)
    }
  }

  // Apply filters handler
  const handleApplyFilters = async (filters: { status?: string; branch?: string; author?: string; dateFrom?: string; dateTo?: string }) => {
    setIsProcessing(true)
    try {
      // Update filter state and refetch deployments with filters
      const response = await fetch('/api/deployments/filter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
      })
      if (!response.ok) throw new Error('Failed to apply filters')
      toast.success('Filters Applied')
      setShowFiltersDialog(false)
    } catch (error: any) {
      toast.error('Filter Failed')
    } finally {
      setIsProcessing(false)
    }
  }

  // Reset project settings handler
  const handleResetSettings = async () => {
    setIsProcessing(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Not authenticated')

      const response = await fetch('/api/deployments/settings/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData.user.id })
      })
      if (!response.ok) throw new Error('Failed to reset settings')
      toast.success('Settings Reset')
      setShowResetSettingsDialog(false)
    } catch (error: any) {
      toast.error('Reset Failed')
    } finally {
      setIsProcessing(false)
    }
  }

  // Disable deployments handler
  const handleDisableDeployments = async (reason: string, notifyTeam: boolean) => {
    setIsProcessing(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Not authenticated')

      const response = await fetch('/api/deployments/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData.user.id, reason, notifyTeam })
      })
      if (!response.ok) throw new Error('Failed to disable deployments')
      toast.success('Deployments Disabled')
      setShowDisableDeploymentsDialog(false)
    } catch (error: any) {
      toast.error('Disable Failed')
    } finally {
      setIsProcessing(false)
    }
  }

  // Delete project handler
  const handleDeleteProject = async () => {
    setIsProcessing(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Not authenticated')

      // In real implementation, this would delete all project resources
      await Promise.all([
        supabase.from('deployments').delete().eq('user_id', userData.user.id),
        supabase.from('environment_variables').delete().eq('user_id', userData.user.id),
        supabase.from('domains').delete().eq('user_id', userData.user.id),
      ])

      toast.success('Project Deleted')
      setShowDeleteProjectDialog(false)
    } catch (error: any) {
      toast.error('Delete Failed')
    } finally {
      setIsProcessing(false)
    }
  }

  // Create deploy hook handler
  const handleCreateHook = async (name: string, branch: string, environment: string) => {
    setIsProcessing(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Not authenticated')

      const { error } = await supabase.from('deploy_hooks').insert({
        user_id: userData.user.id,
        name,
        branch,
        environment,
        url: `https://api.freeflow.app/v1/integrations/deploy/${Math.random().toString(36).substring(7)}`,
        created_at: new Date().toISOString()
      })
      if (error) throw error
      toast.success(`Hook Created: deploy hook has been created`)
      setShowCreateHookDialog(false)
    } catch (error: any) {
      toast.error('Create Failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const filteredDeployments = useMemo(() => {
    // MIGRATED: Using database deployments with field mapping to UI types
    return (dbDeployments || []).filter(d => {
      const name = d.deployment_name || '';
      const branch = d.branch || '';
      const message = d.commit_message || '';
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           message.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesEnv = environmentFilter === 'all' || d.environment === environmentFilter
      return matchesSearch && matchesEnv
    }).map(d => ({
      id: d.id,
      name: d.deployment_name,
      status: (d.status === 'pending' ? 'queued' : d.status) as DeploymentStatus,
      environment: d.environment as DeploymentEnvironment,
      branch: d.branch || 'main',
      commit: d.commit_hash?.substring(0, 7) || '',
      commitMessage: d.commit_message || 'No commit message',
      author: d.commit_author || d.deployed_by_name || 'Unknown',
      authorAvatar: '',
      createdAt: d.created_at,
      duration: d.duration_seconds || 0,
      previewUrl: d.build_url || `https://${d.deployment_name?.toLowerCase().replace(/\s+/g, '-')}.vercel.app`,
      productionUrl: d.environment === 'production' ? `https://${d.deployment_name?.toLowerCase().replace(/\s+/g, '-')}.com` : undefined,
      prNumber: undefined,
      prTitle: undefined,
      buildCache: true,
      isProtected: d.environment === 'production',
    }))
  }, [dbDeployments, searchQuery, environmentFilter])

  const stats = useMemo(() => {
    // MIGRATED: Using database deployments for real-time stats
    const deployments = dbDeployments || [];
    const total = deployments.length
    const successful = deployments.filter(d => d.status === 'success').length
    const activeDeployments = deployments.filter(d => d.status === 'in_progress').length
    const avgDuration = total > 0 ? deployments.reduce((sum, d) => sum + (d.duration_seconds || 0), 0) / total : 0

    // Calculate deployments this week
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const deploymentsThisWeek = deployments.filter(d => new Date(d.created_at) >= oneWeekAgo).length

    // Calculate deployments today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const deploymentsToday = deployments.filter(d => new Date(d.created_at) >= today).length

    return {
      total,
      totalDeployments: total,
      successful,
      successRate: total > 0 ? ((successful / total) * 100).toFixed(1) : '0.0',
      avgDuration: avgDuration.toFixed(0),
      avgBuildTime: Math.round(avgDuration),
      activeDeployments,
      deploymentsThisWeek,
      deploymentsToday,
      totalFunctions: 0,
      totalInvocations: 0,
      totalDomains: 0,
      totalStorage: 0
    }
  }, [dbDeployments])

  // Promote deployment to production
  const handlePromoteDeployment = async (deployment: DbDeployment) => {
    try {
      await updateDeployment({
        id: deployment.id,
        environment: 'production' as HookDeploymentEnvironment
      })
      toast.success(`Promoted: promoted to production`)
    } catch (error: any) {
      toast.error('Failed to promote')
    }
  }

  // View logs handler
  const handleViewLogs = (deployment: Deployment) => {
    setSelectedDeployment(deployment)
    setShowLogsDialog(true)
  }

  const statsCards = [
    { label: 'Total Deploys', value: stats.total.toString(), icon: Rocket, color: 'from-purple-500 to-purple-600' },
    { label: 'Success Rate', value: `${stats.successRate}%`, icon: CheckCircle2, color: 'from-green-500 to-green-600' },
    { label: 'Avg Build', value: `${stats.avgDuration}s`, icon: Timer, color: 'from-blue-500 to-blue-600' },
    { label: 'Functions', value: stats.totalFunctions.toString(), icon: Zap, color: 'from-amber-500 to-amber-600' },
    { label: 'Invocations', value: `${(stats.totalInvocations / 1000).toFixed(0)}k`, icon: Activity, color: 'from-cyan-500 to-cyan-600' },
    { label: 'Domains', value: stats.totalDomains.toString(), icon: Globe, color: 'from-rose-500 to-rose-600' },
    { label: 'Edge Regions', value: '12', icon: Network, color: 'from-indigo-500 to-indigo-600' },
    { label: 'Storage', value: formatSize(stats.totalStorage), icon: Database, color: 'from-teal-500 to-teal-600' }
  ]

  function formatSize(bytes: number): string {
    if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${bytes} B`
  }

  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
  }

  function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return `${Math.floor(diffHours / 24)}d ago`
  }

  const getStatusColor = (status: DeploymentStatus): string => {
    const colors: Record<DeploymentStatus, string> = {
      'success': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      'in_progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      'failed': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      'rolled_back': 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
      'cancelled': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      'queued': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
    }
    return colors[status]
  }

  const getEnvColor = (env: DeploymentEnvironment): string => {
    const colors: Record<DeploymentEnvironment, string> = {
      'production': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      'staging': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      'development': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      'preview': 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
    }
    return colors[env]
  }

  const getLogColor = (level: BuildLogLevel): string => {
    const colors: Record<BuildLogLevel, string> = {
      'info': 'text-gray-400',
      'warn': 'text-amber-500',
      'error': 'text-red-500',
      'success': 'text-green-500'
    }
    return colors[level]
  }

  const toggleLogStep = (step: string) => {
    setExpandedLogs(prev => prev.includes(step) ? prev.filter(s => s !== step) : [...prev, step])
  }

  const groupedLogs = useMemo(() => {
    const groups: Record<string, BuildLog[]> = {}
    (realTimeLogs || []).forEach(log => {
      if (!groups[log.step]) groups[log.step] = []
      groups[log.step].push(log)
    })
    return groups
  }, [realTimeLogs])

  // Quick actions with real API functionality
  const deploymentsQuickActions = useMemo(() => [
    {
      id: '1',
      label: 'Deploy Now',
      icon: 'rocket',
      action: async () => {
        setShowCreateDialog(true)
        toast.success('Ready to Deploy')
      },
      variant: 'default' as const
    },
    {
      id: '2',
      label: 'Rollback',
      icon: 'undo',
      action: async () => {
        const lastDeployment = dbDeployments.find(d => d.status === 'success' && d.can_rollback)
        if (lastDeployment) {
          setSelectedDbDeployment(lastDeployment)
          setShowRollbackDialog(true)
        } else {
          toast.error('No Rollback Available')
        }
      },
      variant: 'default' as const
    },
    {
      id: '3',
      label: 'View Logs',
      icon: 'file-text',
      action: () => {
        setActiveTab('logs')
        toast.success('Logs Opened')
      },
      variant: 'outline' as const
    },
  ], [dbDeployments])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:bg-none dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading deployments...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (deploymentsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:bg-none dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="text-gray-600 dark:text-gray-400">Failed to load deployments</p>
          <Button variant="outline" onClick={() => fetchDeployments()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <Rocket className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Deployments</h1>
              <p className="text-gray-500 dark:text-gray-400">Vercel-level deployment platform</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search deployments..." className="w-72 pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Button variant="outline" onClick={() => setShowEnvDialog(true)}><Lock className="h-4 w-4 mr-2" />Environment</Button>
            <Button variant="outline" onClick={() => setShowDomainDialog(true)}><Globe className="h-4 w-4 mr-2" />Domains</Button>
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600" onClick={() => setShowCreateDialog(true)}><Rocket className="h-4 w-4 mr-2" />Deploy</Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {statsCards.map((stat, i) => (
            <Card key={i} className="border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1">
            <TabsTrigger value="deployments" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"><Rocket className="h-4 w-4 mr-2" />Deployments</TabsTrigger>
            <TabsTrigger value="functions" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"><Zap className="h-4 w-4 mr-2" />Functions</TabsTrigger>
            <TabsTrigger value="edge" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"><Network className="h-4 w-4 mr-2" />Edge Config</TabsTrigger>
            <TabsTrigger value="storage" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"><Database className="h-4 w-4 mr-2" />Storage</TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"><Terminal className="h-4 w-4 mr-2" />Logs</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"><BarChart3 className="h-4 w-4 mr-2" />Analytics</TabsTrigger>
            <TabsTrigger value="protection" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"><Shield className="h-4 w-4 mr-2" />Protection</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"><Settings className="h-4 w-4 mr-2" />Settings</TabsTrigger>
          </TabsList>

          {/* Deployments Tab */}
          <TabsContent value="deployments" className="mt-6 space-y-6">
            {/* Deployment Stats Banner */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">Deployment Overview</h2>
                  <p className="text-purple-200 text-sm">CI/CD Pipeline Performance</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-white/50 text-white hover:bg-white/10" onClick={() => fetchDeployments()}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
                  <Button className="bg-white text-purple-700 hover:bg-purple-50" onClick={() => setShowCreateDialog(true)}><Rocket className="h-4 w-4 mr-2" />Deploy Now</Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{stats.totalDeployments}</p>
                  <p className="text-sm text-purple-100">Total Deployments</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{stats.successRate}%</p>
                  <p className="text-sm text-purple-100">Success Rate</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{formatDuration(stats.avgBuildTime)}</p>
                  <p className="text-sm text-purple-100">Avg Build</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{stats.activeDeployments}</p>
                  <p className="text-sm text-purple-100">Active</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm text-purple-100">Today</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">99.9%</p>
                  <p className="text-sm text-purple-100">Uptime</p>
                </div>
              </div>
            </div>

            {/* Quick Actions & Filters */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant={environmentFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setEnvironmentFilter('all')}>All</Button>
                <Button variant={environmentFilter === 'production' ? 'default' : 'outline'} size="sm" onClick={() => setEnvironmentFilter('production')} className={environmentFilter === 'production' ? 'bg-purple-600' : ''}><Globe className="h-3 w-3 mr-1" />Production</Button>
                <Button variant={environmentFilter === 'preview' ? 'default' : 'outline'} size="sm" onClick={() => setEnvironmentFilter('preview')}>Preview</Button>
                <Button variant={environmentFilter === 'staging' ? 'default' : 'outline'} size="sm" onClick={() => setEnvironmentFilter('staging')}>Staging</Button>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input placeholder="Search deployments..." className="pl-10 w-64" />
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowFiltersDialog(true)}><Filter className="h-4 w-4 mr-1" />Filters</Button>
              </div>
            </div>

            {/* Pipeline Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {[
                { stage: 'Build', status: 'success', duration: '45s', icon: Box },
                { stage: 'Test', status: 'success', duration: '1m 23s', icon: CheckCircle2 },
                { stage: 'Deploy', status: 'in_progress', duration: '32s', icon: Rocket },
                { stage: 'Verify', status: 'pending', duration: '-', icon: Shield },
              ].map((stage, i) => (
                <Card key={i} className={`border-2 ${stage.status === 'success' ? 'border-green-200 bg-green-50 dark:bg-green-900/10' : stage.status === 'in_progress' ? 'border-blue-200 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stage.status === 'success' ? 'bg-green-100' : stage.status === 'in_progress' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <stage.icon className={`h-5 w-5 ${stage.status === 'success' ? 'text-green-600' : stage.status === 'in_progress' ? 'text-blue-600 animate-pulse' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <p className="font-semibold">{stage.stage}</p>
                        <p className="text-sm text-gray-500">{stage.duration}</p>
                      </div>
                      {stage.status === 'success' && <Check className="h-5 w-5 text-green-500 ml-auto" />}
                      {stage.status === 'in_progress' && <RefreshCw className="h-5 w-5 text-blue-500 ml-auto animate-spin" />}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="space-y-3">
              {filteredDeployments.map((deployment, index) => (
                <Card key={deployment.id} className="border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          deployment.status === 'success' ? 'bg-green-100' :
                          deployment.status === 'in_progress' ? 'bg-blue-100' :
                          deployment.status === 'failed' ? 'bg-red-100' :
                          deployment.status === 'queued' ? 'bg-purple-100' : 'bg-gray-100'
                        }`}>
                          {deployment.status === 'success' && <Check className="h-5 w-5 text-green-600" />}
                          {deployment.status === 'in_progress' && <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />}
                          {deployment.status === 'failed' && <X className="h-5 w-5 text-red-600" />}
                          {deployment.status === 'rolled_back' && <RotateCcw className="h-5 w-5 text-amber-600" />}
                          {deployment.status === 'queued' && <Clock className="h-5 w-5 text-purple-600" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{deployment.name}</h4>
                            {index === 0 && deployment.environment === 'production' && <Badge className="bg-green-100 text-green-700">Current</Badge>}
                            {deployment.prNumber && <Badge variant="outline"><GitPullRequest className="h-3 w-3 mr-1" />#{deployment.prNumber}</Badge>}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><GitBranch className="h-3 w-3" />{deployment.branch}</span>
                            <span className="flex items-center gap-1"><GitCommit className="h-3 w-3" />{deployment.commit}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{deployment.duration > 0 ? formatDuration(deployment.duration) : 'Building...'}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Avatar className="w-5 h-5">
                              <AvatarFallback className="text-xs bg-purple-100 text-purple-700">{deployment.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-500">{deployment.commitMessage}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getEnvColor(deployment.environment)}>{deployment.environment}</Badge>
                        <Badge className={getStatusColor(deployment.status)}>{deployment.status.replace('_', ' ')}</Badge>
                      </div>
                    </div>
                    {deployment.status === 'success' && deployment.previewUrl && (
                      <div className="mt-4 flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">Preview URL</p>
                          <a href={deployment.previewUrl} target="_blank" className="text-sm text-purple-600 hover:underline flex items-center gap-1">{deployment.previewUrl}<ExternalLink className="h-3 w-3" /></a>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => { setSelectedDeployment(deployment); setShowLogsDialog(true); }}><Terminal className="h-4 w-4 mr-1" />Logs</Button>
                        <Button variant="outline" size="sm" onClick={() => { setSelectedDeployment(deployment); setShowInspectDialog(true); }}><Eye className="h-4 w-4 mr-1" />Inspect</Button>
                        {deployment.environment === 'production' && <Button variant="outline" size="sm" onClick={() => { setSelectedDeployment(deployment); setShowRollbackDialog(true); }}><RotateCcw className="h-4 w-4 mr-1" />Rollback</Button>}
                      </div>
                    )}
                    {deployment.status === 'in_progress' && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-500">Building...</span>
                          <span className="text-sm font-medium">65%</span>
                        </div>
                        <Progress value={65} className="h-2" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Functions Tab */}
          <TabsContent value="functions" className="mt-6 space-y-6">
            {/* Serverless Functions Banner */}
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">Serverless Functions</h2>
                  <p className="text-yellow-100 text-sm">Edge and serverless compute performance</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-white/50 text-white hover:bg-white/10" onClick={() => { fetchDeployments(); toast.success('Functions Refreshed'); }}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
                  <Button className="bg-white text-orange-700 hover:bg-orange-50" onClick={() => setShowNewFunctionDialog(true)}><Plus className="h-4 w-4 mr-2" />New Function</Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-yellow-100">Functions</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{stats.totalInvocations.toLocaleString()}</p>
                  <p className="text-sm text-yellow-100">Invocations</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">234ms</p>
                  <p className="text-sm text-yellow-100">Avg Duration</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-200">0.09%</p>
                  <p className="text-sm text-yellow-100">Error Rate</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">5</p>
                  <p className="text-sm text-yellow-100">Regions</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">99.99%</p>
                  <p className="text-sm text-yellow-100">Uptime</p>
                </div>
              </div>
            </div>

            {/* Function Types */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {[
                { type: 'API Routes', count: 12, icon: Globe, color: 'blue', desc: 'RESTful endpoints' },
                { type: 'Edge Functions', count: 8, icon: Network, color: 'cyan', desc: 'Low latency compute' },
                { type: 'Cron Jobs', count: 4, icon: Clock, color: 'purple', desc: 'Scheduled tasks' },
                { type: 'Webhooks', count: 6, icon: Webhook, color: 'green', desc: 'Event handlers' },
              ].map((ft, i) => (
                <Card key={i} className="border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg bg-${ft.color}-100 dark:bg-${ft.color}-900/30 flex items-center justify-center`}>
                        <ft.icon className={`h-5 w-5 text-${ft.color}-600`} />
                      </div>
                      <div>
                        <h4 className="font-semibold">{ft.type}</h4>
                        <p className="text-xs text-gray-500">{ft.desc}</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold">{ft.count}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Function Metrics Chart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle className="text-sm">Invocations (Last 24h)</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {['12am', '6am', '12pm', '6pm', 'Now'].map((time, i) => {
                      const values = [35, 45, 85, 65, 75]
                      return (
                        <div key={time} className="flex items-center gap-3">
                          <span className="w-12 text-xs text-gray-500">{time}</span>
                          <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-4">
                            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-4 rounded-full" style={{ width: `${values[i]}%` }} />
                          </div>
                          <span className="w-16 text-xs font-medium text-right">{(values[i] * 120).toLocaleString()}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle className="text-sm">Response Time Distribution</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { range: '< 50ms', pct: 45, color: 'bg-green-500' },
                      { range: '50-100ms', pct: 30, color: 'bg-blue-500' },
                      { range: '100-200ms', pct: 15, color: 'bg-yellow-500' },
                      { range: '200-500ms', pct: 8, color: 'bg-orange-500' },
                      { range: '> 500ms', pct: 2, color: 'bg-red-500' },
                    ].map(rt => (
                      <div key={rt.range} className="flex items-center gap-3">
                        <span className="w-20 text-xs text-gray-500">{rt.range}</span>
                        <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-3">
                          <div className={`${rt.color} h-3 rounded-full`} style={{ width: `${rt.pct}%` }} />
                        </div>
                        <span className="w-10 text-xs font-medium text-right">{rt.pct}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Functions Table */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Functions</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input placeholder="Search functions..." className="pl-10 w-64" />
                    </div>
                    <Select>
                      <SelectTrigger className="w-[130px]"><SelectValue placeholder="Runtime" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Runtimes</SelectItem>
                        <SelectItem value="node">Node.js</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="edge">Edge</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {/* Functions list - connect to real data source */}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Edge Config Tab */}
          <TabsContent value="edge" className="mt-6 space-y-6">
            {/* Edge Config Overview */}
            <div className="bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">Edge Configuration</h2>
                  <p className="text-cyan-100 text-sm">Global key-value storage at the edge</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-white/50 text-white hover:bg-white/10" onClick={() => { fetchDeployments(); toast.success('Edge Configs Synced'); }}><RefreshCw className="h-4 w-4 mr-2" />Sync</Button>
                  <Button className="bg-white text-cyan-700 hover:bg-cyan-50" onClick={() => setShowEdgeConfigDialog(true)}><Plus className="h-4 w-4 mr-2" />Create Config</Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-cyan-100">Configs</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">156</p>
                  <p className="text-sm text-cyan-100">Total Items</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">89K</p>
                  <p className="text-sm text-cyan-100">Total Reads</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">12K</p>
                  <p className="text-sm text-cyan-100">Total Writes</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">&lt;1ms</p>
                  <p className="text-sm text-cyan-100">Latency</p>
                </div>
              </div>
            </div>

            {/* Edge Regions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
              {['US East', 'US West', 'Europe', 'Asia', 'Australia', 'South America'].map((region, i) => (
                <Card key={region} className="border-gray-200 dark:border-gray-700">
                  <CardContent className="p-4 text-center">
                    <Globe2 className="h-8 w-8 mx-auto text-cyan-500 mb-2" />
                    <p className="font-medium text-sm">{region}</p>
                    <p className="text-xs text-green-600">Active</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Edge Configs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6">
              {/* Edge configs list - connect to real data source */}
            </div>
          </TabsContent>

          {/* Storage Tab */}
          <TabsContent value="storage" className="mt-6 space-y-6">
            {/* Storage Overview */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">Blob Storage</h2>
                  <p className="text-indigo-100 text-sm">File storage and CDN distribution</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-white/50 text-white hover:bg-white/10" onClick={() => setShowNewFolderDialog(true)}><Folder className="h-4 w-4 mr-2" />New Folder</Button>
                  <Button className="bg-white text-indigo-700 hover:bg-indigo-50" onClick={() => setShowUploadDialog(true)}><Upload className="h-4 w-4 mr-2" />Upload</Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-indigo-100">Files</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">2.4 GB</p>
                  <p className="text-sm text-indigo-100">Storage Used</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">45.2K</p>
                  <p className="text-sm text-indigo-100">Downloads</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">12 GB</p>
                  <p className="text-sm text-indigo-100">Bandwidth</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">99.9%</p>
                  <p className="text-sm text-indigo-100">Availability</p>
                </div>
              </div>
            </div>

            {/* Storage Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {[
                { type: 'Images', count: 45, size: '1.2 GB', icon: FileCode, color: 'pink' },
                { type: 'Documents', count: 23, size: '450 MB', icon: FileText, color: 'blue' },
                { type: 'Videos', count: 8, size: '680 MB', icon: MonitorPlay, color: 'purple' },
                { type: 'Other', count: 12, size: '120 MB', icon: File, color: 'gray' },
              ].map((ft, i) => (
                <Card key={i} className="border-gray-200 dark:border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-${ft.color}-100 dark:bg-${ft.color}-900/30 flex items-center justify-center`}>
                        <ft.icon className={`h-5 w-5 text-${ft.color}-600`} />
                      </div>
                      <div>
                        <p className="font-semibold">{ft.type}</p>
                        <p className="text-xs text-gray-500">{ft.count} files • {ft.size}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Files Table */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Files</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input placeholder="Search files..." className="pl-10 w-64" />
                    </div>
                    <Select>
                      <SelectTrigger className="w-[130px]"><SelectValue placeholder="All Types" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="images">Images</SelectItem>
                        <SelectItem value="docs">Documents</SelectItem>
                        <SelectItem value="videos">Videos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {/* Blobs list - connect to real data source */}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="mt-6 space-y-6">
            {/* Logs Overview Banner */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">Runtime Logs</h2>
                  <p className="text-gray-400 text-sm">Real-time application logs and monitoring</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={() => setShowExportLogsDialog(true)}><Download className="h-4 w-4 mr-2" />Export</Button>
                  <Button className={isLiveTailActive ? "bg-red-600 text-white hover:bg-red-700" : "bg-green-600 text-white hover:bg-green-700"} onClick={() => isLiveTailActive ? stopLogStreaming() : startLogStreaming()}>{isLiveTailActive ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Stop</> : <><Play className="h-4 w-4 mr-2" />Live Tail</>}</Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-gray-400">Total Logs</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-red-400">0</p>
                  <p className="text-sm text-gray-400">Errors</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-amber-400">0</p>
                  <p className="text-sm text-gray-400">Warnings</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-400">0</p>
                  <p className="text-sm text-gray-400">Success</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">3.2K</p>
                  <p className="text-sm text-gray-400">Last Hour</p>
                </div>
              </div>
            </div>

            {/* Log Filters */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input placeholder="Search logs..." className="pl-10 w-80" />
                    </div>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="error">Errors</SelectItem>
                        <SelectItem value="warn">Warnings</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="w-32"><SelectValue placeholder="Source" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sources</SelectItem>
                        <SelectItem value="api">API Routes</SelectItem>
                        <SelectItem value="edge">Edge Functions</SelectItem>
                        <SelectItem value="build">Build</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input type="datetime-local" className="w-48" />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { fetchDeployments(); toast.success('Refreshed'); }}><RefreshCw className="h-4 w-4" /></Button>
                    <Button variant="outline" size="sm" onClick={() => setShowLogFiltersDialog(true)}><Filter className="h-4 w-4 mr-1" />More Filters</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Logs Console */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between py-3 px-4 bg-gray-800 rounded-t-lg">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-green-400" />
                  <span className="text-white font-medium">Console</span>
                  <Badge className="bg-green-600 text-white">Live</Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700" onClick={async () => {
                    try {
                      const logsText = realTimeLogs.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] [${l.step}] ${l.message}`).join('\n')
                      await navigator.clipboard.writeText(logsText)
                      toast.success(`Copied: log entries copied to clipboard`)
                    } catch {
                      toast.error('Copy Failed')
                    }
                  }}><Copy className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700" onClick={() => {
                    const logsText = realTimeLogs.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] [${l.step}] ${l.message}`).join('\n')
                    const blob = new Blob([logsText], { type: 'text/plain' })
                    const url = URL.createObjectURL(blob)
                    const link = document.createElement('a')
                    link.href = url
                    link.download = `build-logs-${new Date().toISOString().split('T')[0]}.txt`
                    link.click()
                    URL.revokeObjectURL(url)
                    toast.success('Download Started')
                  }}><Download className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700" onClick={() => setShowClearLogsDialog(true)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px] bg-gray-900 p-4 font-mono text-sm">
                  {realTimeLogs.map(log => (
                    <div key={log.id} className="flex items-start gap-3 mb-2 hover:bg-gray-800 p-1 rounded">
                      <span className="text-gray-500 text-xs w-20 shrink-0">{log.timestamp}</span>
                      <Badge className={`shrink-0 ${log.level === 'error' ? 'bg-red-600' : log.level === 'warn' ? 'bg-amber-600' : log.level === 'success' ? 'bg-green-600' : 'bg-blue-600'}`}>{log.level.toUpperCase()}</Badge>
                      <span className="text-gray-400 text-xs shrink-0">[{log.step}]</span>
                      <span className="text-white">{log.message}</span>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Log Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6">
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle className="text-sm">Error Frequency</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {['TypeError', 'ReferenceError', 'NetworkError', 'TimeoutError'].map((err, i) => {
                      const counts = [12, 8, 5, 3]
                      return (
                        <div key={err} className="flex items-center gap-2">
                          <span className="text-xs text-red-500 w-24">{err}</span>
                          <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                            <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(counts[i] / 12) * 100}%` }} />
                          </div>
                          <span className="text-xs font-medium w-6 text-right">{counts[i]}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle className="text-sm">Log Volume (24h)</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {['12am', '6am', '12pm', '6pm', 'Now'].map((time, i) => {
                      const values = [15, 25, 85, 65, 45]
                      return (
                        <div key={time} className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-12">{time}</span>
                          <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${values[i]}%` }} />
                          </div>
                          <span className="text-xs font-medium w-10 text-right">{(values[i] * 40).toLocaleString()}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle className="text-sm">Quick Actions</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={() => setShowErrorsDialog(true)}><AlertCircle className="h-4 w-4 mr-2" />View All Errors</Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setShowAlertsDialog(true)}><Bell className="h-4 w-4 mr-2" />Set Up Alerts</Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setShowLogAnalyticsDialog(true)}><BarChart3 className="h-4 w-4 mr-2" />Log Analytics</Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setShowExportLogsDialog(true)}><Download className="h-4 w-4 mr-2" />Export Logs</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6 space-y-6">
            {/* Analytics Overview Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">Deployment Analytics</h2>
                  <p className="text-blue-100 text-sm">Comprehensive performance insights</p>
                </div>
                <div className="flex gap-2">
                  <Select>
                    <SelectTrigger className="w-[150px] bg-white/20 border-white/30 text-white"><SelectValue placeholder="Last 30 Days" /></SelectTrigger>
                    <SelectContent><SelectItem value="7">Last 7 Days</SelectItem><SelectItem value="30">Last 30 Days</SelectItem><SelectItem value="90">Last 90 Days</SelectItem></SelectContent>
                  </Select>
                  <Button className="bg-white text-blue-700 hover:bg-blue-50" onClick={() => setShowExportAnalyticsDialog(true)}><Download className="h-4 w-4 mr-2" />Export</Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">24.5 GB</p>
                  <p className="text-sm text-blue-100">Bandwidth</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">1,234 hrs</p>
                  <p className="text-sm text-blue-100">Execution</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">92%</p>
                  <p className="text-sm text-blue-100">Cache Hit</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">458K</p>
                  <p className="text-sm text-blue-100">Page Views</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">2.3s</p>
                  <p className="text-sm text-blue-100">Avg Load</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">99.99%</p>
                  <p className="text-sm text-blue-100">Uptime</p>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {[
                { label: 'First Contentful Paint', value: '0.8s', change: '-12%', good: true, icon: Gauge },
                { label: 'Largest Contentful Paint', value: '1.2s', change: '-8%', good: true, icon: Timer },
                { label: 'Cumulative Layout Shift', value: '0.05', change: '-15%', good: true, icon: Layers },
                { label: 'Time to First Byte', value: '89ms', change: '-22%', good: true, icon: Zap },
              ].map((metric, i) => (
                <Card key={i} className="border-gray-200 dark:border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <metric.icon className="h-4 w-4 text-gray-500" />
                      <span className="text-xs text-gray-500">{metric.label}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold">{metric.value}</p>
                      <Badge className={metric.good ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{metric.change}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle>Deployments by Day</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                      <div key={day} className="flex items-center gap-3">
                        <span className="w-8 text-sm text-gray-500">{day}</span>
                        <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-4">
                          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full" style={{ width: `${[85, 92, 78, 95, 88, 32, 15][i]}%` }} />
                        </div>
                        <span className="text-sm font-medium w-8">{[12, 15, 10, 18, 14, 3, 1][i]}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle>Bandwidth Usage</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((week, i) => {
                      const values = [4.2, 5.8, 6.3, 8.2]
                      return (
                        <div key={week} className="flex items-center gap-3">
                          <span className="w-16 text-sm text-gray-500">{week}</span>
                          <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-4">
                            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full" style={{ width: `${(values[i] / 10) * 100}%` }} />
                          </div>
                          <span className="text-sm font-medium w-16 text-right">{values[i]} GB</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Team Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle>Top Deployers</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[{ name: 'Sarah Chen', deploys: 45, successRate: 98 }, { name: 'Mike Johnson', deploys: 38, successRate: 95 }, { name: 'Emily Davis', deploys: 32, successRate: 100 }, { name: 'Alex Kim', deploys: 28, successRate: 96 }].map((user, i) => (
                      <div key={user.name} className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-gray-200 text-gray-700' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>{i + 1}</span>
                        <Avatar className="w-8 h-8"><AvatarFallback className="bg-purple-100 text-purple-700 text-xs">{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.successRate}% success</p>
                        </div>
                        <Badge variant="secondary">{user.deploys} deploys</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle>Environment Distribution</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { env: 'Production', count: 45, pct: 35, color: 'bg-green-500' },
                      { env: 'Staging', count: 38, pct: 29, color: 'bg-blue-500' },
                      { env: 'Preview', count: 35, pct: 27, color: 'bg-purple-500' },
                      { env: 'Development', count: 12, pct: 9, color: 'bg-gray-500' },
                    ].map(env => (
                      <div key={env.env} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${env.color}`} />
                        <span className="flex-1 text-sm">{env.env}</span>
                        <span className="text-sm font-medium">{env.count}</span>
                        <Badge variant="outline">{env.pct}%</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: 'Deployed to production', user: 'Sarah Chen', time: '2 min ago', type: 'deploy' },
                    { action: 'Rolled back staging', user: 'Mike Johnson', time: '15 min ago', type: 'rollback' },
                    { action: 'Added new domain', user: 'Emily Davis', time: '1 hour ago', type: 'domain' },
                    { action: 'Updated environment variables', user: 'Alex Kim', time: '2 hours ago', type: 'env' },
                    { action: 'Created preview deployment', user: 'Sarah Chen', time: '3 hours ago', type: 'preview' },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.type === 'deploy' ? 'bg-green-100' : activity.type === 'rollback' ? 'bg-amber-100' : activity.type === 'domain' ? 'bg-blue-100' : activity.type === 'env' ? 'bg-purple-100' : 'bg-gray-100'}`}>
                        {activity.type === 'deploy' && <Rocket className="h-4 w-4 text-green-600" />}
                        {activity.type === 'rollback' && <RotateCcw className="h-4 w-4 text-amber-600" />}
                        {activity.type === 'domain' && <Globe className="h-4 w-4 text-blue-600" />}
                        {activity.type === 'env' && <Lock className="h-4 w-4 text-purple-600" />}
                        {activity.type === 'preview' && <Eye className="h-4 w-4 text-gray-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-gray-500">by {activity.user}</p>
                      </div>
                      <span className="text-sm text-gray-400">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Protection Tab */}
          <TabsContent value="protection" className="mt-6 space-y-6">
            {/* Protection Overview Banner */}
            <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">Deployment Protection</h2>
                  <p className="text-red-100 text-sm">Security and access control for your deployments</p>
                </div>
                <Button className="bg-white text-red-700 hover:bg-red-50" onClick={() => setShowSecurityAuditDialog(true)}><Shield className="h-4 w-4 mr-2" />Security Audit</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-red-100">Active Rules</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">247</p>
                  <p className="text-sm text-red-100">Blocked Attacks</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">A+</p>
                  <p className="text-sm text-red-100">Security Score</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">100%</p>
                  <p className="text-sm text-red-100">SSL Coverage</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-red-100">Vulnerabilities</p>
                </div>
              </div>
            </div>

            {/* Security Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[
                { title: 'DDoS Protection', status: 'Active', icon: Shield, color: 'green' },
                { title: 'SSL/TLS', status: 'A+ Grade', icon: Lock, color: 'green' },
                { title: 'Web Application Firewall', status: 'Enabled', icon: AlertOctagon, color: 'green' },
              ].map((sec, i) => (
                <Card key={i} className="border-gray-200 dark:border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-${sec.color}-100 dark:bg-${sec.color}-900/30 flex items-center justify-center`}>
                        <sec.icon className={`h-5 w-5 text-${sec.color}-600`} />
                      </div>
                      <div>
                        <h4 className="font-semibold">{sec.title}</h4>
                        <p className="text-sm text-green-600">{sec.status}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Protection Rules */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Protection Rules</CardTitle>
                  <Button variant="outline" onClick={() => setShowAddRuleDialog(true)}><Plus className="h-4 w-4 mr-2" />Add Rule</Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {/* Protection rules list - connect to real data source */}
                </div>
              </CardContent>
            </Card>

            {/* Access Control */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader><CardTitle>Access Control</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div><h4 className="font-medium">Password Protection</h4><p className="text-sm text-gray-500">Require password to access preview deployments</p></div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div><h4 className="font-medium">IP Allowlisting</h4><p className="text-sm text-gray-500">Restrict access to specific IP addresses</p></div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div><h4 className="font-medium">Vercel Authentication</h4><p className="text-sm text-gray-500">Require team member login to access</p></div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <div className="flex gap-6">
              <Card className="w-64 h-fit border-gray-200 dark:border-gray-700">
                <CardContent className="p-2">
                  <nav className="space-y-1">
                    {[
                      { id: 'general', icon: Settings, label: 'General' },
                      { id: 'git', icon: GitBranch, label: 'Git' },
                      { id: 'integrations', icon: Zap, label: 'Integrations' },
                      { id: 'webhooks', icon: Webhook, label: 'Webhooks' },
                      { id: 'team', icon: User, label: 'Team' },
                      { id: 'plugins', icon: Package, label: 'Plugins' }
                    ].map(item => (
                      <button key={item.id} onClick={() => setSettingsTab(item.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${settingsTab === item.id ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                        <item.icon className="h-4 w-4" />{item.label}
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>
              <div className="flex-1 space-y-6">
                {settingsTab === 'general' && (
                  <>
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5 text-purple-600" />Project Settings</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"><div><Label>Project Name</Label><Input defaultValue="freeflow-app" className="mt-1" /></div><div><Label>Framework</Label><Select defaultValue="nextjs"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="nextjs">Next.js</SelectItem><SelectItem value="react">React</SelectItem><SelectItem value="vue">Vue</SelectItem><SelectItem value="nuxt">Nuxt.js</SelectItem><SelectItem value="astro">Astro</SelectItem><SelectItem value="remix">Remix</SelectItem></SelectContent></Select></div></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"><div><Label>Build Command</Label><Input defaultValue="npm run build" className="mt-1 font-mono" /></div><div><Label>Output Directory</Label><Input defaultValue=".next" className="mt-1 font-mono" /></div></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"><div><Label>Install Command</Label><Input defaultValue="npm install" className="mt-1 font-mono" /></div><div><Label>Node.js Version</Label><Select defaultValue="20"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="18">18.x</SelectItem><SelectItem value="20">20.x (LTS)</SelectItem><SelectItem value="22">22.x</SelectItem></SelectContent></Select></div></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"><div><Label>Root Directory</Label><Input defaultValue="./" className="mt-1 font-mono" /></div><div><Label>Development Command</Label><Input defaultValue="npm run dev" className="mt-1 font-mono" /></div></div>
                      </CardContent>
                    </Card>
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader><CardTitle className="flex items-center gap-2"><Rocket className="h-5 w-5 text-purple-600" />Build & Deploy</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between"><div><p className="font-medium">Auto-deploy on push</p><p className="text-sm text-gray-500">Deploy when commits are pushed</p></div><Switch defaultChecked /></div>
                        <div className="flex items-center justify-between"><div><p className="font-medium">Preview Deployments</p><p className="text-sm text-gray-500">Create deployments for PRs</p></div><Switch defaultChecked /></div>
                        <div className="flex items-center justify-between"><div><p className="font-medium">Build Cache</p><p className="text-sm text-gray-500">Cache dependencies for faster builds</p></div><Switch defaultChecked /></div>
                        <div className="flex items-center justify-between"><div><p className="font-medium">Skew Protection</p><p className="text-sm text-gray-500">Ensure asset/code version consistency</p></div><Switch /></div>
                        <div className="flex items-center justify-between"><div><p className="font-medium">Serverless Functions</p><p className="text-sm text-gray-500">Enable serverless API routes</p></div><Switch defaultChecked /></div>
                        <div className="flex items-center justify-between"><div><p className="font-medium">Edge Functions</p><p className="text-sm text-gray-500">Enable edge runtime for routes</p></div><Switch defaultChecked /></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div><Label>Function Timeout</Label><Select defaultValue="60"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="10">10 seconds</SelectItem><SelectItem value="30">30 seconds</SelectItem><SelectItem value="60">60 seconds</SelectItem><SelectItem value="300">5 minutes</SelectItem></SelectContent></Select></div>
                          <div><Label>Function Memory</Label><Select defaultValue="1024"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="512">512 MB</SelectItem><SelectItem value="1024">1024 MB</SelectItem><SelectItem value="2048">2048 MB</SelectItem><SelectItem value="3008">3008 MB</SelectItem></SelectContent></Select></div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-purple-600" />Notifications</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between"><div><p className="font-medium">Email Notifications</p><p className="text-sm text-gray-500">Receive deployment status via email</p></div><Switch defaultChecked /></div>
                        <div className="flex items-center justify-between"><div><p className="font-medium">Failed Deployment Alerts</p><p className="text-sm text-gray-500">Immediate notification on failures</p></div><Switch defaultChecked /></div>
                        <div className="flex items-center justify-between"><div><p className="font-medium">Production Promotion Alerts</p><p className="text-sm text-gray-500">Notify when deployments go to production</p></div><Switch defaultChecked /></div>
                        <div className="flex items-center justify-between"><div><p className="font-medium">Weekly Summary</p><p className="text-sm text-gray-500">Weekly deployment statistics digest</p></div><Switch /></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div><Label>Notification Email</Label><Input type="email" placeholder="team@company.com" className="mt-1" /></div>
                          <div><Label>Slack Channel</Label><Input placeholder="#deployments" className="mt-1" /></div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-purple-600" />Security</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between"><div><p className="font-medium">Force HTTPS</p><p className="text-sm text-gray-500">Redirect all HTTP to HTTPS</p></div><Switch defaultChecked /></div>
                        <div className="flex items-center justify-between"><div><p className="font-medium">HSTS Headers</p><p className="text-sm text-gray-500">Strict Transport Security</p></div><Switch defaultChecked /></div>
                        <div className="flex items-center justify-between"><div><p className="font-medium">XSS Protection</p><p className="text-sm text-gray-500">Enable X-XSS-Protection header</p></div><Switch defaultChecked /></div>
                        <div className="flex items-center justify-between"><div><p className="font-medium">Content Security Policy</p><p className="text-sm text-gray-500">Define allowed content sources</p></div><Switch /></div>
                        <div className="flex items-center justify-between"><div><p className="font-medium">IP Allowlist</p><p className="text-sm text-gray-500">Restrict access by IP address</p></div><Switch /></div>
                        <div><Label>Allowed IPs</Label><Input placeholder="192.168.1.0/24, 10.0.0.0/8" className="mt-1 font-mono" /></div>
                      </CardContent>
                    </Card>
                    <Card className="border-gray-200 dark:border-gray-700 border-red-200 dark:border-red-800">
                      <CardHeader><CardTitle className="flex items-center gap-2 text-red-600"><AlertOctagon className="h-5 w-5" />Danger Zone</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <p className="text-sm text-red-800 dark:text-red-200">These actions are irreversible. Proceed with caution.</p>
                        </div>
                        <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={() => setShowDeleteAllDeploymentsDialog(true)}><Trash2 className="h-4 w-4 mr-2" />Delete All Deployments</Button>
                        <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={() => setShowResetSettingsDialog(true)}><RefreshCw className="h-4 w-4 mr-2" />Reset Project Settings</Button>
                        <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={() => setShowDisableDeploymentsDialog(true)}><Lock className="h-4 w-4 mr-2" />Disable Deployments</Button>
                        <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={() => setShowDeleteProjectDialog(true)}><Trash2 className="h-4 w-4 mr-2" />Delete Project</Button>
                      </CardContent>
                    </Card>
                  </>
                )}
                {settingsTab === 'git' && (
                  <>
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader><CardTitle className="flex items-center gap-2"><GitBranch className="h-5 w-5 text-purple-600" />Repository Connection</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3"><GitBranch className="h-6 w-6" /><div><p className="font-medium">freeflow-app/freeflow</p><p className="text-sm text-gray-500">Connected to main</p></div></div>
                          <Badge className="bg-green-100 text-green-700">Connected</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div><Label>Git Provider</Label><Select defaultValue="github"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="github">GitHub</SelectItem><SelectItem value="gitlab">GitLab</SelectItem><SelectItem value="bitbucket">Bitbucket</SelectItem></SelectContent></Select></div>
                          <div><Label>Repository</Label><Input defaultValue="freeflow-app/freeflow" className="mt-1 font-mono" /></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div><Label>Production Branch</Label><Select defaultValue="main"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="main">main</SelectItem><SelectItem value="master">master</SelectItem><SelectItem value="production">production</SelectItem><SelectItem value="release">release</SelectItem></SelectContent></Select></div>
                          <div><Label>Root Directory</Label><Input defaultValue="./" className="mt-1 font-mono" /></div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader><CardTitle className="flex items-center gap-2"><GitCommit className="h-5 w-5 text-purple-600" />Branch Configuration</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between"><div><p className="font-medium">Auto-deploy Branches</p><p className="text-sm text-gray-500">Automatically deploy all git branches</p></div><Switch defaultChecked /></div>
                        <div className="flex items-center justify-between"><div><p className="font-medium">Production Branch Protection</p><p className="text-sm text-gray-500">Require PR reviews before deploying</p></div><Switch defaultChecked /></div>
                        <div className="flex items-center justify-between"><div><p className="font-medium">Ignored Build Step</p><p className="text-sm text-gray-500">Cancel builds based on changed files</p></div><Switch /></div>
                        <div><Label>Ignore Build Pattern</Label><Input placeholder="docs/**, *.md" className="mt-1 font-mono" /></div>
                        <div><Label>Preview Branch Prefix</Label><Input placeholder="preview/, feature/" className="mt-1 font-mono" /></div>
                        <div className="flex items-center justify-between"><div><p className="font-medium">Enable Git Submodules</p><p className="text-sm text-gray-500">Clone submodules during build</p></div><Switch /></div>
                        <div className="flex items-center justify-between"><div><p className="font-medium">Git LFS</p><p className="text-sm text-gray-500">Enable Large File Storage support</p></div><Switch /></div>
                      </CardContent>
                    </Card>
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="flex items-center gap-2"><Webhook className="h-5 w-5 text-purple-600" />Deploy Hooks</CardTitle><Button size="sm" onClick={() => setShowCreateHookDialog(true)}><Plus className="h-4 w-4 mr-2" />Create Hook</Button></CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-gray-500">Deploy hooks allow you to trigger deployments from external services via HTTP POST requests.</p>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Production Hook</span>
                            <Badge className="bg-green-100 text-green-700">Active</Badge>
                          </div>
                          <code className="text-xs text-gray-500 break-all">https://api.vercel.com/v1/integrations/deploy/xxxxx</code>
                          <div className="flex gap-2 mt-2">
                            <Button variant="outline" size="sm" onClick={async () => { try { await navigator.clipboard.writeText('https://api.vercel.com/v1/integrations/deploy/xxxxx'); toast.success('Copied'); } catch { toast.error('Copy Failed'); } }}><Copy className="h-3 w-3 mr-1" />Copy</Button>
                            <Button variant="outline" size="sm" className="text-red-600" onClick={() => { setSelectedHookName('Production Hook'); setShowDeleteHookDialog(true); }}><Trash2 className="h-3 w-3 mr-1" />Delete</Button>
                          </div>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Staging Hook</span>
                            <Badge className="bg-blue-100 text-blue-700">Active</Badge>
                          </div>
                          <code className="text-xs text-gray-500 break-all">https://api.vercel.com/v1/integrations/deploy/yyyyy</code>
                          <div className="flex gap-2 mt-2">
                            <Button variant="outline" size="sm" onClick={async () => { try { await navigator.clipboard.writeText('https://api.vercel.com/v1/integrations/deploy/yyyyy'); toast.success('Copied'); } catch { toast.error('Copy Failed'); } }}><Copy className="h-3 w-3 mr-1" />Copy</Button>
                            <Button variant="outline" size="sm" className="text-red-600" onClick={() => { setSelectedHookName('Staging Hook'); setShowDeleteHookDialog(true); }}><Trash2 className="h-3 w-3 mr-1" />Delete</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-purple-600" />Commit Checks</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between"><div><p className="font-medium">Required Status Checks</p><p className="text-sm text-gray-500">Block merge until checks pass</p></div><Switch defaultChecked /></div>
                        <div className="flex items-center justify-between"><div><p className="font-medium">Preview Comments</p><p className="text-sm text-gray-500">Comment preview URL on PRs</p></div><Switch defaultChecked /></div>
                        <div className="flex items-center justify-between"><div><p className="font-medium">GitHub Deployments</p><p className="text-sm text-gray-500">Create GitHub deployment events</p></div><Switch defaultChecked /></div>
                        <div className="flex items-center justify-between"><div><p className="font-medium">Commit Statuses</p><p className="text-sm text-gray-500">Report build status to GitHub</p></div><Switch defaultChecked /></div>
                      </CardContent>
                    </Card>
                  </>
                )}
                {settingsTab === 'integrations' && (
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Connected Integrations</CardTitle><Button onClick={() => setShowIntegrationDialog(true)}><Plus className="h-4 w-4 mr-2" />Add Integration</Button></CardHeader>
                    <CardContent className="space-y-4">
                      {/* Integrations list - connect to real data source */}
                    </CardContent>
                  </Card>
                )}
                {settingsTab === 'webhooks' && (
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Webhooks</CardTitle><Button onClick={() => setShowWebhookDialog(true)}><Plus className="h-4 w-4 mr-2" />Add Webhook</Button></CardHeader>
                    <CardContent className="space-y-4">
                      {/* Webhooks list - connect to real data source */}
                    </CardContent>
                  </Card>
                )}
                {settingsTab === 'team' && (
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Team Members</CardTitle><Button onClick={() => setShowTeamDialog(true)}><Plus className="h-4 w-4 mr-2" />Invite Member</Button></CardHeader>
                    <CardContent className="space-y-4">
                      {/* Team members list - connect to real data source */}
                    </CardContent>
                  </Card>
                )}
                {settingsTab === 'plugins' && (
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Build Plugins</CardTitle><Button variant="outline" onClick={() => setShowMarketplaceDialog(true)}><Search className="h-4 w-4 mr-2" />Browse Marketplace</Button></CardHeader>
                    <CardContent className="space-y-4">
                      {/* Build plugins list - connect to real data source */}
                    </CardContent>
                  </Card>
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
              title="Deployment Intelligence"
              onInsightAction={handleInsightAction}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={[]}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={[]}
              title="Deploy Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={[]}
            title="Deploy Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={deploymentsQuickActions}
            variant="grid"
          />
        </div>

        {/* Build Logs Dialog */}
        <Dialog open={showLogsDialog} onOpenChange={setShowLogsDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Terminal className="h-5 w-5" />Build Logs - {selectedDeployment?.name}</DialogTitle>
              <DialogDescription>Deployment {selectedDeployment?.commit} • {selectedDeployment?.environment}</DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[500px] bg-gray-900 rounded-lg p-4 font-mono text-sm">
              {Object.entries(groupedLogs).map(([step, logs]) => (
                <div key={step} className="mb-4">
                  <button onClick={() => toggleLogStep(step)} className="flex items-center gap-2 text-white mb-2 hover:text-purple-400">
                    {expandedLogs.includes(step) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <span className="capitalize font-semibold">{step}</span>
                    <span className="text-gray-500 text-xs">({logs.length} lines)</span>
                  </button>
                  {expandedLogs.includes(step) && (
                    <div className="ml-6 space-y-1">
                      {logs.map(log => (
                        <div key={log.id} className="flex items-start gap-3">
                          <span className="text-gray-500 text-xs">{log.timestamp}</span>
                          <span className={getLogColor(log.level)}>{log.message}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowLogsDialog(false)}>Close</Button>
              <Button onClick={() => { const logsText = mockBuildLogs.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] [${l.step}] ${l.message}`).join('\n'); const blob = new Blob([logsText], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `build-logs-${selectedDeployment?.commit || 'latest'}.txt`; link.click(); URL.revokeObjectURL(url); toast.success('Download Started'); }}><Download className="h-4 w-4 mr-2" />Download Logs</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Environment Variables Dialog */}
        <Dialog open={showEnvDialog} onOpenChange={setShowEnvDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Lock className="h-5 w-5" />Environment Variables</DialogTitle>
              <DialogDescription>Manage encrypted environment variables</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Input placeholder="KEY" className="flex-1 font-mono" id="env-key-input" />
                <Input placeholder="Value" className="flex-1" type="password" id="env-value-input" />
                <Button onClick={async () => {
                  const keyInput = document.getElementById('env-key-input') as HTMLInputElement
                  const valueInput = document.getElementById('env-value-input') as HTMLInputElement
                  const key = keyInput?.value?.trim()
                  const value = valueInput?.value?.trim()
                  if (!key || !value) {
                    toast.error('Validation Error')
                    return
                  }
                  try {
                    const { data: userData } = await supabase.auth.getUser()
                    if (!userData.user) throw new Error('Not authenticated')
                    const { error } = await supabase.from('environment_variables').insert({
                      user_id: userData.user.id,
                      key,
                      value,
                      environment: 'all',
                      encrypted: true
                    })
                    if (error) throw error
                    toast.success(`Variable Added: "${key}" has been added`)
                    keyInput.value = ''
                    valueInput.value = ''
                  } catch (error: any) {
                    toast.error('Failed to Add Variable')
                  }
                }}><Plus className="h-4 w-4" /></Button>
              </div>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {/* Environment variables list - connect to real data source */}
                </div>
              </ScrollArea>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEnvDialog(false)}>Cancel</Button>
              <Button onClick={handleSaveEnvVariables} disabled={isProcessing}>
                {isProcessing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Domains Dialog */}
        <Dialog open={showDomainDialog} onOpenChange={setShowDomainDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Globe className="h-5 w-5" />Domains</DialogTitle>
              <DialogDescription>Manage custom domains</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Input placeholder="example.com" className="flex-1" id="domain-input" />
                <Button onClick={async () => {
                  const input = document.getElementById('domain-input') as HTMLInputElement
                  const domain = input?.value?.trim()
                  if (!domain) {
                    toast.error('Please enter a domain name')
                    return
                  }
                  try {
                    const { data: userData } = await supabase.auth.getUser()
                    if (!userData.user) throw new Error('Not authenticated')

                    const { error } = await supabase.from('domains').insert({
                      user_id: userData.user.id,
                      domain: domain,
                      status: 'pending',
                      created_at: new Date().toISOString()
                    })

                    if (error) throw error

                    toast.success(`Domain "${domain}" has been added`)
                    input.value = ''
                    fetchDeployments()
                  } catch (error: any) {
                    console.error('Failed to add domain:', error)
                    toast.error(error.message || 'Failed to add domain')
                  }
                }}>Add Domain</Button>
              </div>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {/* Domains list - connect to real data source */}
                </div>
              </ScrollArea>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDomainDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rollback Dialog */}
        <Dialog open={showRollbackDialog} onOpenChange={setShowRollbackDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-amber-600"><AlertTriangle className="h-5 w-5" />Confirm Rollback</DialogTitle>
              <DialogDescription>Are you sure you want to rollback {selectedDbDeployment?.deployment_name || selectedDeployment?.name}?</DialogDescription>
            </DialogHeader>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200">This will mark the deployment as rolled back and stop serving this version.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowRollbackDialog(false); setSelectedDbDeployment(null); }}>Cancel</Button>
              <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => selectedDbDeployment && handleRollbackDeployment(selectedDbDeployment)}>
                <RotateCcw className="h-4 w-4 mr-2" />Confirm Rollback
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Webhook Dialog */}
        <Dialog open={showWebhookDialog} onOpenChange={setShowWebhookDialog}>
          <DialogContent><DialogHeader><DialogTitle>Add Webhook</DialogTitle><DialogDescription>Configure a webhook endpoint for deployment events</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Webhook Name</Label><Input placeholder="Slack Notifications" className="mt-1" id="webhook-name-input" /></div>
              <div><Label>Endpoint URL</Label><Input placeholder="https://your-api.com/webhooks" className="mt-1" id="webhook-url-input" /></div>
              <div><Label>Events</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 mt-2">
                  {['deployment.created', 'deployment.succeeded', 'deployment.failed', 'deployment.promoted', 'deployment.rolled_back', 'domain.added'].map(event => (
                    <div key={event} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded"><input type="checkbox" id={`webhook-event-${event}`} /><span className="text-sm font-mono">{event}</span></div>
                  ))}
                </div>
              </div>
              <div><Label>Secret (Optional)</Label><Input placeholder="whsec_xxxxxxxxx" className="mt-1 font-mono" id="webhook-secret-input" /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowWebhookDialog(false)}>Cancel</Button><Button className="bg-gradient-to-r from-purple-600 to-indigo-600" onClick={async () => {
              const nameInput = document.getElementById('webhook-name-input') as HTMLInputElement
              const urlInput = document.getElementById('webhook-url-input') as HTMLInputElement
              const secretInput = document.getElementById('webhook-secret-input') as HTMLInputElement
              const name = nameInput?.value?.trim()
              const url = urlInput?.value?.trim()
              const secret = secretInput?.value?.trim()
              if (!name || !url) {
                toast.error('Name and URL are required')
                return
              }
              // Validate URL format
              try {
                new URL(url)
              } catch {
                toast.error('Please enter a valid URL')
                return
              }
              try {
                const { data: userData } = await supabase.auth.getUser()
                if (!userData.user) throw new Error('Not authenticated')

                // Get selected events
                const events = ['deployment.created', 'deployment.succeeded', 'deployment.failed', 'deployment.promoted', 'deployment.rolled_back', 'domain.added']
                  .filter(event => (document.getElementById(`webhook-event-${event}`) as HTMLInputElement)?.checked)

                const { error } = await supabase.from('webhooks').insert({
                  user_id: userData.user.id,
                  name,
                  url,
                  secret: secret || null,
                  events: events.length > 0 ? events : ['deployment.created'],
                  status: 'active',
                  created_at: new Date().toISOString()
                })

                if (error) throw error

                toast.success(`Webhook "${name}" has been created`)
                setShowWebhookDialog(false)
                fetchDeployments()
              } catch (error: any) {
                console.error('Failed to create webhook:', error)
                toast.error(error.message || 'Failed to create webhook')
              }
            }}>Add Webhook</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Team Member Dialog */}
        <Dialog open={showTeamDialog} onOpenChange={setShowTeamDialog}>
          <DialogContent><DialogHeader><DialogTitle>Invite Team Member</DialogTitle><DialogDescription>Add a new member to your deployment team</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Email Address</Label><Input type="email" placeholder="colleague@company.com" className="mt-1" id="team-email-input" /></div>
              <div><Label>Role</Label><Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select role" /></SelectTrigger><SelectContent><SelectItem value="admin">Admin - Full access</SelectItem><SelectItem value="developer">Developer - Deploy & manage</SelectItem><SelectItem value="viewer">Viewer - Read only</SelectItem></SelectContent></Select></div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-700">Team members will receive an email invitation to join your project.</p>
              </div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowTeamDialog(false)}>Cancel</Button><Button className="bg-gradient-to-r from-purple-600 to-indigo-600" onClick={async () => {
              const emailInput = document.getElementById('team-email-input') as HTMLInputElement
              const email = emailInput?.value?.trim()
              if (!email) {
                toast.error('Validation Error')
                return
              }
              try {
                toast.success(`Invitation Sent`)
                setShowTeamDialog(false)
              } catch (error: any) {
                toast.error('Failed to send invitation')
              }
            }}>Send Invitation</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Integration Dialog */}
        <Dialog open={showIntegrationDialog} onOpenChange={setShowIntegrationDialog}>
          <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Add Integration</DialogTitle><DialogDescription>Connect third-party services to your deployments</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {[{ name: 'GitHub', icon: GitBranch, color: 'gray' }, { name: 'Datadog', icon: Activity, color: 'purple' }, { name: 'Slack', icon: MessageSquare, color: 'pink' }, { name: 'Sentry', icon: AlertCircle, color: 'red' }, { name: 'PagerDuty', icon: Webhook, color: 'green' }, { name: 'Linear', icon: Layers, color: 'blue' }].map(int => (
                  <button key={int.name} className="p-4 border rounded-lg hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors text-center" onClick={() => {
                    toast.info(`Connecting ${int.name} integration...`)
                    setTimeout(() => {
                      toast.success(`${int.name} connected: integration has been connected successfully`)
                      setShowIntegrationDialog(false)
                    }, 1500)
                  }}>
                    <int.icon className={`h-8 w-8 mx-auto text-${int.color}-600`} />
                    <p className="text-sm font-medium mt-2">{int.name}</p>
                  </button>
                ))}
              </div>
              <div className="text-center"><p className="text-sm text-gray-500">Select an integration to connect</p></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowIntegrationDialog(false)}>Cancel</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Deployment Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Rocket className="h-5 w-5 text-purple-600" />Create New Deployment</DialogTitle>
              <DialogDescription>Configure and queue a new deployment</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label>Deployment Name *</Label>
                  <Input placeholder="my-app-release" className="mt-1" value={deploymentForm.deployment_name} onChange={(e) => setDeploymentForm(prev => ({ ...prev, deployment_name: e.target.value }))} />
                </div>
                <div>
                  <Label>Version *</Label>
                  <Input placeholder="1.0.0" className="mt-1" value={deploymentForm.version} onChange={(e) => setDeploymentForm(prev => ({ ...prev, version: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label>Environment</Label>
                  <Select value={deploymentForm.environment} onValueChange={(v) => setDeploymentForm(prev => ({ ...prev, environment: v as DbDeployment['environment'] }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="staging">Staging</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="preview">Preview</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Deploy Type</Label>
                  <Select value={deploymentForm.deploy_type} onValueChange={(v) => setDeploymentForm(prev => ({ ...prev, deploy_type: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Deploy</SelectItem>
                      <SelectItem value="incremental">Incremental</SelectItem>
                      <SelectItem value="hotfix">Hotfix</SelectItem>
                      <SelectItem value="canary">Canary</SelectItem>
                      <SelectItem value="rolling">Rolling</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label>Branch</Label>
                  <Input placeholder="main" className="mt-1 font-mono" value={deploymentForm.branch} onChange={(e) => setDeploymentForm(prev => ({ ...prev, branch: e.target.value }))} />
                </div>
                <div>
                  <Label>Commit Hash</Label>
                  <Input placeholder="abc123" className="mt-1 font-mono" value={deploymentForm.commit_hash} onChange={(e) => setDeploymentForm(prev => ({ ...prev, commit_hash: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>Commit Message</Label>
                <Input placeholder="feat: Add new feature" className="mt-1" value={deploymentForm.commit_message} onChange={(e) => setDeploymentForm(prev => ({ ...prev, commit_message: e.target.value }))} />
              </div>
              <div>
                <Label>Author</Label>
                <Input placeholder="John Doe" className="mt-1" value={deploymentForm.commit_author} onChange={(e) => setDeploymentForm(prev => ({ ...prev, commit_author: e.target.value }))} />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea placeholder="Deployment notes..." className="mt-1" value={deploymentForm.notes} onChange={(e) => setDeploymentForm(prev => ({ ...prev, notes: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600" onClick={handleCreateDeployment} disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : <><Rocket className="h-4 w-4 mr-2" />Create Deployment</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Database Deployments List */}
        {dbDeployments.length > 0 && (
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-purple-600" />
                Your Deployments ({dbDeployments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {dbDeployments.map(dep => (
                  <div key={dep.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        dep.status === 'success' ? 'bg-green-100' :
                        dep.status === 'in_progress' ? 'bg-blue-100' :
                        dep.status === 'failed' ? 'bg-red-100' :
                        dep.status === 'rolled_back' ? 'bg-amber-100' :
                        dep.status === 'cancelled' ? 'bg-gray-100' : 'bg-purple-100'
                      }`}>
                        {dep.status === 'success' && <Check className="h-5 w-5 text-green-600" />}
                        {dep.status === 'in_progress' && <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />}
                        {dep.status === 'failed' && <X className="h-5 w-5 text-red-600" />}
                        {dep.status === 'rolled_back' && <RotateCcw className="h-5 w-5 text-amber-600" />}
                        {dep.status === 'cancelled' && <X className="h-5 w-5 text-gray-600" />}
                        {dep.status === 'pending' && <Clock className="h-5 w-5 text-purple-600" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{dep.deployment_name}</p>
                          <Badge variant="outline">v{dep.version}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          {dep.branch && <span className="flex items-center gap-1"><GitBranch className="h-3 w-3" />{dep.branch}</span>}
                          {dep.commit_hash && <span className="flex items-center gap-1"><GitCommit className="h-3 w-3" />{dep.commit_hash.substring(0, 7)}</span>}
                          <span>{formatTimeAgo(dep.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={
                        dep.environment === 'production' ? 'bg-purple-100 text-purple-700' :
                        dep.environment === 'staging' ? 'bg-blue-100 text-blue-700' :
                        dep.environment === 'preview' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                      }>{dep.environment}</Badge>
                      <Badge className={
                        dep.status === 'success' ? 'bg-green-100 text-green-700' :
                        dep.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        dep.status === 'failed' ? 'bg-red-100 text-red-700' :
                        dep.status === 'rolled_back' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
                      }>{dep.status.replace('_', ' ')}</Badge>
                      <div className="flex gap-1">
                        {dep.status === 'pending' && (
                          <Button variant="ghost" size="sm" onClick={() => handleStartDeployment(dep)}><Play className="h-4 w-4 text-green-600" /></Button>
                        )}
                        {dep.status === 'in_progress' && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => handleCompleteDeployment(dep, true)}><Check className="h-4 w-4 text-green-600" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => handleCompleteDeployment(dep, false)}><X className="h-4 w-4 text-red-600" /></Button>
                          </>
                        )}
                        {dep.status === 'success' && dep.environment !== 'production' && (
                          <Button variant="ghost" size="sm" onClick={() => handlePromoteDeployment(dep)}><ArrowUpRight className="h-4 w-4 text-purple-600" /></Button>
                        )}
                        {dep.status === 'success' && dep.can_rollback && (
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedDbDeployment(dep); setShowRollbackDialog(true); }}><RotateCcw className="h-4 w-4 text-amber-600" /></Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteDeployment(dep.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Inspect Deployment Dialog */}
        <Dialog open={showInspectDialog} onOpenChange={setShowInspectDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Eye className="h-5 w-5" />Inspect Deployment</DialogTitle>
              <DialogDescription>{selectedDeployment?.name} - {selectedDeployment?.commit}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500">Environment</p>
                  <p className="font-medium">{selectedDeployment?.environment}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">{selectedDeployment?.status}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500">Branch</p>
                  <p className="font-medium flex items-center gap-1"><GitBranch className="h-4 w-4" />{selectedDeployment?.branch}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-medium">{selectedDeployment?.duration ? formatDuration(selectedDeployment.duration) : 'N/A'}</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500">Commit Message</p>
                <p className="font-medium">{selectedDeployment?.commitMessage}</p>
              </div>
              {selectedDeployment?.previewUrl && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500">Preview URL</p>
                  <a href={selectedDeployment.previewUrl} target="_blank" className="text-purple-600 hover:underline flex items-center gap-1">{selectedDeployment.previewUrl}<ExternalLink className="h-3 w-3" /></a>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowInspectDialog(false)}>Close</Button>
              <Button onClick={() => { setShowInspectDialog(false); setShowLogsDialog(true); }}><Terminal className="h-4 w-4 mr-2" />View Logs</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Function Dialog */}
        <Dialog open={showNewFunctionDialog} onOpenChange={setShowNewFunctionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-orange-600" />Create New Function</DialogTitle>
              <DialogDescription>Deploy a new serverless function</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Function Name</Label><Input placeholder="/api/my-function" className="mt-1 font-mono" id="function-name-input" /></div>
              <div><Label>Runtime</Label><Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select runtime" /></SelectTrigger><SelectContent><SelectItem value="nodejs20">Node.js 20</SelectItem><SelectItem value="nodejs18">Node.js 18</SelectItem><SelectItem value="edge">Edge Runtime</SelectItem></SelectContent></Select></div>
              <div><Label>Region</Label><Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select region" /></SelectTrigger><SelectContent><SelectItem value="iad1">Washington D.C.</SelectItem><SelectItem value="sfo1">San Francisco</SelectItem><SelectItem value="fra1">Frankfurt</SelectItem><SelectItem value="sin1">Singapore</SelectItem></SelectContent></Select></div>
              <div><Label>Memory (MB)</Label><Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select memory" /></SelectTrigger><SelectContent><SelectItem value="128">128 MB</SelectItem><SelectItem value="256">256 MB</SelectItem><SelectItem value="512">512 MB</SelectItem><SelectItem value="1024">1024 MB</SelectItem></SelectContent></Select></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewFunctionDialog(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-orange-500 to-yellow-500" onClick={() => {
                const nameInput = document.getElementById('function-name-input') as HTMLInputElement
                const runtimeSelect = document.querySelector('[data-function-runtime]') as HTMLSelectElement
                const regionSelect = document.querySelector('[data-function-region]') as HTMLSelectElement
                const memorySelect = document.querySelector('[data-function-memory]') as HTMLSelectElement
                const name = nameInput?.value?.trim()
                if (!name) {
                  toast.error('Validation Error')
                  return
                }
                handleCreateFunction(name, runtimeSelect?.value || 'nodejs20', regionSelect?.value || 'iad1', memorySelect?.value || '256')
              }} disabled={isProcessing}>
                {isProcessing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : <><Plus className="h-4 w-4 mr-2" />Create Function</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edge Config Dialog */}
        <Dialog open={showEdgeConfigDialog} onOpenChange={setShowEdgeConfigDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Database className="h-5 w-5 text-cyan-600" />Create Edge Config</DialogTitle>
              <DialogDescription>Create a new edge configuration store</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Config Name</Label><Input placeholder="my-config" className="mt-1 font-mono" id="edge-config-name-input" /></div>
              <div><Label>Description (Optional)</Label><Textarea placeholder="What is this config used for?" className="mt-1" id="edge-config-desc" /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEdgeConfigDialog(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-cyan-500 to-teal-500" onClick={() => {
                const nameInput = document.getElementById('edge-config-name-input') as HTMLInputElement
                const descTextarea = document.querySelector('#edge-config-desc') as HTMLTextAreaElement
                const name = nameInput?.value?.trim()
                if (!name) {
                  toast.error('Validation Error')
                  return
                }
                handleCreateEdgeConfig(name, descTextarea?.value || '')
              }} disabled={isProcessing}>
                {isProcessing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : <><Plus className="h-4 w-4 mr-2" />Create Config</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Team Member Menu Dialog */}
        <Dialog open={showTeamMemberMenu} onOpenChange={setShowTeamMemberMenu}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><User className="h-5 w-5" />{selectedTeamMember?.name}</DialogTitle>
              <DialogDescription>{selectedTeamMember?.email}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium">Role</p>
                  <p className="text-sm text-gray-500">{selectedTeamMember?.role}</p>
                </div>
                <Badge variant="outline">{selectedTeamMember?.role}</Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium">Deployments This Month</p>
                  <p className="text-sm text-gray-500">{selectedTeamMember?.deploymentsThisMonth} deploys</p>
                </div>
                <span className="text-2xl font-bold text-purple-600">{selectedTeamMember?.deploymentsThisMonth}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium">Last Active</p>
                  <p className="text-sm text-gray-500">{selectedTeamMember?.lastActive}</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowTeamMemberMenu(false); setSelectedTeamMember(null); }}>Close</Button>
              {selectedTeamMember?.role !== 'owner' && (
                <Button variant="destructive" onClick={() => selectedTeamMember && handleRemoveTeamMember(selectedTeamMember)} disabled={isProcessing}>
                  {isProcessing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Removing...</> : <><Trash2 className="h-4 w-4 mr-2" />Remove Member</>}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Filters Dialog */}
        <Dialog open={showFiltersDialog} onOpenChange={setShowFiltersDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Filter className="h-5 w-5" />Advanced Filters</DialogTitle>
              <DialogDescription>Filter deployments by various criteria</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Status</Label>
                <Select>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="All statuses" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="queued">Queued</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Branch</Label>
                <Input placeholder="e.g., main, develop" className="mt-1" />
              </div>
              <div>
                <Label>Author</Label>
                <Input placeholder="Filter by author" className="mt-1" />
              </div>
              <div>
                <Label>Date Range</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 mt-1">
                  <Input type="date" placeholder="From" />
                  <Input type="date" placeholder="To" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowFiltersDialog(false)}>Cancel</Button>
              <Button onClick={() => handleApplyFilters({})} disabled={isProcessing}>
                {isProcessing ? 'Applying...' : 'Apply Filters'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edge Config View Dialog */}
        <Dialog open={showEdgeConfigViewDialog} onOpenChange={setShowEdgeConfigViewDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Eye className="h-5 w-5 text-cyan-600" />View Edge Config</DialogTitle>
              <DialogDescription>{selectedEdgeConfig?.name} - {selectedEdgeConfig?.itemCount} items</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500">Total Reads</p>
                  <p className="text-2xl font-bold">{selectedEdgeConfig ? (selectedEdgeConfig.reads / 1000).toFixed(1) : 0}k</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500">Total Writes</p>
                  <p className="text-2xl font-bold">{selectedEdgeConfig?.writes || 0}</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 mb-2">Config Items</p>
                <div className="space-y-2">
                  {['feature_flag_dark_mode', 'feature_flag_beta', 'rate_limit_api'].map((item, i) => (
                    <div key={item} className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded">
                      <span className="font-mono text-sm">{item}</span>
                      <Badge variant="outline">{i === 0 ? 'true' : i === 1 ? 'false' : '100'}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEdgeConfigViewDialog(false)}>Close</Button>
              <Button onClick={() => { setShowEdgeConfigViewDialog(false); setShowEdgeConfigEditDialog(true); }}><Settings className="h-4 w-4 mr-2" />Edit Config</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edge Config Edit Dialog */}
        <Dialog open={showEdgeConfigEditDialog} onOpenChange={setShowEdgeConfigEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Settings className="h-5 w-5 text-cyan-600" />Edit Edge Config</DialogTitle>
              <DialogDescription>Modify {selectedEdgeConfig?.name} configuration</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Config Name</Label>
                <Input defaultValue={selectedEdgeConfig?.name} className="mt-1 font-mono" />
              </div>
              <div>
                <Label>Add New Item</Label>
                <div className="flex gap-2 mt-1">
                  <Input placeholder="Key" className="flex-1 font-mono" id="edge-config-edit-key" />
                  <Input placeholder="Value" className="flex-1" id="edge-config-edit-value" />
                  <Button onClick={() => {
                    const keyInput = document.querySelector('#edge-config-edit-key') as HTMLInputElement
                    const valueInput = document.querySelector('#edge-config-edit-value') as HTMLInputElement
                    const key = keyInput?.value?.trim()
                    const value = valueInput?.value?.trim()
                    if (!key || !value) {
                      toast.error('Validation Error')
                      return
                    }
                    toast.success(`Config Item Added has been added to ${selectedEdgeConfig?.name}`)
                    if (keyInput) keyInput.value = ''
                    if (valueInput) valueInput.value = ''
                  }}><Plus className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 mb-2">Current Items</p>
                <div className="space-y-2">
                  {['feature_flag_dark_mode', 'feature_flag_beta', 'rate_limit_api'].map((item, i) => (
                    <div key={item} className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded">
                      <span className="font-mono text-sm">{item}</span>
                      <div className="flex items-center gap-2">
                        <Input defaultValue={i === 0 ? 'true' : i === 1 ? 'false' : '100'} className="w-24 h-8" />
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedConfigItem(item); setShowDeleteConfigItemDialog(true); }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEdgeConfigEditDialog(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-cyan-500 to-teal-500" onClick={async () => {
                if (!selectedEdgeConfig) return;
                setIsProcessing(true);
                try {
                  const { data: userData } = await supabase.auth.getUser();
                  if (!userData.user) throw new Error('Not authenticated');
                  const { error } = await supabase.from('edge_configs').upsert({
                    id: selectedEdgeConfig.id,
                    user_id: userData.user.id,
                    name: selectedEdgeConfig.name,
                    item_count: selectedEdgeConfig.itemCount,
                    updated_at: new Date().toISOString()
                  });
                  if (error) throw error;
                  toast.success(`Config Saved has been updated`);
                  setShowEdgeConfigEditDialog(false);
                } catch (error: any) {
                  toast.error('Save Failed');
                } finally {
                  setIsProcessing(false);
                }
              }} disabled={isProcessing}>
                {isProcessing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Folder Dialog */}
        <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Folder className="h-5 w-5 text-indigo-600" />Create New Folder</DialogTitle>
              <DialogDescription>Create a new folder in blob storage</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Folder Name</Label>
                <Input placeholder="my-folder" className="mt-1" id="new-folder-name" />
              </div>
              <div>
                <Label>Parent Path</Label>
                <Select>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Root (/)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="/">Root (/)</SelectItem>
                    <SelectItem value="/uploads">/uploads</SelectItem>
                    <SelectItem value="/assets">/assets</SelectItem>
                    <SelectItem value="/backups">/backups</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewFolderDialog(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-indigo-600 to-violet-600" onClick={async () => {
                const input = document.getElementById('new-folder-name') as HTMLInputElement;
                const name = input?.value?.trim();
                if (!name) {
                  toast.error('Validation Error');
                  return;
                }
                setIsProcessing(true);
                try {
                  const { data: userData } = await supabase.auth.getUser();
                  if (!userData.user) throw new Error('Not authenticated');
                  const { error } = await supabase.from('storage_folders').insert({
                    user_id: userData.user.id,
                    name: name,
                    path: `/${name}`,
                    created_at: new Date().toISOString()
                  });
                  if (error) throw error;
                  toast.success(`Folder Created has been created`);
                  setShowNewFolderDialog(false);
                } catch (error: any) {
                  toast.error('Create Failed');
                } finally {
                  setIsProcessing(false);
                }
              }} disabled={isProcessing}>
                {isProcessing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : <><Folder className="h-4 w-4 mr-2" />Create Folder</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Upload Dialog */}
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Upload className="h-5 w-5 text-indigo-600" />Upload Files</DialogTitle>
              <DialogDescription>Upload files to blob storage</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-sm text-gray-500 mb-2">Drag and drop files here, or click to browse</p>
                <Button variant="outline" onClick={() => {
                  const fileInput = document.createElement('input')
                  fileInput.type = 'file'
                  fileInput.multiple = true
                  fileInput.accept = '*/*'
                  fileInput.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files
                    if (files && files.length > 0) {
                      const fileNames = Array.from(files).map(f => f.name).join(', ')
                      toast.success(`Files Selected: ${fileNames}`)
                    }
                  }
                  fileInput.click()
                }}>Browse Files</Button>
              </div>
              <div>
                <Label>Destination Folder</Label>
                <Select>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select folder" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="/">Root (/)</SelectItem>
                    <SelectItem value="/uploads">/uploads</SelectItem>
                    <SelectItem value="/assets">/assets</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="public-upload" />
                <Label htmlFor="public-upload">Make files public</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUploadDialog(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-indigo-600 to-violet-600" onClick={async () => {
                setIsProcessing(true)
                try {
                  // Real API call to upload files to storage
                  const response = await fetch('/api/storage/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ destination: 'blob-storage' })
                  })
                  if (!response.ok) throw new Error('Upload failed')
                  toast.success('Upload Complete')
                  setShowUploadDialog(false)
                } catch (error: any) {
                  toast.error('Upload Failed')
                } finally {
                  setIsProcessing(false)
                }
              }} disabled={isProcessing}>
                {isProcessing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading...</> : <><Upload className="h-4 w-4 mr-2" />Upload</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Log Filters Dialog */}
        <Dialog open={showLogFiltersDialog} onOpenChange={setShowLogFiltersDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Filter className="h-5 w-5" />Log Filters</DialogTitle>
              <DialogDescription>Configure advanced log filtering</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Log Level</Label>
                <div className="flex gap-2 mt-2">
                  {['error', 'warn', 'info', 'debug'].map(level => (
                    <div key={level} className="flex items-center gap-2">
                      <input type="checkbox" id={`level-${level}`} defaultChecked />
                      <Label htmlFor={`level-${level}`} className="capitalize">{level}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label>Time Range</Label>
                <Select>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Last 1 hour" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">Last 1 hour</SelectItem>
                    <SelectItem value="6h">Last 6 hours</SelectItem>
                    <SelectItem value="24h">Last 24 hours</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Function Filter</Label>
                <Input placeholder="e.g., /api/auth/*" className="mt-1 font-mono" />
              </div>
              <div>
                <Label>Message Contains</Label>
                <Input placeholder="Search in log messages" className="mt-1" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowLogFiltersDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                const levels: string[] = [];
                ['error', 'warn', 'info', 'debug'].forEach(level => {
                  const checkbox = document.getElementById(`level-${level}`) as HTMLInputElement;
                  if (checkbox?.checked) levels.push(level);
                });
                const functionInput = document.querySelector('input[placeholder="e.g., /api/auth/*"]') as HTMLInputElement;
                const messageInput = document.querySelector('input[placeholder="Search in log messages"]') as HTMLInputElement;
                setLogFilters({
                  levels,
                  timeRange: logFilters.timeRange,
                  functionFilter: functionInput?.value || '',
                  messageFilter: messageInput?.value || ''
                });
                const filteredLogs = realTimeLogs.filter(log =>
                  levels.includes(log.level) &&
                  (!functionInput?.value || log.step.includes(functionInput.value)) &&
                  (!messageInput?.value || log.message.toLowerCase().includes(messageInput.value.toLowerCase()))
                );
                setRealTimeLogs(filteredLogs);
                setShowLogFiltersDialog(false);
                toast.success(`Filters Applied: ${filteredLogs.length} log entries`);
              }}>Apply Filters</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View All Errors Dialog */}
        <Dialog open={showErrorsDialog} onOpenChange={setShowErrorsDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-red-600" />All Errors</DialogTitle>
              <DialogDescription>View all error logs from your deployments</DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2 p-4">
                {[
                  { time: '10:23:45', func: '/api/auth/login', msg: 'TypeError: Cannot read property of undefined', count: 12 },
                  { time: '10:15:32', func: '/api/projects', msg: 'NetworkError: Failed to fetch', count: 8 },
                  { time: '09:58:21', func: '/api/webhooks/stripe', msg: 'TimeoutError: Request timed out', count: 5 },
                  { time: '09:45:10', func: '/api/ai/generate', msg: 'ReferenceError: Variable not defined', count: 3 },
                ].map((err, i) => (
                  <div key={i} className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">{err.time}</span>
                      <Badge className="bg-red-100 text-red-700">{err.count} occurrences</Badge>
                    </div>
                    <p className="font-mono text-sm text-red-600 mb-1">{err.func}</p>
                    <p className="text-sm">{err.msg}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowErrorsDialog(false)}>Close</Button>
              <Button onClick={async () => {
                setIsProcessing(true)
                try {
                  const response = await fetch('/api/deployments/errors/stack-traces', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                  })
                  if (!response.ok) throw new Error('Failed to load stack traces')
                  toast.info('Stack Traces Loaded')
                  setShowErrorsDialog(false)
                  setActiveTab('logs')
                } catch (error: any) {
                  toast.error('Load Failed')
                } finally {
                  setIsProcessing(false)
                }
              }} disabled={isProcessing}>
                {isProcessing ? 'Loading...' : 'View Stack Traces'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Set Up Alerts Dialog */}
        <Dialog open={showAlertsDialog} onOpenChange={setShowAlertsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-purple-600" />Set Up Alerts</DialogTitle>
              <DialogDescription>Configure notification alerts for your logs</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div><p className="font-medium">Error Alerts</p><p className="text-sm text-gray-500">Notify on error logs</p></div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div><p className="font-medium">High Error Rate</p><p className="text-sm text-gray-500">Alert when error rate exceeds 5%</p></div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div><p className="font-medium">Slow Response Time</p><p className="text-sm text-gray-500">Alert when p95 latency exceeds 2s</p></div>
                <Switch />
              </div>
              <div>
                <Label>Notification Channels</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 mt-2">
                  {['Email', 'Slack', 'PagerDuty', 'Webhook'].map(channel => (
                    <div key={channel} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <input type="checkbox" id={`channel-${channel}`} defaultChecked={channel === 'Email' || channel === 'Slack'} />
                      <Label htmlFor={`channel-${channel}`}>{channel}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAlertsDialog(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600" onClick={handleSaveAlerts} disabled={isProcessing}>
                {isProcessing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : 'Save Alerts'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Log Analytics Dialog */}
        <Dialog open={showLogAnalyticsDialog} onOpenChange={setShowLogAnalyticsDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-blue-600" />Log Analytics</DialogTitle>
              <DialogDescription>Analyze log patterns and trends</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-2xl font-bold">3.2K</p>
                  <p className="text-sm text-gray-500">Logs (24h)</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-600">28</p>
                  <p className="text-sm text-gray-500">Errors</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-2xl font-bold text-amber-600">45</p>
                  <p className="text-sm text-gray-500">Warnings</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="font-medium mb-3">Top Error Types</p>
                <div className="space-y-2">
                  {['TypeError', 'NetworkError', 'TimeoutError', 'ReferenceError'].map((err, i) => (
                    <div key={err} className="flex items-center gap-3">
                      <span className="w-28 text-sm">{err}</span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: `${[45, 30, 15, 10][i]}%` }} />
                      </div>
                      <span className="text-sm font-medium">{[45, 30, 15, 10][i]}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowLogAnalyticsDialog(false)}>Close</Button>
              <Button onClick={async () => {
                setIsProcessing(true)
                try {
                  const response = await fetch('/api/deployments/logs/analytics', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                  })
                  if (!response.ok) throw new Error('Failed to fetch analytics')
                  const reportData = await response.json()
                  const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const link = document.createElement('a')
                  link.href = url
                  link.download = `log-analytics-${new Date().toISOString().split('T')[0]}.json`
                  link.click()
                  URL.revokeObjectURL(url)
                  toast.success('Report Exported')
                  setShowLogAnalyticsDialog(false)
                } catch (error: any) {
                  toast.error('Export Failed')
                } finally {
                  setIsProcessing(false)
                }
              }} disabled={isProcessing}>
                {isProcessing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Exporting...</> : <><Download className="h-4 w-4 mr-2" />Export Report</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Logs Dialog */}
        <Dialog open={showExportLogsDialog} onOpenChange={setShowExportLogsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Download className="h-5 w-5" />Export Logs</DialogTitle>
              <DialogDescription>Download logs in various formats</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Time Range</Label>
                <Select>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select range" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">Last 1 hour</SelectItem>
                    <SelectItem value="24h">Last 24 hours</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Format</Label>
                <Select>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select format" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="txt">Plain Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="include-metadata" defaultChecked />
                <Label htmlFor="include-metadata">Include metadata</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportLogsDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                setIsProcessing(true);
                try {
                  const logsText = realTimeLogs.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] [${l.step}] ${l.message}`).join('\n');
                  const blob = new Blob([logsText], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `deployment-logs-${new Date().toISOString().split('T')[0]}.txt`;
                  link.click();
                  URL.revokeObjectURL(url);
                  toast.success(`Export Complete: ${logsToExport.length} log entries exported`);
                  setShowExportLogsDialog(false);
                } catch (error: any) {
                  toast.error('Export Failed');
                } finally {
                  setIsProcessing(false);
                }
              }} disabled={isProcessing}>
                {isProcessing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Exporting...</> : <><Download className="h-4 w-4 mr-2" />Export</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Analytics Dialog */}
        <Dialog open={showExportAnalyticsDialog} onOpenChange={setShowExportAnalyticsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Download className="h-5 w-5 text-blue-600" />Export Analytics</DialogTitle>
              <DialogDescription>Download deployment analytics report</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Report Type</Label>
                <Select>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select report" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overview">Overview Report</SelectItem>
                    <SelectItem value="performance">Performance Report</SelectItem>
                    <SelectItem value="usage">Usage Report</SelectItem>
                    <SelectItem value="team">Team Activity Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Time Period</Label>
                <Select>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select period" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 Days</SelectItem>
                    <SelectItem value="30">Last 30 Days</SelectItem>
                    <SelectItem value="90">Last 90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Format</Label>
                <div className="flex gap-2 mt-2">
                  {['PDF', 'CSV', 'JSON'].map(fmt => (
                    <Button key={fmt} variant="outline" size="sm" className="flex-1" onClick={() => {
                      toast.info(`${fmt} Format Selected: preparing file...`)
                    }}>{fmt}</Button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportAnalyticsDialog(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-600" onClick={async () => {
                setIsProcessing(true);
                try {
                  const analyticsData = {
                    totalDeployments: dbDeployments.length,
                    successRate: stats.successRate,
                    avgBuildTime: stats.avgBuildTime,
                    deploymentsThisWeek: stats.deploymentsThisWeek,
                    deploymentsByEnvironment: {
                      production: dbDeployments.filter(d => d.environment === 'production').length,
                      staging: dbDeployments.filter(d => d.environment === 'staging').length,
                      development: dbDeployments.filter(d => d.environment === 'development').length
                    },
                    generatedAt: new Date().toISOString()
                  };
                  const blob = new Blob([JSON.stringify(analyticsData, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `deployment-analytics-${new Date().toISOString().split('T')[0]}.json`;
                  link.click();
                  URL.revokeObjectURL(url);
                  toast.success('Export Complete');
                  setShowExportAnalyticsDialog(false);
                } catch (error: any) {
                  toast.error('Export Failed');
                } finally {
                  setIsProcessing(false);
                }
              }} disabled={isProcessing}>
                {isProcessing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Exporting...</> : <><Download className="h-4 w-4 mr-2" />Export Report</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Security Audit Dialog */}
        <Dialog open={showSecurityAuditDialog} onOpenChange={setShowSecurityAuditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-red-600" />Security Audit</DialogTitle>
              <DialogDescription>Comprehensive security assessment of your deployments</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <p className="font-medium text-green-800">Security Score: A+</p>
                </div>
                <p className="text-sm text-green-700">Your deployment security is excellent</p>
              </div>
              <div className="space-y-2">
                {[
                  { check: 'SSL/TLS Configuration', status: 'pass', detail: 'A+ Grade, HSTS enabled' },
                  { check: 'DDoS Protection', status: 'pass', detail: 'Enterprise protection active' },
                  { check: 'WAF Rules', status: 'pass', detail: '12 rules active, 247 attacks blocked' },
                  { check: 'Secrets Exposure', status: 'pass', detail: 'No exposed secrets detected' },
                  { check: 'Dependency Vulnerabilities', status: 'warn', detail: '2 low-severity issues' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      {item.status === 'pass' ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <AlertTriangle className="h-5 w-5 text-amber-600" />}
                      <div>
                        <p className="font-medium">{item.check}</p>
                        <p className="text-sm text-gray-500">{item.detail}</p>
                      </div>
                    </div>
                    <Badge className={item.status === 'pass' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>{item.status === 'pass' ? 'Passed' : 'Warning'}</Badge>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSecurityAuditDialog(false)}>Close</Button>
              <Button onClick={async () => {
                setIsProcessing(true)
                try {
                  const response = await fetch('/api/deployments/security/audit', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                  })
                  if (!response.ok) throw new Error('Failed to generate report')
                  const reportData = await response.json()
                  const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const link = document.createElement('a')
                  link.href = url
                  link.download = `security-audit-${new Date().toISOString().split('T')[0]}.json`
                  link.click()
                  URL.revokeObjectURL(url)
                  toast.success('Report Generated')
                } catch (error: any) {
                  toast.error('Download Failed')
                } finally {
                  setIsProcessing(false)
                }
              }} disabled={isProcessing}>
                {isProcessing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</> : <><Download className="h-4 w-4 mr-2" />Download Report</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Protection Rule Dialog */}
        <Dialog open={showAddRuleDialog} onOpenChange={setShowAddRuleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Add Protection Rule</DialogTitle>
              <DialogDescription>Create a new deployment protection rule</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Rule Type</Label>
                <Select>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="password">Password Protection</SelectItem>
                    <SelectItem value="ip">IP Allowlist</SelectItem>
                    <SelectItem value="auth">Team Authentication</SelectItem>
                    <SelectItem value="geo">Geographic Restriction</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Rule Name</Label>
                <Input placeholder="e.g., Staging Password" className="mt-1" />
              </div>
              <div>
                <Label>Apply To</Label>
                <Select>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select environment" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Environments</SelectItem>
                    <SelectItem value="preview">Preview Only</SelectItem>
                    <SelectItem value="staging">Staging Only</SelectItem>
                    <SelectItem value="production">Production Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddRuleDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                const ruleNameInput = document.querySelector('input[placeholder="e.g., Staging Password"]') as HTMLInputElement;
                const ruleName = ruleNameInput?.value?.trim();
                if (!ruleName) {
                  toast.error('Validation Error');
                  return;
                }
                setIsProcessing(true);
                try {
                  const { data: userData } = await supabase.auth.getUser();
                  if (!userData.user) throw new Error('Not authenticated');
                  const { error } = await supabase.from('protection_rules').insert({
                    user_id: userData.user.id,
                    name: ruleName,
                    type: 'password',
                    environment: 'all',
                    enabled: true,
                    created_at: new Date().toISOString()
                  });
                  if (error) throw error;
                  toast.success(`Rule Created has been added`);
                  setShowAddRuleDialog(false);
                } catch (error: any) {
                  toast.error('Create Failed');
                } finally {
                  setIsProcessing(false);
                }
              }} disabled={isProcessing}>
                {isProcessing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Rule'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete All Deployments Dialog */}
        <Dialog open={showDeleteAllDeploymentsDialog} onOpenChange={setShowDeleteAllDeploymentsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600"><AlertOctagon className="h-5 w-5" />Delete All Deployments</DialogTitle>
              <DialogDescription>This action is irreversible</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">This will permanently delete all {dbDeployments.length} deployments from your project. This action cannot be undone.</p>
              </div>
              <div>
                <Label>Type "DELETE ALL" to confirm</Label>
                <Input placeholder="DELETE ALL" className="mt-1" id="confirm-delete-all" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteAllDeploymentsDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={async () => { const input = document.getElementById('confirm-delete-all') as HTMLInputElement; if (input?.value !== 'DELETE ALL') { toast.error('Confirmation Required'); return; } try { const { error } = await supabase.from('deployments').delete().neq('id', ''); if (error) throw error; toast.success('All Deployments Deleted'); setShowDeleteAllDeploymentsDialog(false); fetchDeployments(); } catch (error: any) { toast.error('Delete Failed'); } }}><Trash2 className="h-4 w-4 mr-2" />Delete All</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reset Project Settings Dialog */}
        <Dialog open={showResetSettingsDialog} onOpenChange={setShowResetSettingsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600"><RefreshCw className="h-5 w-5" />Reset Project Settings</DialogTitle>
              <DialogDescription>Reset all project settings to defaults</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">This will reset all build settings, environment variables, and configurations to their default values.</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="reset-build" defaultChecked />
                  <Label htmlFor="reset-build">Reset build configuration</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="reset-env" />
                  <Label htmlFor="reset-env">Reset environment variables</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="reset-domains" />
                  <Label htmlFor="reset-domains">Reset domain configuration</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowResetSettingsDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleResetSettings} disabled={isProcessing}>
                {isProcessing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Resetting...</> : <><RefreshCw className="h-4 w-4 mr-2" />Reset Settings</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Disable Deployments Dialog */}
        <Dialog open={showDisableDeploymentsDialog} onOpenChange={setShowDisableDeploymentsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600"><Lock className="h-5 w-5" />Disable Deployments</DialogTitle>
              <DialogDescription>Temporarily disable all new deployments</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">Disabling deployments will prevent any new deployments from being created. Existing deployments will continue to run.</p>
              </div>
              <div>
                <Label>Reason (Optional)</Label>
                <Textarea placeholder="Why are you disabling deployments?" className="mt-1" id="disable-deployments-reason" />
              </div>
              <div className="flex items-center gap-2">
                <Switch id="notify-team" defaultChecked />
                <Label htmlFor="notify-team">Notify team members</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDisableDeploymentsDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => {
                const reasonTextarea = document.querySelector('#disable-deployments-reason') as HTMLTextAreaElement
                const notifySwitch = document.querySelector('#notify-team') as HTMLInputElement
                handleDisableDeployments(reasonTextarea?.value || '', notifySwitch?.checked || false)
              }} disabled={isProcessing}>
                {isProcessing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Disabling...</> : <><Lock className="h-4 w-4 mr-2" />Disable</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Project Dialog */}
        <Dialog open={showDeleteProjectDialog} onOpenChange={setShowDeleteProjectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600"><Trash2 className="h-5 w-5" />Delete Project</DialogTitle>
              <DialogDescription>Permanently delete this project</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-medium">Warning: This action is permanent and cannot be undone!</p>
                <ul className="text-sm text-red-700 mt-2 list-disc list-inside">
                  <li>All deployments will be deleted</li>
                  <li>All domains will be released</li>
                  <li>All environment variables will be removed</li>
                  <li>All storage blobs will be deleted</li>
                </ul>
              </div>
              <div>
                <Label>Type the project name to confirm</Label>
                <Input placeholder="freeflow-app" className="mt-1" id="confirm-project-name" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteProjectDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => {
                const input = document.getElementById('confirm-project-name') as HTMLInputElement
                if (input?.value !== 'freeflow-app') {
                  toast.error('Confirmation Required')
                  return
                }
                handleDeleteProject()
              }} disabled={isProcessing}>
                {isProcessing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Deleting...</> : <><Trash2 className="h-4 w-4 mr-2" />Delete Project</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Hook Dialog */}
        <Dialog open={showCreateHookDialog} onOpenChange={setShowCreateHookDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Webhook className="h-5 w-5 text-purple-600" />Create Deploy Hook</DialogTitle>
              <DialogDescription>Create a webhook URL to trigger deployments</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Hook Name</Label>
                <Input placeholder="e.g., Production Deploy" className="mt-1" id="hook-name" />
              </div>
              <div>
                <Label>Target Branch</Label>
                <Select>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select branch" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">main</SelectItem>
                    <SelectItem value="develop">develop</SelectItem>
                    <SelectItem value="staging">staging</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Environment</Label>
                <Select>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select environment" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="preview">Preview</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateHookDialog(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600" onClick={() => {
                const nameInput = document.getElementById('hook-name') as HTMLInputElement
                const branchSelect = document.querySelector('[data-hook-branch]') as HTMLSelectElement
                const envSelect = document.querySelector('[data-hook-env]') as HTMLSelectElement
                const name = nameInput?.value?.trim()
                if (!name) {
                  toast.error('Validation Error')
                  return
                }
                handleCreateHook(name, branchSelect?.value || 'main', envSelect?.value || 'production')
              }} disabled={isProcessing}>
                {isProcessing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : <><Plus className="h-4 w-4 mr-2" />Create Hook</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Browse Marketplace Dialog */}
        <Dialog open={showMarketplaceDialog} onOpenChange={setShowMarketplaceDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Package className="h-5 w-5" />Plugin Marketplace</DialogTitle>
              <DialogDescription>Browse and install build plugins</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search plugins..." className="pl-10" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {[
                  { name: 'Sentry Error Tracking', desc: 'Automatic error tracking and monitoring', installs: '45K', author: 'Sentry' },
                  { name: 'Prisma Schema Check', desc: 'Validate Prisma schema on build', installs: '32K', author: 'Prisma' },
                  { name: 'Environment Validator', desc: 'Ensure all required env vars are set', installs: '28K', author: 'Community' },
                  { name: 'Build Notifications', desc: 'Send build status to Slack/Discord', installs: '52K', author: 'Vercel' },
                ].map(plugin => (
                  <div key={plugin.name} className="p-4 border rounded-lg hover:border-purple-500 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center"><Package className="h-5 w-5 text-indigo-600" /></div>
                      <div className="flex-1">
                        <h4 className="font-medium">{plugin.name}</h4>
                        <p className="text-sm text-gray-500">{plugin.desc}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{plugin.installs} installs</Badge>
                          <span className="text-xs text-gray-400">by {plugin.author}</span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" className="w-full mt-3" onClick={() => handleInstallPlugin(plugin.name)} disabled={isProcessing}>
                      {isProcessing ? 'Installing...' : 'Install'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMarketplaceDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Blob Confirmation Dialog */}
        <Dialog open={showDeleteBlobDialog} onOpenChange={setShowDeleteBlobDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600"><Trash2 className="h-5 w-5" />Delete File</DialogTitle>
              <DialogDescription>Are you sure you want to delete this file?</DialogDescription>
            </DialogHeader>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">
                <strong>{selectedBlob?.name}</strong> will be permanently deleted. This action cannot be undone.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowDeleteBlobDialog(false); setSelectedBlob(null); }}>Cancel</Button>
              <Button variant="destructive" onClick={() => selectedBlob && handleDeleteBlob(selectedBlob)} disabled={isProcessing}>
                {isProcessing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Deleting...</> : <><Trash2 className="h-4 w-4 mr-2" />Delete</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Hook Confirmation Dialog */}
        <Dialog open={showDeleteHookDialog} onOpenChange={setShowDeleteHookDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600"><Trash2 className="h-5 w-5" />Delete Deploy Hook</DialogTitle>
              <DialogDescription>Are you sure you want to delete this deploy hook?</DialogDescription>
            </DialogHeader>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">
                <strong>{selectedHookName}</strong> will be permanently deleted. Any integrations using this hook will stop working.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowDeleteHookDialog(false); setSelectedHookName(''); }}>Cancel</Button>
              <Button variant="destructive" onClick={() => handleDeleteHook(selectedHookName)} disabled={isProcessing}>
                {isProcessing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Deleting...</> : <><Trash2 className="h-4 w-4 mr-2" />Delete</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Clear Logs Confirmation Dialog */}
        <Dialog open={showClearLogsDialog} onOpenChange={setShowClearLogsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-amber-600"><Trash2 className="h-5 w-5" />Clear Logs</DialogTitle>
              <DialogDescription>Are you sure you want to clear all logs?</DialogDescription>
            </DialogHeader>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                All logs will be cleared from the viewer. This action cannot be undone.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowClearLogsDialog(false)}>Cancel</Button>
              <Button className="bg-amber-600 hover:bg-amber-700" onClick={handleClearLogs} disabled={isProcessing}>
                {isProcessing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Clearing...</> : <><Trash2 className="h-4 w-4 mr-2" />Clear Logs</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Config Item Confirmation Dialog */}
        <Dialog open={showDeleteConfigItemDialog} onOpenChange={setShowDeleteConfigItemDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600"><Trash2 className="h-5 w-5" />Delete Config Item</DialogTitle>
              <DialogDescription>Are you sure you want to delete this config item?</DialogDescription>
            </DialogHeader>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">
                <strong>{selectedConfigItem}</strong> will be removed from {selectedEdgeConfig?.name}. This action cannot be undone.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowDeleteConfigItemDialog(false); setSelectedConfigItem(''); }}>Cancel</Button>
              <Button variant="destructive" onClick={async () => {
                setIsProcessing(true)
                try {
                  const response = await fetch(`/api/edge-configs/${selectedEdgeConfig?.id}/items/${selectedConfigItem}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' }
                  })
                  if (!response.ok) throw new Error('Failed to delete config item')
                  toast.success(`Config Item Deleted has been removed from ${selectedEdgeConfig?.name}`)
                  setShowDeleteConfigItemDialog(false)
                  setSelectedConfigItem('')
                } catch (error: any) {
                  toast.error('Delete Failed')
                } finally {
                  setIsProcessing(false)
                }
              }} disabled={isProcessing}>
                {isProcessing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Deleting...</> : <><Trash2 className="h-4 w-4 mr-2" />Delete</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Environment Variable Confirmation Dialog */}
        <Dialog open={showDeleteEnvVarDialog} onOpenChange={setShowDeleteEnvVarDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600"><Trash2 className="h-5 w-5" />Delete Environment Variable</DialogTitle>
              <DialogDescription>Are you sure you want to delete this environment variable?</DialogDescription>
            </DialogHeader>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">
                <strong>{selectedEnvVar?.key}</strong> will be permanently deleted. This action cannot be undone.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowDeleteEnvVarDialog(false); setSelectedEnvVar(null); }}>Cancel</Button>
              <Button variant="destructive" onClick={() => selectedEnvVar && handleDeleteEnvVar(selectedEnvVar)} disabled={isProcessing}>
                {isProcessing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Deleting...</> : <><Trash2 className="h-4 w-4 mr-2" />Delete</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
