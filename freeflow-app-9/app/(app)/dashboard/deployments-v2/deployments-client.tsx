'use client'

import { useState, useMemo } from 'react'
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
  Rocket, CheckCircle, CheckCircle2, XCircle, Clock, Server, GitBranch, Globe, Activity,
  RotateCcw, Play, Terminal, Eye, Link, Settings, Trash2, Copy, ExternalLink,
  GitCommit, FileCode, Zap, Shield, RefreshCw, AlertTriangle, Check, X,
  Box, Layers, Database, Cloud, Lock, Unlock, Plus, ChevronRight, ChevronDown,
  Search, Filter, MoreHorizontal, Download, Upload, ArrowUpRight, Timer,
  Cpu, HardDrive, Network, TrendingUp, Calendar, User, MessageSquare,
  Settings2, FileText, BarChart3, AlertCircle, Info, Webhook, Key, Hash,
  Folder, File, Package, Gauge, MonitorPlay, CircleDot, Workflow, GitPullRequest
} from 'lucide-react'

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

export default function DeploymentsClient() {
  const [activeTab, setActiveTab] = useState('deployments')
  const [searchQuery, setSearchQuery] = useState('')
  const [environmentFilter, setEnvironmentFilter] = useState<DeploymentEnvironment | 'all'>('all')
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null)
  const [showLogsDialog, setShowLogsDialog] = useState(false)
  const [showEnvDialog, setShowEnvDialog] = useState(false)
  const [showDomainDialog, setShowDomainDialog] = useState(false)
  const [showRollbackDialog, setShowRollbackDialog] = useState(false)
  const [expandedLogs, setExpandedLogs] = useState<string[]>(['clone', 'install', 'build', 'deploy'])

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
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600"><Rocket className="h-4 w-4 mr-2" />Deploy</Button>
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
          <TabsContent value="deployments" className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <Button variant={environmentFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setEnvironmentFilter('all')}>All</Button>
              <Button variant={environmentFilter === 'production' ? 'default' : 'outline'} size="sm" onClick={() => setEnvironmentFilter('production')} className={environmentFilter === 'production' ? 'bg-purple-600' : ''}><Globe className="h-3 w-3 mr-1" />Production</Button>
              <Button variant={environmentFilter === 'preview' ? 'default' : 'outline'} size="sm" onClick={() => setEnvironmentFilter('preview')}>Preview</Button>
              <Button variant={environmentFilter === 'staging' ? 'default' : 'outline'} size="sm" onClick={() => setEnvironmentFilter('staging')}>Staging</Button>
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
          <TabsContent value="functions" className="mt-6">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card><CardContent className="p-4"><p className="text-2xl font-bold">{stats.totalInvocations.toLocaleString()}</p><p className="text-sm text-gray-500">Total Invocations</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-2xl font-bold">234ms</p><p className="text-sm text-gray-500">Avg Duration</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-2xl font-bold text-green-600">0.09%</p><p className="text-sm text-gray-500">Error Rate</p></CardContent></Card>
            </div>
            <Card className="border-gray-200 dark:border-gray-700">
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {mockFunctions.map(fn => (
                    <div key={fn.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                        <Zap className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium font-mono text-sm">{fn.name}</p>
                        <p className="text-xs text-gray-500">{fn.runtime} • {fn.region} • {fn.memory}MB</p>
                      </div>
                      <div className="grid grid-cols-3 gap-8 text-center">
                        <div><p className="font-medium">{fn.invocations.toLocaleString()}</p><p className="text-xs text-gray-500">invocations</p></div>
                        <div><p className="font-medium">{fn.avgDuration}ms</p><p className="text-xs text-gray-500">avg duration</p></div>
                        <div><p className={`font-medium ${fn.errors > 20 ? 'text-red-600' : 'text-green-600'}`}>{fn.errors}</p><p className="text-xs text-gray-500">errors</p></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Edge Config Tab */}
          <TabsContent value="edge" className="mt-6">
            <div className="flex justify-end mb-4">
              <Button><Plus className="h-4 w-4 mr-2" />Create Edge Config</Button>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {mockEdgeConfigs.map(config => (
                <Card key={config.id} className="border-gray-200 dark:border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900 flex items-center justify-center">
                        <Network className="h-5 w-5 text-cyan-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{config.name}</h4>
                        <p className="text-xs text-gray-500">{config.itemCount} items</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"><p className="text-lg font-bold">{(config.reads / 1000).toFixed(0)}k</p><p className="text-xs text-gray-500">Reads</p></div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"><p className="text-lg font-bold">{config.writes}</p><p className="text-xs text-gray-500">Writes</p></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Storage Tab */}
          <TabsContent value="storage" className="mt-6">
            <div className="flex justify-end mb-4">
              <Button><Upload className="h-4 w-4 mr-2" />Upload File</Button>
            </div>
            <Card className="border-gray-200 dark:border-gray-700">
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {mockBlobs.map(blob => (
                    <div key={blob.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                        <File className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium font-mono text-sm">{blob.name}</p>
                        <p className="text-xs text-gray-500">{blob.contentType} • {formatSize(blob.size)}</p>
                      </div>
                      <Badge variant={blob.isPublic ? 'default' : 'outline'}>{blob.isPublic ? 'Public' : 'Private'}</Badge>
                      <span className="text-sm text-gray-500">{blob.downloadCount} downloads</span>
                      <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="mt-6">
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Runtime Logs</CardTitle>
                <div className="flex items-center gap-2">
                  <Select defaultValue="all"><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="error">Errors</SelectItem><SelectItem value="warn">Warnings</SelectItem></SelectContent></Select>
                  <Button variant="outline" size="sm"><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] bg-gray-900 rounded-lg p-4 font-mono text-sm">
                  {mockBuildLogs.map(log => (
                    <div key={log.id} className="flex items-start gap-3 mb-2">
                      <span className="text-gray-500 text-xs w-16">{log.timestamp}</span>
                      <span className={getLogColor(log.level)}>[{log.level.toUpperCase()}]</span>
                      <span className="text-white">{log.message}</span>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card><CardContent className="p-4"><div className="flex items-center gap-2"><Network className="h-5 w-5 text-gray-500" /><span className="text-sm">Bandwidth</span></div><p className="text-2xl font-bold mt-2">24.5 GB</p></CardContent></Card>
              <Card><CardContent className="p-4"><div className="flex items-center gap-2"><Cpu className="h-5 w-5 text-gray-500" /><span className="text-sm">Execution</span></div><p className="text-2xl font-bold mt-2">1,234 hrs</p></CardContent></Card>
              <Card><CardContent className="p-4"><div className="flex items-center gap-2"><HardDrive className="h-5 w-5 text-gray-500" /><span className="text-sm">Build Cache</span></div><p className="text-2xl font-bold mt-2">92%</p></CardContent></Card>
              <Card><CardContent className="p-4"><div className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-gray-500" /><span className="text-sm">Page Views</span></div><p className="text-2xl font-bold mt-2">458K</p></CardContent></Card>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle>Deployments by Day</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                      <div key={day} className="flex items-center gap-3">
                        <span className="w-8 text-sm text-gray-500">{day}</span>
                        <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-3">
                          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full" style={{ width: `${[85, 92, 78, 95, 88, 32, 15][i]}%` }} />
                        </div>
                        <span className="text-sm font-medium w-8">{[12, 15, 10, 18, 14, 3, 1][i]}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle>Top Deployers</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[{ name: 'Sarah Chen', deploys: 45 }, { name: 'Mike Johnson', deploys: 38 }, { name: 'Emily Davis', deploys: 32 }, { name: 'Alex Kim', deploys: 28 }].map((user, i) => (
                      <div key={user.name} className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 w-4">{i + 1}</span>
                        <Avatar className="w-8 h-8"><AvatarFallback className="bg-purple-100 text-purple-700 text-xs">{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                        <span className="flex-1 font-medium">{user.name}</span>
                        <Badge variant="secondary">{user.deploys} deploys</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Protection Tab */}
          <TabsContent value="protection" className="mt-6">
            <div className="space-y-4">
              {mockProtections.map(protection => (
                <Card key={protection.id} className="border-gray-200 dark:border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                          <Shield className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{protection.name}</h4>
                          <p className="text-sm text-gray-500">{protection.type.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <Switch checked={protection.enabled} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <div className="grid grid-cols-2 gap-6">
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle className="flex items-center gap-2"><GitBranch className="h-5 w-5" />Git Integration</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <GitBranch className="h-5 w-5" />
                      <div><p className="font-medium">freeflow-app/freeflow</p><p className="text-sm text-gray-500">Connected to main</p></div>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Connected</Badge>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2"><input type="checkbox" className="rounded" defaultChecked /><span className="text-sm">Auto-deploy on push</span></label>
                    <label className="flex items-center gap-2"><input type="checkbox" className="rounded" defaultChecked /><span className="text-sm">Create preview deployments</span></label>
                    <label className="flex items-center gap-2"><input type="checkbox" className="rounded" /><span className="text-sm">Require approval for production</span></label>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Security</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between"><div><p className="font-medium">SSL/TLS</p><p className="text-sm text-gray-500">Auto-provisioned certificates</p></div><Badge className="bg-green-100 text-green-700">Enabled</Badge></div>
                  <div className="flex items-center justify-between"><div><p className="font-medium">DDoS Protection</p><p className="text-sm text-gray-500">Edge network filtering</p></div><Badge className="bg-green-100 text-green-700">Active</Badge></div>
                  <div className="flex items-center justify-between"><div><p className="font-medium">Password Protection</p><p className="text-sm text-gray-500">For preview deployments</p></div><Switch /></div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

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
              <DialogDescription>Are you sure you want to rollback to {selectedDeployment?.name}?</DialogDescription>
            </DialogHeader>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200">This will instantly redirect all production traffic to the previous deployment.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRollbackDialog(false)}>Cancel</Button>
              <Button className="bg-amber-600 hover:bg-amber-700"><RotateCcw className="h-4 w-4 mr-2" />Confirm Rollback</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
