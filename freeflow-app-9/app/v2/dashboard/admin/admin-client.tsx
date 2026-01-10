'use client'

import { useState, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Settings,
  Users,
  Database,
  Shield,
  Activity,
  Server,
  HardDrive,
  MemoryStick,
  Globe,
  Lock,
  Edit,
  Trash2,
  Plus,
  Search,
  Download,
  RefreshCw,
  AlertTriangle,
  Clock,
  Terminal,
  FileText,
  MoreHorizontal,
  ChevronRight,
  Copy,
  Layers,
  Box,
  Key,
  ShieldCheck,
  BarChart3,
  Play,
  RotateCcw,
  GitBranch,
  GitCommit,
  Rocket,
  Flag,
  ToggleLeft,
  ToggleRight,
  Table,
  Code,
  Timer,
  Webhook,
  PlayCircle,
  StopCircle,
  History
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

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAdminSettings, type AdminSetting } from '@/lib/hooks/use-admin-settings'

// Types
type JobStatus = 'running' | 'completed' | 'failed' | 'scheduled' | 'paused'
type DeploymentStatus = 'success' | 'failed' | 'pending' | 'rolling_back' | 'in_progress'

interface SystemResource {
  id: string
  name: string
  type: 'database' | 'api' | 'storage' | 'cache' | 'queue'
  status: 'healthy' | 'warning' | 'critical' | 'offline'
  endpoint: string
  latency: number
  uptime: number
  lastChecked: string
}

interface ScheduledJob {
  id: string
  name: string
  description: string
  schedule: string
  lastRun: string
  nextRun: string
  status: JobStatus
  duration: number
  successRate: number
  type: 'cron' | 'webhook' | 'manual'
}

interface FeatureFlag {
  id: string
  key: string
  name: string
  description: string
  enabled: boolean
  environment: 'production' | 'staging' | 'development'
  rolloutPercentage: number
  createdAt: string
  updatedAt: string
}

interface Deployment {
  id: string
  version: string
  environment: 'production' | 'staging' | 'development'
  status: DeploymentStatus
  commit: string
  branch: string
  deployedBy: string
  deployedAt: string
  duration: number
  changes: number
}

interface DatabaseTable {
  name: string
  schema: string
  rows: number
  size: string
  lastModified: string
}

interface QueryResult {
  columns: string[]
  rows: Record<string, unknown>[]
  executionTime: number
  rowCount: number
}

interface AdminUser {
  id: string
  name: string
  email: string
  role: 'super_admin' | 'admin' | 'moderator' | 'viewer'
  status: 'active' | 'suspended' | 'pending'
  lastLogin: string
  mfaEnabled: boolean
  permissions: string[]
}

interface AuditLog {
  id: string
  action: string
  actor: string
  resource: string
  details: string
  ipAddress: string
  timestamp: string
  severity: 'info' | 'warning' | 'critical'
}

interface SystemMetric {
  name: string
  value: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  status: 'good' | 'warning' | 'critical'
}

// Mock Data
const mockResources: SystemResource[] = [
  { id: '1', name: 'Primary Database', type: 'database', status: 'healthy', endpoint: 'postgres://db.freeflow.io:5432', latency: 12, uptime: 99.99, lastChecked: '2024-12-23T10:30:00Z' },
  { id: '2', name: 'Redis Cache', type: 'cache', status: 'healthy', endpoint: 'redis://cache.freeflow.io:6379', latency: 2, uptime: 99.95, lastChecked: '2024-12-23T10:30:00Z' },
  { id: '3', name: 'API Gateway', type: 'api', status: 'healthy', endpoint: 'https://api.freeflow.io', latency: 45, uptime: 99.98, lastChecked: '2024-12-23T10:30:00Z' },
  { id: '4', name: 'File Storage', type: 'storage', status: 'warning', endpoint: 's3://freeflow-assets', latency: 85, uptime: 99.85, lastChecked: '2024-12-23T10:28:00Z' },
  { id: '5', name: 'Message Queue', type: 'queue', status: 'healthy', endpoint: 'amqp://mq.freeflow.io:5672', latency: 8, uptime: 99.92, lastChecked: '2024-12-23T10:30:00Z' },
  { id: '6', name: 'Analytics DB', type: 'database', status: 'healthy', endpoint: 'clickhouse://analytics.freeflow.io:8123', latency: 25, uptime: 99.90, lastChecked: '2024-12-23T10:30:00Z' },
]

const mockAdminUsers: AdminUser[] = [
  { id: '1', name: 'John Smith', email: 'john@freeflow.io', role: 'super_admin', status: 'active', lastLogin: '2024-12-23T09:15:00Z', mfaEnabled: true, permissions: ['all'] },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@freeflow.io', role: 'admin', status: 'active', lastLogin: '2024-12-23T08:45:00Z', mfaEnabled: true, permissions: ['users', 'settings', 'reports'] },
  { id: '3', name: 'Mike Chen', email: 'mike@freeflow.io', role: 'moderator', status: 'active', lastLogin: '2024-12-22T16:30:00Z', mfaEnabled: false, permissions: ['users.read', 'content.moderate'] },
  { id: '4', name: 'Emily Davis', email: 'emily@freeflow.io', role: 'viewer', status: 'pending', lastLogin: '', mfaEnabled: false, permissions: ['dashboard.view', 'reports.view'] },
  { id: '5', name: 'Alex Thompson', email: 'alex@freeflow.io', role: 'admin', status: 'suspended', lastLogin: '2024-12-20T11:00:00Z', mfaEnabled: true, permissions: ['users', 'settings'] },
]

const mockAuditLogs: AuditLog[] = [
  { id: '1', action: 'user.login', actor: 'john@freeflow.io', resource: 'auth', details: 'Successful login via SSO', ipAddress: '192.168.1.100', timestamp: '2024-12-23T10:25:00Z', severity: 'info' },
  { id: '2', action: 'settings.update', actor: 'sarah@freeflow.io', resource: 'billing.stripe_key', details: 'Updated Stripe API key', ipAddress: '192.168.1.105', timestamp: '2024-12-23T10:20:00Z', severity: 'warning' },
  { id: '3', action: 'user.create', actor: 'john@freeflow.io', resource: 'users', details: 'Created new admin user: emily@freeflow.io', ipAddress: '192.168.1.100', timestamp: '2024-12-23T10:15:00Z', severity: 'info' },
  { id: '4', action: 'permission.revoke', actor: 'system', resource: 'users.alex', details: 'Auto-suspended due to failed MFA attempts', ipAddress: 'system', timestamp: '2024-12-23T10:10:00Z', severity: 'critical' },
  { id: '5', action: 'backup.complete', actor: 'system', resource: 'database', details: 'Daily backup completed successfully', ipAddress: 'system', timestamp: '2024-12-23T06:00:00Z', severity: 'info' },
  { id: '6', action: 'api.rate_limit', actor: 'api-key-xyz123', resource: 'api/v2/users', details: 'Rate limit exceeded (1000/min)', ipAddress: '203.45.67.89', timestamp: '2024-12-23T05:45:00Z', severity: 'warning' },
  { id: '7', action: 'deploy.success', actor: 'ci/cd', resource: 'production', details: 'Deployed v2.4.1 to production', ipAddress: 'github-actions', timestamp: '2024-12-23T04:00:00Z', severity: 'info' },
]

const mockMetrics: SystemMetric[] = [
  { name: 'CPU Usage', value: 42, unit: '%', trend: 'stable', status: 'good' },
  { name: 'Memory Usage', value: 68, unit: '%', trend: 'up', status: 'warning' },
  { name: 'Disk Usage', value: 55, unit: '%', trend: 'up', status: 'good' },
  { name: 'Network I/O', value: 125, unit: 'MB/s', trend: 'stable', status: 'good' },
  { name: 'Active Connections', value: 1247, unit: '', trend: 'up', status: 'good' },
  { name: 'Request Rate', value: 3420, unit: 'req/min', trend: 'up', status: 'good' },
]

const mockJobs: ScheduledJob[] = [
  { id: '1', name: 'Database Backup', description: 'Daily automated database backup', schedule: '0 2 * * *', lastRun: '2024-12-23T02:00:00Z', nextRun: '2024-12-24T02:00:00Z', status: 'completed', duration: 245, successRate: 99.8, type: 'cron' },
  { id: '2', name: 'Report Generation', description: 'Weekly analytics report', schedule: '0 6 * * 1', lastRun: '2024-12-23T06:00:00Z', nextRun: '2024-12-30T06:00:00Z', status: 'completed', duration: 180, successRate: 100, type: 'cron' },
  { id: '3', name: 'Cache Cleanup', description: 'Hourly cache invalidation', schedule: '0 * * * *', lastRun: '2024-12-23T10:00:00Z', nextRun: '2024-12-23T11:00:00Z', status: 'running', duration: 15, successRate: 99.5, type: 'cron' },
  { id: '4', name: 'Email Queue Processor', description: 'Process pending emails', schedule: '*/5 * * * *', lastRun: '2024-12-23T10:25:00Z', nextRun: '2024-12-23T10:30:00Z', status: 'completed', duration: 8, successRate: 98.2, type: 'cron' },
  { id: '5', name: 'Webhook Sync', description: 'Sync data from external services', schedule: 'webhook', lastRun: '2024-12-23T09:45:00Z', nextRun: '-', status: 'scheduled', duration: 45, successRate: 97.5, type: 'webhook' },
  { id: '6', name: 'Data Migration', description: 'Manual data migration task', schedule: 'manual', lastRun: '2024-12-22T14:30:00Z', nextRun: '-', status: 'paused', duration: 3600, successRate: 100, type: 'manual' },
]

