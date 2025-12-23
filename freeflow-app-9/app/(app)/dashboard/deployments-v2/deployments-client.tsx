'use client'

import { useState, useCallback, useMemo } from 'react'
import { useDeployments, type Deployment, type DeploymentEnvironment, type DeploymentStatus } from '@/lib/hooks/use-deployments'
import { BentoCard } from '@/components/ui/bento-grid-advanced'
import { StatGrid, MiniKPI } from '@/components/ui/results-display'
import { GradientButton, PillButton, ModernButton } from '@/components/ui/modern-buttons'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Rocket, CheckCircle, XCircle, Clock, Server, GitBranch, Globe, Activity,
  RotateCcw, Play, Terminal, Eye, Link, Settings, Trash2, Copy, ExternalLink,
  GitCommit, FileCode, Zap, Shield, RefreshCw, AlertTriangle, Check, X,
  Box, Layers, Database, Cloud, Lock, Unlock, Plus, ChevronRight, ChevronDown,
  Search, Filter, MoreHorizontal, Download, Upload, ArrowUpRight, Timer,
  Cpu, HardDrive, Network, TrendingUp, Calendar, User, MessageSquare
} from 'lucide-react'

// Vercel-style deployment interfaces
interface BuildLog {
  id: string
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'success'
  message: string
  step?: string
}

interface DeploymentDomain {
  id: string
  domain: string
  type: 'production' | 'preview' | 'custom'
  verified: boolean
  ssl: boolean
  createdAt: string
}

interface EnvironmentVariable {
  id: string
  key: string
  value: string
  environment: 'production' | 'preview' | 'development' | 'all'
  encrypted: boolean
  createdAt: string
}

interface DeploymentFunction {
  id: string
  name: string
  runtime: string
  region: string
  invocations: number
  avgDuration: number
  errors: number
}

interface GitInfo {
  repo: string
  branch: string
  commit: string
  commitMessage: string
  author: string
  authorAvatar: string
  prNumber?: number
  prTitle?: string
}

interface DeploymentComment {
  id: string
  user: string
  avatar: string
  comment: string
  createdAt: string
}

// Mock build logs
const mockBuildLogs: BuildLog[] = [
  { id: '1', timestamp: '10:23:01', level: 'info', message: 'Cloning repository...', step: 'clone' },
  { id: '2', timestamp: '10:23:03', level: 'success', message: 'Repository cloned successfully', step: 'clone' },
  { id: '3', timestamp: '10:23:04', level: 'info', message: 'Installing dependencies...', step: 'install' },
  { id: '4', timestamp: '10:23:15', level: 'info', message: 'npm WARN deprecated package@1.0.0', step: 'install' },
  { id: '5', timestamp: '10:23:25', level: 'success', message: 'Dependencies installed (1,247 packages)', step: 'install' },
  { id: '6', timestamp: '10:23:26', level: 'info', message: 'Building application...', step: 'build' },
  { id: '7', timestamp: '10:23:30', level: 'info', message: 'Compiling TypeScript...', step: 'build' },
  { id: '8', timestamp: '10:23:45', level: 'info', message: 'Generating static pages...', step: 'build' },
  { id: '9', timestamp: '10:23:50', level: 'success', message: 'Build completed in 24s', step: 'build' },
  { id: '10', timestamp: '10:23:51', level: 'info', message: 'Uploading build artifacts...', step: 'deploy' },
  { id: '11', timestamp: '10:23:55', level: 'info', message: 'Deploying to edge network...', step: 'deploy' },
  { id: '12', timestamp: '10:24:00', level: 'success', message: 'Deployment ready! https://app-abc123.vercel.app', step: 'deploy' },
]

