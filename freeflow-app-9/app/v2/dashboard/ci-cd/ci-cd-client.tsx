'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { copyToClipboard, downloadAsJson } from '@/lib/button-handlers'
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
  GitMerge
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

// Database types for Supabase
interface DbPipeline {
  id: string
  user_id: string
  pipeline_name: string
  description: string | null
  pipeline_type: string
  config: Record<string, unknown>
  trigger_type: string
  trigger_branch: string | null
  status: string
  last_status: string | null
  is_running: boolean
  run_count: number
  success_count: number
  failure_count: number
  avg_duration_seconds: number | null
  last_run_at: string | null
  deployment_environment: string | null
  repository_url: string | null
  tags: string[] | null
  created_at: string
  updated_at: string
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

// Mock Data
const mockWorkflows: Workflow[] = [
  {
    id: 'w1',
    name: 'CI Pipeline',
    path: '.github/workflows/ci.yml',
    status: 'success',
    runs: 234,
    successRate: 94.2,
    avgDuration: 185,
    createdAt: '2024-01-01',
    updatedAt: '2024-03-12',
    lastRun: {
      id: 'r1',
      workflowId: 'w1',
      runNumber: 234,
      status: 'completed',
      conclusion: 'success',
      triggeredBy: 'Sarah Chen',
      triggerType: 'push',
      branch: 'main',
      commit: 'abc123f',
      commitMessage: 'fix: resolve authentication issue',
      jobs: [
        {
          id: 'j1',
          name: 'build',
          status: 'completed',
          runner: 'ubuntu-latest',
          duration: 45,
          startedAt: '2024-03-12T10:00:00Z',
          steps: [
            { id: 's1', name: 'Checkout', status: 'completed', duration: 2 },
            { id: 's2', name: 'Setup Node.js', status: 'completed', duration: 5 },
            { id: 's3', name: 'Install dependencies', status: 'completed', duration: 25 },
            { id: 's4', name: 'Build', status: 'completed', duration: 13 }
          ]
        },
        {
          id: 'j2',
          name: 'test',
          status: 'completed',
          runner: 'ubuntu-latest',
          duration: 120,
          startedAt: '2024-03-12T10:01:00Z',
          steps: [
            { id: 's1', name: 'Checkout', status: 'completed', duration: 2 },
            { id: 's2', name: 'Setup Node.js', status: 'completed', duration: 5 },
            { id: 's3', name: 'Install dependencies', status: 'completed', duration: 25 },
            { id: 's4', name: 'Run tests', status: 'completed', duration: 88 }
          ]
        },
        {
          id: 'j3',
          name: 'lint',
          status: 'completed',
          runner: 'ubuntu-latest',
          duration: 20,
          startedAt: '2024-03-12T10:01:00Z',
          steps: [
            { id: 's1', name: 'Checkout', status: 'completed', duration: 2 },
            { id: 's2', name: 'Setup Node.js', status: 'completed', duration: 5 },
            { id: 's3', name: 'Run linter', status: 'completed', duration: 13 }
          ]
        }
      ],
      duration: 185,
      startedAt: '2024-03-12T10:00:00Z',
      completedAt: '2024-03-12T10:03:05Z'
    }
  },
  {
    id: 'w2',
    name: 'Deploy to Production',
    path: '.github/workflows/deploy-prod.yml',
    status: 'success',
    runs: 89,
    successRate: 97.8,
    avgDuration: 312,
    createdAt: '2024-01-15',
    updatedAt: '2024-03-11'
  },
  {
    id: 'w3',
    name: 'Deploy to Staging',
    path: '.github/workflows/deploy-staging.yml',
    status: 'running',
    runs: 156,
    successRate: 91.2,
    avgDuration: 245,
    createdAt: '2024-01-15',
    updatedAt: '2024-03-12'
  },
  {
    id: 'w4',
    name: 'Nightly Tests',
    path: '.github/workflows/nightly.yml',
    status: 'failure',
    runs: 45,
    successRate: 82.2,
    avgDuration: 1800,
    createdAt: '2024-02-01',
    updatedAt: '2024-03-12'
  },
  {
    id: 'w5',
    name: 'Release Workflow',
    path: '.github/workflows/release.yml',
    status: 'success',
    runs: 23,
    successRate: 100,
    avgDuration: 420,
    createdAt: '2024-02-15',
    updatedAt: '2024-03-10'
  },
  {
    id: 'w6',
    name: 'Security Scan',
    path: '.github/workflows/security.yml',
    status: 'success',
    runs: 234,
    successRate: 98.7,
    avgDuration: 156,
    createdAt: '2024-01-01',
    updatedAt: '2024-03-12'
  }
]

const mockRuns: WorkflowRun[] = [
  {
    id: 'r1',
    workflowId: 'w1',
    runNumber: 234,
    status: 'completed',
    conclusion: 'success',
    triggeredBy: 'Sarah Chen',
    triggerType: 'push',
    branch: 'main',
    commit: 'abc123f',
    commitMessage: 'fix: resolve authentication issue',
    jobs: [],
    duration: 185,
    startedAt: '2024-03-12T10:00:00Z',
    completedAt: '2024-03-12T10:03:05Z'
  },
  {
    id: 'r2',
    workflowId: 'w3',
    runNumber: 156,
    status: 'in_progress',
    triggeredBy: 'Mike Johnson',
    triggerType: 'push',
    branch: 'feature/new-dashboard',
    commit: 'def456a',
    commitMessage: 'feat: add new dashboard components',
    jobs: [],
    duration: 120,
    startedAt: '2024-03-12T11:30:00Z'
  },
  {
    id: 'r3',
    workflowId: 'w4',
    runNumber: 45,
    status: 'failed',
    conclusion: 'failure',
    triggeredBy: 'Scheduled',
    triggerType: 'schedule',
    branch: 'main',
    commit: 'ghi789b',
    commitMessage: 'chore: nightly test run',
    jobs: [],
    duration: 1456,
    startedAt: '2024-03-12T02:00:00Z',
    completedAt: '2024-03-12T02:24:16Z'
  },
  {
    id: 'r4',
    workflowId: 'w1',
    runNumber: 233,
    status: 'completed',
    conclusion: 'success',
    triggeredBy: 'Alex Rivera',
    triggerType: 'pull_request',
    branch: 'fix/button-styles',
    commit: 'jkl012c',
    commitMessage: 'fix: button hover states',
    jobs: [],
    duration: 178,
    startedAt: '2024-03-12T09:00:00Z',
    completedAt: '2024-03-12T09:02:58Z'
  },
  {
    id: 'r5',
    workflowId: 'w2',
    runNumber: 89,
    status: 'completed',
    conclusion: 'success',
    triggeredBy: 'Sarah Chen',
    triggerType: 'workflow_dispatch',
    branch: 'main',
    commit: 'mno345d',
    commitMessage: 'release: v2.3.0',
    jobs: [],
    duration: 298,
    startedAt: '2024-03-11T15:00:00Z',
    completedAt: '2024-03-11T15:04:58Z'
  }
]

const mockArtifacts: Artifact[] = [
  { id: 'a1', name: 'build-artifacts', workflowId: 'w1', runNumber: 234, size: 45600000, expiresAt: '2024-03-19', createdAt: '2024-03-12' },
  { id: 'a2', name: 'test-reports', workflowId: 'w1', runNumber: 234, size: 2340000, expiresAt: '2024-03-19', createdAt: '2024-03-12' },
  { id: 'a3', name: 'coverage-report', workflowId: 'w1', runNumber: 234, size: 1890000, expiresAt: '2024-03-19', createdAt: '2024-03-12' },
  { id: 'a4', name: 'docker-image', workflowId: 'w2', runNumber: 89, size: 156000000, expiresAt: '2024-03-18', createdAt: '2024-03-11' },
  { id: 'a5', name: 'release-notes', workflowId: 'w5', runNumber: 23, size: 45000, expiresAt: '2024-03-17', createdAt: '2024-03-10' }
]

const mockEnvironments: EnvironmentConfig[] = [
  { id: 'e1', name: 'production', url: 'https://app.example.com', protection: true, reviewers: ['Sarah Chen', 'Mike Johnson'], secrets: 12, variables: 8, lastDeployment: '2024-03-11', status: 'active' },
  { id: 'e2', name: 'staging', url: 'https://staging.example.com', protection: true, reviewers: ['Alex Rivera'], secrets: 10, variables: 8, lastDeployment: '2024-03-12', status: 'active' },
  { id: 'e3', name: 'development', url: 'https://dev.example.com', protection: false, reviewers: [], secrets: 8, variables: 6, lastDeployment: '2024-03-12', status: 'active' },
  { id: 'e4', name: 'testing', protection: false, reviewers: [], secrets: 5, variables: 4, status: 'inactive' }
]

const mockSecrets: Secret[] = [
  { name: 'AWS_ACCESS_KEY_ID', createdAt: '2024-01-01', updatedAt: '2024-03-01', scope: 'repository' },
  { name: 'AWS_SECRET_ACCESS_KEY', createdAt: '2024-01-01', updatedAt: '2024-03-01', scope: 'repository' },
  { name: 'DATABASE_URL', createdAt: '2024-01-15', updatedAt: '2024-02-28', scope: 'environment', environment: 'production' },
  { name: 'STRIPE_SECRET_KEY', createdAt: '2024-02-01', updatedAt: '2024-02-01', scope: 'environment', environment: 'production' },
  { name: 'NPM_TOKEN', createdAt: '2024-01-01', updatedAt: '2024-01-01', scope: 'organization' },
  { name: 'DOCKER_PASSWORD', createdAt: '2024-01-01', updatedAt: '2024-03-05', scope: 'repository' }
]

const mockRunners: Runner[] = [
  { id: 'run1', name: 'ubuntu-runner-1', os: 'linux', status: 'online', labels: ['ubuntu-latest', 'self-hosted'], version: '2.311.0' },
  { id: 'run2', name: 'ubuntu-runner-2', os: 'linux', status: 'busy', labels: ['ubuntu-latest', 'self-hosted'], lastJob: 'Deploy to Staging #156', version: '2.311.0' },
  { id: 'run3', name: 'macos-runner-1', os: 'macos', status: 'online', labels: ['macos-latest', 'self-hosted'], version: '2.311.0' },
  { id: 'run4', name: 'windows-runner-1', os: 'windows', status: 'offline', labels: ['windows-latest', 'self-hosted'], version: '2.309.0' }
]

const mockUsage: UsageStats = {
  totalMinutes: 3000,
  usedMinutes: 2145,
  storageUsed: 4.2,
  storageLimit: 10,
  concurrentJobs: 2,
  maxConcurrentJobs: 20
}

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
const mockCiCdAIInsights = [
  { id: '1', type: 'success' as const, title: 'Build Time Improved', description: 'Average build time reduced 35% after caching optimization.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'warning' as const, title: 'Flaky Test Detected', description: 'test_user_auth fails intermittently. 4 failures in last 20 runs.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Testing' },
  { id: '3', type: 'info' as const, title: 'Deploy Frequency Up', description: 'Production deployments increased 40% this sprint.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Analytics' },
]

const mockCiCdCollaborators = [
  { id: '1', name: 'DevOps Lead', avatar: '/avatars/devops.jpg', status: 'online' as const, role: 'DevOps' },
  { id: '2', name: 'SRE', avatar: '/avatars/sre.jpg', status: 'online' as const, role: 'SRE' },
  { id: '3', name: 'Backend Dev', avatar: '/avatars/backend.jpg', status: 'away' as const, role: 'Engineering' },
]

const mockCiCdPredictions = [
  { id: '1', title: 'Build Queue', prediction: 'Peak build queue expected in 2 hours - consider scaling runners', confidence: 87, trend: 'up' as const, impact: 'medium' as const },
  { id: '2', title: 'Release Readiness', prediction: 'All tests passing - ready for production deploy', confidence: 96, trend: 'up' as const, impact: 'high' as const },
]

const mockCiCdActivities = [
  { id: '1', user: 'DevOps Lead', action: 'Deployed', target: 'v2.5.0 to production', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'SRE', action: 'Scaled', target: 'build runners to 10', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'Backend Dev', action: 'Fixed', target: 'flaky integration test', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'success' as const },
]

// Quick actions will be defined inside component to access state and handlers

export default function CiCdClient() {
  const supabase = createClient()

  // Core state
  const [activeTab, setActiveTab] = useState('workflows')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<WorkflowStatus | 'all'>('all')
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)
  const [selectedRun, setSelectedRun] = useState<WorkflowRun | null>(null)
  const [settingsTab, setSettingsTab] = useState('general')

  // Supabase data state
  const [dbPipelines, setDbPipelines] = useState<DbPipeline[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [formState, setFormState] = useState<PipelineFormState>(initialFormState)
  const [showLogsPanel, setShowLogsPanel] = useState(false)
  const [yamlEditorOpen, setYamlEditorOpen] = useState(false)

  // Dialog states for various actions
  const [showRunNewDialog, setShowRunNewDialog] = useState(false)
  const [showRerunAllDialog, setShowRerunAllDialog] = useState(false)
  const [showCancelAllDialog, setShowCancelAllDialog] = useState(false)
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [showRunLogsDialog, setShowRunLogsDialog] = useState(false)
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false)
  const [showUploadArtifactDialog, setShowUploadArtifactDialog] = useState(false)
  const [showDownloadAllDialog, setShowDownloadAllDialog] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [showCleanUpDialog, setShowCleanUpDialog] = useState(false)
  const [showArtifactFilterDialog, setShowArtifactFilterDialog] = useState(false)
  const [showPreviewArtifactDialog, setShowPreviewArtifactDialog] = useState(false)
  const [showCopyLinkDialog, setShowCopyLinkDialog] = useState(false)
  const [showNewEnvDialog, setShowNewEnvDialog] = useState(false)
  const [showAddSecretDialog, setShowAddSecretDialog] = useState(false)
  const [showVariablesDialog, setShowVariablesDialog] = useState(false)
  const [showProtectionDialog, setShowProtectionDialog] = useState(false)
  const [showReviewersDialog, setShowReviewersDialog] = useState(false)
  const [showDeployDialog, setShowDeployDialog] = useState(false)
  const [showEnvExportDialog, setShowEnvExportDialog] = useState(false)
  const [showEnvSyncDialog, setShowEnvSyncDialog] = useState(false)
  const [showEnvSettingsDialog, setShowEnvSettingsDialog] = useState(false)
  const [showSecretSettingsDialog, setShowSecretSettingsDialog] = useState(false)
  const [showDeleteSecretDialog, setShowDeleteSecretDialog] = useState(false)
  const [showAddRunnerDialog, setShowAddRunnerDialog] = useState(false)
  const [showConfigureRunnerDialog, setShowConfigureRunnerDialog] = useState(false)
  const [showLabelsDialog, setShowLabelsDialog] = useState(false)
  const [showRestartAllDialog, setShowRestartAllDialog] = useState(false)
  const [showPauseAllDialog, setShowPauseAllDialog] = useState(false)
  const [showRunnerLogsDialog, setShowRunnerLogsDialog] = useState(false)
  const [showRunnerExportDialog, setShowRunnerExportDialog] = useState(false)
  const [showRunnerCleanUpDialog, setShowRunnerCleanUpDialog] = useState(false)
  const [showRunnerSettingsDialog, setShowRunnerSettingsDialog] = useState(false)
  const [showExportLogsSettingsDialog, setShowExportLogsSettingsDialog] = useState(false)
  const [showArchiveOldRunsDialog, setShowArchiveOldRunsDialog] = useState(false)
  const [showResetStatsDialog, setShowResetStatsDialog] = useState(false)
  const [showPurgeArtifactsDialog, setShowPurgeArtifactsDialog] = useState(false)
  const [showDisableWorkflowsDialog, setShowDisableWorkflowsDialog] = useState(false)
  const [showDeleteAllArtifactsDialog, setShowDeleteAllArtifactsDialog] = useState(false)
  const [showClearCachesDialog, setShowClearCachesDialog] = useState(false)
  const [showTestWebhookDialog, setShowTestWebhookDialog] = useState(false)
  const [showMoreOptionsDialog, setShowMoreOptionsDialog] = useState(false)
  const [showWorkflowYamlDialog, setShowWorkflowYamlDialog] = useState(false)
  const [showWorkflowAnalyticsDialog, setShowWorkflowAnalyticsDialog] = useState(false)
  const [showWorkflowSettingsDialog, setShowWorkflowSettingsDialog] = useState(false)
  const [showDownloadArtifactDialog, setShowDownloadArtifactDialog] = useState(false)
  const [showDeleteArtifactDialog, setShowDeleteArtifactDialog] = useState(false)
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null)
  const [selectedEnvironment, setSelectedEnvironment] = useState<EnvironmentConfig | null>(null)
  const [selectedSecret, setSelectedSecret] = useState<Secret | null>(null)
  const [selectedRunner, setSelectedRunner] = useState<Runner | null>(null)