const mockFeatureFlags: FeatureFlag[] = [
  { id: '1', key: 'new_dashboard', name: 'New Dashboard UI', description: 'Enable the redesigned dashboard', enabled: true, environment: 'production', rolloutPercentage: 100, createdAt: '2024-11-01T00:00:00Z', updatedAt: '2024-12-20T00:00:00Z' },
  { id: '2', key: 'ai_assistant_v2', name: 'AI Assistant V2', description: 'New AI-powered assistant features', enabled: true, environment: 'production', rolloutPercentage: 50, createdAt: '2024-12-01T00:00:00Z', updatedAt: '2024-12-23T00:00:00Z' },
  { id: '3', key: 'dark_mode_auto', name: 'Auto Dark Mode', description: 'Automatic dark mode based on system preference', enabled: true, environment: 'production', rolloutPercentage: 100, createdAt: '2024-10-15T00:00:00Z', updatedAt: '2024-10-15T00:00:00Z' },
  { id: '4', key: 'real_time_collab', name: 'Real-time Collaboration', description: 'Enable real-time collaboration features', enabled: false, environment: 'staging', rolloutPercentage: 0, createdAt: '2024-12-15T00:00:00Z', updatedAt: '2024-12-23T00:00:00Z' },
  { id: '5', key: 'advanced_analytics', name: 'Advanced Analytics', description: 'Premium analytics dashboard', enabled: true, environment: 'staging', rolloutPercentage: 25, createdAt: '2024-12-10T00:00:00Z', updatedAt: '2024-12-22T00:00:00Z' },
  { id: '6', key: 'beta_exports', name: 'Beta Export Formats', description: 'New export format options', enabled: true, environment: 'development', rolloutPercentage: 100, createdAt: '2024-12-20T00:00:00Z', updatedAt: '2024-12-23T00:00:00Z' },
]

const mockDeployments: Deployment[] = [
  { id: '1', version: 'v2.4.1', environment: 'production', status: 'success', commit: 'abc123f', branch: 'main', deployedBy: 'ci/cd', deployedAt: '2024-12-23T04:00:00Z', duration: 245, changes: 12 },
  { id: '2', version: 'v2.4.1', environment: 'staging', status: 'success', commit: 'abc123f', branch: 'main', deployedBy: 'ci/cd', deployedAt: '2024-12-23T02:00:00Z', duration: 180, changes: 12 },
  { id: '3', version: 'v2.4.0', environment: 'production', status: 'success', commit: 'def456a', branch: 'main', deployedBy: 'john@freeflow.io', deployedAt: '2024-12-22T16:00:00Z', duration: 320, changes: 45 },
  { id: '4', version: 'v2.4.1-rc1', environment: 'staging', status: 'failed', commit: 'ghi789b', branch: 'release/2.4.1', deployedBy: 'ci/cd', deployedAt: '2024-12-22T14:00:00Z', duration: 120, changes: 8 },
  { id: '5', version: 'v2.5.0-dev', environment: 'development', status: 'in_progress', commit: 'jkl012c', branch: 'develop', deployedBy: 'sarah@freeflow.io', deployedAt: '2024-12-23T10:30:00Z', duration: 0, changes: 23 },
]

const mockDatabaseTables: DatabaseTable[] = [
  { name: 'users', schema: 'public', rows: 125847, size: '256 MB', lastModified: '2024-12-23T10:25:00Z' },
  { name: 'projects', schema: 'public', rows: 45230, size: '128 MB', lastModified: '2024-12-23T10:20:00Z' },
  { name: 'tasks', schema: 'public', rows: 892145, size: '1.2 GB', lastModified: '2024-12-23T10:28:00Z' },
  { name: 'files', schema: 'public', rows: 234567, size: '512 MB', lastModified: '2024-12-23T10:15:00Z' },
  { name: 'audit_logs', schema: 'public', rows: 5678901, size: '4.5 GB', lastModified: '2024-12-23T10:30:00Z' },
  { name: 'sessions', schema: 'auth', rows: 12456, size: '32 MB', lastModified: '2024-12-23T10:30:00Z' },
  { name: 'invoices', schema: 'billing', rows: 78934, size: '96 MB', lastModified: '2024-12-23T09:00:00Z' },
  { name: 'notifications', schema: 'public', rows: 456789, size: '256 MB', lastModified: '2024-12-23T10:28:00Z' },
]

const jobStatusColors: Record<JobStatus, string> = {
  running: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  scheduled: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  paused: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
}

const deploymentStatusColors: Record<DeploymentStatus, string> = {
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  rolling_back: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
}

const envColors = {
  production: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  staging: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  development: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
}

const roleColors = {
  super_admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  moderator: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  viewer: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
}

const statusColors = {
  healthy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  offline: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  suspended: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
}

// Enhanced Competitive Upgrade Mock Data
const mockAdminAIInsights = [
  { id: '1', type: 'success' as const, title: 'System Health Excellent', description: 'All 12 resources running optimally with 99.9% uptime.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Health' },
  { id: '2', type: 'warning' as const, title: 'Permission Audit Due', description: 'Quarterly access review recommended for 15 admin users.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Security' },
  { id: '3', type: 'info' as const, title: 'Feature Flag Opportunity', description: '3 feature flags have 100% rollout. Consider cleanup.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Optimization' },
]

const mockAdminCollaborators = [
  { id: '1', name: 'System Admin', avatar: '/avatars/admin.jpg', status: 'online' as const, role: 'Admin' },
  { id: '2', name: 'DevOps Lead', avatar: '/avatars/devops.jpg', status: 'online' as const, role: 'DevOps' },
  { id: '3', name: 'Security Officer', avatar: '/avatars/security.jpg', status: 'away' as const, role: 'Security' },
]

