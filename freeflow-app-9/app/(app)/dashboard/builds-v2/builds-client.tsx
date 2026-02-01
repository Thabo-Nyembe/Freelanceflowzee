'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useBuilds, useBuildPipelines, useBuildArtifacts, useBuildMutations } from '@/lib/hooks/use-builds'
import { apiPost, apiDelete, downloadFile } from '@/lib/button-handlers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Play,
  GitBranch,
  GitCommit,
  Download,
  Eye,
  Search,
  RotateCcw,
  Zap,
  FileText,
  Settings,
  Activity,
  Server,
  Cloud,
  Box,
  Workflow,
  Timer,
  GitPullRequest,
  Lock,
  Unlock,
  Trash2,
  Copy,
  Terminal,
  Cpu,
  HardDrive,
  Globe,
  Shield,
  Key,
  RefreshCw,
  StopCircle,
  ChevronRight,
  Layers,
  Calendar,
  Users,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  AlertCircle,
  Archive,
  Database
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

// ============================================================================
// TYPE DEFINITIONS - GitHub Actions Level CI/CD
// ============================================================================

type BuildStatus = 'success' | 'failed' | 'running' | 'pending' | 'cancelled' | 'queued'
type WorkflowTrigger = 'push' | 'pull_request' | 'schedule' | 'workflow_dispatch' | 'release' | 'tag'
type JobStatus = 'success' | 'failed' | 'running' | 'waiting' | 'skipped' | 'cancelled'
type RunnerType = 'hosted' | 'self-hosted'
type RunnerOS = 'ubuntu' | 'windows' | 'macos'
type EnvironmentType = 'development' | 'staging' | 'production' | 'testing'
type ArtifactType = 'binary' | 'report' | 'logs' | 'coverage' | 'docker' | 'archive'
// SecretScope reserved for future API integration
// type SecretScope = 'repository' | 'environment' | 'organization'

interface WorkflowStep {
  id: string
  name: string
  status: JobStatus
  duration_seconds: number
  output_lines: number
  started_at: string | null
  completed_at: string | null
}

interface WorkflowJob {
  id: string
  name: string
  status: JobStatus
  runner_name: string
  runner_os: RunnerOS
  duration_seconds: number
  steps: WorkflowStep[]
  started_at: string | null
  completed_at: string | null
}

interface Build {
  id: string
  build_number: number
  workflow_name: string
  workflow_file: string
  status: BuildStatus
  trigger: WorkflowTrigger
  branch: string
  commit_hash: string
  commit_message: string
  author_name: string
  author_email: string
  author_avatar: string
  jobs: WorkflowJob[]
  total_duration_seconds: number
  started_at: string
  completed_at: string | null
  created_at: string
  tests_total: number
  tests_passed: number
  tests_failed: number
  tests_skipped: number
  coverage_percentage: number
  artifacts_count: number
  logs_size_bytes: number
  pr_number?: number
  pr_title?: string
  retry_of?: number
  run_attempt: number
}

interface Workflow {
  id: string
  name: string
  file_path: string
  description: string
  triggers: WorkflowTrigger[]
  is_active: boolean
  last_run_at: string | null
  last_status: BuildStatus | null
  total_runs: number
  success_rate: number
  avg_duration_seconds: number
  branches: string[]
  created_at: string
  updated_at: string
}

interface Environment {
  id: string
  name: string
  type: EnvironmentType
  url: string | null
  protection_rules: boolean
  required_reviewers: string[]
  wait_timer_minutes: number
  last_deployment_at: string | null
  last_deployment_status: BuildStatus | null
  total_deployments: number
  active_deployment_id: string | null
  secrets_count: number
  variables_count: number
  created_at: string
}

interface Artifact {
  id: string
  name: string
  type: ArtifactType
  build_id: string
  build_number: number
  workflow_name: string
  size_bytes: number
  download_count: number
  expires_at: string
  created_at: string
  is_expired: boolean
}

interface Runner {
  id: string
  name: string
  type: RunnerType
  os: RunnerOS
  status: 'online' | 'offline' | 'busy'
  labels: string[]
  current_job: string | null
  total_jobs_run: number
  total_minutes: number
  last_active_at: string
  version: string
  architecture: string
  ip_address?: string
}

// Secret and CacheEntry interfaces reserved for future API integration
// interface Secret { id: string, name: string, scope: SecretScope, ... }
// interface CacheEntry { id: string, key: string, ref: string, ... }