// Mock domains
const mockDomains: DeploymentDomain[] = [
  { id: '1', domain: 'freeflow.app', type: 'production', verified: true, ssl: true, createdAt: '2024-01-15' },
  { id: '2', domain: 'www.freeflow.app', type: 'production', verified: true, ssl: true, createdAt: '2024-01-15' },
  { id: '3', domain: 'staging.freeflow.app', type: 'preview', verified: true, ssl: true, createdAt: '2024-02-01' },
  { id: '4', domain: 'app-git-main-freeflow.vercel.app', type: 'preview', verified: true, ssl: true, createdAt: '2024-03-10' },
]

// Mock environment variables
const mockEnvVars: EnvironmentVariable[] = [
  { id: '1', key: 'DATABASE_URL', value: '••••••••••••', environment: 'all', encrypted: true, createdAt: '2024-01-15' },
  { id: '2', key: 'NEXT_PUBLIC_API_URL', value: 'https://api.freeflow.app', environment: 'production', encrypted: false, createdAt: '2024-01-15' },
  { id: '3', key: 'STRIPE_SECRET_KEY', value: '••••••••••••', environment: 'production', encrypted: true, createdAt: '2024-01-20' },
  { id: '4', key: 'REDIS_URL', value: '••••••••••••', environment: 'all', encrypted: true, createdAt: '2024-02-01' },
  { id: '5', key: 'SENTRY_DSN', value: 'https://xxx@sentry.io/123', environment: 'all', encrypted: false, createdAt: '2024-02-15' },
]

// Mock serverless functions
const mockFunctions: DeploymentFunction[] = [
  { id: '1', name: '/api/auth/login', runtime: 'Node.js 20', region: 'iad1', invocations: 45230, avgDuration: 124, errors: 23 },
  { id: '2', name: '/api/projects', runtime: 'Node.js 20', region: 'iad1', invocations: 28450, avgDuration: 89, errors: 5 },
  { id: '3', name: '/api/webhooks/stripe', runtime: 'Node.js 20', region: 'iad1', invocations: 12340, avgDuration: 234, errors: 12 },
  { id: '4', name: '/api/ai/generate', runtime: 'Node.js 20', region: 'sfo1', invocations: 8920, avgDuration: 2340, errors: 45 },
  { id: '5', name: '/api/upload', runtime: 'Node.js 20', region: 'iad1', invocations: 5670, avgDuration: 567, errors: 8 },
]

// Mock git info
const mockGitInfo: GitInfo = {
  repo: 'freeflow-app/freeflow',
  branch: 'main',
  commit: 'a3b2c1d',
  commitMessage: 'feat: Add new dashboard components',
  author: 'John Developer',
  authorAvatar: 'https://avatar.vercel.sh/john',
}

// Mock deployment with extended info
interface ExtendedDeployment extends Deployment {
  previewUrl?: string
  productionUrl?: string
  buildTime?: number
  gitInfo?: GitInfo
  comments?: DeploymentComment[]
}

