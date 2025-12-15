'use client'

import { useState } from 'react'
import { useBuilds, useBuildPipelines, useBuildMutations, Build, BuildPipeline, formatDuration } from '@/lib/hooks/use-builds'
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
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Play,
  GitBranch,
  Code,
  TrendingUp,
  AlertTriangle,
  Download,
  Eye,
  MoreVertical,
  Search,
  Filter,
  RotateCcw,
  Zap,
  FileText
} from 'lucide-react'

interface BuildsClientProps {
  initialBuilds: Build[]
  initialPipelines: BuildPipeline[]
}

export default function BuildsClient({ initialBuilds, initialPipelines }: BuildsClientProps) {
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'success' | 'failed' | 'running'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { builds, stats, isLoading, refetch } = useBuilds(initialBuilds, { status: selectedStatus === 'all' ? undefined : selectedStatus })
  const { pipelines } = useBuildPipelines(initialPipelines)
  const { triggerBuild, retryBuild, cancelBuild, isTriggering, isRetrying } = useBuildMutations()

  const filteredBuilds = builds.filter(build =>
    build.commit_message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    build.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
    build.author_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const statItems = [
    { label: 'Total Builds', value: stats.total.toLocaleString(), change: 23.4, icon: <Package className="w-5 h-5" /> },
    { label: 'Success Rate', value: `${stats.successRate}%`, change: 5.7, icon: <CheckCircle className="w-5 h-5" /> },
    { label: 'Avg Duration', value: `${Math.round(stats.avgDuration / 60)}m`, change: -12.3, icon: <Clock className="w-5 h-5" /> },
    { label: 'Active Pipelines', value: pipelines.filter(p => p.is_active).length.toString(), change: 8.9, icon: <Zap className="w-5 h-5" /> }
  ]

  const topBuilders = Array.from(new Set(builds.map(b => b.author_name)))
    .filter(Boolean)
    .slice(0, 5)
    .map((name, index) => ({
      rank: index + 1,
      name: name || 'Unknown',
      avatar: (name || 'U').substring(0, 2).toUpperCase(),
      value: builds.filter(b => b.author_name === name).length.toString(),
      change: Math.random() * 20
    }))

  const recentActivity = builds.slice(0, 4).map(build => ({
    icon: build.status === 'success' ? <CheckCircle className="w-4 h-4" /> :
          build.status === 'failed' ? <XCircle className="w-4 h-4" /> :
          build.status === 'running' ? <Play className="w-4 h-4" /> :
          <Clock className="w-4 h-4" />,
    title: `Build #${build.build_number} ${build.status}`,
    time: new Date(build.created_at).toLocaleTimeString(),
    type: build.status === 'success' ? 'success' as const :
          build.status === 'failed' ? 'error' as const : 'info' as const
  }))

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle className="w-3 h-3" />, label: 'Success' }
      case 'running':
        return { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: <Clock className="w-3 h-3" />, label: 'Running' }
      case 'failed':
        return { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: <XCircle className="w-3 h-3" />, label: 'Failed' }
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <Clock className="w-3 h-3" />, label: 'Pending' }
      default:
        return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400', icon: <AlertTriangle className="w-3 h-3" />, label: status }
    }
  }

  const getBuildGradient = (status: string) => {
    switch (status) {
      case 'success': return 'from-green-500 to-emerald-500'
      case 'running': return 'from-blue-500 to-cyan-500'
      case 'failed': return 'from-red-500 to-orange-500'
      case 'pending': return 'from-yellow-500 to-amber-500'
      default: return 'from-gray-500 to-slate-500'
    }
  }

  const handleTriggerBuild = () => {
    triggerBuild({
      branch: 'main',
      commit_message: 'Manual build trigger',
      author_name: 'Current User'
    })
  }

  const handleRetryBuild = (build: Build) => {
    retryBuild(build)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50/30 to-blue-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Package className="w-10 h-10 text-teal-600" />
              Build Pipelines
            </h1>
            <p className="text-muted-foreground">Manage CI/CD builds and test results</p>
          </div>
          <GradientButton from="teal" to="cyan" onClick={handleTriggerBuild} disabled={isTriggering}>
            <Play className="w-5 h-5 mr-2" />
            {isTriggering ? 'Triggering...' : 'Trigger Build'}
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={statItems} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<CheckCircle />} title="Success" description="Passed builds" onClick={() => setSelectedStatus('success')} />
          <BentoQuickAction icon={<XCircle />} title="Failed" description="Failed builds" onClick={() => setSelectedStatus('failed')} />
          <BentoQuickAction icon={<Clock />} title="Running" description="In progress" onClick={() => setSelectedStatus('running')} />
          <BentoQuickAction icon={<Download />} title="Artifacts" description="Downloads" onClick={() => console.log('Artifacts')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={selectedStatus === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedStatus('all')}>
            All Builds
          </PillButton>
          <PillButton variant={selectedStatus === 'success' ? 'primary' : 'ghost'} onClick={() => setSelectedStatus('success')}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Success
          </PillButton>
          <PillButton variant={selectedStatus === 'failed' ? 'primary' : 'ghost'} onClick={() => setSelectedStatus('failed')}>
            <XCircle className="w-4 h-4 mr-2" />
            Failed
          </PillButton>
          <PillButton variant={selectedStatus === 'running' ? 'primary' : 'ghost'} onClick={() => setSelectedStatus('running')}>
            <Clock className="w-4 h-4 mr-2" />
            Running
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Build History</h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search builds..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <ModernButton variant="outline" size="sm">
                    <Filter className="w-4 h-4" />
                  </ModernButton>
                </div>
              </div>

              <div className="space-y-3">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading builds...</div>
                ) : filteredBuilds.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No builds found</div>
                ) : (
                  filteredBuilds.map((build) => {
                    const statusBadge = getStatusBadge(build.status)
                    const gradient = getBuildGradient(build.status)
                    const testSuccessRate = build.tests_total > 0 ? (build.tests_passed / build.tests_total) * 100 : 0

                    return (
                      <div key={build.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1">
                              <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${gradient} flex items-center justify-center text-white font-semibold flex-shrink-0`}>
                                {(build.author_name || 'U').substring(0, 2).toUpperCase()}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold">BUILD-{build.build_number}</h4>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${statusBadge.color}`}>
                                    {statusBadge.icon}
                                    {statusBadge.label}
                                  </span>
                                </div>
                                <p className="text-sm mb-1">{build.author_name || 'Unknown'}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <GitBranch className="w-3 h-3" />
                                  <span>{build.branch}</span>
                                  <span>•</span>
                                  <span className="font-mono">{build.commit_hash?.substring(0, 7) || 'N/A'}</span>
                                  <span>•</span>
                                  <span>{build.commit_message || 'No message'}</span>
                                </div>
                              </div>
                            </div>
                            <ModernButton variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </ModernButton>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                            <div>
                              <p className="text-muted-foreground mb-1">Duration</p>
                              <p className="font-semibold">{formatDuration(build.duration_seconds)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-1">Tests</p>
                              <p className="font-semibold">
                                <span className="text-green-600">{build.tests_passed}</span> / {build.tests_total}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-1">Coverage</p>
                              <p className="font-semibold">{Number(build.coverage_percentage) > 0 ? `${build.coverage_percentage}%` : 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-1">Artifacts</p>
                              <p className="font-semibold">{build.artifacts_count} files</p>
                            </div>
                          </div>

                          {build.tests_total > 0 && (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Test Results</span>
                                <span className="font-semibold">{testSuccessRate.toFixed(1)}% passed</span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full bg-gradient-to-r ${gradient}`}
                                  style={{ width: `${testSuccessRate}%` }}
                                />
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-2 pt-2 border-t">
                            <ModernButton variant="outline" size="sm">
                              <Eye className="w-3 h-3 mr-1" />
                              View Logs
                            </ModernButton>
                            {build.artifacts_count > 0 && (
                              <ModernButton variant="outline" size="sm">
                                <Download className="w-3 h-3 mr-1" />
                                Artifacts
                              </ModernButton>
                            )}
                            {build.status === 'failed' && (
                              <ModernButton variant="primary" size="sm" onClick={() => handleRetryBuild(build)} disabled={isRetrying}>
                                <RotateCcw className="w-3 h-3 mr-1" />
                                Retry
                              </ModernButton>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Pipeline Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <p className="text-sm font-medium">Successful</p>
                  </div>
                  <p className="text-2xl font-bold">{stats.success.toLocaleString()}</p>
                  <p className="text-xs text-green-600 mt-1">{stats.successRate}% of builds</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <p className="text-sm font-medium">Failed</p>
                  </div>
                  <p className="text-2xl font-bold">{stats.failed.toLocaleString()}</p>
                  <p className="text-xs text-red-600 mt-1">{stats.total > 0 ? Math.round((stats.failed / stats.total) * 100) : 0}% of builds</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <p className="text-sm font-medium">Running</p>
                  </div>
                  <p className="text-2xl font-bold">{stats.running}</p>
                  <p className="text-xs text-blue-600 mt-1">In progress</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Code className="w-4 h-4 text-purple-600" />
                    <p className="text-sm font-medium">Avg Coverage</p>
                  </div>
                  <p className="text-2xl font-bold">{stats.avgCoverage}%</p>
                  <p className="text-xs text-purple-600 mt-1">Test coverage</p>
                </div>
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <RankingList title="🔨 Top Builders" items={topBuilders} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Build Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Total Builds" value={stats.total.toLocaleString()} change={23.4} />
                <MiniKPI label="Success Rate" value={`${stats.successRate}%`} change={5.7} />
                <MiniKPI label="Avg Duration" value={`${Math.round(stats.avgDuration / 60)}m`} change={-12.3} />
                <MiniKPI label="Active Pipelines" value={pipelines.filter(p => p.is_active).length.toString()} change={8.9} />
              </div>
            </BentoCard>

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <ProgressCard
              title="Monthly Goal"
              value={stats.total}
              target={15000}
              label="Builds this month"
              color="from-teal-500 to-cyan-500"
            />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Build Status</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Success</span>
                    </div>
                    <span className="text-xs font-semibold">{stats.success.toLocaleString()} ({stats.successRate}%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: `${stats.successRate}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm">Failed</span>
                    </div>
                    <span className="text-xs font-semibold">{stats.failed.toLocaleString()} ({stats.total > 0 ? Math.round((stats.failed / stats.total) * 100) : 0}%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-red-500 to-orange-500" style={{ width: `${stats.total > 0 ? (stats.failed / stats.total) * 100 : 0}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">Running</span>
                    </div>
                    <span className="text-xs font-semibold">{stats.running} ({stats.total > 0 ? Math.round((stats.running / stats.total) * 100) : 0}%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${stats.total > 0 ? (stats.running / stats.total) * 100 : 0}%` }} />
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
