'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
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
  Folder, File, Package, Gauge, MonitorPlay, GitPullRequest, Bell, AlertOctagon, Globe2
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

// Mock Data
const mockDeployments: Deployment[] = [
  { id: '1', name: 'Production', status: 'success', environment: 'production', branch: 'main', commit: 'a3b2c1d', commitMessage: 'feat: Add new dashboard components', author: 'Sarah Chen', authorAvatar: 'sarah', createdAt: '2024-01-15T14:30:00Z', duration: 45, previewUrl: 'https://app-a3b2c1d.vercel.app', productionUrl: 'https://freeflow.app', buildCache: true, isProtected: true },
  { id: '2', name: 'Preview', status: 'in_progress', environment: 'preview', branch: 'feature/new-ui', commit: 'b4c3d2e', commitMessage: 'wip: Update UI components', author: 'Mike Johnson', authorAvatar: 'mike', createdAt: '2024-01-15T15:00:00Z', duration: 0, previewUrl: 'https://app-b4c3d2e.vercel.app', prNumber: 234, prTitle: 'New UI Components', buildCache: true, isProtected: false },
  { id: '3', name: 'Staging', status: 'success', environment: 'staging', branch: 'develop', commit: 'c5d4e3f', commitMessage: 'fix: Resolve API issues', author: 'Emily Davis', authorAvatar: 'emily', createdAt: '2024-01-15T12:00:00Z', duration: 38, previewUrl: 'https://staging.freeflow.app', buildCache: true, isProtected: true },
  { id: '4', name: 'Preview', status: 'failed', environment: 'preview', branch: 'fix/auth-bug', commit: 'd6e5f4g', commitMessage: 'fix: Auth token refresh', author: 'Alex Kim', authorAvatar: 'alex', createdAt: '2024-01-15T10:00:00Z', duration: 23, previewUrl: '', prNumber: 235, prTitle: 'Fix Auth Bug', buildCache: false, isProtected: false },
  { id: '5', name: 'Production', status: 'success', environment: 'production', branch: 'main', commit: 'e7f6g5h', commitMessage: 'chore: Update dependencies', author: 'Sarah Chen', authorAvatar: 'sarah', createdAt: '2024-01-14T18:00:00Z', duration: 52, previewUrl: 'https://app-e7f6g5h.vercel.app', productionUrl: 'https://freeflow.app', buildCache: true, isProtected: true },
  { id: '6', name: 'Preview', status: 'queued', environment: 'preview', branch: 'feature/payments', commit: 'f8g7h6i', commitMessage: 'feat: Add Stripe integration', author: 'Jordan Lee', authorAvatar: 'jordan', createdAt: '2024-01-15T15:15:00Z', duration: 0, previewUrl: '', prNumber: 236, prTitle: 'Stripe Integration', buildCache: false, isProtected: false }
]

const mockBuildLogs: BuildLog[] = [
  { id: '1', timestamp: '10:23:01', level: 'info', message: 'Cloning repository...', step: 'clone' },
  { id: '2', timestamp: '10:23:03', level: 'success', message: 'Repository cloned successfully', step: 'clone' },
  { id: '3', timestamp: '10:23:04', level: 'info', message: 'Installing dependencies...', step: 'install' },
  { id: '4', timestamp: '10:23:15', level: 'warn', message: 'npm WARN deprecated package@1.0.0', step: 'install' },
  { id: '5', timestamp: '10:23:25', level: 'success', message: 'Dependencies installed (1,247 packages)', step: 'install' },
  { id: '6', timestamp: '10:23:26', level: 'info', message: 'Building application...', step: 'build' },
  { id: '7', timestamp: '10:23:30', level: 'info', message: 'Compiling TypeScript...', step: 'build' },
  { id: '8', timestamp: '10:23:45', level: 'info', message: 'Generating static pages (0/24)...', step: 'build' },
  { id: '9', timestamp: '10:23:50', level: 'success', message: 'Build completed in 24s', step: 'build' },
  { id: '10', timestamp: '10:23:51', level: 'info', message: 'Uploading build artifacts...', step: 'deploy' },
  { id: '11', timestamp: '10:23:55', level: 'info', message: 'Deploying to edge network (12 regions)...', step: 'deploy' },
  { id: '12', timestamp: '10:24:00', level: 'success', message: 'Deployment ready!', step: 'deploy' }
]

