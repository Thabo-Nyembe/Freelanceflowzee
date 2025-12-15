'use client'

import { useState } from 'react'
import { useCiCd, type CiCd, type PipelineType, type PipelineStatus } from '@/lib/hooks/use-ci-cd'
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
  ArrowRight,
  Calendar,
  Users,
  FileText,
  Shield
} from 'lucide-react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type BuildStatus = 'success' | 'failure' | 'running' | 'cancelled' | 'skipped' | 'pending'

export default function CiCdClient({ initialPipelines }: { initialPipelines: CiCd[] }) {
  const [pipelineTypeFilter, setPipelineTypeFilter] = useState<PipelineType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<PipelineStatus | 'all'>('all')
  const { pipelines, loading, error } = useCiCd({ pipelineType: pipelineTypeFilter, status: statusFilter })

  const displayPipelines = pipelines.length > 0 ? pipelines : initialPipelines

  const totalPipelines = displayPipelines.length
  const runningPipelines = displayPipelines.filter(p => p.is_running).length
  const successfulPipelines = displayPipelines.filter(p => p.last_status === 'success').length
  const successRate = totalPipelines > 0 ? (successfulPipelines / totalPipelines) * 100 : 0
  const avgDuration = displayPipelines.length > 0
    ? displayPipelines.reduce((sum, p) => sum + (p.avg_duration_seconds || 0), 0) / displayPipelines.length
    : 0

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'running': return 'text-blue-600 bg-blue-50'
      case 'success': return 'text-green-600 bg-green-50'
      case 'failure': return 'text-red-600 bg-red-50'
      case 'cancelled': return 'text-gray-600 bg-gray-50'
      case 'pending': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'build': return 'text-blue-600 bg-blue-50'
      case 'test': return 'text-purple-600 bg-purple-50'
      case 'deployment':
      case 'deploy': return 'text-green-600 bg-green-50'
      case 'release': return 'text-orange-600 bg-orange-50'
      case 'rollback': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds || seconds === 0) return 'N/A'
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return minutes > 0 ? `${minutes}m ${secs}s` : `${secs}s`
  }

  const formatDate = (date?: string) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleString()
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
              value: runningPipelines.toString(),
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
            }
          ]}
        />

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex gap-2">
            <PillButton
              label="All Types"
              isActive={pipelineTypeFilter === 'all'}
              onClick={() => setPipelineTypeFilter('all')}
            />
            <PillButton
              label="Build"
              isActive={pipelineTypeFilter === 'build'}
              onClick={() => setPipelineTypeFilter('build')}
            />
            <PillButton
              label="Test"
              isActive={pipelineTypeFilter === 'test'}
              onClick={() => setPipelineTypeFilter('test')}
            />
            <PillButton
              label="Deploy"
              isActive={pipelineTypeFilter === 'deployment'}
              onClick={() => setPipelineTypeFilter('deployment')}
            />
          </div>

          <div className="flex gap-2">
            <PillButton
              label="All Status"
              isActive={statusFilter === 'all'}
              onClick={() => setStatusFilter('all')}
            />
            <PillButton
              label="Active"
              isActive={statusFilter === 'active'}
              onClick={() => setStatusFilter('active')}
            />
            <PillButton
              label="Paused"
              isActive={statusFilter === 'paused'}
              onClick={() => setStatusFilter('paused')}
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Pipelines List */}
          <div className="lg:col-span-2 space-y-4">
            {displayPipelines.map((pipeline) => (
              <div
                key={pipeline.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <GitBranch className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-slate-900">{pipeline.pipeline_name}</h3>
                    </div>
                    {pipeline.description && (
                      <p className="text-xs text-slate-500">{pipeline.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(pipeline.last_status || undefined)}`}>
                      {pipeline.last_status || 'pending'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(pipeline.pipeline_type)}`}>
                      {pipeline.pipeline_type}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Branch</p>
                    <div className="flex items-center gap-1">
                      <GitCommit className="w-3 h-3 text-slate-400" />
                      <span className="text-sm font-medium text-slate-900">{pipeline.trigger_branch || 'N/A'}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Environment</p>
                    <span className="text-sm font-medium text-slate-900 capitalize">{pipeline.deployment_environment || 'N/A'}</span>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Runs</p>
                    <span className="text-sm font-medium text-slate-900">{pipeline.run_count}</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Duration</p>
                    <p className="text-sm font-medium text-slate-900">{formatDuration(pipeline.avg_duration_seconds || undefined)}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Success Rate</p>
                    <p className="text-sm font-medium text-slate-900">
                      {pipeline.run_count > 0 ? `${Math.round((pipeline.success_count / pipeline.run_count) * 100)}%` : 'N/A'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Tests</p>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                      <span className="text-sm font-medium text-slate-900">
                        {pipeline.passed_tests}/{pipeline.total_tests}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Coverage</p>
                    <p className="text-sm font-medium text-slate-900">{pipeline.test_coverage?.toFixed(1) || '0'}%</p>
                  </div>
                </div>

                {pipeline.test_coverage && pipeline.test_coverage > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-500">Code Coverage</span>
                      <span className="text-xs font-medium text-slate-900">{pipeline.test_coverage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                        style={{ width: `${Math.min(pipeline.test_coverage, 100)}%` }}
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
                    {pipeline.is_running ? 'Cancel' : 'Run'}
                  </button>
                </div>
              </div>
            ))}

            {displayPipelines.length === 0 && (
              <div className="bg-white rounded-2xl p-12 text-center">
                <GitBranch className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Pipelines Yet</h3>
                <p className="text-slate-600 mb-4">Create your first CI/CD pipeline to get started</p>
                <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all">
                  Create Pipeline
                </button>
              </div>
            )}
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
              activities={displayPipelines.slice(0, 4).map((p, idx) => ({
                id: p.id,
                title: p.pipeline_name,
                description: `${p.pipeline_type} - ${p.last_status || 'pending'}`,
                timestamp: p.last_run_at ? new Date(p.last_run_at).toLocaleString() : 'Not run yet',
                type: p.last_status === 'success' ? 'success' : p.last_status === 'failure' ? 'error' : 'info'
              }))}
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
