'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { useBuilds, useBuildPipelines } from '@/lib/hooks/use-builds'
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
type SecretScope = 'repository' | 'environment' | 'organization'

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

interface Secret {
  id: string
  name: string
  scope: SecretScope
  environment?: string
  last_updated_at: string
  created_at: string
  created_by: string
}

interface CacheEntry {
  id: string
  key: string
  ref: string
  size_bytes: number
  created_at: string
  last_accessed_at: string
  hit_count: number
}

// ============================================================================
// MOCK DATA GENERATION
// ============================================================================

const mockBuilds: Build[] = [
  {
    id: '1',
    build_number: 847,
    workflow_name: 'CI Pipeline',
    workflow_file: '.github/workflows/ci.yml',
    status: 'success',
    trigger: 'push',
    branch: 'main',
    commit_hash: 'a1b2c3d4e5f6',
    commit_message: 'feat: Add user authentication flow',
    author_name: 'Sarah Chen',
    author_email: 'sarah@company.com',
    author_avatar: '',
    jobs: [
      {
        id: 'j1',
        name: 'build',
        status: 'success',
        runner_name: 'ubuntu-latest',
        runner_os: 'ubuntu',
        duration_seconds: 145,
        steps: [
          { id: 's1', name: 'Checkout', status: 'success', duration_seconds: 3, output_lines: 12, started_at: '2024-01-15T10:00:00Z', completed_at: '2024-01-15T10:00:03Z' },
          { id: 's2', name: 'Setup Node.js', status: 'success', duration_seconds: 8, output_lines: 25, started_at: '2024-01-15T10:00:03Z', completed_at: '2024-01-15T10:00:11Z' },
          { id: 's3', name: 'Install dependencies', status: 'success', duration_seconds: 45, output_lines: 156, started_at: '2024-01-15T10:00:11Z', completed_at: '2024-01-15T10:00:56Z' },
          { id: 's4', name: 'Build', status: 'success', duration_seconds: 89, output_lines: 234, started_at: '2024-01-15T10:00:56Z', completed_at: '2024-01-15T10:02:25Z' }
        ],
        started_at: '2024-01-15T10:00:00Z',
        completed_at: '2024-01-15T10:02:25Z'
      },
      {
        id: 'j2',
        name: 'test',
        status: 'success',
        runner_name: 'ubuntu-latest',
        runner_os: 'ubuntu',
        duration_seconds: 312,
        steps: [
          { id: 's5', name: 'Run unit tests', status: 'success', duration_seconds: 180, output_lines: 567, started_at: '2024-01-15T10:02:30Z', completed_at: '2024-01-15T10:05:30Z' },
          { id: 's6', name: 'Run integration tests', status: 'success', duration_seconds: 132, output_lines: 423, started_at: '2024-01-15T10:05:30Z', completed_at: '2024-01-15T10:07:42Z' }
        ],
        started_at: '2024-01-15T10:02:30Z',
        completed_at: '2024-01-15T10:07:42Z'
      }
    ],
    total_duration_seconds: 462,
    started_at: '2024-01-15T10:00:00Z',
    completed_at: '2024-01-15T10:07:42Z',
    created_at: '2024-01-15T09:59:55Z',
    tests_total: 234,
    tests_passed: 234,
    tests_failed: 0,
    tests_skipped: 0,
    coverage_percentage: 87.5,
    artifacts_count: 3,
    logs_size_bytes: 1245678,
    run_attempt: 1
  },
  {
    id: '2',
    build_number: 846,
    workflow_name: 'Deploy Production',
    workflow_file: '.github/workflows/deploy-prod.yml',
    status: 'running',
    trigger: 'workflow_dispatch',
    branch: 'main',
    commit_hash: 'b2c3d4e5f6g7',
    commit_message: 'chore: Release v2.4.0',
    author_name: 'Mike Wilson',
    author_email: 'mike@company.com',
    author_avatar: '',
    jobs: [
      {
        id: 'j3',
        name: 'deploy-staging',
        status: 'success',
        runner_name: 'ubuntu-latest',
        runner_os: 'ubuntu',
        duration_seconds: 234,
        steps: [],
        started_at: '2024-01-15T09:45:00Z',
        completed_at: '2024-01-15T09:48:54Z'
      },
      {
        id: 'j4',
        name: 'deploy-production',
        status: 'running',
        runner_name: 'ubuntu-latest',
        runner_os: 'ubuntu',
        duration_seconds: 178,
        steps: [],
        started_at: '2024-01-15T09:49:00Z',
        completed_at: null
      }
    ],
    total_duration_seconds: 412,
    started_at: '2024-01-15T09:45:00Z',
    completed_at: null,
    created_at: '2024-01-15T09:44:55Z',
    tests_total: 0,
    tests_passed: 0,
    tests_failed: 0,
    tests_skipped: 0,
    coverage_percentage: 0,
    artifacts_count: 1,
    logs_size_bytes: 567890,
    run_attempt: 1
  },
  {
    id: '3',
    build_number: 845,
    workflow_name: 'CI Pipeline',
    workflow_file: '.github/workflows/ci.yml',
    status: 'failed',
    trigger: 'pull_request',
    branch: 'feature/new-dashboard',
    commit_hash: 'c3d4e5f6g7h8',
    commit_message: 'feat: Implement new dashboard design',
    author_name: 'Emma Davis',
    author_email: 'emma@company.com',
    author_avatar: '',
    jobs: [
      {
        id: 'j5',
        name: 'build',
        status: 'success',
        runner_name: 'ubuntu-latest',
        runner_os: 'ubuntu',
        duration_seconds: 156,
        steps: [],
        started_at: '2024-01-15T09:30:00Z',
        completed_at: '2024-01-15T09:32:36Z'
      },
      {
        id: 'j6',
        name: 'test',
        status: 'failed',
        runner_name: 'ubuntu-latest',
        runner_os: 'ubuntu',
        duration_seconds: 89,
        steps: [],
        started_at: '2024-01-15T09:32:40Z',
        completed_at: '2024-01-15T09:34:09Z'
      }
    ],
    total_duration_seconds: 249,
    started_at: '2024-01-15T09:30:00Z',
    completed_at: '2024-01-15T09:34:09Z',
    created_at: '2024-01-15T09:29:55Z',
    tests_total: 234,
    tests_passed: 221,
    tests_failed: 13,
    tests_skipped: 0,
    coverage_percentage: 82.3,
    artifacts_count: 2,
    logs_size_bytes: 2345678,
    pr_number: 432,
    pr_title: 'New Dashboard Design',
    run_attempt: 1
  },
  {
    id: '4',
    build_number: 844,
    workflow_name: 'Nightly Build',
    workflow_file: '.github/workflows/nightly.yml',
    status: 'success',
    trigger: 'schedule',
    branch: 'main',
    commit_hash: 'd4e5f6g7h8i9',
    commit_message: 'chore: Daily maintenance tasks',
    author_name: 'GitHub Actions',
    author_email: 'actions@github.com',
    author_avatar: '',
    jobs: [],
    total_duration_seconds: 1845,
    started_at: '2024-01-15T03:00:00Z',
    completed_at: '2024-01-15T03:30:45Z',
    created_at: '2024-01-15T02:59:55Z',
    tests_total: 567,
    tests_passed: 567,
    tests_failed: 0,
    tests_skipped: 0,
    coverage_percentage: 89.2,
    artifacts_count: 5,
    logs_size_bytes: 3456789,
    run_attempt: 1
  },
  {
    id: '5',
    build_number: 843,
    workflow_name: 'Security Scan',
    workflow_file: '.github/workflows/security.yml',
    status: 'success',
    trigger: 'push',
    branch: 'main',
    commit_hash: 'e5f6g7h8i9j0',
    commit_message: 'fix: Patch security vulnerability CVE-2024-001',
    author_name: 'Alex Johnson',
    author_email: 'alex@company.com',
    author_avatar: '',
    jobs: [],
    total_duration_seconds: 423,
    started_at: '2024-01-14T16:00:00Z',
    completed_at: '2024-01-14T16:07:03Z',
    created_at: '2024-01-14T15:59:55Z',
    tests_total: 0,
    tests_passed: 0,
    tests_failed: 0,
    tests_skipped: 0,
    coverage_percentage: 0,
    artifacts_count: 2,
    logs_size_bytes: 789012,
    run_attempt: 1
  },
  {
    id: '6',
    build_number: 842,
    workflow_name: 'CI Pipeline',
    workflow_file: '.github/workflows/ci.yml',
    status: 'cancelled',
    trigger: 'push',
    branch: 'feature/api-updates',
    commit_hash: 'f6g7h8i9j0k1',
    commit_message: 'wip: API refactoring',
    author_name: 'James Brown',
    author_email: 'james@company.com',
    author_avatar: '',
    jobs: [],
    total_duration_seconds: 45,
    started_at: '2024-01-14T15:30:00Z',
    completed_at: '2024-01-14T15:30:45Z',
    created_at: '2024-01-14T15:29:55Z',
    tests_total: 0,
    tests_passed: 0,
    tests_failed: 0,
    tests_skipped: 0,
    coverage_percentage: 0,
    artifacts_count: 0,
    logs_size_bytes: 12345,
    run_attempt: 1
  }
]

