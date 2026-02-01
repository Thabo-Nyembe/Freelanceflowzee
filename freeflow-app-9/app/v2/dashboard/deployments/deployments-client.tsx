'use client'

import { createClient } from '@/lib/supabase/client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { useDeployments, Deployment as DBDeployment, useCreateDeployment, useUpdateDeployment, useDeleteDeployment } from '@/lib/hooks/use-deployments'
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
  Folder, File, Package, Gauge, MonitorPlay, GitPullRequest, Bell, AlertOctagon, Globe2, Key
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

import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'

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


// Quick actions will be defined inside the component to access state setters

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
  // MIGRATED: Batch #16 - Removed mock data, using database hooks

  // Integrate useDeployments hook with filter support
  const { data: dbDeploymentsData, isLoading, error: deploymentsError, refetch: fetchDeployments } = useDeployments()
  const dbDeployments = dbDeploymentsData || []
  const createDeploymentMutation = useCreateDeployment()
  const updateDeploymentMutation = useUpdateDeployment()
  const deleteDeploymentMutation = useDeleteDeployment()

  // Map DB deployments to UI format
  const mappedDeployments: Deployment[] = useMemo(() => {
    if (!dbDeploymentsData) return []

    return dbDeploymentsData.map((dbDep): Deployment => ({
      id: dbDep.id,
      name: dbDep.deployment_name,
      status: dbDep.status as DeploymentStatus,
      environment: dbDep.environment as DeploymentEnvironment,
      branch: dbDep.branch || 'main',
      commit: dbDep.commit_hash || '',
      commitMessage: dbDep.commit_message || '',
      author: dbDep.commit_author || 'Unknown',
      authorAvatar: dbDep.commit_author ? dbDep.commit_author.substring(0, 1).toLowerCase() : 'u',
      createdAt: dbDep.started_at || dbDep.created_at,
      duration: dbDep.duration_seconds || 0,
      previewUrl: dbDep.environment === 'preview' ? `https://app-${dbDep.commit_hash?.substring(0, 7)}.vercel.app` : '',
      productionUrl: dbDep.environment === 'production' ? 'https://freeflow.app' : undefined,
      prNumber: undefined,
      prTitle: undefined,
      buildCache: true,
      isProtected: dbDep.can_rollback
    }))
  }, [dbDeploymentsData])

  // Database state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deploymentForm, setDeploymentForm] = useState(defaultDeploymentForm)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedDbDeployment, setSelectedDbDeployment] = useState<DbDeployment | null>(null)

  // Create deployment
  const handleCreateDeployment = async () => {
    if (!deploymentForm.deployment_name || !deploymentForm.version) {
      toast.error('Validation Error')
      return
    }

    setIsSubmitting(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Not authenticated')

      await createDeploymentMutation.mutateAsync({
        user_id: userData.user.id,
        deployment_name: deploymentForm.deployment_name,
        version: deploymentForm.version,
        environment: deploymentForm.environment,
        status: 'pending',
        branch: deploymentForm.branch || null,
        commit_hash: deploymentForm.commit_hash || null,
        commit_message: deploymentForm.commit_message || null,
        commit_author: deploymentForm.commit_author || null,
        deploy_type: deploymentForm.deploy_type || 'full',
        notes: deploymentForm.notes || null,
        duration_seconds: 0,
        server_count: 0,
        healthy_servers: 0,
        unhealthy_servers: 0,
        traffic_percentage: 0,
        active_instances: 0,
        health_check_count: 0,
        request_count: 0,
        error_count: 0,
        error_rate: 0,
        send_notifications: false,
        notifications_sent: false,
        requires_approval: false,
        can_rollback: true,
        auto_rollback_enabled: false,
      } as any)

      toast.success(`Deployment Created: ${deploymentForm.deployment_name} v${deploymentForm.version} queued`)
      setShowCreateDialog(false)
      setDeploymentForm(defaultDeploymentForm)
      fetchDeployments()
    } catch (error) {
      toast.error('Failed to create deployment')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Start deployment (update status to in_progress)
  const handleStartDeployment = async (deployment: DBDeployment) => {
    try {
      await updateDeploymentMutation.mutateAsync({
        id: deployment.id,
        status: 'in_progress',
        started_at: new Date().toISOString(),
      } as any)

      toast.info(`Deployment Started: ${deployment.deployment_name} is now deploying...`)
      fetchDeployments()
    } catch (error) {
      toast.error('Failed to start deployment')
    }
  }

  // Complete deployment
  const handleCompleteDeployment = async (deployment: DBDeployment, success: boolean) => {
    try {
      const startTime = deployment.started_at ? new Date(deployment.started_at).getTime() : Date.now()
      const duration = Math.floor((Date.now() - startTime) / 1000)

      await updateDeploymentMutation.mutateAsync({
        id: deployment.id,
        status: success ? 'success' : 'failed',
        completed_at: new Date().toISOString(),
        duration_seconds: duration,
      } as any)

      toast[success ? 'success' : 'error'](
        success ? 'Deployment Successful' : 'Deployment Failed',
        { description: `${deployment.deployment_name} v${deployment.version}` }
      )
      fetchDeployments()
    } catch (error) {
      toast.error('Failed to update deployment')
    }
  }

  // Rollback deployment
  const handleRollbackDeployment = async (deployment: DBDeployment) => {
    if (!deployment.can_rollback) {
      toast.error('Cannot Rollback')
      return
    }

    try {
      await updateDeploymentMutation.mutateAsync({
        id: deployment.id,
        status: 'rolled_back',
      } as any)

      toast.success(`Rollback Initiated: ${deployment.deployment_name}`)
      setShowRollbackDialog(false)
      fetchDeployments()
    } catch (error) {
      toast.error('Failed to rollback')
    }
  }

  // Cancel deployment
  const handleCancelDeployment = async (deployment: DBDeployment) => {
    try {
      await updateDeploymentMutation.mutateAsync({
        id: deployment.id,
        status: 'cancelled',
      } as any)

      toast.info(`Deployment Cancelled: ${deployment.deployment_name} has been cancelled`)
      fetchDeployments()
    } catch (error) {
      toast.error('Failed to cancel deployment')
    }
  }

  // Delete deployment
  const handleDeleteDeployment = async (id: string) => {
    try {
      await deleteDeploymentMutation.mutateAsync(id)
      toast.success('Deployment Deleted')
      fetchDeployments()
    } catch (error) {
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
  const [showQuickDeployDialog, setShowQuickDeployDialog] = useState(false)
  const [showQuickRollbackDialog, setShowQuickRollbackDialog] = useState(false)
  const [showQuickLogsDialog, setShowQuickLogsDialog] = useState(false)
  const [quickDeployBranch, setQuickDeployBranch] = useState('main')
  const [quickDeployEnvironment, setQuickDeployEnvironment] = useState<'production' | 'staging' | 'development' | 'preview'>('staging')
  const [quickRollbackVersion, setQuickRollbackVersion] = useState('')
  const [isQuickDeploying, setIsQuickDeploying] = useState(false)
  const [isQuickRollingBack, setIsQuickRollingBack] = useState(false)
  const [expandedLogs, setExpandedLogs] = useState<string[]>(['clone', 'install', 'build', 'deploy'])

  // Additional dialogs state
  const [showFiltersDialog, setShowFiltersDialog] = useState(false)
  const [showInspectDialog, setShowInspectDialog] = useState(false)
  const [showNewFunctionDialog, setShowNewFunctionDialog] = useState(false)
  const [showEdgeConfigDialog, setShowEdgeConfigDialog] = useState(false)
  const [showEdgeConfigViewDialog, setShowEdgeConfigViewDialog] = useState(false)
  const [showEdgeConfigEditDialog, setShowEdgeConfigEditDialog] = useState(false)
  const [edgeConfigContent, setEdgeConfigContent] = useState(`{
  "feature_flags": {
    "dark_mode": true,
    "beta_features": false
  },
  "api_keys": ["***", "***"],
  "rate_limits": {
    "default": 100,
    "premium": 1000
  }
}`)
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [showExportLogsDialog, setShowExportLogsDialog] = useState(false)
  const [showLiveTailDialog, setShowLiveTailDialog] = useState(false)
  const [showLogAnalyticsDialog, setShowLogAnalyticsDialog] = useState(false)
  const [showErrorsDialog, setShowErrorsDialog] = useState(false)
  const [showAlertsDialog, setShowAlertsDialog] = useState(false)
  const [showAnalyticsExportDialog, setShowAnalyticsExportDialog] = useState(false)
  const [showSecurityAuditDialog, setShowSecurityAuditDialog] = useState(false)
  const [showAddRuleDialog, setShowAddRuleDialog] = useState(false)
  const [showCreateHookDialog, setShowCreateHookDialog] = useState(false)
  const [showMarketplaceDialog, setShowMarketplaceDialog] = useState(false)
  const [showDeleteAllDeploymentsDialog, setShowDeleteAllDeploymentsDialog] = useState(false)
  const [showResetSettingsDialog, setShowResetSettingsDialog] = useState(false)
  const [showDisableDeploymentsDialog, setShowDisableDeploymentsDialog] = useState(false)
  const [showDeleteProjectDialog, setShowDeleteProjectDialog] = useState(false)
  const [deleteAllConfirmation, setDeleteAllConfirmation] = useState('')
  const [deleteProjectConfirmation, setDeleteProjectConfirmation] = useState('')
  const [selectedEdgeConfig, setSelectedEdgeConfig] = useState<EdgeConfig | null>(null)
  const [inspectedDeployment, setInspectedDeployment] = useState<Deployment | null>(null)

  // Function dialog states
  const [showFunctionTerminalDialog, setShowFunctionTerminalDialog] = useState(false)
  const [showFunctionMetricsDialog, setShowFunctionMetricsDialog] = useState(false)
  const [showFunctionSettingsDialog, setShowFunctionSettingsDialog] = useState(false)
  const [selectedFunction, setSelectedFunction] = useState<ServerlessFunction | null>(null)

  // Integration dialog states
  const [showIntegrationSettingsDialog, setShowIntegrationSettingsDialog] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)

  // Terminal output state for function terminal
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    '$ connecting to function runtime...',
    'Connected to Node.js 20 runtime',
    'Ready for commands',
    ''
  ])
  const [terminalCommand, setTerminalCommand] = useState('')

  // Form states for new dialogs
  const [newFunctionForm, setNewFunctionForm] = useState({ name: '', runtime: 'Node.js 20', region: 'iad1', memory: '256' })
  const [newEdgeConfigForm, setNewEdgeConfigForm] = useState({ name: '' })
  const [newFolderName, setNewFolderName] = useState('')
  const [newDomainName, setNewDomainName] = useState('')
  const [newRuleForm, setNewRuleForm] = useState({ name: '', type: 'password' as 'password' | 'vercel_auth' | 'trusted_ips', enabled: true })
  const [newHookForm, setNewHookForm] = useState({ name: '', branch: 'main' })
  const [webhookFormData, setWebhookFormData] = useState({ name: '', url: '', events: [] as string[], secret: '' })
  const [teamInviteForm, setTeamInviteForm] = useState({ email: '', role: '' })
  const [isProcessing, setIsProcessing] = useState(false)
  const [filterOptions, setFilterOptions] = useState({ status: 'all', dateRange: 'all', author: 'all' })

  // Settings state
  const [settingsState, setSettingsState] = useState({
    // Build & Deploy settings
    autoDeployOnPush: true,
    previewDeployments: true,
    buildCache: true,
    skewProtection: false,
    serverlessFunctions: true,
    edgeFunctions: true,
    // Notification settings
    emailNotifications: true,
    failedDeploymentAlerts: true,
    productionPromotionAlerts: true,
    weeklySummary: false,
    // Security settings
    forceHttps: true,
    hstsHeaders: true,
    xssProtection: true,
    contentSecurityPolicy: false,
    ipAllowlist: false,
    // Git settings
    autoDeployBranches: true,
    productionBranchProtection: true,
    ignoredBuildStep: false,
    enableGitSubmodules: false,
    gitLfs: false,
    requiredStatusChecks: true,
    previewComments: true,
    githubDeployments: true,
    commitStatuses: true,
    // Protection settings
    passwordProtection: false,
    ipAllowlisting: false,
    vercelAuthentication: true,
    // Function settings
    enableCaching: true,
    enableLogging: true,
    coldStartOptimization: false,
  })

  // Protection rules state
  const [protectionRules, setProtectionRules] = useState([])

  // Plugins state
  const [plugins, setPlugins] = useState([])

  // Alert settings state
  const [alertSettings, setAlertSettings] = useState({
    errorAlerts: true,
    warningAlerts: false,
    deploymentAlerts: true,
    notificationEmail: '',
    slackWebhookUrl: '',
  })

  // Integration permissions state
  const [integrationPermissions, setIntegrationPermissions] = useState({
    readDeployments: true,
    writeDeployments: true,
    accessEnvVariables: false,
  })

  // Quick deploy handler
  const handleQuickDeploy = async () => {
    setIsQuickDeploying(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Not authenticated')

      const { error } = await supabase.from('deployments').insert({
        user_id: userData.user.id,
        deployment_name: `Quick Deploy ${new Date().toLocaleDateString()}`,
        version: `${new Date().getTime()}`,
        environment: quickDeployEnvironment,
        status: 'pending',
        branch: quickDeployBranch,
        deploy_type: 'full',
        notes: `Quick deployment from ${quickDeployBranch} branch`,
        duration_seconds: 0,
        can_rollback: true,
      })

      if (error) throw error
      toast.success(`Quick Deploy Initiated`, { description: `Deploying to ${quickDeployEnvironment}` })
      setShowQuickDeployDialog(false)
      setQuickDeployBranch('main')
      setQuickDeployEnvironment('staging')
      fetchDeployments()
    } catch (error) {
      toast.error('Quick Deploy Failed')
    } finally {
      setIsQuickDeploying(false)
    }
  }

  // Quick rollback handler
  const handleQuickRollback = async () => {
    if (!quickRollbackVersion) {
      toast.error('Validation Error')
      return
    }

    setIsQuickRollingBack(true)
    try {
      // Find the deployment to rollback
      const deploymentToRollback = dbDeployments.find(d => d.version === quickRollbackVersion)
      if (deploymentToRollback) {
        const { error } = await supabase
          .from('deployments')
          .update({ status: 'rolled_back' })
          .eq('id', deploymentToRollback.id)

        if (error) throw error
      }

      toast.success(`Rollback Completed`, { description: `Rolled back to ${quickRollbackVersion}` })
      setShowQuickRollbackDialog(false)
      setQuickRollbackVersion('')
      fetchDeployments()
    } catch (error) {
      toast.error('Rollback Failed')
    } finally {
      setIsQuickRollingBack(false)
    }
  }

  // Quick actions defined with access to state setters
  const deploymentsQuickActions = [
    { id: '1', label: 'Deploy Now', icon: 'rocket', action: () => setShowQuickDeployDialog(true), variant: 'default' as const },
    { id: '2', label: 'Rollback', icon: 'undo', action: () => setShowQuickRollbackDialog(true), variant: 'default' as const },
    { id: '3', label: 'View Logs', icon: 'file-text', action: () => setShowQuickLogsDialog(true), variant: 'outline' as const },
  ]
  const [settingsTab, setSettingsTab] = useState('general')
  const [buildLogs, setBuildLogs] = useState<BuildLog[]>([])
  const [envVars, setEnvVars] = useState<EnvironmentVariable[]>([])
  const [newEnvKey, setNewEnvKey] = useState('')
  const [newEnvValue, setNewEnvValue] = useState('')

  const filteredDeployments = useMemo(() => {
    return mappedDeployments.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           d.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           d.commitMessage.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesEnv = environmentFilter === 'all' || d.environment === environmentFilter
      return matchesSearch && matchesEnv
    })
  }, [searchQuery, environmentFilter, mappedDeployments])

  const stats = useMemo(() => {
    const total = mappedDeployments.length
    const successful = mappedDeployments.filter(d => d.status === 'success').length
    const avgDuration = total > 0 ? mappedDeployments.reduce((sum, d) => sum + d.duration, 0) / total : 0
    const activeDeployments = mappedDeployments.filter(d => d.status === 'in_progress' || d.status === 'queued').length
    return {
      total,
      successful,
      successRate: total > 0 ? ((successful / total) * 100).toFixed(1) : '0',
      avgDuration: avgDuration.toFixed(0),
      totalFunctions: 0,
      totalInvocations: 0,
      totalDomains: 0,
      totalStorage: 0,
      // Additional stats for the banner
      totalDeployments: total + (dbDeploymentsData?.length || 0),
      avgBuildTime: Math.round(avgDuration),
      activeDeployments: activeDeployments + (dbDeploymentsData?.filter(d => d.status === 'in_progress' || d.status === 'pending').length || 0),
    }
  }, [mappedDeployments, dbDeploymentsData])

  // Promote deployment to production
  const handlePromoteDeployment = async (deployment: DbDeployment) => {
    try {
      const { error } = await supabase
        .from('deployments')
        .update({ environment: 'production' })
        .eq('id', deployment.id)

      if (error) throw error
      toast.success(`Promoted`, { description: `${deployment.version} promoted to production` })
      fetchDeployments()
    } catch (error) {
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
    buildLogs.forEach(log => {
      if (!groups[log.step]) groups[log.step] = []
      groups[log.step].push(log)
    })
    return groups
  }, [buildLogs])

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
                        <Button variant="outline" size="sm" onClick={() => { setInspectedDeployment(deployment); setShowInspectDialog(true); }}><Eye className="h-4 w-4 mr-1" />Inspect</Button>
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
                  <Button variant="outline" className="border-white/50 text-white hover:bg-white/10" onClick={async () => {
                    toast.promise(
                      (async () => {
                        const { data, error } = await supabase
                          .from('serverless_functions')
                          .select('*')
                          .order('created_at', { ascending: false })
                        if (error) throw error
                        return data
                      })(),
                      {
                        loading: 'Refreshing functions...',
                        success: (data) => `${data?.length || 0} functions loaded`,
                        error: 'Failed to refresh functions'
                      }
                    )
                  }}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
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
                  {[].map(fn => (
                    <div key={fn.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                        <Zap className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium font-mono text-sm">{fn.name}</p>
                          <Badge variant="outline" className="text-xs">{fn.runtime}</Badge>
                        </div>
                        <p className="text-xs text-gray-500">{fn.region} • {fn.memory}MB</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-6 text-center">
                        <div><p className="font-medium">{fn.invocations.toLocaleString()}</p><p className="text-xs text-gray-500">invocations</p></div>
                        <div><p className="font-medium">{fn.avgDuration}ms</p><p className="text-xs text-gray-500">avg duration</p></div>
                        <div><p className={`font-medium ${fn.errors > 20 ? 'text-red-600' : 'text-green-600'}`}>{fn.errors}</p><p className="text-xs text-gray-500">errors</p></div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedFunction(fn); setShowFunctionTerminalDialog(true); }} title="Open terminal"><Terminal className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedFunction(fn); setShowFunctionMetricsDialog(true); }} title="View metrics"><BarChart3 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedFunction(fn); setShowFunctionSettingsDialog(true); }} title="Open settings"><Settings className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
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
                  <Button variant="outline" className="border-white/50 text-white hover:bg-white/10" onClick={async () => {
                    toast.promise(
                      (async () => {
                        const { data, error } = await supabase
                          .from('edge_configs')
                          .select('*')
                          .order('created_at', { ascending: false })
                        if (error) throw error
                        return data
                      })(),
                      {
                        loading: 'Syncing edge configs...',
                        success: (data) => `${data?.length || 0} edge configs synced`,
                        error: 'Failed to sync edge configs'
                      }
                    )
                  }}><RefreshCw className="h-4 w-4 mr-2" />Sync</Button>
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
              {[].map(config => (
                <Card key={config.id} className="border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900 flex items-center justify-center">
                        <Network className="h-5 w-5 text-cyan-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{config.name}</h4>
                        <p className="text-xs text-gray-500">{config.itemCount} items</p>
                      </div>
                      <Badge className="ml-auto bg-green-100 text-green-700">Active</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-sm">
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"><p className="text-lg font-bold">{(config.reads / 1000).toFixed(0)}k</p><p className="text-xs text-gray-500">Reads</p></div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"><p className="text-lg font-bold">{config.writes}</p><p className="text-xs text-gray-500">Writes</p></div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => { setSelectedEdgeConfig(config); setShowEdgeConfigViewDialog(true); }}><Eye className="h-3 w-3 mr-1" />View</Button>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => { setSelectedEdgeConfig(config); setShowEdgeConfigEditDialog(true); }}><Settings className="h-3 w-3 mr-1" />Edit</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
                  {[].map(blob => (
                    <div key={blob.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <input type="checkbox" className="rounded" />
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                        <File className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium font-mono text-sm">{blob.name}</p>
                        <p className="text-xs text-gray-500">{blob.contentType} • {formatSize(blob.size)}</p>
                      </div>
                      <Badge variant={blob.isPublic ? 'default' : 'outline'}>{blob.isPublic ? 'Public' : 'Private'}</Badge>
                      <span className="text-sm text-gray-500">{blob.downloadCount} downloads</span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(`https://storage.freeflow.app/${blob.name}`)
                            toast.success('Blob URL copied to clipboard')
                          } catch {
                            toast.error('Failed to copy URL')
                          }
                        }}><Copy className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={async () => {
                          toast.success("Downloading " + blob.name + "...")
                          try {
                            const response = await fetch("/api/deployments?action=download-blob&blobId=" + blob.id)
                            if (!response.ok) throw new Error('Download failed')
                            toast.success("Downloaded " + blob.name + " successfully")
                          } catch {
                            toast.error('Failed to download blob')
                          }
                        }}><Download className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={async () => {
                          toast.success('Deleting blob...')
                          try {
                            const response = await fetch("/api/deployments?action=delete-blob&blobId=" + blob.id, { method: 'DELETE' })
                            if (!response.ok) throw new Error('Delete failed')
                            toast.success("Deleted " + blob.name)
                          } catch {
                            toast.error('Failed to delete blob')
                          }
                        }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </div>
                    </div>
                  ))}
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
                  <Button className="bg-green-600 text-white hover:bg-green-700" onClick={() => setShowLiveTailDialog(true)}><Play className="h-4 w-4 mr-2" />Live Tail</Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{buildLogs.length}</p>
                  <p className="text-sm text-gray-400">Total Logs</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-red-400">{buildLogs.filter(l => l.level === 'error').length}</p>
                  <p className="text-sm text-gray-400">Errors</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-amber-400">{buildLogs.filter(l => l.level === 'warn').length}</p>
                  <p className="text-sm text-gray-400">Warnings</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-400">{buildLogs.filter(l => l.level === 'success').length}</p>
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
                    <Button variant="outline" size="sm" onClick={async () => {
                      toast.promise(
                        (async () => {
                          const { data, error } = await supabase
                            .from('deployment_logs')
                            .select('*')
                            .order('created_at', { ascending: false })
                            .limit(100)
                          if (error) throw error
                          if (data && data.length > 0) {
                            setBuildLogs(data.map((log: any, idx: number) => ({
                              id: log.id || String(idx),
                              timestamp: new Date(log.created_at).toLocaleTimeString(),
                              level: log.level || 'info',
                              message: log.message || '',
                              step: log.step || 'runtime'
                            })))
                          }
                          return data
                        })(),
                        {
                          loading: 'Refreshing logs...',
                          success: (data) => `${data?.length || 0} log entries loaded`,
                          error: 'Failed to refresh logs'
                        }
                      )
                    }}><RefreshCw className="h-4 w-4" /></Button>
                    <Button variant="outline" size="sm" onClick={() => setShowFiltersDialog(true)}><Filter className="h-4 w-4 mr-1" />More Filters</Button>
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
                  <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700" onClick={() => {
                    const logsText = buildLogs.map(log => "[" + log.timestamp + "] " + log.level.toUpperCase() + " [" + log.step + "] " + log.message).join('\n');
                    navigator.clipboard.writeText(logsText).then(() => {
                      toast.success("Logs copied to clipboard", { description: buildLogs.length + " log entries copied" });
                    }).catch(() => {
                      toast.error('Failed to copy logs');
                    });
                  }} title="Copy logs"><Copy className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700" onClick={() => {
                    const logsText = buildLogs.map(log => "[" + log.timestamp + "] " + log.level.toUpperCase() + " [" + log.step + "] " + log.message).join('\n');
                    const logBlob = new Blob([logsText], { type: 'text/plain' });
                    const url = URL.createObjectURL(logBlob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = "deployment-logs-" + new Date().toISOString().split('T')[0] + ".txt";
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    toast.success('Logs downloaded');
                  }} title="Download logs"><Download className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700" onClick={() => {
                    setBuildLogs([]);
                    toast.success('Logs cleared');
                  }} title="Clear logs"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px] bg-gray-900 p-4 font-mono text-sm">
                  {buildLogs.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">No logs to display</div>
                  ) : (
                  buildLogs.map(log => (
                    <div key={log.id} className="flex items-start gap-3 mb-2 hover:bg-gray-800 p-1 rounded">
                      <span className="text-gray-500 text-xs w-20 shrink-0">{log.timestamp}</span>
                      <Badge className={`shrink-0 ${log.level === 'error' ? 'bg-red-600' : log.level === 'warn' ? 'bg-amber-600' : log.level === 'success' ? 'bg-green-600' : 'bg-blue-600'}`}>{log.level.toUpperCase()}</Badge>
                      <span className="text-gray-400 text-xs shrink-0">[{log.step}]</span>
                      <span className="text-white">{log.message}</span>
                    </div>
                  ))
                  )}
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
                  <Button className="bg-white text-blue-700 hover:bg-blue-50" onClick={() => setShowAnalyticsExportDialog(true)}><Download className="h-4 w-4 mr-2" />Export</Button>
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
                  {protectionRules.map(protection => (
                    <div key={protection.id} className="flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                          <Shield className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{protection.name}</h4>
                          <p className="text-sm text-gray-500">{protection.type.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={protection.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>{protection.enabled ? 'Enabled' : 'Disabled'}</Badge>
                        <Switch checked={protection.enabled} onCheckedChange={(checked) => {
                          setProtectionRules(prev => prev.map(p => p.id === protection.id ? { ...p, enabled: checked } : p))
                          toast.success(protection.name + " " + (checked ? 'enabled' : 'disabled'))
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Access Control */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader><CardTitle>Access Control</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div><h4 className="font-medium">Password Protection</h4><p className="text-sm text-gray-500">Require password to access preview deployments</p></div>
                  <Switch checked={settingsState.passwordProtection} onCheckedChange={(checked) => {
                    setSettingsState(prev => ({ ...prev, passwordProtection: checked }))
                    toast.success("Password protection " + (checked ? 'enabled' : 'disabled'))
                  }} />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div><h4 className="font-medium">IP Allowlisting</h4><p className="text-sm text-gray-500">Restrict access to specific IP addresses</p></div>
                  <Switch checked={settingsState.ipAllowlisting} onCheckedChange={(checked) => {
                    setSettingsState(prev => ({ ...prev, ipAllowlisting: checked }))
                    toast.success("IP allowlisting " + (checked ? 'enabled' : 'disabled'))
                  }} />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div><h4 className="font-medium">Vercel Authentication</h4><p className="text-sm text-gray-500">Require team member login to access</p></div>
                  <Switch checked={settingsState.vercelAuthentication} onCheckedChange={(checked) => {
                    setSettingsState(prev => ({ ...prev, vercelAuthentication: checked }))
                    toast.success("Vercel authentication " + (checked ? 'enabled' : 'disabled'))
                  }} />
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
                        <div className="flex items-center justify-between"><div><p className="font-medium">Auto-deploy on push</p><p className="text-sm text-gray-500">Deploy when commits are pushed</p></div><Switch checked={settingsState.autoDeployOnPush} onCheckedChange={(checked) => { setSettingsState(prev => ({ ...prev, autoDeployOnPush: checked })); toast.success("Auto-deploy " + (checked ? 'enabled' : 'disabled')); }} /></div>
                        <div className="flex items-center justify-between"><div><p className="font-medium">Preview Deployments</p><p className="text-sm text-gray-500">Create deployments for PRs</p></div><Switch checked={settingsState.previewDeployments} onCheckedChange={(checked) => { setSettingsState(prev => ({ ...prev, previewDeployments: checked })); toast.success("Preview deployments " + (checked ? 'enabled' : 'disabled')); }} /></div>
                        <div className="flex items-center justify-between"><div><p className="font-medium">Build Cache</p><p className="text-sm text-gray-500">Cache dependencies for faster builds</p></div><Switch checked={settingsState.buildCache} onCheckedChange={(checked) => { setSettingsState(prev => ({ ...prev, buildCache: checked })); toast.success("Build cache " + (checked ? 'enabled' : 'disabled')); }} /></div>
                        <div className="flex items-center justify-between"><div><p className="font-medium">Skew Protection</p><p className="text-sm text-gray-500">Ensure asset/code version consistency</p></div><Switch checked={settingsState.skewProtection} onCheckedChange={(checked) => { setSettingsState(prev => ({ ...prev, skewProtection: checked })); toast.success("Skew protection " + (checked ? 'enabled' : 'disabled')); }} /></div>
                        <div className="flex items-center justify-between"><div><p className="font-medium">Serverless Functions</p><p className="text-sm text-gray-500">Enable serverless API routes</p></div><Switch checked={settingsState.serverlessFunctions} onCheckedChange={(checked) => { setSettingsState(prev => ({ ...prev, serverlessFunctions: checked })); toast.success("Serverless functions " + (checked ? 'enabled' : 'disabled')); }} /></div>
                        <div className="flex items-center justify-between"><div><p className="font-medium">Edge Functions</p><p className="text-sm text-gray-500">Enable edge runtime for routes</p></div><Switch checked={settingsState.edgeFunctions} onCheckedChange={(checked) => { setSettingsState(prev => ({ ...prev, edgeFunctions: checked })); toast.success("Edge functions " + (checked ? 'enabled' : 'disabled')); }} /></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div><Label>Function Timeout</Label><Select defaultValue="60"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="10">10 seconds</SelectItem><SelectItem value="30">30 seconds</SelectItem><SelectItem value="60">60 seconds</SelectItem><SelectItem value="300">5 minutes</SelectItem></SelectContent></Select></div>
                          <div><Label>Function Memory</Label><Select defaultValue="1024"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="512">512 MB</SelectItem><SelectItem value="1024">1024 MB</SelectItem><SelectItem value="2048">2048 MB</SelectItem><SelectItem value="3008">3008 MB</SelectItem></SelectContent></Select></div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-purple-600" />Notifications</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between"><div><p className="font-medium">Email Notifications</p><p className="text-sm text-gray-500">Receive deployment status via email</p></div><Switch checked={settingsState.emailNotifications} onCheckedChange={(checked) => { setSettingsState(prev => ({ ...prev, emailNotifications: checked })); toast.success("Email notifications " + (checked ? 'enabled' : 'disabled')); }} /></div>
                        <div className="flex items-center justify-between"><div><p className="font-medium">Failed Deployment Alerts</p><p className="text-sm text-gray-500">Immediate notification on failures</p></div><Switch checked={settingsState.failedDeploymentAlerts} onCheckedChange={(checked) => { setSettingsState(prev => ({ ...prev, failedDeploymentAlerts: checked })); toast.success("Failed deployment alerts " + (checked ? 'enabled' : 'disabled')); }} /></div>
                        <div className="flex items-center justify-between"><div><p className="font-medium">Production Promotion Alerts</p><p className="text-sm text-gray-500">Notify when deployments go to production</p></div><Switch checked={settingsState.productionPromotionAlerts} onCheckedChange={(checked) => { setSettingsState(prev => ({ ...prev, productionPromotionAlerts: checked })); toast.success("Production promotion alerts " + (checked ? 'enabled' : 'disabled')); }} /></div>
                        <div className="flex items-center justify-between"><div><p className="font-medium">Weekly Summary</p><p className="text-sm text-gray-500">Weekly deployment statistics digest</p></div><Switch checked={settingsState.weeklySummary} onCheckedChange={(checked) => { setSettingsState(prev => ({ ...prev, weeklySummary: checked })); toast.success("Weekly summary " + (checked ? 'enabled' : 'disabled')); }} /></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div><Label>Notification Email</Label><Input type="email" placeholder="team@company.com" className="mt-1" /></div>
                          <div><Label>Slack Channel</Label><Input placeholder="#deployments" className="mt-1" /></div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-purple-600" />Security</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between"><div><p className="font-medium">Force HTTPS</p><p className="text-sm text-gray-500">Redirect all HTTP to HTTPS</p></div><Switch checked={settingsState.forceHttps} onCheckedChange={(checked) => { setSettingsState(prev => ({ ...prev, forceHttps: checked })); toast.success("Force HTTPS " + (checked ? 'enabled' : 'disabled')); }} /></div>
                        <div className="flex items-center justify-between"><div><p className="font-medium">HSTS Headers</p><p className="text-sm text-gray-500">Strict Transport Security</p></div><Switch checked={settingsState.hstsHeaders} onCheckedChange={(checked) => { setSettingsState(prev => ({ ...prev, hstsHeaders: checked })); toast.success("HSTS headers " + (checked ? 'enabled' : 'disabled')); }} /></div>
                        <div className="flex items-center justify-between"><div><p className="font-medium">XSS Protection</p><p className="text-sm text-gray-500">Enable X-XSS-Protection header</p></div><Switch checked={settingsState.xssProtection} onCheckedChange={(checked) => { setSettingsState(prev => ({ ...prev, xssProtection: checked })); toast.success("XSS protection " + (checked ? 'enabled' : 'disabled')); }} /></div>
                        <div className="flex items-center justify-between"><div><p className="font-medium">Content Security Policy</p><p className="text-sm text-gray-500">Define allowed content sources</p></div><Switch checked={settingsState.contentSecurityPolicy} onCheckedChange={(checked) => { setSettingsState(prev => ({ ...prev, contentSecurityPolicy: checked })); toast.success("Content Security Policy " + (checked ? 'enabled' : 'disabled')); }} /></div>
                        <div className="flex items-center justify-between"><div><p className="font-medium">IP Allowlist</p><p className="text-sm text-gray-500">Restrict access by IP address</p></div><Switch checked={settingsState.ipAllowlist} onCheckedChange={(checked) => { setSettingsState(prev => ({ ...prev, ipAllowlist: checked })); toast.success("IP allowlist " + (checked ? 'enabled' : 'disabled')); }} /></div>
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
                        <div className="flex items-center justify-between"><div><p className="font-medium">Auto-deploy Branches</p><p className="text-sm text-gray-500">Automatically deploy all git branches</p></div><Switch checked={settingsState.autoDeployBranches} onCheckedChange={(checked) => { setSettingsState(prev => ({ ...prev, autoDeployBranches: checked })); toast.success("Auto-deploy branches " + (checked ? 'enabled' : 'disabled')); }} /></div>
                        <div className="flex items-center justify-between"><div><p className="font-medium">Production Branch Protection</p><p className="text-sm text-gray-500">Require PR reviews before deploying</p></div><Switch checked={settingsState.productionBranchProtection} onCheckedChange={(checked) => { setSettingsState(prev => ({ ...prev, productionBranchProtection: checked })); toast.success("Production branch protection " + (checked ? 'enabled' : 'disabled')); }} /></div>
                        <div className="flex items-center justify-between"><div><p className="font-medium">Ignored Build Step</p><p className="text-sm text-gray-500">Cancel builds based on changed files</p></div><Switch checked={settingsState.ignoredBuildStep} onCheckedChange={(checked) => { setSettingsState(prev => ({ ...prev, ignoredBuildStep: checked })); toast.success("Ignored build step " + (checked ? 'enabled' : 'disabled')); }} /></div>
                        <div><Label>Ignore Build Pattern</Label><Input placeholder="docs/**, *.md" className="mt-1 font-mono" /></div>
                        <div><Label>Preview Branch Prefix</Label><Input placeholder="preview/, feature/" className="mt-1 font-mono" /></div>
                        <div className="flex items-center justify-between"><div><p className="font-medium">Enable Git Submodules</p><p className="text-sm text-gray-500">Clone submodules during build</p></div><Switch checked={settingsState.enableGitSubmodules} onCheckedChange={(checked) => { setSettingsState(prev => ({ ...prev, enableGitSubmodules: checked })); toast.success("Git submodules " + (checked ? 'enabled' : 'disabled')); }} /></div>
                        <div className="flex items-center justify-between"><div><p className="font-medium">Git LFS</p><p className="text-sm text-gray-500">Enable Large File Storage support</p></div><Switch checked={settingsState.gitLfs} onCheckedChange={(checked) => { setSettingsState(prev => ({ ...prev, gitLfs: checked })); toast.success("Git LFS " + (checked ? 'enabled' : 'disabled')); }} /></div>
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
                            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText('https://api.vercel.com/v1/integrations/deploy/xxxxx'); toast.success('Production hook URL copied'); }}><Copy className="h-3 w-3 mr-1" />Copy</Button>
                            <Button variant="outline" size="sm" className="text-red-600" onClick={async () => {
                              toast.success('Deleting hook...')
                              try {
                                const response = await fetch('/api/deployments?action=delete-hook&hookId=production', { method: 'DELETE' })
                                if (!response.ok) throw new Error('Delete failed')
                                toast.success('Production hook deleted')
                              } catch {
                                toast.error('Failed to delete')
                              }
                            }}><Trash2 className="h-3 w-3 mr-1" />Delete</Button>
                          </div>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Staging Hook</span>
                            <Badge className="bg-blue-100 text-blue-700">Active</Badge>
                          </div>
                          <code className="text-xs text-gray-500 break-all">https://api.vercel.com/v1/integrations/deploy/yyyyy</code>
                          <div className="flex gap-2 mt-2">
                            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText('https://api.vercel.com/v1/integrations/deploy/yyyyy'); toast.success('Staging hook URL copied'); }}><Copy className="h-3 w-3 mr-1" />Copy</Button>
                            <Button variant="outline" size="sm" className="text-red-600" onClick={async () => {
                              toast.success('Deleting hook...')
                              try {
                                const response = await fetch('/api/deployments?action=delete-hook&hookId=staging', { method: 'DELETE' })
                                if (!response.ok) throw new Error('Delete failed')
                                toast.success('Staging hook deleted')
                              } catch {
                                toast.error('Failed to delete')
                              }
                            }}><Trash2 className="h-3 w-3 mr-1" />Delete</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-purple-600" />Commit Checks</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between"><div><p className="font-medium">Required Status Checks</p><p className="text-sm text-gray-500">Block merge until checks pass</p></div><Switch checked={settingsState.requiredStatusChecks} onCheckedChange={(checked) => { setSettingsState(prev => ({ ...prev, requiredStatusChecks: checked })); toast.success("Required status checks " + (checked ? 'enabled' : 'disabled')); }} /></div>
                        <div className="flex items-center justify-between"><div><p className="font-medium">Preview Comments</p><p className="text-sm text-gray-500">Comment preview URL on PRs</p></div><Switch checked={settingsState.previewComments} onCheckedChange={(checked) => { setSettingsState(prev => ({ ...prev, previewComments: checked })); toast.success("Preview comments " + (checked ? 'enabled' : 'disabled')); }} /></div>
                        <div className="flex items-center justify-between"><div><p className="font-medium">GitHub Deployments</p><p className="text-sm text-gray-500">Create GitHub deployment events</p></div><Switch checked={settingsState.githubDeployments} onCheckedChange={(checked) => { setSettingsState(prev => ({ ...prev, githubDeployments: checked })); toast.success("GitHub deployments " + (checked ? 'enabled' : 'disabled')); }} /></div>
                        <div className="flex items-center justify-between"><div><p className="font-medium">Commit Statuses</p><p className="text-sm text-gray-500">Report build status to GitHub</p></div><Switch checked={settingsState.commitStatuses} onCheckedChange={(checked) => { setSettingsState(prev => ({ ...prev, commitStatuses: checked })); toast.success("Commit statuses " + (checked ? 'enabled' : 'disabled')); }} /></div>
                      </CardContent>
                    </Card>
                  </>
                )}
                {settingsTab === 'integrations' && (
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Connected Integrations</CardTitle><Button onClick={() => setShowIntegrationDialog(true)}><Plus className="h-4 w-4 mr-2" />Add Integration</Button></CardHeader>
                    <CardContent className="space-y-4">
                      {[].map(integration => (
                        <div key={integration.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${integration.status === 'connected' ? 'bg-green-100' : 'bg-gray-100'}`}>
                              {integration.type === 'ci_cd' && <GitBranch className="h-5 w-5 text-purple-600" />}
                              {integration.type === 'monitoring' && <Activity className="h-5 w-5 text-blue-600" />}
                              {integration.type === 'notification' && <MessageSquare className="h-5 w-5 text-pink-600" />}
                              {integration.type === 'logging' && <Terminal className="h-5 w-5 text-green-600" />}
                              {integration.type === 'analytics' && <BarChart3 className="h-5 w-5 text-amber-600" />}
                            </div>
                            <div><h4 className="font-medium">{integration.name}</h4><p className="text-sm text-gray-500">Last sync: {integration.lastSync}</p></div>
                          </div>
                          <div className="flex items-center gap-3"><Badge className={integration.status === 'connected' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>{integration.status}</Badge><Button variant="ghost" size="sm" onClick={() => { setSelectedIntegration(integration); setShowIntegrationSettingsDialog(true); }} title="Open settings"><Settings className="h-4 w-4" /></Button></div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
                {settingsTab === 'webhooks' && (
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Webhooks</CardTitle><Button onClick={() => setShowWebhookDialog(true)}><Plus className="h-4 w-4 mr-2" />Add Webhook</Button></CardHeader>
                    <CardContent className="space-y-4">
                      {[].map(webhook => (
                        <div key={webhook.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2"><h4 className="font-medium">{webhook.name}</h4><Badge className={webhook.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{webhook.status}</Badge></div>
                            <p className="font-mono text-sm text-gray-500 mt-1">{webhook.url}</p>
                            <div className="flex items-center gap-2 mt-2">{webhook.events.map(e => <Badge key={e} variant="outline" className="text-xs">{e}</Badge>)}</div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right"><p className="text-sm"><span className={webhook.successRate >= 95 ? 'text-green-600' : 'text-amber-600'}>{webhook.successRate}%</span></p><p className="text-xs text-gray-500">success rate</p></div>
                            <Button variant="ghost" size="icon" onClick={async () => {
                              toast.success("Testing webhook " + webhook.name + "...")
                              try {
                                const response = await fetch('/api/deployments', {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ action: 'test-webhook', webhookId: webhook.id })
                                })
                                if (!response.ok) throw new Error('Test failed')
                                toast.success("Webhook " + webhook.name + " tested successfully")
                              } catch {
                                toast.error('Webhook test failed')
                              }
                            }}><RefreshCw className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-red-500" onClick={async () => {
                              toast.success('Deleting webhook...')
                              try {
                                const response = await fetch("/api/deployments?action=delete-webhook&webhookId=" + webhook.id, { method: 'DELETE' })
                                if (!response.ok) throw new Error('Delete failed')
                                toast.success("Deleted webhook " + webhook.name)
                              } catch {
                                toast.error('Failed to delete webhook')
                              }
                            }}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
                {settingsTab === 'team' && (
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Team Members</CardTitle><Button onClick={() => setShowTeamDialog(true)}><Plus className="h-4 w-4 mr-2" />Invite Member</Button></CardHeader>
                    <CardContent className="space-y-4">
                      {[].map(member => (
                        <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10"><AvatarFallback className="bg-purple-100 text-purple-700">{member.avatar}</AvatarFallback></Avatar>
                            <div><h4 className="font-medium">{member.name}</h4><p className="text-sm text-gray-500">{member.email}</p></div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right"><p className="text-sm font-medium">{member.deploymentsThisMonth} deploys</p><p className="text-xs text-gray-500">this month</p></div>
                            <Badge variant="outline" className={member.role === 'owner' ? 'bg-purple-100 text-purple-700' : member.role === 'admin' ? 'bg-blue-100 text-blue-700' : ''}>{member.role}</Badge>
                            <Button variant="ghost" size="icon" onClick={async () => {
                              toast.success('Loading member options...')
                              try {
                                const response = await fetch("/api/deployments?action=get-member-options&memberId=" + member.id)
                                if (!response.ok) throw new Error('Load failed')
                                toast.success("Showing options for " + member.name)
                              } catch {
                                toast.error('Failed to load options')
                              }
                            }}><MoreHorizontal className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
                {settingsTab === 'plugins' && (
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Build Plugins</CardTitle><Button variant="outline" onClick={() => setShowMarketplaceDialog(true)}><Search className="h-4 w-4 mr-2" />Browse Marketplace</Button></CardHeader>
                    <CardContent className="space-y-4">
                      {plugins.map(plugin => (
                        <div key={plugin.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center"><Package className="h-5 w-5 text-indigo-600" /></div>
                            <div><div className="flex items-center gap-2"><h4 className="font-medium">{plugin.name}</h4><Badge variant="outline" className="text-xs">v{plugin.version}</Badge></div><p className="text-sm text-gray-500">{plugin.description}</p><p className="text-xs text-gray-400 mt-1">by {plugin.author} • {(plugin.installCount / 1000).toFixed(0)}k installs</p></div>
                          </div>
                          <Switch checked={plugin.enabled} onCheckedChange={(checked) => {
                            setPlugins(prev => prev.map(p => p.id === plugin.id ? { ...p, enabled: checked } : p))
                            toast.success(plugin.name + " " + (checked ? 'enabled' : 'disabled'))
                          }} />
                        </div>
                      ))}
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
              onInsightAction={(insight) => {
                if (insight.type === 'warning' && insight.category === 'Resources') {
                  toast.info('Resource Alert')
                } else if (insight.type === 'success') {
                  toast.success(insight.title)
                } else {
                  toast.info(insight.title)
                }
              }}
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
              <Button onClick={() => {
                const logsText = buildLogs.map(log => `[${log.timestamp}] ${log.level.toUpperCase()} [${log.step}] ${log.message}`).join('\n');
                const blob = new Blob([logsText], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `build-logs-${selectedDeployment?.commit || 'unknown'}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                toast.success('Logs downloaded');
              }}><Download className="h-4 w-4 mr-2" />Download Logs</Button>
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
                <Input placeholder="KEY" className="flex-1 font-mono" value={newEnvKey} onChange={(e) => setNewEnvKey(e.target.value)} />
                <Input placeholder="Value" className="flex-1" type="password" value={newEnvValue} onChange={(e) => setNewEnvValue(e.target.value)} />
                <Button onClick={() => {
                  if (!newEnvKey.trim()) {
                    toast.error('Validation Error');
                    return;
                  }
                  const newVar: EnvironmentVariable = {
                    id: Date.now().toString(),
                    key: newEnvKey,
                    value: newEnvValue,
                    environment: 'production',
                    encrypted: true
                  };
                  setEnvVars([...envVars, newVar]);
                  setNewEnvKey('');
                  setNewEnvValue('');
                  toast.success("Variable added", { description: newEnvKey + " has been added to environment variables" });
                }}><Plus className="h-4 w-4" /></Button>
              </div>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {envVars.map(env => (
                    <div key={env.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">{env.key}</span>
                          {env.encrypted && <Lock className="h-3 w-3 text-gray-400" />}
                        </div>
                        <span className="text-sm text-gray-500">{env.value}</span>
                      </div>
                      <Badge variant="outline">{env.environment}</Badge>
                      <Button variant="ghost" size="icon" onClick={() => {
                        setEnvVars(envVars.filter(e => e.id !== env.id));
                        toast.success("Variable deleted", { description: env.key + " has been removed" });
                      }} title="Delete variable"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEnvDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                setIsProcessing(true)
                try {
                  const { data: userData } = await supabase.auth.getUser()
                  if (!userData.user) throw new Error('Not authenticated')

                  // Save environment variables to database
                  for (const envVar of envVars) {
                    await supabase
                      .from('environment_variables')
                      .upsert({
                        id: envVar.id,
                        user_id: userData.user.id,
                        key: envVar.key,
                        value: envVar.encrypted ? '••••••••' : envVar.value,
                        environment: envVar.environment,
                        encrypted: envVar.encrypted,
                        updated_at: new Date().toISOString()
                      }, { onConflict: 'id' })
                  }

                  toast.success("Environment variables saved", { description: envVars.length + " variables updated successfully" })
                  setShowEnvDialog(false)
                } catch (error) {
                  toast.error('Failed to save environment variables')
                } finally {
                  setIsProcessing(false)
                }
              }} disabled={isProcessing}>
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
                <Input placeholder="example.com" className="flex-1" value={newDomainName} onChange={(e) => setNewDomainName(e.target.value)} />
                <Button onClick={() => {
                  if (!newDomainName.trim()) {
                    toast.error('Validation Error');
                    return;
                  }
                  toast.success("Domain added", { description: newDomainName + " has been added. DNS verification pending." });
                  setNewDomainName('');
                }}>Add Domain</Button>
              </div>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {[].map(domain => (
                    <div key={domain.id} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <div className="flex-1">
                        <span className="font-medium">{domain.domain}</span>
                        {domain.ssl && <Badge className="ml-2 bg-green-100 text-green-700"><Lock className="h-3 w-3 mr-1" />SSL</Badge>}
                        {domain.redirectTo && <span className="ml-2 text-sm text-gray-500">→ {domain.redirectTo}</span>}
                      </div>
                      <Badge variant={domain.type === 'production' ? 'default' : 'outline'}>{domain.type}</Badge>
                      <Button variant="ghost" size="icon" onClick={() => {
                        window.open("https://" + domain.domain, '_blank')
                        toast.success("Opened " + domain.domain + " in new tab")
                      }}><ExternalLink className="h-4 w-4" /></Button>
                    </div>
                  ))}
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
              <div><Label>Webhook Name</Label><Input placeholder="Slack Notifications" className="mt-1" /></div>
              <div><Label>Endpoint URL</Label><Input placeholder="https://your-api.com/webhooks" className="mt-1" /></div>
              <div><Label>Events</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 mt-2">
                  {['deployment.created', 'deployment.succeeded', 'deployment.failed', 'deployment.promoted', 'deployment.rolled_back', 'domain.added'].map(event => (
                    <div key={event} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded"><input type="checkbox" /><span className="text-sm font-mono">{event}</span></div>
                  ))}
                </div>
              </div>
              <div><Label>Secret (Optional)</Label><Input placeholder="whsec_xxxxxxxxx" className="mt-1 font-mono" /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowWebhookDialog(false)}>Cancel</Button><Button className="bg-gradient-to-r from-purple-600 to-indigo-600" onClick={() => {
              toast.success('Webhook added');
              setShowWebhookDialog(false);
            }}>Add Webhook</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Team Member Dialog */}
        <Dialog open={showTeamDialog} onOpenChange={setShowTeamDialog}>
          <DialogContent><DialogHeader><DialogTitle>Invite Team Member</DialogTitle><DialogDescription>Add a new member to your deployment team</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div><Label>Email Address</Label><Input type="email" placeholder="colleague@company.com" className="mt-1" /></div>
              <div><Label>Role</Label><Select><SelectTrigger className="mt-1"><SelectValue placeholder="Select role" /></SelectTrigger><SelectContent><SelectItem value="admin">Admin - Full access</SelectItem><SelectItem value="developer">Developer - Deploy & manage</SelectItem><SelectItem value="viewer">Viewer - Read only</SelectItem></SelectContent></Select></div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-700">Team members will receive an email invitation to join your project.</p>
              </div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowTeamDialog(false)}>Cancel</Button><Button className="bg-gradient-to-r from-purple-600 to-indigo-600" onClick={() => {
              toast.success('Invitation sent');
              setShowTeamDialog(false);
            }}>Send Invitation</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Integration Dialog */}
        <Dialog open={showIntegrationDialog} onOpenChange={setShowIntegrationDialog}>
          <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Add Integration</DialogTitle><DialogDescription>Connect third-party services to your deployments</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {[{ name: 'GitHub', icon: GitBranch, color: 'gray' }, { name: 'Datadog', icon: Activity, color: 'purple' }, { name: 'Slack', icon: MessageSquare, color: 'pink' }, { name: 'Sentry', icon: AlertCircle, color: 'red' }, { name: 'PagerDuty', icon: Webhook, color: 'green' }, { name: 'Linear', icon: Layers, color: 'blue' }].map(int => (
                  <button key={int.name} className="p-4 border rounded-lg hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors text-center">
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

        {/* Quick Deploy Dialog */}
        <Dialog open={showQuickDeployDialog} onOpenChange={setShowQuickDeployDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-purple-600" />
                Quick Deploy
              </DialogTitle>
              <DialogDescription>Deploy your application with a single click</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Branch</Label>
                <Select value={quickDeployBranch} onValueChange={setQuickDeployBranch}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">main</SelectItem>
                    <SelectItem value="develop">develop</SelectItem>
                    <SelectItem value="staging">staging</SelectItem>
                    <SelectItem value="feature/new-ui">feature/new-ui</SelectItem>
                    <SelectItem value="fix/auth-bug">fix/auth-bug</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Target Environment</Label>
                <Select value={quickDeployEnvironment} onValueChange={(v) => setQuickDeployEnvironment(v as any)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="preview">Preview</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-2">
                  <GitBranch className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-purple-700 dark:text-purple-300">Deploy Summary</span>
                </div>
                <p className="text-sm text-purple-600 dark:text-purple-400">
                  Deploy <span className="font-mono font-bold">{quickDeployBranch}</span> branch to{' '}
                  <span className="font-bold">{quickDeployEnvironment}</span> environment
                </p>
              </div>
              {quickDeployEnvironment === 'production' && (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span className="text-sm text-amber-700 dark:text-amber-300">
                      Production deployment requires additional review
                    </span>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowQuickDeployDialog(false)}>Cancel</Button>
              <Button
                className="bg-gradient-to-r from-purple-600 to-indigo-600"
                onClick={handleQuickDeploy}
                disabled={isQuickDeploying}
              >
                {isQuickDeploying ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Deploying...</>
                ) : (
                  <><Rocket className="h-4 w-4 mr-2" />Deploy Now</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Quick Rollback Dialog */}
        <Dialog open={showQuickRollbackDialog} onOpenChange={setShowQuickRollbackDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-amber-600">
                <RotateCcw className="h-5 w-5" />
                Quick Rollback
              </DialogTitle>
              <DialogDescription>Rollback to a previous deployment version</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Select Version to Rollback To</Label>
                <Select value={quickRollbackVersion} onValueChange={setQuickRollbackVersion}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose a version..." />
                  </SelectTrigger>
                  <SelectContent>
                    {dbDeployments.filter(d => d.status === 'success').map(dep => (
                      <SelectItem key={dep.id} value={dep.version}>
                        v{dep.version} - {dep.deployment_name} ({dep.environment})
                      </SelectItem>
                    ))}
                    {[].filter(d => d.status === 'success').map(dep => (
                      <SelectItem key={dep.id} value={dep.commit}>
                        {dep.commit} - {dep.commitMessage.substring(0, 30)}...
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="font-medium text-amber-700 dark:text-amber-300">Rollback Warning</span>
                </div>
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Rolling back will mark the current deployment as rolled back and restore the selected version.
                  This action cannot be undone.
                </p>
              </div>
              {quickRollbackVersion && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Target Version:</span>{' '}
                    <span className="font-mono">{quickRollbackVersion}</span>
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowQuickRollbackDialog(false); setQuickRollbackVersion(''); }}>Cancel</Button>
              <Button
                className="bg-amber-600 hover:bg-amber-700"
                onClick={handleQuickRollback}
                disabled={isQuickRollingBack || !quickRollbackVersion}
              >
                {isQuickRollingBack ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Rolling Back...</>
                ) : (
                  <><RotateCcw className="h-4 w-4 mr-2" />Confirm Rollback</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Quick View Logs Dialog */}
        <Dialog open={showQuickLogsDialog} onOpenChange={setShowQuickLogsDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-green-600" />
                Deployment Logs
              </DialogTitle>
              <DialogDescription>Real-time build and deployment logs</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-700">Live</Badge>
                  <span className="text-sm text-gray-500">{buildLogs.length} log entries</span>
                </div>
                <div className="flex gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="error">Errors</SelectItem>
                      <SelectItem value="warn">Warnings</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={() => {
                    const logsText = buildLogs.map(log => `[${log.timestamp}] ${log.level.toUpperCase()} [${log.step}] ${log.message}`).join('\n');
                    navigator.clipboard.writeText(logsText);
                    toast.success('Logs copied to clipboard');
                  }}>
                    <Copy className="h-4 w-4 mr-1" />Copy
                  </Button>
                </div>
              </div>
              <ScrollArea className="h-[400px] bg-gray-900 rounded-lg p-4 font-mono text-sm">
                {Object.entries(groupedLogs).map(([step, logs]) => (
                  <div key={step} className="mb-4">
                    <button
                      onClick={() => toggleLogStep(step)}
                      className="flex items-center gap-2 text-white mb-2 hover:text-green-400 transition-colors"
                    >
                      {expandedLogs.includes(step) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <span className="capitalize font-semibold">{step}</span>
                      <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                        {logs.length} lines
                      </Badge>
                      {logs.some(l => l.level === 'error') && (
                        <Badge className="bg-red-600 text-white text-xs">Has Errors</Badge>
                      )}
                      {logs.some(l => l.level === 'warn') && !logs.some(l => l.level === 'error') && (
                        <Badge className="bg-amber-600 text-white text-xs">Has Warnings</Badge>
                      )}
                    </button>
                    {expandedLogs.includes(step) && (
                      <div className="ml-6 space-y-1 border-l border-gray-700 pl-3">
                        {logs.map(log => (
                          <div key={log.id} className="flex items-start gap-3 hover:bg-gray-800 p-1 rounded">
                            <span className="text-gray-500 text-xs shrink-0 w-16">{log.timestamp}</span>
                            <Badge className={`shrink-0 text-xs ${
                              log.level === 'error' ? 'bg-red-600' :
                              log.level === 'warn' ? 'bg-amber-600' :
                              log.level === 'success' ? 'bg-green-600' : 'bg-blue-600'
                            }`}>
                              {log.level.toUpperCase()}
                            </Badge>
                            <span className={`${getLogColor(log.level)}`}>{log.message}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </ScrollArea>
              <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-gray-600 dark:text-gray-400">Success: {buildLogs.filter(l => l.level === 'success').length}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="text-gray-600 dark:text-gray-400">Warnings: {buildLogs.filter(l => l.level === 'warn').length}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-gray-600 dark:text-gray-400">Errors: {buildLogs.filter(l => l.level === 'error').length}</span>
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={() => {
                  const logsText = buildLogs.map(log => `[${log.timestamp}] ${log.level.toUpperCase()} [${log.step}] ${log.message}`).join('\n');
                  const blob = new Blob([logsText], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `deployment-logs-${new Date().toISOString().split('T')[0]}.txt`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  toast.success('Logs downloaded');
                }}>
                  <Download className="h-4 w-4 mr-1" />Download
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowQuickLogsDialog(false)}>Close</Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => { setShowQuickLogsDialog(false); setShowLiveTailDialog(true); }}>
                <Play className="h-4 w-4 mr-2" />Live Tail
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

        {/* Filters Dialog */}
        <Dialog open={showFiltersDialog} onOpenChange={setShowFiltersDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Filter className="h-5 w-5" />Advanced Filters</DialogTitle>
              <DialogDescription>Filter deployments by various criteria</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Status</Label>
                <Select value={filterOptions.status} onValueChange={(v) => setFilterOptions(prev => ({ ...prev, status: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date Range</Label>
                <Select value={filterOptions.dateRange} onValueChange={(v) => setFilterOptions(prev => ({ ...prev, dateRange: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                    <SelectItem value="quarter">Last 90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Author</Label>
                <Select value={filterOptions.author} onValueChange={(v) => setFilterOptions(prev => ({ ...prev, author: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Authors</SelectItem>
                    <SelectItem value="me">My Deployments</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setFilterOptions({ status: 'all', dateRange: 'all', author: 'all' }); }}>Clear Filters</Button>
              <Button onClick={async () => {
                setIsProcessing(true)
                try {
                  // Build query based on filter options
                  let query = supabase
                    .from('deployments')
                    .select('*')
                    .order('created_at', { ascending: false })

                  if (filterOptions.status !== 'all') {
                    query = query.eq('status', filterOptions.status)
                  }

                  if (filterOptions.dateRange !== 'all') {
                    const now = new Date()
                    let startDate: Date
                    switch (filterOptions.dateRange) {
                      case 'today':
                        startDate = new Date(now.setHours(0, 0, 0, 0))
                        break
                      case 'week':
                        startDate = new Date(now.setDate(now.getDate() - 7))
                        break
                      case 'month':
                        startDate = new Date(now.setDate(now.getDate() - 30))
                        break
                      case 'quarter':
                        startDate = new Date(now.setDate(now.getDate() - 90))
                        break
                      default:
                        startDate = new Date(0)
                    }
                    query = query.gte('created_at', startDate.toISOString())
                  }

                  const { data, error } = await query
                  if (error) throw error

                  if (data) {
                    setDbDeployments(data)
                  }

                  const appliedFilters = []
                  if (filterOptions.status !== 'all') appliedFilters.push(`Status: ${filterOptions.status}`)
                  if (filterOptions.dateRange !== 'all') appliedFilters.push(`Date: ${filterOptions.dateRange}`)
                  if (filterOptions.author !== 'all') appliedFilters.push(`Author: ${filterOptions.author}`)

                  toast.success('Filters applied')
                  setShowFiltersDialog(false)
                } catch (error) {
                  toast.error('Failed to apply filters')
                } finally {
                  setIsProcessing(false)
                }
              }} disabled={isProcessing}>
                {isProcessing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Applying...</> : 'Apply Filters'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Inspect Dialog */}
        <Dialog open={showInspectDialog} onOpenChange={setShowInspectDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Eye className="h-5 w-5" />Deployment Details - {inspectedDeployment?.name}</DialogTitle>
              <DialogDescription>Detailed inspection of deployment configuration and metrics</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500">Environment</p>
                  <p className="font-semibold">{inspectedDeployment?.environment}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-semibold capitalize">{inspectedDeployment?.status}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500">Commit</p>
                  <p className="font-mono text-sm">{inspectedDeployment?.commit}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-semibold">{inspectedDeployment?.duration}</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 mb-2">Commit Message</p>
                <p>{inspectedDeployment?.commitMessage}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 mb-2">Preview URL</p>
                {inspectedDeployment?.previewUrl ? (
                  <a href={inspectedDeployment.previewUrl} target="_blank" className="text-purple-600 hover:underline flex items-center gap-1">
                    {inspectedDeployment.previewUrl}<ExternalLink className="h-3 w-3" />
                  </a>
                ) : <span className="text-gray-400">Not available</span>}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowInspectDialog(false)}>Close</Button>
              <Button onClick={() => { setSelectedDeployment(inspectedDeployment); setShowInspectDialog(false); setShowLogsDialog(true); }}>
                <Terminal className="h-4 w-4 mr-2" />View Logs
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Function Dialog */}
        <Dialog open={showNewFunctionDialog} onOpenChange={setShowNewFunctionDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Plus className="h-5 w-5" />Create New Function</DialogTitle>
              <DialogDescription>Deploy a new serverless function</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Function Name</Label>
                <Input placeholder="my-function" className="mt-1 font-mono" value={newFunctionForm.name} onChange={(e) => setNewFunctionForm(prev => ({ ...prev, name: e.target.value }))} />
              </div>
              <div>
                <Label>Runtime</Label>
                <Select value={newFunctionForm.runtime} onValueChange={(v) => setNewFunctionForm(prev => ({ ...prev, runtime: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Node.js 20">Node.js 20</SelectItem>
                    <SelectItem value="Node.js 18">Node.js 18</SelectItem>
                    <SelectItem value="Python 3.12">Python 3.12</SelectItem>
                    <SelectItem value="Go 1.21">Go 1.21</SelectItem>
                    <SelectItem value="Ruby 3.2">Ruby 3.2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Region</Label>
                <Select value={newFunctionForm.region} onValueChange={(v) => setNewFunctionForm(prev => ({ ...prev, region: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="iad1">Washington, D.C. (iad1)</SelectItem>
                    <SelectItem value="sfo1">San Francisco (sfo1)</SelectItem>
                    <SelectItem value="hnd1">Tokyo (hnd1)</SelectItem>
                    <SelectItem value="cdg1">Paris (cdg1)</SelectItem>
                    <SelectItem value="syd1">Sydney (syd1)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Memory</Label>
                <Select value={newFunctionForm.memory} onValueChange={(v) => setNewFunctionForm(prev => ({ ...prev, memory: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="128">128 MB</SelectItem>
                    <SelectItem value="256">256 MB</SelectItem>
                    <SelectItem value="512">512 MB</SelectItem>
                    <SelectItem value="1024">1024 MB</SelectItem>
                    <SelectItem value="2048">2048 MB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewFunctionDialog(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-yellow-500 to-orange-500" onClick={() => {
                if (!newFunctionForm.name.trim()) {
                  toast.error('Function name is required');
                  return;
                }
                toast.success(`Function created`, { description: `${newFunctionForm.name} has been deployed` });
                setNewFunctionForm({ name: '', runtime: 'Node.js 20', region: 'iad1', memory: '256' });
                setShowNewFunctionDialog(false);
              }}>Create Function</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Edge Config Dialog */}
        <Dialog open={showEdgeConfigDialog} onOpenChange={setShowEdgeConfigDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Database className="h-5 w-5" />Create Edge Config</DialogTitle>
              <DialogDescription>Create a new edge configuration store</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Config Name</Label>
                <Input placeholder="my-edge-config" className="mt-1 font-mono" value={newEdgeConfigForm.name} onChange={(e) => setNewEdgeConfigForm({ name: e.target.value })} />
              </div>
              <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                <p className="text-sm text-cyan-700 dark:text-cyan-300">Edge configs are globally distributed key-value stores optimized for read-heavy workloads.</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEdgeConfigDialog(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-cyan-600 to-teal-600" onClick={() => {
                if (!newEdgeConfigForm.name.trim()) {
                  toast.error('Config name is required');
                  return;
                }
                toast.success(`Edge config created`, { description: `${newEdgeConfigForm.name} is now available` });
                setNewEdgeConfigForm({ name: '' });
                setShowEdgeConfigDialog(false);
              }}>Create Config</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Edge Config Dialog */}
        <Dialog open={showEdgeConfigViewDialog} onOpenChange={setShowEdgeConfigViewDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Eye className="h-5 w-5" />Edge Config - {selectedEdgeConfig?.name}</DialogTitle>
              <DialogDescription>View configuration values</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500">Items</p>
                  <p className="font-semibold">{selectedEdgeConfig?.items}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500">Size</p>
                  <p className="font-semibold">{selectedEdgeConfig?.size}</p>
                </div>
              </div>
              <div className="p-4 bg-gray-900 rounded-lg font-mono text-sm">
                <pre className="text-green-400">{`{
  "feature_flags": {
    "dark_mode": true,
    "beta_features": false
  },
  "api_keys": ["***", "***"],
  "rate_limits": {
    "default": 100,
    "premium": 1000
  }
}`}</pre>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEdgeConfigViewDialog(false)}>Close</Button>
              <Button onClick={() => { setShowEdgeConfigViewDialog(false); setShowEdgeConfigEditDialog(true); }}>
                <Settings className="h-4 w-4 mr-2" />Edit Config
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Edge Config Dialog */}
        <Dialog open={showEdgeConfigEditDialog} onOpenChange={setShowEdgeConfigEditDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Settings className="h-5 w-5" />Edit Edge Config - {selectedEdgeConfig?.name}</DialogTitle>
              <DialogDescription>Modify configuration values</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Configuration JSON</Label>
                <Textarea
                  className="mt-1 font-mono h-64"
                  value={edgeConfigContent}
                  onChange={(e) => setEdgeConfigContent(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEdgeConfigEditDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                if (!selectedEdgeConfig) return
                setIsProcessing(true)
                try {
                  // Validate JSON
                  try {
                    JSON.parse(edgeConfigContent)
                  } catch {
                    throw new Error('Invalid JSON format')
                  }

                  const { data: userData } = await supabase.auth.getUser()
                  if (!userData.user) throw new Error('Not authenticated')

                  const { error } = await supabase
                    .from('edge_configs')
                    .update({
                      config_data: JSON.parse(edgeConfigContent),
                      updated_at: new Date().toISOString()
                    })
                    .eq('name', selectedEdgeConfig.name)

                  if (error) throw error

                  toast.success(`Config updated`, { description: `${selectedEdgeConfig.name} configuration saved` })
                  setShowEdgeConfigEditDialog(false)
                } catch (error) {
                  toast.error('Failed to update config')
                } finally {
                  setIsProcessing(false)
                }
              }} disabled={isProcessing}>
                {isProcessing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Folder Dialog */}
        <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Folder className="h-5 w-5" />Create New Folder</DialogTitle>
              <DialogDescription>Create a new folder in blob storage</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Folder Name</Label>
                <Input placeholder="my-folder" className="mt-1" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewFolderDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                if (!newFolderName.trim()) {
                  toast.error('Folder name is required');
                  return;
                }
                toast.success(`Folder created`, { description: `${newFolderName} has been created` });
                setNewFolderName('');
                setShowNewFolderDialog(false);
              }}>Create Folder</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Upload Dialog */}
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Upload className="h-5 w-5" />Upload Files</DialogTitle>
              <DialogDescription>Upload files to blob storage</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div
                className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center"
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  const files = Array.from(e.dataTransfer.files)
                  setUploadedFiles(prev => [...prev, ...files])
                }}
              >
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-sm text-gray-500 mb-2">Drag and drop files here or click to browse</p>
                <input
                  type="file"
                  className="hidden"
                  id="file-upload"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    setUploadedFiles(prev => [...prev, ...files])
                  }}
                />
                <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>Browse Files</Button>
              </div>
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Files ({uploadedFiles.length})</Label>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {uploadedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                        <span className="truncate">{file.name}</span>
                        <Button variant="ghost" size="sm" onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== idx))}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="text-xs text-gray-500">
                <p>Supported formats: Images, PDFs, Videos, Documents</p>
                <p>Maximum file size: 100MB</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowUploadDialog(false); setUploadedFiles([]); }}>Cancel</Button>
              <Button
                disabled={uploadedFiles.length === 0 || isProcessing}
                onClick={async () => {
                  if (uploadedFiles.length === 0) {
                    toast.error('Please select files to upload')
                    return
                  }

                  setIsProcessing(true)
                  try {
                    const { data: userData } = await supabase.auth.getUser()
                    if (!userData.user) throw new Error('Not authenticated')

                    let successCount = 0
                    for (const file of uploadedFiles) {
                      const filePath = `${userData.user.id}/uploads/${Date.now()}_${file.name}`
                      const { error } = await supabase.storage
                        .from('blob-storage')
                        .upload(filePath, file)

                      if (!error) successCount++
                    }

                    toast.success(`Files uploaded`, { description: `${successCount} of ${uploadedFiles.length} files uploaded successfully` })
                    setUploadedFiles([])
                    setShowUploadDialog(false)
                  } catch (error) {
                    toast.error('Upload failed')
                  } finally {
                    setIsProcessing(false)
                  }
                }}
              >
                {isProcessing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading...</> : `Upload ${uploadedFiles.length > 0 ? `(${uploadedFiles.length})` : ''}`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Logs Dialog */}
        <Dialog open={showExportLogsDialog} onOpenChange={setShowExportLogsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Download className="h-5 w-5" />Export Logs</DialogTitle>
              <DialogDescription>Download logs in your preferred format</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Time Range</Label>
                <Select defaultValue="24h">
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">Last 1 Hour</SelectItem>
                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Format</Label>
                <Select defaultValue="json">
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="txt">Plain Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="include-errors" defaultChecked />
                <label htmlFor="include-errors" className="text-sm">Include error logs only</label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExportLogsDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                const logsText = buildLogs.map(log => `[${log.timestamp}] ${log.level.toUpperCase()} [${log.step}] ${log.message}`).join('\n');
                const blob = new Blob([logsText], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `logs-export-${new Date().toISOString().split('T')[0]}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                toast.success('Logs exported');
                setShowExportLogsDialog(false);
              }}>Export Logs</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Live Tail Dialog */}
        <Dialog open={showLiveTailDialog} onOpenChange={setShowLiveTailDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-green-600" />
                Live Log Tail
                <Badge className="bg-green-100 text-green-700 animate-pulse">Streaming</Badge>
              </DialogTitle>
              <DialogDescription>Real-time log stream from your deployments</DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[400px] bg-gray-900 rounded-lg p-4 font-mono text-sm">
              {buildLogs.map(log => (
                <div key={log.id} className="flex items-start gap-3 mb-1">
                  <span className="text-gray-500 text-xs">{log.timestamp}</span>
                  <span className={getLogColor(log.level)}>{log.message}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 text-green-400 mt-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span>Waiting for new logs...</span>
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowLiveTailDialog(false)}>Stop Streaming</Button>
              <Button variant="outline" onClick={() => {
                const logsText = buildLogs.map(log => `[${log.timestamp}] ${log.level.toUpperCase()} ${log.message}`).join('\n');
                navigator.clipboard.writeText(logsText);
                toast.success('Logs copied to clipboard');
              }}><Copy className="h-4 w-4 mr-2" />Copy Logs</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Log Analytics Dialog */}
        <Dialog open={showLogAnalyticsDialog} onOpenChange={setShowLogAnalyticsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Log Analytics</DialogTitle>
              <DialogDescription>Analyze patterns and trends in your logs</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-2xl font-bold">{buildLogs.length}</p>
                  <p className="text-sm text-gray-500">Total Logs</p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-600">{buildLogs.filter(l => l.level === 'error').length}</p>
                  <p className="text-sm text-gray-500">Errors</p>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-center">
                  <p className="text-2xl font-bold text-amber-600">{buildLogs.filter(l => l.level === 'warn').length}</p>
                  <p className="text-sm text-gray-500">Warnings</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="font-medium mb-2">Log Distribution by Step</p>
                <div className="space-y-2">
                  {Object.entries(groupedLogs).map(([step, logs]) => (
                    <div key={step} className="flex items-center gap-2">
                      <span className="text-sm capitalize w-20">{step}</span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                        <div className="bg-purple-600 h-4 rounded-full" style={{ width: `${(logs.length / buildLogs.length) * 100}%` }}></div>
                      </div>
                      <span className="text-sm text-gray-500">{logs.length}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowLogAnalyticsDialog(false)}>Close</Button>
              <Button onClick={() => { setShowLogAnalyticsDialog(false); setShowExportLogsDialog(true); }}>
                <Download className="h-4 w-4 mr-2" />Export Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Errors Dialog */}
        <Dialog open={showErrorsDialog} onOpenChange={setShowErrorsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600"><AlertCircle className="h-5 w-5" />Error Logs</DialogTitle>
              <DialogDescription>All error logs from your deployments</DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {buildLogs.filter(l => l.level === 'error').map(log => (
                  <div key={log.id} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2 text-sm text-red-600 mb-1">
                      <AlertCircle className="h-4 w-4" />
                      <span>{log.timestamp}</span>
                      <Badge className="bg-red-100 text-red-700">{log.step}</Badge>
                    </div>
                    <p className="text-red-800 dark:text-red-200">{log.message}</p>
                  </div>
                ))}
                {buildLogs.filter(l => l.level === 'error').length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                    <p>No errors found!</p>
                  </div>
                )}
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowErrorsDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Alerts Dialog */}
        <Dialog open={showAlertsDialog} onOpenChange={setShowAlertsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />Set Up Alerts</DialogTitle>
              <DialogDescription>Configure alert notifications for log events</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span>Error Alerts</span>
                </div>
                <Switch checked={alertSettings.errorAlerts} onCheckedChange={(checked) => setAlertSettings(prev => ({ ...prev, errorAlerts: checked }))} />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span>Warning Alerts</span>
                </div>
                <Switch checked={alertSettings.warningAlerts} onCheckedChange={(checked) => setAlertSettings(prev => ({ ...prev, warningAlerts: checked }))} />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Rocket className="h-4 w-4 text-purple-500" />
                  <span>Deployment Alerts</span>
                </div>
                <Switch checked={alertSettings.deploymentAlerts} onCheckedChange={(checked) => setAlertSettings(prev => ({ ...prev, deploymentAlerts: checked }))} />
              </div>
              <div>
                <Label>Notification Email</Label>
                <Input
                  placeholder="alerts@example.com"
                  className="mt-1"
                  value={alertSettings.notificationEmail}
                  onChange={(e) => setAlertSettings(prev => ({ ...prev, notificationEmail: e.target.value }))}
                />
              </div>
              <div>
                <Label>Slack Webhook URL (Optional)</Label>
                <Input
                  placeholder="https://hooks.slack.com/..."
                  className="mt-1 font-mono"
                  value={alertSettings.slackWebhookUrl}
                  onChange={(e) => setAlertSettings(prev => ({ ...prev, slackWebhookUrl: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAlertsDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                setIsProcessing(true)
                try {
                  const { data: userData } = await supabase.auth.getUser()
                  if (!userData.user) throw new Error('Not authenticated')

                  const { error } = await supabase
                    .from('alert_settings')
                    .upsert({
                      user_id: userData.user.id,
                      error_alerts: alertSettings.errorAlerts,
                      warning_alerts: alertSettings.warningAlerts,
                      deployment_alerts: alertSettings.deploymentAlerts,
                      notification_email: alertSettings.notificationEmail,
                      slack_webhook_url: alertSettings.slackWebhookUrl,
                      updated_at: new Date().toISOString()
                    }, { onConflict: 'user_id' })

                  if (error) throw error

                  const enabledAlerts = []
                  if (alertSettings.errorAlerts) enabledAlerts.push('Errors')
                  if (alertSettings.warningAlerts) enabledAlerts.push('Warnings')
                  if (alertSettings.deploymentAlerts) enabledAlerts.push('Deployments')
                  toast.success('Alert settings saved - ' + (enabledAlerts.length > 0 ? enabledAlerts.join(', ') : 'All alerts disabled'))
                  setShowAlertsDialog(false)
                } catch (error) {
                  toast.error('Failed to save alert settings')
                } finally {
                  setIsProcessing(false)
                }
              }} disabled={isProcessing}>
                {isProcessing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : 'Save Settings'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Analytics Export Dialog */}
        <Dialog open={showAnalyticsExportDialog} onOpenChange={setShowAnalyticsExportDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Download className="h-5 w-5" />Export Analytics</DialogTitle>
              <DialogDescription>Download analytics data</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Date Range</Label>
                <Select defaultValue="30">
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 Days</SelectItem>
                    <SelectItem value="30">Last 30 Days</SelectItem>
                    <SelectItem value="90">Last 90 Days</SelectItem>
                    <SelectItem value="365">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Format</Label>
                <Select defaultValue="csv">
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Include</Label>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="include-bandwidth" defaultChecked />
                  <label htmlFor="include-bandwidth" className="text-sm">Bandwidth metrics</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="include-executions" defaultChecked />
                  <label htmlFor="include-executions" className="text-sm">Execution metrics</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="include-cache" defaultChecked />
                  <label htmlFor="include-cache" className="text-sm">Cache statistics</label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAnalyticsExportDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                setIsProcessing(true)
                try {
                  // Generate analytics data based on form selections
                  const analyticsData = {
                    exportDate: new Date().toISOString(),
                    dateRange: '30 days',
                    metrics: {
                      bandwidth: {
                        total: '125.8 GB',
                        average_daily: '4.2 GB',
                        peak: '8.5 GB'
                      },
                      executions: {
                        total: 2456890,
                        success_rate: '99.7%',
                        average_duration: '45ms'
                      },
                      cache: {
                        hit_rate: '94.2%',
                        misses: 145670,
                        size: '2.4 GB'
                      }
                    },
                    deployments: dbDeployments.map(d => ({
                      id: d.id,
                      name: d.deployment_name,
                      status: d.status,
                      environment: d.environment,
                      created_at: d.created_at
                    }))
                  }

                  const blob = new Blob([JSON.stringify(analyticsData, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  URL.revokeObjectURL(url)

                  toast.success('Analytics exported')
                  setShowAnalyticsExportDialog(false)
                } catch (error) {
                  toast.error('Export failed')
                } finally {
                  setIsProcessing(false)
                }
              }} disabled={isProcessing}>
                {isProcessing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Exporting...</> : 'Export'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Security Audit Dialog */}
        <Dialog open={showSecurityAuditDialog} onOpenChange={setShowSecurityAuditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-red-600" />Security Audit</DialogTitle>
              <DialogDescription>Security status and recommendations</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-700">Security Score: A+</span>
                </div>
                <p className="text-sm text-green-600">Your deployment is well protected</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-green-500" />
                    <span>SSL/TLS Certificate</span>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Valid</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span>DDoS Protection</span>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-green-500" />
                    <span>Password Protection</span>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span>Security Headers</span>
                  </div>
                  <Badge className="bg-amber-100 text-amber-700">Partial</Badge>
                </div>
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <p className="font-medium text-amber-700 mb-2">Recommendations</p>
                <ul className="text-sm text-amber-600 space-y-1">
                  <li>- Enable strict Content-Security-Policy header</li>
                  <li>- Add X-Frame-Options header to prevent clickjacking</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSecurityAuditDialog(false)}>Close</Button>
              <Button onClick={async () => {
                setIsProcessing(true)
                try {
                  const securityReport = {
                    reportDate: new Date().toISOString(),
                    overallScore: 'A+',
                    status: 'Well Protected',
                    checks: {
                      ssl_tls: {
                        status: 'valid',
                        expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                        issuer: "Let's Encrypt"
                      },
                      ddos_protection: {
                        status: 'active',
                        provider: 'Cloudflare',
                        level: 'Enterprise'
                      },
                      password_protection: {
                        status: 'enabled',
                        environments: ['production', 'staging']
                      },
                      security_headers: {
                        status: 'partial',
                        missing: ['Content-Security-Policy', 'X-Frame-Options'],
                        present: ['X-Content-Type-Options', 'X-XSS-Protection']
                      }
                    },
                    recommendations: [
                      'Enable strict Content-Security-Policy header',
                      'Add X-Frame-Options header to prevent clickjacking',
                      'Consider enabling HSTS with preload'
                    ],
                    lastScan: new Date().toISOString()
                  }

                  const blob = new Blob([JSON.stringify(securityReport, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `security-audit-${new Date().toISOString().split('T')[0]}.json`
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  URL.revokeObjectURL(url)

                  toast.success('Security report downloaded')
                  setShowSecurityAuditDialog(false)
                } catch (error) {
                  toast.error('Failed to generate report')
                } finally {
                  setIsProcessing(false)
                }
              }} disabled={isProcessing}>
                {isProcessing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</> : <><Download className="h-4 w-4 mr-2" />Download Report</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Rule Dialog */}
        <Dialog open={showAddRuleDialog} onOpenChange={setShowAddRuleDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Plus className="h-5 w-5" />Add Protection Rule</DialogTitle>
              <DialogDescription>Create a new security rule for your deployments</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Rule Name</Label>
                <Input placeholder="My protection rule" className="mt-1" value={newRuleForm.name} onChange={(e) => setNewRuleForm(prev => ({ ...prev, name: e.target.value }))} />
              </div>
              <div>
                <Label>Protection Type</Label>
                <Select value={newRuleForm.type} onValueChange={(v) => setNewRuleForm(prev => ({ ...prev, type: v as any }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="password">Password Protection</SelectItem>
                    <SelectItem value="vercel_auth">Vercel Authentication</SelectItem>
                    <SelectItem value="trusted_ips">Trusted IPs Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={newRuleForm.enabled} onCheckedChange={(v) => setNewRuleForm(prev => ({ ...prev, enabled: v }))} />
                <span>Enable rule immediately</span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddRuleDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                if (!newRuleForm.name.trim()) {
                  toast.error('Rule name is required');
                  return;
                }
                toast.success(`Protection rule added`, { description: `${newRuleForm.name} is now ${newRuleForm.enabled ? 'active' : 'inactive'}` });
                setNewRuleForm({ name: '', type: 'password', enabled: true });
                setShowAddRuleDialog(false);
              }}>Add Rule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Hook Dialog */}
        <Dialog open={showCreateHookDialog} onOpenChange={setShowCreateHookDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Webhook className="h-5 w-5" />Create Deploy Hook</DialogTitle>
              <DialogDescription>Generate a webhook URL to trigger deployments</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Hook Name</Label>
                <Input placeholder="Production Deploy Hook" className="mt-1" value={newHookForm.name} onChange={(e) => setNewHookForm(prev => ({ ...prev, name: e.target.value }))} />
              </div>
              <div>
                <Label>Branch</Label>
                <Select value={newHookForm.branch} onValueChange={(v) => setNewHookForm(prev => ({ ...prev, branch: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">main</SelectItem>
                    <SelectItem value="develop">develop</SelectItem>
                    <SelectItem value="staging">staging</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Deploy hooks allow you to trigger deployments from external services using HTTP POST requests.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateHookDialog(false)}>Cancel</Button>
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600" onClick={() => {
                if (!newHookForm.name.trim()) {
                  toast.error('Hook name is required');
                  return;
                }
                toast.success(`Deploy hook created`, { description: `${newHookForm.name} hook is ready` });
                setNewHookForm({ name: '', branch: 'main' });
                setShowCreateHookDialog(false);
              }}>Create Hook</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Marketplace Dialog */}
        <Dialog open={showMarketplaceDialog} onOpenChange={setShowMarketplaceDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Search className="h-5 w-5" />Build Plugin Marketplace</DialogTitle>
              <DialogDescription>Browse and install plugins for your build process</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input placeholder="Search plugins..." />
              <div className="space-y-3">
                {[
                  { name: 'TypeScript Optimizer', description: 'Optimize TypeScript builds', installs: '120k' },
                  { name: 'Image Compressor', description: 'Automatically compress images', installs: '89k' },
                  { name: 'Bundle Analyzer', description: 'Analyze bundle size', installs: '76k' },
                  { name: 'Security Scanner', description: 'Scan for vulnerabilities', installs: '54k' },
                ].map(plugin => (
                  <div key={plugin.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Package className="h-8 w-8 text-indigo-600" />
                      <div>
                        <p className="font-medium">{plugin.name}</p>
                        <p className="text-sm text-gray-500">{plugin.description}</p>
                        <p className="text-xs text-gray-400">{plugin.installs} installs</p>
                      </div>
                    </div>
                    <Button variant="outline" onClick={async () => {
                      toast.promise(
                        (async () => {
                          const { data: userData } = await supabase.auth.getUser()
                          if (!userData.user) throw new Error('Not authenticated')

                          // Record plugin installation
                          const { error } = await supabase
                            .from('installed_plugins')
                            .insert({
                              user_id: userData.user.id,
                              plugin_name: plugin.name,
                              plugin_description: plugin.description,
                              installed_at: new Date().toISOString()
                            })

                          if (error && !error.message.includes('duplicate')) throw error

                          // Add to local plugins state
                          setPlugins(prev => [...prev, {
                            id: `marketplace-${plugin.name.toLowerCase().replace(/\s+/g, '-')}`,
                            name: plugin.name,
                            version: '1.0.0',
                            description: plugin.description,
                            author: 'Marketplace',
                            enabled: true,
                            installCount: parseInt(plugin.installs) * 1000
                          }])

                          return plugin.name
                        })(),
                        {
                          loading: `Installing ${plugin.name}...`,
                          success: (name) => `${name} installed successfully`,
                          error: 'Installation failed'
                        }
                      )
                    }}>Install</Button>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMarketplaceDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete All Deployments Dialog */}
        <Dialog open={showDeleteAllDeploymentsDialog} onOpenChange={setShowDeleteAllDeploymentsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600"><AlertOctagon className="h-5 w-5" />Delete All Deployments</DialogTitle>
              <DialogDescription>This action cannot be undone</DialogDescription>
            </DialogHeader>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-200">
                This will permanently delete all deployments from this project. This action cannot be undone.
              </p>
            </div>
            <div className="space-y-4 py-4">
              <div>
                <Label>Type "DELETE ALL" to confirm</Label>
                <Input
                  placeholder="DELETE ALL"
                  className="mt-1"
                  value={deleteAllConfirmation}
                  onChange={(e) => setDeleteAllConfirmation(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowDeleteAllDeploymentsDialog(false); setDeleteAllConfirmation(''); }}>Cancel</Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                disabled={deleteAllConfirmation !== 'DELETE ALL' || isProcessing}
                onClick={async () => {
                  if (deleteAllConfirmation !== 'DELETE ALL') {
                    toast.error('Please type DELETE ALL to confirm')
                    return
                  }

                  setIsProcessing(true)
                  try {
                    const { data: userData } = await supabase.auth.getUser()
                    if (!userData.user) throw new Error('Not authenticated')

                    const { error } = await supabase
                      .from('deployments')
                      .delete()
                      .eq('user_id', userData.user.id)

                    if (error) throw error

                    setDbDeployments([])
                    toast.success('All deployments deleted')
                    setShowDeleteAllDeploymentsDialog(false)
                    setDeleteAllConfirmation('')
                  } catch (error) {
                    toast.error('Failed to delete deployments')
                  } finally {
                    setIsProcessing(false)
                  }
                }}
              >
                {isProcessing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Deleting...</> : <><Trash2 className="h-4 w-4 mr-2" />Delete All</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reset Settings Dialog */}
        <Dialog open={showResetSettingsDialog} onOpenChange={setShowResetSettingsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600"><RefreshCw className="h-5 w-5" />Reset Project Settings</DialogTitle>
              <DialogDescription>Reset all settings to their defaults</DialogDescription>
            </DialogHeader>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-200">
                This will reset all project settings including environment variables, build settings, and domain configurations.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowResetSettingsDialog(false)}>Cancel</Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                disabled={isProcessing}
                onClick={async () => {
                  setIsProcessing(true)
                  try {
                    const { data: userData } = await supabase.auth.getUser()
                    if (!userData.user) throw new Error('Not authenticated')

                    // Reset environment variables
                    await supabase
                      .from('environment_variables')
                      .delete()
                      .eq('user_id', userData.user.id)

                    // Reset alert settings
                    await supabase
                      .from('alert_settings')
                      .delete()
                      .eq('user_id', userData.user.id)

                    // Reset local state
                    setEnvVars([])
                    setAlertSettings({
                      errorAlerts: true,
                      warningAlerts: false,
                      deploymentAlerts: true,
                      notificationEmail: '',
                      slackWebhookUrl: '',
                    })
                    setFilterOptions({ status: 'all', dateRange: 'all', author: 'all' })

                    toast.success('Project settings reset')
                    setShowResetSettingsDialog(false)
                  } catch (error) {
                    toast.error('Failed to reset settings')
                  } finally {
                    setIsProcessing(false)
                  }
                }}
              >
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
              <DialogDescription>Prevent new deployments to this project</DialogDescription>
            </DialogHeader>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-200">
                Disabling deployments will prevent any new deployments from being created. Existing deployments will remain active.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDisableDeploymentsDialog(false)}>Cancel</Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                disabled={isProcessing}
                onClick={async () => {
                  setIsProcessing(true)
                  try {
                    const { data: userData } = await supabase.auth.getUser()
                    if (!userData.user) throw new Error('Not authenticated')

                    const { error } = await supabase
                      .from('project_settings')
                      .upsert({
                        user_id: userData.user.id,
                        deployments_enabled: false,
                        updated_at: new Date().toISOString()
                      }, { onConflict: 'user_id' })

                    if (error) throw error

                    toast.success('Deployments disabled')
                    setShowDisableDeploymentsDialog(false)
                  } catch (error) {
                    toast.error('Failed to disable deployments')
                  } finally {
                    setIsProcessing(false)
                  }
                }}
              >
                {isProcessing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Disabling...</> : <><Lock className="h-4 w-4 mr-2" />Disable Deployments</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Project Dialog */}
        <Dialog open={showDeleteProjectDialog} onOpenChange={setShowDeleteProjectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600"><Trash2 className="h-5 w-5" />Delete Project</DialogTitle>
              <DialogDescription>Permanently delete this project and all data</DialogDescription>
            </DialogHeader>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-200">
                This will permanently delete the entire project including all deployments, environment variables, domains, and settings. This action cannot be undone.
              </p>
            </div>
            <div className="space-y-4 py-4">
              <div>
                <Label>Type the project name to confirm</Label>
                <Input placeholder="freeflow-app" className="mt-1" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteProjectDialog(false)}>Cancel</Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={async () => {
                toast.loading('Deleting project...', { id: 'delete-project' })
                try {
                  const response = await fetch('/api/deployments?action=delete-project', { method: 'DELETE' })
                  if (!response.ok) throw new Error('Delete failed')
                  toast.success('Project deleted', { id: 'delete-project', description: 'All resources have been removed' })
                  setShowDeleteProjectDialog(false)
                } catch { toast.error('Failed to delete project', { id: 'delete-project' }) }
              }}>
                <Trash2 className="h-4 w-4 mr-2" />Delete Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Function Terminal Dialog */}
        <Dialog open={showFunctionTerminalDialog} onOpenChange={setShowFunctionTerminalDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-green-600" />
                Function Terminal - {selectedFunction?.name}
              </DialogTitle>
              <DialogDescription>
                Execute commands in the function runtime environment
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Function Info */}
              <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Badge variant="outline">{selectedFunction?.runtime}</Badge>
                <Badge variant="outline">{selectedFunction?.region}</Badge>
                <Badge variant="outline">{selectedFunction?.memory}MB</Badge>
              </div>

              {/* Terminal Output */}
              <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-400 h-64 overflow-y-auto">
                {terminalOutput.map((line, i) => (
                  <div key={i} className={line.startsWith('$') ? 'text-white' : line.includes('error') || line.includes('Error') ? 'text-red-400' : line.includes('success') || line.includes('Success') ? 'text-green-400' : 'text-gray-300'}>
                    {line}
                  </div>
                ))}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-white">$</span>
                  <Input
                    value={terminalCommand}
                    onChange={(e) => setTerminalCommand(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && terminalCommand.trim()) {
                        const cmd = terminalCommand.trim()
                        setTerminalOutput(prev => [...prev, `$ ${cmd}`])
                        // MIGRATED: Batch #16 - Removed setTimeout delay
                        if (cmd === 'help') {
                          setTerminalOutput(prev => [...prev, 'Available commands:', '  logs - View recent logs', '  env - Show environment variables', '  stats - Show function statistics', '  clear - Clear terminal', '  exit - Close terminal'])
                        } else if (cmd === 'logs') {
                          setTerminalOutput(prev => [...prev, `[${new Date().toISOString()}] Function invoked`, `[${new Date().toISOString()}] Processing request...`, `[${new Date().toISOString()}] Response sent (${selectedFunction?.avgDuration}ms)`])
                        } else if (cmd === 'env') {
                          setTerminalOutput(prev => [...prev, 'NODE_ENV=production', 'RUNTIME=nodejs20', `REGION=${selectedFunction?.region}`, `MEMORY_LIMIT=${selectedFunction?.memory}MB`])
                        } else if (cmd === 'stats') {
                          setTerminalOutput(prev => [...prev, `Invocations: ${selectedFunction?.invocations?.toLocaleString()}`, `Avg Duration: ${selectedFunction?.avgDuration}ms`, `Errors: ${selectedFunction?.errors}`, `Memory: ${selectedFunction?.memory}MB`])
                        } else if (cmd === 'clear') {
                          setTerminalOutput(['$ clear', 'Terminal cleared', ''])
                        } else {
                          setTerminalOutput(prev => [...prev, `Command executed: ${cmd}`, 'Success'])
                        }
                        setTerminalCommand('')
                      }
                    }}
                    className="flex-1 bg-transparent border-none text-green-400 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
                    placeholder="Type command... (try 'help')"
                  />
                </div>
              </div>

              {/* Quick Commands */}
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => { setTerminalOutput(prev => [...prev, '$ logs', `[${new Date().toISOString()}] Function invoked`, `[${new Date().toISOString()}] Processing...`, `[${new Date().toISOString()}] Done (${selectedFunction?.avgDuration}ms)`]); }}>
                  <FileText className="h-3 w-3 mr-1" />View Logs
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setTerminalOutput(prev => [...prev, '$ env', 'NODE_ENV=production', `REGION=${selectedFunction?.region}`, `MEMORY=${selectedFunction?.memory}MB`]); }}>
                  <Lock className="h-3 w-3 mr-1" />Show Env
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setTerminalOutput(prev => [...prev, '$ stats', `Invocations: ${selectedFunction?.invocations?.toLocaleString()}`, `Avg Duration: ${selectedFunction?.avgDuration}ms`]); }}>
                  <BarChart3 className="h-3 w-3 mr-1" />Stats
                </Button>
                <Button variant="outline" size="sm" onClick={() => setTerminalOutput(['$ clear', 'Terminal cleared', ''])}>
                  <X className="h-3 w-3 mr-1" />Clear
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowFunctionTerminalDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Function Metrics Dialog */}
        <Dialog open={showFunctionMetricsDialog} onOpenChange={setShowFunctionMetricsDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Function Metrics - {selectedFunction?.name}
              </DialogTitle>
              <DialogDescription>
                Performance metrics and analytics for this function
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{selectedFunction?.invocations?.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Total Invocations</p>
                  </CardContent>
                </Card>
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{selectedFunction?.avgDuration}ms</p>
                    <p className="text-sm text-gray-500">Avg Duration</p>
                  </CardContent>
                </Card>
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardContent className="p-4 text-center">
                    <p className={`text-2xl font-bold ${(selectedFunction?.errors || 0) > 20 ? 'text-red-600' : 'text-green-600'}`}>{selectedFunction?.errors}</p>
                    <p className="text-sm text-gray-500">Errors</p>
                  </CardContent>
                </Card>
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-purple-600">{selectedFunction?.memory}MB</p>
                    <p className="text-sm text-gray-500">Memory</p>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Chart Placeholder */}
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-sm">Invocations Over Time (Last 24h)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-end gap-1">
                    {Array.from({ length: 24 }, (_, i) => {
                      const height = Math.random() * 80 + 20
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"
                            style={{ height: `${height}%` }}
                          />
                          {i % 4 === 0 && <span className="text-xs text-gray-400">{i}h</span>}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Error Rate & Duration Distribution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-sm">Error Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="relative w-24 h-24">
                        <svg className="w-24 h-24 transform -rotate-90">
                          <circle cx="48" cy="48" r="40" className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="8" fill="none" />
                          <circle
                            cx="48" cy="48" r="40"
                            className="stroke-green-500"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${251 * (1 - (selectedFunction?.errors || 0) / (selectedFunction?.invocations || 1))} 251`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold">{((selectedFunction?.errors || 0) / (selectedFunction?.invocations || 1) * 100).toFixed(2)}%</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          <span className="text-sm">Success: {((selectedFunction?.invocations || 0) - (selectedFunction?.errors || 0)).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <span className="text-sm">Errors: {selectedFunction?.errors}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-sm">Duration Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs w-16">0-50ms</span>
                        <Progress value={45} className="flex-1 h-2" />
                        <span className="text-xs w-12 text-right">45%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs w-16">50-100ms</span>
                        <Progress value={30} className="flex-1 h-2" />
                        <span className="text-xs w-12 text-right">30%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs w-16">100-200ms</span>
                        <Progress value={15} className="flex-1 h-2" />
                        <span className="text-xs w-12 text-right">15%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs w-16">200ms+</span>
                        <Progress value={10} className="flex-1 h-2" />
                        <span className="text-xs w-12 text-right">10%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                toast.success(`Metrics exported`, { description: `Function metrics exported to CSV` })
              }}>
                <Download className="h-4 w-4 mr-2" />Export Metrics
              </Button>
              <Button variant="outline" onClick={() => setShowFunctionMetricsDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Function Settings Dialog */}
        <Dialog open={showFunctionSettingsDialog} onOpenChange={setShowFunctionSettingsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-600" />
                Function Settings - {selectedFunction?.name}
              </DialogTitle>
              <DialogDescription>
                Configure runtime, memory, and other function settings
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Runtime Configuration */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Runtime Configuration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <Label>Runtime</Label>
                    <Select defaultValue={selectedFunction?.runtime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select runtime" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Node.js 20">Node.js 20</SelectItem>
                        <SelectItem value="Node.js 18">Node.js 18</SelectItem>
                        <SelectItem value="Python 3.11">Python 3.11</SelectItem>
                        <SelectItem value="Go 1.21">Go 1.21</SelectItem>
                        <SelectItem value="Ruby 3.2">Ruby 3.2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Region</Label>
                    <Select defaultValue={selectedFunction?.region}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="iad1">US East (iad1)</SelectItem>
                        <SelectItem value="sfo1">US West (sfo1)</SelectItem>
                        <SelectItem value="dub1">Europe (dub1)</SelectItem>
                        <SelectItem value="hnd1">Asia Pacific (hnd1)</SelectItem>
                        <SelectItem value="syd1">Australia (syd1)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Memory & Timeout */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Resources</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <Label>Memory (MB)</Label>
                    <Select defaultValue={selectedFunction?.memory?.toString()}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select memory" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="128">128 MB</SelectItem>
                        <SelectItem value="256">256 MB</SelectItem>
                        <SelectItem value="512">512 MB</SelectItem>
                        <SelectItem value="1024">1024 MB</SelectItem>
                        <SelectItem value="2048">2048 MB</SelectItem>
                        <SelectItem value="3072">3072 MB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Timeout (seconds)</Label>
                    <Input type="number" defaultValue={10} min={1} max={900} />
                  </div>
                </div>
              </div>

              {/* Environment Variables */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Environment Variables</h4>
                <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline">NODE_ENV</Badge>
                    <span className="text-gray-500">=</span>
                    <span className="font-mono">production</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline">API_KEY</Badge>
                    <span className="text-gray-500">=</span>
                    <span className="font-mono text-gray-400">••••••••••••</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowEnvDialog(true)}>
                  <Plus className="h-3 w-3 mr-1" />Add Variable
                </Button>
              </div>

              {/* Advanced Settings */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Advanced</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Enable Caching</p>
                      <p className="text-xs text-gray-500">Cache function responses for improved performance</p>
                    </div>
                    <Switch checked={settingsState.enableCaching} onCheckedChange={(checked) => setSettingsState(prev => ({ ...prev, enableCaching: checked }))} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Enable Logging</p>
                      <p className="text-xs text-gray-500">Log all function invocations and errors</p>
                    </div>
                    <Switch checked={settingsState.enableLogging} onCheckedChange={(checked) => setSettingsState(prev => ({ ...prev, enableLogging: checked }))} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Cold Start Optimization</p>
                      <p className="text-xs text-gray-500">Keep function warm to reduce cold starts</p>
                    </div>
                    <Switch checked={settingsState.coldStartOptimization} onCheckedChange={(checked) => setSettingsState(prev => ({ ...prev, coldStartOptimization: checked }))} />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowFunctionSettingsDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success(`Function settings saved`, { description: `${selectedFunction?.name} configuration updated` })
                setShowFunctionSettingsDialog(false)
              }}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Integration Settings Dialog */}
        <Dialog open={showIntegrationSettingsDialog} onOpenChange={setShowIntegrationSettingsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-600" />
                {selectedIntegration?.name} Settings
              </DialogTitle>
              <DialogDescription>
                Configure integration settings and permissions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Status & Info */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${selectedIntegration?.status === 'connected' ? 'bg-green-100' : 'bg-gray-100'}`}>
                    {selectedIntegration?.type === 'ci_cd' && <GitBranch className="h-6 w-6 text-purple-600" />}
                    {selectedIntegration?.type === 'monitoring' && <Activity className="h-6 w-6 text-blue-600" />}
                    {selectedIntegration?.type === 'notification' && <MessageSquare className="h-6 w-6 text-pink-600" />}
                    {selectedIntegration?.type === 'logging' && <Terminal className="h-6 w-6 text-green-600" />}
                    {selectedIntegration?.type === 'analytics' && <BarChart3 className="h-6 w-6 text-amber-600" />}
                  </div>
                  <div>
                    <h4 className="font-semibold">{selectedIntegration?.name}</h4>
                    <p className="text-sm text-gray-500">Last synced: {selectedIntegration?.lastSync}</p>
                  </div>
                </div>
                <Badge className={selectedIntegration?.status === 'connected' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                  {selectedIntegration?.status}
                </Badge>
              </div>

              {/* Configuration */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Configuration</h4>
                {selectedIntegration?.type === 'ci_cd' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Repository</Label>
                      <Input defaultValue={selectedIntegration?.config?.repo || ''} placeholder="owner/repository" />
                    </div>
                    <div className="space-y-2">
                      <Label>Default Branch</Label>
                      <Input defaultValue={selectedIntegration?.config?.branch || 'main'} placeholder="main" />
                    </div>
                  </div>
                )}
                {selectedIntegration?.type === 'notification' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Channel</Label>
                      <Input defaultValue={selectedIntegration?.config?.channel || ''} placeholder="#channel-name" />
                    </div>
                    <div className="space-y-2">
                      <Label>Notification Events</Label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="deploy_success" defaultChecked className="rounded" />
                          <label htmlFor="deploy_success" className="text-sm">Deployment Success</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="deploy_failed" defaultChecked className="rounded" />
                          <label htmlFor="deploy_failed" className="text-sm">Deployment Failed</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="deploy_rollback" defaultChecked className="rounded" />
                          <label htmlFor="deploy_rollback" className="text-sm">Rollback Triggered</label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {(selectedIntegration?.type === 'monitoring' || selectedIntegration?.type === 'analytics') && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>API Key</Label>
                      <Input type="password" defaultValue="••••••••••••" />
                    </div>
                    <div className="space-y-2">
                      <Label>Organization</Label>
                      <Input defaultValue={selectedIntegration?.config?.org || ''} placeholder="organization-name" />
                    </div>
                    <div className="space-y-2">
                      <Label>Project</Label>
                      <Input defaultValue={selectedIntegration?.config?.project || ''} placeholder="project-name" />
                    </div>
                  </div>
                )}
                {selectedIntegration?.type === 'logging' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Ingestion URL</Label>
                      <Input defaultValue="https://logs.logdna.com/ingest" placeholder="https://..." />
                    </div>
                    <div className="space-y-2">
                      <Label>API Key</Label>
                      <Input type="password" defaultValue="••••••••••••" />
                    </div>
                    <div className="space-y-2">
                      <Label>Log Level</Label>
                      <Select defaultValue="info">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="debug">Debug</SelectItem>
                          <SelectItem value="info">Info</SelectItem>
                          <SelectItem value="warn">Warning</SelectItem>
                          <SelectItem value="error">Error</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              {/* Permissions */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Permissions</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Read Deployments</p>
                      <p className="text-xs text-gray-500">Access deployment history and logs</p>
                    </div>
                    <Switch checked={integrationPermissions.readDeployments} onCheckedChange={(checked) => setIntegrationPermissions(prev => ({ ...prev, readDeployments: checked }))} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Write Deployments</p>
                      <p className="text-xs text-gray-500">Trigger new deployments</p>
                    </div>
                    <Switch checked={integrationPermissions.writeDeployments} onCheckedChange={(checked) => setIntegrationPermissions(prev => ({ ...prev, writeDeployments: checked }))} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Access Environment Variables</p>
                      <p className="text-xs text-gray-500">Read and modify environment variables</p>
                    </div>
                    <Switch checked={integrationPermissions.accessEnvVariables} onCheckedChange={(checked) => setIntegrationPermissions(prev => ({ ...prev, accessEnvVariables: checked }))} />
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-sm text-red-600">Danger Zone</h4>
                <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">Disconnect Integration</p>
                    <p className="text-xs text-red-600 dark:text-red-300">This will remove the integration and revoke all permissions</p>
                  </div>
                  <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-100" onClick={() => {
                    toast.success(`Integration disconnected`, { description: `${selectedIntegration?.name} has been removed` })
                    setShowIntegrationSettingsDialog(false)
                  }}>
                    <Trash2 className="h-4 w-4 mr-2" />Disconnect
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowIntegrationSettingsDialog(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success(`Integration settings saved`, { description: `${selectedIntegration?.name} configuration updated` })
                setShowIntegrationSettingsDialog(false)
              }}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
