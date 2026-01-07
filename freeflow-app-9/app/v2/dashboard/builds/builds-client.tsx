'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
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
  const [activeTab, setActiveTab] = useState('builds')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<BuildStatus | 'all'>('all')
  const [selectedBuild, setSelectedBuild] = useState<Build | null>(null)
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)

  // Dialog states for quick actions
  const [showNewBuildDialog, setShowNewBuildDialog] = useState(false)
  const [showRetryBuildDialog, setShowRetryBuildDialog] = useState(false)
  const [showLogsDialog, setShowLogsDialog] = useState(false)

  // Quick actions with proper dialog handlers
  const buildsQuickActions = [
    { id: '1', label: 'New Build', icon: 'plus', action: () => setShowNewBuildDialog(true), variant: 'default' as const },
    { id: '2', label: 'Retry', icon: 'refresh-cw', action: () => setShowRetryBuildDialog(true), variant: 'default' as const },
    { id: '3', label: 'Logs', icon: 'file-text', action: () => setShowLogsDialog(true), variant: 'outline' as const },
  ]

  // Filtered data
  const filteredBuilds = useMemo(() => {
    return mockBuilds.filter(build => {
      const matchesSearch =
        build.workflow_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        build.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
        build.commit_message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        build.author_name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || build.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [searchQuery, statusFilter])

  // Stats calculations
  const stats = useMemo(() => {
    const total = mockBuilds.length
    const success = mockBuilds.filter(b => b.status === 'success').length
    const failed = mockBuilds.filter(b => b.status === 'failed').length
    const running = mockBuilds.filter(b => b.status === 'running').length
    const avgDuration = mockBuilds.reduce((acc, b) => acc + b.total_duration_seconds, 0) / total
    const avgCoverage = mockBuilds.filter(b => b.coverage_percentage > 0).reduce((acc, b) => acc + b.coverage_percentage, 0) / mockBuilds.filter(b => b.coverage_percentage > 0).length
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
    toast.info('Build triggered', {
      description: 'Starting new build...'
    })
  }

  const handleCancelBuild = (build: Build) => {
    toast.success('Build cancelled', {
      description: `Build #${build.number} has been cancelled`
    })
  }

  const handleRetryBuild = (build: Build) => {
    toast.info('Retrying build', {
      description: `Restarting build #${build.number}`
    })
  }

  const handleDownloadArtifact = (artifactName: string) => {
    toast.success('Download started', {
      description: `Downloading ${artifactName}`
    })
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
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white">
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
                    <p className="text-3xl font-bold">{mockBuilds.length}</p>
                    <p className="text-emerald-200 text-sm">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockBuilds.filter(b => b.status === 'success').length}</p>
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
                { icon: Play, label: 'Run Build', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
                { icon: RefreshCw, label: 'Rebuild', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' },
                { icon: GitBranch, label: 'Branches', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400' },
                { icon: Terminal, label: 'Logs', color: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400' },
                { icon: Download, label: 'Artifacts', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
                { icon: BarChart3, label: 'Analytics', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
                { icon: Search, label: 'Search', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' },
                { icon: Settings, label: 'Settings', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
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
                          <AvatarImage src={build.author_avatar} />
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
                { icon: Workflow, label: 'New Workflow', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
                { icon: Play, label: 'Run All', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' },
                { icon: FileText, label: 'Templates', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
                { icon: GitBranch, label: 'Triggers', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
                { icon: Timer, label: 'Schedules', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400' },
                { icon: Lock, label: 'Secrets', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' },
                { icon: Archive, label: 'Archive', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
                { icon: Settings, label: 'Settings', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
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
                      <div className="grid grid-cols-3 gap-3 text-center">
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
                { icon: Globe, label: 'New Env', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
                { icon: Cloud, label: 'Deploy', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
                { icon: Shield, label: 'Protection', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
                { icon: Key, label: 'Secrets', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' },
                { icon: Database, label: 'Variables', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
                { icon: Users, label: 'Reviewers', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400' },
                { icon: Activity, label: 'History', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
                { icon: Settings, label: 'Settings', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' },
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
                      <div className="grid grid-cols-3 gap-4">
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
                          <Button variant="outline" size="sm">
                            <Settings className="w-3 h-3 mr-1" />
                            Configure
                          </Button>
                          <Button variant="outline" size="sm">
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
                { icon: Download, label: 'Download', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
                { icon: Box, label: 'Browse', color: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400' },
                { icon: FileText, label: 'Reports', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400' },
                { icon: Archive, label: 'Archives', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' },
                { icon: Database, label: 'Storage', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
                { icon: Trash2, label: 'Cleanup', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
                { icon: Search, label: 'Search', color: 'bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400' },
                { icon: Settings, label: 'Settings', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' },
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

            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Build Artifacts</CardTitle>
                    <CardDescription>Download build outputs and reports</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
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
                      <Button variant="outline" size="sm">
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
                      <div className="grid grid-cols-2 gap-3 text-sm">
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
                          <Button variant="ghost" size="sm">
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full mt-3">
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
                        <Button variant="ghost" size="sm" className="text-red-600">
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
                      <Input type="number" defaultValue={5} className="w-20 text-center" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Queue pending jobs</p>
                        <p className="text-sm text-gray-500">Hold jobs when limit reached</p>
                      </div>
                      <Button variant="outline" size="sm">Enabled</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Cancel in-progress on new push</p>
                        <p className="text-sm text-gray-500">Stop old runs when new commits arrive</p>
                      </div>
                      <Button variant="outline" size="sm">Disabled</Button>
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
              onInsightAction={(insight) => toast.promise(
                new Promise(resolve => setTimeout(resolve, 800)),
                { loading: `Processing ${insight.title}...`, success: `${insight.title} action completed`, error: 'Action failed' }
              )}
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
                    <Button variant="outline" className="flex-1">
                      <Eye className="w-4 h-4 mr-2" />
                      View Logs
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      Artifacts
                    </Button>
                    <Button className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-600 text-white">
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

                <div className="grid grid-cols-3 gap-4">
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
                  <Button variant="outline" className="flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    View File
                  </Button>
                  <Button className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-600 text-white">
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
                  toast.success('Build started', { description: 'New build has been queued' })
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
                  {mockBuilds.slice(0, 5).map(build => (
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
                  toast.success('Build retry initiated', { description: 'The build will restart shortly' })
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
                  {mockBuilds.slice(0, 5).map(build => (
                    <option key={build.id} value={build.id}>
                      #{build.build_number} - {build.workflow_name}
                    </option>
                  ))}
                </select>
                <Button variant="outline" size="sm">
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
      </div>
    </div>
  )
}