const mockWorkflows: Workflow[] = [
  {
    id: 'w1',
    name: 'CI Pipeline',
    file_path: '.github/workflows/ci.yml',
    description: 'Continuous Integration - Build, Test, and Lint',
    triggers: ['push', 'pull_request'],
    is_active: true,
    last_run_at: '2024-01-15T10:00:00Z',
    last_status: 'success',
    total_runs: 1247,
    success_rate: 94.2,
    avg_duration_seconds: 456,
    branches: ['main', 'develop', 'feature/*'],
    created_at: '2023-06-01T00:00:00Z',
    updated_at: '2024-01-10T14:30:00Z'
  },
  {
    id: 'w2',
    name: 'Deploy Production',
    file_path: '.github/workflows/deploy-prod.yml',
    description: 'Deploy to production environment',
    triggers: ['workflow_dispatch', 'release'],
    is_active: true,
    last_run_at: '2024-01-15T09:45:00Z',
    last_status: 'running',
    total_runs: 156,
    success_rate: 98.7,
    avg_duration_seconds: 834,
    branches: ['main'],
    created_at: '2023-06-01T00:00:00Z',
    updated_at: '2024-01-05T09:15:00Z'
  },
  {
    id: 'w3',
    name: 'Deploy Staging',
    file_path: '.github/workflows/deploy-staging.yml',
    description: 'Deploy to staging environment',
    triggers: ['push'],
    is_active: true,
    last_run_at: '2024-01-15T08:30:00Z',
    last_status: 'success',
    total_runs: 892,
    success_rate: 96.5,
    avg_duration_seconds: 512,
    branches: ['develop'],
    created_at: '2023-06-01T00:00:00Z',
    updated_at: '2024-01-08T11:20:00Z'
  },
  {
    id: 'w4',
    name: 'Nightly Build',
    file_path: '.github/workflows/nightly.yml',
    description: 'Scheduled nightly builds with full test suite',
    triggers: ['schedule'],
    is_active: true,
    last_run_at: '2024-01-15T03:00:00Z',
    last_status: 'success',
    total_runs: 365,
    success_rate: 91.8,
    avg_duration_seconds: 1845,
    branches: ['main'],
    created_at: '2023-06-15T00:00:00Z',
    updated_at: '2023-12-20T16:45:00Z'
  },
  {
    id: 'w5',
    name: 'Security Scan',
    file_path: '.github/workflows/security.yml',
    description: 'Security vulnerability scanning and SAST',
    triggers: ['push', 'schedule'],
    is_active: true,
    last_run_at: '2024-01-14T16:00:00Z',
    last_status: 'success',
    total_runs: 734,
    success_rate: 99.1,
    avg_duration_seconds: 423,
    branches: ['main', 'develop'],
    created_at: '2023-07-01T00:00:00Z',
    updated_at: '2024-01-02T10:30:00Z'
  },
  {
    id: 'w6',
    name: 'Release',
    file_path: '.github/workflows/release.yml',
    description: 'Create releases and publish packages',
    triggers: ['tag', 'workflow_dispatch'],
    is_active: true,
    last_run_at: '2024-01-10T14:00:00Z',
    last_status: 'success',
    total_runs: 48,
    success_rate: 100,
    avg_duration_seconds: 623,
    branches: ['main'],
    created_at: '2023-06-01T00:00:00Z',
    updated_at: '2023-11-15T09:00:00Z'
  }
]

const mockEnvironments: Environment[] = [
  {
    id: 'e1',
    name: 'production',
    type: 'production',
    url: 'https://app.company.com',
    protection_rules: true,
    required_reviewers: ['Sarah Chen', 'Mike Wilson'],
    wait_timer_minutes: 15,
    last_deployment_at: '2024-01-14T16:30:00Z',
    last_deployment_status: 'success',
    total_deployments: 156,
    active_deployment_id: 'dep-prod-156',
    secrets_count: 12,
    variables_count: 8,
    created_at: '2023-06-01T00:00:00Z'
  },
  {
    id: 'e2',
    name: 'staging',
    type: 'staging',
    url: 'https://staging.company.com',
    protection_rules: true,
    required_reviewers: ['Team Lead'],
    wait_timer_minutes: 5,
    last_deployment_at: '2024-01-15T08:30:00Z',
    last_deployment_status: 'success',
    total_deployments: 892,
    active_deployment_id: 'dep-staging-892',
    secrets_count: 10,
    variables_count: 6,
    created_at: '2023-06-01T00:00:00Z'
  },
  {
    id: 'e3',
    name: 'development',
    type: 'development',
    url: 'https://dev.company.com',
    protection_rules: false,
    required_reviewers: [],
    wait_timer_minutes: 0,
    last_deployment_at: '2024-01-15T10:00:00Z',
    last_deployment_status: 'success',
    total_deployments: 2345,
    active_deployment_id: 'dep-dev-2345',
    secrets_count: 8,
    variables_count: 5,
    created_at: '2023-06-01T00:00:00Z'
  },
  {
    id: 'e4',
    name: 'testing',
    type: 'testing',
    url: 'https://test.company.com',
    protection_rules: false,
    required_reviewers: [],
    wait_timer_minutes: 0,
    last_deployment_at: '2024-01-15T03:30:00Z',
    last_deployment_status: 'success',
    total_deployments: 365,
    active_deployment_id: 'dep-test-365',
    secrets_count: 6,
    variables_count: 4,
    created_at: '2023-07-01T00:00:00Z'
  }
]

const mockArtifacts: Artifact[] = [
  { id: 'a1', name: 'build-output.zip', type: 'archive', build_id: '1', build_number: 847, workflow_name: 'CI Pipeline', size_bytes: 45678901, download_count: 12, expires_at: '2024-01-22T10:00:00Z', created_at: '2024-01-15T10:07:42Z', is_expired: false },
  { id: 'a2', name: 'test-results.xml', type: 'report', build_id: '1', build_number: 847, workflow_name: 'CI Pipeline', size_bytes: 234567, download_count: 5, expires_at: '2024-01-22T10:00:00Z', created_at: '2024-01-15T10:07:42Z', is_expired: false },
  { id: 'a3', name: 'coverage-report.html', type: 'coverage', build_id: '1', build_number: 847, workflow_name: 'CI Pipeline', size_bytes: 1234567, download_count: 8, expires_at: '2024-01-22T10:00:00Z', created_at: '2024-01-15T10:07:42Z', is_expired: false },
  { id: 'a4', name: 'docker-image.tar', type: 'docker', build_id: '2', build_number: 846, workflow_name: 'Deploy Production', size_bytes: 234567890, download_count: 2, expires_at: '2024-01-22T09:45:00Z', created_at: '2024-01-15T09:48:54Z', is_expired: false },
  { id: 'a5', name: 'build-logs.txt', type: 'logs', build_id: '3', build_number: 845, workflow_name: 'CI Pipeline', size_bytes: 567890, download_count: 15, expires_at: '2024-01-22T09:30:00Z', created_at: '2024-01-15T09:34:09Z', is_expired: false },
  { id: 'a6', name: 'app-v2.4.0.dmg', type: 'binary', build_id: '4', build_number: 844, workflow_name: 'Nightly Build', size_bytes: 89012345, download_count: 45, expires_at: '2024-01-22T03:00:00Z', created_at: '2024-01-15T03:30:45Z', is_expired: false }
]

const mockRunners: Runner[] = [
  { id: 'r1', name: 'ubuntu-latest', type: 'hosted', os: 'ubuntu', status: 'busy', labels: ['ubuntu-latest', 'x64', 'linux'], current_job: 'deploy-production', total_jobs_run: 12456, total_minutes: 156789, last_active_at: '2024-01-15T10:07:42Z', version: '2.311.0', architecture: 'x64' },
  { id: 'r2', name: 'macos-latest', type: 'hosted', os: 'macos', status: 'online', labels: ['macos-latest', 'arm64', 'macos'], current_job: null, total_jobs_run: 2345, total_minutes: 45678, last_active_at: '2024-01-15T09:45:00Z', version: '2.311.0', architecture: 'arm64' },
  { id: 'r3', name: 'windows-latest', type: 'hosted', os: 'windows', status: 'online', labels: ['windows-latest', 'x64', 'windows'], current_job: null, total_jobs_run: 1234, total_minutes: 23456, last_active_at: '2024-01-15T08:30:00Z', version: '2.311.0', architecture: 'x64' },
  { id: 'r4', name: 'self-hosted-gpu', type: 'self-hosted', os: 'ubuntu', status: 'online', labels: ['self-hosted', 'gpu', 'cuda'], current_job: null, total_jobs_run: 567, total_minutes: 12345, last_active_at: '2024-01-15T07:00:00Z', version: '2.311.0', architecture: 'x64', ip_address: '10.0.1.100' },
  { id: 'r5', name: 'self-hosted-arm', type: 'self-hosted', os: 'ubuntu', status: 'offline', labels: ['self-hosted', 'arm64'], current_job: null, total_jobs_run: 234, total_minutes: 5678, last_active_at: '2024-01-14T18:00:00Z', version: '2.310.0', architecture: 'arm64', ip_address: '10.0.1.101' }
]

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
// COMPETITIVE UPGRADE MOCK DATA - GitHub Actions Level Build Intelligence
// ============================================================================