const mockDomains: DeploymentDomain[] = [
  { id: '1', domain: 'freeflow.app', type: 'production', verified: true, ssl: true, createdAt: '2024-01-01' },
  { id: '2', domain: 'www.freeflow.app', type: 'production', verified: true, ssl: true, createdAt: '2024-01-01', redirectTo: 'freeflow.app' },
  { id: '3', domain: 'staging.freeflow.app', type: 'preview', verified: true, ssl: true, createdAt: '2024-01-05' },
  { id: '4', domain: 'api.freeflow.app', type: 'production', verified: true, ssl: true, createdAt: '2024-01-10' }
]

const mockEnvVars: EnvironmentVariable[] = [
  { id: '1', key: 'DATABASE_URL', value: '••••••••••••', environment: 'all', encrypted: true, createdAt: '2024-01-01' },
  { id: '2', key: 'NEXT_PUBLIC_API_URL', value: 'https://api.freeflow.app', environment: 'production', encrypted: false, createdAt: '2024-01-01' },
  { id: '3', key: 'STRIPE_SECRET_KEY', value: '••••••••••••', environment: 'production', encrypted: true, createdAt: '2024-01-10' },
  { id: '4', key: 'REDIS_URL', value: '••••••••••••', environment: 'all', encrypted: true, createdAt: '2024-01-15' },
  { id: '5', key: 'SENTRY_DSN', value: 'https://xxx@sentry.io/123', environment: 'all', encrypted: false, createdAt: '2024-01-15' }
]

const mockFunctions: ServerlessFunction[] = [
  { id: '1', name: '/api/auth/login', runtime: 'Node.js 20', region: 'iad1', invocations: 45230, avgDuration: 124, errors: 23, memory: 256 },
  { id: '2', name: '/api/projects', runtime: 'Node.js 20', region: 'iad1', invocations: 28450, avgDuration: 89, errors: 5, memory: 256 },
  { id: '3', name: '/api/webhooks/stripe', runtime: 'Node.js 20', region: 'iad1', invocations: 12340, avgDuration: 234, errors: 12, memory: 512 },
  { id: '4', name: '/api/ai/generate', runtime: 'Node.js 20', region: 'sfo1', invocations: 8920, avgDuration: 2340, errors: 45, memory: 1024 },
  { id: '5', name: '/api/upload', runtime: 'Node.js 20', region: 'iad1', invocations: 5670, avgDuration: 567, errors: 8, memory: 512 }
]

const mockEdgeConfigs: EdgeConfig[] = [
  { id: '1', name: 'feature-flags', itemCount: 24, reads: 125000, writes: 45, createdAt: '2024-01-01' },
  { id: '2', name: 'rate-limits', itemCount: 8, reads: 89000, writes: 12, createdAt: '2024-01-10' },
  { id: '3', name: 'geo-config', itemCount: 15, reads: 45000, writes: 5, createdAt: '2024-01-15' }
]

const mockBlobs: StorageBlob[] = [
  { id: '1', name: 'uploads/avatar-001.png', size: 245000, contentType: 'image/png', uploadedAt: '2024-01-15T10:00:00Z', downloadCount: 156, isPublic: true },
  { id: '2', name: 'uploads/document.pdf', size: 1245000, contentType: 'application/pdf', uploadedAt: '2024-01-14T14:00:00Z', downloadCount: 45, isPublic: false },
  { id: '3', name: 'assets/logo.svg', size: 12000, contentType: 'image/svg+xml', uploadedAt: '2024-01-10T09:00:00Z', downloadCount: 890, isPublic: true },
  { id: '4', name: 'backups/db-2024-01-15.sql', size: 52400000, contentType: 'application/sql', uploadedAt: '2024-01-15T06:00:00Z', downloadCount: 2, isPublic: false }
]

const mockProtections: DeploymentProtection[] = [
  { id: '1', name: 'Password Protection', type: 'password', enabled: true, config: { password: '••••••' } },
  { id: '2', name: 'Vercel Authentication', type: 'vercel_auth', enabled: false, config: {} },
  { id: '3', name: 'Trusted IPs', type: 'trusted_ips', enabled: true, config: { ips: ['192.168.1.0/24', '10.0.0.0/8'] } }
]

