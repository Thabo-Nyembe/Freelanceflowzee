"use client"

import { useState } from 'react'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  MiniKPI,
  ActivityFeed,
  RankingList,
  ProgressCard
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  Rocket,
  CheckCircle,
  XCircle,
  Clock,
  GitBranch,
  Server,
  Globe,
  TrendingUp,
  AlertTriangle,
  Play,
  RotateCcw,
  Eye,
  MoreVertical,
  Search,
  Filter,
  Download,
  Activity
} from 'lucide-react'

/**
 * Deployments V2 - Deployment Management System
 * Manages application deployments, releases, and rollbacks
 */
export default function DeploymentsV2() {
  const [selectedEnvironment, setSelectedEnvironment] = useState<'all' | 'production' | 'staging' | 'development'>('all')

  const stats = [
    { label: 'Total Deploys', value: '2,847', change: 23.4, icon: <Rocket className="w-5 h-5" /> },
    { label: 'Success Rate', value: '98.4%', change: 2.3, icon: <CheckCircle className="w-5 h-5" /> },
    { label: 'Avg Duration', value: '4.2m', change: -15.7, icon: <Clock className="w-5 h-5" /> },
    { label: 'Active Servers', value: '247', change: 8.9, icon: <Server className="w-5 h-5" /> }
  ]

  const deployments = [
    {
      id: 'DEPLOY-2847',
      version: 'v3.2.1',
      branch: 'main',
      environment: 'production',
      status: 'success',
      deployedBy: 'Sarah Johnson',
      avatar: 'SJ',
      startTime: '2024-02-12 14:32:15',
      duration: 245,
      commit: 'Fix critical auth bug',
      commitHash: 'a3f7c91',
      servers: 12,
      traffic: 100,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'DEPLOY-2846',
      version: 'v3.2.1-beta',
      branch: 'develop',
      environment: 'staging',
      status: 'success',
      deployedBy: 'Michael Chen',
      avatar: 'MC',
      startTime: '2024-02-12 13:45:20',
      duration: 198,
      commit: 'Add new payment features',
      commitHash: 'b7d9e42',
      servers: 4,
      traffic: 50,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'DEPLOY-2845',
      version: 'v3.2.0',
      branch: 'main',
      environment: 'production',
      status: 'rolled_back',
      deployedBy: 'Emily Rodriguez',
      avatar: 'ER',
      startTime: '2024-02-12 10:15:30',
      duration: 312,
      commit: 'Update dependencies',
      commitHash: 'c2a8f53',
      servers: 12,
      traffic: 0,
      color: 'from-yellow-500 to-amber-500'
    },
    {
      id: 'DEPLOY-2844',
      version: 'v3.1.9',
      branch: 'hotfix/auth',
      environment: 'production',
      status: 'success',
      deployedBy: 'David Park',
      avatar: 'DP',
      startTime: '2024-02-11 22:30:45',
      duration: 267,
      commit: 'Hotfix: Session timeout',
      commitHash: 'd5f1a64',
      servers: 12,
      traffic: 100,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'DEPLOY-2843',
      version: 'v3.1.9-rc1',
      branch: 'release/3.1.9',
      environment: 'staging',
      status: 'in_progress',
      deployedBy: 'Lisa Anderson',
      avatar: 'LA',
      startTime: '2024-02-11 18:20:10',
      duration: 0,
      commit: 'Release candidate testing',
      commitHash: 'e3b7c85',
      servers: 4,
      traffic: 25,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'DEPLOY-2842',
      version: 'v3.1.8',
      branch: 'feature/analytics',
      environment: 'development',
      status: 'success',
      deployedBy: 'James Wilson',
      avatar: 'JW',
      startTime: '2024-02-11 16:10:55',
      duration: 142,
      commit: 'Add analytics dashboard',
      commitHash: 'f9c2d96',
      servers: 2,
      traffic: 10,
      color: 'from-indigo-500 to-purple-500'
    },
    {
      id: 'DEPLOY-2841',
      version: 'v3.1.7',
      branch: 'main',
      environment: 'production',
      status: 'failed',
      deployedBy: 'Maria Garcia',
      avatar: 'MG',
      startTime: '2024-02-11 12:05:30',
      duration: 89,
      commit: 'Database migration',
      commitHash: 'a1e4b78',
      servers: 0,
      traffic: 0,
      color: 'from-red-500 to-orange-500'
    },
    {
      id: 'DEPLOY-2840',
      version: 'v3.1.6',
      branch: 'main',
      environment: 'production',
      status: 'success',
      deployedBy: 'Robert Brown',
      avatar: 'RB',
      startTime: '2024-02-10 20:15:40',
      duration: 223,
      commit: 'Performance optimizations',
      commitHash: 'b6f3c92',
      servers: 12,
      traffic: 100,
      color: 'from-teal-500 to-cyan-500'
    }
  ]

  const topDeployers = [
    { rank: 1, name: 'Sarah Johnson', avatar: 'SJ', value: '247', change: 23.4 },
    { rank: 2, name: 'Michael Chen', avatar: 'MC', value: '189', change: 18.7 },
    { rank: 3, name: 'David Park', avatar: 'DP', value: '156', change: 12.3 },
    { rank: 4, name: 'Emily Rodriguez', avatar: 'ER', value: '124', change: 8.9 },
    { rank: 5, name: 'Lisa Anderson', avatar: 'LA', value: '98', change: 5.2 }
  ]

  const recentActivity = [
    { icon: <Rocket className="w-4 h-4" />, title: 'v3.2.1 deployed to prod', time: '10m ago', type: 'success' as const },
    { icon: <CheckCircle className="w-4 h-4" />, title: 'Staging deploy successful', time: '1h ago', type: 'info' as const },
    { icon: <RotateCcw className="w-4 h-4" />, title: 'Rollback completed', time: '3h ago', type: 'warning' as const },
    { icon: <XCircle className="w-4 h-4" />, title: 'Deploy failed on server 7', time: '5h ago', type: 'error' as const }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle className="w-3 h-3" />, label: 'Success' }
      case 'in_progress':
        return { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: <Clock className="w-3 h-3" />, label: 'In Progress' }
      case 'failed':
        return { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: <XCircle className="w-3 h-3" />, label: 'Failed' }
      case 'rolled_back':
        return { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <RotateCcw className="w-3 h-3" />, label: 'Rolled Back' }
      default:
        return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400', icon: <AlertTriangle className="w-3 h-3" />, label: status }
    }
  }

  const getEnvironmentBadge = (env: string) => {
    switch (env) {
      case 'production':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
      case 'staging':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'development':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}m ${secs}s`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50/30 to-blue-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Rocket className="w-10 h-10 text-purple-600" />
              Deployments
            </h1>
            <p className="text-muted-foreground">Manage application deployments and releases</p>
          </div>
          <GradientButton from="purple" to="indigo" onClick={() => console.log('New deployment')}>
            <Rocket className="w-5 h-5 mr-2" />
            New Deployment
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Globe />} title="Production" description="Live env" onClick={() => setSelectedEnvironment('production')} />
          <BentoQuickAction icon={<Server />} title="Staging" description="Pre-prod" onClick={() => setSelectedEnvironment('staging')} />
          <BentoQuickAction icon={<Activity />} title="Development" description="Dev env" onClick={() => setSelectedEnvironment('development')} />
          <BentoQuickAction icon={<Download />} title="Export" description="Reports" onClick={() => console.log('Export')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={selectedEnvironment === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedEnvironment('all')}>
            All Environments
          </PillButton>
          <PillButton variant={selectedEnvironment === 'production' ? 'primary' : 'ghost'} onClick={() => setSelectedEnvironment('production')}>
            <Globe className="w-4 h-4 mr-2" />
            Production
          </PillButton>
          <PillButton variant={selectedEnvironment === 'staging' ? 'primary' : 'ghost'} onClick={() => setSelectedEnvironment('staging')}>
            <Server className="w-4 h-4 mr-2" />
            Staging
          </PillButton>
          <PillButton variant={selectedEnvironment === 'development' ? 'primary' : 'ghost'} onClick={() => setSelectedEnvironment('development')}>
            <Activity className="w-4 h-4 mr-2" />
            Development
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Deployment History</h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search deployments..."
                      className="pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <ModernButton variant="outline" size="sm">
                    <Filter className="w-4 h-4" />
                  </ModernButton>
                </div>
              </div>

              <div className="space-y-3">
                {deployments.map((deployment) => {
                  const statusBadge = getStatusBadge(deployment.status)
                  const environmentBadge = getEnvironmentBadge(deployment.environment)

                  return (
                    <div key={deployment.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${deployment.color} flex items-center justify-center text-white font-semibold flex-shrink-0`}>
                              {deployment.avatar}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{deployment.id}</h4>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${statusBadge.color}`}>
                                  {statusBadge.icon}
                                  {statusBadge.label}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${environmentBadge}`}>
                                  {deployment.environment}
                                </span>
                              </div>
                              <p className="text-sm mb-1">{deployment.version} by {deployment.deployedBy}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <GitBranch className="w-3 h-3" />
                                <span>{deployment.branch}</span>
                                <span>•</span>
                                <span className="font-mono">{deployment.commitHash}</span>
                                <span>•</span>
                                <span>{deployment.commit}</span>
                              </div>
                            </div>
                          </div>
                          <ModernButton variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </ModernButton>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          <div>
                            <p className="text-muted-foreground mb-1">Started</p>
                            <p className="font-semibold">{deployment.startTime}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Duration</p>
                            <p className="font-semibold">{deployment.duration > 0 ? formatDuration(deployment.duration) : 'Running...'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Servers</p>
                            <p className="font-semibold">{deployment.servers} servers</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Traffic</p>
                            <p className="font-semibold">{deployment.traffic}%</p>
                          </div>
                        </div>

                        {deployment.traffic > 0 && deployment.traffic < 100 && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Traffic Distribution</span>
                              <span className="font-semibold">{deployment.traffic}% this version</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${deployment.color}`}
                                style={{ width: `${deployment.traffic}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2 pt-2 border-t">
                          <ModernButton variant="outline" size="sm">
                            <Eye className="w-3 h-3 mr-1" />
                            View Logs
                          </ModernButton>
                          {deployment.status === 'success' && deployment.environment === 'production' && (
                            <ModernButton variant="outline" size="sm">
                              <RotateCcw className="w-3 h-3 mr-1" />
                              Rollback
                            </ModernButton>
                          )}
                          {deployment.status === 'failed' && (
                            <ModernButton variant="primary" size="sm">
                              <Play className="w-3 h-3 mr-1" />
                              Retry
                            </ModernButton>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Environment Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-purple-600" />
                    <p className="text-sm font-medium">Production</p>
                  </div>
                  <p className="text-2xl font-bold">v3.2.1</p>
                  <p className="text-xs text-purple-600 mt-1">12 servers • 100% traffic</p>
                  <div className="mt-3">
                    <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">
                      ✓ Healthy
                    </span>
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Server className="w-4 h-4 text-blue-600" />
                    <p className="text-sm font-medium">Staging</p>
                  </div>
                  <p className="text-2xl font-bold">v3.2.1-beta</p>
                  <p className="text-xs text-blue-600 mt-1">4 servers • 50% traffic</p>
                  <div className="mt-3">
                    <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-full">
                      ⟳ Deploying
                    </span>
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-green-600" />
                    <p className="text-sm font-medium">Development</p>
                  </div>
                  <p className="text-2xl font-bold">v3.1.8</p>
                  <p className="text-xs text-green-600 mt-1">2 servers • 10% traffic</p>
                  <div className="mt-3">
                    <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">
                      ✓ Healthy
                    </span>
                  </div>
                </div>
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <RankingList title="🚀 Top Deployers" items={topDeployers} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Deployment Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Total Deploys" value="2,847" change={23.4} />
                <MiniKPI label="Success Rate" value="98.4%" change={2.3} />
                <MiniKPI label="Avg Duration" value="4.2m" change={-15.7} />
                <MiniKPI label="Active Servers" value="247" change={8.9} />
              </div>
            </BentoCard>

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <ProgressCard
              title="Deployment Goal"
              value={2847}
              target={3000}
              label="Monthly deploys"
              color="from-purple-500 to-indigo-500"
            />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Status Distribution</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Success</span>
                    </div>
                    <span className="text-xs font-semibold">2,801 (98.4%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: '98.4%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm">Rolled Back</span>
                    </div>
                    <span className="text-xs font-semibold">28 (1.0%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yellow-500 to-amber-500" style={{ width: '1.0%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm">Failed</span>
                    </div>
                    <span className="text-xs font-semibold">18 (0.6%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-red-500 to-orange-500" style={{ width: '0.6%' }} />
                  </div>
                </div>
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