const mockBuildsAIInsights = [
  { id: '1', type: 'success' as const, title: 'Build Health', description: 'Build success rate at 96% this week - excellent!', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Health' },
  { id: '2', type: 'warning' as const, title: 'Flaky Test', description: 'Unit test suite-3 failed 3 times in last 10 runs.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Quality' },
  { id: '3', type: 'info' as const, title: 'AI Optimization', description: 'Parallel job execution can reduce build time by 35%.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'AI Insights' },
]

const mockBuildsCollaborators = [
  { id: '1', name: 'DevOps Lead', avatar: '/avatars/devops.jpg', status: 'online' as const, role: 'Lead' },
  { id: '2', name: 'Build Engineer', avatar: '/avatars/build.jpg', status: 'online' as const, role: 'Engineer' },
  { id: '3', name: 'Release Manager', avatar: '/avatars/release.jpg', status: 'away' as const, role: 'Manager' },
]

const mockBuildsPredictions = [
  { id: '1', title: 'Build Time', prediction: 'Next release build will complete in 12 minutes', confidence: 88, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Cache Efficiency', prediction: 'Dependency caching will improve build speed by 40%', confidence: 85, trend: 'up' as const, impact: 'medium' as const },
]

const mockBuildsActivities = [
  { id: '1', user: 'DevOps Lead', action: 'Deployed', target: 'v2.4.0 to production', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Build Engineer', action: 'Fixed', target: 'CI pipeline cache issue', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'Release Manager', action: 'Approved', target: 'hotfix build #1234', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'success' as const },
]

// Note: mockBuildsQuickActions moved inside component to access state setters

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function BuildsClient() {
  // Supabase hooks for real data
  const { builds: dbBuilds, loading: buildsLoading, refetch: refetchBuilds } = useBuilds()
  const { pipelines: dbPipelines, loading: pipelinesLoading } = useBuildPipelines()

  // Use real data with mock fallback
  const activeBuilds = dbBuilds && dbBuilds.length > 0 ? dbBuilds.map(b => ({
    ...b,
    id: b.id,
    name: b.commit_message || `Build #${b.build_number}`,
    status: b.status as BuildStatus,
    total_duration_seconds: b.duration_seconds,
    coverage_percentage: b.coverage_percentage,
    repository: 'main',
    commit_hash: b.commit_hash || '',
    author: { name: b.author_name || 'Unknown', avatar: b.author_name?.charAt(0) || 'U' }
  })) : mockBuilds

  const [activeTab, setActiveTab] = useState('builds')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<BuildStatus | 'all'>('all')
  const [selectedBuild, setSelectedBuild] = useState<Build | null>(null)
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)

  // Dialog states for quick actions
  const [showNewBuildDialog, setShowNewBuildDialog] = useState(false)
  const [showRetryBuildDialog, setShowRetryBuildDialog] = useState(false)
  const [showLogsDialog, setShowLogsDialog] = useState(false)

  // Additional dialog states for all button actions
  const [showRunWorkflowDialog, setShowRunWorkflowDialog] = useState(false)
  const [showBranchesDialog, setShowBranchesDialog] = useState(false)
  const [showArtifactsDialog, setShowArtifactsDialog] = useState(false)
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false)
  const [showSearchBuildsDialog, setShowSearchBuildsDialog] = useState(false)
  const [showBuildSettingsDialog, setShowBuildSettingsDialog] = useState(false)

  // Workflow dialog states
  const [showNewWorkflowDialog, setShowNewWorkflowDialog] = useState(false)
  const [showRunAllWorkflowsDialog, setShowRunAllWorkflowsDialog] = useState(false)
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false)
  const [showTriggersDialog, setShowTriggersDialog] = useState(false)
  const [showSchedulesDialog, setShowSchedulesDialog] = useState(false)
  const [showSecretsDialog, setShowSecretsDialog] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [showWorkflowSettingsDialog, setShowWorkflowSettingsDialog] = useState(false)

  // Environment dialog states
  const [showNewEnvDialog, setShowNewEnvDialog] = useState(false)
  const [showDeployDialog, setShowDeployDialog] = useState(false)
  const [showProtectionDialog, setShowProtectionDialog] = useState(false)
  const [showEnvSecretsDialog, setShowEnvSecretsDialog] = useState(false)
  const [showVariablesDialog, setShowVariablesDialog] = useState(false)
  const [showReviewersDialog, setShowReviewersDialog] = useState(false)
  const [showHistoryDialog, setShowHistoryDialog] = useState(false)
  const [showEnvSettingsDialog, setShowEnvSettingsDialog] = useState(false)
  const [showConfigureEnvDialog, setShowConfigureEnvDialog] = useState(false)
  const [showViewEnvDialog, setShowViewEnvDialog] = useState(false)
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment | null>(null)

  // Artifacts dialog states
  const [showDownloadDialog, setShowDownloadDialog] = useState(false)
  const [showBrowseArtifactsDialog, setShowBrowseArtifactsDialog] = useState(false)
  const [showReportsDialog, setShowReportsDialog] = useState(false)
  const [showArchivesDialog, setShowArchivesDialog] = useState(false)
  const [showStorageDialog, setShowStorageDialog] = useState(false)
  const [showCleanupDialog, setShowCleanupDialog] = useState(false)
  const [showSearchArtifactsDialog, setShowSearchArtifactsDialog] = useState(false)
  const [showArtifactSettingsDialog, setShowArtifactSettingsDialog] = useState(false)
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null)

  // Settings dialog states
  const [showAddSecretDialog, setShowAddSecretDialog] = useState(false)
  const [showDeleteSecretDialog, setShowDeleteSecretDialog] = useState(false)
  const [showCopySecretDialog, setShowCopySecretDialog] = useState(false)
  const [showDeleteCacheDialog, setShowDeleteCacheDialog] = useState(false)
  const [showAddScheduleDialog, setShowAddScheduleDialog] = useState(false)
  const [showAddVariableDialog, setShowAddVariableDialog] = useState(false)
  const [showAddReviewerDialog, setShowAddReviewerDialog] = useState(false)
  const [selectedSecret, setSelectedSecret] = useState<string | null>(null)
  const [selectedCache, setSelectedCache] = useState<string | null>(null)
  const [newScheduleName, setNewScheduleName] = useState('')
  const [newScheduleCron, setNewScheduleCron] = useState('')
  const [newVariableKey, setNewVariableKey] = useState('')
  const [newVariableValue, setNewVariableValue] = useState('')
  const [newReviewerEmail, setNewReviewerEmail] = useState('')

  // Build detail dialog states
  const [showBuildLogsDialog, setShowBuildLogsDialog] = useState(false)
  const [showBuildArtifactsDialog, setShowBuildArtifactsDialog] = useState(false)
  const [showRerunBuildDialog, setShowRerunBuildDialog] = useState(false)

  // Workflow detail dialog states
  const [showViewFileDialog, setShowViewFileDialog] = useState(false)
  const [showRunSingleWorkflowDialog, setShowRunSingleWorkflowDialog] = useState(false)

  // Quick actions with proper dialog handlers
  const buildsQuickActions = [
    { id: '1', label: 'New Build', icon: 'plus', action: () => setShowNewBuildDialog(true), variant: 'default' as const },
    { id: '2', label: 'Retry', icon: 'refresh-cw', action: () => setShowRetryBuildDialog(true), variant: 'default' as const },
    { id: '3', label: 'Logs', icon: 'file-text', action: () => setShowLogsDialog(true), variant: 'outline' as const },
  ]

  // Filtered data - uses real data with mock fallback
  const filteredBuilds = useMemo(() => {
    return activeBuilds.filter((build: any) => {
      const matchesSearch =
        (build.workflow_name || build.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (build.branch || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (build.commit_message || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (build.author_name || build.author?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || build.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [searchQuery, statusFilter, activeBuilds])

  // Stats calculations - uses real data with mock fallback
  const stats = useMemo(() => {
    const total = activeBuilds.length
    const success = activeBuilds.filter((b: any) => b.status === 'success').length
    const failed = activeBuilds.filter((b: any) => b.status === 'failed').length
    const running = activeBuilds.filter((b: any) => b.status === 'running').length
    const avgDuration = activeBuilds.reduce((acc: number, b: any) => acc + (b.total_duration_seconds || b.duration_seconds || 0), 0) / (total || 1)
    const buildsWithCoverage = activeBuilds.filter((b: any) => (b.coverage_percentage || 0) > 0)
    const avgCoverage = buildsWithCoverage.length > 0 ? buildsWithCoverage.reduce((acc: number, b: any) => acc + (b.coverage_percentage || 0), 0) / buildsWithCoverage.length : 0
    const totalArtifacts = mockArtifacts.length
    const activeRunners = mockRunners.filter(r => r.status !== 'offline').length

    return {
      total,
      success,
      failed,
      running,
      successRate: Math.round((success / total) * 100),
      avgDuration,
      avgCoverage: avgCoverage || 0,
      totalArtifacts,
      activeRunners,
      totalRunners: mockRunners.length
    }
  }, [])

  // Handlers
  const handleTriggerBuild = () => {
    toast.info('Build triggered')
  }

  const handleCancelBuild = (build: Build) => {
    toast.success(`Build cancelled: ${build.name} has been cancelled`)
  }

  const handleRetryBuild = (build: Build) => {
    toast.info(`Retrying build: ${build.name}`)
  }

  const handleDownloadArtifact = (artifactName: string) => {
    toast.success(`Download started: ${artifactName}`)
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
            <Button variant="outline" size="sm" onClick={() => {
              toast.info('Refreshing...')
            }}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white" onClick={() => setShowRunWorkflowDialog(true)}>
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
                    <p className="text-3xl font-bold">{activeBuilds.length}</p>
                    <p className="text-emerald-200 text-sm">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{activeBuilds.filter((b: any) => b.status === 'success').length}</p>
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
                { icon: Play, label: 'Run Build', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', onClick: () => setShowNewBuildDialog(true) },
                { icon: RefreshCw, label: 'Rebuild', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', onClick: () => setShowRetryBuildDialog(true) },
                { icon: GitBranch, label: 'Branches', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', onClick: () => setShowBranchesDialog(true) },
                { icon: Terminal, label: 'Logs', color: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400', onClick: () => setShowLogsDialog(true) },
                { icon: Download, label: 'Artifacts', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => setShowArtifactsDialog(true) },
                { icon: BarChart3, label: 'Analytics', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: () => setShowAnalyticsDialog(true) },
                { icon: Search, label: 'Search', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', onClick: () => setShowSearchBuildsDialog(true) },
                { icon: Settings, label: 'Settings', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => setShowBuildSettingsDialog(true) },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
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
                    <p className="text-3xl font-bold">{mockWorkflows.length}</p>
                    <p className="text-purple-200 text-sm">Workflows</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockWorkflows.filter(w => w.is_active).length}</p>
                    <p className="text-purple-200 text-sm">Active</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Workflows Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Workflow, label: 'New Workflow', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => setShowNewWorkflowDialog(true) },
                { icon: Play, label: 'Run All', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', onClick: () => setShowRunAllWorkflowsDialog(true) },
                { icon: FileText, label: 'Templates', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', onClick: () => setShowTemplatesDialog(true) },
                { icon: GitBranch, label: 'Triggers', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => setShowTriggersDialog(true) },
                { icon: Timer, label: 'Schedules', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', onClick: () => setShowSchedulesDialog(true) },
                { icon: Lock, label: 'Secrets', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', onClick: () => setShowSecretsDialog(true) },
                { icon: Archive, label: 'Archive', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', onClick: () => setShowArchiveDialog(true) },
                { icon: Settings, label: 'Settings', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: () => setShowWorkflowSettingsDialog(true) },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockWorkflows.map(workflow => (
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
                    <p className="text-3xl font-bold">{mockEnvironments.length}</p>
                    <p className="text-amber-200 text-sm">Environments</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockEnvironments.filter(e => e.protection_rules).length}</p>
                    <p className="text-amber-200 text-sm">Protected</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Environments Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Globe, label: 'New Env', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', onClick: () => setShowNewEnvDialog(true) },
                { icon: Cloud, label: 'Deploy', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', onClick: () => setShowDeployDialog(true) },
                { icon: Shield, label: 'Protection', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', onClick: () => setShowProtectionDialog(true) },
                { icon: Key, label: 'Secrets', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', onClick: () => setShowEnvSecretsDialog(true) },
                { icon: Database, label: 'Variables', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', onClick: () => setShowVariablesDialog(true) },
                { icon: Users, label: 'Reviewers', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400', onClick: () => setShowReviewersDialog(true) },
                { icon: Activity, label: 'History', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', onClick: () => setShowHistoryDialog(true) },
                { icon: Settings, label: 'Settings', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400', onClick: () => setShowEnvSettingsDialog(true) },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockEnvironments.map(env => (
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
                          <Button variant="outline" size="sm" onClick={(e) => {
                            e.stopPropagation()
                            setSelectedEnvironment(env)
                            setShowConfigureEnvDialog(true)
                          }}>
                            <Settings className="w-3 h-3 mr-1" />
                            Configure
                          </Button>
                          <Button variant="outline" size="sm" onClick={(e) => {
                            e.stopPropagation()
                            setSelectedEnvironment(env)
                            setShowViewEnvDialog(true)
                          }}>
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
                    <p className="text-3xl font-bold">{mockArtifacts.length}</p>
                    <p className="text-blue-200 text-sm">Artifacts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockArtifacts.reduce((sum, a) => sum + a.download_count, 0)}</p>
                    <p className="text-blue-200 text-sm">Downloads</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Artifacts Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Download, label: 'Download', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', onClick: () => setShowDownloadDialog(true) },
                { icon: Box, label: 'Browse', color: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400', onClick: () => setShowBrowseArtifactsDialog(true) },
                { icon: FileText, label: 'Reports', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400', onClick: () => setShowReportsDialog(true) },
                { icon: Archive, label: 'Archives', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400', onClick: () => setShowArchivesDialog(true) },
                { icon: Database, label: 'Storage', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', onClick: () => setShowStorageDialog(true) },
                { icon: Trash2, label: 'Cleanup', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', onClick: () => setShowCleanupDialog(true) },
                { icon: Search, label: 'Search', color: 'bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400', onClick: () => setShowSearchArtifactsDialog(true) },
                { icon: Settings, label: 'Settings', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400', onClick: () => setShowArtifactSettingsDialog(true) },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                  onClick={action.onClick}
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
                  <Button variant="outline" size="sm" onClick={() => setShowCleanupDialog(true)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clean Expired
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {mockArtifacts.map(artifact => (
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
                      <Button variant="outline" size="sm" onClick={() => {
                        setSelectedArtifact(artifact)
                        setShowDownloadDialog(true)
                      }}>
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
                  <p className="text-rose-200 text-xs mt-1">Total minutes used: {mockRunners.reduce((sum, r) => sum + r.total_minutes, 0).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockRunners.length}</p>
                    <p className="text-rose-200 text-sm">Runners</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockRunners.filter(r => r.status === 'online').length}</p>
                    <p className="text-rose-200 text-sm">Online</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockRunners.filter(r => r.status === 'busy').length}</p>
                    <p className="text-rose-200 text-sm">Busy</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockRunners.map(runner => (
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
                          <Button variant="ghost" size="sm" onClick={() => {
                            setSelectedSecret(secret)
                            setShowCopySecretDialog(true)
                          }}>
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600" onClick={() => {
                            setSelectedSecret(secret)
                            setShowDeleteSecretDialog(true)
                          }}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full mt-3" onClick={() => setShowAddSecretDialog(true)}>
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
                        <Button variant="ghost" size="sm" className="text-red-600" onClick={() => {
                          setSelectedCache(cache.key)
                          setShowDeleteCacheDialog(true)
                        }}>
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
                      <Input type="number" defaultValue={5} className="w-20 text-center" onChange={(e) => {
                        toast.success(`Max concurrent jobs set to ${e.target.value}`)
                      }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Queue pending jobs</p>
                        <p className="text-sm text-gray-500">Hold jobs when limit reached</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => {
                        toast.success('Queue pending jobs setting toggled')
                      }}>Enabled</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Cancel in-progress on new push</p>
                        <p className="text-sm text-gray-500">Stop old runs when new commits arrive</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => {
                        toast.success('Cancel in-progress setting toggled')
                      }}>Disabled</Button>
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
              insights={mockBuildsAIInsights}
              title="Build Intelligence"
              onInsightAction={(insight) => toast.success(`${insight.title} action completed`)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockBuildsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockBuildsPredictions}
              title="Build Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockBuildsActivities}
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
                    <Button variant="outline" className="flex-1" onClick={() => {
                      setShowBuildLogsDialog(true)
                    }}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Logs
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => {
                      setShowBuildArtifactsDialog(true)
                    }}>
                      <Download className="w-4 h-4 mr-2" />
                      Artifacts
                    </Button>
                    <Button className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-600 text-white" onClick={() => {
                      setShowRerunBuildDialog(true)
                    }}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Re-run
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
                  <Button variant="outline" className="flex-1" onClick={() => {
                    setShowViewFileDialog(true)
                  }}>
                    <Eye className="w-4 h-4 mr-2" />
                    View File
                  </Button>
                  <Button className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-600 text-white" onClick={() => {
                    setShowRunSingleWorkflowDialog(true)
                  }}>
                    <Play className="w-4 h-4 mr-2" />
                    Run Workflow
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* New Build Dialog */}
        <Dialog open={showNewBuildDialog} onOpenChange={setShowNewBuildDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-teal-600" />
                Start New Build
              </DialogTitle>
              <DialogDescription>
                Configure and trigger a new CI/CD build
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Workflow</label>
                <select className="w-full p-2 border rounded-lg bg-background">
                  <option>CI Pipeline</option>
                  <option>Deploy Production</option>
                  <option>Deploy Staging</option>
                  <option>Nightly Build</option>
                  <option>Security Scan</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Branch</label>
                <Input placeholder="main" defaultValue="main" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Environment Variables (optional)</label>
                <Input placeholder="KEY=value" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowNewBuildDialog(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-600 text-white"
                onClick={() => {
                  toast.success('Build started')
                  setShowNewBuildDialog(false)
                }}
              >
                <Play className="w-4 h-4 mr-2" />
                Start Build
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Retry Build Dialog */}
        <Dialog open={showRetryBuildDialog} onOpenChange={setShowRetryBuildDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-teal-600" />
                Retry Build
              </DialogTitle>
              <DialogDescription>
                Select a build to retry
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Build</label>
                <select className="w-full p-2 border rounded-lg bg-background">
                  {activeBuilds.slice(0, 5).map((build: any) => (
                    <option key={build.id} value={build.id}>
                      #{build.build_number} - {build.workflow_name} ({build.status})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  This will create a new run attempt with the same configuration
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowRetryBuildDialog(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-600 text-white"
                onClick={() => {
                  toast.success('Build retry initiated')
                  setShowRetryBuildDialog(false)
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry Build
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Logs Dialog */}
        <Dialog open={showLogsDialog} onOpenChange={setShowLogsDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-teal-600" />
                Build Logs
              </DialogTitle>
              <DialogDescription>
                View logs from recent builds
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3">
                <select className="flex-1 p-2 border rounded-lg bg-background text-sm">
                  {activeBuilds.slice(0, 5).map((build: any) => (
                    <option key={build.id} value={build.id}>
                      #{build.build_number} - {build.workflow_name}
                    </option>
                  ))}
                </select>
                <Button variant="outline" size="sm" onClick={() => {
                  toast.success('Download started')
                }}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
              <ScrollArea className="h-[400px] border rounded-lg bg-gray-950 p-4">
                <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
{`[2024-01-15T10:00:00Z] Starting job: build
[2024-01-15T10:00:00Z] Checking out repository...
[2024-01-15T10:00:03Z] > git checkout main
[2024-01-15T10:00:03Z] Already on 'main'
[2024-01-15T10:00:03Z] Setting up Node.js 18.x...
[2024-01-15T10:00:11Z] Node.js 18.19.0 installed
[2024-01-15T10:00:11Z] Installing dependencies...
[2024-01-15T10:00:11Z] > npm ci
[2024-01-15T10:00:56Z] added 1247 packages in 45s
[2024-01-15T10:00:56Z] Running build...
[2024-01-15T10:00:56Z] > npm run build
[2024-01-15T10:02:25Z] Build completed successfully
[2024-01-15T10:02:25Z] Running tests...
[2024-01-15T10:02:30Z] > npm test
[2024-01-15T10:05:30Z] Test Suites: 45 passed, 45 total
[2024-01-15T10:05:30Z] Tests:       234 passed, 234 total
[2024-01-15T10:05:30Z] Coverage: 87.5%
[2024-01-15T10:07:42Z] Job completed successfully`}
                </pre>
              </ScrollArea>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowLogsDialog(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Run Workflow Dialog (Header) */}
        <Dialog open={showRunWorkflowDialog} onOpenChange={setShowRunWorkflowDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-teal-600" />
                Run Workflow
              </DialogTitle>
              <DialogDescription>
                Select and run a workflow manually
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Workflow</label>
                <select className="w-full p-2 border rounded-lg bg-background">
                  {mockWorkflows.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Branch</label>
                <Input placeholder="main" defaultValue="main" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowRunWorkflowDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-600 text-white" onClick={() => {
                toast.success('Workflow started')
                setShowRunWorkflowDialog(false)
              }}>
                <Play className="w-4 h-4 mr-2" />
                Run
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Branches Dialog */}
        <Dialog open={showBranchesDialog} onOpenChange={setShowBranchesDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-cyan-600" />
                Branches
              </DialogTitle>
              <DialogDescription>
                View branches with recent builds
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4 max-h-[400px] overflow-auto">
              {['main', 'develop', 'feature/new-dashboard', 'feature/api-updates', 'hotfix/security-patch'].map(branch => (
                <div key={branch} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-gray-500" />
                    <span className="font-mono text-sm">{branch}</span>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => {
                    toast.info(`Branch selected: ${branch}`)
                    setShowBranchesDialog(false)
                  }}>
                    Select
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowBranchesDialog(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Artifacts Dialog (from Builds Quick Actions) */}
        <Dialog open={showArtifactsDialog} onOpenChange={setShowArtifactsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-600" />
                Recent Artifacts
              </DialogTitle>
              <DialogDescription>
                Download artifacts from recent builds
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4 max-h-[400px] overflow-auto">
              {mockArtifacts.slice(0, 5).map(artifact => (
                <div key={artifact.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{artifact.name}</p>
                    <p className="text-xs text-gray-500">Build #{artifact.build_number} - {formatBytes(artifact.size_bytes)}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => {
                    toast.success(`Downloading ${artifact.name}...`)
                  }}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowArtifactsDialog(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Analytics Dialog */}
        <Dialog open={showAnalyticsDialog} onOpenChange={setShowAnalyticsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                Build Analytics
              </DialogTitle>
              <DialogDescription>
                View build performance metrics and trends
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{stats.successRate}%</p>
                  <p className="text-sm text-gray-500">Success Rate</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold">{formatDuration(stats.avgDuration)}</p>
                  <p className="text-sm text-gray-500">Avg Duration</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold">{stats.avgCoverage.toFixed(1)}%</p>
                  <p className="text-sm text-gray-500">Avg Coverage</p>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-3">Build Trend (Last 7 Days)</h4>
                <div className="flex items-end gap-2 h-32">
                  {[65, 72, 68, 85, 90, 78, 95].map((val, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-teal-500 to-cyan-400 rounded-t" style={{ height: `${val}%` }} />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowAnalyticsDialog(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Search Builds Dialog */}
        <Dialog open={showSearchBuildsDialog} onOpenChange={setShowSearchBuildsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 text-violet-600" />
                Search Builds
              </DialogTitle>
              <DialogDescription>
                Search through build history
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input placeholder="Search by workflow, branch, commit..." />
              <div className="space-y-2">
                <label className="text-sm font-medium">Status Filter</label>
                <div className="flex gap-2 flex-wrap">
                  {['All', 'Success', 'Failed', 'Running'].map(status => (
                    <Badge key={status} variant="outline" className="cursor-pointer hover:bg-gray-100">
                      {status}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <div className="flex gap-2">
                  <Input type="date" className="flex-1" />
                  <Input type="date" className="flex-1" />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowSearchBuildsDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={() => {
                toast.success('Search filters applied')
                setShowSearchBuildsDialog(false)
              }}>
                Search
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Build Settings Dialog */}
        <Dialog open={showBuildSettingsDialog} onOpenChange={setShowBuildSettingsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600" />
                Build Settings
              </DialogTitle>
              <DialogDescription>
                Configure build preferences
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-retry failed builds</p>
                  <p className="text-sm text-gray-500">Automatically retry on failure</p>
                </div>
                <Button variant="outline" size="sm">Disabled</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Build timeout</p>
                  <p className="text-sm text-gray-500">Maximum build duration</p>
                </div>
                <Input type="number" defaultValue={60} className="w-20 text-center" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notifications</p>
                  <p className="text-sm text-gray-500">Email on build failure</p>
                </div>
                <Button variant="outline" size="sm">Enabled</Button>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowBuildSettingsDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={() => {
                toast.success('Build settings saved successfully')
                setShowBuildSettingsDialog(false)
              }}>
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* New Workflow Dialog */}
        <Dialog open={showNewWorkflowDialog} onOpenChange={setShowNewWorkflowDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Workflow className="w-5 h-5 text-purple-600" />
                Create Workflow
              </DialogTitle>
              <DialogDescription>
                Create a new CI/CD workflow
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Workflow Name</label>
                <Input placeholder="e.g., CI Pipeline" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">File Path</label>
                <Input placeholder=".github/workflows/ci.yml" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Template</label>
                <select className="w-full p-2 border rounded-lg bg-background">
                  <option>Node.js CI</option>
                  <option>Python CI</option>
                  <option>Docker Build</option>
                  <option>Deploy to Production</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowNewWorkflowDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={() => {
                toast.success('Workflow created successfully')
                setShowNewWorkflowDialog(false)
              }}>
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Run All Workflows Dialog */}
        <Dialog open={showRunAllWorkflowsDialog} onOpenChange={setShowRunAllWorkflowsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-violet-600" />
                Run All Workflows
              </DialogTitle>
              <DialogDescription>
                Trigger all active workflows
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    This will trigger {mockWorkflows.filter(w => w.is_active).length} workflows
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Branch</label>
                <Input placeholder="main" defaultValue="main" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowRunAllWorkflowsDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={() => {
                toast.success('All workflows triggered successfully')
                setShowRunAllWorkflowsDialog(false)
              }}>
                Run All
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Templates Dialog */}
        <Dialog open={showTemplatesDialog} onOpenChange={setShowTemplatesDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Workflow Templates
              </DialogTitle>
              <DialogDescription>
                Start from a pre-built template
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4 max-h-[400px] overflow-auto">
              {[
                { name: 'Node.js CI', desc: 'Build and test Node.js projects' },
                { name: 'Python CI', desc: 'Build and test Python projects' },
                { name: 'Docker Build', desc: 'Build and push Docker images' },
                { name: 'Deploy to AWS', desc: 'Deploy to AWS infrastructure' },
                { name: 'Security Scan', desc: 'Run security vulnerability scans' },
              ].map(template => (
                <div key={template.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{template.name}</p>
                    <p className="text-sm text-gray-500">{template.desc}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => {
                    toast.success(`${template.name} template applied successfully`)
                    setShowTemplatesDialog(false)
                  }}>
                    Use
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowTemplatesDialog(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Triggers Dialog */}
        <Dialog open={showTriggersDialog} onOpenChange={setShowTriggersDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-blue-600" />
                Workflow Triggers
              </DialogTitle>
              <DialogDescription>
                Configure workflow triggers
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {['push', 'pull_request', 'schedule', 'workflow_dispatch'].map(trigger => (
                <div key={trigger} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    {getTriggerIcon(trigger as WorkflowTrigger)}
                    <span className="capitalize">{trigger.replace('_', ' ')}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => {
                    toast.success(`${trigger.replace('_', ' ')} trigger toggled`)
                  }}>
                    Enabled
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowTriggersDialog(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Schedules Dialog */}
        <Dialog open={showSchedulesDialog} onOpenChange={setShowSchedulesDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-cyan-600" />
                Scheduled Builds
              </DialogTitle>
              <DialogDescription>
                Manage scheduled workflow runs
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Nightly Build</span>
                  <Badge variant="outline">Active</Badge>
                </div>
                <p className="text-sm text-gray-500">Every day at 3:00 AM UTC</p>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Weekly Security Scan</span>
                  <Badge variant="outline">Active</Badge>
                </div>
                <p className="text-sm text-gray-500">Every Sunday at 12:00 PM UTC</p>
              </div>
              <Button variant="outline" className="w-full" onClick={() => setShowAddScheduleDialog(true)}>
                <Calendar className="w-4 h-4 mr-2" />
                Add Schedule
              </Button>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowSchedulesDialog(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Secrets Dialog (Workflow Tab) */}
        <Dialog open={showSecretsDialog} onOpenChange={setShowSecretsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-teal-600" />
                Workflow Secrets
              </DialogTitle>
              <DialogDescription>
                Manage secrets used in workflows
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              {['GITHUB_TOKEN', 'NPM_TOKEN', 'DOCKER_USERNAME', 'AWS_SECRET'].map(secret => (
                <div key={secret} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-400" />
                    <span className="font-mono text-sm">{secret}</span>
                  </div>
                  <Badge variant="secondary">Encrypted</Badge>
                </div>
              ))}
              <Button variant="outline" className="w-full" onClick={() => setShowAddSecretDialog(true)}>
                <Key className="w-4 h-4 mr-2" />
                Add Secret
              </Button>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowSecretsDialog(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Archive Dialog */}
        <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Archive className="w-5 h-5 text-emerald-600" />
                Archived Workflows
              </DialogTitle>
              <DialogDescription>
                View and restore archived workflows
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Legacy Deploy</p>
                    <p className="text-sm text-gray-500">Archived 30 days ago</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => {
                    toast.success('Workflow restored successfully')
                    setShowArchiveDialog(false)
                  }}>
                    Restore
                  </Button>
                </div>
              </div>
              <div className="text-center py-4 text-gray-500">
                No other archived workflows
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowArchiveDialog(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Workflow Settings Dialog */}
        <Dialog open={showWorkflowSettingsDialog} onOpenChange={setShowWorkflowSettingsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-green-600" />
                Workflow Settings
              </DialogTitle>
              <DialogDescription>
                Configure workflow preferences
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Allow fork PRs</p>
                  <p className="text-sm text-gray-500">Run workflows from forks</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => {
                  toast.success('Fork PRs setting toggled')
                }}>Disabled</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Required approvals</p>
                  <p className="text-sm text-gray-500">For production deploys</p>
                </div>
                <Input type="number" defaultValue={1} className="w-16 text-center" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowWorkflowSettingsDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={() => {
                toast.success('Workflow settings saved successfully')
                setShowWorkflowSettingsDialog(false)
              }}>
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* New Environment Dialog */}
        <Dialog open={showNewEnvDialog} onOpenChange={setShowNewEnvDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-amber-600" />
                Create Environment
              </DialogTitle>
              <DialogDescription>
                Create a new deployment environment
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Environment Name</label>
                <Input placeholder="e.g., staging" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <select className="w-full p-2 border rounded-lg bg-background">
                  <option>Development</option>
                  <option>Staging</option>
                  <option>Production</option>
                  <option>Testing</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">URL (optional)</label>
                <Input placeholder="https://staging.example.com" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowNewEnvDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={() => {
                toast.success('Environment created successfully')
                setShowNewEnvDialog(false)
              }}>
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Deploy Dialog */}
        <Dialog open={showDeployDialog} onOpenChange={setShowDeployDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-orange-600" />
                Deploy
              </DialogTitle>
              <DialogDescription>
                Deploy to an environment
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Environment</label>
                <select className="w-full p-2 border rounded-lg bg-background">
                  {mockEnvironments.map(env => (
                    <option key={env.id} value={env.id}>{env.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Build</label>
                <select className="w-full p-2 border rounded-lg bg-background">
                  {activeBuilds.filter((b: any) => b.status === 'success').slice(0, 5).map((build: any) => (
                    <option key={build.id} value={build.id}>#{build.build_number} - {build.workflow_name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowDeployDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={() => {
                toast.success('Deployment started successfully')
                setShowDeployDialog(false)
              }}>
                Deploy
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Protection Rules Dialog */}
        <Dialog open={showProtectionDialog} onOpenChange={setShowProtectionDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                Protection Rules
              </DialogTitle>
              <DialogDescription>
                Configure environment protection
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Required reviewers</p>
                  <p className="text-sm text-gray-500">Approval before deploy</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => {
                  toast.success('Required reviewers setting toggled')
                }}>Enabled</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Wait timer</p>
                  <p className="text-sm text-gray-500">Delay before deploy</p>
                </div>
                <Input type="number" defaultValue={15} className="w-20 text-center" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Branch restrictions</p>
                  <p className="text-sm text-gray-500">Only from specific branches</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => {
                  toast.success('Branch restrictions setting toggled')
                }}>Disabled</Button>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowProtectionDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={() => {
                toast.success('Protection rules saved successfully')
                setShowProtectionDialog(false)
              }}>
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Environment Secrets Dialog */}
        <Dialog open={showEnvSecretsDialog} onOpenChange={setShowEnvSecretsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-rose-600" />
                Environment Secrets
              </DialogTitle>
              <DialogDescription>
                Manage environment-specific secrets
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              {['DATABASE_URL', 'API_KEY', 'JWT_SECRET'].map(secret => (
                <div key={secret} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-400" />
                    <span className="font-mono text-sm">{secret}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-600" onClick={() => {
                    if (confirm('Delete this secret?')) {
                      toast.success('Secret deleted successfully')
                    }
                  }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" className="w-full" onClick={() => setShowAddSecretDialog(true)}>
                <Key className="w-4 h-4 mr-2" />
                Add Secret
              </Button>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowEnvSecretsDialog(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Variables Dialog */}
        <Dialog open={showVariablesDialog} onOpenChange={setShowVariablesDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-pink-600" />
                Environment Variables
              </DialogTitle>
              <DialogDescription>
                Manage environment variables
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              {[
                { key: 'NODE_ENV', value: 'production' },
                { key: 'LOG_LEVEL', value: 'info' },
                { key: 'CACHE_TTL', value: '3600' },
              ].map(variable => (
                <div key={variable.key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-mono text-sm">{variable.key}</span>
                    <span className="text-gray-400 mx-2">=</span>
                    <span className="text-sm text-gray-600">{variable.value}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => {
                    toast.info(`Editing variable: ${variable.key}`)
                  }}>
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" className="w-full" onClick={() => setShowAddVariableDialog(true)}>
                <Database className="w-4 h-4 mr-2" />
                Add Variable
              </Button>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowVariablesDialog(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reviewers Dialog */}
        <Dialog open={showReviewersDialog} onOpenChange={setShowReviewersDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-fuchsia-600" />
                Required Reviewers
              </DialogTitle>
              <DialogDescription>
                Manage deployment reviewers
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              {['Sarah Chen', 'Mike Wilson', 'Team Lead'].map(reviewer => (
                <div key={reviewer} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>{reviewer.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <span>{reviewer}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-600" onClick={() => {
                    if (confirm('Remove this reviewer?')) {
                      toast.success('Reviewer removed successfully')
                    }
                  }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" className="w-full" onClick={() => setShowAddReviewerDialog(true)}>
                <Users className="w-4 h-4 mr-2" />
                Add Reviewer
              </Button>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowReviewersDialog(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Deployment History Dialog */}
        <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                Deployment History
              </DialogTitle>
              <DialogDescription>
                View recent deployments
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4 max-h-[400px] overflow-auto">
              {activeBuilds.filter((b: any) => b.status === 'success').slice(0, 5).map((build: any, i: number) => (
                <div key={build.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor('success')}>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Success
                      </Badge>
                      <span className="font-medium">#{build.build_number}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{new Date(build.created_at).toLocaleString()}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => {
                    toast.info(`Viewing deployment #${build.build_number} details`)
                  }}>
                    View
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowHistoryDialog(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Environment Settings Dialog */}
        <Dialog open={showEnvSettingsDialog} onOpenChange={setShowEnvSettingsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-violet-600" />
                Environment Settings
              </DialogTitle>
              <DialogDescription>
                Configure environment preferences
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-deploy</p>
                  <p className="text-sm text-gray-500">Deploy on successful build</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => {
                  toast.success('Auto-deploy setting toggled')
                }}>Disabled</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Rollback on failure</p>
                  <p className="text-sm text-gray-500">Auto-rollback if deploy fails</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => {
                  toast.success('Rollback setting toggled')
                }}>Enabled</Button>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowEnvSettingsDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={() => {
                toast.success('Environment settings saved successfully')
                setShowEnvSettingsDialog(false)
              }}>
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Configure Environment Dialog */}
        <Dialog open={showConfigureEnvDialog} onOpenChange={setShowConfigureEnvDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-600" />
                Configure {selectedEnvironment?.name}
              </DialogTitle>
              <DialogDescription>
                Update environment configuration
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Environment URL</label>
                <Input placeholder="https://..." defaultValue={selectedEnvironment?.url || ''} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Wait Timer (minutes)</label>
                <Input type="number" defaultValue={selectedEnvironment?.wait_timer_minutes || 0} />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowConfigureEnvDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={() => {
                toast.success('Environment configuration updated')
                setShowConfigureEnvDialog(false)
              }}>
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Environment Dialog */}
        <Dialog open={showViewEnvDialog} onOpenChange={setShowViewEnvDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-gray-600" />
                {selectedEnvironment?.name}
              </DialogTitle>
              <DialogDescription>
                Environment details
              </DialogDescription>
            </DialogHeader>
            {selectedEnvironment && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="font-medium capitalize">{selectedEnvironment.type}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Deployments</p>
                    <p className="font-medium">{selectedEnvironment.total_deployments}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Secrets</p>
                    <p className="font-medium">{selectedEnvironment.secrets_count}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Variables</p>
                    <p className="font-medium">{selectedEnvironment.variables_count}</p>
                  </div>
                </div>
                {selectedEnvironment.url && (
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">URL</p>
                    <a href={selectedEnvironment.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {selectedEnvironment.url}
                    </a>
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowViewEnvDialog(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Download Artifacts Dialog */}
        <Dialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-600" />
                Download Artifact
              </DialogTitle>
              <DialogDescription>
                {selectedArtifact ? `Download ${selectedArtifact.name}` : 'Select an artifact to download'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {selectedArtifact ? (
                <div className="p-4 border rounded-lg">
                  <p className="font-medium">{selectedArtifact.name}</p>
                  <p className="text-sm text-gray-500">Size: {formatBytes(selectedArtifact.size_bytes)}</p>
                  <p className="text-sm text-gray-500">Build #{selectedArtifact.build_number}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Artifact</label>
                  <select className="w-full p-2 border rounded-lg bg-background">
                    {mockArtifacts.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({formatBytes(a.size_bytes)})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => {
                setShowDownloadDialog(false)
                setSelectedArtifact(null)
              }}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={() => {
                toast.success('Download started')
                setShowDownloadDialog(false)
                setSelectedArtifact(null)
              }}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Browse Artifacts Dialog */}
        <Dialog open={showBrowseArtifactsDialog} onOpenChange={setShowBrowseArtifactsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Box className="w-5 h-5 text-sky-600" />
                Browse Artifacts
              </DialogTitle>
              <DialogDescription>
                Browse all build artifacts
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4 max-h-[400px] overflow-auto">
              {mockArtifacts.map(artifact => (
                <div key={artifact.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getArtifactIcon(artifact.type)}
                    <div>
                      <p className="font-medium text-sm">{artifact.name}</p>
                      <p className="text-xs text-gray-500">{formatBytes(artifact.size_bytes)}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => {
                    setSelectedArtifact(artifact)
                    setShowBrowseArtifactsDialog(false)
                    setShowDownloadDialog(true)
                  }}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowBrowseArtifactsDialog(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reports Dialog */}
        <Dialog open={showReportsDialog} onOpenChange={setShowReportsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-600" />
                Build Reports
              </DialogTitle>
              <DialogDescription>
                View test and coverage reports
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              {mockArtifacts.filter(a => a.type === 'report' || a.type === 'coverage').map(artifact => (
                <div key={artifact.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getArtifactIcon(artifact.type)}
                    <div>
                      <p className="font-medium text-sm">{artifact.name}</p>
                      <p className="text-xs text-gray-500">Build #{artifact.build_number}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => {
                    toast.info(`Opening ${artifact.name} report`)
                  }}>
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowReportsDialog(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Archives Dialog */}
        <Dialog open={showArchivesDialog} onOpenChange={setShowArchivesDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Archive className="w-5 h-5 text-teal-600" />
                Build Archives
              </DialogTitle>
              <DialogDescription>
                View archived build outputs
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              {mockArtifacts.filter(a => a.type === 'archive').map(artifact => (
                <div key={artifact.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getArtifactIcon(artifact.type)}
                    <div>
                      <p className="font-medium text-sm">{artifact.name}</p>
                      <p className="text-xs text-gray-500">{formatBytes(artifact.size_bytes)}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => {
                    const blob = new Blob([`Archive: ${artifact.name}\nSize: ${artifact.size_bytes} bytes\nGenerated: ${new Date().toISOString()}`], { type: 'application/octet-stream' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = artifact.name
                    a.click()
                    URL.revokeObjectURL(url)
                    toast.success(`${artifact.name} download started`)
                  }}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowArchivesDialog(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Storage Dialog */}
        <Dialog open={showStorageDialog} onOpenChange={setShowStorageDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                Artifact Storage
              </DialogTitle>
              <DialogDescription>
                View storage usage and limits
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Storage Used</span>
                  <span className="font-medium">2.4 GB / 10 GB</span>
                </div>
                <Progress value={24} className="h-2" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-2xl font-bold">{mockArtifacts.length}</p>
                  <p className="text-sm text-gray-500">Total Artifacts</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-2xl font-bold">7 days</p>
                  <p className="text-sm text-gray-500">Retention</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowStorageDialog(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Cleanup Dialog */}
        <Dialog open={showCleanupDialog} onOpenChange={setShowCleanupDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-600" />
                Cleanup Artifacts
              </DialogTitle>
              <DialogDescription>
                Remove expired or old artifacts
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cleanup Options</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Remove expired artifacts</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Remove artifacts older than 30 days</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowCleanupDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" className="flex-1" onClick={() => {
                if (confirm('Cleanup expired artifacts?')) {
                  toast.success('Artifacts cleaned up successfully')
                  setShowCleanupDialog(false)
                } else {
                  setShowCleanupDialog(false)
                }
              }}>
                <Trash2 className="w-4 h-4 mr-2" />
                Cleanup
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Search Artifacts Dialog */}
        <Dialog open={showSearchArtifactsDialog} onOpenChange={setShowSearchArtifactsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 text-lime-600" />
                Search Artifacts
              </DialogTitle>
              <DialogDescription>
                Search through build artifacts
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input placeholder="Search by name, build number..." />
              <div className="space-y-2">
                <label className="text-sm font-medium">Type Filter</label>
                <div className="flex gap-2 flex-wrap">
                  {['All', 'Binary', 'Report', 'Logs', 'Docker'].map(type => (
                    <Badge key={type} variant="outline" className="cursor-pointer hover:bg-gray-100">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowSearchArtifactsDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={() => {
                toast.success('Search complete')
                setShowSearchArtifactsDialog(false)
              }}>
                Search
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Artifact Settings Dialog */}
        <Dialog open={showArtifactSettingsDialog} onOpenChange={setShowArtifactSettingsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-yellow-600" />
                Artifact Settings
              </DialogTitle>
              <DialogDescription>
                Configure artifact preferences
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Retention Period</p>
                  <p className="text-sm text-gray-500">Days to keep artifacts</p>
                </div>
                <Input type="number" defaultValue={7} className="w-20 text-center" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-cleanup</p>
                  <p className="text-sm text-gray-500">Remove expired automatically</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => {
                  toast.success('Auto-cleanup setting toggled')
                }}>Enabled</Button>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowArtifactSettingsDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={() => {
                toast.success('Artifact settings saved successfully')
                setShowArtifactSettingsDialog(false)
              }}>
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Secret Dialog */}
        <Dialog open={showAddSecretDialog} onOpenChange={setShowAddSecretDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-teal-600" />
                Add Secret
              </DialogTitle>
              <DialogDescription>
                Create a new repository secret
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Secret Name</label>
                <Input placeholder="e.g., API_KEY" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Secret Value</label>
                <Input type="password" placeholder="Enter secret value" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowAddSecretDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={() => {
                toast.success('Secret added successfully')
                setShowAddSecretDialog(false)
              }}>
                Add Secret
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Secret Dialog */}
        <Dialog open={showDeleteSecretDialog} onOpenChange={setShowDeleteSecretDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-600" />
                Delete Secret
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedSecret}?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <p className="text-sm text-red-700 dark:text-red-400">
                    This action cannot be undone. Workflows using this secret will fail.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => {
                setShowDeleteSecretDialog(false)
                setSelectedSecret(null)
              }}>
                Cancel
              </Button>
              <Button variant="destructive" className="flex-1" onClick={() => {
                toast.success('Secret deleted successfully')
                setShowDeleteSecretDialog(false)
                setSelectedSecret(null)
              }}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Copy Secret Dialog */}
        <Dialog open={showCopySecretDialog} onOpenChange={setShowCopySecretDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Copy className="w-5 h-5 text-blue-600" />
                Copy Secret Reference
              </DialogTitle>
              <DialogDescription>
                Copy the secret reference for use in workflows
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg font-mono text-sm">
                {`$\{{ secrets.${selectedSecret} }}`}
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => {
                setShowCopySecretDialog(false)
                setSelectedSecret(null)
              }}>
                Close
              </Button>
              <Button className="flex-1" onClick={() => {
                navigator.clipboard.writeText(`$\{{ secrets.${selectedSecret} }}`); toast.success('Copied to clipboard')
                setShowCopySecretDialog(false)
                setSelectedSecret(null)
              }}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Cache Dialog */}
        <Dialog open={showDeleteCacheDialog} onOpenChange={setShowDeleteCacheDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-600" />
                Delete Cache
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete cache {selectedCache}?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    Next build will need to rebuild this cache, which may increase build time.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => {
                setShowDeleteCacheDialog(false)
                setSelectedCache(null)
              }}>
                Cancel
              </Button>
              <Button variant="destructive" className="flex-1" onClick={() => {
                toast.success('Cache deleted successfully')
                setShowDeleteCacheDialog(false)
                setSelectedCache(null)
              }}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Schedule Dialog */}
        <Dialog open={showAddScheduleDialog} onOpenChange={setShowAddScheduleDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Add Schedule
              </DialogTitle>
              <DialogDescription>
                Create a new scheduled workflow trigger
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Schedule Name</label>
                <Input
                  placeholder="e.g., Nightly Build"
                  value={newScheduleName}
                  onChange={(e) => setNewScheduleName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cron Expression</label>
                <Input
                  placeholder="e.g., 0 0 * * * (daily at midnight)"
                  value={newScheduleCron}
                  onChange={(e) => setNewScheduleCron(e.target.value)}
                />
                <p className="text-xs text-gray-500">Use standard cron format: minute hour day month weekday</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Common schedules: 0 0 * * * (daily), 0 0 * * 0 (weekly), 0 */6 * * * (every 6 hours)
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => {
                setShowAddScheduleDialog(false)
                setNewScheduleName('')
                setNewScheduleCron('')
              }}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={() => {
                if (!newScheduleName || !newScheduleCron) {
                  toast.error('Please fill in all fields')
                  return
                }
                toast.success('Schedule created successfully')
                setShowAddScheduleDialog(false)
                setNewScheduleName('')
                setNewScheduleCron('')
              }}>
                Add Schedule
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Variable Dialog */}
        <Dialog open={showAddVariableDialog} onOpenChange={setShowAddVariableDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-pink-600" />
                Add Environment Variable
              </DialogTitle>
              <DialogDescription>
                Create a new environment variable
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Variable Name</label>
                <Input
                  placeholder="e.g., NODE_ENV"
                  value={newVariableKey}
                  onChange={(e) => setNewVariableKey(e.target.value.toUpperCase())}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Value</label>
                <Input
                  placeholder="e.g., production"
                  value={newVariableValue}
                  onChange={(e) => setNewVariableValue(e.target.value)}
                />
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Environment variables are available to all workflows in this repository.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => {
                setShowAddVariableDialog(false)
                setNewVariableKey('')
                setNewVariableValue('')
              }}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={() => {
                if (!newVariableKey || !newVariableValue) {
                  toast.error('Please fill in all fields')
                  return
                }
                toast.success('Variable added successfully')
                setShowAddVariableDialog(false)
                setNewVariableKey('')
                setNewVariableValue('')
              }}>
                Add Variable
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Reviewer Dialog */}
        <Dialog open={showAddReviewerDialog} onOpenChange={setShowAddReviewerDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-fuchsia-600" />
                Add Reviewer
              </DialogTitle>
              <DialogDescription>
                Add a required reviewer for deployments
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Reviewer Email or Username</label>
                <Input
                  placeholder="e.g., john@company.com or @johndoe"
                  value={newReviewerEmail}
                  onChange={(e) => setNewReviewerEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Suggested Reviewers</label>
                <div className="space-y-2">
                  {['Alice Chen', 'Bob Wilson', 'Carol Zhang'].map(reviewer => (
                    <div
                      key={reviewer}
                      className="flex items-center justify-between p-2 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => setNewReviewerEmail(reviewer.toLowerCase().replace(' ', '.'))}
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs">{reviewer.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{reviewer}</span>
                      </div>
                      <Badge variant="outline">Team Lead</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => {
                setShowAddReviewerDialog(false)
                setNewReviewerEmail('')
              }}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={() => {
                if (!newReviewerEmail) {
                  toast.error('Please enter a reviewer')
                  return
                }
                toast.success('Reviewer added successfully')
                setShowAddReviewerDialog(false)
                setNewReviewerEmail('')
              }}>
                Add Reviewer
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Build Logs Dialog (from Build Detail) */}
        <Dialog open={showBuildLogsDialog} onOpenChange={setShowBuildLogsDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-gray-600" />
                Build #{selectedBuild?.build_number} Logs
              </DialogTitle>
              <DialogDescription>
                View detailed build logs
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[400px] border rounded-lg bg-gray-950 p-4">
              <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
{`[${new Date().toISOString()}] Starting job: build
[${new Date().toISOString()}] Checking out repository...
[${new Date().toISOString()}] > git checkout ${selectedBuild?.branch || 'main'}
[${new Date().toISOString()}] Already on '${selectedBuild?.branch || 'main'}'
[${new Date().toISOString()}] Setting up Node.js 18.x...
[${new Date().toISOString()}] Node.js 18.19.0 installed
[${new Date().toISOString()}] Installing dependencies...
[${new Date().toISOString()}] > npm ci
[${new Date().toISOString()}] added 1247 packages in 45s
[${new Date().toISOString()}] Running build...
[${new Date().toISOString()}] > npm run build
[${new Date().toISOString()}] Build completed successfully
[${new Date().toISOString()}] Job completed with status: ${selectedBuild?.status || 'success'}`}
              </pre>
            </ScrollArea>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => {
                const logs = `Build #${selectedBuild?.build_number} Logs
[${new Date().toISOString()}] Starting job: build
[${new Date().toISOString()}] Checking out repository...
[${new Date().toISOString()}] Build completed with status: ${selectedBuild?.status || 'success'}`
                const blob = new Blob([logs], { type: 'text/plain' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `build-${selectedBuild?.build_number}-logs.txt`
                a.click()
                URL.revokeObjectURL(url)
                toast.success('Logs download started')
              }}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" onClick={() => setShowBuildLogsDialog(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Build Artifacts Dialog (from Build Detail) */}
        <Dialog open={showBuildArtifactsDialog} onOpenChange={setShowBuildArtifactsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-600" />
                Build #{selectedBuild?.build_number} Artifacts
              </DialogTitle>
              <DialogDescription>
                Download artifacts from this build
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4 max-h-[300px] overflow-auto">
              {mockArtifacts.filter(a => a.build_id === selectedBuild?.id || a.build_number === selectedBuild?.build_number).length > 0 ? (
                mockArtifacts.filter(a => a.build_id === selectedBuild?.id || a.build_number === selectedBuild?.build_number).map(artifact => (
                  <div key={artifact.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getArtifactIcon(artifact.type)}
                      <div>
                        <p className="font-medium text-sm">{artifact.name}</p>
                        <p className="text-xs text-gray-500">{formatBytes(artifact.size_bytes)}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => {
                      const blob = new Blob([`Artifact: ${artifact.name}\nSize: ${artifact.size_bytes} bytes\nBuild: #${selectedBuild?.build_number}`], { type: 'application/octet-stream' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = artifact.name
                      a.click()
                      URL.revokeObjectURL(url)
                      toast.success(`${artifact.name} download started`)
                    }}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Archive className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No artifacts for this build</p>
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowBuildArtifactsDialog(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Re-run Build Dialog */}
        <Dialog open={showRerunBuildDialog} onOpenChange={setShowRerunBuildDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-teal-600" />
                Re-run Build #{selectedBuild?.build_number}
              </DialogTitle>
              <DialogDescription>
                Re-run this build with the same configuration
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Workflow className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{selectedBuild?.workflow_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <GitBranch className="w-3 h-3" />
                  <span>{selectedBuild?.branch}</span>
                  <span>•</span>
                  <GitCommit className="w-3 h-3" />
                  <span>{selectedBuild?.commit_hash.substring(0, 7)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  This will create a new build run with attempt #{(selectedBuild?.run_attempt || 1) + 1}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowRerunBuildDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-600 text-white" onClick={() => {
                toast.success('Build re-run started successfully')
                setShowRerunBuildDialog(false)
              }}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Re-run
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Workflow File Dialog */}
        <Dialog open={showViewFileDialog} onOpenChange={setShowViewFileDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                {selectedWorkflow?.file_path}
              </DialogTitle>
              <DialogDescription>
                View workflow configuration file
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[400px] border rounded-lg bg-gray-950 p-4">
              <pre className="text-xs text-cyan-400 font-mono whitespace-pre-wrap">
{`name: ${selectedWorkflow?.name || 'CI Pipeline'}

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Run tests
        run: npm test
      - name: Upload coverage
        uses: codecov/codecov-action@v3`}
              </pre>
            </ScrollArea>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => {
                navigator.clipboard.writeText(`name: ${selectedWorkflow?.name || 'CI Pipeline'}...`)
                toast.success('Workflow file copied to clipboard')
              }}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" onClick={() => setShowViewFileDialog(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Run Single Workflow Dialog */}
        <Dialog open={showRunSingleWorkflowDialog} onOpenChange={setShowRunSingleWorkflowDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-teal-600" />
                Run {selectedWorkflow?.name}
              </DialogTitle>
              <DialogDescription>
                Trigger this workflow manually
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Branch</label>
                <select className="w-full p-2 border rounded-lg bg-background">
                  {selectedWorkflow?.branches.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Input Parameters (optional)</label>
                <Input placeholder="key=value" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowRunSingleWorkflowDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-600 text-white" onClick={() => {
                toast.success(`${selectedWorkflow?.name} triggered successfully`)
                setShowRunSingleWorkflowDialog(false)
              }}>
                <Play className="w-4 h-4 mr-2" />
                Run
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