const mockWebhooks: DeploymentWebhook[] = [
  { id: '1', name: 'Slack Notifications', url: 'https://hooks.slack.com/services/xxx', events: ['deployment.created', 'deployment.succeeded', 'deployment.failed'], status: 'active', lastTriggered: '2024-01-16 09:23', successRate: 100, secret: 'whsec_xxxxxx' },
  { id: '2', name: 'Discord Bot', url: 'https://discord.com/api/webhooks/xxx', events: ['deployment.succeeded'], status: 'active', lastTriggered: '2024-01-16 09:00', successRate: 98.5, secret: 'whsec_yyyyyy' },
  { id: '3', name: 'CI/CD Trigger', url: 'https://api.internal.io/webhooks/deploy', events: ['deployment.promoted', 'deployment.rolled_back'], status: 'failed', lastTriggered: '2024-01-14 15:30', successRate: 78.0, secret: 'whsec_zzzzzz' }
]

const mockIntegrations: Integration[] = [
  { id: '1', name: 'GitHub', type: 'ci_cd', status: 'connected', icon: 'github', lastSync: '2024-01-16 09:00', config: { repo: 'freeflow-app/freeflow', branch: 'main' } },
  { id: '2', name: 'Datadog', type: 'monitoring', status: 'connected', icon: 'datadog', lastSync: '2024-01-16 08:45', config: { apiKey: '••••••' } },
  { id: '3', name: 'Slack', type: 'notification', status: 'connected', icon: 'slack', lastSync: '2024-01-16 09:15', config: { channel: '#deployments' } },
  { id: '4', name: 'LogDNA', type: 'logging', status: 'disconnected', icon: 'logdna', lastSync: '2024-01-10 12:00', config: {} },
  { id: '5', name: 'Sentry', type: 'monitoring', status: 'connected', icon: 'sentry', lastSync: '2024-01-16 08:30', config: { org: 'freeflow', project: 'main' } },
  { id: '6', name: 'Amplitude', type: 'analytics', status: 'connected', icon: 'amplitude', lastSync: '2024-01-16 08:00', config: { apiKey: '••••••' } }
]

const mockTeamMembers: TeamMember[] = [
  { id: '1', name: 'Sarah Chen', email: 'sarah@freeflow.app', role: 'owner', avatar: 'SC', lastActive: '2024-01-16 09:23', deploymentsThisMonth: 45 },
  { id: '2', name: 'Mike Johnson', email: 'mike@freeflow.app', role: 'admin', avatar: 'MJ', lastActive: '2024-01-16 09:15', deploymentsThisMonth: 38 },
  { id: '3', name: 'Emily Davis', email: 'emily@freeflow.app', role: 'developer', avatar: 'ED', lastActive: '2024-01-16 08:45', deploymentsThisMonth: 32 },
  { id: '4', name: 'Alex Kim', email: 'alex@freeflow.app', role: 'developer', avatar: 'AK', lastActive: '2024-01-15 18:30', deploymentsThisMonth: 28 },
  { id: '5', name: 'Jordan Lee', email: 'jordan@freeflow.app', role: 'viewer', avatar: 'JL', lastActive: '2024-01-15 14:00', deploymentsThisMonth: 0 }
]

const mockBuildPlugins: BuildPlugin[] = [
  { id: '1', name: 'Lighthouse Audit', version: '2.3.1', enabled: true, description: 'Run Lighthouse performance audits on each deployment', author: 'Vercel', installCount: 125000 },
  { id: '2', name: 'Bundle Analyzer', version: '1.5.0', enabled: true, description: 'Analyze JavaScript bundle size', author: 'Vercel', installCount: 89000 },
  { id: '3', name: 'Image Optimizer', version: '3.0.2', enabled: true, description: 'Automatically optimize images during build', author: 'Vercel', installCount: 156000 },
  { id: '4', name: 'Cache Warmer', version: '1.2.0', enabled: false, description: 'Pre-populate CDN cache after deployment', author: 'Community', installCount: 34000 }
]