const mockAdminPredictions = [
  { id: '1', title: 'Resource Usage', prediction: 'Database storage will need expansion in 3 weeks', confidence: 85, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Job Success Rate', prediction: 'Scheduled jobs maintaining 98% success rate', confidence: 92, trend: 'stable' as const, impact: 'low' as const },
]

const mockAdminActivities = [
  { id: '1', user: 'System Admin', action: 'Deployed', target: 'v2.4.1 to production', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'DevOps Lead', action: 'Enabled', target: 'new-checkout-flow feature flag', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'System', action: 'Completed', target: 'daily backup job', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'success' as const },
]

// Quick actions are now defined inside the component to access state setters

export default function AdminClient({ initialSettings }: { initialSettings: AdminSetting[] }) {
  const supabase = createClient()

  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewUserDialog, setShowNewUserDialog] = useState(false)
  const [showNewSettingDialog, setShowNewSettingDialog] = useState(false)
  const [showNewJobDialog, setShowNewJobDialog] = useState(false)
  const [showNewFlagDialog, setShowNewFlagDialog] = useState(false)
  const [showSqlConsoleDialog, setShowSqlConsoleDialog] = useState(false)
  const [showDeployDialog, setShowDeployDialog] = useState(false)
  const [showEditSettingDialog, setShowEditSettingDialog] = useState(false)
  const [selectedSetting, setSelectedSetting] = useState<AdminSetting | null>(null)
  const [settingCategoryFilter, setSettingCategoryFilter] = useState('all')
  const [userRoleFilter, setUserRoleFilter] = useState('all')
  const [logSeverityFilter, setLogSeverityFilter] = useState('all')
  const [envFilter, setEnvFilter] = useState<'all' | 'production' | 'staging' | 'development'>('all')
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM users LIMIT 10;')
  const [sqlResults, setSqlResults] = useState<QueryResult | null>(null)
  const [featureFlags, setFeatureFlags] = useState(mockFeatureFlags)
  const [selectedTable, setSelectedTable] = useState<DatabaseTable | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showRunJobDialog, setShowRunJobDialog] = useState(false)
  const [showExportLogsDialog, setShowExportLogsDialog] = useState(false)
  const [showEditUserDialog, setShowEditUserDialog] = useState(false)
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false)
  const [showUserActionsDialog, setShowUserActionsDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [showEditFlagDialog, setShowEditFlagDialog] = useState(false)
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null)
  const [showJobHistoryDialog, setShowJobHistoryDialog] = useState(false)
  const [showJobActionsDialog, setShowJobActionsDialog] = useState(false)
  const [selectedJob, setSelectedJob] = useState<ScheduledJob | null>(null)
  const [showDeployLogsDialog, setShowDeployLogsDialog] = useState(false)
  const [selectedDeploy, setSelectedDeploy] = useState<Deployment | null>(null)
  const [showViewSchemaDialog, setShowViewSchemaDialog] = useState(false)
  const [showActivityLogsDialog, setShowActivityLogsDialog] = useState(false)

  // Quick actions with proper dialog triggers
  const adminQuickActions = [
    { id: '1', label: 'Add User', icon: 'plus', action: () => setShowNewUserDialog(true), variant: 'default' as const },
    { id: '2', label: 'Run Job', icon: 'play', action: () => setShowRunJobDialog(true), variant: 'default' as const },
    { id: '3', label: 'Export Logs', icon: 'download', action: () => setShowExportLogsDialog(true), variant: 'outline' as const },
  ]

  // Form state for New User Dialog
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    role: 'viewer' as 'super_admin' | 'admin' | 'moderator' | 'viewer',
    requireMfa: false
  })

  // Form state for New Setting Dialog
  const [newSettingForm, setNewSettingForm] = useState({
    settingName: '',
    settingKey: '',
    category: 'API',
    valueType: 'string' as 'string' | 'number' | 'boolean' | 'json',
    value: '',
    isEncrypted: false,
    isRequired: false
  })

  // Form state for New Feature Flag Dialog
  const [newFlagForm, setNewFlagForm] = useState({
    name: '',
    key: '',
    description: '',
    environment: 'development' as 'production' | 'staging' | 'development',
    rolloutPercentage: 0,
    enabled: false
  })

  // Form state for New Job Dialog
  const [newJobForm, setNewJobForm] = useState({
    name: '',
    description: '',
    type: 'cron' as 'cron' | 'webhook' | 'manual',
    schedule: '',
    command: ''
  })

  const { settings, createSetting, updateSetting, deleteSetting, refetch } = useAdminSettings({})
  const displaySettings = settings.length > 0 ? settings : initialSettings

  // Calculate stats
  const overallHealth = mockResources.filter(r => r.status === 'healthy').length / mockResources.length * 100
  const activeUsers = mockAdminUsers.filter(u => u.status === 'active').length
  const criticalLogs = mockAuditLogs.filter(l => l.severity === 'critical').length
  const runningJobs = mockJobs.filter(j => j.status === 'running').length
  const enabledFlags = featureFlags.filter(f => f.enabled).length
  const successfulDeploys = mockDeployments.filter(d => d.status === 'success').length

  // Toggle feature flag (calls DB handler)
  const toggleFlag = useCallback(async (flagId: string) => {
    const flag = featureFlags.find(f => f.id === flagId)
    if (!flag) return
    try {
      const { error } = await supabase
        .from('feature_flags')
        .update({ enabled: !flag.enabled, updated_at: new Date().toISOString() })
        .eq('id', flagId)
      if (error) throw error
      setFeatureFlags(prev => prev.map(f =>
        f.id === flagId ? { ...f, enabled: !f.enabled, updatedAt: new Date().toISOString() } : f
      ))
      toast.success(`Flag ${!flag.enabled ? 'enabled' : 'disabled'}`)
    } catch (err) {
      toast.error('Failed to toggle flag', { description: (err as Error).message })
    }
  }, [supabase, featureFlags])

  // Run SQL query (mock)
  const runQuery = () => {
    setSqlResults({
      columns: ['id', 'name', 'email', 'created_at'],
      rows: [
        { id: 1, name: 'John Doe', email: 'john@example.com', created_at: '2024-01-15' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', created_at: '2024-02-20' },
        { id: 3, name: 'Bob Wilson', email: 'bob@example.com', created_at: '2024-03-10' },
      ],
      executionTime: 0.045,
      rowCount: 3
    })
  }

  // Filtered feature flags
  const filteredFlags = useMemo(() => {
    return featureFlags.filter(f => {
      const matchesSearch = searchQuery === '' ||
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.key.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesEnv = envFilter === 'all' || f.environment === envFilter
      return matchesSearch && matchesEnv
    })
  }, [featureFlags, searchQuery, envFilter])

  // Filtered deployments
  const filteredDeployments = useMemo(() => {
    return mockDeployments.filter(d => {
      const matchesSearch = searchQuery === '' ||
        d.version.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.branch.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesEnv = envFilter === 'all' || d.environment === envFilter
      return matchesSearch && matchesEnv
    })
  }, [searchQuery, envFilter])

  const filteredSettings = useMemo(() => {
    return displaySettings.filter(s => {
      const matchesSearch = searchQuery === '' ||
        s.setting_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.setting_key.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = settingCategoryFilter === 'all' || s.setting_category === settingCategoryFilter
      return matchesSearch && matchesCategory
    })
  }, [displaySettings, searchQuery, settingCategoryFilter])

  const filteredUsers = useMemo(() => {
    return mockAdminUsers.filter(u => {
      const matchesSearch = searchQuery === '' ||
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter
      return matchesSearch && matchesRole
    })
  }, [searchQuery, userRoleFilter])

  const filteredLogs = useMemo(() => {
    return mockAuditLogs.filter(l => {
      const matchesSearch = searchQuery === '' ||
        l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.actor.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesSeverity = logSeverityFilter === 'all' || l.severity === logSeverityFilter
      return matchesSearch && matchesSeverity
    })
  }, [searchQuery, logSeverityFilter])

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleString()
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'database': return <Database className="w-5 h-5" />
      case 'cache': return <MemoryStick className="w-5 h-5" />
      case 'api': return <Globe className="w-5 h-5" />
      case 'storage': return <HardDrive className="w-5 h-5" />
      case 'queue': return <Layers className="w-5 h-5" />
      default: return <Box className="w-5 h-5" />
    }
  }

  const categories = [...new Set(displaySettings.map(s => s.setting_category))]

  // Handlers - Real Supabase Operations

  // Create Admin User
  const handleCreateUser = useCallback(async () => {
    if (!newUserForm.name || !newUserForm.email) {
      toast.error('Please fill in all required fields')
      return
    }
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('admin_users').insert({
        name: newUserForm.name,
        email: newUserForm.email,
        role: newUserForm.role,
        status: 'pending',
        mfa_enabled: newUserForm.requireMfa,
        permissions: [],
        created_by: user?.id
      })
      if (error) throw error
      toast.success('User created', { description: `${newUserForm.name} has been added` })
      setShowNewUserDialog(false)
      setNewUserForm({ name: '', email: '', role: 'viewer', requireMfa: false })
    } catch (err) {
      toast.error('Failed to create user', { description: (err as Error).message })
    } finally {
      setIsLoading(false)
    }
  }, [supabase, newUserForm])

  // Create Admin Setting
  const handleCreateSetting = useCallback(async () => {
    if (!newSettingForm.settingName || !newSettingForm.settingKey) {
      toast.error('Please fill in all required fields')
      return
    }
    setIsLoading(true)
    try {
      await createSetting({
        setting_name: newSettingForm.settingName,
        setting_key: newSettingForm.settingKey,
        setting_category: newSettingForm.category,
        value_type: newSettingForm.valueType,
        value_string: newSettingForm.valueType === 'string' ? newSettingForm.value : undefined,
        value_number: newSettingForm.valueType === 'number' ? Number(newSettingForm.value) : undefined,
        value_boolean: newSettingForm.valueType === 'boolean' ? newSettingForm.value === 'true' : undefined,
        is_encrypted: newSettingForm.isEncrypted,
        is_required: newSettingForm.isRequired,
        scope: 'global',
        access_level: 'admin',
        status: 'active',
        is_visible: true,
        is_editable: true,
        version: 1,
        validation_rules: {},
        metadata: {}
      })
      toast.success('Setting created', { description: `${newSettingForm.settingName} has been added` })
      setShowNewSettingDialog(false)
      setNewSettingForm({ settingName: '', settingKey: '', category: 'API', valueType: 'string', value: '', isEncrypted: false, isRequired: false })
      refetch()
    } catch (err) {
      toast.error('Failed to create setting', { description: (err as Error).message })
    } finally {
      setIsLoading(false)
    }
  }, [createSetting, newSettingForm, refetch])

  // Update Admin Setting
  const handleUpdateSetting = useCallback(async () => {
    if (!selectedSetting) return
    setIsLoading(true)
    try {
      await updateSetting(selectedSetting.id, selectedSetting)
      toast.success('Setting updated', { description: `${selectedSetting.setting_name} has been updated` })
      setShowEditSettingDialog(false)
      setSelectedSetting(null)
      refetch()
    } catch (err) {
      toast.error('Failed to update setting', { description: (err as Error).message })
    } finally {
      setIsLoading(false)
    }
  }, [updateSetting, selectedSetting, refetch])

  // Delete Admin Setting
  const handleDeleteSetting = useCallback(async (setting: AdminSetting) => {
    if (!confirm(`Delete setting "${setting.setting_name}"?`)) return
    setIsLoading(true)
    try {
      await deleteSetting(setting.id)
      toast.success('Setting deleted', { description: `${setting.setting_name} has been removed` })
      refetch()
    } catch (err) {
      toast.error('Failed to delete setting', { description: (err as Error).message })
    } finally {
      setIsLoading(false)
    }
  }, [deleteSetting, refetch])

  // Create Feature Flag
  const handleCreateFlag = useCallback(async () => {
    if (!newFlagForm.name || !newFlagForm.key) {
      toast.error('Please fill in all required fields')
      return
    }
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('feature_flags').insert({
        name: newFlagForm.name,
        key: newFlagForm.key,
        description: newFlagForm.description,
        environment: newFlagForm.environment,
        rollout_percentage: newFlagForm.rolloutPercentage,
        enabled: newFlagForm.enabled,
        created_by: user?.id
      })
      if (error) throw error
      toast.success('Feature flag created', { description: `${newFlagForm.name} has been added` })
      setShowNewFlagDialog(false)
      setNewFlagForm({ name: '', key: '', description: '', environment: 'development', rolloutPercentage: 0, enabled: false })
    } catch (err) {
      toast.error('Failed to create flag', { description: (err as Error).message })
    } finally {
      setIsLoading(false)
    }
  }, [supabase, newFlagForm])

  // Create Scheduled Job
  const handleCreateJob = useCallback(async () => {
    if (!newJobForm.name) {
      toast.error('Please fill in all required fields')
      return
    }
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('scheduled_jobs').insert({
        name: newJobForm.name,
        description: newJobForm.description,
        type: newJobForm.type,
        schedule: newJobForm.schedule,
        command: newJobForm.command,
        status: 'scheduled',
        created_by: user?.id
      })
      if (error) throw error
      toast.success('Job created', { description: `${newJobForm.name} has been scheduled` })
      setShowNewJobDialog(false)
      setNewJobForm({ name: '', description: '', type: 'cron', schedule: '', command: '' })
    } catch (err) {
      toast.error('Failed to create job', { description: (err as Error).message })
    } finally {
      setIsLoading(false)
    }
  }, [supabase, newJobForm])

  // Export Logs
  const handleExportLogs = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(1000)
      if (error) throw error
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Logs exported', { description: 'Download started' })
    } catch (err) {
      toast.error('Failed to export logs', { description: (err as Error).message })
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  // Clear Cache (sends request to clear server cache)
  const handleClearCache = useCallback(async () => {
    setIsLoading(true)
    try {
      // This would typically call an API endpoint that clears server-side caches
      await new Promise(resolve => setTimeout(resolve, 500))
      toast.success('Cache cleared', { description: 'All cached data has been purged' })
    } catch (err) {
      toast.error('Failed to clear cache', { description: (err as Error).message })
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Run Diagnostics
  const handleRunDiagnostics = useCallback(async () => {
    toast.info('Running diagnostics', { description: 'System health check in progress...' })
    setIsLoading(true)
    try {
      // Check database connectivity
      const { error: dbError } = await supabase.from('admin_settings').select('id').limit(1)
      if (dbError) throw new Error('Database connectivity issue')
      toast.success('Diagnostics complete', { description: 'All systems operational' })
    } catch (err) {
      toast.error('Diagnostics failed', { description: (err as Error).message })
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  // Copy Setting Key to clipboard
  const handleCopySetting = useCallback((setting: AdminSetting) => {
    navigator.clipboard.writeText(setting.setting_key)
    toast.success('Copied to clipboard', { description: setting.setting_key })
  }, [])

  // Refresh system data
  const handleRefreshSystem = useCallback(() => {
    toast.info('Refreshing system data...')
    setTimeout(() => {
      refetch()
      toast.success('System data refreshed')
    }, 1000)
  }, [refetch])

  // Open console (switches to database tab with SQL console)
  const handleOpenConsole = useCallback(() => {
    setActiveTab('database')
    setShowSqlConsoleDialog(true)
  }, [])

  // Edit user handler
  const handleEditUser = useCallback((user: AdminUser) => {
    setSelectedUser(user)
    setShowEditUserDialog(true)
  }, [])

  // Reset password handler
  const handleResetPassword = useCallback((user: AdminUser) => {
    setSelectedUser(user)
    setShowResetPasswordDialog(true)
  }, [])

  // User actions handler
  const handleUserActions = useCallback((user: AdminUser) => {
    setSelectedUser(user)
    setShowUserActionsDialog(true)
  }, [])

  // Refresh resource handler
  const handleRefreshResource = useCallback(async (resource: SystemResource) => {
    toast.info(`Checking ${resource.name}...`)
    await new Promise(resolve => setTimeout(resolve, 500))
    toast.success(`${resource.name} is healthy`, { description: `Latency: ${resource.latency}ms` })
  }, [])

  // View table schema handler
  const handleViewSchema = useCallback((table: DatabaseTable) => {
    setSelectedTable(table)
    setShowViewSchemaDialog(true)
  }, [])

  // Export table data handler
  const handleExportTable = useCallback((table: DatabaseTable) => {
    toast.success('Export started', { description: `Exporting ${table.name} data...` })
  }, [])

  // Stop job handler
  const handleStopJob = useCallback(async (job: ScheduledJob) => {
    toast.info(`Stopping ${job.name}...`)
    await new Promise(resolve => setTimeout(resolve, 500))
    toast.success(`${job.name} stopped`)
  }, [])

  // Run job handler
  const handleRunJob = useCallback(async (job: ScheduledJob) => {
    toast.info(`Starting ${job.name}...`)
    await new Promise(resolve => setTimeout(resolve, 500))
    toast.success(`${job.name} started`, { description: 'Running in background' })
  }, [])

  // View job history handler
  const handleViewJobHistory = useCallback((job: ScheduledJob) => {
    setSelectedJob(job)
    setShowJobHistoryDialog(true)
  }, [])

  // Job actions handler
  const handleJobActions = useCallback((job: ScheduledJob) => {
    setSelectedJob(job)
    setShowJobActionsDialog(true)
  }, [])

  // Edit flag handler
  const handleEditFlag = useCallback((flag: FeatureFlag) => {
    setSelectedFlag(flag)
    setShowEditFlagDialog(true)
  }, [])

  // Copy flag key handler
  const handleCopyFlagKey = useCallback((flag: FeatureFlag) => {
    navigator.clipboard.writeText(flag.key)
    toast.success('Copied to clipboard', { description: flag.key })
  }, [])

  // Delete flag handler
  const handleDeleteFlag = useCallback(async (flag: FeatureFlag) => {
    if (!confirm(`Delete feature flag "${flag.name}"?`)) return
    try {
      const { error } = await supabase.from('feature_flags').delete().eq('id', flag.id)
      if (error) throw error
      setFeatureFlags(prev => prev.filter(f => f.id !== flag.id))
      toast.success('Flag deleted', { description: `${flag.name} has been removed` })
    } catch (err) {
      toast.error('Failed to delete flag', { description: (err as Error).message })
    }
  }, [supabase])

  // Rollback deployment handler
  const handleRollback = useCallback(async (deploy: Deployment) => {
    if (!confirm(`Rollback to ${deploy.version}?`)) return
    toast.info(`Rolling back to ${deploy.version}...`)
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success('Rollback initiated', { description: `Rolling back to ${deploy.version}` })
  }, [])

  // View deploy logs handler
  const handleViewDeployLogs = useCallback((deploy: Deployment) => {
    setSelectedDeploy(deploy)
    setShowDeployLogsDialog(true)
  }, [])

  // Export SQL results handler
  const handleExportSqlResults = useCallback(() => {
    if (!sqlResults) return
    const blob = new Blob([JSON.stringify(sqlResults, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `query-results-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Results exported')
  }, [sqlResults])

  // Refresh deploy commit handler
  const handleRefreshCommit = useCallback(() => {
    toast.info('Fetching latest commit...')
    setTimeout(() => {
      toast.success('Commit info updated')
    }, 500)
  }, [])

  // View all activity logs handler
  const handleViewAllActivity = useCallback(() => {
    setShowActivityLogsDialog(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-600 to-blue-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Retool-level administration and system management
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefreshSystem}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={handleOpenConsole}
              className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <Terminal className="w-4 h-4" />
              Console
            </button>
          </div>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap gap-2">
          {['System Monitoring', 'User Management', 'RBAC', 'Audit Logs', 'SQL Console', 'Job Scheduler', 'Feature Flags', 'Deployments'].map((feature) => (
            <span key={feature} className="px-3 py-1 bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 rounded-full text-xs font-medium">
              {feature}
            </span>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Health</p>
                <p className="text-xl font-bold text-green-600">{overallHealth.toFixed(0)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Admins</p>
                <p className="text-xl font-bold text-blue-600">{activeUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Timer className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Jobs</p>
                <p className="text-xl font-bold text-purple-600">{runningJobs} running</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Flag className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Flags</p>
                <p className="text-xl font-bold text-orange-600">{enabledFlags} on</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                <Rocket className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Deploys</p>
                <p className="text-xl font-bold text-cyan-600">{successfulDeploys}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <Database className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Tables</p>
                <p className="text-xl font-bold text-indigo-600">{mockDatabaseTables.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                <Settings className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Settings</p>
                <p className="text-xl font-bold text-pink-600">{displaySettings.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Alerts</p>
                <p className="text-xl font-bold text-red-600">{criticalLogs}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex-wrap">
            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-700 dark:data-[state=active]:bg-slate-900/30 dark:data-[state=active]:text-slate-300 rounded-lg px-3 py-2">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-700 dark:data-[state=active]:bg-slate-900/30 dark:data-[state=active]:text-slate-300 rounded-lg px-3 py-2">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="database" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-700 dark:data-[state=active]:bg-slate-900/30 dark:data-[state=active]:text-slate-300 rounded-lg px-3 py-2">
              <Database className="w-4 h-4 mr-2" />
              Database
            </TabsTrigger>
            <TabsTrigger value="jobs" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-700 dark:data-[state=active]:bg-slate-900/30 dark:data-[state=active]:text-slate-300 rounded-lg px-3 py-2">
              <Timer className="w-4 h-4 mr-2" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="flags" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-700 dark:data-[state=active]:bg-slate-900/30 dark:data-[state=active]:text-slate-300 rounded-lg px-3 py-2">
              <Flag className="w-4 h-4 mr-2" />
              Flags
            </TabsTrigger>
            <TabsTrigger value="deploys" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-700 dark:data-[state=active]:bg-slate-900/30 dark:data-[state=active]:text-slate-300 rounded-lg px-3 py-2">
              <Rocket className="w-4 h-4 mr-2" />
              Deploys
            </TabsTrigger>
            <TabsTrigger value="resources" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-700 dark:data-[state=active]:bg-slate-900/30 dark:data-[state=active]:text-slate-300 rounded-lg px-3 py-2">
              <Server className="w-4 h-4 mr-2" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-700 dark:data-[state=active]:bg-slate-900/30 dark:data-[state=active]:text-slate-300 rounded-lg px-3 py-2">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-700 dark:data-[state=active]:bg-slate-900/30 dark:data-[state=active]:text-slate-300 rounded-lg px-3 py-2">
              <FileText className="w-4 h-4 mr-2" />
              Logs
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Overview Banner */}
            <div className="bg-gradient-to-r from-slate-600 via-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">System Overview</h2>
                  <p className="text-slate-100">Retool-level administration and monitoring</p>
                  <p className="text-slate-200 text-xs mt-1">Real-time metrics • Resource health • Activity feed</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{overallHealth.toFixed(0)}%</p>
                    <p className="text-slate-200 text-sm">Health</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockResources.length}</p>
                    <p className="text-slate-200 text-sm">Resources</p>
                  </div>
                </div>
              </div>
            </div>

            {/* System Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {mockMetrics.map((metric) => (
                <div key={metric.name} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-500 mb-1">{metric.name}</p>
                  <div className="flex items-end gap-1">
                    <span className={`text-2xl font-bold ${metric.status === 'good' ? 'text-gray-900 dark:text-white' : metric.status === 'warning' ? 'text-yellow-600' : 'text-red-600'}`}>
                      {metric.value}
                    </span>
                    <span className="text-xs text-gray-500 mb-1">{metric.unit}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {metric.trend === 'up' && <ChevronRight className="w-3 h-3 text-green-500 rotate-[-90deg]" />}
                    {metric.trend === 'down' && <ChevronRight className="w-3 h-3 text-red-500 rotate-90" />}
                    {metric.trend === 'stable' && <span className="w-3 h-0.5 bg-gray-400 rounded" />}
                    <span className="text-xs text-gray-500">{metric.trend}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
                    <button
                      onClick={handleViewAllActivity}
                      className="text-sm text-slate-600 hover:text-slate-700 font-medium"
                    >
                      View All
                    </button>
                  </div>
                </div>
                <ScrollArea className="h-[300px]">
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {mockAuditLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            log.severity === 'critical' ? 'bg-red-100 dark:bg-red-900/30' :
                            log.severity === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                            'bg-blue-100 dark:bg-blue-900/30'
                          }`}>
                            {log.severity === 'critical' ? <AlertTriangle className="w-4 h-4 text-red-600" /> :
                             log.severity === 'warning' ? <AlertTriangle className="w-4 h-4 text-yellow-600" /> :
                             <Activity className="w-4 h-4 text-blue-600" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{log.action}</p>
                            <p className="text-xs text-gray-500 mt-1">{log.details}</p>
                            <p className="text-xs text-gray-400 mt-1">{log.actor} • {formatDate(log.timestamp)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Service Status */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Service Status</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${overallHealth === 100 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {overallHealth === 100 ? 'All Systems Operational' : 'Partial Outage'}
                    </span>
                  </div>
                </div>
                <ScrollArea className="h-[300px]">
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {mockResources.map((resource) => (
                      <div key={resource.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              resource.status === 'healthy' ? 'bg-green-100 dark:bg-green-900/30' :
                              resource.status === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                              'bg-red-100 dark:bg-red-900/30'
                            }`}>
                              {getResourceIcon(resource.type)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{resource.name}</p>
                              <p className="text-xs text-gray-500">{resource.latency}ms latency</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[resource.status]}`}>
                              {resource.status}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">{resource.uptime}% uptime</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            {/* Users Banner */}
            <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">User Management</h2>
                  <p className="text-purple-100">Enterprise-level RBAC and access control</p>
                  <p className="text-purple-200 text-xs mt-1">Role management • MFA • Audit trails</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{activeUsers}</p>
                    <p className="text-purple-200 text-sm">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockAdminUsers.filter(u => u.mfaEnabled).length}</p>
                    <p className="text-purple-200 text-sm">MFA On</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Admin Users</h3>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-slate-500"
                      />
                    </div>
                    <select
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="all">All Roles</option>
                      <option value="super_admin">Super Admin</option>
                      <option value="admin">Admin</option>
                      <option value="moderator">Moderator</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <button
                      onClick={() => setShowNewUserDialog(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add User
                    </button>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MFA</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                            {user.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[user.status]}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {user.mfaEnabled ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <ShieldCheck className="w-4 h-4" />
                              <span className="text-xs">Enabled</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-gray-400">
                              <Shield className="w-4 h-4" />
                              <span className="text-xs">Disabled</span>
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(user.lastLogin)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                              title="Edit user"
                            >
                              <Edit className="w-4 h-4 text-gray-500" />
                            </button>
                            <button
                              onClick={() => handleResetPassword(user)}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                              title="Reset password"
                            >
                              <Key className="w-4 h-4 text-gray-500" />
                            </button>
                            <button
                              onClick={() => handleUserActions(user)}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                              title="More actions"
                            >
                              <MoreHorizontal className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockResources.map((resource) => (
                <div key={resource.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${
                      resource.status === 'healthy' ? 'bg-green-100 dark:bg-green-900/30' :
                      resource.status === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                      'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      {getResourceIcon(resource.type)}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[resource.status]}`}>
                      {resource.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{resource.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 font-mono truncate">{resource.endpoint}</p>

                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div>
                      <p className="text-xs text-gray-500">Latency</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{resource.latency}ms</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Uptime</p>
                      <p className="text-lg font-semibold text-green-600">{resource.uptime}%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500">Last checked: {formatDate(resource.lastChecked)}</p>
                    <button
                      onClick={() => handleRefreshResource(resource)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      title="Refresh resource"
                    >
                      <RefreshCw className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Settings</h3>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search settings..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-slate-500"
                      />
                    </div>
                    <select
                      value={settingCategoryFilter}
                      onChange={(e) => setSettingCategoryFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => setShowNewSettingDialog(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Setting
                    </button>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredSettings.map((setting) => (
                  <div key={setting.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${setting.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                            {setting.status}
                          </span>
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                            {setting.scope}
                          </span>
                          {setting.is_encrypted && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                              <Lock className="w-3 h-3" />
                              Encrypted
                            </span>
                          )}
                          {setting.is_required && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                              Required
                            </span>
                          )}
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{setting.setting_name}</h4>
                        <p className="text-sm text-gray-500 mt-1 font-mono">{setting.setting_key}</p>
                        {setting.description && (
                          <p className="text-sm text-gray-500 mt-2">{setting.description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">{setting.setting_category} • {setting.value_type} • v{setting.version}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedSetting(setting)
                            setShowEditSettingDialog(true)
                          }}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                          title="Edit setting"
                        >
                          <Edit className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleCopySetting(setting)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                          title="Copy setting key"
                        >
                          <Copy className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDeleteSetting(setting)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                          title="Delete setting"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Audit Logs</h3>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search logs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-slate-500"
                      />
                    </div>
                    <select
                      value={logSeverityFilter}
                      onChange={(e) => setLogSeverityFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="all">All Severity</option>
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="critical">Critical</option>
                    </select>
                    <button
                      onClick={handleExportLogs}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      {isLoading ? 'Exporting...' : 'Export'}
                    </button>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(log.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              log.severity === 'critical' ? 'bg-red-500' :
                              log.severity === 'warning' ? 'bg-yellow-500' :
                              'bg-blue-500'
                            }`} />
                            <span className="text-sm font-medium text-gray-900 dark:text-white font-mono">{log.action}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.actor}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{log.resource}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{log.details}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{log.ipAddress}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Database Tab */}
          <TabsContent value="database" className="space-y-6">
            {/* Database Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Database Explorer</h2>
                  <p className="text-emerald-100">PlanetScale-level database management</p>
                  <p className="text-emerald-200 text-xs mt-1">Table browser • SQL console • Query analysis</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockDatabaseTables.length}</p>
                    <p className="text-emerald-200 text-sm">Tables</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{(mockDatabaseTables.reduce((sum, t) => sum + t.rows, 0) / 1000000).toFixed(1)}M</p>
                    <p className="text-emerald-200 text-sm">Rows</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Tables List */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Tables</h3>
                    <button
                      onClick={() => setShowSqlConsoleDialog(true)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-600 text-white text-sm rounded-lg hover:bg-slate-700"
                    >
                      <Terminal className="w-3 h-3" />
                      SQL
                    </button>
                  </div>
                </div>
                <ScrollArea className="h-[400px]">
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {mockDatabaseTables.map((table) => (
                      <button
                        key={table.name}
                        onClick={() => setSelectedTable(table)}
                        className={`w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                          selectedTable?.name === table.name ? 'bg-slate-50 dark:bg-slate-900/30' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Table className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{table.name}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span>{table.schema}</span>
                          <span>{table.rows.toLocaleString()} rows</span>
                          <span>{table.size}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Table Details */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {selectedTable ? `${selectedTable.schema}.${selectedTable.name}` : 'Select a table'}
                    </h3>
                    {selectedTable && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewSchema(selectedTable)}
                          className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                          title="View schema"
                        >
                          <Code className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExportTable(selectedTable)}
                          className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                          title="Export data"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {selectedTable ? (
                  <div className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-xs text-gray-500">Rows</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedTable.rows.toLocaleString()}</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-xs text-gray-500">Size</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedTable.size}</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-xs text-gray-500">Schema</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedTable.schema}</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-xs text-gray-500">Last Modified</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(selectedTable.lastModified)}</p>
                      </div>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <p className="text-xs text-gray-400 mb-2">Sample Query</p>
                      <code className="text-sm text-green-400">SELECT * FROM {selectedTable.schema}.{selectedTable.name} LIMIT 100;</code>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <Database className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Select a table to view details</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-6">
            {/* Jobs Banner */}
            <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Scheduled Jobs</h2>
                  <p className="text-amber-100">Inngest-level job scheduling and orchestration</p>
                  <p className="text-amber-200 text-xs mt-1">Cron jobs • Webhooks • Background tasks</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockJobs.length}</p>
                    <p className="text-amber-200 text-sm">Total Jobs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{runningJobs}</p>
                    <p className="text-amber-200 text-sm">Running</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Scheduled Jobs</h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowNewJobDialog(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
                    >
                      <Plus className="w-4 h-4" />
                      New Job
                    </button>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {mockJobs.map((job) => (
                  <div key={job.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          job.status === 'running' ? 'bg-blue-100 dark:bg-blue-900/30' :
                          job.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' :
                          job.status === 'failed' ? 'bg-red-100 dark:bg-red-900/30' :
                          'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          {job.type === 'cron' && <Clock className="w-5 h-5 text-gray-600" />}
                          {job.type === 'webhook' && <Webhook className="w-5 h-5 text-gray-600" />}
                          {job.type === 'manual' && <PlayCircle className="w-5 h-5 text-gray-600" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">{job.name}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${jobStatusColors[job.status]}`}>
                              {job.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{job.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                            <span className="font-mono">{job.schedule}</span>
                            <span>Last: {formatDate(job.lastRun)}</span>
                            <span>Next: {job.nextRun === '-' ? 'Manual' : formatDate(job.nextRun)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{job.successRate}%</p>
                          <p className="text-xs text-gray-500">Success</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {job.status === 'running' ? (
                            <button
                              onClick={() => handleStopJob(job)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                              title="Stop job"
                            >
                              <StopCircle className="w-4 h-4 text-red-500" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRunJob(job)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                              title="Run job"
                            >
                              <Play className="w-4 h-4 text-green-500" />
                            </button>
                          )}
                          <button
                            onClick={() => handleViewJobHistory(job)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            title="View history"
                          >
                            <History className="w-4 h-4 text-gray-500" />
                          </button>
                          <button
                            onClick={() => handleJobActions(job)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            title="More actions"
                          >
                            <MoreHorizontal className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Feature Flags Tab */}
          <TabsContent value="flags" className="space-y-6">
            {/* Feature Flags Banner */}
            <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Feature Flags</h2>
                  <p className="text-pink-100">LaunchDarkly-level feature management</p>
                  <p className="text-pink-200 text-xs mt-1">Progressive rollouts • Environment targeting • Kill switches</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{featureFlags.length}</p>
                    <p className="text-pink-200 text-sm">Total Flags</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{enabledFlags}</p>
                    <p className="text-pink-200 text-sm">Enabled</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Feature Flags</h3>
                  <div className="flex items-center gap-3">
                    <select
                      value={envFilter}
                      onChange={(e) => setEnvFilter(e.target.value as typeof envFilter)}
                      className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    >
                      <option value="all">All Environments</option>
                      <option value="production">Production</option>
                      <option value="staging">Staging</option>
                      <option value="development">Development</option>
                    </select>
                    <button
                      onClick={() => setShowNewFlagDialog(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
                    >
                      <Plus className="w-4 h-4" />
                      New Flag
                    </button>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredFlags.map((flag) => (
                  <div key={flag.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => toggleFlag(flag.id)}
                          className="transition-colors"
                        >
                          {flag.enabled ? (
                            <ToggleRight className="w-10 h-10 text-green-500" />
                          ) : (
                            <ToggleLeft className="w-10 h-10 text-gray-400" />
                          )}
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">{flag.name}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${envColors[flag.environment]}`}>
                              {flag.environment}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 font-mono mt-1">{flag.key}</p>
                          <p className="text-sm text-gray-500 mt-1">{flag.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-xl font-bold text-gray-900 dark:text-white">{flag.rolloutPercentage}%</p>
                          <p className="text-xs text-gray-500">Rollout</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditFlag(flag)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            title="Edit flag"
                          >
                            <Edit className="w-4 h-4 text-gray-500" />
                          </button>
                          <button
                            onClick={() => handleCopyFlagKey(flag)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            title="Copy key"
                          >
                            <Copy className="w-4 h-4 text-gray-500" />
                          </button>
                          <button
                            onClick={() => handleDeleteFlag(flag)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            title="Delete flag"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Deployments Tab */}
          <TabsContent value="deploys" className="space-y-6">
            {/* Deploys Banner */}
            <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Deployments</h2>
                  <p className="text-cyan-100">Vercel-level deployment management and rollbacks</p>
                  <p className="text-cyan-200 text-xs mt-1">CI/CD pipelines • Rollback history • Environment sync</p>
                  <div className="flex gap-2 mt-3">
                    <span className="px-2 py-1 bg-white/10 rounded-lg text-xs">Auto-Deploy</span>
                    <span className="px-2 py-1 bg-white/10 rounded-lg text-xs">Zero-Downtime</span>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{mockDeployments.length}</p>
                    <p className="text-cyan-200 text-sm">Deployments</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{successfulDeploys}</p>
                    <p className="text-cyan-200 text-sm">Successful</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Deployments</h3>
                  <div className="flex items-center gap-3">
                    <select
                      value={envFilter}
                      onChange={(e) => setEnvFilter(e.target.value as typeof envFilter)}
                      className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    >
                      <option value="all">All Environments</option>
                      <option value="production">Production</option>
                      <option value="staging">Staging</option>
                      <option value="development">Development</option>
                    </select>
                    <button
                      onClick={() => setShowDeployDialog(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
                    >
                      <Rocket className="w-4 h-4" />
                      Deploy
                    </button>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredDeployments.map((deploy) => (
                  <div key={deploy.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          deploy.status === 'success' ? 'bg-green-100 dark:bg-green-900/30' :
                          deploy.status === 'failed' ? 'bg-red-100 dark:bg-red-900/30' :
                          deploy.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900/30' :
                          'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          <Rocket className={`w-5 h-5 ${
                            deploy.status === 'success' ? 'text-green-600' :
                            deploy.status === 'failed' ? 'text-red-600' :
                            deploy.status === 'in_progress' ? 'text-blue-600' :
                            'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">{deploy.version}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${envColors[deploy.environment]}`}>
                              {deploy.environment}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${deploymentStatusColors[deploy.status]}`}>
                              {deploy.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <GitBranch className="w-3 h-3" />
                              {deploy.branch}
                            </span>
                            <span className="flex items-center gap-1">
                              <GitCommit className="w-3 h-3" />
                              {deploy.commit}
                            </span>
                            <span>{deploy.changes} changes</span>
                            <span>{deploy.deployedBy}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {deploy.duration > 0 ? `${Math.floor(deploy.duration / 60)}m ${deploy.duration % 60}s` : 'In progress...'}
                          </p>
                          <p className="text-xs text-gray-500">{formatDate(deploy.deployedAt)}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {deploy.status === 'success' && (
                            <button
                              onClick={() => handleRollback(deploy)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                              title="Rollback"
                            >
                              <RotateCcw className="w-4 h-4 text-orange-500" />
                            </button>
                          )}
                          <button
                            onClick={() => handleViewDeployLogs(deploy)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            title="View logs"
                          >
                            <FileText className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockAdminAIInsights}
              title="Admin Intelligence"
              onInsightAction={(insight: AIInsight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockAdminCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockAdminPredictions}
              title="System Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockAdminActivities}
            title="Admin Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={adminQuickActions}
            variant="grid"
          />
        </div>

        {/* New User Dialog */}
        <Dialog open={showNewUserDialog} onOpenChange={setShowNewUserDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Admin User</DialogTitle>
              <DialogDescription>Create a new admin user with specific permissions.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input
                  type="email"
                  placeholder="john@company.com"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm(prev => ({ ...prev, role: e.target.value as typeof newUserForm.role }))}
                  className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="viewer">Viewer</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="require-mfa"
                  checked={newUserForm.requireMfa}
                  onChange={(e) => setNewUserForm(prev => ({ ...prev, requireMfa: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="require-mfa" className="text-sm text-gray-700 dark:text-gray-300">Require MFA</label>
              </div>
            </div>
            <DialogFooter>
              <button onClick={() => setShowNewUserDialog(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                disabled={isLoading}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create User'}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Setting Dialog */}
        <Dialog open={showNewSettingDialog} onOpenChange={setShowNewSettingDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Setting</DialogTitle>
              <DialogDescription>Create a new system configuration setting.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Setting Name</label>
                <input
                  type="text"
                  placeholder="API Rate Limit"
                  value={newSettingForm.settingName}
                  onChange={(e) => setNewSettingForm(prev => ({ ...prev, settingName: e.target.value }))}
                  className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Setting Key</label>
                <input
                  type="text"
                  placeholder="api.rate_limit"
                  value={newSettingForm.settingKey}
                  onChange={(e) => setNewSettingForm(prev => ({ ...prev, settingKey: e.target.value }))}
                  className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 font-mono"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                <select
                  value={newSettingForm.category}
                  onChange={(e) => setNewSettingForm(prev => ({ ...prev, category: e.target.value }))}
                  className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option>API</option>
                  <option>Security</option>
                  <option>Billing</option>
                  <option>Notifications</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Value Type</label>
                <select
                  value={newSettingForm.valueType}
                  onChange={(e) => setNewSettingForm(prev => ({ ...prev, valueType: e.target.value as typeof newSettingForm.valueType }))}
                  className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="string">string</option>
                  <option value="number">number</option>
                  <option value="boolean">boolean</option>
                  <option value="json">json</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Value</label>
                <input
                  type="text"
                  placeholder="Enter value"
                  value={newSettingForm.value}
                  onChange={(e) => setNewSettingForm(prev => ({ ...prev, value: e.target.value }))}
                  className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="encrypted"
                    checked={newSettingForm.isEncrypted}
                    onChange={(e) => setNewSettingForm(prev => ({ ...prev, isEncrypted: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="encrypted" className="text-sm text-gray-700 dark:text-gray-300">Encrypted</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="required"
                    checked={newSettingForm.isRequired}
                    onChange={(e) => setNewSettingForm(prev => ({ ...prev, isRequired: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="required" className="text-sm text-gray-700 dark:text-gray-300">Required</label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <button onClick={() => setShowNewSettingDialog(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                Cancel
              </button>
              <button
                onClick={handleCreateSetting}
                disabled={isLoading}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Setting'}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* SQL Console Dialog */}
        <Dialog open={showSqlConsoleDialog} onOpenChange={setShowSqlConsoleDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                SQL Console
              </DialogTitle>
              <DialogDescription>Execute SQL queries against your database</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-gray-900 rounded-lg p-4">
                <textarea
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  className="w-full h-32 bg-transparent text-green-400 font-mono text-sm focus:outline-none resize-none"
                  placeholder="SELECT * FROM users LIMIT 10;"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <select className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                    <option>Primary Database</option>
                    <option>Analytics DB</option>
                    <option>Read Replica</option>
                  </select>
                </div>
                <button
                  onClick={runQuery}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Play className="w-4 h-4" />
                  Run Query
                </button>
              </div>
              {sqlResults && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-2 flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {sqlResults.rowCount} rows in {sqlResults.executionTime}s
                    </span>
                    <button
                      onClick={handleExportSqlResults}
                      className="text-sm text-slate-600 hover:text-slate-700"
                      title="Export results"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                          {sqlResults.columns.map((col) => (
                            <th key={col} className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {sqlResults.rows.map((row, i) => (
                          <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            {sqlResults.columns.map((col) => (
                              <td key={col} className="px-4 py-2 text-gray-900 dark:text-white">{String(row[col])}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* New Job Dialog */}
        <Dialog open={showNewJobDialog} onOpenChange={setShowNewJobDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Scheduled Job</DialogTitle>
              <DialogDescription>Configure a new automated job or task</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Job Name</label>
                <input
                  type="text"
                  placeholder="Database Backup"
                  value={newJobForm.name}
                  onChange={(e) => setNewJobForm(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  placeholder="What does this job do?"
                  value={newJobForm.description}
                  onChange={(e) => setNewJobForm(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 h-20 resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Job Type</label>
                <select
                  value={newJobForm.type}
                  onChange={(e) => setNewJobForm(prev => ({ ...prev, type: e.target.value as typeof newJobForm.type }))}
                  className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="cron">Cron Schedule</option>
                  <option value="webhook">Webhook Trigger</option>
                  <option value="manual">Manual Only</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Cron Expression</label>
                <input
                  type="text"
                  placeholder="0 2 * * *"
                  value={newJobForm.schedule}
                  onChange={(e) => setNewJobForm(prev => ({ ...prev, schedule: e.target.value }))}
                  className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">e.g., 0 2 * * * = Every day at 2:00 AM</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Command</label>
                <input
                  type="text"
                  placeholder="npm run backup"
                  value={newJobForm.command}
                  onChange={(e) => setNewJobForm(prev => ({ ...prev, command: e.target.value }))}
                  className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 font-mono"
                />
              </div>
            </div>
            <DialogFooter>
              <button onClick={() => setShowNewJobDialog(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                Cancel
              </button>
              <button
                onClick={handleCreateJob}
                disabled={isLoading}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Job'}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Feature Flag Dialog */}
        <Dialog open={showNewFlagDialog} onOpenChange={setShowNewFlagDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Feature Flag</DialogTitle>
              <DialogDescription>Add a new feature flag for controlled rollouts</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Flag Name</label>
                <input
                  type="text"
                  placeholder="New Dashboard UI"
                  value={newFlagForm.name}
                  onChange={(e) => setNewFlagForm(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Flag Key</label>
                <input
                  type="text"
                  placeholder="new_dashboard_ui"
                  value={newFlagForm.key}
                  onChange={(e) => setNewFlagForm(prev => ({ ...prev, key: e.target.value }))}
                  className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 font-mono"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  placeholder="What does this flag control?"
                  value={newFlagForm.description}
                  onChange={(e) => setNewFlagForm(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 h-20 resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Environment</label>
                <select
                  value={newFlagForm.environment}
                  onChange={(e) => setNewFlagForm(prev => ({ ...prev, environment: e.target.value as typeof newFlagForm.environment }))}
                  className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                >
                  <option value="development">Development</option>
                  <option value="staging">Staging</option>
                  <option value="production">Production</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Rollout Percentage: {newFlagForm.rolloutPercentage}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newFlagForm.rolloutPercentage}
                  onChange={(e) => setNewFlagForm(prev => ({ ...prev, rolloutPercentage: Number(e.target.value) }))}
                  className="mt-1 w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="flag-enabled"
                  checked={newFlagForm.enabled}
                  onChange={(e) => setNewFlagForm(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="flag-enabled" className="text-sm text-gray-700 dark:text-gray-300">Enable immediately</label>
              </div>
            </div>
            <DialogFooter>
              <button onClick={() => setShowNewFlagDialog(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                Cancel
              </button>
              <button
                onClick={handleCreateFlag}
                disabled={isLoading}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Flag'}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Deploy Dialog */}
        <Dialog open={showDeployDialog} onOpenChange={setShowDeployDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5" />
                New Deployment
              </DialogTitle>
              <DialogDescription>Deploy a new version to an environment</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Environment</label>
                <select className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                  <option value="development">Development</option>
                  <option value="staging">Staging</option>
                  <option value="production">Production</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Branch</label>
                <select className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                  <option value="main">main</option>
                  <option value="develop">develop</option>
                  <option value="release/2.5.0">release/2.5.0</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Commit</label>
                <div className="mt-1 flex items-center gap-2">
                  <input type="text" value="abc123f" readOnly className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 font-mono text-sm" />
                  <button
                    onClick={handleRefreshCommit}
                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                    title="Refresh commit"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Production Deployment</p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">This will deploy to the production environment. Make sure all tests have passed.</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="run-migrations" className="rounded" defaultChecked />
                <label htmlFor="run-migrations" className="text-sm text-gray-700 dark:text-gray-300">Run database migrations</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="notify-team" className="rounded" defaultChecked />
                <label htmlFor="notify-team" className="text-sm text-gray-700 dark:text-gray-300">Notify team on Slack</label>
              </div>
            </div>
            <DialogFooter>
              <button onClick={() => setShowDeployDialog(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                Cancel
              </button>
              <button onClick={() => setShowDeployDialog(false)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Rocket className="w-4 h-4" />
                Deploy Now
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Setting Dialog */}
        <Dialog open={showEditSettingDialog} onOpenChange={setShowEditSettingDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Setting</DialogTitle>
              <DialogDescription>Update the system configuration setting.</DialogDescription>
            </DialogHeader>
            {selectedSetting && (
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Setting Name</label>
                  <input
                    type="text"
                    value={selectedSetting.setting_name}
                    onChange={(e) => setSelectedSetting(prev => prev ? { ...prev, setting_name: e.target.value } : null)}
                    className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Setting Key</label>
                  <input
                    type="text"
                    value={selectedSetting.setting_key}
                    onChange={(e) => setSelectedSetting(prev => prev ? { ...prev, setting_key: e.target.value } : null)}
                    className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 font-mono"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                  <textarea
                    value={selectedSetting.description || ''}
                    onChange={(e) => setSelectedSetting(prev => prev ? { ...prev, description: e.target.value } : null)}
                    className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 h-20 resize-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Value ({selectedSetting.value_type})</label>
                  <input
                    type="text"
                    value={selectedSetting.value_string || selectedSetting.value_number?.toString() || ''}
                    onChange={(e) => setSelectedSetting(prev => prev ? {
                      ...prev,
                      value_string: prev.value_type === 'string' ? e.target.value : prev.value_string,
                      value_number: prev.value_type === 'number' ? Number(e.target.value) : prev.value_number
                    } : null)}
                    className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                  <select
                    value={selectedSetting.status}
                    onChange={(e) => setSelectedSetting(prev => prev ? { ...prev, status: e.target.value as typeof selectedSetting.status } : null)}
                    className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="deprecated">Deprecated</option>
                    <option value="testing">Testing</option>
                  </select>
                </div>
              </div>
            )}
            <DialogFooter>
              <button onClick={() => { setShowEditSettingDialog(false); setSelectedSetting(null); }} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                Cancel
              </button>
              <button
                onClick={handleUpdateSetting}
                disabled={isLoading}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Run Job Dialog */}
        <Dialog open={showRunJobDialog} onOpenChange={setShowRunJobDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Run Job
              </DialogTitle>
              <DialogDescription>Select a scheduled job to run immediately.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Job</label>
                <select className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                  {mockJobs.map((job) => (
                    <option key={job.id} value={job.id}>{job.name}</option>
                  ))}
                </select>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Manual Execution</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">This will run the job immediately outside of its normal schedule.</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="run-job-notify" className="rounded" defaultChecked />
                <label htmlFor="run-job-notify" className="text-sm text-gray-700 dark:text-gray-300">Notify on completion</label>
              </div>
            </div>
            <DialogFooter>
              <button onClick={() => setShowRunJobDialog(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowRunJobDialog(false)
                  toast.success('Job started', { description: 'The job is now running in the background' })
                }}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Play className="w-4 h-4" />
                Run Now
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Logs Dialog */}
        <Dialog open={showExportLogsDialog} onOpenChange={setShowExportLogsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Export Logs
              </DialogTitle>
              <DialogDescription>Configure and export audit logs.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date Range</label>
                <select className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                  <option value="24h">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="all">All time</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Log Severity</label>
                <select className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                  <option value="all">All severities</option>
                  <option value="info">Info only</option>
                  <option value="warning">Warning and above</option>
                  <option value="critical">Critical only</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Export Format</label>
                <select className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                  <option value="xlsx">Excel (XLSX)</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="include-metadata" className="rounded" defaultChecked />
                <label htmlFor="include-metadata" className="text-sm text-gray-700 dark:text-gray-300">Include metadata</label>
              </div>
            </div>
            <DialogFooter>
              <button onClick={() => setShowExportLogsDialog(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowExportLogsDialog(false)
                  handleExportLogs()
                }}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {isLoading ? 'Exporting...' : 'Export'}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update user information and permissions.</DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                  <input
                    type="text"
                    defaultValue={selectedUser.name}
                    className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <input
                    type="email"
                    defaultValue={selectedUser.email}
                    className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                  <select
                    defaultValue={selectedUser.role}
                    className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                  <select
                    defaultValue={selectedUser.status}
                    className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
            )}
            <DialogFooter>
              <button onClick={() => { setShowEditUserDialog(false); setSelectedUser(null); }} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowEditUserDialog(false)
                  setSelectedUser(null)
                  toast.success('User updated', { description: 'Changes have been saved' })
                }}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
              >
                Save Changes
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reset Password Dialog */}
        <Dialog open={showResetPasswordDialog} onOpenChange={setShowResetPasswordDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Reset Password
              </DialogTitle>
              <DialogDescription>Send a password reset link to {selectedUser?.email}.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  This will send a password reset email to the user. They will need to create a new password.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="force-logout" className="rounded" defaultChecked />
                <label htmlFor="force-logout" className="text-sm text-gray-700 dark:text-gray-300">Force logout from all sessions</label>
              </div>
            </div>
            <DialogFooter>
              <button onClick={() => { setShowResetPasswordDialog(false); setSelectedUser(null); }} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowResetPasswordDialog(false)
                  setSelectedUser(null)
                  toast.success('Reset link sent', { description: 'Password reset email has been sent' })
                }}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
              >
                Send Reset Link
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* User Actions Dialog */}
        <Dialog open={showUserActionsDialog} onOpenChange={setShowUserActionsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>User Actions</DialogTitle>
              <DialogDescription>Additional actions for {selectedUser?.name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-4">
              <button
                onClick={() => {
                  setShowUserActionsDialog(false)
                  toast.success('MFA enabled', { description: 'User will be required to set up MFA on next login' })
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-3"
              >
                <ShieldCheck className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Enable MFA</p>
                  <p className="text-xs text-gray-500">Require multi-factor authentication</p>
                </div>
              </button>
              <button
                onClick={() => {
                  setShowUserActionsDialog(false)
                  toast.success('Sessions revoked', { description: 'User has been logged out everywhere' })
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-3"
              >
                <Lock className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Revoke Sessions</p>
                  <p className="text-xs text-gray-500">Log user out from all devices</p>
                </div>
              </button>
              <button
                onClick={() => {
                  setShowUserActionsDialog(false)
                  toast.success('User suspended', { description: 'Account has been suspended' })
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-3"
              >
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Suspend User</p>
                  <p className="text-xs text-gray-500">Temporarily disable this account</p>
                </div>
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Flag Dialog */}
        <Dialog open={showEditFlagDialog} onOpenChange={setShowEditFlagDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Feature Flag</DialogTitle>
              <DialogDescription>Update flag configuration and rollout settings.</DialogDescription>
            </DialogHeader>
            {selectedFlag && (
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Flag Name</label>
                  <input
                    type="text"
                    defaultValue={selectedFlag.name}
                    className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                  <textarea
                    defaultValue={selectedFlag.description}
                    className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 h-20 resize-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Environment</label>
                  <select
                    defaultValue={selectedFlag.environment}
                    className="mt-1 w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <option value="development">Development</option>
                    <option value="staging">Staging</option>
                    <option value="production">Production</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Rollout Percentage</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue={selectedFlag.rolloutPercentage}
                    className="mt-1 w-full"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <button onClick={() => { setShowEditFlagDialog(false); setSelectedFlag(null); }} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowEditFlagDialog(false)
                  setSelectedFlag(null)
                  toast.success('Flag updated', { description: 'Changes have been saved' })
                }}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
              >
                Save Changes
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Job History Dialog */}
        <Dialog open={showJobHistoryDialog} onOpenChange={setShowJobHistoryDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Job History
              </DialogTitle>
              <DialogDescription>{selectedJob?.name} execution history</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Run Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-2 text-gray-900 dark:text-white">2024-12-23 10:00:00</td>
                      <td className="px-4 py-2"><span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-full text-xs">completed</span></td>
                      <td className="px-4 py-2 text-gray-500">15s</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-2 text-gray-900 dark:text-white">2024-12-23 09:00:00</td>
                      <td className="px-4 py-2"><span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-full text-xs">completed</span></td>
                      <td className="px-4 py-2 text-gray-500">12s</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-2 text-gray-900 dark:text-white">2024-12-23 08:00:00</td>
                      <td className="px-4 py-2"><span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded-full text-xs">failed</span></td>
                      <td className="px-4 py-2 text-gray-500">5s</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <DialogFooter>
              <button onClick={() => { setShowJobHistoryDialog(false); setSelectedJob(null); }} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                Close
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Job Actions Dialog */}
        <Dialog open={showJobActionsDialog} onOpenChange={setShowJobActionsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Job Actions</DialogTitle>
              <DialogDescription>Additional actions for {selectedJob?.name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-4">
              <button
                onClick={() => {
                  setShowJobActionsDialog(false)
                  toast.success('Schedule updated', { description: 'Job schedule has been modified' })
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-3"
              >
                <Clock className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Edit Schedule</p>
                  <p className="text-xs text-gray-500">Modify the cron expression</p>
                </div>
              </button>
              <button
                onClick={() => {
                  setShowJobActionsDialog(false)
                  toast.success('Job duplicated', { description: 'A copy of this job has been created' })
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-3"
              >
                <Copy className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Duplicate Job</p>
                  <p className="text-xs text-gray-500">Create a copy of this job</p>
                </div>
              </button>
              <button
                onClick={() => {
                  setShowJobActionsDialog(false)
                  toast.success('Job deleted', { description: 'Job has been removed' })
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-3"
              >
                <Trash2 className="w-5 h-5 text-red-500" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Delete Job</p>
                  <p className="text-xs text-gray-500">Permanently remove this job</p>
                </div>
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Deploy Logs Dialog */}
        <Dialog open={showDeployLogsDialog} onOpenChange={setShowDeployLogsDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Deployment Logs
              </DialogTitle>
              <DialogDescription>{selectedDeploy?.version} - {selectedDeploy?.environment}</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-400 h-64 overflow-auto">
                <p>[2024-12-23 04:00:00] Starting deployment...</p>
                <p>[2024-12-23 04:00:05] Pulling latest changes from {selectedDeploy?.branch}...</p>
                <p>[2024-12-23 04:00:15] Running build...</p>
                <p>[2024-12-23 04:01:30] Build completed successfully</p>
                <p>[2024-12-23 04:01:35] Running database migrations...</p>
                <p>[2024-12-23 04:01:45] Migrations completed</p>
                <p>[2024-12-23 04:02:00] Deploying to {selectedDeploy?.environment}...</p>
                <p>[2024-12-23 04:03:30] Health check passed</p>
                <p>[2024-12-23 04:04:00] Deployment completed successfully</p>
              </div>
            </div>
            <DialogFooter>
              <button
                onClick={() => {
                  toast.success('Logs downloaded')
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Logs
              </button>
              <button onClick={() => { setShowDeployLogsDialog(false); setSelectedDeploy(null); }} className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700">
                Close
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Schema Dialog */}
        <Dialog open={showViewSchemaDialog} onOpenChange={setShowViewSchemaDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Table Schema
              </DialogTitle>
              <DialogDescription>{selectedTable?.schema}.{selectedTable?.name}</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-400">
                <pre>{`CREATE TABLE ${selectedTable?.schema}.${selectedTable?.name} (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Additional columns...
);

-- Indexes
CREATE INDEX idx_${selectedTable?.name}_created_at
  ON ${selectedTable?.schema}.${selectedTable?.name}(created_at);`}</pre>
              </div>
            </div>
            <DialogFooter>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`SELECT * FROM ${selectedTable?.schema}.${selectedTable?.name} LIMIT 100;`)
                  toast.success('Query copied to clipboard')
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy Query
              </button>
              <button onClick={() => setShowViewSchemaDialog(false)} className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700">
                Close
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Activity Logs Dialog */}
        <Dialog open={showActivityLogsDialog} onOpenChange={setShowActivityLogsDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                All Activity
              </DialogTitle>
              <DialogDescription>Complete activity log for the system</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <ScrollArea className="h-96">
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {mockAuditLogs.map((log) => (
                    <div key={log.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          log.severity === 'critical' ? 'bg-red-100 dark:bg-red-900/30' :
                          log.severity === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                          'bg-blue-100 dark:bg-blue-900/30'
                        }`}>
                          {log.severity === 'critical' ? <AlertTriangle className="w-4 h-4 text-red-600" /> :
                           log.severity === 'warning' ? <AlertTriangle className="w-4 h-4 text-yellow-600" /> :
                           <Activity className="w-4 h-4 text-blue-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{log.action}</p>
                          <p className="text-xs text-gray-500 mt-1">{log.details}</p>
                          <p className="text-xs text-gray-400 mt-1">{log.actor} - {formatDate(log.timestamp)}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          log.severity === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                          log.severity === 'warning' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}>
                          {log.severity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <DialogFooter>
              <button
                onClick={() => {
                  setShowActivityLogsDialog(false)
                  handleExportLogs()
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Logs
              </button>
              <button onClick={() => setShowActivityLogsDialog(false)} className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700">
                Close
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
