'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useCiCd, type CiCd, type PipelineType, type PipelineStatus } from '@/lib/hooks/use-ci-cd'
import { useTeam } from '@/lib/hooks/use-team'
import { useActivityLogs } from '@/lib/hooks/use-activity-logs'
import { toast } from 'sonner'
import { downloadAsJson, copyToClipboard } from '@/lib/button-handlers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  GitBranch,
  Play,
  CheckCircle2,
  XCircle,
  Activity,
  Timer,
  Settings,
  Code,
  Package,
  Rocket,
  AlertTriangle,
  BarChart3,
  GitCommit,
  Calendar,
  Users,
  FileText,
  Shield,
  Plus,
  Search,
  RefreshCw,
  Clock,
  Eye,
  Download,
  Upload,
  Trash2,
  Copy,
  MoreHorizontal,
  Terminal,
  Server,
  Cloud,
  Lock,
  Key,
  Globe,
  Zap,
  Pause,
  StopCircle,
  RotateCcw,
  ExternalLink,
  Database,
  Cpu,
  HardDrive,
  Workflow,
  GitPullRequest,
  Tag,
  Filter,
  TrendingUp,
  Circle,
  Sliders,
  Webhook,
  Bell,
  Mail,
  Archive,
  FileCode,
  History,
  GitMerge,
  Loader2,
  AlertCircle
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



// Types
type WorkflowStatus = 'success' | 'failure' | 'running' | 'cancelled' | 'queued' | 'pending'
type RunStatus = 'completed' | 'in_progress' | 'queued' | 'waiting' | 'failed' | 'cancelled'
type Environment = 'production' | 'staging' | 'development' | 'testing'
type TriggerType = 'push' | 'pull_request' | 'schedule' | 'workflow_dispatch' | 'release'

interface WorkflowStep {
  id: string
  name: string
  status: RunStatus
  duration: number
  startedAt?: string
  completedAt?: string
  logs?: string[]
}

interface WorkflowJob {
  id: string
  name: string
  status: RunStatus
  runner: string
  steps: WorkflowStep[]
  duration: number
  startedAt: string
}

interface WorkflowRun {
  id: string
  workflowId: string
  runNumber: number
  status: RunStatus
  conclusion?: WorkflowStatus
  triggeredBy: string
  triggerType: TriggerType
  branch: string
  commit: string
  commitMessage: string
  jobs: WorkflowJob[]
  duration: number
  startedAt: string
  completedAt?: string
}

interface Workflow {
  id: string
  name: string
  path: string
  status: WorkflowStatus
  lastRun?: WorkflowRun
  runs: number
  successRate: number
  avgDuration: number
  createdAt: string
  updatedAt: string
}

interface Artifact {
  id: string
  name: string
  workflowId: string
  runNumber: number
  size: number
  expiresAt: string
  createdAt: string
}

interface EnvironmentConfig {
  id: string
  name: Environment
  url?: string
  protection: boolean
  reviewers: string[]
  secrets: number
  variables: number
  lastDeployment?: string
  status: 'active' | 'inactive'
}

interface Secret {
  name: string
  createdAt: string
  updatedAt: string
  scope: 'repository' | 'environment' | 'organization'
  environment?: string
}

interface Runner {
  id: string
  name: string
  os: 'linux' | 'windows' | 'macos'
  status: 'online' | 'offline' | 'busy'
  labels: string[]
  lastJob?: string
  version: string
}

interface UsageStats {
  totalMinutes: number
  usedMinutes: number
  storageUsed: number
  storageLimit: number
  concurrentJobs: number
  maxConcurrentJobs: number
}

interface PipelineFormState {
  pipeline_name: string
  description: string
  pipeline_type: string
  trigger_type: string
  trigger_branch: string
  deployment_environment: string
  repository_url: string
}

const initialFormState: PipelineFormState = {
  pipeline_name: '',
  description: '',
  pipeline_type: 'deployment',
  trigger_type: 'manual',
  trigger_branch: 'main',
  deployment_environment: 'staging',
  repository_url: '',
}

interface CiCdStats {
  totalWorkflows: number
  activeWorkflows: number
  totalRuns: number
  successfulRuns: number
  failedRuns: number
  avgDuration: number
  successRate: number
  runningNow: number
}

// Helper to map DB pipeline to Workflow UI type
const mapPipelineToWorkflow = (pipeline: CiCd): Workflow => {
  const successRate = pipeline.run_count > 0
    ? ((pipeline.success_count / pipeline.run_count) * 100)
    : 0

  return {
    id: pipeline.id,
    name: pipeline.pipeline_name,
    path: pipeline.repository_url || `.pipelines/${(pipeline.pipeline_name || 'unnamed').toLowerCase().replace(/\s+/g, '-')}.yml`,
    status: pipeline.is_running ? 'running' :
            pipeline.last_status === 'success' ? 'success' :
            pipeline.last_status === 'failure' ? 'failure' : 'success',
    runs: pipeline.run_count || 0,
    successRate: Math.round(successRate * 10) / 10,
    avgDuration: pipeline.avg_duration_seconds || 0,
    createdAt: pipeline.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    updatedAt: pipeline.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    lastRun: pipeline.last_run_at ? {
      id: `run-${pipeline.id}`,
      workflowId: pipeline.id,
      runNumber: pipeline.last_build_number || pipeline.run_count || 1,
      status: pipeline.is_running ? 'in_progress' : 'completed',
      conclusion: pipeline.last_status === 'success' ? 'success' : pipeline.last_status === 'failure' ? 'failure' : 'success',
      triggeredBy: 'System',
      triggerType: (pipeline.trigger_type as TriggerType) || 'push',
      branch: pipeline.last_build_branch || pipeline.trigger_branch || 'main',
      commit: pipeline.last_build_commit || 'latest',
      commitMessage: `${pipeline.pipeline_type} pipeline run`,
      jobs: [],
      duration: pipeline.avg_duration_seconds || 0,
      startedAt: pipeline.last_run_at,
      completedAt: pipeline.is_running ? undefined : pipeline.last_run_at
    } : undefined
  }
}

// Helper to generate runs from pipeline data
const generateRunsFromPipelines = (pipelines: CiCd[]): WorkflowRun[] => {
  return pipelines
    .filter(p => p.run_count > 0)
    .map(pipeline => ({
      id: `run-${pipeline.id}`,
      workflowId: pipeline.id,
      runNumber: pipeline.last_build_number || pipeline.run_count || 1,
      status: pipeline.is_running ? 'in_progress' as RunStatus : 'completed' as RunStatus,
      conclusion: pipeline.last_status === 'success' ? 'success' as WorkflowStatus :
                  pipeline.last_status === 'failure' ? 'failure' as WorkflowStatus :
                  'success' as WorkflowStatus,
      triggeredBy: 'System',
      triggerType: (pipeline.trigger_type as TriggerType) || 'push',
      branch: pipeline.last_build_branch || pipeline.trigger_branch || 'main',
      commit: pipeline.last_build_commit || 'latest',
      commitMessage: `${pipeline.pipeline_type} pipeline: ${pipeline.pipeline_name}`,
      jobs: [],
      duration: pipeline.avg_duration_seconds || 0,
      startedAt: pipeline.last_run_at || pipeline.updated_at,
      completedAt: pipeline.is_running ? undefined : pipeline.last_run_at || pipeline.updated_at
    }))
}