// ============================================================================
// DATA - All driven by Supabase hooks (useBuilds, useBuildPipelines, useBuildArtifacts)
// ============================================================================

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${mins}m`
}

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

const getStatusColor = (status: BuildStatus | JobStatus): string => {
  switch (status) {
    case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'running': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    case 'pending': case 'waiting': case 'queued': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    case 'skipped': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

const getStatusIcon = (status: BuildStatus | JobStatus) => {
  switch (status) {
    case 'success': return <CheckCircle className="w-3.5 h-3.5" />
    case 'running': return <Loader2 className="w-3.5 h-3.5 animate-spin" />
    case 'failed': return <XCircle className="w-3.5 h-3.5" />
    case 'pending': case 'waiting': case 'queued': return <Clock className="w-3.5 h-3.5" />
    case 'cancelled': return <StopCircle className="w-3.5 h-3.5" />
    case 'skipped': return <ChevronRight className="w-3.5 h-3.5" />
    default: return <AlertCircle className="w-3.5 h-3.5" />
  }
}

const getTriggerIcon = (trigger: WorkflowTrigger) => {
  switch (trigger) {
    case 'push': return <GitCommit className="w-3.5 h-3.5" />
    case 'pull_request': return <GitPullRequest className="w-3.5 h-3.5" />
    case 'schedule': return <Calendar className="w-3.5 h-3.5" />
    case 'workflow_dispatch': return <Play className="w-3.5 h-3.5" />
    case 'release': return <Package className="w-3.5 h-3.5" />
    case 'tag': return <GitBranch className="w-3.5 h-3.5" />
    default: return <Zap className="w-3.5 h-3.5" />
  }
}

const getEnvironmentIcon = (type: EnvironmentType) => {
  switch (type) {
    case 'production': return <Globe className="w-4 h-4" />
    case 'staging': return <Server className="w-4 h-4" />
    case 'development': return <Terminal className="w-4 h-4" />
    case 'testing': return <Activity className="w-4 h-4" />
    default: return <Cloud className="w-4 h-4" />
  }
}

const getArtifactIcon = (type: ArtifactType) => {
  switch (type) {
    case 'binary': return <Box className="w-4 h-4" />
    case 'report': return <FileText className="w-4 h-4" />
    case 'logs': return <Terminal className="w-4 h-4" />
    case 'coverage': return <BarChart3 className="w-4 h-4" />
    case 'docker': return <Layers className="w-4 h-4" />
    case 'archive': return <Archive className="w-4 h-4" />
    default: return <Download className="w-4 h-4" />
  }
}

const getRunnerStatusColor = (status: string): string => {
  switch (status) {
    case 'online': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'busy': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case 'offline': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

// ============================================================================
// COMPETITIVE UPGRADE DATA - GitHub Actions Level Build Intelligence
// ============================================================================

// AI Insights - empty array, populated from database
const buildsAIInsights: { id: string; type: string; title: string; description: string }[] = []

// Collaborators - empty array, populated from database
const buildsCollaborators: { id: string; name: string; avatar?: string }[] = []

// Predictions - empty array, populated from database
const buildsPredictions: { id: string; prediction: string; confidence: number }[] = []

// Activities - empty array, populated from database
const buildsActivities: { id: string; action: string; timestamp: string }[] = []

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function BuildsClient() {
  const router = useRouter()
  // MIGRATED: Database hooks for builds data (Supabase)
  const { builds: databaseBuilds = [], isLoading: buildsLoading, error: buildsError, refetch: refetchBuilds } = useBuilds()
  const { pipelines: databasePipelines = [], activePipelines = [], isLoading: pipelinesLoading, error: pipelinesError } = useBuildPipelines()
  const { data: databaseArtifacts = [], isLoading: artifactsLoading, error: artifactsError } = useBuildArtifacts(undefined, true)
  const {
    triggerBuild: mutateTriggerBuild,
    cancelBuild: mutateCancelBuild,
    retryBuild: mutateRetryBuild,
    isTriggering,
    isCancelling,
    isRetrying,
  } = useBuildMutations()

  const isLoading = buildsLoading || pipelinesLoading || artifactsLoading
  const error = buildsError || pipelinesError || artifactsError

  const [activeTab, setActiveTab] = useState('builds')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<BuildStatus | 'all'>('all')
  const [selectedBuild, setSelectedBuild] = useState<Build | null>(null)
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)

  // Concurrency Settings state
  const [maxConcurrentJobs, setMaxConcurrentJobs] = useState(5)
  const [queuePendingJobs, setQueuePendingJobs] = useState(true)
  const [cancelOnNewPush, setCancelOnNewPush] = useState(false)

  // Placeholder arrays for data not yet backed by Supabase hooks
  const environments: Environment[] = []
  const runners: Runner[] = []

  // Filtered data - using database builds only
  const filteredBuilds = useMemo(() => {
    return databaseBuilds.filter(build => {
      const matchesSearch =
        build.workflow_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        build.branch?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        build.commit_message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        build.author_name?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || build.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [searchQuery, statusFilter, databaseBuilds])

  // Stats calculations - using database data only
  const stats = useMemo(() => {
    const total = databaseBuilds.length
    const success = databaseBuilds.filter(b => b.status === 'success').length
    const failed = databaseBuilds.filter(b => b.status === 'failed').length
    const running = databaseBuilds.filter(b => b.status === 'running').length
    const avgDuration = databaseBuilds.reduce((acc, b) => acc + (b.total_duration_seconds || 0), 0) / (total || 1)
    const buildsWithCoverage = databaseBuilds.filter(b => b.coverage_percentage > 0)
    const avgCoverage = buildsWithCoverage.reduce((acc, b) => acc + b.coverage_percentage, 0) / (buildsWithCoverage.length || 1)
    const totalArtifacts = databaseArtifacts.length

    return {
      total,
      success,
      failed,
      running,
      successRate: total > 0 ? Math.round((success / total) * 100) : 0,
      avgDuration,
      avgCoverage: avgCoverage || 0,
      totalArtifacts,
      activeRunners: 0,
      totalRunners: 0
    }
  }, [databaseBuilds, databaseArtifacts])

  // Real Handlers - calling actual API endpoints
  const handleTriggerBuild = async (workflowId?: string) => {
    await apiPost('/api/builds/trigger', {
      workflow_id: workflowId || 'ci-pipeline',
      branch: 'main'
    }, {
      loading: 'Starting new build...',
      success: 'Build triggered successfully',
      error: 'Failed to trigger build'
    })
  }

  const handleCancelBuild = async (build: Build) => {
    try {
      toast.loading(`Cancelling build #${build.build_number}...`)
      mutateCancelBuild(build.id)
      toast.dismiss()
      toast.success(`Build #${build.build_number} has been cancelled`)
      refetchBuilds()
    } catch {
      toast.dismiss()
      toast.error(`Failed to cancel build #${build.build_number}`)
    }
  }

  const handleRetryBuild = async (build: Build) => {
    try {
      toast.loading(`Restarting build #${build.build_number}...`)
      mutateRetryBuild({
        pipeline_id: (build as Record<string, unknown>).pipeline_id,
        build_number: build.build_number + 1,
        branch: build.branch,
        commit_hash: build.commit_hash,
        commit_message: build.commit_message,
        author_name: build.author_name,
        author_email: build.author_email,
      })
      toast.dismiss()
      toast.success(`Build #${build.build_number} restarted successfully`)
      refetchBuilds()
    } catch {
      toast.dismiss()
      toast.error(`Failed to restart build #${build.build_number}`)
    }
  }

  const handleDownloadArtifact = async (artifact: Artifact) => {
    await downloadFile(`/api/builds/artifacts/${artifact.id}/download`, artifact.name)
  }

  const handleDownloadLogs = async (build: Build) => {
    await downloadFile(`/api/builds/${build.id}/logs`, `build-${build.build_number}-logs.txt`)
  }

  const handleViewBuildDetails = (build: Build) => {
    router.push(`/dashboard/builds/${build.id}`)
  }

  const handleRunWorkflow = async (workflow: Workflow) => {
    await apiPost(`/api/workflows/${workflow.id}/dispatch`, {
      ref: 'main',
      inputs: {}
    }, {
      loading: `Running ${workflow.name}...`,
      success: `${workflow.name} started successfully`,
      error: `Failed to run ${workflow.name}`
    })
  }

  const handleDeleteCache = async (cacheKey: string) => {
    if (!confirm(`Are you sure you want to delete cache "${cacheKey}"?`)) return
    await apiDelete(`/api/builds/cache/${encodeURIComponent(cacheKey)}`, {
      loading: 'Deleting cache...',
      success: 'Cache deleted successfully',
      error: 'Failed to delete cache'
    })
  }

  const handleDeleteSecret = async (secretName: string) => {
    if (!confirm(`Are you sure you want to delete secret "${secretName}"? This action cannot be undone.`)) return
    await apiDelete(`/api/builds/secrets/${encodeURIComponent(secretName)}`, {
      loading: 'Deleting secret...',
      success: 'Secret deleted successfully',
      error: 'Failed to delete secret'
    })
  }

  const handleCopySecret = async (secretName: string) => {
    toast.info(`Secret "${secretName}" value is hidden. Navigate to secret settings to view or update.`)
  }

  // Concurrency Settings handlers
  const handleMaxConcurrentJobsChange = async (value: number) => {
    setMaxConcurrentJobs(value)
    await apiPost('/api/builds/settings/concurrency', {
      max_concurrent_jobs: value
    }, {
      loading: 'Updating concurrency limit...',
      success: `Max concurrent jobs set to ${value}`,
      error: 'Failed to update concurrency settings'
    })
  }

  const handleToggleQueuePendingJobs = async () => {
    const newValue = !queuePendingJobs
    setQueuePendingJobs(newValue)
    await apiPost('/api/builds/settings/concurrency', {
      queue_pending_jobs: newValue
    }, {
      loading: 'Updating queue settings...',
      success: newValue ? 'Job queuing enabled' : 'Job queuing disabled',
      error: 'Failed to update queue settings'
    })
  }

  const handleToggleCancelOnNewPush = async () => {
    const newValue = !cancelOnNewPush
    setCancelOnNewPush(newValue)
    await apiPost('/api/builds/settings/concurrency', {
      cancel_in_progress_on_push: newValue
    }, {
      loading: 'Updating cancel settings...',
      success: newValue ? 'Auto-cancel on new push enabled' : 'Auto-cancel on new push disabled',
      error: 'Failed to update cancel settings'
    })
  }

  // AI Insight action handler
  const handleInsightAction = async (insight: { id: string; type: string; title: string; description: string }) => {
    switch (insight.type) {
      case 'success':
        toast.success(`Insight: ${insight.title}`, { description: insight.description })
        break
      case 'warning':
        toast.warning(`Action required: ${insight.title}`, {
          description: insight.description,
          action: {
            label: 'View Details',
            onClick: () => { setActiveTab('pipelines'); toast.info('Showing flaky builds'); }
          }
        })
        break
      case 'info':
        toast.info(`AI Suggestion: ${insight.title}`, {
          description: insight.description,
          action: {
            label: 'Apply',
            onClick: () => toast.promise(
              apiPost('/api/builds/optimize', { suggestion_id: insight.id }, {}),
              {
                loading: 'Applying optimization...',
                success: 'Optimization applied successfully',
                error: 'Failed to apply optimization'
              }
            )
          }
        })
        break
      default:
        toast.info(insight.title, { description: insight.description })
    }
  }

  // Quick Actions with real functionality - using database builds only
  const buildsQuickActions = [
    {
      id: '1',
      label: 'New Build',
      icon: 'plus',
      action: () => handleTriggerBuild(),
      variant: 'default' as const
    },
    {
      id: '2',
      label: 'Retry',
      icon: 'refresh-cw',
      action: () => {
        const failedBuild = databaseBuilds.find(b => b.status === 'failed')
        if (failedBuild) {
          handleRetryBuild(failedBuild)
        } else {
          toast.info('No failed builds to retry')
        }
      },
      variant: 'default' as const
    },
    {
      id: '3',
      label: 'Logs',
      icon: 'file-text',
      action: () => {
        const latestBuild = databaseBuilds[0]
        if (latestBuild) {
          handleDownloadLogs(latestBuild)
        }
      },
      variant: 'outline' as const
    },
  ]

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50/30 to-blue-50/40 dark:bg-none dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          <p className="text-gray-500 dark:text-gray-400">Loading builds...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50/30 to-blue-50/40 dark:bg-none dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">Failed to load builds</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{error?.message || 'An unexpected error occurred'}</p>
          </div>
          <Button variant="outline" onClick={() => refetchBuilds()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50/30 to-blue-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CI/CD Pipelines</h1>
              <p className="text-gray-500 dark:text-gray-400">GitHub Actions level build automation</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => refetchBuilds()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white"
              onClick={() => handleTriggerBuild()}
            >
              <Play className="w-4 h-4 mr-2" />
              Run Workflow
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { label: 'Total Builds', value: stats.total.toLocaleString(), icon: Package, color: 'from-teal-500 to-cyan-500', change: 12.5 },
            { label: 'Success Rate', value: `${stats.successRate}%`, icon: CheckCircle, color: 'from-green-500 to-emerald-500', change: 3.2 },
            { label: 'Failed', value: stats.failed.toString(), icon: XCircle, color: 'from-red-500 to-rose-500', change: -8.4 },
            { label: 'Running', value: stats.running.toString(), icon: Loader2, color: 'from-blue-500 to-indigo-500', change: 0 },
            { label: 'Avg Duration', value: formatDuration(stats.avgDuration), icon: Timer, color: 'from-purple-500 to-violet-500', change: -5.6 },
            { label: 'Coverage', value: `${stats.avgCoverage.toFixed(1)}%`, icon: BarChart3, color: 'from-orange-500 to-amber-500', change: 2.1 },
            { label: 'Artifacts', value: stats.totalArtifacts.toString(), icon: Archive, color: 'from-pink-500 to-rose-500', change: 15.3 },
            { label: 'Runners', value: `${stats.activeRunners}/${stats.totalRunners}`, icon: Server, color: 'from-cyan-500 to-blue-500', change: 0 }
          ].map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  {stat.change !== 0 && (
                    <span className={`text-xs font-medium flex items-center ${stat.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {Math.abs(stat.change)}%
                    </span>
                  )}
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 border shadow-sm">
            <TabsTrigger value="builds" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Builds
            </TabsTrigger>
            <TabsTrigger value="workflows" className="flex items-center gap-2">
              <Workflow className="w-4 h-4" />
              Workflows
            </TabsTrigger>
            <TabsTrigger value="environments" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Environments
            </TabsTrigger>
            <TabsTrigger value="artifacts" className="flex items-center gap-2">
              <Archive className="w-4 h-4" />
              Artifacts
            </TabsTrigger>
            <TabsTrigger value="runners" className="flex items-center gap-2">
              <Server className="w-4 h-4" />
              Runners
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Builds Tab */}
          <TabsContent value="builds" className="mt-6">
            {/* Builds Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Build Pipeline</h2>
                  <p className="text-emerald-100">GitHub Actions-level CI/CD with real-time monitoring</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    {/* MIGRATED: Batch #12 - Using stats from database hooks */}
                    <p className="text-3xl font-bold">{stats.total}</p>
                    <p className="text-emerald-200 text-sm">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.success}</p>
                    <p className="text-emerald-200 text-sm">Passed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.successRate}%</p>
                    <p className="text-emerald-200 text-sm">Success Rate</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Builds Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Play, label: 'Run Build', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', action: () => handleTriggerBuild() },
                { icon: RefreshCw, label: 'Rebuild', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', action: () => {
                  const failedBuild = databaseBuilds.find(b => b.status === 'failed')
                  if (failedBuild) handleRetryBuild(failedBuild)
                  else toast.info('No failed builds to retry')
                }},
                { icon: GitBranch, label: 'Branches', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', action: () => toast.info('Branch Management', { description: 'View branches in the build pipelines below' }) },
                { icon: Terminal, label: 'Logs', color: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400', action: () => {
                  const latestBuild = databaseBuilds[0]
                  if (latestBuild) handleDownloadLogs(latestBuild)
                }},
                { icon: Download, label: 'Artifacts', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', action: () => setActiveTab('artifacts') },
                { icon: BarChart3, label: 'Analytics', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', action: () => router.push('/dashboard/analytics-v2') },
                { icon: Search, label: 'Search', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', action: () => document.querySelector<HTMLInputElement>('input[placeholder="Search builds..."]')?.focus() },
                { icon: Settings, label: 'Settings', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', action: () => setActiveTab('settings') },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.action}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle>Build History</CardTitle>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search builds..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      {(['all', 'success', 'failed', 'running'] as const).map(status => (
                        <Button
                          key={status}
                          variant={statusFilter === status ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setStatusFilter(status)}
                          className={statusFilter === status ? 'bg-teal-600' : ''}
                        >
                          {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredBuilds.map(build => (
                    <div
                      key={build.id}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedBuild(build)}
                    >
                      <div className="flex items-start gap-4">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={build.author_avatar} alt="User avatar" />
                          <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white text-sm">
                            {build.author_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              #{build.build_number}
                            </span>
                            <Badge className={getStatusColor(build.status)}>
                              {getStatusIcon(build.status)}
                              <span className="ml-1">{build.status}</span>
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {getTriggerIcon(build.trigger)}
                              <span className="ml-1">{build.trigger}</span>
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 truncate mb-1">
                            {build.commit_message}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Workflow className="w-3 h-3" />
                              {build.workflow_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <GitBranch className="w-3 h-3" />
                              {build.branch}
                            </span>
                            <span className="flex items-center gap-1">
                              <GitCommit className="w-3 h-3" />
                              {build.commit_hash.substring(0, 7)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Timer className="w-3 h-3" />
                              {formatDuration(build.total_duration_seconds)}
                            </span>
                            {build.pr_number && (
                              <span className="flex items-center gap-1">
                                <GitPullRequest className="w-3 h-3" />
                                #{build.pr_number}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-2">
                            {build.tests_total > 0 && (
                              <span className={`text-xs font-medium ${build.tests_failed > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {build.tests_passed}/{build.tests_total} tests
                              </span>
                            )}
                            {build.coverage_percentage > 0 && (
                              <span className="text-xs text-gray-500">
                                {build.coverage_percentage}% coverage
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">
                            {new Date(build.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {build.tests_total > 0 && (
                        <div className="mt-3 ml-14">
                          <Progress
                            value={(build.tests_passed / build.tests_total) * 100}
                            className="h-1.5"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workflows Tab */}
          <TabsContent value="workflows" className="mt-6">
            {/* Workflows Banner */}
            <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Workflow Automation</h2>
                  <p className="text-purple-100">Define, customize, and orchestrate your CI/CD pipelines</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{databasePipelines.length}</p>
                    <p className="text-purple-200 text-sm">Workflows</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{activePipelines.length}</p>
                    <p className="text-purple-200 text-sm">Active</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Workflows Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Workflow, label: 'New Workflow', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', action: () => { setActiveTab('settings'); toast.success('Workflow editor ready', { description: 'Configure in Settings tab' }); } },
                { icon: Play, label: 'Run All', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', action: () => {
                  const activeWorkflow = (databasePipelines as unknown[]).find(w => w.is_active)
                  if (activeWorkflow) handleRunWorkflow(activeWorkflow)
                }},
                { icon: FileText, label: 'Templates', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', action: () => toast.info('Workflow Templates', { description: 'Browse CI/CD templates in the workflow cards below' }) },
                { icon: GitBranch, label: 'Triggers', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', action: () => toast.info('Build Triggers', { description: 'Configure triggers in workflow settings' }) },
                { icon: Timer, label: 'Schedules', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', action: () => toast.info('Scheduled Builds', { description: 'Set up cron schedules in Settings tab' }) },
                { icon: Lock, label: 'Secrets', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', action: () => setActiveTab('settings') },
                { icon: Archive, label: 'Archive', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', action: () => { setStatusFilter('all'); toast.info('Showing archived workflows') } },
                { icon: Settings, label: 'Settings', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', action: () => setActiveTab('settings') },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.action}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {databasePipelines.map((workflow: any) => (
                <Card
                  key={workflow.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedWorkflow(workflow)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Workflow className="w-5 h-5 text-teal-600" />
                          {workflow.name}
                        </CardTitle>
                        <CardDescription className="mt-1">{workflow.description}</CardDescription>
                      </div>
                      {workflow.last_status && (
                        <Badge className={getStatusColor(workflow.last_status)}>
                          {getStatusIcon(workflow.last_status)}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {workflow.triggers.map(trigger => (
                          <Badge key={trigger} variant="outline" className="text-xs">
                            {getTriggerIcon(trigger)}
                            <span className="ml-1">{trigger}</span>
                          </Badge>
                        ))}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 text-center">
                        <div>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{workflow.total_runs}</p>
                          <p className="text-xs text-gray-500">Total Runs</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-green-600">{workflow.success_rate}%</p>
                          <p className="text-xs text-gray-500">Success</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{formatDuration(workflow.avg_duration_seconds)}</p>
                          <p className="text-xs text-gray-500">Avg Time</p>
                        </div>
                      </div>
                      <div className="pt-3 border-t flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {workflow.file_path}
                        </span>
                        <Badge variant={workflow.is_active ? 'default' : 'secondary'} className="text-xs">
                          {workflow.is_active ? 'Active' : 'Disabled'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Environments Tab */}
          <TabsContent value="environments" className="mt-6">
            {/* Environments Banner */}
            <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Deployment Environments</h2>
                  <p className="text-amber-100">Vercel-level environment management with protection rules</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{environments.length}</p>
                    <p className="text-amber-200 text-sm">Environments</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{environments.filter(e => e.protection_rules).length}</p>
                    <p className="text-amber-200 text-sm">Protected</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Environments Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Globe, label: 'New Env', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', action: () => { setActiveTab('settings'); toast.success('Create New Environment', { description: 'Configure your new environment in the Settings tab' }); } },
                { icon: Cloud, label: 'Deploy', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', action: () => handleTriggerBuild('deploy') },
                { icon: Shield, label: 'Protection', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', action: () => toast.info('Environment Protection', { description: 'Configure protection rules in Settings tab' }) },
                { icon: Key, label: 'Secrets', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', action: () => setActiveTab('settings') },
                { icon: Database, label: 'Variables', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', action: () => { setActiveTab('settings'); toast.info('Environment Variables', { description: 'Manage variables in Settings tab' }) } },
                { icon: Users, label: 'Reviewers', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400', action: () => toast.info('Required Reviewers', { description: 'Configure reviewers in protection settings' }) },
                { icon: Activity, label: 'History', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', action: () => { setActiveTab('pipelines'); toast.info('Deployment History', { description: 'View all deployment history' }) } },
                { icon: Settings, label: 'Settings', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', action: () => setActiveTab('settings') },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.action}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {environments.map(env => (
                <Card key={env.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          env.type === 'production' ? 'bg-red-100 text-red-600' :
                          env.type === 'staging' ? 'bg-yellow-100 text-yellow-600' :
                          env.type === 'development' ? 'bg-green-100 text-green-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {getEnvironmentIcon(env.type)}
                        </div>
                        <div>
                          <CardTitle className="text-lg capitalize">{env.name}</CardTitle>
                          <CardDescription>{env.url || 'No URL configured'}</CardDescription>
                        </div>
                      </div>
                      {env.last_deployment_status && (
                        <Badge className={getStatusColor(env.last_deployment_status)}>
                          {getStatusIcon(env.last_deployment_status)}
                          <span className="ml-1">{env.last_deployment_status}</span>
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{env.total_deployments}</p>
                          <p className="text-xs text-gray-500">Deployments</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{env.secrets_count}</p>
                          <p className="text-xs text-gray-500">Secrets</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{env.variables_count}</p>
                          <p className="text-xs text-gray-500">Variables</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-2">
                          {env.protection_rules ? (
                            <Badge variant="outline" className="text-xs">
                              <Shield className="w-3 h-3 mr-1" />
                              Protected
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              <Unlock className="w-3 h-3 mr-1" />
                              No protection
                            </Badge>
                          )}
                          {env.wait_timer_minutes > 0 && (
                            <Badge variant="outline" className="text-xs">
                              <Timer className="w-3 h-3 mr-1" />
                              {env.wait_timer_minutes}m wait
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/builds/environments/${env.id}/settings`)}>
                            <Settings className="w-3 h-3 mr-1" />
                            Configure
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => env.url && window.open(env.url, '_blank')}>
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Artifacts Tab */}
          <TabsContent value="artifacts" className="mt-6">
            {/* Artifacts Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Build Artifacts</h2>
                  <p className="text-blue-100">Manage build outputs, binaries, and deployment packages</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{databaseArtifacts.length}</p>
                    <p className="text-blue-200 text-sm">Artifacts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{databaseArtifacts.reduce((sum, a) => sum + (a.download_count || 0), 0)}</p>
                    <p className="text-blue-200 text-sm">Downloads</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Artifacts Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Download, label: 'Download', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', action: () => {
                  if (databaseArtifacts[0]) handleDownloadArtifact(databaseArtifacts[0])
                }},
                { icon: Box, label: 'Browse', color: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400', action: () => toast.info('Browse Artifacts', { description: 'View all artifacts in the list below' }) },
                { icon: FileText, label: 'Reports', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', action: () => toast.info('Test Reports', { description: 'Filter by report type artifacts' }) },
                { icon: Archive, label: 'Archives', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', action: () => toast.info('Archive Artifacts', { description: 'Filter by archive type artifacts' }) },
                { icon: Database, label: 'Storage', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', action: () => toast.info('Storage Usage', { description: 'View storage in Settings tab' }) },
                { icon: Trash2, label: 'Cleanup', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', action: async () => {
                  if (confirm('Delete all expired artifacts?')) {
                    await apiDelete('/api/builds/artifacts/expired', {
                      loading: 'Cleaning up expired artifacts...',
                      success: 'Expired artifacts cleaned up',
                      error: 'Failed to clean up artifacts'
                    })
                  }
                }},
                { icon: Search, label: 'Search', color: 'bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400', action: () => document.querySelector<HTMLInputElement>('input[placeholder*="Search"]')?.focus() },
                { icon: Settings, label: 'Settings', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400', action: () => setActiveTab('settings') },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.action}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Build Artifacts</CardTitle>
                    <CardDescription>Download build outputs and reports</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      if (confirm('Delete all expired artifacts?')) {
                        await apiDelete('/api/builds/artifacts/expired', {
                          loading: 'Cleaning up expired artifacts...',
                          success: 'Expired artifacts cleaned up',
                          error: 'Failed to clean up artifacts'
                        })
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clean Expired
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {databaseArtifacts.map((artifact: any) => (
                    <div key={artifact.id} className="p-4 flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        artifact.type === 'binary' ? 'bg-purple-100 text-purple-600' :
                        artifact.type === 'report' ? 'bg-blue-100 text-blue-600' :
                        artifact.type === 'logs' ? 'bg-gray-100 text-gray-600' :
                        artifact.type === 'coverage' ? 'bg-green-100 text-green-600' :
                        artifact.type === 'docker' ? 'bg-cyan-100 text-cyan-600' :
                        'bg-orange-100 text-orange-600'
                      }`}>
                        {getArtifactIcon(artifact.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {artifact.name}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>Build #{artifact.build_number}</span>
                          <span>•</span>
                          <span>{artifact.workflow_name}</span>
                          <span>•</span>
                          <span>{formatBytes(artifact.size_bytes)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {artifact.download_count} downloads
                        </p>
                        <p className="text-xs text-gray-500">
                          Expires {new Date(artifact.expires_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleDownloadArtifact(artifact)}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Runners Tab */}
          <TabsContent value="runners" className="mt-6">
            {/* Runners Banner */}
            <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Build Runners</h2>
                  <p className="text-rose-100">Manage hosted and self-hosted runners for CI/CD</p>
                  <p className="text-rose-200 text-xs mt-1">Total minutes used: {runners.reduce((sum, r) => sum + r.total_minutes, 0).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{runners.length}</p>
                    <p className="text-rose-200 text-sm">Runners</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{runners.filter(r => r.status === 'online').length}</p>
                    <p className="text-rose-200 text-sm">Online</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{runners.filter(r => r.status === 'busy').length}</p>
                    <p className="text-rose-200 text-sm">Busy</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {runners.map(runner => (
                <Card key={runner.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          runner.os === 'ubuntu' ? 'bg-orange-100 text-orange-600' :
                          runner.os === 'macos' ? 'bg-gray-100 text-gray-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {runner.os === 'ubuntu' ? <Server className="w-5 h-5" /> :
                           runner.os === 'macos' ? <Cpu className="w-5 h-5" /> :
                           <HardDrive className="w-5 h-5" />}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{runner.name}</CardTitle>
                          <CardDescription>{runner.type} • {runner.architecture}</CardDescription>
                        </div>
                      </div>
                      <Badge className={getRunnerStatusColor(runner.status)}>
                        {runner.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {runner.labels.map(label => (
                          <Badge key={label} variant="outline" className="text-xs">
                            {label}
                          </Badge>
                        ))}
                      </div>
                      {runner.current_job && (
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            Running: {runner.current_job}
                          </p>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 text-sm">
                        <div>
                          <p className="text-gray-500 text-xs">Total Jobs</p>
                          <p className="font-semibold">{runner.total_jobs_run.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Total Time</p>
                          <p className="font-semibold">{Math.round(runner.total_minutes / 60)}h</p>
                        </div>
                      </div>
                      <div className="pt-3 border-t flex items-center justify-between text-xs text-gray-500">
                        <span>v{runner.version}</span>
                        <span>Last active: {new Date(runner.last_active_at).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    Secrets
                  </CardTitle>
                  <CardDescription>Manage repository and environment secrets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['DOCKER_PASSWORD', 'NPM_TOKEN', 'AWS_ACCESS_KEY', 'DATABASE_URL'].map(secret => (
                      <div key={secret} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Lock className="w-4 h-4 text-gray-400" />
                          <span className="font-mono text-sm">{secret}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleCopySecret(secret)}>
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDeleteSecret(secret)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full mt-3" onClick={() => toast.info('Add Secret', { description: 'Configure secrets via your CI/CD provider settings or environment variables' })}>
                      <Key className="w-4 h-4 mr-2" />
                      Add Secret
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Cache Management
                  </CardTitle>
                  <CardDescription>View and manage dependency caches</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { key: 'node-modules-v1', size: '245 MB', hits: 1234 },
                      { key: 'pip-cache-v2', size: '128 MB', hits: 567 },
                      { key: 'docker-layers-v1', size: '1.2 GB', hits: 89 }
                    ].map(cache => (
                      <div key={cache.key} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-mono text-sm">{cache.key}</p>
                          <p className="text-xs text-gray-500">{cache.size} • {cache.hits} hits</p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDeleteCache(cache.key)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                    <div className="pt-3 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Total cache size</span>
                        <span className="font-semibold">1.57 GB / 10 GB</span>
                      </div>
                      <Progress value={15.7} className="mt-2 h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Concurrency Settings
                  </CardTitle>
                  <CardDescription>Configure parallel build limits</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Max concurrent jobs</p>
                        <p className="text-sm text-gray-500">Limit parallel workflow runs</p>
                      </div>
                      <Input
                        type="number"
                        value={maxConcurrentJobs}
                        onChange={(e) => {
                          const value = parseInt(e.target.value, 10)
                          if (value >= 1 && value <= 20) {
                            handleMaxConcurrentJobsChange(value)
                          }
                        }}
                        min={1}
                        max={20}
                        className="w-20 text-center"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Queue pending jobs</p>
                        <p className="text-sm text-gray-500">Hold jobs when limit reached</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleToggleQueuePendingJobs}
                        className={queuePendingJobs ? 'bg-green-50 text-green-700 border-green-200' : ''}
                      >
                        {queuePendingJobs ? 'Enabled' : 'Disabled'}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Cancel in-progress on new push</p>
                        <p className="text-sm text-gray-500">Stop old runs when new commits arrive</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleToggleCancelOnNewPush}
                        className={cancelOnNewPush ? 'bg-green-50 text-green-700 border-green-200' : ''}
                      >
                        {cancelOnNewPush ? 'Enabled' : 'Disabled'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Permissions
                  </CardTitle>
                  <CardDescription>Workflow and action permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Allow GitHub Actions</p>
                        <p className="text-sm text-gray-500">Enable workflows in this repository</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Fork pull request workflows</p>
                        <p className="text-sm text-gray-500">Run workflows from fork PRs</p>
                      </div>
                      <Badge variant="secondary">Require approval</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Workflow permissions</p>
                        <p className="text-sm text-gray-500">Default token permissions</p>
                      </div>
                      <Badge variant="outline">Read-only</Badge>
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
              insights={buildsAIInsights}
              title="Build Intelligence"
              onInsightAction={handleInsightAction}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={buildsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={buildsPredictions}
              title="Build Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={buildsActivities}
            title="Build Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={buildsQuickActions}
            variant="grid"
          />
        </div>

        {/* Build Detail Dialog */}
        <Dialog open={!!selectedBuild} onOpenChange={() => setSelectedBuild(null)}>
          <DialogContent className="max-w-4xl max-h-[85vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Package className="w-5 h-5" />
                Build #{selectedBuild?.build_number}
                {selectedBuild && (
                  <Badge className={getStatusColor(selectedBuild.status)}>
                    {getStatusIcon(selectedBuild.status)}
                    <span className="ml-1">{selectedBuild.status}</span>
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                {selectedBuild?.workflow_name} • {selectedBuild?.branch}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(85vh-120px)]">
              {selectedBuild && (
                <div className="space-y-6 pr-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Duration</p>
                      <p className="font-semibold">{formatDuration(selectedBuild.total_duration_seconds)}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Tests</p>
                      <p className="font-semibold">{selectedBuild.tests_passed}/{selectedBuild.tests_total}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Coverage</p>
                      <p className="font-semibold">{selectedBuild.coverage_percentage}%</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Artifacts</p>
                      <p className="font-semibold">{selectedBuild.artifacts_count} files</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Commit</h4>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">
                            {selectedBuild.author_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{selectedBuild.author_name}</p>
                          <p className="text-xs text-gray-500">{selectedBuild.author_email}</p>
                        </div>
                      </div>
                      <p className="text-sm">{selectedBuild.commit_message}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="font-mono">{selectedBuild.commit_hash}</span>
                        <span>{selectedBuild.branch}</span>
                      </div>
                    </div>
                  </div>

                  {selectedBuild.jobs.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold">Jobs</h4>
                      {selectedBuild.jobs.map(job => (
                        <div key={job.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(job.status)}>
                                {getStatusIcon(job.status)}
                              </Badge>
                              <span className="font-medium">{job.name}</span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {formatDuration(job.duration_seconds)}
                            </span>
                          </div>
                          {job.steps.length > 0 && (
                            <div className="space-y-2 ml-4">
                              {job.steps.map(step => (
                                <div key={step.id} className="flex items-center gap-3 text-sm">
                                  {getStatusIcon(step.status)}
                                  <span className="flex-1">{step.name}</span>
                                  <span className="text-gray-500">{formatDuration(step.duration_seconds)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-4 border-t">
                    <Button variant="outline" className="flex-1" onClick={() => handleDownloadLogs(selectedBuild)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Logs
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => {
                      const artifact = databaseArtifacts.find(a => a.build_id === selectedBuild.id)
                      if (artifact) handleDownloadArtifact(artifact)
                      else toast.info('No artifacts available for this build')
                    }}>
                      <Download className="w-4 h-4 mr-2" />
                      Artifacts
                    </Button>
                    {selectedBuild.status === 'running' ? (
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleCancelBuild(selectedBuild)}
                      >
                        <StopCircle className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    ) : (
                      <Button
                        className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-600 text-white"
                        onClick={() => handleRetryBuild(selectedBuild)}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Re-run
                      </Button>
                    )}
                  </div>
                  <div className="flex justify-center pt-2">
                    <Button variant="link" onClick={() => handleViewBuildDetails(selectedBuild)}>
                      View Full Details
                    </Button>
                  </div>
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Workflow Detail Dialog */}
        <Dialog open={!!selectedWorkflow} onOpenChange={() => setSelectedWorkflow(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Workflow className="w-5 h-5" />
                {selectedWorkflow?.name}
              </DialogTitle>
              <DialogDescription>
                {selectedWorkflow?.file_path}
              </DialogDescription>
            </DialogHeader>
            {selectedWorkflow && (
              <div className="space-y-6">
                <p className="text-gray-600 dark:text-gray-300">{selectedWorkflow.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-2xl font-bold">{selectedWorkflow.total_runs}</p>
                    <p className="text-sm text-gray-500">Total Runs</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{selectedWorkflow.success_rate}%</p>
                    <p className="text-sm text-gray-500">Success Rate</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-2xl font-bold">{formatDuration(selectedWorkflow.avg_duration_seconds)}</p>
                    <p className="text-sm text-gray-500">Avg Duration</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Triggers</h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedWorkflow.triggers.map(trigger => (
                      <Badge key={trigger} variant="outline">
                        {getTriggerIcon(trigger)}
                        <span className="ml-1">{trigger}</span>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Branches</h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedWorkflow.branches.map(branch => (
                      <Badge key={branch} variant="secondary">
                        <GitBranch className="w-3 h-3 mr-1" />
                        {branch}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.push(`/dashboard/builds/workflows/${selectedWorkflow.id}`)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View File
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-600 text-white"
                    onClick={() => handleRunWorkflow(selectedWorkflow)}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Run Workflow
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