// Enhanced Competitive Upgrade Mock Data
const mockDeploymentsAIInsights = [
  { id: '1', type: 'success' as const, title: 'Deploy Success', description: '100% deployment success rate this week. Zero rollbacks needed.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Reliability' },
  { id: '2', type: 'info' as const, title: 'Build Time', description: 'Average build time reduced to 45 seconds with new caching.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '3', type: 'warning' as const, title: 'Resource Usage', description: 'Production memory at 82%. Consider scaling before next deploy.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Resources' },
]

const mockDeploymentsCollaborators = [
  { id: '1', name: 'DevOps Lead', avatar: '/avatars/devops.jpg', status: 'online' as const, role: 'Lead' },
  { id: '2', name: 'SRE', avatar: '/avatars/sre.jpg', status: 'online' as const, role: 'SRE' },
  { id: '3', name: 'Developer', avatar: '/avatars/dev.jpg', status: 'busy' as const, role: 'Dev' },
]

const mockDeploymentsPredictions = [
  { id: '1', title: 'Deploy Window', prediction: 'Next safe deploy window: 2 PM', confidence: 92, trend: 'stable' as const, impact: 'high' as const },
  { id: '2', title: 'Uptime Goal', prediction: '99.99% uptime achievable this month', confidence: 88, trend: 'up' as const, impact: 'medium' as const },
]

const mockDeploymentsActivities = [
  { id: '1', user: 'CI/CD Pipeline', action: 'Deployed to', target: 'Production v2.4.1', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Auto-Scale', action: 'Scaled up', target: 'API servers (3 → 5)', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'Monitor', action: 'Health check passed for', target: 'All endpoints', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'update' as const },
]

const mockDeploymentsQuickActions = [
  { id: '1', label: 'Deploy Now', icon: 'rocket', action: () => console.log('Deploy'), variant: 'default' as const },
  { id: '2', label: 'Rollback', icon: 'undo', action: () => console.log('Rollback'), variant: 'default' as const },
  { id: '3', label: 'View Logs', icon: 'file-text', action: () => console.log('Logs'), variant: 'outline' as const },
]

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
  const supabase = createClientComponentClient()

  // Database state
  const [dbDeployments, setDbDeployments] = useState<DbDeployment[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deploymentForm, setDeploymentForm] = useState(defaultDeploymentForm)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedDbDeployment, setSelectedDbDeployment] = useState<DbDeployment | null>(null)

  // Fetch deployments from Supabase
  const fetchDeployments = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('deployments')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setDbDeployments(data || [])
    } catch (error: any) {
      toast.error('Failed to load deployments', { description: error.message })
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchDeployments()
  }, [fetchDeployments])

  // Create deployment
  const handleCreateDeployment = async () => {
    if (!deploymentForm.deployment_name || !deploymentForm.version) {
      toast.error('Validation Error', { description: 'Deployment name and version are required' })
      return
    }

    setIsSubmitting(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Not authenticated')

      const { error } = await supabase.from('deployments').insert({
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
        can_rollback: true,
      })

      if (error) throw error
      toast.success('Deployment Created', { description: `${deploymentForm.deployment_name} v${deploymentForm.version} queued` })
      setShowCreateDialog(false)
      setDeploymentForm(defaultDeploymentForm)
      fetchDeployments()
    } catch (error: any) {
      toast.error('Failed to create deployment', { description: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Start deployment (update status to in_progress)
  const handleStartDeployment = async (deployment: DbDeployment) => {
    try {
      const { error } = await supabase
        .from('deployments')
        .update({ status: 'in_progress', started_at: new Date().toISOString() })
        .eq('id', deployment.id)

      if (error) throw error
      toast.info('Deployment Started', { description: `${deployment.deployment_name} is now deploying...` })
      fetchDeployments()
    } catch (error: any) {
      toast.error('Failed to start deployment', { description: error.message })
    }
  }

  // Complete deployment
  const handleCompleteDeployment = async (deployment: DbDeployment, success: boolean) => {
    try {
      const startTime = deployment.started_at ? new Date(deployment.started_at).getTime() : Date.now()
      const duration = Math.floor((Date.now() - startTime) / 1000)

      const { error } = await supabase
        .from('deployments')
        .update({
          status: success ? 'success' : 'failed',
          completed_at: new Date().toISOString(),
          duration_seconds: duration,
        })
        .eq('id', deployment.id)

      if (error) throw error
      toast[success ? 'success' : 'error'](
        success ? 'Deployment Successful' : 'Deployment Failed',
        { description: `${deployment.deployment_name} v${deployment.version}` }
      )
      fetchDeployments()
    } catch (error: any) {
      toast.error('Failed to update deployment', { description: error.message })
    }
  }

  // Rollback deployment
  const handleRollbackDeployment = async (deployment: DbDeployment) => {
    if (!deployment.can_rollback) {
      toast.error('Cannot Rollback', { description: 'This deployment cannot be rolled back' })
      return
    }

    try {
      const { error } = await supabase
        .from('deployments')
        .update({ status: 'rolled_back' })
        .eq('id', deployment.id)

      if (error) throw error
      toast.success('Rollback Initiated', { description: `Rolling back ${deployment.deployment_name}` })
      setShowRollbackDialog(false)
      fetchDeployments()
    } catch (error: any) {
      toast.error('Failed to rollback', { description: error.message })
    }
  }

  // Cancel deployment
  const handleCancelDeployment = async (deployment: DbDeployment) => {
    try {
      const { error } = await supabase
        .from('deployments')
        .update({ status: 'cancelled' })
        .eq('id', deployment.id)

      if (error) throw error
      toast.info('Deployment Cancelled', { description: `${deployment.deployment_name} has been cancelled` })
      fetchDeployments()
    } catch (error: any) {
      toast.error('Failed to cancel deployment', { description: error.message })
    }
  }

  // Delete deployment
  const handleDeleteDeployment = async (id: string) => {
    try {
      const { error } = await supabase.from('deployments').delete().eq('id', id)
      if (error) throw error
      toast.success('Deployment Deleted', { description: 'Deployment record removed' })
      fetchDeployments()
    } catch (error: any) {
      toast.error('Failed to delete deployment', { description: error.message })
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

  const filteredDeployments = useMemo(() => {
    return mockDeployments.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           d.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           d.commitMessage.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesEnv = environmentFilter === 'all' || d.environment === environmentFilter
      return matchesSearch && matchesEnv
    })
  }, [searchQuery, environmentFilter])

  const stats = useMemo(() => {
    const total = mockDeployments.length
    const successful = mockDeployments.filter(d => d.status === 'success').length
    const avgDuration = mockDeployments.reduce((sum, d) => sum + d.duration, 0) / total
    return {
      total,
      successful,
      successRate: ((successful / total) * 100).toFixed(1),
      avgDuration: avgDuration.toFixed(0),
      totalFunctions: mockFunctions.length,
      totalInvocations: mockFunctions.reduce((sum, f) => sum + f.invocations, 0),
      totalDomains: mockDomains.length,
      totalStorage: mockBlobs.reduce((sum, b) => sum + b.size, 0)
    }
  }, [])

  // Promote deployment to production
  const handlePromoteDeployment = async (deployment: DbDeployment) => {
    try {
      const { error } = await supabase
        .from('deployments')
        .update({ environment: 'production' })
        .eq('id', deployment.id)

      if (error) throw error
      toast.success('Promoted', { description: `${deployment.deployment_name} promoted to production` })
      fetchDeployments()
    } catch (error: any) {
      toast.error('Failed to promote', { description: error.message })
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
    mockBuildLogs.forEach(log => {
      if (!groups[log.step]) groups[log.step] = []
      groups[log.step].push(log)
    })
    return groups
  }, [])

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
              <div className="grid grid-cols-6 gap-4">
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
                <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-1" />Filters</Button>
              </div>
            </div>

            {/* Pipeline Status */}
            <div className="grid grid-cols-4 gap-4">
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
                        <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1" />Inspect</Button>
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
                  <Button variant="outline" className="border-white/50 text-white hover:bg-white/10"><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
                  <Button className="bg-white text-orange-700 hover:bg-orange-50"><Plus className="h-4 w-4 mr-2" />New Function</Button>
                </div>
              </div>
              <div className="grid grid-cols-6 gap-4">
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{mockFunctions.length}</p>
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
            <div className="grid grid-cols-4 gap-4">
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
            <div className="grid grid-cols-2 gap-6">
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
                  {mockFunctions.map(fn => (
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
                      <div className="grid grid-cols-3 gap-8 text-center">
                        <div><p className="font-medium">{fn.invocations.toLocaleString()}</p><p className="text-xs text-gray-500">invocations</p></div>
                        <div><p className="font-medium">{fn.avgDuration}ms</p><p className="text-xs text-gray-500">avg duration</p></div>
                        <div><p className={`font-medium ${fn.errors > 20 ? 'text-red-600' : 'text-green-600'}`}>{fn.errors}</p><p className="text-xs text-gray-500">errors</p></div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm"><Terminal className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm"><BarChart3 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm"><Settings className="h-4 w-4" /></Button>
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
                  <Button variant="outline" className="border-white/50 text-white hover:bg-white/10"><RefreshCw className="h-4 w-4 mr-2" />Sync</Button>
                  <Button className="bg-white text-cyan-700 hover:bg-cyan-50"><Plus className="h-4 w-4 mr-2" />Create Config</Button>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-4">
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{mockEdgeConfigs.length}</p>
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
            <div className="grid grid-cols-6 gap-4">
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
            <div className="grid grid-cols-3 gap-6">
              {mockEdgeConfigs.map(config => (
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
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"><p className="text-lg font-bold">{(config.reads / 1000).toFixed(0)}k</p><p className="text-xs text-gray-500">Reads</p></div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"><p className="text-lg font-bold">{config.writes}</p><p className="text-xs text-gray-500">Writes</p></div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1"><Eye className="h-3 w-3 mr-1" />View</Button>
                      <Button variant="outline" size="sm" className="flex-1"><Settings className="h-3 w-3 mr-1" />Edit</Button>
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
                  <Button variant="outline" className="border-white/50 text-white hover:bg-white/10"><Folder className="h-4 w-4 mr-2" />New Folder</Button>
                  <Button className="bg-white text-indigo-700 hover:bg-indigo-50"><Upload className="h-4 w-4 mr-2" />Upload</Button>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-4">
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{mockBlobs.length}</p>
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
            <div className="grid grid-cols-4 gap-4">
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
                  {mockBlobs.map(blob => (
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
                        <Button variant="ghost" size="icon"><Copy className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-red-500" /></Button>
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
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10"><Download className="h-4 w-4 mr-2" />Export</Button>
                  <Button className="bg-green-600 text-white hover:bg-green-700"><Play className="h-4 w-4 mr-2" />Live Tail</Button>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-4">
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{mockBuildLogs.length}</p>
                  <p className="text-sm text-gray-400">Total Logs</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-red-400">{mockBuildLogs.filter(l => l.level === 'error').length}</p>
                  <p className="text-sm text-gray-400">Errors</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-amber-400">{mockBuildLogs.filter(l => l.level === 'warn').length}</p>
                  <p className="text-sm text-gray-400">Warnings</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-400">{mockBuildLogs.filter(l => l.level === 'success').length}</p>
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
                    <Button variant="outline" size="sm"><RefreshCw className="h-4 w-4" /></Button>
                    <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-1" />More Filters</Button>
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
                  <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700"><Copy className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700"><Download className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px] bg-gray-900 p-4 font-mono text-sm">
                  {mockBuildLogs.map(log => (
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
            <div className="grid grid-cols-3 gap-6">
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
                  <Button variant="outline" className="w-full justify-start"><AlertCircle className="h-4 w-4 mr-2" />View All Errors</Button>
                  <Button variant="outline" className="w-full justify-start"><Bell className="h-4 w-4 mr-2" />Set Up Alerts</Button>
                  <Button variant="outline" className="w-full justify-start"><BarChart3 className="h-4 w-4 mr-2" />Log Analytics</Button>
                  <Button variant="outline" className="w-full justify-start"><Download className="h-4 w-4 mr-2" />Export Logs</Button>
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
                  <Button className="bg-white text-blue-700 hover:bg-blue-50"><Download className="h-4 w-4 mr-2" />Export</Button>
                </div>
              </div>
              <div className="grid grid-cols-6 gap-4">
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
            <div className="grid grid-cols-4 gap-4">
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
            <div className="grid grid-cols-2 gap-6">
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
            <div className="grid grid-cols-2 gap-6">
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
                <Button className="bg-white text-red-700 hover:bg-red-50"><Shield className="h-4 w-4 mr-2" />Security Audit</Button>
              </div>
              <div className="grid grid-cols-5 gap-4">
                <div className="bg-white/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">{mockProtections.filter(p => p.enabled).length}</p>
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
            <div className="grid grid-cols-3 gap-4">
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
                  <Button variant="outline"><Plus className="h-4 w-4 mr-2" />Add Rule</Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {mockProtections.map(protection => (
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
                        <Switch checked={protection.enabled} />
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
                        <div className="grid grid-cols-2 gap-4"><div><Label>Project Name</Label><Input defaultValue="freeflow-app" className="mt-1" /></div><div><Label>Framework</Label><Select defaultValue="nextjs"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="nextjs">Next.js</SelectItem><SelectItem value="react">React</SelectItem><SelectItem value="vue">Vue</SelectItem><SelectItem value="nuxt">Nuxt.js</SelectItem><SelectItem value="astro">Astro</SelectItem><SelectItem value="remix">Remix</SelectItem></SelectContent></Select></div></div>
                        <div className="grid grid-cols-2 gap-4"><div><Label>Build Command</Label><Input defaultValue="npm run build" className="mt-1 font-mono" /></div><div><Label>Output Directory</Label><Input defaultValue=".next" className="mt-1 font-mono" /></div></div>
                        <div className="grid grid-cols-2 gap-4"><div><Label>Install Command</Label><Input defaultValue="npm install" className="mt-1 font-mono" /></div><div><Label>Node.js Version</Label><Select defaultValue="20"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="18">18.x</SelectItem><SelectItem value="20">20.x (LTS)</SelectItem><SelectItem value="22">22.x</SelectItem></SelectContent></Select></div></div>
                        <div className="grid grid-cols-2 gap-4"><div><Label>Root Directory</Label><Input defaultValue="./" className="mt-1 font-mono" /></div><div><Label>Development Command</Label><Input defaultValue="npm run dev" className="mt-1 font-mono" /></div></div>
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
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
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
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
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
                        <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50"><Trash2 className="h-4 w-4 mr-2" />Delete All Deployments</Button>
                        <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50"><RefreshCw className="h-4 w-4 mr-2" />Reset Project Settings</Button>
                        <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50"><Lock className="h-4 w-4 mr-2" />Disable Deployments</Button>
                        <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50"><Trash2 className="h-4 w-4 mr-2" />Delete Project</Button>
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
                        <div className="grid grid-cols-2 gap-4">
                          <div><Label>Git Provider</Label><Select defaultValue="github"><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="github">GitHub</SelectItem><SelectItem value="gitlab">GitLab</SelectItem><SelectItem value="bitbucket">Bitbucket</SelectItem></SelectContent></Select></div>
                          <div><Label>Repository</Label><Input defaultValue="freeflow-app/freeflow" className="mt-1 font-mono" /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
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
                      <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="flex items-center gap-2"><Webhook className="h-5 w-5 text-purple-600" />Deploy Hooks</CardTitle><Button size="sm"><Plus className="h-4 w-4 mr-2" />Create Hook</Button></CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-gray-500">Deploy hooks allow you to trigger deployments from external services via HTTP POST requests.</p>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Production Hook</span>
                            <Badge className="bg-green-100 text-green-700">Active</Badge>
                          </div>
                          <code className="text-xs text-gray-500 break-all">https://api.vercel.com/v1/integrations/deploy/xxxxx</code>
                          <div className="flex gap-2 mt-2">
                            <Button variant="outline" size="sm"><Copy className="h-3 w-3 mr-1" />Copy</Button>
                            <Button variant="outline" size="sm" className="text-red-600"><Trash2 className="h-3 w-3 mr-1" />Delete</Button>
                          </div>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Staging Hook</span>
                            <Badge className="bg-blue-100 text-blue-700">Active</Badge>
                          </div>
                          <code className="text-xs text-gray-500 break-all">https://api.vercel.com/v1/integrations/deploy/yyyyy</code>
                          <div className="flex gap-2 mt-2">
                            <Button variant="outline" size="sm"><Copy className="h-3 w-3 mr-1" />Copy</Button>
                            <Button variant="outline" size="sm" className="text-red-600"><Trash2 className="h-3 w-3 mr-1" />Delete</Button>
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
                      {mockIntegrations.map(integration => (
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
                          <div className="flex items-center gap-3"><Badge className={integration.status === 'connected' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>{integration.status}</Badge><Button variant="ghost" size="sm"><Settings className="h-4 w-4" /></Button></div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
                {settingsTab === 'webhooks' && (
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Webhooks</CardTitle><Button onClick={() => setShowWebhookDialog(true)}><Plus className="h-4 w-4 mr-2" />Add Webhook</Button></CardHeader>
                    <CardContent className="space-y-4">
                      {mockWebhooks.map(webhook => (
                        <div key={webhook.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2"><h4 className="font-medium">{webhook.name}</h4><Badge className={webhook.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{webhook.status}</Badge></div>
                            <p className="font-mono text-sm text-gray-500 mt-1">{webhook.url}</p>
                            <div className="flex items-center gap-2 mt-2">{webhook.events.map(e => <Badge key={e} variant="outline" className="text-xs">{e}</Badge>)}</div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right"><p className="text-sm"><span className={webhook.successRate >= 95 ? 'text-green-600' : 'text-amber-600'}>{webhook.successRate}%</span></p><p className="text-xs text-gray-500">success rate</p></div>
                            <Button variant="ghost" size="icon"><RefreshCw className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
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
                      {mockTeamMembers.map(member => (
                        <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10"><AvatarFallback className="bg-purple-100 text-purple-700">{member.avatar}</AvatarFallback></Avatar>
                            <div><h4 className="font-medium">{member.name}</h4><p className="text-sm text-gray-500">{member.email}</p></div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right"><p className="text-sm font-medium">{member.deploymentsThisMonth} deploys</p><p className="text-xs text-gray-500">this month</p></div>
                            <Badge variant="outline" className={member.role === 'owner' ? 'bg-purple-100 text-purple-700' : member.role === 'admin' ? 'bg-blue-100 text-blue-700' : ''}>{member.role}</Badge>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
                {settingsTab === 'plugins' && (
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Build Plugins</CardTitle><Button variant="outline"><Search className="h-4 w-4 mr-2" />Browse Marketplace</Button></CardHeader>
                    <CardContent className="space-y-4">
                      {mockBuildPlugins.map(plugin => (
                        <div key={plugin.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center"><Package className="h-5 w-5 text-indigo-600" /></div>
                            <div><div className="flex items-center gap-2"><h4 className="font-medium">{plugin.name}</h4><Badge variant="outline" className="text-xs">v{plugin.version}</Badge></div><p className="text-sm text-gray-500">{plugin.description}</p><p className="text-xs text-gray-400 mt-1">by {plugin.author} • {(plugin.installCount / 1000).toFixed(0)}k installs</p></div>
                          </div>
                          <Switch checked={plugin.enabled} />
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
              insights={mockDeploymentsAIInsights}
              title="Deployment Intelligence"
              onInsightAction={(insight) => console.log('Insight action:', insight)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockDeploymentsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockDeploymentsPredictions}
              title="Deploy Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockDeploymentsActivities}
            title="Deploy Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={mockDeploymentsQuickActions}
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
              <Button><Download className="h-4 w-4 mr-2" />Download Logs</Button>
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
                <Input placeholder="KEY" className="flex-1 font-mono" />
                <Input placeholder="Value" className="flex-1" type="password" />
                <Button><Plus className="h-4 w-4" /></Button>
              </div>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {mockEnvVars.map(env => (
                    <div key={env.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">{env.key}</span>
                          {env.encrypted && <Lock className="h-3 w-3 text-gray-400" />}
                        </div>
                        <span className="text-sm text-gray-500">{env.value}</span>
                      </div>
                      <Badge variant="outline">{env.environment}</Badge>
                      <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEnvDialog(false)}>Cancel</Button>
              <Button>Save Changes</Button>
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
                <Input placeholder="example.com" className="flex-1" />
                <Button>Add Domain</Button>
              </div>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {mockDomains.map(domain => (
                    <div key={domain.id} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <div className="flex-1">
                        <span className="font-medium">{domain.domain}</span>
                        {domain.ssl && <Badge className="ml-2 bg-green-100 text-green-700"><Lock className="h-3 w-3 mr-1" />SSL</Badge>}
                        {domain.redirectTo && <span className="ml-2 text-sm text-gray-500">→ {domain.redirectTo}</span>}
                      </div>
                      <Badge variant={domain.type === 'production' ? 'default' : 'outline'}>{domain.type}</Badge>
                      <Button variant="ghost" size="icon"><ExternalLink className="h-4 w-4" /></Button>
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
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {['deployment.created', 'deployment.succeeded', 'deployment.failed', 'deployment.promoted', 'deployment.rolled_back', 'domain.added'].map(event => (
                    <div key={event} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded"><input type="checkbox" /><span className="text-sm font-mono">{event}</span></div>
                  ))}
                </div>
              </div>
              <div><Label>Secret (Optional)</Label><Input placeholder="whsec_xxxxxxxxx" className="mt-1 font-mono" /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowWebhookDialog(false)}>Cancel</Button><Button className="bg-gradient-to-r from-purple-600 to-indigo-600">Add Webhook</Button></DialogFooter>
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
            <DialogFooter><Button variant="outline" onClick={() => setShowTeamDialog(false)}>Cancel</Button><Button className="bg-gradient-to-r from-purple-600 to-indigo-600">Send Invitation</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Integration Dialog */}
        <Dialog open={showIntegrationDialog} onOpenChange={setShowIntegrationDialog}>
          <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Add Integration</DialogTitle><DialogDescription>Connect third-party services to your deployments</DialogDescription></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-3 gap-3">
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Deployment Name *</Label>
                  <Input placeholder="my-app-release" className="mt-1" value={deploymentForm.deployment_name} onChange={(e) => setDeploymentForm(prev => ({ ...prev, deployment_name: e.target.value }))} />
                </div>
                <div>
                  <Label>Version *</Label>
                  <Input placeholder="1.0.0" className="mt-1" value={deploymentForm.version} onChange={(e) => setDeploymentForm(prev => ({ ...prev, version: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
              <div className="grid grid-cols-2 gap-4">
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
      </div>
    </div>
  )
}