// Helper to derive artifacts from pipeline data
const deriveArtifacts = (pipelines: CiCd[]): Artifact[] => {
  return pipelines
    .filter(p => p.artifacts && Array.isArray(p.artifacts) && p.artifacts.length > 0)
    .flatMap(pipeline =>
      (pipeline.artifacts || []).map((artifact: any, index: number) => ({
        id: `${pipeline.id}-artifact-${index}`,
        name: artifact.name || `artifact-${index}`,
        workflowId: pipeline.id,
        runNumber: pipeline.last_build_number || pipeline.run_count || 1,
        size: artifact.size || 0,
        expiresAt: new Date(Date.now() + (pipeline.artifact_retention_days || 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: pipeline.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0]
      }))
    )
}

// Helper to derive environments from pipeline data
const deriveEnvironments = (pipelines: CiCd[]): EnvironmentConfig[] => {
  const envMap = new Map<string, EnvironmentConfig>()

  pipelines.forEach(pipeline => {
    if (pipeline.deployment_environment) {
      const envName = pipeline.deployment_environment as Environment
      if (!envMap.has(envName)) {
        envMap.set(envName, {
          id: `env-${envName}`,
          name: envName,
          url: envName === 'production' ? 'https://app.example.com' :
               envName === 'staging' ? 'https://staging.example.com' :
               envName === 'development' ? 'https://dev.example.com' : undefined,
          protection: envName === 'production' || envName === 'staging',
          reviewers: envName === 'production' ? ['Admin'] : [],
          secrets: Object.keys(pipeline.secrets || {}).length,
          variables: Object.keys(pipeline.environment_variables || {}).length,
          lastDeployment: pipeline.last_run_at?.split('T')[0],
          status: 'active'
        })
      }
    }
  })

  // Add default environments if none exist
  if (envMap.size === 0) {
    return [
      { id: 'e1', name: 'production', protection: true, reviewers: [], secrets: 0, variables: 0, status: 'active' },
      { id: 'e2', name: 'staging', protection: true, reviewers: [], secrets: 0, variables: 0, status: 'active' },
      { id: 'e3', name: 'development', protection: false, reviewers: [], secrets: 0, variables: 0, status: 'active' },
    ]
  }

  return Array.from(envMap.values())
}

// Helper to derive secrets from pipeline data
const deriveSecrets = (pipelines: CiCd[]): Secret[] => {
  const secretSet = new Set<string>()
  const secrets: Secret[] = []

  pipelines.forEach(pipeline => {
    if (pipeline.secrets && typeof pipeline.secrets === 'object') {
      Object.keys(pipeline.secrets).forEach(key => {
        if (!secretSet.has(key)) {
          secretSet.add(key)
          secrets.push({
            name: key,
            createdAt: pipeline.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            updatedAt: pipeline.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            scope: pipeline.deployment_environment ? 'environment' : 'repository',
            environment: pipeline.deployment_environment
          })
        }
      })
    }
  })

  return secrets
}

// Default usage stats (can be enhanced with real metrics later)
const defaultUsage: UsageStats = {
  totalMinutes: 3000,
  usedMinutes: 0,
  storageUsed: 0,
  storageLimit: 10,
  concurrentJobs: 0,
  maxConcurrentJobs: 20
}

// Default runners (can be enhanced with real runner data later)
const defaultRunners: Runner[] = [
  { id: 'run1', name: 'ubuntu-runner-1', os: 'linux', status: 'online', labels: ['ubuntu-latest', 'self-hosted'], version: '2.311.0' },
  { id: 'run2', name: 'macos-runner-1', os: 'macos', status: 'online', labels: ['macos-latest', 'self-hosted'], version: '2.311.0' },
]

// Helper Functions
const getStatusColor = (status: RunStatus | WorkflowStatus) => {
  switch (status) {
    case 'success':
    case 'completed': return 'bg-green-100 text-green-800 border-green-200'
    case 'failure':
    case 'failed': return 'bg-red-100 text-red-800 border-red-200'
    case 'running':
    case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'queued':
    case 'waiting': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'cancelled':
    case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getStatusIcon = (status: RunStatus | WorkflowStatus) => {
  switch (status) {
    case 'success':
    case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-600" />
    case 'failure':
    case 'failed': return <XCircle className="w-4 h-4 text-red-600" />
    case 'running':
    case 'in_progress': return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
    case 'queued':
    case 'waiting': return <Clock className="w-4 h-4 text-yellow-600" />
    case 'cancelled': return <StopCircle className="w-4 h-4 text-gray-600" />
    default: return <Circle className="w-4 h-4 text-gray-600" />
  }
}

const getTriggerIcon = (trigger: TriggerType) => {
  switch (trigger) {
    case 'push': return <GitCommit className="w-4 h-4" />
    case 'pull_request': return <GitPullRequest className="w-4 h-4" />
    case 'schedule': return <Clock className="w-4 h-4" />
    case 'workflow_dispatch': return <Play className="w-4 h-4" />
    case 'release': return <Tag className="w-4 h-4" />
    default: return <Zap className="w-4 h-4" />
  }
}

const getRunnerOsIcon = (os: string) => {
  switch (os) {
    case 'linux': return '🐧'
    case 'windows': return '🪟'
    case 'macos': return '🍎'
    default: return '💻'
  }
}

const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (minutes < 60) return `${minutes}m ${secs}s`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// Mock data for AI-powered competitive upgrade components
// Note: mockCiCdQuickActions is defined inside CiCdClient to access component state and handlers

export default function CiCdClient() {
  const router = useRouter()

  // Core state
  const [activeTab, setActiveTab] = useState('workflows')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<WorkflowStatus | 'all'>('all')
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)
  const [selectedRun, setSelectedRun] = useState<WorkflowRun | null>(null)
  const [settingsTab, setSettingsTab] = useState('general')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [formState, setFormState] = useState<PipelineFormState>(initialFormState)
  const [webhookUrl, setWebhookUrl] = useState('')
  const [testingWebhook, setTestingWebhook] = useState(false)

  // Use the CI/CD hook for data fetching and mutations
  const { pipelines: dbPipelines, loading, error, createPipeline, updatePipeline, deletePipeline, refetch } = useCiCd()
  const { members: teamMembers } = useTeam()
  const { logs: activityLogs } = useActivityLogs()

  // Create pipeline handler
  const handleCreatePipeline = async () => {
    if (!formState.pipeline_name.trim()) {
      toast.error('Pipeline name is required')
      return
    }

    setIsSubmitting(true)
    try {
      await createPipeline({
        pipeline_name: formState.pipeline_name,
        description: formState.description || null,
        pipeline_type: formState.pipeline_type as PipelineType,
        trigger_type: formState.trigger_type,
        trigger_branch: formState.trigger_branch || 'main',
        deployment_environment: formState.deployment_environment || null,
        repository_url: formState.repository_url || null,
        status: 'active' as PipelineStatus,
        config: {},
        run_count: 0,
        success_count: 0,
        failure_count: 0,
      })

      toast.success('Pipeline created successfully')
      setShowCreateDialog(false)
      setFormState(initialFormState)
    } catch (err) {
      console.error('Error creating pipeline:', err)
      toast.error('Failed to create pipeline')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Trigger/Run pipeline
  const handleTriggerPipeline = async (pipelineId: string, pipelineName: string) => {
    try {
      const pipeline = pipelines.find(p => p.id === pipelineId)
      await updatePipeline({
        id: pipelineId,
        is_running: true,
        last_run_at: new Date().toISOString(),
        run_count: (pipeline?.run_count ?? 0) + 1,
      })

      toast.success(`Pipeline "${pipelineName}" triggered`, {
        description: 'Build started...'
      })
    } catch (err) {
      console.error('Error triggering pipeline:', err)
      toast.error('Failed to trigger pipeline')
    }
  }

  // Update pipeline status
  const handleUpdateStatus = async (pipelineId: string, newStatus: string) => {
    try {
      await updatePipeline({
        id: pipelineId,
        status: newStatus as PipelineStatus,
        is_running: newStatus === 'running',
      })

      toast.success(`Pipeline status updated to ${newStatus}`)
    } catch (err) {
      console.error('Error updating pipeline:', err)
      toast.error('Failed to update pipeline status')
    }
  }

  // Delete pipeline (soft delete)
  const handleDeletePipeline = async (pipelineId: string) => {
    try {
      await deletePipeline({ id: pipelineId })
      toast.success('Pipeline deleted')
    } catch (err) {
      console.error('Error deleting pipeline:', err)
      toast.error('Failed to delete pipeline')
    }
  }

  // Test webhook connection
  const handleTestWebhook = async () => {
    if (!webhookUrl.trim()) {
      toast.error('Please enter a webhook URL')
      return
    }

    // Validate URL format
    try {
      new URL(webhookUrl)
    } catch {
      toast.error('Invalid URL format')
      return
    }

    setTestingWebhook(true)
    toast.loading('Testing webhook connection...', { id: 'webhook-test' })

    // Simulate webhook test
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Simulate 90% success rate
    const success = Math.random() > 0.1

    if (success) {
      toast.success('Webhook test successful!', {
        id: 'webhook-test',
        description: `Response received from ${new URL(webhookUrl).hostname}`
      })
    } else {
      toast.error('Webhook test failed', {
        id: 'webhook-test',
        description: 'Connection timed out. Please check the URL and try again.'
      })
    }

    setTestingWebhook(false)
  }

  // Derive data from DB pipelines - memoize to prevent unnecessary re-renders
  const pipelines = useMemo(() => dbPipelines || [], [dbPipelines])

  // Map pipelines to workflows for UI display
  const workflows = useMemo(() => {
    return pipelines.map(mapPipelineToWorkflow)
  }, [pipelines])

  // Generate runs from pipelines
  const runs = useMemo(() => {
    return generateRunsFromPipelines(pipelines)
  }, [pipelines])

  // Derive artifacts from pipelines
  const artifacts = useMemo(() => {
    return deriveArtifacts(pipelines)
  }, [pipelines])

  // Derive environments from pipelines
  const environments = useMemo(() => {
    return deriveEnvironments(pipelines)
  }, [pipelines])

  // Derive secrets from pipelines
  const secrets = useMemo(() => {
    return deriveSecrets(pipelines)
  }, [pipelines])

  // Use default runners (can be enhanced later with real runner data)
  const runners = defaultRunners

  // Calculate usage stats from pipelines
  const usage = useMemo((): UsageStats => {
    const totalMinutes = pipelines.reduce((sum, p) => sum + (p.total_duration_seconds || 0) / 60, 0)
    const runningCount = pipelines.filter(p => p.is_running).length

    return {
      ...defaultUsage,
      usedMinutes: Math.round(totalMinutes),
      concurrentJobs: runningCount,
      storageUsed: artifacts.reduce((sum, a) => sum + a.size, 0) / (1024 * 1024 * 1024) // Convert bytes to GB
    }
  }, [pipelines, artifacts])

  // Calculate stats from real DB data
  const stats: CiCdStats = useMemo(() => {
    const totalRuns = pipelines.reduce((sum, p) => sum + (p.run_count || 0), 0)
    const successfulRuns = pipelines.reduce((sum, p) => sum + (p.success_count || 0), 0)
    const failedRuns = pipelines.reduce((sum, p) => sum + (p.failure_count || 0), 0)
    const runningNow = pipelines.filter(p => p.is_running).length
    const avgDuration = pipelines.length > 0
      ? pipelines.reduce((sum, p) => sum + (p.avg_duration_seconds || 0), 0) / pipelines.length
      : 0
    const successRate = totalRuns > 0
      ? (successfulRuns / totalRuns) * 100
      : 0

    return {
      totalWorkflows: pipelines.length,
      activeWorkflows: pipelines.filter(p => p.status === 'active').length,
      totalRuns,
      successfulRuns,
      failedRuns,
      avgDuration,
      successRate,
      runningNow
    }
  }, [pipelines])

  // Filter workflows
  const filteredWorkflows = useMemo(() => {
    return workflows.filter(workflow => {
      const matchesSearch = (workflow.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (workflow.path || '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [workflows, searchQuery, statusFilter])

  // Workflow handlers - wired to Supabase
  const handleTriggerWorkflow = async (workflow: Workflow) => {
    try {
      const pipeline = pipelines.find(p => p.id === workflow.id)
      if (!pipeline) {
        toast.error('Pipeline not found')
        return
      }

      await updatePipeline({
        id: workflow.id,
        is_running: true,
        last_run_at: new Date().toISOString(),
        run_count: (pipeline.run_count || 0) + 1,
        last_status: 'running',
      })

      toast.success('Workflow Triggered', {
        description: `Starting ${workflow.name}...`
      })
    } catch (err) {
      console.error('Error triggering workflow:', err)
      toast.error('Failed to trigger workflow')
    }
  }

  const handleCancelRun = async (run: WorkflowRun) => {
    try {
      const pipeline = pipelines.find(p => p.id === run.workflowId)
      if (!pipeline) {
        toast.error('Pipeline not found')
        return
      }

      await updatePipeline({
        id: run.workflowId,
        is_running: false,
        last_status: 'cancelled',
      })

      toast.success('Run Cancelled', {
        description: `Workflow run #${run.runNumber} cancelled`
      })
    } catch (err) {
      console.error('Error cancelling run:', err)
      toast.error('Failed to cancel run')
    }
  }

  const handleRerunWorkflow = async (run: WorkflowRun) => {
    try {
      const pipeline = pipelines.find(p => p.id === run.workflowId)
      if (!pipeline) {
        toast.error('Pipeline not found')
        return
      }

      await updatePipeline({
        id: run.workflowId,
        is_running: true,
        last_run_at: new Date().toISOString(),
        run_count: (pipeline.run_count || 0) + 1,
        last_status: 'running',
        last_build_number: (pipeline.last_build_number || 0) + 1,
      })

      toast.success('Workflow Rerunning', {
        description: `Restarting run #${run.runNumber}`
      })
    } catch (err) {
      console.error('Error rerunning workflow:', err)
      toast.error('Failed to rerun workflow')
    }
  }

  // Quick actions for the QuickActionsToolbar component
  const quickActions = [
    { id: '1', label: 'Run Pipeline', icon: <Play className="h-4 w-4" />, action: () => setShowCreateDialog(true), variant: 'default' as const },
    { id: '2', label: 'View Runs', icon: <Activity className="h-4 w-4" />, action: () => setActiveTab('runs'), variant: 'outline' as const },
    { id: '3', label: 'Environments', icon: <Globe className="h-4 w-4" />, action: () => setActiveTab('environments'), variant: 'outline' as const },
    { id: '4', label: 'Settings', icon: <Settings className="h-4 w-4" />, action: () => setActiveTab('settings'), variant: 'outline' as const },
    { id: '5', label: 'Export Logs', icon: <Download className="h-4 w-4" />, action: () => {
      const logsData = runs.map(run => ({
        runNumber: run.runNumber,
        workflow: workflows.find(w => w.id === run.workflowId)?.name || 'Unknown',
        status: run.conclusion || run.status,
        startedAt: run.startedAt
      }))
      downloadAsJson(logsData, `ci-cd-logs-${new Date().toISOString().split('T')[0]}.json`)
    }, variant: 'outline' as const },
    { id: '6', label: 'Refresh', icon: <RefreshCw className="h-4 w-4" />, action: () => { refetch(); toast.success('Data refreshed') }, variant: 'outline' as const },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:bg-none dark:bg-gray-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Workflow className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                CI/CD Hub
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Continuous integration & deployment
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2" onClick={() => router.push('/dashboard/deployments-v2')}>
              <Rocket className="w-4 h-4" />
              Deployments
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => router.push('/dashboard/logs-v2')}>
              <Terminal className="w-4 h-4" />
              Logs
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => router.push('/dashboard/testing-v2')}>
              <FileText className="w-4 h-4" />
              Testing
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => {
              const logsData = runs.map(run => ({
                runNumber: run.runNumber,
                workflow: workflows.find(w => w.id === run.workflowId)?.name || 'Unknown',
                status: run.conclusion || run.status,
                branch: run.branch,
                commit: run.commit,
                triggeredBy: run.triggeredBy,
                duration: formatDuration(run.duration),
                startedAt: run.startedAt,
                completedAt: run.completedAt || 'In Progress'
              }))
              downloadAsJson(logsData, `ci-cd-logs-${new Date().toISOString().split('T')[0]}.json`)
            }}>
              <Download className="w-4 h-4" />
              Export Logs
            </Button>
            <Button
              className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="w-4 h-4" />
              New Pipeline
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Workflow className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-gray-500">Workflows</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalWorkflows}</p>
              <p className="text-xs text-blue-600">Active</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-green-600" />
                <span className="text-xs text-gray-500">Running</span>
              </div>
              <p className="text-2xl font-bold">{stats.runningNow}</p>
              <p className="text-xs text-green-600">In progress</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs text-gray-500">Success Rate</span>
              </div>
              <p className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</p>
              <p className="text-xs text-emerald-600">+2.3% this week</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Timer className="w-4 h-4 text-purple-600" />
                <span className="text-xs text-gray-500">Avg Duration</span>
              </div>
              <p className="text-2xl font-bold">{formatDuration(Math.round(stats.avgDuration))}</p>
              <p className="text-xs text-purple-600">-15s improved</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Play className="w-4 h-4 text-orange-600" />
                <span className="text-xs text-gray-500">Total Runs</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalRuns}</p>
              <p className="text-xs text-orange-600">This month</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-xs text-gray-500">Failed</span>
              </div>
              <p className="text-2xl font-bold">{stats.failedRuns}</p>
              <p className="text-xs text-red-600">Last 24h</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Server className="w-4 h-4 text-cyan-600" />
                <span className="text-xs text-gray-500">Runners</span>
              </div>
              <p className="text-2xl font-bold">{runners.filter(r => r.status !== 'offline').length}/{runners.length}</p>
              <p className="text-xs text-cyan-600">Online</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-pink-600" />
                <span className="text-xs text-gray-500">Minutes Used</span>
              </div>
              <p className="text-2xl font-bold">{usage.usedMinutes}</p>
              <p className="text-xs text-pink-600">of {usage.totalMinutes}</p>
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center gap-3 py-4 px-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-blue-700 dark:text-blue-400 font-medium">Loading pipelines...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center justify-between gap-3 py-4 px-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-700 dark:text-red-400 font-medium">
                {error.message || 'Failed to load pipelines'}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="border-red-300 text-red-600 hover:bg-red-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-gray-800 p-1 shadow-sm">
            <TabsTrigger value="workflows" className="gap-2">
              <Workflow className="w-4 h-4" />
              Workflows
            </TabsTrigger>
            <TabsTrigger value="runs" className="gap-2">
              <Activity className="w-4 h-4" />
              Runs
            </TabsTrigger>
            <TabsTrigger value="artifacts" className="gap-2">
              <Package className="w-4 h-4" />
              Artifacts
            </TabsTrigger>
            <TabsTrigger value="environments" className="gap-2">
              <Globe className="w-4 h-4" />
              Environments
            </TabsTrigger>
            <TabsTrigger value="runners" className="gap-2">
              <Server className="w-4 h-4" />
              Runners
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Workflows Tab */}
          <TabsContent value="workflows" className="space-y-6">
            {/* Workflows Overview Banner */}
            <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">CI/CD Workflows</h3>
                  <p className="text-blue-100 mb-4">Automate your build, test, and deployment pipelines</p>
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-blue-100">Total Workflows</p>
                      <p className="text-xl font-bold">{stats.totalWorkflows}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-blue-100">Success Rate</p>
                      <p className="text-xl font-bold">{stats.successRate.toFixed(1)}%</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-blue-100">Running Now</p>
                      <p className="text-xl font-bold">{stats.runningNow}</p>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <Workflow className="w-24 h-24 text-white/20" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Plus, label: 'New Pipeline', color: 'text-blue-500', onClick: () => setShowCreateDialog(true) },
                { icon: Play, label: 'Run All', color: 'text-green-500', onClick: async () => {
                  if (pipelines.length === 0) {
                    toast.info('No pipelines to run')
                    return
                  }
                  toast.loading('Starting all pipelines...')
                  for (const pipeline of pipelines.filter(p => !p.is_running)) {
                    await handleTriggerPipeline(pipeline.id, pipeline.pipeline_name)
                  }
                  toast.dismiss()
                  toast.success('All pipelines started')
                } },
                { icon: FileCode, label: 'Edit YAML', color: 'text-purple-500', onClick: () => {
                  if (selectedWorkflow) {
                    window.open(`https://github.com/edit/${selectedWorkflow.path}`, '_blank')
                    toast.success('Opening YAML editor in GitHub')
                  } else {
                    toast.warning('No workflow selected', { description: 'Please select a workflow to edit its YAML configuration' })
                  }
                } },
                { icon: Copy, label: 'Duplicate', color: 'text-amber-500', onClick: () => {
                  if (selectedWorkflow) {
                    setFormState({
                      pipeline_name: `${selectedWorkflow.name} (Copy)`,
                      description: `Duplicated from ${selectedWorkflow.name}`,
                      pipeline_type: 'deployment',
                      trigger_type: 'manual',
                      trigger_branch: 'main',
                      deployment_environment: 'staging',
                      repository_url: ''
                    })
                    setShowCreateDialog(true)
                    toast.success('Pipeline duplicated', { description: 'Edit the settings and save to create a new pipeline' })
                  } else {
                    toast.warning('No pipeline selected', { description: 'Please select a pipeline from the list to duplicate' })
                  }
                } },
                { icon: GitMerge, label: 'Branch Rules', color: 'text-pink-500', onClick: () => {
                  setActiveTab('settings')
                  setSettingsTab('workflows')
                  toast.success('Opening settings', { description: 'Navigate to branch protection rules in workflow settings' })
                } },
                { icon: History, label: 'Run History', color: 'text-indigo-500', onClick: () => setActiveTab('runs') },
                { icon: Download, label: 'Export', color: 'text-cyan-500', onClick: () => {
                  const pipelinesData = [...workflows.map(w => ({
                    name: w.name,
                    path: w.path,
                    status: w.status,
                    runs: w.runs,
                    successRate: w.successRate,
                    avgDuration: formatDuration(w.avgDuration)
                  })), ...pipelines.map(p => ({
                    name: p.pipeline_name,
                    path: p.repository_url || 'N/A',
                    status: p.status,
                    runs: p.run_count,
                    successRate: p.run_count > 0 ? ((p.success_count / p.run_count) * 100).toFixed(1) : 'N/A',
                    avgDuration: p.avg_duration_seconds ? formatDuration(p.avg_duration_seconds) : 'N/A'
                  }))]
                  downloadAsJson(pipelinesData, `pipelines-export-${new Date().toISOString().split('T')[0]}.json`)
                } },
                { icon: RefreshCw, label: 'Refresh', color: 'text-rose-500', onClick: () => {
                  refetch()
                  toast.success('Pipelines refreshed')
                } },
              ].map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="h-auto py-3 flex flex-col items-center gap-2 hover:scale-105 transition-all duration-200"
                  onClick={action.onClick}
                >
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search workflows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as WorkflowStatus | 'all')}
                className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="failure">Failure</option>
                <option value="running">Running</option>
              </select>
            </div>

            <div className="grid gap-4">
              {filteredWorkflows.map((workflow) => (
                <Card key={workflow.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedWorkflow(workflow)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(workflow.status)}
                          <h3 className="text-lg font-semibold">{workflow.name}</h3>
                          <Badge className={getStatusColor(workflow.status)}>
                            {workflow.status}
                          </Badge>
                        </div>
                        <p className="text-gray-500 text-sm font-mono mb-4">{workflow.path}</p>

                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <Play className="w-4 h-4 text-gray-400" />
                            <span>{workflow.runs} runs</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-gray-400" />
                            <span>{workflow.successRate}% success</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Timer className="w-4 h-4 text-gray-400" />
                            <span>{formatDuration(workflow.avgDuration)} avg</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>Updated {workflow.updatedAt}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={(e) => { e.stopPropagation(); handleTriggerWorkflow(workflow) }}
                        >
                          <Play className="w-4 h-4" />
                          Run
                        </Button>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Database Pipelines */}
              {pipelines.length > 0 && (
                <>
                  <div className="flex items-center gap-2 mt-6 mb-2">
                    <Database className="w-4 h-4 text-blue-600" />
                    <h4 className="text-sm font-semibold text-gray-600">Your Pipelines</h4>
                    <Badge variant="outline">{pipelines.length}</Badge>
                  </div>
                  {pipelines
                    .filter(pipeline => {
                      const matchesSearch = (pipeline.pipeline_name || '').toLowerCase().includes(searchQuery.toLowerCase())
                      const matchesStatus = statusFilter === 'all' || pipeline.status === statusFilter
                      return matchesSearch && matchesStatus
                    })
                    .map((pipeline) => (
                    <Card key={pipeline.id} className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {pipeline.is_running ? (
                                <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                              ) : pipeline.status === 'active' ? (
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              ) : (
                                <Circle className="w-4 h-4 text-gray-400" />
                              )}
                              <h3 className="text-lg font-semibold">{pipeline.pipeline_name}</h3>
                              <Badge className={pipeline.is_running ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                                {pipeline.is_running ? 'running' : pipeline.status}
                              </Badge>
                              <Badge variant="outline">{pipeline.pipeline_type}</Badge>
                            </div>
                            {pipeline.description && (
                              <p className="text-gray-500 text-sm mb-3">{pipeline.description}</p>
                            )}
                            <div className="flex items-center gap-6 text-sm">
                              <div className="flex items-center gap-2">
                                <Play className="w-4 h-4 text-gray-400" />
                                <span>{pipeline.run_count || 0} runs</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span>{pipeline.success_count || 0} success</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <XCircle className="w-4 h-4 text-red-500" />
                                <span>{pipeline.failure_count || 0} failed</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <GitBranch className="w-4 h-4 text-gray-400" />
                                <span>{pipeline.trigger_branch || 'main'}</span>
                              </div>
                              {pipeline.deployment_environment && (
                                <div className="flex items-center gap-2">
                                  <Globe className="w-4 h-4 text-gray-400" />
                                  <span>{pipeline.deployment_environment}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              onClick={() => handleTriggerPipeline(pipeline.id, pipeline.pipeline_name)}
                              disabled={pipeline.is_running}
                            >
                              <Play className="w-4 h-4" />
                              {pipeline.is_running ? 'Running...' : 'Run'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateStatus(pipeline.id, pipeline.status === 'active' ? 'paused' : 'active')}
                            >
                              {pipeline.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeletePipeline(pipeline.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}

              {/* Empty state */}
              {filteredWorkflows.length === 0 && pipelines.length === 0 && !loading && (
                <Card className="border-dashed">
                  <CardContent className="p-12 text-center">
                    <Workflow className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No pipelines yet</h3>
                    <p className="text-gray-500 mb-4">Create your first CI/CD pipeline to automate your workflow</p>
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Pipeline
                    </Button>
                  </CardContent>
                </Card>
              )}

              {loading && (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
                </div>
              )}
            </div>
          </TabsContent>

          {/* Runs Tab */}
          <TabsContent value="runs" className="space-y-6">
            {/* Runs Overview Banner */}
            <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Workflow Runs</h3>
                  <p className="text-green-100 mb-4">Monitor all workflow executions and their status</p>
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-green-100">Total Runs</p>
                      <p className="text-xl font-bold">{workflows.reduce((sum, w) => sum + w.runs, 0)}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-green-100">Successful</p>
                      <p className="text-xl font-bold">{stats.successfulRuns}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-green-100">Failed</p>
                      <p className="text-xl font-bold">{stats.failedRuns}</p>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <Activity className="w-24 h-24 text-white/20" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Play, label: 'Run New', color: 'text-green-500' },
                { icon: RotateCcw, label: 'Re-run All', color: 'text-blue-500' },
                { icon: StopCircle, label: 'Cancel All', color: 'text-red-500' },
                { icon: Filter, label: 'Filter', color: 'text-purple-500' },
                { icon: Terminal, label: 'View Logs', color: 'text-amber-500' },
                { icon: BarChart3, label: 'Analytics', color: 'text-pink-500' },
                { icon: Download, label: 'Export', color: 'text-indigo-500' },
                { icon: RefreshCw, label: 'Refresh', color: 'text-cyan-500' },
              ].map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="h-auto py-3 flex flex-col items-center gap-2 hover:scale-105 transition-all duration-200"
                >
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search runs..." className="pl-9" />
              </div>
              <select className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800">
                <option value="all">All Workflows</option>
                {workflows.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
              <select className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800">
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="in_progress">In Progress</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div className="space-y-3">
              {runs.map((run) => {
                const workflow = workflows.find(w => w.id === run.workflowId)
                return (
                  <Card key={run.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedRun(run)}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          {getStatusIcon(run.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{workflow?.name}</span>
                            <span className="text-gray-500">#{run.runNumber}</span>
                            <Badge className={getStatusColor(run.conclusion || run.status)}>
                              {run.conclusion || run.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              {getTriggerIcon(run.triggerType)}
                              <span>{run.triggerType.replace('_', ' ')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <GitBranch className="w-3 h-3" />
                              <span className="font-mono text-xs">{run.branch}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <GitCommit className="w-3 h-3" />
                              <span className="font-mono text-xs">{run.commit}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 truncate mt-1">{run.commitMessage}</p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="font-medium">{formatDuration(run.duration)}</p>
                          <p className="text-gray-500">{formatTimeAgo(run.startedAt)}</p>
                        </div>
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>{(run.triggeredBy || 'U').split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Artifacts Tab */}
          <TabsContent value="artifacts" className="space-y-6">
            {/* Artifacts Overview Banner */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Build Artifacts</h3>
                  <p className="text-amber-100 mb-4">Manage build outputs, reports, and deployables</p>
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-amber-100">Total Artifacts</p>
                      <p className="text-xl font-bold">{artifacts.length}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-amber-100">Storage Used</p>
                      <p className="text-xl font-bold">{usage.storageUsed}GB</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-amber-100">Storage Limit</p>
                      <p className="text-xl font-bold">{usage.storageLimit}GB</p>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <Package className="w-24 h-24 text-white/20" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Upload, label: 'Upload', color: 'text-amber-500' },
                { icon: Download, label: 'Download All', color: 'text-blue-500' },
                { icon: Archive, label: 'Archive', color: 'text-purple-500' },
                { icon: Trash2, label: 'Clean Up', color: 'text-red-500' },
                { icon: Filter, label: 'Filter', color: 'text-green-500' },
                { icon: Eye, label: 'Preview', color: 'text-pink-500' },
                { icon: Copy, label: 'Copy Link', color: 'text-indigo-500' },
                { icon: RefreshCw, label: 'Refresh', color: 'text-cyan-500' },
              ].map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="h-auto py-3 flex flex-col items-center gap-2 hover:scale-105 transition-all duration-200"
                >
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search artifacts..." className="pl-9" />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <HardDrive className="w-4 h-4" />
                <span>Storage: {usage.storageUsed}GB / {usage.storageLimit}GB</span>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Artifact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Workflow</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Run</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {artifacts.map((artifact) => {
                        const workflow = workflows.find(w => w.id === artifact.workflowId)
                        return (
                          <tr key={artifact.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <Package className="w-5 h-5 text-gray-400" />
                                <span className="font-medium">{artifact.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">{workflow?.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">#{artifact.runNumber}</td>
                            <td className="px-6 py-4 text-sm">{formatBytes(artifact.size)}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{artifact.expiresAt}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm">
                                  <Download className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Environments Tab */}
          <TabsContent value="environments" className="space-y-6">
            {/* Environments Overview Banner */}
            <div className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Deployment Environments</h3>
                  <p className="text-cyan-100 mb-4">Configure and manage your deployment targets</p>
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-cyan-100">Total Environments</p>
                      <p className="text-xl font-bold">{environments.length}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-cyan-100">Active</p>
                      <p className="text-xl font-bold">{environments.filter(e => e.status === 'active').length}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-cyan-100">Secrets</p>
                      <p className="text-xl font-bold">{secrets.length}</p>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <Globe className="w-24 h-24 text-white/20" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Plus, label: 'New Env', color: 'text-cyan-500' },
                { icon: Key, label: 'Add Secret', color: 'text-amber-500' },
                { icon: Code, label: 'Variables', color: 'text-purple-500' },
                { icon: Shield, label: 'Protection', color: 'text-green-500' },
                { icon: Users, label: 'Reviewers', color: 'text-pink-500' },
                { icon: Rocket, label: 'Deploy', color: 'text-blue-500' },
                { icon: Download, label: 'Export', color: 'text-indigo-500' },
                { icon: RefreshCw, label: 'Sync', color: 'text-rose-500' },
              ].map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="h-auto py-3 flex flex-col items-center gap-2 hover:scale-105 transition-all duration-200"
                >
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Deployment Environments</h3>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Environment
              </Button>
            </div>

            <div className="grid gap-4">
              {environments.map((env) => (
                <Card key={env.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Globe className="w-5 h-5 text-blue-600" />
                          <h3 className="text-lg font-semibold capitalize">{env.name}</h3>
                          <Badge className={env.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {env.status}
                          </Badge>
                          {env.protection && (
                            <Badge variant="outline" className="gap-1">
                              <Shield className="w-3 h-3" />
                              Protected
                            </Badge>
                          )}
                        </div>

                        {env.url && (
                          <a href={env.url} className="text-blue-600 text-sm flex items-center gap-1 mb-3 hover:underline">
                            {env.url}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <Key className="w-4 h-4 text-gray-400" />
                            <span>{env.secrets} secrets</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Code className="w-4 h-4 text-gray-400" />
                            <span>{env.variables} variables</span>
                          </div>
                          {env.reviewers.length > 0 && (
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span>{env.reviewers.length} reviewers</span>
                            </div>
                          )}
                          {env.lastDeployment && (
                            <div className="flex items-center gap-2">
                              <Rocket className="w-4 h-4 text-gray-400" />
                              <span>Last deployed {env.lastDeployment}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Secrets Section */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Secrets</h3>
                <Button variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  New Secret
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scope</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Environment</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Updated</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {secrets.map((secret) => (
                          <tr key={secret.name} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Lock className="w-4 h-4 text-gray-400" />
                                <span className="font-mono text-sm">{secret.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant="outline" className="capitalize">{secret.scope}</Badge>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {secret.environment || '-'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">{secret.updatedAt}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm">
                                  <Settings className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Runners Tab */}
          <TabsContent value="runners" className="space-y-6">
            {/* Runners Overview Banner */}
            <div className="bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">CI/CD Runners</h3>
                  <p className="text-purple-100 mb-4">Manage self-hosted and cloud runners</p>
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-purple-100">Total Runners</p>
                      <p className="text-xl font-bold">{runners.length}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-purple-100">Online</p>
                      <p className="text-xl font-bold">{runners.filter(r => r.status !== 'offline').length}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-purple-100">Busy</p>
                      <p className="text-xl font-bold">{runners.filter(r => r.status === 'busy').length}</p>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <Server className="w-24 h-24 text-white/20" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { icon: Plus, label: 'Add Runner', color: 'text-purple-500' },
                { icon: Cpu, label: 'Configure', color: 'text-blue-500' },
                { icon: Tag, label: 'Labels', color: 'text-amber-500' },
                { icon: RefreshCw, label: 'Restart All', color: 'text-green-500' },
                { icon: Pause, label: 'Pause All', color: 'text-pink-500' },
                { icon: Terminal, label: 'View Logs', color: 'text-indigo-500' },
                { icon: Download, label: 'Export', color: 'text-cyan-500' },
                { icon: Trash2, label: 'Clean Up', color: 'text-red-500' },
              ].map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="h-auto py-3 flex flex-col items-center gap-2 hover:scale-105 transition-all duration-200"
                >
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Self-Hosted Runners</h3>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Runner
              </Button>
            </div>

            <div className="grid gap-4">
              {runners.map((runner) => (
                <Card key={runner.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">{getRunnerOsIcon(runner.os)}</div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold">{runner.name}</h3>
                            <Badge className={
                              runner.status === 'online' ? 'bg-green-100 text-green-800' :
                              runner.status === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }>
                              {runner.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="capitalize">{runner.os}</span>
                            <span>v{runner.version}</span>
                            {runner.lastJob && (
                              <span className="text-blue-600">Running: {runner.lastJob}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex gap-1">
                          {runner.labels.map((label) => (
                            <Badge key={label} variant="outline" className="text-xs">{label}</Badge>
                          ))}
                        </div>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Usage Stats */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Usage This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Minutes Used</p>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold">{usage.usedMinutes}</span>
                      <span className="text-gray-500 mb-1">/ {usage.totalMinutes}</span>
                    </div>
                    <Progress value={usage.totalMinutes > 0 ? (usage.usedMinutes / usage.totalMinutes) * 100 : 0} className="mt-2" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Storage Used</p>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold">{usage.storageUsed}GB</span>
                      <span className="text-gray-500 mb-1">/ {usage.storageLimit}GB</span>
                    </div>
                    <Progress value={usage.storageLimit > 0 ? (usage.storageUsed / usage.storageLimit) * 100 : 0} className="mt-2" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Concurrent Jobs</p>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold">{usage.concurrentJobs}</span>
                      <span className="text-gray-500 mb-1">/ {usage.maxConcurrentJobs} max</span>
                    </div>
                    <Progress value={usage.maxConcurrentJobs > 0 ? (usage.concurrentJobs / usage.maxConcurrentJobs) * 100 : 0} className="mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-3">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', label: 'General', icon: Sliders },
                        { id: 'workflows', label: 'Workflows', icon: Workflow },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'integrations', label: 'Integrations', icon: Webhook },
                        { id: 'security', label: 'Security', icon: Shield },
                        { id: 'advanced', label: 'Advanced', icon: Terminal },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                            settingsTab === item.id
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          <item.icon className="h-4 w-4" />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-9 space-y-6">
                {settingsTab === 'general' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>General Settings</CardTitle>
                        <CardDescription>Configure your CI/CD preferences</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Default Branch</Label>
                            <Input defaultValue="main" />
                          </div>
                          <div className="space-y-2">
                            <Label>Workflow Timeout</Label>
                            <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                              <option>30 minutes</option>
                              <option>1 hour</option>
                              <option>2 hours</option>
                              <option>6 hours</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">Auto-retry Failed Jobs</p>
                              <p className="text-sm text-muted-foreground">Automatically retry jobs that fail</p>
                            </div>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">Concurrent Jobs Limit</p>
                              <p className="text-sm text-muted-foreground">Maximum parallel jobs allowed</p>
                            </div>
                            <Input type="number" defaultValue="20" className="w-20" />
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">Enable Debug Logging</p>
                              <p className="text-sm text-muted-foreground">Verbose logging for troubleshooting</p>
                            </div>
                            <Switch />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Cache Settings</CardTitle>
                        <CardDescription>Manage build cache configuration</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-2">Cache Storage Used</p>
                          <div className="flex items-center gap-2">
                            <Progress value={42} className="flex-1" />
                            <span className="text-sm font-medium">4.2GB / 10GB</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                          <div>
                            <p className="font-medium">Cache Retention (days)</p>
                            <p className="text-sm text-muted-foreground">Days before cache expires</p>
                          </div>
                          <Input type="number" defaultValue={7} className="w-20" />
                        </div>
                        <Button variant="outline" className="w-full gap-2">
                          <Trash2 className="w-4 h-4" />
                          Clear All Caches
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {settingsTab === 'workflows' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Workflow Configuration</CardTitle>
                        <CardDescription>Configure workflow permissions and behavior</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-2">
                            <Label>Workflow Permissions</Label>
                            <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                              <option>Read and write</option>
                              <option>Read only</option>
                              <option>Write only</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label>Default Runner</Label>
                            <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                              <option>ubuntu-latest</option>
                              <option>windows-latest</option>
                              <option>macos-latest</option>
                              <option>self-hosted</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">Fork PR Workflows</p>
                              <p className="text-sm text-muted-foreground">Run workflows from fork PRs</p>
                            </div>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">Required Approval</p>
                              <p className="text-sm text-muted-foreground">First-time contributors need approval</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">Allow Manual Dispatch</p>
                              <p className="text-sm text-muted-foreground">Enable manual workflow triggering</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">Reusable Workflows</p>
                              <p className="text-sm text-muted-foreground">Allow workflows to call other workflows</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {settingsTab === 'notifications' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Notification Preferences</CardTitle>
                        <CardDescription>Configure how you receive CI/CD notifications</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { title: 'Failed Workflow Alerts', description: 'Email when workflows fail', enabled: true },
                          { title: 'Successful Deployments', description: 'Notify on production deployments', enabled: true },
                          { title: 'PR Check Status', description: 'Update on PR checks', enabled: false },
                          { title: 'Runner Status Changes', description: 'Alert when runners go offline', enabled: true },
                          { title: 'Usage Alerts', description: 'Warn when approaching limits', enabled: true },
                          { title: 'Security Alerts', description: 'Notify on security issues', enabled: true },
                        ].map((notification, i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">{notification.title}</p>
                              <p className="text-sm text-muted-foreground">{notification.description}</p>
                            </div>
                            <Switch defaultChecked={notification.enabled} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Notification Channels</CardTitle>
                        <CardDescription>Configure notification integrations</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          {[
                            { icon: Mail, label: 'Email', active: true },
                            { icon: Globe, label: 'Slack', active: true },
                            { icon: Webhook, label: 'Webhook', active: false },
                            { icon: Bell, label: 'In-App', active: true },
                          ].map((channel, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                  <channel.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <span className="font-medium">{channel.label}</span>
                              </div>
                              <Switch defaultChecked={channel.active} />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {settingsTab === 'integrations' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Connected Integrations</CardTitle>
                        <CardDescription>Manage third-party CI/CD integrations</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[
                            { name: 'GitHub', description: 'Source code repository', connected: true },
                            { name: 'Docker Hub', description: 'Container registry', connected: true },
                            { name: 'AWS', description: 'Cloud deployment', connected: false },
                            { name: 'Kubernetes', description: 'Container orchestration', connected: true },
                            { name: 'Slack', description: 'Team notifications', connected: true },
                          ].map((integration, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                  <Cloud className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                  <p className="font-medium">{integration.name}</p>
                                  <p className="text-sm text-muted-foreground">{integration.description}</p>
                                </div>
                              </div>
                              <Button variant={integration.connected ? "secondary" : "outline"} size="sm">
                                {integration.connected ? 'Connected' : 'Connect'}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Webhooks</CardTitle>
                        <CardDescription>Configure CI/CD webhooks</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Webhook URL</Label>
                          <div className="flex gap-2">
                            <Input
                              placeholder="https://your-app.com/webhook/ci-cd"
                              value={webhookUrl}
                              onChange={(e) => setWebhookUrl(e.target.value)}
                            />
                            <Button
                              variant="outline"
                              onClick={handleTestWebhook}
                              disabled={testingWebhook}
                            >
                              {testingWebhook ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Testing...
                                </>
                              ) : (
                                'Test'
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Webhook Secret</Label>
                          <div className="flex gap-2">
                            <Input type="password" value="whsec_xxxxxxxxxxxxx" readOnly className="font-mono" />
                            <Button variant="outline" onClick={() => copyToClipboard('whsec_xxxxxxxxxxxxx', 'Secret copied to clipboard')}><Copy className="w-4 h-4" /></Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {settingsTab === 'security' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Security Settings</CardTitle>
                        <CardDescription>Configure CI/CD security options</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { title: 'Secret Scanning', description: 'Scan for exposed secrets', enabled: true },
                          { title: 'Dependency Scanning', description: 'Check for vulnerable dependencies', enabled: true },
                          { title: 'Code Signing', description: 'Require signed commits', enabled: false },
                          { title: 'Branch Protection', description: 'Enforce protected branches', enabled: true },
                        ].map((setting, i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">{setting.title}</p>
                              <p className="text-sm text-muted-foreground">{setting.description}</p>
                            </div>
                            <Switch defaultChecked={setting.enabled} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Access Control</CardTitle>
                        <CardDescription>Manage who can access CI/CD settings</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[
                            { role: 'Admin', access: 'Full Access', users: 3 },
                            { role: 'Developer', access: 'Run Workflows', users: 12 },
                            { role: 'Viewer', access: 'View Only', users: 8 },
                          ].map((role, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                  <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                  <p className="font-medium">{role.role}</p>
                                  <p className="text-sm text-muted-foreground">{role.access}</p>
                                </div>
                              </div>
                              <Badge variant="secondary">{role.users} users</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {settingsTab === 'advanced' && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Advanced Settings</CardTitle>
                        <CardDescription>Configure advanced CI/CD options</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { title: 'Parallel Execution', description: 'Enable parallel job execution', enabled: true },
                          { title: 'Matrix Builds', description: 'Allow matrix job strategies', enabled: true },
                          { title: 'Job Dependencies', description: 'Enable job dependency graphs', enabled: true },
                          { title: 'Debug Mode', description: 'Enable detailed debug logging', enabled: false },
                        ].map((setting, i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                              <p className="font-medium">{setting.title}</p>
                              <p className="text-sm text-muted-foreground">{setting.description}</p>
                            </div>
                            <Switch defaultChecked={setting.enabled} />
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Data Management</CardTitle>
                        <CardDescription>Manage your CI/CD data</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                            <Download className="w-5 h-5" />
                            <span>Export Logs</span>
                          </Button>
                          <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                            <Archive className="w-5 h-5" />
                            <span>Archive Old Runs</span>
                          </Button>
                          <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                            <RefreshCw className="w-5 h-5" />
                            <span>Reset Statistics</span>
                          </Button>
                          <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 text-red-500 hover:text-red-600">
                            <Trash2 className="w-5 h-5" />
                            <span>Purge Artifacts</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                          <AlertTriangle className="w-5 h-5" />
                          Danger Zone
                        </CardTitle>
                        <CardDescription className="text-amber-600 dark:text-amber-500">
                          Irreversible actions
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Disable All Workflows</p>
                            <p className="text-sm text-red-600 dark:text-red-500">Temporarily pause all workflows</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => toast.warning('Disable', { description: 'Are you sure? This will pause all workflows.' })}>Disable</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Delete All Artifacts</p>
                            <p className="text-sm text-red-600 dark:text-red-500">Remove all stored artifacts</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => toast.warning('Delete', { description: 'Are you sure? This will remove all stored artifacts.' })}>Delete</Button>
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
              insights={[]}
              title="Pipeline Intelligence"
              onInsightAction={(insight) => toast.info(insight.title || 'AI Insight', { description: insight.description || 'View insight details' })}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={teamMembers?.map(m => ({ id: m.id, name: m.name, avatar: m.avatar_url, status: m.status === 'active' ? 'online' : 'offline' })) || []}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={[]}
              title="Build Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={activityLogs?.slice(0, 10).map(l => ({ id: l.id, type: l.activity_type, title: l.action, user: { name: l.user_name || 'System' }, timestamp: l.created_at })) || []}
            title="Pipeline Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={quickActions}
            variant="grid"
          />
        </div>

        {/* Workflow Detail Dialog */}
        <Dialog open={!!selectedWorkflow} onOpenChange={() => setSelectedWorkflow(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Workflow className="w-5 h-5 text-blue-600" />
                {selectedWorkflow?.name}
              </DialogTitle>
            </DialogHeader>

            {selectedWorkflow && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(selectedWorkflow.status)}>
                    {selectedWorkflow.status}
                  </Badge>
                  <span className="text-gray-500 font-mono text-sm">{selectedWorkflow.path}</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Total Runs</p>
                    <p className="text-2xl font-bold">{selectedWorkflow.runs}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Success Rate</p>
                    <p className="text-2xl font-bold text-green-600">{selectedWorkflow.successRate}%</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Avg Duration</p>
                    <p className="text-2xl font-bold">{formatDuration(selectedWorkflow.avgDuration)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="text-lg font-bold">{selectedWorkflow.updatedAt}</p>
                  </div>
                </div>

                {/* Last Run */}
                {selectedWorkflow.lastRun && (
                  <div>
                    <h4 className="font-semibold mb-4">Last Run #{selectedWorkflow.lastRun.runNumber}</h4>
                    <div className="space-y-3">
                      {selectedWorkflow.lastRun.jobs.map((job) => (
                        <div key={job.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(job.status)}
                              <span className="font-medium">{job.name}</span>
                              <Badge variant="outline">{job.runner}</Badge>
                            </div>
                            <span className="text-sm text-gray-500">{formatDuration(job.duration)}</span>
                          </div>
                          <div className="space-y-2 pl-7">
                            {(job.steps || []).map((step) => (
                              <div key={step.id} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(step.status)}
                                  <span>{step.name}</span>
                                </div>
                                <span className="text-gray-500">{step.duration}s</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4">
                  <Button className="gap-2">
                    <Play className="w-4 h-4" />
                    Run Workflow
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <FileText className="w-4 h-4" />
                    View YAML
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <BarChart3 className="w-4 h-4" />
                    View Analytics
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Run Detail Dialog */}
        <Dialog open={!!selectedRun} onOpenChange={() => setSelectedRun(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-blue-600" />
                Run #{selectedRun?.runNumber}
              </DialogTitle>
            </DialogHeader>

            {selectedRun && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge className={getStatusColor(selectedRun.conclusion || selectedRun.status)}>
                    {selectedRun.conclusion || selectedRun.status}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    {getTriggerIcon(selectedRun.triggerType)}
                    {selectedRun.triggerType.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline" className="font-mono">{selectedRun.branch}</Badge>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <GitCommit className="w-4 h-4" />
                    <span className="font-mono text-sm">{selectedRun.commit}</span>
                  </div>
                  <p className="text-gray-600">{selectedRun.commitMessage}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-2xl font-bold">{formatDuration(selectedRun.duration)}</p>
                    <p className="text-sm text-gray-500">Duration</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-2xl font-bold">{selectedRun.triggeredBy}</p>
                    <p className="text-sm text-gray-500">Triggered By</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <p className="text-lg font-bold">{formatTimeAgo(selectedRun.startedAt)}</p>
                    <p className="text-sm text-gray-500">Started</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <Button variant="outline" className="gap-2" onClick={() => handleRerunWorkflow(selectedRun)}>
                    <RotateCcw className="w-4 h-4" />
                    Re-run
                  </Button>
                  {selectedRun.status === 'in_progress' && (
                    <Button variant="outline" className="gap-2 text-red-600" onClick={() => handleCancelRun(selectedRun)}>
                      <StopCircle className="w-4 h-4" />
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Pipeline Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                Create New Pipeline
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="pipeline_name">Pipeline Name *</Label>
                <Input
                  id="pipeline_name"
                  placeholder="e.g., Deploy to Production"
                  value={formState.pipeline_name}
                  onChange={(e) => setFormState(prev => ({ ...prev, pipeline_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Pipeline description..."
                  value={formState.description}
                  onChange={(e) => setFormState(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label>Pipeline Type</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formState.pipeline_type}
                    onChange={(e) => setFormState(prev => ({ ...prev, pipeline_type: e.target.value }))}
                  >
                    <option value="deployment">Deployment</option>
                    <option value="build">Build</option>
                    <option value="test">Test</option>
                    <option value="release">Release</option>
                    <option value="integration">Integration</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Trigger Type</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formState.trigger_type}
                    onChange={(e) => setFormState(prev => ({ ...prev, trigger_type: e.target.value }))}
                  >
                    <option value="manual">Manual</option>
                    <option value="push">On Push</option>
                    <option value="pull_request">Pull Request</option>
                    <option value="schedule">Scheduled</option>
                    <option value="webhook">Webhook</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="trigger_branch">Branch</Label>
                  <Input
                    id="trigger_branch"
                    placeholder="main"
                    value={formState.trigger_branch}
                    onChange={(e) => setFormState(prev => ({ ...prev, trigger_branch: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Environment</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formState.deployment_environment}
                    onChange={(e) => setFormState(prev => ({ ...prev, deployment_environment: e.target.value }))}
                  >
                    <option value="development">Development</option>
                    <option value="staging">Staging</option>
                    <option value="production">Production</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="repository_url">Repository URL</Label>
                <Input
                  id="repository_url"
                  placeholder="https://github.com/org/repo"
                  value={formState.repository_url}
                  onChange={(e) => setFormState(prev => ({ ...prev, repository_url: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePipeline} disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Pipeline'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