export default function DeploymentsClient({ initialDeployments }: { initialDeployments: Deployment[] }) {
  const [environmentFilter, setEnvironmentFilter] = useState<DeploymentEnvironment | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<DeploymentStatus | 'all'>('all')
  const [activeTab, setActiveTab] = useState('deployments')
  const [selectedDeployment, setSelectedDeployment] = useState<ExtendedDeployment | null>(null)
  const [showLogsDialog, setShowLogsDialog] = useState(false)
  const [showEnvDialog, setShowEnvDialog] = useState(false)
  const [showDomainDialog, setShowDomainDialog] = useState(false)
  const [showRollbackDialog, setShowRollbackDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedLogs, setExpandedLogs] = useState<string[]>(['clone', 'install', 'build', 'deploy'])

  const { deployments, loading, error } = useDeployments({ environment: environmentFilter, status: statusFilter })

  const displayDeployments = useMemo(() => {
    const deps = deployments.length > 0 ? deployments : initialDeployments
    if (!searchQuery) return deps
    return deps.filter(d =>
      d.deployment_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.version.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.branch?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [deployments, initialDeployments, searchQuery])

  const stats = useMemo(() => [
    {
      label: 'Total Deploys',
      value: displayDeployments.length.toLocaleString(),
      change: 23.4,
      icon: <Rocket className="w-5 h-5" />
    },
    {
      label: 'Success Rate',
      value: displayDeployments.length > 0
        ? `${((displayDeployments.filter(d => d.status === 'success').length / displayDeployments.length) * 100).toFixed(1)}%`
        : '0%',
      change: 2.3,
      icon: <CheckCircle className="w-5 h-5" />
    },
    {
      label: 'Avg Build Time',
      value: displayDeployments.length > 0
        ? `${(displayDeployments.reduce((sum, d) => sum + d.duration_seconds, 0) / displayDeployments.length / 60).toFixed(1)}m`
        : '0m',
      change: -15.7,
      icon: <Timer className="w-5 h-5" />
    },
    {
      label: 'Edge Regions',
      value: '12',
      change: 0,
      icon: <Globe className="w-5 h-5" />
    }
  ], [displayDeployments])

  const getStatusColor = (status: DeploymentStatus) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'in_progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'rolled_back': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'cancelled': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const getEnvironmentColor = (env: DeploymentEnvironment) => {
    switch (env) {
      case 'production': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'staging': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'development': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const getLogLevelColor = (level: BuildLog['level']) => {
    switch (level) {
      case 'success': return 'text-green-500'
      case 'error': return 'text-red-500'
      case 'warn': return 'text-yellow-500'
      default: return 'text-gray-400'
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}m ${secs}s`
  }

  const handleViewLogs = useCallback((deployment: ExtendedDeployment) => {
    setSelectedDeployment(deployment)
    setShowLogsDialog(true)
  }, [])

  const handleRollback = useCallback((deployment: ExtendedDeployment) => {
    setSelectedDeployment(deployment)
    setShowRollbackDialog(true)
  }, [])

  const toggleLogStep = (step: string) => {
    setExpandedLogs(prev =>
      prev.includes(step) ? prev.filter(s => s !== step) : [...prev, step]
    )
  }

  const groupedLogs = useMemo(() => {
    const groups: Record<string, BuildLog[]> = {}
    mockBuildLogs.forEach(log => {
      const step = log.step || 'other'
      if (!groups[step]) groups[step] = []
      groups[step].push(log)
    })
    return groups
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50/30 to-blue-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              Deployments
            </h1>
            <p className="text-muted-foreground">Vercel-style deployment management and monitoring</p>
          </div>
          <div className="flex items-center gap-3">
            <ModernButton variant="outline" onClick={() => setShowEnvDialog(true)}>
              <Lock className="w-4 h-4 mr-2" />
              Environment
            </ModernButton>
            <ModernButton variant="outline" onClick={() => setShowDomainDialog(true)}>
              <Globe className="w-4 h-4 mr-2" />
              Domains
            </ModernButton>
            <GradientButton from="purple" to="indigo">
              <Rocket className="w-5 h-5 mr-2" />
              Deploy
            </GradientButton>
          </div>
        </div>

        <StatGrid columns={4} stats={stats} />

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/50 dark:bg-gray-800/50 p-1 rounded-lg">
            <TabsTrigger value="deployments" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
              <Rocket className="w-4 h-4 mr-2" />
              Deployments
            </TabsTrigger>
            <TabsTrigger value="functions" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
              <Zap className="w-4 h-4 mr-2" />
              Functions
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Deployments Tab */}
          <TabsContent value="deployments" className="space-y-6">
            {/* Filters */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search deployments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <PillButton variant={environmentFilter === 'all' ? 'primary' : 'ghost'} onClick={() => setEnvironmentFilter('all')}>All</PillButton>
                <PillButton variant={environmentFilter === 'production' ? 'primary' : 'ghost'} onClick={() => setEnvironmentFilter('production')}>
                  <Globe className="w-4 h-4 mr-1" />Production
                </PillButton>
                <PillButton variant={environmentFilter === 'staging' ? 'primary' : 'ghost'} onClick={() => setEnvironmentFilter('staging')}>
                  <Server className="w-4 h-4 mr-1" />Preview
                </PillButton>
              </div>
            </div>

            {/* Deployment List */}
            <div className="space-y-3">
              {displayDeployments.map((deployment, index) => (
                <BentoCard key={deployment.id} className="p-0 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        {/* Status indicator */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          deployment.status === 'success' ? 'bg-green-100 dark:bg-green-900/30' :
                          deployment.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900/30' :
                          deployment.status === 'failed' ? 'bg-red-100 dark:bg-red-900/30' :
                          'bg-gray-100 dark:bg-gray-800'
                        }`}>
                          {deployment.status === 'success' && <Check className="w-5 h-5 text-green-600" />}
                          {deployment.status === 'in_progress' && <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />}
                          {deployment.status === 'failed' && <X className="w-5 h-5 text-red-600" />}
                          {deployment.status === 'rolled_back' && <RotateCcw className="w-5 h-5 text-yellow-600" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{deployment.deployment_name}</h3>
                            {index === 0 && deployment.environment === 'production' && (
                              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                Current
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <GitBranch className="w-3 h-3" />
                              {deployment.branch || 'main'}
                            </span>
                            <span className="flex items-center gap-1">
                              <GitCommit className="w-3 h-3" />
                              {deployment.commit_hash || 'a3b2c1d'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDuration(deployment.duration_seconds)}
                            </span>
                          </div>

                          {/* Git commit info */}
                          <div className="flex items-center gap-2 mt-2">
                            <img
                              src={`https://avatar.vercel.sh/${deployment.created_by || 'user'}`}
                              alt="Author"
                              className="w-5 h-5 rounded-full"
                            />
                            <span className="text-sm text-muted-foreground">
                              {mockGitInfo.commitMessage}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getEnvironmentColor(deployment.environment)}`}>
                          {deployment.environment}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(deployment.status)}`}>
                          {deployment.status}
                        </span>
                      </div>
                    </div>

                    {/* Preview URL */}
                    {deployment.status === 'success' && (
                      <div className="mt-4 flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-1">Preview URL</p>
                          <a href="#" className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1">
                            https://app-{deployment.commit_hash?.slice(0, 7) || 'abc123'}.vercel.app
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <ModernButton variant="ghost" size="sm" onClick={() => handleViewLogs(deployment)}>
                          <Terminal className="w-4 h-4 mr-1" />
                          Logs
                        </ModernButton>
                        <ModernButton variant="ghost" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Inspect
                        </ModernButton>
                        {deployment.environment === 'production' && (
                          <ModernButton variant="ghost" size="sm" onClick={() => handleRollback(deployment)}>
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Rollback
                          </ModernButton>
                        )}
                      </div>
                    )}

                    {/* Build progress for in-progress deployments */}
                    {deployment.status === 'in_progress' && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Building...</span>
                          <span className="text-sm font-medium">65%</span>
                        </div>
                        <Progress value={65} className="h-2" />
                      </div>
                    )}
                  </div>
                </BentoCard>
              ))}

              {displayDeployments.length === 0 && (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border">
                  <Rocket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Deployments</h3>
                  <p className="text-muted-foreground mb-4">Deploy your first application to get started</p>
                  <GradientButton from="purple" to="indigo">
                    <Rocket className="w-5 h-5 mr-2" />
                    Deploy Now
                  </GradientButton>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Functions Tab */}
          <TabsContent value="functions" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Invocations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">100,610</div>
                  <p className="text-xs text-green-600">+12.3% from last week</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg Duration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">234ms</div>
                  <p className="text-xs text-green-600">-8.5% from last week</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Error Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0.09%</div>
                  <p className="text-xs text-green-600">-0.02% from last week</p>
                </CardContent>
              </Card>
            </div>

            <BentoCard>
              <div className="p-4 border-b">
                <h3 className="font-semibold">Serverless Functions</h3>
              </div>
              <div className="divide-y">
                {mockFunctions.map((fn) => (
                  <div key={fn.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium font-mono text-sm">{fn.name}</p>
                        <p className="text-xs text-muted-foreground">{fn.runtime} • {fn.region}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 text-sm">
                      <div className="text-right">
                        <p className="font-medium">{fn.invocations.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">invocations</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{fn.avgDuration}ms</p>
                        <p className="text-xs text-muted-foreground">avg duration</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${fn.errors > 20 ? 'text-red-600' : 'text-green-600'}`}>
                          {fn.errors}
                        </p>
                        <p className="text-xs text-muted-foreground">errors</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Network className="w-4 h-4" />
                    Bandwidth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24.5 GB</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Cpu className="w-4 h-4" />
                    Execution Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,234 hrs</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <HardDrive className="w-4 h-4" />
                    Build Cache
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2.8 GB</div>
                  <p className="text-xs text-muted-foreground">92% hit rate</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Page Views
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">458K</div>
                  <p className="text-xs text-green-600">+23% from last month</p>
                </CardContent>
              </Card>
            </div>

            {/* Build time chart placeholder */}
            <BentoCard className="p-6">
              <h3 className="font-semibold mb-4">Build Time Trend</h3>
              <div className="h-64 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <TrendingUp className="w-12 h-12 mx-auto mb-2 text-purple-300" />
                  <p>Build time analytics visualization</p>
                </div>
              </div>
            </BentoCard>

            {/* Deployment frequency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BentoCard className="p-6">
                <h3 className="font-semibold mb-4">Deployments by Day</h3>
                <div className="space-y-3">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                    <div key={day} className="flex items-center gap-3">
                      <span className="w-8 text-sm text-muted-foreground">{day}</span>
                      <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full"
                          style={{ width: `${[85, 92, 78, 95, 88, 32, 15][i]}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8">{[12, 15, 10, 18, 14, 3, 1][i]}</span>
                    </div>
                  ))}
                </div>
              </BentoCard>

              <BentoCard className="p-6">
                <h3 className="font-semibold mb-4">Top Deployers</h3>
                <div className="space-y-4">
                  {[
                    { name: 'John Developer', deploys: 45, avatar: 'john' },
                    { name: 'Sarah Engineer', deploys: 38, avatar: 'sarah' },
                    { name: 'Mike DevOps', deploys: 32, avatar: 'mike' },
                    { name: 'Emily Frontend', deploys: 28, avatar: 'emily' },
                  ].map((user, i) => (
                    <div key={user.name} className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-4">{i + 1}</span>
                      <img
                        src={`https://avatar.vercel.sh/${user.avatar}`}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="flex-1 font-medium">{user.name}</span>
                      <Badge variant="secondary">{user.deploys} deploys</Badge>
                    </div>
                  ))}
                </div>
              </BentoCard>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BentoCard className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <GitBranch className="w-5 h-5" />
                  Git Integration
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                        <GitBranch className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">freeflow-app/freeflow</p>
                        <p className="text-sm text-muted-foreground">Connected to main branch</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Connected</Badge>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm">Auto-deploy on push</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm">Create preview deployments</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Require approval for production</span>
                    </label>
                  </div>
                </div>
              </BentoCard>

              <BentoCard className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SSL/TLS</p>
                      <p className="text-sm text-muted-foreground">Auto-provisioned certificates</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">DDoS Protection</p>
                      <p className="text-sm text-muted-foreground">Edge network filtering</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Password Protection</p>
                      <p className="text-sm text-muted-foreground">For preview deployments</p>
                    </div>
                    <Badge variant="secondary">Disabled</Badge>
                  </div>
                </div>
              </BentoCard>
            </div>
          </TabsContent>
        </Tabs>

        {/* Build Logs Dialog */}
        <Dialog open={showLogsDialog} onOpenChange={setShowLogsDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                Build Logs - {selectedDeployment?.deployment_name}
              </DialogTitle>
              <DialogDescription>
                Deployment {selectedDeployment?.commit_hash} • {selectedDeployment?.environment}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[500px] bg-gray-900 rounded-lg p-4 font-mono text-sm">
              {Object.entries(groupedLogs).map(([step, logs]) => (
                <div key={step} className="mb-4">
                  <button
                    onClick={() => toggleLogStep(step)}
                    className="flex items-center gap-2 text-white mb-2 hover:text-purple-400"
                  >
                    {expandedLogs.includes(step) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    <span className="capitalize font-semibold">{step}</span>
                    <span className="text-gray-500 text-xs">({logs.length} lines)</span>
                  </button>
                  {expandedLogs.includes(step) && (
                    <div className="ml-6 space-y-1">
                      {logs.map((log) => (
                        <div key={log.id} className="flex items-start gap-3">
                          <span className="text-gray-500 text-xs">{log.timestamp}</span>
                          <span className={getLogLevelColor(log.level)}>{log.message}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </ScrollArea>
            <DialogFooter>
              <ModernButton variant="outline" onClick={() => setShowLogsDialog(false)}>Close</ModernButton>
              <ModernButton variant="primary">
                <Download className="w-4 h-4 mr-2" />
                Download Logs
              </ModernButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Environment Variables Dialog */}
        <Dialog open={showEnvDialog} onOpenChange={setShowEnvDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Environment Variables
              </DialogTitle>
              <DialogDescription>
                Manage encrypted environment variables for your deployments
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Input placeholder="KEY" className="flex-1 font-mono" />
                <Input placeholder="Value" className="flex-1" type="password" />
                <ModernButton variant="primary" size="sm">
                  <Plus className="w-4 h-4" />
                </ModernButton>
              </div>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {mockEnvVars.map((env) => (
                    <div key={env.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">{env.key}</span>
                          {env.encrypted && <Lock className="w-3 h-3 text-muted-foreground" />}
                        </div>
                        <span className="text-sm text-muted-foreground">{env.value}</span>
                      </div>
                      <Badge variant="secondary">{env.environment}</Badge>
                      <ModernButton variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </ModernButton>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <DialogFooter>
              <ModernButton variant="outline" onClick={() => setShowEnvDialog(false)}>Cancel</ModernButton>
              <ModernButton variant="primary">Save Changes</ModernButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Domains Dialog */}
        <Dialog open={showDomainDialog} onOpenChange={setShowDomainDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Domains
              </DialogTitle>
              <DialogDescription>
                Manage custom domains for your deployment
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Input placeholder="example.com" className="flex-1" />
                <ModernButton variant="primary">Add Domain</ModernButton>
              </div>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {mockDomains.map((domain) => (
                    <div key={domain.id} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{domain.domain}</span>
                          {domain.ssl && (
                            <Badge className="bg-green-100 text-green-700 text-xs">
                              <Lock className="w-3 h-3 mr-1" />
                              SSL
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Badge variant={domain.type === 'production' ? 'default' : 'secondary'}>
                        {domain.type}
                      </Badge>
                      <ModernButton variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </ModernButton>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <DialogFooter>
              <ModernButton variant="outline" onClick={() => setShowDomainDialog(false)}>Close</ModernButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rollback Confirmation Dialog */}
        <Dialog open={showRollbackDialog} onOpenChange={setShowRollbackDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-yellow-600">
                <AlertTriangle className="w-5 h-5" />
                Confirm Rollback
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to rollback to {selectedDeployment?.deployment_name}?
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                This will instantly redirect all production traffic to the previous deployment.
                The current deployment will remain available for inspection.
              </p>
            </div>
            <DialogFooter>
              <ModernButton variant="outline" onClick={() => setShowRollbackDialog(false)}>Cancel</ModernButton>
              <ModernButton variant="primary" className="bg-yellow-600 hover:bg-yellow-700">
                <RotateCcw className="w-4 h-4 mr-2" />
                Confirm Rollback
              </ModernButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