  // Ref for webhook secret
  const webhookSecretRef = useRef('whsec_' + Math.random().toString(36).substring(2, 15))

  // Fetch pipelines from Supabase
  const fetchPipelines = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('ci_cd')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDbPipelines(data || [])
    } catch (error) {
      console.error('Error fetching pipelines:', error)
      toast.error('Failed to load pipelines')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchPipelines()
  }, [fetchPipelines])

  // Create pipeline
  const handleCreatePipeline = async () => {
    if (!formState.pipeline_name.trim()) {
      toast.error('Pipeline name is required')
      return
    }

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to create pipelines')
        return
      }

      const { error } = await supabase.from('ci_cd').insert({
        user_id: user.id,
        pipeline_name: formState.pipeline_name,
        description: formState.description || null,
        pipeline_type: formState.pipeline_type,
        trigger_type: formState.trigger_type,
        trigger_branch: formState.trigger_branch || 'main',
        deployment_environment: formState.deployment_environment || null,
        repository_url: formState.repository_url || null,
        status: 'active',
        config: {},
        run_count: 0,
        success_count: 0,
        failure_count: 0,
      })

      if (error) throw error

      toast.success('Pipeline created successfully')
      setShowCreateDialog(false)
      setFormState(initialFormState)
      fetchPipelines()
    } catch (error) {
      console.error('Error creating pipeline:', error)
      toast.error('Failed to create pipeline')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Trigger/Run pipeline
  const handleTriggerPipeline = async (pipelineId: string, pipelineName: string) => {
    try {
      const { error } = await supabase
        .from('ci_cd')
        .update({
          is_running: true,
          last_run_at: new Date().toISOString(),
          run_count: dbPipelines.find(p => p.id === pipelineId)?.run_count ?? 0 + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', pipelineId)

      if (error) throw error

      toast.success(`Pipeline "${pipelineName}" triggered`, {
        description: 'Build started...'
      })
      fetchPipelines()
    } catch (error) {
      console.error('Error triggering pipeline:', error)
      toast.error('Failed to trigger pipeline')
    }
  }

  // Update pipeline status
  const handleUpdateStatus = async (pipelineId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('ci_cd')
        .update({
          status: newStatus,
          is_running: newStatus === 'running',
          updated_at: new Date().toISOString(),
        })
        .eq('id', pipelineId)

      if (error) throw error

      toast.success(`Pipeline status updated to ${newStatus}`)
      fetchPipelines()
    } catch (error) {
      console.error('Error updating pipeline:', error)
      toast.error('Failed to update pipeline status')
    }
  }

  // Delete pipeline
  const handleDeletePipeline = async (pipelineId: string) => {
    try {
      const { error } = await supabase
        .from('ci_cd')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', pipelineId)

      if (error) throw error

      toast.success('Pipeline deleted')
      fetchPipelines()
    } catch (error) {
      console.error('Error deleting pipeline:', error)
      toast.error('Failed to delete pipeline')
    }
  }

  // Calculate stats from DB data + mock data for display
  const stats: CiCdStats = useMemo(() => {
    const dbCount = dbPipelines.length
    const dbRunning = dbPipelines.filter(p => p.is_running).length
    const dbSuccess = dbPipelines.reduce((sum, p) => sum + (p.success_count || 0), 0)
    const dbFailed = dbPipelines.reduce((sum, p) => sum + (p.failure_count || 0), 0)
    const dbTotalRuns = dbPipelines.reduce((sum, p) => sum + (p.run_count || 0), 0)

    return {
      totalWorkflows: mockWorkflows.length + dbCount,
      activeWorkflows: mockWorkflows.filter(w => w.status === 'running').length + dbRunning,
      totalRuns: mockRuns.length + dbTotalRuns,
      successfulRuns: mockRuns.filter(r => r.conclusion === 'success').length + dbSuccess,
      failedRuns: mockRuns.filter(r => r.conclusion === 'failure').length + dbFailed,
      avgDuration: mockWorkflows.reduce((sum, w) => sum + w.avgDuration, 0) / mockWorkflows.length,
      successRate: mockWorkflows.reduce((sum, w) => sum + w.successRate, 0) / mockWorkflows.length,
      runningNow: mockRuns.filter(r => r.status === 'in_progress').length + dbRunning
    }
  }, [dbPipelines])

  // Filter workflows
  const filteredWorkflows = useMemo(() => {
    return mockWorkflows.filter(workflow => {
      const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workflow.path.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [searchQuery, statusFilter])

  // Mock workflow handlers (for demo workflows)
  const handleTriggerWorkflow = (workflow: Workflow) => {
    toast.info('Workflow triggered', {
      description: `Starting ${workflow.name}...`
    })
  }

  const handleCancelRun = (run: WorkflowRun) => {
    toast.success('Run cancelled', {
      description: `Workflow run #${run.runNumber} cancelled`
    })
  }

  const handleRerunWorkflow = (run: WorkflowRun) => {
    toast.info('Rerunning workflow', {
      description: `Restarting run #${run.runNumber}`
    })
  }

  // Real handler: Export logs as JSON file
  const handleExportLogs = () => {
    const logsData = {
      exportedAt: new Date().toISOString(),
      workflows: mockWorkflows.map(w => ({
        name: w.name,
        path: w.path,
        status: w.status,
        runs: w.runs,
        successRate: w.successRate,
        avgDuration: w.avgDuration
      })),
      runs: mockRuns.map(r => ({
        id: r.id,
        workflowId: r.workflowId,
        runNumber: r.runNumber,
        status: r.status,
        conclusion: r.conclusion,
        triggeredBy: r.triggeredBy,
        branch: r.branch,
        commit: r.commit,
        duration: r.duration,
        startedAt: r.startedAt
      })),
      dbPipelines: dbPipelines.map(p => ({
        id: p.id,
        name: p.pipeline_name,
        type: p.pipeline_type,
        status: p.status,
        runCount: p.run_count,
        successCount: p.success_count,
        failureCount: p.failure_count
      }))
    }
    downloadAsJson(logsData, `ci-cd-logs-${new Date().toISOString().split('T')[0]}.json`)
  }

  // Real handler: Run all pipelines
  const handleRunAllPipelines = async () => {
    const activePipelines = dbPipelines.filter(p => p.status === 'active' && !p.is_running)
    if (activePipelines.length === 0) {
      toast.info('No active pipelines to run')
      return
    }

    toast.loading(`Starting ${activePipelines.length} pipeline(s)...`)

    for (const pipeline of activePipelines) {
      await handleTriggerPipeline(pipeline.id, pipeline.pipeline_name)
    }

    toast.dismiss()
    toast.success(`${activePipelines.length} pipeline(s) started`)
  }

  // Real handler: Open YAML editor (toggle state)
  const handleEditYaml = () => {
    setYamlEditorOpen(true)
    toast.success('YAML editor opened', {
      description: 'You can now edit workflow configuration'
    })
  }

  // Real handler: Duplicate pipeline selection notice
  const handleDuplicatePipeline = () => {
    if (dbPipelines.length === 0) {
      toast.info('No pipelines to duplicate', {
        description: 'Create a pipeline first'
      })
    } else {
      toast.info('Select a pipeline to duplicate', {
        description: 'Click on a pipeline card to select it'
      })
    }
  }

  // Real handler: Export pipelines config
  const handleExportPipelines = () => {
    const pipelinesData = {
      exportedAt: new Date().toISOString(),
      pipelines: dbPipelines.map(p => ({
        name: p.pipeline_name,
        description: p.description,
        type: p.pipeline_type,
        triggerType: p.trigger_type,
        triggerBranch: p.trigger_branch,
        environment: p.deployment_environment,
        repositoryUrl: p.repository_url,
        config: p.config
      }))
    }
    downloadAsJson(pipelinesData, `pipelines-config-${new Date().toISOString().split('T')[0]}.json`)
  }

  // Real handler: Copy webhook secret
  const handleCopyWebhookSecret = () => {
    copyToClipboard(webhookSecretRef.current, 'Webhook secret copied to clipboard')
  }

  // Real handler: View logs panel
  const handleViewLogs = () => {
    setShowLogsPanel(true)
    setActiveTab('runs')
    toast.success('Logs panel opened')
  }

  // Quick actions with real functionality
  const ciCdQuickActions = [
    {
      id: '1',
      label: 'Run Pipeline',
      icon: 'play',
      action: () => {
        if (dbPipelines.length > 0) {
          const firstActive = dbPipelines.find(p => p.status === 'active' && !p.is_running)
          if (firstActive) {
            handleTriggerPipeline(firstActive.id, firstActive.pipeline_name)
          } else {
            toast.info('No active pipelines available to run')
          }
        } else {
          setShowCreateDialog(true)
          toast.info('Create a pipeline first')
        }
      },
      variant: 'default' as const
    },
    {
      id: '2',
      label: 'Deploy',
      icon: 'rocket',
      action: () => {
        const deployPipeline = dbPipelines.find(p => p.pipeline_type === 'deployment' && p.status === 'active')
        if (deployPipeline) {
          handleTriggerPipeline(deployPipeline.id, deployPipeline.pipeline_name)
          toast.success('Deployment initiated', {
            description: `Deploying via ${deployPipeline.pipeline_name}`
          })
        } else {
          toast.info('No deployment pipeline configured', {
            description: 'Create a deployment pipeline first'
          })
        }
      },
      variant: 'default' as const
    },
    {
      id: '3',
      label: 'View Logs',
      icon: 'terminal',
      action: handleViewLogs,
      variant: 'outline' as const
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:bg-none dark:bg-gray-900 p-8">
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
            <Button variant="outline" className="gap-2" onClick={handleExportLogs}>
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
              <p className="text-2xl font-bold">{mockWorkflows.reduce((sum, w) => sum + w.runs, 0)}</p>
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
              <p className="text-2xl font-bold">{mockRunners.filter(r => r.status !== 'offline').length}/{mockRunners.length}</p>
              <p className="text-xs text-cyan-600">Online</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-pink-600" />
                <span className="text-xs text-gray-500">Minutes Used</span>
              </div>
              <p className="text-2xl font-bold">{mockUsage.usedMinutes}</p>
              <p className="text-xs text-pink-600">of {mockUsage.totalMinutes}</p>
            </CardContent>
          </Card>
        </div>

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
                { icon: Play, label: 'Run All', color: 'text-green-500', onClick: handleRunAllPipelines },
                { icon: FileCode, label: 'Edit YAML', color: 'text-purple-500', onClick: handleEditYaml },
                { icon: Copy, label: 'Duplicate', color: 'text-amber-500', onClick: handleDuplicatePipeline },
                { icon: GitMerge, label: 'Branch Rules', color: 'text-pink-500', onClick: () => { setActiveTab('settings'); setSettingsTab('workflows'); toast.success('Branch rules settings opened') } },
                { icon: History, label: 'Run History', color: 'text-indigo-500', onClick: () => setActiveTab('runs') },
                { icon: Download, label: 'Export', color: 'text-cyan-500', onClick: handleExportPipelines },
                { icon: RefreshCw, label: 'Refresh', color: 'text-rose-500', onClick: async () => { await fetchPipelines(); toast.success('Pipelines refreshed') } },
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
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setShowMoreOptionsDialog(true) }}>
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Database Pipelines */}
              {dbPipelines.length > 0 && (
                <>
                  <div className="flex items-center gap-2 mt-6 mb-2">
                    <Database className="w-4 h-4 text-blue-600" />
                    <h4 className="text-sm font-semibold text-gray-600">Your Pipelines</h4>
                    <Badge variant="outline">{dbPipelines.length}</Badge>
                  </div>
                  {dbPipelines
                    .filter(pipeline => {
                      const matchesSearch = pipeline.pipeline_name.toLowerCase().includes(searchQuery.toLowerCase())
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
              {filteredWorkflows.length === 0 && dbPipelines.length === 0 && !loading && (
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
                      <p className="text-xl font-bold">{mockWorkflows.reduce((sum, w) => sum + w.runs, 0)}</p>
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
                { icon: Play, label: 'Run New', color: 'text-green-500', onClick: () => setShowRunNewDialog(true) },
                { icon: RotateCcw, label: 'Re-run All', color: 'text-blue-500', onClick: () => setShowRerunAllDialog(true) },
                { icon: StopCircle, label: 'Cancel All', color: 'text-red-500', onClick: () => setShowCancelAllDialog(true) },
                { icon: Filter, label: 'Filter', color: 'text-purple-500', onClick: () => setShowFilterDialog(true) },
                { icon: Terminal, label: 'View Logs', color: 'text-amber-500', onClick: () => setShowRunLogsDialog(true) },
                { icon: BarChart3, label: 'Analytics', color: 'text-pink-500', onClick: () => setShowAnalyticsDialog(true) },
                { icon: Download, label: 'Export', color: 'text-indigo-500', onClick: handleExportLogs },
                { icon: RefreshCw, label: 'Refresh', color: 'text-cyan-500', onClick: () => { fetchPipelines(); toast.success('Runs refreshed') } },
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

            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search runs..." className="pl-9" />
              </div>
              <select className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800">
                <option value="all">All Workflows</option>
                {mockWorkflows.map(w => (
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
              {mockRuns.map((run) => {
                const workflow = mockWorkflows.find(w => w.id === run.workflowId)
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
                      <p className="text-xl font-bold">{mockArtifacts.length}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-amber-100">Storage Used</p>
                      <p className="text-xl font-bold">{mockUsage.storageUsed}GB</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-amber-100">Storage Limit</p>
                      <p className="text-xl font-bold">{mockUsage.storageLimit}GB</p>
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
                { icon: Upload, label: 'Upload', color: 'text-amber-500', onClick: () => setShowUploadArtifactDialog(true) },
                { icon: Download, label: 'Download All', color: 'text-blue-500', onClick: () => setShowDownloadAllDialog(true) },
                { icon: Archive, label: 'Archive', color: 'text-purple-500', onClick: () => setShowArchiveDialog(true) },
                { icon: Trash2, label: 'Clean Up', color: 'text-red-500', onClick: () => setShowCleanUpDialog(true) },
                { icon: Filter, label: 'Filter', color: 'text-green-500', onClick: () => setShowArtifactFilterDialog(true) },
                { icon: Eye, label: 'Preview', color: 'text-pink-500', onClick: () => setShowPreviewArtifactDialog(true) },
                { icon: Copy, label: 'Copy Link', color: 'text-indigo-500', onClick: () => setShowCopyLinkDialog(true) },
                { icon: RefreshCw, label: 'Refresh', color: 'text-cyan-500', onClick: () => toast.success('Artifacts refreshed') },
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

            <div className="flex items-center justify-between mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search artifacts..." className="pl-9" />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <HardDrive className="w-4 h-4" />
                <span>Storage: {mockUsage.storageUsed}GB / {mockUsage.storageLimit}GB</span>
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
                      {mockArtifacts.map((artifact) => {
                        const workflow = mockWorkflows.find(w => w.id === artifact.workflowId)
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
                                <Button variant="ghost" size="sm" onClick={() => { setSelectedArtifact(artifact); setShowDownloadArtifactDialog(true) }}>
                                  <Download className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => { setSelectedArtifact(artifact); setShowDeleteArtifactDialog(true) }}>
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
                      <p className="text-xl font-bold">{mockEnvironments.length}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-cyan-100">Active</p>
                      <p className="text-xl font-bold">{mockEnvironments.filter(e => e.status === 'active').length}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-cyan-100">Secrets</p>
                      <p className="text-xl font-bold">{mockSecrets.length}</p>
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
                { icon: Plus, label: 'New Env', color: 'text-cyan-500', onClick: () => setShowNewEnvDialog(true) },
                { icon: Key, label: 'Add Secret', color: 'text-amber-500', onClick: () => setShowAddSecretDialog(true) },
                { icon: Code, label: 'Variables', color: 'text-purple-500', onClick: () => setShowVariablesDialog(true) },
                { icon: Shield, label: 'Protection', color: 'text-green-500', onClick: () => setShowProtectionDialog(true) },
                { icon: Users, label: 'Reviewers', color: 'text-pink-500', onClick: () => setShowReviewersDialog(true) },
                { icon: Rocket, label: 'Deploy', color: 'text-blue-500', onClick: () => setShowDeployDialog(true) },
                { icon: Download, label: 'Export', color: 'text-indigo-500', onClick: () => setShowEnvExportDialog(true) },
                { icon: RefreshCw, label: 'Sync', color: 'text-rose-500', onClick: () => setShowEnvSyncDialog(true) },
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

            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Deployment Environments</h3>
              <Button className="gap-2" onClick={() => setShowNewEnvDialog(true)}>
                <Plus className="w-4 h-4" />
                New Environment
              </Button>
            </div>

            <div className="grid gap-4">
              {mockEnvironments.map((env) => (
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
                        <Button variant="outline" size="sm" onClick={() => { setSelectedEnvironment(env); setShowEnvSettingsDialog(true) }}>
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
                <Button variant="outline" className="gap-2" onClick={() => setShowAddSecretDialog(true)}>
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
                        {mockSecrets.map((secret) => (
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
                                <Button variant="ghost" size="sm" onClick={() => { setSelectedSecret(secret); setShowSecretSettingsDialog(true) }}>
                                  <Settings className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => { setSelectedSecret(secret); setShowDeleteSecretDialog(true) }}>
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
                      <p className="text-xl font-bold">{mockRunners.length}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-purple-100">Online</p>
                      <p className="text-xl font-bold">{mockRunners.filter(r => r.status !== 'offline').length}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-sm text-purple-100">Busy</p>
                      <p className="text-xl font-bold">{mockRunners.filter(r => r.status === 'busy').length}</p>
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
                { icon: Plus, label: 'Add Runner', color: 'text-purple-500', onClick: () => setShowAddRunnerDialog(true) },
                { icon: Cpu, label: 'Configure', color: 'text-blue-500', onClick: () => setShowConfigureRunnerDialog(true) },
                { icon: Tag, label: 'Labels', color: 'text-amber-500', onClick: () => setShowLabelsDialog(true) },
                { icon: RefreshCw, label: 'Restart All', color: 'text-green-500', onClick: () => setShowRestartAllDialog(true) },
                { icon: Pause, label: 'Pause All', color: 'text-pink-500', onClick: () => setShowPauseAllDialog(true) },
                { icon: Terminal, label: 'View Logs', color: 'text-indigo-500', onClick: () => setShowRunnerLogsDialog(true) },
                { icon: Download, label: 'Export', color: 'text-cyan-500', onClick: () => setShowRunnerExportDialog(true) },
                { icon: Trash2, label: 'Clean Up', color: 'text-red-500', onClick: () => setShowRunnerCleanUpDialog(true) },
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

            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Self-Hosted Runners</h3>
              <Button className="gap-2" onClick={() => setShowAddRunnerDialog(true)}>
                <Plus className="w-4 h-4" />
                Add Runner
              </Button>
            </div>

            <div className="grid gap-4">
              {mockRunners.map((runner) => (
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
                        <Button variant="outline" size="sm" onClick={() => { setSelectedRunner(runner); setShowRunnerSettingsDialog(true) }}>
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
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Minutes Used</p>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold">{mockUsage.usedMinutes}</span>
                      <span className="text-gray-500 mb-1">/ {mockUsage.totalMinutes}</span>
                    </div>
                    <Progress value={(mockUsage.usedMinutes / mockUsage.totalMinutes) * 100} className="mt-2" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Storage Used</p>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold">{mockUsage.storageUsed}GB</span>
                      <span className="text-gray-500 mb-1">/ {mockUsage.storageLimit}GB</span>
                    </div>
                    <Progress value={(mockUsage.storageUsed / mockUsage.storageLimit) * 100} className="mt-2" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Concurrent Jobs</p>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold">{mockUsage.concurrentJobs}</span>
                      <span className="text-gray-500 mb-1">/ {mockUsage.maxConcurrentJobs} max</span>
                    </div>
                    <Progress value={(mockUsage.concurrentJobs / mockUsage.maxConcurrentJobs) * 100} className="mt-2" />
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
                        <div className="grid grid-cols-2 gap-4">
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
                        <Button variant="outline" className="w-full gap-2" onClick={() => setShowClearCachesDialog(true)}>
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
                        <div className="grid grid-cols-2 gap-4">
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
                        <div className="grid grid-cols-2 gap-4">
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
                              <Button
                                variant={integration.connected ? "secondary" : "outline"}
                                size="sm"
                                onClick={() => {
                                  if (integration.connected) {
                                    toast.info(`${integration.name} integration settings`, { description: 'Click to manage your integration' })
                                  } else {
                                    toast.success(`Connecting to ${integration.name}...`, { description: 'Please follow the OAuth flow' })
                                  }
                                }}
                              >
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
                            <Input placeholder="https://your-app.com/webhook/ci-cd" />
                            <Button variant="outline" onClick={() => setShowTestWebhookDialog(true)}>Test</Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Webhook Secret</Label>
                          <div className="flex gap-2">
                            <Input type="password" value={webhookSecretRef.current} readOnly className="font-mono" />
                            <Button variant="outline" onClick={handleCopyWebhookSecret}><Copy className="w-4 h-4" /></Button>
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
                        <div className="grid grid-cols-2 gap-4">
                          <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={() => setShowExportLogsSettingsDialog(true)}>
                            <Download className="w-5 h-5" />
                            <span>Export Logs</span>
                          </Button>
                          <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={() => setShowArchiveOldRunsDialog(true)}>
                            <Archive className="w-5 h-5" />
                            <span>Archive Old Runs</span>
                          </Button>
                          <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2" onClick={() => setShowResetStatsDialog(true)}>
                            <RefreshCw className="w-5 h-5" />
                            <span>Reset Statistics</span>
                          </Button>
                          <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 text-red-500 hover:text-red-600" onClick={() => setShowPurgeArtifactsDialog(true)}>
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
                          <Button variant="destructive" size="sm" onClick={() => setShowDisableWorkflowsDialog(true)}>Disable</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                          <div>
                            <p className="font-medium text-red-700 dark:text-red-400">Delete All Artifacts</p>
                            <p className="text-sm text-red-600 dark:text-red-500">Remove all stored artifacts</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => setShowDeleteAllArtifactsDialog(true)}>Delete</Button>
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
              insights={mockCiCdAIInsights}
              title="Pipeline Intelligence"
              onInsightAction={(_insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockCiCdCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockCiCdPredictions}
              title="Build Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockCiCdActivities}
            title="Pipeline Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={ciCdQuickActions}
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
                <div className="grid grid-cols-4 gap-4">
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
                  <Button className="gap-2" onClick={() => { if (selectedWorkflow) handleTriggerWorkflow(selectedWorkflow) }}>
                    <Play className="w-4 h-4" />
                    Run Workflow
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={() => setShowWorkflowYamlDialog(true)}>
                    <FileText className="w-4 h-4" />
                    View YAML
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={() => setShowWorkflowAnalyticsDialog(true)}>
                    <BarChart3 className="w-4 h-4" />
                    View Analytics
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={() => setShowWorkflowSettingsDialog(true)}>
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

                <div className="grid grid-cols-3 gap-4">
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
              <div className="grid grid-cols-2 gap-4">
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
              <div className="grid grid-cols-2 gap-4">
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

        {/* Run New Dialog */}
        <Dialog open={showRunNewDialog} onOpenChange={setShowRunNewDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-green-600" />
                Run New Workflow
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Select Workflow</Label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                  {mockWorkflows.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Branch</Label>
                <Input placeholder="main" defaultValue="main" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowRunNewDialog(false)}>Cancel</Button>
                <Button onClick={() => { toast.success('Workflow started'); setShowRunNewDialog(false) }}>Run Workflow</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Re-run All Dialog */}
        <Dialog open={showRerunAllDialog} onOpenChange={setShowRerunAllDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-blue-600" />
                Re-run All Failed Workflows
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                This will re-run all failed workflow runs from the last 24 hours. Are you sure you want to continue?
              </p>
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  {mockRuns.filter(r => r.conclusion === 'failure').length} failed run(s) will be re-triggered.
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowRerunAllDialog(false)}>Cancel</Button>
                <Button onClick={() => { toast.success('Re-running all failed workflows'); setShowRerunAllDialog(false) }}>Re-run All</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Cancel All Dialog */}
        <Dialog open={showCancelAllDialog} onOpenChange={setShowCancelAllDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <StopCircle className="w-5 h-5 text-red-600" />
                Cancel All Running Workflows
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                This will cancel all currently running workflow runs. This action cannot be undone.
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-400">
                  {mockRuns.filter(r => r.status === 'in_progress').length} running workflow(s) will be cancelled.
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowCancelAllDialog(false)}>Cancel</Button>
                <Button variant="destructive" onClick={() => { toast.success('All running workflows cancelled'); setShowCancelAllDialog(false) }}>Cancel All</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Filter Dialog */}
        <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-purple-600" />
                Filter Runs
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Trigger Type</Label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                  <option value="all">All Triggers</option>
                  <option value="push">Push</option>
                  <option value="pull_request">Pull Request</option>
                  <option value="schedule">Schedule</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Branch</Label>
                <Input placeholder="Filter by branch..." />
              </div>
              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="date" />
                  <Input type="date" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowFilterDialog(false)}>Reset</Button>
                <Button onClick={() => { toast.success('Filters applied'); setShowFilterDialog(false) }}>Apply Filters</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Run Logs Dialog */}
        <Dialog open={showRunLogsDialog} onOpenChange={setShowRunLogsDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-amber-600" />
                Workflow Logs
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm h-80 overflow-y-auto">
                <p className="text-green-400">[2024-03-12 10:00:00] Starting workflow...</p>
                <p className="text-gray-400">[2024-03-12 10:00:01] Checking out repository...</p>
                <p className="text-gray-400">[2024-03-12 10:00:05] Setting up Node.js 18.x...</p>
                <p className="text-gray-400">[2024-03-12 10:00:10] Installing dependencies...</p>
                <p className="text-gray-400">[2024-03-12 10:00:35] Running build...</p>
                <p className="text-green-400">[2024-03-12 10:00:48] Build completed successfully</p>
                <p className="text-gray-400">[2024-03-12 10:00:49] Running tests...</p>
                <p className="text-green-400">[2024-03-12 10:02:15] All tests passed (125 tests)</p>
                <p className="text-green-400">[2024-03-12 10:02:16] Workflow completed successfully</p>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleExportLogs}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Logs
                </Button>
                <Button variant="outline" onClick={() => setShowRunLogsDialog(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Analytics Dialog */}
        <Dialog open={showAnalyticsDialog} onOpenChange={setShowAnalyticsDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-pink-600" />
                CI/CD Analytics
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-3xl font-bold text-green-600">{stats.successRate.toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-3xl font-bold text-blue-600">{formatDuration(Math.round(stats.avgDuration))}</p>
                  <p className="text-sm text-muted-foreground">Avg Duration</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-3xl font-bold text-purple-600">{mockWorkflows.reduce((sum, w) => sum + w.runs, 0)}</p>
                  <p className="text-sm text-muted-foreground">Total Runs</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-semibold mb-4">Run Trends (Last 7 Days)</h4>
                <div className="h-40 flex items-end justify-around gap-2">
                  {[65, 80, 45, 90, 75, 85, 70].map((height, i) => (
                    <div key={i} className="w-full">
                      <div className="bg-blue-500 rounded-t" style={{ height: `${height}%` }} />
                      <p className="text-xs text-center mt-1 text-muted-foreground">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowAnalyticsDialog(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Upload Artifact Dialog */}
        <Dialog open={showUploadArtifactDialog} onOpenChange={setShowUploadArtifactDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-amber-600" />
                Upload Artifact
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-muted-foreground mb-2">Drag and drop files here, or click to browse</p>
                <Input type="file" className="hidden" id="artifact-upload" />
                <Button variant="outline" onClick={() => document.getElementById('artifact-upload')?.click()}>
                  Select Files
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Artifact Name</Label>
                <Input placeholder="e.g., build-output" />
              </div>
              <div className="space-y-2">
                <Label>Retention (days)</Label>
                <Input type="number" defaultValue={7} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowUploadArtifactDialog(false)}>Cancel</Button>
                <Button onClick={() => { toast.success('Artifact uploaded'); setShowUploadArtifactDialog(false) }}>Upload</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Download All Artifacts Dialog */}
        <Dialog open={showDownloadAllDialog} onOpenChange={setShowDownloadAllDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-600" />
                Download All Artifacts
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                Download all artifacts as a ZIP file. Total size: {formatBytes(mockArtifacts.reduce((sum, a) => sum + a.size, 0))}
              </p>
              <div className="space-y-2">
                {mockArtifacts.map(artifact => (
                  <div key={artifact.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-sm">{artifact.name}</span>
                    <span className="text-xs text-muted-foreground">{formatBytes(artifact.size)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowDownloadAllDialog(false)}>Cancel</Button>
                <Button onClick={() => { toast.success('Downloading all artifacts'); setShowDownloadAllDialog(false) }}>Download All</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Archive Dialog */}
        <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Archive className="w-5 h-5 text-purple-600" />
                Archive Artifacts
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                Archive artifacts older than the specified age to cold storage.
              </p>
              <div className="space-y-2">
                <Label>Archive artifacts older than</Label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowArchiveDialog(false)}>Cancel</Button>
                <Button onClick={() => { toast.success('Artifacts archived'); setShowArchiveDialog(false) }}>Archive</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Clean Up Dialog */}
        <Dialog open={showCleanUpDialog} onOpenChange={setShowCleanUpDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-600" />
                Clean Up Artifacts
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                Delete expired or old artifacts to free up storage space.
              </p>
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  This will permanently delete the selected artifacts. This action cannot be undone.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Delete artifacts</Label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                  <option value="expired">Expired only</option>
                  <option value="30">Older than 30 days</option>
                  <option value="90">Older than 90 days</option>
                  <option value="all">All artifacts</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowCleanUpDialog(false)}>Cancel</Button>
                <Button variant="destructive" onClick={() => { toast.success('Artifacts cleaned up'); setShowCleanUpDialog(false) }}>Clean Up</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Artifact Filter Dialog */}
        <Dialog open={showArtifactFilterDialog} onOpenChange={setShowArtifactFilterDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-green-600" />
                Filter Artifacts
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Workflow</Label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                  <option value="all">All Workflows</option>
                  {mockWorkflows.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Size Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Min size (MB)" type="number" />
                  <Input placeholder="Max size (MB)" type="number" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowArtifactFilterDialog(false)}>Reset</Button>
                <Button onClick={() => { toast.success('Filters applied'); setShowArtifactFilterDialog(false) }}>Apply</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Preview Artifact Dialog */}
        <Dialog open={showPreviewArtifactDialog} onOpenChange={setShowPreviewArtifactDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-pink-600" />
                Preview Artifact
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                Select an artifact to preview its contents.
              </p>
              <div className="space-y-2">
                <Label>Select Artifact</Label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                  {mockArtifacts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({formatBytes(a.size)})</option>
                  ))}
                </select>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Artifact preview will appear here...</p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowPreviewArtifactDialog(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Copy Link Dialog */}
        <Dialog open={showCopyLinkDialog} onOpenChange={setShowCopyLinkDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Copy className="w-5 h-5 text-indigo-600" />
                Copy Artifact Link
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Select Artifact</Label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                  {mockArtifacts.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Download Link</Label>
                <div className="flex gap-2">
                  <Input readOnly value="https://api.example.com/artifacts/build-artifacts/download" />
                  <Button variant="outline" onClick={() => { copyToClipboard('https://api.example.com/artifacts/build-artifacts/download', 'Link copied'); setShowCopyLinkDialog(false) }}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowCopyLinkDialog(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* New Environment Dialog */}
        <Dialog open={showNewEnvDialog} onOpenChange={setShowNewEnvDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-600" />
                Create New Environment
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Environment Name</Label>
                <Input placeholder="e.g., staging-2" />
              </div>
              <div className="space-y-2">
                <Label>Environment URL</Label>
                <Input placeholder="https://staging-2.example.com" />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium">Require Approval</p>
                  <p className="text-sm text-muted-foreground">Deployments require manual approval</p>
                </div>
                <Switch />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowNewEnvDialog(false)}>Cancel</Button>
                <Button onClick={() => { toast.success('Environment created'); setShowNewEnvDialog(false) }}>Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Secret Dialog */}
        <Dialog open={showAddSecretDialog} onOpenChange={setShowAddSecretDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-600" />
                Add New Secret
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Secret Name</Label>
                <Input placeholder="e.g., API_SECRET_KEY" />
              </div>
              <div className="space-y-2">
                <Label>Secret Value</Label>
                <Input type="password" placeholder="Enter secret value" />
              </div>
              <div className="space-y-2">
                <Label>Scope</Label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                  <option value="repository">Repository</option>
                  <option value="environment">Environment</option>
                  <option value="organization">Organization</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowAddSecretDialog(false)}>Cancel</Button>
                <Button onClick={() => { toast.success('Secret added'); setShowAddSecretDialog(false) }}>Add Secret</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Variables Dialog */}
        <Dialog open={showVariablesDialog} onOpenChange={setShowVariablesDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Code className="w-5 h-5 text-purple-600" />
                Environment Variables
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Variable Name</Label>
                <Input placeholder="e.g., NODE_ENV" />
              </div>
              <div className="space-y-2">
                <Label>Variable Value</Label>
                <Input placeholder="e.g., production" />
              </div>
              <div className="space-y-2">
                <Label>Environment</Label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                  {mockEnvironments.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowVariablesDialog(false)}>Cancel</Button>
                <Button onClick={() => { toast.success('Variable added'); setShowVariablesDialog(false) }}>Add Variable</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Protection Dialog */}
        <Dialog open={showProtectionDialog} onOpenChange={setShowProtectionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                Environment Protection
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Select Environment</Label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                  {mockEnvironments.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">Required Reviewers</p>
                    <p className="text-sm text-muted-foreground">Require approvals before deployments</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">Wait Timer</p>
                    <p className="text-sm text-muted-foreground">Add delay before deployments</p>
                  </div>
                  <Switch />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowProtectionDialog(false)}>Cancel</Button>
                <Button onClick={() => { toast.success('Protection settings updated'); setShowProtectionDialog(false) }}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reviewers Dialog */}
        <Dialog open={showReviewersDialog} onOpenChange={setShowReviewersDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-pink-600" />
                Manage Reviewers
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Select Environment</Label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                  {mockEnvironments.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Add Reviewer</Label>
                <div className="flex gap-2">
                  <Input placeholder="Username or email" />
                  <Button onClick={() => { /* TODO: Implement add reviewer functionality */ }}>Add</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Current Reviewers</Label>
                <div className="space-y-2">
                  {['Sarah Chen', 'Mike Johnson'].map(name => (
                    <div key={name} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span className="text-sm">{name}</span>
                      <Button variant="ghost" size="sm" onClick={() => { if (confirm(`Remove ${name} from reviewers?`)) { /* TODO: Implement remove reviewer functionality */ } }}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowReviewersDialog(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Deploy Dialog */}
        <Dialog open={showDeployDialog} onOpenChange={setShowDeployDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-blue-600" />
                Deploy to Environment
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Target Environment</Label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                  {mockEnvironments.filter(e => e.status === 'active').map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Branch/Tag</Label>
                <Input placeholder="main" defaultValue="main" />
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  This deployment may require approval from reviewers.
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowDeployDialog(false)}>Cancel</Button>
                <Button onClick={() => { toast.success('Deployment initiated'); setShowDeployDialog(false) }}>Deploy</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Environment Export Dialog */}
        <Dialog open={showEnvExportDialog} onOpenChange={setShowEnvExportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-indigo-600" />
                Export Environment Config
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Select Environments</Label>
                {mockEnvironments.map(e => (
                  <div key={e.id} className="flex items-center gap-2">
                    <input type="checkbox" id={e.id} defaultChecked />
                    <label htmlFor={e.id} className="text-sm">{e.name}</label>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Label>Export Format</Label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                  <option value="json">JSON</option>
                  <option value="yaml">YAML</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowEnvExportDialog(false)}>Cancel</Button>
                <Button onClick={() => { toast.success('Configuration exported'); setShowEnvExportDialog(false) }}>Export</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Environment Sync Dialog */}
        <Dialog open={showEnvSyncDialog} onOpenChange={setShowEnvSyncDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-rose-600" />
                Sync Environments
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                Sync variables and settings between environments.
              </p>
              <div className="space-y-2">
                <Label>Source Environment</Label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                  {mockEnvironments.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Target Environment</Label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                  {mockEnvironments.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowEnvSyncDialog(false)}>Cancel</Button>
                <Button onClick={() => { toast.success('Environments synced'); setShowEnvSyncDialog(false) }}>Sync</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Environment Settings Dialog */}
        <Dialog open={showEnvSettingsDialog} onOpenChange={setShowEnvSettingsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-600" />
                Environment Settings - {selectedEnvironment?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Environment URL</Label>
                <Input defaultValue={selectedEnvironment?.url || ''} />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium">Protection Enabled</p>
                  <p className="text-sm text-muted-foreground">Require approvals for deployments</p>
                </div>
                <Switch defaultChecked={selectedEnvironment?.protection} />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium">Environment Status</p>
                  <p className="text-sm text-muted-foreground">Enable or disable this environment</p>
                </div>
                <Switch defaultChecked={selectedEnvironment?.status === 'active'} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowEnvSettingsDialog(false)}>Cancel</Button>
                <Button onClick={() => { toast.success('Settings saved'); setShowEnvSettingsDialog(false) }}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Secret Settings Dialog */}
        <Dialog open={showSecretSettingsDialog} onOpenChange={setShowSecretSettingsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-600" />
                Edit Secret - {selectedSecret?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Secret Value</Label>
                <Input type="password" placeholder="Enter new value to update" />
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Scope: {selectedSecret?.scope}</p>
                <p>Last updated: {selectedSecret?.updatedAt}</p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowSecretSettingsDialog(false)}>Cancel</Button>
                <Button onClick={() => { toast.success('Secret updated'); setShowSecretSettingsDialog(false) }}>Update</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Secret Dialog */}
        <Dialog open={showDeleteSecretDialog} onOpenChange={setShowDeleteSecretDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-600" />
                Delete Secret
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete the secret <strong>{selectedSecret?.name}</strong>? This action cannot be undone.
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-400">
                  Workflows using this secret will fail until a new secret is configured.
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowDeleteSecretDialog(false)}>Cancel</Button>
                <Button variant="destructive" onClick={() => { toast.success('Secret deleted'); setShowDeleteSecretDialog(false) }}>Delete</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Runner Dialog */}
        <Dialog open={showAddRunnerDialog} onOpenChange={setShowAddRunnerDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-600" />
                Add Self-Hosted Runner
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Runner Name</Label>
                <Input placeholder="e.g., my-runner-1" />
              </div>
              <div className="space-y-2">
                <Label>Operating System</Label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                  <option value="linux">Linux</option>
                  <option value="windows">Windows</option>
                  <option value="macos">macOS</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Labels (comma separated)</Label>
                <Input placeholder="e.g., self-hosted, docker" />
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Registration Token</p>
                <code className="text-xs bg-gray-200 dark:bg-gray-700 p-2 rounded block">RUNNER_TOKEN_XXXXXX</code>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowAddRunnerDialog(false)}>Cancel</Button>
                <Button onClick={() => { toast.success('Runner added'); setShowAddRunnerDialog(false) }}>Add Runner</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Configure Runner Dialog */}
        <Dialog open={showConfigureRunnerDialog} onOpenChange={setShowConfigureRunnerDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-600" />
                Configure Runners
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Default Runner Group</Label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                  <option value="default">Default</option>
                  <option value="self-hosted">Self-Hosted</option>
                  <option value="gpu">GPU Runners</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Concurrency Limit</Label>
                <Input type="number" defaultValue={20} />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium">Auto-scale</p>
                  <p className="text-sm text-muted-foreground">Automatically scale runners based on demand</p>
                </div>
                <Switch />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowConfigureRunnerDialog(false)}>Cancel</Button>
                <Button onClick={() => { toast.success('Configuration saved'); setShowConfigureRunnerDialog(false) }}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Labels Dialog */}
        <Dialog open={showLabelsDialog} onOpenChange={setShowLabelsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-600" />
                Manage Runner Labels
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Add New Label</Label>
                <div className="flex gap-2">
                  <Input placeholder="e.g., docker, gpu" />
                  <Button onClick={() => { /* TODO: Implement add label functionality */ }}>Add</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Current Labels</Label>
                <div className="flex flex-wrap gap-2">
                  {['ubuntu-latest', 'self-hosted', 'docker', 'gpu'].map(label => (
                    <Badge key={label} variant="secondary" className="gap-1">
                      {label}
                      <button className="ml-1 hover:text-red-500" onClick={() => { if (confirm(`Remove label "${label}"?`)) { /* TODO: Implement remove label functionality */ } }}>x</button>
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowLabelsDialog(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Restart All Runners Dialog */}
        <Dialog open={showRestartAllDialog} onOpenChange={setShowRestartAllDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-green-600" />
                Restart All Runners
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                This will restart all online runners. Running jobs will be cancelled.
              </p>
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  {mockRunners.filter(r => r.status !== 'offline').length} runner(s) will be restarted.
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowRestartAllDialog(false)}>Cancel</Button>
                <Button onClick={() => { toast.success('Runners restarting'); setShowRestartAllDialog(false) }}>Restart All</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Pause All Runners Dialog */}
        <Dialog open={showPauseAllDialog} onOpenChange={setShowPauseAllDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pause className="w-5 h-5 text-pink-600" />
                Pause All Runners
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                Paused runners will not accept new jobs. Running jobs will complete.
              </p>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowPauseAllDialog(false)}>Cancel</Button>
                <Button onClick={() => { toast.success('Runners paused'); setShowPauseAllDialog(false) }}>Pause All</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Runner Logs Dialog */}
        <Dialog open={showRunnerLogsDialog} onOpenChange={setShowRunnerLogsDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-indigo-600" />
                Runner Logs
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Select Runner</Label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                  {mockRunners.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm h-60 overflow-y-auto">
                <p className="text-green-400">[INFO] Runner online</p>
                <p className="text-gray-400">[INFO] Waiting for jobs...</p>
                <p className="text-blue-400">[INFO] Job received: CI Pipeline #234</p>
                <p className="text-gray-400">[INFO] Executing job...</p>
                <p className="text-green-400">[INFO] Job completed successfully</p>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowRunnerLogsDialog(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Runner Export Dialog */}
        <Dialog open={showRunnerExportDialog} onOpenChange={setShowRunnerExportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-cyan-600" />
                Export Runner Configuration
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                Export runner configuration for backup or migration.
              </p>
              <div className="space-y-2">
                <Label>Format</Label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                  <option value="json">JSON</option>
                  <option value="yaml">YAML</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowRunnerExportDialog(false)}>Cancel</Button>
                <Button onClick={() => { toast.success('Configuration exported'); setShowRunnerExportDialog(false) }}>Export</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Runner Clean Up Dialog */}
        <Dialog open={showRunnerCleanUpDialog} onOpenChange={setShowRunnerCleanUpDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-600" />
                Clean Up Runners
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                Remove offline or stale runners from the runner pool.
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-400">
                  {mockRunners.filter(r => r.status === 'offline').length} offline runner(s) will be removed.
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowRunnerCleanUpDialog(false)}>Cancel</Button>
                <Button variant="destructive" onClick={() => { toast.success('Runners cleaned up'); setShowRunnerCleanUpDialog(false) }}>Clean Up</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Runner Settings Dialog */}
        <Dialog open={showRunnerSettingsDialog} onOpenChange={setShowRunnerSettingsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-600" />
                Runner Settings - {selectedRunner?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Runner Name</Label>
                <Input defaultValue={selectedRunner?.name} />
              </div>
              <div className="space-y-2">
                <Label>Labels</Label>
                <Input defaultValue={selectedRunner?.labels.join(', ')} />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium">Accept Jobs</p>
                  <p className="text-sm text-muted-foreground">Allow this runner to accept new jobs</p>
                </div>
                <Switch defaultChecked={selectedRunner?.status !== 'offline'} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowRunnerSettingsDialog(false)}>Cancel</Button>
                <Button onClick={() => { toast.success('Settings saved'); setShowRunnerSettingsDialog(false) }}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Export Logs Settings Dialog */}
        <Dialog open={showExportLogsSettingsDialog} onOpenChange={setShowExportLogsSettingsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-600" />
                Export Logs
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="date" />
                  <Input type="date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Log Level</Label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                  <option value="all">All Levels</option>
                  <option value="error">Errors Only</option>
                  <option value="warn">Warnings and Errors</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowExportLogsSettingsDialog(false)}>Cancel</Button>
                <Button onClick={() => { handleExportLogs(); setShowExportLogsSettingsDialog(false) }}>Export</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Archive Old Runs Dialog */}
        <Dialog open={showArchiveOldRunsDialog} onOpenChange={setShowArchiveOldRunsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Archive className="w-5 h-5 text-purple-600" />
                Archive Old Runs
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                Archive workflow runs older than the specified age.
              </p>
              <div className="space-y-2">
                <Label>Archive runs older than</Label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowArchiveOldRunsDialog(false)}>Cancel</Button>
                <Button onClick={() => { toast.success('Old runs archived'); setShowArchiveOldRunsDialog(false) }}>Archive</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reset Stats Dialog */}
        <Dialog open={showResetStatsDialog} onOpenChange={setShowResetStatsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-amber-600" />
                Reset Statistics
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                This will reset all CI/CD statistics. This action cannot be undone.
              </p>
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  All historical metrics will be cleared.
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowResetStatsDialog(false)}>Cancel</Button>
                <Button variant="destructive" onClick={() => { toast.success('Statistics reset'); setShowResetStatsDialog(false) }}>Reset</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Purge Artifacts Dialog */}
        <Dialog open={showPurgeArtifactsDialog} onOpenChange={setShowPurgeArtifactsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-600" />
                Purge Artifacts
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                Permanently delete all artifacts to free up storage space.
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-400">
                  {formatBytes(mockArtifacts.reduce((sum, a) => sum + a.size, 0))} of storage will be freed. This cannot be undone.
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowPurgeArtifactsDialog(false)}>Cancel</Button>
                <Button variant="destructive" onClick={() => { toast.success('Artifacts purged'); setShowPurgeArtifactsDialog(false) }}>Purge All</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Disable Workflows Dialog */}
        <Dialog open={showDisableWorkflowsDialog} onOpenChange={setShowDisableWorkflowsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Disable All Workflows
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                This will temporarily pause all workflow execution. No new runs will be triggered.
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-400">
                  {mockWorkflows.length} workflow(s) will be disabled.
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowDisableWorkflowsDialog(false)}>Cancel</Button>
                <Button variant="destructive" onClick={() => { toast.success('All workflows disabled'); setShowDisableWorkflowsDialog(false) }}>Disable All</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete All Artifacts Dialog */}
        <Dialog open={showDeleteAllArtifactsDialog} onOpenChange={setShowDeleteAllArtifactsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-600" />
                Delete All Artifacts
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                Permanently delete all stored artifacts. This action cannot be undone.
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-400">
                  {mockArtifacts.length} artifact(s) totaling {formatBytes(mockArtifacts.reduce((sum, a) => sum + a.size, 0))} will be deleted.
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowDeleteAllArtifactsDialog(false)}>Cancel</Button>
                <Button variant="destructive" onClick={() => { toast.success('All artifacts deleted'); setShowDeleteAllArtifactsDialog(false) }}>Delete All</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Clear Caches Dialog */}
        <Dialog open={showClearCachesDialog} onOpenChange={setShowClearCachesDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-600" />
                Clear All Caches
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                This will delete all cached data. Future builds may take longer.
              </p>
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  4.2GB of cache data will be cleared.
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowClearCachesDialog(false)}>Cancel</Button>
                <Button variant="destructive" onClick={() => { toast.success('Caches cleared'); setShowClearCachesDialog(false) }}>Clear All</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Test Webhook Dialog */}
        <Dialog open={showTestWebhookDialog} onOpenChange={setShowTestWebhookDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Webhook className="w-5 h-5 text-blue-600" />
                Test Webhook
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                Send a test payload to verify your webhook configuration.
              </p>
              <div className="space-y-2">
                <Label>Event Type</Label>
                <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
                  <option value="workflow_run">Workflow Run</option>
                  <option value="deployment">Deployment</option>
                  <option value="push">Push</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowTestWebhookDialog(false)}>Cancel</Button>
                <Button onClick={() => { toast.success('Test webhook sent successfully'); setShowTestWebhookDialog(false) }}>Send Test</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* More Options Dialog */}
        <Dialog open={showMoreOptionsDialog} onOpenChange={setShowMoreOptionsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MoreHorizontal className="w-5 h-5 text-gray-600" />
                Workflow Options
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 pt-4">
              <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => { setShowMoreOptionsDialog(false); setShowWorkflowYamlDialog(true) }}>
                <FileText className="w-4 h-4" />
                View YAML Configuration
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => { setShowMoreOptionsDialog(false); setShowWorkflowAnalyticsDialog(true) }}>
                <BarChart3 className="w-4 h-4" />
                View Analytics
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => { setShowMoreOptionsDialog(false); setShowWorkflowSettingsDialog(true) }}>
                <Settings className="w-4 h-4" />
                Workflow Settings
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => { handleExportLogs(); setShowMoreOptionsDialog(false) }}>
                <Download className="w-4 h-4" />
                Export History
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2 text-red-600" onClick={() => { toast.success('Workflow disabled'); setShowMoreOptionsDialog(false) }}>
                <StopCircle className="w-4 h-4" />
                Disable Workflow
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Workflow YAML Dialog */}
        <Dialog open={showWorkflowYamlDialog} onOpenChange={setShowWorkflowYamlDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Workflow YAML - {selectedWorkflow?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm h-80 overflow-y-auto">
                <pre>{`name: ${selectedWorkflow?.name || 'CI Pipeline'}
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run build
      - run: npm test`}</pre>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => copyToClipboard('workflow yaml content', 'YAML copied')}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" onClick={() => setShowWorkflowYamlDialog(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Workflow Analytics Dialog */}
        <Dialog open={showWorkflowAnalyticsDialog} onOpenChange={setShowWorkflowAnalyticsDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-pink-600" />
                Workflow Analytics - {selectedWorkflow?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">{selectedWorkflow?.successRate || 94}%</p>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">{selectedWorkflow?.runs || 234}</p>
                  <p className="text-sm text-muted-foreground">Total Runs</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-2xl font-bold text-purple-600">{formatDuration(selectedWorkflow?.avgDuration || 185)}</p>
                  <p className="text-sm text-muted-foreground">Avg Duration</p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowWorkflowAnalyticsDialog(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Workflow Settings Dialog */}
        <Dialog open={showWorkflowSettingsDialog} onOpenChange={setShowWorkflowSettingsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-600" />
                Workflow Settings - {selectedWorkflow?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium">Enabled</p>
                  <p className="text-sm text-muted-foreground">Allow this workflow to run</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium">Manual Dispatch</p>
                  <p className="text-sm text-muted-foreground">Allow manual triggering</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium">Concurrency</p>
                  <p className="text-sm text-muted-foreground">Allow concurrent runs</p>
                </div>
                <Switch />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowWorkflowSettingsDialog(false)}>Cancel</Button>
                <Button onClick={() => { toast.success('Settings saved'); setShowWorkflowSettingsDialog(false) }}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Download Artifact Dialog */}
        <Dialog open={showDownloadArtifactDialog} onOpenChange={setShowDownloadArtifactDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-600" />
                Download Artifact
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="font-medium">{selectedArtifact?.name}</p>
                <p className="text-sm text-muted-foreground">Size: {selectedArtifact ? formatBytes(selectedArtifact.size) : '-'}</p>
                <p className="text-sm text-muted-foreground">Expires: {selectedArtifact?.expiresAt}</p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowDownloadArtifactDialog(false)}>Cancel</Button>
                <Button onClick={() => { toast.success('Download started'); setShowDownloadArtifactDialog(false) }}>Download</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Artifact Dialog */}
        <Dialog open={showDeleteArtifactDialog} onOpenChange={setShowDeleteArtifactDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-600" />
                Delete Artifact
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete <strong>{selectedArtifact?.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowDeleteArtifactDialog(false)}>Cancel</Button>
                <Button variant="destructive" onClick={() => { toast.success('Artifact deleted'); setShowDeleteArtifactDialog(false) }}>Delete</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
