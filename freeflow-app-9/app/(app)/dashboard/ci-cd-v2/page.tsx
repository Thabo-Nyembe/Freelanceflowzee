'use client'

import { useState } from 'react'
import {
  GitBranch,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  TrendingUp,
  Settings,
  Code,
  Package,
  Rocket,
  AlertTriangle,
  BarChart3,
  Zap,
  GitCommit,
  GitMerge,
  GitPullRequest,
  Server,
  Database,
  Cloud,
  Users,
  Calendar,
  Timer
} from 'lucide-react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type PipelineStatus = 'running' | 'success' | 'failed' | 'cancelled' | 'pending'
type PipelineType = 'build' | 'test' | 'deploy' | 'release' | 'rollback'
type Environment = 'development' | 'staging' | 'production' | 'qa'

interface Pipeline {
  id: string
  name: string
  type: PipelineType
  status: PipelineStatus
  environment: Environment
  branch: string
  commit: string
  triggeredBy: string
  startedAt: string
  completedAt: string
  duration: number
  stages: {
    name: string
    status: PipelineStatus
    duration: number
  }[]
  artifacts: number
  testsPassed: number
  testsTotal: number
  coverage: number
}

export default function CICDPage() {
  const [viewMode, setViewMode] = useState<'all' | PipelineStatus>('all')
  const [environmentFilter, setEnvironmentFilter] = useState<'all' | Environment>('all')

  const pipelines: Pipeline[] = [
    {
      id: 'PIPE-2847',
      name: 'Main Branch Build',
      type: 'build',
      status: 'running',
      environment: 'staging',
      branch: 'main',
      commit: 'a1b2c3d',
      triggeredBy: 'John Doe',
      startedAt: '2024-01-15 15:30',
      completedAt: '',
      duration: 0,
      stages: [
        { name: 'Checkout', status: 'success', duration: 12 },
        { name: 'Install Dependencies', status: 'success', duration: 145 },
        { name: 'Build', status: 'running', duration: 0 },
        { name: 'Test', status: 'pending', duration: 0 },
        { name: 'Deploy', status: 'pending', duration: 0 }
      ],
      artifacts: 0,
      testsPassed: 0,
      testsTotal: 1247,
      coverage: 0
    },
    {
      id: 'PIPE-2848',
      name: 'Feature Branch Deploy',
      type: 'deploy',
      status: 'success',
      environment: 'development',
      branch: 'feature/new-dashboard',
      commit: 'e4f5g6h',
      triggeredBy: 'Jane Smith',
      startedAt: '2024-01-15 14:15',
      completedAt: '2024-01-15 14:28',
      duration: 780,
      stages: [
        { name: 'Checkout', status: 'success', duration: 8 },
        { name: 'Install Dependencies', status: 'success', duration: 134 },
        { name: 'Build', status: 'success', duration: 234 },
        { name: 'Test', status: 'success', duration: 312 },
        { name: 'Deploy', status: 'success', duration: 92 }
      ],
      artifacts: 3,
      testsPassed: 1241,
      testsTotal: 1247,
      coverage: 87.4
    },
    {
      id: 'PIPE-2849',
      name: 'Production Release v2.5.0',
      type: 'release',
      status: 'success',
      environment: 'production',
      branch: 'release/v2.5.0',
      commit: 'i7j8k9l',
      triggeredBy: 'Release Bot',
      startedAt: '2024-01-15 10:00',
      completedAt: '2024-01-15 10:18',
      duration: 1080,
      stages: [
        { name: 'Checkout', status: 'success', duration: 10 },
        { name: 'Install Dependencies', status: 'success', duration: 156 },
        { name: 'Build', status: 'success', duration: 267 },
        { name: 'Test', status: 'success', duration: 389 },
        { name: 'Security Scan', status: 'success', duration: 123 },
        { name: 'Deploy', status: 'success', duration: 135 }
      ],
      artifacts: 5,
      testsPassed: 1247,
      testsTotal: 1247,
      coverage: 92.1
    },
    {
      id: 'PIPE-2850',
      name: 'Hotfix Deploy',
      type: 'deploy',
      status: 'failed',
      environment: 'production',
      branch: 'hotfix/critical-bug',
      commit: 'm0n1o2p',
      triggeredBy: 'Emergency Team',
      startedAt: '2024-01-15 09:30',
      completedAt: '2024-01-15 09:45',
      duration: 900,
      stages: [
        { name: 'Checkout', status: 'success', duration: 9 },
        { name: 'Install Dependencies', status: 'success', duration: 142 },
        { name: 'Build', status: 'success', duration: 245 },
        { name: 'Test', status: 'failed', duration: 287 },
        { name: 'Deploy', status: 'cancelled', duration: 0 }
      ],
      artifacts: 0,
      testsPassed: 1234,
      testsTotal: 1247,
      coverage: 89.2
    },
    {
      id: 'PIPE-2851',
      name: 'QA Environment Update',
      type: 'test',
      status: 'success',
      environment: 'qa',
      branch: 'develop',
      commit: 'q3r4s5t',
      triggeredBy: 'QA Team',
      startedAt: '2024-01-15 08:00',
      completedAt: '2024-01-15 08:22',
      duration: 1320,
      stages: [
        { name: 'Checkout', status: 'success', duration: 11 },
        { name: 'Install Dependencies', status: 'success', duration: 167 },
        { name: 'Build', status: 'success', duration: 289 },
        { name: 'Unit Tests', status: 'success', duration: 345 },
        { name: 'Integration Tests', status: 'success', duration: 412 },
        { name: 'Deploy', status: 'success', duration: 96 }
      ],
      artifacts: 4,
      testsPassed: 1245,
      testsTotal: 1247,
      coverage: 90.8
    },
    {
      id: 'PIPE-2852',
      name: 'Rollback Production',
      type: 'rollback',
      status: 'cancelled',
      environment: 'production',
      branch: 'main',
      commit: 'u6v7w8x',
      triggeredBy: 'DevOps Lead',
      startedAt: '2024-01-14 22:00',
      completedAt: '2024-01-14 22:05',
      duration: 300,
      stages: [
        { name: 'Checkout', status: 'success', duration: 8 },
        { name: 'Rollback', status: 'cancelled', duration: 0 }
      ],
      artifacts: 0,
      testsPassed: 0,
      testsTotal: 0,
      coverage: 0
    }
  ]

  const filteredPipelines = pipelines.filter(pipeline => {
    if (viewMode !== 'all' && pipeline.status !== viewMode) return false
    if (environmentFilter !== 'all' && pipeline.environment !== environmentFilter) return false
    return true
  })

  const totalPipelines = pipelines.length
  const successfulPipelines = pipelines.filter(p => p.status === 'success').length
  const successRate = (successfulPipelines / totalPipelines) * 100
  const avgDuration = pipelines.reduce((sum, p) => sum + p.duration, 0) / pipelines.length

  const getStatusColor = (status: PipelineStatus) => {
    switch (status) {
      case 'running': return 'text-blue-600 bg-blue-50'
      case 'success': return 'text-green-600 bg-green-50'
      case 'failed': return 'text-red-600 bg-red-50'
      case 'cancelled': return 'text-gray-600 bg-gray-50'
      case 'pending': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getTypeColor = (type: PipelineType) => {
    switch (type) {
      case 'build': return 'text-blue-600 bg-blue-50'
      case 'test': return 'text-purple-600 bg-purple-50'
      case 'deploy': return 'text-green-600 bg-green-50'
      case 'release': return 'text-orange-600 bg-orange-50'
      case 'rollback': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return 'N/A'
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return minutes > 0 ? `${minutes}m ${secs}s` : `${secs}s`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 bg-clip-text text-transparent mb-2">
            CI/CD Pipelines
          </h1>
          <p className="text-slate-600">Continuous integration and deployment automation</p>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Total Pipelines',
              value: totalPipelines.toString(),
              icon: GitBranch,
              trend: { value: 15, isPositive: true },
              color: 'blue'
            },
            {
              label: 'Success Rate',
              value: `${successRate.toFixed(0)}%`,
              icon: CheckCircle2,
              trend: { value: 5.2, isPositive: true },
              color: 'green'
            },
            {
              label: 'Avg Duration',
              value: formatDuration(Math.round(avgDuration)),
              icon: Timer,
              trend: { value: 12, isPositive: true },
              color: 'purple'
            },
            {
              label: 'Running Now',
              value: pipelines.filter(p => p.status === 'running').length.toString(),
              icon: Activity,
              trend: { value: 2, isPositive: true },
              color: 'orange'
            }
          ]}
        />

        {/* Quick Actions */}
        <BentoQuickAction
          actions={[
            {
              title: 'Trigger Build',
              description: 'Start pipeline',
              icon: Play,
              gradient: 'from-blue-500 to-indigo-600',
              onClick: () => console.log('Trigger build')
            },
            {
              title: 'View Logs',
              description: 'Pipeline output',
              icon: FileText,
              gradient: 'from-green-500 to-emerald-600',
              onClick: () => console.log('Logs')
            },
            {
              title: 'Deployments',
              description: 'Manage releases',
              icon: Rocket,
              gradient: 'from-purple-500 to-pink-600',
              onClick: () => console.log('Deployments')
            },
            {
              title: 'Analytics',
              description: 'Pipeline metrics',
              icon: BarChart3,
              gradient: 'from-orange-500 to-red-600',
              onClick: () => console.log('Analytics')
            },
            {
              title: 'Environments',
              description: 'Manage configs',
              icon: Server,
              gradient: 'from-cyan-500 to-blue-600',
              onClick: () => console.log('Environments')
            },
            {
              title: 'Secrets',
              description: 'Manage variables',
              icon: Shield,
              gradient: 'from-indigo-500 to-purple-600',
              onClick: () => console.log('Secrets')
            },
            {
              title: 'Settings',
              description: 'Configure CI/CD',
              icon: Settings,
              gradient: 'from-slate-500 to-gray-600',
              onClick: () => console.log('Settings')
            },
            {
              title: 'Error Logs',
              description: 'View failures',
              icon: AlertTriangle,
              gradient: 'from-red-500 to-rose-600',
              onClick: () => console.log('Errors')
            }
          ]}
        />

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex gap-2">
            <PillButton
              label="All Pipelines"
              isActive={viewMode === 'all'}
              onClick={() => setViewMode('all')}
            />
            <PillButton
              label="Running"
              isActive={viewMode === 'running'}
              onClick={() => setViewMode('running')}
            />
            <PillButton
              label="Success"
              isActive={viewMode === 'success'}
              onClick={() => setViewMode('success')}
            />
            <PillButton
              label="Failed"
              isActive={viewMode === 'failed'}
              onClick={() => setViewMode('failed')}
            />
          </div>

          <div className="flex gap-2">
            <PillButton
              label="All Environments"
              isActive={environmentFilter === 'all'}
              onClick={() => setEnvironmentFilter('all')}
            />
            <PillButton
              label="Production"
              isActive={environmentFilter === 'production'}
              onClick={() => setEnvironmentFilter('production')}
            />
            <PillButton
              label="Staging"
              isActive={environmentFilter === 'staging'}
              onClick={() => setEnvironmentFilter('staging')}
            />
            <PillButton
              label="Development"
              isActive={environmentFilter === 'development'}
              onClick={() => setEnvironmentFilter('development')}
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Pipelines List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredPipelines.map((pipeline) => (
              <div
                key={pipeline.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <GitBranch className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-slate-900">{pipeline.name}</h3>
                    </div>
                    <p className="text-xs text-slate-500">Pipeline ID: {pipeline.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(pipeline.status)}`}>
                      {pipeline.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(pipeline.type)}`}>
                      {pipeline.type}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Branch</p>
                    <div className="flex items-center gap-1">
                      <GitCommit className="w-3 h-3 text-slate-400" />
                      <span className="text-sm font-medium text-slate-900">{pipeline.branch}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Commit</p>
                    <div className="flex items-center gap-1">
                      <Code className="w-3 h-3 text-slate-400" />
                      <span className="text-sm font-medium text-slate-900 font-mono">{pipeline.commit}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Environment</p>
                    <span className="text-sm font-medium text-slate-900 capitalize">{pipeline.environment}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-2">Pipeline Stages</p>
                  <div className="flex flex-wrap gap-2">
                    {pipeline.stages.map((stage, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(stage.status)}`}>
                          {stage.name}
                          {stage.duration > 0 && ` (${formatDuration(stage.duration)})`}
                        </span>
                        {idx < pipeline.stages.length - 1 && (
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Started At</p>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span className="text-sm text-slate-700">{pipeline.startedAt}</span>
                    </div>
                  </div>

                  {pipeline.completedAt && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Completed At</p>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                        <span className="text-sm text-slate-700">{pipeline.completedAt}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Duration</p>
                    <p className="text-sm font-medium text-slate-900">{formatDuration(pipeline.duration)}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Triggered By</p>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span className="text-sm font-medium text-slate-900">{pipeline.triggeredBy}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Artifacts</p>
                    <div className="flex items-center gap-1">
                      <Package className="w-3 h-3 text-slate-400" />
                      <span className="text-sm font-medium text-slate-900">{pipeline.artifacts}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Tests</p>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                      <span className="text-sm font-medium text-slate-900">
                        {pipeline.testsPassed}/{pipeline.testsTotal}
                      </span>
                    </div>
                  </div>
                </div>

                {pipeline.coverage > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-500">Code Coverage</span>
                      <span className="text-xs font-medium text-slate-900">{pipeline.coverage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                        style={{ width: `${pipeline.coverage}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-700 transition-all">
                    View Details
                  </button>
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all">
                    Logs
                  </button>
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all">
                    {pipeline.status === 'running' ? 'Cancel' : 'Retry'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Success Rate */}
            <MiniKPI
              label="Success Rate"
              value={`${successRate.toFixed(0)}%`}
              icon={CheckCircle2}
              trend={{ value: 5.2, isPositive: true }}
              className="bg-gradient-to-br from-green-500 to-emerald-600"
            />

            {/* Recent Activity */}
            <ActivityFeed
              title="Recent Builds"
              activities={[
                {
                  id: '1',
                  title: 'Main branch building',
                  description: 'Currently at build stage',
                  timestamp: '2 minutes ago',
                  type: 'info'
                },
                {
                  id: '2',
                  title: 'Feature deploy successful',
                  description: 'Deployed to development',
                  timestamp: '1 hour ago',
                  type: 'success'
                },
                {
                  id: '3',
                  title: 'Production release completed',
                  description: 'v2.5.0 live',
                  timestamp: '5 hours ago',
                  type: 'success'
                },
                {
                  id: '4',
                  title: 'Hotfix deploy failed',
                  description: 'Tests failed - rollback',
                  timestamp: '6 hours ago',
                  type: 'error'
                }
              ]}
            />

            {/* Environment Stats */}
            <RankingList
              title="Deployments by Env"
              items={[
                { label: 'Development', value: '45%', rank: 1 },
                { label: 'Staging', value: '28%', rank: 2 },
                { label: 'QA', value: '18%', rank: 3 },
                { label: 'Production', value: '9%', rank: 4 }
              ]}
            />

            {/* Build Health */}
            <ProgressCard
              title="Build Health Score"
              progress={successRate}
              subtitle="Last 30 days"
              color="blue"
            />

          </div>
        </div>

      </div>
    </div>
  )
}
